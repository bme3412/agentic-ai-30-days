# LangChain Tool Calling Interface

## Overview

Tool calling (also called function calling) is the mechanism by which language models request to execute specific functions with structured parameters. LangChain provides a unified interface that works across different model providers.

## The Tool Calling Flow

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Model + Tools  │  ← bind_tools() attaches available tools
└────────┬────────┘
         ▼
┌─────────────────┐
│  Tool Call(s)   │  ← Model outputs structured tool invocations
└────────┬────────┘
         ▼
┌─────────────────┐
│ Execute Tools   │  ← LangChain runs the actual functions
└────────┬────────┘
         ▼
┌─────────────────┐
│ ToolMessage(s)  │  ← Results packaged as messages
└────────┬────────┘
         ▼
┌─────────────────┐
│  Final Answer   │  ← Model synthesizes response
└─────────────────┘
```

## bind_tools(): The Universal Interface

`bind_tools()` is the standard method for attaching tools to any chat model:

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"Weather in {city}: 72°F, sunny"

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    return f"Results for: {query}"

# Works with any provider!
openai_model = ChatOpenAI(model="gpt-4").bind_tools([get_weather, search_web])
anthropic_model = ChatAnthropic(model="claude-3-5-sonnet").bind_tools([get_weather, search_web])
```

## Tool Input Types

You can pass different types to `bind_tools()`:

### 1. LangChain Tools (Recommended)
```python
@tool
def calculator(expression: str) -> str:
    """Evaluate a math expression."""
    return str(eval(expression))

model.bind_tools([calculator])
```

### 2. Pydantic Models
```python
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    """Get weather for a location."""
    city: str = Field(description="City name")
    units: str = Field(default="fahrenheit", description="Temperature units")

model.bind_tools([WeatherInput])
```

### 3. Python Functions
```python
def multiply(a: int, b: int) -> int:
    """Multiply two numbers together."""
    return a * b

model.bind_tools([multiply])
```

### 4. Raw JSON Schema
```python
tool_schema = {
    "type": "function",
    "function": {
        "name": "get_stock_price",
        "description": "Get current stock price",
        "parameters": {
            "type": "object",
            "properties": {
                "ticker": {"type": "string", "description": "Stock ticker symbol"}
            },
            "required": ["ticker"]
        }
    }
}

model.bind_tools([tool_schema])
```

## AIMessage.tool_calls

When a model decides to call tools, the response includes a `tool_calls` attribute:

```python
response = model.invoke("What's the weather in Paris?")

print(response.tool_calls)
# [
#     {
#         "id": "call_abc123",
#         "name": "get_weather",
#         "args": {"city": "Paris"}
#     }
# ]
```

### Tool Call Structure

| Field | Description |
|-------|-------------|
| `id` | Unique identifier for this call |
| `name` | Name of the tool to invoke |
| `args` | Dictionary of arguments |

## Executing Tool Calls

### Manual Execution
```python
from langchain_core.messages import ToolMessage

response = model.invoke("What's 5 * 7?")

# Execute each tool call
tool_messages = []
for tool_call in response.tool_calls:
    # Find and call the tool
    if tool_call["name"] == "calculator":
        result = calculator.invoke(tool_call["args"])

        # Package result as ToolMessage
        tool_messages.append(ToolMessage(
            content=str(result),
            tool_call_id=tool_call["id"]
        ))

# Continue conversation with results
final = model.invoke([
    HumanMessage(content="What's 5 * 7?"),
    response,  # AIMessage with tool_calls
    *tool_messages  # ToolMessages with results
])
```

### Using ToolNode (LangGraph)
```python
from langgraph.prebuilt import ToolNode

tool_node = ToolNode([calculator, get_weather])
result = tool_node.invoke({"messages": [response]})
```

## Parallel Tool Calls

Modern models can request multiple tool calls in a single response:

```python
response = model.invoke("What's the weather in Paris and London?")

print(len(response.tool_calls))  # 2

# [
#     {"name": "get_weather", "args": {"city": "Paris"}},
#     {"name": "get_weather", "args": {"city": "London"}}
# ]
```

**Tip**: Execute parallel calls concurrently for better performance:

```python
import asyncio

async def execute_tools(tool_calls):
    tasks = [execute_tool(tc) for tc in tool_calls]
    return await asyncio.gather(*tasks)
```

## Forcing Tool Usage

### tool_choice Parameter

```python
# Force a specific tool
model.bind_tools(tools, tool_choice="get_weather")

# Force any tool (no direct response)
model.bind_tools(tools, tool_choice="any")

# Let model decide (default)
model.bind_tools(tools, tool_choice="auto")

# Disable tool calling for this request
model.bind_tools(tools, tool_choice="none")
```

## Structured Output with Tools

Use tools to enforce structured output:

```python
from pydantic import BaseModel

class MovieReview(BaseModel):
    """Structured movie review."""
    title: str
    rating: int  # 1-10
    summary: str
    pros: list[str]
    cons: list[str]

model_with_structure = model.bind_tools(
    [MovieReview],
    tool_choice="MovieReview"  # Force this structure
)

response = model_with_structure.invoke("Review the movie Inception")
review = MovieReview(**response.tool_calls[0]["args"])
```

## Error Handling

### Invalid Tool Calls
```python
try:
    result = tool.invoke(tool_call["args"])
except Exception as e:
    # Return error as ToolMessage
    return ToolMessage(
        content=f"Error: {str(e)}",
        tool_call_id=tool_call["id"],
        status="error"
    )
```

### Model Hallucinating Tools
Sometimes models call tools that don't exist. Always validate:

```python
tool_map = {t.name: t for t in tools}

for tc in response.tool_calls:
    if tc["name"] not in tool_map:
        # Handle unknown tool
        continue
    tool_map[tc["name"]].invoke(tc["args"])
```

## Provider-Specific Notes

| Provider | Tool Calling Support |
|----------|---------------------|
| OpenAI | Full support, parallel calls |
| Anthropic | Full support, parallel calls |
| Google | Full support |
| Mistral | Full support |
| Ollama | Depends on model |
| Groq | Limited models |

## Key Takeaways

1. `bind_tools()` is the universal interface for tool attachment
2. `AIMessage.tool_calls` provides standardized access to tool requests
3. `ToolMessage` packages results back to the model
4. Modern models support parallel tool calls—use async for performance
5. Use `tool_choice` to control when tools are invoked
6. Always validate tool names and handle execution errors
