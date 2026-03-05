# LangChain Agents Overview

LangChain is an open-source framework with a pre-built agent architecture and integrations for any model or tool, allowing you to build agents that adapt as fast as the ecosystem evolves. You can connect to 15+ providers—OpenAI, Anthropic, Google, and more—with under 10 lines of code, and seamlessly swap providers without code changes.

The framework offers three levels of abstraction. Deep Agents is the recommended starting point for most agent use cases, providing batteries-included implementations with automatic compression of long conversations, a virtual filesystem for agent operations, and subagent-spawning for managing context. LangChain agents offer customization when you need to modify context engineering, tool configurations, or reasoning patterns. LangGraph is the low-level orchestration framework for combining deterministic and agentic workflows with heavy customization needs.

| Framework | When to Use | Complexity |
|-----------|-------------|------------|
| Deep Agents | Most agent use cases | Batteries-included |
| LangChain | Need to customize agent behavior | Medium |
| LangGraph | Complex deterministic + agentic workflows | Advanced |

Creating an agent is straightforward. You define tools as Python functions, create the agent with a model and system prompt, then invoke it with user messages. The agent handles the reasoning loop—deciding whether to call a tool or respond directly, executing tools, and synthesizing results.

```python
from langchain.agents import create_agent

def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"

agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[get_weather],
    system_prompt="You are a helpful assistant"
)

response = agent.invoke(
    {"messages": [{"role": "user", "content": "What is the weather in SF?"}]}
)
```

LangChain's standard model interface solves the problem of different providers having unique APIs. You can switch between OpenAI, Anthropic, and Google with no code changes, avoiding vendor lock-in and making model comparison easy. The `@tool` decorator turns any Python function into a tool the agent can use, with the docstring becoming the description that guides the model's decisions.

LangChain agents inherit LangGraph capabilities including durable execution that survives failures and resumes, human-in-the-loop workflows that pause for approval, persistence for saving and restoring agent state, and streaming for real-time output as the agent works. These features come built-in without additional configuration.

LangSmith provides observability and debugging for agent behavior. By enabling tracing, you can see execution paths, capture state transitions, view detailed runtime metrics, and debug complex agent decisions. This visibility is essential for understanding why an agent made particular choices and identifying issues in production.

```python
import os
os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = "your-api-key"
```

To get started, install LangChain with your preferred provider package—`langchain[openai]` for OpenAI, `langchain[anthropic]` for Anthropic. Define your tools with the `@tool` decorator, create an agent with your chosen model, and invoke it with user messages. LangChain handles the tool execution loop, error cases, and response synthesis automatically.
