# Memory Patterns for Production Agents

## Overview

Production agents need multiple layers of memory working together. This guide covers architectural patterns for combining different memory systems.

## Memory Layers Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Agent                             │
├─────────────────────────────────────────────────────┤
│  Working Memory    │ Current conversation context   │
│  (In-context)      │ Recent messages, current task  │
├─────────────────────────────────────────────────────┤
│  Short-Term Memory │ Session-level persistence      │
│  (Checkpoints)     │ Graph state, conversation ID   │
├─────────────────────────────────────────────────────┤
│  Long-Term Memory  │ Cross-session knowledge        │
│  (Vector Store)    │ User preferences, past facts   │
└─────────────────────────────────────────────────────┘
```

## Pattern 1: Checkpointing + Conversation Memory

Combine LangGraph checkpointing with message history management.

```python
from langgraph.graph import StateGraph, MessagesState
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

class EnhancedState(MessagesState):
    """Extended state with memory-aware fields."""
    summary: str = ""  # Rolling summary of older conversation
    user_facts: list[str] = []  # Extracted user information

def summarize_if_needed(state: EnhancedState) -> EnhancedState:
    """Summarize old messages to manage context length."""
    messages = state["messages"]

    if len(messages) > 20:
        # Summarize older messages
        old_messages = messages[:-10]
        recent_messages = messages[-10:]

        summary = summarize_messages(old_messages)

        return {
            "messages": recent_messages,
            "summary": summary
        }

    return state

def build_context(state: EnhancedState) -> str:
    """Build context including summary and facts."""
    parts = []

    if state.get("summary"):
        parts.append(f"Previous conversation summary: {state['summary']}")

    if state.get("user_facts"):
        parts.append(f"Known about user: {', '.join(state['user_facts'])}")

    return "\n".join(parts)
```

## Pattern 2: Layered Memory with Vector Store

Add vector store for long-term memory across sessions.

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from datetime import datetime

class AgentWithLongTermMemory:
    def __init__(self, user_id: str):
        self.user_id = user_id

        # Vector store for long-term memory
        self.memory_store = Chroma(
            collection_name=f"user_{user_id}_memory",
            embedding_function=OpenAIEmbeddings(),
            persist_directory="./memory_db"
        )

    def remember(self, fact: str, metadata: dict = None):
        """Store a fact in long-term memory."""
        self.memory_store.add_texts(
            texts=[fact],
            metadatas=[{
                "user_id": self.user_id,
                "timestamp": datetime.now().isoformat(),
                **(metadata or {})
            }]
        )

    def recall(self, query: str, k: int = 5) -> list[str]:
        """Retrieve relevant memories."""
        results = self.memory_store.similarity_search(
            query,
            k=k,
            filter={"user_id": self.user_id}
        )
        return [doc.page_content for doc in results]

    async def process_message(self, message: str, graph, config):
        """Process with memory augmentation."""
        # Recall relevant memories
        memories = self.recall(message)

        # Augment context
        if memories:
            context = f"Relevant memories:\n" + "\n".join(f"- {m}" for m in memories)
            augmented_input = {
                "messages": [
                    {"role": "system", "content": context},
                    {"role": "user", "content": message}
                ]
            }
        else:
            augmented_input = {"messages": [("user", message)]}

        # Process through graph
        result = await graph.ainvoke(augmented_input, config)

        # Extract and store new facts (if any)
        new_facts = extract_facts(message, result)
        for fact in new_facts:
            self.remember(fact)

        return result
```

## Pattern 3: Memory-Aware Agent State

Design state to explicitly manage different memory tiers.

```python
from typing import TypedDict, Annotated
from langgraph.graph import add_messages

class MemoryAwareState(TypedDict):
    # Working memory (current turn)
    messages: Annotated[list, add_messages]
    current_task: str

    # Short-term memory (this session)
    session_facts: list[str]
    conversation_summary: str

    # References to long-term memory
    recalled_memories: list[str]
    user_profile: dict

def memory_node(state: MemoryAwareState) -> MemoryAwareState:
    """Node that manages memory operations."""
    last_message = state["messages"][-1]

    # Recall from long-term memory based on message
    memories = long_term_store.recall(last_message.content)

    # Extract new facts from conversation
    new_facts = extract_facts_from_messages(state["messages"][-2:])

    return {
        "recalled_memories": memories,
        "session_facts": state["session_facts"] + new_facts
    }
```

