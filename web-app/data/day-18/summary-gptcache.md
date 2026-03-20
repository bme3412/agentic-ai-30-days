# GPTCache - Summary

GPTCache is a specialized open-source library for caching LLM responses with semantic similarity matching, offering more flexibility than built-in LangChain caching.

## Installation

```bash
pip install gptcache
```

## Architecture Components

### 1. Embedding Function
Converts queries to vectors for similarity comparison.

```python
from gptcache.embedding import OpenAI, Onnx, Huggingface

# OpenAI embeddings (API cost)
embedding = OpenAI()

# Local ONNX model (free, fast)
embedding = Onnx()

# Hugging Face models
embedding = Huggingface(model="sentence-transformers/all-MiniLM-L6-v2")
```

### 2. Cache Storage
Where cache metadata is stored.

```python
from gptcache.manager import CacheBase

# SQLite (local)
cache_base = CacheBase("sqlite")

# Redis (distributed)
cache_base = CacheBase("redis", redis_config={"host": "localhost", "port": 6379})
```

### 3. Vector Store
Where embeddings are indexed for similarity search.

```python
from gptcache.manager import VectorBase

# FAISS (in-memory)
vector_base = VectorBase("faiss", dimension=768)

# Redis (persistent)
vector_base = VectorBase("redis", dimension=768, redis_config={...})

# Milvus (production-scale)
vector_base = VectorBase("milvus", dimension=768)
```

### 4. Similarity Evaluation
Determines if a cache hit is valid.

```python
from gptcache.similarity_evaluation import SearchDistanceEvaluation

# Default: distance-based
eval_func = SearchDistanceEvaluation()

# Custom logic
class CustomEval(SimilarityEvaluation):
    def evaluation(self, src_dict, cache_dict, **kwargs):
        # Return 0-1 similarity score
        pass
```

## Complete Setup

```python
from gptcache import cache
from gptcache.manager import get_data_manager

data_manager = get_data_manager(cache_base, vector_base)

cache.init(
    embedding_func=embedding.to_embeddings,
    data_manager=data_manager,
    similarity_evaluation=eval_func
)
```

## OpenAI Integration

```python
from gptcache.adapter import openai

# Use cached OpenAI client
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}]
)
```

## Statistics

```python
print(cache.report.hint_cache_count)  # Hits
print(cache.report.miss_cache_count)  # Misses
cache.report.reset()  # Reset stats
```

## Pre-warming Cache

```python
for question, answer in common_qa_pairs:
    embedding = embedding_func.to_embeddings(question)
    cache.data_manager.save(question, answer, embedding)
```

## Key Benefits

- **Multiple backends**: FAISS, Redis, Milvus, Qdrant
- **Flexible embeddings**: OpenAI, local ONNX, Hugging Face
- **Custom similarity logic**: Domain-specific matching rules
- **Built-in statistics**: Track hits/misses automatically
- **Drop-in replacement**: Works with existing OpenAI code

## Comparison with LangChain

| Feature | GPTCache | LangChain |
|---------|----------|-----------|
| Embedding options | Many | OpenAI-focused |
| Backend flexibility | High | Moderate |
| Custom similarity | Yes | Limited |
| Statistics | Built-in | Manual |
| Setup complexity | More | Less |
