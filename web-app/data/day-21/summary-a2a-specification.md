# A2A Protocol Specification Summary

## Overview

The Agent2Agent (A2A) Protocol is an open standard enabling communication between independent AI agents. It operates across three layers: a canonical data model, abstract operations, and protocol bindings (JSON-RPC, gRPC, HTTP+REST).

## Core Architecture

### Agent Cards
- JSON manifests served at `/.well-known/agent-card.json`
- Contain identity, capabilities, interfaces, security schemes, and skills
- Support extended cards (authentication-gated) and JWS signatures

### Task Lifecycle
Tasks are units of work with defined states:
- **TASK_STATE_SUBMITTED** - Task acknowledged
- **TASK_STATE_WORKING** - Processing
- **TASK_STATE_COMPLETED** - Success (terminal)
- **TASK_STATE_FAILED** - Error (terminal)
- **TASK_STATE_CANCELED** - User canceled (terminal)
- **TASK_STATE_REJECTED** - Agent declined (terminal)
- **TASK_STATE_INPUT_REQUIRED** - Needs clarification
- **TASK_STATE_AUTH_REQUIRED** - Needs authorization

### Messages and Parts
Messages contain Parts - atomic content units:
- **text** - Plain text
- **data** - Structured JSON
- **url** - Remote resources
- **raw** - Base64 binary

### Artifacts
Outputs produced by completed tasks, containing Parts with results.

## Communication Patterns

### Synchronous
Request-response for quick operations.

### Streaming (SSE)
Server-Sent Events for real-time updates during long-running tasks.

### Push Notifications
Webhook-based updates for background tasks spanning hours/days.

## Security

- HTTPS/TLS 1.3+ mandatory for production
- Multiple authentication schemes: API keys, OAuth2, OpenID Connect, mTLS
- Per-task authorization and mid-task credential requests
- Webhook URL validation and authentication

## Protocol Bindings

1. **JSON-RPC 2.0** - PascalCase methods over HTTP, SSE for streaming
2. **gRPC** - Protocol Buffers over HTTP/2
3. **HTTP+JSON/REST** - Standard HTTP verbs with resource-based URLs

## Key Concepts

- **Context IDs** group related tasks into conversations
- **Task references** enable multi-turn interactions
- **History management** via `historyLength` parameter
- **Capability negotiation** during discovery
