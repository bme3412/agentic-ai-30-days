# Redis Vector Similarity Search - Summary

Redis Stack provides powerful vector similarity search capabilities through the RediSearch module, making it ideal for semantic caching and other AI applications requiring fast similarity lookups.

## Key Concepts

### Vector Indexing
- **HNSW Algorithm**: Hierarchical Navigable Small World graphs provide fast approximate nearest neighbor search
- **FLAT Index**: Brute-force exact search, slower but 100% accurate
- **Supported Distance Metrics**: COSINE (most common for embeddings), L2 (Euclidean), IP (Inner Product)

### Creating a Vector Index

```redis
FT.CREATE my_index ON HASH PREFIX 1 doc:
SCHEMA
  content TEXT
  embedding VECTOR HNSW 6 TYPE FLOAT32 DIM 1536 DISTANCE_METRIC COSINE
```

Key parameters:
- **DIM**: Must match your embedding model's output dimension
- **TYPE**: FLOAT32 or FLOAT64
- **M**: HNSW parameter controlling graph connectivity (default: 16)
- **EF_CONSTRUCTION**: Build-time accuracy (default: 200)

### KNN Queries

```redis
FT.SEARCH my_index "*=>[KNN 5 @embedding $vec AS score]"
  PARAMS 2 vec <embedding_bytes>
  RETURN 2 content score
  DIALECT 2
```

- Always use DIALECT 2 for vector queries
- Redis returns **distance**, not similarity (convert: `similarity = 1 - distance`)
- Use SORTBY to order by score

## Best Practices

1. **Dimension Matching**: Index DIM must exactly match embedding model output
2. **Batch Indexing**: Use pipelining for bulk inserts
3. **Memory Planning**: Each vector uses ~4 bytes × dimensions
4. **Hybrid Queries**: Combine vector search with text/tag filters

## Performance Considerations

- HNSW queries are sub-millisecond for millions of vectors
- Index creation is memory-intensive; plan capacity accordingly
- Use EF_RUNTIME parameter for query-time accuracy tuning

## Resources

- [Redis Vector Search Documentation](https://redis.io/docs/interact/search-and-query/search/vectors/)
- [RediSearch Commands Reference](https://redis.io/commands/?group=search)
