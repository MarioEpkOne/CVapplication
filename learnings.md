# Pipeline Learnings

## HIGH

---

## MEDIUM

### Plan-copy into worktree creates an untracked artifact dir that trips the auditor
**Date**: 2026-06-01 22:03
**Phase affected**: Phase 2 (Impl-Plan) / Phase 4 (Audit)
**Occurrences**: 2
**Seen in**: spec--security-hardening, spec--ask-the-agent-lambda, project: /mnt/c/Users/Epkone/CVapplication
**What happened**: `impl-plan.md` Phase 4 instructs the planner to `cp` the plan into the worktree's `Implementation Plans/` so `/impl` can find it from either location, but `agents/planner.md` invariant #1 states "artifact directories are never inside worktrees." In pipeline runs the implementer already receives the plan by absolute path, so the worktree copy is redundant and leaves an untracked `Implementation Plans/` dir inside the worktree. First seen when the auditor flagged it as a housekeeping/invariant conflict; recurred on spec--ask-the-agent-lambda where the implementer reported the worktree `Implementation Plans/` as the sole untracked item after committing — the redundant copy persisted even though the auditor did not raise it as an error that run. The structural conflict between the Phase 4 copy step and the planner invariant is unresolved regardless of whether a given run's auditor flags it.
**Suggestion**: In pipeline context, skip the worktree plan-copy (the implementer gets an absolute path); or add `Implementation Plans/` to the worktree's git exclude so it never surfaces in `git status`. Reconcile `impl-plan.md` Phase 4 with the planner invariant.
**Suggested diff**:
File: `commands/impl-plan.md`
```diff
 After the worktree is created, copy the plan into it so `/impl` can find it whether run from the main project or from inside the worktree:

 ```bash
 cp "Implementation Plans/impl--<filename>.md" \
    ".claude/worktrees/<slug>/Implementation Plans/"
 ```
+
+> **Pipeline context**: When invoked by `/pipeline` (the implementing agent receives the plan by absolute path), skip this copy — it leaves an untracked `Implementation Plans/` directory inside the worktree that contradicts the planner's "artifact directories are never inside worktrees" invariant and gets flagged by the auditor every run. If you do copy it, add `Implementation Plans/` to `.git/worktrees/<slug>/info/exclude`.
```

### Pipeline auditor lacks the Agent tool, so the independent-evaluator phase never runs
**Date**: 2026-06-01 18:50
**Phase affected**: Phase 4 (Audit)
**Occurrences**: 2
**Seen in**: spec--interactive-resume-cover-letter, spec--ask-the-agent-lambda, project: /mnt/c/Users/Epkone/CVapplication
**What happened**: `audit-implementation.md` Phase 2 instructs the auditor to "Launch a sub-agent using the Agent tool," but the `pipelineiq:auditor` agent's tool list is `[Read, Write, Grep, Glob, Bash]` with no Agent/Task tool, so the independent evaluator can never spawn — the auditor always hits the "Independent evaluation unavailable" fallback. On spec--ask-the-agent-lambda the auditor again confirmed this, explicitly noting "the Agent tool was unavailable, so I ran the independent evaluation myself (static inspection + the project's own verification commands)." The phase is effectively dead code in pipeline context, removing the cross-check the audit design intends.
**Suggestion**: Either grant the auditor agent the Agent tool (root fix lives in `agents/auditor.md`), or have `audit-implementation.md` Phase 2 acknowledge tool-restricted auditors up front so the fallback is expected rather than a silent capability loss. Recording against the command file per the diff-target convention; the underlying fix may route to the agent definition at review time.
**Suggested diff**:
File: `commands/audit-implementation.md`
```diff
 ## Phase 2 — Independent Evaluator Sub-Agent

+**Tool availability**: If the Agent tool is not available in your environment (some pipeline auditor agents are restricted to Read/Write/Grep/Glob/Bash), skip this phase, note "Independent evaluation unavailable — auditor lacks Agent tool" in the audit, and perform the verification directly in Phase 3 while explicitly flagging static-vs-runtime distinctions. This is expected, not a failure.
+
 Launch a sub-agent using the Agent tool. Pass it the following prompt, with the full spec content pasted in at the end:
```

---

## LOW

