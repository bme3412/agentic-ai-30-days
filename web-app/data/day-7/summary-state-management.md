# LangGraph State Management

> Deep dive into state design patterns and best practices

## State Fundamentals

State is a **typed data structure** that flows through your graph. Every node reads from state and writes updates back to it.

### Defining State with TypedDict

```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # Messages accumulate (append behavior)
    messages: Annotated[list, add_messages]

    # Simple fields replace on update
    current_step: str
    iteration_count: int

    # Optional fields
    error: str | None
```

### State Reducers

When multiple updates target the same field, reducers define how they combine:

| Reducer | Behavior | Use Case |
|---------|----------|----------|
| `add_messages` | Append to list | Chat history |
| `operator.add` | Concatenate | Accumulating results |
| Default (none) | Replace | Single values |

```python
from operator import add
from typing import Annotated

class State(TypedDict):
    # Each update appends to the list
    messages: Annotated[list, add_messages]

    # Each update adds to the count
    token_count: Annotated[int, add]

    # Each update replaces the value
    status: str
```

## State Design Patterns

### 1. Conversation State

For chat-based agents:

```python
class ConversationState(TypedDict):
    messages: Annotated[list, add_messages]
    user_id: str
    session_id: str
```

### 2. Task State

For multi-step workflows:

```python
class TaskState(TypedDict):
    messages: Annotated[list, add_messages]
    task_type: str
    current_step: str
    completed_steps: list[str]
    result: str | None
    error: str | None
```

### 3. Agent State with Tool Tracking

For tool-calling agents:

```python
class ToolAgentState(TypedDict):
    messages: Annotated[list, add_messages]
    iteration: int
    tool_calls_made: list[str]
    final_answer: str | None
```

## Best Practices

### Do's

1. **Use type hints**: Makes state predictable and debuggable
2. **Use `add_messages` for chat history**: Prevents message loss
3. **Track iterations**: Prevent infinite loops
4. **Include error fields**: Enable graceful error handling
5. **Keep state serializable**: Required for checkpointing

### Don'ts

1. **Don't store large objects**: Keep embeddings, files, etc. as references
2. **Don't use lambdas in state**: Not serializable
3. **Don't rely on external state**: Everything should be in the graph state
4. **Don't forget None handling**: Optional fields need null checks

## State and Checkpointing

State must be serializable for persistence:

```python
# Good - serializable
class GoodState(TypedDict):
    messages: list
    count: int
    data: dict

# Bad - not serializable
class BadState(TypedDict):
    messages: list
    callback: Callable  # Can't serialize
    file_handle: IO     # Can't serialize
```

## Debugging State

Use `return_intermediate_steps` or inspect state at each node:

```python
def debug_node(state):
    print(f"Current state: {state}")
    return {}  # No updates, just inspection

graph.add_node("debug", debug_node)
```
