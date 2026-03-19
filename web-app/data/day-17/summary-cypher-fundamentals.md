# Cypher Query Language Fundamentals

## Overview

Cypher is Neo4j's declarative graph query language. Its ASCII-art syntax makes pattern matching intuitive—you literally draw the pattern you want to find.

## Core Concepts

### Nodes (Vertices)

Nodes represent entities and are written in parentheses:

```cypher
(p)                          -- Anonymous node
(p:Person)                   -- Node with label
(p:Person {name: "Alice"})   -- Node with label and property
(p:Person:Employee)          -- Node with multiple labels
```

### Relationships (Edges)

Relationships connect nodes and use ASCII arrow syntax:

```cypher
-[r]->                       -- Outgoing relationship
<-[r]-                       -- Incoming relationship
-[r]-                        -- Either direction
-[:WORKS_AT]->               -- Typed relationship
-[r:WORKS_AT {since: 2020}]-> -- With properties
-[:KNOWS*1..3]->             -- Variable length (1 to 3 hops)
```

### Pattern Matching (MATCH)

MATCH finds patterns in the graph:

```cypher
-- Find all people
MATCH (p:Person)
RETURN p.name

-- Find person-company relationships
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
RETURN p.name, c.name

-- Multi-hop patterns
MATCH (a:Person)-[:KNOWS]->(b:Person)-[:KNOWS]->(c:Person)
WHERE a <> c
RETURN a.name, c.name as friend_of_friend
```

## Essential Clauses

### WHERE (Filtering)

```cypher
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
WHERE c.industry = "Technology"
  AND p.age > 25
  AND p.name STARTS WITH "A"
RETURN p, c
```

### RETURN (Output)

```cypher
RETURN p.name                    -- Property
RETURN p.name AS person_name     -- Alias
RETURN DISTINCT c.industry       -- Deduplicate
RETURN p, c                      -- Full nodes
RETURN count(p), avg(p.age)      -- Aggregations
```

### CREATE (Insert)

```cypher
-- Create node
CREATE (p:Person {name: "Bob", age: 30})

-- Create node and relationship
CREATE (p:Person {name: "Alice"})-[:WORKS_AT]->(c:Company {name: "TechCorp"})
```

### MERGE (Find or Create)

```cypher
-- Create only if doesn't exist
MERGE (p:Person {name: "Alice"})
ON CREATE SET p.created = timestamp()
ON MATCH SET p.lastSeen = timestamp()
```

### SET and DELETE

```cypher
-- Update properties
MATCH (p:Person {name: "Alice"})
SET p.title = "Engineer", p.updated = timestamp()

-- Delete nodes and relationships
MATCH (p:Person {name: "Bob"})
DETACH DELETE p  -- DETACH removes relationships first
```

## Aggregation Functions

```cypher
-- Count and collect
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
RETURN c.name, count(p) as employees, collect(p.name) as names

-- Statistical functions
MATCH (p:Person)
RETURN avg(p.age), min(p.age), max(p.age), sum(p.salary)

-- Grouping
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
WITH c, count(p) as size
WHERE size > 10
RETURN c.name, size
ORDER BY size DESC
```

## Path Queries

```cypher
-- Shortest path
MATCH path = shortestPath(
  (a:Person {name: "Alice"})-[:KNOWS*]-(b:Person {name: "Zara"})
)
RETURN path, length(path)

-- All shortest paths
MATCH path = allShortestPaths(
  (a:Person {name: "Alice"})-[:KNOWS*]-(b:Person {name: "Zara"})
)
RETURN path

-- Variable-length paths with bounds
MATCH (a:Person)-[:KNOWS*1..5]->(b:Person)
RETURN a.name, b.name
```

## Indexes and Constraints

```cypher
-- Create index for faster lookups
CREATE INDEX person_name FOR (p:Person) ON (p.name)

-- Composite index
CREATE INDEX person_name_title FOR (p:Person) ON (p.name, p.title)

-- Uniqueness constraint (also creates index)
CREATE CONSTRAINT person_email_unique
FOR (p:Person) REQUIRE p.email IS UNIQUE

-- Full-text index for search
CREATE FULLTEXT INDEX person_search
FOR (p:Person) ON EACH [p.name, p.bio, p.skills]
```

## Performance Tips

1. **Use indexes** on properties used in WHERE clauses
2. **Limit results** early with LIMIT
3. **Bound variable-length paths** (e.g., `*1..3` not `*`)
4. **Use EXPLAIN/PROFILE** to analyze query plans
5. **Put selective filters first** in WHERE clauses

## Common Patterns

```cypher
-- Find colleagues (same company)
MATCH (me:Person {name: $name})-[:WORKS_AT]->(c)<-[:WORKS_AT]-(colleague)
WHERE colleague <> me
RETURN colleague

-- Find mutual connections
MATCH (a:Person)-[:KNOWS]->(mutual)<-[:KNOWS]-(b:Person)
WHERE a.name = "Alice" AND b.name = "Bob"
RETURN mutual

-- Hierarchical queries (org chart)
MATCH path = (ceo:Person {title: "CEO"})-[:MANAGES*]->(employee)
RETURN employee.name, length(path) as level
```

## References

- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/)
- [Cypher Refcard](https://neo4j.com/docs/cypher-refcard/current/)
- [Graph Pattern Matching](https://neo4j.com/docs/cypher-manual/current/patterns/)
