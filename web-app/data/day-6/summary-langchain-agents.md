# LangChain Agents: Architecture and Patterns

## What Are LangChain Agents?

Agents are autonomous systems that use language models to decide which actions to take and in what order. Unlike chains (which follow a fixed sequence), agents dynamically choose their path based on:

- The user's input
- Results from previous tool calls
- The current state of the conversation

## The Agent Loop

Every LangChain agent follows this core loop:

```
User Input → Model Thinks → Tool Call?
                              ↓ Yes → Execute Tool → Feed Result → Model Thinks (loop)
                              ↓ No  → Return Final Answer
```

The agent continues looping until:
1. The model decides no more tool calls are needed
2. A maximum iteration limit is reached
3. An error occurs

## Agent Types

### 1. Tool Calling Agent (Recommended)
The modern, provider-agnostic approach using the standard tool calling interface:

```python
from langchain.agents import create_tool_calling_agent, AgentExecutor

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools)

result = executor.invoke({"input": "What's the weather in Tokyo?"})
```

**When to use**: Most use cases. Works with any model that supports tool calling.

### 2. ReAct Agent
Implements the Reasoning + Acting pattern explicitly:

```python
from langchain.agents import create_react_agent

agent = create_react_agent(llm, tools, prompt)
```

**When to use**: When you need explicit reasoning traces, or working with models that don't support native tool calling.

### 3. OpenAI Tools Agent
Optimized for OpenAI's function calling API:

```python
from langchain.agents import create_openai_tools_agent

agent = create_openai_tools_agent(llm, tools, prompt)
```

**When to use**: OpenAI models specifically, for best performance.

### 4. Structured Chat Agent
For models that work better with structured output formats:

```python
from langchain.agents import create_structured_chat_agent

agent = create_structured_chat_agent(llm, tools, prompt)
```

**When to use**: Models without native tool calling that respond well to JSON formatting.

## AgentExecutor

The `AgentExecutor` is the runtime that orchestrates the agent loop:

```python
from langchain.agents import AgentExecutor

executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,           # Print reasoning steps
    max_iterations=10,      # Prevent infinite loops
    return_intermediate_steps=True,  # Include tool call history
    handle_parsing_errors=True,      # Graceful error handling
)
```

### Key Parameters

| Parameter | Description |
|-----------|-------------|
| `max_iterations` | Maximum tool call loops (default: 15) |
| `max_execution_time` | Timeout in seconds |
| `early_stopping_method` | How to stop: "force" or "generate" |
| `handle_parsing_errors` | Auto-recover from malformed outputs |
| `return_intermediate_steps` | Include reasoning in response |

## Agent Prompts

The prompt template shapes agent behavior:

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful research assistant.

You have access to the following tools:
{tools}

When using tools, always explain your reasoning first.
If you're unsure, ask clarifying questions.
Never make up information - always use tools to verify facts."""),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])
```

The `{agent_scratchpad}` placeholder is where LangChain injects the history of tool calls and results.

## Memory in Agents

Agents can maintain conversation history:

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory,
)
```

## Error Handling Patterns

### 1. Parsing Errors
```python
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_parsing_errors=True,  # Auto-retry on parse failures
)
```

### 2. Tool Errors
```python
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_tool_error=True,  # Pass error message back to model
)
```

### 3. Custom Error Handler
```python
def custom_handler(error: Exception) -> str:
    return f"Tool failed: {error}. Try a different approach."

executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_tool_error=custom_handler,
)
```

## LangChain vs LangGraph Agents

| Feature | LangChain Agents | LangGraph Agents |
|---------|-----------------|------------------|
| Architecture | Linear (DAG) | Graph (cycles allowed) |
| State | Basic (memory) | Rich (centralized state) |
| Complexity | Simple to moderate | Complex workflows |
| Control | Limited | Fine-grained |
| Best for | Prototypes, simple tasks | Production, multi-agent |

**Rule of thumb**: Start with LangChain agents for prototyping, migrate to LangGraph when you need more control.

## Production Considerations

### 1. Observability
Use LangSmith for tracing:
```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-key"
```

### 2. Rate Limiting
Implement backoff for API calls in tools.

### 3. Timeout Handling
Always set `max_execution_time` to prevent runaway agents.

### 4. Input Validation
Validate user input before passing to agent.

### 5. Output Sanitization
Never trust agent output for security-sensitive operations.

## Key Takeaways

1. Agents = LLM + Tools + Loop
2. Use `create_tool_calling_agent` for most cases (provider-agnostic)
3. AgentExecutor handles the runtime loop and error recovery
4. Prompts shape agent behavior—be explicit about expectations
5. Start with LangChain agents, graduate to LangGraph for production
6. Always set iteration limits and timeouts
