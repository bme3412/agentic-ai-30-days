# PydanticAI - Summary

> Source: [PydanticAI Documentation](https://ai.pydantic.dev/)

## Overview

PydanticAI is a Python framework for building production-grade AI agents with full type safety, dependency injection, and Pydantic validation. Built by the Pydantic team, it brings the ergonomic design philosophy of FastAPI to generative AI development.

## Design Philosophy

**"Bring that FastAPI feeling to GenAI app and agent development."**

The framework emphasizes:
- Static type checking throughout the agent lifecycle
- Moving errors from runtime to write-time
- Minimal abstractions with maximum control
- Testability through dependency injection

## Core Concepts

### 1. Type-Parameterized Agents

Agents are generic over two types: dependencies (DepsT) and output (OutputT).

```python
from pydantic_ai import Agent
from pydantic import BaseModel

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str

agent = Agent(
    'openai:gpt-4o',
    output_type=SearchResult,
    system_prompt="You are a search assistant."
)

result = agent.run_sync("Find Python tutorials")
print(result.output.title)  # Type-safe access
```

### 2. Tools with Automatic Schema Generation

Decorate functions to make them callable by the LLM. Type hints become schemas; docstrings become descriptions.

```python
@agent.tool
async def search_database(
    ctx: RunContext[str],
    query: str,
    limit: int = 10
) -> str:
    """Search the database for matching records.

    Args:
        query: The search query to execute
        limit: Maximum number of results to return
    """
    return f"Found {limit} results for '{query}'"
```

### 3. Dependency Injection

Follow FastAPI's pattern: define dependencies as dataclasses, access via RunContext.

```python
@dataclass
class AppDeps:
    http_client: httpx.AsyncClient
    api_key: str

agent = Agent('openai:gpt-4o', deps_type=AppDeps)

@agent.tool
async def fetch_data(ctx: RunContext[AppDeps]) -> str:
    response = await ctx.deps.http_client.get("/api")
    return response.text
```

### 4. Structured Output Validation

Specify Pydantic models as output types. Failed validation triggers automatic retry.

```python
class MovieReview(BaseModel):
    title: str
    rating: int = Field(ge=1, le=10)
    summary: str = Field(max_length=200)

agent = Agent('openai:gpt-4o', output_type=MovieReview, retries=2)
```

## Running Agents

Five execution modes:

```python
# Synchronous
result = agent.run_sync("Query")

# Async
result = await agent.run("Query")

# Stream text
async with agent.run_stream("Query") as response:
    async for chunk in response.stream_text():
        print(chunk, end="")

# Stream structured output
async with agent.run_stream("Query") as response:
    async for partial in response.stream_output():
        print(partial.title)

# Stream all events
async for event in agent.run_stream_events("Query"):
    if event.kind == "tool_call":
        print(f"Calling: {event.tool_name}")
```

## Key Differentiators

| Feature | PydanticAI | LangChain | OpenAI SDK |
|---------|-----------|-----------|------------|
| Type Safety | Full static typing | Runtime typing | Partial |
| Validation | Built-in with retry | Manual | Manual |
| Dependencies | Injection pattern | Various | N/A |
| Schema Gen | From type hints | Manual/auto | Manual |
| Testing | Override pattern | Varies | Manual mocking |

## Model Support

Model-agnostic with 50+ providers:
- `openai:gpt-4o`, `openai:gpt-4o-mini`
- `anthropic:claude-sonnet-4-20250514`
- `google:gemini-2.0-flash`
- `groq:llama-3.3-70b`
- Custom models via simple interface

## Testing with Override

Swap dependencies without changing agent code:

```python
mock_deps = AppDeps(http_client=MockClient(), api_key="test")

with agent.override(deps=mock_deps):
    result = agent.run_sync("Test query")
    # Uses mock dependencies
```

## Observability

Built-in Logfire integration:

```python
import logfire

logfire.configure()
logfire.instrument_pydantic_ai()

# Traces include:
# - LLM calls with prompts/responses
# - Tool executions with arguments
# - Validation attempts and retries
# - Token usage and latency
```

## Best Practices

1. **Use type hints everywhere** - Enables IDE support and static checking
2. **Define dependencies as dataclasses** - Clean, typed injection
3. **Add retries for validation** - Let the model self-correct
4. **Use output validators** - Add custom validation logic
5. **Test with overrides** - Swap dependencies for mocks

## When to Use

**Choose PydanticAI when:**
- Building production agents that need reliable structured output
- Want full IDE autocompletion and type checking
- Need testable agents with swappable dependencies
- Prefer minimal abstractions with maximum type safety

**Consider alternatives when:**
- Need multi-agent orchestration (CrewAI, AutoGen)
- Want graph-based workflows (LangGraph)
- Need built-in handoffs (OpenAI Agents SDK)
