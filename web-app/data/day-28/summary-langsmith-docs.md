# LangSmith Documentation Summary

> Source: https://docs.smith.langchain.com/

## Overview

LangSmith is LangChain's observability and evaluation platform for LLM applications. It provides automatic tracing for LangChain/LangGraph applications, dataset management for evaluation, and tools for debugging and improving agent performance.

## Key Features

### Automatic Tracing
- **Zero-config setup**: Set 3 environment variables and all LangChain operations are traced
- **Hierarchical traces**: Parent-child span relationships show execution flow
- **Rich metadata**: Token counts, latency, inputs/outputs captured automatically
- **Project organization**: Group traces by project for easier management

### Environment Variables
```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=ls_...
LANGCHAIN_PROJECT=my-project
LANGCHAIN_TAGS=production,v2  # Optional
```

### Trace Structure
- **Runs**: Top-level traces (one per agent invocation)
- **Child runs**: Nested operations (LLM calls, tool invocations)
- **Feedback**: Human or automated scores attached to runs
- **Metadata**: Custom key-value pairs for filtering

### Datasets & Evaluation
- **Dataset creation**: Build evaluation datasets from production traces
- **Example management**: Add, edit, delete examples with inputs and expected outputs
- **Evaluators**: Built-in and custom evaluators for quality assessment
- **Experiments**: Track evaluation results over time

### Prompt Playground
- **Prompt iteration**: Test prompts with different inputs
- **Version control**: Track prompt changes over time
- **A/B testing**: Compare prompt variants

## Python SDK

### Basic Tracing
```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "ls_..."

from langchain_anthropic import ChatAnthropic
llm = ChatAnthropic(model="claude-sonnet-4-20250514")
# All calls automatically traced
response = llm.invoke("Hello!")
```

### Manual Tracing with @traceable
```python
from langsmith import traceable

@traceable(name="my_function")
def process_data(input: str) -> str:
    # Function body automatically traced
    return result
```

### Querying Traces
```python
from langsmith import Client
client = Client()

runs = client.list_runs(
    project_name="my-project",
    start_time=datetime.now() - timedelta(hours=1),
    is_root=True
)
```

### Adding Feedback
```python
client.create_feedback(
    run_id=run.id,
    key="correctness",
    score=1.0,
    comment="Response was accurate"
)
```

## Best Practices

1. **Organize by project**: Separate dev/staging/prod environments
2. **Use tags**: Add metadata for filtering (version, feature, user_id)
3. **Set up alerts**: Monitor error rates and latency
4. **Build datasets**: Export interesting traces for evaluation
5. **Track costs**: Use token counts for cost attribution

## Pricing Considerations

- Free tier: Limited traces per month
- Developer tier: More traces, longer retention
- Enterprise: Custom retention, SSO, dedicated support
- Storage scales with trace volume and payload size
