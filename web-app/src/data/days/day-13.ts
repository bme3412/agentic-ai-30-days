import type { Day } from '../../types';

export const day13: Day = {
  day: 13,
  phase: 2,
  title: "PydanticAI: Type-Safe Agents",
  partner: "Pydantic",
  tags: ["pydantic-ai", "type-safety", "validation", "structured-output", "dependencies"],
  concept: "Build production-grade AI agents with full type safety, dependency injection, and Pydantic validation",
  demoUrl: "demos/day-13/",
  demoDescription: "Explore PydanticAI's core concepts: create type-safe agents, define tools with automatic schema generation, inject dependencies, and validate structured outputs.",
  lesson: {
    overview: `PydanticAI brings the ergonomic design philosophy of FastAPI to generative AI development. Built by the Pydantic team—whose validation library underpins the OpenAI SDK, Anthropic SDK, LangChain, and most of the Python AI ecosystem—it emphasizes type safety, dependency injection, and structured validation throughout the agent lifecycle.

Where other frameworks bolt on validation as an afterthought, PydanticAI makes it foundational. Every agent is type-parameterized with its dependencies and output types. Tools auto-generate JSON schemas from type hints and docstrings. Invalid outputs trigger automatic retries with error feedback. This "move errors from runtime to write-time" philosophy catches bugs before they reach production.

**Why This Matters**: LLMs are probabilistic—they can return malformed JSON, ignore schema constraints, or hallucinate field values. PydanticAI treats this as a first-class problem. By integrating validation at every step, it transforms unreliable LLM outputs into type-safe, validated Python objects.`,

    principles: [
      {
        title: "Type Parameters Define Agent Contracts",
        description: "Every Agent is generic over two types: dependencies (DepsT) and output (OutputT). This isn't just documentation—your IDE and type checker enforce these contracts. Pass the wrong dependency type? Caught at write-time. Access a field that doesn't exist? Static error."
      },
      {
        title: "Dependencies Enable Testable Agents",
        description: "Rather than hardcoding API clients or database connections, inject them via RunContext. This FastAPI-inspired pattern makes agents testable—swap production dependencies for mocks without changing agent code."
      },
      {
        title: "Tools Are Functions with Docstrings",
        description: "Decorate any function with @agent.tool to make it callable by the LLM. Type hints become JSON schemas; docstrings become descriptions. If the LLM passes invalid arguments, Pydantic validates and feeds errors back for correction."
      },
      {
        title: "Structured Outputs with Automatic Retry",
        description: "Specify a Pydantic model as output_type, and the agent constrains LLM responses to that schema. Failed validation triggers retry with the error message, letting the model self-correct."
      }
    ],

    codeExample: {
      language: "python",
      title: "Type-Safe Agent with Dependencies and Tools",
      code: `from dataclasses import dataclass
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext

# Define structured output
class WeatherReport(BaseModel):
    location: str
    temperature: int
    condition: str
    recommendation: str

# Define dependencies
@dataclass
class WeatherDeps:
    api_key: str
    units: str = "celsius"

# Create type-safe agent
weather_agent = Agent(
    'openai:gpt-4o',
    deps_type=WeatherDeps,
    output_type=WeatherReport,
    system_prompt="You are a weather assistant. Always provide recommendations."
)

# Define a tool with automatic schema generation
@weather_agent.tool
async def get_weather(ctx: RunContext[WeatherDeps], city: str) -> str:
    """Fetch current weather for a city.

    Args:
        city: The city name to check weather for
    """
    # In production, call a real API using ctx.deps.api_key
    return f"Weather in {city}: 22°C, Sunny"

# Run with type-safe result
result = weather_agent.run_sync(
    "What's the weather in Tokyo?",
    deps=WeatherDeps(api_key="sk-xxx")
)

print(result.output.temperature)  # int, not Any
print(result.output.recommendation)  # Type-safe access`
    },

    diagram: {
      type: "mermaid",
      title: "PydanticAI Agent Flow",
      mermaid: `flowchart LR
    input[User Input] --> agent[Agent]
    agent --> llm[LLM]
    llm --> decision{Tool?}
    decision -->|Yes| tool[Run Tool]
    tool --> llm
    decision -->|No| validate{Valid?}
    validate -->|Yes| output[OutputT]
    validate -->|No| retry[Retry]
    retry --> llm

    style agent fill:#e91e8c,color:#fff
    style output fill:#00d084,color:#000
    style retry fill:#ff9500,color:#000`
    },

    keyTakeaways: [
      "Agents are generic over DepsT and OutputT—full type safety from dependencies to results",
      "Tools auto-generate JSON schemas from type hints; docstrings become descriptions",
      "Dependency injection via RunContext enables testing without code changes",
      "Failed output validation triggers automatic retry with error feedback",
      "Model-agnostic: supports OpenAI, Anthropic, Google, Groq, and 50+ providers"
    ],

    resources: [
      { title: "PydanticAI Documentation", url: "https://ai.pydantic.dev/", type: "docs", summaryPath: "data/day-13/summary-pydantic-ai.md" },
      { title: "PydanticAI GitHub", url: "https://github.com/pydantic/pydantic-ai", type: "github", summaryPath: "data/day-13/summary-github.md" }
    ]
  },
  learn: {
    overview: {
      summary: "Build production-grade AI agents with full type safety, dependency injection, and Pydantic validation—the FastAPI of GenAI development.",
      fullDescription: `Days 9-12 covered multi-agent frameworks: CrewAI's role-based teams, AutoGen's conversational patterns, and OpenAI's minimal Agents SDK. PydanticAI takes a different angle—instead of focusing on multi-agent orchestration, it obsesses over type safety and validation for individual agents.

**The FastAPI Philosophy**: "We built PydanticAI with one simple aim: to bring that FastAPI feeling to GenAI app and agent development." Just as FastAPI revolutionized Python web development with type hints, automatic docs, and dependency injection, PydanticAI applies these principles to LLM agents.

**Built by the Source**: Pydantic is the validation library that powers OpenAI's SDK, Anthropic's SDK, LangChain, and most Python AI tools. PydanticAI represents the creators' vision for how validation should integrate with agent development—not as an add-on, but as the foundation.

**The Core Problem**: LLMs are unreliable. They return malformed JSON, hallucinate fields, and ignore constraints. Most frameworks treat this as the developer's problem. PydanticAI makes validation automatic:
- Output types are Pydantic models—validated before reaching your code
- Failed validation triggers retry with error feedback
- Tools validate arguments and return structured errors to the model

**What You'll Learn**:
1. Creating type-parameterized agents with DepsT and OutputT
2. Defining tools with automatic schema generation from type hints
3. Injecting dependencies for testable, modular agents
4. Validating structured outputs with automatic retry
5. Streaming validated structured data

By the end, you'll understand how to build agents that catch errors at write-time, not runtime.`,
      prerequisites: ["Day 2: Structured Outputs & Function Calling", "Python type hints and Pydantic basics", "Understanding of dependency injection patterns"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "Creating Type-Safe Agents",
        description: `The foundation of PydanticAI is the type-parameterized Agent class. Unlike other frameworks where agents return untyped dictionaries or strings, PydanticAI agents are generic over two type parameters: \`DepsT\` (the type of dependencies injected at runtime) and \`OutputT\` (the type of the validated result). This design means your IDE understands exactly what your agent returns, providing autocompletion, type checking, and catching errors before you even run your code.

When you access \`result.output.title\` after running an agent, your IDE knows whether \`title\` is a string, an integer, or doesn't exist at all. This isn't magic—it's the same type inference that makes FastAPI and modern Python so productive. The agent's type parameters flow through the entire execution, from the dependencies you inject to the validated result you receive.

PydanticAI is also model-agnostic from the start. You specify the model with a simple string prefix: \`openai:gpt-4o\`, \`anthropic:claude-sonnet-4-20250514\`, \`google:gemini-2.0-flash\`, or \`groq:llama-3.3-70b\`. This means you can switch providers without changing your agent logic, and you're never locked into a single vendor.

\`\`\`python
from pydantic_ai import Agent
from pydantic import BaseModel

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str

# Agent with typed output
agent = Agent(
    'openai:gpt-4o',
    output_type=SearchResult,
    system_prompt="You are a search assistant."
)

result = agent.run_sync("Find Python tutorials")
print(result.output.title)  # Type-safe: IDE knows this is str
\`\`\`

PydanticAI provides five execution modes to fit different use cases: \`run_sync()\` for blocking synchronous calls, \`run()\` for async execution, \`run_stream()\` for streaming text output, \`run_stream_events()\` for streaming all events including tool calls, and \`iter()\` for stepping through execution nodes programmatically.`
      },
      {
        title: "Tools: Functions with Schema Generation",
        description: `Tools are how agents interact with the outside world—fetching data, calling APIs, performing calculations, or executing any Python logic you define. What makes PydanticAI's approach special is that you don't need to manually write JSON schemas or register tools in a configuration file. Instead, you decorate a normal Python function with \`@agent.tool\`, and PydanticAI automatically generates the schema from your function's type hints and docstring.

This automatic schema generation means your tools are always in sync with their documentation. If you change a parameter name or type, the schema updates automatically. If you forget to document a parameter, your IDE can warn you. The framework parses Google-style, NumPy-style, and Sphinx-style docstrings, extracting parameter descriptions to send to the LLM.

There are two types of tool decorators. The standard \`@agent.tool\` provides a \`RunContext\` as the first parameter, giving your tool access to the injected dependencies—API clients, database connections, or configuration values. For simpler tools that don't need context, \`@agent.tool_plain\` skips the context parameter entirely.

When a tool needs the LLM to try again with different arguments, you can raise \`ModelRetry\` with an error message. This message feeds back to the model, explaining what went wrong and giving it a chance to self-correct. This pattern is especially useful for validation or when external services return errors.

\`\`\`python
from pydantic_ai import Agent, RunContext, ModelRetry

agent = Agent('openai:gpt-4o', deps_type=str)

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
    if len(query) < 3:
        raise ModelRetry("Query must be at least 3 characters")
    # ctx.deps contains the injected dependency
    return f"Found {limit} results for '{query}'"
\`\`\`

The schema generation extracts parameter names and types from the signature, descriptions from the docstring, and default values for optional parameters. No boilerplate, no manual JSON—just Python functions with type hints.`
      },
      {
        title: "Dependencies: Testable Injection",
        description: `Production agents need external resources: database connections, HTTP clients, API keys, user context, and configuration. The naive approach is to hardcode these or use global variables, but that makes testing difficult and creates tight coupling. PydanticAI solves this with dependency injection, following the same pattern that makes FastAPI applications testable and modular.

The dependency injection pattern has three steps. First, you define your dependencies as a dataclass or any Python type—this is your "dependency container" that holds everything your agent needs. Second, you pass the dependency *type* to the agent via \`deps_type\`, telling the agent what kind of dependencies it should expect. Third, when you run the agent, you pass an actual dependency *instance*, which becomes available in your tools and system prompts via \`RunContext\`.

The power of this pattern shows up in testing. The \`agent.override()\` context manager lets you swap dependencies without changing any agent code. Your production code uses real API clients and database connections; your tests use mocks and fakes. Same agent, different dependencies. This is the same inversion of control that makes enterprise applications maintainable.

Dependencies also appear in dynamic system prompts. By decorating a function with \`@agent.system_prompt\`, you can inject runtime context—user IDs, current dates, subscription tiers—into the agent's instructions. The function receives \`RunContext\` and can access \`ctx.deps\` to customize the prompt based on who's running the agent.

\`\`\`python
from dataclasses import dataclass
import httpx
from pydantic_ai import Agent, RunContext

@dataclass
class AppDeps:
    http_client: httpx.AsyncClient
    api_key: str
    user_id: str

agent = Agent(
    'openai:gpt-4o',
    deps_type=AppDeps,
    system_prompt="You help users manage their account."
)

@agent.system_prompt
def add_user_context(ctx: RunContext[AppDeps]) -> str:
    return f"Current user ID: {ctx.deps.user_id}"

@agent.tool
async def fetch_profile(ctx: RunContext[AppDeps]) -> str:
    """Fetch the current user's profile."""
    response = await ctx.deps.http_client.get(
        f"/users/{ctx.deps.user_id}",
        headers={"Authorization": f"Bearer {ctx.deps.api_key}"}
    )
    return response.text

# In tests, override with mocks
with agent.override(deps=MockDeps()):
    result = agent.run_sync("Get my profile")
\`\`\``
      },
      {
        title: "Structured Output Validation",
        description: `LLMs are notoriously unreliable when generating structured data. They return JSON with missing fields, wrong types, or values that violate constraints. Traditional approaches require you to parse the output, validate it manually, and handle errors—often with fragile regex or try/except blocks. PydanticAI makes this automatic by treating output validation as a core feature, not an afterthought.

When you specify an \`output_type\` as a Pydantic model, PydanticAI doesn't just parse the LLM's response—it validates every field against your schema. Required fields must be present. Types must match. Constraints like \`ge=1\` (greater than or equal to 1), \`max_length=200\`, or regex patterns are enforced. If anything fails, the error message feeds back to the LLM, which gets another chance to produce valid output.

This retry mechanism is the key insight. Instead of failing immediately on invalid output, PydanticAI tells the model exactly what went wrong: "rating must be less than or equal to 10, got 15." The model can then self-correct, often successfully on the second or third attempt. You control the number of retries via the \`retries\` parameter, balancing reliability against latency and cost.

For agents that can return different types of responses—success or error, weather or search results—you can use Python's \`Union\` type. PydanticAI validates against all options and returns whichever matches. Combined with \`Literal\` type discriminators, you get type-safe pattern matching on the result, where Python's \`match\` statement knows exactly which variant you received.

\`\`\`python
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext, ModelRetry

class MovieReview(BaseModel):
    title: str
    rating: int = Field(ge=1, le=10, description="Rating from 1-10")
    summary: str = Field(max_length=200)
    recommend: bool

agent = Agent(
    'openai:gpt-4o',
    output_type=MovieReview,
    retries=2  # Retry up to 2 times on validation failure
)

# Custom validation logic
@agent.output_validator
def check_consistency(ctx: RunContext, output: MovieReview) -> MovieReview:
    if output.rating > 8 and not output.recommend:
        raise ModelRetry("High rating should imply recommendation")
    return output

result = agent.run_sync("Review the movie Inception")
print(result.output.rating)  # Guaranteed: int between 1-10
print(result.output.summary)  # Guaranteed: str, max 200 chars
\`\`\``
      },
      {
        title: "Dynamic System Prompts",
        description: `Static system prompts work for simple agents, but production systems need context that changes at runtime: the current user's name, their subscription tier, today's date, or personalized instructions based on their history. PydanticAI handles this with dynamic system prompts—functions that run when the agent executes and contribute additional prompt content.

You register dynamic prompts with the \`@agent.system_prompt\` decorator. These functions can be synchronous or async, and they can access dependencies via \`RunContext\`. Multiple prompt functions combine in order, building up the full system prompt from static and dynamic parts. This is cleaner than string interpolation because each piece of context lives in its own function with its own logic.

An important distinction exists between system prompts and instructions. System prompts persist in the message history—if you chain multiple agent calls or continue a conversation, the system prompt remains part of the context. Instructions, set via the \`instructions\` parameter or \`@agent.instructions\` decorator, apply only to the current run and are excluded when you pass explicit message history. Use instructions for one-shot requests; use system prompts when building conversational agents.

\`\`\`python
from datetime import date
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext

@dataclass
class UserContext:
    name: str
    subscription: str
    locale: str

agent = Agent(
    'openai:gpt-4o',
    deps_type=UserContext,
    system_prompt="You are a helpful assistant."  # Static base
)

@agent.system_prompt
def add_date() -> str:
    """Add current date to context."""
    return f"Today's date is {date.today()}."

@agent.system_prompt
def add_user_info(ctx: RunContext[UserContext]) -> str:
    """Add user-specific context."""
    return f"""
    User: {ctx.deps.name}
    Subscription: {ctx.deps.subscription}
    Locale: {ctx.deps.locale}
    """

# All prompts combine when the agent runs
result = agent.run_sync(
    "What features do I have access to?",
    deps=UserContext("Alice", "premium", "en-US")
)
\`\`\``
      },
      {
        title: "Streaming Structured Output",
        description: `Most streaming implementations only work with plain text—useful for chat interfaces, but limiting when you need structured data. PydanticAI breaks this limitation by supporting streaming of validated structured output. As the LLM generates tokens, PydanticAI yields progressively complete objects that you can inspect and display, with the final object fully validated.

This works through Pydantic's experimental partial validation feature. As JSON tokens arrive, PydanticAI attempts to validate whatever has been received so far. Fields that are complete pass validation; fields still being generated are available but may be incomplete. The final yield is always the fully validated result, giving you both real-time progress and eventual consistency.

Streaming structured output is invaluable for long-form generation. Imagine an agent writing a blog post with a title, introduction, sections, and conclusion. With streaming, you can display the title as soon as it's complete, show a word count for the introduction as it grows, and render sections progressively—all while knowing the final result will match your schema exactly.

PydanticAI offers three streaming methods: \`run_stream()\` with \`stream_text()\` for plain text, \`run_stream()\` with \`stream_output()\` for structured data, and \`run_stream_events()\` for full observability including tool calls and intermediate states.

\`\`\`python
from pydantic import BaseModel
from pydantic_ai import Agent

class Article(BaseModel):
    headline: str
    body: str
    tags: list[str]

agent = Agent('openai:gpt-4o', output_type=Article)

async def stream_article():
    async with agent.run_stream("Write about AI trends") as response:
        # Stream partial, validated objects
        async for partial in response.stream_output():
            if partial.headline:
                print(f"Headline: {partial.headline}")
            if partial.body:
                print(f"Body length: {len(partial.body)} chars")

        # Final object is fully validated
        final = response.output
        print(f"Tags: {final.tags}")
\`\`\``
      },
      {
        title: "Comparing PydanticAI to Other Frameworks",
        description: `The agent framework landscape is crowded, and each framework makes different tradeoffs. Understanding where PydanticAI fits helps you choose the right tool for your specific needs. PydanticAI's core strength is type safety and validation for individual agents—it's the best choice when you need reliable structured output from a single agent.

Compared to the **OpenAI Agents SDK**, PydanticAI offers deeper type integration and automatic output validation with retry. The Agents SDK focuses on multi-agent handoffs and guardrails with minimal abstractions. Choose PydanticAI for type-safe single agents with structured output; choose the Agents SDK for multi-agent routing and handoff patterns.

Compared to **LangChain**, PydanticAI is dramatically simpler. LangChain provides a rich ecosystem with many integrations, but at the cost of abstractions that can be hard to debug. PydanticAI has fewer features but static typing throughout, making it easier to understand what your code does and catch errors early. Choose PydanticAI for type safety; choose LangChain for extensive ecosystem integrations.

Compared to **CrewAI**, PydanticAI focuses on different problems entirely. CrewAI excels at role-based multi-agent teams with task dependencies and collaboration patterns. PydanticAI focuses on making individual agents reliable through validation. You might even combine them—use PydanticAI agents within a CrewAI crew for the best of both worlds.

**When to use PydanticAI**: You need reliable structured output. You want IDE autocompletion and type checking. You value testability via dependency injection. You prefer minimal abstractions.

**When to consider alternatives**: You need multi-agent orchestration (CrewAI, AutoGen). You want graph-based workflows (LangGraph). You need built-in handoffs between agents (OpenAI Agents SDK).`
      },
      {
        title: "Observability with Logfire",
        description: `Debugging agents is notoriously difficult. When something goes wrong, you need to understand the full execution trace: what prompts were sent, what the model returned, which tools were called, and why validation failed. PydanticAI integrates with Pydantic Logfire to provide this observability without manual instrumentation.

Logfire is Pydantic's observability platform, built on OpenTelemetry. Once enabled, it automatically captures every LLM request and response, tool invocations with their arguments and results, output validation attempts (both successes and failures), retry attempts with the error messages that triggered them, and token usage with latency metrics. You see the complete execution trace in a dashboard, making it trivial to understand why an agent behaved unexpectedly.

The integration is minimal—two lines of setup code. Logfire also exports to any OpenTelemetry-compatible backend, so you can send traces to Jaeger, Datadog, Honeycomb, or your existing observability infrastructure. This means PydanticAI fits into enterprise environments without requiring a new monitoring stack.

For development, you can also enable Python's standard logging at DEBUG level to see detailed execution flow in your terminal.

\`\`\`python
import logfire
from pydantic_ai import Agent

# Enable tracing (two lines)
logfire.configure()
logfire.instrument_pydantic_ai()

agent = Agent('openai:gpt-4o')
result = agent.run_sync("Hello!")

# Logfire dashboard now shows:
# - LLM calls with prompts and responses
# - Tool invocations with arguments and results
# - Validation attempts and retries
# - Token usage and latency
\`\`\``
      }
    ],
    codeExamples: [
      {
        title: "Complete Agent with Tools and Validation",
        language: "python",
        category: "basic",
        code: `from dataclasses import dataclass
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

# Structured output type
class TaskResult(BaseModel):
    task_id: str
    status: str = Field(pattern="^(pending|completed|failed)$")
    summary: str
    priority: int = Field(ge=1, le=5)

# Dependencies
@dataclass
class TaskDeps:
    user_id: str
    api_token: str

# Create agent with full typing
task_agent = Agent(
    'openai:gpt-4o',
    deps_type=TaskDeps,
    output_type=TaskResult,
    system_prompt="You manage tasks. Always assess priority 1-5."
)

@task_agent.tool
async def get_task(ctx: RunContext[TaskDeps], task_id: str) -> str:
    """Retrieve task details by ID.

    Args:
        task_id: The unique task identifier
    """
    # In production, fetch from database
    return f"Task {task_id}: Implement feature X, assigned to {ctx.deps.user_id}"

@task_agent.tool
async def update_status(
    ctx: RunContext[TaskDeps],
    task_id: str,
    new_status: str
) -> str:
    """Update a task's status.

    Args:
        task_id: The task to update
        new_status: New status (pending, completed, failed)
    """
    return f"Updated {task_id} to {new_status}"

# Run with type-safe result
result = task_agent.run_sync(
    "Check task-123 and mark it complete if done",
    deps=TaskDeps(user_id="alice", api_token="xxx")
)

# All access is type-checked
print(f"Task: {result.output.task_id}")
print(f"Status: {result.output.status}")
print(f"Priority: {result.output.priority}")`,
        explanation: "A complete example showing typed dependencies, tools with docstrings, and validated output. The IDE provides autocompletion for all output fields, and Pydantic validates the status pattern and priority range."
      },
      {
        title: "Multi-Output Types with Union",
        language: "python",
        category: "intermediate",
        code: `from typing import Union, Literal
from pydantic import BaseModel
from pydantic_ai import Agent

class WeatherSuccess(BaseModel):
    type: Literal["weather"]
    location: str
    temperature: float
    conditions: str

class SearchSuccess(BaseModel):
    type: Literal["search"]
    query: str
    results: list[str]

class ErrorResponse(BaseModel):
    type: Literal["error"]
    message: str
    suggestion: str

# Agent handles multiple output types
assistant = Agent(
    'openai:gpt-4o',
    output_type=Union[WeatherSuccess, SearchSuccess, ErrorResponse],
    system_prompt="""You are a multi-purpose assistant.
    For weather questions, return WeatherSuccess.
    For search questions, return SearchSuccess.
    If you can't help, return ErrorResponse with a suggestion."""
)

# The model chooses the appropriate type
result = assistant.run_sync("What's the weather in Paris?")

# Type narrowing based on discriminator
match result.output:
    case WeatherSuccess() as w:
        print(f"Weather in {w.location}: {w.temperature}°C, {w.conditions}")
    case SearchSuccess() as s:
        print(f"Search for '{s.query}': {s.results}")
    case ErrorResponse() as e:
        print(f"Error: {e.message}. Try: {e.suggestion}")`,
        explanation: "Demonstrates union types for agents that can return different response types. The Literal type field acts as a discriminator, enabling Python's pattern matching for type-safe handling."
      },
      {
        title: "Testing with Dependency Override",
        language: "python",
        category: "intermediate",
        code: `from dataclasses import dataclass
from unittest.mock import AsyncMock
import pytest
from pydantic_ai import Agent, RunContext

@dataclass
class ProductionDeps:
    db_connection: str
    api_client: object

@dataclass
class TestDeps:
    db_connection: str
    api_client: AsyncMock

agent = Agent(
    'openai:gpt-4o',
    deps_type=ProductionDeps,
    system_prompt="You help with orders."
)

@agent.tool
async def get_order(ctx: RunContext[ProductionDeps], order_id: str) -> str:
    """Fetch order details."""
    # In production, this calls the real API
    result = await ctx.deps.api_client.get_order(order_id)
    return str(result)

# Test with mocked dependencies
@pytest.mark.asyncio
async def test_order_agent():
    # Create mock that returns test data
    mock_client = AsyncMock()
    mock_client.get_order.return_value = {
        "id": "ORD-123",
        "status": "shipped",
        "items": ["Widget A", "Widget B"]
    }

    test_deps = TestDeps(
        db_connection="test://localhost",
        api_client=mock_client
    )

    # Override dependencies for testing
    with agent.override(deps=test_deps):
        result = await agent.run("What's the status of order ORD-123?")

        # Verify the mock was called
        mock_client.get_order.assert_called_once_with("ORD-123")

        # Check the result
        assert "shipped" in result.output.lower()`,
        explanation: "Shows how to test agents by overriding dependencies with mocks. The agent.override() context manager swaps production dependencies for test doubles without changing the agent code."
      },
      {
        title: "Streaming Validated Output",
        language: "python",
        category: "advanced",
        code: `import asyncio
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class BlogPost(BaseModel):
    title: str = Field(description="Catchy blog title")
    introduction: str = Field(description="Hook paragraph")
    sections: list[str] = Field(description="Main content sections")
    conclusion: str = Field(description="Closing thoughts")
    tags: list[str] = Field(max_length=5)

agent = Agent(
    'openai:gpt-4o',
    output_type=BlogPost,
    system_prompt="You write engaging blog posts about technology."
)

async def stream_blog_post(topic: str):
    """Stream a blog post with progressive validation."""
    print(f"Writing blog post about: {topic}\\n")

    async with agent.run_stream(f"Write a blog post about {topic}") as response:
        prev_title = ""
        async for partial in response.stream_output():
            # Show progress as fields are populated
            if partial.title and partial.title != prev_title:
                print(f"Title: {partial.title}")
                prev_title = partial.title

            if partial.introduction:
                word_count = len(partial.introduction.split())
                print(f"\\rIntro: {word_count} words...", end="")

        # Get final validated result
        final = response.output
        print(f"\\n\\nFinal post:")
        print(f"  Title: {final.title}")
        print(f"  Sections: {len(final.sections)}")
        print(f"  Tags: {final.tags}")

# Run the streaming example
asyncio.run(stream_blog_post("AI in 2025"))`,
        explanation: "Demonstrates streaming structured output with progressive validation. As the LLM generates tokens, Pydantic AI yields partially complete objects that you can inspect. The final result is fully validated."
      }
    ],
    diagrams: [
      {
        title: "PydanticAI Type System",
        type: "mermaid",
        mermaid: `flowchart LR
    deps[DepsT] --> agent["Agent[DepsT, OutputT]"]
    agent --> tools[@agent.tool]
    tools --> ctx[RunContext]
    agent --> llm[LLM Call]
    llm --> pydantic[Pydantic Validation]
    pydantic --> result[OutputT]

    style agent fill:#9d4edd,color:#fff
    style pydantic fill:#ff9500,color:#000
    style result fill:#00d084,color:#000`,
        caption: "Type parameters flow through the agent: DepsT types dependencies accessed via RunContext; OutputT types the validated result."
      },
      {
        title: "Validation and Retry Flow",
        type: "mermaid",
        mermaid: `flowchart LR
    llm[LLM Output] --> check{Valid?}
    check -->|Yes| result[Return OutputT]
    check -->|No| error[Format Error]
    error --> feedback[Feed to LLM]
    feedback --> llm

    style result fill:#00d084,color:#000
    style error fill:#ff4757,color:#fff`,
        caption: "Failed validation triggers automatic retry—the error message feeds back to the LLM for self-correction."
      }
    ],
    keyTakeaways: [
      "PydanticAI is 'FastAPI for GenAI'—type hints drive validation, schemas, and IDE support",
      "Agents are generic over DepsT (dependencies) and OutputT (result type) for full type safety",
      "Tools auto-generate JSON schemas from function signatures and docstrings",
      "Failed output validation triggers automatic retry with error feedback to the model",
      "Dependency injection via RunContext enables testing with swappable mock dependencies",
      "Model-agnostic: supports 50+ providers (OpenAI, Anthropic, Google, Groq, etc.)",
      "Streaming works with structured output—get progressively validated partial objects"
    ],
    resources: [
      { title: "PydanticAI Documentation", url: "https://ai.pydantic.dev/", type: "docs", description: "Official docs with guides and API reference", summaryPath: "data/day-13/summary-pydantic-ai.md" },
      { title: "PydanticAI GitHub", url: "https://github.com/pydantic/pydantic-ai", type: "github", description: "Source code and examples", summaryPath: "data/day-13/summary-github.md" },
      { title: "Pydantic Logfire", url: "https://pydantic.dev/logfire", type: "docs", description: "Observability platform for PydanticAI" },
      { title: "PydanticAI Examples", url: "https://ai.pydantic.dev/examples/", type: "tutorial", description: "Flight booking, RAG, and more", summaryPath: "data/day-13/summary-examples.md" }
    ],
    faq: [
      {
        question: "How does PydanticAI differ from using Pydantic with other frameworks?",
        answer: "While you can use Pydantic models with LangChain or other frameworks, PydanticAI integrates validation at every level. The agent itself is type-parameterized. Tools validate arguments and return errors to the model. Output validation triggers automatic retry. It's validation as a first-class concern, not an add-on."
      },
      {
        question: "Can I use PydanticAI for multi-agent systems?",
        answer: "PydanticAI focuses on single-agent type safety rather than multi-agent orchestration. For multi-agent patterns, consider combining PydanticAI agents with CrewAI for teams, or using handoffs via the OpenAI Agents SDK. PydanticAI excels at making each individual agent reliable and type-safe."
      },
      {
        question: "What happens if validation fails after all retries?",
        answer: "If the model can't produce valid output within the retry limit, PydanticAI raises a ValidationError with details about what failed. You should handle this in your code—perhaps with a fallback response or by escalating to human review."
      },
      {
        question: "How do I test agents without calling the real LLM?",
        answer: "Use agent.override() to swap dependencies for mocks. For full offline testing, you can also create a mock model that returns predetermined responses. The dependency injection pattern makes PydanticAI agents highly testable."
      },
      {
        question: "Does PydanticAI work with streaming and structured output simultaneously?",
        answer: "Yes! Use run_stream() with stream_output() to receive progressively validated partial objects. As tokens arrive, PydanticAI uses Pydantic's partial validation to yield increasingly complete objects. The final result is fully validated."
      }
    ],
    applications: [
      {
        title: "Data Extraction Pipeline",
        description: "Extract structured data from unstructured text with guaranteed schema compliance. Define Pydantic models for invoices, resumes, or contracts. The agent extracts fields with automatic validation and retry on malformed output."
      },
      {
        title: "API Integration Agent",
        description: "Build agents that call external APIs with type-safe dependencies. Inject API clients via RunContext, define tools for each endpoint, and return validated response models. Test by overriding with mock clients."
      },
      {
        title: "Form-Filling Assistant",
        description: "Create agents that gather information conversationally and output validated form data. Define the form schema as a Pydantic model with field constraints. The agent ensures all required fields are collected and valid."
      }
    ],
    relatedDays: [2, 9, 11, 12]
  }
};
