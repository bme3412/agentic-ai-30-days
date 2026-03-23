# A2A Sample Implementations - Summary

> Source: [a2a-samples GitHub](https://github.com/a2aproject/a2a-samples)

## Overview

Reference implementations and example agents demonstrating A2A protocol patterns. Covers common use cases from simple echo agents to production-ready multi-agent systems.

## Repository Structure

```
a2a-samples/
├── python/
│   ├── basic/           # Simple examples
│   ├── multi-turn/      # Conversation handling
│   ├── streaming/       # SSE implementations
│   └── production/      # Full-featured agents
├── typescript/
│   ├── basic/
│   ├── express/         # Express.js integration
│   └── nextjs/          # Next.js integration
├── go/
│   └── ...
└── multi-agent/         # Agent coordination examples
```

## Basic Examples

### Echo Agent (Python)

```python
from a2a.server import A2AServer

server = A2AServer(name="Echo Agent")

@server.on_message
async def echo(message, ctx):
    text = message.parts[0].text
    return {
        "status": {"state": "TASK_STATE_COMPLETED"},
        "artifacts": [{
            "parts": [{"text": f"Echo: {text}"}]
        }]
    }
```

### Calculator Agent (TypeScript)

```typescript
server.onMessage(async (msg) => {
  const expr = msg.parts[0].text;
  const result = safeEval(expr);

  return {
    status: { state: 'TASK_STATE_COMPLETED' },
    artifacts: [{
      name: 'Calculation',
      parts: [
        { text: `${expr} = ${result}` },
        { data: { expression: expr, result } }
      ]
    }]
  };
});
```

## Multi-Turn Examples

### Booking Agent with Clarification

```python
@server.on_message
async def handle_booking(message, ctx):
    intent = parse_intent(message)

    if not intent.destination:
        return {
            "status": {
                "state": "TASK_STATE_INPUT_REQUIRED",
                "message": {
                    "parts": [{"text": "Where would you like to travel?"}]
                }
            }
        }

    if not intent.dates:
        return {
            "status": {
                "state": "TASK_STATE_INPUT_REQUIRED",
                "message": {
                    "parts": [{"text": "What dates work for you?"}]
                }
            }
        }

    # All info gathered, complete booking
    booking = await create_booking(intent)
    return {
        "status": {"state": "TASK_STATE_COMPLETED"},
        "artifacts": [format_booking(booking)]
    }
```

## Streaming Examples

### Research Agent with Progress

```python
@server.on_streaming_message
async def research(message, ctx):
    query = message.parts[0].text

    # Initial acknowledgment
    yield {"status": {"state": "TASK_STATE_WORKING"}}

    # Search phase
    yield {"status": {
        "state": "TASK_STATE_WORKING",
        "message": {"parts": [{"text": "Searching sources..."}]}
    }}
    results = await search(query)

    # Analysis phase
    yield {"status": {
        "state": "TASK_STATE_WORKING",
        "message": {"parts": [{"text": "Analyzing results..."}]}
    }}
    analysis = await analyze(results)

    # Complete
    yield {
        "status": {"state": "TASK_STATE_COMPLETED"},
        "artifacts": [{
            "name": "Research Report",
            "parts": [{"text": analysis}]
        }]
    }
```

## Multi-Agent Examples

### Orchestrator Pattern

```python
class OrchestratorAgent:
    def __init__(self):
        self.research = A2AClient("https://research.example.com")
        self.writer = A2AClient("https://writer.example.com")

    async def handle_request(self, topic):
        # Delegate research
        research_task = await self.research.send_message({
            "parts": [{"text": f"Research: {topic}"}]
        })

        # Wait for completion
        research_result = await self.wait_for_completion(research_task)

        # Delegate writing
        write_task = await self.writer.send_message({
            "parts": [
                {"text": "Write article from this research"},
                {"data": research_result}
            ]
        })

        return await self.wait_for_completion(write_task)
```

### Handoff Pattern

```python
# Customer service with escalation
@server.on_message
async def handle_support(message, ctx):
    intent = classify(message)

    if intent == "billing":
        # Handoff to billing agent
        return {
            "status": {"state": "TASK_STATE_COMPLETED"},
            "artifacts": [{
                "parts": [{
                    "data": {
                        "handoff": "https://billing.example.com",
                        "context": ctx.to_dict()
                    }
                }]
            }]
        }

    # Handle directly
    return await handle_general_support(message)
```

## Production Patterns

### Authentication Middleware

```python
@server.middleware
async def auth_middleware(request, handler):
    token = request.headers.get("Authorization")
    if not validate_token(token):
        raise AuthenticationError("Invalid token")
    return await handler(request)
```

### Rate Limiting

```python
from a2a.middleware import RateLimiter

server.use(RateLimiter(
    requests_per_minute=60,
    requests_per_day=10000
))
```

### Logging and Tracing

```python
from a2a.tracing import OpenTelemetryMiddleware

server.use(OpenTelemetryMiddleware(
    service_name="my-agent",
    endpoint="http://jaeger:4317"
))
```

## Deployment Examples

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "-m", "a2a.server", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-a2a-agent
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: agent
        image: my-agent:latest
        ports:
        - containerPort: 8000
        env:
        - name: A2A_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: a2a-secrets
              key: auth-secret
```

## Best Practices from Samples

1. **Start simple** - Begin with basic examples, add complexity incrementally
2. **Handle all states** - Every sample demonstrates proper state handling
3. **Use streaming wisely** - For tasks > 5 seconds
4. **Test multi-turn flows** - Edge cases in conversation handling
5. **Deploy with observability** - All production samples include tracing
