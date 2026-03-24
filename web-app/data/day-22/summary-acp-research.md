# ACP Technical Deep Dive - IBM Research Summary

**Source**: [research.ibm.com/blog/agent-communication-protocol-ai](https://research.ibm.com/blog/agent-communication-protocol-ai)

## Protocol Architecture

ACP adopts a RESTful architecture implemented over HTTP, supporting both synchronous and asynchronous agent interactions. This design choice enables direct developer interaction using standard tools like curl, Postman, or web browsers.

## Communication Method

Unlike protocols requiring dedicated SDKs, ACP works with any HTTP client. The protocol uses JSON payloads with clearly defined schemas, making debugging and integration straightforward.

## Agent Discovery

ACP incorporates metadata capabilities allowing agents to "carry their own metadata so they can be found even in secure or air-gapped setups." This is essential for:

- Scale-to-zero deployments
- Air-gapped environments
- Cost-efficient cloud architectures

## Agent Interaction Models

The protocol supports two architectural patterns:

### Hierarchical
Traditional manager pattern where one agent orchestrates others. A coordinator receives requests and delegates to specialists.

### Peer-to-Peer
Agents interact as peers instead of through an intermediary. Any agent can initiate communication with any other agent, enabling more dynamic collaboration patterns.

## Integration with MCP

ACP complements Anthropic's Model Context Protocol at different stack layers:

| Layer | Protocol | Purpose |
|-------|----------|---------|
| Tool Access | MCP | Connect agents to databases, APIs, tools |
| Agent Collaboration | ACP | Connect agents to other agents |

A sophisticated system uses both: MCP gives each agent access to its tools, while ACP enables those agents to coordinate with each other.

## Early-Stage Technology

IBM Research notes this is early-stage technology with anticipated iterations as real-world deployment occurs. The protocol specification is evolving based on community feedback and production experience.

## Open Governance

As an open-source project with community-led governance, ACP includes:
- Monthly open community calls
- Active GitHub discussions
- Apache 2.0 licensing
- Linux Foundation stewardship