## Pattern 4: Human-in-the-Loop with Memory

Combine checkpointing, memory, and human oversight.

```python
from langgraph.graph import StateGraph, MessagesState

def build_hitl_agent():
    builder = StateGraph(MessagesState)

    # Nodes
    builder.add_node("retrieve_memory", retrieve_memory_node)
    builder.add_node("agent", agent_node)
    builder.add_node("tools", tool_node)
    builder.add_node("store_memory", store_memory_node)

    # Flow
    builder.add_edge("__start__", "retrieve_memory")
    builder.add_edge("retrieve_memory", "agent")
    builder.add_conditional_edges(
        "agent",
        should_use_tools,
        {"tools": "tools", "respond": "store_memory"}
    )
    builder.add_edge("tools", "agent")
    builder.add_edge("store_memory", "__end__")

    # Human approval before certain tools
    graph = builder.compile(
        checkpointer=postgres_saver,
        interrupt_before=["tools"]  # Human reviews tool calls
    )

    return graph

async def run_with_approval(graph, user_input, config):
    """Run agent with human approval for tool use."""
    result = await graph.ainvoke(
        {"messages": [("user", user_input)]},
        config
    )

    # Check if interrupted for approval
    state = await graph.aget_state(config)

    if state.next == ("tools",):
        # Show pending action to user
        pending_action = state.values["messages"][-1]

        approved = await get_human_approval(pending_action)

        if approved:
            # Continue execution
            result = await graph.ainvoke(None, config)
        else:
            # Modify state to skip tool
            await graph.aupdate_state(
                config,
                {"messages": [("user", "Actually, don't do that. Just respond directly.")]},
                as_node="agent"
            )
            result = await graph.ainvoke(None, config)

    return result
```

## Pattern 5: Multi-User Memory Isolation

Ensure memory isolation between users.

```python
class MultiUserMemoryManager:
    def __init__(self, pool):
        self.pool = pool
        self.user_stores = {}

    def get_user_config(self, user_id: str, session_id: str) -> dict:
        """Generate config with proper thread isolation."""
        return {
            "configurable": {
                "thread_id": f"{user_id}:{session_id}",
                "user_id": user_id
            }
        }

    def get_user_memory_store(self, user_id: str):
        """Get or create user-specific vector store."""
        if user_id not in self.user_stores:
            self.user_stores[user_id] = Chroma(
                collection_name=f"user_{user_id}",
                embedding_function=OpenAIEmbeddings()
            )
        return self.user_stores[user_id]

    async def list_user_sessions(self, user_id: str) -> list[str]:
        """List all sessions for a user."""
        async with self.pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT DISTINCT thread_id
                    FROM checkpoints
                    WHERE thread_id LIKE %s
                    ORDER BY created_at DESC
                """, (f"{user_id}:%",))

                rows = await cur.fetchall()
                return [row[0].split(":")[1] for row in rows]
```

## When to Use Each Pattern

| Scenario | Recommended Pattern |
|----------|-------------------|
| Simple chatbot | Checkpointing only |
| Personalized assistant | Checkpointing + Vector store |
| Workflow with approvals | Human-in-the-loop |
| Multi-tenant SaaS | Multi-user isolation |
| Complex enterprise agent | All patterns combined |

## Best Practices

1. **Separate concerns** - Different memory types serve different purposes
2. **Define retention policies** - Not all memories need to persist forever
3. **Handle memory failures gracefully** - Agent should work even if memory is unavailable
4. **Test memory isolation** - Especially important in multi-user systems
5. **Monitor memory size** - Both checkpoints and vector stores grow over time
6. **Consider GDPR** - Users may request memory deletion

## References

- [LangGraph Persistence](https://langchain-ai.github.io/langgraph/concepts/persistence/)
- [LangChain Memory Types](https://python.langchain.com/docs/modules/memory/types/)
- [Building Agents with Memory](https://blog.langchain.dev/memory-for-agents/)
