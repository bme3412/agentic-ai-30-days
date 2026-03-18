import type { Day } from '../../types';

export const day16: Day = {
  day: 16,
  phase: 3,
  title: "Long-Term Agent Memory",
  partner: "LangChain",
  tags: ["memory", "persistence", "checkpoints", "langgraph", "conversation"],
  concept: "Persistent memory systems for agents across conversations",
  demoUrl: "demos/day-16/",
  demoDescription: "Explore memory patterns interactively: compare checkpointing backends, visualize conversation memory types, manage threads, and generate production-ready memory code.",

  lesson: {
    overview: `Agents are stateless by default. Each conversation starts fresh with no memory of prior interactions, previous decisions, or learned preferences. For simple one-off queries this is fine, but real-world agents need to remember context across sessions, maintain conversation history, and persist state through restarts.

The LangChain ecosystem provides two complementary approaches to agent memory. **LangGraph checkpointing** saves the complete state of an agent graph at every execution step, enabling pause/resume, human-in-the-loop workflows, and time-travel debugging. **Conversation memory** manages message history within and across sessions, with strategies ranging from full transcripts to intelligent summarization.

Understanding when to use each approach—and how to combine them—is essential for building production agents. Checkpointing handles the "what was the agent doing" problem, while conversation memory handles "what did we talk about." Together, they transform stateless LLM calls into persistent, context-aware agents.

**Why This Matters**: Users expect agents to remember them. A support agent should recall previous tickets. A coding assistant should remember project context. A personal assistant should learn preferences over time. Without persistent memory, every interaction starts from zero.`,

    principles: [
      {
        title: "State as First-Class Citizen",
        description: "LangGraph treats agent state as explicit, inspectable data. Every variable, message, and intermediate result is part of a typed state object that can be saved, loaded, modified, and branched."
      },
      {
        title: "Thread-Based Organization",
        description: "Conversations are organized by thread IDs. Same thread_id = same conversation context. This enables multi-user systems where each user maintains separate, isolated conversation histories."
      },
      {
        title: "Checkpoint Granularity",
        description: "Checkpointing happens at every graph step, not just at conversation boundaries. This enables powerful patterns: interrupt mid-execution for human approval, rewind to earlier states, or branch execution paths."
      },
      {
        title: "Memory vs Checkpointing",
        description: "Conversation memory manages message history (what was said). Checkpointing persists graph state (what the agent was doing). Both are needed: memory for context, checkpointing for workflow continuity."
      },
      {
        title: "Persistence Backends Scale",
        description: "MemorySaver for development (fast, no setup, lost on restart). SqliteSaver for single-instance production (file-based, persists). PostgresSaver for multi-instance production (scalable, shared state)."
      }
    ],

    codeExample: {
      language: "python",
      title: "LangGraph Checkpointing with MemorySaver and SqliteSaver",
      code: `from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph, MessagesState
from langchain_openai import ChatOpenAI

# Define a simple conversational agent
def agent_node(state: MessagesState):
    llm = ChatOpenAI(model="gpt-4o")
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

# Build the graph
builder = StateGraph(MessagesState)
builder.add_node("agent", agent_node)
builder.add_edge("__start__", "agent")
builder.add_edge("agent", "__end__")

# Development: In-memory checkpointing (lost on restart)
memory_saver = MemorySaver()
dev_graph = builder.compile(checkpointer=memory_saver)

# Production: SQLite persistence (survives restarts)
with SqliteSaver.from_conn_string("checkpoints.db") as sqlite_saver:
    prod_graph = builder.compile(checkpointer=sqlite_saver)

    # Thread ID identifies the conversation
    config = {"configurable": {"thread_id": "user-123-session-1"}}

    # First message
    result = prod_graph.invoke(
        {"messages": [("user", "My name is Alice and I work on ML projects.")]},
        config
    )
    print(result["messages"][-1].content)

    # Later (even after restart), same thread continues the conversation
    result = prod_graph.invoke(
        {"messages": [("user", "What do I work on?")]},
        config
    )
    print(result["messages"][-1].content)  # Remembers "ML projects"`
    },

    diagram: {
      type: "mermaid",
      title: "LangGraph Checkpointing Architecture",
      mermaid: `flowchart TB
    subgraph Agent["LangGraph Agent Execution"]
        N1["Node 1<br/>Process Input"] --> CP1["Checkpoint 1"]
        CP1 --> N2["Node 2<br/>Call LLM"]
        N2 --> CP2["Checkpoint 2"]
        CP2 --> N3["Node 3<br/>Execute Tools"]
        N3 --> CP3["Checkpoint 3"]
    end

    subgraph Checkpointer["Checkpointer Backend"]
        MS["MemorySaver<br/>Development Only<br/>Lost on restart"]
        SS["SqliteSaver<br/>Single Instance<br/>File: checkpoints.db"]
        PS["PostgresSaver<br/>Production<br/>Multi-instance"]
    end

    subgraph State["Persisted State"]
        TH["thread_id<br/>user-123-session-1"]
        MSG["messages<br/>Conversation history"]
        DATA["custom_state<br/>Agent-specific data"]
    end

    CP1 & CP2 & CP3 --> MS
    CP1 & CP2 & CP3 --> SS
    CP1 & CP2 & CP3 --> PS

    MS & SS & PS --> State`
    },

    keyTakeaways: [
      "LangGraph checkpointers save complete graph state at every step, enabling pause/resume and time travel",
      "MemorySaver is for development only—use SqliteSaver or PostgresSaver for persistence",
      "Thread IDs organize conversations—same thread_id means same conversation context",
      "Conversation memory classes manage message history with different strategies (buffer, summary, window)",
      "ConversationSummaryBufferMemory offers the best balance: recent messages verbatim, older ones summarized",
      "Combine checkpointing (workflow state) with memory (conversation context) for complete solutions"
    ],

    resources: [
      {
        title: "LangGraph Persistence Documentation",
        url: "https://langchain-ai.github.io/langgraph/concepts/persistence/",
        type: "docs",
        description: "Official LangGraph docs covering checkpointing concepts, thread IDs, and state inspection",
        summaryPath: "data/day-16/summary-langgraph-persistence.md"
      },
      {
        title: "LangChain Conversational Memory",
        url: "https://python.langchain.com/docs/modules/memory/",
        type: "docs",
        description: "Documentation for conversation memory classes including Buffer, Summary, and Window strategies",
        summaryPath: "data/day-16/summary-conversation-memory.md"
      },
      {
        title: "LangGraph PostgresSaver Guide",
        url: "https://langchain-ai.github.io/langgraph/reference/checkpoints/",
        type: "docs",
        description: "Reference for production checkpointers including PostgresSaver setup and connection pooling",
        summaryPath: "data/day-16/summary-postgres-checkpointer.md"
      },
      {
        title: "Memory Patterns for Agents",
        url: "https://blog.langchain.dev/memory-for-agents/",
        type: "article",
        description: "LangChain blog post on combining memory systems for production agents",
        summaryPath: "data/day-16/summary-memory-patterns.md"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Long-term memory transforms agents from stateless responders into systems that remember, learn, and maintain context across conversations and restarts.",
      fullDescription: `Without memory, every agent interaction starts from scratch. The agent doesn't know who you are, what you discussed before, or what it was in the middle of doing. This is fine for simple Q&A but fails for real applications where context matters.

Consider a customer support agent. Users expect it to remember their previous tickets, know their account status, and not ask the same questions twice. Or a coding assistant that should remember your project structure, preferred patterns, and ongoing tasks. Without memory, these agents are frustrating to use.

LangChain provides two complementary memory systems that solve different problems.

**LangGraph Checkpointing** is like hitting "save" on your entire computer, not just a document. It captures the complete state of an agent graph at every execution step—not just the conversation history, but everything: which tools the agent was using, what decisions it was in the middle of making, and any custom data it was tracking. This means you can stop an agent mid-task, restart your entire server, and pick up exactly where you left off. You can also interrupt execution to get human approval before the agent takes a sensitive action, then seamlessly continue. For debugging, you can "time travel" back to any previous state to understand what went wrong or try a different approach. And if your application crashes, you don't lose progress—the agent recovers from its last checkpoint.

**Conversation Memory** solves a different problem: managing what gets sent to the LLM. As conversations grow longer, you eventually hit the model's context window limit. Conversation memory provides strategies for handling this. The simplest approach keeps everything, which works until you run out of space. Summarization compresses old messages into a condensed form, saving tokens but losing specific details. A sliding window keeps only the most recent messages, which is predictable but forgets early context entirely. The most sophisticated approach combines summarization with a window—older messages get summarized while recent ones stay verbatim, giving you both efficiency and accuracy where it matters most.

This lesson covers both systems in depth, including when to use each, how to combine them, and production patterns for building agents with robust long-term memory.`,
      prerequisites: [
        "Day 14: Vector Databases for Agents (understanding embeddings)",
        "Day 15: Agentic RAG Systems (LlamaIndex agents)",
        "Python fundamentals",
        "Basic understanding of LangChain chains"
      ],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "Understanding Agent State and Memory",
        description: `Agents built on LLMs are fundamentally stateless. Each API call to GPT-4 or Claude is independent—the model has no memory of previous calls. Any continuity must be managed by your application.

**The Stateless Problem:**

\`\`\`python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")

# First call
response1 = llm.invoke("My name is Alice.")
print(response1.content)  # "Nice to meet you, Alice!"

# Second call - no memory!
response2 = llm.invoke("What's my name?")
print(response2.content)  # "I don't know your name."
\`\`\`

The LLM doesn't remember Alice because each call is independent. To create continuity, we need to manage state ourselves.

**Two Memory Paradigms:**

These two approaches solve different problems and work at different levels of abstraction. **Conversation Memory** manages what gets sent to the LLM on each call. It stores the chat history—user messages, assistant responses—and provides strategies for handling long conversations that might overflow the context window. Its focus is purely on "what was said" in the conversation.

**Graph Checkpointing** operates at a higher level. It saves the complete execution state of your agent: messages, yes, but also tool states, custom variables, and where the agent was in its decision-making process. This enables capabilities that conversation memory alone cannot provide—pausing mid-execution, rewinding to try a different approach, or requiring human approval before sensitive operations. Its focus is on "what the agent was doing" as a complete system.

\`\`\`python
# With conversation memory - maintains chat history
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

memory = ConversationBufferMemory()
chain = ConversationChain(llm=llm, memory=memory)

chain.run("My name is Alice.")
chain.run("What's my name?")  # Now remembers "Alice"

# With graph checkpointing - maintains full state
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, MessagesState

checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "session-1"}}
graph.invoke({"messages": [("user", "My name is Alice")]}, config)
graph.invoke({"messages": [("user", "What's my name?")]}, config)  # Remembers
\`\`\`

Both approaches solve the stateless problem, but at different levels. Memory manages conversation context; checkpointing manages agent execution state.`,
        analogy: "Think of conversation memory as a transcript of your meetings—it records what was said. Checkpointing is like saving your entire desktop: all open applications, documents, and their states. You can close your laptop, reopen it, and continue exactly where you left off.",
        gotchas: [
          "LLMs are always stateless—memory is YOUR responsibility",
          "Conversation memory without checkpointing is lost on restart",
          "Checkpointing without memory doesn't manage token limits",
          "Thread IDs must be unique per conversation to avoid state collision"
        ]
      },
      {
        title: "LangGraph Checkpointing Deep Dive",
        description: `LangGraph's checkpointing system saves the complete state of your agent graph after every node execution. This enables powerful patterns impossible with conversation memory alone.

**How Checkpointing Works:**

\`\`\`python
from langgraph.graph import StateGraph, MessagesState
from langgraph.checkpoint.memory import MemorySaver

# Define state and nodes
def process_node(state: MessagesState):
    # Your logic here
    return {"messages": [...]}

# Build graph
builder = StateGraph(MessagesState)
builder.add_node("process", process_node)
builder.add_edge("__start__", "process")
builder.add_edge("process", "__end__")

# Compile WITH checkpointer
checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)
\`\`\`

When you invoke the graph, every node execution creates a checkpoint:

\`\`\`python
# Every invoke is associated with a thread
config = {"configurable": {"thread_id": "user-alice-session-1"}}

# First message - creates checkpoints
result = graph.invoke(
    {"messages": [("user", "Hello!")]},
    config
)

# Second message - continues same thread
result = graph.invoke(
    {"messages": [("user", "What did I just say?")]},
    config
)
# Agent has full context of the conversation
\`\`\`

**Thread Organization:**

Thread IDs are how LangGraph organizes conversations. Best practices:

\`\`\`python
# Pattern: user-id + session-id
thread_id = f"user-{user_id}-session-{session_id}"

# Pattern: include timestamp for debugging
from datetime import datetime
thread_id = f"user-{user_id}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

# Pattern: UUID for anonymous sessions
import uuid
thread_id = f"anon-{uuid.uuid4()}"
\`\`\`

**Inspecting State:**

\`\`\`python
# Get current state
state = graph.get_state(config)
print(state.values)  # Current state values
print(state.next)    # Next node to execute (if interrupted)

# Get state history (time travel!)
for checkpoint in graph.get_state_history(config):
    print(f"Step: {checkpoint.metadata.get('step')}")
    print(f"Messages: {len(checkpoint.values.get('messages', []))}")
\`\`\``,
        analogy: "Checkpointing is like version control for your agent's brain. Every action creates a commit you can inspect, revert to, or branch from.",
        gotchas: [
          "MemorySaver stores in RAM—everything is lost on restart",
          "Checkpoints accumulate—implement cleanup for long-running applications",
          "State must be serializable—no open file handles or database connections",
          "Thread IDs are strings—choose a consistent naming scheme"
        ]
      },
      {
        title: "Production Checkpointers: SQLite and PostgreSQL",
        description: `For production, you need persistent checkpointers that survive restarts and can scale to multiple instances.

**SqliteSaver: Single-Instance Production**

SQLite works great for single-server deployments. State persists to a file.

\`\`\`python
from langgraph.checkpoint.sqlite import SqliteSaver

# Always use context manager for proper connection handling
with SqliteSaver.from_conn_string("checkpoints.db") as saver:
    graph = builder.compile(checkpointer=saver)

    config = {"configurable": {"thread_id": "user-123"}}
    result = graph.invoke({"messages": [("user", "Hello")]}, config)

# Later (even after restart), state persists
with SqliteSaver.from_conn_string("checkpoints.db") as saver:
    graph = builder.compile(checkpointer=saver)

    # Same thread_id resumes the conversation
    result = graph.invoke(
        {"messages": [("user", "Continue our conversation")]},
        {"configurable": {"thread_id": "user-123"}}
    )
\`\`\`

**PostgresSaver: Multi-Instance Production**

PostgreSQL enables multiple server instances sharing state.

\`\`\`python
from langgraph.checkpoint.postgres import PostgresSaver
import psycopg

DB_URI = "postgresql://user:pass@localhost:5432/langgraph"

# Sync usage
with psycopg.connect(DB_URI) as conn:
    saver = PostgresSaver(conn)
    saver.setup()  # Create tables on first run

    graph = builder.compile(checkpointer=saver)

    config = {"configurable": {"thread_id": "user-456"}}
    result = graph.invoke({"messages": [("user", "Hello")]}, config)
\`\`\`

**Async for High Traffic:**

\`\`\`python
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool

async def create_agent():
    pool = AsyncConnectionPool(
        DB_URI,
        min_size=5,
        max_size=20
    )

    saver = AsyncPostgresSaver(pool)
    await saver.setup()

    graph = builder.compile(checkpointer=saver)
    return graph, pool

async def main():
    graph, pool = await create_agent()

    config = {"configurable": {"thread_id": "user-789"}}
    result = await graph.ainvoke(
        {"messages": [("user", "Hello")]},
        config
    )

    await pool.close()
\`\`\`

**Choosing a Checkpointer:**

The right checkpointer depends on your deployment environment. For local development, **MemorySaver** is the obvious choice—it's fast, requires no setup, and lets you iterate quickly. The tradeoff is that everything vanishes when your process stops, which is fine during development.

When you need persistence on a single server, **SqliteSaver** is ideal. It writes to a local database file, so your agent's state survives restarts. The limitation is that SQLite doesn't handle multiple processes writing to the same file well, so it's best suited for single-instance deployments.

For production with multiple servers or serverless environments like AWS Lambda or Cloud Run, **PostgresSaver** is the standard choice. All your instances connect to the same database, so a user can start a conversation on one server and continue it on another. For high-concurrency applications, use the async variant (**AsyncPostgresSaver**) with connection pooling to handle many simultaneous conversations efficiently.`,
        gotchas: [
          "SqliteSaver doesn't work with multiple processes writing to the same file",
          "PostgresSaver requires separate installation: pip install langgraph-checkpoint-postgres",
          "Always use connection pooling with PostgresSaver in production",
          "Run saver.setup() to create required database tables"
        ]
      },
      {
        title: "Human-in-the-Loop with Checkpoints",
        description: `Checkpointing enables powerful human-in-the-loop patterns where agents pause for human review before taking actions.

**Basic Interrupt Pattern:**

\`\`\`python
from langgraph.graph import StateGraph, MessagesState

builder = StateGraph(MessagesState)
builder.add_node("agent", agent_node)
builder.add_node("tools", tool_node)

builder.add_edge("__start__", "agent")
builder.add_conditional_edges("agent", should_continue, {
    "tools": "tools",
    "end": "__end__"
})
builder.add_edge("tools", "agent")

# Interrupt BEFORE tools execute
graph = builder.compile(
    checkpointer=saver,
    interrupt_before=["tools"]
)
\`\`\`

**Running with Interrupts:**

\`\`\`python
config = {"configurable": {"thread_id": "approval-flow-1"}}

# First invoke runs until interrupt point
result = graph.invoke(
    {"messages": [("user", "Delete all user data")]},
    config
)

# Check if we're at an interrupt
state = graph.get_state(config)
if state.next == ("tools",):
    # Agent wants to use tools - show to human for approval
    pending_action = state.values["messages"][-1]
    print(f"Agent wants to: {pending_action.tool_calls}")

    # Human approves
    if human_approves(pending_action):
        # Continue from checkpoint
        result = graph.invoke(None, config)  # None = continue
    else:
        # Human rejects - modify state and continue
        graph.update_state(
            config,
            {"messages": [("user", "No, don't do that. Just explain what you would do.")]},
            as_node="agent"
        )
        result = graph.invoke(None, config)
\`\`\`

**Time Travel - Reverting to Earlier States:**

\`\`\`python
# Get all checkpoints
checkpoints = list(graph.get_state_history(config))

# Find the checkpoint we want (e.g., before the problematic action)
target_checkpoint = checkpoints[2]  # Third checkpoint

# Get its config
target_config = target_checkpoint.config

# Invoke from that point - creates a new branch
result = graph.invoke(
    {"messages": [("user", "Let's try a different approach")]},
    target_config
)
\`\`\`

**Practical Example - Approval Workflow:**

\`\`\`python
async def run_with_approval(graph, user_input: str, thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}

    # Run until interrupt or completion
    result = await graph.ainvoke(
        {"messages": [("user", user_input)]},
        config
    )

    while True:
        state = await graph.aget_state(config)

        if not state.next:
            # No next node = completed
            return result

        if "tools" in state.next:
            # Paused for tool approval
            last_msg = state.values["messages"][-1]

            print("\\n--- APPROVAL REQUIRED ---")
            print(f"Agent wants to execute: {last_msg.tool_calls}")
            approval = input("Approve? (y/n): ")

            if approval.lower() == "y":
                result = await graph.ainvoke(None, config)
            else:
                # Reject and ask agent to try differently
                await graph.aupdate_state(
                    config,
                    {"messages": [("user", "That action is not approved. Suggest an alternative.")]},
                    as_node="agent"
                )
                result = await graph.ainvoke(None, config)
\`\`\``,
        analogy: "Human-in-the-loop is like a workflow with approval gates. The agent can draft an email, but a human must click 'Send'. The checkpoint saves exactly where we paused, so we can resume seamlessly.",
        gotchas: [
          "interrupt_before pauses BEFORE the node; interrupt_after pauses AFTER",
          "graph.invoke(None, config) continues from the current checkpoint",
          "update_state() modifies state as if a node produced that output",
          "Time travel creates new checkpoints—it doesn't overwrite history"
        ]
      },
      {
        title: "Conversation Memory Classes",
        description: `While LangGraph checkpointing handles workflow state, conversation memory classes manage how message history is sent to the LLM. Different strategies trade off between context completeness and token usage.

**ConversationBufferMemory - Keep Everything:**

\`\`\`python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI

memory = ConversationBufferMemory(return_messages=True)
llm = ChatOpenAI(model="gpt-4o")

chain = ConversationChain(llm=llm, memory=memory)

chain.run("My name is Alice")
chain.run("I work on machine learning")
chain.run("What do you know about me?")
# Full history sent to LLM each time
\`\`\`

Pros: Complete context, no information loss
Cons: Token usage grows unbounded

**ConversationSummaryMemory - Summarize Everything:**

\`\`\`python
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(
    llm=llm,  # Used to generate summaries
    return_messages=True
)

chain = ConversationChain(llm=llm, memory=memory)

# After many turns, memory contains a summary, not full transcript
\`\`\`

Pros: Fixed token usage regardless of conversation length
Cons: Loses specific details, extra LLM calls for summarization

**ConversationBufferWindowMemory - Keep Recent Only:**

\`\`\`python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(
    k=10,  # Keep last 10 exchanges
    return_messages=True
)

# Only the most recent messages are retained
\`\`\`

Pros: Predictable token usage, simple
Cons: Completely forgets older context

**ConversationSummaryBufferMemory - Best of Both (Recommended):**

\`\`\`python
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=500,  # Start summarizing when buffer exceeds this
    return_messages=True
)

# Recent messages kept verbatim
# Older messages summarized
# Best balance of accuracy and efficiency
\`\`\`

**Understanding the Tradeoffs:**

To understand why these strategies matter, consider a 20-turn conversation. With **BufferMemory**, you're sending over 4,000 tokens to the LLM—and that number keeps growing with every message. You get perfect context quality because nothing is lost, but you'll eventually hit the model's limit.

**SummaryMemory** compresses everything into roughly 200 tokens regardless of conversation length. The token count stays fixed and manageable, but you lose specific details. The user mentioned their deadline was March 15th? That might get summarized away into "discussed project timeline."

**WindowMemory** takes a different approach: it simply keeps the last few exchanges (say, 5) and discards everything older. This gives you about 500 tokens with perfect accuracy for recent context, but the agent completely forgets what happened earlier. The user's name mentioned in turn 1? Gone by turn 10.

**SummaryBufferMemory** combines both strategies intelligently. Old messages get summarized (preserving the gist), while recent messages stay verbatim (preserving accuracy where it matters most). This typically runs around 700 tokens—bounded, not growing—while maintaining good overall context with excellent recent accuracy. For most applications, this is the sweet spot.

**Modern Approach: RunnableWithMessageHistory**

LangChain is moving toward \`RunnableWithMessageHistory\` for better composability:

\`\`\`python
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

# Store for chat histories (in production, use Redis/PostgreSQL)
store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

# Your chain (prompt | llm | parser)
chain = prompt | llm

# Wrap with message history
with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history"
)

# Use with session_id
config = {"configurable": {"session_id": "user-123"}}
response = with_history.invoke({"input": "Hi, I'm Alice"}, config=config)
\`\`\``,
        analogy: "BufferMemory is recording every word of a lecture. SummaryMemory is taking notes. WindowMemory is only remembering the last few minutes. SummaryBufferMemory is taking notes for old material while keeping detailed notes for recent topics.",
        gotchas: [
          "Memory classes are being deprecated in favor of RunnableWithMessageHistory",
          "SummaryMemory requires additional LLM calls—adds latency and cost",
          "WindowMemory can forget critical early context (like user's name)",
          "Token limits still apply—even summaries can overflow"
        ]
      },
      {
        title: "Combining Checkpointing and Memory",
        description: `Production agents often need both checkpointing (workflow state) and memory management (conversation handling). Here's how to combine them effectively.

**Architecture: Layered Memory**

\`\`\`
┌────────────────────────────────────────┐
│           Agent Execution              │
├────────────────────────────────────────┤
│  Working Memory (in-context)           │
│  Current task, recent messages         │
├────────────────────────────────────────┤
│  Session Memory (checkpoints)          │
│  Full graph state, conversation ID     │
├────────────────────────────────────────┤
│  Long-Term Memory (vector store)       │
│  User facts, preferences, history      │
└────────────────────────────────────────┘
\`\`\`

**Pattern: Checkpointing + Summarization**

\`\`\`python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, add_messages
from langchain_openai import ChatOpenAI

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    summary: str  # Rolling summary of older conversation
    user_facts: list[str]  # Extracted facts about user

def summarize_if_needed(state: AgentState) -> AgentState:
    """Summarize old messages to manage context."""
    messages = state["messages"]

    if len(messages) > 20:
        # Keep last 10 messages verbatim
        recent = messages[-10:]
        old = messages[:-10]

        # Summarize older messages
        llm = ChatOpenAI(model="gpt-4o")
        summary_prompt = f"Summarize this conversation:\\n{old}"
        summary = llm.invoke(summary_prompt).content

        return {
            "messages": recent,
            "summary": state.get("summary", "") + "\\n" + summary
        }

    return {}

def agent_node(state: AgentState) -> AgentState:
    """Main agent node with context from summary."""
    llm = ChatOpenAI(model="gpt-4o")

    # Build context including summary
    context = ""
    if state.get("summary"):
        context = f"Previous conversation summary: {state['summary']}\\n\\n"
    if state.get("user_facts"):
        context += f"Known about user: {', '.join(state['user_facts'])}\\n\\n"

    # Prepend context to messages
    messages = state["messages"]
    if context:
        messages = [("system", context)] + messages

    response = llm.invoke(messages)
    return {"messages": [response]}

# Build graph with summarization
builder = StateGraph(AgentState)
builder.add_node("summarize", summarize_if_needed)
builder.add_node("agent", agent_node)
builder.add_edge("__start__", "summarize")
builder.add_edge("summarize", "agent")
builder.add_edge("agent", "__end__")

# Compile with checkpointing
graph = builder.compile(checkpointer=postgres_saver)
\`\`\`

**Pattern: Long-Term Memory with Vector Store**

\`\`\`python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

class AgentWithMemory:
    def __init__(self, user_id: str):
        self.user_id = user_id

        # Long-term memory in vector store
        self.memory_store = Chroma(
            collection_name=f"user_{user_id}",
            embedding_function=OpenAIEmbeddings()
        )

    def remember(self, fact: str):
        """Store fact in long-term memory."""
        self.memory_store.add_texts([fact])

    def recall(self, query: str, k: int = 5) -> list[str]:
        """Retrieve relevant memories."""
        results = self.memory_store.similarity_search(query, k=k)
        return [doc.page_content for doc in results]

    async def chat(self, message: str, graph, config):
        # Recall relevant memories
        memories = self.recall(message)

        # Add memories to context
        augmented = {"messages": [("user", message)]}
        if memories:
            context = "Relevant context: " + "; ".join(memories)
            augmented["messages"].insert(0, ("system", context))

        # Invoke graph (with checkpointing)
        result = await graph.ainvoke(augmented, config)

        # Extract and store new facts
        new_facts = self.extract_facts(message, result)
        for fact in new_facts:
            self.remember(fact)

        return result
\`\`\`

**When to Use Each:**

Think of these as layers that solve different problems. If your agent needs to **resume after a restart**, that's checkpointing—it saves the entire execution state so you can pick up where you left off. If you need **human approval gates** before sensitive operations, that's also checkpointing, specifically using \`interrupt_before\` to pause execution until a human gives the green light.

**Conversation memory** is the answer when you're hitting token limits. Your conversations are getting long, and you need to compress them intelligently to fit within the model's context window.

For **remembering users across sessions**—their preferences, past interactions, key facts about them—a vector store is the right tool. This is semantic long-term memory that persists indefinitely and can be searched by meaning.

When **debugging agent decisions**, checkpointing's state history lets you step through exactly what the agent saw and decided at each point. And for **multi-user isolation**—ensuring one user's conversation doesn't leak into another's—thread IDs provide the separation you need.

In practice, production agents often use all of these together: checkpointing for workflow state, conversation memory for token management, vector stores for long-term facts, and thread IDs for user isolation.`,
        gotchas: [
          "Checkpointing alone doesn't manage token limits—messages can still overflow",
          "Vector store lookups add latency—cache frequently accessed memories",
          "Summarization is lossy—critical facts might be dropped",
          "Test memory isolation between users carefully"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Basic MemorySaver Usage",
        language: "python",
        category: "basic",
        code: `from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, MessagesState
from langchain_openai import ChatOpenAI

# Simple agent node
def agent_node(state: MessagesState):
    llm = ChatOpenAI(model="gpt-4o")
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

# Build graph
builder = StateGraph(MessagesState)
builder.add_node("agent", agent_node)
builder.add_edge("__start__", "agent")
builder.add_edge("agent", "__end__")

# Compile with in-memory checkpointing
memory = MemorySaver()
graph = builder.compile(checkpointer=memory)

# Use thread_id to maintain conversation
config = {"configurable": {"thread_id": "demo-session-1"}}

# First message
result = graph.invoke(
    {"messages": [("user", "Hi! My favorite color is blue.")]},
    config
)
print(result["messages"][-1].content)

# Second message - same thread remembers context
result = graph.invoke(
    {"messages": [("user", "What's my favorite color?")]},
    config
)
print(result["messages"][-1].content)  # "Your favorite color is blue!"`,
        explanation: "MemorySaver provides in-memory checkpointing for development. The thread_id in config identifies the conversation—same thread_id means continued context."
      },
      {
        title: "SqliteSaver for Local Persistence",
        language: "python",
        category: "basic",
        code: `from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph, MessagesState
from langchain_openai import ChatOpenAI

# Build your graph (same as before)
builder = StateGraph(MessagesState)
builder.add_node("agent", agent_node)
builder.add_edge("__start__", "agent")
builder.add_edge("agent", "__end__")

# Use SqliteSaver for persistence
# State survives application restarts!
with SqliteSaver.from_conn_string("my_agent_checkpoints.db") as saver:
    graph = builder.compile(checkpointer=saver)

    config = {"configurable": {"thread_id": "persistent-session-1"}}

    # This conversation persists to disk
    result = graph.invoke(
        {"messages": [("user", "Remember: project deadline is March 15")]},
        config
    )
    print(result["messages"][-1].content)

# Even after restarting Python, the conversation continues:
with SqliteSaver.from_conn_string("my_agent_checkpoints.db") as saver:
    graph = builder.compile(checkpointer=saver)

    result = graph.invoke(
        {"messages": [("user", "When is the project deadline?")]},
        {"configurable": {"thread_id": "persistent-session-1"}}
    )
    print(result["messages"][-1].content)  # "March 15"`,
        explanation: "SqliteSaver persists checkpoints to a SQLite database file. Perfect for single-server deployments where you need data to survive restarts."
      },
      {
        title: "PostgresSaver for Production",
        language: "python",
        category: "intermediate",
        code: `from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
import asyncio

# Connection string (use environment variables in production!)
DB_URI = "postgresql://user:password@localhost:5432/langgraph"

# Synchronous usage
def sync_example():
    import psycopg

    with psycopg.connect(DB_URI) as conn:
        saver = PostgresSaver(conn)
        saver.setup()  # Create tables if needed

        graph = builder.compile(checkpointer=saver)

        config = {"configurable": {"thread_id": "user-123-session-1"}}
        result = graph.invoke(
            {"messages": [("user", "Hello from production!")]},
            config
        )
        return result

# Asynchronous usage (recommended for production)
async def async_example():
    # Connection pool for better performance
    async with AsyncConnectionPool(
        DB_URI,
        min_size=5,
        max_size=20
    ) as pool:
        saver = AsyncPostgresSaver(pool)
        await saver.setup()

        graph = builder.compile(checkpointer=saver)

        config = {"configurable": {"thread_id": "user-456-session-1"}}
        result = await graph.ainvoke(
            {"messages": [("user", "Hello async!")]},
            config
        )
        return result

# Run async example
result = asyncio.run(async_example())
print(result["messages"][-1].content)`,
        explanation: "PostgresSaver enables multi-instance deployments where multiple servers share checkpoint state. Use AsyncPostgresSaver with connection pooling for high-traffic production workloads."
      },
      {
        title: "Human-in-the-Loop Workflow",
        language: "python",
        category: "intermediate",
        code: `from langgraph.graph import StateGraph, MessagesState
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage

def agent_node(state: MessagesState):
    llm = ChatOpenAI(model="gpt-4o").bind_tools([dangerous_tool])
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def tool_node(state: MessagesState):
    # Execute the tool calls from the last message
    last_message = state["messages"][-1]
    results = []
    for tool_call in last_message.tool_calls:
        result = execute_tool(tool_call)
        results.append(result)
    return {"messages": results}

def should_continue(state: MessagesState):
    last_message = state["messages"][-1]
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tools"
    return "end"

# Build graph
builder = StateGraph(MessagesState)
builder.add_node("agent", agent_node)
builder.add_node("tools", tool_node)
builder.add_edge("__start__", "agent")
builder.add_conditional_edges("agent", should_continue, {
    "tools": "tools",
    "end": "__end__"
})
builder.add_edge("tools", "agent")

# Compile with interrupt BEFORE tools execute
with SqliteSaver.from_conn_string("approvals.db") as saver:
    graph = builder.compile(
        checkpointer=saver,
        interrupt_before=["tools"]  # Pause for human approval
    )

    config = {"configurable": {"thread_id": "approval-demo"}}

    # First invoke - agent decides to use a tool
    result = graph.invoke(
        {"messages": [("user", "Delete all test files")]},
        config
    )

    # Check if we're paused at an interrupt
    state = graph.get_state(config)
    if state.next == ("tools",):
        # Show pending action to human
        pending = state.values["messages"][-1]
        print(f"Agent wants to execute: {pending.tool_calls}")

        approval = input("Approve? (y/n): ")
        if approval.lower() == "y":
            # Continue execution
            result = graph.invoke(None, config)
        else:
            # Modify state to reject
            graph.update_state(
                config,
                {"messages": [("user", "Action rejected. Explain what you wanted to do instead.")]},
                as_node="agent"
            )
            result = graph.invoke(None, config)`,
        explanation: "interrupt_before pauses graph execution before the specified node runs. This enables human review of agent actions before they execute. invoke(None, config) continues from the checkpoint."
      },
      {
        title: "ConversationBufferMemory",
        language: "python",
        category: "basic",
        code: `from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI

# Create memory that stores full conversation
memory = ConversationBufferMemory(
    return_messages=True,  # Return as message objects
    memory_key="history"   # Key used in prompt template
)

# Create conversation chain
llm = ChatOpenAI(model="gpt-4o")
chain = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True  # See what's happening
)

# Conversation builds up in memory
print(chain.run("Hi! I'm building a chatbot."))
print(chain.run("It's for customer support."))
print(chain.run("What have I told you about my project?"))

# Memory contains full transcript
print("\\n--- Memory Contents ---")
print(memory.load_memory_variables({}))

# WARNING: Token usage grows with every message!
# After 100 messages, you might hit context limits`,
        explanation: "ConversationBufferMemory stores the complete conversation history. Simple but expensive—token usage grows without bound. Best for short conversations."
      },
      {
        title: "ConversationSummaryBufferMemory",
        language: "python",
        category: "intermediate",
        code: `from langchain.memory import ConversationSummaryBufferMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")

# Hybrid memory: summarizes old messages, keeps recent ones
memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=500,  # Start summarizing when exceeding this
    return_messages=True
)

chain = ConversationChain(llm=llm, memory=memory, verbose=True)

# Simulate a long conversation
topics = [
    "I'm building an AI assistant for my company.",
    "We handle customer support tickets.",
    "Most tickets are about billing issues.",
    "We use Zendesk as our ticketing system.",
    "The assistant should help agents respond faster.",
    "It should suggest responses based on past tickets.",
    "We handle about 500 tickets per day.",
    "Response time is our key metric.",
]

for topic in topics:
    chain.run(topic)

# Check memory - older parts are summarized
print("\\n--- Memory Contents ---")
mem_vars = memory.load_memory_variables({})
print(f"Summary: {memory.moving_summary_buffer}")
print(f"Recent messages: {len(mem_vars['history'])} messages kept verbatim")

# Final question uses summary + recent context
response = chain.run("Summarize what you know about my project")
print(f"\\nFinal response: {response}")`,
        explanation: "ConversationSummaryBufferMemory offers the best balance: older messages are summarized to save tokens, while recent messages are kept verbatim for accuracy. Recommended for most production use cases."
      },
      {
        title: "Time Travel and State Inspection",
        language: "python",
        category: "advanced",
        code: `from langgraph.checkpoint.sqlite import SqliteSaver

with SqliteSaver.from_conn_string("time_travel.db") as saver:
    graph = builder.compile(checkpointer=saver)
    config = {"configurable": {"thread_id": "time-travel-demo"}}

    # Build up a conversation
    graph.invoke({"messages": [("user", "Let's plan a trip to Japan")]}, config)
    graph.invoke({"messages": [("user", "I want to visit Tokyo and Kyoto")]}, config)
    graph.invoke({"messages": [("user", "Actually, let's go to France instead")]}, config)
    graph.invoke({"messages": [("user", "I want to visit Paris")]}, config)

    # List all checkpoints (state history)
    print("=== Checkpoint History ===")
    checkpoints = list(graph.get_state_history(config))

    for i, cp in enumerate(checkpoints):
        msg_count = len(cp.values.get("messages", []))
        print(f"Checkpoint {i}: {msg_count} messages")
        if cp.values.get("messages"):
            last_msg = cp.values["messages"][-1]
            print(f"  Last message: {last_msg.content[:50]}...")

    # Time travel: go back to before we changed to France
    # (checkpoint 2 was after "Tokyo and Kyoto")
    japan_checkpoint = checkpoints[2]
    japan_config = japan_checkpoint.config

    print("\\n=== Time Traveling to Japan Planning ===")

    # Continue from that point with different input
    result = graph.invoke(
        {"messages": [("user", "Let's also visit Osaka!")]},
        japan_config
    )

    # This creates a new branch - France conversation is still there
    print(f"New branch response: {result['messages'][-1].content}")

    # Original conversation still exists
    original_state = graph.get_state(config)
    print(f"\\nOriginal conversation still has {len(original_state.values['messages'])} messages")`,
        explanation: "LangGraph's checkpointing enables time travel—you can view state at any point, branch from earlier checkpoints, and explore alternative paths without losing the original conversation."
      },
      {
        title: "Complete Agent with Layered Memory",
        language: "python",
        category: "advanced",
        code: `from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, add_messages
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from psycopg_pool import AsyncConnectionPool
import asyncio

# Extended state with memory layers
class MemoryAgentState(TypedDict):
    messages: Annotated[list, add_messages]
    conversation_summary: str
    recalled_facts: list[str]
    user_id: str

class ProductionAgent:
    def __init__(self, db_uri: str, chroma_path: str):
        self.db_uri = db_uri
        self.embeddings = OpenAIEmbeddings()
        self.chroma_path = chroma_path
        self.llm = ChatOpenAI(model="gpt-4o")

    def _get_user_memory(self, user_id: str) -> Chroma:
        """Get or create user-specific long-term memory."""
        return Chroma(
            collection_name=f"user_{user_id}",
            embedding_function=self.embeddings,
            persist_directory=f"{self.chroma_path}/{user_id}"
        )

    async def _recall_node(self, state: MemoryAgentState) -> dict:
        """Recall relevant facts from long-term memory."""
        user_id = state.get("user_id", "default")
        memory = self._get_user_memory(user_id)

        # Get last user message
        last_msg = state["messages"][-1].content

        # Search for relevant memories
        results = memory.similarity_search(last_msg, k=3)
        facts = [doc.page_content for doc in results]

        return {"recalled_facts": facts}

    async def _agent_node(self, state: MemoryAgentState) -> dict:
        """Main agent with memory context."""
        # Build context from memory layers
        context_parts = []

        if state.get("conversation_summary"):
            context_parts.append(
                f"Conversation summary: {state['conversation_summary']}"
            )

        if state.get("recalled_facts"):
            context_parts.append(
                f"Relevant memories: {'; '.join(state['recalled_facts'])}"
            )

        # Prepare messages with context
        messages = list(state["messages"])
        if context_parts:
            context = "\\n".join(context_parts)
            messages.insert(0, ("system", f"Context:\\n{context}"))

        response = await self.llm.ainvoke(messages)
        return {"messages": [response]}

    async def _remember_node(self, state: MemoryAgentState) -> dict:
        """Extract and store important facts."""
        user_id = state.get("user_id", "default")
        memory = self._get_user_memory(user_id)

        # Simple fact extraction (in production, use an LLM)
        messages = state["messages"][-2:]  # Last exchange
        for msg in messages:
            content = msg.content if hasattr(msg, 'content') else str(msg)
            if any(marker in content.lower() for marker in
                   ["my name is", "i work", "i like", "remember"]):
                memory.add_texts([content])

        return {}

    def _build_graph(self) -> StateGraph:
        builder = StateGraph(MemoryAgentState)

        builder.add_node("recall", self._recall_node)
        builder.add_node("agent", self._agent_node)
        builder.add_node("remember", self._remember_node)

        builder.add_edge("__start__", "recall")
        builder.add_edge("recall", "agent")
        builder.add_edge("agent", "remember")
        builder.add_edge("remember", "__end__")

        return builder

    async def run(self):
        """Run the agent with production checkpointing."""
        async with AsyncConnectionPool(self.db_uri, min_size=5, max_size=20) as pool:
            saver = AsyncPostgresSaver(pool)
            await saver.setup()

            builder = self._build_graph()
            graph = builder.compile(checkpointer=saver)

            # Example conversation
            user_id = "user-alice"
            config = {"configurable": {"thread_id": f"{user_id}-session-1"}}

            # First interaction
            result = await graph.ainvoke({
                "messages": [("user", "Hi! My name is Alice and I love Python.")],
                "user_id": user_id
            }, config)
            print(f"Agent: {result['messages'][-1].content}")

            # Later interaction - agent recalls from long-term memory
            result = await graph.ainvoke({
                "messages": [("user", "What programming language should I use?")],
                "user_id": user_id
            }, config)
            print(f"Agent: {result['messages'][-1].content}")

# Usage
agent = ProductionAgent(
    db_uri="postgresql://user:pass@localhost:5432/langgraph",
    chroma_path="./user_memories"
)
asyncio.run(agent.run())`,
        explanation: "This production agent combines multiple memory layers: LangGraph checkpointing for session persistence, a recall node that queries long-term vector memory, and a remember node that extracts and stores new facts. Each user has isolated memory."
      }
    ],

    diagrams: [
      {
        title: "Checkpointing vs Conversation Memory",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Checkpointing["LangGraph Checkpointing"]
        direction TB
        C1["Full Graph State"]
        C2["Every Node Execution"]
        C3["Thread-Based Organization"]
        C4["Time Travel & Branching"]
        C5["Human-in-the-Loop"]
    end

    subgraph Memory["Conversation Memory"]
        direction TB
        M1["Message History Only"]
        M2["Token Management"]
        M3["Summarization Strategies"]
        M4["Context Window Control"]
    end

    subgraph Combined["Production Pattern"]
        BOTH["Use Both Together"]
        BOTH --> |"Workflow State"| Checkpointing
        BOTH --> |"Token Management"| Memory
    end`,
        caption: "Checkpointing handles workflow state persistence; conversation memory manages token limits. Production agents typically need both."
      },
      {
        title: "Memory Types Token Usage",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph Buffer["BufferMemory"]
        B1["Turn 1"] --> B2["Turn 2"] --> B3["Turn 3"] --> B4["Turn 4"] --> B5["Turn 5"]
        BT["Tokens: 500 → 1000 → 1500 → 2000 → 2500"]
    end

    subgraph Summary["SummaryMemory"]
        S1["Summary of all turns"]
        ST["Tokens: ~200 (fixed)"]
    end

    subgraph Window["WindowMemory k=3"]
        W3["Turn 3"] --> W4["Turn 4"] --> W5["Turn 5"]
        WT["Tokens: ~600 (fixed)"]
    end

    subgraph SummaryBuffer["SummaryBufferMemory"]
        SB1["Summary of 1-2"] --> SB3["Turn 3"] --> SB4["Turn 4"] --> SB5["Turn 5"]
        SBT["Tokens: ~800 (bounded)"]
    end`,
        caption: "Different memory strategies have different token profiles. BufferMemory grows unbounded, while SummaryBufferMemory provides a good balance."
      },
      {
        title: "Layered Memory Architecture",
        type: "mermaid",
        mermaid: `flowchart TB
    User["User Message"] --> Agent

    subgraph Agent["Agent with Layered Memory"]
        direction TB

        subgraph Working["Working Memory"]
            WM["Current context window"]
            WM2["Recent messages"]
        end

        subgraph Session["Session Memory"]
            SM["LangGraph Checkpoints"]
            SM2["Full state per thread"]
        end

        subgraph Long["Long-Term Memory"]
            LM["Vector Store"]
            LM2["User facts & preferences"]
        end

        Working --> Session
        Session --> Long
    end

    Agent --> Response["Agent Response"]

    style Working fill:#e1f5fe
    style Session fill:#fff3e0
    style Long fill:#f3e5f5`,
        caption: "Production agents use layered memory: working memory for current context, session memory via checkpoints, and long-term memory in vector stores."
      }
    ],

    keyTakeaways: [
      "LLMs are stateless—all memory must be managed by your application",
      "LangGraph checkpointing saves full graph state at every step, enabling pause/resume and time travel",
      "Use MemorySaver for development, SqliteSaver for single-instance, PostgresSaver for production",
      "Thread IDs organize conversations—unique per user/session to prevent state collision",
      "Conversation memory (Buffer, Summary, Window, SummaryBuffer) manages token usage",
      "SummaryBufferMemory offers the best balance of context retention and token efficiency",
      "Human-in-the-loop patterns use interrupt_before to pause for approval",
      "Production agents combine checkpointing (workflow) with memory (tokens) and vector stores (long-term)"
    ],

    resources: [
      {
        title: "LangGraph Persistence Concepts",
        url: "https://langchain-ai.github.io/langgraph/concepts/persistence/",
        type: "docs",
        description: "Official LangGraph documentation on checkpointing, state persistence, and thread management",
        summaryPath: "data/day-16/summary-langgraph-persistence.md"
      },
      {
        title: "LangChain Memory Documentation",
        url: "https://python.langchain.com/docs/modules/memory/",
        type: "docs",
        description: "Reference for conversation memory classes and token management strategies",
        summaryPath: "data/day-16/summary-conversation-memory.md"
      },
      {
        title: "Building Agents with Memory",
        url: "https://blog.langchain.dev/memory-for-agents/",
        type: "article",
        description: "Practical patterns for combining short-term, session, and long-term memory systems",
        summaryPath: "data/day-16/summary-memory-patterns.md"
      },
      {
        title: "Human-in-the-Loop Patterns",
        url: "https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/",
        type: "docs",
        description: "Guide to interrupt_before, state inspection, and approval workflows using checkpoints",
        summaryPath: "data/day-16/summary-postgres-checkpointer.md"
      }
    ],

    faq: [
      {
        question: "When should I use checkpointing vs conversation memory?",
        answer: "Use checkpointing when you need to persist agent state across restarts, enable human approval workflows, or implement time travel/branching. Use conversation memory when you need to manage token usage for long conversations. Most production agents need both: checkpointing for state persistence and memory for token management."
      },
      {
        question: "How do I handle multiple users with the same agent?",
        answer: "Use unique thread_ids per user session. A common pattern is thread_id = f'user-{user_id}-session-{session_id}'. This ensures each user's state is isolated. For long-term memory (vector stores), use separate collections per user: collection_name = f'user_{user_id}'."
      },
      {
        question: "What's the performance impact of checkpointing every step?",
        answer: "MemorySaver has minimal overhead (in-memory). SqliteSaver adds a few milliseconds per checkpoint. PostgresSaver with connection pooling is typically 5-20ms per checkpoint. For most applications, this is negligible compared to LLM call latency. Use async checkpointers (AsyncPostgresSaver) for high-concurrency workloads."
      },
      {
        question: "Can I migrate from MemorySaver to PostgresSaver without losing data?",
        answer: "No, there's no built-in migration. MemorySaver data is lost when the application stops. To migrate, you'd need to export state manually before shutdown. Best practice: use SqliteSaver or PostgresSaver from the start in any environment where persistence matters."
      },
      {
        question: "How do I clean up old checkpoints to save storage?",
        answer: "Implement a retention policy that deletes checkpoints older than a threshold. Run a periodic job: DELETE FROM checkpoints WHERE created_at < NOW() - INTERVAL '30 days'. Be careful to keep checkpoints for active conversations. Consider keeping only the latest N checkpoints per thread."
      }
    ],

    applications: [
      {
        title: "Customer Support Agent",
        description: "Maintains conversation context across sessions so users don't repeat themselves. Uses checkpointing for session persistence, conversation memory for token management, and vector store for remembering user history and past tickets."
      },
      {
        title: "Workflow Assistant with Approvals",
        description: "Handles multi-step workflows like expense approvals or document reviews. Uses human-in-the-loop patterns to pause for manager approval before executing actions. Checkpointing ensures state survives if the approval takes hours or days."
      },
      {
        title: "Personal AI Assistant",
        description: "Learns user preferences over time through long-term vector memory. Remembers facts like 'prefers morning meetings' or 'allergic to shellfish' across sessions. Combines checkpointing for session continuity with semantic search for relevant context."
      }
    ],

    relatedDays: [14, 15, 17, 6, 12]
  }
};
