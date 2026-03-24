# ACP Technical Overview - WorkOS Summary

**Source**: [workos.com/blog/ibm-agent-communication-protocol-acp](https://workos.com/blog/ibm-agent-communication-protocol-acp)

## Message Format & Communication Patterns

ACP uses JSON-RPC over HTTP/WebSockets as its core transport with three communication modes:

### Synchronous
Plain HTTP POST returning JSON responses. Best for quick operations completing in seconds.

### Asynchronous
Fire-and-forget operations with taskId for polling or subscription. Suitable for longer operations where immediate response isn't needed.

### Streaming
Server pushes incremental delta messages over WebSockets/SSE. Optimized for long RAG chains and multi-step reasoning where users want visibility into progress.

## Agent Manifest Structure

Agents advertise a short manifest containing their capabilities. The server auto-indexes these manifests, enabling peer discovery of functions and schemas without manual configuration.

## Task Delegation & Routing

A structured message envelope carries:
- Task ID for tracking
- Metadata for context
- Optional stream channel for chunked or resumable work

## Stateful Sessions

Pre-alpha ACP includes persistent contexts allowing long-running planner agents to survive restarts. Session state includes:
- Conversation history
- Intermediate results
- User preferences
- Workflow state

## Agent Lifecycle Management

Agents progress through states:

```
INITIALIZING → ACTIVE → DEGRADED → RETIRING → RETIRED
```

Lifecycle metadata (version, createdBy, successorAgent) emits as OpenTelemetry spans for operational automation.

## Security: Capability Tokens

Unforgeable, signed objects that encode:
- Resource type
- Permitted operations
- Expiration time

ACP bridges Kubernetes RBAC, mapping capability claims to existing cluster roles.

## Quick Start with BeeAI

```bash
# Install
brew install i-am-bee/beeai/beeai
brew services start beeai

# Configure
beeai env setup  # Select: Ollama, OpenAI, or Together.ai

# Use
beeai list                    # enumerate agents
beeai run chat                # start reference agent
beeai compose sequential      # chain agents
```

## Observability

All calls are OTEL-instrumented. BeeAI ships traces to Arize Phoenix automatically, enabling SOC teams to audit agent interactions within existing monitoring pipelines.

## Available SDKs

- **acp-python-sdk**: Async clients, stream subscriptions, manifest validation
- **acp-typescript-sdk**: Equivalent TypeScript implementation
- **BeeAI CLI/UI**: Launch agents via `beeai run`; inspect at localhost:8333
