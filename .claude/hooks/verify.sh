#!/bin/bash
# Stop hook: runs quality gate checks before Claude task completion.
# Exits 0 on all-pass, exits 2 on first failure.
# Guards against infinite loops via stop_hook_active env var.

# Infinite-loop guard: if this hook already ran in this process tree, bail out
if [ "$stop_hook_active" = "1" ]; then
  exit 0
fi
export stop_hook_active=1

# Change to the project directory
cd "$CLAUDE_PROJECT_DIR" || exit 0

# Run checks sequentially, stop on first failure

echo "Running typecheck..." >&2
if ! npm run typecheck 2>&1; then
  echo "typecheck failed" >&2
  exit 2
fi

echo "Running lint..." >&2
if ! npm run lint 2>&1; then
  echo "lint failed" >&2
  exit 2
fi

echo "Running circular dependency check..." >&2
if ! npm run deps:check 2>&1; then
  echo "circular dependency check failed" >&2
  exit 2
fi

echo "All quality checks passed." >&2
exit 0
