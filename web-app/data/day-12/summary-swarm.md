# OpenAI Swarm - Summary

> Source: [OpenAI Swarm GitHub](https://github.com/openai/swarm)

## Overview

Swarm is an **educational framework** from OpenAI exploring lightweight, ergonomic multi-agent orchestration patterns. It was the experimental predecessor to the production-ready Agents SDK.

**Important:** Swarm is intended for learning and exploration, not production use. For production applications, use the [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/).

## Design Philosophy

Swarm explores patterns that are:
- **Lightweight** - Minimal abstractions over the Chat Completions API
- **Scalable** - Patterns that work for many independent capabilities
- **Customizable** - Full control over agent behavior

Best suited for situations with many independent capabilities and instructions that are difficult to encode into a single prompt.

## Core Concepts

### Agents

An Agent encapsulates instructions and tools:

```python
from swarm import Agent

agent = Agent(
    name="Sales Agent",
    instructions="You handle sales inquiries. Be enthusiastic.",
    functions=[get_product_info, check_inventory]
)
```

### Handoffs

Agents can hand off conversations by returning another agent:

```python
def transfer_to_support():
    """Transfer to technical support."""
    return support_agent

sales_agent = Agent(
    name="Sales",
    functions=[transfer_to_support, ...]
)
```

When `transfer_to_support()` is called, the conversation transfers to `support_agent` with context preserved.

### Context Variables

Shared state accessible to all agents:

```python
from swarm import Swarm

client = Swarm()
response = client.run(
    agent=triage_agent,
    messages=[{"role": "user", "content": "Hi!"}],
    context_variables={"user_id": "123", "language": "en"}
)
```

Functions can read and update context:

```python
def get_user_info(context_variables):
    user_id = context_variables["user_id"]
    return f"User {user_id} info: ..."
```

## Running Swarm

```python
from swarm import Swarm

client = Swarm()

response = client.run(
    agent=my_agent,
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.messages[-1]["content"])
```

## Key Patterns from Swarm

### 1. Triage Pattern
A single entry point routes to specialists:

```
User → Triage Agent → Sales | Support | Billing
```

### 2. Sequential Handoffs
Agents hand off in a pipeline:

```
Research Agent → Analysis Agent → Writing Agent
```

### 3. Loopback Pattern
Agents can hand back to previous agents:

```
Coder ↔ Reviewer (iterate until approved)
```

## Swarm vs Agents SDK

| Aspect | Swarm | Agents SDK |
|--------|-------|------------|
| Purpose | Educational | Production |
| Stability | Experimental | Stable |
| Features | Basic | Guardrails, tracing, sessions |
| Support | Community | Official |
| Python/TS | Python only | Both |

## Example: Customer Service

```python
from swarm import Swarm, Agent

# Specialist agents
sales = Agent(
    name="Sales",
    instructions="Handle pricing and product questions."
)

support = Agent(
    name="Support",
    instructions="Handle technical issues."
)

# Handoff functions
def transfer_to_sales():
    return sales

def transfer_to_support():
    return support

# Triage routes to specialists
triage = Agent(
    name="Triage",
    instructions="Route to Sales or Support based on user needs.",
    functions=[transfer_to_sales, transfer_to_support]
)

# Run
client = Swarm()
response = client.run(
    agent=triage,
    messages=[{"role": "user", "content": "I need help with pricing"}]
)
```

## Lessons from Swarm

1. **Handoffs are powerful** - Simple function returns enable complex routing
2. **Instructions matter** - Clear agent personalities improve routing accuracy
3. **Context flows naturally** - No manual state wiring needed
4. **Minimal is maintainable** - Fewer abstractions mean fewer surprises

## Migration to Agents SDK

The Agents SDK preserves Swarm's patterns while adding:
- Input/output guardrails
- Built-in OpenTelemetry tracing
- Session persistence
- TypeScript support
- Production stability

Most Swarm code translates directly:

```python
# Swarm
from swarm import Swarm, Agent
client = Swarm()
response = client.run(agent, messages)

# Agents SDK
from agents import Agent, Runner
result = Runner.run_sync(agent, "message")
```
