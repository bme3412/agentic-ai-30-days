# MCP TypeScript SDK Quick Start

## Installation

```bash
npm install @modelcontextprotocol/sdk
```

## Basic Server Example

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create server
const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Define a tool
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "hello",
      description: "Greet someone by name",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name to greet" }
        },
        required: ["name"]
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "hello") {
    const name = request.params.arguments.name;
    return {
      content: [{ type: "text", text: `Hello, ${name}!` }]
    };
  }
  throw new Error("Unknown tool");
});

// Run server
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Adding Resources

```typescript
server.setRequestHandler("resources/list", async () => ({
  resources: [
    {
      uri: "file:///example.txt",
      name: "Example File",
      mimeType: "text/plain"
    }
  ]
}));

server.setRequestHandler("resources/read", async (request) => {
  if (request.params.uri === "file:///example.txt") {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "text/plain",
          text: "File contents here"
        }
      ]
    };
  }
  throw new Error("Resource not found");
});
```

## Client Example

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client(
  { name: "my-client", version: "1.0.0" },
  { capabilities: {} }
);

// Connect to server
const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"]
});
await client.connect(transport);

// List tools
const tools = await client.request("tools/list", {});

// Call a tool
const result = await client.request("tools/call", {
  name: "hello",
  arguments: { name: "World" }
});
```

## Configuration for Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"]
    }
  }
}
```

## Key Links

- [GitHub Repository](https://github.com/modelcontextprotocol/typescript-sdk)
- [npm Package](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [Server Documentation](https://modelcontextprotocol.io/docs/first-server/typescript)
