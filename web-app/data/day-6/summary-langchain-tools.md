# LangChain Tools: Complete Guide

## Overview

Tools are the interface between LangChain agents and the external world. They enable language models to take actions beyond text generation—searching the web, querying databases, executing code, and interacting with APIs.

## What Are Tools?

A **tool** in LangChain is a function that an agent can invoke to perform a specific task. Each tool has:

1. **Name**: A unique identifier the model uses to select the tool
2. **Description**: Natural language explanation of what the tool does and when to use it
3. **Input Schema**: The expected parameters (often defined via Pydantic or type hints)
4. **Function**: The actual code that executes when the tool is called

## Creating Tools with @tool Decorator

The simplest way to create a tool is using the `@tool` decorator:

```python
from langchain_core.tools import tool

@tool
def search_wikipedia(query: str) -> str:
    """Search Wikipedia for information about a topic.

    Use this when you need factual information about people,
    places, historical events, or general knowledge topics.

    Args:
        query: The search term to look up on Wikipedia
    """
    # Implementation here
    return wikipedia.summary(query)
```

**Key points:**
- The docstring becomes the tool's description (critical for agent reasoning)
- Type hints define the input schema
- The function name becomes the tool name

## Built-in Tools

LangChain provides many pre-built tools:

### Search Tools
- **DuckDuckGoSearchRun**: Web search without API keys
- **GoogleSearchAPIWrapper**: Google search (requires API key)
- **WikipediaQueryRun**: Search Wikipedia articles
- **ArxivQueryRun**: Search academic papers

### Code Execution
- **PythonREPLTool**: Execute Python code (use with caution!)
- **ShellTool**: Run shell commands (security risk)

### Database Tools
- **SQLDatabaseToolkit**: Query SQL databases
- **QuerySQLDataBaseTool**: Execute SQL queries

### API Tools
- **RequestsGetTool**: Make HTTP GET requests
- **RequestsPostTool**: Make HTTP POST requests

## Tool Calling Flow

1. **Bind tools to model**: `model.bind_tools([tool1, tool2])`
2. **Model receives prompt**: User asks a question
3. **Model reasons**: Decides which tool(s) to call
4. **Tool call generated**: Model outputs structured tool call(s)
5. **Tool executed**: LangChain runs the actual function
6. **Result returned**: Tool output fed back to model
7. **Model responds**: Synthesizes final answer

## Best Practices

### 1. Write Clear Descriptions
The description is how the model decides when to use your tool:

```python
# Bad: Vague description
@tool
def get_data(x: str) -> str:
    """Gets data."""  # Too vague!

# Good: Specific description
@tool
def get_stock_price(ticker: str) -> str:
    """Get the current stock price for a given ticker symbol.

    Use this when the user asks about stock prices, market values,
    or current trading prices. Do NOT use for historical data.

    Args:
        ticker: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
    """
```

### 2. Keep Tools Focused
Each tool should do one thing well. Don't create a "super tool" that handles multiple unrelated tasks.

### 3. Limit Tool Count
Start with 3-5 tools. Too many tools confuse the model and increase errors.

### 4. Handle Errors Gracefully
Tools should return informative error messages, not crash:

```python
@tool
def divide(a: float, b: float) -> str:
    """Divide two numbers."""
    if b == 0:
        return "Error: Cannot divide by zero"
    return str(a / b)
```

### 5. Validate Inputs
Don't trust that the model will always provide valid inputs:

```python
@tool
def fetch_user(user_id: int) -> str:
    """Fetch user details by ID."""
    if user_id < 0:
        return "Error: user_id must be positive"
    # ... rest of implementation
```

## Dynamic Tool Calling (2025)

As of 2025, LangGraph supports dynamic tool availability:

```python
def get_available_tools(state):
    """Return different tools based on workflow state."""
    if not state.get("authenticated"):
        return [login_tool]
    else:
        return [query_tool, update_tool, logout_tool]
```

This enables:
- Enforcing authentication before sensitive tools
- Gradually expanding toolset as task progresses
- Reducing errors by limiting unnecessary options

## Server-Side Tools

Some providers offer server-side built-in tools:
- **OpenAI**: Code interpreter, file search
- **Anthropic**: Computer use tools
- **Google**: Grounding with Search

These execute on the provider's infrastructure, not locally.

## Key Takeaways

1. Tools extend agents from "thinking" to "doing"
2. Clear descriptions are critical for proper tool selection
3. Use type hints and Pydantic for structured inputs
4. Start simple with few tools, add more as needed
5. Always handle errors gracefully in tool implementations
