# A2A DeepLearning.AI Course - Summary

> Source: [DeepLearning.AI A2A Course](https://goo.gle/dlai-a2a)

## Overview

A hands-on course for building A2A-compatible agents, created in partnership with Google. Covers the protocol fundamentals, implementation patterns, and production deployment in approximately 2-3 hours.

## Course Structure

### Module 1: A2A Fundamentals
- The agent interoperability problem
- A2A protocol overview
- Comparison with MCP and other protocols
- Agent Cards and discovery mechanism

### Module 2: Building Your First Agent
- Setting up the development environment
- Creating an Agent Card
- Implementing message handlers
- Task lifecycle management

### Module 3: Communication Patterns
- Synchronous request-response
- Streaming with Server-Sent Events
- Push notifications and webhooks
- Handling multi-turn conversations

### Module 4: Multi-Agent Systems
- Agent discovery and selection
- Delegating tasks between agents
- Orchestration patterns
- Context preservation across handoffs

### Module 5: Production Deployment
- Security and authentication
- Monitoring and observability
- Scaling considerations
- Error handling and recovery

## Key Concepts Covered

### Agent Card Design

```json
{
  "name": "Weather Agent",
  "description": "Provides weather information",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "forecast",
      "name": "Weather Forecast",
      "inputModes": ["text"],
      "outputModes": ["text", "data"]
    }
  ]
}
```

### Task State Machine

```
SUBMITTED → WORKING → COMPLETED
                   ↘ FAILED
                   ↘ INPUT_REQUIRED → WORKING
                   ↘ AUTH_REQUIRED → WORKING
```

### Message Structure

```python
message = {
    "role": "ROLE_USER",
    "parts": [
        {"text": "What's the weather?"},
        {"data": {"location": "Tokyo"}}
    ]
}
```

## Hands-On Labs

### Lab 1: Echo Agent
Build a simple agent that echoes messages back. Learn:
- Server setup
- Agent Card configuration
- Basic message handling

### Lab 2: Calculator with State
Build a calculator that remembers context. Learn:
- Multi-turn conversations
- INPUT_REQUIRED state
- Context management

### Lab 3: Research Assistant
Build an agent that searches and synthesizes. Learn:
- Streaming responses
- Long-running tasks
- Artifact generation

### Lab 4: Agent Orchestration
Build a system with multiple collaborating agents. Learn:
- A2A client usage
- Task delegation
- Result aggregation

## Code Templates

### Basic Server Template

```python
from a2a.server import A2AServer

server = A2AServer(
    name="My Agent",
    description="Description here"
)

@server.on_message
async def handle(message, context):
    # Your logic here
    return {
        "status": {"state": "TASK_STATE_COMPLETED"},
        "artifacts": [...]
    }

if __name__ == "__main__":
    server.run(port=8000)
```

### Client Template

```python
from a2a import A2AClient

client = A2AClient("https://agent.example.com")

# Discover
card = await client.get_agent_card()

# Communicate
response = await client.send_message({
    "role": "ROLE_USER",
    "parts": [{"text": "Hello"}]
})
```

## Learning Outcomes

By the end of this course, you will be able to:

1. **Design Agent Cards** - Define capabilities, skills, and interfaces
2. **Implement A2A Servers** - Handle messages, manage tasks, stream responses
3. **Build A2A Clients** - Discover agents, send messages, process results
4. **Handle Multi-Turn Flows** - Manage INPUT_REQUIRED and AUTH_REQUIRED states
5. **Orchestrate Multi-Agent Systems** - Coordinate multiple agents effectively
6. **Deploy Production Agents** - Security, monitoring, and scaling

## Prerequisites

- Python or JavaScript experience
- Basic understanding of HTTP/REST APIs
- Familiarity with async programming
- (Optional) Prior agent framework experience

## Resources Provided

- Jupyter notebooks for all labs
- Reference implementations
- Agent Card templates
- Deployment configurations
- Troubleshooting guide

## Certification

Complete all labs and pass the final assessment to receive a DeepLearning.AI certificate of completion.
