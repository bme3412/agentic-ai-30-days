# OpenAI Agents SDK - Summary

> Source: [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-python/)

## Overview

The OpenAI Agents SDK is a lightweight, production-ready framework for building multi-agent AI systems. Launched in March 2025, it evolved from OpenAI's experimental Swarm project with a focus on minimal abstractions and maximum control.

## Design Philosophy

**"Enough features to be worth using, but few enough primitives to make it quick to learn."**

The SDK intentionally omits:
- Graph-based workflow engines
- Built-in vector memory
- Opinionated planning systems

Instead, it provides building blocks that compose however you need.

## Four Core Primitives

### 1. Agents
LLMs equipped with instructions and tools.

```python
from agents import Agent

agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant.",
    model="gpt-4o",
    tools=[my_tool]
)
```

### 2. Tools
Plain Python functions with automatic schema generation from type hints.

```python
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"Weather in {city}: 72°F, Sunny"
```

No decorators or registration code required. Type hints become the schema; docstrings become descriptions.

### 3. Handoffs
Functions that return another agent, enabling conversation transfer.

```python
def transfer_to_billing():
    """Transfer to billing for payment questions."""
    return billing_agent
```

Context is preserved automatically during handoffs.

### 4. Guardrails
Input and output validation to constrain agent behavior.

```python
async def block_injection(input_text: str) -> GuardrailResult:
    if "ignore previous" in input_text.lower():
        return GuardrailResult(passed=False, message="Blocked")
    return GuardrailResult(passed=True)
```

## Running Agents

```python
from agents import Runner

# Synchronous
result = Runner.run_sync(agent, "Hello!")

# Asynchronous
result = await Runner.run(agent, "Hello!")

# Streaming
async for event in Runner.run_streamed(agent, "Tell me a story"):
    print(event.text, end="")
```

## Key Differentiators

| Feature | Agents SDK | Assistants API |
|---------|-----------|----------------|
| Infrastructure | Yours | OpenAI's |
| Data Control | Full | Limited |
| Model Options | 100+ LLMs | OpenAI only |
| Multi-Agent | Via handoffs | Single agent |
| Tracing | Built-in OTEL | Dashboard |

## Sessions

Persist conversation history within sessions:

```python
from agents import Session

session = Session()
result = await Runner.run(agent, "Remember my name is Alice", session=session)
# Later...
result = await Runner.run(agent, "What's my name?", session=session)
```

For cross-session persistence, use external storage (SQLite, Redis, etc.).

## Tracing

Built-in OpenTelemetry support:

```python
from agents import enable_tracing

enable_tracing(
    service_name="my-agent",
    endpoint="http://localhost:4317"
)
```

Captures:
- LLM calls with prompts/responses
- Tool executions
- Handoffs between agents
- Guardrail checks

## Best Practices

1. **Use handoffs for specialization** - Different instructions, tools, or access controls
2. **Add guardrails early** - Input validation for security, output validation for safety
3. **Enable tracing** - Essential for debugging multi-agent workflows
4. **Keep tools focused** - One tool per function, clear descriptions
5. **Test handoff logic** - Ensure routing works for edge cases

## When to Use

**Choose Agents SDK when:**
- You need full infrastructure control
- Building multi-agent systems with handoffs
- Want minimal abstractions
- Need to use non-OpenAI models

**Consider alternatives when:**
- Need built-in Code Interpreter (use Assistants API)
- Want graph-based workflows (use LangGraph)
- Need role-based teams (use CrewAI)
