#!/usr/bin/env python3
"""Telegram side of the Muse relay (reviewer machine only).

  telegram-relay.py send "<text>"      post to the group
  telegram-relay.py ask "<question>"   post as [Qn], remember it as an open question
  telegram-relay.py poll               read the user's replies (JSON lines on stdout)
  telegram-relay.py open               list questions still waiting for an answer
  telegram-relay.py wait [MAX_SECONDS] long-poll until the user writes, then print like poll;
                                       exit 3 if MAX_SECONDS (default 3600) pass quietly

Credentials come from .env.relay at the repo root (gitignored). The token never reaches
argv, stdout, stderr or the log: requests go through urllib and errors are scrubbed.
Only messages from TG_ALLOWED_USER_ID inside TG_CHAT_ID are accepted.
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_FILE = os.path.join(ROOT, '.env.relay')
STATE_DIR = os.path.join(ROOT, '.relay')
STATE_FILE = os.path.join(STATE_DIR, 'telegram-state.json')
LOG_FILE = os.path.join(STATE_DIR, 'relay-log.txt')
WAIT_PID_FILE = os.path.join(STATE_DIR, 'wait.pid')
LONG_POLL = 50  # seconds Telegram holds one getUpdates open
REQUIRED = ('TG_TOKEN', 'TG_CHAT_ID', 'TG_ALLOWED_USER_ID')
MAX_LEN = 4000  # Telegram hard limit is 4096; keep headroom for the [Qn] prefix.
Q_PREFIX = re.compile(r'^\s*\[?Q(\d+)\]?\s*[:.\-]?\s*', re.IGNORECASE)


class RelayError(Exception):
    pass


def load_env():
    if not os.path.exists(ENV_FILE):
        raise RelayError('.env.relay not found at repo root')
    env = {}
    with open(ENV_FILE, encoding='utf-8') as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            env[key.strip()] = value.strip().strip('"').strip("'")
    missing = [k for k in REQUIRED if not env.get(k)]
    if missing:
        raise RelayError('missing in .env.relay: ' + ', '.join(missing))
    return env


def scrub(text, env):
    return str(text).replace(env['TG_TOKEN'], '<token>')


def api(env, method, params, timeout=30):
    url = 'https://api.telegram.org/bot%s/%s' % (env['TG_TOKEN'], method)
    data = urllib.parse.urlencode(params).encode()
    try:
        with urllib.request.urlopen(url, data=data, timeout=timeout) as resp:
            body = json.load(resp)
    except urllib.error.HTTPError as e:
        try:
            body = json.load(e)
        except ValueError:
            raise RelayError('HTTP %s from Telegram' % e.code) from None
    except (urllib.error.URLError, OSError) as e:
        raise RelayError('network: ' + scrub(getattr(e, 'reason', e), env)) from None
    if not body.get('ok'):
        new_id = (body.get('parameters') or {}).get('migrate_to_chat_id')
        hint = ' (group upgraded, new TG_CHAT_ID=%s)' % new_id if new_id else ''
        raise RelayError(scrub(body.get('description', 'unknown error'), env) + hint)
    return body['result']


def load_state():
    try:
        with open(STATE_FILE, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {'offset': 0, 'next_q': 1, 'questions': {}}


def save_state(state):
    os.makedirs(STATE_DIR, mode=0o700, exist_ok=True)
    tmp = STATE_FILE + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=1)
    os.chmod(tmp, 0o600)
    os.replace(tmp, STATE_FILE)


def log(line):
    os.makedirs(STATE_DIR, mode=0o700, exist_ok=True)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write('%s %s\n' % (time.strftime('%Y-%m-%d %H:%M:%S'), line))
    os.chmod(LOG_FILE, 0o600)


def chunks(text):
    """Split on line breaks so no piece exceeds MAX_LEN."""
    out, cur = [], ''
    for line in text.split('\n'):
        while len(line) > MAX_LEN:
            if cur:
                out.append(cur)
                cur = ''
            out.append(line[:MAX_LEN])
            line = line[MAX_LEN:]
        candidate = line if not cur else cur + '\n' + line
        if len(candidate) > MAX_LEN:
            out.append(cur)
            cur = line
        else:
            cur = candidate
    if cur or not out:
        out.append(cur)
    return out


def send(env, text):
    ids = [api(env, 'sendMessage', {'chat_id': env['TG_CHAT_ID'], 'text': part})['message_id']
           for part in chunks(text)]
    log('send %d part(s), last message_id=%d' % (len(ids), ids[-1]))
    return ids


def ask(env, question):
    state = load_state()
    n = state['next_q']
    ids = send(env, '[Q%d] %s\n\n↩️ Trả lời: reply vào tin này, hoặc gõ "Q%d: ..."' % (n, question, n))
    state['questions'][str(n)] = {'message_ids': ids, 'text': question[:200],
                                  'asked_at': int(time.time()), 'status': 'open'}
    state['next_q'] = n + 1
    save_state(state)
    log('ask Q%d' % n)
    return n


def match_question(state, message):
    """Which open Qn does this message answer? Reply target first, then a 'Qn:' prefix."""
    reply_to = (message.get('reply_to_message') or {}).get('message_id')
    if reply_to is not None:
        for n, q in state['questions'].items():
            if reply_to in q['message_ids']:
                return n, message.get('text', '')
    m = Q_PREFIX.match(message.get('text', ''))
    if m and m.group(1) in state['questions']:
        return m.group(1), message['text'][m.end():]
    # A plain message answers the question only when exactly one is open (no ambiguity).
    still_open = [n for n, q in state['questions'].items() if q['status'] == 'open']
    if len(still_open) == 1:
        return still_open[0], message.get('text', '')
    return None, message.get('text', '')


def waiter_alive():
    """A `wait` process owns getUpdates; a second reader would race it for the offset."""
    try:
        with open(WAIT_PID_FILE) as f:
            pid = int(f.read().strip())
        os.kill(pid, 0)
        return pid != os.getpid()
    except (FileNotFoundError, ValueError, ProcessLookupError):
        return False
    except PermissionError:
        return True


def poll(env, hold=0):
    state = load_state()
    updates = api(env, 'getUpdates', {'offset': state['offset'], 'timeout': hold,
                                      'allowed_updates': json.dumps(['message'])},
                  timeout=hold + 15)
    results = []
    for update in updates:
        state['offset'] = update['update_id'] + 1
        message = update.get('message') or {}
        sender = str((message.get('from') or {}).get('id'))
        chat = str((message.get('chat') or {}).get('id'))
        if sender != env['TG_ALLOWED_USER_ID'] or chat != env['TG_CHAT_ID']:
            log('ignored update %d (not the allowed user in the relay group)' % update['update_id'])
            continue
        text = message.get('text', '')
        if not text or text.startswith('/start'):
            continue
        n, answer = match_question(state, message)
        if n is None:
            results.append({'q': None, 'text': text})
            continue
        q = state['questions'][n]
        if q['status'] == 'open':
            q.update(status='answered', answer=answer, answered_at=int(time.time()))
        else:
            q.setdefault('followups', []).append(answer)
        results.append({'q': int(n), 'answer': answer, 'question': q['text']})
    save_state(state)
    if updates or not hold:
        log('poll: %d update(s), %d for reviewer' % (len(updates), len(results)))
    return results


def wait(env, max_seconds):
    os.makedirs(STATE_DIR, mode=0o700, exist_ok=True)
    with open(WAIT_PID_FILE, 'w') as f:
        f.write(str(os.getpid()))
    deadline = time.time() + max_seconds
    try:
        while time.time() < deadline:
            hold = max(1, min(LONG_POLL, int(deadline - time.time())))
            try:
                results = poll(env, hold)
            except RelayError as e:
                log('wait: %s, retrying in 15 s' % e)
                time.sleep(15)
                continue
            if results:
                return results
        return []
    finally:
        os.remove(WAIT_PID_FILE)


def main(argv):
    if len(argv) < 2 or argv[1] not in ('send', 'ask', 'poll', 'open', 'wait'):
        print(__doc__.strip(), file=sys.stderr)
        return 2
    cmd, text = argv[1], ' '.join(argv[2:]).strip()
    if cmd in ('send', 'ask') and not text:
        print('%s needs text' % cmd, file=sys.stderr)
        return 2
    try:
        env = load_env()
        if cmd == 'send':
            print('ok', send(env, text)[-1])
        elif cmd == 'ask':
            print('Q%d' % ask(env, text))
        elif cmd in ('poll', 'wait'):
            if waiter_alive():
                print('a wait process already reads Telegram; it will report', file=sys.stderr)
                return 0
            rows = poll(env) if cmd == 'poll' else wait(env, int(text or 3600))
            for row in rows:
                print(json.dumps(row, ensure_ascii=False))
            if cmd == 'wait' and not rows:
                return 3
        else:
            for n, q in load_state()['questions'].items():
                if q['status'] == 'open':
                    print(json.dumps({'q': int(n), 'question': q['text'],
                                      'asked_at': q['asked_at']}, ensure_ascii=False))
    except RelayError as e:
        print('relay error: %s' % e, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
