# DeepEval Documentation Summary

> Source: https://docs.confident-ai.com/

## Overview

DeepEval is an open-source evaluation framework for LLM applications. It provides a pytest-like interface for testing LLM outputs, with built-in metrics for measuring faithfulness, relevancy, hallucination, and more. DeepEval integrates with CI/CD pipelines for continuous evaluation.

## Key Features

### LLM Evaluation Metrics
- **Faithfulness**: Measures factual consistency between response and context
- **Answer Relevancy**: Evaluates how well response addresses the question
- **Hallucination**: Detects fabricated information not in context
- **Contextual Precision**: Measures quality of retrieved context
- **Contextual Recall**: Evaluates if context contains needed information
- **Contextual Relevancy**: Checks if context is relevant to query
- **Toxicity**: Detects harmful or offensive content
- **Bias**: Identifies biased language in responses

### Installation
```bash
pip install deepeval
```

### Environment Variables
```bash
DEEPEVAL_API_KEY=your_key  # Optional: for cloud features
OPENAI_API_KEY=sk_...      # For LLM-as-judge metrics
```

## Python SDK

### Basic Test Case
```python
from deepeval import evaluate
from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric

test_case = LLMTestCase(
    input="What is the capital of France?",
    actual_output="Paris is the capital of France.",
    expected_output="Paris"
)

metric = AnswerRelevancyMetric(threshold=0.7)
evaluate([test_case], [metric])
```

### Pytest Integration
```python
import pytest
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import FaithfulnessMetric

@pytest.mark.parametrize("test_case", test_cases)
def test_faithfulness(test_case):
    metric = FaithfulnessMetric(threshold=0.8)
    assert_test(test_case, [metric])
```

### Running Tests
```bash
# Run all evaluation tests
deepeval test run

# Run with specific metrics
deepeval test run --metric faithfulness

# Generate report
deepeval test run --report
```

### Faithfulness Metric
```python
from deepeval.metrics import FaithfulnessMetric
from deepeval.test_case import LLMTestCase

test_case = LLMTestCase(
    input="What did the report say about Q3?",
    actual_output="Revenue increased 15% in Q3.",
    retrieval_context=["Q3 2024 Report: Revenue grew by 15% YoY..."]
)

metric = FaithfulnessMetric(
    threshold=0.8,
    model="gpt-4o"  # Judge model
)

metric.measure(test_case)
print(f"Score: {metric.score}")
print(f"Reason: {metric.reason}")
```

### Hallucination Metric
```python
from deepeval.metrics import HallucinationMetric

test_case = LLMTestCase(
    input="Summarize the document",
    actual_output="The document discusses AI safety...",
    context=["Original document content here..."]
)

metric = HallucinationMetric(threshold=0.3)  # Lower is better
metric.measure(test_case)
```

### Custom Metrics
```python
from deepeval.metrics import BaseMetric
from deepeval.test_case import LLMTestCase

class ToolAccuracyMetric(BaseMetric):
    def __init__(self, threshold: float = 0.9):
        self.threshold = threshold
        self.score = None

    def measure(self, test_case: LLMTestCase) -> float:
        # Custom evaluation logic
        correct_tools = evaluate_tool_calls(
            test_case.actual_output,
            test_case.expected_output
        )
        self.score = correct_tools / total_tools
        return self.score

    def is_successful(self) -> bool:
        return self.score >= self.threshold
```

### Datasets
```python
from deepeval.dataset import EvaluationDataset

# Create dataset
dataset = EvaluationDataset()
dataset.add_test_cases([test_case1, test_case2, ...])

# Save/load
dataset.save("my_dataset.json")
dataset = EvaluationDataset.load("my_dataset.json")

# Evaluate entire dataset
evaluate(dataset, [FaithfulnessMetric(), AnswerRelevancyMetric()])
```

## CI/CD Integration

### GitHub Actions
```yaml
name: LLM Evaluation
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install deepeval
      - run: deepeval test run
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Best Practices

1. **Set appropriate thresholds**: Start conservative, adjust based on data
2. **Use multiple metrics**: No single metric captures all quality aspects
3. **Version your test datasets**: Track changes to evaluation data
4. **Monitor trends**: Look for regressions over time, not just pass/fail
5. **Choose the right judge model**: More capable models give better evaluations
6. **Include edge cases**: Test boundary conditions and error handling

## Metric Selection Guide

| Use Case | Recommended Metrics |
|----------|-------------------|
| RAG Systems | Faithfulness, Contextual Precision/Recall |
| Chatbots | Answer Relevancy, Hallucination |
| Content Generation | Toxicity, Bias, Hallucination |
| Agents | Tool Accuracy (custom), Task Completion |
| Summarization | Faithfulness, Completeness |
