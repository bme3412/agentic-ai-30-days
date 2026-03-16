# OpenAI Embeddings Guide

*Summary of OpenAI's official embeddings documentation*

## What Are Embeddings?

Embeddings are numerical representations of text that capture semantic meaning. OpenAI's embedding models convert text into vectors of floating-point numbers, where similar meanings produce similar vectors.

## Available Models

### text-embedding-3-small (Recommended)
- **Dimensions**: 1536 (default), can reduce to 256-1536
- **Cost**: $0.00002 / 1K tokens (~$0.02 / 1M tokens)
- **Performance**: Strong balance of quality and efficiency
- **Best for**: Most production use cases

### text-embedding-3-large
- **Dimensions**: 3072 (default), can reduce to 256-3072
- **Cost**: $0.00013 / 1K tokens
- **Performance**: Highest quality
- **Best for**: When maximum accuracy is critical

### text-embedding-ada-002 (Legacy)
- **Dimensions**: 1536 (fixed)
- **Cost**: $0.0001 / 1K tokens
- **Note**: Superseded by text-embedding-3-small

## Basic Usage

```python
from openai import OpenAI

client = OpenAI()

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text here"
)

embedding = response.data[0].embedding
print(f"Dimensions: {len(embedding)}")  # 1536
```

## Batch Processing

```python
# Embed multiple texts in one call
response = client.embeddings.create(
    model="text-embedding-3-small",
    input=[
        "First document",
        "Second document",
        "Third document"
    ]
)

embeddings = [item.embedding for item in response.data]
```

## Dimension Reduction

The v3 models support native dimension reduction:

```python
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text",
    dimensions=512  # Reduce from 1536 to 512
)
```

Lower dimensions = smaller storage, faster search, slightly lower quality.

## Token Limits

- **Maximum tokens**: 8191 per input
- **Counting tokens**: Use `tiktoken` library
- **Tip**: Chunk long documents into smaller pieces

```python
import tiktoken

encoding = tiktoken.get_encoding("cl100k_base")
tokens = encoding.encode("Your text here")
print(f"Token count: {len(tokens)}")
```

## Best Practices

### 1. Preprocessing
- Remove unnecessary whitespace
- Consider lowercasing for consistency
- Remove special characters if not meaningful

### 2. Chunking Long Documents
```python
def chunk_text(text, max_tokens=500, overlap=50):
    # Split into sentences or paragraphs
    # Keep chunks under token limit
    # Add overlap for context continuity
    pass
```

### 3. Caching
Embeddings are deterministic—cache results to avoid redundant API calls.

### 4. Batch Requests
Send multiple texts in one API call to reduce latency and cost.

## Use Cases

### Semantic Search
```python
# 1. Embed your documents
doc_embeddings = [embed(doc) for doc in documents]

# 2. Embed the query
query_embedding = embed("user's search query")

# 3. Find most similar (cosine similarity)
similarities = [cosine_sim(query_embedding, doc_emb) for doc_emb in doc_embeddings]
```

### Clustering
Group similar content by clustering embedding vectors using k-means or DBSCAN.

### Classification
Use embeddings as features for downstream classification models.

### Recommendations
Find similar items by comparing embedding distances.

## Similarity Calculation

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

OpenAI embeddings are normalized, so dot product also works:
```python
similarity = np.dot(a, b)  # Equivalent for normalized vectors
```

## Cost Optimization

1. **Use text-embedding-3-small** unless you need maximum accuracy
2. **Reduce dimensions** if storage/speed matter more than accuracy
3. **Batch requests** to minimize API calls
4. **Cache embeddings** for repeated content
5. **Chunk strategically** to avoid embedding redundant text

## Rate Limits

- Default: 3,000 requests/minute, 1,000,000 tokens/minute
- Can request increases through OpenAI dashboard
- Implement exponential backoff for rate limit errors
