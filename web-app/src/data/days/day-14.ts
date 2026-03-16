import type { Day } from '../../types';

export const day14: Day = {
  day: 14,
  phase: 3,
  title: "Vector Databases for Agents",
  partner: "Weaviate",
  tags: ["vectors", "embeddings", "retrieval", "semantic-search", "RAG", "memory"],
  concept: "Semantic search with embeddings for agent knowledge retrieval",
  demoUrl: "demos/day-14/",
  demoDescription: "Explore vector embeddings, similarity search, collection design, and build Weaviate-powered agent memory systems interactively.",

  lesson: {
    overview: `Vector databases are the memory infrastructure that enables AI agents to move beyond stateless interactions. While traditional databases excel at exact matches and structured queries, they fail when agents need to find semantically similar content—"previous conversations about Python debugging" rather than exact keyword matches.

The breakthrough insight: transform text into high-dimensional vectors (embeddings) where semantic similarity becomes geometric proximity. Questions about "fixing bugs" cluster near discussions of "debugging errors" in this vector space, even without shared keywords. This enables agents to retrieve relevant context, build long-term memory, and ground their responses in actual knowledge.

Weaviate is an open-source vector database designed for AI applications. It handles the complete pipeline: automatic vectorization using models like OpenAI's text-embedding-3-small, efficient similarity search via HNSW indexing, and hybrid search combining semantic and keyword matching. For agents, this means fast retrieval of relevant memories, documents, and context—the foundation for Retrieval-Augmented Generation (RAG).

**Why This Matters**: An agent without memory treats every interaction as the first. Vector databases give agents the ability to learn from past interactions, retrieve relevant knowledge, and maintain context across sessions—transforming them from clever responders into systems that genuinely understand and remember.`,

    principles: [
      {
        title: "Embeddings Encode Meaning as Geometry",
        description: "Embedding models convert text into dense vectors where semantic relationships become spatial relationships. Similar concepts are close together; different concepts are far apart. This geometric representation enables similarity search without keyword matching."
      },
      {
        title: "Approximate Search Enables Scale",
        description: "Exact nearest-neighbor search is computationally prohibitive at scale. Vector databases use algorithms like HNSW (Hierarchical Navigable Small World) to find approximate nearest neighbors in milliseconds, trading tiny accuracy losses for massive speed gains."
      },
      {
        title: "Hybrid Search Covers All Cases",
        description: "Pure semantic search misses exact matches (product codes, names); pure keyword search misses semantic similarity. Hybrid search combines both: BM25 for keywords plus vector similarity, with configurable weighting to balance precision and recall."
      },
      {
        title: "Schema Design Enables Filtering",
        description: "Vector search alone returns the most similar items globally. Adding metadata properties (user_id, timestamp, category) enables filtered search—find semantically similar items within a specific user's data or time range."
      },
      {
        title: "Auto-Vectorization Simplifies Pipelines",
        description: "Weaviate can automatically vectorize data on insert using configured embedding models. No separate embedding step needed—insert text, get vectors. This reduces complexity and ensures consistency between indexing and query-time embeddings."
      }
    ],

    codeExample: {
      language: "python",
      title: "Complete Weaviate Agent Memory System",
      code: `import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType
from weaviate.classes.query import MetadataQuery
from datetime import datetime

# Connect to Weaviate Cloud
client = weaviate.connect_to_weaviate_cloud(
    cluster_url="https://your-cluster.weaviate.network",
    auth_credentials=Auth.api_key("your-weaviate-key"),
    headers={"X-OpenAI-Api-Key": "your-openai-key"}
)

# Create collection with auto-vectorization
client.collections.create(
    name="AgentMemory",
    vectorizer_config=Configure.Vectorizer.text2vec_openai(
        model="text-embedding-3-small"
    ),
    properties=[
        Property(name="content", data_type=DataType.TEXT),
        Property(name="role", data_type=DataType.TEXT),
        Property(name="session_id", data_type=DataType.TEXT),
        Property(name="timestamp", data_type=DataType.DATE),
    ]
)

# Store a memory (auto-vectorized)
memory = client.collections.get("AgentMemory")
memory.data.insert({
    "content": "User asked about Python async/await patterns",
    "role": "user",
    "session_id": "session-123",
    "timestamp": datetime.now()
})

# Retrieve relevant memories for RAG
response = memory.query.near_text(
    query="How do I handle concurrent operations in Python?",
    limit=5,
    return_metadata=MetadataQuery(distance=True)
)

# Build context for the agent
context = "\\n".join([
    f"[{obj.properties['role']}]: {obj.properties['content']}"
    for obj in response.objects
])
print(f"Retrieved context:\\n{context}")`
    },

    diagram: {
      type: "mermaid",
      title: "Vector Database Agent Memory Flow",
      mermaid: `flowchart LR
    subgraph Input
        text[Text Input]
    end

    subgraph Vectorization
        embed[Embedding Model]
        vec[Vector 1536d]
    end

    subgraph Storage
        idx[(HNSW Index)]
        meta[(Metadata)]
    end

    subgraph Retrieval
        query[Query Vector]
        search[ANN Search]
        filter[Metadata Filter]
    end

    subgraph Output
        results[Top-K Results]
        agent[Agent Context]
    end

    text --> embed --> vec --> idx
    text --> meta
    query --> search
    search --> idx
    filter --> meta
    search --> results
    filter --> results
    results --> agent`
    },

    keyTakeaways: [
      "Vector databases store embeddings—numerical representations where semantic similarity equals geometric proximity",
      "Weaviate auto-vectorizes text using OpenAI, Cohere, or HuggingFace models, simplifying the data pipeline",
      "HNSW indexing enables millisecond similarity search across millions of vectors",
      "Hybrid search combines keyword (BM25) and semantic matching for comprehensive retrieval",
      "Metadata filtering restricts searches to relevant subsets (user, session, time range)",
      "Agent memory systems use vector search to retrieve relevant context for RAG"
    ],

    resources: [
      {
        title: "Weaviate Documentation",
        url: "https://weaviate.io/developers/weaviate",
        type: "docs",
        description: "Official Weaviate docs covering setup, schema design, and querying",
        summaryPath: "data/day-14/summary-weaviate-docs.md"
      },
      {
        title: "What is a Vector Database?",
        url: "https://weaviate.io/blog/what-is-a-vector-database",
        type: "article",
        description: "Comprehensive introduction to vector databases and their applications",
        summaryPath: "data/day-14/summary-vector-database-blog.md"
      },
      {
        title: "Weaviate Python Client",
        url: "https://weaviate.io/developers/weaviate/client-libraries/python",
        type: "docs",
        description: "Python client documentation with code examples",
        summaryPath: "data/day-14/summary-python-client.md"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Vector databases transform how AI agents store and retrieve knowledge by enabling semantic similarity search over high-dimensional embeddings.",
      fullDescription: `Vector databases represent a fundamental shift in how we think about data retrieval for AI systems. Traditional databases answer the question "find exact matches for X." Vector databases answer "find things semantically similar to X"—a capability that's essential for AI agents that need to understand context, retrieve relevant memories, and ground their responses in actual knowledge.

The core insight is elegant: embedding models like OpenAI's text-embedding-3-small transform text into high-dimensional vectors (typically 1536 dimensions) where semantic relationships become geometric relationships. Sentences about "debugging Python code" and "fixing software bugs" end up close together in this vector space, even though they share few keywords. This enables retrieval based on meaning rather than exact matches.

Weaviate builds on this foundation with production-ready features: automatic vectorization (insert text, get vectors), HNSW indexing for millisecond search at scale, hybrid search combining keywords and semantics, and rich filtering by metadata. For AI agents, this translates to fast, accurate retrieval of relevant context—the foundation for Retrieval-Augmented Generation (RAG).

This lesson covers the complete journey: understanding embeddings, designing Weaviate collections, inserting and querying data, and building agent memory systems that persist across sessions. By the end, you'll understand how to give your agents long-term memory and knowledge retrieval capabilities.`,
      prerequisites: [
        "Python fundamentals",
        "Basic understanding of APIs and HTTP",
        "Familiarity with AI/LLM concepts from earlier days",
        "OpenAI API key (for embeddings)"
      ],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "What Are Vector Embeddings?",
        description: `Vector embeddings are numerical representations of data (text, images, audio) in high-dimensional space. For text, embedding models like OpenAI's text-embedding-3-small analyze semantic content and output a fixed-size vector—typically 1536 floating-point numbers.

The key property: semantically similar content produces geometrically close vectors. "The cat sat on the mat" and "A feline rested on the rug" will have similar embeddings despite different words, because they describe similar concepts.

\`\`\`python
from openai import OpenAI

client = OpenAI()

# Generate embeddings
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="How do I debug Python code?"
)

embedding = response.data[0].embedding
print(f"Dimensions: {len(embedding)}")  # 1536
print(f"First 5 values: {embedding[:5]}")
# [-0.0123, 0.0456, -0.0789, 0.0234, -0.0567]
\`\`\`

Each dimension captures some aspect of meaning—though individual dimensions aren't directly interpretable. The magic happens in the aggregate: the full vector captures semantic content in a way that enables similarity comparison.`,
        analogy: "Think of embeddings like GPS coordinates for meaning. Just as nearby GPS coordinates indicate nearby physical locations, nearby embedding vectors indicate semantically similar content. The embedding model is like a cartographer that maps the entire landscape of language into coordinates.",
        gotchas: [
          "Different embedding models produce incompatible vectors—you can't mix OpenAI and Cohere embeddings in the same index",
          "Embedding quality matters more than dimensions—text-embedding-3-small (1536d) often outperforms larger models",
          "Very short or very long texts may embed poorly—chunk long documents into meaningful segments"
        ]
      },
      {
        title: "Vector Similarity and Distance Metrics",
        description: `Once text becomes vectors, finding similar content becomes a geometric problem: which vectors are closest? The choice of distance metric affects results.

**Cosine Similarity** (most common for text): Measures the angle between vectors, ignoring magnitude. Values range from -1 (opposite) to 1 (identical). Weaviate returns cosine distance (1 - similarity), so 0 means identical.

\`\`\`python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Example: comparing query to documents
query = embed("How do I fix Python errors?")
doc1 = embed("Debugging Python exceptions and tracebacks")
doc2 = embed("Best restaurants in Paris")

print(cosine_similarity(query, doc1))  # ~0.85 (high similarity)
print(cosine_similarity(query, doc2))  # ~0.15 (low similarity)
\`\`\`

**Dot Product**: Considers both angle and magnitude. Useful when vector length encodes importance.

**Euclidean Distance (L2)**: Straight-line distance between points. Less common for text but useful for some applications.

For most text applications with normalized embeddings (like OpenAI's), cosine similarity is the standard choice.`,
        gotchas: [
          "Cosine distance ≠ cosine similarity (distance = 1 - similarity)",
          "Normalized vectors make dot product equivalent to cosine similarity",
          "Distance of 0 means identical, but 'good' thresholds are model-specific"
        ]
      },
      {
        title: "Weaviate Architecture: Collections and Properties",
        description: `Weaviate organizes data into **collections** (formerly called classes)—similar to tables in SQL. Each collection has a schema defining properties and vectorization strategy.

\`\`\`python
from weaviate.classes.config import Configure, Property, DataType

# Create a collection for agent memories
client.collections.create(
    name="AgentMemory",

    # Configure automatic vectorization
    vectorizer_config=Configure.Vectorizer.text2vec_openai(
        model="text-embedding-3-small"
    ),

    # Define properties (like columns)
    properties=[
        Property(name="content", data_type=DataType.TEXT),
        Property(name="role", data_type=DataType.TEXT),      # "user" or "assistant"
        Property(name="session_id", data_type=DataType.TEXT),
        Property(name="user_id", data_type=DataType.TEXT),
        Property(name="timestamp", data_type=DataType.DATE),
        Property(name="importance", data_type=DataType.NUMBER),
    ]
)
\`\`\`

**Key Design Decisions**:
- **Vectorized properties**: By default, TEXT properties are vectorized. You can skip vectorization for metadata fields.
- **Property types**: TEXT, NUMBER, INT, BOOLEAN, DATE, UUID, BLOB, and more
- **Vectorizer choice**: text2vec-openai, text2vec-cohere, text2vec-huggingface, or bring your own vectors

The schema enables both semantic search (over vectors) and filtered search (over properties).`,
        gotchas: [
          "Collection names must be PascalCase and start with a letter",
          "Changing vectorizers after data insertion requires re-indexing",
          "Property names are case-sensitive in queries"
        ]
      },
      {
        title: "Inserting and Auto-Vectorizing Data",
        description: `With auto-vectorization configured, inserting data is straightforward—Weaviate handles embedding generation automatically.

\`\`\`python
from datetime import datetime

memory = client.collections.get("AgentMemory")

# Single insert (auto-vectorized)
uuid = memory.data.insert({
    "content": "User asked how to handle API rate limits in Python",
    "role": "user",
    "session_id": "sess-abc123",
    "user_id": "user-456",
    "timestamp": datetime.now(),
    "importance": 0.8
})
print(f"Inserted with UUID: {uuid}")

# Batch insert for efficiency
memories = [
    {
        "content": "Explained exponential backoff strategy",
        "role": "assistant",
        "session_id": "sess-abc123",
        "user_id": "user-456",
        "timestamp": datetime.now(),
    },
    {
        "content": "User implemented retry logic successfully",
        "role": "user",
        "session_id": "sess-abc123",
        "user_id": "user-456",
        "timestamp": datetime.now(),
    }
]

with memory.batch.dynamic() as batch:
    for mem in memories:
        batch.add_object(properties=mem)
\`\`\`

Behind the scenes, Weaviate:
1. Sends text to the configured embedding model
2. Receives the vector (e.g., 1536 dimensions from OpenAI)
3. Indexes the vector in the HNSW graph
4. Stores properties alongside the vector`,
        gotchas: [
          "Batch imports are significantly faster than single inserts (10-100x)",
          "Auto-vectorization adds latency—budget for ~100ms per embedding API call",
          "Failed inserts in batches don't stop the batch—check error callbacks"
        ]
      },
      {
        title: "Semantic Search: Finding Similar Content",
        description: `The core capability: given a query, find the most semantically similar stored items.

\`\`\`python
from weaviate.classes.query import MetadataQuery

memory = client.collections.get("AgentMemory")

# Basic semantic search
response = memory.query.near_text(
    query="How do I handle errors when calling external APIs?",
    limit=5
)

for obj in response.objects:
    print(f"Content: {obj.properties['content']}")
    print(f"Role: {obj.properties['role']}")
    print("---")

# With distance scores (lower = more similar)
response = memory.query.near_text(
    query="API error handling",
    limit=5,
    return_metadata=MetadataQuery(distance=True)
)

for obj in response.objects:
    print(f"Distance: {obj.metadata.distance:.4f}")
    print(f"Content: {obj.properties['content']}")
\`\`\`

**Filtered semantic search** restricts results to matching metadata:

\`\`\`python
from weaviate.classes.query import Filter

# Find similar content within a specific user's memories
response = memory.query.near_text(
    query="Python debugging",
    limit=5,
    filters=Filter.by_property("user_id").equal("user-456")
)

# Combine multiple filters
response = memory.query.near_text(
    query="async programming",
    limit=5,
    filters=(
        Filter.by_property("user_id").equal("user-456") &
        Filter.by_property("role").equal("user")
    )
)
\`\`\``,
        gotchas: [
          "near_text uses the same embedding model as indexing—they must match",
          "Filters are applied AFTER vector search, which can return fewer than 'limit' results",
          "Very broad queries may return irrelevant results—be specific"
        ]
      },
      {
        title: "Hybrid Search: Best of Both Worlds",
        description: `Pure semantic search excels at finding conceptually similar content but can miss exact keyword matches. Pure keyword search (BM25) finds exact matches but misses semantic similarity. Hybrid search combines both.

\`\`\`python
# Hybrid search with configurable balance
response = memory.query.hybrid(
    query="Python asyncio tutorial",
    limit=5,
    alpha=0.5  # 0 = pure keyword, 1 = pure vector, 0.5 = balanced
)

# Emphasize semantic matching
response = memory.query.hybrid(
    query="How to write non-blocking code",
    limit=5,
    alpha=0.75  # Favor vector search
)

# Emphasize keyword matching (for specific terms)
response = memory.query.hybrid(
    query="asyncio.gather() documentation",
    limit=5,
    alpha=0.25  # Favor BM25
)
\`\`\`

**When to use each**:
- **Pure semantic (near_text)**: Conceptual questions, varied phrasing
- **Pure keyword (bm25)**: Exact terms, code snippets, proper nouns
- **Hybrid**: General-purpose retrieval, especially for RAG

The alpha parameter lets you tune based on your use case. For agent memory, alpha=0.5-0.7 typically works well.`,
        analogy: "Hybrid search is like having both a librarian who understands what you mean (semantic) and an indexer who knows exact locations (keyword). The librarian finds books about 'stories of the sea' while the indexer finds books titled 'Moby Dick' specifically.",
        gotchas: [
          "Alpha tuning is dataset-specific—experiment to find optimal values",
          "Hybrid search is slightly slower than pure vector search",
          "BM25 requires text properties—non-text fields aren't searchable this way"
        ]
      },
      {
        title: "Building Agent Memory with Weaviate",
        description: `Putting it together: a complete agent memory system that stores conversations, retrieves relevant context, and enables multi-session persistence.

\`\`\`python
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType
from weaviate.classes.query import Filter, MetadataQuery
from datetime import datetime
from openai import OpenAI

class AgentMemory:
    def __init__(self, weaviate_url: str, weaviate_key: str, openai_key: str):
        self.client = weaviate.connect_to_weaviate_cloud(
            cluster_url=weaviate_url,
            auth_credentials=Auth.api_key(weaviate_key),
            headers={"X-OpenAI-Api-Key": openai_key}
        )
        self.openai = OpenAI(api_key=openai_key)
        self._ensure_collection()

    def _ensure_collection(self):
        if not self.client.collections.exists("Memory"):
            self.client.collections.create(
                name="Memory",
                vectorizer_config=Configure.Vectorizer.text2vec_openai(
                    model="text-embedding-3-small"
                ),
                properties=[
                    Property(name="content", data_type=DataType.TEXT),
                    Property(name="role", data_type=DataType.TEXT),
                    Property(name="user_id", data_type=DataType.TEXT),
                    Property(name="session_id", data_type=DataType.TEXT),
                    Property(name="timestamp", data_type=DataType.DATE),
                ]
            )

    def store(self, content: str, role: str, user_id: str, session_id: str):
        memory = self.client.collections.get("Memory")
        memory.data.insert({
            "content": content,
            "role": role,
            "user_id": user_id,
            "session_id": session_id,
            "timestamp": datetime.now()
        })

    def retrieve(self, query: str, user_id: str, limit: int = 5) -> list[dict]:
        memory = self.client.collections.get("Memory")
        response = memory.query.hybrid(
            query=query,
            limit=limit,
            alpha=0.6,
            filters=Filter.by_property("user_id").equal(user_id),
            return_metadata=MetadataQuery(distance=True)
        )
        return [
            {
                "content": obj.properties["content"],
                "role": obj.properties["role"],
                "session_id": obj.properties["session_id"],
                "distance": obj.metadata.distance
            }
            for obj in response.objects
        ]

    def get_rag_context(self, query: str, user_id: str) -> str:
        memories = self.retrieve(query, user_id, limit=5)
        if not memories:
            return ""
        return "Relevant past interactions:\\n" + "\\n".join([
            f"[{m['role']}]: {m['content']}"
            for m in memories
        ])


# Usage
memory = AgentMemory(
    weaviate_url="https://your-cluster.weaviate.network",
    weaviate_key="your-weaviate-key",
    openai_key="your-openai-key"
)

# Store interactions
memory.store("How do I use async/await in Python?", "user", "user-123", "sess-1")
memory.store("I explained Python's asyncio module...", "assistant", "user-123", "sess-1")

# Later, retrieve context for a new query
context = memory.get_rag_context(
    "I'm getting errors with concurrent code",
    user_id="user-123"
)
print(context)
\`\`\`

This pattern enables agents to:
- Remember past interactions across sessions
- Retrieve relevant context for current queries
- Maintain per-user memory isolation
- Build truly personalized experiences`,
        gotchas: [
          "Close the Weaviate client connection when done: client.close()",
          "Consider memory pruning strategies for long-running agents",
          "Index maintenance may be needed for very large datasets"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Connect to Weaviate Cloud",
        language: "python",
        category: "basic",
        code: `import weaviate
from weaviate.classes.init import Auth

# Connect to Weaviate Cloud (recommended for getting started)
client = weaviate.connect_to_weaviate_cloud(
    cluster_url="https://your-cluster-id.weaviate.network",
    auth_credentials=Auth.api_key("your-weaviate-api-key"),

    # Pass embedding API key in headers for auto-vectorization
    headers={
        "X-OpenAI-Api-Key": "your-openai-api-key"
    }
)

# Verify connection
print(f"Connected: {client.is_ready()}")

# Always close when done
# client.close()`,
        explanation: "Weaviate Cloud provides a managed vector database. The API key authenticates your requests, while the OpenAI key in headers enables automatic vectorization of text."
      },
      {
        title: "Create a Collection with Schema",
        language: "python",
        category: "basic",
        code: `from weaviate.classes.config import Configure, Property, DataType

# Define and create a collection for storing documents
client.collections.create(
    name="Document",

    # Use OpenAI for automatic vectorization
    vectorizer_config=Configure.Vectorizer.text2vec_openai(
        model="text-embedding-3-small"
    ),

    # Define the schema
    properties=[
        Property(
            name="title",
            data_type=DataType.TEXT,
            description="Document title"
        ),
        Property(
            name="content",
            data_type=DataType.TEXT,
            description="Main document content - this will be vectorized"
        ),
        Property(
            name="category",
            data_type=DataType.TEXT,
            skip_vectorization=True  # Don't include in vector
        ),
        Property(
            name="created_at",
            data_type=DataType.DATE
        ),
    ]
)

print("Collection created successfully!")`,
        explanation: "Collections define the structure of your data. The vectorizer_config tells Weaviate which embedding model to use. Properties with skip_vectorization=True are stored but not included in the embedding."
      },
      {
        title: "Insert Data with Batch Processing",
        language: "python",
        category: "intermediate",
        code: `from datetime import datetime

# Get collection reference
docs = client.collections.get("Document")

# Sample documents to insert
documents = [
    {
        "title": "Introduction to Python Async",
        "content": "Python's asyncio module provides infrastructure for writing concurrent code using the async/await syntax.",
        "category": "python",
        "created_at": datetime.now()
    },
    {
        "title": "Understanding Vector Databases",
        "content": "Vector databases store high-dimensional vectors and enable similarity search based on distance metrics.",
        "category": "databases",
        "created_at": datetime.now()
    },
    {
        "title": "Building AI Agents",
        "content": "AI agents combine LLMs with tools and memory to perform complex tasks autonomously.",
        "category": "ai",
        "created_at": datetime.now()
    }
]

# Batch insert (much faster than individual inserts)
with docs.batch.dynamic() as batch:
    for doc in documents:
        batch.add_object(properties=doc)

print(f"Inserted {len(documents)} documents")

# Verify count
response = docs.aggregate.over_all(total_count=True)
print(f"Total documents: {response.total_count}")`,
        explanation: "Batch processing dramatically improves insert performance. The dynamic() context manager handles batching automatically. Each document is vectorized by OpenAI and indexed."
      },
      {
        title: "Semantic and Hybrid Search",
        language: "python",
        category: "intermediate",
        code: `from weaviate.classes.query import MetadataQuery, Filter

docs = client.collections.get("Document")

# Pure semantic search - finds conceptually similar content
print("=== Semantic Search ===")
response = docs.query.near_text(
    query="How do I write non-blocking Python code?",
    limit=3,
    return_metadata=MetadataQuery(distance=True)
)

for obj in response.objects:
    print(f"Distance: {obj.metadata.distance:.4f}")
    print(f"Title: {obj.properties['title']}")
    print(f"Content: {obj.properties['content'][:100]}...")
    print("---")

# Hybrid search - combines semantic + keyword matching
print("\\n=== Hybrid Search ===")
response = docs.query.hybrid(
    query="asyncio concurrent programming",
    limit=3,
    alpha=0.5,  # Balance between vector (1.0) and keyword (0.0)
    return_metadata=MetadataQuery(score=True)
)

for obj in response.objects:
    print(f"Score: {obj.metadata.score:.4f}")
    print(f"Title: {obj.properties['title']}")
    print("---")

# Filtered search - semantic search within a category
print("\\n=== Filtered Search ===")
response = docs.query.near_text(
    query="building intelligent systems",
    limit=3,
    filters=Filter.by_property("category").equal("ai")
)

for obj in response.objects:
    print(f"Title: {obj.properties['title']}")
    print(f"Category: {obj.properties['category']}")`,
        explanation: "near_text performs pure semantic search. hybrid combines semantic and keyword matching (alpha controls the balance). Filters restrict results to matching metadata without affecting the semantic ranking."
      },
      {
        title: "Complete RAG Agent with Memory",
        language: "python",
        category: "advanced",
        code: `import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType
from weaviate.classes.query import Filter
from openai import OpenAI
from datetime import datetime

class RAGAgent:
    """An agent with vector-database-backed memory and RAG capabilities."""

    def __init__(self, weaviate_url: str, weaviate_key: str, openai_key: str):
        self.weaviate = weaviate.connect_to_weaviate_cloud(
            cluster_url=weaviate_url,
            auth_credentials=Auth.api_key(weaviate_key),
            headers={"X-OpenAI-Api-Key": openai_key}
        )
        self.openai = OpenAI(api_key=openai_key)
        self._init_memory()

    def _init_memory(self):
        """Initialize the memory collection if it doesn't exist."""
        if not self.weaviate.collections.exists("AgentMemory"):
            self.weaviate.collections.create(
                name="AgentMemory",
                vectorizer_config=Configure.Vectorizer.text2vec_openai(),
                properties=[
                    Property(name="content", data_type=DataType.TEXT),
                    Property(name="role", data_type=DataType.TEXT),
                    Property(name="user_id", data_type=DataType.TEXT),
                    Property(name="timestamp", data_type=DataType.DATE),
                ]
            )

    def _store_memory(self, content: str, role: str, user_id: str):
        """Store an interaction in memory."""
        memory = self.weaviate.collections.get("AgentMemory")
        memory.data.insert({
            "content": content,
            "role": role,
            "user_id": user_id,
            "timestamp": datetime.now()
        })

    def _retrieve_context(self, query: str, user_id: str, limit: int = 5) -> str:
        """Retrieve relevant past interactions for context."""
        memory = self.weaviate.collections.get("AgentMemory")
        response = memory.query.hybrid(
            query=query,
            limit=limit,
            alpha=0.6,
            filters=Filter.by_property("user_id").equal(user_id)
        )

        if not response.objects:
            return ""

        context_parts = []
        for obj in response.objects:
            role = obj.properties["role"]
            content = obj.properties["content"]
            context_parts.append(f"[{role}]: {content}")

        return "Previous relevant interactions:\\n" + "\\n".join(context_parts)

    def chat(self, user_message: str, user_id: str) -> str:
        """Process a user message with RAG-enhanced context."""

        # Retrieve relevant context from memory
        context = self._retrieve_context(user_message, user_id)

        # Build the prompt with context
        system_prompt = """You are a helpful AI assistant with memory of past conversations.
Use the provided context from previous interactions when relevant.
If the context isn't relevant to the current question, you can ignore it."""

        messages = [
            {"role": "system", "content": system_prompt},
        ]

        if context:
            messages.append({
                "role": "system",
                "content": f"Context from memory:\\n{context}"
            })

        messages.append({"role": "user", "content": user_message})

        # Generate response
        response = self.openai.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )

        assistant_message = response.choices[0].message.content

        # Store both messages in memory
        self._store_memory(user_message, "user", user_id)
        self._store_memory(assistant_message, "assistant", user_id)

        return assistant_message

    def close(self):
        """Clean up connections."""
        self.weaviate.close()


# Usage example
agent = RAGAgent(
    weaviate_url="https://your-cluster.weaviate.network",
    weaviate_key="your-weaviate-key",
    openai_key="your-openai-key"
)

# First conversation
response = agent.chat(
    "I'm working on a Python project that needs to handle many API calls efficiently.",
    user_id="user-123"
)
print(f"Agent: {response}")

# Later conversation - agent remembers context
response = agent.chat(
    "What was that approach you mentioned for handling the API calls?",
    user_id="user-123"
)
print(f"Agent: {response}")

agent.close()`,
        explanation: "This complete example shows a RAG agent pattern: store interactions in Weaviate, retrieve relevant context via hybrid search, and include that context when generating responses. The agent builds genuine memory across conversations."
      }
    ],

    diagrams: [
      {
        title: "Embedding Generation Pipeline",
        type: "mermaid",
        mermaid: `flowchart TD
    subgraph Input
        A[Raw Text] --> B[Tokenization]
    end

    subgraph Model["Embedding Model (e.g., OpenAI)"]
        B --> C[Neural Network]
        C --> D[Hidden Layers]
        D --> E[Pooling]
    end

    subgraph Output
        E --> F["Vector [1536 floats]"]
        F --> G[Normalized]
    end

    subgraph Properties
        G --> H["Semantic Similarity"]
        G --> I["Fixed Dimensions"]
        G --> J["Model-Specific"]
    end`,
        caption: "Text embeddings are generated by passing text through a neural network that compresses semantic meaning into a fixed-size vector."
      },
      {
        title: "Weaviate Query Flow",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph Client
        Q[Query Text]
    end

    subgraph Weaviate
        Q --> E[Embed Query]
        E --> V[Vector Search<br/>HNSW]
        Q --> K[Keyword Search<br/>BM25]

        V --> M{Merge}
        K --> M

        M --> F[Apply Filters]
        F --> R[Rank Results]
    end

    subgraph Response
        R --> T[Top-K Objects]
        T --> P[Properties]
        T --> S[Scores/Distances]
    end`,
        caption: "Hybrid search in Weaviate combines vector similarity (HNSW) with keyword matching (BM25), applies filters, and returns ranked results."
      },
      {
        title: "Agent Memory Architecture",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Agent
        U[User Query] --> R[Retrieval]
        R --> C[Context Builder]
        C --> L[LLM]
        L --> A[Response]

        U --> S[Store User Msg]
        A --> SA[Store Assistant Msg]
    end

    subgraph Weaviate["Weaviate Vector DB"]
        S --> M[(Memory Collection)]
        SA --> M
        R <--> M
    end

    subgraph Memory["Memory Schema"]
        M --> P1[content: TEXT]
        M --> P2[role: TEXT]
        M --> P3[user_id: TEXT]
        M --> P4[timestamp: DATE]
    end`,
        caption: "Agent memory pattern: store all interactions in Weaviate, retrieve relevant context before generating responses, creating persistent memory across sessions."
      }
    ],

    keyTakeaways: [
      "Vector embeddings transform text into high-dimensional numerical representations where semantic similarity equals geometric proximity",
      "Weaviate handles the complete pipeline: auto-vectorization, HNSW indexing, and hybrid search",
      "Use near_text for semantic search, bm25 for keyword search, and hybrid for the best of both",
      "Schema design with metadata properties enables filtered search within subsets of your data",
      "Batch inserts are 10-100x faster than individual inserts—always use batching for bulk data",
      "The agent memory pattern stores interactions and retrieves relevant context for RAG",
      "Cosine similarity is standard for text—Weaviate returns distance (1 - similarity), so lower is better",
      "Different embedding models are incompatible—choose one and stick with it for your collection"
    ],

    resources: [
      {
        title: "Weaviate Documentation",
        url: "https://weaviate.io/developers/weaviate",
        type: "docs",
        description: "Comprehensive documentation covering installation, schema design, queries, and modules",
        summaryPath: "data/day-14/summary-weaviate-docs.md"
      },
      {
        title: "What is a Vector Database?",
        url: "https://weaviate.io/blog/what-is-a-vector-database",
        type: "article",
        description: "Excellent introduction to vector databases, embeddings, and similarity search concepts",
        summaryPath: "data/day-14/summary-vector-database-blog.md"
      },
      {
        title: "Weaviate Python Client Guide",
        url: "https://weaviate.io/developers/weaviate/client-libraries/python",
        type: "docs",
        description: "Python client documentation with setup instructions and code examples",
        summaryPath: "data/day-14/summary-python-client.md"
      },
      {
        title: "OpenAI Embeddings Guide",
        url: "https://platform.openai.com/docs/guides/embeddings",
        type: "docs",
        description: "OpenAI's guide to embedding models, best practices, and use cases",
        summaryPath: "data/day-14/summary-openai-embeddings.md"
      },
      {
        title: "Weaviate GitHub Repository",
        url: "https://github.com/weaviate/weaviate",
        type: "github",
        description: "Open-source repository with examples, issues, and community discussions",
        summaryPath: "data/day-14/summary-weaviate-github.md"
      }
    ],

    faq: [
      {
        question: "How is Weaviate different from Pinecone or ChromaDB?",
        answer: "Weaviate is open-source and can be self-hosted, while Pinecone is fully managed. Weaviate offers native hybrid search (vector + keyword) and GraphQL queries. ChromaDB is simpler but less feature-rich. Weaviate excels at complex schemas with multiple vectorized fields and rich filtering."
      },
      {
        question: "How many vectors can Weaviate handle?",
        answer: "Weaviate scales to billions of vectors. Performance depends on hardware and configuration, but HNSW indexing provides sub-100ms queries even at scale. Weaviate Cloud handles scaling automatically; self-hosted deployments can use horizontal scaling."
      },
      {
        question: "Should I use auto-vectorization or bring my own vectors?",
        answer: "Auto-vectorization is simpler and ensures consistency between indexing and query embeddings. Bring your own vectors if you need custom embedding models, have pre-computed embeddings, or want to avoid per-request embedding costs. Most users start with auto-vectorization."
      },
      {
        question: "How do I choose between semantic, keyword, and hybrid search?",
        answer: "Use semantic (near_text) for conceptual queries where exact words don't matter. Use keyword (bm25) for specific terms, code, or proper nouns. Use hybrid for general-purpose retrieval—it's the safest default for RAG applications. Tune the alpha parameter based on your results."
      },
      {
        question: "What's the cost of using Weaviate Cloud with OpenAI embeddings?",
        answer: "Weaviate Cloud has a free tier for development. OpenAI's text-embedding-3-small costs $0.00002 per 1K tokens (~$0.02 per 1M tokens). For a typical agent memory system with moderate usage, costs are usually under $10/month. Batch your inserts to minimize API calls."
      }
    ],

    applications: [
      {
        title: "Conversational Agent Memory",
        description: "Store all user interactions with embeddings, enabling agents to recall relevant past conversations. Users can ask 'What did we discuss about X?' and get accurate, contextual responses even across sessions."
      },
      {
        title: "Document Q&A / RAG Systems",
        description: "Index documents, knowledge bases, or help articles. When users ask questions, retrieve the most relevant passages and include them as context for the LLM—grounding responses in actual knowledge rather than hallucination."
      },
      {
        title: "Semantic Code Search",
        description: "Index code repositories with embeddings. Developers can search for 'function that handles user authentication' and find relevant code even when variable names differ. Particularly powerful for large, unfamiliar codebases."
      }
    ],

    relatedDays: [2, 9, 15, 16]
  }
};
