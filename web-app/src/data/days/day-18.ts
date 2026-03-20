import type { Day } from '../../types';

export const day18: Day = {
  day: 18,
  phase: 3,
  title: "Semantic Caching for Agents",
  partner: "Redis",
  tags: ["redis", "caching", "performance", "embeddings", "cost-optimization"],
  concept: "Caching similar queries to reduce latency and costs using vector similarity",
  demoUrl: "demos/day-18/",
  demoDescription: "Explore semantic caching in action: compare exact vs semantic cache hits, visualize embedding similarity, test cache invalidation strategies, and measure cost savings.",

  lesson: {
    overview: `Traditional caching requires exact key matches—if you ask "What is the capital of France?" and later ask "What's France's capital?", a regular cache misses entirely. Semantic caching changes this by using embeddings to find similar past queries, returning cached responses for questions that are semantically equivalent, even if worded differently.

**The economics are compelling**: LLM API calls cost money and take time. GPT-4 might cost $0.03 per query and take 2-3 seconds. If 30% of your queries are semantically similar to previous ones, semantic caching can cut costs and latency significantly. For high-volume applications, this translates to thousands of dollars saved monthly.

Redis is the ideal infrastructure for semantic caching. With Redis Stack's vector search capabilities, you can store embeddings alongside cached responses and query by similarity in milliseconds. LangChain provides seamless integration through its caching abstractions, making implementation straightforward.

**Why This Matters**: As agentic AI systems scale, efficient resource usage becomes critical. Semantic caching is one of the highest-ROI optimizations available—relatively simple to implement with immediate, measurable benefits to latency, cost, and user experience.`,

    principles: [
      {
        title: "Similarity Over Equality",
        description: "Semantic caching matches queries by meaning, not exact text. 'How tall is the Eiffel Tower?' and 'What is the height of the Eiffel Tower?' should return the same cached response. Embeddings capture this semantic equivalence, enabling fuzzy matching that exact-match caching cannot achieve."
      },
      {
        title: "Similarity Thresholds Matter",
        description: "Not all similar queries deserve the same answer. 'Best restaurants in Paris' and 'Best restaurants in Lyon' are similar but need different responses. Tuning the similarity threshold is crucial—too high misses valid cache hits, too low returns inappropriate cached responses."
      },
      {
        title: "Cache Invalidation Strategy",
        description: "Cached responses can become stale. Time-based TTL (time-to-live) works for stable knowledge, but dynamic data needs smarter invalidation. Consider versioning cached content, using tags for bulk invalidation, or implementing cache-aside patterns for frequently changing data."
      },
      {
        title: "Embedding Model Consistency",
        description: "The embedding model used for caching must match the one used for lookup. Mixing models (e.g., caching with OpenAI, looking up with Cohere) produces meaningless similarity scores. Treat the embedding model as part of your cache key schema."
      },
      {
        title: "Measure Before Optimizing",
        description: "Track cache hit rates, latency savings, and cost reduction. Not all applications benefit equally—low-volume, highly diverse queries might see few cache hits. Instrument your system to understand actual vs. theoretical benefits."
      }
    ],

    codeExample: {
      language: "python",
      title: "Redis Semantic Cache with LangChain",
      code: `from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.cache import RedisSemanticCache
from langchain.globals import set_llm_cache
import redis
import time

# Connect to Redis Stack (with vector search)
redis_client = redis.Redis(host="localhost", port=6379)

# Configure semantic cache
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
semantic_cache = RedisSemanticCache(
    redis_url="redis://localhost:6379",
    embedding=embeddings,
    score_threshold=0.95  # High similarity required
)

# Set as the global LLM cache
set_llm_cache(semantic_cache)

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# First query - cache miss, calls the API
start = time.time()
response1 = llm.invoke("What is the capital of France?")
time1 = time.time() - start
print(f"Query 1: {time1:.2f}s - {response1.content}")

# Semantically similar query - cache hit!
start = time.time()
response2 = llm.invoke("What's France's capital city?")
time2 = time.time() - start
print(f"Query 2: {time2:.2f}s - {response2.content}")

# Different query - cache miss
start = time.time()
response3 = llm.invoke("What is the capital of Germany?")
time3 = time.time() - start
print(f"Query 3: {time3:.2f}s - {response3.content}")

print(f"\\nSpeedup on cache hit: {time1/time2:.1f}x")`
    },

    diagram: {
      type: "mermaid",
      title: "Semantic Cache Flow",
      mermaid: `flowchart TB
    subgraph Query["Incoming Query"]
        Q["What's France's capital?"]
    end

    subgraph Embed["Embedding"]
        E["Generate query embedding"]
    end

    subgraph Cache["Redis Vector Cache"]
        VS["Vector similarity search"]
        HIT{"Similarity > threshold?"}
        CACHED["Return cached response"]
        MISS["Cache miss"]
    end

    subgraph LLM["LLM API"]
        API["Call OpenAI/Anthropic"]
        STORE["Store response + embedding"]
    end

    Q --> E
    E --> VS
    VS --> HIT
    HIT -->|Yes| CACHED
    HIT -->|No| MISS
    MISS --> API
    API --> STORE
    STORE --> Cache

    style CACHED fill:#c8e6c9
    style API fill:#ffcdd2`
    },

    keyTakeaways: [
      "Semantic caching uses embeddings to match similar queries, returning cached responses for semantically equivalent questions",
      "Redis Stack provides vector search capabilities for fast similarity lookups alongside traditional caching",
      "Similarity thresholds control the tradeoff between cache hit rate and response accuracy—tune carefully for your use case",
      "LangChain's RedisSemanticCache integrates seamlessly with any LLM, requiring minimal code changes",
      "Cache invalidation strategies (TTL, versioning, tags) prevent stale responses in dynamic environments",
      "Measure actual cache hit rates and cost savings—benefits vary significantly by application and query patterns"
    ],

    resources: [
      {
        title: "Redis Vector Similarity Search",
        url: "https://redis.io/docs/interact/search-and-query/search/vectors/",
        type: "docs",
        description: "Official Redis documentation on vector search capabilities for semantic similarity",
        summaryPath: "data/day-18/summary-redis-vectors.md"
      },
      {
        title: "LangChain Caching Documentation",
        url: "https://python.langchain.com/docs/how_to/llm_caching/",
        type: "docs",
        description: "LangChain guide to caching LLM responses including semantic caching options",
        summaryPath: "data/day-18/summary-langchain-caching.md"
      },
      {
        title: "GPTCache: Semantic Caching Library",
        url: "https://github.com/zilliztech/GPTCache",
        type: "github",
        description: "Open-source library specifically designed for LLM response caching with multiple backend options",
        summaryPath: "data/day-18/summary-gptcache.md"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Semantic caching uses vector embeddings to match similar queries, enabling cache hits for semantically equivalent questions and dramatically reducing LLM costs and latency.",
      fullDescription: `Every LLM API call costs money and time. A GPT-4 request might cost $0.03-0.06 and take 1-3 seconds. Multiply that by thousands of users asking similar questions, and costs escalate quickly. Traditional caching only helps when queries match exactly—but users rarely phrase questions identically.

**Semantic caching** solves this by comparing query *meaning* rather than text. When a user asks "What's the weather like in NYC?", the system generates an embedding vector and searches for similar past queries. If "How's the weather in New York City today?" was asked recently, the cached response is returned instantly.

The mathematics are straightforward: embedding vectors capture semantic meaning in high-dimensional space. Similar questions have vectors that are close together (high cosine similarity). By setting a similarity threshold, you control how "similar" queries must be to share a cached response.

\`\`\`
Query 1: "What is machine learning?"     → embedding_1 = [0.23, -0.45, 0.12, ...]
Query 2: "Explain machine learning"       → embedding_2 = [0.22, -0.44, 0.13, ...]
Query 3: "What is deep learning?"         → embedding_3 = [0.18, -0.38, 0.25, ...]

similarity(1, 2) = 0.98  →  Cache hit! (semantically equivalent)
similarity(1, 3) = 0.72  →  Cache miss (related but different)
\`\`\`

**Redis** is the preferred infrastructure for semantic caching because:
1. **Speed**: In-memory storage with sub-millisecond lookups
2. **Vector Search**: Redis Stack includes RediSearch with vector similarity
3. **TTL Support**: Built-in expiration for cache invalidation
4. **Scalability**: Proven at massive scale with clustering support
5. **Ecosystem**: LangChain, LlamaIndex, and GPTCache all have Redis integrations

The ROI calculation is compelling. Consider an application handling 100,000 queries/day:
- Without caching: 100,000 × $0.03 = $3,000/day
- With 40% cache hit rate: 60,000 × $0.03 + embedding costs ≈ $1,850/day
- Savings: ~$35,000/month

This lesson covers the mechanics of semantic caching, Redis implementation details, LangChain integration, and production patterns for cache invalidation and monitoring.`,
      prerequisites: [
        "Day 14: Vector Databases for Agents (understanding embeddings and similarity search)",
        "Day 15: Building Agentic RAG Systems (retrieval patterns)",
        "Basic understanding of caching concepts (TTL, cache invalidation)",
        "Redis fundamentals helpful but not required"
      ],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "From Exact Matching to Semantic Similarity",
        description: `Traditional caching systems use exact key matching. You hash the query string, look up the hash in a key-value store, and return the cached value if found. This works well for deterministic operations but fails for natural language queries where the same question can be phrased countless ways.

Consider a customer support bot. Users might ask:
- "How do I reset my password?"
- "I forgot my password, how to reset?"
- "Password reset instructions please"
- "Can't log in, need to change password"

All four questions have the same answer, but traditional caching treats them as completely different queries. Each triggers a new LLM call, wasting money and time.

**Semantic caching** transforms this by using embeddings as the cache lookup mechanism. Instead of hashing the query text, you:
1. Generate an embedding vector for the incoming query
2. Search for similar vectors in the cache
3. If a vector exceeds the similarity threshold, return its cached response
4. Otherwise, call the LLM and cache the new response with its embedding

\`\`\`python
# Traditional exact-match caching
def exact_cache_lookup(query: str) -> str | None:
    key = hashlib.md5(query.encode()).hexdigest()
    return redis_client.get(key)

# Semantic caching
def semantic_cache_lookup(query: str, threshold: float = 0.95) -> str | None:
    embedding = embed_model.embed(query)
    results = redis_client.ft("cache_idx").search(
        Query(f"*=>[KNN 1 @embedding $vec AS score]")
        .return_fields("response", "score")
        .dialect(2),
        query_params={"vec": embedding.tobytes()}
    )
    if results.docs and float(results.docs[0].score) >= threshold:
        return results.docs[0].response
    return None
\`\`\`

The embedding generation adds ~50-100ms of latency, but this is far less than the 1-3 seconds for an LLM call. More importantly, embedding API costs are roughly 100x cheaper than completion costs. The economics strongly favor the embedding lookup.

One critical consideration: the embedding model becomes part of your cache schema. If you embed with \`text-embedding-3-small\` but later switch to \`text-embedding-ada-002\`, all cached embeddings become useless. Treat embedding model changes as cache-invalidating events.`,
        analogy: "Think of traditional caching like a library card catalog—you need the exact title to find a book. Semantic caching is like a librarian who understands what you're looking for: 'I need something about French history' returns relevant books even without knowing exact titles.",
        gotchas: [
          "Embedding model changes invalidate the entire cache—version your cache by model",
          "Similar queries don't always deserve the same answer ('weather in Paris' vs 'weather in London')",
          "Embedding latency (~50-100ms) is unavoidable even on cache hits",
          "Very short queries may have unstable embeddings—consider minimum query length filters"
        ]
      },
      {
        title: "Redis Vector Search Fundamentals",
        description: `Redis Stack extends Redis with vector search capabilities through the RediSearch module. This enables storing embeddings alongside cached data and querying by similarity—all with Redis's legendary speed.

**Setting Up Redis Stack**

Redis Stack includes RediSearch, RedisJSON, and other modules. The easiest way to run it locally is with Docker:

\`\`\`bash
# Run Redis Stack
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest

# Verify vector search is available
redis-cli MODULE LIST
# Should show: search, ReJSON, etc.
\`\`\`

**Creating a Vector Index**

Before storing embeddings, you need to create an index that tells Redis how to search them:

\`\`\`python
import redis
import numpy as np

r = redis.Redis(host='localhost', port=6379)

# Create the index for semantic cache
# VECTOR field with HNSW algorithm for fast approximate search
r.execute_command(
    'FT.CREATE', 'cache_idx',
    'ON', 'HASH',
    'PREFIX', '1', 'cache:',
    'SCHEMA',
    'query', 'TEXT',                          # Original query text
    'response', 'TEXT',                        # Cached LLM response
    'embedding', 'VECTOR', 'HNSW', '6',       # Vector field
        'TYPE', 'FLOAT32',
        'DIM', '1536',                         # OpenAI embedding dimension
        'DISTANCE_METRIC', 'COSINE'
)
\`\`\`

The HNSW (Hierarchical Navigable Small World) algorithm provides fast approximate nearest neighbor search. Key parameters:
- **DIM**: Must match your embedding model's output dimension
- **DISTANCE_METRIC**: COSINE for normalized embeddings (most common), L2 for Euclidean distance
- **M** and **EF_CONSTRUCTION** (optional): Tune search accuracy vs. speed

**Storing Cached Responses**

When caching a new query-response pair:

\`\`\`python
from openai import OpenAI
import struct

client = OpenAI()

def cache_response(query: str, response: str):
    # Generate embedding
    result = client.embeddings.create(
        input=query,
        model="text-embedding-3-small"
    )
    embedding = result.data[0].embedding

    # Convert to bytes for Redis
    embedding_bytes = struct.pack(f'{len(embedding)}f', *embedding)

    # Store in Redis with unique key
    cache_key = f"cache:{hash(query)}"
    r.hset(cache_key, mapping={
        'query': query,
        'response': response,
        'embedding': embedding_bytes,
        'timestamp': time.time()
    })

    # Optional: Set TTL for automatic expiration
    r.expire(cache_key, 86400)  # 24 hours
\`\`\`

**Querying by Similarity**

To find similar cached queries:

\`\`\`python
from redis.commands.search.query import Query

def find_similar(query: str, threshold: float = 0.95, k: int = 1):
    # Embed the query
    result = client.embeddings.create(
        input=query,
        model="text-embedding-3-small"
    )
    embedding = result.data[0].embedding
    embedding_bytes = struct.pack(f'{len(embedding)}f', *embedding)

    # KNN search
    q = Query(
        f"*=>[KNN {k} @embedding $vec AS similarity]"
    ).return_fields(
        "query", "response", "similarity"
    ).sort_by("similarity", asc=False).dialect(2)

    results = r.ft("cache_idx").search(
        q,
        query_params={"vec": embedding_bytes}
    )

    # Check threshold (similarity is 1 - cosine_distance)
    if results.docs:
        similarity = 1 - float(results.docs[0].similarity)
        if similarity >= threshold:
            return {
                "hit": True,
                "response": results.docs[0].response,
                "similarity": similarity,
                "original_query": results.docs[0].query
            }

    return {"hit": False}
\`\`\`

**Important**: Redis returns cosine *distance*, not similarity. Convert with \`similarity = 1 - distance\`.`,
        analogy: "Redis vector search is like a librarian with perfect recall who can instantly find books based on 'vibes'. You describe what you're looking for, and within milliseconds, they identify the closest matches from millions of books—not by title or author, but by conceptual similarity.",
        gotchas: [
          "Redis returns cosine distance, not similarity—convert with (1 - distance)",
          "Index DIM must exactly match your embedding model's output dimensions",
          "HNSW is approximate—very occasionally misses the true nearest neighbor (usually acceptable)",
          "Large embeddings (>2048 dims) increase memory usage and query time significantly",
          "Always use dialect(2) for vector queries—it's required for KNN syntax"
        ]
      },
      {
        title: "LangChain Semantic Cache Integration",
        description: `LangChain provides turnkey semantic caching through its caching abstractions. The \`RedisSemanticCache\` class handles embedding generation, similarity search, and cache storage automatically—you just configure it and enable caching globally.

**Basic Setup**

\`\`\`python
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.cache import RedisSemanticCache
from langchain.globals import set_llm_cache
import langchain

# Create embedding model for cache lookups
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# Configure semantic cache
cache = RedisSemanticCache(
    redis_url="redis://localhost:6379",
    embedding=embeddings,
    score_threshold=0.95  # Minimum similarity for cache hit
)

# Enable caching globally
set_llm_cache(cache)

# Now all LLM calls are automatically cached
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# First call - cache miss, hits the API
response1 = llm.invoke("Explain quantum computing")

# Similar query - cache hit!
response2 = llm.invoke("What is quantum computing?")
\`\`\`

The \`score_threshold\` parameter controls cache hit sensitivity:
- **0.99**: Very strict—only near-identical queries match
- **0.95**: Balanced—catches paraphrases, rejects different topics
- **0.90**: Lenient—higher hit rate but risk of inappropriate matches

**Per-Call Cache Control**

Sometimes you want to bypass caching for specific calls:

\`\`\`python
from langchain.callbacks import StdOutCallbackHandler

# Force cache bypass for this call
response = llm.invoke(
    "What's the current weather?",  # Time-sensitive query
    config={"cache": False}
)

# Or check cache status in callbacks
class CacheMonitor(StdOutCallbackHandler):
    def on_llm_start(self, serialized, prompts, **kwargs):
        print(f"Cache lookup for: {prompts[0][:50]}...")

    def on_llm_end(self, response, **kwargs):
        # Cache hit if response comes back instantly
        pass
\`\`\`

**Cache with Metadata**

For more sophisticated caching, add metadata to track cache performance:

\`\`\`python
from langchain_community.cache import RedisCache
from datetime import datetime
import json

class InstrumentedSemanticCache(RedisSemanticCache):
    """Semantic cache with hit/miss tracking."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.hits = 0
        self.misses = 0

    def lookup(self, prompt, llm_string):
        result = super().lookup(prompt, llm_string)
        if result:
            self.hits += 1
        else:
            self.misses += 1
        return result

    @property
    def hit_rate(self):
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0

    def stats(self):
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{self.hit_rate:.2%}"
        }
\`\`\`

**Clearing the Cache**

\`\`\`python
# Clear entire cache
cache.clear()

# Or selectively via Redis directly
import redis
r = redis.Redis.from_url("redis://localhost:6379")

# Delete all cache entries
for key in r.scan_iter("cache:*"):
    r.delete(key)

# Delete entries older than 1 hour
import time
for key in r.scan_iter("cache:*"):
    timestamp = r.hget(key, "timestamp")
    if timestamp and time.time() - float(timestamp) > 3600:
        r.delete(key)
\`\`\`

**Multi-Model Caching**

If you use multiple LLMs, each needs its own cache namespace:

\`\`\`python
# LangChain automatically includes llm_string in cache keys
# This means GPT-4 and GPT-3.5 caches are separate

gpt4 = ChatOpenAI(model="gpt-4o")
gpt35 = ChatOpenAI(model="gpt-3.5-turbo")

# These won't interfere with each other
gpt4.invoke("Explain AI")  # Cached under gpt-4o key
gpt35.invoke("Explain AI") # Cached under gpt-3.5-turbo key
\`\`\``,
        analogy: "LangChain's semantic cache is like a smart assistant who remembers not just exactly what you asked before, but understands when you're asking the same thing differently. They hand you the previous answer immediately instead of making you wait for a new response.",
        gotchas: [
          "temperature=0 is recommended for caching—non-deterministic outputs make cache hits less useful",
          "set_llm_cache affects all LLM calls globally—use per-call config to bypass",
          "Cache keys include the full LLM configuration, so model changes create new cache spaces",
          "RedisSemanticCache requires Redis Stack (not regular Redis) for vector search"
        ]
      },
      {
        title: "GPTCache: Specialized LLM Caching",
        description: `GPTCache is an open-source library specifically designed for LLM caching, offering more flexibility than LangChain's built-in options. It supports multiple embedding models, storage backends, and similarity evaluation strategies.

**Installation and Basic Setup**

\`\`\`bash
pip install gptcache
\`\`\`

\`\`\`python
from gptcache import cache
from gptcache.embedding import Onnx
from gptcache.similarity_evaluation import SearchDistanceEvaluation
from gptcache.manager import CacheBase, VectorBase, get_data_manager

# Initialize embedding function (local, no API costs)
onnx_embedding = Onnx()

# Configure cache storage
cache_base = CacheBase("sqlite")  # Metadata storage
vector_base = VectorBase(
    "faiss",                       # Vector index (or "redis", "milvus")
    dimension=onnx_embedding.dimension
)
data_manager = get_data_manager(cache_base, vector_base)

# Initialize cache
cache.init(
    embedding_func=onnx_embedding.to_embeddings,
    data_manager=data_manager,
    similarity_evaluation=SearchDistanceEvaluation()
)
\`\`\`

**Integration with OpenAI**

\`\`\`python
from gptcache.adapter import openai as cached_openai
import openai

# Use the cached adapter instead of raw openai
response = cached_openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What is machine learning?"}]
)
print(response.choices[0].message.content)

# Subsequent similar queries hit the cache
response2 = cached_openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain machine learning to me"}]
)
# Returns cached response instantly
\`\`\`

**Redis Backend for Production**

\`\`\`python
from gptcache.manager import get_data_manager, CacheBase, VectorBase

# Use Redis for both metadata and vectors
data_manager = get_data_manager(
    cache_base=CacheBase("redis", redis_config={
        "host": "localhost",
        "port": 6379
    }),
    vector_base=VectorBase("redis", redis_config={
        "host": "localhost",
        "port": 6379
    }, dimension=768)
)
\`\`\`

**Custom Similarity Evaluation**

GPTCache allows custom logic for determining cache hits:

\`\`\`python
from gptcache.similarity_evaluation import SimilarityEvaluation

class DomainAwareSimilarity(SimilarityEvaluation):
    """Custom similarity that considers domain context."""

    def __init__(self, threshold: float = 0.9):
        self.threshold = threshold

    def evaluation(self, src_dict, cache_dict, **kwargs):
        # src_dict: incoming query info
        # cache_dict: cached query info

        distance = cache_dict.get("distance", 1.0)
        similarity = 1 - distance

        # Domain-specific rules
        src_query = src_dict.get("question", "")
        cached_query = cache_dict.get("question", "")

        # Don't cache-hit if queries mention different entities
        if self._extract_entities(src_query) != self._extract_entities(cached_query):
            return 0.0

        return similarity if similarity >= self.threshold else 0.0

    def _extract_entities(self, text):
        # Simple entity extraction (use NER in production)
        import re
        return set(re.findall(r'\\b[A-Z][a-z]+\\b', text))

# Use custom evaluation
cache.init(
    embedding_func=onnx_embedding.to_embeddings,
    data_manager=data_manager,
    similarity_evaluation=DomainAwareSimilarity(threshold=0.92)
)
\`\`\`

**Pre-population and Warming**

For known common queries, pre-populate the cache:

\`\`\`python
common_qa_pairs = [
    ("How do I reset my password?", "To reset your password, visit..."),
    ("What are your business hours?", "We're open Monday-Friday, 9am-5pm..."),
    ("How do I contact support?", "You can reach support at..."),
]

for question, answer in common_qa_pairs:
    # Generate embedding and store
    embedding = onnx_embedding.to_embeddings(question)
    cache.data_manager.save(question, answer, embedding)
\`\`\`

**Metrics and Monitoring**

\`\`\`python
# GPTCache tracks statistics
from gptcache import cache

# After running some queries
print(f"Cache hits: {cache.report.hint_cache_count}")
print(f"Cache misses: {cache.report.miss_cache_count}")
print(f"Hit rate: {cache.report.hint_cache_count / (cache.report.hint_cache_count + cache.report.miss_cache_count):.2%}")

# Reset stats
cache.report.reset()
\`\`\``,
        analogy: "GPTCache is like a specialized filing system designed specifically for storing and retrieving answers. Unlike a general-purpose filing cabinet, it understands that 'Q1 financials' and 'First quarter financial report' should go to the same folder, and it can use different organization strategies depending on your needs.",
        gotchas: [
          "GPTCache's ONNX embedding is local (no API cost) but may be less accurate than OpenAI embeddings",
          "The cached OpenAI adapter requires specific import: from gptcache.adapter import openai",
          "FAISS vector store is in-memory by default—use Redis or Milvus for persistence",
          "Pre-warming cache helps cold-start performance but requires known query patterns"
        ]
      },
      {
        title: "Cache Invalidation Strategies",
        description: `Cache invalidation is famously one of the hardest problems in computer science. For semantic caches, the challenge is compounded: when does a cached answer become stale, and how do you invalidate semantically-related entries?

**Time-Based Invalidation (TTL)**

The simplest strategy is time-to-live expiration:

\`\`\`python
import redis
import time

r = redis.Redis()

def cache_with_ttl(query: str, response: str, embedding: bytes, ttl_seconds: int = 3600):
    cache_key = f"cache:{hash(query)}"
    r.hset(cache_key, mapping={
        'query': query,
        'response': response,
        'embedding': embedding,
        'cached_at': time.time()
    })
    r.expire(cache_key, ttl_seconds)

# Different TTLs for different query types
TTL_CONFIG = {
    "factual": 86400 * 7,    # 1 week for facts ("What is Python?")
    "temporal": 3600,         # 1 hour for time-sensitive ("today's weather")
    "dynamic": 300,           # 5 min for rapidly changing data
}

def get_ttl_for_query(query: str) -> int:
    if any(word in query.lower() for word in ["today", "now", "current", "latest"]):
        return TTL_CONFIG["temporal"]
    elif any(word in query.lower() for word in ["price", "stock", "score"]):
        return TTL_CONFIG["dynamic"]
    return TTL_CONFIG["factual"]
\`\`\`

**Version-Based Invalidation**

When your knowledge base updates, increment a version to invalidate old caches:

\`\`\`python
class VersionedCache:
    def __init__(self, redis_client):
        self.r = redis_client
        self.version_key = "cache:version"

    @property
    def current_version(self):
        v = self.r.get(self.version_key)
        return int(v) if v else 1

    def invalidate_all(self):
        """Bump version to invalidate all cached entries."""
        self.r.incr(self.version_key)

    def cache_key(self, query_hash: str) -> str:
        return f"cache:v{self.current_version}:{query_hash}"

    def lookup(self, query: str):
        key = self.cache_key(hash(query))
        return self.r.hgetall(key)

    def store(self, query: str, response: str, embedding: bytes):
        key = self.cache_key(hash(query))
        self.r.hset(key, mapping={
            'query': query,
            'response': response,
            'embedding': embedding
        })
        # Old version entries will expire naturally or be cleaned up
\`\`\`

**Tag-Based Invalidation**

For granular control, tag cache entries and invalidate by tag:

\`\`\`python
class TaggedCache:
    def __init__(self, redis_client):
        self.r = redis_client

    def store(self, query: str, response: str, embedding: bytes, tags: list[str]):
        cache_key = f"cache:{hash(query)}"

        # Store the entry
        self.r.hset(cache_key, mapping={
            'query': query,
            'response': response,
            'embedding': embedding,
            'tags': ','.join(tags)
        })

        # Add to tag sets for reverse lookup
        for tag in tags:
            self.r.sadd(f"tag:{tag}", cache_key)

    def invalidate_by_tag(self, tag: str):
        """Delete all cache entries with a specific tag."""
        tag_key = f"tag:{tag}"
        cache_keys = self.r.smembers(tag_key)

        if cache_keys:
            # Delete cache entries
            self.r.delete(*cache_keys)
            # Clear the tag set
            self.r.delete(tag_key)

        return len(cache_keys)

# Usage
cache = TaggedCache(r)

# Cache a product-related response
cache.store(
    "What's the price of iPhone 15?",
    "The iPhone 15 starts at $799...",
    embedding_bytes,
    tags=["products", "iphone", "pricing"]
)

# When prices update, invalidate relevant caches
cache.invalidate_by_tag("pricing")
\`\`\`

**Event-Driven Invalidation**

For real-time systems, invalidate based on events:

\`\`\`python
import redis.asyncio as redis
import asyncio

class EventDrivenCache:
    def __init__(self, redis_url: str):
        self.r = redis.from_url(redis_url)
        self.pubsub = self.r.pubsub()

    async def listen_for_invalidations(self):
        """Subscribe to invalidation events."""
        await self.pubsub.subscribe("cache:invalidate")

        async for message in self.pubsub.listen():
            if message["type"] == "message":
                data = message["data"].decode()
                await self._handle_invalidation(data)

    async def _handle_invalidation(self, event_data: str):
        """Process invalidation event."""
        import json
        event = json.loads(event_data)

        if event["type"] == "full":
            await self._invalidate_all()
        elif event["type"] == "tag":
            await self._invalidate_by_tag(event["tag"])
        elif event["type"] == "pattern":
            await self._invalidate_by_pattern(event["pattern"])

    async def publish_invalidation(self, event_type: str, **kwargs):
        """Publish invalidation event."""
        import json
        event = {"type": event_type, **kwargs}
        await self.r.publish("cache:invalidate", json.dumps(event))

# In your data update pipeline
async def on_product_update(product_id: str):
    cache = EventDrivenCache("redis://localhost:6379")
    await cache.publish_invalidation("tag", tag=f"product:{product_id}")
\`\`\`

**Semantic Invalidation**

The most sophisticated approach: invalidate entries semantically similar to invalidation queries:

\`\`\`python
def invalidate_similar(self, invalidation_query: str, threshold: float = 0.9):
    """
    Invalidate cache entries semantically similar to the given query.
    Useful when you know certain topics are stale but don't have exact keys.
    """
    embedding = self.embed(invalidation_query)

    # Find similar cached queries
    similar = self.find_similar(embedding, k=100, threshold=threshold)

    deleted = 0
    for entry in similar:
        self.r.delete(entry["key"])
        deleted += 1

    return deleted

# Example: Company acquisition makes old data stale
invalidate_similar("What products does Acme Corp sell?")
invalidate_similar("Who is the CEO of Acme Corp?")
invalidate_similar("Acme Corp financials")
\`\`\``,
        analogy: "Cache invalidation is like managing a library's card catalog when books get new editions. TTL is like automatically removing cards older than a year. Tags are like marking cards with categories so you can update all 'Biology' entries at once. Version-based is like issuing a new catalog number when there's a major reorganization.",
        gotchas: [
          "TTL alone isn't enough for time-sensitive queries—combine with query classification",
          "Tag sets can grow large—periodically clean up orphaned tag references",
          "Event-driven invalidation requires reliable pub/sub—handle reconnection gracefully",
          "Semantic invalidation is expensive (embedding + search)—use for bulk invalidation only"
        ]
      },
      {
        title: "Production Monitoring and Optimization",
        description: `Semantic caching is only valuable if it actually improves your system. Production deployment requires comprehensive monitoring to validate assumptions and tune performance.

**Key Metrics to Track**

\`\`\`python
import time
from dataclasses import dataclass, field
from typing import Optional
import statistics

@dataclass
class CacheMetrics:
    hits: int = 0
    misses: int = 0
    hit_latencies: list = field(default_factory=list)
    miss_latencies: list = field(default_factory=list)
    similarity_scores: list = field(default_factory=list)
    embedding_latencies: list = field(default_factory=list)

    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0

    @property
    def avg_hit_latency(self) -> float:
        return statistics.mean(self.hit_latencies) if self.hit_latencies else 0.0

    @property
    def avg_miss_latency(self) -> float:
        return statistics.mean(self.miss_latencies) if self.miss_latencies else 0.0

    @property
    def latency_savings(self) -> float:
        """Estimated time saved by cache hits."""
        return self.hits * (self.avg_miss_latency - self.avg_hit_latency)

    @property
    def cost_savings(self, cost_per_call: float = 0.03) -> float:
        """Estimated cost saved by cache hits."""
        return self.hits * cost_per_call

    def to_dict(self) -> dict:
        return {
            "hit_rate": f"{self.hit_rate:.2%}",
            "total_hits": self.hits,
            "total_misses": self.misses,
            "avg_hit_latency_ms": f"{self.avg_hit_latency * 1000:.1f}",
            "avg_miss_latency_ms": f"{self.avg_miss_latency * 1000:.1f}",
            "avg_similarity": f"{statistics.mean(self.similarity_scores):.3f}" if self.similarity_scores else "N/A",
            "latency_saved_seconds": f"{self.latency_savings:.1f}",
        }
\`\`\`

**Instrumented Cache Wrapper**

\`\`\`python
class InstrumentedSemanticCache:
    def __init__(self, cache, embedder, llm):
        self.cache = cache
        self.embedder = embedder
        self.llm = llm
        self.metrics = CacheMetrics()

    def query(self, prompt: str) -> tuple[str, dict]:
        start = time.time()

        # Embedding latency
        embed_start = time.time()
        embedding = self.embedder.embed(prompt)
        self.metrics.embedding_latencies.append(time.time() - embed_start)

        # Cache lookup
        cache_result = self.cache.lookup(embedding)

        if cache_result["hit"]:
            self.metrics.hits += 1
            self.metrics.similarity_scores.append(cache_result["similarity"])
            self.metrics.hit_latencies.append(time.time() - start)
            return cache_result["response"], {"source": "cache", "similarity": cache_result["similarity"]}

        # Cache miss - call LLM
        llm_start = time.time()
        response = self.llm.invoke(prompt)
        llm_latency = time.time() - llm_start

        # Store in cache
        self.cache.store(prompt, response, embedding)

        self.metrics.misses += 1
        self.metrics.miss_latencies.append(time.time() - start)

        return response, {"source": "llm", "llm_latency": llm_latency}

    def get_metrics(self) -> dict:
        return self.metrics.to_dict()
\`\`\`

**Prometheus/Grafana Integration**

\`\`\`python
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
cache_hits = Counter('semantic_cache_hits_total', 'Total cache hits')
cache_misses = Counter('semantic_cache_misses_total', 'Total cache misses')
cache_latency = Histogram(
    'semantic_cache_latency_seconds',
    'Cache lookup latency',
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5]
)
similarity_score = Histogram(
    'semantic_cache_similarity',
    'Similarity scores for cache hits',
    buckets=[0.8, 0.85, 0.9, 0.92, 0.95, 0.97, 0.99]
)
hit_rate = Gauge('semantic_cache_hit_rate', 'Current cache hit rate')

class PrometheusCache:
    def query(self, prompt: str):
        with cache_latency.time():
            result = self._lookup(prompt)

        if result["hit"]:
            cache_hits.inc()
            similarity_score.observe(result["similarity"])
        else:
            cache_misses.inc()

        # Update hit rate gauge
        total = cache_hits._value.get() + cache_misses._value.get()
        if total > 0:
            hit_rate.set(cache_hits._value.get() / total)

        return result
\`\`\`

**Similarity Threshold Tuning**

Finding the optimal threshold requires analysis:

\`\`\`python
def analyze_threshold(cache_data: list[dict], thresholds: list[float] = [0.85, 0.90, 0.92, 0.95, 0.97]):
    """
    Analyze cache performance at different similarity thresholds.
    cache_data: list of {"query": str, "similarity": float, "correct": bool}
    """
    results = []

    for threshold in thresholds:
        hits = [d for d in cache_data if d["similarity"] >= threshold]
        misses = [d for d in cache_data if d["similarity"] < threshold]

        hit_rate = len(hits) / len(cache_data) if cache_data else 0

        # False positive rate: cache hits that were incorrect
        false_positives = sum(1 for d in hits if not d["correct"])
        fp_rate = false_positives / len(hits) if hits else 0

        # Precision: what fraction of cache hits are correct
        precision = 1 - fp_rate

        results.append({
            "threshold": threshold,
            "hit_rate": f"{hit_rate:.2%}",
            "precision": f"{precision:.2%}",
            "false_positive_rate": f"{fp_rate:.2%}",
            "recommendation": "good" if precision > 0.95 and hit_rate > 0.2 else "adjust"
        })

    return results

# Run analysis on production data
# analysis = analyze_threshold(production_cache_logs)
# print(pd.DataFrame(analysis))
\`\`\`

**Cost-Benefit Analysis**

\`\`\`python
def calculate_roi(
    daily_queries: int,
    hit_rate: float,
    llm_cost_per_query: float = 0.03,
    embedding_cost_per_query: float = 0.0001,
    redis_monthly_cost: float = 100
):
    """Calculate monthly ROI of semantic caching."""

    monthly_queries = daily_queries * 30

    # Without caching
    baseline_cost = monthly_queries * llm_cost_per_query

    # With caching
    cache_hits = monthly_queries * hit_rate
    cache_misses = monthly_queries * (1 - hit_rate)

    # Costs: embedding for all queries + LLM for misses + Redis
    cached_cost = (
        monthly_queries * embedding_cost_per_query +  # Embed all queries
        cache_misses * llm_cost_per_query +           # LLM for misses
        redis_monthly_cost                              # Infrastructure
    )

    savings = baseline_cost - cached_cost
    roi_percent = (savings / cached_cost) * 100 if cached_cost > 0 else 0

    return {
        "baseline_monthly_cost": f"\${baseline_cost:,.2f}",
        "cached_monthly_cost": f"\${cached_cost:,.2f}",
        "monthly_savings": f"\${savings:,.2f}",
        "roi": f"{roi_percent:.1f}%",
        "break_even_hit_rate": f"{(redis_monthly_cost / baseline_cost):.2%}" if baseline_cost > 0 else "N/A"
    }

# Example
print(calculate_roi(daily_queries=10000, hit_rate=0.35))
# {'baseline_monthly_cost': '\$9,000.00',
#  'cached_monthly_cost': '\$5,960.00',
#  'monthly_savings': '\$3,040.00',
#  'roi': '51.0%',
#  'break_even_hit_rate': '1.11%'}
\`\`\``,
        analogy: "Monitoring a semantic cache is like tracking a store's inventory efficiency. You want to know not just how often items are in stock (hit rate), but also whether you're stocking the right items (precision), how fast you can fulfill requests (latency), and whether the whole system is saving money (ROI).",
        gotchas: [
          "High hit rate with low precision is worse than low hit rate—users get wrong answers",
          "Embedding costs are low but not zero—factor them into ROI calculations",
          "Latency improvements matter more for interactive applications than batch processing",
          "Cache warm-up after restarts can cause temporary hit rate drops"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Complete Redis Semantic Cache Implementation",
        language: "python",
        category: "basic",
        code: `from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.cache import RedisSemanticCache
from langchain.globals import set_llm_cache
import time

# Setup semantic cache with Redis
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
cache = RedisSemanticCache(
    redis_url="redis://localhost:6379",
    embedding=embeddings,
    score_threshold=0.95
)
set_llm_cache(cache)

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Test queries
queries = [
    "What is the capital of France?",
    "What's France's capital city?",       # Similar - should hit cache
    "Tell me the French capital",          # Similar - should hit cache
    "What is the capital of Germany?",     # Different - cache miss
]

for query in queries:
    start = time.time()
    response = llm.invoke(query)
    elapsed = time.time() - start

    hit_or_miss = "HIT" if elapsed < 0.5 else "MISS"
    print(f"[{hit_or_miss}] {elapsed:.2f}s - {query}")
    print(f"    Response: {response.content[:80]}...\\n")`,
        explanation: "Basic LangChain semantic cache setup. Similar queries like 'What is the capital of France?' and 'What's France's capital city?' return cached responses instantly, while different queries trigger new LLM calls."
      },
      {
        title: "Custom Redis Vector Cache",
        language: "python",
        category: "intermediate",
        code: `import redis
import numpy as np
from openai import OpenAI
import struct
import hashlib
import time

class RedisSemanticCache:
    def __init__(
        self,
        redis_url: str = "redis://localhost:6379",
        embedding_model: str = "text-embedding-3-small",
        similarity_threshold: float = 0.95,
        ttl_seconds: int = 86400
    ):
        self.r = redis.from_url(redis_url)
        self.client = OpenAI()
        self.model = embedding_model
        self.threshold = similarity_threshold
        self.ttl = ttl_seconds
        self.index_name = "semantic_cache"

        self._ensure_index()

    def _ensure_index(self):
        """Create vector index if it doesn't exist."""
        try:
            self.r.ft(self.index_name).info()
        except redis.ResponseError:
            self.r.execute_command(
                'FT.CREATE', self.index_name,
                'ON', 'HASH',
                'PREFIX', '1', 'cache:',
                'SCHEMA',
                'query', 'TEXT',
                'response', 'TEXT',
                'embedding', 'VECTOR', 'HNSW', '6',
                    'TYPE', 'FLOAT32',
                    'DIM', '1536',
                    'DISTANCE_METRIC', 'COSINE'
            )

    def _embed(self, text: str) -> list[float]:
        """Generate embedding for text."""
        result = self.client.embeddings.create(
            input=text,
            model=self.model
        )
        return result.data[0].embedding

    def _embedding_to_bytes(self, embedding: list[float]) -> bytes:
        return struct.pack(f'{len(embedding)}f', *embedding)

    def lookup(self, query: str) -> dict:
        """Look up similar queries in cache."""
        embedding = self._embed(query)
        embedding_bytes = self._embedding_to_bytes(embedding)

        # KNN search
        from redis.commands.search.query import Query
        q = Query(
            f"*=>[KNN 1 @embedding $vec AS distance]"
        ).return_fields("query", "response", "distance").dialect(2)

        results = self.r.ft(self.index_name).search(
            q,
            query_params={"vec": embedding_bytes}
        )

        if results.docs:
            distance = float(results.docs[0].distance)
            similarity = 1 - distance

            if similarity >= self.threshold:
                return {
                    "hit": True,
                    "response": results.docs[0].response,
                    "similarity": similarity,
                    "original_query": results.docs[0].query
                }

        return {"hit": False, "embedding": embedding}

    def store(self, query: str, response: str, embedding: list[float] = None):
        """Store query-response pair in cache."""
        if embedding is None:
            embedding = self._embed(query)

        key = f"cache:{hashlib.md5(query.encode()).hexdigest()}"
        embedding_bytes = self._embedding_to_bytes(embedding)

        self.r.hset(key, mapping={
            'query': query,
            'response': response,
            'embedding': embedding_bytes,
            'cached_at': time.time()
        })

        if self.ttl:
            self.r.expire(key, self.ttl)

    def clear(self):
        """Clear all cached entries."""
        for key in self.r.scan_iter("cache:*"):
            self.r.delete(key)


# Usage with LLM
cache = RedisSemanticCache(similarity_threshold=0.93)

def cached_llm_call(prompt: str) -> str:
    # Check cache first
    result = cache.lookup(prompt)

    if result["hit"]:
        print(f"Cache HIT (similarity: {result['similarity']:.3f})")
        return result["response"]

    # Cache miss - call LLM
    print("Cache MISS - calling LLM")
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    answer = response.choices[0].message.content

    # Store in cache (reuse embedding from lookup)
    cache.store(prompt, answer, result.get("embedding"))

    return answer`,
        explanation: "A custom Redis semantic cache implementation with full control over embedding, storage, and retrieval. This gives you more flexibility than LangChain's built-in cache for custom requirements."
      },
      {
        title: "GPTCache with Redis Backend",
        language: "python",
        category: "intermediate",
        code: `from gptcache import cache
from gptcache.embedding import OpenAI as OpenAIEmbedding
from gptcache.similarity_evaluation import SearchDistanceEvaluation
from gptcache.manager import CacheBase, VectorBase, get_data_manager
from gptcache.adapter import openai

# Use OpenAI embeddings
embedding_func = OpenAIEmbedding()

# Redis for both cache and vectors
data_manager = get_data_manager(
    cache_base=CacheBase(
        "redis",
        redis_config={"host": "localhost", "port": 6379, "db": 0}
    ),
    vector_base=VectorBase(
        "redis",
        dimension=embedding_func.dimension,
        redis_config={"host": "localhost", "port": 6379, "db": 1}
    )
)

# Configure similarity evaluation
similarity_eval = SearchDistanceEvaluation()

# Initialize cache
cache.init(
    embedding_func=embedding_func.to_embeddings,
    data_manager=data_manager,
    similarity_evaluation=similarity_eval
)

# Use cached OpenAI adapter
import os
os.environ["OPENAI_API_KEY"] = "your-key"

# These calls go through the cache
response1 = openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain how neural networks work"}]
)
print("Response 1:", response1.choices[0].message.content[:100])

# Similar query - should hit cache
response2 = openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "How do neural networks function?"}]
)
print("Response 2:", response2.choices[0].message.content[:100])

# Check cache stats
print(f"\\nCache Statistics:")
print(f"  Hits: {cache.report.hint_cache_count}")
print(f"  Misses: {cache.report.miss_cache_count}")`,
        explanation: "GPTCache provides a specialized caching layer that wraps the OpenAI client directly. It's particularly useful when you want features like automatic cache statistics and multiple backend options."
      },
      {
        title: "Production Cache with Monitoring",
        language: "python",
        category: "advanced",
        code: `import redis
import time
import json
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional
from openai import OpenAI

@dataclass
class CacheStats:
    hits: int = 0
    misses: int = 0
    total_latency_saved_ms: float = 0
    similarity_scores: list = field(default_factory=list)

    def record_hit(self, latency_ms: float, similarity: float):
        self.hits += 1
        self.similarity_scores.append(similarity)
        # Assume LLM call would take ~2000ms
        self.total_latency_saved_ms += (2000 - latency_ms)

    def record_miss(self):
        self.misses += 1

    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0

    def summary(self) -> dict:
        return {
            "hit_rate": f"{self.hit_rate:.2%}",
            "total_hits": self.hits,
            "total_misses": self.misses,
            "latency_saved_seconds": f"{self.total_latency_saved_ms / 1000:.1f}",
            "avg_similarity": f"{sum(self.similarity_scores)/len(self.similarity_scores):.3f}" if self.similarity_scores else "N/A",
            "estimated_cost_saved": f"\${self.hits * 0.03:.2f}"
        }


class ProductionSemanticCache:
    """Production-ready semantic cache with comprehensive monitoring."""

    def __init__(self, redis_url: str, threshold: float = 0.95):
        self.r = redis.from_url(redis_url)
        self.client = OpenAI()
        self.threshold = threshold
        self.stats = CacheStats()
        self._ensure_index()

    def _ensure_index(self):
        try:
            self.r.ft("prod_cache").info()
        except redis.ResponseError:
            self.r.execute_command(
                'FT.CREATE', 'prod_cache',
                'ON', 'HASH', 'PREFIX', '1', 'pcache:',
                'SCHEMA',
                'query', 'TEXT',
                'response', 'TEXT',
                'embedding', 'VECTOR', 'HNSW', '6',
                    'TYPE', 'FLOAT32', 'DIM', '1536', 'DISTANCE_METRIC', 'COSINE',
                'created_at', 'NUMERIC', 'SORTABLE',
                'hit_count', 'NUMERIC'
            )

    def query(self, prompt: str, bypass_cache: bool = False) -> dict:
        """Query with full instrumentation."""
        start_time = time.time()

        if bypass_cache:
            return self._call_llm(prompt, start_time)

        # Generate embedding
        embed_start = time.time()
        embedding = self._embed(prompt)
        embed_latency = (time.time() - embed_start) * 1000

        # Search cache
        result = self._search_cache(embedding)

        if result["hit"]:
            total_latency = (time.time() - start_time) * 1000
            self.stats.record_hit(total_latency, result["similarity"])

            # Increment hit count
            self._increment_hit_count(result["cache_key"])

            # Log for monitoring
            self._log_event("cache_hit", {
                "similarity": result["similarity"],
                "latency_ms": total_latency,
                "embed_latency_ms": embed_latency
            })

            return {
                "response": result["response"],
                "source": "cache",
                "similarity": result["similarity"],
                "latency_ms": total_latency
            }

        # Cache miss
        self.stats.record_miss()
        return self._call_llm(prompt, start_time, embedding)

    def _call_llm(self, prompt: str, start_time: float, embedding: list = None):
        """Call LLM and cache the response."""
        llm_start = time.time()

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        answer = response.choices[0].message.content

        llm_latency = (time.time() - llm_start) * 1000
        total_latency = (time.time() - start_time) * 1000

        # Cache the response
        if embedding is None:
            embedding = self._embed(prompt)
        self._store(prompt, answer, embedding)

        self._log_event("cache_miss", {
            "llm_latency_ms": llm_latency,
            "total_latency_ms": total_latency
        })

        return {
            "response": answer,
            "source": "llm",
            "latency_ms": total_latency
        }

    def _embed(self, text: str) -> list[float]:
        result = self.client.embeddings.create(
            input=text, model="text-embedding-3-small"
        )
        return result.data[0].embedding

    def _search_cache(self, embedding: list) -> dict:
        import struct
        from redis.commands.search.query import Query

        embedding_bytes = struct.pack(f'{len(embedding)}f', *embedding)

        q = Query(
            f"*=>[KNN 1 @embedding $vec AS distance]"
        ).return_fields("query", "response", "distance").dialect(2)

        results = self.r.ft("prod_cache").search(
            q, query_params={"vec": embedding_bytes}
        )

        if results.docs:
            distance = float(results.docs[0].distance)
            similarity = 1 - distance

            if similarity >= self.threshold:
                return {
                    "hit": True,
                    "response": results.docs[0].response,
                    "similarity": similarity,
                    "cache_key": results.docs[0].id
                }

        return {"hit": False}

    def _store(self, query: str, response: str, embedding: list):
        import struct
        import hashlib

        key = f"pcache:{hashlib.md5(query.encode()).hexdigest()}"
        embedding_bytes = struct.pack(f'{len(embedding)}f', *embedding)

        self.r.hset(key, mapping={
            'query': query,
            'response': response,
            'embedding': embedding_bytes,
            'created_at': time.time(),
            'hit_count': 0
        })
        self.r.expire(key, 86400 * 7)  # 7 day TTL

    def _increment_hit_count(self, cache_key: str):
        self.r.hincrby(cache_key, 'hit_count', 1)

    def _log_event(self, event_type: str, data: dict):
        """Log cache events for monitoring."""
        event = {
            "type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            **data
        }
        self.r.lpush("cache:events", json.dumps(event))
        self.r.ltrim("cache:events", 0, 9999)  # Keep last 10k events

    def get_stats(self) -> dict:
        return self.stats.summary()

    def get_hot_queries(self, limit: int = 10) -> list:
        """Get most frequently hit cached queries."""
        from redis.commands.search.query import Query

        q = Query("*").sort_by("hit_count", asc=False).paging(0, limit)
        results = self.r.ft("prod_cache").search(q)

        return [
            {"query": doc.query[:100], "hits": doc.hit_count}
            for doc in results.docs
        ]


# Usage
cache = ProductionSemanticCache("redis://localhost:6379", threshold=0.94)

# Run some queries
queries = [
    "What is Python?",
    "Explain Python programming",  # Should hit
    "What is JavaScript?",         # Different topic
    "Tell me about Python",        # Should hit
]

for q in queries:
    result = cache.query(q)
    print(f"[{result['source'].upper()}] {q[:40]}...")
    print(f"  Latency: {result['latency_ms']:.0f}ms")
    if result['source'] == 'cache':
        print(f"  Similarity: {result['similarity']:.3f}")
    print()

print("\\n=== Cache Statistics ===")
for k, v in cache.get_stats().items():
    print(f"  {k}: {v}")`,
        explanation: "A production-ready cache implementation with comprehensive monitoring: hit/miss tracking, latency measurement, event logging, hot query analysis, and cost savings estimation. Use this as a foundation for production deployments."
      }
    ],

    diagrams: [
      {
        title: "Semantic vs Exact Caching",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph Exact["Exact Match Cache"]
        E1["Query: 'capital of France'"]
        E2["Hash: abc123"]
        E3{"Key exists?"}
        E4["Return cached"]
        E5["Cache miss"]

        E1 --> E2 --> E3
        E3 -->|Yes| E4
        E3 -->|No| E5
    end

    subgraph Semantic["Semantic Cache"]
        S1["Query: 'French capital?'"]
        S2["Embedding: [0.2, -0.4, ...]"]
        S3["Vector similarity search"]
        S4{"Similarity > 0.95?"}
        S5["Return cached"]
        S6["Cache miss"]

        S1 --> S2 --> S3 --> S4
        S4 -->|Yes| S5
        S4 -->|No| S6
    end

    style E5 fill:#ffcdd2
    style S5 fill:#c8e6c9
    style E4 fill:#c8e6c9
    style S6 fill:#ffcdd2`,
        caption: "Exact caching requires identical queries. Semantic caching matches by meaning, enabling cache hits for paraphrased questions."
      },
      {
        title: "Redis Semantic Cache Architecture",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph App["Application"]
        Q["User Query"]
        LLM["LLM API Call"]
        R["Response"]
    end

    subgraph Cache["Redis Stack"]
        EMB["Embedding<br/>Generation"]
        IDX["Vector Index<br/>(HNSW)"]
        STORE["Hash Storage<br/>query + response + embedding"]
        SEARCH["KNN Search"]
    end

    subgraph Flow["Cache Flow"]
        CHECK{"Cache<br/>Hit?"}
    end

    Q --> EMB
    EMB --> SEARCH
    SEARCH --> IDX
    IDX --> CHECK

    CHECK -->|"Similarity ≥ threshold"| STORE
    STORE --> R

    CHECK -->|"Miss"| LLM
    LLM --> STORE
    STORE --> R

    style CHECK fill:#fff3e0
    style STORE fill:#e3f2fd
    style LLM fill:#ffcdd2`,
        caption: "Queries are embedded and searched against the vector index. Cache hits return stored responses; misses trigger LLM calls and cache storage."
      },
      {
        title: "Cache Invalidation Strategies",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph TTL["Time-Based (TTL)"]
        T1["Entry created"]
        T2["Clock ticks..."]
        T3["TTL expires"]
        T4["Entry deleted"]
        T1 --> T2 --> T3 --> T4
    end

    subgraph Version["Version-Based"]
        V1["Cache v1 entries"]
        V2["Data update"]
        V3["Bump to v2"]
        V4["v1 entries orphaned"]
        V1 --> V2 --> V3 --> V4
    end

    subgraph Tag["Tag-Based"]
        G1["Entry tagged:<br/>product, pricing"]
        G2["Price change event"]
        G3["Delete all 'pricing'<br/>tagged entries"]
        G1 --> G2 --> G3
    end

    subgraph Semantic["Semantic Invalidation"]
        S1["Invalidation query:<br/>'Acme Corp pricing'"]
        S2["Find similar<br/>cached queries"]
        S3["Delete matches"]
        S1 --> S2 --> S3
    end

    style T4 fill:#ffcdd2
    style V4 fill:#fff3e0
    style G3 fill:#c8e6c9
    style S3 fill:#e1bee7`,
        caption: "Four invalidation strategies: TTL for automatic expiration, versioning for bulk invalidation, tags for categorical updates, and semantic similarity for topic-based invalidation."
      }
    ],

    keyTakeaways: [
      "Semantic caching uses embeddings to match similar queries, returning cached responses for semantically equivalent questions even if worded differently",
      "Redis Stack provides sub-millisecond vector search via RediSearch, making it ideal infrastructure for semantic caching",
      "Similarity threshold is the key tuning parameter—too high misses valid cache hits, too low returns inappropriate cached responses",
      "LangChain's RedisSemanticCache integrates seamlessly with any LLM, requiring minimal code changes to enable caching",
      "Cache invalidation strategies include TTL, versioning, tagging, and semantic similarity—choose based on your data freshness requirements",
      "Monitor hit rate, precision (cache hit correctness), and latency savings to validate caching ROI and tune thresholds"
    ],

    resources: [
      {
        title: "Redis Vector Similarity Documentation",
        url: "https://redis.io/docs/interact/search-and-query/search/vectors/",
        type: "docs",
        description: "Official Redis documentation on vector indexing, HNSW algorithm configuration, and KNN queries",
        summaryPath: "data/day-18/summary-redis-vectors.md"
      },
      {
        title: "LangChain Caching Guide",
        url: "https://python.langchain.com/docs/how_to/llm_caching/",
        type: "docs",
        description: "LangChain documentation covering InMemoryCache, SQLiteCache, RedisCache, and RedisSemanticCache",
        summaryPath: "data/day-18/summary-langchain-caching.md"
      },
      {
        title: "GPTCache GitHub Repository",
        url: "https://github.com/zilliztech/GPTCache",
        type: "github",
        description: "Open-source semantic caching library with support for multiple embedding models and storage backends",
        summaryPath: "data/day-18/summary-gptcache.md"
      },
    ],

    faq: [
      {
        question: "What similarity threshold should I use?",
        answer: "Start with 0.95 for most applications. This catches clear paraphrases while rejecting different topics. If your hit rate is too low, try 0.92-0.93. If you're seeing incorrect cache hits (wrong answers being returned), increase to 0.97-0.98. Always validate with real queries from your domain before production deployment."
      },
      {
        question: "How much can semantic caching actually save?",
        answer: "Savings depend heavily on query patterns. Applications with repetitive questions (customer support, FAQ-style queries) can see 40-60% cache hit rates, saving thousands monthly at scale. Applications with highly diverse, unique queries may see only 5-10% hit rates. Always measure with your actual traffic before estimating ROI."
      },
      {
        question: "Should I use LangChain's cache or build my own?",
        answer: "LangChain's RedisSemanticCache is excellent for quick implementation and prototyping. Build your own when you need: custom similarity logic, fine-grained invalidation, detailed monitoring, or integration with existing caching infrastructure. The custom approach gives more control but requires more code."
      },
      {
        question: "What about caching when temperature > 0?",
        answer: "Caching with non-zero temperature is philosophically questionable—you expect different outputs each time. However, it can still save costs if approximate answers are acceptable. Consider: (1) lowering threshold so only very similar queries hit cache, (2) storing multiple responses and returning randomly, (3) using temperature=0 for cacheable queries and higher for creative ones."
      },
      {
        question: "How do I handle cache warm-up after restarts?",
        answer: "Redis persists data across restarts (if configured with RDB/AOF), so cache survives. For cold starts or new deployments: (1) pre-populate with known common queries, (2) gradually warm up as traffic flows through, (3) consider a cache-aside pattern where stale reads are acceptable briefly. Monitor hit rate after deploys to track warm-up."
      },
      {
        question: "Can I use semantic caching with streaming responses?",
        answer: "Streaming complicates caching because you don't have the full response upfront. Options: (1) buffer the full response before caching (adds latency), (2) cache only after streaming completes, (3) use a hybrid where cache hits return full responses immediately while misses stream. LangChain's cache currently buffers full responses."
      }
    ],

    applications: [
      {
        title: "Customer Support Chatbots",
        description: "Support queries are highly repetitive—'How do I reset my password?' gets asked hundreds of ways. Semantic caching can achieve 50%+ hit rates, dramatically reducing costs and improving response times for common questions."
      },
      {
        title: "Documentation Q&A Systems",
        description: "Users ask similar questions about the same documentation topics. Caching prevents redundant retrieval and LLM calls, making documentation assistants faster and more cost-effective."
      },
      {
        title: "Code Assistant Tools",
        description: "Developers often ask similar questions about APIs, syntax, and common patterns. Semantic caching helps code assistants respond instantly to frequently asked programming questions."
      },
      {
        title: "Enterprise Search Augmentation",
        description: "In enterprise settings, similar queries about company policies, procedures, and data are common. Caching reduces load on both LLM APIs and underlying retrieval systems."
      },
      {
        title: "Educational Platforms",
        description: "Students learning the same material ask similar questions. Semantic caching ensures instant responses for common conceptual questions while still allowing fresh answers for unique queries."
      }
    ]
  }
};
