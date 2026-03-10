# Memory Patterns for LangGraph Agents

> Comprehensive guide to short-term and long-term memory strategies for AI agents

## The Memory Challenge

Agents need to remember things, but "memory" means different things in different contexts:

| Memory Type | Duration | Scope | Example |
|-------------|----------|-------|---------|
| **Working Memory** | Current request | Single turn | "The user just asked about X" |
| **Short-Term Memory** | Current conversation | One thread | "Earlier we discussed Y" |
| **Long-Term Memory** | Across conversations | All time | "This user prefers Z" |
| **Semantic Memory** | Permanent | Domain knowledge | "Company policy states..." |

LangGraph's checkpointing handles working and short-term memory automatically. Long-term and semantic memory require additional infrastructure.

---

## Short-Term Memory (Built-in via Checkpointing)

### How It Works

When you enable checkpointing, LangGraph automatically:
1. Saves complete state after each node
2. Loads previous state when you invoke with same thread_id
3. Maintains full conversation history within that thread

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
agent = graph.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "conversation-123"}}

# First message
result1 = agent.invoke(
    {"messages": [("human", "Hi, I'm Alice and I love Python")]},
    config
)

# Second message - agent automatically has access to previous messages
result2 = agent.invoke(
    {"messages": [("human", "What's my name and favorite language?")]},
    config
)
# Agent knows: "You're Alice and you love Python"
```

### Characteristics

- **Scope**: Within a single thread_id
- **Duration**: As long as checkpoints exist
- **Automatic**: Just enable checkpointing
- **Data**: All state fields, including messages

### Limitations

- **Thread-Bound**: Can't access other conversations
- **Size Limits**: Very long conversations can exceed context windows
- **No Cross-User Knowledge**: Each thread is isolated

---

## Long-Term Memory (You Build This)

Long-term memory persists information across conversations and threads. This requires infrastructure beyond checkpointing.

### Pattern 1: User Profile Store

Store user preferences, history, and metadata in a dedicated database.

```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

# User profile database (could be Redis, PostgreSQL, MongoDB, etc.)
class UserProfile:
    def __init__(self, db_connection):
        self.db = db_connection

    def get(self, user_id: str) -> dict:
        """Retrieve user profile."""
        return self.db.get(f"user:{user_id}") or {
            "name": None,
            "preferences": {},
            "conversation_count": 0,
            "last_topics": [],
            "timezone": None
        }

    def update(self, user_id: str, updates: dict):
        """Update user profile."""
        profile = self.get(user_id)
        profile.update(updates)
        self.db.set(f"user:{user_id}", profile)

user_profiles = UserProfile(redis_connection)

# State includes user_id
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    user_id: str
    user_profile: dict

# Node that loads user context
def load_user_context(state: AgentState) -> dict:
    """Load user profile at start of conversation."""
    profile = user_profiles.get(state["user_id"])
    return {"user_profile": profile}

# Node that updates user profile based on conversation
def save_user_learnings(state: AgentState) -> dict:
    """Extract and save new information about user."""
    # Use LLM to extract facts from conversation
    extraction_prompt = """
    Based on this conversation, extract any new facts about the user.
    Return JSON with fields: name, preferences, interests, mentioned_topics.
    Only include fields where you learned something new.
    """

    messages = state["messages"]
    # ... LLM extraction logic ...

    if new_facts:
        user_profiles.update(state["user_id"], new_facts)

    return {}

# Use in system prompt
def chat_with_context(state: AgentState) -> dict:
    profile = state.get("user_profile", {})

    system_context = "You are a helpful assistant."
    if profile.get("name"):
        system_context += f" The user's name is {profile['name']}."
    if profile.get("preferences"):
        system_context += f" User preferences: {profile['preferences']}."
    if profile.get("last_topics"):
        system_context += f" Previous conversation topics: {profile['last_topics']}."

    response = llm.invoke([
        {"role": "system", "content": system_context},
        *state["messages"]
    ])

    return {"messages": [response]}
