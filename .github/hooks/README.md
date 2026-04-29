# Message Logger Hook

This hook automatically logs all Copilot conversations to per-session files.

## What It Does

- **Captures user messages**: Every time you send a message to Copilot, it's logged with a timestamp
- **Rich metadata**: Logs include username, email (from git config), project name, and workspace path
- **JSON format**: All logs stored in structured JSON for easy parsing and analysis
- **Session-based files**: Creates one JSON file per conversation session in `.github/logs/`

## Log File Format

Files are named: `copilot-session-{SESSION_ID}.json`

Example content:
```json
{
  "session": {
    "id": "5a831d18-ccc5-49bc-b3e9-087d2fb1d87c",
    "started": "2026-04-16T09:28:19.593Z",
    "user": {
      "name": "tirth",
      "email": "tirth@example.com"
    },
    "workspace": {
      "project": "nodeforge",
      "path": "/home/tirth/tirth/Projects/Bankifi/nodeforge"
    }
  },
  "messages": [
    {
      "session_id": "5a831d18-ccc5-49bc-b3e9-087d2fb1d87c",
      "timestamp": "2026-04-16T09:28:19.593Z",
      "user": {
        "name": "tirth",
        "email": "tirth@example.com"
      },
      "workspace": {
        "project": "nodeforge",
        "path": "/home/tirth/tirth/Projects/Bankifi/nodeforge"
      },
      "message": "Create a new API endpoint for user authentication"
    },
    {
      "session_id": "5a831d18-ccc5-49bc-b3e9-087d2fb1d87c",
      "timestamp": "2026-04-16T09:30:15.123Z",
      "user": {
        "name": "tirth",
        "email": "tirth@example.com"
      },
      "workspace": {
        "project": "nodeforge",
        "path": "/home/tirth/tirth/Projects/Bankifi/nodeforge"
      },
      "message": "Add error handling to the endpoint"
    }
  ]
}
```

## Files

- **message-logger.json**: Hook configuration that triggers on `UserPromptSubmit` event
- **scripts/log-message.sh**: Logs user messages with metadata in JSON format
- **scripts/debug-hook-input.sh**: Debug script to inspect raw hook data from VS Code

## Configuration

The hook is automatically active for all users in this workspace. Log files are gitignored to avoid committing conversation history.

**Email Detection**: User email is extracted from your git config (`git config user.email`). Make sure you have it configured:
```bash
git config --global user.email "your.email@example.com"
```

## Benefits of JSON Format

- **Easy parsing**: Use `jq` or any JSON parser to analyze logs
- **Searchable**: Query specific messages, users, or time ranges
- **Exportable**: Convert to CSV, analyze in spreadsheet tools
- **API-ready**: Use logs programmatically in scripts or dashboards

### Example Queries

```bash
# Get all messages from a session
jq '.messages[].message' .github/logs/copilot-session-*.json

# Count messages in a session
jq '.messages | length' .github/logs/copilot-session-*.json

# Filter messages by date
jq '.messages[] | select(.timestamp > "2026-04-16T10:00:00Z")' .github/logs/copilot-session-*.json

# Extract just the conversation text
jq -r '.messages[] | "\(.timestamp): \(.message)"' .github/logs/copilot-session-*.json
```

## Troubleshooting

If logs aren't being created:

1. Verify scripts are executable:
   ```bash
   chmod +x .github/hooks/scripts/log-*.sh
   ```

2. Check that `jq` is installed (required for JSON parsing):
   ```bash
   jq --version
   ```

3. Check that git email is configured:
   ```bash
   git config user.email
   ```

4. Manually test the script:
   ```bash
   echo '{"session_id":"test","timestamp":"2026-04-16T10:00:00Z","prompt":"Hello","cwd":"'$(pwd)'","transcript_path":"'$HOME'/.config/Code/test"}' | .github/hooks/scripts/log-message.sh
   cat .github/logs/copilot-session-test.json
   ```

## Privacy Note

Log files contain your full conversation history with Copilot in JSON format. They are automatically ignored by git, but:
- Be mindful when sharing your workspace
- Consider adding `.github/logs/` to your global gitignore
- Periodically clean old log files if needed
- JSON files may contain sensitive code or information discussed with Copilot
