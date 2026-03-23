import type { Day } from '../../types';

export const day21: Day = {
  day: 21,
  phase: 4,
  title: "A2A: Agent-to-Agent Protocol",
  partner: "Google Cloud",
  tags: ["a2a", "multi-agent", "protocol", "interoperability", "google", "agent-cards", "json-rpc"],
  concept: "Standardized communication between autonomous agents from different vendors and frameworks",
  demoUrl: "demos/day-21/",
  demoDescription: "Explore A2A interactively: visualize agent discovery with Agent Cards, simulate task lifecycles, trace message flows, and compare A2A with MCP.",

  lesson: {
    overview: `As AI agents proliferate across enterprises, a critical challenge emerges: **how do agents built by different vendors, using different frameworks, communicate with each other?** The **Agent-to-Agent Protocol (A2A)** answers this question with an open standard for agent interoperability.

**Think of A2A as "TCP/IP for AI agents"**: just as TCP/IP enables any computer to communicate with any other computer regardless of manufacturer, A2A enables any agent to communicate with any other agent regardless of framework. A LangChain agent can delegate tasks to an AutoGen agent, which can coordinate with a CrewAI agent—all through a unified protocol.

The protocol emerged from Google Cloud in April 2025 with immediate backing from 50+ technology partners including Salesforce, SAP, ServiceNow, LangChain, and all major cloud providers. By late 2025, over 150 organizations had joined the ecosystem, and the protocol is now governed by the Linux Foundation under the Apache 2.0 license.

**A2A complements MCP**: While MCP (Day 19-20) standardizes how agents connect to **tools** and **data sources**, A2A standardizes how agents connect to **each other**. MCP is vertical (agent-to-tool), A2A is horizontal (agent-to-agent). Together, they form the complete interoperability layer for agentic AI systems.

**Why This Matters**: Enterprise AI deployments involve multiple specialized agents—a research agent, a coding agent, a customer service agent, an analytics agent. Without standardization, each pair needs custom integration code. A2A eliminates this with a universal protocol: any agent can discover, communicate with, and delegate tasks to any other A2A-compatible agent.`,

    principles: [
      {
        title: "Agent Cards for Discovery",
        description: "Agents advertise their capabilities through JSON manifests called 'Agent Cards', served at /.well-known/agent-card.json. Cards declare the agent's name, skills, supported interfaces, authentication requirements, and connection details. Client agents fetch these cards to discover what remote agents can do before initiating communication."
      },
      {
        title: "Task-Oriented Communication",
        description: "All A2A interactions are centered around Tasks—units of work with defined lifecycles. A client agent creates a task by sending a message to a remote agent. The task progresses through states (SUBMITTED → WORKING → COMPLETED) with the remote agent providing status updates. This task-centric model handles both quick operations and long-running work spanning hours or days."
      },
      {
        title: "JSON-RPC 2.0 over HTTP",
        description: "A2A uses JSON-RPC 2.0 for message formatting, transmitted over HTTPS. This builds on proven web standards, making implementation straightforward and debugging simple—every message is human-readable JSON. The protocol also supports gRPC for high-performance scenarios and REST for simpler integrations."
      },
      {
        title: "Flexible Communication Patterns",
        description: "A2A supports three interaction modes: synchronous request-response for quick tasks, Server-Sent Events (SSE) for streaming real-time updates, and webhook-based push notifications for long-running background tasks. Agents negotiate which patterns they support during capability discovery."
      },
      {
        title: "Enterprise-Grade Security",
        description: "Security is foundational to A2A. The protocol mandates HTTPS for transport encryption, supports multiple authentication schemes (API keys, OAuth2, OpenID Connect, mTLS), enables per-task authorization, and allows cryptographic signing of Agent Cards. Agents can request additional credentials mid-task when needed."
      }
    ],

    codeExample: {
      language: "python",
      title: "Sending a Message to a Remote Agent",
      code: `from a2a import A2AClient
import asyncio

async def main():
    # Initialize client with remote agent's endpoint
    client = A2AClient("https://weather-agent.example.com")

    # Fetch the Agent Card to discover capabilities
    agent_card = await client.get_agent_card()
    print(f"Connected to: {agent_card.name}")
    print(f"Skills: {[s.name for s in agent_card.skills]}")

    # Send a message and create a task
    response = await client.send_message(
        message={
            "role": "ROLE_USER",
            "parts": [{"text": "What's the weather in San Francisco?"}],
            "messageId": "msg-001"
        }
    )

    # The response contains a Task object
    task = response.task
    print(f"Task ID: {task.id}")
    print(f"Status: {task.status.state}")

    # If completed immediately, get the result
    if task.status.state == "TASK_STATE_COMPLETED":
        for artifact in task.artifacts:
            for part in artifact.parts:
                if part.text:
                    print(f"Result: {part.text}")

    # For long-running tasks, poll or use streaming
    elif task.status.state == "TASK_STATE_WORKING":
        # Subscribe to updates via SSE
        async for event in client.subscribe_to_task(task.id):
            if event.status_update:
                print(f"Status: {event.status_update.status.state}")
            if event.artifact_update:
                print(f"New artifact: {event.artifact_update.artifact}")

if __name__ == "__main__":
    asyncio.run(main())`
    },

    diagram: {
      type: "mermaid",
      title: "A2A Communication Flow",
      mermaid: `flowchart TB
    subgraph ClientAgent["Client Agent"]
        CA["Your Agent"]
        AC["A2A Client"]
    end

    subgraph Protocol["A2A Protocol Layer"]
        DC["Discovery"]
        TM["Task Management"]
        MSG["Messaging"]
    end

    subgraph RemoteAgents["Remote Agents"]
        RA1["Weather Agent"]
        RA2["Research Agent"]
        RA3["Booking Agent"]
    end

    subgraph Cards["Agent Cards"]
        C1["/.well-known/agent-card.json"]
    end

    CA --> AC
    AC -->|"1. Fetch Card"| DC
    DC -->|"GET"| C1
    C1 -.->|"Capabilities"| DC
    AC -->|"2. Send Message"| MSG
    MSG -->|"JSON-RPC"| RA1
    MSG -->|"JSON-RPC"| RA2
    MSG -->|"JSON-RPC"| RA3
    RA1 -->|"Task Updates"| TM
    RA2 -->|"Task Updates"| TM
    TM -->|"SSE/Webhook"| AC

    style ClientAgent fill:#e3f2fd
    style Protocol fill:#fff3e0
    style RemoteAgents fill:#f3e5f5
    style Cards fill:#e8f5e9`
    },

    keyTakeaways: [
      "A2A enables agents from different vendors and frameworks to discover, communicate, and collaborate through a standardized protocol",
      "Agent Cards (JSON manifests at /.well-known/agent-card.json) advertise capabilities, skills, and connection requirements",
      "Tasks are the unit of work with defined states: SUBMITTED, WORKING, COMPLETED, FAILED, INPUT_REQUIRED, and more",
      "Communication uses JSON-RPC 2.0 over HTTPS with support for sync, streaming (SSE), and async (webhooks) patterns",
      "A2A complements MCP: MCP connects agents to tools, A2A connects agents to other agents",
      "Enterprise-ready with 150+ partners, Apache 2.0 license, and Linux Foundation governance"
    ],

    resources: [
      {
        title: "A2A Protocol Specification",
        url: "https://a2a-protocol.org/latest/specification/",
        type: "docs",
        description: "The official A2A specification with complete protocol details, message formats, and security requirements",
        summaryPath: "data/day-21/summary-a2a-specification.md"
      },
      {
        title: "A2A GitHub Repository",
        url: "https://github.com/a2aproject/A2A",
        type: "github",
        description: "Official repository with specification, SDKs (Python, Go, JS, Java, .NET), and sample code",
        summaryPath: "data/day-21/summary-a2a-github.md"
      },
      {
        title: "Announcing A2A - Google Developers Blog",
        url: "https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/",
        type: "article",
        description: "Google's announcement explaining the vision, design principles, and partner ecosystem",
        summaryPath: "data/day-21/summary-a2a-announcement.md"
      },
      {
        title: "A2A DeepLearning.AI Course",
        url: "https://goo.gle/dlai-a2a",
        type: "course",
        description: "Hands-on course for building A2A-compatible agents",
        duration: "2-3 hours"
      }
    ]
  },

  learn: {
    overview: {
      summary: "A2A (Agent-to-Agent Protocol) is an open standard enabling AI agents from different vendors and frameworks to discover capabilities, communicate, and collaborate on tasks without custom integration code.",
      fullDescription: `The proliferation of AI agents has created an interoperability crisis. Enterprises deploy multiple specialized agents—customer service bots from Salesforce, analytics agents from Snowflake, research assistants from custom builds. Each agent excels in its domain, but they operate in silos. Making them work together requires custom integration code for every pair of agents.

**A2A solves this with a universal protocol for agent-to-agent communication.** Any A2A-compatible agent can:
- **Discover** other agents and their capabilities via Agent Cards
- **Delegate** tasks to specialist agents
- **Coordinate** multi-agent workflows
- **Exchange** structured data, files, and context

\`\`\`
Without A2A (N×M integrations):
┌─────────┐     ┌─────────────┐     ┌─────────┐
│ Agent A │────▶│   Custom    │────▶│ Agent X │
│         │────▶│ Integration │────▶│ Agent Y │
│         │────▶│   Code ×N   │────▶│ Agent Z │
└─────────┘     └─────────────┘     └─────────┘

With A2A (N+M implementations):
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Any A2A │────▶│   A2A   │────▶│ Any A2A │
│  Agent  │     │ Protocol│     │  Agent  │
└─────────┘     └─────────┘     └─────────┘
\`\`\`

**The protocol operates across three layers:**

1. **Canonical Data Model** (Protocol Buffers): Defines messages, tasks, artifacts, and agent cards in a language-neutral format
2. **Abstract Operations**: Binding-independent operations like SendMessage, GetTask, CancelTask
3. **Protocol Bindings**: Concrete implementations for JSON-RPC, gRPC, and HTTP+REST

**A2A + MCP: The Complete Picture**

A2A and Anthropic's MCP are complementary:
- **MCP** = Agent ↔ Tools (vertical integration)
- **A2A** = Agent ↔ Agent (horizontal integration)

A sophisticated enterprise system might use MCP to connect agents to databases and APIs, while using A2A to coordinate those agents with each other. They're different layers of the same interoperability stack.

**Enterprise Adoption**: A2A launched with 50+ partners and grew to 150+ within months. The protocol is now Apache 2.0 licensed and governed by the Linux Foundation, ensuring vendor neutrality and long-term stability.`,
      prerequisites: [
        "Day 19-20: MCP fundamentals (complementary protocol)",
        "Understanding of JSON and HTTP APIs",
        "Familiarity with async programming patterns",
        "Basic knowledge of multi-agent systems (Days 9-11)"
      ],
      estimatedTime: "2-3 hours",
      difficulty: "advanced"
    },

    concepts: [
      {
        title: "Agent Cards: Discovery and Capabilities",
        description: `Agent Cards are the foundation of A2A discovery. They're JSON manifests that describe what an agent can do, how to connect to it, and what security requirements it has.

**Card Location**: Agents serve their card at \`/.well-known/agent-card.json\`. Client agents fetch this URL to discover capabilities before initiating communication.

**Card Structure**:

\`\`\`json
{
  "name": "Weather Agent",
  "description": "Provides weather forecasts and historical data",
  "provider": {
    "organization": "WeatherCorp",
    "url": "https://weathercorp.example.com"
  },
  "version": "1.0.0",
  "documentationUrl": "https://docs.weathercorp.example.com",

  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "extendedCards": true
  },

  "interfaces": [
    {
      "type": "JSON_RPC_2_0",
      "url": "https://api.weathercorp.example.com/a2a"
    }
  ],

  "securitySchemes": {
    "apiKey": {
      "type": "apiKey",
      "in": "header",
      "name": "X-API-Key"
    }
  },
  "defaultSecurity": ["apiKey"],

  "skills": [
    {
      "id": "weather-forecast",
      "name": "Weather Forecast",
      "description": "Get weather forecast for any location",
      "inputModes": ["text"],
      "outputModes": ["text", "data"],
      "examples": [
        {"input": "What's the weather in Tokyo?", "output": "Sunny, 72°F"}
      ]
    },
    {
      "id": "historical-weather",
      "name": "Historical Weather Data",
      "description": "Get past weather data for analysis"
    }
  ]
}
\`\`\`

**Key Sections**:

- **Identity**: Name, description, provider, version, documentation URL
- **Capabilities**: What interaction modes the agent supports (streaming, push notifications)
- **Interfaces**: Protocol bindings and endpoints (JSON-RPC, gRPC, REST)
- **Security**: Authentication schemes (API keys, OAuth2, mTLS)
- **Skills**: Specific capabilities with input/output modes and examples

**Extended Agent Cards**: Some information is sensitive and shouldn't be public. Agents can serve a public card with basic info, then provide an extended card (with more skills or details) after authentication. The \`extendedCards\` capability signals this support.

**Card Signatures**: For high-security environments, Agent Cards can include JWS signatures to verify authenticity. This prevents man-in-the-middle attacks where a malicious party serves a fake card.`,
        analogy: "Agent Cards are like LinkedIn profiles for AI agents. They advertise skills, experience (capabilities), and how to contact the agent (interfaces). Just as you'd check someone's profile before reaching out professionally, client agents check Agent Cards before delegating tasks.",
        gotchas: [
          "Cards are cached—if you update capabilities, clients may not see changes immediately",
          "Extended cards require authentication; don't put sensitive skills in the public card",
          "Always validate card signatures in production to prevent impersonation attacks",
          "Skills are descriptive, not prescriptive—agents can refuse tasks even if the skill is listed"
        ]
      },
      {
        title: "Task Lifecycle and States",
        description: `Tasks are the unit of work in A2A. Every interaction creates a task that progresses through defined states until completion or failure.

**Task States**:

\`\`\`
                    ┌──────────────────┐
                    │  TASK_STATE_     │
                    │   SUBMITTED      │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  TASK_STATE_     │
                    │    WORKING       │◄─────────────┐
                    └────────┬─────────┘              │
                             │                        │
           ┌─────────────────┼─────────────────┐      │
           │                 │                 │      │
  ┌────────▼───────┐  ┌──────▼───────┐  ┌─────▼──────┴──┐
  │  TASK_STATE_   │  │ TASK_STATE_  │  │ TASK_STATE_   │
  │   COMPLETED    │  │    FAILED    │  │INPUT_REQUIRED │
  └────────────────┘  └──────────────┘  └───────────────┘
    (terminal)          (terminal)       (awaits input)
\`\`\`

**All States**:

| State | Description | Terminal? |
|-------|-------------|-----------|
| SUBMITTED | Task acknowledged, not yet processing | No |
| WORKING | Agent actively processing | No |
| COMPLETED | Successfully finished | Yes |
| FAILED | Ended with error | Yes |
| CANCELED | User-initiated termination | Yes |
| REJECTED | Agent declined the task | Yes |
| INPUT_REQUIRED | Awaiting additional user input | No |
| AUTH_REQUIRED | Needs authorization to proceed | No |

**Task Object Structure**:

\`\`\`json
{
  "id": "task-uuid-12345",
  "contextId": "conversation-uuid-789",
  "status": {
    "state": "TASK_STATE_WORKING",
    "timestamp": "2025-03-23T10:30:00Z",
    "message": {
      "role": "ROLE_AGENT",
      "parts": [{"text": "Searching for weather data..."}]
    }
  },
  "artifacts": [],
  "history": []
}
\`\`\`

**Key Concepts**:

- **Task ID**: Unique identifier for tracking and updates
- **Context ID**: Groups related tasks into a conversation
- **Status**: Current state with timestamp and optional message
- **Artifacts**: Outputs produced by the task
- **History**: Message exchange history (controlled by historyLength parameter)

**Multi-Turn Interactions**: When an agent needs more information, it transitions to INPUT_REQUIRED with a question. The client responds by sending a new message referencing the task ID, and processing resumes.

\`\`\`python
# Agent asks for clarification
status: {
  "state": "TASK_STATE_INPUT_REQUIRED",
  "message": {
    "role": "ROLE_AGENT",
    "parts": [{"text": "Which San Francisco? CA or Philippines?"}]
  }
}

# Client provides follow-up
await client.send_message({
  "taskId": "task-uuid-12345",  # Reference existing task
  "role": "ROLE_USER",
  "parts": [{"text": "California"}]
})
\`\`\``,
        analogy: "Tasks are like order tracking at a restaurant. SUBMITTED means the kitchen received your order. WORKING means they're cooking. INPUT_REQUIRED means the waiter came back to ask how you want your steak done. COMPLETED means your food is ready. FAILED means they ran out of ingredients.",
        gotchas: [
          "Always handle INPUT_REQUIRED—ignoring it leaves tasks stuck indefinitely",
          "CANCELED requires explicit action; tasks don't auto-cancel on disconnect",
          "Context IDs enable conversation continuity; reuse them for related tasks",
          "Terminal states (COMPLETED, FAILED, CANCELED, REJECTED) are final—create a new task to retry"
        ]
      },
      {
        title: "Communication Patterns",
        description: `A2A supports three communication patterns to handle different timing requirements. Agents declare which patterns they support in their Agent Card capabilities.

**1. Synchronous (Request-Response)**

The simplest pattern: send a message, wait for the task to complete, receive the result.

\`\`\`python
# Synchronous call (blocks until complete)
response = await client.send_message({
    "message": {
        "role": "ROLE_USER",
        "parts": [{"text": "What's 2 + 2?"}]
    }
})

# Response contains completed task
print(response.task.status.state)  # TASK_STATE_COMPLETED
print(response.task.artifacts[0].parts[0].text)  # "4"
\`\`\`

Best for: Quick operations that complete in seconds.

**2. Streaming (Server-Sent Events)**

For real-time updates during long-running tasks. The client opens a persistent connection and receives events as the task progresses.

\`\`\`python
# Start a streaming request
stream = await client.send_streaming_message({
    "message": {
        "role": "ROLE_USER",
        "parts": [{"text": "Research AI trends in 2025"}]
    }
})

# Receive events as they arrive
async for event in stream:
    if event.status_update:
        print(f"Status: {event.status_update.status.state}")
    if event.artifact_update:
        print(f"Partial result: {event.artifact_update.artifact}")
\`\`\`

Event types:
- **Task snapshot**: Initial task state
- **Status update**: State transitions
- **Artifact update**: New or updated outputs
- **Error**: Problems during execution

Best for: Tasks taking 10+ seconds where users want progress visibility.

**3. Asynchronous (Push Notifications)**

For long-running background tasks. The client provides a webhook URL, and the agent posts updates when they occur.

\`\`\`python
# Start task with webhook configuration
response = await client.send_message({
    "message": {...},
    "configuration": {
        "pushNotificationConfig": {
            "url": "https://my-app.com/webhook/a2a",
            "authentication": {
                "scheme": "Bearer",
                "credentials": "my-webhook-token"
            }
        }
    }
})

# Task runs in background
task_id = response.task.id

# Later, agent POSTs to your webhook:
# POST https://my-app.com/webhook/a2a
# {
#   "statusUpdate": {
#     "taskId": "...",
#     "status": {"state": "TASK_STATE_COMPLETED"}
#   }
# }
\`\`\`

Best for: Tasks taking minutes to hours (research, data processing, complex analysis).

**Capability Negotiation**:

\`\`\`json
// Agent Card capabilities
{
  "capabilities": {
    "streaming": true,
    "pushNotifications": true
  }
}
\`\`\`

Clients should check capabilities before using streaming or push notifications. If unsupported, fall back to polling with \`get_task()\`.`,
        analogy: "Think of ordering food: Synchronous is a vending machine (insert money, get snack immediately). Streaming is a coffee shop (you watch the barista make your drink). Push notifications are delivery apps (order, go about your day, get notified when it arrives).",
        gotchas: [
          "Streaming requires keeping connections open—handle disconnects gracefully",
          "Webhook URLs must be HTTPS and publicly accessible",
          "Push notifications include authentication—validate it to prevent spoofing",
          "If streaming fails mid-task, use get_task() to recover current state"
        ]
      },
      {
        title: "Messages, Parts, and Artifacts",
        description: `A2A uses a structured content model where Messages contain Parts, and completed Tasks produce Artifacts. This enables rich, multi-modal communication.

**Messages** represent a single turn in the conversation:

\`\`\`json
{
  "messageId": "msg-uuid-001",
  "role": "ROLE_USER",  // or ROLE_AGENT
  "parts": [
    {"text": "Please analyze this image and data"},
    {"data": {"type": "sales_report", "quarter": "Q1"}},
    {"url": "https://example.com/chart.png"}
  ],
  "contextId": "conversation-uuid",
  "taskId": "task-uuid",  // Optional: reference existing task
  "metadata": {}
}
\`\`\`

**Parts** are atomic content units. Each part has one content type:

| Part Type | Use Case | Example |
|-----------|----------|---------|
| text | Plain text content | Questions, instructions, responses |
| data | Structured JSON | API payloads, configuration objects |
| url | Remote resources | Images, documents, files |
| raw | Base64 binary | Uploaded files, generated images |

\`\`\`json
// Text part
{"text": "What's the weather?"}

// Data part (structured JSON)
{"data": {"city": "SF", "units": "fahrenheit"}}

// URL part (reference to resource)
{"url": "https://example.com/image.png", "mediaType": "image/png"}

// Raw part (binary content)
{"raw": "base64encodeddata...", "mediaType": "application/pdf"}
\`\`\`

**Artifacts** are the outputs of a completed task:

\`\`\`json
{
  "artifactId": "artifact-uuid-001",
  "name": "Weather Report",
  "description": "Current weather conditions for San Francisco",
  "parts": [
    {
      "text": "San Francisco: 68°F, Partly Cloudy, Humidity 72%"
    },
    {
      "data": {
        "temperature": 68,
        "unit": "fahrenheit",
        "conditions": "partly_cloudy",
        "humidity": 72
      }
    }
  ],
  "metadata": {
    "source": "weather-api-v2",
    "timestamp": "2025-03-23T10:30:00Z"
  }
}
\`\`\`

**Tasks can produce multiple artifacts**:

\`\`\`python
task.artifacts = [
    {"name": "Summary", "parts": [{"text": "..."}]},
    {"name": "Full Report", "parts": [{"raw": "...", "mediaType": "application/pdf"}]},
    {"name": "Data Export", "parts": [{"data": {...}}]}
]
\`\`\`

**Multi-Modal Example**:

\`\`\`python
# Send an image for analysis
response = await client.send_message({
    "message": {
        "role": "ROLE_USER",
        "parts": [
            {"text": "Describe what's in this image"},
            {"url": "https://example.com/photo.jpg", "mediaType": "image/jpeg"}
        ]
    }
})
\`\`\``,
        analogy: "Think of Messages like emails: they have a sender (role), content (parts), and can reference a thread (contextId). Parts are attachments—you can attach text, files, images, or data. Artifacts are the deliverables—the final outputs the agent produces.",
        gotchas: [
          "Always include mediaType for raw and url parts to ensure correct handling",
          "Large raw parts (>1MB) may cause performance issues—use URLs instead",
          "Data parts must be valid JSON—validate before sending",
          "Artifacts may be updated during streaming—use artifactId to track versions"
        ]
      },
      {
        title: "Security and Authentication",
        description: `A2A builds security into the protocol at multiple layers, enabling enterprise-grade agent deployments.

**Transport Security**:

All production A2A communication MUST use HTTPS with TLS 1.3+. This encrypts data in transit and authenticates server identity.

**Authentication Schemes**:

Agent Cards declare supported authentication methods in \`securitySchemes\`:

\`\`\`json
{
  "securitySchemes": {
    "apiKey": {
      "type": "apiKey",
      "in": "header",
      "name": "X-API-Key"
    },
    "oauth2": {
      "type": "oauth2",
      "flows": {
        "clientCredentials": {
          "tokenUrl": "https://auth.example.com/token",
          "scopes": {
            "agent:read": "Read agent capabilities",
            "task:write": "Create and manage tasks"
          }
        }
      }
    },
    "mtls": {
      "type": "mutualTLS",
      "description": "Client certificate authentication"
    }
  },
  "defaultSecurity": ["oauth2"]
}
\`\`\`

**Supported Types**:
- **API Key**: Simple token in header/query
- **HTTP Basic/Bearer**: Standard HTTP auth
- **OAuth 2.0**: Token-based with scopes
- **OpenID Connect**: Identity federation
- **Mutual TLS**: Certificate-based authentication

**Per-Task Authorization**:

Servers validate credentials on every request and enforce scoping:

\`\`\`python
# Server-side authorization check
@app.route("/message:send")
async def send_message(request):
    # Validate authentication
    credentials = extract_credentials(request)
    if not validate_auth(credentials):
        raise AuthenticationError("Invalid credentials")

    # Check authorization for this operation
    user_id = get_user_id(credentials)
    if not can_create_tasks(user_id):
        raise AuthorizationError("Insufficient permissions")

    # Proceed with task creation
    ...
\`\`\`

**Mid-Task Authorization**:

Sometimes tasks need additional permissions partway through. Agents can transition to AUTH_REQUIRED:

\`\`\`json
{
  "status": {
    "state": "TASK_STATE_AUTH_REQUIRED",
    "message": {
      "role": "ROLE_AGENT",
      "parts": [{
        "text": "I need access to your calendar to schedule this meeting"
      }],
      "metadata": {
        "authRequest": {
          "scope": "calendar:write",
          "authUrl": "https://example.com/oauth/authorize"
        }
      }
    }
  }
}
\`\`\`

**Agent Card Signatures**:

For high-security environments, cards can include JWS signatures:

\`\`\`json
{
  "name": "Secure Agent",
  "...": "...",
  "signature": {
    "algorithm": "RS256",
    "keyId": "key-001",
    "value": "base64-encoded-jws-signature"
  }
}
\`\`\`

Clients verify signatures against published public keys to prevent card tampering.

**Webhook Security**:

When using push notifications, agents validate webhook URLs (rejecting private IP ranges) and include authentication headers. Clients verify the authentication to prevent spoofed updates.`,
        analogy: "A2A security is like airport security: TLS is the secure perimeter (everyone needs a ticket to enter). Authentication is the ID check (prove who you are). Authorization is the boarding pass (you can only board your specific flight). Signatures are tamper-evident seals (know if something was modified).",
        gotchas: [
          "Never transmit credentials over plain HTTP—always HTTPS",
          "Rotate API keys regularly and use short-lived OAuth tokens",
          "Validate Agent Card signatures before trusting sensitive operations",
          "Webhook URLs should use authentication—don't rely on URL obscurity"
        ]
      },
      {
        title: "A2A vs MCP: Complementary Protocols",
        description: `A2A and MCP are frequently mentioned together, but they solve different problems. Understanding their relationship is key to designing robust agentic systems.

**MCP (Model Context Protocol)** - Anthropic:
- Connects agents to **tools** and **data sources**
- **Vertical integration**: Agent ↔ Database, Agent ↔ API, Agent ↔ File System
- Primitives: Tools, Resources, Prompts
- Model decides when to use tools

**A2A (Agent-to-Agent Protocol)** - Google:
- Connects **agents to each other**
- **Horizontal integration**: Agent ↔ Agent ↔ Agent
- Primitives: Agent Cards, Tasks, Messages
- Agent decides when to delegate

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Agentic AI System                        │
│                                                             │
│  ┌─────────────┐          A2A          ┌─────────────┐     │
│  │   Agent A   │◄───────────────────►│   Agent B   │     │
│  │ (Research)  │                       │ (Analytics) │     │
│  └──────┬──────┘                       └──────┬──────┘     │
│         │                                     │             │
│         │ MCP                                 │ MCP         │
│         │                                     │             │
│  ┌──────▼──────┐                       ┌──────▼──────┐     │
│  │  Web Search │                       │  Database   │     │
│  │    Tool     │                       │   Tool      │     │
│  └─────────────┘                       └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

**When to Use Each**:

| Scenario | Protocol | Why |
|----------|----------|-----|
| Query a database | MCP | Tool access, not agent delegation |
| Call a weather API | MCP | Structured tool invocation |
| Ask a specialist agent to research | A2A | Agent-to-agent delegation |
| Coordinate multi-agent workflow | A2A | Cross-agent communication |
| Read files from disk | MCP | Resource access |
| Hand off customer to billing agent | A2A | Agent handoff pattern |

**Using Both Together**:

A typical enterprise system might:
1. Use **MCP** to give agents access to internal tools (databases, APIs, file systems)
2. Use **A2A** to let agents delegate to each other (research agent → analytics agent → report agent)

\`\`\`python
# Agent using both MCP and A2A
class EnterpriseAgent:
    def __init__(self):
        # MCP for tools
        self.mcp_client = MCPClient("mcp://internal-tools")

        # A2A for agent coordination
        self.research_agent = A2AClient("https://research.internal")
        self.analytics_agent = A2AClient("https://analytics.internal")

    async def analyze_market(self, query):
        # Use A2A to delegate research
        research_task = await self.research_agent.send_message({
            "parts": [{"text": f"Research: {query}"}]
        })

        # Use MCP to query internal database
        internal_data = await self.mcp_client.call_tool(
            "query_database",
            {"sql": "SELECT * FROM sales WHERE quarter='Q1'"}
        )

        # Use A2A to get analysis
        analysis_task = await self.analytics_agent.send_message({
            "parts": [
                {"text": "Analyze this data"},
                {"data": research_task.artifacts},
                {"data": internal_data}
            ]
        })

        return analysis_task.artifacts
\`\`\`

**Key Differences**:

| Aspect | MCP | A2A |
|--------|-----|-----|
| Focus | Tool integration | Agent coordination |
| Primitives | Tools, Resources, Prompts | Agent Cards, Tasks, Messages |
| Discovery | Server capabilities | Agent Cards |
| Communication | JSON-RPC | JSON-RPC, gRPC, REST |
| State | Stateless tools | Stateful tasks |
| Governance | Anthropic | Linux Foundation |`,
        analogy: "MCP is like a person's hands (how they interact with objects/tools). A2A is like their voice (how they communicate with other people). You need both: hands to use tools, voice to coordinate with others. An agent using only MCP can do things; an agent using both can do things AND collaborate.",
        gotchas: [
          "Don't use A2A for simple tool calls—MCP is more efficient for that",
          "Don't use MCP for agent delegation—A2A handles task lifecycle properly",
          "Both protocols can coexist in the same system without conflict",
          "Consider latency: A2A adds network hops; keep simple operations local with MCP"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Basic A2A Client",
        language: "python",
        category: "basic",
        explanation: "A minimal A2A client that discovers an agent, sends a message, and handles the response.",
        code: `"""Basic A2A Client Example

Demonstrates the core A2A workflow:
1. Fetch Agent Card to discover capabilities
2. Send a message to create a task
3. Handle the response
"""

from a2a import A2AClient, Message, Part
import asyncio

async def main():
    # Initialize client pointing to remote agent
    client = A2AClient(
        base_url="https://assistant.example.com",
        api_key="your-api-key"  # Or use OAuth, etc.
    )

    # Step 1: Discover agent capabilities
    agent_card = await client.get_agent_card()

    print(f"Agent: {agent_card.name}")
    print(f"Description: {agent_card.description}")
    print(f"Skills:")
    for skill in agent_card.skills:
        print(f"  - {skill.name}: {skill.description}")

    # Step 2: Check if agent has the skill we need
    has_weather = any(s.id == "weather-forecast" for s in agent_card.skills)
    if not has_weather:
        print("Agent doesn't support weather forecasts")
        return

    # Step 3: Send a message
    response = await client.send_message(
        message=Message(
            role="ROLE_USER",
            parts=[
                Part(text="What's the weather in Tokyo?")
            ]
        )
    )

    # Step 4: Handle the response
    task = response.task
    print(f"\\nTask ID: {task.id}")
    print(f"Status: {task.status.state}")

    if task.status.state == "TASK_STATE_COMPLETED":
        # Task completed immediately
        for artifact in task.artifacts:
            print(f"\\nResult ({artifact.name}):")
            for part in artifact.parts:
                if part.text:
                    print(f"  {part.text}")
                if part.data:
                    print(f"  Data: {part.data}")

    elif task.status.state == "TASK_STATE_INPUT_REQUIRED":
        # Agent needs more information
        print(f"Agent asks: {task.status.message.parts[0].text}")

    elif task.status.state == "TASK_STATE_WORKING":
        # Task is still processing - need to poll or stream
        print("Task is processing... use streaming or polling")

if __name__ == "__main__":
    asyncio.run(main())`
      },
      {
        title: "Multi-Turn Conversation with Streaming",
        language: "python",
        category: "intermediate",
        explanation: "Handles multi-turn interactions where the agent asks for clarification, with streaming for real-time updates.",
        code: `"""Multi-Turn A2A Conversation with Streaming

Demonstrates:
- Handling INPUT_REQUIRED state
- Continuing conversations with context
- Streaming task updates in real-time
"""

from a2a import A2AClient, Message, Part
import asyncio

class A2AConversation:
    def __init__(self, agent_url: str, api_key: str):
        self.client = A2AClient(base_url=agent_url, api_key=api_key)
        self.context_id = None  # Tracks conversation context

    async def send_and_stream(self, text: str, task_id: str = None) -> dict:
        """Send a message and stream the response."""

        message = Message(
            role="ROLE_USER",
            parts=[Part(text=text)],
            context_id=self.context_id,
            task_id=task_id  # Reference existing task for follow-ups
        )

        # Use streaming for real-time updates
        stream = await self.client.send_streaming_message(message=message)

        final_task = None

        async for event in stream:
            if event.task:
                # Initial task snapshot
                final_task = event.task
                self.context_id = final_task.context_id
                print(f"[Task created: {final_task.id}]")

            elif event.status_update:
                # Status changed
                status = event.status_update.status
                print(f"[Status: {status.state}]")

                if status.message:
                    # Agent sent a message with the status
                    for part in status.message.parts:
                        if part.text:
                            print(f"Agent: {part.text}")

            elif event.artifact_update:
                # New or updated artifact
                artifact = event.artifact_update.artifact
                print(f"[Artifact: {artifact.name}]")
                for part in artifact.parts:
                    if part.text:
                        print(f"  {part.text}")

        return final_task

    async def run_conversation(self):
        """Run an interactive conversation loop."""

        print("Starting conversation with agent...")
        print("Type 'quit' to exit\\n")

        current_task_id = None

        while True:
            user_input = input("You: ").strip()
            if user_input.lower() == 'quit':
                break

            # Send message (referencing task if continuing)
            task = await self.send_and_stream(
                text=user_input,
                task_id=current_task_id
            )

            # Check if agent needs more input
            if task.status.state == "TASK_STATE_INPUT_REQUIRED":
                current_task_id = task.id  # Continue this task
                print("(Agent is waiting for your response)")
            else:
                current_task_id = None  # Task completed, start fresh

            print()  # Blank line for readability

async def main():
    conversation = A2AConversation(
        agent_url="https://travel-agent.example.com",
        api_key="your-api-key"
    )
    await conversation.run_conversation()

# Example interaction:
# You: Book me a flight to Paris
# [Task created: task-123]
# [Status: TASK_STATE_INPUT_REQUIRED]
# Agent: I'd be happy to help! What dates are you looking to travel?
# (Agent is waiting for your response)
#
# You: Next weekend, departing Friday evening
# [Status: TASK_STATE_WORKING]
# Agent: Searching for flights...
# [Artifact: Flight Options]
#   Found 3 options:
#   1. Air France AF123 - $450
#   2. United UA456 - $520
#   3. Delta DL789 - $480
# [Status: TASK_STATE_COMPLETED]

if __name__ == "__main__":
    asyncio.run(main())`
      },
      {
        title: "Building an A2A Server",
        language: "python",
        category: "advanced",
        explanation: "A complete A2A server implementation with Agent Card, message handling, and task management.",
        code: `"""A2A Server Implementation

Demonstrates building a server that:
- Serves an Agent Card at /.well-known/agent-card.json
- Handles message:send requests
- Manages task lifecycle
- Supports streaming responses
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import json
import asyncio

app = FastAPI()

# ============================================================
# Agent Card Definition
# ============================================================

AGENT_CARD = {
    "name": "Calculator Agent",
    "description": "Performs mathematical calculations and unit conversions",
    "provider": {
        "organization": "Example Corp",
        "url": "https://example.com"
    },
    "version": "1.0.0",
    "documentationUrl": "https://docs.example.com/calculator-agent",

    "capabilities": {
        "streaming": True,
        "pushNotifications": False,
        "extendedCards": False
    },

    "interfaces": [
        {
            "type": "JSON_RPC_2_0",
            "url": "https://calculator.example.com/a2a"
        }
    ],

    "securitySchemes": {
        "apiKey": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key"
        }
    },
    "defaultSecurity": ["apiKey"],

    "skills": [
        {
            "id": "calculate",
            "name": "Calculate",
            "description": "Evaluate mathematical expressions",
            "inputModes": ["text"],
            "outputModes": ["text", "data"],
            "examples": [
                {"input": "What is 15% of 200?", "output": "30"}
            ]
        },
        {
            "id": "convert",
            "name": "Unit Conversion",
            "description": "Convert between units (length, weight, temperature)",
            "inputModes": ["text"],
            "outputModes": ["text", "data"]
        }
    ]
}

# ============================================================
# In-Memory Task Storage
# ============================================================

tasks: dict = {}  # task_id -> task object

# ============================================================
# Request/Response Models
# ============================================================

class Part(BaseModel):
    text: Optional[str] = None
    data: Optional[dict] = None

class Message(BaseModel):
    role: str
    parts: list[Part]
    messageId: Optional[str] = None
    contextId: Optional[str] = None
    taskId: Optional[str] = None

class SendMessageRequest(BaseModel):
    message: Message

# ============================================================
# Endpoints
# ============================================================

@app.get("/.well-known/agent-card.json")
async def get_agent_card():
    """Serve the Agent Card for discovery."""
    return AGENT_CARD

@app.post("/message:send")
async def send_message(
    request: SendMessageRequest,
    x_api_key: str = Header(...)
):
    """Handle incoming messages and create tasks."""

    # Validate API key
    if x_api_key != "valid-api-key":
        raise HTTPException(status_code=401, detail="Invalid API key")

    message = request.message

    # Check if this is a follow-up to existing task
    if message.taskId and message.taskId in tasks:
        task = tasks[message.taskId]
        # Add message to history and continue processing
        task["history"].append({
            "role": message.role,
            "parts": [p.dict() for p in message.parts]
        })
        # Process the follow-up
        return await process_task(task)

    # Create new task
    task_id = str(uuid.uuid4())
    context_id = message.contextId or str(uuid.uuid4())

    task = {
        "id": task_id,
        "contextId": context_id,
        "status": {
            "state": "TASK_STATE_SUBMITTED",
            "timestamp": "2025-03-23T10:00:00Z"
        },
        "artifacts": [],
        "history": [{
            "role": message.role,
            "parts": [p.dict() for p in message.parts]
        }]
    }

    tasks[task_id] = task

    # Process the task
    return await process_task(task)

async def process_task(task: dict) -> dict:
    """Process a task and return the result."""

    # Get the latest user message
    user_message = task["history"][-1]
    user_text = user_message["parts"][0].get("text", "")

    # Update status to working
    task["status"]["state"] = "TASK_STATE_WORKING"

    # Simple calculation logic
    try:
        if "+" in user_text or "-" in user_text or "*" in user_text or "/" in user_text:
            # Extract and evaluate expression
            # (In production, use a proper math parser!)
            result = eval_safe(user_text)

            task["status"]["state"] = "TASK_STATE_COMPLETED"
            task["artifacts"] = [{
                "artifactId": str(uuid.uuid4()),
                "name": "Calculation Result",
                "parts": [
                    {"text": f"The result is {result}"},
                    {"data": {"result": result, "expression": user_text}}
                ]
            }]

        elif "convert" in user_text.lower():
            # Need more information
            task["status"]["state"] = "TASK_STATE_INPUT_REQUIRED"
            task["status"]["message"] = {
                "role": "ROLE_AGENT",
                "parts": [{"text": "What would you like to convert? Please specify the value and units (e.g., '100 km to miles')"}]
            }

        else:
            # Try to understand as a math question
            task["status"]["state"] = "TASK_STATE_INPUT_REQUIRED"
            task["status"]["message"] = {
                "role": "ROLE_AGENT",
                "parts": [{"text": "Please provide a mathematical expression to calculate (e.g., '25 * 4' or 'sqrt(144)')"}]
            }

    except Exception as e:
        task["status"]["state"] = "TASK_STATE_FAILED"
        task["status"]["message"] = {
            "role": "ROLE_AGENT",
            "parts": [{"text": f"Error: {str(e)}"}]
        }

    return {"task": task}

def eval_safe(expression: str) -> float:
    """Safely evaluate a math expression."""
    # Remove any non-math characters
    import re
    cleaned = re.sub(r'[^0-9+\\-*/().\\s]', '', expression)
    if cleaned:
        return eval(cleaned)
    raise ValueError("No valid expression found")

@app.post("/message:stream")
async def send_streaming_message(
    request: SendMessageRequest,
    x_api_key: str = Header(...)
):
    """Handle messages with streaming response."""

    if x_api_key != "valid-api-key":
        raise HTTPException(status_code=401, detail="Invalid API key")

    async def generate_events():
        # Create task
        task_id = str(uuid.uuid4())
        task = {
            "id": task_id,
            "contextId": str(uuid.uuid4()),
            "status": {"state": "TASK_STATE_SUBMITTED"},
            "artifacts": [],
            "history": []
        }

        # Send initial task snapshot
        yield f"data: {json.dumps({'task': task})}\\n\\n"

        # Simulate processing
        await asyncio.sleep(0.5)
        task["status"]["state"] = "TASK_STATE_WORKING"
        yield f"data: {json.dumps({'statusUpdate': {'taskId': task_id, 'status': task['status']}})}\\n\\n"

        # Simulate completion
        await asyncio.sleep(1)
        task["status"]["state"] = "TASK_STATE_COMPLETED"
        task["artifacts"] = [{
            "artifactId": str(uuid.uuid4()),
            "name": "Result",
            "parts": [{"text": "Calculation complete!"}]
        }]

        yield f"data: {json.dumps({'artifactUpdate': {'taskId': task_id, 'artifact': task['artifacts'][0]}})}\\n\\n"
        yield f"data: {json.dumps({'statusUpdate': {'taskId': task_id, 'status': task['status']}})}\\n\\n"

    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream"
    )

@app.get("/task/{task_id}")
async def get_task(task_id: str, x_api_key: str = Header(...)):
    """Get current task status."""

    if x_api_key != "valid-api-key":
        raise HTTPException(status_code=401, detail="Invalid API key")

    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"task": tasks[task_id]}

# Run with: uvicorn server:app --host 0.0.0.0 --port 8000`
      }
    ],

    diagrams: [
      {
        title: "A2A Architecture Overview",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Enterprise["Enterprise Environment"]
        subgraph ClientAgents["Client Agents"]
            CA1["Orchestrator Agent"]
            CA2["User-Facing Agent"]
        end

        subgraph RemoteAgents["Specialist Agents"]
            RA1["Research Agent<br/>📚"]
            RA2["Analytics Agent<br/>📊"]
            RA3["Customer Service<br/>💬"]
            RA4["Billing Agent<br/>💳"]
        end

        subgraph Discovery["Discovery Layer"]
            AC1["Agent Card"]
            AC2["Agent Card"]
            AC3["Agent Card"]
            AC4["Agent Card"]
        end
    end

    CA1 -->|"1. Fetch Cards"| Discovery
    CA1 -->|"2. Send Tasks"| RA1
    CA1 -->|"2. Send Tasks"| RA2
    CA2 -->|"Hand off"| RA3
    RA3 -->|"Escalate"| RA4

    RA1 -.->|"serves"| AC1
    RA2 -.->|"serves"| AC2
    RA3 -.->|"serves"| AC3
    RA4 -.->|"serves"| AC4

    style ClientAgents fill:#e3f2fd
    style RemoteAgents fill:#f3e5f5
    style Discovery fill:#e8f5e9`,
        caption: "A2A enables any agent to discover and communicate with any other agent through standardized Agent Cards and task-based messaging."
      },
      {
        title: "Task State Machine",
        type: "mermaid",
        mermaid: `stateDiagram-v2
    [*] --> SUBMITTED: message:send

    SUBMITTED --> WORKING: Agent starts processing
    SUBMITTED --> REJECTED: Agent declines

    WORKING --> COMPLETED: Success
    WORKING --> FAILED: Error
    WORKING --> CANCELED: User cancels
    WORKING --> INPUT_REQUIRED: Need clarification
    WORKING --> AUTH_REQUIRED: Need authorization

    INPUT_REQUIRED --> WORKING: User provides input
    INPUT_REQUIRED --> CANCELED: User cancels

    AUTH_REQUIRED --> WORKING: User authorizes
    AUTH_REQUIRED --> CANCELED: User denies

    COMPLETED --> [*]
    FAILED --> [*]
    CANCELED --> [*]
    REJECTED --> [*]`,
        caption: "Tasks progress through defined states. Terminal states (COMPLETED, FAILED, CANCELED, REJECTED) end the task lifecycle."
      },
      {
        title: "Message Flow Sequence",
        type: "mermaid",
        mermaid: `sequenceDiagram
    participant C as Client Agent
    participant P as A2A Protocol
    participant R as Remote Agent

    Note over C,R: Discovery Phase
    C->>P: GET /.well-known/agent-card.json
    P->>R: Fetch card
    R-->>P: Agent Card (capabilities, skills)
    P-->>C: Agent Card

    Note over C,R: Task Creation
    C->>P: POST /message:send
    P->>R: Create task + message
    R-->>P: Task (SUBMITTED)
    P-->>C: Task response

    Note over C,R: Processing
    R->>R: Process request
    R-->>P: Status: WORKING
    P-->>C: SSE: statusUpdate

    Note over C,R: Clarification (optional)
    R-->>P: Status: INPUT_REQUIRED
    P-->>C: SSE: statusUpdate + question
    C->>P: POST /message:send (taskId)
    P->>R: Follow-up message
    R->>R: Continue processing

    Note over C,R: Completion
    R-->>P: Artifact + Status: COMPLETED
    P-->>C: SSE: artifactUpdate
    P-->>C: SSE: statusUpdate (COMPLETED)`,
        caption: "Complete A2A interaction showing discovery, task creation, optional clarification, and completion with streaming updates."
      }
    ],

    faq: [
      {
        question: "How is A2A different from just calling an API?",
        answer: "A2A provides standardized discovery (Agent Cards), task lifecycle management, multi-turn conversations, and multiple communication patterns (sync, streaming, push). APIs require custom integration for each endpoint; A2A lets any agent talk to any agent through a universal protocol. It's the difference between point-to-point connections and a standardized network."
      },
      {
        question: "Can I use A2A with agents built on different frameworks?",
        answer: "Yes, that's the primary purpose. A LangChain agent can delegate to a CrewAI agent, which can coordinate with an AutoGen agent. As long as each agent implements the A2A protocol (serves an Agent Card, handles messages, manages tasks), they can interoperate regardless of underlying framework."
      },
      {
        question: "Do I need to use A2A and MCP together?",
        answer: "Not necessarily, but they complement each other well. Use MCP when your agent needs to access tools and data sources. Use A2A when agents need to communicate with other agents. Many production systems use both: MCP for tool access, A2A for agent coordination."
      },
      {
        question: "What happens if a task takes hours or days to complete?",
        answer: "A2A handles long-running tasks through push notifications. You provide a webhook URL, and the remote agent posts updates when status changes. The task remains in WORKING state, and you can poll with get_task() to check progress. Context and state are preserved across the entire duration."
      },
      {
        question: "How do I handle authentication between agents?",
        answer: "Agent Cards declare supported authentication schemes (API keys, OAuth2, mTLS, etc.). The client agent obtains credentials out-of-band (configuration, secret management, etc.) and includes them with each request. For dynamic authorization, agents can transition to AUTH_REQUIRED and request specific scopes mid-task."
      },
      {
        question: "Is A2A only for Google Cloud or can I use it anywhere?",
        answer: "A2A is an open protocol under Apache 2.0 license, governed by the Linux Foundation. While Google initiated it, the protocol is vendor-neutral and can be implemented anywhere. SDKs are available for Python, Go, JavaScript, Java, and .NET. You can run A2A agents on any cloud or on-premises."
      }
    ],

    applications: [
      {
        title: "Enterprise Workflow Orchestration",
        description: "A master orchestrator agent coordinates specialist agents across departments—research agents gather data, analytics agents process it, and reporting agents generate summaries. A2A enables seamless handoffs without custom integration code between each pair."
      },
      {
        title: "Customer Service Escalation",
        description: "Front-line support agents handle routine queries but can escalate to specialist agents (billing, technical support, account management) via A2A handoffs. The conversation context transfers seamlessly, and the specialist agent picks up where the first left off."
      },
      {
        title: "Multi-Vendor Agent Marketplace",
        description: "Organizations can consume agents from multiple vendors through a unified protocol. A travel booking company might use one vendor's flight agent, another's hotel agent, and a third's car rental agent—all coordinated through A2A without vendor lock-in."
      },
      {
        title: "Federated AI Research",
        description: "Research institutions can expose specialized agents (literature review, data analysis, visualization) that other institutions' agents can discover and leverage. A2A enables collaboration while maintaining control over proprietary capabilities."
      },
      {
        title: "Automated Hiring Pipeline",
        description: "A hiring manager's agent coordinates with specialized agents for resume screening, interview scheduling, background checks, and offer generation. Each agent is independently developed and maintained, but they collaborate seamlessly through A2A."
      }
    ],

    resources: [
      {
        title: "A2A Protocol Specification",
        url: "https://a2a-protocol.org/latest/specification/",
        type: "docs",
        description: "The complete official A2A specification with protocol details, message formats, and security requirements",
        summaryPath: "data/day-21/summary-a2a-specification.md"
      },
      {
        title: "A2A GitHub Repository",
        url: "https://github.com/a2aproject/A2A",
        type: "github",
        description: "Official repository with specification, ADRs, and documentation",
        summaryPath: "data/day-21/summary-a2a-github.md"
      },
      {
        title: "A2A Python SDK",
        url: "https://github.com/a2aproject/a2a-python",
        type: "github",
        description: "Official Python SDK for building A2A clients and servers",
        summaryPath: "data/day-21/summary-a2a-python-sdk.md"
      },
      {
        title: "A2A JavaScript SDK",
        url: "https://github.com/a2aproject/a2a-js",
        type: "github",
        description: "Official JavaScript/TypeScript SDK for A2A implementations",
        summaryPath: "data/day-21/summary-a2a-js-sdk.md"
      },
      {
        title: "A2A Sample Implementations",
        url: "https://github.com/a2aproject/a2a-samples",
        type: "github",
        description: "Reference implementations and example agents",
        summaryPath: "data/day-21/summary-a2a-samples.md"
      },
      {
        title: "Announcing A2A - Google Developers Blog",
        url: "https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/",
        type: "article",
        description: "Google's announcement explaining the vision, design principles, and partner ecosystem",
        summaryPath: "data/day-21/summary-a2a-announcement.md"
      },
      {
        title: "A2A DeepLearning.AI Course",
        url: "https://goo.gle/dlai-a2a",
        type: "course",
        description: "Hands-on course for building A2A-compatible agents",
        duration: "2-3 hours",
        summaryPath: "data/day-21/summary-a2a-course.md"
      },
      {
        title: "A2A Google Codelab",
        url: "https://codelabs.developers.google.com/intro-a2a-purchasing-concierge",
        type: "tutorial",
        description: "Step-by-step tutorial building a purchasing concierge with A2A",
        summaryPath: "data/day-21/summary-a2a-codelab.md"
      }
    ],

    relatedDays: [19, 20, 22]
  }
};