```

### Pattern 2: Semantic Memory with Vector Database

Store facts, knowledge, and conversation snippets in a vector database for semantic retrieval.

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# Initialize vector store
embeddings = OpenAIEmbeddings()
vector_store = Chroma(
    collection_name="agent_memory",
    embedding_function=embeddings,
    persist_directory="./memory_db"
)

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    user_id: str
    retrieved_context: list[str]

def remember_facts(state: AgentState) -> dict:
    """Extract and store facts from the conversation."""
    last_exchange = state["messages"][-2:]  # Last human + AI message

    # Use LLM to extract memorable facts
    extraction_response = llm.invoke([
        {"role": "system", "content": """
        Extract factual statements from this exchange that would be useful to remember.
        Return as a JSON list of strings. Only include concrete facts, not opinions.
        Example: ["User works at Acme Corp", "User prefers Python over JavaScript"]
        Return empty list [] if no facts worth remembering.
        """},
        {"role": "user", "content": str(last_exchange)}
    ])

    facts = json.loads(extraction_response.content)

    for fact in facts:
        vector_store.add_texts(
            texts=[fact],
            metadatas=[{
                "user_id": state["user_id"],
                "timestamp": datetime.now().isoformat(),
                "source": "conversation"
            }]
        )

    return {}

def recall_relevant_context(state: AgentState) -> dict:
    """Retrieve relevant memories for current query."""
    current_query = state["messages"][-1].content

    # Search for relevant memories for this user
    results = vector_store.similarity_search(
        current_query,
        k=5,
        filter={"user_id": state["user_id"]}
    )

    retrieved = [doc.page_content for doc in results]
    return {"retrieved_context": retrieved}

def chat_with_memory(state: AgentState) -> dict:
    """Chat using retrieved context."""
    context = state.get("retrieved_context", [])

    system_prompt = "You are a helpful assistant."
    if context:
        system_prompt += f"\n\nRelevant context from previous conversations:\n"
        for i, item in enumerate(context, 1):
            system_prompt += f"{i}. {item}\n"

    response = llm.invoke([
        {"role": "system", "content": system_prompt},
        *state["messages"]
    ])

    return {"messages": [response]}
```

### Pattern 3: Summary Compression for Long Conversations

When conversations get too long, compress older parts into summaries.

```python
def maybe_summarize_history(state: AgentState) -> dict:
    """Compress conversation history if it gets too long."""
    messages = state["messages"]

    # Check if we need to summarize
    if len(messages) < 30:
        return {}

    # Keep the most recent messages
    recent_messages = messages[-10:]
    old_messages = messages[:-10]

    # Generate summary of old messages
    summary_response = llm.invoke([
        {"role": "system", "content": """
        Summarize this conversation history in 2-3 paragraphs.
        Preserve:
        - Key facts about the user
        - Important decisions made
        - Any ongoing tasks or questions
        - Context needed for future reference
        """},
        {"role": "user", "content": format_messages(old_messages)}
    ])

    # Optionally save summary to long-term memory
    save_to_long_term_memory(
        user_id=state["user_id"],
        summary=summary_response.content,
        timestamp=datetime.now()
    )

    # Replace old messages with summary
    summary_message = SystemMessage(
        content=f"[Summary of earlier conversation]\n{summary_response.content}"
    )

    new_messages = [summary_message] + recent_messages
    return {"messages": new_messages}
```

### Pattern 4: Episodic Memory (Conversation Logs)

Store complete conversation logs for later analysis and retrieval.

```python
class EpisodicMemory:
    def __init__(self, db):
        self.db = db

    def save_conversation(self, user_id: str, thread_id: str,
                          messages: list, metadata: dict):
        """Save a complete conversation episode."""
        episode = {
            "user_id": user_id,
            "thread_id": thread_id,
            "messages": [
                {"role": m.type, "content": m.content}
                for m in messages
            ],
            "timestamp": datetime.now().isoformat(),
            "summary": self._generate_summary(messages),
            "topics": self._extract_topics(messages),
            **metadata
        }
        self.db.insert("episodes", episode)

    def search_episodes(self, user_id: str, query: str,
                        limit: int = 5) -> list:
        """Search past conversations by semantic similarity."""
        # Implementation depends on your DB
        pass

    def get_recent_episodes(self, user_id: str,
                            limit: int = 3) -> list:
        """Get most recent conversations."""
        return self.db.query(
            "episodes",
            filter={"user_id": user_id},
            sort={"timestamp": -1},
            limit=limit
        )

episodic_memory = EpisodicMemory(mongodb_connection)

# Save conversation when it ends
def on_conversation_end(state: AgentState):
    episodic_memory.save_conversation(
        user_id=state["user_id"],
        thread_id=state["thread_id"],
        messages=state["messages"],
        metadata={
            "sentiment": analyze_sentiment(state["messages"]),
            "resolution": was_resolved(state)
        }
    )
```

