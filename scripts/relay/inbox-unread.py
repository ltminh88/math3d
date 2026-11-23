#!/usr/bin/env python3
"""Print inbox comments the reviewer has not handled yet (GitHub side of the Muse relay).

  inbox-unread.py            list unread comments on the inbox issues (JSON lines)
  inbox-unread.py --mark ID  mark everything up to comment ID (inclusive) as handled

Inboxes: #63 muse-88, #64 muse-min. Uses the `gh` CLI with whatever GH_TOKEN is exported.
Comments written by the reviewer itself (first line starts with "[reviewer") are skipped.
"""
import json
import os
import subprocess
import sys

REPO = 'ltminh88/math3d'
INBOXES = {'63': 'muse-88', '64': 'muse-min'}
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATE_FILE = os.path.join(ROOT, '.relay', 'inbox-state.json')


def load_state():
    try:
        with open(STATE_FILE, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {'last_id': 0}


def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), mode=0o700, exist_ok=True)
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f)


def comments(issue):
    out = subprocess.run(
        ['gh', 'api', '--paginate', 'repos/%s/issues/%s/comments?per_page=100' % (REPO, issue),
         '--jq', '.[] | {id, user: .user.login, at: .created_at, body}'],
        check=True, capture_output=True, text=True).stdout
    return [json.loads(line) for line in out.splitlines() if line.strip()]


def main(argv):
    state = load_state()
    if len(argv) == 3 and argv[1] == '--mark':
        state['last_id'] = max(state['last_id'], int(argv[2]))
        save_state(state)
        print('marked up to', state['last_id'])
        return 0
    unread = []
    for issue, muse in INBOXES.items():
        for c in comments(issue):
            if c['id'] <= state['last_id'] or c['body'].lstrip().startswith('[reviewer'):
                continue
            unread.append({'inbox': int(issue), 'muse': muse, **c})
    for c in sorted(unread, key=lambda c: c['id']):
        print(json.dumps(c, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main(sys.argv))
    except subprocess.CalledProcessError as e:
        print('gh failed: %s' % e.stderr.strip(), file=sys.stderr)
        sys.exit(1)
