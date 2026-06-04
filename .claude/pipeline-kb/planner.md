# Planner Project Knowledge

- When a plan step edits a documentation region (CLAUDE.md, ADRs), sweep the surrounding paragraph/table for stale counts and enumerations — not just the one sentence being changed. CVapp's CLAUDE.md describes the Lambda's mock Forex tool set both as a count ("six mock Forex tools") and as an enumerated list, with an adjacent MockAgent sentence; a change to that set must update every count/list in the same step or the auditor flags SPEC_DRIFT (a fix-cycle cost).
