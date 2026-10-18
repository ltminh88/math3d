/**
 * tkm-hooks — takumi's per-call hooks running inside Claude Code as a mod.
 *
 * Shipped as written; its logic comes from ./lib/tkm-hooks-core.js, bundled from
 * takumi-cli source, so a deny here is the shell hook's deny word for word.
 *
 * Per tool call:
 *  1. A WebFetch already answered in this session (same URL, prompt, offset,
 *     within the TTL) is served from memory; nothing below runs.
 *  2. Guards, with the project's `.takumi.json` gates. A guard that throws or
 *     outruns its budget before `next` refuses the call (fail-closed, as
 *     `denyOnTimeout` does in the shell runner).
 *  3. On allow, the call's marker file: it tells the shell shims in
 *     settings.json that this call is handled here.
 *  4. The call itself. Credentials in its result are masked before the model
 *     reads it, unless the user approved that secret read; a masking failure
 *     returns the result as it came (today's behavior), never a refusal.
 *  5. For a call that ran without error, one journal entry that the shell
 *     metrics hooks replay into the session summary, and, when the usage
 *     cache is old, the shell usage-cache handler on demand.
 * Plumbing that fails (an engine lookup, a marker or journal write) is skipped:
 * no marker means the shell hooks run as before. Never a refusal from plumbing,
 * never a call left unguarded.
 */

import type { Register } from "claude-code";
import {
	type JournalWriter,
	MOD_GUARDED_TOOLS,
	MOD_STATE_DIRNAME,
	type ModIo,
	USAGE_CACHE_FILE,
	USAGE_CACHE_HOOK_ARGV,
	USAGE_CHECK_INTERVAL_MS,
	type WebFetchCache,
	appendJournalEvent,
	buildGuardCtx,
	cacheAgeMsFromText,
	createWebFetchCache,
	decideGuards,
	isAnsweredToolResult,
	isApprovedSecretRead,
	loadModTakumiConfig,
	maskToolOutcome,
	modCallMarkerPath,
	modJournalSegmentName,
	modSessionDir,
	parseJournalSegment,
	parseModJournalSegment,
	pickClassifyInput,
	resolveModConfigDir,
	resumeJournalWriter,
	shouldMarkCall,
	splitToolCall,
	usageRefreshDue,
	webFetchCacheNotice,
} from "./lib/tkm-hooks-core.js";

type TakumiConfig = NonNullable<Parameters<typeof buildGuardCtx>[0]["config"]>;
type FsLike = {
	read(path: string): Promise<string>;
	write(path: string, text: string): Promise<void>;
	exists(path: string): Promise<boolean>;
	list(path?: string): Promise<Array<{ name: string }>>;
};

// Config is read once per session and cwd (a /clear starts a new session id).
let configCache: { key: string; config: Promise<TakumiConfig> } | null = null;
// One journal per session dir; writes to it run one after another.
const journals = new Map<string, { writer: Promise<JournalWriter>; tail: Promise<void> }>();
let usageCheckedAt = 0;
// WebFetch answers of the current session; a new session id starts empty.
let webFetch: { sessionId: string; cache: WebFetchCache } | null = null;

function modIo($: { fs: FsLike }): ModIo {
	return {
		readText: (path) => $.fs.read(path).catch(() => null),
		exists: (path) => $.fs.exists(path).catch(() => false),
	};
}

/** Resumes the newest journal segment on disk, or starts a new epoch above it. */
async function openJournal($: { fs: FsLike }, dir: string): Promise<JournalWriter> {
	const entries = await $.fs.list(dir).catch(() => []);
	const numbers = entries
		.map((entry) => parseModJournalSegment(entry.name))
		.filter((n): n is number => n !== null);
	const highest = numbers.length > 0 ? Math.max(...numbers) : null;
	const text =
		highest === null
			? null
			: await $.fs.read(`${dir}/${modJournalSegmentName(highest)}`).catch(() => null);
	const newest = text === null ? null : parseJournalSegment(text);
	return resumeJournalWriter(newest, highest, () => crypto.randomUUID());
}

