# 30 Days of Agentic AI

A web-based learning platform for mastering agentic AI concepts over 30 days. Built with TypeScript, featuring interactive demos, progress tracking, and a personal learning journal.

## Features

- **30-Day Curriculum** - Structured learning path across 6 phases
- **Interactive Demos** - Hands-on playgrounds to explore concepts
- **Progress Tracking** - Track completion, streaks, and achievements
- **Learning Journal** - Personal notes and reflections for each day
- **Blog/Log** - Document your learning journey

## Curriculum Overview

### Phase 1: Foundations (Days 1-5)
Building the core mental models for understanding agentic AI systems.

### Phase 2: Agent Frameworks (Days 6-13)
Hands-on experience with the major frameworks for building AI agents.

### Phase 3: Memory & Knowledge (Days 14-18)
Giving agents persistent memory and access to external knowledge.

### Phase 4: Protocols & Interoperability (Days 19-22)
Standards for connecting agents to tools and to each other.

### Phase 5: Vertical Applications (Days 23-27)
Domain-specific agent implementations for real-world use cases.

### Phase 6: Production & Ops (Days 28-30)
Taking agents from prototype to production with proper tooling.

---

## Day-by-Day Curriculum

### Phase 1: Foundations

#### Day 1: Agentic AI - Core Concepts & Design Patterns
**Partner:** DeepLearning.AI | **Difficulty:** Beginner

The foundational mental model for agentic AI. Introduces the **OBSERVE → THINK → ACT → REFLECT** loop that powers all autonomous agents. Unlike traditional chatbots that respond once, agents iterate in loops—gathering information, reasoning about actions, executing them, and evaluating results until the task is complete.

**Core Principles:**
- **Agents are loops, not chains** — They iterate until goals are met, with self-correction
- **The OTAR Framework** — Observe (perceive), Think (reason), Act (execute), Reflect (evaluate)
- **Context is everything** — Agents must build understanding across iterations
- **Self-reflection enables learning** — Evaluate outcomes to improve strategy

**Key concepts:** Agent loops, tool use, self-reflection, iteration limits, grounded reasoning

**What you'll build:** Implement a complete agent loop with async tool execution

---

#### Day 2: Structured Outputs & Function Calling
**Partner:** OpenAI / DeepLearning.AI | **Difficulty:** Beginner

The mechanism that enables agents to ACT. Structured outputs guarantee valid JSON from LLMs, eliminating parsing failures. Function calling lets models express intent to use tools while your code controls execution. This separation is critical for safe, auditable AI systems.

**Core Principles:**
- **Structured outputs guarantee validity** — Constrained decoding ensures 100% valid JSON
- **Function calling separates intent from execution** — Model requests, you control execution
- **Schemas are documentation** — Type hints and descriptions guide LLM behavior
- **Parallel tool calls** — Models can request multiple actions simultaneously

**Key concepts:** JSON Schema, tool definitions, parallel tool calls, Pydantic integration, provider differences (OpenAI vs Anthropic)

**What you'll build:** Data extraction pipeline, function calling flow, schema playground

---

#### Day 3: Building an Agent from Scratch
**Partner:** DeepLearning.AI | **Difficulty:** Intermediate

Implementing a basic agent loop with tool calling—without any frameworks. Understanding the raw mechanics of how agents work: the message flow, tool execution loop, and state management. This foundation makes framework usage more intuitive.

**Core Principles:**
- **Agent class anatomy** — System prompt, model config, tools registry, message history
- **Tool registry pattern** — Dict mapping tool names to callables with schemas
- **ReAct-style prompting** — Instruct the model to reason before acting
- **Parsing robustness** — Handle malformed outputs gracefully

**Key concepts:** Message history, tool call loop, state management, error handling, stop conditions (iteration limits, token budgets, loop detection)

**What you'll build:** ~150 lines of Python implementing a production-ready agent with error recovery

---

#### Day 4: The ReAct Pattern - Reasoning + Acting
**Partner:** DeepLearning.AI | **Difficulty:** Intermediate

The foundational paper that defined modern agentic AI. ReAct interleaves **reasoning traces** (thoughts) with **actions** (tool calls), creating explainable agents. Thoughts help the model plan, track progress, and handle exceptions without affecting the environment.

**Core Principles:**
- **Thought-Action-Observation loop** — Explicit reasoning before every action
- **Grounded reasoning** — Thoughts incorporate real-world feedback, not just imagination
- **Transparency** — Every decision is logged and auditable
- **Error recovery** — Failed actions lead to revised plans via reflection

**Key concepts:** Chain-of-thought, grounded reasoning, trace parsing, multi-step reasoning

