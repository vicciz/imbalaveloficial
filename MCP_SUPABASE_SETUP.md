# Supabase MCP Setup (VS Code + GitHub Copilot Agent)

This workspace is configured to use the official hosted Supabase MCP server.

## Files created

- `.vscode/mcp.json`
- `.vscode/mcp.env.example` (optional values for CI/manual auth)

## Current MCP config

```json
{
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?features=database,docs,development,debugging"
    }
  }
}
```

## Security

- No token is hardcoded in the repository.
- OAuth interactive auth is the default and recommended path.
- If CI/manual auth is required, use environment variables (see `.vscode/mcp.env.example`).

## How to authenticate in VS Code

1. Open Command Palette.
2. Run: `MCP: List Servers`.
3. Select `supabase` and start/authenticate the server.
4. Complete OAuth in browser when prompted.

## Validate MCP is working

After authentication, in Copilot Chat ask:

- `Liste as tabelas do banco usando MCP.`
- `Mostre as colunas da tabela usuario usando MCP.`
- `Execute uma consulta de leitura: select table_name from information_schema.tables where table_schema = 'public'.`

Expected: Copilot uses Supabase MCP tools (for example `list_tables` / `execute_sql`) and returns database metadata.

## Optional project scoping (recommended)

To lock MCP access to one project, set project ref in URL query:

`https://mcp.supabase.com/mcp?project_ref=<PROJECT_REF>&features=database,docs,development,debugging`

Project ref location:
- Supabase Dashboard > Project Settings > General > `Reference ID`.

## Optional PAT usage (only if your MCP client requires manual auth)

PAT location:
- Supabase Dashboard > Account > Access Tokens.

Use env vars (never hardcode):
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
