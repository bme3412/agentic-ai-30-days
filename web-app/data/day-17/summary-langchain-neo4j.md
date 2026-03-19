# LangChain Neo4j Integration

## Overview

LangChain provides comprehensive Neo4j integration through `langchain-community`, enabling natural language queries against graph databases, vector search on graph nodes, and automated Cypher generation.

## Installation

```bash
pip install langchain-community neo4j
# For vector search
pip install langchain-openai
```

## Core Components

### Neo4jGraph

The primary interface for connecting to Neo4j and executing queries:

```python
from langchain_community.graphs import Neo4jGraph

graph = Neo4jGraph(
    url="bolt://localhost:7687",           # Local
    # url="neo4j+s://xxx.databases.neo4j.io",  # Aura cloud
    username="neo4j",
    password="password"
)

# Schema is auto-discovered
print(graph.schema)
# Node properties:
#   Person {name: STRING, title: STRING}
#   Company {name: STRING, industry: STRING}
# Relationships:
#   (:Person)-[:WORKS_AT]->(:Company)

# Execute Cypher directly
results = graph.query("""
    MATCH (p:Person)-[:WORKS_AT]->(c:Company)
    RETURN p.name, c.name
    LIMIT 10
""")
```

### GraphCypherQAChain

Translates natural language questions to Cypher queries:

```python
from langchain_openai import ChatOpenAI
from langchain.chains import GraphCypherQAChain

llm = ChatOpenAI(model="gpt-4o", temperature=0)

chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True,             # See generated Cypher
    validate_cypher=True,     # Validate syntax before execution
    return_intermediate_steps=True,
    top_k=10                  # Limit results
)

result = chain.invoke({"query": "Who works at AI companies?"})
print(result["result"])
print(result["intermediate_steps"])  # See the Cypher
```

### Neo4jVector

Vector similarity search on graph nodes:

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Neo4jVector

# Create vector index from existing graph
vector_store = Neo4jVector.from_existing_graph(
    embedding=OpenAIEmbeddings(),
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    index_name="person_index",
    node_label="Person",
    text_node_properties=["name", "bio", "skills"],
    embedding_node_property="embedding"
)

# Similarity search
results = vector_store.similarity_search("machine learning experts", k=5)
for doc in results:
    print(doc.page_content, doc.metadata)
```

## Advanced Patterns

### Custom Cypher Prompts

Provide better context for Cypher generation:

```python
from langchain.prompts import PromptTemplate

CYPHER_GENERATION_TEMPLATE = """
Task: Generate a Cypher query to answer the question.

Schema:
{schema}

Instructions:
- Use only the relationship types and properties in the schema
- Do not use any properties or relationships not in the schema
- For string matching, use CONTAINS or STARTS WITH instead of =

Examples:
Q: Find engineers at TechCorp
MATCH (p:Person {{title: "Engineer"}})-[:WORKS_AT]->(c:Company {{name: "TechCorp"}})
RETURN p.name

Question: {question}
Cypher query:
"""

prompt = PromptTemplate(
    template=CYPHER_GENERATION_TEMPLATE,
    input_variables=["schema", "question"]
)

chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    cypher_prompt=prompt,
    verbose=True
)
```

### Hybrid Retrieval (Vector + Graph)

Combine semantic search with graph expansion:

```python
def hybrid_retrieve(query: str, k: int = 5, hops: int = 1):
    # Step 1: Vector search
    similar = vector_store.similarity_search(query, k=k)
    names = [doc.metadata.get("name") for doc in similar]

    # Step 2: Graph expansion
    expanded = graph.query(f"""
        MATCH (n:Person)
        WHERE n.name IN {names}
        OPTIONAL MATCH (n)-[r*1..{hops}]-(connected)
        RETURN n, collect(DISTINCT connected) as neighborhood
    """)

    return expanded
```

### Loading Graph Documents

Add extracted entities to Neo4j:

```python
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_core.documents import Document

transformer = LLMGraphTransformer(
    llm=llm,
    allowed_nodes=["Person", "Company"],
    allowed_relationships=["WORKS_AT", "FOUNDED"]
)

documents = [Document(page_content="Alice founded TechCorp in 2020")]
graph_docs = transformer.convert_to_graph_documents(documents)

# Load into Neo4j
graph.add_graph_documents(
    graph_docs,
    baseEntityLabel=True,    # Add 'Entity' label
    include_source=True      # Link to source doc
)
```

## Configuration Options

### GraphCypherQAChain Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `validate_cypher` | Check Cypher syntax before execution | False |
| `return_intermediate_steps` | Include generated Cypher in response | False |
| `top_k` | Limit query results | 10 |
| `return_direct` | Return raw Cypher results without LLM summarization | False |
| `cypher_prompt` | Custom prompt for Cypher generation | Default |
| `qa_prompt` | Custom prompt for answer generation | Default |

### Neo4jGraph Options

| Parameter | Description |
|-----------|-------------|
| `url` | Connection URL (bolt:// or neo4j+s://) |
| `username` | Database username |
| `password` | Database password |
| `database` | Database name (default: neo4j) |
| `refresh_schema` | Force schema refresh |

## Error Handling

```python
from langchain.callbacks import get_openai_callback

class RobustGraphQA:
    def __init__(self, chain):
        self.chain = chain

    def query(self, question: str, max_retries: int = 3):
        for attempt in range(max_retries):
            try:
                with get_openai_callback() as cb:
                    result = self.chain.invoke({"query": question})
                    print(f"Tokens used: {cb.total_tokens}")
                    return result
            except Exception as e:
                if attempt == max_retries - 1:
                    return {"result": f"Failed: {e}", "error": True}
                # Retry with rephrased question
                question = f"Try again: {question}"
```

## Best Practices

1. **Use temperature=0** for consistent Cypher generation
2. **Validate Cypher** during development (`validate_cypher=True`)
3. **Review intermediate steps** to debug bad queries
4. **Provide schema context** via custom prompts
5. **Limit results** with `top_k` to control token usage
6. **Use parameterized queries** to prevent injection
7. **Cache common queries** for performance

## References

- [LangChain Neo4j Docs](https://python.langchain.com/docs/integrations/graphs/neo4j_cypher/)
- [Neo4jVector Reference](https://python.langchain.com/docs/integrations/vectorstores/neo4jvector/)
- [Graph Transformers](https://python.langchain.com/docs/use_cases/graph/constructing/)