**What you'll build:** ReAct implementation with thought parsing and observation handling

---

#### Day 5: Reflection & Self-Improvement Patterns
**Partner:** IBM / Coursera | **Difficulty:** Intermediate

Agents that critique and improve their own outputs. The REFLECT phase enables self-correction—agents evaluate their work, identify issues, and iterate. This pattern is essential for tasks requiring quality assurance, like code generation and writing.

**Three Landmark Approaches:**
- **Self-Refine** — Iterative refinement using the same model as generator and critic
- **Reflexion** — Episodic memory of failures drives future improvement
- **Constitutional AI** — Principle-based critique for value alignment

**Critical Insight:** Self-correction without external grounding often fails. LLMs will confidently "improve" correct answers into wrong ones. True self-correction requires:
- Test execution (code)
- JSON schema validation
- External fact-checking
- Human feedback

**Key concepts:** Self-critique, iterative refinement, quality thresholds, recognition-generation gap

**What you'll build:** Grounded critic with tool-based validation

---

### Phase 2: Agent Frameworks

#### Day 6: LangChain - Functions, Tools & Agents
**Partner:** LangChain | **Difficulty:** Beginner

The most popular framework for building LLM applications. LangChain provides abstractions for tools, chains, and agents that work across 15+ providers. Learn to build composable pipelines with tool-augmented LLMs.

**Core Principles:**
- **Tools as the agent interface to the world** — Typed functions with descriptions
- **The @tool decorator** — Converts Python functions to LangChain tools
- **bind_tools() abstraction** — Attach tools to any compatible model
- **AgentExecutor loop** — Handles tool calling, error retry, and iteration

**Key concepts:** Tool definitions, chains, agent executors, provider abstraction, tool_choice parameter

**What you'll build:** Custom tools, agent with multiple tools, tool calling flow visualization

---

#### Day 7: LangGraph - Stateful Agent Workflows
**Partner:** LangChain | **Difficulty:** Intermediate

Graph-based agent orchestration built on LangChain. LangGraph enables complex workflows with conditional branching, cycles, and state persistence. Ideal for agents that need to make decisions based on intermediate results.

**Core Principles:**
- **Graphs give explicit control** — Every state transition is visible and testable
- **StateGraph as blueprint** — Define states and transitions before execution
- **State with reducers** — Combine messages/values across iterations
- **Conditional edges** — Route based on classification or tool output

**Key Patterns:**
- **Tool-calling loop** — Agent → Tools → Agent cycle until done
- **Human-in-the-loop** — Interrupt for approval, modify state, resume
- **Error recovery** — Catch exceptions, modify state, retry

**Key concepts:** State graphs, conditional edges, cycles, checkpointing, add_messages reducer

**What you'll build:** Multi-step workflow with routing, human approval gates, error recovery

---

#### Day 8: LangGraph - Memory & Checkpoints
**Partner:** LangChain | **Difficulty:** Intermediate

Persisting agent state across sessions. Checkpointing enables long-running agents, human-in-the-loop workflows, and crash recovery. Learn to save and restore agent state for durable execution.

**Core Principles:**
- **Checkpointing for persistence** — Snapshot state after every node
- **Thread isolation** — Each conversation has its own state history
- **Time-travel debugging** — Replay from any checkpoint
- **External state updates** — Inject information while agent waits

**Checkpointer Options:**
- `MemorySaver` — Development, single-process
- `SqliteSaver` — Lightweight persistence
- `PostgresSaver` — Production multi-instance

**Key concepts:** Checkpointers, thread state, time-travel debugging, human approval, session management

**What you'll build:** Persistent agent with conversation history, crash recovery, multi-user support

---

#### Day 9: CrewAI - Multi-Agent Systems
**Partner:** CrewAI | **Difficulty:** Intermediate

Role-based agent teams that collaborate on complex tasks. CrewAI lets you define agents with specific roles, goals, and backstories that work together. Think: a research team with a Researcher, Analyst, and Writer.

**Core Principles:**
- **Agents have roles, goals, backstories** — Personality shapes behavior
- **Tasks flow via context** — Output from one task feeds the next
- **Sequential process** — Linear pipeline for predictable workflows
- **Delegation patterns** — Agents can hand off to specialists

**When Multi-Agent Makes Sense:**
- Task requires genuinely different capabilities
- Specialization improves quality
- You need explicit handoffs and audit trails

**Key concepts:** Agent roles, task delegation, crew orchestration, collaboration patterns

**What you'll build:** Research crew with Researcher → Analyst → Writer pipeline

---

