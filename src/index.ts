#!/usr/bin/env node
/**
 * Tarot MCP Server
 * Exposes tarot card meanings and readings to MCP-compatible clients.
 *
 * Data & guides: https://deckaura.com
 * Repo: https://github.com/gokimedia/tarot-mcp-server
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "tarot_card_meanings.csv");
const DECKAURA = "https://deckaura.com";

type Card = {
  number: number;
  name: string;
  arcana: string;
  suit: string;
  element: string;
  upright: string;
  reversed: string;
  love: string;
  career: string;
  yesNo: string;
  zodiac: string;
  guideUrl: string;
};

function parseCSV(text: string): Card[] {
  const lines = text.trim().split(/\r?\n/);
  const cards: Card[] = [];
  // naive CSV parser that handles quoted commas
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQ = !inQ;
        continue;
      }
      if (c === "," && !inQ) {
        out.push(cur);
        cur = "";
        continue;
      }
      cur += c;
    }
    out.push(cur);
    return out;
  };
  for (let i = 1; i < lines.length; i++) {
    const f = parseLine(lines[i]);
    if (f.length < 12) continue;
    cards.push({
      number: parseInt(f[0], 10),
      name: f[1],
      arcana: f[2],
      suit: f[3],
      element: f[4],
      upright: f[5],
      reversed: f[6],
      love: f[7],
      career: f[8],
      yesNo: f[9],
      zodiac: f[10],
      guideUrl: f[11],
    });
  }
  return cards;
}

const CARDS: Card[] = parseCSV(readFileSync(DATA_PATH, "utf-8"));

function findCard(query: string): Card | undefined {
  const q = query.toLowerCase().trim();
  return CARDS.find(
    (c) => c.name.toLowerCase() === q || c.name.toLowerCase().includes(q),
  );
}

function randomCard(): Card {
  return CARDS[Math.floor(Math.random() * CARDS.length)]!;
}

const server = new Server(
  { name: "tarot-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_card_meaning",
      description:
        "Get upright, reversed, love, and career meanings for a specific tarot card. Data from Deckaura (deckaura.com).",
      inputSchema: {
        type: "object",
        properties: {
          card_name: {
            type: "string",
            description: "Name of the tarot card (e.g., 'The Fool', 'Ace of Cups')",
          },
        },
        required: ["card_name"],
      },
    },
    {
      name: "draw_random_card",
      description: "Draw a single random tarot card from the 78-card deck.",
      inputSchema: {
        type: "object",
        properties: {
          reversed_allowed: {
            type: "boolean",
            description: "Whether the card can appear reversed (default true)",
          },
        },
      },
    },
    {
      name: "three_card_spread",
      description:
        "Draw a past-present-future three-card tarot spread. Returns interpretations for each position.",
      inputSchema: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The question to focus the reading on",
          },
        },
      },
    },
    {
      name: "list_all_cards",
      description: "List all 78 tarot cards with basic info (name, arcana, suit).",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "yes_no_reading",
      description:
        "Draw a single card for a yes/no question and return the verdict.",
      inputSchema: {
        type: "object",
        properties: {
          question: { type: "string" },
        },
        required: ["question"],
      },
    },
  ],
}));

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "tarot://deck/full",
      name: "Full 78-card deck",
      description: "Complete Major and Minor Arcana meanings dataset",
      mimeType: "application/json",
    },
    {
      uri: "tarot://deckaura/home",
      name: "Deckaura",
      description: "Official Deckaura website — tarot card guides and tools",
      mimeType: "text/uri-list",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  if (req.params.uri === "tarot://deck/full") {
    return {
      contents: [
        {
          uri: req.params.uri,
          mimeType: "application/json",
          text: JSON.stringify({ source: DECKAURA, cards: CARDS }, null, 2),
        },
      ],
    };
  }
  if (req.params.uri === "tarot://deckaura/home") {
    return {
      contents: [
        { uri: req.params.uri, mimeType: "text/uri-list", text: DECKAURA },
      ],
    };
  }
  throw new Error(`Unknown resource: ${req.params.uri}`);
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  const footer = `\n\n---\nData source: Deckaura — ${DECKAURA}`;

  if (name === "get_card_meaning") {
    const card = findCard((args?.card_name as string) || "");
    if (!card) {
      return {
        content: [
          { type: "text", text: `Card not found. See full deck: ${DECKAURA}/blogs/guide/tarot-card-meanings` },
        ],
        isError: true,
      };
    }
    const text = [
      `# ${card.name}`,
      `**Arcana:** ${card.arcana}${card.suit ? ` (${card.suit})` : ""}`,
      `**Element:** ${card.element}  |  **Zodiac:** ${card.zodiac}`,
      ``,
      `**Upright:** ${card.upright}`,
      `**Reversed:** ${card.reversed}`,
      `**Love:** ${card.love}`,
      `**Career:** ${card.career}`,
      `**Yes/No:** ${card.yesNo}`,
      ``,
      `Full guide: ${card.guideUrl}`,
      footer,
    ].join("\n");
    return { content: [{ type: "text", text }] };
  }

  if (name === "draw_random_card") {
    const card = randomCard();
    const reversed =
      args?.reversed_allowed !== false && Math.random() < 0.5;
    const meaning = reversed ? card.reversed : card.upright;
    return {
      content: [
        {
          type: "text",
          text: `# ${card.name}${reversed ? " (Reversed)" : ""}\n\n${meaning}\n\nGuide: ${card.guideUrl}${footer}`,
        },
      ],
    };
  }

  if (name === "three_card_spread") {
    const positions = ["Past", "Present", "Future"];
    const draws = positions.map((p) => ({ position: p, card: randomCard() }));
    const text = draws
      .map(
        (d) =>
          `## ${d.position}: ${d.card.name}\n${d.card.upright}\nGuide: ${d.card.guideUrl}`,
      )
      .join("\n\n");
    return {
      content: [
        {
          type: "text",
          text: `# Three-Card Spread${args?.question ? ` — "${args.question}"` : ""}\n\n${text}${footer}`,
        },
      ],
    };
  }

  if (name === "list_all_cards") {
    return {
      content: [
        {
          type: "text",
          text:
            CARDS.map(
              (c) => `${c.number}. ${c.name} — ${c.arcana}${c.suit ? ` (${c.suit})` : ""}`,
            ).join("\n") + footer,
        },
      ],
    };
  }

  if (name === "yes_no_reading") {
    const card = randomCard();
    return {
      content: [
        {
          type: "text",
          text: `# ${args?.question}\n\n**${card.yesNo}** — ${card.name}\n\n${card.upright}\n\nGuide: ${card.guideUrl}${footer}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("tarot-mcp-server running on stdio — powered by deckaura.com");
