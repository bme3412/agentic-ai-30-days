import type { Day } from '../../types';

export const day17: Day = {
  day: 17,
  phase: 3,
  title: "Knowledge Graphs for Agents",
  partner: "Neo4j",
  tags: ["neo4j", "graphrag", "knowledge-graphs", "cypher", "relationships"],
  concept: "Graph-based knowledge representation for complex reasoning over connected data",
  demoUrl: "demos/day-17/",
  demoDescription: "Explore knowledge graphs interactively: visualize entity relationships, run Cypher queries, compare GraphRAG vs traditional RAG, and build graph-enhanced agents.",

  lesson: {
    overview: `Vector databases excel at finding semantically similar content, but they treat each document as an isolated chunk. Real-world knowledge isn't isolated—it's interconnected. People work at companies, companies operate in industries, products have features, and events have causes and effects. Knowledge graphs capture these relationships explicitly, enabling agents to reason over connections that vector search misses entirely.

**GraphRAG** (Graph Retrieval-Augmented Generation) combines the relationship-awareness of knowledge graphs with the semantic understanding of LLMs. Instead of just retrieving similar text chunks, agents can traverse relationships: "Find all products made by companies that Alice has worked for" or "What regulatory requirements apply to this drug's ingredients?" These multi-hop queries are impossible with vector search alone.

Neo4j is the leading graph database, and its integration with LangChain makes building graph-enhanced agents straightforward. Today we explore how to model domain knowledge as graphs, query them with Cypher, and build agents that combine graph traversal with natural language understanding.

**Why This Matters**: Enterprise knowledge is inherently connected. Customer relationships, supply chains, organizational hierarchies, compliance requirements—all are naturally graph-shaped. Agents that understand these connections can answer questions that stump traditional RAG systems.`,

    principles: [
      {
        title: "Relationships Are First-Class Citizens",
        description: "In graph databases, relationships are as important as the data itself. A person WORKS_AT a company, a product CONTAINS ingredients, an event CAUSED another event. These typed, directional relationships enable precise queries impossible in relational or document databases."
      },
      {
        title: "Multi-Hop Reasoning",
        description: "Graphs enable traversal across multiple relationship hops. 'Find friends of friends who work in AI' requires following two KNOWS relationships and one WORKS_IN relationship. Vector search cannot express these connected queries."
      },
      {
        title: "Schema Flexibility with Structure",
        description: "Unlike rigid relational schemas, graph databases allow heterogeneous node types and relationships to coexist. Yet unlike document stores, they maintain explicit structure. This balance is ideal for evolving domain models."
      },
      {
        title: "Cypher: SQL for Graphs",
        description: "Cypher is Neo4j's declarative query language. Its ASCII-art syntax makes relationship patterns readable: (person)-[:WORKS_AT]->(company)-[:IN_INDUSTRY]->(industry). Complex graph traversals become intuitive queries."
      },
      {
        title: "Hybrid Retrieval",
        description: "The most powerful systems combine vector similarity with graph traversal. Find semantically relevant nodes via embeddings, then expand context by traversing relationships. This hybrid approach captures both meaning and structure."
      }
    ],

    codeExample: {
      language: "python",
      title: "Neo4j GraphRAG Agent with LangChain",
      code: `from langchain_community.graphs import Neo4jGraph
from langchain_openai import ChatOpenAI
from langchain.chains import GraphCypherQAChain

# Connect to Neo4j
graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password"
)

# Inspect the schema
print(graph.schema)
# Node properties: Person {name, title}, Company {name, industry}
# Relationships: WORKS_AT, MANAGES, PARTNERS_WITH

# Create a GraphRAG chain
llm = ChatOpenAI(model="gpt-4o", temperature=0)

chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True,
    validate_cypher=True,  # Catches syntax errors
    return_intermediate_steps=True  # See generated Cypher
)

# Natural language to Cypher to answer
result = chain.invoke({
    "query": "Who manages people at companies in the healthcare industry?"
})

print(result["result"])
# Shows managers and their reports at healthcare companies

# Check the generated Cypher
print(result["intermediate_steps"])
# MATCH (m:Person)-[:MANAGES]->(p:Person)-[:WORKS_AT]->(c:Company)
# WHERE c.industry = 'healthcare'
# RETURN m.name, p.name, c.name`
    },

    diagram: {
      type: "mermaid",
      title: "Knowledge Graph Architecture for Agents",
      mermaid: `flowchart TB
    subgraph Query["User Query"]
        Q["Who are the key suppliers<br/>for our medical devices?"]
    end

    subgraph Agent["GraphRAG Agent"]
        NLU["Natural Language<br/>Understanding"]
        CG["Cypher Generation"]
        GQ["Graph Query<br/>Execution"]
        CTX["Context<br/>Assembly"]
        LLM["LLM Response<br/>Generation"]
    end

    subgraph Neo4j["Neo4j Knowledge Graph"]
        subgraph Nodes["Nodes"]
            P["Products"]
            C["Companies"]
            S["Suppliers"]
            R["Regulations"]
        end
        subgraph Rels["Relationships"]
            MAKES["MAKES"]
            SUPPLIES["SUPPLIES"]
            COMPLIES["COMPLIES_WITH"]
        end
    end

    Q --> NLU
    NLU --> CG
    CG --> |"MATCH (s:Supplier)-[:SUPPLIES]-><br/>(p:Product {category: 'medical'})<br/>RETURN s"| GQ
    GQ --> Neo4j
    Neo4j --> CTX
    CTX --> LLM
    LLM --> Response["Structured answer with<br/>supplier relationships"]`
    },

    keyTakeaways: [
      "Knowledge graphs store entities (nodes) and their relationships (edges) explicitly, enabling multi-hop reasoning",
      "Cypher is Neo4j's query language—use ASCII-art patterns like (a)-[:REL]->(b) to express graph traversals",
      "GraphCypherQAChain translates natural language questions to Cypher queries automatically",
      "Graph schemas define node labels, properties, and relationship types—inspect with graph.schema",
      "Combine vector search (semantic similarity) with graph traversal (relationship following) for hybrid retrieval",
      "Knowledge graphs excel at questions involving connections: 'who knows whom', 'what depends on what', 'how are X and Y related'"
    ],

    resources: [
      {
        title: "Neo4j GraphRAG Documentation",
        url: "https://neo4j.com/docs/cypher-manual/current/",
        type: "docs",
        description: "Official Neo4j Cypher manual covering query syntax, patterns, and best practices",
        summaryPath: "data/day-17/summary-cypher-fundamentals.md"
      },
      {
        title: "LangChain Neo4j Integration",
        url: "https://python.langchain.com/docs/integrations/graphs/neo4j_cypher/",
        type: "docs",
        description: "LangChain documentation for Neo4jGraph and GraphCypherQAChain",
        summaryPath: "data/day-17/summary-langchain-neo4j.md"
      },
      {
        title: "GraphRAG: Knowledge Graphs Meet LLMs",
        url: "https://neo4j.com/developer-blog/knowledge-graph-rag-application/",
        type: "article",
        description: "Neo4j blog post on building RAG applications with knowledge graphs",
        summaryPath: "data/day-17/summary-graphrag-patterns.md"
      },
      {
        title: "Building Knowledge Graphs from Text",
        url: "https://neo4j.com/labs/genai-ecosystem/llm-graph-builder/",
        type: "tool",
        description: "Neo4j's LLM Graph Builder for extracting entities and relationships from unstructured text",
        summaryPath: "data/day-17/summary-graph-construction.md"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Knowledge graphs represent information as interconnected entities and relationships, enabling agents to reason over complex, connected data that vector search alone cannot handle.",
      fullDescription: `Traditional RAG systems treat documents as isolated chunks. You embed them, store them in a vector database, and retrieve the most semantically similar pieces. This works well for questions answerable from a single passage, but fails when answers require connecting information across multiple sources.

Consider a question like "Which of our suppliers have had regulatory issues in the past year?" Answering this requires:
1. Knowing which companies are our suppliers (a relationship)
2. Knowing what regulatory issues exist (entities)
3. Connecting suppliers to those issues (another relationship)
4. Filtering by time (a property)

Vector search finds similar text, but it cannot traverse these connections. A chunk about "Acme Corp regulatory fine" won't necessarily be retrieved when asking about "our suppliers" unless the chunk explicitly mentions both.

**Knowledge graphs solve this by making relationships explicit.** In a graph database:
- Nodes represent entities: companies, people, products, regulations
- Edges represent relationships: SUPPLIES, WORKS_AT, COMPLIES_WITH
- Properties store attributes: names, dates, amounts

This structure enables **Cypher queries** that traverse relationships:

\`\`\`cypher
MATCH (s:Supplier)-[:SUPPLIES]->(us:Company {name: "Our Company"})
MATCH (s)-[:RECEIVED]->(i:Issue {type: "regulatory"})
WHERE i.date > date() - duration('P1Y')
RETURN s.name, i.description, i.date
\`\`\`

**GraphRAG** combines this graph querying with LLM capabilities. The LLM translates natural language questions into Cypher, executes them against the graph, and generates human-readable answers from the results. This enables complex reasoning over interconnected enterprise data.

This lesson covers Neo4j fundamentals, Cypher query patterns, LangChain's graph integrations, and architectural patterns for building graph-enhanced agents.`,
      prerequisites: [
        "Day 14: Vector Databases for Agents (understanding embeddings and retrieval)",
        "Day 15: Building Agentic RAG Systems (RAG patterns)",
        "Day 16: Long-Term Agent Memory (persistence concepts)",
        "Basic SQL knowledge helpful but not required"
      ],
      estimatedTime: "3-4 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "Graph Data Model Fundamentals",
        description: `Knowledge graphs use a simple but powerful data model built on three primitives: nodes (entities), relationships (connections), and properties (attributes). This model, called the Labeled Property Graph (LPG), is fundamentally different from relational databases and uniquely suited for representing interconnected real-world data.

Traditional databases store data in tables (relational) or documents (NoSQL), but real-world knowledge is inherently connected. Consider an enterprise: employees work at companies, companies have products, products have components sourced from suppliers, suppliers operate in regions with regulatory requirements. These aren't isolated facts—they form a web of relationships. The key insight is that in graph databases, relationships are first-class citizens, stored and indexed just like the data itself. This makes traversing connections as fast as looking up a single record—a property called index-free adjacency.

Nodes represent discrete entities—things that exist in your domain. Each node can have labels that classify its type, and a node can have multiple labels (useful for inheritance-like patterns):

\`\`\`cypher
// Single label
CREATE (p:Person {name: "Alice"})

// Multiple labels: Alice is both a Person and an Executive
CREATE (a:Person:Executive {name: "Alice", title: "CEO"})

// Query any label
MATCH (e:Executive) RETURN e.name  // Finds Alice
MATCH (p:Person) RETURN p.name     // Also finds Alice
\`\`\`

Properties store attributes as key-value pairs. Unlike document databases, properties are flat (no nesting), but support rich types including strings, integers, floats, booleans, arrays, dates, and datetimes:

\`\`\`cypher
CREATE (p:Person {
  name: "Alice Chen",              // String
  age: 34,                         // Integer
  salary: 150000.00,               // Float
  active: true,                    // Boolean
  skills: ["Python", "ML", "Neo4j"], // Array
  joined: date("2023-01-15"),      // Date
  lastLogin: datetime()            // Datetime
})
\`\`\`

Relationships are what make graph databases powerful. Unlike foreign keys in SQL (which are just numbers), relationships in Neo4j are typed, directional, and can carry properties. The basic anatomy of a relationship includes the source node, the relationship type in brackets, and the target node:

\`\`\`cypher
// Basic relationship
(alice)-[:WORKS_AT]->(techcorp)

// With properties
(alice)-[:WORKS_AT {since: date("2023-01-15"), role: "CEO", fullTime: true}]->(techcorp)

// Direction matters for semantics but queries can traverse either way
(alice)-[:MANAGES]->(bob)      // Alice manages Bob
(bob)<-[:MANAGES]-(alice)      // Same relationship, queried from Bob's perspective
(alice)-[:MANAGES]-(bob)       // Undirected query: finds the relationship regardless of direction
\`\`\`

Common relationship patterns include hierarchical structures (org charts, taxonomies), temporal sequences (events, workflows), and associative connections (many-to-many with attributes):

\`\`\`cypher
// Hierarchical: org charts, taxonomies
(manager)-[:MANAGES]->(employee)
(category)-[:PARENT_OF]->(subcategory)

// Temporal: events, workflows
(event1)-[:FOLLOWED_BY]->(event2)
(task)-[:DEPENDS_ON]->(prerequisite)

// Associative: many-to-many with attributes
(person)-[:RATED {stars: 5, review: "Excellent!"}]->(product)
(user)-[:PURCHASED {date: date(), quantity: 2}]->(item)
\`\`\`

To understand the difference between graph and relational approaches, consider modeling a social network where people work at companies. In SQL, you need three tables and multiple JOINs:

\`\`\`sql
-- Tables
CREATE TABLE persons (id INT PRIMARY KEY, name VARCHAR(100));
CREATE TABLE companies (id INT PRIMARY KEY, name VARCHAR(100), industry VARCHAR(50));
CREATE TABLE employment (person_id INT, company_id INT, since DATE, role VARCHAR(50));

-- Query: Find colleagues of Alice (people at same company)
SELECT DISTINCT p2.name
FROM persons p1
JOIN employment e1 ON p1.id = e1.person_id
JOIN employment e2 ON e1.company_id = e2.company_id
JOIN persons p2 ON e2.person_id = p2.id
WHERE p1.name = 'Alice' AND p2.name != 'Alice';
\`\`\`

In Cypher, the pattern you draw is the query:

\`\`\`cypher
MATCH (alice:Person {name: "Alice"})-[:WORKS_AT]->(company)<-[:WORKS_AT]-(colleague)
RETURN colleague.name
\`\`\`

The graph version is better for several reasons. First, readability: the Cypher query visually represents the data structure. Second, performance: JOINs get expensive as data grows while graph traversals are O(1) per hop. Third, flexibility: adding new relationship types doesn't require schema migrations. Fourth, multi-hop queries like "friends of friends of friends" are trivial in graphs but exponentially expensive in SQL.

Graphs excel at social networks and recommendations, fraud detection, knowledge management and semantic search, network and IT infrastructure mapping, supply chain and logistics, identity and access management, and real-time recommendations. However, graphs are overkill for simple CRUD applications, time-series data (use specialized time-series DBs), large-scale analytics (use columnar stores), and binary data storage (use object storage).

Here's a complete example modeling a tech company that demonstrates the property graph model in practice:

\`\`\`cypher
// Create the graph
CREATE (alice:Person:Executive {name: "Alice Chen", title: "CEO"})
CREATE (bob:Person:Engineer {name: "Bob Smith", title: "CTO", skills: ["Python", "ML"]})
CREATE (carol:Person:Engineer {name: "Carol Wu", title: "Senior Engineer"})
CREATE (techcorp:Company:Startup {name: "TechCorp", industry: "AI", founded: 2020})
CREATE (aibot:Product {name: "AIBot", category: "SaaS", mrr: 50000})
CREATE (pytorch:Technology {name: "PyTorch", category: "Framework"})

// Create relationships
CREATE (alice)-[:FOUNDED {date: date("2020-03-15")}]->(techcorp)
CREATE (alice)-[:WORKS_AT {since: date("2020-03-15"), role: "CEO"}]->(techcorp)
CREATE (bob)-[:WORKS_AT {since: date("2020-06-01"), role: "CTO"}]->(techcorp)
CREATE (carol)-[:WORKS_AT {since: date("2021-01-15"), role: "Engineer"}]->(techcorp)
CREATE (alice)-[:MANAGES]->(bob)
CREATE (bob)-[:MANAGES]->(carol)
CREATE (techcorp)-[:MAKES]->(aibot)
CREATE (aibot)-[:BUILT_WITH]->(pytorch)
CREATE (bob)-[:KNOWS {since: date("2019-01-01")}]->(carol)

// Now query: Who manages engineers that use PyTorch?
MATCH (manager)-[:MANAGES]->(eng:Engineer)-[:WORKS_AT]->(company)-[:MAKES]->(product)-[:BUILT_WITH]->(:Technology {name: "PyTorch"})
RETURN DISTINCT manager.name, eng.name, product.name
\`\`\`

This 4-hop traversal would require 4+ JOINs in SQL and be nearly unreadable. In Cypher, it's a single visual pattern.`,
        analogy: "Think of a graph database like a social network visualization. Each person is a node, and friend connections are relationships. You can visually trace paths: 'Alice knows Bob who knows Carol who works at TechCorp.' The database stores and queries this exact structure. But unlike a visualization tool, Neo4j can traverse millions of these connections in milliseconds—it's optimized for path-finding, not just display.",
        gotchas: [
          "Relationship direction matters when creating data but queries can traverse either way with -[:REL]-",
          "Labels are case-sensitive: Person and PERSON are different labels entirely",
          "Properties must be primitives or arrays of primitives—no nested objects (flatten them or use separate nodes)",
          "Neo4j is schema-optional but production systems should use constraints and indexes",
          "Nodes without relationships are valid but often indicate data modeling issues",
          "Self-relationships are allowed: (node)-[:RELATES_TO]->(node) for recursive structures"
        ]
      },
      {
        title: "Cypher Query Language Essentials",
        description: `Cypher is Neo4j's declarative query language, designed to be both human-readable and expressive for complex graph operations. Unlike SQL which describes what tables to join, Cypher describes patterns to match—the query literally looks like the structure you're searching for.

Cypher was designed around a simple principle: ASCII art patterns. When you write \`(a)-[:KNOWS]->(b)\`, you're drawing an arrow from node a to node b with relationship type KNOWS. This visual correspondence makes Cypher queries self-documenting. The language is declarative: you specify what you want, not how to get it. Neo4j's query planner optimizes execution automatically, choosing appropriate indexes and traversal strategies.

The MATCH clause finds patterns in the graph. Think of it as a template that Neo4j fills in with matching data:

\`\`\`cypher
// Basic node pattern - finds all Person nodes
MATCH (p:Person)
RETURN p.name, p.title

// Relationship pattern - finds the structure (person)-[works at]->(company)
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
RETURN p.name, c.name

// Inline property filter - equivalent to WHERE but more concise
MATCH (p:Person {title: "Engineer"})-[:WORKS_AT]->(c:Company {industry: "AI"})
RETURN p.name, c.name

// Capturing the relationship to access its properties
MATCH (p:Person)-[r:WORKS_AT]->(c:Company)
WHERE r.since > date("2022-01-01")
RETURN p.name, r.role, r.since, c.name
\`\`\`

Variables are bindings, not assignments. When you write \`(p:Person)\`, you're saying "bind any matching Person node to variable p". Using the same variable twice means "the same node":

\`\`\`cypher
// Find people who work at AND founded the same company
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
MATCH (p)-[:FOUNDED]->(c)  // Same p and c - must be the same nodes
RETURN p.name, c.name

// vs. different variables = potentially different nodes
MATCH (p1:Person)-[:WORKS_AT]->(c:Company)
MATCH (p2:Person)-[:FOUNDED]->(c)  // p2 might be different from p1
WHERE p1 <> p2
RETURN p1.name as employee, p2.name as founder, c.name
\`\`\`

Where Cypher really shines is traversing multiple relationships—queries that would require recursive CTEs or multiple JOINs in SQL:

\`\`\`cypher
// Fixed-length: exactly 2 hops (friends of friends)
MATCH (me:Person {name: "Alice"})-[:KNOWS]->(friend)-[:KNOWS]->(fof)
WHERE fof <> me AND NOT (me)-[:KNOWS]->(fof)  // Not already direct friends
RETURN DISTINCT fof.name as recommendation

// Variable-length: 1 to 4 hops with any relationship type
MATCH path = (start:Person {name: "Alice"})-[*1..4]-(connected:Person)
RETURN connected.name, length(path) as distance
ORDER BY distance

// Variable-length with specific relationship type
MATCH (start:Person {name: "Alice"})-[:KNOWS*1..3]->(connected)
RETURN DISTINCT connected.name

// Shortest path - BFS algorithm under the hood
MATCH path = shortestPath(
  (a:Person {name: "Alice"})-[*]-(b:Person {name: "Zara"})
)
RETURN [node in nodes(path) | node.name] as connection_chain,
       length(path) as hops

// All shortest paths (there may be multiple)
MATCH path = allShortestPaths(
  (a:Person {name: "Alice"})-[:KNOWS*]-(b:Person {name: "Zara"})
)
RETURN path
\`\`\`

Be careful with unbounded variable-length patterns (\`-[*]->\`) as they can explore the entire graph. Always set bounds or limits:

\`\`\`cypher
// DANGEROUS - could traverse millions of nodes
MATCH (a)-[*]->(b) RETURN a, b  // DON'T DO THIS

// SAFE - bounded depth
MATCH (a)-[*1..5]->(b) RETURN a, b LIMIT 100

// SAFER - specific relationship types reduce search space
MATCH (a)-[:KNOWS|WORKS_WITH*1..3]->(b) RETURN a, b LIMIT 100
\`\`\`

Cypher has powerful aggregation functions that operate differently from SQL—they group implicitly based on non-aggregated columns:

\`\`\`cypher
// Count employees per company (implicit GROUP BY c.name)
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
RETURN c.name, count(p) as employee_count
ORDER BY employee_count DESC

// Collect into arrays - extremely useful for nested results
MATCH (c:Company)<-[:WORKS_AT]-(p:Person)
RETURN c.name,
       collect(p.name) as employees,
       collect(DISTINCT p.title) as roles,
       count(p) as headcount

// Nested collection with relationship data
MATCH (c:Company)<-[r:WORKS_AT]-(p:Person)
RETURN c.name,
       collect({name: p.name, role: r.role, since: r.since}) as team

// Multiple aggregations
MATCH (c:Company)<-[:WORKS_AT]-(p:Person)
RETURN c.name,
       count(p) as total,
       count(CASE WHEN p.title CONTAINS 'Engineer' THEN 1 END) as engineers,
       avg(p.salary) as avg_salary
\`\`\`

The WITH clause lets you chain query parts, filter intermediate results, and control aggregation scope:

\`\`\`cypher
// Filter aggregated results (like HAVING in SQL)
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
WITH c, count(p) as employees
WHERE employees > 10
RETURN c.name, employees

// Chain multiple operations
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
WITH c, collect(p) as employees
WHERE size(employees) > 5
UNWIND employees as emp  // Convert array back to rows
MATCH (emp)-[:KNOWS]->(colleague)
RETURN c.name, emp.name, collect(colleague.name) as network

// Pagination with WITH
MATCH (p:Person)
WITH p ORDER BY p.name
SKIP 20 LIMIT 10  // Page 3, 10 items per page
RETURN p
\`\`\`

For write operations, CREATE always makes new data (use carefully—can create duplicates):

\`\`\`cypher
// Create nodes and relationships in one query
CREATE (alice:Person {name: "Alice", title: "CEO"})
CREATE (techcorp:Company {name: "TechCorp"})
CREATE (alice)-[:WORKS_AT {since: date()}]->(techcorp)
RETURN alice, techcorp

// Create only relationship between existing nodes
MATCH (a:Person {name: "Alice"}), (b:Person {name: "Bob"})
CREATE (a)-[:KNOWS {since: date()}]->(b)
\`\`\`

MERGE is idempotent—it finds or creates:

\`\`\`cypher
// Find or create a person
MERGE (p:Person {name: "Bob"})
ON CREATE SET p.created = timestamp(), p.source = "import"
ON MATCH SET p.lastSeen = timestamp()
RETURN p

// MERGE with relationships - be careful with the pattern!
// This finds/creates the ENTIRE pattern, not parts
MERGE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})
// Creates both nodes AND relationship if any part doesn't exist

// Usually safer to MERGE nodes separately, then relationship
MERGE (a:Person {name: "Alice"})
MERGE (b:Person {name: "Bob"})
MERGE (a)-[:KNOWS]->(b)
\`\`\`

SET updates properties while REMOVE deletes them:

\`\`\`cypher
// Update properties
MATCH (p:Person {name: "Alice"})
SET p.title = "CEO",
    p.updated = timestamp(),
    p += {department: "Executive", level: 10}  // Merge map into properties
RETURN p

// Remove properties
MATCH (p:Person {name: "Alice"})
REMOVE p.temporary_field
SET p.old_field = null  // Equivalent to REMOVE
RETURN p

// Add/remove labels
MATCH (p:Person {name: "Alice"})
SET p:Executive:Founder
REMOVE p:Contractor
RETURN labels(p)
\`\`\`

DELETE removes nodes and relationships:

\`\`\`cypher
// Delete a relationship
MATCH (a:Person {name: "Alice"})-[r:KNOWS]->(b:Person {name: "Bob"})
DELETE r

// Delete a node (must have no relationships)
MATCH (p:Person {name: "Orphan"})
DELETE p

// Delete a node AND all its relationships
MATCH (p:Person {name: "Alice"})
DETACH DELETE p  // Removes Alice and all connected relationships
\`\`\`

MATCH fails if the pattern doesn't exist. OPTIONAL MATCH returns nulls instead, similar to a left outer join:

\`\`\`cypher
// Find all people and their managers (if they have one)
MATCH (p:Person)
OPTIONAL MATCH (p)<-[:MANAGES]-(manager:Person)
RETURN p.name, manager.name as manager  // NULL if no manager

// Find companies and their products (if any)
MATCH (c:Company)
OPTIONAL MATCH (c)-[:MAKES]->(product:Product)
RETURN c.name, collect(product.name) as products  // Empty array if none
\`\`\`

CASE expressions provide conditional logic:

\`\`\`cypher
// Simple CASE
MATCH (p:Person)
RETURN p.name,
       CASE p.title
         WHEN "CEO" THEN "Executive"
         WHEN "CTO" THEN "Executive"
         WHEN "Engineer" THEN "IC"
         ELSE "Other"
       END as category

// Generic CASE
MATCH (p:Person)-[r:WORKS_AT]->(c:Company)
RETURN p.name,
       CASE
         WHEN r.since < date("2020-01-01") THEN "Veteran"
         WHEN r.since < date("2023-01-01") THEN "Established"
         ELSE "New"
       END as tenure
\`\`\``,
        analogy: "Cypher is like drawing the pattern you want to find. (a)-[:KNOWS]->(b) literally looks like an arrow from a to b. When you write the query, you're sketching the subgraph you're looking for. It's as if you could search Google Images by drawing a rough sketch instead of typing keywords.",
        gotchas: [
          "MATCH fails if pattern isn't found; use OPTIONAL MATCH for left-outer-join behavior",
          "CREATE always creates new data—use MERGE if you want find-or-create semantics",
          "Variables are bindings: using the same variable twice means 'the same node'",
          "WHERE filters after MATCH; inline property filters {name: 'X'} are often more efficient",
          "Aggregations implicitly group by non-aggregated columns (no explicit GROUP BY needed)",
          "DETACH DELETE is required to delete nodes that have relationships",
          "Variable-length patterns without bounds (*) can explode—always add limits like *1..5"
        ]
      },
      {
        title: "Connecting Neo4j to LangChain",
        description: `LangChain provides comprehensive Neo4j integration through the langchain-community package. This integration enables three powerful capabilities: direct Cypher execution, natural language to Cypher translation, and vector search over graph nodes. Understanding how these work together is essential for building effective GraphRAG agents.

The Neo4jGraph class handles connection management, schema discovery, and query execution:

\`\`\`python
from langchain_community.graphs import Neo4jGraph

# Connect to Neo4j
graph = Neo4jGraph(
    url="bolt://localhost:7687",           # Local instance
    # url="neo4j+s://xxx.databases.neo4j.io",  # Neo4j Aura (cloud)
    username="neo4j",
    password="your-password",
    database="neo4j"  # Optional: specify database (Enterprise feature)
)
\`\`\`

Connection URL formats include bolt:// for unencrypted local connections, bolt+s:// for encrypted connections (self-signed cert OK), bolt+ssc:// for encrypted with strict certificate checking, neo4j:// for routing protocol in clusters, and neo4j+s:// for routing with encryption (which Neo4j Aura uses).

LangChain automatically discovers your graph schema, which the LLM uses to generate valid Cypher:

\`\`\`python
# Auto-discovered schema
print(graph.schema)
# Output:
# Node properties:
#   Person {name: STRING, title: STRING, email: STRING}
#   Company {name: STRING, industry: STRING, founded: INTEGER}
#   Product {name: STRING, category: STRING, price: FLOAT}
# Relationship properties:
#   WORKS_AT {since: DATE, role: STRING}
#   MANAGES {}
#   MAKES {}
# The relationships:
#   (:Person)-[:WORKS_AT]->(:Company)
#   (:Person)-[:MANAGES]->(:Person)
#   (:Company)-[:MAKES]->(:Product)

# Force schema refresh (useful after data changes)
graph.refresh_schema()
\`\`\`

Schema accuracy is critical because the LLM uses it to understand what nodes, relationships, and properties exist. Without accurate schema, it might reference non-existent properties, use wrong relationship types, or miss available filters.

For full control, you can execute Cypher queries directly:

\`\`\`python
# Simple query
results = graph.query("""
    MATCH (p:Person)-[:WORKS_AT]->(c:Company)
    RETURN p.name as person, c.name as company, c.industry
    ORDER BY c.name
    LIMIT 10
""")

# Results are a list of dictionaries
for record in results:
    print(f"{record['person']} works at {record['company']} ({record['industry']})")

# Parameterized queries (IMPORTANT: prevents Cypher injection)
results = graph.query(
    "MATCH (p:Person {name: $name}) RETURN p",
    params={"name": user_input}  # Safe!
)

# DON'T do this - vulnerable to injection:
# graph.query(f"MATCH (p:Person {{name: '{user_input}'}}) RETURN p")  # DANGEROUS!

# Write operations
graph.query("""
    MERGE (p:Person {name: $name})
    SET p.lastQuery = datetime()
""", params={"name": "Alice"})
\`\`\`

GraphCypherQAChain is where LangChain shines—translating natural language questions into Cypher queries:

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain.chains import GraphCypherQAChain

llm = ChatOpenAI(model="gpt-4o", temperature=0)  # temperature=0 for deterministic queries

chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True,              # Print generated Cypher (development)
    validate_cypher=True,      # Syntax check before execution
    return_intermediate_steps=True,  # Include Cypher in response
    top_k=20,                  # Limit result rows
    allow_dangerous_requests=False  # Block DELETE/DETACH operations
)

# Ask a natural language question
result = chain.invoke({
    "query": "Which engineers work at AI companies?"
})

print("Answer:", result["result"])

# Inspect the generated Cypher
if result.get("intermediate_steps"):
    cypher = result["intermediate_steps"][0].get("query")
    print(f"Generated Cypher: {cypher}")
    # MATCH (p:Person)-[:WORKS_AT]->(c:Company)
    # WHERE p.title = 'Engineer' AND c.industry = 'AI'
    # RETURN p.name, c.name
\`\`\`

The chain uses a two-step LLM process. In step one (Cypher Generation), the LLM receives the graph schema, the user's question, and a prompt template with Cypher examples, then outputs a Cypher query. In step two (Answer Generation), the Cypher results are passed to the LLM with the original question, and it generates a natural language answer.

\`\`\`python
# You can see both prompts
from langchain.chains.graph_qa.cypher import CYPHER_GENERATION_PROMPT, CYPHER_QA_PROMPT

print(CYPHER_GENERATION_PROMPT.template)  # How questions become Cypher
print(CYPHER_QA_PROMPT.template)          # How results become answers
\`\`\`

The default prompts work for simple schemas, but complex graphs benefit from custom prompts that include domain knowledge and query guidelines:

\`\`\`python
from langchain.prompts import PromptTemplate

ENHANCED_CYPHER_PROMPT = PromptTemplate(
    template="""You are a Neo4j Cypher expert. Generate Cypher queries from natural language.

Schema:
{schema}

Domain Knowledge:
- Person titles include: CEO, CTO, VP, Director, Manager, Engineer, Analyst
- Industries include: AI, Healthcare, Finance, Retail, Manufacturing
- COMPETES_WITH relationships are bidirectional in meaning
- MANAGES relationships form a hierarchy (CEO -> VP -> Director -> Manager -> Engineer)

Query Guidelines:
1. Always use DISTINCT when returning potentially duplicate results
2. Limit results to 25 unless the question implies wanting all results
3. For "how many" questions, use count()
4. For "who" questions about people, return name and title
5. Use OPTIONAL MATCH when relationships might not exist

Question: {question}

Generated Cypher (only output the query, no explanation):
""",
    input_variables=["schema", "question"]
)

chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    cypher_prompt=ENHANCED_CYPHER_PROMPT,
    verbose=True
)
\`\`\`

Production systems need robust error handling:

\`\`\`python
class RobustGraphQA:
    def __init__(self, graph, llm):
        self.graph = graph
        self.llm = llm
        self.chain = GraphCypherQAChain.from_llm(
            llm=llm,
            graph=graph,
            validate_cypher=True,
            return_intermediate_steps=True
        )

    def query(self, question: str, max_retries: int = 3) -> dict:
        """Query with retry logic and error context."""
        errors = []

        for attempt in range(max_retries):
            try:
                result = self.chain.invoke({"query": question})

                # Check for empty results
                if not result.get("result") or "I don't know" in result["result"]:
                    # Try rephrasing with more context
                    question = f"Using the graph schema, answer: {question}"
                    continue

                return {
                    "success": True,
                    "answer": result["result"],
                    "cypher": result.get("intermediate_steps", [{}])[0].get("query"),
                    "attempts": attempt + 1
                }

            except Exception as e:
                error_msg = str(e)
                errors.append(error_msg)

                # Provide error context for retry
                if "syntax error" in error_msg.lower():
                    question = f"Previous Cypher had syntax error. Rephrase: {question}"
                elif "not found" in error_msg.lower():
                    question = f"Some entities weren't found. Try broader query: {question}"

        return {
            "success": False,
            "answer": "Could not answer after multiple attempts",
            "errors": errors,
            "attempts": max_retries
        }

# Usage
qa = RobustGraphQA(graph, llm)
result = qa.query("Who works at AI companies?")
if result["success"]:
    print(f"Answer: {result['answer']}")
    print(f"Cypher: {result['cypher']}")
else:
    print(f"Failed: {result['errors']}")
\`\`\`

For connection best practices, use environment variables for credentials and implement health checks for long-running applications:

\`\`\`python
import os
from contextlib import contextmanager

# Use environment variables for credentials
graph = Neo4jGraph(
    url=os.environ["NEO4J_URL"],
    username=os.environ["NEO4J_USER"],
    password=os.environ["NEO4J_PASSWORD"]
)

# Connection pooling is handled automatically, but for high-load:
from neo4j import GraphDatabase

driver = GraphDatabase.driver(
    os.environ["NEO4J_URL"],
    auth=(os.environ["NEO4J_USER"], os.environ["NEO4J_PASSWORD"]),
    max_connection_pool_size=50,
    connection_acquisition_timeout=60
)

# For long-running apps, verify connection periodically
def health_check():
    try:
        graph.query("RETURN 1 as test")
        return True
    except Exception as e:
        logging.error(f"Neo4j health check failed: {e}")
        return False
\`\`\``,
        analogy: "GraphCypherQAChain is like having a bilingual translator who speaks both English and Cypher. You ask questions in natural language, they consult a dictionary (the schema), translate to the graph's language, get the answer, and translate it back to English. The schema is crucial—without knowing the vocabulary, even the best translator will struggle.",
        gotchas: [
          "validate_cypher=True adds ~100ms latency but catches syntax errors before execution",
          "Schema must be accurate—refresh after data model changes with graph.refresh_schema()",
          "temperature=0 is essential for consistent Cypher generation; higher values cause random query variations",
          "Complex questions often generate incorrect Cypher; always review intermediate_steps in development",
          "top_k limits results sent to the answer-generation LLM, not the Cypher query itself",
          "Use parameterized queries (params={...}) for any user input to prevent Cypher injection",
          "Large schemas can exceed context limits—consider schema summarization for 100+ node types"
        ]
      },
      {
        title: "GraphRAG: Combining Graphs and Vectors",
        description: `GraphRAG represents the convergence of two powerful paradigms: vector similarity search (semantic understanding) and graph traversal (structural reasoning). By combining them, we create retrieval systems that understand both what things mean and how they connect—a capability neither approach achieves alone.

Each approach has fundamental limitations when used alone. Vector search with traditional RAG captures semantic meaning wonderfully—"Machine learning," "ML," "statistical learning," and "AI" all cluster together because they mean similar things. But embeddings have no concept of structure:

\`\`\`
Query: "Find suppliers of our medical device components"

Vector search finds documents containing "suppliers", "medical devices", "components"
But it can't traverse: Our Company → makes → Product → contains → Component → sourced from → Supplier
\`\`\`

The information might exist in separate documents that never mention each other. Vector search treats documents as isolated islands.

Graph traversal with pure Cypher excels at structural queries—following typed relationships across entities. But it requires exact matches:

\`\`\`cypher
-- This works if you know the exact entity
MATCH (c:Company {name: "TechCorp"})-[:MAKES]->(p)-[:CONTAINS]->(comp)-[:SOURCED_FROM]->(s)
RETURN s.name

-- But what if the user asks about "AI companies" or "machine learning firms"?
-- You need semantic understanding to know TechCorp is an "AI company"
\`\`\`

GraphRAG creates a synergy where vector search finds semantically relevant entry points (even with fuzzy or conceptual queries), graph traversal expands context via relationships (capturing connected information), and the combined context enables complex reasoning (answers requiring both meaning and structure).

Consider the question "What risks affect our AI supply chain?" Neither approach alone can answer this. Vector search finds documents about "AI," "supply chain," "risks"—but scattered and disconnected. Graph queries need exact entity names to start traversing. The GraphRAG approach works differently: first use vector search to find entities related to "AI supply chain" (identifying TechCorp, NeuralChip, SiliconFoundry), then expand via graph traversal across MAKES, SUPPLIES, and DEPENDS_ON relationships, then use vector search on connected nodes to find risk-related information about each entity, and finally combine everything into comprehensive context for the LLM.

Neo4j can store embeddings directly on nodes, enabling hybrid queries:

\`\`\`python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Neo4jVector
from langchain_community.graphs import Neo4jGraph

# Connection parameters
NEO4J_URL = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"

# Graph connection for Cypher queries
graph = Neo4jGraph(url=NEO4J_URL, username=NEO4J_USER, password=NEO4J_PASSWORD)

# Create vector index on existing nodes
# This embeds specified text properties and stores the vector on each node
vector_store = Neo4jVector.from_existing_graph(
    embedding=OpenAIEmbeddings(),
    url=NEO4J_URL,
    username=NEO4J_USER,
    password=NEO4J_PASSWORD,
    index_name="company_index",
    node_label="Company",
    text_node_properties=["name", "description", "industry"],  # Concatenated and embedded
    embedding_node_property="embedding"  # Stored here
)

# Under the hood, this creates:
# 1. Embeddings for each Company node based on name + description + industry
# 2. A vector index in Neo4j for fast similarity search
# 3. The embedding stored as a property on each node
\`\`\`

The most common pattern is vector search followed by graph expansion: find entry points semantically, then expand via relationships.

\`\`\`python
def hybrid_search_and_expand(query: str, k: int = 5, hops: int = 2):
    """
    Find semantically relevant nodes, then expand their graph context.

    Args:
        query: Natural language query
        k: Number of initial nodes to find
        hops: How many relationship hops to expand
    """
    # Step 1: Semantic search for entry points
    entry_points = vector_store.similarity_search_with_score(query, k=k)

    results = []
    for doc, score in entry_points:
        entity_name = doc.metadata.get("name")

        # Step 2: Expand via graph relationships
        # Use parameterized query for safety
        context = graph.query("""
            MATCH (start {name: $name})
            OPTIONAL MATCH path = (start)-[*1..$hops]-(connected)
            WITH start, connected, relationships(path) as rels
            RETURN start,
                   collect(DISTINCT {
                       node: connected,
                       relationship: [r in rels | type(r)],
                       distance: size(rels)
                   }) as connections
        """, params={"name": entity_name, "hops": hops})

        results.append({
            "entity": entity_name,
            "similarity_score": score,
            "content": doc.page_content,
            "graph_context": context[0] if context else None
        })

    return results

# Example usage
results = hybrid_search_and_expand("renewable energy companies", k=3, hops=2)

for r in results:
    print(f"\\n{r['entity']} (similarity: {r['similarity_score']:.3f})")
    print(f"  Content: {r['content'][:100]}...")
    if r['graph_context']:
        connections = r['graph_context']['connections']
        print(f"  Connected to {len(connections)} entities via graph")
\`\`\`

A second pattern builds context that explicitly describes relationships for the LLM:

\`\`\`python
def build_relationship_aware_context(query: str, k: int = 5):
    """
    Build LLM context that explicitly describes entity relationships.
    """
    # Find relevant entities
    relevant = vector_store.similarity_search(query, k=k)

    context_parts = []
    seen_relationships = set()

    for doc in relevant:
        name = doc.metadata.get("name")

        # Get this entity's immediate relationships with details
        relationships = graph.query("""
            MATCH (e {name: $name})
            OPTIONAL MATCH (e)-[r]->(target)
            OPTIONAL MATCH (source)-[r2]->(e)
            RETURN e.name as entity,
                   e.description as description,
                   collect(DISTINCT {
                       direction: 'outgoing',
                       type: type(r),
                       target: target.name,
                       target_type: labels(target)[0]
                   }) as outgoing,
                   collect(DISTINCT {
                       direction: 'incoming',
                       type: type(r2),
                       source: source.name,
                       source_type: labels(source)[0]
                   }) as incoming
        """, params={"name": name})

        if relationships:
            r = relationships[0]
            parts = [f"## {r['entity']}"]
            if r['description']:
                parts.append(f"{r['description']}")

            # Describe outgoing relationships
            for rel in r['outgoing']:
                if rel['target'] and rel['type']:
                    rel_key = f"{name}-{rel['type']}-{rel['target']}"
                    if rel_key not in seen_relationships:
                        parts.append(f"- {rel['type']} → {rel['target']} ({rel['target_type']})")
                        seen_relationships.add(rel_key)

            # Describe incoming relationships
            for rel in r['incoming']:
                if rel['source'] and rel['type']:
                    rel_key = f"{rel['source']}-{rel['type']}-{name}"
                    if rel_key not in seen_relationships:
                        parts.append(f"- {rel['source']} ({rel['source_type']}) → {rel['type']} → this")
                        seen_relationships.add(rel_key)

            context_parts.append("\\n".join(parts))

    return "\\n\\n".join(context_parts)

# Generate context and query LLM
context = build_relationship_aware_context("AI chip manufacturers and their customers")

response = llm.invoke(f"""
Based on the following knowledge graph context, answer the question.

CONTEXT:
{context}

QUESTION: Which companies depend on AI chip manufacturers, and what's the supply chain risk?

Provide a structured answer that traces the relationships.
""")
\`\`\`

A third pattern creates an agent that routes queries to the appropriate retrieval method:

\`\`\`python
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Tool 1: Semantic search for conceptual queries
def semantic_search_tool(query: str) -> str:
    results = vector_store.similarity_search(query, k=5)
    return "\\n".join([
        f"- {r.metadata['name']}: {r.page_content[:200]}"
        for r in results
    ])

# Tool 2: Graph traversal for relationship queries
def graph_traversal_tool(query: str) -> str:
    # Use GraphCypherQAChain to convert NL to Cypher
    result = graph_qa_chain.invoke({"query": query})
    return result["result"]

# Tool 3: Hybrid search for complex queries
def hybrid_search_tool(query: str) -> str:
    results = hybrid_search_and_expand(query, k=3, hops=2)
    formatted = []
    for r in results:
        formatted.append(f"Entity: {r['entity']}")
        if r['graph_context']:
            conn_count = len(r['graph_context'].get('connections', []))
            formatted.append(f"  Connected to {conn_count} other entities")
    return "\\n".join(formatted)

tools = [
    Tool(
        name="SemanticSearch",
        func=semantic_search_tool,
        description="""Find entities by conceptual similarity.
        USE FOR: "companies in renewable energy", "AI researchers", "products like X"
        NOT FOR: relationship queries like "who works at", "what connects A to B"
        """
    ),
    Tool(
        name="GraphQuery",
        func=graph_traversal_tool,
        description="""Query relationships between entities.
        USE FOR: "who works at TechCorp", "what products does X make", "competitors of Y"
        NOT FOR: conceptual or fuzzy queries
        """
    ),
    Tool(
        name="HybridSearch",
        func=hybrid_search_tool,
        description="""Find relevant entities AND their connections.
        USE FOR: complex queries needing both semantic relevance and relationship context
        EXAMPLE: "supply chain risks for AI companies", "impact of chip shortage on tech sector"
        """
    )
]

agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# The agent will choose the right tool based on the query
result = agent_executor.invoke({
    "input": "What companies compete with TechCorp and what products do they make?"
})
\`\`\`

For complex questions requiring multi-step reasoning, you can iteratively expand context based on intermediate findings:

\`\`\`python
async def iterative_graphrag(question: str, max_iterations: int = 3):
    """
    Iteratively expand graph context based on LLM guidance.
    """
    context = []
    explored_entities = set()

    # Initial semantic search
    initial_results = vector_store.similarity_search(question, k=3)
    for r in initial_results:
        explored_entities.add(r.metadata['name'])
        context.append({"entity": r.metadata['name'], "content": r.page_content})

    for iteration in range(max_iterations):
        # Ask LLM what entities to explore next
        current_context = format_context(context)

        expansion_prompt = f"""
        Question: {question}

        Current context:
        {current_context}

        Already explored: {list(explored_entities)}

        What additional entities should we explore via graph relationships to answer this question?
        List entity names from the current context to expand, or say "SUFFICIENT" if we have enough.

        Format: EXPAND: entity1, entity2 OR SUFFICIENT
        """

        response = await llm.ainvoke(expansion_prompt)

        if "SUFFICIENT" in response.content:
            break

        # Parse entities to expand
        if "EXPAND:" in response.content:
            to_expand = [e.strip() for e in response.content.split("EXPAND:")[1].split(",")]

            for entity_name in to_expand:
                if entity_name in explored_entities:
                    continue

                # Expand this entity's graph neighborhood
                neighbors = graph.query("""
                    MATCH (e {name: $name})-[r]-(connected)
                    RETURN connected.name as name,
                           labels(connected)[0] as type,
                           type(r) as relationship,
                           connected.description as description
                    LIMIT 10
                """, params={"name": entity_name})

                for n in neighbors:
                    if n['name'] not in explored_entities:
                        explored_entities.add(n['name'])
                        context.append({
                            "entity": n['name'],
                            "type": n['type'],
                            "relationship": f"{entity_name} -[{n['relationship']}]-> {n['name']}",
                            "content": n.get('description', '')
                        })

    # Final answer generation
    final_context = format_context(context)
    answer = await llm.ainvoke(f"""
    Based on the following knowledge graph context, answer: {question}

    Context:
    {final_context}

    Provide a comprehensive answer that cites specific entities and relationships.
    """)

    return {
        "answer": answer.content,
        "explored_entities": list(explored_entities),
        "iterations": iteration + 1
    }
\`\`\`

Each pattern suits different use cases. Vector search followed by expansion works best for finding related entities when you don't know exact names (like "renewable energy innovators"). Relationship-aware context is ideal for questions about how things connect (like "supply chain for product X"). A query router agent handles varied query types in one system, making it suitable for general-purpose knowledge assistants. Iterative expansion excels at complex multi-hop reasoning (like "regulatory risks for companies in our portfolio").`,
        analogy: "GraphRAG is like having both a librarian and a detective. The librarian (vector search) finds books on topics you're interested in based on meaning and concepts. The detective (graph traversal) then follows the connections—who cited whom, which author worked where, what influenced what. Together, they find answers that require both understanding content and tracing relationships. Neither alone could answer 'Which authors who wrote about AI ethics also worked at companies that were later acquired?'",
        gotchas: [
          "Neo4j vector search requires version 5.11+ or the Graph Data Science library for older versions",
          "Embedding dimensions must match between your model and the index (OpenAI ada-002 = 1536 dims)",
          "Graph expansion can explode exponentially—always limit hops (max 3-4) and use DISTINCT",
          "Embeddings aren't updated automatically—re-embed when node text properties change",
          "Vector search returns documents, not graph nodes directly—map via metadata to entities",
          "Balance breadth vs depth: more hops = more context but slower and potentially noisy",
          "Consider caching vector search results for repeated queries to the same semantic space"
        ]
      },
      {
        title: "Building Knowledge Graphs from Text",
        description: `One of the most powerful applications of LLMs is automatically constructing knowledge graphs from unstructured text. Documents, articles, transcripts, and reports contain valuable information locked in natural language. Graph construction extracts this into queryable, connected data structures.

Consider this paragraph: "Sarah Chen, who previously led AI research at Google, founded NeuralTech in 2022. The company has raised $50M from Sequoia Capital and competes with OpenMind in the enterprise AI market. NeuralTech's flagship product, CogniBot, uses transformer architectures and integrates with Salesforce."

A human can identify the entities (Sarah Chen as Person, Google as Company, NeuralTech as Company, Sequoia Capital as Company, OpenMind as Company, CogniBot as Product, Salesforce as Company) and the relationships (Sarah worked at Google, Sarah founded NeuralTech, Sequoia invested in NeuralTech, NeuralTech competes with OpenMind, NeuralTech makes CogniBot, CogniBot integrates with Salesforce). LLMs can perform this extraction automatically—though with important caveats around accuracy and consistency.

LangChain's LLMGraphTransformer wraps the entity/relationship extraction process:

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_core.documents import Document

# Use GPT-4 class models for best extraction quality
llm = ChatOpenAI(model="gpt-4o", temperature=0)  # temperature=0 for consistency

# Configure extraction constraints
transformer = LLMGraphTransformer(
    llm=llm,
    # Constrain to specific entity types (improves precision)
    allowed_nodes=["Person", "Company", "Product", "Technology", "Investment"],

    # Constrain relationship types (critical for schema consistency)
    allowed_relationships=[
        "WORKS_AT", "WORKED_AT",  # Employment (current/past)
        "FOUNDED",                 # Founder relationship
        "INVESTED_IN",            # Investment
        "COMPETES_WITH",          # Competition
        "MAKES", "DEVELOPS",      # Product ownership
        "USES", "INTEGRATES_WITH" # Technology dependencies
    ],

    # What properties to extract for nodes
    node_properties=["description", "founded_year", "role"],

    # What properties to extract for relationships
    relationship_properties=["since", "amount", "context"]
)

# Process documents
documents = [
    Document(page_content="""
        Sarah Chen, who previously led AI research at Google, founded NeuralTech in 2022.
        The company has raised $50M from Sequoia Capital and competes with OpenMind in
        the enterprise AI market. NeuralTech's flagship product, CogniBot, uses transformer
        architectures and integrates with Salesforce.
    """, metadata={"source": "company_profiles.txt", "chunk_id": 42})
]

# Extract graph structure
graph_documents = transformer.convert_to_graph_documents(documents)

# Examine what was extracted
for gdoc in graph_documents:
    print("=== Extracted Nodes ===")
    for node in gdoc.nodes:
        print(f"  {node.type}: {node.id}")
        print(f"    Properties: {node.properties}")

    print("\\n=== Extracted Relationships ===")
    for rel in gdoc.relationships:
        print(f"  ({rel.source.id})-[:{rel.type}]->({rel.target.id})")
        if rel.properties:
            print(f"    Properties: {rel.properties}")
\`\`\`

LLMs extract certain things well: explicit named entities (people, companies, products with clear names), explicit relationships stated in text ("founded," "works at," "competes with"), and temporal information when stated ("in 2022," "since 2020"). However, LLMs struggle with implicit relationships (inferring competition from market context), coreference resolution ("she" → "Sarah Chen" across sentences), consistent entity naming ("NeuralTech" vs "Neural Tech" vs "the company"), and relationship direction (who acquired whom?).

\`\`\`python
# Example of extraction variability
text1 = "Alice founded TechCorp."  # Clear: (Alice)-[:FOUNDED]->(TechCorp)
text2 = "TechCorp, Alice's company, launched in 2020."  # May miss FOUNDED relationship
text3 = "She started the company last year."  # Coreference + temporal inference needed

# Run multiple extractions to see variability
for text in [text1, text2, text3]:
    doc = Document(page_content=text)
    result = transformer.convert_to_graph_documents([doc])
    print(f"Text: {text}")
    print(f"Extracted: {[(r.source.id, r.type, r.target.id) for r in result[0].relationships]}")
\`\`\`

Once extracted, load the graph documents into Neo4j:

\`\`\`python
from langchain_community.graphs import Neo4jGraph

graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password"
)

# Simple loading - good for initial imports
graph.add_graph_documents(
    graph_documents,
    baseEntityLabel=True,    # Adds "Entity" label to all nodes (useful for queries)
    include_source=True      # Links nodes to source document (provenance tracking)
)

# Verify the import
stats = graph.query("""
    MATCH (n)
    RETURN labels(n) as labels, count(*) as count
    ORDER BY count DESC
""")
print("Node counts by label:", stats)
\`\`\`

Real-world extraction creates duplicates. The same entity appears with different surface forms like "Sarah Chen", "Sarah", "Ms. Chen", and "the CEO", or "NeuralTech", "Neural Tech", "NeuralTech Inc.", and "the company".

One strategy is pre-processing with coreference resolution:

\`\`\`python
def resolve_coreferences(text: str, llm) -> str:
    """Replace pronouns and references with explicit entity names."""
    prompt = f"""
    Rewrite this text replacing all pronouns and references with the specific
    entities they refer to. Keep the meaning identical.

    Original: {text}

    Rewritten (no pronouns, no "the company", no "she/he"):
    """
    result = llm.invoke(prompt)
    return result.content

# Before: "She founded the company in 2020. It now employs 500 people."
# After: "Sarah Chen founded NeuralTech in 2020. NeuralTech now employs 500 people."
\`\`\`

Another strategy is post-processing entity merging:

\`\`\`python
def find_and_merge_duplicates(graph: Neo4jGraph, llm, entity_type: str = "Person"):
    """Find potential duplicates and merge them with LLM assistance."""

    # Find candidates based on string similarity
    candidates = graph.query(f"""
        MATCH (a:{entity_type}), (b:{entity_type})
        WHERE id(a) < id(b)
          AND (
            a.name CONTAINS b.name OR
            b.name CONTAINS a.name OR
            apoc.text.jaroWinklerDistance(a.name, b.name) > 0.85
          )
        RETURN a.name as name1, b.name as name2,
               a.description as desc1, b.description as desc2
        LIMIT 100
    """)

    merges = []
    for pair in candidates:
        # Use LLM to confirm if same entity
        prompt = f"""
        Are these two entries referring to the same {entity_type.lower()}?

        Entry 1: {pair['name1']}
        Description: {pair.get('desc1', 'N/A')}

        Entry 2: {pair['name2']}
        Description: {pair.get('desc2', 'N/A')}

        Answer: YES or NO, followed by brief reasoning.
        If YES, which name is the canonical (most complete) form?
        """
        response = llm.invoke(prompt)

        if "YES" in response.content.upper():
            # Determine canonical name (usually the longer/more complete one)
            canonical = pair['name1'] if len(pair['name1']) >= len(pair['name2']) else pair['name2']
            other = pair['name2'] if canonical == pair['name1'] else pair['name1']
            merges.append((canonical, other))

    # Execute merges
    for canonical, duplicate in merges:
        graph.query("""
            MATCH (canonical {name: $canonical})
            MATCH (dup {name: $duplicate})
            // Transfer all relationships from duplicate to canonical
            CALL {
                WITH canonical, dup
                MATCH (dup)-[r]->(target)
                MERGE (canonical)-[newR:RELATED]->(target)
                SET newR = properties(r), newR.type = type(r)
                DELETE r
            }
            CALL {
                WITH canonical, dup
                MATCH (source)-[r]->(dup)
                MERGE (source)-[newR:RELATED]->(canonical)
                SET newR = properties(r), newR.type = type(r)
                DELETE r
            }
            // Add alias and delete duplicate
            SET canonical.aliases = coalesce(canonical.aliases, []) + [$duplicate]
            DETACH DELETE dup
        """, params={"canonical": canonical, "duplicate": duplicate})

    return merges
\`\`\`

For ongoing document processing in production, use an incremental approach:

\`\`\`python
import hashlib
from datetime import datetime

class IncrementalGraphBuilder:
    def __init__(self, graph: Neo4jGraph, transformer: LLMGraphTransformer):
        self.graph = graph
        self.transformer = transformer

    def _document_hash(self, content: str) -> str:
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    async def process_document(self, doc: Document) -> dict:
        """Process a single document incrementally."""
        doc_hash = self._document_hash(doc.page_content)

        # Check if already processed
        existing = self.graph.query(
            "MATCH (d:Document {hash: $hash}) RETURN d",
            params={"hash": doc_hash}
        )
        if existing:
            return {"status": "skipped", "reason": "already_processed"}

        # Extract entities and relationships
        graph_docs = self.transformer.convert_to_graph_documents([doc])
        gdoc = graph_docs[0]

        stats = {"nodes_created": 0, "nodes_merged": 0, "relationships_created": 0}

        # Create document node for provenance
        self.graph.query("""
            CREATE (d:Document {
                hash: $hash,
                source: $source,
                processed_at: datetime()
            })
        """, params={
            "hash": doc_hash,
            "source": doc.metadata.get("source", "unknown")
        })

        # Process nodes with MERGE (idempotent)
        for node in gdoc.nodes:
            result = self.graph.query(f"""
                MERGE (n:{node.type} {{name: $name}})
                ON CREATE SET
                    n += $properties,
                    n.created_at = datetime(),
                    n.source_doc = $doc_hash
                ON MATCH SET
                    n.updated_at = datetime(),
                    n.source_docs = coalesce(n.source_docs, []) + $doc_hash
                RETURN CASE WHEN n.created_at = n.updated_at THEN 'created' ELSE 'merged' END as status
            """, params={
                "name": node.id,
                "properties": node.properties or {},
                "doc_hash": doc_hash
            })
            if result[0]['status'] == 'created':
                stats['nodes_created'] += 1
            else:
                stats['nodes_merged'] += 1

        # Process relationships
        for rel in gdoc.relationships:
            self.graph.query(f"""
                MATCH (source {{name: $source_name}})
                MATCH (target {{name: $target_name}})
                MERGE (source)-[r:{rel.type}]->(target)
                ON CREATE SET r += $properties, r.created_at = datetime()
            """, params={
                "source_name": rel.source.id,
                "target_name": rel.target.id,
                "properties": rel.properties or {}
            })
            stats['relationships_created'] += 1

        return {"status": "processed", "stats": stats}

    async def process_batch(self, documents: list[Document]) -> list[dict]:
        """Process multiple documents."""
        results = []
        for doc in documents:
            result = await self.process_document(doc)
            results.append(result)
        return results

# Usage
builder = IncrementalGraphBuilder(graph, transformer)
results = await builder.process_batch(new_documents)
print(f"Processed {len(results)} documents")
\`\`\`

Always validate extractions before loading into production:

\`\`\`python
def validate_extraction(graph_doc, allowed_nodes: list, allowed_relationships: list) -> list[str]:
    """Validate extracted graph document against schema."""
    errors = []

    # Check node types
    for node in graph_doc.nodes:
        if node.type not in allowed_nodes:
            errors.append(f"Invalid node type: {node.type} for {node.id}")
        if not node.id or len(node.id) < 2:
            errors.append(f"Invalid node ID: '{node.id}'")

    # Check relationships
    for rel in graph_doc.relationships:
        if rel.type not in allowed_relationships:
            errors.append(f"Invalid relationship type: {rel.type}")
        if not rel.source.id or not rel.target.id:
            errors.append(f"Relationship missing endpoint: {rel}")
        if rel.source.id == rel.target.id:
            errors.append(f"Self-referencing relationship: {rel.source.id}")

    # Check for obviously wrong extractions
    node_names = [n.id.lower() for n in graph_doc.nodes]
    suspicious = ["the company", "the product", "she", "he", "it", "they"]
    for name in suspicious:
        if name in node_names:
            errors.append(f"Suspicious entity name (likely coreference failure): '{name}'")

    return errors

# Validate before loading
for gdoc in graph_documents:
    errors = validate_extraction(gdoc, transformer.allowed_nodes, transformer.allowed_relationships)
    if errors:
        print(f"Validation errors: {errors}")
        # Either fix or skip this document
    else:
        graph.add_graph_documents([gdoc])
\`\`\``,
        analogy: "Building a knowledge graph from text is like having a research assistant read thousands of documents and construct a massive organizational chart combined with a relationship map. They identify every person, company, and product mentioned, figure out who works where, who founded what, and who competes with whom. The graph becomes a queryable memory of everything in those documents—but like any assistant, they can make mistakes, especially with ambiguous references or implied relationships.",
        gotchas: [
          "GPT-4 class models extract 2-3x more accurately than GPT-3.5; the cost difference is worth it",
          "Coreference resolution ('she' → 'Alice') is a major failure mode; preprocess text to resolve references",
          "Entity resolution (merging duplicates) is essential—expect 10-30% duplicate entities without it",
          "Constrain allowed_nodes and allowed_relationships tightly; unconstrained extraction creates schema chaos",
          "Always track provenance (which document an entity came from) for debugging and auditing",
          "Batch similar documents together; extraction quality improves with consistent context",
          "Validate extractions before loading—catch obviously wrong entities like 'the company' or 'it'"
        ]
      },
      {
        title: "Production Patterns and Best Practices",
        description: `Building production GraphRAG systems requires attention to performance, data quality, security, and operational concerns. This section covers the patterns that separate toy demos from production-grade systems.

A well-designed schema is essential. Unlike schemaless document databases, graphs benefit enormously from intentional design:

\`\`\`cypher
// =============================================
// CONSTRAINTS: Enforce data integrity
// =============================================

// Uniqueness constraints (also create indexes automatically)
CREATE CONSTRAINT person_id IF NOT EXISTS
FOR (p:Person) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT company_id IF NOT EXISTS
FOR (c:Company) REQUIRE c.id IS UNIQUE;

// Name uniqueness within type (common pattern)
CREATE CONSTRAINT person_name_unique IF NOT EXISTS
FOR (p:Person) REQUIRE p.name IS UNIQUE;

// Existence constraints (Neo4j Enterprise)
// Ensures required properties are always present
CREATE CONSTRAINT person_name_exists IF NOT EXISTS
FOR (p:Person) REQUIRE p.name IS NOT NULL;

// =============================================
// INDEXES: Optimize query performance
// =============================================

// Single-property indexes for common filters
CREATE INDEX person_title IF NOT EXISTS
FOR (p:Person) ON (p.title);

CREATE INDEX company_industry IF NOT EXISTS
FOR (c:Company) ON (c.industry);

CREATE INDEX product_category IF NOT EXISTS
FOR (p:Product) ON (p.category);

// Composite indexes for multi-property lookups
CREATE INDEX person_company_title IF NOT EXISTS
FOR (p:Person) ON (p.company_name, p.title);

// Text indexes for partial matching and search
CREATE TEXT INDEX person_name_text IF NOT EXISTS
FOR (p:Person) ON (p.name);

// Full-text search index for natural language queries
CREATE FULLTEXT INDEX entity_search IF NOT EXISTS
FOR (n:Person|Company|Product)
ON EACH [n.name, n.description];

// Range indexes for temporal/numeric queries
CREATE RANGE INDEX company_founded IF NOT EXISTS
FOR (c:Company) ON (c.founded_year);
\`\`\`

For index selection, index properties used in WHERE clauses, index properties used for JOIN-like patterns (matching relationships), use full-text indexes for natural language search, and use composite indexes when you always query multiple properties together.

Graph queries can be blazing fast or catastrophically slow depending on how you write them:

\`\`\`python
# =============================================
# DANGEROUS PATTERNS - Avoid these
# =============================================

# 1. Unbounded variable-length paths
graph.query("MATCH (a)-[*]->(b) RETURN a, b")  # Can traverse ENTIRE graph

# 2. No starting anchor
graph.query("MATCH (a)-[:KNOWS]-(b) RETURN a, b")  # Scans all relationships

# 3. Cartesian products
graph.query("MATCH (a:Person), (b:Company) RETURN a, b")  # Millions of rows

# =============================================
# OPTIMIZED PATTERNS
# =============================================

# 1. Always bound variable-length paths
graph.query("""
    MATCH (p:Person {name: $name})-[*1..3]-(connected)
    RETURN collect(DISTINCT connected)[..50] as connections
""", params={"name": "Alice"})

# 2. Start with selective node (use indexed property)
graph.query("""
    MATCH (c:Company {industry: "AI"})  // Indexed property first
    MATCH (c)<-[:WORKS_AT]-(p:Person)
    RETURN c.name, collect(p.name) as employees
""")

# 3. Use LIMIT early
graph.query("""
    MATCH (p:Person)
    WITH p LIMIT 1000  // Limit before expensive operations
    MATCH (p)-[:WORKS_AT]->(c)
    RETURN p.name, c.name
""")

# 4. Profile queries to understand performance
explain_result = graph.query("EXPLAIN MATCH (p:Person)-[:WORKS_AT]->(c:Company) RETURN p, c")
profile_result = graph.query("PROFILE MATCH (p:Person)-[:WORKS_AT]->(c:Company) RETURN p, c")
# PROFILE shows actual execution stats (rows scanned, db hits)
\`\`\`

Cypher injection is as dangerous as SQL injection. User input can modify queries:

\`\`\`python
# =============================================
# VULNERABLE CODE - NEVER DO THIS
# =============================================

user_input = "Alice"  # What if: Alice' OR 1=1 WITH n DELETE n //

# DANGEROUS: String interpolation
graph.query(f"MATCH (p:Person {{name: '{user_input}'}}) RETURN p")

# DANGEROUS: Format strings
graph.query("MATCH (p:Person {name: '%s'}) RETURN p" % user_input)

# =============================================
# SAFE CODE - Always use parameters
# =============================================

# SAFE: Parameterized queries
graph.query(
    "MATCH (p:Person {name: $name}) RETURN p",
    params={"name": user_input}
)

# SAFE: With LangChain
result = graph.query(
    """
    MATCH (p:Person)-[:WORKS_AT]->(c:Company)
    WHERE p.name CONTAINS $search_term
    RETURN p.name, c.name
    LIMIT $limit
    """,
    params={"search_term": user_search, "limit": 100}
)
\`\`\`

Production systems need robust error handling:

\`\`\`python
from langchain.chains import GraphCypherQAChain
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class ProductionGraphQA:
    """Production-ready GraphRAG query handler."""

    def __init__(self, graph, llm):
        self.graph = graph
        self.llm = llm
        self.chain = GraphCypherQAChain.from_llm(
            llm=llm,
            graph=graph,
            validate_cypher=True,
            return_intermediate_steps=True,
            top_k=50
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10)
    )
    def _execute_with_retry(self, question: str):
        """Execute query with exponential backoff retry."""
        return self.chain.invoke({"query": question})

    def query(self, question: str) -> dict:
        """Query with comprehensive error handling."""
        try:
            result = self._execute_with_retry(question)

            # Validate result
            if not result.get("result"):
                return self._handle_empty_result(question, result)

            # Log success
            cypher = self._extract_cypher(result)
            logger.info(f"Query successful", extra={
                "question": question[:100],
                "cypher": cypher[:200] if cypher else None
            })

            return {
                "success": True,
                "answer": result["result"],
                "cypher": cypher,
                "metadata": {"source": "graph_qa"}
            }

        except CypherSyntaxError as e:
            logger.warning(f"Cypher syntax error: {e}")
            return self._handle_syntax_error(question, e)

        except Neo4jConnectionError as e:
            logger.error(f"Database connection error: {e}")
            return {"success": False, "error": "Database unavailable", "retry": True}

        except Exception as e:
            logger.exception(f"Unexpected error processing query")
            return {"success": False, "error": str(e), "retry": False}

    def _handle_empty_result(self, question: str, result: dict):
        """Handle queries that returned no data."""
        # Check if it's a "no matching data" vs "bad query" situation
        cypher = self._extract_cypher(result)

        if cypher:
            # Query was valid but no matches
            return {
                "success": True,
                "answer": "No matching data found in the knowledge graph.",
                "cypher": cypher,
                "metadata": {"empty_result": True}
            }
        else:
            # Couldn't generate valid Cypher
            return {
                "success": False,
                "error": "Could not generate a valid query for this question",
                "suggestion": "Try rephrasing with specific entity names"
            }

    def _handle_syntax_error(self, question: str, error):
        """Attempt to recover from Cypher syntax errors."""
        # Try a simpler query approach
        simplified_question = f"Simply list entities related to: {question}"
        try:
            result = self.chain.invoke({"query": simplified_question})
            return {
                "success": True,
                "answer": result.get("result", ""),
                "metadata": {"fallback": True, "original_error": str(error)}
            }
        except Exception:
            return {"success": False, "error": f"Query generation failed: {error}"}

    def _extract_cypher(self, result: dict) -> str:
        """Safely extract generated Cypher from result."""
        steps = result.get("intermediate_steps", [])
        if steps and isinstance(steps[0], dict):
            return steps[0].get("query", "")
        return ""
\`\`\`

GraphRAG queries involve both LLM calls (expensive) and database queries (fast). Cache strategically:

\`\`\`python
import hashlib
from datetime import datetime, timedelta
from functools import lru_cache
import redis

class LayeredCache:
    """Multi-layer caching for GraphRAG queries."""

    def __init__(self, redis_client=None, local_size=1000, ttl_seconds=3600):
        self.local_cache = {}
        self.local_size = local_size
        self.redis = redis_client
        self.ttl = ttl_seconds

    def _key(self, question: str) -> str:
        """Generate deterministic cache key."""
        normalized = question.lower().strip()
        return f"graphrag:{hashlib.sha256(normalized.encode()).hexdigest()[:16]}"

    def get(self, question: str) -> dict | None:
        """Check caches in order: local → Redis."""
        key = self._key(question)

        # L1: Local memory cache (fastest)
        if key in self.local_cache:
            entry = self.local_cache[key]
            if entry["expires"] > datetime.now():
                return entry["value"]
            else:
                del self.local_cache[key]

        # L2: Redis cache (shared across instances)
        if self.redis:
            cached = self.redis.get(key)
            if cached:
                value = json.loads(cached)
                # Promote to local cache
                self._set_local(key, value)
                return value

        return None

    def set(self, question: str, value: dict):
        """Store in both cache layers."""
        key = self._key(question)

        # Store locally
        self._set_local(key, value)

        # Store in Redis
        if self.redis:
            self.redis.setex(key, self.ttl, json.dumps(value))

    def _set_local(self, key: str, value: dict):
        """Add to local cache with LRU eviction."""
        if len(self.local_cache) >= self.local_size:
            # Evict oldest entry
            oldest = min(self.local_cache.keys(),
                        key=lambda k: self.local_cache[k]["expires"])
            del self.local_cache[oldest]

        self.local_cache[key] = {
            "value": value,
            "expires": datetime.now() + timedelta(seconds=self.ttl)
        }

    def invalidate_pattern(self, pattern: str):
        """Invalidate cache entries matching pattern (e.g., after graph update)."""
        # Local cache
        to_delete = [k for k in self.local_cache if pattern in k]
        for k in to_delete:
            del self.local_cache[k]

        # Redis cache
        if self.redis:
            for key in self.redis.scan_iter(f"graphrag:*{pattern}*"):
                self.redis.delete(key)


class CachedGraphQA:
    """GraphQA with intelligent caching."""

    def __init__(self, qa_chain, cache: LayeredCache):
        self.chain = qa_chain
        self.cache = cache

    def query(self, question: str, bypass_cache: bool = False) -> dict:
        if not bypass_cache:
            cached = self.cache.get(question)
            if cached:
                cached["cache_hit"] = True
                return cached

        result = self.chain.query(question)

        if result.get("success"):
            self.cache.set(question, result)

        result["cache_hit"] = False
        return result
\`\`\`

Track what matters for debugging and optimization:

\`\`\`python
import time
import structlog
from prometheus_client import Counter, Histogram, Gauge

# Metrics
QUERY_COUNTER = Counter(
    'graphrag_queries_total',
    'Total GraphRAG queries',
    ['status', 'cache_hit']
)
QUERY_LATENCY = Histogram(
    'graphrag_query_duration_seconds',
    'Query latency',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
)
CYPHER_GENERATION_ERRORS = Counter(
    'graphrag_cypher_errors_total',
    'Cypher generation failures'
)

logger = structlog.get_logger()

class ObservableGraphQA:
    """GraphQA with full observability."""

    def __init__(self, qa_chain, cache):
        self.chain = qa_chain
        self.cache = cache

    def query(self, question: str, user_id: str = None) -> dict:
        start_time = time.time()
        request_id = str(uuid.uuid4())[:8]

        log = logger.bind(
            request_id=request_id,
            user_id=user_id,
            question_length=len(question)
        )

        # Check cache
        cached = self.cache.get(question)
        if cached:
            QUERY_COUNTER.labels(status='success', cache_hit='true').inc()
            log.info("cache_hit")
            return {**cached, "request_id": request_id}

        # Execute query
        try:
            result = self.chain.query(question)
            duration = time.time() - start_time

            QUERY_LATENCY.observe(duration)

            if result.get("success"):
                QUERY_COUNTER.labels(status='success', cache_hit='false').inc()
                self.cache.set(question, result)

                log.info("query_success",
                    duration_ms=duration*1000,
                    cypher_length=len(result.get("cypher", ""))
                )
            else:
                QUERY_COUNTER.labels(status='failure', cache_hit='false').inc()
                CYPHER_GENERATION_ERRORS.inc()

                log.warning("query_failure",
                    duration_ms=duration*1000,
                    error=result.get("error")
                )

            return {**result, "request_id": request_id, "duration_ms": duration*1000}

        except Exception as e:
            duration = time.time() - start_time
            QUERY_COUNTER.labels(status='error', cache_hit='false').inc()

            log.error("query_error",
                duration_ms=duration*1000,
                error=str(e),
                exc_info=True
            )
            raise
\`\`\`

Graphs evolve over time. Handle schema changes gracefully:

\`\`\`python
class SchemaMigration:
    """Manage graph schema migrations."""

    def __init__(self, graph):
        self.graph = graph

    def migrate_v1_to_v2(self):
        """Example: Rename relationship type."""
        # Add new relationship
        self.graph.query("""
            MATCH (p:Person)-[old:EMPLOYED_BY]->(c:Company)
            CREATE (p)-[new:WORKS_AT]->(c)
            SET new = properties(old)
        """)

        # Remove old relationship (after verification)
        self.graph.query("""
            MATCH (p:Person)-[old:EMPLOYED_BY]->(c:Company)
            DELETE old
        """)

    def add_property_with_default(self, label: str, property: str, default):
        """Add new property to existing nodes."""
        self.graph.query(f"""
            MATCH (n:{label})
            WHERE n.{property} IS NULL
            SET n.{property} = $default
        """, params={"default": default})

    def create_derived_relationships(self):
        """Create inferred relationships from existing data."""
        # Example: Infer COLLEAGUE relationships
        self.graph.query("""
            MATCH (p1:Person)-[:WORKS_AT]->(c:Company)<-[:WORKS_AT]-(p2:Person)
            WHERE p1 <> p2 AND NOT (p1)-[:COLLEAGUE]-(p2)
            CREATE (p1)-[:COLLEAGUE {inferred: true, company: c.name}]->(p2)
        """)
\`\`\``,
        gotchas: [
          "Always use parameterized queries ($param syntax) to prevent Cypher injection attacks",
          "Monitor query latencies—slow queries (>1s) usually indicate missing indexes or unbounded traversals",
          "Cache at the right layer: LLM responses are expensive, graph queries are cheap but add up",
          "Large schemas (100+ node types) can exceed LLM context limits—summarize or filter schema",
          "Test with edge cases: empty results, ambiguous entities, special characters in names",
          "Plan for schema evolution: use migrations, avoid destructive changes to production data",
          "Log generated Cypher queries—essential for debugging incorrect answers",
          "Set query timeouts to prevent runaway queries from blocking the database"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Neo4j Connection and Schema Inspection",
        language: "python",
        category: "basic",
        code: `from langchain_community.graphs import Neo4jGraph

# Connect to Neo4j (local or Aura cloud)
graph = Neo4jGraph(
    url="bolt://localhost:7687",      # or "neo4j+s://xxx.databases.neo4j.io"
    username="neo4j",
    password="your-password"
)

# Auto-discover schema
print("=== Graph Schema ===")
print(graph.schema)

# Run a test query
result = graph.query("""
    MATCH (n)
    RETURN labels(n) as label, count(*) as count
    ORDER BY count DESC
""")
print("\\n=== Node Counts ===")
for row in result:
    print(f"  {row['label']}: {row['count']}")

# Check relationships
rels = graph.query("""
    MATCH ()-[r]->()
    RETURN type(r) as relationship, count(*) as count
    ORDER BY count DESC
""")
print("\\n=== Relationship Counts ===")
for row in rels:
    print(f"  {row['relationship']}: {row['count']}")`,
        explanation: "Connect to Neo4j and inspect the schema. LangChain's Neo4jGraph auto-discovers node labels, relationship types, and properties, which is essential for generating valid Cypher queries."
      },
      {
        title: "Cypher Pattern Matching Examples",
        language: "cypher",
        category: "basic",
        code: `// Find all people and their companies
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
RETURN p.name, c.name, c.industry

// Multi-hop: Find colleagues (people at the same company)
MATCH (alice:Person {name: "Alice"})-[:WORKS_AT]->(company)<-[:WORKS_AT]-(colleague)
WHERE colleague <> alice
RETURN colleague.name, company.name

// Find managers and their reports
MATCH (manager:Person)-[:MANAGES]->(report:Person)
RETURN manager.name as manager, collect(report.name) as team
ORDER BY size(team) DESC

// Variable-length path: Find connection between two people
MATCH path = shortestPath(
  (p1:Person {name: "Alice"})-[:KNOWS*..5]-(p2:Person {name: "Zara"})
)
RETURN [n in nodes(path) | n.name] as connection_path

// Aggregate: Company employee stats by industry
MATCH (p:Person)-[:WORKS_AT]->(c:Company)-[:IN_INDUSTRY]->(i:Industry)
WITH i.name as industry, c.name as company, count(p) as employees
RETURN industry, collect({company: company, employees: employees}) as companies
ORDER BY industry

// Complex: Find influencers (people who manage many and know many)
MATCH (p:Person)
OPTIONAL MATCH (p)-[:MANAGES]->(report)
OPTIONAL MATCH (p)-[:KNOWS]-(connection)
WITH p, count(DISTINCT report) as team_size, count(DISTINCT connection) as network_size
WHERE team_size > 0 OR network_size > 5
RETURN p.name, team_size, network_size, team_size + network_size as influence_score
ORDER BY influence_score DESC
LIMIT 10`,
        explanation: "Cypher patterns match graph structures. Use ASCII-art syntax (node)-[:RELATIONSHIP]->(node), WHERE for filtering, and aggregation functions like collect() and count() for grouping results."
      },
      {
        title: "GraphCypherQAChain for Natural Language Queries",
        language: "python",
        category: "intermediate",
        code: `from langchain_community.graphs import Neo4jGraph
from langchain_openai import ChatOpenAI
from langchain.chains import GraphCypherQAChain

# Setup
graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password"
)

llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Create the chain
chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True,           # See generated Cypher
    validate_cypher=True,   # Validate syntax before execution
    return_intermediate_steps=True,
    top_k=20                # Limit results
)

# Natural language queries
questions = [
    "Who works at AI companies?",
    "Which companies have the most employees?",
    "Find people who manage teams larger than 5",
    "What industries are represented in the database?",
    "Who are Alice's colleagues?"  # Multi-hop
]

for question in questions:
    print(f"\\n{'='*60}")
    print(f"Question: {question}")

    result = chain.invoke({"query": question})

    print(f"\\nGenerated Cypher:")
    if result.get("intermediate_steps"):
        print(f"  {result['intermediate_steps'][0].get('query', 'N/A')}")

    print(f"\\nAnswer: {result['result']}")`,
        explanation: "GraphCypherQAChain translates natural language to Cypher automatically. The LLM uses the graph schema to generate appropriate queries. Use verbose=True during development to see and debug the generated Cypher."
      },
      {
        title: "Hybrid Vector + Graph Retrieval",
        language: "python",
        category: "intermediate",
        code: `from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Neo4jVector
from langchain_community.graphs import Neo4jGraph

# Setup connections
NEO4J_URL = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"

graph = Neo4jGraph(url=NEO4J_URL, username=NEO4J_USER, password=NEO4J_PASSWORD)

# Create vector index on Person nodes
vector_store = Neo4jVector.from_existing_graph(
    embedding=OpenAIEmbeddings(),
    url=NEO4J_URL,
    username=NEO4J_USER,
    password=NEO4J_PASSWORD,
    index_name="person_bio_index",
    node_label="Person",
    text_node_properties=["bio", "skills"],  # Properties to embed
    embedding_node_property="embedding"
)

def hybrid_retrieve(query: str, k: int = 5, expand_hops: int = 1):
    """Combine vector search with graph expansion."""

    # Step 1: Semantic search for relevant people
    similar_people = vector_store.similarity_search_with_score(query, k=k)

    results = []
    for doc, score in similar_people:
        person_name = doc.metadata.get("name", "Unknown")

        # Step 2: Expand context via graph relationships
        neighbors = graph.query(f"""
            MATCH (p:Person {{name: $name}})
            OPTIONAL MATCH (p)-[r]-(connected)
            RETURN p.name as person, p.bio as bio,
                   collect({{
                       type: type(r),
                       connected: connected.name,
                       labels: labels(connected)
                   }})[..10] as connections
        """, {"name": person_name})

        if neighbors:
            results.append({
                "person": person_name,
                "bio": neighbors[0].get("bio"),
                "similarity_score": score,
                "connections": neighbors[0].get("connections", [])
            })

    return results

# Example usage
query = "machine learning researchers working on NLP"
results = hybrid_retrieve(query, k=3, expand_hops=1)

print(f"Query: {query}\\n")
for r in results:
    print(f"Person: {r['person']} (score: {r['similarity_score']:.3f})")
    print(f"  Bio: {r['bio'][:100]}...")
    print(f"  Connections: {[c['connected'] for c in r['connections']]}")
    print()`,
        explanation: "Hybrid retrieval first uses vector search to find semantically relevant nodes, then expands context by traversing graph relationships. This combines the semantic understanding of embeddings with the structural knowledge of graphs."
      },
      {
        title: "Entity Extraction and Graph Construction",
        language: "python",
        category: "advanced",
        code: `from langchain_openai import ChatOpenAI
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_core.documents import Document
from langchain_community.graphs import Neo4jGraph

# Setup
llm = ChatOpenAI(model="gpt-4o", temperature=0)
graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password"
)

# Configure entity extraction
transformer = LLMGraphTransformer(
    llm=llm,
    allowed_nodes=["Person", "Company", "Product", "Technology", "Industry"],
    allowed_relationships=[
        "WORKS_AT", "FOUNDED", "MANAGES", "USES",
        "COMPETES_WITH", "PARTNERS_WITH", "IN_INDUSTRY"
    ],
    node_properties=["title", "description", "founded_date"],
    relationship_properties=["since", "context"]
)

# Sample documents to process
documents = [
    Document(page_content="""
        Sarah Chen is the CTO of NeuralTech, an AI startup she co-founded with
        Marcus Williams in 2022. NeuralTech specializes in computer vision and
        competes directly with VisionAI in the autonomous vehicle industry.
        The company uses PyTorch and has partnered with CloudCorp for infrastructure.
    """),
    Document(page_content="""
        Marcus Williams previously worked at GoogleAI where he led the perception team.
        He manages a team of 15 engineers at NeuralTech including Dr. James Liu,
        who specializes in 3D reconstruction using transformer architectures.
    """)
]

# Extract graph structure
print("Extracting entities and relationships...")
graph_documents = transformer.convert_to_graph_documents(documents)

# Inspect extraction results
for i, gdoc in enumerate(graph_documents):
    print(f"\\nDocument {i + 1}:")
    print(f"  Nodes: {[(n.id, n.type, n.properties) for n in gdoc.nodes]}")
    print(f"  Relationships: {[(r.source.id, r.type, r.target.id) for r in gdoc.relationships]}")

# Load into Neo4j
print("\\nLoading into Neo4j...")
graph.add_graph_documents(
    graph_documents,
    baseEntityLabel=True,    # Add 'Entity' label to all nodes
    include_source=True      # Link nodes to source documents
)

# Verify the graph
result = graph.query("""
    MATCH (n)
    OPTIONAL MATCH (n)-[r]->(m)
    RETURN labels(n) as labels, n.id as name,
           collect({type: type(r), target: m.id}) as relationships
    LIMIT 20
""")

print("\\nGraph contents:")
for row in result:
    print(f"  {row['labels']}: {row['name']}")
    for rel in row['relationships']:
        if rel['type']:
            print(f"    -{rel['type']}-> {rel['target']}")`,
        explanation: "LLMGraphTransformer extracts entities (nodes) and relationships from unstructured text. Configure allowed_nodes and allowed_relationships to constrain extraction to your domain. Use add_graph_documents to load into Neo4j."
      },
      {
        title: "Production GraphRAG Agent",
        language: "python",
        category: "advanced",
        code: `from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from langchain.chains import GraphCypherQAChain
from langchain.agents import create_react_agent, AgentExecutor, Tool
from langchain.prompts import PromptTemplate
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductionGraphRAGAgent:
    """A production-ready agent combining graph and vector capabilities."""

    def __init__(self, neo4j_url: str, neo4j_user: str, neo4j_password: str):
        self.graph = Neo4jGraph(
            url=neo4j_url,
            username=neo4j_user,
            password=neo4j_password
        )

        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)

        # Vector store for semantic search
        self.vector_store = Neo4jVector.from_existing_graph(
            embedding=OpenAIEmbeddings(),
            url=neo4j_url,
            username=neo4j_user,
            password=neo4j_password,
            index_name="entity_embeddings",
            node_label="Entity",
            text_node_properties=["name", "description"],
            embedding_node_property="embedding"
        )

        # Graph QA chain
        self.graph_qa = GraphCypherQAChain.from_llm(
            llm=self.llm,
            graph=self.graph,
            validate_cypher=True,
            return_intermediate_steps=True,
            top_k=50
        )

        # Build the agent
        self.agent = self._build_agent()

    def _build_agent(self):
        """Build the ReAct agent with graph and vector tools."""

        tools = [
            Tool(
                name="KnowledgeGraphQA",
                func=self._graph_qa_wrapper,
                description="""Query the knowledge graph using natural language.
                Best for: relationship questions, multi-hop queries, aggregations.
                Examples: "Who works at TechCorp?", "Find all companies in healthcare",
                "Which managers have teams larger than 10?"
                """
            ),
            Tool(
                name="SemanticSearch",
                func=self._semantic_search_wrapper,
                description="""Find entities by semantic similarity.
                Best for: finding relevant entities when you don't know exact names,
                concept-based searches, fuzzy matching.
                Examples: "AI researchers", "sustainable energy companies"
                """
            ),
            Tool(
                name="DirectCypher",
                func=self._direct_cypher_wrapper,
                description="""Execute Cypher queries directly (advanced).
                Use when you need precise control over the query structure.
                Always validate Cypher syntax before using.
                """
            ),
            Tool(
                name="GraphSchema",
                func=lambda _: self.graph.schema,
                description="""Get the current graph schema including node labels,
                relationship types, and properties. Use to understand data structure.
                """
            )
        ]

        prompt = PromptTemplate.from_template("""
You are a knowledge graph expert agent. Answer questions by querying the graph database.

Available tools:
{tools}

Tool names: {tool_names}

Use the following format:
Question: the input question
Thought: reason about which tool to use
Action: the tool name
Action Input: the input to the tool
Observation: the tool's output
... (repeat Thought/Action/Observation as needed)
Thought: I now know the final answer
Final Answer: the answer to the question

Question: {input}
{agent_scratchpad}
""")

        agent = create_react_agent(self.llm, tools, prompt)
        return AgentExecutor(agent=agent, tools=tools, verbose=True, max_iterations=5)

    def _graph_qa_wrapper(self, query: str) -> str:
        """Wrapper with error handling for graph QA."""
        try:
            result = self.graph_qa.invoke({"query": query})
            cypher = result.get("intermediate_steps", [{}])[0].get("query", "N/A")
            logger.info(f"Generated Cypher: {cypher}")
            return result["result"]
        except Exception as e:
            logger.error(f"Graph QA error: {e}")
            return f"Error querying graph: {e}"

    def _semantic_search_wrapper(self, query: str) -> str:
        """Wrapper for semantic search with formatting."""
        try:
            results = self.vector_store.similarity_search(query, k=10)
            formatted = []
            for doc in results:
                formatted.append(f"- {doc.metadata.get('name', 'Unknown')}: {doc.page_content[:200]}")
            return "\\n".join(formatted) if formatted else "No results found."
        except Exception as e:
            logger.error(f"Semantic search error: {e}")
            return f"Error in semantic search: {e}"

    def _direct_cypher_wrapper(self, cypher: str) -> str:
        """Wrapper for direct Cypher execution."""
        try:
            results = self.graph.query(cypher)
            return str(results[:20])  # Limit output
        except Exception as e:
            logger.error(f"Cypher error: {e}")
            return f"Cypher execution error: {e}"

    def query(self, question: str) -> str:
        """Main entry point for questions."""
        logger.info(f"Processing question: {question}")
        result = self.agent.invoke({"input": question})
        return result["output"]

# Usage
agent = ProductionGraphRAGAgent(
    neo4j_url="bolt://localhost:7687",
    neo4j_user="neo4j",
    neo4j_password="password"
)

# Ask complex questions
questions = [
    "What companies does Alice work with and what industries are they in?",
    "Find experts in machine learning and their connections",
    "Which teams have the highest employee count?",
]

for q in questions:
    print(f"\\nQ: {q}")
    print(f"A: {agent.query(q)}")`,
        explanation: "This production agent combines multiple tools: GraphCypherQAChain for natural language graph queries, vector search for semantic similarity, and direct Cypher for advanced queries. The ReAct pattern lets the agent choose the right tool for each question."
      }
    ],

    diagrams: [
      {
        title: "Graph vs Vector Retrieval",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Vector["Vector Retrieval"]
        VQ["Query: 'AI researchers'"]
        VE["Embed query"]
        VS["Search similar vectors"]
        VR["Return top-k chunks"]
        VQ --> VE --> VS --> VR
    end

    subgraph Graph["Graph Retrieval"]
        GQ["Query: 'Who works at AI companies?'"]
        GC["Generate Cypher"]
        GT["Traverse relationships"]
        GR["Return connected entities"]
        GQ --> GC --> GT --> GR
    end

    subgraph Hybrid["Hybrid GraphRAG"]
        HQ["Query: 'Find ML experts and their projects'"]
        H1["1. Vector: Find 'ML expert' matches"]
        H2["2. Graph: Expand via WORKS_ON relationships"]
        H3["3. Combine: Merge results with context"]
        HQ --> H1 --> H2 --> H3
    end

    style Vector fill:#e3f2fd
    style Graph fill:#fff3e0
    style Hybrid fill:#e8f5e9`,
        caption: "Vector retrieval finds semantically similar content. Graph retrieval traverses relationships. Hybrid GraphRAG combines both for comprehensive results."
      },
      {
        title: "Knowledge Graph Data Model",
        type: "mermaid",
        mermaid: `graph LR
    subgraph Nodes["Nodes (Entities)"]
        P1["Person<br/>name: Alice<br/>title: CEO"]
        P2["Person<br/>name: Bob<br/>title: Engineer"]
        C1["Company<br/>name: TechCorp<br/>industry: AI"]
        C2["Company<br/>name: DataCo<br/>industry: Analytics"]
        PR["Product<br/>name: AIBot<br/>category: SaaS"]
    end

    P1 -->|FOUNDED| C1
    P1 -->|WORKS_AT| C1
    P2 -->|WORKS_AT| C1
    P1 -->|MANAGES| P2
    C1 -->|MAKES| PR
    C1 -->|PARTNERS_WITH| C2

    style P1 fill:#bbdefb
    style P2 fill:#bbdefb
    style C1 fill:#c8e6c9
    style C2 fill:#c8e6c9
    style PR fill:#fff9c4`,
        caption: "Knowledge graphs model entities as nodes with properties, connected by typed relationships. This structure enables rich queries about how things are connected."
      },
      {
        title: "GraphRAG Pipeline",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Input
        DOC["Unstructured<br/>Documents"]
        Q["Natural Language<br/>Question"]
    end

    subgraph Construction["Graph Construction"]
        EXT["Entity<br/>Extraction"]
        REL["Relationship<br/>Extraction"]
        RES["Entity<br/>Resolution"]
        LOAD["Load to<br/>Neo4j"]
        DOC --> EXT --> REL --> RES --> LOAD
    end

    subgraph Query["Query Pipeline"]
        NLU["Question<br/>Understanding"]
        CYP["Cypher<br/>Generation"]
        EXEC["Query<br/>Execution"]
        GEN["Answer<br/>Generation"]
        Q --> NLU --> CYP --> EXEC --> GEN
    end

    subgraph Storage["Neo4j"]
        NODES["Nodes"]
        RELS["Relationships"]
        IDX["Indexes"]
        VEC["Vector<br/>Index"]
    end

    LOAD --> Storage
    EXEC --> Storage
    Storage --> GEN

    style Construction fill:#fff3e0
    style Query fill:#e3f2fd
    style Storage fill:#f3e5f5`,
        caption: "GraphRAG involves two main pipelines: construction (extracting entities and relationships from documents) and query (translating questions to Cypher and generating answers)."
      }
    ],

    keyTakeaways: [
      "Knowledge graphs store entities (nodes) and relationships (edges) explicitly, enabling multi-hop reasoning impossible with vector search",
      "Cypher is Neo4j's query language—use pattern matching syntax (a)-[:REL]->(b) to express graph traversals",
      "GraphCypherQAChain translates natural language to Cypher, letting agents query graphs without writing Cypher directly",
      "Hybrid GraphRAG combines vector similarity (semantic meaning) with graph traversal (structural relationships) for powerful retrieval",
      "LLMGraphTransformer extracts entities and relationships from unstructured text to build knowledge graphs automatically",
      "Production systems need schema constraints, indexes, query optimization, and error handling for reliable operation"
    ],

    resources: [
      {
        title: "Neo4j Cypher Manual",
        url: "https://neo4j.com/docs/cypher-manual/current/",
        type: "docs",
        description: "Complete reference for Cypher query language including patterns, clauses, and functions",
        summaryPath: "data/day-17/summary-cypher-fundamentals.md"
      },
      {
        title: "LangChain Neo4j Integration",
        url: "https://python.langchain.com/docs/integrations/graphs/neo4j_cypher/",
        type: "docs",
        description: "LangChain documentation for Neo4jGraph, GraphCypherQAChain, and Neo4jVector",
        summaryPath: "data/day-17/summary-langchain-neo4j.md"
      },
      {
        title: "GraphRAG with Neo4j and LLMs",
        url: "https://neo4j.com/developer-blog/knowledge-graph-rag-application/",
        type: "article",
        description: "Comprehensive guide to building RAG applications using knowledge graphs",
        summaryPath: "data/day-17/summary-graphrag-patterns.md"
      },
      {
        title: "Neo4j LLM Graph Builder",
        url: "https://neo4j.com/labs/genai-ecosystem/llm-graph-builder/",
        type: "tool",
        description: "Tool for automatically extracting knowledge graphs from documents using LLMs",
        summaryPath: "data/day-17/summary-graph-construction.md"
      }
    ],

    faq: [
      {
        question: "When should I use a knowledge graph instead of a vector database?",
        answer: "Use knowledge graphs when your questions involve relationships between entities: 'who works with whom', 'what depends on what', 'how are X and Y connected'. Vector databases excel at semantic similarity ('find documents about topic X'). Many production systems use both: vectors for initial retrieval, graphs for context expansion."
      },
      {
        question: "How do I handle entity resolution when building graphs from text?",
        answer: "Entity resolution—recognizing that 'Alice Smith', 'Alice', and 'Ms. Smith' are the same person—is a key challenge. Approaches include: (1) fuzzy string matching on names, (2) using LLMs to compare entity descriptions, (3) leveraging unique identifiers when available, (4) manual review for critical entities. MERGE in Cypher helps prevent duplicates during insertion."
      },
      {
        question: "What's the performance impact of GraphCypherQAChain?",
        answer: "The main latency is LLM inference for Cypher generation (~1-2 seconds). Graph queries themselves are typically fast (milliseconds) if properly indexed. Use validate_cypher=True during development but consider disabling in production if latency is critical. Cache common queries when possible."
      },
      {
        question: "How large can a knowledge graph get before performance degrades?",
        answer: "Neo4j handles billions of nodes and relationships in production. Performance depends on query complexity, not raw size. Key factors: (1) proper indexes on frequently-queried properties, (2) bounded traversals (LIMIT, path length limits), (3) query optimization (use EXPLAIN/PROFILE). Most performance issues are query-related, not size-related."
      },
      {
        question: "Can I use knowledge graphs with local LLMs instead of OpenAI?",
        answer: "Yes, but Cypher generation quality varies significantly by model. GPT-4 class models generate accurate Cypher most of the time. Smaller models often make syntax errors or misunderstand the schema. If using local models, consider: (1) more examples in the prompt, (2) stricter schema constraints, (3) fallback to predefined query templates for common questions."
      }
    ],

    applications: [
      {
        title: "Enterprise Knowledge Management",
        description: "Connect organizational data—employees, departments, projects, skills—into a queryable graph. Enable questions like 'Find experts in Python who have worked on healthcare projects' or 'Show the reporting structure for the AI team'."
      },
      {
        title: "Drug Discovery and Life Sciences",
        description: "Model relationships between compounds, proteins, diseases, and clinical trials. Traverse connections to find drug repurposing opportunities, understand side effect pathways, or identify research gaps."
      },
      {
        title: "Fraud Detection and Risk Analysis",
        description: "Build transaction graphs to detect circular patterns, shell company networks, or suspicious relationship clusters. Graph algorithms reveal patterns invisible in tabular data."
      },
      {
        title: "Supply Chain Intelligence",
        description: "Map suppliers, components, facilities, and logistics routes. Query for supply chain vulnerabilities: 'Which products depend on suppliers in regions with high natural disaster risk?'"
      }
    ],

    relatedDays: [14, 15, 16, 18, 6]
  }
};