#### Day 10: CrewAI - Advanced (Tasks, Tools, Flows)
**Partner:** CrewAI | **Difficulty:** Advanced

Orchestrating multi-step workflows with task dependencies. Advanced CrewAI features: custom tools, task callbacks, flow control, and hierarchical crews. Build production-ready multi-agent systems.

**Advanced Capabilities:**
- **Task callbacks** — Monitor progress, log intermediate results
- **human_input** — Require approval at specific steps
- **Async execution** — Run tasks in parallel where possible
- **Flows** — Event-driven orchestration with @start/@listen/@router

**Key concepts:** Task dependencies, flows, hierarchical delegation, custom tools, validation

**What you'll build:** Flow with conditional routing, custom tools with API integration

---

#### Day 11: AutoGen/AG2 - Conversational Multi-Agent
**Partner:** Microsoft / AG2 | **Difficulty:** Intermediate

Agents that converse with each other to solve problems. AutoGen enables multi-agent conversations where agents can debate, critique, and build on each other's work. Supports code execution and human participation.

**Core Principles:**
- **Conversations are the unit of work** — Agents exchange messages until done
- **ConversableAgent foundation** — Base class for all agents
- **Code execution enables verification** — Run code, observe results, iterate
- **human_input_mode** — ALWAYS (full oversight), TERMINATE (end only), NEVER (autonomous)

**Agent Types:**
- `ConversableAgent` — Base class with send/receive
- `AssistantAgent` — LLM-powered, generates code and responses
- `UserProxyAgent` — Executes code, manages human interaction
- `GroupChatManager` — Coordinates multi-agent discussions

**Key concepts:** Conversable agents, group chat, Docker code execution, nested chats

**What you'll build:** Two-agent code generation, GroupChat with coder/reviewer/tester

---

#### Day 12: OpenAI Agents SDK
**Partner:** OpenAI | **Difficulty:** Intermediate

OpenAI's native SDK for building production-ready agents. The Agents SDK (evolved from Swarm) provides handoffs, guardrails, and tracing out of the box. Best choice for OpenAI-native applications with minimal abstractions.

**Four Core Primitives:**
- **Agents** — LLMs with instructions and tools
- **Tools** — Plain Python functions with auto-generated schemas
- **Handoffs** — Transfer conversations between specialist agents
- **Guardrails** — Validate inputs (block injection) and outputs (filter PII)

**Key Differentiators:**
- Runs on YOUR infrastructure (not hosted like Assistants API)
- Built-in OpenTelemetry tracing
- Works with 100+ LLMs via Chat Completions API
- Minimal abstractions — learn 4 concepts and you know the framework

**Key concepts:** Agent handoffs, tool schemas, guardrails, tracing, sessions

**What you'll build:** Customer service routing with triage and specialists, guardrailed agent

---

#### Day 13: PydanticAI - Type-Safe Agents
**Partner:** Pydantic | **Difficulty:** Intermediate

Type-safe agent development with Pydantic validation. PydanticAI brings the reliability of Pydantic to agent systems—validated inputs, typed outputs, and IDE autocomplete throughout the agent lifecycle.

**Key concepts:** Type safety, validation, dependency injection, structured responses

---

### Framework Comparison

| Framework | Best For | Paradigm | Code Execution | Multi-Agent |
|-----------|----------|----------|----------------|-------------|
| **LangChain** | Quick prototypes, provider flexibility | Chains & tools | Via tools | Limited |
| **LangGraph** | Complex stateful workflows | Graph-based | Via tools | Yes (nodes) |
| **CrewAI** | Role-based teams, task pipelines | Role/Task/Crew | Via tools | Primary focus |
| **AutoGen** | Conversational problem-solving | Message exchange | Docker sandbox | Primary focus |
| **Agents SDK** | OpenAI-native, minimal abstractions | Agents + Handoffs | Via tools | Via handoffs |
| **PydanticAI** | Type safety, validation | Typed agents | Via tools | Limited |

---

### Phase 3: Memory & Knowledge

#### Day 14: Vector Databases for Agents
**Partner:** Weaviate | **Difficulty:** Intermediate

Semantic search with embeddings for agent knowledge retrieval. Vector databases enable agents to find relevant information based on meaning, not just keywords. Essential for RAG systems and knowledge-augmented agents.

**Key concepts:** Embeddings, similarity search, indexing strategies, hybrid search

---

#### Day 15: Building Agentic RAG Systems
**Partner:** LlamaIndex | **Difficulty:** Intermediate

Agents that decide when and how to retrieve information. Agentic RAG goes beyond basic retrieval—agents choose which tools to use, formulate queries, and synthesize information from multiple sources.

