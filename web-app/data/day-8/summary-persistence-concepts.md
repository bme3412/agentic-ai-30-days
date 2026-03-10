# LangGraph Persistence Concepts

> Comprehensive guide to checkpointing, threads, and state persistence in LangGraph

## What is Checkpointing?

Checkpointing automatically saves your agent's complete state after each node execution. Think of it like auto-save in a video game: every time you reach a checkpoint, your progress is preserved. If the process crashes, you restart from the last checkpoint, not the beginning.

### What Gets Saved

Each checkpoint contains:

| Component | Description |
|-----------|-------------|
| **values** | Complete state dict (all your TypedDict fields) |
| **next** | Tuple of nodes that would execute next |
| **config** | Configuration including thread_id |
| **metadata** | Timestamps, source node, step number |
| **parent_config** | Link to previous checkpoint (enables history) |

### Key Benefits

- **Conversation Memory**: Agent remembers all previous messages in a thread
- **Crash Recovery**: Resume from last checkpoint after server restarts
- **Human-in-the-Loop**: Pause execution, wait for human input, resume later
- **Time-Travel Debugging**: Inspect any historical state, replay from any point
- **Multi-Session Support**: User can close browser, return later, continue same conversation

## Checkpointer Types in Detail

### MemorySaver (Development Only)

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
agent = graph.compile(checkpointer=checkpointer)
```

**Characteristics:**
- Stores checkpoints in a Python dictionary in RAM
- Extremely fast (no I/O overhead)
- Data is lost when process terminates
- No setup required

**When to Use:**
- Local development and testing
- Prototyping new workflows
- Unit tests
- Demos and tutorials

**When NOT to Use:**
- Any production environment
- When you need conversation persistence
- Human-in-the-loop workflows (waits could exceed process lifetime)

---

### SqliteSaver (Single Server Production)

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# Synchronous version
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")

# With custom path
checkpointer = SqliteSaver.from_conn_string("/var/data/agent_checkpoints.db")
```

**Async Version:**
```python
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

checkpointer = AsyncSqliteSaver.from_conn_string("checkpoints.db")
# Use with agent.ainvoke()
```

**Characteristics:**
- Persists to local SQLite database file
- Survives process restarts
- Single-writer limitation (SQLite uses file locking)
- No external dependencies
- Good performance for moderate workloads

**When to Use:**
- Single-server deployments
- Development with persistence needs
- Small to medium scale production
- When you can't set up PostgreSQL

**Configuration Tips:**
```python
# Enable WAL mode for better concurrent read performance
import sqlite3
conn = sqlite3.connect("checkpoints.db")
conn.execute("PRAGMA journal_mode=WAL")
conn.close()

checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
```

---

### PostgresSaver (Distributed Production)

```python
from langgraph.checkpoint.postgres import PostgresSaver

# Basic connection
checkpointer = PostgresSaver.from_conn_string(
    "postgresql://user:password@localhost:5432/mydb"
)

# With connection pool for high throughput
from sqlalchemy.pool import QueuePool

checkpointer = PostgresSaver.from_conn_string(
    "postgresql://user:password@host:5432/db",
    pool_class=QueuePool,
    pool_size=10,
    max_overflow=20
)
```

**Async Version:**
```python
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

checkpointer = AsyncPostgresSaver.from_conn_string(
    "postgresql://user:password@host:5432/db"
)
```

**Characteristics:**
- Full PostgreSQL backend with ACID guarantees
- Supports multiple servers reading/writing concurrently
- Connection pooling for high throughput
- Rich querying capabilities for analytics
- Enterprise-grade reliability

**When to Use:**
- Multi-server deployments
- High availability requirements
- When you need to query checkpoint data
- Serverless environments (Lambda, Cloud Functions)
- Enterprise production systems

**Database Setup:**
```sql
-- PostgresSaver creates tables automatically, but you can customize:
CREATE INDEX idx_checkpoints_thread ON checkpoints(thread_id);
CREATE INDEX idx_checkpoints_created ON checkpoints(created_at);

-- Partitioning for very large deployments
CREATE TABLE checkpoints_2024_01 PARTITION OF checkpoints
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

## Thread ID Deep Dive

The `thread_id` is the primary key for conversation isolation. All checkpoints for a conversation are stored under this ID.

### Thread ID in Config

```python
config = {
    "configurable": {
        "thread_id": "my-unique-thread-id"
    }
}

