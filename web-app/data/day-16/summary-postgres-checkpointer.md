# PostgresSaver: Production Checkpointing

## Overview

PostgresSaver is the production-grade checkpointer for LangGraph, providing durable state persistence across restarts, deployments, and multiple instances.

## Installation

```bash
pip install langgraph-checkpoint-postgres psycopg[binary]
```

## Database Setup

PostgresSaver requires specific tables. Use the setup() method to create them:

```python
from langgraph.checkpoint.postgres import PostgresSaver
import psycopg

DB_URI = "postgresql://user:password@localhost:5432/langgraph"

with psycopg.connect(DB_URI) as conn:
    saver = PostgresSaver(conn)
    saver.setup()  # Creates checkpoint tables
```

### Schema

PostgresSaver creates these tables:
- `checkpoints` - Stores checkpoint data
- `checkpoint_writes` - Tracks pending writes
- `checkpoint_blobs` - Stores serialized state

## Sync Usage

```python
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import StateGraph, MessagesState
import psycopg

DB_URI = "postgresql://user:password@localhost:5432/langgraph"

# Build your graph
builder = StateGraph(MessagesState)
builder.add_node("agent", agent_function)
builder.add_edge("__start__", "agent")
builder.add_edge("agent", "__end__")

# Connect and use
with psycopg.connect(DB_URI) as conn:
    saver = PostgresSaver(conn)
    graph = builder.compile(checkpointer=saver)

    config = {"configurable": {"thread_id": "user-abc-session-1"}}
    result = graph.invoke(
        {"messages": [("user", "Hello!")]},
        config
    )
```

## Async Usage (Recommended for Production)

```python
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
import asyncio

DB_URI = "postgresql://user:password@localhost:5432/langgraph"

async def main():
    # Connection pool for better performance
    async with AsyncConnectionPool(
        DB_URI,
        min_size=5,
        max_size=20
    ) as pool:
        saver = AsyncPostgresSaver(pool)
        await saver.setup()

        graph = builder.compile(checkpointer=saver)

        config = {"configurable": {"thread_id": "user-xyz"}}
        result = await graph.ainvoke(
            {"messages": [("user", "Hello!")]},
            config
        )

asyncio.run(main())
```

## Connection Pooling

For production workloads, always use connection pooling:

```python
from psycopg_pool import AsyncConnectionPool

# Recommended pool settings
pool = AsyncConnectionPool(
    conninfo=DB_URI,
    min_size=5,        # Minimum connections to maintain
    max_size=20,       # Maximum connections
    max_idle=300,      # Close idle connections after 5 minutes
    max_lifetime=3600, # Reconnect after 1 hour
    timeout=30         # Connection timeout
)
```

## Thread ID Strategies

Thread IDs organize conversations. Common patterns:

```python
import uuid
from datetime import datetime

# User + Session pattern
thread_id = f"user-{user_id}-session-{session_id}"

# UUID for anonymous sessions
thread_id = f"anon-{uuid.uuid4()}"

# Time-based for debugging
thread_id = f"user-{user_id}-{datetime.now().isoformat()}"
```

## Checkpoint Cleanup

Checkpoints accumulate over time. Implement retention:

```python
from datetime import datetime, timedelta
import psycopg

async def cleanup_old_checkpoints(
    pool: AsyncConnectionPool,
    retention_days: int = 30
):
    """Remove checkpoints older than retention period."""
    cutoff = datetime.now() - timedelta(days=retention_days)

    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                DELETE FROM checkpoints
                WHERE created_at < %s
            """, (cutoff,))
            deleted = cur.rowcount

    return deleted
```

## State Inspection

Query checkpoint state for debugging:

```python
async def get_thread_history(
    graph,
    thread_id: str
) -> list:
    """Get all checkpoints for a thread."""
    config = {"configurable": {"thread_id": thread_id}}

    history = []
    async for state in graph.aget_state_history(config):
        history.append({
            "checkpoint_id": state.config["configurable"]["checkpoint_id"],
            "step": state.metadata.get("step"),
            "messages": len(state.values.get("messages", [])),
            "next": state.next
        })

    return history
```

## Production Configuration

```python
import os
from dataclasses import dataclass

@dataclass
class CheckpointerConfig:
    host: str = os.getenv("PG_HOST", "localhost")
    port: int = int(os.getenv("PG_PORT", "5432"))
    database: str = os.getenv("PG_DATABASE", "langgraph")
    user: str = os.getenv("PG_USER", "postgres")
    password: str = os.getenv("PG_PASSWORD", "")

    # Pool settings
    min_connections: int = 5
    max_connections: int = 20

    @property
    def connection_string(self) -> str:
        return (
            f"postgresql://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.database}"
        )

async def create_checkpointer(config: CheckpointerConfig):
    pool = AsyncConnectionPool(
        config.connection_string,
        min_size=config.min_connections,
        max_size=config.max_connections
    )

    saver = AsyncPostgresSaver(pool)
    await saver.setup()

    return saver, pool
```

## Error Handling

```python
from psycopg import OperationalError, InterfaceError

async def invoke_with_retry(
    graph,
    input_data,
    config,
    max_retries: int = 3
):
    """Invoke graph with connection retry logic."""
    for attempt in range(max_retries):
        try:
            return await graph.ainvoke(input_data, config)
        except (OperationalError, InterfaceError) as e:
            if attempt == max_retries - 1:
                raise
            # Connection error, retry
            await asyncio.sleep(2 ** attempt)

    raise RuntimeError("Max retries exceeded")
```

## Monitoring

Track checkpoint operations:

```python
import structlog
from functools import wraps

logger = structlog.get_logger()

def monitor_checkpoints(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = await func(*args, **kwargs)
            logger.info(
                "checkpoint_operation",
                operation=func.__name__,
                duration_ms=(time.time() - start) * 1000
            )
            return result
        except Exception as e:
            logger.error(
                "checkpoint_error",
                operation=func.__name__,
                error=str(e)
            )
            raise
    return wrapper
```

## Migration from MemorySaver

When moving from development to production:

```python
# Development
from langgraph.checkpoint.memory import MemorySaver
checkpointer = MemorySaver()

# Production - just swap the checkpointer
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
checkpointer = AsyncPostgresSaver(pool)
await checkpointer.setup()

# Graph code stays the same
graph = builder.compile(checkpointer=checkpointer)
```

## Best Practices

1. **Use async for production** - Better concurrency with AsyncPostgresSaver
2. **Connection pooling is essential** - Never create connections per request
3. **Implement checkpoint cleanup** - Old checkpoints consume storage
4. **Use environment variables** - Never hardcode credentials
5. **Monitor performance** - Track checkpoint operation times
6. **Handle connection failures** - Implement retry logic
7. **Test failover** - Verify behavior during database restarts

## References

- [PostgresSaver Documentation](https://langchain-ai.github.io/langgraph/reference/checkpoints/#langgraph.checkpoint.postgres.PostgresSaver)
- [Psycopg 3 Documentation](https://www.psycopg.org/psycopg3/docs/)
- [Connection Pooling Best Practices](https://www.psycopg.org/psycopg3/docs/advanced/pool.html)
