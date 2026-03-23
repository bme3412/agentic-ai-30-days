# A2A Python SDK - Summary

> Source: [a2a-python GitHub](https://github.com/a2aproject/a2a-python)

## Overview

The official Python SDK for building A2A-compatible agents. Provides both client and server implementations with full support for all A2A protocol features including streaming, push notifications, and multi-turn conversations.

## Installation

```bash
pip install a2a-sdk
```

## Core Components

### A2AClient

Connect to and communicate with remote A2A agents.

```python
from a2a import A2AClient, Message, Part

client = A2AClient(
    base_url="https://agent.example.com",
    api_key="your-api-key"
)

# Discover agent capabilities
card = await client.get_agent_card()
print(f"Agent: {card.name}")
print(f"Skills: {[s.name for s in card.skills]}")

# Send a message
response = await client.send_message(
    message=Message(
        role="ROLE_USER",
        parts=[Part(text="What's the weather in Tokyo?")]
    )
)

task = response.task
print(f"Status: {task.status.state}")
```

### Streaming Support

Real-time updates for long-running tasks:

```python
stream = await client.send_streaming_message(
    message=Message(
        role="ROLE_USER",
        parts=[Part(text="Research AI trends")]
    )
)

async for event in stream:
    if event.status_update:
        print(f"Status: {event.status_update.status.state}")
    if event.artifact_update:
        print(f"Result: {event.artifact_update.artifact}")
```

### A2AServer

Build your own A2A-compatible agent:

```python
from a2a.server import A2AServer, AgentCard, Skill

server = A2AServer(
    card=AgentCard(
        name="My Agent",
        description="A helpful assistant",
        skills=[
            Skill(id="chat", name="Chat", description="General conversation")
        ]
    )
)

@server.on_message
async def handle_message(message, context):
    # Process the message
    return TaskResult(
        status="TASK_STATE_COMPLETED",
        artifacts=[Artifact(parts=[Part(text="Hello!")])]
    )

# Run the server
server.run(host="0.0.0.0", port=8000)
```

## Key Features

| Feature | Support |
|---------|---------|
| Sync/Async | Both |
| Streaming (SSE) | Yes |
| Push Notifications | Yes |
| Multi-turn | Yes |
| OAuth2 | Yes |
| mTLS | Yes |

## Authentication

```python
# API Key
client = A2AClient(base_url="...", api_key="...")

# OAuth2
client = A2AClient(
    base_url="...",
    oauth_config={
        "token_url": "https://auth.example.com/token",
        "client_id": "...",
        "client_secret": "..."
    }
)

# Custom headers
client = A2AClient(
    base_url="...",
    headers={"Authorization": "Bearer token"}
)
```

## Task Management

```python
# Get task status
task = await client.get_task(task_id)

# Cancel a task
await client.cancel_task(task_id)

# List tasks in a context
tasks = await client.list_tasks(context_id=ctx_id)
```

## Error Handling

```python
from a2a.exceptions import (
    A2AError,
    TaskNotFoundError,
    AuthenticationError,
    RateLimitError
)

try:
    response = await client.send_message(message)
except TaskNotFoundError:
    print("Task not found")
except AuthenticationError:
    print("Invalid credentials")
except RateLimitError as e:
    print(f"Rate limited, retry after {e.retry_after}s")
```

## Best Practices

1. **Reuse clients** - Create one client instance per remote agent
2. **Handle all task states** - Especially INPUT_REQUIRED and AUTH_REQUIRED
3. **Use streaming for UX** - Show progress for tasks > 5 seconds
4. **Implement retries** - Use exponential backoff for transient failures
5. **Validate Agent Cards** - Check signatures in production