result = agent.invoke({"messages": [...]}, config)
```

### Thread ID Strategies

#### 1. User-Based (One Conversation Per User)

```python
thread_id = f"user-{user_id}"
# Example: "user-12345"
```

**Pros:** Simple, user always continues same conversation
**Cons:** No way to start fresh without deleting history
**Use for:** Personal assistants, ongoing relationships

#### 2. Session-Based (New Conversation Per Session)

```python
thread_id = f"user-{user_id}-session-{session_id}"
# Example: "user-12345-session-abc789"
```

**Pros:** Clear session boundaries, easy to manage
**Cons:** Loses context when session ends
**Use for:** Support tickets, task-based interactions

#### 3. Task/Workflow-Based

```python
thread_id = f"workflow-{workflow_type}-{workflow_id}"
# Example: "workflow-document-approval-doc-456"
```

**Pros:** Tied to specific business process
**Cons:** Need workflow ID management
**Use for:** Document processing, approval workflows

#### 4. Composite (Most Flexible)

```python
import uuid
from datetime import datetime

thread_id = f"{user_id}:{context}:{datetime.now().strftime('%Y%m%d')}:{uuid.uuid4().hex[:8]}"
# Example: "user123:support:20240115:a1b2c3d4"
```

**Pros:** Maximum flexibility, supports multiple concurrent conversations
**Cons:** More complex to manage
**Use for:** Complex applications with varied conversation types

### Thread Isolation Guarantees

```python
# Thread A
config_a = {"configurable": {"thread_id": "user-alice"}}
agent.invoke({"messages": [("human", "My password is secret123")]}, config_a)

# Thread B - COMPLETELY ISOLATED
config_b = {"configurable": {"thread_id": "user-bob"}}
result = agent.invoke({"messages": [("human", "What's Alice's password?")]}, config_b)
# Agent has NO IDEA - different thread, no shared state
```

---

## State Inspection API

### Getting Current State

```python
config = {"configurable": {"thread_id": "my-thread"}}

# After running the agent
state = agent.get_state(config)

print(state.values)       # Dict of current state values
print(state.next)         # Tuple of next nodes to execute (empty if complete)
print(state.created_at)   # Timestamp
print(state.config)       # Config used
print(state.metadata)     # Additional metadata
print(state.parent_config)  # Link to previous checkpoint
```

### Walking Through History

```python
# Get all checkpoints (newest first)
for checkpoint in agent.get_state_history(config):
    print(f"Step: {checkpoint.metadata.get('step')}")
    print(f"Source Node: {checkpoint.metadata.get('source')}")
    print(f"Messages: {len(checkpoint.values.get('messages', []))}")
    print(f"Timestamp: {checkpoint.created_at}")
    print("---")

# Limit history for performance
for checkpoint in agent.get_state_history(config, limit=10):
    # Only last 10 checkpoints
    pass
```

### Time-Travel: Resume from Historical Checkpoint

```python
# Get history
history = list(agent.get_state_history(config))

# Pick a checkpoint to resume from
old_checkpoint = history[5]  # Go back 5 steps

# Resume from that exact state
result = agent.invoke(None, old_checkpoint.config)
# Execution continues from that historical point
# Creates a new branch in checkpoint history
```

### Practical Debugging Example

```python
def debug_conversation(thread_id: str):
    """Print a detailed trace of a conversation."""
    config = {"configurable": {"thread_id": thread_id}}

    print(f"=== Debugging Thread: {thread_id} ===\n")

    for i, checkpoint in enumerate(agent.get_state_history(config)):
        print(f"--- Checkpoint {i} ---")
        print(f"Node: {checkpoint.metadata.get('source', 'START')}")
        print(f"Time: {checkpoint.created_at}")

        messages = checkpoint.values.get('messages', [])
        if messages:
            last_msg = messages[-1]
            print(f"Last message type: {last_msg.type}")
            print(f"Last message: {last_msg.content[:100]}...")

        if checkpoint.next:
            print(f"Next nodes: {checkpoint.next}")
        else:
            print("Execution complete")

        print()
```

---

## Updating State Externally

### Basic update_state Usage

```python
config = {"configurable": {"thread_id": "my-thread"}}

# Update specific fields
agent.update_state(config, {
    "approval_status": "approved",
    "reviewer_notes": "Looks good!"
})