**Key concepts:** Query planning, tool selection, multi-document synthesis, routing

---

#### Day 16: Long-Term Agent Memory
**Partner:** LangChain | **Difficulty:** Intermediate

Persistent memory systems for agents across conversations. Move beyond session-limited context to agents that remember user preferences, past interactions, and learned information over time.

**Key concepts:** Memory types, summarization, entity extraction, memory retrieval

---

#### Day 17: Knowledge Graphs for Agents
**Partner:** Neo4j | **Difficulty:** Advanced

Graph-based knowledge representation for complex reasoning. Knowledge graphs capture relationships that vector search misses. Learn to build and query graphs for multi-hop reasoning.

**Key concepts:** Graph schemas, Cypher queries, GraphRAG, relationship reasoning

---

#### Day 18: Semantic Caching for Agents
**Partner:** Redis | **Difficulty:** Intermediate

Caching similar queries to reduce latency and costs. Semantic caching recognizes when a new query is similar enough to a cached one, avoiding redundant LLM calls. Critical for production cost control.

**Key concepts:** Similarity thresholds, cache invalidation, cost optimization

---

### Phase 4: Protocols & Interoperability

#### Day 19: MCP - Model Context Protocol Fundamentals
**Partner:** Anthropic | **Difficulty:** Intermediate

Standardized protocol for connecting AI to external tools. MCP provides a universal interface for tools and resources, enabling agents to work with any MCP-compatible service without custom integration code.

**Key concepts:** MCP architecture, tools vs resources, protocol messages

---

#### Day 20: MCP - Building Servers & Clients
**Partner:** Anthropic / Hugging Face | **Difficulty:** Advanced

Creating custom MCP servers to expose tools and resources. Build your own MCP servers to make any API, database, or service available to MCP-compatible AI systems.

**Key concepts:** Server implementation, tool schemas, resource handlers, authentication

---

#### Day 21: A2A - Agent-to-Agent Protocol
**Partner:** Google Cloud | **Difficulty:** Advanced

Standardized communication between autonomous agents. A2A enables agents from different vendors to discover capabilities, negotiate tasks, and collaborate without custom integration.

**Key concepts:** Agent discovery, capability negotiation, task delegation, trust

---

#### Day 22: ACP - Agent Communication Protocol
**Partner:** IBM / BeeAI | **Difficulty:** Advanced

IBM's protocol for agent interoperability and discovery. ACP focuses on enterprise use cases with strong typing, versioning, and governance features for multi-agent systems.

**Key concepts:** Agent manifests, protocol versioning, enterprise governance

---

### Phase 5: Vertical Applications

#### Day 23: Browser Automation Agents
**Partner:** AGI Inc / Playwright | **Difficulty:** Intermediate

Agents that navigate and interact with web pages autonomously. Browser agents can fill forms, click buttons, extract data, and complete multi-step web workflows. Uses computer vision and DOM understanding.

**Key concepts:** Page actions, element selection, visual grounding, workflow automation

---

#### Day 24: Coding Agents & Sandboxed Execution
**Partner:** E2B / Hugging Face | **Difficulty:** Intermediate

Agents that write, test, and execute code safely. Coding agents can solve programming tasks end-to-end, but need sandboxed environments to run untrusted code securely.

**Key concepts:** Code generation, sandbox environments, test execution, iteration

---

#### Day 25: Document AI - Agentic Extraction
**Partner:** LandingAI | **Difficulty:** Intermediate

Intelligent document processing with agentic reasoning. Document AI agents can understand complex layouts, extract structured data from unstructured documents, and handle edge cases through reasoning.

**Key concepts:** OCR, layout understanding, schema extraction, validation

---

#### Day 26: Voice Agents for Real-Time Apps
**Partner:** LiveKit | **Difficulty:** Advanced

Real-time voice interaction with AI agents. Voice agents require low-latency processing, interruption handling, and natural conversation flow. Learn the architecture for production voice systems.

**Key concepts:** Speech-to-text, text-to-speech, latency optimization, turn-taking

---

#### Day 27: Data Agents & SQL Generation
**Partner:** Snowflake | **Difficulty:** Intermediate

Natural language to SQL with agentic query planning. Data agents translate business questions into SQL, validate results, and iterate when queries fail. Essential for self-service analytics.

**Key concepts:** Text-to-SQL, schema understanding, query validation, result interpretation

---

### Phase 6: Production & Ops

#### Day 28: Agent Observability (LangSmith & Phoenix)
**Partner:** LangChain / Arize | **Difficulty:** Intermediate