---

## Combining Memory Types

The most sophisticated agents use multiple memory systems together:

```
                         ┌─────────────────────────────────────┐
                         │        User Request Arrives         │
                         └──────────────────┬──────────────────┘
                                           │
                         ┌─────────────────▼──────────────────┐
                         │      Load User Profile             │
                         │      (Long-term: preferences)      │
                         └──────────────────┬──────────────────┘
                                           │
                         ┌─────────────────▼──────────────────┐
                         │   Retrieve Relevant Memories       │
                         │   (Semantic: vector search)        │
                         └──────────────────┬──────────────────┘
                                           │
                         ┌─────────────────▼──────────────────┐
                         │   Load Conversation History        │
                         │   (Short-term: checkpointing)      │
                         └──────────────────┬──────────────────┘
                                           │
                         ┌─────────────────▼──────────────────┐
                         │      Process with LLM              │
                         │   (Working: current context)       │
                         └──────────────────┬──────────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              ▼                            ▼                            ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│   Update User Profile   │  │   Store New Memories    │  │   Checkpoint State      │
│   (Long-term)           │  │   (Semantic)            │  │   (Short-term)          │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

### Complete Multi-Memory Agent Example

```python
class MemoryEnhancedState(TypedDict):
    messages: Annotated[list, add_messages]
    user_id: str
    user_profile: dict
    semantic_context: list[str]
    should_summarize: bool

def build_memory_enhanced_agent():
    graph = StateGraph(MemoryEnhancedState)

    # Memory loading nodes
    graph.add_node("load_profile", load_user_profile)
    graph.add_node("retrieve_memories", retrieve_semantic_memories)
    graph.add_node("check_history_length", check_if_summarization_needed)
    graph.add_node("summarize_if_needed", conditional_summarize)

    # Core processing
    graph.add_node("process", process_with_full_context)

    # Memory saving nodes
    graph.add_node("extract_facts", extract_and_save_facts)
    graph.add_node("update_profile", update_user_profile)

    # Flow
    graph.set_entry_point("load_profile")
    graph.add_edge("load_profile", "retrieve_memories")
    graph.add_edge("retrieve_memories", "check_history_length")
    graph.add_conditional_edges(
        "check_history_length",
        lambda s: "summarize" if s["should_summarize"] else "skip",
        {"summarize": "summarize_if_needed", "skip": "process"}
    )
    graph.add_edge("summarize_if_needed", "process")
    graph.add_edge("process", "extract_facts")
    graph.add_edge("extract_facts", "update_profile")
    graph.add_edge("update_profile", END)

    return graph.compile(checkpointer=PostgresSaver.from_conn_string(...))
```

---

## Handling Context Window Limits

LLMs have limited context windows. Strategies to handle this:

### 1. Sliding Window

Keep only the last N messages:

```python
def sliding_window(messages: list, max_messages: int = 20) -> list:
    if len(messages) <= max_messages:
        return messages

    # Always keep system messages
    system = [m for m in messages if m.type == "system"]
    other = [m for m in messages if m.type != "system"]

    return system + other[-max_messages:]
```

### 2. Token-Based Truncation

Truncate based on actual token count:

```python
import tiktoken

def truncate_by_tokens(messages: list, max_tokens: int = 4000) -> list:
    encoder = tiktoken.encoding_for_model("gpt-4")

    result = []
    current_tokens = 0

    # Process in reverse (keep recent messages)
    for msg in reversed(messages):
        msg_tokens = len(encoder.encode(msg.content))
        if current_tokens + msg_tokens > max_tokens:
            break
        result.insert(0, msg)
        current_tokens += msg_tokens

    return result