### Plan grep-gates can forbid a substring that the plan's own prescribed edits require
**Date**: 2026-06-02 00:20
**Phase affected**: Phase 2 (Impl-Plan) / Phase 3 (Impl)
**Occurrences**: 1
**Seen in**: spec--remove-contact-form, project: /mnt/c/Users/Epkone/CVapplication
**What happened**: The plan defined a `grep -rn "contact"` verification gate asserting the word was fully removed, but another of its own steps prescribed an ADR 0004 historical note whose required text contains "contact". The implementer had to notice the self-contradiction and keep the intended note; an agent that obeyed the gate literally would have deleted load-bearing text. Same class as the existing "guard preempts spec-required test input" note, but for verification grep-gates vs. prescribed edits rather than test inputs vs. guards.
**Suggestion**: In Phase 3.5 self-review, add a check that every grep/absence-based verification gate is reconciled against the plan's own prescribed edit text and intended residual references (docs, ADRs, changelogs) — scope the gate to paths/identifiers that must truly be empty, not broad substrings that legitimately survive elsewhere.
**Suggested diff**:
File: `commands/impl-plan.md`
```diff
 | **Constraints** | Every constraint is enforced somewhere in the steps or post-implementation checklist |
+| **Verification gates** | Every grep/absence-based gate (e.g. "`grep X` returns nothing") must be reconciled against the plan's *own* prescribed edits and intended residual references (docs, ADRs, changelogs, type unions). If a gate forbids a substring that a different step legitimately writes or preserves, scope the gate to the exact paths/identifiers that must be empty — never a broad substring that survives elsewhere by design. A self-contradicting gate forces the implementer to guess which step wins. |
 | **Success Criteria** | Cross-check every Success Criteria bullet against the logic/design sections of the spec to confirm each criterion has a corresponding implementation path. Flag any criterion with no matching code path as a spec inconsistency before the impl starts — do not leave it to the auditor to discover. |
```

### WSL worktree npm install fails with ENOTEMPTY, causing lockfile desync
**Date**: 2026-06-01 23:59
**Phase affected**: Phase 3 (Impl)
**Occurrences**: 1
**Seen in**: spec--quality-gate-hooks, project: /mnt/c/Users/Epkone/CVapplication
**What happened**: `npm install` inside a git worktree on WSL2 failed with ENOTEMPTY when extracting the `next` package. The implementer worked around it by installing in the main repo and symlinking, but the worktree's `package-lock.json` was never regenerated — the audit caught that `npm ci` would fail on a fresh clone.
**Suggestion**: Add a WSL-specific note to `impl.md` Phase 4: after any `npm install` in a worktree, verify that `package-lock.json` reflects all new devDependencies. If install fails, copy the main repo's lockfile into the worktree and commit it.
**Suggested diff**:
File: `commands/impl.md`
```diff
 **Build tool unavailable in this environment**: If the spec-required build command fails because the build tool itself cannot run (e.g., a native binary is missing, rollup fails on WSL with `@rollup/rollup-linux-x64-gnu` not found), do NOT silently accept a stale distributable as "built." Either: (a) find an alternative build path that achieves the same result, or (b) explicitly flag the distributable as stale in the working log with: what command failed, why the tool can't run, and what the user must do to produce a valid build. A spec-required build that fails = `INCOMPLETE_TASK` unless it is explicitly deferred with user-actionable instructions.
+
+**Lockfile sync after workaround installs**: If `npm install` (or equivalent) fails in the worktree and packages are installed via the main repo or another workaround, verify `package-lock.json` in the worktree reflects all additions. Copy the main repo's lockfile into the worktree if needed and commit it. An out-of-sync lockfile causes `npm ci` failures on fresh clones — this is an `INCOMPLETE_TASK`.
```

### WSL core.fileMode=false prevents chmod +x from reaching git index
**Date**: 2026-06-01 23:59
**Phase affected**: Phase 3 (Impl)
**Occurrences**: 1
**Seen in**: spec--quality-gate-hooks, project: /mnt/c/Users/Epkone/CVapplication
**What happened**: The implementer ran `chmod +x` on two hook scripts, but on WSL2 with `core.fileMode=false`, the filesystem permission change does not propagate to git's index. Both scripts were committed as mode 100644 (non-executable). The audit caught this — on Linux/macOS clones, Claude Code would fail to run the hooks.
**Suggestion**: Add guidance to `impl.md` Phase 4: when making files executable, always follow `chmod +x` with `git update-index --chmod=+x <file>` to ensure the executable bit is stored in the git index regardless of `core.fileMode` setting.
**Suggested diff**:
File: `commands/impl.md`
```diff
 **Build tool unavailable in this environment**: If the spec-required build command fails because the build tool itself cannot run (e.g., a native binary is missing, rollup fails on WSL with `@rollup/rollup-linux-x64-gnu` not found), do NOT silently accept a stale distributable as "built." Either: (a) find an alternative build path that achieves the same result, or (b) explicitly flag the distributable as stale in the working log with: what command failed, why the tool can't run, and what the user must do to produce a valid build. A spec-required build that fails = `INCOMPLETE_TASK` unless it is explicitly deferred with user-actionable instructions.
+
+**Executable file permissions**: When a plan step requires making a file executable (`chmod +x`), also run `git update-index --chmod=+x <file>` to store the executable bit in the git index. On WSL and other environments where `core.fileMode=false`, `chmod` alone does not affect the git index — the file will be committed as 100644 (non-executable) and fail on Linux/macOS clones.
```

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
