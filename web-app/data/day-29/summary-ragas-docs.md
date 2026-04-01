# Ragas Documentation Summary

> Source: https://docs.ragas.io/

## Overview

Ragas (Retrieval Augmented Generation Assessment) is an open-source framework specifically designed for evaluating RAG pipelines. It provides metrics that assess both retrieval quality and generation quality, using LLMs as judges for nuanced evaluation.

## Key Features

### Core Metrics
- **context_precision**: Measures if retrieved context is relevant to the question
- **context_recall**: Evaluates if context contains information needed to answer
- **faithfulness**: Checks if the answer is grounded in the provided context
- **answer_relevancy**: Measures how well the answer addresses the question
- **answer_similarity**: Compares generated answer to ground truth
- **answer_correctness**: Combines semantic and factual correctness

### Installation
```bash
pip install ragas
```

### Environment Variables
```bash
OPENAI_API_KEY=sk_...  # Required for LLM-based metrics
```

## Python SDK

### Basic Evaluation
```python
from ragas import evaluate
from ragas.metrics import (
    context_precision,
    context_recall,
    faithfulness,
    answer_relevancy
)
from datasets import Dataset

# Prepare evaluation data
data = {
    "question": ["What is the capital of France?"],
    "answer": ["Paris is the capital of France."],
    "contexts": [["France is a country in Europe. Its capital is Paris."]],
    "ground_truth": ["Paris"]
}

dataset = Dataset.from_dict(data)

# Run evaluation
result = evaluate(
    dataset,
    metrics=[
        context_precision,
        context_recall,
        faithfulness,
        answer_relevancy
    ]
)

print(result)
```

### Metric Details

#### Faithfulness
```python
from ragas.metrics import faithfulness

# Measures: Are all claims in the answer supported by context?
# Score: 0-1 (higher is better)
# Formula: (supported_claims) / (total_claims)
```

#### Context Precision
```python
from ragas.metrics import context_precision

# Measures: How relevant is the retrieved context to the question?
# Score: 0-1 (higher is better)
# Considers: Ranking of relevant chunks (earlier is better)
```

#### Context Recall
```python
from ragas.metrics import context_recall

# Measures: Can the ground truth be attributed to the context?
# Score: 0-1 (higher is better)
# Requires: Ground truth answer for comparison
```

#### Answer Relevancy
```python
from ragas.metrics import answer_relevancy

# Measures: How well does the answer address the question?
# Score: 0-1 (higher is better)
# Method: Generates questions from answer, compares to original
```

### Dataset Format
```python
from datasets import Dataset

# Required columns depend on metrics used
data = {
    "question": [...],           # Always required
    "answer": [...],             # Always required
    "contexts": [...],           # List of strings per row
    "ground_truth": [...]        # Required for some metrics
}

dataset = Dataset.from_dict(data)
```

### Using Different LLMs
```python
from ragas import evaluate
from langchain_anthropic import ChatAnthropic
from ragas.llms import LangchainLLMWrapper

# Use Claude as the judge
claude = ChatAnthropic(model="claude-sonnet-4-20250514")
wrapped_llm = LangchainLLMWrapper(claude)

result = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy],
    llm=wrapped_llm
)
```

### Batch Evaluation
```python
from ragas import evaluate

# Evaluate large datasets
result = evaluate(
    large_dataset,
    metrics=[faithfulness, context_precision],
    raise_exceptions=False,  # Continue on errors
    show_progress=True
)

# Access per-row scores
df = result.to_pandas()
print(df[["question", "faithfulness", "context_precision"]])
```

### Async Evaluation
```python
from ragas import evaluate
import asyncio

async def run_evaluation():
    result = await evaluate(
        dataset,
        metrics=[faithfulness],
        is_async=True
    )
    return result

result = asyncio.run(run_evaluation())
```

## Integration with LangChain

```python
from ragas.integrations.langchain import EvaluatorChain
from langchain_anthropic import ChatAnthropic

# Create evaluator chain
evaluator = EvaluatorChain(
    metric=faithfulness,
    llm=ChatAnthropic(model="claude-sonnet-4-20250514")
)

# Use in LangChain pipeline
score = evaluator.invoke({
    "question": "What is AI?",
    "answer": "AI is artificial intelligence.",
    "contexts": ["AI, or artificial intelligence, is..."]
})
```

## Testset Generation

```python
from ragas.testset import TestsetGenerator
from ragas.testset.evolutions import simple, reasoning, multi_context

# Generate test cases from documents
generator = TestsetGenerator.from_langchain(
    llm=ChatAnthropic(model="claude-sonnet-4-20250514"),
    embeddings=OpenAIEmbeddings()
)

testset = generator.generate_with_langchain_docs(
    documents=documents,
    test_size=20,
    distributions={simple: 0.5, reasoning: 0.3, multi_context: 0.2}
)
```

## Best Practices

1. **Use ground truth when available**: Improves context_recall accuracy
2. **Evaluate on diverse examples**: Cover different question types and difficulty
3. **Monitor metric correlations**: High faithfulness + low relevancy = different problem than reverse
4. **Set per-metric thresholds**: Each metric has different acceptable ranges
5. **Version your evaluation datasets**: Track changes over time
6. **Compare across RAG configurations**: Use metrics to guide architecture decisions

## Metric Interpretation Guide

| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| faithfulness | >= 0.8 | 0.6-0.8 | < 0.6 |
| context_precision | >= 0.7 | 0.5-0.7 | < 0.5 |
| context_recall | >= 0.8 | 0.6-0.8 | < 0.6 |
| answer_relevancy | >= 0.85 | 0.7-0.85 | < 0.7 |

## Common Issues

- **Low faithfulness**: Model hallucinating or context insufficient
- **Low context_precision**: Retriever returning irrelevant documents
- **Low context_recall**: Retriever missing relevant documents
- **Low answer_relevancy**: Model going off-topic or over-explaining