```

### 3. Importance-Based Selection

Use the LLM to identify important messages:

```python
def select_important_messages(messages: list, max_messages: int = 15) -> list:
    if len(messages) <= max_messages:
        return messages

    # Always keep first (context-setting) and last few messages
    first = messages[:2]
    last = messages[-5:]
    middle = messages[2:-5]

    # Score middle messages for importance
    importance_prompt = """
    Score each message 1-10 for importance to the ongoing conversation.
    Consider: key decisions, user preferences stated, important facts.
    Return JSON: [{"index": 0, "score": 7}, ...]
    """

    scores = llm.invoke([
        {"role": "system", "content": importance_prompt},
        {"role": "user", "content": str(middle)}
    ])

    # Select top messages by score
    scored = json.loads(scores.content)
    top_indices = sorted(scored, key=lambda x: x["score"], reverse=True)
    keep_count = max_messages - len(first) - len(last)
    selected_indices = sorted([s["index"] for s in top_indices[:keep_count]])

    return first + [middle[i] for i in selected_indices] + last
```

---

## Memory Architecture Decision Guide

```
START: What does your agent need to remember?

├── Only within a single conversation?
│   └── Use checkpointing alone (short-term memory)
│
├── User preferences that persist?
│   └── Add a user profile database
│       ├── Simple key-value → Redis
│       ├── Structured data → PostgreSQL
│       └── Flexible schema → MongoDB
│
├── Facts and knowledge to retrieve?
│   └── Add a vector database
│       ├── Local/simple → Chroma, FAISS
│       ├── Production → Pinecone, Weaviate, Qdrant
│       └── Self-hosted → Milvus, pgvector
│
├── Complete conversation history?
│   └── Add episodic memory storage
│       └── Document store with search (Elasticsearch, MongoDB)
│
└── All of the above?
    └── Build a multi-layer memory system
        └── Consider using LangChain's memory abstractions
            or building custom memory manager
```

---

## Privacy and Data Retention

Important considerations for production:

### GDPR/Privacy Compliance

```python
def forget_user(user_id: str):
    """Implement 'right to be forgotten'."""
    # Delete from all memory systems
    user_profiles.delete(user_id)
    vector_store.delete(filter={"user_id": user_id})
    episodic_memory.delete(filter={"user_id": user_id})
    # Delete checkpoints (requires custom implementation)
    delete_user_checkpoints(user_id)
    # Log the deletion
    audit_log.record("user_data_deleted", user_id=user_id)
```

### Data Retention Policies

```python
def apply_retention_policy():
    """Delete data older than retention period."""
    cutoff = datetime.now() - timedelta(days=RETENTION_DAYS)

    # Clear old vector memories
    vector_store.delete(filter={"timestamp": {"$lt": cutoff.isoformat()}})

    # Clear old episodes
    episodic_memory.delete(filter={"timestamp": {"$lt": cutoff.isoformat()}})

    # Clear old checkpoints
    cleanup_old_checkpoints(days_old=RETENTION_DAYS)
```

---

## Key Takeaways

1. **Short-term memory (checkpointing)** handles within-conversation context automatically
2. **Long-term memory** requires additional infrastructure you build and maintain
3. **User profiles** are ideal for preferences and metadata
4. **Vector stores** enable semantic retrieval of facts and knowledge
5. **Episodic memory** stores complete conversations for analysis
6. **Combine multiple memory types** for sophisticated agents
7. **Manage context limits** with summarization, truncation, or selection
8. **Always consider privacy** - implement data deletion and retention policies

## Resources

- [Memory in LangGraph](https://langchain-ai.github.io/langgraph/concepts/memory/)
- [LangChain Memory Guide](https://python.langchain.com/docs/modules/memory/)
- [Building Long-Term Memory for Agents](https://blog.langchain.dev/long-term-memory-for-agents/)
- [Vector Database Comparison](https://www.pinecone.io/learn/vector-database-comparison/)
- [GDPR and AI Systems](https://gdpr.eu/artificial-intelligence/)
