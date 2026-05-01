#!/usr/bin/env bash
INPUT=$(cat)
LOG_FILE="copilot-history.json"

if [ ! -f "$LOG_FILE" ]; then
  echo '{"sessions":[]}' > "$LOG_FILE"
fi

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PROMPT=$(echo "$INPUT" | jq -r '.prompt // ""')

jq \
  --arg sid "$SESSION_ID" \
  --arg ts "$TIMESTAMP" \
  --arg prompt "$PROMPT" \
  'if any(.sessions[]?; .id == $sid) then
    .sessions |= map(if .id == $sid then .prompts += [{"at": $ts, "prompt": $prompt}] else . end)
  else
    .sessions += [{"id": $sid, "prompts": [{"at": $ts, "prompt": $prompt}]}]
  end' "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"

echo '{"continue": true}'
