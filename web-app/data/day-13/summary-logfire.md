# Pydantic Logfire - Summary

## What is Logfire?

Pydantic Logfire is an observability platform built by the Pydantic team, designed for debugging and monitoring Python applications. It provides automatic instrumentation for PydanticAI agents, capturing the full execution trace without manual setup.

## Key Features

### Automatic PydanticAI Integration
- Two-line setup: `logfire.configure()` and `logfire.instrument_pydantic_ai()`
- Captures all LLM requests, tool calls, and validation events
- Zero-code instrumentation for complete agent visibility

### Captured Data
- **LLM Calls**: Prompts, responses, model parameters, token usage
- **Tool Invocations**: Function names, arguments, return values, duration
- **Validation Events**: Schema violations, retry attempts, error messages
- **Performance Metrics**: Latency, token counts, cost estimates

### Built on OpenTelemetry
- Export traces to any OpenTelemetry-compatible backend
- Works with Jaeger, Datadog, Honeycomb, and other observability tools
- Fits into existing enterprise monitoring infrastructure

## Why It Matters for PydanticAI

Debugging agents is notoriously difficult because:
1. LLM behavior is non-deterministic
2. Tool chains can fail at any step
3. Validation failures are hard to trace

Logfire solves this by showing the complete execution path, making it trivial to understand why an agent behaved unexpectedly.

## Quick Start

```python
import logfire
from pydantic_ai import Agent

# Enable tracing
logfire.configure()
logfire.instrument_pydantic_ai()

# All agent activity is now traced
agent = Agent('openai:gpt-4o')
result = agent.run_sync("Hello!")
```

## Pricing

Logfire offers a free tier for development and scales with usage for production deployments.

## Links

- [Logfire Documentation](https://pydantic.dev/logfire)
- [PydanticAI Logfire Integration](https://ai.pydantic.dev/logfire/)
