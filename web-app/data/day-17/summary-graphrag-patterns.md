# GraphRAG Patterns and Best Practices

## Overview

GraphRAG (Graph Retrieval-Augmented Generation) combines knowledge graphs with LLMs to enable reasoning over connected data. Unlike traditional RAG that retrieves isolated chunks, GraphRAG traverses relationships to provide comprehensive context.

## Why GraphRAG?

### Limitations of Vector-Only RAG

Vector search excels at semantic similarity but fails with:
- **Relationship queries**: "Who reports to Alice?"
- **Multi-hop reasoning**: "Find suppliers of our vendors"
- **Aggregations**: "Count employees per department"
- **Negations**: "Companies NOT in healthcare"

### GraphRAG Advantages

- **Explicit relationships**: Traverse typed connections
- **Multi-hop queries**: Follow paths across entities
- **Precise filtering**: Exact property matching
- **Structured answers**: Return entities, not chunks

## Core Patterns

### Pattern 1: Natural Language to Cypher

Convert questions to graph queries using LLMs:

```python
from langchain.chains import GraphCypherQAChain

chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True
)

# User asks: "Who works at companies in healthcare?"
# LLM generates: MATCH (p:Person)-[:WORKS_AT]->(c:Company {industry: "healthcare"})
#                RETURN p.name, c.name
result = chain.invoke({"query": "Who works at companies in healthcare?"})
```

### Pattern 2: Vector Search + Graph Expansion

Find relevant nodes semantically, then expand via relationships:

```python
def semantic_then_expand(query: str, k: int = 5, hops: int = 2):
    # Step 1: Find semantically similar nodes
    similar_nodes = vector_store.similarity_search(query, k=k)
    node_ids = [n.metadata['id'] for n in similar_nodes]

    # Step 2: Expand neighborhood via graph
    context = graph.query(f"""
        MATCH (n) WHERE n.id IN {node_ids}
        OPTIONAL MATCH path = (n)-[*1..{hops}]-(connected)
        RETURN n, collect(DISTINCT connected) as neighbors
    """)

    return context
```

### Pattern 3: Structured Entity Extraction

Extract entities from queries, then resolve to graph nodes:

```python
def entity_extraction_rag(query: str):
    # Extract entities from query
    extraction_prompt = f"""
    Extract entities from this query:
    Query: {query}

    Return JSON: {{"people": [], "companies": [], "concepts": []}}
    """
    entities = llm.invoke(extraction_prompt)

    # Resolve entities to graph nodes
    for person in entities.get("people", []):
        matches = graph.query("""
            MATCH (p:Person)
            WHERE p.name CONTAINS $name
            RETURN p
        """, {"name": person})

    # Build context from matched nodes
    # ...
```

### Pattern 4: Question Decomposition

Break complex questions into sub-queries:

```python
def decompose_and_answer(question: str):
    # Decompose complex question
    decomposition_prompt = f"""
    Break this question into simpler sub-questions:
    Question: {question}

    Return a list of simpler questions that together answer the original.
    """
    sub_questions = llm.invoke(decomposition_prompt)

    # Answer each sub-question
    partial_answers = []
    for sub_q in sub_questions:
        result = chain.invoke({"query": sub_q})
        partial_answers.append(result["result"])

    # Synthesize final answer
    synthesis_prompt = f"""
    Original question: {question}
    Partial answers: {partial_answers}

    Synthesize a complete answer.
    """
    return llm.invoke(synthesis_prompt)
```

### Pattern 5: Contextual Graph Retrieval

Include graph context in the prompt:

```python
def rag_with_graph_context(query: str):
    # Get relevant subgraph
    subgraph = graph.query("""
        MATCH (n)-[r]-(m)
        WHERE n.name CONTAINS $query_term OR m.name CONTAINS $query_term
        RETURN n, type(r) as rel, m
        LIMIT 50
    """, {"query_term": extract_key_term(query)})

    # Format as context
    context = format_subgraph_as_text(subgraph)

    # Generate answer with context
    prompt = f"""
    Knowledge Graph Context:
    {context}

    Question: {query}

    Answer based on the graph context above:
    """
    return llm.invoke(prompt)
```

