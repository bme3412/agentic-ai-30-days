# LangGraph Core Concepts

> Summary of LangGraph's foundational concepts for building stateful agent workflows

## What is LangGraph?

LangGraph is a library for building **stateful, multi-actor applications** with LLMs. It extends LangChain with graph-based orchestration, enabling complex workflows that go beyond simple chains or loops.

## Key Architectural Concepts

### 1. StateGraph

The central abstraction. A `StateGraph` defines:
- **State schema**: What data flows through the graph
- **Nodes**: Processing steps that transform state
- **Edges**: Connections defining execution order
- **Entry/Exit points**: Where execution starts and ends

```python
from langgraph.graph import StateGraph, END

class MyState(TypedDict):
    messages: list
    result: str

graph = StateGraph(MyState)
```

### 2. Nodes

Functions that:
- Receive current state as input
- Return a dictionary of state updates
- Can call LLMs, execute tools, or perform any computation

```python
def my_node(state: MyState) -> dict:
    # Process state
    return {"result": "updated value"}

graph.add_node("my_node", my_node)
```

### 3. Edges

Define transitions between nodes:
- **Simple edges**: Always go to the same next node
- **Conditional edges**: Route based on state values

```python
# Simple edge
graph.add_edge("node_a", "node_b")

# Conditional edge
graph.add_conditional_edges(
    "classifier",
    route_function,
    {"path_a": "node_a", "path_b": "node_b"}
)
```

### 4. Compilation

Transforms the graph definition into a runnable agent:

```python
agent = graph.compile()
result = agent.invoke({"messages": [...]})
```

## Graph vs Chain vs Agent

| Aspect | Chain | Agent (AgentExecutor) | LangGraph |
|--------|-------|----------------------|-----------|
| Control flow | Linear | Fixed loop | Arbitrary graph |
| Branching | No | No | Yes |
| Cycles | No | Single loop | Multiple loops |
| State | Implicit | Internal | Explicit, typed |
| Human-in-loop | Hard | Hard | Built-in |
| Persistence | No | No | Checkpointing |

## When to Use LangGraph

**Use LangGraph when you need:**
- Conditional branching based on intermediate results
- Human approval gates
- Complex error recovery with fallbacks
- State persistence across sessions
- Multi-agent coordination

**Stick with AgentExecutor when:**
- Building simple tool-calling agents
- Prototyping quickly
- The standard loop pattern is sufficient

## Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph GitHub](https://github.com/langchain-ai/langgraph)
- [LangGraph Examples](https://github.com/langchain-ai/langgraph/tree/main/examples)
