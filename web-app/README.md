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
**Partner:** DeepLearning.AI

The foundational mental model for agentic AI. Introduces the **OBSERVE → THINK → ACT → REFLECT** loop that powers all autonomous agents. Unlike traditional chatbots that respond once, agents iterate in loops—gathering information, reasoning about actions, executing them, and evaluating results until the task is complete.

**Key concepts:** Agent loops, tool use, self-reflection, iteration limits

---

#### Day 2: Structured Outputs & Function Calling
**Partner:** OpenAI / DeepLearning.AI

The mechanism that enables agents to ACT. Structured outputs guarantee valid JSON from LLMs, eliminating parsing failures. Function calling lets models express intent to use tools while your code controls execution. This separation is critical for safe, auditable AI systems.

**Key concepts:** JSON Schema, tool definitions, parallel tool calls, Pydantic integration

---

#### Day 3: Building an Agent from Scratch
**Partner:** DeepLearning.AI

Implementing a basic agent loop with tool calling—without any frameworks. Understanding the raw mechanics of how agents work: the message flow, tool execution loop, and state management. This foundation makes framework usage more intuitive.

**Key concepts:** Message history, tool call loop, state management, error handling

---

#### Day 4: The ReAct Pattern - Reasoning + Acting
**Partner:** DeepLearning.AI

The foundational paper that defined modern agentic AI. ReAct interleaves **reasoning traces** (thoughts) with **actions** (tool calls), creating explainable agents. Thoughts help the model plan, track progress, and handle exceptions without affecting the environment.

**Key concepts:** Thought-action-observation loop, chain-of-thought, grounded reasoning

---

#### Day 5: Reflection & Self-Improvement Patterns
**Partner:** IBM / Coursera

Agents that critique and improve their own outputs. The REFLECT phase enables self-correction—agents evaluate their work, identify issues, and iterate. This pattern is essential for tasks requiring quality assurance, like code generation and writing.

**Key concepts:** Self-critique, iterative refinement, quality thresholds, Reflexion pattern

---

### Phase 2: Agent Frameworks

#### Day 6: LangChain - Functions, Tools & Agents
**Partner:** LangChain

The most popular framework for building LLM applications. LangChain provides abstractions for tools, chains, and agents that work across 15+ providers. Learn to build composable pipelines with tool-augmented LLMs.

**Key concepts:** Tool definitions, chains, agent executors, provider abstraction

---

#### Day 7: LangGraph - Stateful Agent Workflows
**Partner:** LangChain

Graph-based agent orchestration built on LangChain. LangGraph enables complex workflows with conditional branching, cycles, and state persistence. Ideal for agents that need to make decisions based on intermediate results.

**Key concepts:** State graphs, conditional edges, cycles, checkpointing

---

#### Day 8: LangGraph - Memory & Checkpoints
**Partner:** LangChain

Persisting agent state across sessions. Checkpointing enables long-running agents, human-in-the-loop workflows, and crash recovery. Learn to save and restore agent state for durable execution.

**Key concepts:** Checkpointers, thread state, time-travel debugging, human approval

---

#### Day 9: CrewAI - Multi-Agent Systems
**Partner:** CrewAI

Role-based agent teams that collaborate on complex tasks. CrewAI lets you define agents with specific roles, goals, and backstories that work together. Think: a research team with a Researcher, Analyst, and Writer.

**Key concepts:** Agent roles, task delegation, crew orchestration, collaboration patterns

---

#### Day 10: CrewAI - Advanced (Tasks, Tools, Flows)
**Partner:** CrewAI

Orchestrating multi-step workflows with task dependencies. Advanced CrewAI features: custom tools, task callbacks, flow control, and hierarchical crews. Build production-ready multi-agent systems.

**Key concepts:** Task dependencies, flows, hierarchical delegation, custom tools

---

#### Day 11: AutoGen/AG2 - Conversational Multi-Agent
**Partner:** Microsoft / AG2

Agents that converse with each other to solve problems. AutoGen enables multi-agent conversations where agents can debate, critique, and build on each other's work. Supports code execution and human participation.

**Key concepts:** Conversable agents, group chat, code execution, nested chats

---

#### Day 12: OpenAI Agents SDK
**Partner:** OpenAI

