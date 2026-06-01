# Pipeline Learnings

## HIGH

---

## MEDIUM

---

## LOW

### Phase 1.5 assumes a pre-existing git repo and a working EnterWorktree
**Date**: 2026-06-01 18:50
**Phase affected**: Phase 1.5 (Worktree)
**Occurrences**: 1
**Seen in**: spec--interactive-resume-cover-letter, project: C:/Users/Epkone/CVapplication
**What happened**: The target project was greenfield/non-git, so `git rev-parse --show-toplevel` failed and `EnterWorktree` refused with "not in a git repository"; even after a manual `git init` mid-session the harness's session-start git detection stayed cached, so `EnterWorktree` kept failing and the rigid "If it fails: STOP" would have aborted an otherwise-recoverable run (a real worktree was creatable via `git worktree add`).
**Suggestion**: Before the worktree step, detect a non-git CWD and `git init` + initial commit (greenfield specs are common). When `EnterWorktree` fails but `git worktree add <path> HEAD` succeeds and `git worktree list` shows the entry on disk, treat that as valid isolation and continue (subagents receive WORKTREE_PATH by absolute path and do not require the session CWD to be switched).
**Suggested diff**:
File: `commands/pipeline.md`
```diff
+**Pre-check (greenfield)**: If `git rev-parse --show-toplevel` fails ("not a git repository"), run `git init -b main`, create a `.gitignore`, set a local `user.name`/`user.email` if unset, and make an initial commit. Then continue.
+
 **Capture the main repo path** via `git rev-parse --show-toplevel`. Store as `MASTER_REPO_PATH`.

 **Derive a slug** from the spec filename: lowercase, hyphens only, max 30 chars. Check `git worktree list` for collisions; append `-2`/`-3` if needed. STOP after 3 collisions.

-**Create the worktree**: Load the EnterWorktree schema via `ToolSearch query="select:EnterWorktree"`. Call `EnterWorktree name='<slug>'`. If it fails: STOP. Do not fall back to master.
+**Create the worktree**: Load the EnterWorktree schema via `ToolSearch query="select:EnterWorktree"`. Call `EnterWorktree name='<slug>'`. If it fails (e.g. the harness cached a non-git CWD at session start), fall back to `git worktree add -b <slug> ".claude/worktrees/<slug>" HEAD` and verify with `git worktree list`. Only STOP if neither path yields a worktree on disk. Do not fall back to master.
```

### Pipeline auditor lacks the Agent tool, so the independent-evaluator phase never runs
**Date**: 2026-06-01 18:50
**Phase affected**: Phase 4 (Audit)
**Occurrences**: 1
**Seen in**: spec--interactive-resume-cover-letter, project: C:/Users/Epkone/CVapplication
**What happened**: `audit-implementation.md` Phase 2 instructs the auditor to "Launch a sub-agent using the Agent tool," but the `pipelineiq:auditor` agent's tool list is `[Read, Write, Grep, Glob, Bash]` with no Agent/Task tool, so the independent evaluator can never spawn — the auditor always hits the "Independent evaluation unavailable" fallback. The phase is effectively dead code in pipeline context, removing the cross-check the audit design intends.
**Suggestion**: Either grant the auditor agent the Agent tool (root fix lives in `agents/auditor.md`), or have `audit-implementation.md` Phase 2 acknowledge tool-restricted auditors up front so the fallback is expected rather than a silent capability loss. Recording against the command file per the diff-target convention; the underlying fix may route to the agent definition at review time.
**Suggested diff**:
File: `commands/audit-implementation.md`
```diff
 ## Phase 2 — Independent Evaluator Sub-Agent

+**Tool availability**: If the Agent tool is not available in your environment (some pipeline auditor agents are restricted to Read/Write/Grep/Glob/Bash), skip this phase, note "Independent evaluation unavailable — auditor lacks Agent tool" in the audit, and perform the verification directly in Phase 3 while explicitly flagging static-vs-runtime distinctions. This is expected, not a failure.
+
 Launch a sub-agent using the Agent tool. Pass it the following prompt, with the full spec content pasted in at the end:
```
