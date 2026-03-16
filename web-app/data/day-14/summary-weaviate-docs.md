# Weaviate Documentation Summary

## What is Weaviate?

Weaviate is an open-source vector database designed for AI applications. It stores both objects and their vector representations, enabling semantic search, hybrid search, and generative AI workflows.

## Key Concepts

### Collections (formerly Classes)

Collections are containers for your data, similar to tables in SQL. Each collection has:
- A name (PascalCase, e.g., `AgentMemory`)
- Properties (schema fields)
- A vectorizer configuration

### Properties

Properties define the structure of objects in a collection:
- **TEXT**: String data, vectorized by default
- **INT/NUMBER**: Numeric values
- **BOOLEAN**: True/false values
- **DATE**: Timestamps
- **UUID**: Unique identifiers

### Vectorizers

Weaviate can automatically vectorize your data using:
- `text2vec-openai`: OpenAI's embedding models
- `text2vec-cohere`: Cohere's embedding models
- `text2vec-huggingface`: HuggingFace models
- Or bring your own pre-computed vectors

## Search Types

### Vector Search (near_text)
Finds semantically similar content using vector similarity. Best for conceptual queries.

```python
collection.query.near_text(
    query="debugging code",
    limit=5
)
```

### Keyword Search (bm25)
Traditional keyword matching using BM25 algorithm. Best for exact term matching.

```python
collection.query.bm25(
    query="Python asyncio",
    limit=5
)
```

### Hybrid Search
Combines vector and keyword search with configurable weighting.

```python
collection.query.hybrid(
    query="Python async programming",
    alpha=0.5,  # 0=keyword, 1=vector
    limit=5
)
```

## Filtering

Apply metadata filters to search within subsets:

```python
from weaviate.classes.query import Filter

response = collection.query.near_text(
    query="your query",
    filters=Filter.by_property("user_id").equal("user-123")
)
```

## Batch Operations

For inserting many objects efficiently:

```python
with collection.batch.dynamic() as batch:
    for item in items:
        batch.add_object(properties=item)
```

## Weaviate Cloud

Managed hosting at [console.weaviate.cloud](https://console.weaviate.cloud):
- Free tier available for development
- Automatic scaling
- No infrastructure management

## Python Client

Install: `pip install weaviate-client`

The v4 client uses a cleaner, more Pythonic API:
- `client.collections.create()` - Create collections
- `collection.data.insert()` - Insert objects
- `collection.query.near_text()` - Search

## Resources

- [Documentation](https://weaviate.io/developers/weaviate)
- [Python Client Guide](https://weaviate.io/developers/weaviate/client-libraries/python)
- [GitHub Repository](https://github.com/weaviate/weaviate)
- [Community Forum](https://forum.weaviate.io/)