OpenAI's native SDK for building production-ready agents. The Agents SDK (evolved from Swarm) provides handoffs, guardrails, and tracing out of the box. Best choice for OpenAI-native applications.

**Key concepts:** Agent handoffs, tool schemas, guardrails, tracing

---

#### Day 13: PydanticAI - Type-Safe Agents
**Partner:** Pydantic

Type-safe agent development with Pydantic validation. PydanticAI brings the reliability of Pydantic to agent systems—validated inputs, typed outputs, and IDE autocomplete throughout the agent lifecycle.

**Key concepts:** Type safety, validation, dependency injection, structured responses

---

### Phase 3: Memory & Knowledge

#### Day 14: Vector Databases for Agents
**Partner:** Weaviate

Semantic search with embeddings for agent knowledge retrieval. Vector databases enable agents to find relevant information based on meaning, not just keywords. Essential for RAG systems and knowledge-augmented agents.

**Key concepts:** Embeddings, similarity search, indexing strategies, hybrid search

---

#### Day 15: Building Agentic RAG Systems
**Partner:** LlamaIndex

Agents that decide when and how to retrieve information. Agentic RAG goes beyond basic retrieval—agents choose which tools to use, formulate queries, and synthesize information from multiple sources.

**Key concepts:** Query planning, tool selection, multi-document synthesis, routing

---

#### Day 16: Long-Term Agent Memory
**Partner:** LangChain

Persistent memory systems for agents across conversations. Move beyond session-limited context to agents that remember user preferences, past interactions, and learned information over time.

**Key concepts:** Memory types, summarization, entity extraction, memory retrieval

---

#### Day 17: Knowledge Graphs for Agents
**Partner:** Neo4j

Graph-based knowledge representation for complex reasoning. Knowledge graphs capture relationships that vector search misses. Learn to build and query graphs for multi-hop reasoning.

**Key concepts:** Graph schemas, Cypher queries, GraphRAG, relationship reasoning

---

#### Day 18: Semantic Caching for Agents
**Partner:** Redis

Caching similar queries to reduce latency and costs. Semantic caching recognizes when a new query is similar enough to a cached one, avoiding redundant LLM calls. Critical for production cost control.

**Key concepts:** Similarity thresholds, cache invalidation, cost optimization

---

### Phase 4: Protocols & Interoperability

#### Day 19: MCP - Model Context Protocol Fundamentals
**Partner:** Anthropic

Standardized protocol for connecting AI to external tools. MCP provides a universal interface for tools and resources, enabling agents to work with any MCP-compatible service without custom integration code.

**Key concepts:** MCP architecture, tools vs resources, protocol messages

---

#### Day 20: MCP - Building Servers & Clients
**Partner:** Anthropic / Hugging Face

Creating custom MCP servers to expose tools and resources. Build your own MCP servers to make any API, database, or service available to MCP-compatible AI systems.

**Key concepts:** Server implementation, tool schemas, resource handlers, authentication

---

#### Day 21: A2A - Agent-to-Agent Protocol
**Partner:** Google Cloud

Standardized communication between autonomous agents. A2A enables agents from different vendors to discover capabilities, negotiate tasks, and collaborate without custom integration.

**Key concepts:** Agent discovery, capability negotiation, task delegation, trust

---

#### Day 22: ACP - Agent Communication Protocol
**Partner:** IBM / BeeAI

IBM's protocol for agent interoperability and discovery. ACP focuses on enterprise use cases with strong typing, versioning, and governance features for multi-agent systems.

**Key concepts:** Agent manifests, protocol versioning, enterprise governance

---

### Phase 5: Vertical Applications

#### Day 23: Browser Automation Agents
**Partner:** AGI Inc / Playwright

Agents that navigate and interact with web pages autonomously. Browser agents can fill forms, click buttons, extract data, and complete multi-step web workflows. Uses computer vision and DOM understanding.

**Key concepts:** Page actions, element selection, visual grounding, workflow automation

---

#### Day 24: Coding Agents & Sandboxed Execution
**Partner:** E2B / Hugging Face

Agents that write, test, and execute code safely. Coding agents can solve programming tasks end-to-end, but need sandboxed environments to run untrusted code securely.

