# PydanticAI Examples - Summary

> Source: [PydanticAI Examples](https://ai.pydantic.dev/examples/)

## Overview

PydanticAI provides a comprehensive set of example projects demonstrating various agent patterns, from simple chatbots to complex multi-agent workflows.

## Example Categories

### Getting Started
- **Pydantic Model** - Basic Pydantic integration patterns
- **Weather Agent** - Simple agent with real-world API usage

### Conversational Agents
- **Chat App with FastAPI** - Building interactive chat applications
- **Bank Support** - Customer support agents for banking scenarios

### Data & Analytics
- **SQL Generation** - Natural language to SQL query conversion
- **Data Analyst** - Automated data analysis tasks
- **RAG (Retrieval-Augmented Generation)** - Vector search with agent responses

### Streaming
- **Stream Markdown** - Handling markdown content streaming
- **Stream Whales** - Streaming data processing patterns

### Complex Workflows
- **Flight Booking** - Multi-step booking system with agent delegation
- **Question Graph** - Graph-based question answering

### Business Applications
- **Slack Lead Qualifier** - Integration with Slack for lead qualification

### UI Examples
- **Agent User Interaction (AG-UI)** - User interface patterns for agents

---

## Featured Example: RAG

Demonstrates retrieval-augmented generation combining vector search with AI agents.

**Architecture:**
1. PostgreSQL with pgvector stores documentation as embeddings
2. User queries converted to embeddings and matched semantically
3. Retrieved context augments agent responses

**Key Patterns:**
- Tool registration for semantic search
- Dependency injection for shared resources
- Async patterns for concurrent operations
- HNSW indexing for efficient similarity queries

**Dependencies:**
- asyncpg, OpenAI SDK, pgvector, Pydantic AI, Logfire

---

## Featured Example: Flight Booking

Multi-agent orchestration for complex booking workflows.

**Workflow:**
1. Search Agent manages overall booking
2. Extraction Agent parses flight data
3. Human confirmation before seat selection
4. Seat Preference Agent interprets seating requests
5. Purchase completion

**Key Patterns:**

**Agent Delegation:**
```python
@search_agent.tool
async def extract_flights(ctx: RunContext[Deps], url: str) -> list[Flight]:
    # Call extraction agent as a tool
    result = await extraction_agent.run(url, deps=ctx.deps)
    return result.output
```

**Validation Pipeline:**
```python
@search_agent.output_validator
def validate_flight(ctx: RunContext, output: FlightSelection) -> FlightSelection:
    if output.origin != ctx.deps.search_params.origin:
        raise ModelRetry("Flight origin doesn't match search")
    return output
```

**Usage Limits:**
```python
result = await search_agent.run(
    "Find flights to Paris",
    usage_limits=UsageLimits(request_limit=15)
)
```

**Message History:**
Maintains conversation context across agent transitions for seamless user experience.

---

## Running Examples

1. Clone the repository
2. Install dependencies: `pip install -e ".[examples]"`
3. Set environment variables (API keys)
4. Run: `python -m examples.<example_name>`

Most examples require:
- OpenAI or Anthropic API key
- Docker (for database examples)
- Logfire account (for observability)
