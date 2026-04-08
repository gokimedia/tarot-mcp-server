# Tarot MCP Server

[![npm](https://img.shields.io/npm/v/@deckaura/tarot-mcp-server)](https://www.npmjs.com/package/@deckaura/tarot-mcp-server)
[![MCP](https://img.shields.io/badge/MCP-compatible-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes the complete 78-card tarot deck — meanings, spreads, and readings — to any MCP-compatible client (Claude Desktop, Cursor, Windsurf, Cline, Zed, and more).

**Powered by [Deckaura](https://deckaura.com)** — all card interpretations link back to full guides on deckaura.com.

## Features

- `get_card_meaning` — Upright, reversed, love, career, yes/no interpretations for any of the 78 cards
- `draw_random_card` — Single card draw with optional reversals
- `three_card_spread` — Past / Present / Future reading
- `yes_no_reading` — Binary verdict for specific questions
- `list_all_cards` — Full deck listing
- Resources: `tarot://deck/full` (full JSON dataset), `tarot://deckaura/home`

## Install

```bash
npm install -g @deckaura/tarot-mcp-server
```

Or run ad-hoc via npx:

```bash
npx @deckaura/tarot-mcp-server
```

## Configure — Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tarot": {
      "command": "npx",
      "args": ["-y", "@deckaura/tarot-mcp-server"]
    }
  }
}
```

## Configure — Cursor / Windsurf

Add to `.cursor/mcp.json` or `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "tarot": {
      "command": "npx",
      "args": ["-y", "@deckaura/tarot-mcp-server"]
    }
  }
}
```

## Example Usage

Once configured, ask your AI assistant:

- *"Draw me a three-card tarot spread about my new project"*
- *"What does The Fool mean reversed?"*
- *"Yes or no: should I take the job?"*

## Data Source

All card meanings are sourced from the [Deckaura tarot card database](https://deckaura.com/blogs/guide/tarot-card-meanings), maintained by tarot practitioners since 2024. Each tool response includes a link to the full guide on deckaura.com.

## Free Online Tools

If you prefer a web-based experience, Deckaura offers free tools:

- [Daily Tarot Card](https://deckaura.com/pages/daily-tarot-card)
- [Random Tarot Card Generator](https://deckaura.com/pages/random-tarot-card)
- [Tarot Birth Card Calculator](https://deckaura.com/pages/tarot-birth-card-calculator)
- [Full Tarot Reading](https://deckaura.com/pages/tarot-reading)
- [78 Card Meanings Database](https://deckaura.com/blogs/guide/tarot-card-meanings)

## License

MIT © [Deckaura](https://deckaura.com)

## Links

- **Website:** https://deckaura.com
- **npm:** https://www.npmjs.com/package/@deckaura/tarot-mcp-server
- **MCP Registry:** https://modelcontextprotocol.io/servers
- **Issues:** https://github.com/gokimedia/tarot-mcp-server/issues