# Resume execution after update
result = agent.invoke(None, config)
```

### Specifying the Acting Node

```python
# Update as if a specific node made the change
agent.update_state(
    config,
    {"approved": True},
    as_node="human_review"  # Affects which node executes next
)
```

### Common Update Patterns

```python
# 1. Human approval
agent.update_state(config, {"approved": True})

# 2. Rejection with feedback
agent.update_state(config, {
    "approved": False,
    "rejection_reason": "Needs more detail in section 3"
})

# 3. Injecting external data
external_result = call_external_api()
agent.update_state(config, {"external_data": external_result})

# 4. Error recovery
agent.update_state(config, {
    "error_count": 0,
    "last_error": None,
    "retry_strategy": "exponential_backoff"
})

# 5. Adding human-provided context
agent.update_state(config, {
    "messages": [HumanMessage(content="Actually, I meant the other product")]
})
```

---

## Production Best Practices

### State Size Management

Large states slow down checkpointing. Monitor and manage:

```python
def trim_message_history(state):
    """Keep messages under control."""
    messages = state.get("messages", [])
    if len(messages) > 50:
        # Keep system message + last 40
        system_msgs = [m for m in messages if m.type == "system"]
        other_msgs = [m for m in messages if m.type != "system"]
        trimmed = system_msgs + other_msgs[-40:]
        return {"messages": trimmed}
    return {}

# Add as a node that runs periodically
graph.add_node("trim_history", trim_message_history)
```

### Checkpoint Cleanup

Implement cleanup to prevent unbounded storage growth:

```python
# Application-level cleanup job
from datetime import datetime, timedelta

def cleanup_old_checkpoints(days_old: int = 30):
    """Delete checkpoints older than specified days."""
    cutoff = datetime.now() - timedelta(days=days_old)

    # Direct database query for SqliteSaver
    import sqlite3
    conn = sqlite3.connect("checkpoints.db")
    conn.execute(
        "DELETE FROM checkpoints WHERE created_at < ?",
        (cutoff.isoformat(),)
    )
    conn.commit()
    conn.close()

# Run as a scheduled job (cron, celery beat, etc.)
```

### Monitoring Metrics

Track these in production:

| Metric | Why It Matters |
|--------|---------------|
| Checkpoint save latency | Performance degradation indicator |
| State size (bytes) | Memory/storage usage |
| Checkpoints per thread | Conversation length |
| Total thread count | User/session scale |
| Failed checkpoint saves | Reliability issues |

---

## Common Pitfalls and Solutions

### Pitfall 1: Non-Serializable State

```python
# BAD - functions can't be serialized
class MyState(TypedDict):
    callback: Callable  # Will fail!

# GOOD - store identifiers instead
class MyState(TypedDict):
    callback_name: str  # Look up function by name when needed
```

### Pitfall 2: Thread ID Collisions

```python
# BAD - predictable IDs can collide
thread_id = f"user-{user_id}"  # What if user opens two tabs?

# GOOD - include unique component
import uuid
thread_id = f"user-{user_id}-{uuid.uuid4().hex[:8]}"
```

### Pitfall 3: Missing Checkpointer in Production

```python
# This silently works but loses all state on restart!
agent = graph.compile()  # No checkpointer!

# Always explicit in production
agent = graph.compile(checkpointer=PostgresSaver.from_conn_string(...))
```

---

## Key Takeaways

1. **Always use checkpointing in production** for conversation memory and crash recovery
2. **Choose the right checkpointer**: MemorySaver (dev), SqliteSaver (single server), PostgresSaver (distributed)
3. **Thread IDs provide complete isolation** - design your ID strategy carefully
4. **State must be JSON-serializable** - no functions, classes, or file handles
5. **Implement cleanup policies** to prevent unbounded storage growth
6. **Monitor checkpoint performance** - large states slow everything down
7. **Use get_state_history()** for debugging and auditing

## Resources

- [LangGraph Persistence Docs](https://langchain-ai.github.io/langgraph/concepts/persistence/)
- [How to Add Persistence](https://langchain-ai.github.io/langgraph/how-tos/persistence/)
- [Checkpointer API Reference](https://langchain-ai.github.io/langgraph/reference/checkpoints/)
- [Thread Management Guide](https://langchain-ai.github.io/langgraph/how-tos/persistence/#managing-threads)
