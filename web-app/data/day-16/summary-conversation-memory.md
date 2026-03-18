# LangChain Conversation Memory

## Overview

Conversation memory in LangChain manages message history for LLM interactions. While traditional memory classes are being deprecated in favor of `RunnableWithMessageHistory`, understanding these patterns is essential for working with existing code and grasping memory concepts.

## Memory Types Comparison

| Memory Type | Storage | Token Usage | Best For |
|-------------|---------|-------------|----------|
| ConversationBufferMemory | Full transcript | High (grows) | Short conversations |
| ConversationSummaryMemory | Summarized | Low (fixed) | Long conversations |
| ConversationBufferWindowMemory | Last k messages | Medium (fixed) | Recent context only |
| ConversationSummaryBufferMemory | Summary + recent | Medium (bounded) | Balance of both |
| ConversationTokenBufferMemory | Token-limited | Medium (fixed) | Precise token control |

## ConversationBufferMemory

Stores the complete conversation history. Simple but token-expensive.

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI

# Create memory
memory = ConversationBufferMemory(
    return_messages=True,  # Return as message objects vs string
    memory_key="history"   # Key in prompt template
)

# Use with chain
llm = ChatOpenAI(model="gpt-4o")
chain = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# Conversation persists
chain.run("My name is Alice")
chain.run("What's my name?")  # Remembers "Alice"
```

**Pros**: Complete context, no information loss
**Cons**: Token usage grows unbounded, expensive for long conversations

## ConversationSummaryMemory

Summarizes the conversation progressively to save tokens.

```python
from langchain.memory import ConversationSummaryMemory
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")

memory = ConversationSummaryMemory(
    llm=llm,  # LLM used to generate summaries
    return_messages=True
)

# Add interactions
memory.save_context(
    {"input": "Hi, I'm working on a Python project"},
    {"output": "Great! What kind of project?"}
)
memory.save_context(
    {"input": "It's a web scraper using BeautifulSoup"},
    {"output": "Nice choice! BeautifulSoup is excellent for parsing HTML."}
)

# Get summary
print(memory.load_memory_variables({}))
# Returns summarized context instead of full transcript
```

**Pros**: Fixed token usage, handles long conversations
**Cons**: Loses specific details, extra LLM calls for summarization

## ConversationBufferWindowMemory

Keeps only the last k conversation turns.

```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(
    k=5,  # Keep last 5 exchanges
    return_messages=True
)

# Only recent messages are retained
for i in range(10):
    memory.save_context(
        {"input": f"Message {i}"},
        {"output": f"Response {i}"}
    )

# Only messages 5-9 are in memory
print(memory.load_memory_variables({}))
```

**Pros**: Predictable token usage, simple
**Cons**: Loses older context entirely, might forget important early details

## ConversationSummaryBufferMemory

Hybrid approach: summarizes old messages, keeps recent ones verbatim.

```python
from langchain.memory import ConversationSummaryBufferMemory
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=300,  # When to start summarizing
    return_messages=True
)

# As conversation grows, older parts get summarized
# Recent messages stay as-is for accuracy
```

**Pros**: Best of both worlds, bounded tokens, recent accuracy
**Cons**: More complex, still uses LLM calls for summarization

## Modern Approach: RunnableWithMessageHistory

LangChain is moving toward `RunnableWithMessageHistory` for memory management:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Store for chat histories
store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

# Create chain
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])

llm = ChatOpenAI(model="gpt-4o")
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
response = with_history.invoke({"input": "Hi, I'm Bob"}, config=config)
response = with_history.invoke({"input": "What's my name?"}, config=config)
```

## Persistent Message Storage

For production, use persistent backends:

```python
from langchain_community.chat_message_histories import (
    SQLChatMessageHistory,
    RedisChatMessageHistory,
    PostgresChatMessageHistory
)

# SQLite
history = SQLChatMessageHistory(
    session_id="user-123",
    connection_string="sqlite:///chat_history.db"
)

# Redis
history = RedisChatMessageHistory(
    session_id="user-123",
    url="redis://localhost:6379"
)

# PostgreSQL
history = PostgresChatMessageHistory(
    session_id="user-123",
    connection_string="postgresql://user:pass@localhost/db"
)
```

## Memory vs Checkpointing

| Aspect | Conversation Memory | LangGraph Checkpointing |
|--------|-------------------|------------------------|
| Scope | Message history | Full graph state |
| Use case | Chat continuity | Agent state persistence |
| Granularity | Per conversation | Per graph step |
| Time travel | No | Yes |
| Human-in-loop | No | Yes |

**When to use each:**
- **Memory**: Simple chatbots, conversation context
- **Checkpointing**: Complex agents, multi-step workflows, approval flows

## Best Practices

1. **Choose memory type based on conversation length**
   - Short conversations: BufferMemory
   - Long conversations: SummaryBufferMemory or TokenBufferMemory

2. **Use RunnableWithMessageHistory for new projects**
   - More flexible and composable
   - Better integration with LCEL

3. **Persist for production**
   - In-memory is development only
   - Use Redis, PostgreSQL, or other persistent stores

4. **Consider token budgets**
   - Set max_token_limit to prevent context overflow
   - Monitor actual token usage

## References

- [LangChain Memory Documentation](https://python.langchain.com/docs/modules/memory/)
- [RunnableWithMessageHistory Guide](https://python.langchain.com/docs/expression_language/how_to/message_history)
- [Chat Message History Integrations](https://python.langchain.com/docs/integrations/memory/)
