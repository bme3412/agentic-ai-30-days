# Weaviate Python Client Guide

*Summary of the official Weaviate Python client documentation (v4)*

## Installation

```bash
pip install weaviate-client
```

Requires Python 3.9+. The v4 client is a complete rewrite with a cleaner, more Pythonic API.

## Connection Options

### Weaviate Cloud (Recommended)
```python
import weaviate
from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url="https://your-cluster.weaviate.network",
    auth_credentials=Auth.api_key("your-api-key"),
    headers={"X-OpenAI-Api-Key": "your-openai-key"}  # For vectorizers
)
```

### Local Docker
```python
client = weaviate.connect_to_local(
    host="localhost",
    port=8080,
    headers={"X-OpenAI-Api-Key": "your-openai-key"}
)
```

### Embedded (Testing)
```python
client = weaviate.connect_to_embedded()
```

## Collection Management

### Create Collection
```python
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    name="Article",
    vectorizer_config=Configure.Vectorizer.text2vec_openai(),
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="content", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT, skip_vectorization=True),
    ]
)
```

### Get Collection Reference
```python
articles = client.collections.get("Article")
```

### Check/Delete Collections
```python
client.collections.exists("Article")  # Returns bool
client.collections.delete("Article")
```

## Data Operations

### Insert Single Object
```python
uuid = articles.data.insert({
    "title": "My Article",
    "content": "Article content here...",
    "category": "tech"
})
```

### Batch Insert (Much Faster)
```python
with articles.batch.dynamic() as batch:
    for item in items:
        batch.add_object(properties=item)
```

### Update Object
```python
articles.data.update(
    uuid="object-uuid",
    properties={"title": "Updated Title"}
)
```

### Delete Object
```python
articles.data.delete_by_id("object-uuid")
```

## Query Operations

### Semantic Search (near_text)
```python
from weaviate.classes.query import MetadataQuery

response = articles.query.near_text(
    query="machine learning applications",
    limit=5,
    return_metadata=MetadataQuery(distance=True)
)

for obj in response.objects:
    print(obj.properties["title"])
    print(obj.metadata.distance)
```

### Keyword Search (BM25)
```python
response = articles.query.bm25(
    query="python tutorial",
    limit=5
)
```

### Hybrid Search
```python
response = articles.query.hybrid(
    query="AI programming",
    alpha=0.5,  # 0=keyword, 1=vector
    limit=5
)
```

## Filtering

```python
from weaviate.classes.query import Filter

# Single filter
response = articles.query.near_text(
    query="technology",
    filters=Filter.by_property("category").equal("tech"),
    limit=5
)

# Combined filters
response = articles.query.near_text(
    query="technology",
    filters=(
        Filter.by_property("category").equal("tech") &
        Filter.by_property("published").equal(True)
    ),
    limit=5
)
```

## Aggregations

```python
response = articles.aggregate.over_all(total_count=True)
print(f"Total articles: {response.total_count}")
```

## Important Patterns

### Always Close Connections
```python
try:
    # Your code here
finally:
    client.close()
```

### Or Use Context Manager
```python
with weaviate.connect_to_weaviate_cloud(...) as client:
    # Client auto-closes when block exits
```

### Error Handling
```python
from weaviate.exceptions import WeaviateConnectionError

try:
    client = weaviate.connect_to_weaviate_cloud(...)
except WeaviateConnectionError as e:
    print(f"Connection failed: {e}")
```

## Migration from v3

The v4 client has significant API changes:
- `client.schema.create_class()` → `client.collections.create()`
- `client.data_object.create()` → `collection.data.insert()`
- `client.query.get()` → `collection.query.fetch_objects()`

See the [migration guide](https://weaviate.io/developers/weaviate/client-libraries/python/v3_v4_migration) for details.
