import type { Day } from '../../types';

export const day22: Day = {
  day: 22,
  phase: 4,
  title: "ACP: Agent Communication Protocol",
  partner: "IBM / BeeAI",
  tags: ["acp", "beeai", "interop", "ibm", "rest", "multi-agent", "protocol"],
  concept: "REST-based protocol for peer-to-peer agent collaboration with offline discovery and stateful sessions",
  demoUrl: "demos/day-22/",
  demoDescription: "Explore ACP interactively: visualize agent manifests, simulate message flows between agents, compare REST vs JSON-RPC approaches, and see how ACP complements MCP.",

  lesson: {
    overview: `As enterprises deploy more AI agents, a critical infrastructure challenge emerges: **how do you connect agents built by different teams, using different frameworks, possibly across organizational boundaries?** IBM's **Agent Communication Protocol (ACP)** provides an answer with a deliberately simple, REST-based approach to agent interoperability.

**ACP treats simplicity as a feature, not a limitation.** While other protocols require specialized SDKs and complex message parsing, ACP uses plain HTTP and standard REST conventions. You can test ACP interactions with curl, Postman, or your browser. No special libraries required—though Python and TypeScript SDKs are available when you want them.

The protocol emerged from IBM Research's BeeAI project in March 2025 and was immediately donated to the Linux Foundation, establishing open governance from day one. By September 2025, recognizing the value of industry alignment, the ACP team joined forces with Google's A2A protocol effort to develop a unified standard—demonstrating IBM's commitment to interoperability over proprietary advantage.

**ACP complements MCP at different layers of the stack.** Anthropic's MCP (Days 19-20) standardizes how agents connect to tools and data sources—the "vertical" integration layer. ACP operates one level up, standardizing how agents communicate with other agents—the "horizontal" collaboration layer. A sophisticated system might use MCP for each agent's tool access while using ACP for inter-agent coordination.

**Key differentiators**: REST over HTTP (not JSON-RPC), offline discovery through embedded metadata, native support for scale-to-zero deployments, capability-based security tokens, and built-in OpenTelemetry instrumentation for enterprise observability.`,

    principles: [
      {
        title: "REST-First Design",
        description: "ACP uses standard HTTP methods and REST conventions rather than JSON-RPC. This means you can interact with ACP agents using curl, Postman, or any HTTP client. GET /agents lists available agents. POST /runs executes operations. No specialized libraries or protocol-specific parsing required. This dramatically lowers the barrier to integration—if your system can make HTTP requests, it can communicate with ACP agents."
      },
      {
        title: "Agent Manifests for Discovery",
        description: "Each agent advertises its capabilities through a manifest—a JSON document containing name, description, supported operations, input/output schemas, and metadata. Unlike protocols requiring live discovery endpoints, ACP manifests can be embedded in agent distribution packages, enabling discovery even when agents are offline. This is critical for scale-to-zero deployments where agents spin down when idle."
      },
      {
        title: "Stateful Sessions",
        description: "ACP provides native session management where agents maintain state and conversation history across multiple interactions. Sessions use identifiers that persist across requests, allowing long-running planning agents to survive restarts, maintain context, and resume complex workflows. The protocol handles state serialization automatically."
      },
      {
        title: "Flexible Communication Patterns",
        description: "ACP supports three interaction modes: synchronous request-response for quick operations, asynchronous fire-and-forget with task IDs for polling or webhooks, and streaming via WebSockets or SSE for real-time updates during long operations. Each agent declares which patterns it supports in its manifest."
      },
      {
        title: "Capability-Based Security",
        description: "Security uses capability tokens—unforgeable, signed objects encoding resource types, permitted operations, and expiration times. Any agent can verify tokens locally without central authority. The token system integrates with Kubernetes RBAC, mapping capability claims to existing cluster roles for seamless enterprise deployment."
      }
    ],

    codeExample: {
      language: "python",
      title: "Basic ACP Agent Interaction",
      code: `from acp import ACPClient
import asyncio

async def main():
    # Initialize client pointing to ACP server
    client = ACPClient("http://localhost:8000")

    # List available agents
    agents = await client.list_agents()
    print(f"Available agents: {[a.name for a in agents]}")

    # Get a specific agent's manifest
    research_agent = await client.get_agent("gpt-researcher")
    print(f"Agent: {research_agent.name}")
    print(f"Description: {research_agent.description}")

    # Create a run (execute the agent)
    run = await client.create_run(
        agent="gpt-researcher",
        input={
            "role": "user",
            "parts": [{"content": "Research recent advances in quantum computing", "content_type": "text/plain"}]
        }
    )

    print(f"Run ID: {run.id}")
    print(f"Status: {run.status}")

    # For streaming responses
    async for event in client.stream_run(run.id):
        if event.type == "message":
            print(f"Agent: {event.content}")
        elif event.type == "status":
            print(f"Status: {event.status}")

if __name__ == "__main__":
    asyncio.run(main())`
    },

    diagram: {
      type: "mermaid",
      title: "ACP Architecture Overview",
      mermaid: `flowchart TB
    subgraph Client["Client Application"]
        APP["Your App"]
        CLI["beeai CLI"]
    end

    subgraph ACP["ACP Protocol Layer"]
        REST["REST API"]
        DISC["Discovery"]
        SESS["Sessions"]
    end

    subgraph Agents["ACP Agents"]
        A1["Research Agent"]
        A2["Code Agent"]
        A3["Chat Agent"]
    end

    subgraph Manifests["Agent Manifests"]
        M1["manifest.json"]
        M2["manifest.json"]
        M3["manifest.json"]
    end

    APP -->|"HTTP GET/POST"| REST
    CLI -->|"beeai run"| REST
    REST -->|"List/Execute"| Agents
    DISC -->|"Index"| Manifests
    A1 -.->|"advertises"| M1
    A2 -.->|"advertises"| M2
    A3 -.->|"advertises"| M3
    SESS -->|"State"| Agents

    style Client fill:#e3f2fd
    style ACP fill:#fff3e0
    style Agents fill:#f3e5f5
    style Manifests fill:#e8f5e9`
    },

    keyTakeaways: [
      "ACP uses REST over HTTP—no specialized SDKs required; test with curl or Postman",
      "Agent manifests enable discovery even when agents are offline (scale-to-zero friendly)",
      "Sessions maintain state across interactions, enabling complex multi-turn workflows",
      "Three communication patterns: sync (HTTP), async (polling/webhooks), streaming (WebSocket/SSE)",
      "Capability tokens provide decentralized, verifiable security integrated with Kubernetes RBAC",
      "ACP complements MCP: MCP connects agents to tools, ACP connects agents to agents",
      "Merged with Google's A2A in September 2025 under Linux Foundation governance"
    ],

    resources: [
      {
        title: "ACP GitHub Repository",
        url: "https://github.com/i-am-bee/acp",
        type: "github",
        description: "Official ACP specification, SDKs, and reference implementation"
      },
      {
        title: "What is Agent Communication Protocol? - IBM",
        url: "https://www.ibm.com/think/topics/agent-communication-protocol",
        type: "article",
        description: "IBM's comprehensive overview of ACP concepts and architecture"
      },
      {
        title: "ACP Technical Deep Dive - IBM Research",
        url: "https://research.ibm.com/blog/agent-communication-protocol-ai",
        type: "article",
        description: "Technical blog post on ACP design decisions and implementation"
      },
      {
        title: "BeeAI Platform",
        url: "https://research.ibm.com/blog/multiagent-bee-ai",
        type: "article",
        description: "IBM's multi-agent platform built on ACP"
      }
    ]
  },

  learn: {
    overview: {
      summary: "ACP (Agent Communication Protocol) is IBM's REST-based standard for agent-to-agent communication, featuring offline discovery, stateful sessions, and capability-based security for enterprise multi-agent systems.",
      fullDescription: `The proliferation of AI agent frameworks has created an interoperability challenge. You might have a research agent built with LangChain, a coding agent using AutoGen, and a customer service agent from a SaaS vendor. Each works well in isolation, but making them collaborate requires custom integration code for every pair—a classic N×M problem.

**ACP addresses this with a deliberately simple protocol.** Rather than inventing new message formats or requiring specialized libraries, ACP uses the HTTP and REST conventions that every developer already knows. Want to see what agents are available? Send a GET request. Want to run an agent? POST to its endpoint. This simplicity is intentional—IBM's research team found that protocol complexity was a major barrier to adoption in enterprise settings.

\`\`\`
Traditional Integration (N×M complexity):
┌─────────┐     ┌─────────────┐     ┌─────────┐
│ Agent A │────▶│   Custom    │────▶│ Agent X │
│         │────▶│ Integration │────▶│ Agent Y │
│         │────▶│  Code ×N×M  │────▶│ Agent Z │
└─────────┘     └─────────────┘     └─────────┘

With ACP (N+M implementations):
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Any ACP │────▶│   REST  │────▶│ Any ACP │
│  Agent  │     │   HTTP  │     │  Agent  │
└─────────┘     └─────────┘     └─────────┘
\`\`\`

**ACP operates in a different layer than MCP.** Anthropic's Model Context Protocol standardizes how a single agent connects to tools and data—it's about enriching one agent's capabilities. ACP operates one level higher, standardizing how multiple agents communicate with each other. The protocols are complementary: use MCP to give your agents access to databases and APIs, use ACP to let those agents collaborate with other agents.

**The protocol emphasizes enterprise requirements**: built-in OpenTelemetry instrumentation for observability, capability tokens for fine-grained security, session persistence for long-running workflows, and offline discovery for scale-to-zero deployments. These aren't afterthoughts—they're core to the protocol design.

**Historical note**: ACP was developed independently of Google's A2A protocol, but in September 2025, recognizing that competing standards would fragment the ecosystem, IBM's ACP team joined forces with Google's A2A effort under Linux Foundation governance. This lesson covers ACP's design principles and implementation patterns, which remain valuable even as the protocols converge.`,
      prerequisites: [
        "Day 19-20: MCP fundamentals (complementary protocol)",
        "Understanding of REST APIs and HTTP methods",
        "Basic async programming (for streaming)",
        "Day 21: A2A protocol (ACP's sister protocol, now merged)"
      ],
      estimatedTime: "2-3 hours",
      difficulty: "advanced"
    },

    concepts: [
      {
        title: "The Case for REST: Why Not JSON-RPC?",
        description: `ACP's most distinctive design choice is using REST over HTTP rather than JSON-RPC. This isn't just a technical preference—it reflects a philosophy about protocol adoption and developer experience.

JSON-RPC, used by MCP and initially by A2A, requires parsing a specific message format. Even simple operations need code that understands the RPC envelope: extracting the method name, parsing parameters, and constructing responses in the expected format. You need libraries or custom parsing code. You can't easily test endpoints with basic tools.

REST, by contrast, uses HTTP semantics that every developer already knows. Resources have URLs. GET retrieves them. POST creates or executes them. Status codes indicate success or failure. Headers carry metadata. The entire web ecosystem—browsers, curl, Postman, monitoring tools, load balancers, CDNs—understands REST natively.

For ACP, this means you can explore an agent's capabilities by browsing to its manifest URL. You can trigger an agent run by posting JSON to an endpoint using curl. You can debug issues by looking at standard HTTP traffic in your existing observability tools. No special protocol knowledge required.

Consider a practical example: a developer wants to test if an ACP agent is working correctly. With REST, they open Postman, make a GET request to /agents, and immediately see the response. With JSON-RPC, they need to construct a properly formatted RPC message, POST it, and parse the RPC response envelope. The REST approach removes friction at every step.

This simplicity has costs. REST doesn't naturally support bidirectional communication—you need WebSockets or SSE for streaming. It can be more verbose than compact RPC formats. But IBM's research found that the reduction in integration complexity far outweighed these costs, especially in enterprise environments where developers work with dozens of different systems.`,
        analogy: "REST vs JSON-RPC is like the difference between a standard electrical outlet and a proprietary connector. The outlet works with any device that has a plug—no adapters needed. The proprietary connector might be more efficient, but you need special equipment to use it. In enterprises where integration matters, universal compatibility wins.",
        gotchas: [
          "REST requires separate mechanisms for streaming (WebSocket/SSE)",
          "You still need to understand the payload schemas—REST doesn't validate content",
          "Different HTTP clients handle things like timeouts and retries differently",
          "Large payloads may need chunking strategies that REST doesn't specify"
        ]
      },
      {
        title: "Agent Manifests and Offline Discovery",
        description: `Before agents can collaborate, they need to discover each other's capabilities. ACP handles this through agent manifests—JSON documents describing what an agent can do, what inputs it accepts, and how to interact with it.

A manifest contains several key elements. **Identity** includes the agent's name, description, and version. **Capabilities** describe what the agent can do—its skills, supported operations, and any constraints. **Interfaces** specify technical details: endpoint URLs, supported communication patterns (sync, async, streaming), authentication requirements. **Metadata** provides additional context: author, license, tags for categorization.

What makes ACP's discovery unique is **offline support**. In many protocols, discovery requires querying a live endpoint—you send a request, the agent responds with its capabilities. But this assumes the agent is running. In scale-to-zero architectures, agents spin down when idle to save resources. They can't respond to discovery queries if they're not running.

ACP solves this by allowing manifests to be embedded in agent distribution packages. When you package an agent as a container image, npm package, or pip installable, you include the manifest. A registry or orchestrator can index these manifests without starting the agents. When a client searches for agents with certain capabilities, the index returns matches—including agents that are currently scaled to zero. Only when the client actually wants to use an agent does it need to spin up.

This design also supports air-gapped environments where agents can't reach external discovery services. The manifest travels with the agent, enabling discovery in isolated networks.

The manifest format is deliberately simple: flat JSON with well-known fields. No complex schemas or validation requirements. If you can produce JSON, you can create a manifest. This low barrier encourages adoption—even quick prototype agents can participate in the ecosystem.`,
        analogy: "Agent manifests are like product labels on store shelves. You can see what's available and what each product does without opening every box. In scale-to-zero deployments, it's like a catalog for products that aren't on the shelf yet—you can browse what's available and the store will bring it out when you want it.",
        gotchas: [
          "Manifests can become stale if agent capabilities change—implement versioning",
          "Offline discovery requires a registry or orchestrator to index manifests",
          "Rich capability descriptions improve discoverability but require more maintenance",
          "Consider manifest signing for security-sensitive environments"
        ]
      },
      {
        title: "Messages and Multimodal Communication",
        description: `ACP messages are designed for rich, multimodal communication between agents. Rather than restricting content to plain text, the message structure supports text, images, structured data, and file references—all in a single message.

A message consists of a **role** indicating the sender (user, agent/[name], or system) and an array of **parts**. Each part has a content field, a content_type (MIME type like text/plain, image/png, application/json), optional content_encoding (for binary data), and optional content_url (for external resources).

This structure enables sophisticated interactions. A user might send a message with a text part asking for analysis and an image part containing a chart to analyze. An agent might respond with a text explanation, a JSON part containing structured data, and a URL part pointing to a generated visualization.

The multipart structure also supports streaming. During a long operation, an agent can send incremental message parts as they're produced. The client receives text as it's generated, sees progress updates, and gets final artifacts—all within the message stream. This is particularly important for agents performing multi-step reasoning where users want visibility into intermediate steps.

Messages exist within **sessions**—persistent contexts that maintain conversation history across multiple interactions. When you create a session, subsequent messages can reference it, and the agent sees the full conversation history. Sessions survive agent restarts (assuming proper state persistence), enabling complex workflows that span multiple interactions over hours or days.

The message format includes timestamps, message IDs, and optional metadata fields for custom extensions. This metadata might include priority levels, deadline hints, or application-specific context. The protocol doesn't mandate how agents use this metadata, but it provides the structure for conveying it.`,
        analogy: "ACP messages are like multimedia emails with attachments. You can include text, images, and files all in one message. The recipient knows what type each attachment is and how to handle it. Sessions are like email threads—the conversation history is preserved across multiple exchanges.",
        gotchas: [
          "Large binary content should use content_url rather than inline encoding",
          "Not all agents support all content types—check the manifest",
          "Session state persistence depends on the agent implementation",
          "Message ordering matters—parts are processed sequentially"
        ]
      },
      {
        title: "Runs and Task Lifecycle",
        description: `In ACP, executing an agent operation creates a **run**—a tracked unit of work with its own lifecycle. Understanding runs is essential for building robust systems that handle long operations, failures, and concurrent requests.

When you POST to create a run, ACP assigns a unique run ID and returns immediately with the run's initial status. The run then progresses through a lifecycle: **PENDING** (queued but not started), **RUNNING** (actively processing), **COMPLETED** (finished successfully), **FAILED** (encountered an error), or **CANCELLED** (terminated by request).

This lifecycle model decouples request submission from completion. For quick operations, the run might complete before the initial response returns, and you get the result immediately. For long operations, you get the run ID and can check status later through polling, subscribe to updates via streaming, or receive webhook notifications.

Runs can be **synchronous** (block until complete), **asynchronous** (return immediately, check later), or **streaming** (return immediately, receive updates as they happen). The communication pattern is specified when creating the run, subject to what the agent supports.

Each run maintains its own **state**: inputs provided, outputs generated, intermediate artifacts, timing information, and error details if something went wrong. This state is queryable even after completion, supporting audit trails and debugging. Runs also emit **OpenTelemetry spans**, integrating with enterprise observability infrastructure.

For complex workflows, runs can be **chained**: one run's output becomes another's input. The ACP client SDKs provide helpers for building these chains, handling the data flow and error propagation automatically. You can also use runs with **sessions**, where multiple runs share conversation context.

The run model also supports **await**—agents can pause execution to request additional input. The run transitions to an AWAITING_INPUT state, and the client must provide the requested information before the run can continue. This enables interactive workflows where agents ask clarifying questions mid-execution.`,
        analogy: "Runs are like order tracking at a restaurant. When you place an order (create a run), you get a ticket number (run ID). You can check the kitchen display (query status), get notified when it's ready (streaming/webhooks), or just wait at the counter (synchronous). The kitchen might ask how you want your steak done (await input).",
        gotchas: [
          "Long-running runs need timeout handling on the client side",
          "FAILED runs include error details—always check them for debugging",
          "CANCELLED runs may have partial results—handle cleanup appropriately",
          "Run state persistence varies by implementation—don't assume unlimited retention"
        ]
      },
      {
        title: "Capability Tokens and Security",
        description: `Enterprise deployments require robust security, and ACP addresses this with capability tokens—a decentralized authorization mechanism that doesn't depend on central authority for verification.

A capability token is a signed JSON object containing: the **resource type** (what kind of thing can be accessed), **permitted operations** (what actions are allowed), **scope** (any constraints on access), and **expiration** (when the token becomes invalid). The signature ensures tokens can't be forged or modified.

The key insight is that any agent can verify a capability token locally by checking the signature. There's no need to call a central authorization service—verification is a simple cryptographic operation. This matters for distributed systems where network latency or availability of central services could become bottlenecks.

When an agent receives a request with a capability token, it verifies the signature (ensuring authenticity), checks the expiration (ensuring validity), compares the requested operation against permitted operations (ensuring authorization), and only then proceeds with the request. All of this happens without external calls.

For Kubernetes environments, ACP's capability tokens integrate with RBAC. The token issuer maps Kubernetes role bindings to capability claims—if a service account has a certain role, tokens issued to it automatically include the corresponding capabilities. This leverages existing security infrastructure rather than requiring parallel permission systems.

Capability tokens support **delegation**. An agent with broad capabilities can issue more restricted tokens to other agents, enabling them to perform specific operations without granting full access. This is useful for workflows where a coordinator agent delegates to specialists but wants to limit what each specialist can do.

The token format is extensible for custom claims, allowing organizations to include application-specific authorization data. However, tokens should remain reasonably small—they're included with every request.`,
        analogy: "Capability tokens are like movie tickets. The ticket itself proves you're allowed entry—you don't need to call the box office. It specifies what you can access (this movie, this showtime), and it has an expiration (today only). A manager (token issuer) can give employees discounted tickets (delegation) with specific restrictions.",
        gotchas: [
          "Token expiration requires clock synchronization across systems",
          "Lost tokens can't be revoked—keep expiration times reasonable",
          "Token size affects request overhead—don't embed large data",
          "Signature verification requires distributing public keys"
        ]
      },
      {
        title: "Agent Lifecycle Management",
        description: `In production environments, agents aren't static—they're deployed, updated, scaled, and eventually retired. ACP provides a structured lifecycle model for managing these transitions without disrupting ongoing operations.

An agent progresses through defined states: **INITIALIZING** (starting up, loading models, establishing connections), **ACTIVE** (fully operational, accepting requests), **DEGRADED** (operational but with reduced capacity or missing features), **RETIRING** (no longer accepting new requests but completing existing work), and **RETIRED** (completely shut down).

Each state transition can trigger events that other systems observe. When an agent moves from INITIALIZING to ACTIVE, a load balancer might start routing traffic to it. When it enters RETIRING, the orchestrator stops sending new requests while existing runs complete. These transitions enable graceful operations that don't drop requests.

The lifecycle model includes **versioning**. Each agent version has its own lifecycle, and multiple versions can coexist. A new version might be ACTIVE while an old version is RETIRING, enabling gradual migration. The manifest includes version information and optionally a reference to successor agents, helping clients discover upgrades.

**Health checks** monitor agent state continuously. ACP defines standard health endpoints that orchestrators probe. An agent might transition from ACTIVE to DEGRADED if a dependency becomes unavailable, then back to ACTIVE when it recovers. These transitions are automatic based on health check results.

All lifecycle events emit **OpenTelemetry spans** with structured metadata (version, transition timestamp, reason). This integrates with enterprise monitoring—SOC teams see agent state changes in the same dashboards where they track other infrastructure. No special tooling required.

For complex deployments, lifecycle management extends to **agent groups**—collections of related agents managed as units. You can roll out updates to a group, monitor aggregate health, and enforce policies across all members.`,
        analogy: "Agent lifecycle is like employee onboarding and offboarding. INITIALIZING is the first week (training, setup). ACTIVE is normal employment. DEGRADED is working through an illness—still functional but not at full capacity. RETIRING is the notice period—finishing current projects but not starting new ones. RETIRED is after the last day.",
        gotchas: [
          "DEGRADED agents may have unpredictable behavior—monitor closely",
          "RETIRING timeout prevents indefinite waiting for long runs",
          "Version migration requires testing with both old and new versions active",
          "Health check frequency balances responsiveness with overhead"
        ]
      },
      {
        title: "ACP + MCP: Complementary Protocols",
        description: `ACP and Anthropic's MCP are frequently discussed together, and understanding their relationship is crucial for designing comprehensive agent systems. They're not competitors—they solve different problems at different layers of the stack.

**MCP** standardizes how an agent connects to tools and data sources. When an agent needs to query a database, call an API, read files, or execute code, MCP provides the interface. It's about enriching a single agent's capabilities—giving it access to the external world. MCP uses JSON-RPC, supports tool/resource/prompt primitives, and focuses on the agent-to-tool relationship.

**ACP** standardizes how agents communicate with other agents. When a research agent needs to delegate to an analytics agent, or when multiple specialists need to collaborate on a complex task, ACP provides the interface. It's about enabling multi-agent collaboration—connecting independent agents into coordinated systems. ACP uses REST, supports messages/runs/sessions primitives, and focuses on the agent-to-agent relationship.

In a sophisticated enterprise system, both protocols operate simultaneously. Each agent uses MCP to access its tools: the research agent connects to search APIs via MCP, the analytics agent connects to databases via MCP, the visualization agent connects to charting libraries via MCP. Meanwhile, ACP enables these agents to discover each other, exchange information, and coordinate workflows.

The protocols differ in several ways beyond their focus:

| Aspect | MCP | ACP |
|--------|-----|-----|
| Transport | JSON-RPC | REST/HTTP |
| Focus | Agent ↔ Tools | Agent ↔ Agent |
| Primitives | Tools, Resources, Prompts | Messages, Runs, Sessions |
| Discovery | Server capabilities | Agent manifests |
| State | Typically stateless | Sessions with persistence |

One practical consideration: if you're building a single agent that needs tool access, MCP alone might suffice. If you're building a multi-agent system where agents collaborate, you'll want ACP for inter-agent communication (and probably MCP for each agent's tool access). If you're exposing an agent as a service for others to use, ACP's discovery and communication model is designed exactly for that scenario.`,
        analogy: "MCP is like a person's hands—how they interact with objects and tools. ACP is like their voice—how they communicate with other people. You need both: hands to use tools, voice to coordinate with colleagues. An agent using only MCP can do things independently; an agent using both can do things AND collaborate.",
        gotchas: [
          "Don't use ACP for simple tool calls—MCP is more efficient for that",
          "Don't use MCP for agent delegation—ACP handles the lifecycle properly",
          "Both protocols can coexist without conflict in the same system",
          "Consider latency: ACP adds network hops for inter-agent calls"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Basic ACP Client",
        language: "python",
        category: "basic",
        explanation: "A minimal ACP client that discovers agents and creates a run using the REST API.",
        code: `"""Basic ACP Client Example

Demonstrates the core ACP workflow:
1. List available agents
2. Get agent manifest
3. Create and monitor a run
"""

import httpx
import asyncio

async def main():
    base_url = "http://localhost:8000"

    async with httpx.AsyncClient() as client:
        # Step 1: List available agents
        response = await client.get(f"{base_url}/agents")
        agents = response.json()

        print("Available agents:")
        for agent in agents:
            print(f"  - {agent['name']}: {agent['description']}")

        # Step 2: Get specific agent manifest
        response = await client.get(f"{base_url}/agents/researcher")
        manifest = response.json()

        print(f"\\nAgent: {manifest['name']}")
        print(f"Version: {manifest.get('version', 'unknown')}")
        print(f"Capabilities: {manifest.get('capabilities', [])}")

        # Step 3: Create a run
        run_request = {
            "agent": "researcher",
            "input": {
                "role": "user",
                "parts": [
                    {
                        "content": "Research recent developments in quantum computing",
                        "content_type": "text/plain"
                    }
                ]
            }
        }

        response = await client.post(
            f"{base_url}/runs",
            json=run_request
        )
        run = response.json()

        print(f"\\nRun created: {run['id']}")
        print(f"Status: {run['status']}")

        # Step 4: Poll for completion (simple approach)
        while run['status'] in ['PENDING', 'RUNNING']:
            await asyncio.sleep(1)
            response = await client.get(f"{base_url}/runs/{run['id']}")
            run = response.json()
            print(f"Status: {run['status']}")

        # Step 5: Get results
        if run['status'] == 'COMPLETED':
            print(f"\\nResult:")
            for part in run.get('output', {}).get('parts', []):
                print(part.get('content', ''))
        else:
            print(f"Run failed: {run.get('error', 'Unknown error')}")

if __name__ == "__main__":
    asyncio.run(main())`
      },
      {
        title: "Streaming Run with SSE",
        language: "python",
        category: "intermediate",
        explanation: "Handle streaming responses using Server-Sent Events for real-time updates during long operations.",
        code: `"""ACP Streaming Example

Demonstrates streaming runs using Server-Sent Events:
- Create a streaming run
- Process events as they arrive
- Handle different event types
"""

import httpx
import json
import asyncio

async def stream_run():
    base_url = "http://localhost:8000"

    async with httpx.AsyncClient(timeout=None) as client:
        # Create a streaming run
        run_request = {
            "agent": "researcher",
            "input": {
                "role": "user",
                "parts": [{
                    "content": "Write a comprehensive analysis of AI trends",
                    "content_type": "text/plain"
                }]
            },
            "stream": True  # Enable streaming
        }

        # Use streaming response
        async with client.stream(
            "POST",
            f"{base_url}/runs",
            json=run_request,
            headers={"Accept": "text/event-stream"}
        ) as response:

            async for line in response.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue

                data = json.loads(line[6:])  # Remove "data: " prefix
                event_type = data.get("type")

                if event_type == "run.created":
                    print(f"Run started: {data['run']['id']}")

                elif event_type == "run.status":
                    print(f"Status: {data['status']}")

                elif event_type == "message.delta":
                    # Incremental content update
                    content = data.get("delta", {}).get("content", "")
                    print(content, end="", flush=True)

                elif event_type == "message.complete":
                    print("\\n--- Message complete ---")

                elif event_type == "run.completed":
                    print(f"\\nRun completed successfully")
                    break

                elif event_type == "run.failed":
                    print(f"\\nRun failed: {data.get('error')}")
                    break

                elif event_type == "run.awaiting_input":
                    # Agent needs more information
                    print(f"\\nAgent asks: {data.get('message')}")
                    # Would need to send additional input here

async def main():
    await stream_run()

if __name__ == "__main__":
    asyncio.run(main())`
      },
      {
        title: "Building an ACP Server",
        language: "python",
        category: "advanced",
        explanation: "A complete ACP server implementation with agent manifest, run management, and streaming support.",
        code: `"""ACP Server Implementation

Demonstrates building a compliant ACP server:
- Serve agent manifest at /agents/{name}
- Handle run creation at POST /runs
- Support streaming responses
- Implement session management
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import json
import asyncio
from datetime import datetime

app = FastAPI()

# ============================================================
# Agent Manifest
# ============================================================

AGENT_MANIFEST = {
    "name": "summarizer",
    "description": "Summarizes text content into concise overviews",
    "version": "1.0.0",
    "author": "Example Corp",
    "capabilities": ["summarization", "extraction"],
    "interfaces": {
        "sync": True,
        "async": True,
        "streaming": True
    },
    "inputSchema": {
        "type": "object",
        "properties": {
            "content": {"type": "string"},
            "max_length": {"type": "integer", "default": 200}
        },
        "required": ["content"]
    }
}

# ============================================================
# In-Memory Storage
# ============================================================

runs: dict = {}
sessions: dict = {}

# ============================================================
# Models
# ============================================================

class MessagePart(BaseModel):
    content: str
    content_type: str = "text/plain"

class Message(BaseModel):
    role: str
    parts: list[MessagePart]

class RunRequest(BaseModel):
    agent: str
    input: Message
    session_id: Optional[str] = None
    stream: bool = False

# ============================================================
# Endpoints
# ============================================================

@app.get("/agents")
async def list_agents():
    """List all available agents."""
    return [{"name": AGENT_MANIFEST["name"], "description": AGENT_MANIFEST["description"]}]

@app.get("/agents/{name}")
async def get_agent(name: str):
    """Get agent manifest."""
    if name != AGENT_MANIFEST["name"]:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AGENT_MANIFEST

@app.post("/runs")
async def create_run(request: RunRequest):
    """Create a new run."""

    if request.agent != AGENT_MANIFEST["name"]:
        raise HTTPException(status_code=404, detail="Agent not found")

    run_id = str(uuid.uuid4())

    run = {
        "id": run_id,
        "agent": request.agent,
        "status": "PENDING",
        "created_at": datetime.utcnow().isoformat(),
        "input": request.input.dict(),
        "output": None,
        "session_id": request.session_id or str(uuid.uuid4())
    }

    runs[run_id] = run

    if request.stream:
        return StreamingResponse(
            stream_run(run),
            media_type="text/event-stream"
        )
    else:
        # Synchronous execution
        result = await execute_run(run)
        return {"run": result}

@app.get("/runs/{run_id}")
async def get_run(run_id: str):
    """Get run status."""
    if run_id not in runs:
        raise HTTPException(status_code=404, detail="Run not found")
    return runs[run_id]

# ============================================================
# Run Execution
# ============================================================

async def execute_run(run: dict) -> dict:
    """Execute a run synchronously."""
    run["status"] = "RUNNING"

    try:
        # Extract input text
        input_text = run["input"]["parts"][0]["content"]

        # Simulate processing
        await asyncio.sleep(1)

        # Generate summary (placeholder - would use actual LLM)
        summary = f"Summary of: {input_text[:100]}..."

        run["output"] = {
            "role": "agent/summarizer",
            "parts": [{"content": summary, "content_type": "text/plain"}]
        }
        run["status"] = "COMPLETED"
        run["completed_at"] = datetime.utcnow().isoformat()

    except Exception as e:
        run["status"] = "FAILED"
        run["error"] = str(e)

    return run

async def stream_run(run: dict):
    """Execute a run with streaming output."""

    # Send run created event
    yield f"data: {json.dumps({'type': 'run.created', 'run': run})}\\n\\n"

    run["status"] = "RUNNING"
    yield f"data: {json.dumps({'type': 'run.status', 'status': 'RUNNING'})}\\n\\n"

    try:
        input_text = run["input"]["parts"][0]["content"]

        # Simulate streaming generation
        words = f"This is a summary of the provided content about {input_text[:50]}".split()

        for word in words:
            await asyncio.sleep(0.1)  # Simulate generation time
            yield f"data: {json.dumps({'type': 'message.delta', 'delta': {'content': word + ' '}})}\\n\\n"

        yield f"data: {json.dumps({'type': 'message.complete'})}\\n\\n"

        run["status"] = "COMPLETED"
        yield f"data: {json.dumps({'type': 'run.completed', 'run_id': run['id']})}\\n\\n"

    except Exception as e:
        run["status"] = "FAILED"
        yield f"data: {json.dumps({'type': 'run.failed', 'error': str(e)})}\\n\\n"

# ============================================================
# Session Management
# ============================================================

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session state and history."""
    if session_id not in sessions:
        sessions[session_id] = {
            "id": session_id,
            "created_at": datetime.utcnow().isoformat(),
            "history": []
        }
    return sessions[session_id]

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session."""
    if session_id in sessions:
        del sessions[session_id]
    return {"deleted": True}

# Run with: uvicorn server:app --host 0.0.0.0 --port 8000`
      },
      {
        title: "Multi-Agent Composition with BeeAI",
        language: "bash",
        category: "intermediate",
        explanation: "Using the BeeAI CLI to compose multiple ACP agents into a workflow.",
        code: `# BeeAI CLI: Multi-Agent Composition
# Demonstrates sequential and parallel agent composition

# ============================================================
# Setup
# ============================================================

# Install BeeAI CLI
brew install i-am-bee/beeai/beeai

# Start the BeeAI service
brew services start beeai

# Configure your LLM provider
beeai env setup
# Select: Ollama, OpenAI, or Together.ai

# ============================================================
# Basic Operations
# ============================================================

# List available agents
beeai list

# Output:
# NAME            DESCRIPTION                          STATUS
# gpt-researcher  Research agent with web search       active
# aider           AI pair programmer                   active
# summarizer      Text summarization                   active

# Get agent details
beeai info gpt-researcher

# Run a single agent
beeai run gpt-researcher "Research quantum computing advances in 2025"

# ============================================================
# Sequential Composition
# ============================================================

# Chain agents: research -> summarize
beeai compose sequential \\
  --agents "gpt-researcher,summarizer" \\
  --input "Research the impact of AI on healthcare"

# The output of gpt-researcher becomes input to summarizer

# ============================================================
# Parallel Composition
# ============================================================

# Run multiple agents in parallel
beeai compose parallel \\
  --agents "gpt-researcher,analyst" \\
  --input "Analyze market trends in renewable energy" \\
  --merge-strategy "concatenate"

# Both agents process the same input, results are merged

# ============================================================
# Custom Workflow
# ============================================================

# Create a workflow definition
cat > workflow.yaml << 'EOF'
name: research-and-report
description: Research a topic and generate a report

steps:
  - name: research
    agent: gpt-researcher
    input: "{{user_input}}"

  - name: analyze
    agent: analyst
    input: "{{steps.research.output}}"

  - name: summarize
    agent: summarizer
    input: "{{steps.analyze.output}}"
    config:
      max_length: 500

  - name: format
    agent: formatter
    input: "{{steps.summarize.output}}"
    output_format: markdown
EOF

# Run the workflow
beeai workflow run workflow.yaml \\
  --input "AI regulation trends in Europe"

# ============================================================
# Monitoring
# ============================================================

# View run history
beeai runs list

# Get run details
beeai runs get <run-id>

# Stream logs
beeai logs -f

# View in web UI
open http://localhost:8333`
      }
    ],

    diagrams: [
      {
        title: "ACP Protocol Stack",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Applications["Applications"]
        APP1["Enterprise App"]
        APP2["Orchestrator"]
        APP3["CLI/UI"]
    end

    subgraph ACP["ACP Layer"]
        REST["REST API"]
        STREAM["Streaming<br/>(SSE/WebSocket)"]
        DISC["Discovery"]
        AUTH["Capability Tokens"]
    end

    subgraph Agents["ACP Agents"]
        A1["Agent A<br/>(Python)"]
        A2["Agent B<br/>(TypeScript)"]
        A3["Agent C<br/>(Any Framework)"]
    end

    subgraph MCP["MCP Layer (per agent)"]
        T1["Tools"]
        T2["Resources"]
        T3["Prompts"]
    end

    Applications -->|"HTTP"| ACP
    ACP -->|"Messages/Runs"| Agents
    Agents -->|"Tool calls"| MCP

    style Applications fill:#e3f2fd
    style ACP fill:#fff3e0
    style Agents fill:#f3e5f5
    style MCP fill:#e8f5e9`,
        caption: "ACP operates above MCP in the stack: MCP connects agents to tools, ACP connects agents to each other."
      },
      {
        title: "Run Lifecycle",
        type: "mermaid",
        mermaid: `stateDiagram-v2
    [*] --> PENDING: POST /runs

    PENDING --> RUNNING: Agent starts
    PENDING --> FAILED: Validation error

    RUNNING --> COMPLETED: Success
    RUNNING --> FAILED: Error
    RUNNING --> CANCELLED: User cancels
    RUNNING --> AWAITING_INPUT: Need clarification

    AWAITING_INPUT --> RUNNING: Input provided
    AWAITING_INPUT --> CANCELLED: Timeout/cancel

    COMPLETED --> [*]
    FAILED --> [*]
    CANCELLED --> [*]`,
        caption: "Runs progress through defined states. AWAITING_INPUT allows agents to request clarification mid-execution."
      },
      {
        title: "Agent Discovery Flow",
        type: "mermaid",
        mermaid: `sequenceDiagram
    participant C as Client
    participant R as Registry
    participant A1 as Agent A
    participant A2 as Agent B

    Note over R,A2: Offline Discovery (manifests embedded in packages)
    A1->>R: Register manifest
    A2->>R: Register manifest
    Note over A1,A2: Agents may be scaled to zero

    Note over C,R: Client Discovery
    C->>R: GET /agents?capability=research
    R-->>C: [Agent A manifest, Agent B manifest]

    Note over C,A1: Direct Communication
    C->>A1: POST /runs (wake up if needed)
    A1-->>C: Run response

    Note over C,A2: Parallel Execution
    C->>A2: POST /runs
    A2-->>C: Run response`,
        caption: "ACP supports offline discovery through manifests, enabling scale-to-zero deployments."
      },
      {
        title: "ACP vs MCP vs A2A",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph Agent["AI Agent"]
        CORE["Agent Core"]
    end

    subgraph MCP_Layer["MCP (Vertical)"]
        DB[(Database)]
        API[External API]
        FS[File System]
    end

    subgraph ACP_Layer["ACP/A2A (Horizontal)"]
        AG1["Other Agent"]
        AG2["Other Agent"]
        AG3["Other Agent"]
    end

    CORE -->|"Tool calls"| MCP_Layer
    CORE <-->|"Messages"| ACP_Layer

    style Agent fill:#fff3e0
    style MCP_Layer fill:#e8f5e9
    style ACP_Layer fill:#e3f2fd`,
        caption: "MCP handles vertical integration (agent-to-tools), ACP/A2A handles horizontal integration (agent-to-agent)."
      }
    ],

    faq: [
      {
        question: "Why does ACP use REST instead of JSON-RPC like MCP?",
        answer: "REST provides immediate accessibility—you can test ACP endpoints with curl, Postman, or a browser without specialized libraries. IBM's research found this lower barrier significantly improved adoption in enterprise settings where developers work with many different systems. The tradeoff is that streaming requires separate mechanisms (WebSocket/SSE), but the simplified integration was deemed worth it."
      },
      {
        question: "How does ACP's offline discovery work?",
        answer: "Agent manifests can be embedded in distribution packages (container images, pip/npm packages). A registry indexes these manifests, enabling discovery queries even when agents are scaled to zero. When you search for agents with certain capabilities, you find them in the index; only when you actually want to use one does it need to spin up. This is critical for cost-efficient deployments."
      },
      {
        question: "What happened to ACP after the A2A merger?",
        answer: "In September 2025, IBM's ACP team joined Google's A2A effort under Linux Foundation governance. The protocols are being unified, with ACP's REST-first approach and offline discovery influencing A2A's evolution. BeeAI now uses A2A while maintaining backward compatibility. Learning ACP principles remains valuable as they're incorporated into the unified standard."
      },
      {
        question: "When should I use ACP vs MCP?",
        answer: "Use MCP when connecting an agent to tools and data sources—databases, APIs, file systems. Use ACP when connecting agents to other agents—delegation, collaboration, multi-agent workflows. Many systems use both: MCP for each agent's tool access, ACP for inter-agent communication."
      },
      {
        question: "How do capability tokens compare to OAuth?",
        answer: "Capability tokens are designed for decentralized verification—any agent can check a token's validity locally by verifying the signature. OAuth requires calling an authorization server. For distributed agent systems with many nodes, capability tokens reduce latency and eliminate central bottlenecks. They also support fine-grained permissions and delegation that map well to agent workflows."
      },
      {
        question: "Can I use ACP with agents built on different frameworks?",
        answer: "Yes, that's the core purpose. ACP defines a protocol, not an implementation. Whether your agent uses LangChain, CrewAI, AutoGen, or custom code, you can wrap it with ACP endpoints. The BeeAI framework provides this wrapping automatically, but you can also implement the REST endpoints directly."
      }
    ],

    applications: [
      {
        title: "Enterprise Research Pipeline",
        description: "A research coordinator agent discovers and delegates to specialist agents: a literature agent searches papers, a data agent queries databases, an analysis agent processes results. Each specialist runs independently (possibly scale-to-zero), coordinated through ACP messages. Results flow back to the coordinator for synthesis."
      },
      {
        title: "Multi-Vendor Agent Marketplace",
        description: "Organizations consume agents from multiple vendors without lock-in. A travel company uses one vendor's flight agent, another's hotel agent, and builds custom agents internally—all communicating via ACP. Agents can be swapped without changing the orchestration code."
      },
      {
        title: "Automated Code Review Pipeline",
        description: "When a PR is opened, an orchestrator creates runs on multiple ACP agents: a security scanner, a style checker, a test coverage analyzer, and a documentation validator. Agents run in parallel, each posting findings. The orchestrator aggregates results into a unified review."
      },
      {
        title: "Customer Service Escalation",
        description: "Front-line support agents handle routine queries. When they encounter complex issues, they delegate via ACP to specialist agents (billing, technical, account management). Sessions maintain conversation context across handoffs, so customers don't repeat themselves."
      },
      {
        title: "Federated AI Research Network",
        description: "Research institutions expose specialized agents (data analysis, simulation, visualization) via ACP. Researchers at other institutions discover and use these agents without direct integration. Capability tokens control access levels—public agents for basic queries, restricted agents for sensitive data."
      }
    ],

    keyTakeaways: [
      "ACP uses REST over HTTP—test with curl/Postman, no specialized libraries required",
      "Agent manifests enable offline discovery, critical for scale-to-zero deployments",
      "Sessions maintain state across interactions for complex multi-turn workflows",
      "Capability tokens provide decentralized, verifiable security without central authority",
      "ACP complements MCP: MCP = agent-to-tools (vertical), ACP = agent-to-agent (horizontal)",
      "ACP merged with A2A in September 2025—principles remain relevant in the unified standard",
      "BeeAI is the primary implementation, with Python and TypeScript SDKs available"
    ],

    resources: [
      {
        title: "ACP GitHub Repository",
        url: "https://github.com/i-am-bee/acp",
        type: "github",
        description: "Official ACP specification, OpenAPI schema, and reference implementation",
        summaryPath: "data/day-22/summary-acp-github.md"
      },
      {
        title: "What is Agent Communication Protocol? - IBM",
        url: "https://www.ibm.com/think/topics/agent-communication-protocol",
        type: "article",
        description: "IBM's comprehensive overview of ACP concepts, architecture, and enterprise use cases",
        summaryPath: "data/day-22/summary-acp-ibm.md"
      },
      {
        title: "ACP Technical Deep Dive - IBM Research",
        url: "https://research.ibm.com/blog/agent-communication-protocol-ai",
        type: "article",
        description: "Technical blog post on ACP's design decisions, REST-first philosophy, and implementation patterns",
        summaryPath: "data/day-22/summary-acp-research.md"
      },
      {
        title: "ACP Technical Overview - WorkOS",
        url: "https://workos.com/blog/ibm-agent-communication-protocol-acp",
        type: "article",
        description: "Third-party technical analysis with code examples and architectural patterns",
        summaryPath: "data/day-22/summary-acp-workos.md"
      },
      {
        title: "BeeAI Platform - IBM Research",
        url: "https://research.ibm.com/blog/multiagent-bee-ai",
        type: "article",
        description: "Introduction to the BeeAI multi-agent platform built on ACP",
        summaryPath: "data/day-22/summary-beeai.md"
      },
      {
        title: "ACP Python SDK",
        url: "https://github.com/i-am-bee/acp/tree/main/python",
        type: "github",
        description: "Official Python SDK for building ACP clients and servers"
      },
      {
        title: "ACP TypeScript SDK",
        url: "https://github.com/i-am-bee/acp/tree/main/typescript",
        type: "github",
        description: "Official TypeScript SDK for ACP implementations"
      },
      {
        title: "ACP + A2A Merger Announcement",
        url: "https://lfaidata.foundation/communityblog/2025/08/29/acp-joins-forces-with-a2a-under-the-linux-foundations-lf-ai-data/",
        type: "article",
        description: "Linux Foundation announcement on ACP and A2A unification"
      }
    ],

    relatedDays: [19, 20, 21]
  }
};
