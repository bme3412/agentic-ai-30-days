# Phoenix (Arize) Documentation Summary

> Source: https://docs.arize.com/phoenix

## Overview

Phoenix is an open-source observability platform for LLM applications built on OpenTelemetry standards. It provides vendor-neutral tracing that works with any LLM framework, offering both self-hosted and cloud deployment options.

## Key Features

### OpenTelemetry Foundation
- **Industry standard**: Built on OTEL for portability
- **Semantic conventions**: LLM-specific span attributes
- **Collector integration**: Works with existing OTEL infrastructure
- **Export flexibility**: Send traces to multiple backends

### Multi-Framework Support
- LangChain / LangGraph
- OpenAI SDK
- Anthropic SDK
- LlamaIndex
- Any OTEL-instrumented code

### Deployment Options
- **Local development**: `px.launch_app()` starts local server
- **Self-hosted**: Deploy on your infrastructure
- **Arize Cloud**: Managed service with additional features

## Installation & Setup

### Local Phoenix
```python
import phoenix as px
from phoenix.otel import register

# Start local Phoenix server
px.launch_app()

# Register tracer
tracer_provider = register(
    project_name="my-agent",
    endpoint="http://localhost:6006/v1/traces"
)
```

### Framework Instrumentation
```python
from openinference.instrumentation.langchain import LangChainInstrumentor
from openinference.instrumentation.openai import OpenAIInstrumentor

# Instrument frameworks
LangChainInstrumentor().instrument(tracer_provider=tracer_provider)
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
```

## Trace Visualization

### Trace Explorer
- Hierarchical span view
- Timing waterfall
- Input/output inspection
- Error highlighting

### Filtering & Search
- Filter by time range
- Search by span attributes
- Filter by trace status
- Custom attribute queries

## Embeddings Analysis

Phoenix includes tools for analyzing embedding quality:

- **Embedding drift**: Detect distribution shifts
- **Clustering**: Visualize embedding space
- **Retrieval analysis**: Evaluate RAG quality

## Key Concepts

### Spans
- **LLM spans**: Model calls with token counts
- **Retriever spans**: Vector search operations
- **Tool spans**: Function/tool invocations
- **Chain spans**: Workflow containers

### Attributes
- `llm.model_name`: Model identifier
- `llm.token_count.prompt`: Input tokens
- `llm.token_count.completion`: Output tokens
- `llm.invocation_parameters`: Temperature, etc.

## Integration with Arize Platform

For production deployments, Phoenix can connect to Arize:

- Extended retention
- Advanced analytics
- Team collaboration
- Alerting and monitoring

## OpenInference Libraries

The `openinference` package provides instrumentation:

```bash
pip install openinference-instrumentation-langchain
pip install openinference-instrumentation-openai
pip install openinference-instrumentation-llama-index
```

## Best Practices

1. **Start local**: Use `px.launch_app()` for development
2. **Consistent instrumentation**: Instrument all frameworks you use
3. **Custom attributes**: Add business context to spans
4. **Sampling in production**: Reduce volume while maintaining visibility
5. **Export to existing infrastructure**: Leverage existing OTEL setup

## Comparison with LangSmith

| Feature | Phoenix | LangSmith |
|---------|---------|-----------|
| Standards | OpenTelemetry | Proprietary |
| Self-hosted | Yes | No |
| LangChain integration | Manual setup | Automatic |
| Multi-framework | Native | Limited |
| Evaluation | External tools | Built-in |
