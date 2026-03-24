# ACP GitHub Repository Summary

**Source**: [github.com/i-am-bee/acp](https://github.com/i-am-bee/acp)

## Overview

The official ACP (Agent Communication Protocol) repository containing the protocol specification, OpenAPI schema, and reference implementations in Python and TypeScript.

## Repository Structure

- `/spec` - OpenAPI 3.0 specification defining all endpoints and schemas
- `/python` - Python SDK with async client, server framework, and Pydantic models
- `/typescript` - TypeScript SDK with full type definitions
- `/examples` - Sample agents and integration patterns
- `/docs` - Protocol documentation and architecture guides

## Key Endpoints (from OpenAPI spec)

### Discovery
- `GET /agents` - List all available agents with basic metadata
- `GET /agents/{name}` - Get full agent manifest including capabilities and schemas

### Runs
- `POST /runs` - Create a new run (execute an agent)
- `GET /runs/{id}` - Get run status and results
- `DELETE /runs/{id}` - Cancel a running task

### Sessions
- `GET /sessions/{id}` - Get session state and history
- `DELETE /sessions/{id}` - End a session

### Streaming
- `POST /runs` with `Accept: text/event-stream` - Stream run events via SSE

## Agent Manifest Schema

```json
{
  "name": "string",
  "description": "string",
  "version": "string",
  "author": "string",
  "capabilities": ["string"],
  "interfaces": {
    "sync": boolean,
    "async": boolean,
    "streaming": boolean
  },
  "inputSchema": { /* JSON Schema */ },
  "outputSchema": { /* JSON Schema */ }
}
```

## Message Schema

```json
{
  "role": "user | agent/{name} | system",
  "parts": [
    {
      "content": "string | base64",
      "content_type": "text/plain | application/json | image/png | ...",
      "content_encoding": "base64 | null",
      "content_url": "https://... | null"
    }
  ]
}
```

## Run States

- `PENDING` - Queued, not started
- `RUNNING` - Actively processing
- `COMPLETED` - Finished successfully
- `FAILED` - Encountered error
- `CANCELLED` - Terminated by request
- `AWAITING_INPUT` - Waiting for client response

## Key Design Decisions

1. **REST over JSON-RPC**: Standard HTTP methods for maximum compatibility
2. **Offline Discovery**: Manifests can be embedded in packages
3. **Multimodal Messages**: Support for text, images, JSON, and binary
4. **Stateful Sessions**: Persistent context across interactions
5. **OpenTelemetry Integration**: Built-in observability

## License

Apache 2.0 - Open source under Linux Foundation governance
