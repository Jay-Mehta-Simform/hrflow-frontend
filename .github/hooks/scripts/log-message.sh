#!/usr/bin/env bash
# Log user prompt with full context to copilot-history.json at project root
set -euo pipefail

INPUT=$(cat)
LOG_FILE="copilot-history.json"

if [ ! -f "$LOG_FILE" ]; then
  echo '{"sessions":[]}' > "$LOG_FILE"
fi

SESSION_ID=$(echo "$INPUT"      | jq -r '.session_id      // "unknown"')
CONVERSATION_ID=$(echo "$INPUT" | jq -r '.conversation_id // "unknown"')
TIMESTAMP=$(echo "$INPUT"       | jq -r '.timestamp       // ""')
[ -z "$TIMESTAMP" ] && TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

PROMPT=$(echo "$INPUT"          | jq -r '.prompt // ""')
CWD=$(echo "$INPUT"             | jq -r '.cwd    // "unknown"')
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""')

USERNAME=$(whoami)
USER_EMAIL=$(git config user.email 2>/dev/null || echo "unknown@localhost")
WORKSPACE=$(basename "$CWD" 2>/dev/null || echo "unknown")

# How many turns already exist for this session (to compute turn index)
TURN_COUNT=$(jq --arg sid "$SESSION_ID" '
  ([ .sessions[] | select(.id == $sid) ] | first | .turns | length) // 0
' "$LOG_FILE" 2>/dev/null || echo "0")
TURN_INDEX=$((TURN_COUNT + 1))

# Pull attachment file names from the transcript if available
ATTACHMENTS="[]"
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  TRANSCRIPT=$(jq -s '.' "$TRANSCRIPT_PATH" 2>/dev/null || echo "[]")
  PROMPT_INDEX=$((TURN_INDEX - 1))
  ATTACHMENTS=$(echo "$TRANSCRIPT" | jq --argjson idx "$PROMPT_INDEX" '
    ([.[] | select(.type == "user.message")])[$idx].data.attachments // []
    | map(.uri // .name // .) | map(split("/") | last)
  ' 2>/dev/null || echo "[]")
fi

TURN_ENTRY=$(jq -n \
  --argjson turn      "$TURN_INDEX" \
  --arg     at        "$TIMESTAMP" \
  --arg     prompt    "$PROMPT" \
  --argjson attachments "$ATTACHMENTS" \
  '{turn: $turn, at: $at, prompt: $prompt} +
   (if ($attachments | length) > 0 then {attachments: $attachments} else {} end)')

jq \
  --arg     sid     "$SESSION_ID" \
  --arg     started "$TIMESTAMP" \
  --arg     user    "$USERNAME" \
  --arg     email   "$USER_EMAIL" \
  --arg     project "$WORKSPACE" \
  --arg     path    "$CWD" \
  --argjson entry   "$TURN_ENTRY" \
  '
    if any(.sessions[]?; .id == $sid) then
      .sessions |= map(
        if .id == $sid then .turns += [$entry] else . end
      )
    else
      .sessions += [{
        id:             $sid,
        started:        $started,
        user:           $user,
        email:          $email,
        project:        $project,
        workspace_path: $path,
        turns:          [$entry]
      }]
    end
  ' "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"

echo '{"continue": true}'
