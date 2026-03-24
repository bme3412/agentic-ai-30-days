# What is Agent Communication Protocol? - IBM Summary

**Source**: [ibm.com/think/topics/agent-communication-protocol](https://www.ibm.com/think/topics/agent-communication-protocol)

## Definition

ACP is "an open standard for agent-to-agent communication" that enables AI agents to collaborate across different frameworks, technologies, and organizations. It transforms isolated agent systems into interconnected networks capable of discovering and collaborating with each other regardless of their underlying architecture.

## The Problem ACP Solves

Without standardization, integrating n agents requires n(n-1)/2 different integration points—exponential complexity. Each agent pair needs custom integration code, creating maintenance nightmares as agent ecosystems grow.

## Core Design Philosophy

**Simplicity as a Feature**: ACP uses REST-based HTTP protocols rather than JSON-RPC. This enables integration through standard tools like cURL, Postman, or browsers without requiring specialized SDKs.

## Key Technical Features

### REST-First Architecture
- Standard HTTP methods (GET, POST, DELETE)
- JSON payloads with well-known schemas
- Compatible with existing web infrastructure

### Offline Discovery
- Agents embed metadata in distribution packages
- Discovery works even when agents are scaled to zero
- Critical for cost-efficient cloud deployments

### Flexible Communication
- **Synchronous**: Request-response for quick operations
- **Asynchronous**: Fire-and-forget with polling or webhooks
- **Streaming**: Real-time updates via SSE/WebSocket

### Enterprise Security
- Capability tokens for decentralized authorization
- Kubernetes RBAC integration
- Token delegation for workflow patterns

## Comparison with Similar Protocols

### vs. MCP (Model Context Protocol)
- MCP enriches single-model context with tools and resources
- ACP enables peer-to-peer communication between independent agents
- They're complementary: MCP for tools, ACP for collaboration

### vs. A2A (Agent2Agent)
- A2A was Google's protocol, optimized for their ecosystem
- ACP emphasized vendor-neutral, open governance
- Both merged under Linux Foundation in September 2025

## Real-World Application

A manufacturing company's production scheduling agent can communicate with a logistics provider's shipping agent through ACP without custom integrations. Each organization wraps its agent with ACP standards, enabling direct communication while maintaining system autonomy.

## Governance

- Developed with open-source principles
- Donated to Linux Foundation immediately upon release
- Monthly community calls and GitHub discussions
- Apache 2.0 license
