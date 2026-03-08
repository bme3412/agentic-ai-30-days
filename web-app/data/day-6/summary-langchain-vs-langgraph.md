# LangChain vs LangGraph: When to Use Each

## The Relationship

LangGraph is not a replacement for LangChain—it's an extension. Think of it this way:

- **LangChain**: The foundation (models, tools, prompts, memory)
- **LangGraph**: The orchestration layer for complex agent workflows

They work together, with LangGraph building on top of LangChain's primitives.

## Architecture Comparison

### LangChain: Directed Acyclic Graphs (DAGs)

```
Input → Step 1 → Step 2 → Step 3 → Output
              ↘        ↗
                Branch
```

- Linear or branching flows
- No loops allowed
- Process flows in one direction

### LangGraph: Cyclic Graphs

```
Input → Node A → Node B → Node C
           ↑         ↓
           ← ← ← ← ← ←  (loop back)
```

- Cycles/loops are first-class citizens
- State can flow backward
- Essential for iterative agent behavior

## Feature Comparison

| Feature | LangChain | LangGraph |
|---------|-----------|-----------|
| **Architecture** | DAG (chains) | Graph (nodes + edges) |
| **Loops** | Not supported | Native support |
| **State** | Basic (memory) | Rich centralized state |
| **Checkpointing** | Manual | Built-in |
| **Human-in-loop** | Manual | First-class support |
| **Streaming** | Basic | Advanced (tokens + state) |
| **Debugging** | Print statements | Visual graph + LangSmith |
| **Complexity** | Low-Medium | Medium-High |
| **Learning curve** | Gentle | Steeper |

## When to Use LangChain

### Simple, Linear Workflows

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# Simple chain: prompt → model → output
chain = prompt | model | output_parser
result = chain.invoke({"input": "Hello"})
```

**Best for:**
- Single-turn Q&A
- Basic RAG pipelines
- Simple chatbots
- Text transformation pipelines
- Proof of concepts / prototypes

### When Chains Are Enough

If your workflow looks like this, stay with LangChain:
```
User Query → Retrieve Docs → Generate Answer → Return
```

No loops. No state persistence. No human approval steps.

## When to Use LangGraph

### Complex Agent Workflows

```python
from langgraph.graph import StateGraph, END

# Define state
class AgentState(TypedDict):
    messages: list
    next_action: str
    iteration: int

# Build graph
graph = StateGraph(AgentState)
graph.add_node("reason", reasoning_node)
graph.add_node("act", action_node)
graph.add_node("reflect", reflection_node)

# Add edges with conditions
graph.add_edge("reason", "act")
graph.add_conditional_edges("act", should_continue, {
    "continue": "reflect",
    "end": END
})
graph.add_edge("reflect", "reason")  # Loop back!
```

**Best for:**
- Multi-step agents that iterate
- Human-in-the-loop workflows
- Long-running tasks (resume from checkpoints)
- Multi-agent systems
- Production deployments

### Signs You Need LangGraph

1. **Loops**: Your agent needs to retry or iterate
2. **State persistence**: You need to pause and resume
3. **Human approval**: Steps require human verification
4. **Multi-agent**: Multiple agents collaborating
5. **Production**: You need reliability and observability

## Migration Path

### Start with LangChain

```python
# Day 1: Simple chain
from langchain.agents import create_tool_calling_agent, AgentExecutor

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools)
```

### Graduate to LangGraph

```python
# Later: When you need more control
from langgraph.prebuilt import create_react_agent

# LangGraph's prebuilt agent
agent = create_react_agent(model, tools)

# Or build custom graph for full control
graph = StateGraph(AgentState)
# ... define custom nodes and edges
```

## Code Comparison

### LangChain Agent

```python
from langchain.agents import AgentExecutor, create_tool_calling_agent

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({"input": "What's the weather in Tokyo?"})
```

### LangGraph Agent

```python
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

# Create agent with persistence
checkpointer = MemorySaver()
agent = create_react_agent(
    model,
    tools,
    checkpointer=checkpointer
)

# Run with thread ID for state persistence
config = {"configurable": {"thread_id": "user-123"}}
result = agent.invoke(
    {"messages": [("human", "What's the weather in Tokyo?")]},
    config=config
)

# Later: Resume the same conversation
result = agent.invoke(
    {"messages": [("human", "And in Paris?")]},
    config=config  # Same thread_id
)
```

## Key Differences in Practice

### Error Recovery

**LangChain**: Basic retry logic
```python
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_parsing_errors=True,  # Retry on parse errors
)
```

**LangGraph**: Fine-grained control
```python
def handle_error(state):
    if state["error_count"] > 3:
        return "fallback"
    return "retry"

graph.add_conditional_edges("execute", handle_error, {
    "retry": "execute",
    "fallback": "human_help",
})
```

### State Management

**LangChain**: Memory objects
```python
memory = ConversationBufferMemory()
executor = AgentExecutor(agent=agent, tools=tools, memory=memory)
```

**LangGraph**: Typed state with full history
```python
class State(TypedDict):
    messages: Annotated[list, add_messages]
    context: dict
    user_approved: bool
    iteration: int
```

## The 2025/2026 Recommendation

From the LangChain team:

> "LangChain is the fastest way to build an AI agent... LangGraph is a lower level framework and runtime, useful for highly custom and controllable agents, designed to support production-grade, long running agents."

**Translation:**
- **Prototype** → LangChain
- **Production** → LangGraph

## Key Takeaways

1. LangChain and LangGraph are complementary, not competing
2. Start with LangChain for speed and simplicity
3. Migrate to LangGraph when you need loops, state, or human-in-loop
4. LangGraph builds on LangChain primitives (same tools, models, etc.)
5. For production agents in 2025+, LangGraph is the recommended path