**Key concepts:** Code generation, sandbox environments, test execution, iteration

---

#### Day 25: Document AI - Agentic Extraction
**Partner:** LandingAI

Intelligent document processing with agentic reasoning. Document AI agents can understand complex layouts, extract structured data from unstructured documents, and handle edge cases through reasoning.

**Key concepts:** OCR, layout understanding, schema extraction, validation

---

#### Day 26: Voice Agents for Real-Time Apps
**Partner:** LiveKit

Real-time voice interaction with AI agents. Voice agents require low-latency processing, interruption handling, and natural conversation flow. Learn the architecture for production voice systems.

**Key concepts:** Speech-to-text, text-to-speech, latency optimization, turn-taking

---

#### Day 27: Data Agents & SQL Generation
**Partner:** Snowflake

Natural language to SQL with agentic query planning. Data agents translate business questions into SQL, validate results, and iterate when queries fail. Essential for self-service analytics.

**Key concepts:** Text-to-SQL, schema understanding, query validation, result interpretation

---

### Phase 6: Production & Ops

#### Day 28: Agent Observability (LangSmith & Phoenix)
**Partner:** LangChain / Arize

Tracing and debugging agent execution in production. Observability tools capture every step of agent execution, enabling debugging, cost tracking, and performance optimization.

**Key concepts:** Tracing, spans, cost attribution, latency analysis, error tracking

---

#### Day 29: Evaluating & Testing Agents
**Partner:** Arize / DeepLearning.AI

Measuring agent performance with automated evaluation. Agent evaluation is harder than model evaluation—you need to test multi-step workflows, tool usage, and goal completion, not just individual outputs.

**Key concepts:** Evaluation frameworks, test datasets, metrics, regression testing

---

#### Day 30: Guardrails, Safety & Deployment
**Partner:** Nvidia NeMo

Safety constraints and production deployment patterns. Guardrails prevent harmful outputs, validate inputs, and ensure agents stay within bounds. Learn deployment patterns for reliable production systems.

**Key concepts:** Input/output guardrails, content filtering, rate limiting, monitoring

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
│   ├── data.ts         # 30-day curriculum data
│   └── types.ts        # TypeScript interfaces
├── demos/
│   ├── day-1/          # Day 1 interactive demo
│   ├── day-2/          # Day 2 interactive demo
│   ├── day-3/          # Day 3 interactive demo
│   ├── day-4/          # Day 4 interactive demo
│   ├── day-5/          # Day 5 interactive demo
│   └── day-6/          # Day 6 interactive demo
├── data/
│   ├── day-1/          # Day 1 resource summaries
│   ├── day-2/          # Day 2 resource summaries
│   ├── day-3/          # Day 3 resource summaries
│   ├── day-4/          # Day 4 resource summaries
│   ├── day-5/          # Day 5 resource summaries
│   └── day-6/          # Day 6 resource summaries
├── dist/
│   └── app.js          # Bundled output
├── styles.css          # Application styles
└── index.html          # Entry point
```

## Scripts

- `npm run build` - Bundle TypeScript to dist/app.js
- `npm run dev` - Watch mode for development

## Demos

Each day can have an interactive demo accessible from the Demos page. Demos are self-contained HTML/CSS/JS that illustrate key concepts with simulated responses.

### Available Demos

| Day | Demo | Description |
|-----|------|-------------|
| 1 | Agentic AI Patterns | Visualizes the OBSERVE → THINK → ACT → REFLECT loop |
| 2 | Structured Outputs | Extract data, function calling flow, schema playground |
| 3 | Agent from Scratch | Step through a framework-free agent with tool registry |
| 4 | ReAct Pattern | Visualize Thought → Action → Observation traces |
| 5 | Reflection Patterns | Self-Refine, Reflexion, and Constitutional AI demos |
| 6 | LangChain Tools & Agents | Tool builder, agent simulator, and tool-calling flow |

### Creating a New Demo

1. Create `demos/day-N/` directory
2. Add `index.html`, `styles.css`, and `demo.js`
3. Add `demoUrl: "demos/day-N/"` to the day's entry in `src/data.ts`
4. Rebuild with `npm run build`

## License

MIT