export const register: Register = (on) => {
	on("tool.call", async ($, e, next) => {
		const call = splitToolCall(e);
		const sessionId = await $.session.id().catch(() => "");
		const cwd = await $.session.cwd().catch(() => "");
		const home = await $.env.get("HOME").catch(() => undefined);
		const claudeConfigDir = await $.env.get("CLAUDE_CONFIG_DIR").catch(() => undefined);

		const key = `${sessionId}\n${cwd}`;
		if (configCache?.key !== key) {
			configCache = { key, config: loadModTakumiConfig(modIo($), home, cwd, claudeConfigDir) };
		}
		const config = await configCache.config;
		const gates = config.hooks ?? {};

		const cacheWebFetch = call.tool === "WebFetch" && gates["webfetch-cache"] !== false;
		if (cacheWebFetch) {
			if (webFetch?.sessionId !== sessionId) webFetch = { sessionId, cache: createWebFetchCache() };
			const hit = webFetch.cache.lookup(call.toolInput, Date.now());
			if (hit) return { result: hit.result, context: [webFetchCacheNotice(hit.ageMs)] };
		}

		if (MOD_GUARDED_TOOLS.has(call.tool)) {
			const ctx = buildGuardCtx({ cwd, sessionId, config });
			const deny = decideGuards(call.tool, call.toolInput, ctx);
			if (deny !== null) return { deny };
		}

		const configDir = resolveModConfigDir({
			takumiHome: await $.env.get("TAKUMI_HOME").catch(() => undefined),
			home,
			stateDirname: MOD_STATE_DIRNAME,
		});
		const marker =
			configDir && shouldMarkCall(call.tool)
				? modCallMarkerPath(configDir, sessionId, call.toolUseId)
				: null;
		const marked = marker
			? await $.fs.write(marker, "").then(
					() => true,
					() => false,
				)
			: false;

		const mask =
			gates["secret-redactor"] !== false && !isApprovedSecretRead(call.tool, call.toolInput);
		const outcome = await next(e);
		const result = mask ? maskToolOutcome(outcome) : outcome;
		if (cacheWebFetch && webFetch && isAnsweredToolResult(result) && "result" in result) {
			webFetch.cache.store(call.toolInput, result.result, Date.now());
		}
		if (!marked || !configDir || !call.toolUseId || !isAnsweredToolResult(result)) return result;

		// Journal the call for the shell metrics replay; awaited, so it lands before Stop.
		const dir = modSessionDir(configDir, sessionId);
		if (dir) {
			let journal = journals.get(dir);
			if (!journal) {
				journal = { writer: openJournal($, dir), tail: Promise.resolve() };
				journals.set(dir, journal);
			}
			const writer = await journal.writer;
			const segment = appendJournalEvent(writer, {
				ts: new Date().toISOString(),
				tool: call.tool,
				toolUseId: call.toolUseId,
				input: pickClassifyInput(call.toolInput),
			});
			journal.tail = journal.tail.then(() =>
				$.fs
					.write(`${dir}/${modJournalSegmentName(segment.segment)}`, JSON.stringify(segment))
					.catch(() => undefined),
			);
			await journal.tail;
		}

		// The shell usage-cache handler decides eligibility; it only needs to run when stale.
		const now = Date.now();
		const usageEnabled = gates["usage-context-awareness"] !== false;
		if (usageEnabled && now - usageCheckedAt >= USAGE_CHECK_INTERVAL_MS) {
			usageCheckedAt = now;
			const cache = await $.fs
				.read(`${configDir}/cache/statusline/${USAGE_CACHE_FILE}`)
				.catch(() => null);
			if (usageRefreshDue(cacheAgeMsFromText(cache, now))) {
				const stdin = JSON.stringify({
					hook_event_name: "PostToolUse",
					session_id: sessionId,
					cwd,
					tool_name: call.tool,
				});
				void $.process.run(USAGE_CACHE_HOOK_ARGV, { stdin }).catch(() => undefined);
			}
		}
		return result;
	}).catch(($, e, next) =>
		next.called
			? next(e)
			: { deny: `${$.plugin.name}: the takumi guard check failed, so the call was not run.` },
	);
};
