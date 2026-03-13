# AutoGen Documentation Summary

> Source: [Microsoft AutoGen Documentation](https://microsoft.github.io/autogen/stable/)

## Overview

AutoGen is a framework for building multi-agent AI applications where agents collaborate through conversation. Unlike task-based frameworks, AutoGen agents exchange messages dynamically, propose solutions, execute code, and iterate until problems are solved.

## Core Concepts

### Agent Types

**ConversableAgent** - The base class for all agents:
- Can send and receive messages
- Optionally powered by an LLM
- Configurable human input modes
- Foundation for all other agent types

**AssistantAgent** - LLM-powered agent:
- Generates responses using configured LLM
- Optimized for code generation tasks
- Default system message instructs proper code formatting
- Can suggest tool/function calls

**UserProxyAgent** - Human proxy and executor:
- Executes code from conversations
- Manages human-in-the-loop interaction
- Doesn't require an LLM
- Handles termination logic

### Conversation Patterns

**Two-Agent Chat**:
```python
user_proxy.initiate_chat(assistant, message="Task description")
```
- One agent initiates, both converse
- Continues until termination condition met
- Code can be executed and results returned

**GroupChat**:
- Multiple agents in a shared conversation
- GroupChatManager selects next speaker
- Uses LLM for dynamic speaker selection
- Supports transition rules

### Code Execution

**Docker (Recommended)**:
- Isolated container execution
- Prevents unsafe code from affecting host
- Configurable images and dependencies

**Local Execution**:
- Runs directly on host machine
- Use with caution
- Virtual environments recommended

### Human Input Modes

| Mode | Behavior |
|------|----------|
| ALWAYS | Human approves every response |
| TERMINATE | Human involved at conversation end |
| NEVER | Fully autonomous execution |

### Tool/Function Calling

Register functions for agents to call:
```python
register_function(
    my_function,
    caller=assistant,     # Who suggests calls
    executor=user_proxy,  # Who executes
    name="tool_name",
    description="What it does"
)
```

## Key Configuration Options

- `llm_config`: LLM settings (model, API key, temperature)
- `code_execution_config`: Docker/local execution settings
- `is_termination_msg`: Function to detect conversation end
- `max_consecutive_auto_reply`: Prevent infinite loops
- `system_message`: Agent instructions

## Best Practices

1. **Use Docker** for code execution in production
2. **Set timeouts** to prevent runaway processes
3. **Configure termination** conditions carefully
4. **Clear system messages** improve agent behavior
5. **Start with TERMINATE mode** before going fully autonomous

## Version Notes

- AutoGen 0.2.x: Original API (stable, widely documented)
- AutoGen 0.4+: Complete redesign with actor-based model
- AG2: Community fork maintaining 0.2 compatibility
