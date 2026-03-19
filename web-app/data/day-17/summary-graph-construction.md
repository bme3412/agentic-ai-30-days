# Building Knowledge Graphs from Text

## Overview

Constructing knowledge graphs from unstructured text involves extracting entities (nodes) and relationships (edges) using NLP techniques, often powered by LLMs. This process transforms documents into queryable, connected data.

## The Extraction Pipeline

```
Documents → Entity Extraction → Relationship Extraction → Entity Resolution → Graph Loading
```

### 1. Entity Extraction

Identify named entities in text:

```python
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_openai import ChatOpenAI
from langchain_core.documents import Document

llm = ChatOpenAI(model="gpt-4o", temperature=0)

transformer = LLMGraphTransformer(
    llm=llm,
    allowed_nodes=["Person", "Company", "Product", "Technology"],
    node_properties=["description", "founded_date"]
)

documents = [
    Document(page_content="""
        Sarah Chen founded NeuralTech in 2022. The company
        develops computer vision products using PyTorch.
    """)
]

graph_docs = transformer.convert_to_graph_documents(documents)

# Extracted nodes:
# Person: Sarah Chen
# Company: NeuralTech
# Product: computer vision products
# Technology: PyTorch
```

### 2. Relationship Extraction

Identify how entities are connected:

```python
transformer = LLMGraphTransformer(
    llm=llm,
    allowed_nodes=["Person", "Company", "Product"],
    allowed_relationships=[
        "FOUNDED",
        "WORKS_AT",
        "DEVELOPS",
        "USES",
        "COMPETES_WITH"
    ],
    relationship_properties=["since", "context"]
)

# Extracted relationships:
# (Sarah Chen)-[:FOUNDED {since: 2022}]->(NeuralTech)
# (NeuralTech)-[:DEVELOPS]->(computer vision products)
# (NeuralTech)-[:USES]->(PyTorch)
```

### 3. Entity Resolution

Merge duplicate entities referring to the same real-world object:

```python
def resolve_entities(graph):
    """Find and merge duplicate entities."""

    # Find potential duplicates
    candidates = graph.query("""
        MATCH (a:Person), (b:Person)
        WHERE a <> b
        AND (
            a.name CONTAINS b.name OR
            b.name CONTAINS a.name OR
            apoc.text.levenshteinSimilarity(a.name, b.name) > 0.8
        )
        RETURN a, b
    """)

    for pair in candidates:
        # Use LLM to decide if same entity
        decision = llm.invoke(f"""
            Are these the same person?
            Entity 1: {pair['a']}
            Entity 2: {pair['b']}
            Answer YES or NO.
        """)

        if "YES" in decision.content:
            merge_entities(pair['a'], pair['b'])

def merge_entities(primary, duplicate):
    """Merge duplicate into primary, transferring relationships."""
    graph.query("""
        MATCH (dup {id: $dup_id})
        MATCH (primary {id: $primary_id})

        // Transfer incoming relationships
        MATCH (dup)<-[r]-()
        WITH dup, primary, collect(r) as rels
        FOREACH (r IN rels |
            CREATE (primary)<-[newR:RELATED]-(startNode(r))
            SET newR = properties(r)
        )

        // Delete duplicate
        DETACH DELETE dup
    """, {"dup_id": duplicate['id'], "primary_id": primary['id']})
```

### 4. Graph Loading

Insert extracted data into Neo4j:

```python
from langchain_community.graphs import Neo4jGraph

graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password"
)

# Load graph documents
graph.add_graph_documents(
    graph_docs,
    baseEntityLabel=True,    # Add 'Entity' to all nodes
    include_source=True      # Link to source document
)

# Verify
result = graph.query("""
    MATCH (n)
    RETURN labels(n) as labels, count(*) as count
""")
print(result)
```

## Advanced Extraction Techniques

### Schema-Guided Extraction

Provide explicit schema constraints:

```python
EXTRACTION_PROMPT = """
Extract entities and relationships from the text below.

Schema:
- Node types: Person, Company, Product
- Relationship types:
  - FOUNDED: Person founded Company
  - WORKS_AT: Person works at Company
  - DEVELOPS: Company develops Product

Rules:
- Only extract entities matching the schema
- Include confidence scores (high/medium/low)
- Mark uncertain extractions

Text: {text}

Return JSON:
{{
    "nodes": [
        {{"id": "...", "type": "...", "properties": {{}}, "confidence": "..."}}
    ],
    "relationships": [
        {{"source": "...", "type": "...", "target": "...", "confidence": "..."}}
    ]
}}
"""
```

