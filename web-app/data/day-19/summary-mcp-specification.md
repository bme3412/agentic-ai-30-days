# MCP Specification Summary

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that enables AI applications to connect with external data sources and tools through a unified interface. Think of it as "USB-C for AI" - a standardized way to plug any tool into any AI application.

## Core Architecture

### Three Components

1. **Hosts**: AI applications that want to access tools (e.g., Claude Desktop, VS Code, custom apps)
2. **Clients**: Protocol handlers within hosts that manage connections to servers
3. **Servers**: Services that provide tools, resources, and prompts

```
┌─────────────────────────────────────────┐
│  Host (e.g., Claude Desktop)            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ Client  │  │ Client  │  │ Client  │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  │
└───────┼───────────┼───────────┼─────────┘
        │           │           │
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │ Server │  │ Server │  │ Server │
   │ (File) │  │ (DB)   │  │ (API)  │
   └────────┘  └────────┘  └────────┘
```

## Three Primitives

### Tools (Model-Controlled)
Executable functions that the LLM can invoke:
- Discovered via `tools/list`
- Invoked via `tools/call`
- Return structured results

### Resources (Application-Controlled)
Contextual data exposed to the AI:
- Listed via `resources/list`
- Read via `resources/read`
- Support subscriptions for updates

### Prompts (User-Controlled)
Reusable message templates:
- Listed via `prompts/list`
- Retrieved via `prompts/get`
- Support argument substitution

## Protocol Details

- **Transport**: JSON-RPC 2.0 over STDIO (local) or HTTP with SSE (remote)
- **Initialization**: Capability negotiation handshake
- **Versioning**: Protocol version compatibility checking

## Key Resources

- [Full Specification](https://spec.modelcontextprotocol.io/)
- [Architecture Overview](https://modelcontextprotocol.io/docs/concepts/architecture)
- [Protocol Messages](https://spec.modelcontextprotocol.io/specification/basic/messages/)
