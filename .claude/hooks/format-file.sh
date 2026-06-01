#!/bin/bash
# PostToolUse hook: auto-format TS/TSX files after Write/Edit/MultiEdit
# Always exits 0 -- formatting is best-effort, must never block edits.

set -o pipefail

# Read JSON payload from stdin using node (no jq dependency)
INPUT=$(cat)

# Try to extract file_path from tool_input using node
# Handles both Write/Edit (tool_input.file_path) and falls back gracefully
FILE=$(echo "$INPUT" | node -e "
  let r = '';
  process.stdin.on('data', c => r += c);
  process.stdin.on('end', () => {
    try {
      const d = JSON.parse(r);
      const ti = d.tool_input || {};
      // Write and Edit have file_path directly
      if (ti.file_path) {
        process.stdout.write(ti.file_path);
        return;
      }
      // MultiEdit: try first edit's file_path
      if (Array.isArray(ti.edits) && ti.edits.length > 0 && ti.edits[0].file_path) {
        process.stdout.write(ti.edits[0].file_path);
        return;
      }
    } catch (e) {
      // JSON parse failed -- exit silently
    }
  });
" 2>/dev/null) || true

# If no file path extracted, exit silently
if [ -z "$FILE" ]; then
  exit 0
fi

# Only process .ts and .tsx files
case "$FILE" in
  *.ts|*.tsx)
    ;;
  *)
    exit 0
    ;;
esac

# Check that the file actually exists before formatting
if [ ! -f "$FILE" ]; then
  exit 0
fi

# Run ESLint --fix then Prettier --write (best-effort, ignore failures)
npx eslint --fix "$FILE" 2>/dev/null || true
npx prettier --write "$FILE" 2>/dev/null || true

exit 0
