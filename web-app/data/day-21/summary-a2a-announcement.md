# A2A Announcement - Google Developers Blog Summary

## The Problem

Enterprises increasingly deploy AI agents across organizations, but these agents operate in silos. Without standardization, coordinating agents from different vendors requires custom integration code for every pair.

## A2A Solution

A2A enables agents built by different vendors and frameworks to:
- Discover each other's capabilities
- Communicate through standardized protocols
- Coordinate on complex tasks
- Exchange context and artifacts

## Five Design Principles

1. **Embrace agentic capabilities** - Natural, unstructured collaboration without shared memory/tools
2. **Build on existing standards** - HTTP, SSE, JSON-RPC for IT infrastructure compatibility
3. **Secure by default** - Enterprise-grade authentication with OpenAPI parity
4. **Support long-running tasks** - Real-time feedback for tasks spanning hours or days
5. **Modality agnostic** - Support for text, audio, and video streaming

## A2A + MCP Relationship

A2A complements Anthropic's Model Context Protocol (MCP):
- **MCP**: Provides tools and context to agents (agent ↔ tools)
- **A2A**: Enables agents to discover and coordinate with each other (agent ↔ agent)

They solve different problems and work together in production systems.

## Partner Ecosystem

**50+ launch partners** including:
- Platforms: Atlassian, Box, Cohere, Intuit, LangChain, MongoDB, PayPal, Salesforce, SAP, ServiceNow, Workday
- Services: Accenture, BCG, Capgemini, Cognizant, Deloitte, HCLTech, Infosys, KPMG, McKinsey, PwC, TCS, Wipro

Grew to **150+ organizations** within months of launch.

## Use Case: Candidate Sourcing

Example workflow:
1. Hiring manager's agent receives requirements
2. Delegates to sourcing agent to find candidates
3. Coordinates with scheduling agent for interviews
4. Integrates with background check agent
5. Unified interface throughout the process

## Governance

- Apache 2.0 license
- Linux Foundation governance
- Vendor-neutral design
- Open contribution model