## Hybrid Architectures

### Architecture 1: Router-Based

Route queries to appropriate backend:

```
User Query
    |
    v
Query Classifier
    |
    +---> Graph Query (relationship questions)
    |         |
    |         v
    |     Cypher Generation
    |
    +---> Vector Query (semantic search)
    |         |
    |         v
    |     Embedding Search
    |
    +---> Hybrid (complex questions)
              |
              v
          Both backends
```

### Architecture 2: Ensemble Retrieval

Combine results from multiple sources:

```python
def ensemble_retrieve(query: str):
    # Retrieve from multiple sources
    graph_results = graph_chain.invoke({"query": query})
    vector_results = vector_store.similarity_search(query, k=5)

    # Merge and deduplicate
    all_context = merge_results(graph_results, vector_results)

    # Generate answer
    return generate_answer(query, all_context)
```

### Architecture 3: Iterative Refinement

Use graph structure to refine retrieval:

```python
def iterative_rag(query: str, iterations: int = 3):
    context = []

    for i in range(iterations):
        # Generate sub-query based on current context
        if context:
            sub_query = refine_query(query, context)
        else:
            sub_query = query

        # Retrieve new information
        new_info = retrieve_from_graph(sub_query)
        context.extend(new_info)

        # Check if we have enough context
        if is_sufficient(context, query):
            break

    return generate_answer(query, context)
```

## Performance Optimization

### Caching Strategies

```python
from functools import lru_cache
import hashlib

class CachedGraphRAG:
    def __init__(self):
        self.query_cache = {}
        self.embedding_cache = {}

    def _query_key(self, query: str) -> str:
        return hashlib.md5(query.lower().strip().encode()).hexdigest()

    def cached_query(self, query: str):
        key = self._query_key(query)
        if key not in self.query_cache:
            self.query_cache[key] = self.chain.invoke({"query": query})
        return self.query_cache[key]
```

### Query Optimization

```python
# Bad: Unbounded traversal
graph.query("MATCH (n)-[*]-(m) RETURN n, m")  # Explosion!

# Good: Bounded with limits
graph.query("""
    MATCH (n:Person {name: $name})-[*1..3]-(m)
    RETURN n, collect(DISTINCT m)[..100]
""", {"name": "Alice"})
```

### Batch Processing

```python
async def batch_retrieve(queries: list[str]):
    tasks = [retrieve_async(q) for q in queries]
    results = await asyncio.gather(*tasks)
    return results
```

## Evaluation Metrics

### Retrieval Quality

- **Precision**: Relevant nodes / Retrieved nodes
- **Recall**: Retrieved relevant / All relevant
- **Path accuracy**: Correct relationship traversals

### Answer Quality

- **Factual correctness**: Verifiable against graph
- **Completeness**: All relevant entities mentioned
- **Coherence**: Logical answer structure

### System Metrics

- **Latency**: Query-to-answer time
- **Token efficiency**: Tokens per query
- **Cache hit rate**: Cached / Total queries

## Common Pitfalls

1. **Overly complex Cypher**: LLMs generate verbose queries
2. **Schema drift**: Graph changes, prompts don't update
3. **Entity ambiguity**: "Apple" = company or fruit?
4. **Token overflow**: Too much graph context
5. **Hallucinated relationships**: LLM invents non-existent connections

## Best Practices

1. **Keep schema updated** in prompts
2. **Validate Cypher** before execution
3. **Limit traversal depth** (max 3-4 hops)
4. **Use specific node labels** in queries
5. **Cache common patterns**
6. **Monitor query latency**
7. **Test with edge cases**

## References

- [Microsoft GraphRAG](https://github.com/microsoft/graphrag)
- [Neo4j GenAI Ecosystem](https://neo4j.com/labs/genai-ecosystem/)
- [LangChain Graph Integrations](https://python.langchain.com/docs/integrations/graphs/)
