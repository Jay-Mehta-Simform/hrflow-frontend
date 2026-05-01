#!/usr/bin/env bash
# Append Copilot responses (from transcript) into copilot-history.json at project root
set -euo pipefail

INPUT=$(cat)
LOG_FILE="copilot-history.json"

if [ ! -f "$LOG_FILE" ]; then
  echo '{"sessions":[]}' > "$LOG_FILE"
fi

SESSION_ID=$(echo "$INPUT"      | jq -r '.session_id      // "unknown"')
TIMESTAMP=$(echo "$INPUT"       | jq -r '.timestamp       // ""')
[ -z "$TIMESTAMP" ] && TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""')

# Tools whose args are too large/noisy to store
HEAVY_TOOLS='create_file|edit_notebook_file|run_in_terminal|apply_patch|multi_replace_string_in_file|replace_string_in_file'

if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

TRANSCRIPT=$(jq -s '.' "$TRANSCRIPT_PATH" 2>/dev/null || echo "[]")

# How many turns in the log already have a response recorded
RESPONSE_COUNT=$(jq --arg sid "$SESSION_ID" '
  ([ .sessions[] | select(.id == $sid) ] | first | [.turns[]? | select(has("response"))] | length) // 0
' "$LOG_FILE" 2>/dev/null || echo "0")

# Extract AI assistant messages from transcript (skip already-recorded ones)
AI_MESSAGES=$(echo "$TRANSCRIPT" | jq --argjson skip "$RESPONSE_COUNT" '
  [.[] | select(.type == "assistant.message")] | .[$skip:]
')

MSG_COUNT=$(echo "$AI_MESSAGES" | jq 'length')

if [ "$MSG_COUNT" -eq 0 ]; then
  exit 0
fi

for i in $(seq 0 $((MSG_COUNT - 1))); do
  MSG=$(echo "$AI_MESSAGES" | jq --argjson i "$i" '.[$i]')

  AI_RESPONSE=$(echo "$MSG" | jq -r '.data.content // .data.text // ""' 2>/dev/null || echo "")

  # Tool names used in this response (skip heavy tools' args, just record names)
  TOOL_NAMES=$(echo "$MSG" | jq --arg heavy "$HEAVY_TOOLS" '
    [(.data.tool_calls // [])[] | .function.name] | unique
  ' 2>/dev/null || echo "[]")

  TURN_OFFSET=$((RESPONSE_COUNT + i + 1))

  jq \
    --arg     sid      "$SESSION_ID" \
    --argjson offset   "$TURN_OFFSET" \
    --arg     response "$AI_RESPONSE" \
    --argjson tools    "$TOOL_NAMES" \
    '
      .sessions |= map(
        if .id == $sid then
          .turns |= (
            to_entries | map(
              if .key == ($offset - 1) then
                .value += {response: $response} +
                  (if ($tools | length) > 0 then {tools_used: $tools} else {} end)
              else .
              end
            ) | from_entries
          )
        else . end
      )
    ' "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
done

echo '{"continue": true}'