Tracing and debugging agent execution in production. Observability tools capture every step of agent execution, enabling debugging, cost tracking, and performance optimization.

**Key concepts:** Tracing, spans, cost attribution, latency analysis, error tracking

---

#### Day 29: Evaluating & Testing Agents
**Partner:** Arize / DeepLearning.AI | **Difficulty:** Advanced

Measuring agent performance with automated evaluation. Agent evaluation is harder than model evaluation—you need to test multi-step workflows, tool usage, and goal completion, not just individual outputs.

**Key concepts:** Evaluation frameworks, test datasets, metrics, regression testing

---

#### Day 30: Guardrails, Safety & Deployment
**Partner:** Nvidia NeMo | **Difficulty:** Advanced

Safety constraints and production deployment patterns. Guardrails prevent harmful outputs, validate inputs, and ensure agents stay within bounds. Learn deployment patterns for reliable production systems.

**Key concepts:** Input/output guardrails, content filtering, rate limiting, monitoring

---

## Learning Paths

### Quick Start (Days 1-3)
Build a working agent in 3 days: mental model → tool calling → scratch implementation.

### Framework Explorer (Days 6-12)
Compare all major frameworks: LangChain → LangGraph → CrewAI → AutoGen → Agents SDK.

### Production Ready (Days 7-8, 28-30)
Focus on state management, observability, testing, and deployment.

### Multi-Agent Specialist (Days 9-12)
Deep dive into multi-agent patterns: CrewAI roles, AutoGen conversations, SDK handoffs.

---

## Tech Stack

- **TypeScript** - Type-safe application logic
- **esbuild** - Fast bundling
- **LocalStorage** - Persistent progress data
- **No framework** - Vanilla JS for simplicity

## Getting Started

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start development server (watches for changes)
npm run dev
```

Open `index.html` in your browser or use a local server.

## Project Structure

```
web-app/
├── src/
│   ├── app.ts          # Main application logic
│   ├── data.ts         # Data utilities
│   ├── types.ts        # TypeScript interfaces
│   └── data/
│       ├── phases.ts   # Phase definitions
│       └── days/       # Day 1-30 content
├── demos/              # Interactive demos
│   ├── day-1/          # OBSERVE → THINK → ACT → REFLECT
│   ├── day-2/          # Structured outputs & function calling
│   ├── day-3/          # Agent from scratch
│   ├── day-4/          # ReAct pattern
│   ├── day-5/          # Reflection patterns
│   ├── day-6/          # LangChain tools & agents
│   ├── day-7/          # LangGraph stateful workflows
│   ├── day-8/          # LangGraph memory & checkpoints
│   ├── day-9/          # CrewAI multi-agent
│   ├── day-10/         # CrewAI advanced
│   ├── day-11/         # AutoGen conversational agents
│   └── day-12/         # OpenAI Agents SDK
├── data/               # Resource summaries
├── dist/               # Bundled output
├── styles.css          # Application styles
└── index.html          # Entry point
```

## Scripts

- `npm run build` - Bundle TypeScript to dist/app.js
- `npm run dev` - Watch mode for development
- `npm run typecheck` - Type check without emitting

## Interactive Demos

Each day has an interactive demo accessible from the Demos page. Demos are self-contained HTML/CSS/JS that illustrate key concepts with simulated responses.

| Day | Demo | Description |
|-----|------|-------------|
| 1 | Agentic AI Patterns | Visualize the OBSERVE → THINK → ACT → REFLECT loop |
| 2 | Structured Outputs | Data extraction, function calling flow, schema playground |
| 3 | Agent from Scratch | Step through a framework-free agent with tool registry |
| 4 | ReAct Pattern | Thought → Action → Observation traces with parsing |
| 5 | Reflection Patterns | Self-Refine, Reflexion, Constitutional AI demos |
| 6 | LangChain Tools | Tool builder, agent simulator, tool-calling flow |
| 7 | LangGraph Workflows | State graphs, conditional routing, cycle visualization |
| 8 | LangGraph Memory | Checkpointing, thread management, state inspection |
| 9 | CrewAI Teams | Role configuration, task flow, crew execution |
| 10 | CrewAI Flows | Event-driven workflows, custom tools, routing |
| 11 | AutoGen Chat | Two-agent conversations, GroupChat, code execution |
| 12 | Agents SDK | Tools, handoffs, guardrails, code builder |

### Creating a New Demo

1. Create `demos/day-N/` directory
2. Add `index.html`, `styles.css`, and `demo.js`
3. Add `demoUrl: "demos/day-N/"` to the day's entry in `src/data/days/day-N.ts`
4. Rebuild with `npm run build`

## License

MIT
