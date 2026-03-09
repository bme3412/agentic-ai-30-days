# LangGraph Conditional Routing

> Patterns for dynamic control flow in agent workflows

## Routing Fundamentals

Conditional routing lets your graph make decisions at runtime. Instead of following a fixed path, edges evaluate state and choose the next node dynamically.

## Basic Conditional Edge Pattern

```python
from typing import Literal

def route_by_type(state: AgentState) -> Literal["handler_a", "handler_b", "fallback"]:
    """Examine state and return the next node name."""
    task = state.get("task_type")

    if task == "type_a":
        return "handler_a"
    elif task == "type_b":
        return "handler_b"
    else:
        return "fallback"

# Add the conditional edge
graph.add_conditional_edges(
    "classifier",           # Source node
    route_by_type,          # Routing function
    {                       # Mapping of return values to node names
        "handler_a": "handler_a",
        "handler_b": "handler_b",
        "fallback": "fallback"
    }
)
```

## Common Routing Patterns

### 1. Tool Call Check

The most common pattern - check if the LLM wants to call tools:

```python
def should_call_tools(state: AgentState) -> Literal["tools", "end"]:
    last_message = state["messages"][-1]

    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "end"

graph.add_conditional_edges(
    "agent",
    should_call_tools,
    {"tools": "tool_executor", "end": END}
)
```

### 2. Error Recovery

Route to fallback when errors accumulate:

```python
def check_errors(state: AgentState) -> Literal["continue", "fallback", "abort"]:
    error_count = state.get("error_count", 0)

    if error_count >= 5:
        return "abort"
    elif error_count >= 2:
        return "fallback"
    return "continue"
```

### 3. Human-in-the-Loop

Route for human approval when confidence is low:

```python
def needs_approval(state: AgentState) -> Literal["approve", "auto"]:
    confidence = state.get("confidence", 1.0)
    is_sensitive = state.get("is_sensitive_action", False)

    if confidence < 0.8 or is_sensitive:
        return "approve"
    return "auto"
```

### 4. Multi-Path Classification

Route to specialized handlers based on input type:

```python
def classify_request(state: AgentState) -> Literal["search", "calculate", "code", "chat"]:
    user_input = state["messages"][-1].content.lower()

    if any(w in user_input for w in ["search", "find", "look up"]):
        return "search"
    elif any(w in user_input for w in ["calculate", "compute", "math"]):
        return "calculate"
    elif any(w in user_input for w in ["code", "program", "function"]):
        return "code"
    return "chat"
```

### 5. Iteration Limit

Prevent infinite loops with iteration counting:

```python
def check_iteration(state: AgentState) -> Literal["continue", "stop"]:
    MAX_ITERATIONS = 10

    if state.get("iteration", 0) >= MAX_ITERATIONS:
        return "stop"
    return "continue"
```

## Best Practices

### 1. Use Literal Type Hints

Helps catch routing errors at development time:

```python
# Good - type checker catches typos
def route(state) -> Literal["node_a", "node_b"]:
    return "node_a"

# Bad - no type safety
def route(state) -> str:
    return "node_a"  # Typo here won't be caught
```

### 2. Keep Routing Logic Simple

Routing functions should read flags, not compute them:

```python
# Good - reads pre-computed flag
def route(state) -> Literal["a", "b"]:
    return "a" if state["should_use_a"] else "b"

# Bad - computes in routing function
def route(state) -> Literal["a", "b"]:
    result = expensive_computation(state["data"])
    return "a" if result > 0.5 else "b"
```

### 3. Handle All Cases

Always have a fallback for unexpected values:

```python
def route(state) -> Literal["a", "b", "fallback"]:
    task = state.get("task_type")

    if task == "type_a":
        return "a"
    elif task == "type_b":
        return "b"
    else:
        return "fallback"  # Don't leave this out!
```

### 4. Match Node Names Exactly

The routing function return value must match a node name:

```python
# If you have these nodes:
graph.add_node("process_data", process_fn)
graph.add_node("validate_result", validate_fn)

# Your routing must return these exact names:
def route(state) -> Literal["process_data", "validate_result"]:
    ...
```

## Debugging Routing

Add logging to understand routing decisions:

```python
def route_with_logging(state) -> Literal["a", "b"]:
    decision = "a" if state["flag"] else "b"
    print(f"Routing decision: {decision} (flag={state['flag']})")
    return decision
```
