# A2A JavaScript/TypeScript SDK - Summary

> Source: [a2a-js GitHub](https://github.com/a2aproject/a2a-js)

## Overview

The official JavaScript/TypeScript SDK for building A2A-compatible agents. Full TypeScript support with type definitions, works in Node.js and modern browsers.

## Installation

```bash
npm install @a2a-js/sdk
# or
yarn add @a2a-js/sdk
```

## Client Usage

### Basic Client

```typescript
import { A2AClient, Message, Part } from '@a2a-js/sdk';

const client = new A2AClient({
  baseUrl: 'https://agent.example.com',
  apiKey: 'your-api-key'
});

// Discover capabilities
const card = await client.getAgentCard();
console.log(`Agent: ${card.name}`);
console.log(`Skills: ${card.skills.map(s => s.name)}`);

// Send a message
const response = await client.sendMessage({
  message: {
    role: 'ROLE_USER',
    parts: [{ text: 'Hello, agent!' }]
  }
});

console.log(`Task ID: ${response.task.id}`);
console.log(`Status: ${response.task.status.state}`);
```

### Streaming

```typescript
const stream = client.sendStreamingMessage({
  message: {
    role: 'ROLE_USER',
    parts: [{ text: 'Tell me a story' }]
  }
});

for await (const event of stream) {
  if (event.statusUpdate) {
    console.log(`Status: ${event.statusUpdate.status.state}`);
  }
  if (event.artifactUpdate) {
    const text = event.artifactUpdate.artifact.parts
      .filter(p => p.text)
      .map(p => p.text)
      .join('');
    console.log(`Output: ${text}`);
  }
}
```

### Multi-Turn Conversations

```typescript
// Start conversation
let response = await client.sendMessage({
  message: { role: 'ROLE_USER', parts: [{ text: 'Book a flight' }] }
});

// Handle clarification
if (response.task.status.state === 'TASK_STATE_INPUT_REQUIRED') {
  const question = response.task.status.message?.parts[0].text;
  console.log(`Agent asks: ${question}`);

  // Continue the conversation
  response = await client.sendMessage({
    message: {
      taskId: response.task.id,  // Reference existing task
      role: 'ROLE_USER',
      parts: [{ text: 'New York to London, next Friday' }]
    }
  });
}
```

## Server Usage

### Building an A2A Server

```typescript
import { A2AServer, AgentCard } from '@a2a-js/sdk';
import express from 'express';

const app = express();

const server = new A2AServer({
  card: {
    name: 'Calculator Agent',
    description: 'Performs calculations',
    version: '1.0.0',
    capabilities: { streaming: true },
    skills: [
      { id: 'calculate', name: 'Calculate', description: 'Math operations' }
    ]
  }
});

// Handle messages
server.onMessage(async (message, context) => {
  const text = message.parts.find(p => p.text)?.text || '';

  // Process and return result
  return {
    status: { state: 'TASK_STATE_COMPLETED' },
    artifacts: [{
      name: 'Result',
      parts: [{ text: `Calculated: ${eval(text)}` }]
    }]
  };
});

// Mount on Express
app.use('/', server.router());
app.listen(3000);
```

## TypeScript Types

```typescript
import type {
  AgentCard,
  Message,
  Part,
  Task,
  TaskState,
  Artifact,
  Skill,
  StreamEvent
} from '@a2a-js/sdk';

// Full type safety
const message: Message = {
  messageId: 'msg-001',
  role: 'ROLE_USER',
  parts: [{ text: 'Hello' }]
};

// Type-safe task states
function handleTask(task: Task) {
  switch (task.status.state) {
    case 'TASK_STATE_COMPLETED':
      return task.artifacts;
    case 'TASK_STATE_INPUT_REQUIRED':
      return task.status.message;
    case 'TASK_STATE_FAILED':
      throw new Error(task.status.message?.parts[0].text);
  }
}
```

## Browser Usage

```typescript
// Works in browsers with fetch support
import { A2AClient } from '@a2a-js/sdk/browser';

const client = new A2AClient({
  baseUrl: 'https://agent.example.com',
  // Browser-compatible auth
  headers: {
    'Authorization': `Bearer ${sessionToken}`
  }
});
```

## Configuration Options

```typescript
const client = new A2AClient({
  baseUrl: 'https://agent.example.com',

  // Authentication
  apiKey: 'key',
  // or
  oauth: {
    tokenUrl: 'https://auth.example.com/token',
    clientId: 'id',
    clientSecret: 'secret'
  },

  // Timeouts
  timeout: 30000,
  streamTimeout: 300000,

  // Retries
  retries: 3,
  retryDelay: 1000,

  // Custom fetch (for testing)
  fetch: customFetch
});
```

## Error Handling

```typescript
import {
  A2AError,
  TaskNotFoundError,
  AuthenticationError
} from '@a2a-js/sdk';

try {
  await client.sendMessage(message);
} catch (error) {
  if (error instanceof TaskNotFoundError) {
    console.log('Task not found');
  } else if (error instanceof AuthenticationError) {
    console.log('Auth failed');
  } else if (error instanceof A2AError) {
    console.log(`A2A error: ${error.code}`);
  }
}
```

## Best Practices

1. **Use TypeScript** - Full type safety catches errors at compile time
2. **Handle all states** - Especially INPUT_REQUIRED for multi-turn flows
3. **Stream long tasks** - Better UX than polling
4. **Validate cards** - Verify signatures before trusting agent capabilities
5. **Graceful degradation** - Fall back when streaming isn't supported
