# LangGraph Persistence and Checkpointing

## Overview

LangGraph provides built-in persistence through checkpointers that save the state of a graph at every step (node execution). This enables:
- **Pause and resume**: Stop execution and continue later
- **Human-in-the-loop**: Interrupt for human approval, then resume
- **Time travel**: Revert to earlier states for debugging or branching
- **Fault tolerance**: Recover from failures without losing progress

## Core Concepts

### Checkpointers

Checkpointers are the persistence layer for LangGraph. They save the complete state of the graph after each node executes.

Available checkpointers:
- `MemorySaver` - In-memory storage (development only, state lost on restart)
- `SqliteSaver` - SQLite file-based persistence (single-instance deployments)
- `PostgresSaver` - PostgreSQL database (production, multi-instance)
- `AsyncPostgresSaver` - Async variant for high-concurrency applications

### Thread IDs

Conversations are organized by `thread_id`. Same thread_id = same conversation context.

```python
config = {"configurable": {"thread_id": "user-123-session-1"}}
result = graph.invoke(input, config)
```

### Checkpoint Structure

Each checkpoint contains:
- `thread_id`: Conversation identifier
- `checkpoint_ns`: Namespace for organization
- `checkpoint_id`: Unique checkpoint identifier
- `channel_values`: The actual state data (messages, custom state)
- `metadata`: Additional information about the checkpoint

## Installation

```bash
# Core LangGraph
pip install langgraph

# SQLite checkpointer
pip install langgraph-checkpoint-sqlite

# PostgreSQL checkpointer
pip install langgraph-checkpoint-postgres
```

## Usage Examples

### MemorySaver (Development)

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, MessagesState

# Build your graph
builder = StateGraph(MessagesState)
# ... add nodes and edges ...

# Compile with checkpointer
memory = MemorySaver()
graph = builder.compile(checkpointer=memory)

# Use with thread_id
config = {"configurable": {"thread_id": "thread-1"}}
result = graph.invoke({"messages": [("user", "Hello!")]}, config)

# Continue same conversation
result = graph.invoke({"messages": [("user", "What did I just say?")]}, config)
```

### SqliteSaver (Local Persistence)

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# Use context manager for proper connection handling
with SqliteSaver.from_conn_string("checkpoints.db") as saver:
    graph = builder.compile(checkpointer=saver)

    config = {"configurable": {"thread_id": "user-abc"}}
    result = graph.invoke({"messages": [("user", "Remember this")]}, config)

# Later, state is still available
with SqliteSaver.from_conn_string("checkpoints.db") as saver:
    graph = builder.compile(checkpointer=saver)
    result = graph.invoke(
        {"messages": [("user", "What should you remember?")]},
        {"configurable": {"thread_id": "user-abc"}}
    )
```

### PostgresSaver (Production)

```python
from langgraph.checkpoint.postgres import PostgresSaver
import psycopg

# Connection string
DB_URI = "postgresql://user:pass@localhost:5432/langgraph"

# Sync usage
with psycopg.connect(DB_URI) as conn:
    saver = PostgresSaver(conn)
    saver.setup()  # Create tables if needed

    graph = builder.compile(checkpointer=saver)
    # ... use graph ...

# Async usage
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
import psycopg_pool

async def main():
    pool = psycopg_pool.AsyncConnectionPool(DB_URI)
    saver = AsyncPostgresSaver(pool)
    await saver.setup()

    graph = builder.compile(checkpointer=saver)
    result = await graph.ainvoke(input, config)
```

## Human-in-the-Loop

Checkpointing enables interrupting execution for human review:

```python
from langgraph.graph import StateGraph, MessagesState

builder = StateGraph(MessagesState)
builder.add_node("agent", agent_node)
builder.add_node("tools", tool_node)

# Interrupt before tools execute
graph = builder.compile(
    checkpointer=saver,
    interrupt_before=["tools"]
)

# First invocation stops at interrupt point
result = graph.invoke(input, config)

# Review state
state = graph.get_state(config)
print(state.values["messages"])

# Continue execution (or modify state first)
result = graph.invoke(None, config)  # None continues from checkpoint
```

## Inspecting and Modifying State

```python
# Get current state
state = graph.get_state(config)
print(state.values)  # Current state values
print(state.next)    # Next node(s) to execute

# Get state history
for state in graph.get_state_history(config):
    print(f"Step: {state.metadata.get('step')}")
    print(f"Messages: {len(state.values.get('messages', []))}")

# Update state (modify before resuming)
graph.update_state(
    config,
    {"messages": [("user", "Actually, do something different")]},
    as_node="agent"  # Which node the update should appear to come from
)
```

## Best Practices

1. **Use MemorySaver only for development** - State is lost on restart
2. **Thread IDs should be unique per conversation** - Use user ID + session ID
3. **Handle checkpoint cleanup** - Old checkpoints accumulate; implement retention
4. **Use async checkpointers for high traffic** - Better concurrency
5. **Test persistence behavior** - Verify state survives restarts

## References

- [LangGraph Persistence Documentation](https://langchain-ai.github.io/langgraph/concepts/persistence/)
- [LangGraph Checkpointer Libraries](https://blog.langchain.com/langgraph-v0-2/)
- [Human-in-the-Loop Patterns](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/)
