# BeeAI Platform - IBM Research Summary

**Source**: [research.ibm.com/blog/multiagent-bee-ai](https://research.ibm.com/blog/multiagent-bee-ai)

## Overview

BeeAI is an experimental platform from IBM Research for running and orchestrating AI agents. It's built on two complementary protocols:

- **MCP (Model Context Protocol)**: Standardizes how agents connect to tools and data
- **ACP (Agent Communication Protocol)**: Standardizes how agents communicate with each other

## Key Features

### Multi-Framework Support
Runs open-source AI agents regardless of their original framework or programming language. You can mix LangChain, CrewAI, AutoGen, and custom agents in the same workflow.

### Web-Based Access
Deploy agents with two CLI commands or a UI click. No complex infrastructure setup required for getting started.

### Agent Discovery and Orchestration
Streamlines finding, integrating, and coordinating agents. The platform indexes agent manifests for discovery and provides tools for composing multi-agent workflows.

## Available Agents

Popular open-source agents included:

- **Aider**: AI pair programming tool for code editing
- **GPT-Researcher**: Gathers and organizes research with citations
- **Podcast Agent**: Converts research into AI-optimized podcast structures

## Agent Communication Protocol

According to Kate Blair, director of product incubation at IBM Research:

> "ACP will act like a universal connector, providing a standardized way for agents to exchange information and interact with other systems."

The protocol addresses "inconsistent agent interfaces" and enables agents to:
- Discover each other's capabilities
- Delegate tasks appropriately
- Improve operability across frameworks

## Composition Modes

Agents can be configured to operate:

### Independently
Single agent handles the full task

### Sequentially
Output of one agent becomes input to the next

### In Parallel
Multiple agents process the same input simultaneously

### Hierarchically
A coordinator agent delegates to specialists

## Getting Started

```bash
# Install BeeAI
brew install i-am-bee/beeai/beeai

# Start the service
brew services start beeai

# Configure LLM provider
beeai env setup

# List available agents
beeai list

# Run an agent
beeai run gpt-researcher "Research topic"
```

## Integration with A2A

Following the September 2025 merger, BeeAI now supports both ACP and A2A protocols, providing backward compatibility while embracing the unified standard.
