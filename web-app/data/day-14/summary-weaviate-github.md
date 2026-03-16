# Weaviate GitHub Repository

*Summary of the open-source Weaviate vector database project*

## Repository Overview

**GitHub**: [github.com/weaviate/weaviate](https://github.com/weaviate/weaviate)

Weaviate is an open-source vector database written in Go. It's designed for storing both objects and their vector representations, enabling semantic search and AI-native applications.

## Key Stats

- **Language**: Go (primary), with client libraries in Python, JavaScript, Java, Go
- **License**: BSD-3-Clause (permissive open source)
- **Stars**: 10,000+ (as of 2025)
- **Active Development**: Regular releases, active community

## Project Structure

```
weaviate/
├── adapters/          # Storage and network adapters
├── client/            # Go client library
├── entities/          # Core data structures
├── modules/           # Vectorizer and other modules
├── usecases/          # Business logic
├── cmd/               # CLI entry points
└── test/              # Integration tests
```

## Running Locally

### Docker (Recommended)
```bash
docker run -d \
  -p 8080:8080 \
  -p 50051:50051 \
  -e QUERY_DEFAULTS_LIMIT=25 \
  -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
  -e PERSISTENCE_DATA_PATH=/var/lib/weaviate \
  -e DEFAULT_VECTORIZER_MODULE=none \
  -e CLUSTER_HOSTNAME=node1 \
  semitechnologies/weaviate:latest
```

### Docker Compose (With Modules)
```yaml
version: '3.4'
services:
  weaviate:
    image: semitechnologies/weaviate:latest
    ports:
      - "8080:8080"
      - "50051:50051"
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-openai'
      ENABLE_MODULES: 'text2vec-openai'
      OPENAI_APIKEY: $OPENAI_APIKEY
      CLUSTER_HOSTNAME: 'node1'
```

## Module Ecosystem

Weaviate's functionality extends through modules:

### Vectorizers
- `text2vec-openai`: OpenAI embeddings
- `text2vec-cohere`: Cohere embeddings
- `text2vec-huggingface`: HuggingFace models
- `text2vec-transformers`: Local transformer models
- `multi2vec-clip`: Image + text embeddings

### Generators (for RAG)
- `generative-openai`: GPT models
- `generative-cohere`: Cohere generation
- `generative-palm`: Google PaLM

### Other
- `qna-openai`: Question answering
- `reranker-cohere`: Result reranking

## Contributing

### Development Setup
```bash
# Clone repository
git clone https://github.com/weaviate/weaviate.git
cd weaviate

# Build
go build ./cmd/weaviate-server

# Run tests
go test ./...
```

### Contribution Guidelines
- Fork the repository
- Create a feature branch
- Write tests for new functionality
- Submit a pull request
- Follow Go conventions and existing code style

## Community Resources

### Getting Help
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community chat
- **Slack Community**: Real-time help
- **Forum**: [forum.weaviate.io](https://forum.weaviate.io)

### Related Repositories
- [weaviate-python-client](https://github.com/weaviate/weaviate-python-client)
- [weaviate-io](https://github.com/weaviate/weaviate-io) - Documentation site
- [Verba](https://github.com/weaviate/Verba) - RAG application template
- [awesome-weaviate](https://github.com/weaviate/awesome-weaviate) - Community resources

## Release Cycle

- **Major releases**: New features, may include breaking changes
- **Minor releases**: New features, backward compatible
- **Patch releases**: Bug fixes and security updates

Docker images are tagged with version numbers and `latest` for the most recent stable release.

## Architecture Highlights

### HNSW Index
Weaviate uses Hierarchical Navigable Small World (HNSW) graphs for efficient approximate nearest neighbor search. This enables millisecond-scale queries across millions of vectors.

### Horizontal Scaling
Supports sharding and replication for distributed deployments. Data is partitioned across nodes with configurable replication factors.

### ACID Transactions
Write-ahead logging ensures durability. Objects are persisted before acknowledgment.

### GraphQL API
Primary query interface uses GraphQL, with REST endpoints for CRUD operations.

## Why Open Source Matters

Being open source means:
- **Transparency**: Audit the code for security and correctness
- **Flexibility**: Self-host or use Weaviate Cloud
- **Community**: Benefit from and contribute to shared development
- **No lock-in**: Your data, your infrastructure
