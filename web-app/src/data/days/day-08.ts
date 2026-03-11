import type { Day } from '../../types';

export const day08: Day = {
  day: 8,
  phase: 2,
  title: "LangGraph: Memory & Checkpoints",
  partner: "LangChain",
  tags: ["memory", "persistence", "langgraph", "checkpointing", "threads"],
  concept: "Persisting agent state across sessions with checkpointing",
  demoUrl: "demos/day-8/",
  demoDescription: "Explore how checkpointing saves agent state. Watch conversations persist across sessions, simulate crashes and recovery, and see how thread IDs isolate different users.",
  learn: {
    overview: {
      summary: "Master LangGraph's checkpointing system to build agents that remember conversations, survive crashes, and support human-in-the-loop workflows.",
      fullDescription: `Day 7 introduced LangGraph's graph-based architecture for building agents with explicit control flow. But there's a critical question we only touched on: **what happens to state when the agent stops running?**

In a simple script, when execution ends, all state is lost. The next time you run the agent, it starts fresh with no memory of previous interactions. This is fine for one-shot tasks, but production agents need more:

- **Conversation Memory**: A chatbot should remember what was said earlier in the conversation.
- **Session Persistence**: If a user closes their browser and returns tomorrow, the conversation should continue.
- **Crash Recovery**: If your server restarts, ongoing workflows shouldn't lose progress.
- **Human-in-the-Loop**: An agent might need to pause for hours awaiting human approval, then resume exactly where it stopped.

**Checkpointing** solves all of these by saving the agent's complete state after each node execution. Think of it like auto-save in a video game: every time you reach a checkpoint, your progress is preserved. If you "die" (crash), you restart from the last checkpoint, not the beginning.

**How LangGraph Checkpointing Works**

When you compile a graph with a checkpointer, LangGraph automatically:
1. Saves the complete state (all fields in your TypedDict) after each node
2. Associates saves with a **thread_id** that identifies the conversation
3. Loads the previous state when you invoke with the same thread_id
4. Enables time-travel debugging by storing the full history

**What You'll Master Today**

1. **Checkpointer Types**: MemorySaver for development, SqliteSaver for single-server production, PostgresSaver for distributed systems
2. **Thread Management**: Using thread_ids to isolate conversations and manage multiple users
3. **State Inspection**: Using get_state() and get_state_history() to debug and understand agent behavior
4. **Human-in-the-Loop**: Implementing approval workflows that pause and resume
5. **Memory Patterns**: Short-term (within conversation) vs long-term (across conversations) memory
6. **Production Considerations**: State size, cleanup policies, and scaling strategies

By the end, you'll be able to build agents that maintain context across sessions, recover gracefully from failures, and support complex workflows requiring human intervention.`,
      prerequisites: ["Day 7: LangGraph fundamentals (StateGraph, nodes, edges)", "Understanding of database basics (helpful for production checkpointers)", "Python async programming (for async checkpointer operations)"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "Why Checkpointing Matters",
        description: `Consider a customer support agent. Without checkpointing:

> **User:** "I need help with order #12345"
> **Agent:** "I found order #12345. It's a laptop, shipped yesterday."
> **User:** "Can you cancel it?"
> **Agent:** "I'm sorry, I don't have any context about an order. Which order would you like to cancel?"

The agent has no memory between messages. Each \`invoke()\` starts fresh. You could manually pass conversation history, but this doesn't handle crashes, server restarts, or complex multi-step workflows.

---

**With checkpointing**, the agent automatically:

1. Saves state after each node (including all messages)
2. Loads previous state when invoked with the same \`thread_id\`
3. Continues exactly where it left off

---

**The Checkpoint Data Structure**

Each checkpoint contains:

- **\`values\`** — The complete state dict at that point
- **\`next\`** — Which nodes would execute next
- **\`config\`** — The configuration (including thread_id)
- **\`metadata\`** — Timestamps, node info, custom data
- **\`parent_config\`** — Link to the previous checkpoint (enabling history)

This means you can not only resume execution but also inspect any point in the agent's history—invaluable for debugging.`,
        analogy: "Checkpointing is like a court stenographer. Every statement (state change) is recorded with timestamps. If you need to review what happened, the full transcript is available. If the trial is interrupted, it resumes exactly where it stopped.",
        gotchas: ["State must be JSON-serializable for checkpointing to work", "Large states (big messages, embeddings) slow down checkpointing", "Without cleanup, checkpoints accumulate indefinitely"]
      },
      {
        title: "Checkpointer Types",
        description: `LangGraph provides several checkpointer implementations for different use cases.

---

### MemorySaver (Development)

\`\`\`python
from langgraph.checkpoint.memory import MemorySaver
checkpointer = MemorySaver()
\`\`\`

Stores checkpoints in memory. Fast but loses everything on restart. Perfect for development and testing.

---

### SqliteSaver (Single Server)

\`\`\`python
from langgraph.checkpoint.sqlite import SqliteSaver
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
\`\`\`

Persists to a SQLite database file. Survives restarts. Good for single-server deployments, local development with persistence, and small-scale production.

---

### AsyncSqliteSaver (Async Single Server)

\`\`\`python
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
checkpointer = AsyncSqliteSaver.from_conn_string("checkpoints.db")
\`\`\`

Async version of SqliteSaver for use with async graphs.

---

### PostgresSaver (Distributed/Production)

\`\`\`python
from langgraph.checkpoint.postgres import PostgresSaver
checkpointer = PostgresSaver.from_conn_string("postgresql://user:pass@host/db")
\`\`\`

Full PostgreSQL backend. Supports multiple servers, connection pooling, and enterprise features. The production choice for scaled deployments.

---

### Choosing the Right Checkpointer

- **Local development** → MemorySaver
- **Development with persistence** → SqliteSaver
- **Single-server production** → SqliteSaver
- **Multi-server production** → PostgresSaver
- **Serverless (Lambda, etc.)** → PostgresSaver or Redis-based
- **Testing** → MemorySaver`,
        analogy: "Checkpointers are like different filing systems. MemorySaver is keeping papers on your desk—fast access, but lost if you leave. SqliteSaver is a local filing cabinet—persistent but only you can access it. PostgresSaver is a central records office—accessible from anywhere, properly backed up, but requires more infrastructure.",
        gotchas: ["MemorySaver loses ALL data on process restart—never use in production", "SqliteSaver file must be accessible to your process—tricky in serverless", "PostgresSaver requires connection string management and potentially pooling"]
      },
      {
        title: "Thread IDs: Isolating Conversations",
        description: `The \`thread_id\` is how LangGraph knows which conversation you're continuing. It's passed in the config and associates all checkpoints for that conversation.

---

### Basic Usage

\`\`\`python
config = {"configurable": {"thread_id": "user-123-session-abc"}}

# First message
result1 = agent.invoke({"messages": [("human", "Hi, I'm Alice")]}, config)

# Later: same thread = same conversation
result2 = agent.invoke({"messages": [("human", "What's my name?")]}, config)
# Agent remembers: "Your name is Alice"
\`\`\`

---

### Thread ID Strategies

- **User-Based** — \`thread_id = user_id\`
  - Best for: Personal assistants (one conversation per user)

- **Session-Based** — \`f"{user_id}-{session_id}"\`
  - Best for: Support tickets, task-based interactions

- **Task-Based** — \`thread_id = task_id\`
  - Best for: Document processing, approval workflows

- **Composite** — \`f"{user_id}-{context}-{timestamp}"\`
  - Best for: Complex apps with multiple concurrent conversations

---

### New Thread = Fresh Start

\`\`\`python
# Different thread_id = completely independent conversation
other_config = {"configurable": {"thread_id": "user-456-session-xyz"}}
result = agent.invoke({"messages": [("human", "What's my name?")]}, other_config)
# Agent has no idea—this is a new conversation
\`\`\`

---

### Thread Isolation Guarantees

Threads are **completely isolated**. State from one thread never leaks to another. This is crucial for multi-tenant applications where users must not see each other's data.`,
        analogy: "Thread IDs are like phone numbers. When you call someone, the phone company routes your call based on the number. Each phone line (thread) has its own conversation history. Calling a different number starts a fresh conversation with someone else.",
        gotchas: ["Thread IDs are strings—use consistent formatting to avoid 'thread-123' vs 'thread_123' bugs", "Don't reuse thread IDs across different users—data isolation depends on unique IDs", "Consider thread ID length limits in your checkpointer's storage"]
      },
      {
        title: "Inspecting State: Debugging and Monitoring",
        description: `Checkpointing isn't just for persistence—it's a powerful debugging and monitoring tool. You can inspect the current state and replay the entire history.

---

### Getting Current State

\`\`\`python
config = {"configurable": {"thread_id": "debug-thread"}}

# Run the agent
result = agent.invoke({"messages": [("human", "Hello")]}, config)

# Inspect current state
state = agent.get_state(config)
print(state.values)  # The current state dict
print(state.next)    # Tuple of next nodes to execute (empty if done)
\`\`\`

---

### Walking Through History

\`\`\`python
# Get all checkpoints for this thread
for checkpoint in agent.get_state_history(config):
    print(f"Step: {checkpoint.metadata.get('step')}")
    print(f"Node: {checkpoint.metadata.get('source')}")
    print(f"Messages: {len(checkpoint.values.get('messages', []))}")
    print("---")
\`\`\`

---

### Time-Travel Replay

You can resume from any checkpoint in history, not just the latest:

\`\`\`python
# Get a specific historical checkpoint
history = list(agent.get_state_history(config))
old_checkpoint = history[3]  # Go back 3 steps

# Resume from that point
result = agent.invoke(None, old_checkpoint.config)
\`\`\`

---

### Monitoring Use Cases

- **Debugging** — "Why did the agent do that?" Walk through history to see state at each node
- **Auditing** — Compliance requirements often need full interaction logs—checkpoint history provides this
- **Analytics** — Track token usage, iteration counts, error rates by analyzing checkpoint metadata
- **Quality Assurance** — Review random samples of conversations by loading historical checkpoints`,
        analogy: "State inspection is like having a DVR for your agent. You can pause, rewind, and replay any moment. Unlike a simple log file that just records events, you can actually resume execution from any point—like loading a save file in a game.",
        gotchas: ["get_state_history returns checkpoints in reverse chronological order (newest first)", "Large histories can be slow to load—consider limiting with the 'limit' parameter", "Checkpoint metadata depends on your LangGraph version—check docs for available fields"]
      },
      {
        title: "Updating State Externally",
        description: `Sometimes you need to modify agent state from outside the graph—typically for human-in-the-loop workflows where a human provides input that the agent should incorporate.

---

### The update_state Method

\`\`\`python
# Agent is waiting for approval
config = {"configurable": {"thread_id": "approval-workflow"}}

# Human reviews and approves
agent.update_state(config, {
    "approved": True,
    "reviewer_notes": "Looks good, proceed with sending"
})

# Resume execution with the new state
result = agent.invoke(None, config)
\`\`\`

---

### How It Works

1. \`update_state\` creates a new checkpoint with your modifications merged in
2. The \`as_node\` parameter specifies which node "made" the update (affects next steps)
3. \`invoke(None, config)\` resumes from the latest checkpoint

---

### Common Patterns

**Approval Decisions**
\`\`\`python
agent.update_state(config, {"approved": True})
\`\`\`

**Human Feedback**
\`\`\`python
agent.update_state(config, {
    "human_feedback": "Please make the tone more formal",
    "needs_revision": True
})
\`\`\`

**External Data Injection**
\`\`\`python
agent.update_state(config, {
    "external_api_result": fetch_from_external_api()
})
\`\`\`

**Error Recovery**
\`\`\`python
agent.update_state(config, {
    "error_count": 0,  # Reset error counter
    "last_error": None  # Clear error
})
\`\`\`

---

### Specifying the Acting Node

\`\`\`python
# Update as if "human_review" node made the change
agent.update_state(
    config,
    {"approved": True},
    as_node="human_review"
)
\`\`\`

This affects which node executes next based on your graph's edges.`,
        analogy: "update_state is like a substitute player entering a game. The game (workflow) pauses, the substitute (human) makes their contribution, and the game resumes with the new player's input incorporated into the current state.",
        gotchas: ["Updates must match your state schema—extra fields or wrong types cause errors", "The 'as_node' parameter affects routing—use it correctly for complex graphs", "After update_state, you must call invoke(None, config) to resume execution"]
      },
      {
        title: "Human-in-the-Loop: Complete Pattern",
        description: `Combining checkpointing with conditional routing enables powerful human-in-the-loop workflows. Here's the complete pattern:

---

### Step 1: Design State for Interruption

\`\`\`python
class ApprovalState(TypedDict):
    messages: Annotated[list, add_messages]
    draft: str
    approval_status: Literal["pending", "approved", "rejected"] | None
    rejection_reason: str
\`\`\`

---

### Step 2: Create an Interrupt Point

Add a routing function that detects "waiting for human" state:

\`\`\`python
def route_after_draft(state) -> Literal["send", "revise", "wait"]:
    if state["approval_status"] is None:
        return "wait"  # Interrupt here
    elif state["approval_status"] == "approved":
        return "send"
    else:
        return "revise"
\`\`\`

---

### Step 3: Build the Graph

\`\`\`python
graph.add_node("generate", generate_draft)
graph.add_node("wait_for_approval", lambda s: s)  # No-op node
graph.add_node("send", send_message)
graph.add_node("revise", revise_draft)

graph.add_edge("generate", "wait_for_approval")
graph.add_conditional_edges("wait_for_approval", route_after_draft, {...})
\`\`\`

---

### Step 4: Run Until Interrupt

\`\`\`python
config = {"configurable": {"thread_id": "approval-123"}}
result = agent.invoke({"messages": [("human", "Draft an email")]}, config)

# Agent generates draft and stops at wait_for_approval
# state.next will be ("wait_for_approval",) indicating it's paused there
print(result["draft"])  # Show draft to human
\`\`\`

---

### Step 5: Collect Human Input

Your web app, Slack bot, or CLI collects the human's decision:

\`\`\`python
# Human reviewed and approved
agent.update_state(config, {"approval_status": "approved"})

# OR human rejected with feedback
agent.update_state(config, {
    "approval_status": "rejected",
    "rejection_reason": "Too informal, add more details"
})
\`\`\`

---

### Step 6: Resume Execution

\`\`\`python
result = agent.invoke(None, config)  # None means "continue from checkpoint"
# Graph routes based on approval_status and continues
\`\`\`

---

### The Power of This Pattern

- **Indefinite waits** — Agent can wait hours or days for human response
- **Crash resilience** — Server can restart—state is persisted
- **Revision loops** — Multiple approval rounds work automatically
- **Audit trail** — Full history via checkpoint storage`,
        analogy: "It's like a document approval workflow in a large company. The document moves through departments (nodes), but at certain points it stops and waits in someone's inbox (interrupt). When they act on it (update_state), the workflow resumes and routes based on their decision.",
        gotchas: ["Your app needs its own notification system to alert humans", "Set timeouts for cases where humans don't respond", "Test the 'wait' state thoroughly—bugs here cause workflows to hang forever"]
      },
      {
        title: "Memory Patterns: Short-Term vs Long-Term",
        description: `Checkpointing provides short-term memory within a conversation thread. But what about information that should persist across **all** conversations?

---

### Short-Term Memory (Built-in)

Checkpointing automatically handles within-conversation memory:

- Previous messages in the conversation
- State accumulated during the workflow
- Scoped to a single \`thread_id\`

---

### Long-Term Memory (You Build This)

For cross-conversation memory, you need additional infrastructure.

---

#### Pattern 1: User Profile Store

\`\`\`python
# Separate database for user profiles
def get_user_context(user_id: str) -> dict:
    return user_db.get(user_id)  # Returns preferences, history, etc.

def agent_with_profile(state):
    user_context = get_user_context(state["user_id"])
    # Include user context in LLM call
    response = llm.invoke([
        {"role": "system", "content": f"User context: {user_context}"},
        *state["messages"]
    ])
    return {"messages": [response]}
\`\`\`

---

#### Pattern 2: Semantic Memory via RAG

\`\`\`python
# Store important facts in a vector database
def remember_node(state):
    facts = extract_facts(state["messages"][-1])
    for fact in facts:
        vector_store.add(fact, metadata={"user_id": state["user_id"]})
    return {}

def recall_node(state):
    relevant = vector_store.search(
        state["current_query"],
        filter={"user_id": state["user_id"]}
    )
    return {"context": relevant}
\`\`\`

---

#### Pattern 3: Summary Compression

\`\`\`python
# When conversations get long, summarize and start fresh
def maybe_summarize(state):
    if len(state["messages"]) > 20:
        summary = llm.invoke(
            "Summarize this conversation: " + format_messages(state["messages"])
        )
        # Store summary in long-term memory
        save_to_long_term(state["user_id"], summary)
        # Start new thread with summary as context
        return {"messages": [("system", f"Previous context: {summary}")]}
    return {}
\`\`\`

---

### Combining Short and Long-Term

The most sophisticated agents use both:

- **Short-term** (Checkpointing) — Current conversation flow
- **Long-term** (External DB) — User preferences, past learnings, domain knowledge`,
        analogy: "Short-term memory is like RAM—fast, holds current work, lost when powered off. Long-term memory is like a hard drive—persistent, larger capacity, but slower to access. Good systems use both: RAM for immediate needs, disk for permanent storage.",
        gotchas: ["Long-term memory requires additional infrastructure (databases, vector stores)", "Be careful about what you store long-term—privacy and data retention laws apply", "Balance memory retrieval cost vs benefit—not every fact needs to be remembered"]
      },
      {
        title: "Production Considerations",
        description: `Running checkpointed agents in production requires attention to several concerns.

---

### State Size Management

Large states slow down checkpointing. Watch for:

- Message histories growing unboundedly
- Embedding vectors stored in state
- Large documents or images

**Solution: Trim History**

\`\`\`python
def trim_history(state):
    if len(state["messages"]) > 50:
        # Keep system message + last 40 messages
        trimmed = [state["messages"][0]] + state["messages"][-40:]
        return {"messages": trimmed}
    return {}
\`\`\`

---

### Checkpoint Cleanup

Old checkpoints accumulate. Implement cleanup policies:

\`\`\`python
# Application-level cleanup (pseudocode)
def cleanup_old_threads():
    for thread in get_all_threads():
        if thread.last_activity < (now - 30_days):
            delete_thread_checkpoints(thread.id)
\`\`\`

---

### Connection Pooling (PostgresSaver)

For high-throughput applications:

\`\`\`python
from sqlalchemy.pool import QueuePool

checkpointer = PostgresSaver.from_conn_string(
    "postgresql://...",
    pool_class=QueuePool,
    pool_size=10,
    max_overflow=20
)
\`\`\`

---

### Scaling Strategies

- **High read volume** → Read replicas for checkpoint queries
- **High write volume** → Write batching, async saves
- **Large states** → State compression, external storage for big objects
- **Many concurrent threads** → Connection pooling, partitioning

---

### Monitoring

Track these metrics:

- **Checkpoint save latency** — Impacts response time
- **State size distribution** — Identifies bloat
- **Thread count and growth** — Capacity planning
- **Checkpoint storage usage** — Cost and cleanup triggers
- **Error rates on save/load** — Reliability indicator`,
        analogy: "Production checkpointing is like running a library's loan system at scale. You need to track millions of checkouts (checkpoints), clean up overdue records, handle rush periods (high throughput), and ensure the system stays responsive even when very large books (states) are processed.",
        gotchas: ["Test with production-like state sizes—small test states hide performance issues", "Monitor checkpoint storage growth—it can surprise you", "Have a strategy for corrupted checkpoints—they can block entire threads"]
      }
    ],
    codeExamples: [
      {
        title: "Basic Checkpointing Setup",
        language: "python",
        category: "basic",
        code: `from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI

# State with messages
class ChatState(TypedDict):
    messages: Annotated[list, add_messages]

# Simple echo agent for demonstration
model = ChatOpenAI(model="gpt-4o-mini")

def chat_node(state: ChatState) -> dict:
    response = model.invoke(state["messages"])
    return {"messages": [response]}

# Build graph
graph = StateGraph(ChatState)
graph.add_node("chat", chat_node)
graph.add_edge(START, "chat")
graph.add_edge("chat", END)

# Compile WITH checkpointer
checkpointer = MemorySaver()
agent = graph.compile(checkpointer=checkpointer)

# Use thread_id to maintain conversation
config = {"configurable": {"thread_id": "my-conversation"}}

# First message
result1 = agent.invoke(
    {"messages": [("human", "Hi! My name is Alice.")]},
    config
)
print("Agent:", result1["messages"][-1].content)

# Second message - agent remembers!
result2 = agent.invoke(
    {"messages": [("human", "What's my name?")]},
    config
)
print("Agent:", result2["messages"][-1].content)
# Output: "Your name is Alice!"

# Different thread = fresh conversation
other_config = {"configurable": {"thread_id": "other-conversation"}}
result3 = agent.invoke(
    {"messages": [("human", "What's my name?")]},
    other_config
)
print("Agent:", result3["messages"][-1].content)
# Output: "I don't know your name yet. What is it?"`,
        explanation: "This shows the basic pattern: compile with a checkpointer, use thread_id in config, and the agent automatically maintains conversation history. Different thread_ids create isolated conversations."
      },
      {
        title: "Persistent SQLite Checkpointing",
        language: "python",
        category: "intermediate",
        code: `from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing import TypedDict, Annotated
from langchain_openai import ChatOpenAI

class ChatState(TypedDict):
    messages: Annotated[list, add_messages]
    user_name: str | None

model = ChatOpenAI(model="gpt-4o-mini")

def extract_name(state: ChatState) -> dict:
    """Try to extract user's name from messages."""
    if state.get("user_name"):
        return {}  # Already have it

    last_msg = state["messages"][-1].content.lower()
    if "my name is" in last_msg or "i'm" in last_msg or "i am" in last_msg:
        # Simple extraction (in production, use LLM)
        response = model.invoke([
            {"role": "system", "content": "Extract the person's name from this message. Return ONLY the name, nothing else. If no name found, return 'unknown'."},
            {"role": "user", "content": last_msg}
        ])
        name = response.content.strip()
        if name.lower() != "unknown":
            return {"user_name": name}
    return {}

def chat_node(state: ChatState) -> dict:
    system_msg = "You are a helpful assistant."
    if state.get("user_name"):
        system_msg += f" The user's name is {state['user_name']}."

    response = model.invoke([
        {"role": "system", "content": system_msg},
        *[{"role": m.type, "content": m.content} for m in state["messages"]]
    ])
    return {"messages": [response]}

# Build graph
graph = StateGraph(ChatState)
graph.add_node("extract", extract_name)
graph.add_node("chat", chat_node)
graph.add_edge(START, "extract")
graph.add_edge("extract", "chat")
graph.add_edge("chat", END)

# Use SQLite for persistence
checkpointer = SqliteSaver.from_conn_string("conversations.db")
agent = graph.compile(checkpointer=checkpointer)

# This conversation survives restarts!
config = {"configurable": {"thread_id": "persistent-user-123"}}

# Simulate first session
print("=== Session 1 ===")
result = agent.invoke(
    {"messages": [("human", "Hello! My name is Bob.")], "user_name": None},
    config
)
print(f"Agent: {result['messages'][-1].content}")
print(f"Stored name: {result.get('user_name')}")

# Simulate server restart by creating new agent instance
agent2 = graph.compile(checkpointer=SqliteSaver.from_conn_string("conversations.db"))

print("\\n=== Session 2 (after 'restart') ===")
result2 = agent2.invoke(
    {"messages": [("human", "Do you remember me?")]},
    config
)
print(f"Agent: {result2['messages'][-1].content}")
# Agent remembers Bob because state was persisted to SQLite!`,
        explanation: "SqliteSaver persists checkpoints to a database file. Even after restarting the Python process (simulated here by creating a new agent instance), the conversation state is restored. This is essential for production deployments."
      },
      {
        title: "State Inspection and Debugging",
        language: "python",
        category: "intermediate",
        code: `from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing import TypedDict, Annotated

class DebugState(TypedDict):
    messages: Annotated[list, add_messages]
    step_count: int
    last_action: str

def step_a(state: DebugState) -> dict:
    return {"step_count": state.get("step_count", 0) + 1, "last_action": "step_a"}

def step_b(state: DebugState) -> dict:
    return {"step_count": state["step_count"] + 1, "last_action": "step_b"}

def step_c(state: DebugState) -> dict:
    return {
        "step_count": state["step_count"] + 1,
        "last_action": "step_c",
        "messages": [("assistant", f"Completed {state['step_count'] + 1} steps")]
    }

# Build linear graph
graph = StateGraph(DebugState)
graph.add_node("a", step_a)
graph.add_node("b", step_b)
graph.add_node("c", step_c)
graph.add_edge(START, "a")
graph.add_edge("a", "b")
graph.add_edge("b", "c")
graph.add_edge("c", END)

checkpointer = MemorySaver()
agent = graph.compile(checkpointer=checkpointer)

# Run the agent
config = {"configurable": {"thread_id": "debug-session"}}
result = agent.invoke(
    {"messages": [("human", "Start")], "step_count": 0, "last_action": "init"},
    config
)

# Inspect current state
print("=== Current State ===")
current = agent.get_state(config)
print(f"Values: {current.values}")
print(f"Next nodes: {current.next}")
print(f"Created at: {current.created_at}")

# Walk through history
print("\\n=== Checkpoint History ===")
for i, checkpoint in enumerate(agent.get_state_history(config)):
    print(f"\\nCheckpoint {i}:")
    print(f"  Step count: {checkpoint.values.get('step_count', 'N/A')}")
    print(f"  Last action: {checkpoint.values.get('last_action', 'N/A')}")
    print(f"  Source node: {checkpoint.metadata.get('source', 'N/A')}")

# Time-travel: resume from an earlier checkpoint
print("\\n=== Time Travel ===")
history = list(agent.get_state_history(config))
if len(history) > 2:
    old_checkpoint = history[2]  # Go back 2 steps
    print(f"Resuming from step_count={old_checkpoint.values.get('step_count')}")

    # Resume from that point (creates a new branch in history)
    result = agent.invoke(None, old_checkpoint.config)
    print(f"Result after resume: {result}")`,
        explanation: "get_state() shows current state, get_state_history() shows all checkpoints. You can 'time travel' by resuming from any historical checkpoint. This is invaluable for debugging—you can see exactly what the agent knew at each step."
      },
      {
        title: "Human-in-the-Loop Approval Workflow",
        language: "python",
        category: "advanced",
        code: `from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI

class ApprovalState(TypedDict):
    messages: Annotated[list, add_messages]
    draft_content: str
    approval_status: Literal["pending", "approved", "rejected"] | None
    rejection_feedback: str
    revision_count: int

model = ChatOpenAI(model="gpt-4o")

def generate_draft(state: ApprovalState) -> dict:
    """Generate content based on user request."""
    user_request = state["messages"][-1].content

    # Include rejection feedback if this is a revision
    revision_context = ""
    if state.get("rejection_feedback"):
        revision_context = f"\\n\\nPrevious draft was rejected with feedback: {state['rejection_feedback']}\\nPlease address this feedback."

    response = model.invoke([
        {"role": "system", "content": "Generate professional content based on the request." + revision_context},
        {"role": "user", "content": user_request}
    ])

    return {
        "draft_content": response.content,
        "approval_status": "pending",
        "rejection_feedback": "",
        "revision_count": state.get("revision_count", 0) + 1
    }

def route_approval(state: ApprovalState) -> Literal["approved", "rejected", "waiting"]:
    """Route based on approval status."""
    status = state.get("approval_status")
    if status == "approved":
        return "approved"
    elif status == "rejected":
        return "rejected"
    return "waiting"

def finalize(state: ApprovalState) -> dict:
    """Content was approved, finalize it."""
    return {
        "messages": [(
            "assistant",
            f"Content approved and finalized after {state['revision_count']} revision(s):\\n\\n{state['draft_content']}"
        )]
    }

def request_revision(state: ApprovalState) -> dict:
    """Content was rejected, prepare for revision."""
    return {
        "messages": [(
            "assistant",
            f"Revision requested. Feedback: {state['rejection_feedback']}\\nGenerating revision #{state['revision_count'] + 1}..."
        )]
    }

# Build the graph
graph = StateGraph(ApprovalState)
graph.add_node("generate", generate_draft)
graph.add_node("finalize", finalize)
graph.add_node("request_revision", request_revision)

graph.set_entry_point("generate")
graph.add_conditional_edges(
    "generate",
    route_approval,
    {
        "approved": "finalize",
        "rejected": "request_revision",
        "waiting": END  # Pause here and wait for human input
    }
)
graph.add_edge("finalize", END)
graph.add_edge("request_revision", "generate")  # Loop back for revision

checkpointer = MemorySaver()
agent = graph.compile(checkpointer=checkpointer)

# === Simulation of the workflow ===

config = {"configurable": {"thread_id": "content-approval-001"}}

# Step 1: User requests content
print("=== Step 1: Initial Request ===")
result = agent.invoke({
    "messages": [("human", "Write a product announcement for our new AI feature")],
    "draft_content": "",
    "approval_status": None,
    "rejection_feedback": "",
    "revision_count": 0
}, config)

print(f"Draft generated:\\n{result['draft_content'][:200]}...")
print(f"Status: {result['approval_status']}")
print("\\n[Workflow paused - waiting for human approval]\\n")

# Step 2: Human rejects with feedback
print("=== Step 2: Human Rejects ===")
agent.update_state(config, {
    "approval_status": "rejected",
    "rejection_feedback": "Too technical. Make it more exciting and accessible to non-technical users."
})

# Resume execution
result = agent.invoke(None, config)
print(f"Revised draft:\\n{result['draft_content'][:200]}...")
print(f"Revision count: {result['revision_count']}")
print("\\n[Workflow paused again - waiting for approval]\\n")

# Step 3: Human approves
print("=== Step 3: Human Approves ===")
agent.update_state(config, {"approval_status": "approved"})

# Resume and finalize
result = agent.invoke(None, config)
print("Final result:")
print(result["messages"][-1].content)`,
        explanation: "Complete human-in-the-loop workflow: generate draft, pause for approval, handle rejection with revision loop, finalize on approval. The agent can be paused indefinitely (in production with SqliteSaver) and resumes exactly where it stopped when the human provides input."
      },
      {
        title: "Multi-User Session Management",
        language: "python",
        category: "advanced",
        code: `from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
import hashlib

class SessionState(TypedDict):
    messages: Annotated[list, add_messages]
    user_id: str
    session_id: str
    preferences: dict

model = ChatOpenAI(model="gpt-4o-mini")

def load_preferences(state: SessionState) -> dict:
    """Load user preferences (simulated - would be from a database)."""
    # In production, fetch from user database
    user_prefs = {
        "user-alice": {"tone": "casual", "expertise": "beginner"},
        "user-bob": {"tone": "formal", "expertise": "expert"},
    }
    return {"preferences": user_prefs.get(state["user_id"], {"tone": "neutral", "expertise": "intermediate"})}

def chat_node(state: SessionState) -> dict:
    """Chat with user-specific preferences."""
    prefs = state.get("preferences", {})
    system_prompt = f"You are a helpful assistant. Communicate in a {prefs.get('tone', 'neutral')} tone, appropriate for someone with {prefs.get('expertise', 'intermediate')} expertise."

    response = model.invoke([
        {"role": "system", "content": system_prompt},
        *[{"role": m.type, "content": m.content} for m in state["messages"]]
    ])
    return {"messages": [response]}

# Build graph
graph = StateGraph(SessionState)
graph.add_node("load_prefs", load_preferences)
graph.add_node("chat", chat_node)
graph.add_edge(START, "load_prefs")
graph.add_edge("load_prefs", "chat")
graph.add_edge("chat", END)

checkpointer = MemorySaver()
agent = graph.compile(checkpointer=checkpointer)

# Helper to generate consistent thread IDs
def get_thread_id(user_id: str, session_id: str) -> str:
    """Generate a unique thread ID for user+session combination."""
    return f"{user_id}:{session_id}"

# === Simulate multiple users ===

# Alice's session
alice_config = {"configurable": {"thread_id": get_thread_id("user-alice", "session-1")}}
result = agent.invoke({
    "messages": [("human", "Explain what an API is")],
    "user_id": "user-alice",
    "session_id": "session-1",
    "preferences": {}
}, alice_config)
print("=== Alice (casual, beginner) ===")
print(result["messages"][-1].content[:200])

# Bob's session (concurrent)
bob_config = {"configurable": {"thread_id": get_thread_id("user-bob", "session-1")}}
result = agent.invoke({
    "messages": [("human", "Explain what an API is")],
    "user_id": "user-bob",
    "session_id": "session-1",
    "preferences": {}
}, bob_config)
print("\\n=== Bob (formal, expert) ===")
print(result["messages"][-1].content[:200])

# Alice continues her conversation
result = agent.invoke({
    "messages": [("human", "Can you give me an example?")]
}, alice_config)
print("\\n=== Alice continues ===")
print(result["messages"][-1].content[:200])

# Alice starts a NEW session (different thread)
alice_session2 = {"configurable": {"thread_id": get_thread_id("user-alice", "session-2")}}
result = agent.invoke({
    "messages": [("human", "What were we talking about?")],
    "user_id": "user-alice",
    "session_id": "session-2",
    "preferences": {}
}, alice_session2)
print("\\n=== Alice new session (no memory of session-1) ===")
print(result["messages"][-1].content[:200])`,
        explanation: "Demonstrates multi-user session management with unique thread IDs per user+session. Each user has isolated conversations. User preferences are loaded and applied. New sessions for the same user start fresh while existing sessions maintain continuity."
      }
    ],
    diagrams: [
      {
        title: "Checkpoint Architecture",
        type: "architecture",
        ascii: `
┌────────────────────────────────────────────────────────────────────┐
│                     CHECKPOINTING SYSTEM                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    invoke()     ┌─────────────────────────────┐   │
│  │   Client    │ ──────────────► │        LangGraph Agent       │   │
│  │ (thread_id) │                 │                              │   │
│  └─────────────┘                 │  ┌────────┐    ┌────────┐    │   │
│        │                         │  │ Node A │───►│ Node B │    │   │
│        │                         │  └────┬───┘    └────┬───┘    │   │
│        │                         │       │             │        │   │
│        │                         │       ▼ save        ▼ save   │   │
│        │                         │  ┌─────────────────────────┐ │   │
│        │                         │  │     CHECKPOINTER        │ │   │
│        │                         │  │  ┌─────────────────┐    │ │   │
│        │                         │  │  │  Save state     │    │ │   │
│        │                         │  │  │  after each     │    │ │   │
│        │                         │  │  │  node execution │    │ │   │
│        │                         │  │  └────────┬────────┘    │ │   │
│        │                         │  └───────────┼─────────────┘ │   │
│        │                         └──────────────┼───────────────┘   │
│        │                                        │                   │
│        │         ┌──────────────────────────────┘                   │
│        │         ▼                                                  │
│  ┌─────┴─────────────────────────────────────────────────────┐      │
│  │                    CHECKPOINT STORAGE                      │      │
│  │                                                            │      │
│  │  Thread: user-123       Thread: user-456                   │      │
│  │  ┌──────────────┐       ┌──────────────┐                   │      │
│  │  │ Checkpoint 1 │       │ Checkpoint 1 │                   │      │
│  │  │ - state: {}  │       │ - state: {}  │                   │      │
│  │  │ - next: [A]  │       │ - next: [A]  │                   │      │
│  │  ├──────────────┤       ├──────────────┤                   │      │
│  │  │ Checkpoint 2 │       │ Checkpoint 2 │                   │      │
│  │  │ - state: {}  │       │ - state: {}  │                   │      │
│  │  │ - next: [B]  │       │ - next: []   │                   │      │
│  │  └──────────────┘       └──────────────┘                   │      │
│  │                                                            │      │
│  │  Storage Options:                                          │      │
│  │  • MemorySaver  (dict in RAM)                              │      │
│  │  • SqliteSaver  (local file)                               │      │
│  │  • PostgresSaver (network database)                        │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘`,
        caption: "Checkpointing saves state after each node. Each thread_id gets isolated storage. Different backends offer different persistence guarantees."
      },
      {
        title: "Human-in-the-Loop Flow",
        type: "flow",
        ascii: `
┌──────────────────────────────────────────────────────────────────┐
│               HUMAN-IN-THE-LOOP WORKFLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│    ┌──────────┐                                                   │
│    │  START   │                                                   │
│    └────┬─────┘                                                   │
│         │                                                         │
│         ▼                                                         │
│    ┌──────────────┐                                               │
│    │   GENERATE   │  AI creates draft/proposal                    │
│    │   (AI Node)  │                                               │
│    └──────┬───────┘                                               │
│           │                                                       │
│           ▼                                                       │
│    ┌──────────────────────────────────────────────────────┐       │
│    │              CHECKPOINT SAVED                         │       │
│    │      approval_status = "pending"                      │       │
│    │      Workflow PAUSED - waiting for human              │       │
│    └──────────────────────────────────────────────────────┘       │
│                        ║                                          │
│    ════════════════════╬══════════════════════════════════        │
│         EXTERNAL       ║      Human reviews in web app,           │
│         WORLD          ║      email, Slack, etc.                  │
│    ════════════════════╬══════════════════════════════════        │
│                        ║                                          │
│                        ▼                                          │
│    ┌──────────────────────────────────────────────────────┐       │
│    │           update_state(config, {...})                 │       │
│    │                                                       │       │
│    │   Option A: {"approval_status": "approved"}           │       │
│    │   Option B: {"approval_status": "rejected",           │       │
│    │              "feedback": "needs more detail"}         │       │
│    └──────────────────────────────────────────────────────┘       │
│                        │                                          │
│                        ▼                                          │
│    ┌──────────────────────────────────────────────────────┐       │
│    │              invoke(None, config)                     │       │
│    │              Resume from checkpoint                   │       │
│    └──────────────────────────────────────────────────────┘       │
│                        │                                          │
│         ┌──────────────┴──────────────┐                           │
│         │                             │                           │
│    ┌────▼─────┐                 ┌─────▼────┐                      │
│    │ APPROVED │                 │ REJECTED │                      │
│    └────┬─────┘                 └─────┬────┘                      │
│         │                             │                           │
│         ▼                             ▼                           │
│    ┌──────────┐                 ┌──────────┐                      │
│    │ FINALIZE │                 │  REVISE  │──────┐               │
│    └────┬─────┘                 └──────────┘      │               │
│         │                                         │               │
│         │                              ┌──────────┘               │
│         ▼                              ▼                          │
│    ┌──────────┐                 ┌──────────────┐                  │
│    │   END    │                 │   GENERATE   │ (loop back)      │
│    └──────────┘                 └──────────────┘                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘`,
        caption: "Human-in-the-loop: Agent pauses at checkpoint, external system notifies human, human updates state via API, agent resumes and routes based on decision."
      },
      {
        title: "Thread Isolation",
        type: "architecture",
        ascii: `
┌──────────────────────────────────────────────────────────────────┐
│                    THREAD ISOLATION                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   User A                           User B                         │
│   ┌───────────────────────┐       ┌───────────────────────┐      │
│   │ "I need help with X"  │       │ "My account is locked" │      │
│   └───────────┬───────────┘       └───────────┬───────────┘      │
│               │                               │                   │
│               ▼                               ▼                   │
│   thread_id: "user-A-001"        thread_id: "user-B-001"         │
│               │                               │                   │
│               ▼                               ▼                   │
│   ┌───────────────────────────────────────────────────────┐      │
│   │                    LANGGRAPH AGENT                     │      │
│   │                   (Same code/graph)                    │      │
│   └───────────────────────┬───────────────────────────────┘      │
│                           │                                       │
│       ┌───────────────────┼───────────────────┐                  │
│       │                   │                   │                  │
│       ▼                   │                   ▼                  │
│   ┌────────────────┐      │      ┌────────────────┐              │
│   │ Thread: A-001  │      │      │ Thread: B-001  │              │
│   ├────────────────┤      │      ├────────────────┤              │
│   │ messages:      │      │      │ messages:      │              │
│   │  - "help X"    │  ISOLATED   │  - "locked"    │              │
│   │  - "Sure..."   │◄────┼─────► │  - "Let me..." │              │
│   │ user_context:  │     │       │ user_context:  │              │
│   │  - account_A   │   NO DATA   │  - account_B   │              │
│   │ iteration: 3   │   SHARING   │ iteration: 1   │              │
│   └────────────────┘      │      └────────────────┘              │
│                           │                                       │
│                           │                                       │
│   User A continues:       │      User B continues:                │
│   "What about Y?"         │      "Can you reset it?"              │
│           │               │               │                       │
│           ▼               │               ▼                       │
│   Uses thread A-001       │      Uses thread B-001                │
│   (has full context)      │      (has full context)               │
│                           │                                       │
│                           │                                       │
│   GUARANTEE: User A cannot see User B's data                      │
│              User B cannot see User A's data                      │
│              Each thread is completely independent                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘`,
        caption: "Thread IDs provide complete isolation. The same agent code serves multiple users, but each user's state is stored separately and cannot leak to other threads."
      }
    ],
    keyTakeaways: [
      "Checkpointing saves agent state after each node, enabling conversation memory and crash recovery",
      "Use MemorySaver for development, SqliteSaver for single-server production, PostgresSaver for distributed systems",
      "Thread IDs isolate conversations—each thread_id gets independent state storage",
      "Use get_state() to inspect current state and get_state_history() to walk through checkpoint history",
      "update_state() lets external systems modify agent state for human-in-the-loop workflows",
      "After update_state(), call invoke(None, config) to resume execution from the modified state",
      "Design state schemas with checkpointing in mind—all fields must be JSON-serializable",
      "Implement cleanup policies for old checkpoints to prevent unbounded storage growth",
      "Short-term memory (checkpointing) handles within-conversation context; long-term memory requires additional infrastructure",
      "Test with realistic state sizes—large states impact checkpointing performance"
    ],
    resources: [
      {
        title: "LangGraph Persistence Documentation",
        url: "https://langchain-ai.github.io/langgraph/concepts/persistence/",
        type: "docs",
        description: "Official guide to checkpointing, threads, and state persistence",
        summaryPath: "data/day-8/summary-persistence-concepts.md"
      },
      {
        title: "How to Add Thread-Level Persistence",
        url: "https://langchain-ai.github.io/langgraph/how-tos/persistence/",
        type: "tutorial",
        description: "Step-by-step guide to adding checkpointing to your graphs"
      },
      {
        title: "Human-in-the-Loop Patterns",
        url: "https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/",
        type: "tutorial",
        description: "Implementing approval workflows and human intervention"
      },
      {
        title: "Memory in LangGraph",
        url: "https://langchain-ai.github.io/langgraph/concepts/memory/",
        type: "docs",
        description: "Conceptual guide to short-term and long-term memory strategies",
        summaryPath: "data/day-8/summary-memory-concepts.md"
      },
      {
        title: "LangGraph Checkpointers Reference",
        url: "https://langchain-ai.github.io/langgraph/reference/checkpoints/",
        type: "docs",
        description: "API reference for all checkpointer implementations"
      },
      {
        title: "Building Long-Term Memory for Agents",
        url: "https://blog.langchain.dev/long-term-memory-for-agents/",
        type: "article",
        description: "LangChain blog post on advanced memory architectures"
      }
    ],
    localResources: [
      {
        id: "persistence-concepts",
        title: "Persistence Concepts Summary",
        description: "Core concepts of checkpointing, threads, and state management",
        filePath: "data/day-8/summary-persistence-concepts.md",
        type: "guide"
      },
      {
        id: "memory-concepts",
        title: "Memory Patterns Guide",
        description: "Short-term vs long-term memory strategies for agents",
        filePath: "data/day-8/summary-memory-concepts.md",
        type: "guide"
      },
      {
        id: "hitl-patterns",
        title: "Human-in-the-Loop Patterns",
        description: "Complete patterns for approval workflows and human intervention",
        filePath: "data/day-8/summary-hitl-patterns.md",
        type: "guide"
      }
    ],
    faq: [
      {
        question: "What's the difference between checkpointing and just saving messages to a database?",
        answer: "Checkpointing saves the complete agent state—not just messages, but all state fields, which node to execute next, and the full execution history. This enables features like resuming mid-workflow, time-travel debugging, and proper handling of complex state machines. Simply saving messages loses information about intermediate state, pending actions, and graph position."
      },
      {
        question: "How do I handle very long conversations that exceed context limits?",
        answer: "Several strategies: (1) Summarization—periodically compress older messages into a summary. (2) Sliding window—keep only the last N messages plus a summary of earlier ones. (3) Semantic selection—use embeddings to retrieve only relevant past messages. (4) Hierarchical memory—move old content to a separate retrieval system. Implement these as nodes in your graph that run before the main chat node."
      },
      {
        question: "Can I use checkpointing with async agents?",
        answer: "Yes. Use AsyncSqliteSaver or the async PostgresSaver interface. Call ainvoke() instead of invoke(), and use await with get_state() and update_state(). The async checkpointers use non-blocking I/O for better performance in concurrent applications."
      },
      {
        question: "How do I migrate from MemorySaver to SqliteSaver in production?",
        answer: "MemorySaver and SqliteSaver have compatible interfaces—just swap the checkpointer instance. However, existing MemorySaver conversations will be lost (they're in RAM). For zero-downtime migration: (1) Deploy new version with SqliteSaver, (2) New conversations use SqliteSaver, (3) Old in-memory conversations continue until completion, (4) Eventually all conversations are on SqliteSaver."
      },
      {
        question: "What happens if checkpointing fails (e.g., database is down)?",
        answer: "By default, checkpoint save failures raise exceptions and stop execution. This is usually what you want—better to fail fast than continue with unsaved state. For resilience, wrap your invoke() in try/except and implement retry logic. Some applications use a 'checkpoint on best effort' pattern where failures are logged but execution continues."
      },
      {
        question: "How do I clean up old checkpoints?",
        answer: "LangGraph doesn't auto-delete checkpoints. Implement cleanup based on your needs: (1) Time-based—delete threads inactive for N days. (2) Count-based—keep only last N checkpoints per thread. (3) Event-based—delete when conversation explicitly ends. Use direct database queries for SqliteSaver/PostgresSaver, or iterate and delete for MemorySaver."
      },
      {
        question: "Can multiple server instances share the same checkpointer?",
        answer: "With PostgresSaver, yes—multiple servers can read/write to the same database. Use connection pooling for performance. With SqliteSaver, only one process should write at a time (SQLite has write locking). MemorySaver is process-local and cannot be shared. For distributed deployments, PostgresSaver is the recommended choice."
      },
      {
        question: "How do I implement 'forget' functionality for GDPR compliance?",
        answer: "To delete a user's data: (1) Get all thread_ids for that user (requires your own mapping). (2) Delete all checkpoints for those threads from the checkpoint store. (3) Delete any long-term memory entries. (4) Log the deletion for compliance records. Consider implementing this as an API endpoint that triggers on user request."
      }
    ],
    applications: [
      {
        title: "Customer Support with Session Continuity",
        description: "Support agents that remember the entire conversation even if users close the browser, switch devices, or return days later. Checkpointing preserves context, and human escalation uses update_state for agent handoff."
      },
      {
        title: "Document Approval Workflows",
        description: "Generate documents, pause for review, incorporate feedback, repeat until approved. Checkpointing allows the workflow to wait indefinitely for human decisions while maintaining full state."
      },
      {
        title: "Multi-Step Data Processing",
        description: "Long-running data pipelines that process items, save progress, and can resume from any point after failures. Each batch checkpoint enables restart from the last successful batch."
      },
      {
        title: "Collaborative AI Assistants",
        description: "AI assistants that multiple team members can interact with, maintaining shared context. Thread IDs can represent projects or topics rather than individual users."
      },
      {
        title: "Conversational Commerce",
        description: "Shopping assistants that remember user preferences, cart state, and previous interactions across sessions. Combine checkpointing for session state with long-term user profile storage."
      },
      {
        title: "Compliance-Auditable AI Systems",
        description: "Financial or healthcare AI that requires full audit trails. Checkpoint history provides a complete record of every decision and state change for regulatory compliance."
      }
    ],
    relatedDays: [7, 9, 16]
  }
};
