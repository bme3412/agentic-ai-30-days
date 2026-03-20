# LangChain Caching - Summary

LangChain provides multiple caching strategies for LLM responses, from simple in-memory caching to sophisticated semantic caching with Redis.

## Cache Types

### InMemoryCache
```python
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache

set_llm_cache(InMemoryCache())
```
- Fastest option for development
- Lost on restart
- No similarity matching (exact keys only)

### SQLiteCache
```python
from langchain.cache import SQLiteCache
set_llm_cache(SQLiteCache(database_path=".langchain.db"))
```
- Persists to disk
- Good for single-machine deployments
- Exact-match only

### RedisCache
```python
from langchain.cache import RedisCache
set_llm_cache(RedisCache(redis_url="redis://localhost:6379"))
```
- Distributed caching
- TTL support
- Exact-match only

### RedisSemanticCache
```python
from langchain.cache import RedisSemanticCache
from langchain_openai import OpenAIEmbeddings

set_llm_cache(RedisSemanticCache(
    redis_url="redis://localhost:6379",
    embedding=OpenAIEmbeddings(),
    score_threshold=0.95  # Similarity threshold
))
```
- **Semantic similarity** matching
- Requires Redis Stack (with vector search)
- Returns cached responses for similar queries

## Key Parameters

| Parameter | Description | Recommended |
|-----------|-------------|-------------|
| `score_threshold` | Minimum similarity for cache hit | 0.92-0.97 |
| `ttl` | Cache entry expiration | App-dependent |

## Usage Patterns

### Global Caching
```python
set_llm_cache(cache)  # All LLM calls cached
```

### Per-Call Control
```python
response = llm.invoke("query", config={"cache": False})  # Bypass cache
```

### Clearing Cache
```python
cache.clear()  # Remove all entries
```

## Best Practices

1. Use `temperature=0` with caching for consistent results
2. Start with threshold 0.95, adjust based on hit rate and accuracy
3. Monitor cache hit rates to validate value
4. Consider TTL for time-sensitive queries

## Integration Notes

- Cache keys include full LLM configuration (model, temperature, etc.)
- Different models get separate cache spaces automatically
- Works with ChatOpenAI, Anthropic, and other LLM providers
