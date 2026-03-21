import type { Day } from '../../types';

export const day19: Day = {
  day: 19,
  phase: 4,
  title: "MCP: Model Context Protocol Fundamentals",
  partner: "Anthropic",
  tags: ["mcp", "protocol", "tools", "resources", "prompts", "json-rpc", "interoperability"],
  concept: "Standardized protocol for connecting AI assistants to external tools and data sources",
  demoUrl: "demos/day-19/",
  demoDescription: "Explore MCP architecture interactively: visualize host/client/server relationships, simulate tool invocations, and trace protocol messages.",

  lesson: {
    overview: `Every AI assistant needs to interact with the outside world—reading files, querying databases, calling APIs, executing code. Traditionally, each integration requires custom code: different APIs, authentication methods, and data formats. The **Model Context Protocol (MCP)** changes this by providing a universal standard for connecting AI applications to external tools and data sources.

**Think of MCP as "USB-C for AI"**: just as USB-C provides a standardized way to connect any device to any computer, MCP provides a standardized way to connect any tool to any AI application. Build an MCP server once, and it works with Claude Desktop, VS Code, Cursor, and any other MCP-compatible host.

The protocol defines three core primitives: **Tools** (executable functions the LLM can call), **Resources** (data the application can access), and **Prompts** (reusable message templates). These primitives communicate over JSON-RPC 2.0, enabling both local (STDIO) and remote (HTTP) connections with a consistent interface.

**Why This Matters**: As AI applications proliferate, the integration burden grows exponentially. MCP eliminates this by creating a shared ecosystem—tool developers build once, AI developers integrate once, and users get seamless access to an ever-growing library of capabilities. This is the infrastructure layer that enables truly interoperable AI systems.`,

    principles: [
      {
        title: "Host-Client-Server Architecture",
        description: "MCP uses a three-tier model: Hosts are AI applications (like Claude Desktop), Clients are protocol handlers within hosts that manage connections, and Servers provide capabilities. A single host can have multiple clients, each connecting to one server. This separation enables clean abstractions and independent scaling."
      },
      {
        title: "Three Core Primitives",
        description: "Everything in MCP flows through three primitives: Tools are model-controlled executable functions (similar to function calling), Resources are application-controlled data sources (files, APIs, databases), and Prompts are user-controlled message templates. Understanding which primitive to use is key to effective MCP design."
      },
      {
        title: "JSON-RPC 2.0 Transport",
        description: "MCP communicates via JSON-RPC 2.0, a lightweight remote procedure call protocol. Messages are JSON objects with method names and parameters. This enables language-agnostic implementations and straightforward debugging—every message is human-readable text."
      },
      {
        title: "Capability Negotiation",
        description: "During initialization, clients and servers exchange capability declarations. This handshake ensures compatibility and allows graceful degradation when features aren't supported. Capabilities include tool support, resource subscriptions, prompt templates, and experimental features."
      },
      {
        title: "Human-in-the-Loop Security",
        description: "MCP is designed with security as a first principle. Sensitive operations require explicit user confirmation. Tool inputs should be shown to users before execution. Servers should validate all inputs, and hosts should never trust tool annotations from untrusted sources."
      }
    ],

    codeExample: {
      language: "python",
      title: "Simple MCP Server with Tool",
      code: `from mcp.server import Server
from mcp.types import Tool, TextContent
import json

# Create the MCP server
server = Server("weather-server")

@server.list_tools()
async def list_tools() -> list[Tool]:
    """Declare available tools."""
    return [
        Tool(
            name="get_weather",
            description="Get current weather for a location",
            inputSchema={
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name or coordinates"
                    }
                },
                "required": ["location"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool invocations."""
    if name == "get_weather":
        location = arguments.get("location", "Unknown")
        # In production, call a real weather API
        weather = {
            "location": location,
            "temperature": "72°F",
            "conditions": "Sunny",
            "humidity": "45%"
        }
        return [TextContent(
            type="text",
            text=json.dumps(weather, indent=2)
        )]
    raise ValueError(f"Unknown tool: {name}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(server.run())`
    },

    diagram: {
      type: "mermaid",
      title: "MCP Architecture Overview",
      mermaid: `flowchart TB
    subgraph Host["MCP Host (AI Application)"]
        LLM["Language Model"]
        C1["MCP Client"]
        C2["MCP Client"]
    end

    subgraph Servers["MCP Servers"]
        S1["File Server"]
        S2["Database Server"]
        S3["API Server"]
    end

    subgraph Primitives["Capabilities"]
        T["Tools"]
        R["Resources"]
        P["Prompts"]
    end

    LLM --> C1
    LLM --> C2
    C1 -->|"JSON-RPC"| S1
    C2 -->|"JSON-RPC"| S2
    C2 -->|"JSON-RPC"| S3

    S1 --> T
    S1 --> R
    S2 --> T
    S2 --> R
    S3 --> T
    S3 --> P

    style Host fill:#e3f2fd
    style Servers fill:#f3e5f5
    style Primitives fill:#e8f5e9`
    },

    keyTakeaways: [
      "MCP provides a standardized protocol for connecting AI applications to external tools and data sources",
      "The architecture consists of Hosts (AI apps), Clients (connection managers), and Servers (capability providers)",
      "Three primitives define all capabilities: Tools (model-controlled actions), Resources (application-controlled data), and Prompts (user-controlled templates)",
      "JSON-RPC 2.0 transport enables language-agnostic implementations over STDIO (local) or HTTP (remote)",
      "Capability negotiation during initialization ensures compatibility between clients and servers",
      "Security is built-in with human-in-the-loop design for sensitive operations"
    ],

    resources: [
      {
        title: "MCP Specification",
        url: "https://spec.modelcontextprotocol.io/",
        type: "docs",
        description: "The official MCP specification with complete protocol details",
        summaryPath: "data/day-19/summary-mcp-specification.md"
      },
      {
        title: "MCP Python SDK",
        url: "https://github.com/modelcontextprotocol/python-sdk",
        type: "github",
        description: "Official Python SDK for building MCP servers and clients",
        summaryPath: "data/day-19/summary-mcp-python-sdk.md"
      },
      {
        title: "MCP TypeScript SDK",
        url: "https://github.com/modelcontextprotocol/typescript-sdk",
        type: "github",
        description: "Official TypeScript SDK for building MCP servers and clients",
        summaryPath: "data/day-19/summary-mcp-typescript-sdk.md"
      }
    ]
  },

  learn: {
    overview: {
      summary: "MCP (Model Context Protocol) is an open standard that provides a universal interface for connecting AI applications to external tools and data sources, enabling interoperability across the AI ecosystem.",
      fullDescription: `The proliferation of AI assistants has created an integration crisis. Every AI application—Claude, GPT, Copilot, custom agents—needs to connect with databases, APIs, file systems, and countless other services. Without standardization, developers face an N×M integration problem: N AI applications each need custom integrations with M tools.

**MCP solves this with a universal protocol**. Tool developers implement their capability once as an MCP server. AI application developers implement MCP client support once. Users get seamless access to any tool from any application. The math changes from N×M custom integrations to N+M standard implementations.

The protocol is built on proven foundations:
- **JSON-RPC 2.0**: A simple, language-agnostic RPC standard
- **Capability negotiation**: Clients and servers declare what they support
- **Transport flexibility**: STDIO for local servers, HTTP/SSE for remote

\`\`\`
Traditional Integration:
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Claude  │────▶│ Custom  │────▶│ Tool A  │
│         │────▶│  Code   │────▶│ Tool B  │
│         │────▶│   ×N    │────▶│ Tool C  │
└─────────┘     └─────────┘     └─────────┘

With MCP:
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Any AI  │────▶│   MCP   │────▶│ Any MCP │
│  Host   │     │ Protocol│     │ Server  │
└─────────┘     └─────────┘     └─────────┘
\`\`\`

**The three primitives** cover all integration needs:

1. **Tools**: Functions the LLM can invoke to take actions. The model sees tool descriptions, selects when to use them, and processes results. This is MCP's equivalent to function calling.

2. **Resources**: Data sources the application can expose to the AI. Unlike tools, resources are typically selected by the application or user, not the model. Think: file contents, database records, API responses.

3. **Prompts**: Reusable message templates that users can invoke. These are like slash commands—user-initiated, with structured arguments. Great for common workflows like "code review" or "summarize document."

MCP is already supported by Claude Desktop, VS Code (via extensions), Cursor, Zed, and many custom applications. As the ecosystem grows, building on MCP ensures your tools and applications remain compatible with the future of AI.`,
      prerequisites: [
        "Day 2: Function Calling Fundamentals (understanding tool invocation)",
        "Basic understanding of JSON and HTTP APIs",
        "Familiarity with async/await programming patterns",
        "Command line and local development experience"
      ],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "Understanding the MCP Architecture",
        description: `MCP defines a clear separation between three components that work together to enable AI-tool integration:

**Hosts** are AI applications that want to access external capabilities. Claude Desktop, VS Code with AI extensions, Cursor, and custom LLM applications are all hosts. A host provides the user interface and orchestrates the AI's interactions with the outside world.

**Clients** are protocol handlers within a host. Each client maintains a connection to exactly one server. A host typically creates multiple clients to connect to multiple servers simultaneously. The client handles:
- Connection lifecycle (connect, disconnect, reconnect)
- Message serialization and deserialization
- Capability tracking for its connected server
- Request/response correlation

**Servers** provide capabilities to clients. A server can expose tools, resources, prompts, or any combination. Servers run as separate processes (local) or services (remote), communicating via the MCP protocol.

\`\`\`
┌────────────────────────────────────────────────┐
│           Host (e.g., Claude Desktop)          │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │            Language Model                │  │
│  │  (Sees tools, decides when to use them)  │  │
│  └──────────────────────────────────────────┘  │
│         │              │              │        │
│         ▼              ▼              ▼        │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│  │ Client 1 │   │ Client 2 │   │ Client 3 │   │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   │
└───────┼──────────────┼──────────────┼──────────┘
        │              │              │
        ▼              ▼              ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐
  │  File    │   │ Database │   │   API    │
  │  Server  │   │  Server  │   │  Server  │
  └──────────┘   └──────────┘   └──────────┘
\`\`\`

**Transport Options**:

1. **STDIO (Local)**: Server runs as a subprocess, communicating via stdin/stdout. Simple, secure (no network), ideal for local tools like file access.

2. **HTTP with SSE**: Server runs as a web service. Client sends requests via HTTP POST, server pushes notifications via Server-Sent Events. Enables remote servers and horizontal scaling.

The transport is abstracted from the protocol—servers and clients use the same message format regardless of transport.`,
        analogy: "Think of MCP architecture like a corporate office building. The building itself is the Host—it provides the infrastructure and coordinates everything. Each department's reception desk is a Client—it handles communication with one specific external partner. The external partners (law firms, accounting firms, vendors) are Servers—each provides specialized services through a standardized communication protocol.",
        gotchas: [
          "Each client connects to exactly one server—if you need multiple servers, create multiple clients",
          "Local (STDIO) servers start as subprocesses; ensure proper process cleanup on disconnect",
          "Remote (HTTP) servers require proper authentication—MCP doesn't define auth, you must implement it",
          "Capability discovery happens once during initialization; server capabilities are cached"
        ]
      },
      {
        title: "Tools: Model-Controlled Actions",
        description: `Tools are the MCP equivalent of function calling. They enable the LLM to take actions in the outside world—querying databases, calling APIs, modifying files, or any other operation.

**Tool Lifecycle**:

1. **Discovery**: Client calls \`tools/list\` to get available tools with their schemas
2. **Selection**: LLM sees tool descriptions and decides when to use them
3. **Invocation**: Client calls \`tools/call\` with tool name and arguments
4. **Response**: Server executes the tool and returns results

\`\`\`python
from mcp.server import Server
from mcp.types import Tool, TextContent

server = Server("calculator")

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="calculate",
            description="Evaluate a mathematical expression",
            inputSchema={
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Math expression like '2 + 2' or 'sqrt(16)'"
                    }
                },
                "required": ["expression"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "calculate":
        import math
        # Safe evaluation with limited scope
        result = eval(arguments["expression"], {"__builtins__": {}}, vars(math))
        return [TextContent(type="text", text=str(result))]
    raise ValueError(f"Unknown tool: {name}")
\`\`\`

**Tool Schema Best Practices**:

- **Clear descriptions**: The LLM uses descriptions to decide when to call tools
- **Precise input schemas**: Use JSON Schema to define expected arguments
- **Required vs optional**: Mark truly required parameters as required
- **Enums for constrained values**: Use enum when only specific values are valid

**Error Handling**:

Tools can fail in two ways:
1. **Protocol errors**: Invalid request format, unknown tool (raise exception)
2. **Execution errors**: Tool ran but failed (return error in isError content)

\`\`\`python
@server.call_tool()
async def call_tool(name: str, arguments: dict):
    try:
        result = do_something(arguments)
        return [TextContent(type="text", text=result)]
    except ValueError as e:
        # Execution error - tool ran but failed
        return [TextContent(type="text", text=f"Error: {e}", isError=True)]
\`\`\`

**Tool Annotations**:

Tools can include hints about their behavior:
- \`readOnlyHint\`: Tool only reads data, doesn't modify
- \`destructiveHint\`: Tool may cause irreversible changes
- \`idempotentHint\`: Safe to retry on failure
- \`openWorldHint\`: Tool interacts with external world`,
        analogy: "Tools are like a waiter taking your order at a restaurant. The menu (tool list) shows what's available with descriptions. You (the LLM) decide what to order based on your needs. The waiter (client) carries your order to the kitchen (server), and the chef executes it and returns the dish (result).",
        gotchas: [
          "Tool names must be unique within a server—use namespacing for clarity",
          "Always validate inputs before execution, even if schema validation passed",
          "Long-running tools should provide progress notifications if possible",
          "Don't trust tool annotations (readOnlyHint, etc.) from untrusted servers"
        ]
      },
      {
        title: "Resources: Application-Controlled Data",
        description: `Resources expose data to AI applications. Unlike tools, resources are typically selected by the application or user, not autonomously by the model. They're ideal for providing context: file contents, database records, API responses, or any data the AI needs to understand.

**Resource URIs**:

Resources are identified by URIs, which can use any scheme:
- \`file:///path/to/document.txt\` - Local files
- \`postgres://db/table/row\` - Database records
- \`https://api.example.com/data\` - Remote APIs
- \`custom://my-app/resource\` - Application-specific

\`\`\`python
from mcp.server import Server
from mcp.types import Resource, TextResourceContents

server = Server("file-server")

@server.list_resources()
async def list_resources() -> list[Resource]:
    """List available resources."""
    import os
    resources = []
    for filename in os.listdir("/documents"):
        resources.append(Resource(
            uri=f"file:///documents/{filename}",
            name=filename,
            description=f"Document: {filename}",
            mimeType="text/plain"
        ))
    return resources

@server.read_resource()
async def read_resource(uri: str) -> TextResourceContents:
    """Read a resource's contents."""
    if uri.startswith("file:///documents/"):
        path = uri.replace("file://", "")
        with open(path) as f:
            return TextResourceContents(
                uri=uri,
                mimeType="text/plain",
                text=f.read()
            )
    raise ValueError(f"Unknown resource: {uri}")
\`\`\`

**Resource Templates**:

For dynamic resources, use URI templates:

\`\`\`python
@server.list_resource_templates()
async def list_templates() -> list[ResourceTemplate]:
    return [
        ResourceTemplate(
            uriTemplate="db://users/{user_id}",
            name="User Record",
            description="Fetch user by ID"
        )
    ]
\`\`\`

**Subscriptions**:

Servers can support resource subscriptions for real-time updates:

\`\`\`python
# Client subscribes
await client.request("resources/subscribe", {"uri": "file:///config.json"})

# Server sends notification when resource changes
server.notification("notifications/resources/updated", {
    "uri": "file:///config.json"
})
\`\`\`

**Content Types**:

Resources can return different content types:
- \`TextResourceContents\`: Plain text or markdown
- \`BlobResourceContents\`: Binary data (base64 encoded)

Choose based on the resource's nature—text for documents, blob for images or binaries.`,
        analogy: "Resources are like a library's catalog system. The catalog (list) shows what's available. You (the application) can browse and select specific books (resources). The librarian (server) retrieves the book and hands you the contents (read). You can also request notifications when a book is updated (subscriptions).",
        gotchas: [
          "Resource URIs should be stable—don't use URIs that change frequently",
          "Large resources should be paginated or streamed to avoid memory issues",
          "Subscriptions are optional; check server capabilities before subscribing",
          "Consider security: resource access should respect user permissions"
        ]
      },
      {
        title: "Prompts: User-Controlled Templates",
        description: `Prompts are reusable message templates that users explicitly invoke. Unlike tools (model-controlled) and resources (application-controlled), prompts are user-controlled—the user chooses when to use them, typically through slash commands or UI buttons.

**Common Use Cases**:
- Code review templates: "/review this code for security issues"
- Document summarization: "/summarize with key points"
- Translation workflows: "/translate to Spanish"
- Report generation: "/generate weekly report"

\`\`\`python
from mcp.server import Server
from mcp.types import Prompt, PromptMessage, PromptArgument, TextContent

server = Server("writing-assistant")

@server.list_prompts()
async def list_prompts() -> list[Prompt]:
    return [
        Prompt(
            name="code-review",
            description="Review code for bugs, security issues, and best practices",
            arguments=[
                PromptArgument(
                    name="code",
                    description="The code to review",
                    required=True
                ),
                PromptArgument(
                    name="focus",
                    description="Specific focus area (security, performance, style)",
                    required=False
                )
            ]
        ),
        Prompt(
            name="explain",
            description="Explain code or concept in simple terms",
            arguments=[
                PromptArgument(
                    name="subject",
                    description="What to explain",
                    required=True
                ),
                PromptArgument(
                    name="audience",
                    description="Target audience level (beginner, intermediate, expert)",
                    required=False
                )
            ]
        )
    ]

@server.get_prompt()
async def get_prompt(name: str, arguments: dict) -> list[PromptMessage]:
    if name == "code-review":
        focus_text = f" with focus on {arguments['focus']}" if arguments.get('focus') else ""
        return [
            PromptMessage(
                role="user",
                content=TextContent(
                    type="text",
                    text=f"""Please review the following code{focus_text}.

Look for:
- Bugs and potential errors
- Security vulnerabilities
- Performance issues
- Code style and best practices

Code to review:
\`\`\`
{arguments['code']}
\`\`\`"""
                )
            )
        ]
    # Handle other prompts...
\`\`\`

**Prompt Arguments**:

Arguments make prompts flexible:
- **Required arguments**: Must be provided by the user
- **Optional arguments**: Have sensible defaults
- **Completion support**: Servers can provide argument auto-completion

\`\`\`python
@server.complete_argument()
async def complete_argument(
    prompt_name: str,
    argument_name: str,
    value: str
) -> list[str]:
    """Provide auto-completion for prompt arguments."""
    if prompt_name == "code-review" and argument_name == "focus":
        options = ["security", "performance", "style", "testing", "documentation"]
        return [o for o in options if o.startswith(value.lower())]
    return []
\`\`\`

**Multi-Turn Prompts**:

Prompts can return multiple messages for complex workflows:

\`\`\`python
return [
    PromptMessage(role="user", content=TextContent(type="text", text="...")),
    PromptMessage(role="assistant", content=TextContent(type="text", text="...")),
    PromptMessage(role="user", content=TextContent(type="text", text="..."))
]
\`\`\`

This pre-fills the conversation, useful for few-shot examples or structured workflows.`,
        analogy: "Prompts are like form letters with fill-in-the-blank sections. The office (server) maintains a library of letter templates (prompts). When you (the user) need to send a letter, you select a template (list prompts), fill in the specific details (arguments), and the office generates the complete letter (get prompt). You choose which template to use—the system doesn't decide for you.",
        gotchas: [
          "Prompts are user-initiated, not model-initiated—don't confuse with tools",
          "Arguments support completion for better UX—implement when possible",
          "Multi-turn prompts can include assistant messages for few-shot examples",
          "Keep prompts focused—one prompt per workflow, not mega-prompts"
        ]
      },
      {
        title: "Protocol Lifecycle and Messages",
        description: `MCP communication follows a defined lifecycle with specific message patterns. Understanding this flow is essential for debugging and building robust integrations.

**Initialization Handshake**:

Every MCP connection starts with an initialization sequence:

\`\`\`
Client                              Server
   │                                   │
   │──────── initialize ──────────────▶│
   │         {protocolVersion,         │
   │          capabilities,            │
   │          clientInfo}              │
   │                                   │
   │◀─────── result ──────────────────│
   │         {protocolVersion,         │
   │          capabilities,            │
   │          serverInfo}              │
   │                                   │
   │──────── initialized ─────────────▶│
   │         (notification)            │
   │                                   │
\`\`\`

**Capability Declaration**:

Capabilities determine available features:

\`\`\`python
# Server capabilities
{
    "capabilities": {
        "tools": {},                    # Server provides tools
        "resources": {
            "subscribe": True,          # Supports subscriptions
            "listChanged": True         # Notifies on list changes
        },
        "prompts": {
            "listChanged": True
        },
        "logging": {}                   # Supports logging
    }
}

# Client capabilities
{
    "capabilities": {
        "roots": {                      # Can provide root URIs
            "listChanged": True
        },
        "sampling": {}                  # Can sample from LLM
    }
}
\`\`\`

**Message Types**:

MCP defines several message patterns:

1. **Requests**: Expect a response (tools/call, resources/read)
2. **Responses**: Reply to requests (result or error)
3. **Notifications**: Fire-and-forget (initialized, resource/updated)

\`\`\`json
// Request
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "get_weather",
        "arguments": {"location": "London"}
    }
}

// Success Response
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "content": [{"type": "text", "text": "Sunny, 72°F"}]
    }
}

// Error Response
{
    "jsonrpc": "2.0",
    "id": 1,
    "error": {
        "code": -32602,
        "message": "Invalid params: location required"
    }
}

// Notification (no id, no response expected)
{
    "jsonrpc": "2.0",
    "method": "notifications/resources/updated",
    "params": {"uri": "file:///config.json"}
}
\`\`\`

**Standard Error Codes**:

| Code | Name | Meaning |
|------|------|---------|
| -32700 | ParseError | Invalid JSON |
| -32600 | InvalidRequest | Not valid JSON-RPC |
| -32601 | MethodNotFound | Unknown method |
| -32602 | InvalidParams | Invalid parameters |
| -32603 | InternalError | Server error |

**Graceful Shutdown**:

Proper shutdown ensures clean resource cleanup:

\`\`\`python
# Client initiates shutdown
await client.request("shutdown", {})

# Server acknowledges and can clean up
# Connection closes gracefully
\`\`\``,
        analogy: "The MCP lifecycle is like diplomatic protocol between two nations. First, diplomats exchange credentials (initialization) and agree on languages and protocols they both speak (capabilities). Then they conduct business through formal communiqués (requests/responses) and can send urgent bulletins (notifications). Finally, they formally close the embassy when relations end (shutdown).",
        gotchas: [
          "Protocol version must be compatible—check during initialization",
          "Capabilities are immutable after initialization; restart to change",
          "Notifications have no response—don't wait for one",
          "Always correlate responses by ID; don't assume order"
        ]
      },
      {
        title: "Security Best Practices",
        description: `MCP operates in a high-stakes environment where LLMs can trigger real-world actions. Security must be considered at every layer—from protocol design to individual tool implementation.

**Trust Boundaries**:

MCP establishes clear trust relationships:

\`\`\`
┌─────────────────────────────────────────┐
│  User (Ultimate Authority)              │
│  • Approves sensitive operations        │
│  • Selects which servers to trust       │
│  • Reviews tool inputs before execution │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  Host (Trust Manager)                   │
│  • Validates server capabilities        │
│  • Enforces user permissions            │
│  • Mediates all communication           │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  Server (Capability Provider)           │
│  • Only exposes declared capabilities   │
│  • Validates all inputs                 │
│  • Respects resource boundaries         │
└─────────────────────────────────────────┘
\`\`\`

**Input Validation**:

Never trust inputs from any source:

\`\`\`python
@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "read_file":
        path = arguments.get("path", "")

        # Validate path is within allowed directory
        allowed_dir = "/safe/directory"
        full_path = os.path.abspath(os.path.join(allowed_dir, path))
        if not full_path.startswith(allowed_dir):
            raise ValueError("Access denied: path outside allowed directory")

        # Validate path exists and is a file
        if not os.path.isfile(full_path):
            raise ValueError("File not found")

        # Validate file size
        if os.path.getsize(full_path) > 10_000_000:  # 10MB
            raise ValueError("File too large")

        with open(full_path) as f:
            return [TextContent(type="text", text=f.read())]
\`\`\`

**Human-in-the-Loop**:

For sensitive operations, require explicit user confirmation:

\`\`\`python
# In host application
async def execute_tool(tool_call):
    # Show user what will be executed
    if tool_call.name in SENSITIVE_TOOLS:
        confirmed = await show_confirmation_dialog(
            f"Execute {tool_call.name}?",
            f"Arguments: {tool_call.arguments}"
        )
        if not confirmed:
            return {"error": "User declined"}

    return await client.call_tool(tool_call)
\`\`\`

**Secrets Management**:

Never expose secrets in tool outputs or logs:

\`\`\`python
# Bad: Secret in tool response
return [TextContent(type="text", text=f"API key: {api_key}")]

# Good: Redact sensitive data
return [TextContent(type="text", text=f"API key: ***{api_key[-4:]}")]

# Better: Don't return secrets at all
return [TextContent(type="text", text="API key configured successfully")]
\`\`\`

**Sandboxing Recommendations**:

- Run untrusted servers in containers or VMs
- Use network isolation for local servers
- Implement resource quotas (CPU, memory, time)
- Audit all server communications

**Authentication for Remote Servers**:

MCP doesn't define authentication—implement it at the transport layer:

\`\`\`python
# Example: OAuth2 bearer token
headers = {"Authorization": f"Bearer {token}"}
transport = HttpTransport(url, headers=headers)
\`\`\``,
        analogy: "MCP security is like airport security. There are multiple checkpoints (validation layers). Passengers (requests) show ID at several points (authentication). Certain items trigger additional screening (sensitive operations). A human agent (user) makes final decisions on flagged cases. No one trusts anyone implicitly—verification happens at every step.",
        gotchas: [
          "Never trust tool annotations (readOnlyHint) from untrusted servers",
          "Validate inputs even if JSON Schema validation passed",
          "Show tool inputs to users before execution for transparency",
          "Implement rate limiting and timeouts to prevent abuse",
          "Log all tool executions for audit purposes"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Complete MCP Server with Tools and Resources",
        language: "python",
        category: "basic",
        code: `"""
Complete MCP Server Example
Demonstrates tools, resources, and proper error handling
"""
from mcp.server import Server
from mcp.types import (
    Tool, Resource, TextContent, TextResourceContents
)
import json
import os

# Create server instance
server = Server("demo-server")

# ============================================================
# TOOLS
# ============================================================

@server.list_tools()
async def list_tools() -> list[Tool]:
    """List all available tools."""
    return [
        Tool(
            name="echo",
            description="Echo back the input message",
            inputSchema={
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "Message to echo"
                    }
                },
                "required": ["message"]
            }
        ),
        Tool(
            name="word_count",
            description="Count words in text",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Text to count words in"
                    }
                },
                "required": ["text"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool invocations."""
    if name == "echo":
        return [TextContent(
            type="text",
            text=arguments.get("message", "")
        )]

    elif name == "word_count":
        text = arguments.get("text", "")
        count = len(text.split())
        return [TextContent(
            type="text",
            text=json.dumps({"word_count": count})
        )]

    raise ValueError(f"Unknown tool: {name}")

# ============================================================
# RESOURCES
# ============================================================

# Sample in-memory data
SAMPLE_DOCS = {
    "readme": "# Welcome\\nThis is a demo MCP server.",
    "config": '{"version": "1.0", "debug": false}'
}

@server.list_resources()
async def list_resources() -> list[Resource]:
    """List available resources."""
    return [
        Resource(
            uri=f"memory://docs/{name}",
            name=name,
            mimeType="text/plain" if name == "readme" else "application/json"
        )
        for name in SAMPLE_DOCS.keys()
    ]

@server.read_resource()
async def read_resource(uri: str) -> TextResourceContents:
    """Read a resource by URI."""
    if uri.startswith("memory://docs/"):
        name = uri.split("/")[-1]
        if name in SAMPLE_DOCS:
            return TextResourceContents(
                uri=uri,
                mimeType="text/plain",
                text=SAMPLE_DOCS[name]
            )
    raise ValueError(f"Resource not found: {uri}")

# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import asyncio
    asyncio.run(server.run())`,
        explanation: "A complete MCP server demonstrating both tools (echo, word_count) and resources (in-memory documents). This pattern shows proper separation of concerns and error handling."
      },
      {
        title: "MCP Server with Prompts",
        language: "python",
        category: "intermediate",
        code: `"""
MCP Server with Prompt Templates
Demonstrates user-controlled prompts with arguments
"""
from mcp.server import Server
from mcp.types import (
    Prompt, PromptMessage, PromptArgument, TextContent
)

server = Server("prompt-server")

# ============================================================
# PROMPTS
# ============================================================

@server.list_prompts()
async def list_prompts() -> list[Prompt]:
    """List available prompt templates."""
    return [
        Prompt(
            name="code-review",
            description="Review code for issues and improvements",
            arguments=[
                PromptArgument(
                    name="code",
                    description="The code to review",
                    required=True
                ),
                PromptArgument(
                    name="language",
                    description="Programming language (python, javascript, etc.)",
                    required=False
                ),
                PromptArgument(
                    name="focus",
                    description="Focus area: security, performance, or style",
                    required=False
                )
            ]
        ),
        Prompt(
            name="explain-error",
            description="Explain an error message and suggest fixes",
            arguments=[
                PromptArgument(
                    name="error",
                    description="The error message",
                    required=True
                ),
                PromptArgument(
                    name="context",
                    description="Additional context about what you were doing",
                    required=False
                )
            ]
        ),
        Prompt(
            name="write-tests",
            description="Generate unit tests for code",
            arguments=[
                PromptArgument(
                    name="code",
                    description="The code to write tests for",
                    required=True
                ),
                PromptArgument(
                    name="framework",
                    description="Test framework (pytest, jest, etc.)",
                    required=False
                )
            ]
        )
    ]

@server.get_prompt()
async def get_prompt(name: str, arguments: dict) -> list[PromptMessage]:
    """Generate prompt messages from template."""

    if name == "code-review":
        language = arguments.get("language", "the provided")
        focus = arguments.get("focus", "general quality")
        code = arguments["code"]

        return [PromptMessage(
            role="user",
            content=TextContent(
                type="text",
                text=f"""Please review the following {language} code with a focus on {focus}.

Analyze the code for:
1. Potential bugs or errors
2. Security vulnerabilities
3. Performance issues
4. Code style and best practices
5. Suggestions for improvement

Code to review:
\`\`\`{language}
{code}
\`\`\`

Provide your review with specific line references and actionable suggestions."""
            )
        )]

    elif name == "explain-error":
        error = arguments["error"]
        context = arguments.get("context", "No additional context provided")

        return [PromptMessage(
            role="user",
            content=TextContent(
                type="text",
                text=f"""I encountered this error and need help understanding it:

**Error:**
\`\`\`
{error}
\`\`\`

**Context:** {context}

Please:
1. Explain what this error means
2. Identify the likely cause
3. Suggest specific steps to fix it
4. Explain how to prevent it in the future"""
            )
        )]

    elif name == "write-tests":
        code = arguments["code"]
        framework = arguments.get("framework", "pytest")

        return [PromptMessage(
            role="user",
            content=TextContent(
                type="text",
                text=f"""Please write comprehensive unit tests for the following code using {framework}.

**Code to test:**
\`\`\`
{code}
\`\`\`

Requirements:
1. Test all public functions/methods
2. Include edge cases and error conditions
3. Use descriptive test names
4. Add comments explaining what each test verifies
5. Follow {framework} best practices"""
            )
        )]

    raise ValueError(f"Unknown prompt: {name}")

# Argument completion for better UX
@server.complete_argument()
async def complete_argument(
    prompt_name: str,
    argument_name: str,
    value: str
) -> list[str]:
    """Provide auto-completion for prompt arguments."""

    if argument_name == "language":
        languages = ["python", "javascript", "typescript", "go", "rust", "java"]
        return [l for l in languages if l.startswith(value.lower())]

    if argument_name == "focus":
        focuses = ["security", "performance", "style", "testing", "documentation"]
        return [f for f in focuses if f.startswith(value.lower())]

    if argument_name == "framework":
        frameworks = ["pytest", "jest", "mocha", "junit", "go test"]
        return [f for f in frameworks if f.lower().startswith(value.lower())]

    return []

if __name__ == "__main__":
    import asyncio
    asyncio.run(server.run())`,
        explanation: "A server focused on prompt templates for developer workflows. Demonstrates argument handling, completion support, and structured prompt generation."
      },
      {
        title: "Production MCP Server with Logging and Monitoring",
        language: "python",
        category: "advanced",
        code: `"""
Production-Ready MCP Server
Full example with logging, error handling, and monitoring
"""
from mcp.server import Server
from mcp.types import (
    Tool, Resource, Prompt,
    TextContent, TextResourceContents,
    PromptMessage, PromptArgument
)
import logging
import json
import time
from functools import wraps
from typing import Callable, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("mcp-server")

# ============================================================
# MONITORING & METRICS
# ============================================================

class Metrics:
    def __init__(self):
        self.tool_calls = {}
        self.resource_reads = {}
        self.errors = []
        self.start_time = time.time()

    def record_tool_call(self, name: str, duration: float, success: bool):
        if name not in self.tool_calls:
            self.tool_calls[name] = {"count": 0, "errors": 0, "total_time": 0}
        self.tool_calls[name]["count"] += 1
        self.tool_calls[name]["total_time"] += duration
        if not success:
            self.tool_calls[name]["errors"] += 1

    def record_resource_read(self, uri: str):
        self.resource_reads[uri] = self.resource_reads.get(uri, 0) + 1

    def record_error(self, error: str):
        self.errors.append({
            "error": error,
            "timestamp": time.time()
        })

    def get_summary(self) -> dict:
        return {
            "uptime_seconds": time.time() - self.start_time,
            "tool_calls": self.tool_calls,
            "resource_reads": self.resource_reads,
            "recent_errors": self.errors[-10:]
        }

metrics = Metrics()

# Decorator for tool instrumentation
def instrumented_tool(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(name: str, arguments: dict) -> Any:
        start = time.time()
        success = True
        try:
            result = await func(name, arguments)
            logger.info(f"Tool {name} executed successfully")
            return result
        except Exception as e:
            success = False
            logger.error(f"Tool {name} failed: {e}")
            metrics.record_error(str(e))
            raise
        finally:
            duration = time.time() - start
            metrics.record_tool_call(name, duration, success)
    return wrapper

# ============================================================
# SERVER SETUP
# ============================================================

server = Server(
    "production-server",
    version="1.0.0"
)

# ============================================================
# TOOLS
# ============================================================

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_documents",
            description="Search documents by keyword",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Max results (default 10)",
                        "default": 10
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="get_metrics",
            description="Get server metrics and statistics",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="process_data",
            description="Process structured data",
            inputSchema={
                "type": "object",
                "properties": {
                    "data": {
                        "type": "object",
                        "description": "Data to process"
                    },
                    "operation": {
                        "type": "string",
                        "enum": ["validate", "transform", "summarize"],
                        "description": "Operation to perform"
                    }
                },
                "required": ["data", "operation"]
            }
        )
    ]

@server.call_tool()
@instrumented_tool
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls with full error handling."""

    if name == "search_documents":
        query = arguments.get("query", "")
        limit = arguments.get("limit", 10)

        # Validate inputs
        if not query.strip():
            return [TextContent(
                type="text",
                text=json.dumps({"error": "Query cannot be empty"}),
                isError=True
            )]

        if limit > 100:
            limit = 100  # Cap results

        # Simulate search (replace with real implementation)
        results = [
            {"title": f"Document {i}", "relevance": 0.9 - i*0.1}
            for i in range(min(limit, 5))
        ]

        return [TextContent(
            type="text",
            text=json.dumps({
                "query": query,
                "results": results,
                "total": len(results)
            }, indent=2)
        )]

    elif name == "get_metrics":
        return [TextContent(
            type="text",
            text=json.dumps(metrics.get_summary(), indent=2)
        )]

    elif name == "process_data":
        data = arguments.get("data", {})
        operation = arguments.get("operation", "validate")

        try:
            if operation == "validate":
                result = {"valid": True, "fields": list(data.keys())}
            elif operation == "transform":
                result = {k: str(v).upper() for k, v in data.items()}
            elif operation == "summarize":
                result = {
                    "field_count": len(data),
                    "fields": list(data.keys()),
                    "total_size": len(json.dumps(data))
                }
            else:
                return [TextContent(
                    type="text",
                    text=json.dumps({"error": f"Unknown operation: {operation}"}),
                    isError=True
                )]

            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2)
            )]
        except Exception as e:
            logger.error(f"process_data failed: {e}")
            return [TextContent(
                type="text",
                text=json.dumps({"error": str(e)}),
                isError=True
            )]

    raise ValueError(f"Unknown tool: {name}")

# ============================================================
# RESOURCES
# ============================================================

CONFIG = {
    "version": "1.0.0",
    "features": ["search", "process", "metrics"],
    "limits": {"max_query_length": 1000, "max_results": 100}
}

@server.list_resources()
async def list_resources() -> list[Resource]:
    return [
        Resource(
            uri="config://server/settings",
            name="Server Configuration",
            description="Current server settings and limits",
            mimeType="application/json"
        ),
        Resource(
            uri="stats://server/metrics",
            name="Server Metrics",
            description="Real-time server statistics",
            mimeType="application/json"
        )
    ]

@server.read_resource()
async def read_resource(uri: str) -> TextResourceContents:
    metrics.record_resource_read(uri)

    if uri == "config://server/settings":
        return TextResourceContents(
            uri=uri,
            mimeType="application/json",
            text=json.dumps(CONFIG, indent=2)
        )

    if uri == "stats://server/metrics":
        return TextResourceContents(
            uri=uri,
            mimeType="application/json",
            text=json.dumps(metrics.get_summary(), indent=2)
        )

    raise ValueError(f"Resource not found: {uri}")

# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import asyncio
    logger.info("Starting production MCP server...")
    asyncio.run(server.run())`,
        explanation: "A production-ready server with comprehensive logging, metrics collection, and error handling. Shows patterns for monitoring, instrumentation, and graceful error responses."
      }
    ],

    diagrams: [
      {
        title: "MCP Message Flow",
        type: "mermaid",
        mermaid: `sequenceDiagram
    participant U as User
    participant H as Host
    participant C as Client
    participant S as Server

    Note over C,S: Initialization
    C->>S: initialize
    S-->>C: capabilities
    C->>S: initialized

    Note over U,H: Tool Discovery
    H->>C: Get available tools
    C->>S: tools/list
    S-->>C: [tool definitions]
    C-->>H: Tool list

    Note over U,H: Tool Invocation
    U->>H: Query requiring tool
    H->>C: Call weather tool
    C->>S: tools/call
    S-->>C: Tool result
    C-->>H: Result
    H-->>U: Response`,
        caption: "Complete message flow from user query through tool invocation and response."
      },
      {
        title: "MCP Primitives Comparison",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Tools["Tools (Model-Controlled)"]
        T1["LLM decides when to call"]
        T2["Execute actions"]
        T3["Return structured results"]
    end

    subgraph Resources["Resources (App-Controlled)"]
        R1["App selects what to expose"]
        R2["Read-only data access"]
        R3["Support subscriptions"]
    end

    subgraph Prompts["Prompts (User-Controlled)"]
        P1["User explicitly invokes"]
        P2["Message templates"]
        P3["Arguments filled by user"]
    end

    LLM["Language Model"] --> Tools
    APP["Application"] --> Resources
    USER["User"] --> Prompts

    style Tools fill:#e3f2fd
    style Resources fill:#f3e5f5
    style Prompts fill:#e8f5e9`,
        caption: "The three MCP primitives differ in who controls their invocation: model, application, or user."
      },
      {
        title: "MCP Transport Options",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph STDIO["STDIO Transport"]
        L1["Host spawns server process"]
        L2["Communicate via stdin/stdout"]
        L3["Local only, simple setup"]
    end

    subgraph HTTP["HTTP + SSE Transport"]
        H1["Server runs as web service"]
        H2["POST requests, SSE responses"]
        H3["Remote capable, scalable"]
    end

    CLIENT["MCP Client"] --> STDIO
    CLIENT --> HTTP

    STDIO --> LOCAL["Local Tools<br/>(Files, System)"]
    HTTP --> REMOTE["Remote Services<br/>(APIs, Cloud)"]

    style STDIO fill:#fff3e0
    style HTTP fill:#e0f7fa`,
        caption: "STDIO for local servers (simple, secure), HTTP+SSE for remote services (scalable, networkable)."
      }
    ],

    keyTakeaways: [
      "MCP standardizes AI-to-tool communication with a 'USB-C for AI' approach—build once, integrate everywhere",
      "The three-tier architecture (Host → Client → Server) enables clean separation and independent scaling",
      "Tools are model-controlled actions, Resources are app-controlled data, Prompts are user-controlled templates",
      "JSON-RPC 2.0 transport works over STDIO (local) or HTTP+SSE (remote) with the same message format",
      "Capability negotiation during initialization ensures compatibility and enables graceful feature degradation",
      "Security requires defense in depth: input validation, user confirmation, sandboxing, and audit logging"
    ],

    resources: [
      {
        title: "MCP Specification",
        url: "https://spec.modelcontextprotocol.io/",
        type: "docs",
        description: "The complete official MCP specification with protocol details",
        summaryPath: "data/day-19/summary-mcp-specification.md"
      },
      {
        title: "MCP Python SDK",
        url: "https://github.com/modelcontextprotocol/python-sdk",
        type: "github",
        description: "Official Python SDK for building MCP servers and clients",
        summaryPath: "data/day-19/summary-mcp-python-sdk.md"
      },
      {
        title: "MCP TypeScript SDK",
        url: "https://github.com/modelcontextprotocol/typescript-sdk",
        type: "github",
        description: "Official TypeScript SDK for building MCP servers and clients",
        summaryPath: "data/day-19/summary-mcp-typescript-sdk.md"
      },
      {
        title: "MCP Servers Repository",
        url: "https://github.com/modelcontextprotocol/servers",
        type: "github",
        description: "Collection of reference MCP server implementations"
      },
      {
        title: "Building Your First MCP Server",
        url: "https://modelcontextprotocol.io/docs/first-server/python",
        type: "tutorial",
        description: "Step-by-step guide to creating an MCP server"
      }
    ],

    faq: [
      {
        question: "How does MCP differ from OpenAI function calling?",
        answer: "Function calling is a feature within a single API (OpenAI's). MCP is a cross-platform protocol that works with any AI provider. Think of function calling as the 'tool use' capability of one service, while MCP standardizes how tools are discovered, described, and invoked across all AI applications. MCP also adds Resources and Prompts as first-class primitives."
      },
      {
        question: "Can I use MCP with models other than Claude?",
        answer: "Yes! MCP is model-agnostic. While Anthropic created MCP, any AI application can implement MCP client support. The protocol doesn't depend on any specific model's capabilities. You need a host application that supports MCP (like VS Code with extensions, or a custom app you build), but the underlying model can be from any provider."
      },
      {
        question: "What's the difference between STDIO and HTTP transport?",
        answer: "STDIO transport runs the server as a subprocess, communicating via stdin/stdout. It's simple, secure (no network exposure), and ideal for local tools like file access. HTTP transport runs the server as a web service with HTTP POST requests and Server-Sent Events for notifications. It enables remote servers and horizontal scaling but requires proper authentication."
      },
      {
        question: "How do I secure my MCP server?",
        answer: "Defense in depth: 1) Validate all inputs thoroughly, 2) Run servers in sandboxed environments for untrusted code, 3) Implement rate limiting and timeouts, 4) For HTTP, add authentication at the transport layer, 5) Log all operations for auditing, 6) Never trust tool annotations from untrusted sources, 7) Show users what tools will do before execution."
      },
      {
        question: "When should I use a Tool vs a Resource vs a Prompt?",
        answer: "Use Tools when the LLM should autonomously decide when to take an action (call API, execute code). Use Resources when the application needs to expose data for context (files, database records). Use Prompts when users should explicitly invoke a workflow (code review, summarization). The key distinction is who controls invocation: model, app, or user."
      },
      {
        question: "How do I debug MCP communication?",
        answer: "Since MCP uses JSON-RPC, all messages are human-readable. 1) Enable logging in your server to see all requests/responses, 2) Use the MCP Inspector tool for interactive debugging, 3) For STDIO, you can intercept stdin/stdout, 4) For HTTP, use standard HTTP debugging tools. Check the protocol version and capability negotiation first when debugging connection issues."
      }
    ],

    applications: [
      {
        title: "IDE Code Assistants",
        description: "VS Code, Cursor, and Zed use MCP to connect AI assistants with project files, terminal access, and language server features. This enables context-aware code completion, refactoring, and debugging."
      },
      {
        title: "Local File and System Access",
        description: "MCP servers can provide safe, controlled access to local file systems, allowing AI assistants to read documentation, configuration files, and source code without exposing the entire system."
      },
      {
        title: "Database Integration",
        description: "Connect AI to databases through MCP servers that expose schema information, run queries, and return results. Enables natural language database interaction with proper access controls."
      },
      {
        title: "API Integration Layer",
        description: "Wrap external APIs in MCP servers to give AI assistants access to weather data, stock prices, CRM systems, or any web service through a standardized interface."
      },
      {
        title: "Custom Enterprise Tools",
        description: "Build internal MCP servers that connect AI to enterprise systems—ticketing, documentation, analytics—enabling AI assistants to work within existing business workflows."
      }
    ],

    relatedDays: [2, 8, 20]
  }
};
