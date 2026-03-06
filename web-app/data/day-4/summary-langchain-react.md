# LangChain ReAct Agents (LangGraph Era)

**Focus:** Building ReAct agents with LangChain's modern LangGraph-based architecture

## The Shift to LangGraph

As of LangChain 0.2 (2024), the agent architecture has fundamentally changed:

- **Legacy**: `AgentExecutor` + `initialize_agent` (deprecated, critical fixes only)
- **Current**: LangGraph-based agents with graph runtime

LangChain agents now run on **LangGraph's durable runtime**, providing features that weren't possible with the old approach.

## Why LangGraph?

LangGraph brings production-grade capabilities to ReAct agents:

| Feature | Legacy AgentExecutor | LangGraph |
|---------|---------------------|-----------|
| Persistence | Manual | Built-in checkpointing |
| Human-in-the-loop | Hacky callbacks | Native support |
| Rewind/replay | Not possible | Built-in |
| Control flow | Linear loop | Graph with branches |
| Streaming | Basic | Full token + step streaming |

## Current ReAct Implementation

The recommended approach uses `create_react_agent` from LangGraph's prebuilt module:

```python
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

# Define tools
tools = [search_tool, calculator_tool]

# Create agent with LangGraph
llm = ChatOpenAI(model="gpt-4")
agent = create_react_agent(llm, tools)

# Run (returns full state graph)
result = agent.invoke({"messages": [("user", "What is 25% of Tokyo's population?")]})
```

**Key difference**: The agent is now a **graph** with nodes and edges, not a simple loop.

## Graph Architecture

LangGraph models the ReAct loop as a state graph:

```
        ┌──────────────┐
        │    START     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
   ┌───▶│    Agent     │◀───┐
   │    │   (LLM call) │    │
   │    └──────┬───────┘    │
   │           │            │
   │     tool call?         │
   │      /      \          │
   │    yes       no        │
   │     │         │        │
   │     ▼         ▼        │
   │ ┌───────┐  ┌──────┐    │
   │ │ Tools │  │  END │    │
   │ └───┬───┘  └──────┘    │
   │     │                  │
   └─────┘                  │
   (observation)            │
```

## Features for Production

**Checkpointing**: Save agent state at any point, resume later
```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
agent = create_react_agent(llm, tools, checkpointer=checkpointer)
```

**Human-in-the-loop**: Interrupt before tool execution
```python
agent = create_react_agent(llm, tools, interrupt_before=["tools"])
```

**Streaming**: Get tokens and steps as they happen
```python
for chunk in agent.stream({"messages": [query]}):
    print(chunk)
```

## Migration from Legacy

If you have code using `AgentExecutor`:

1. **Pin versions**: `langchain>=0.2,<0.3` during migration
2. **Update imports**:
   - Old: `from langchain.agents import AgentExecutor, create_react_agent`
   - New: `from langgraph.prebuilt import create_react_agent`
3. **Change invocation**:
   - Old: `executor.invoke({"input": "query"})`
   - New: `agent.invoke({"messages": [("user", "query")]})`

## When to Use

**Use LangGraph ReAct when:**
- You need persistence across sessions
- Human approval is required before actions
- You want streaming for better UX
- You're building production systems

**Consider from-scratch (Day 3) when:**
- Learning how agents work internally
- Maximum control over every step
- Minimal dependencies required
- Simple one-off scripts

## Resources

- [LangGraph ReAct Template](https://github.com/langchain-ai/react-agent) - Official template
- [LangChain Agents Docs](https://docs.langchain.com/oss/python/langchain/agents) - Current documentation
- [Migration Guide](https://focused.io/lab/a-practical-guide-for-migrating-classic-langchain-agents-to-langgraph) - Legacy to LangGraph