### Coreference Resolution

Resolve pronouns and references:

```python
def resolve_coreferences(text: str) -> str:
    """Replace pronouns with their referents."""
    prompt = f"""
    Rewrite this text replacing all pronouns with the entities they refer to.

    Original: {text}

    Rewritten (no pronouns):
    """
    return llm.invoke(prompt).content

# Before: "She founded the company. It grew quickly."
# After: "Sarah Chen founded NeuralTech. NeuralTech grew quickly."
```

### Incremental Extraction

Process documents in batches, updating the graph:

```python
async def process_document_batch(documents: list[Document]):
    """Process documents incrementally."""

    for doc in documents:
        # Extract
        graph_doc = transformer.convert_to_graph_documents([doc])[0]

        # Use MERGE to avoid duplicates
        for node in graph_doc.nodes:
            graph.query(f"""
                MERGE (n:{node.type} {{id: $id}})
                ON CREATE SET n += $props, n.created = timestamp()
                ON MATCH SET n += $props, n.updated = timestamp()
            """, {"id": node.id, "props": node.properties})

        for rel in graph_doc.relationships:
            graph.query(f"""
                MATCH (s {{id: $source}})
                MATCH (t {{id: $target}})
                MERGE (s)-[r:{rel.type}]->(t)
                SET r += $props
            """, {
                "source": rel.source.id,
                "target": rel.target.id,
                "props": rel.properties
            })
```

## Quality Control

### Validation Rules

```python
def validate_extraction(graph_doc):
    """Validate extracted graph before loading."""
    errors = []

    for node in graph_doc.nodes:
        # Check required properties
        if not node.id:
            errors.append(f"Node missing ID: {node}")

        # Check type is allowed
        if node.type not in ALLOWED_TYPES:
            errors.append(f"Invalid node type: {node.type}")

    for rel in graph_doc.relationships:
        # Check relationship has valid endpoints
        if not rel.source or not rel.target:
            errors.append(f"Relationship missing endpoint: {rel}")

    return errors
```

### Human-in-the-Loop

Review uncertain extractions:

```python
def extract_with_review(documents: list[Document], confidence_threshold: float = 0.7):
    """Extract with human review for low-confidence items."""

    for doc in documents:
        extractions = extract_with_confidence(doc)

        high_confidence = [e for e in extractions if e['confidence'] >= confidence_threshold]
        low_confidence = [e for e in extractions if e['confidence'] < confidence_threshold]

        # Auto-approve high confidence
        for extraction in high_confidence:
            load_to_graph(extraction)

        # Queue low confidence for review
        if low_confidence:
            queue_for_review(doc, low_confidence)
```

## Neo4j LLM Graph Builder

Neo4j provides a tool for automated graph construction:

```python
# Using Neo4j's Graph Builder (requires Neo4j GenAI stack)
from neo4j_genai.llm import OpenAILLM
from neo4j_genai.pipeline import Pipeline

llm = OpenAILLM(model_name="gpt-4o")
driver = neo4j.GraphDatabase.driver(uri, auth=(user, password))

pipeline = Pipeline(
    llm=llm,
    driver=driver,
    from_pdf=True,       # Can process PDFs directly
    schema=custom_schema  # Optional schema constraints
)

# Process documents
pipeline.run(documents=["report.pdf", "article.txt"])
```

## Best Practices

1. **Define clear schema** before extraction
2. **Use high-quality LLMs** (GPT-4 class) for better accuracy
3. **Implement entity resolution** to avoid duplicates
4. **Validate extractions** before loading
5. **Track provenance** (link nodes to source documents)
6. **Handle errors gracefully** (partial extractions are okay)
7. **Monitor extraction quality** over time

## Common Challenges

| Challenge | Solution |
|-----------|----------|
| Duplicate entities | Entity resolution with fuzzy matching |
| Missed relationships | Improve prompts, add examples |
| Wrong entity types | Stricter schema constraints |
| Hallucinated entities | Require evidence from source text |
| Scale | Batch processing, async extraction |

## References

- [Neo4j LLM Graph Builder](https://neo4j.com/labs/genai-ecosystem/llm-graph-builder/)
- [LangChain Graph Transformers](https://python.langchain.com/docs/use_cases/graph/constructing/)
- [Entity Resolution Techniques](https://neo4j.com/developer/kb/entity-resolution/)
