import type { Day } from '../../types';

export const day29: Day = {
  day: 29,
  phase: 6,
  title: "Evaluating & Testing Agents",
  partner: "Arize / DeepLearning.AI",
  tags: ["evaluation", "testing", "metrics", "deepeval", "ragas"],
  concept: "Measuring agent performance with automated evaluation",
  demoUrl: "demos/day-29/",
  demoDescription: "Interactive evaluation playground with metric visualization, test case builder, and LLM-as-judge simulation",

  // ═══════════════════════════════════════════════════════════════
  // LESSON
  // ═══════════════════════════════════════════════════════════════
  lesson: {
    overview: `Agent evaluation is fundamentally different from traditional software testing. You can't simply check if output equals expected output — agent responses are non-deterministic, contextual, and often have multiple valid answers. This requires a new evaluation paradigm built around metrics that capture quality dimensions like faithfulness, relevancy, and hallucination.

The core insight: **process matters as much as outcome**. An agent that gets the right answer through flawed reasoning is a ticking time bomb. Effective evaluation measures both *what* the agent produces and *how* it got there — including tool selection accuracy, reasoning quality, and adherence to context.

Two frameworks lead this space: **DeepEval** provides a pytest-like interface for LLM testing with built-in metrics and CI/CD integration. **Ragas** specializes in RAG evaluation with metrics designed specifically for retrieval-augmented workflows. Both use LLM-as-judge patterns where capable models evaluate outputs, giving you scalable, nuanced assessment without manual labeling.`,

    principles: [
      {
        title: "Process Over Outcome",
        description: "Getting the right answer isn't enough. An agent that hallucinates but happens to be correct is unreliable. Evaluate the reasoning process: Did it use the right tools? Did it ground claims in context? Did it follow instructions? Process evaluation catches problems before they cause visible failures."
      },
      {
        title: "Metrics Must Match Goals",
        description: "Choose metrics that reflect what you actually care about. For RAG: faithfulness and context precision. For agents: tool accuracy and task completion. For chatbots: relevancy and toxicity. Using generic metrics gives generic insights — tailor your evaluation to your specific use case."
      },
      {
        title: "Ground Truth is Gold",
        description: "The best evaluations compare against known-good answers. Build datasets with expert-labeled examples covering normal cases, edge cases, and failure modes. Ground truth enables precise measurement; without it, you're relying entirely on LLM judgment which has its own biases."
      },
      {
        title: "Regression is Non-Negotiable",
        description: "Every prompt change, model update, or configuration tweak can degrade performance. Run your evaluation suite before every deployment. Track metrics over time. Set thresholds that block releases when quality drops. Continuous evaluation catches regressions before users do."
      },
      {
        title: "Judge Selection Matters",
        description: "LLM-as-judge evaluation is only as good as your judge model. More capable models give better evaluations but cost more. Test judge consistency — does it give the same score to the same output? Consider using multiple judges and averaging. The judge is part of your evaluation system."
      },
      {
        title: "Evaluate Continuously",
        description: "Don't just evaluate at deployment — evaluate in production. Sample real traffic, run metrics on production outputs, and track quality over time. Production data reveals edge cases your test suite missed. Close the loop by adding interesting production examples to your evaluation dataset."
      }
    ],

    codeExample: {
      language: "python",
      title: "Basic DeepEval Setup",
      code: `"""Basic DeepEval Setup for Agent Evaluation

Install: pip install deepeval
Run tests: deepeval test run
"""

from deepeval import evaluate, assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import (
    FaithfulnessMetric,
    AnswerRelevancyMetric,
    HallucinationMetric
)

# ══════════════════════════════════════════════════════════════
# Create a test case with context for RAG evaluation
# ══════════════════════════════════════════════════════════════
test_case = LLMTestCase(
    input="What are the return policy details?",
    actual_output="You can return items within 30 days for a full refund. Items must be unused and in original packaging.",
    expected_output="30-day return policy with full refund for unused items",
    retrieval_context=[
        "Return Policy: Customers may return any item within 30 days of purchase.",
        "Refund Terms: Full refunds are issued for items in original, unused condition.",
        "Packaging: All returns must include original packaging and tags."
    ]
)

# ══════════════════════════════════════════════════════════════
# Configure metrics with thresholds
# ══════════════════════════════════════════════════════════════
faithfulness_metric = FaithfulnessMetric(
    threshold=0.8,  # Minimum acceptable score
    model="gpt-4o"  # Judge model
)

relevancy_metric = AnswerRelevancyMetric(
    threshold=0.7
)

hallucination_metric = HallucinationMetric(
    threshold=0.3  # Lower is better for hallucination
)

# ══════════════════════════════════════════════════════════════
# Run evaluation
# ══════════════════════════════════════════════════════════════
result = evaluate(
    test_cases=[test_case],
    metrics=[faithfulness_metric, relevancy_metric, hallucination_metric]
)

# Access individual metric scores
print(f"Faithfulness: {faithfulness_metric.score:.2f}")
print(f"Relevancy: {relevancy_metric.score:.2f}")
print(f"Hallucination: {hallucination_metric.score:.2f}")

# Check pass/fail status
for metric in [faithfulness_metric, relevancy_metric, hallucination_metric]:
    status = "PASS" if metric.is_successful() else "FAIL"
    print(f"{metric.__class__.__name__}: {status}")`
    },

    diagram: {
      type: "mermaid",
      title: "Agent Evaluation Pipeline",
      mermaid: `flowchart TB
    subgraph Input["Test Dataset"]
        A["Test Cases"]
        A1["Input Query"]
        A2["Expected Output"]
        A3["Context/Ground Truth"]
    end

    subgraph Agent["Agent Under Test"]
        B["Your Agent"]
        B1["Tool Calls"]
        B2["Reasoning"]
        B3["Final Response"]
    end

    subgraph Metrics["Evaluation Metrics"]
        C["Faithfulness<br/>Is it grounded in context?"]
        D["Relevancy<br/>Does it answer the question?"]
        E["Hallucination<br/>Did it make things up?"]
        F["Tool Accuracy<br/>Right tools, right args?"]
    end

    subgraph Judge["LLM-as-Judge"]
        G["Judge Model<br/>(GPT-4, Claude)"]
        G1["Analyze Response"]
        G2["Score Each Metric"]
        G3["Provide Reasoning"]
    end

    subgraph Output["Results"]
        H["Metric Scores"]
        H1["Pass/Fail Status"]
        H2["Regression Alerts"]
        H3["Quality Dashboard"]
    end

    A --> B
    B --> C & D & E & F
    C & D & E & F --> G
    G --> H

    style Input fill:#e0f2fe,stroke:#0369a1
    style Agent fill:#fef3c7,stroke:#d97706
    style Metrics fill:#dcfce7,stroke:#16a34a
    style Judge fill:#fae8ff,stroke:#a855f7
    style Output fill:#fee2e2,stroke:#dc2626`
    },

    keyTakeaways: [
      "Agent evaluation differs from traditional testing — focus on quality dimensions, not exact match",
      "Use DeepEval for pytest-like LLM testing with CI/CD integration",
      "Use Ragas for specialized RAG pipeline evaluation",
      "Faithfulness measures if responses are grounded in provided context",
      "Hallucination detection catches fabricated information not in source material",
      "LLM-as-judge enables scalable evaluation without manual labeling",
      "Regression testing prevents quality degradation across deployments"
    ],

    resources: [
      {
        title: "DeepEval Documentation",
        url: "https://docs.confident-ai.com/",
        type: "docs",
        description: "Official docs for DeepEval LLM testing framework",
        summaryPath: "data/day-29/summary-deepeval-docs.md"
      },
      {
        title: "Ragas Documentation",
        url: "https://docs.ragas.io/",
        type: "docs",
        description: "RAG evaluation framework documentation",
        summaryPath: "data/day-29/summary-ragas-docs.md"
      },
      {
        title: "DeepLearning.AI: Evaluating AI Agents",
        url: "https://www.deeplearning.ai/short-courses/",
        type: "course",
        description: "Free course on agent evaluation techniques"
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LEARN
  // ═══════════════════════════════════════════════════════════════
  learn: {
    overview: {
      summary: "Master agent evaluation with DeepEval and Ragas — from basic metrics to custom evaluation pipelines and CI/CD integration.",
      fullDescription: `This comprehensive guide covers the theory and practice of evaluating AI agents. You'll learn why agent evaluation differs fundamentally from traditional testing, master the key metrics (faithfulness, relevancy, hallucination, tool accuracy), and implement automated evaluation pipelines using DeepEval and Ragas.

By the end, you'll be able to build evaluation suites that catch regressions before deployment, create custom metrics for agent-specific behaviors, and establish continuous evaluation workflows that improve your agents over time.`,
      prerequisites: [
        "Understanding of agent architectures (Day 1-8)",
        "Familiarity with RAG concepts (Day 14-15)",
        "Python experience for code examples",
        "Basic understanding of observability (Day 28)"
      ],
      estimatedTime: "3-4 hours",
      difficulty: "advanced"
    },

    concepts: [
      {
        title: "Why Agent Evaluation is Different",
        description: `Traditional software testing relies on deterministic behavior: given input X, expect output Y. Agent evaluation faces three fundamental challenges that break this model:

**Non-Determinism**: The same input can produce different (but equally valid) outputs. Temperature settings, model updates, and context variations all affect responses. You can't test for exact match — you need to test for quality.

**Multi-Dimensional Quality**: A response can be relevant but unfaithful, or faithful but irrelevant. It can use the right tools with wrong arguments, or get the right answer through flawed reasoning. Single pass/fail checks miss these nuances.

**Emergent Behavior**: Agents combine reasoning, tool use, and generation in ways that create emergent behaviors not present in any component. Testing components individually doesn't capture system-level quality.

**The Solution**: Metric-based evaluation that assesses multiple quality dimensions, combined with LLM-as-judge patterns that provide human-like assessment at scale. Instead of "is this correct?", we ask "how faithful is this?", "how relevant?", "how accurate were the tool calls?"`,
        analogy: "Traditional testing is like a spelling test with right/wrong answers. Agent evaluation is like grading an essay — you assess multiple dimensions (grammar, coherence, argument strength) because there's no single 'correct' answer."
      },
      {
        title: "The Evaluation Metrics Landscape",
        description: `Different metrics capture different quality dimensions. Choose based on your use case:

**Faithfulness** (RAG systems)
- Definition: Is the response grounded in the provided context?
- Formula: supported_claims / total_claims
- Use when: You have retrieval context and need factual accuracy
- Threshold: >= 0.8 is good, < 0.6 needs investigation

**Answer Relevancy** (All systems)
- Definition: Does the response actually answer the question?
- Method: Generate questions from the answer, compare to original
- Use when: You need responses that stay on topic
- Threshold: >= 0.85 is good, < 0.7 indicates off-topic responses

**Hallucination** (RAG systems)
- Definition: Does the response contain fabricated information?
- Formula: unsupported_statements / total_statements
- Use when: Factual accuracy is critical (legal, medical, financial)
- Threshold: < 0.1 is good, > 0.25 is problematic (lower is better)

**Context Precision/Recall** (RAG systems)
- Precision: Is the retrieved context relevant?
- Recall: Does the context contain needed information?
- Use when: Optimizing your retrieval pipeline

**Tool Accuracy** (Agentic systems)
- Definition: Did the agent use the right tools with correct arguments?
- Components: Tool selection accuracy, argument correctness, execution success
- Use when: Evaluating agent decision-making

**Task Completion** (Agentic systems)
- Definition: Did the agent achieve the stated goal?
- Method: Define success criteria, check if met
- Use when: End-to-end agent evaluation`,
        analogy: "Metrics are like judging criteria in a figure skating competition. You don't just score overall performance — you have separate scores for technical elements, presentation, and artistry. Each metric captures a different dimension of quality."
      },
      {
        title: "DeepEval Framework",
        description: `DeepEval provides a pytest-like interface for LLM testing, making it easy to integrate evaluation into your development workflow.

**Core Concepts**:
- **LLMTestCase**: Container for inputs, outputs, and context
- **Metrics**: Configurable evaluators with thresholds
- **Evaluation**: Batch processing of test cases
- **Assertions**: Pass/fail checking for CI/CD

**Key Features**:
- Built-in metrics for common evaluation needs
- Custom metric API for specialized evaluation
- Pytest integration for familiar workflow
- Async evaluation for large datasets
- Cloud dashboard for result visualization

**Installation**:
\`\`\`bash
pip install deepeval
\`\`\`

**Workflow**:
1. Define test cases with inputs, outputs, and context
2. Configure metrics with appropriate thresholds
3. Run evaluation locally or in CI/CD
4. Review results and iterate on your agent`,
        analogy: "DeepEval is like pytest for AI. Just as pytest lets you write test_function assertions, DeepEval lets you write test_llm assertions. The familiar workflow makes evaluation feel natural for developers."
      },
      {
        title: "Ragas Framework for RAG Evaluation",
        description: `Ragas (Retrieval Augmented Generation Assessment) specializes in evaluating RAG pipelines with metrics designed for retrieval and generation quality.

**Core Metrics**:
- **context_precision**: Quality of retrieved documents
- **context_recall**: Coverage of needed information
- **faithfulness**: Grounding of response in context
- **answer_relevancy**: Response quality relative to question

**Data Format**:
\`\`\`python
data = {
    "question": ["What is X?"],
    "answer": ["X is..."],
    "contexts": [["Context about X..."]],
    "ground_truth": ["Expected answer about X"]
}
\`\`\`

**Key Advantages**:
- Designed specifically for RAG workflows
- Works with HuggingFace datasets
- Testset generation from documents
- Integration with LangChain and other frameworks

**When to Use Ragas vs DeepEval**:
- Ragas: Pure RAG evaluation, need testset generation
- DeepEval: Agent evaluation, need CI/CD integration, custom metrics`,
        analogy: "Ragas is a specialized tool like a wine thermometer — designed specifically for one job (RAG evaluation) and does it exceptionally well. DeepEval is more like a multi-tool that handles many scenarios."
      },
      {
        title: "Test Dataset Creation",
        description: `High-quality evaluation requires high-quality test data. Here's how to build effective datasets:

**Sources of Test Data**:
1. **Manual curation**: Domain experts create gold-standard examples
2. **Production sampling**: Real queries with human-labeled quality
3. **Synthetic generation**: LLMs create diverse test cases
4. **Adversarial examples**: Edge cases designed to break the system

**Dataset Structure**:
\`\`\`python
test_case = {
    "id": "unique_identifier",
    "input": "User query",
    "expected_output": "Gold standard response",
    "context": ["Retrieved documents..."],
    "metadata": {
        "category": "returns",
        "difficulty": "hard",
        "source": "production"
    }
}
\`\`\`

**Best Practices**:
- Cover the distribution of real queries
- Include edge cases and failure modes
- Version your datasets (changes affect baseline)
- Balance across categories and difficulty levels
- Update regularly with new production examples

**Dataset Size Guidelines**:
- Minimum viable: 50-100 examples
- Solid coverage: 200-500 examples
- Production-grade: 1000+ examples
- Per-category: At least 20 examples each`,
        analogy: "Building test datasets is like assembling exam questions. You need variety (different topics), difficulty levels (easy to hard), and tricky questions (edge cases). A comprehensive exam tests true understanding, not just memorized answers."
      },
      {
        title: "LLM-as-Judge Evaluation",
        description: `LLM-as-judge uses capable language models to evaluate outputs, providing scalable, nuanced assessment without manual labeling.

**How It Works**:
1. Present the judge with evaluation criteria
2. Provide the response to evaluate (and context)
3. Judge model reasons about quality
4. Extract structured scores from judge response

**Judge Prompt Pattern**:
\`\`\`
You are evaluating an AI assistant's response.

Question: {question}
Context: {context}
Response: {response}

Evaluate faithfulness on a scale of 0-1:
- 1.0: All claims are supported by context
- 0.5: Some claims are unsupported
- 0.0: Response contradicts or ignores context

Provide your score and reasoning.
\`\`\`

**Judge Selection**:
- GPT-4o: Best quality, higher cost
- Claude Sonnet: Good balance of quality and cost
- GPT-4o-mini: Lower cost, acceptable for simpler evaluations
- Open models: Free but less reliable

**Ensuring Judge Quality**:
- Test judge consistency (same input → same score)
- Calibrate with human-labeled examples
- Use multiple judges and average scores
- Monitor for judge bias over time`,
        analogy: "LLM-as-judge is like hiring an expert reviewer at scale. Instead of having a human read every essay, you train a teaching assistant (the judge LLM) to grade using your rubric. The assistant can review thousands of essays, freeing humans for spot-checks."
      },
      {
        title: "Regression Testing for Agents",
        description: `Regression testing ensures that changes don't degrade agent performance. Every prompt change, model update, or configuration tweak should be validated.

**What to Test**:
- Prompt template changes
- Model version updates
- Tool additions or modifications
- Context window changes
- System instruction updates

**CI/CD Integration**:
\`\`\`yaml
# GitHub Actions example
name: Agent Evaluation
on: [push, pull_request]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install deepeval
      - run: deepeval test run
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
      - run: |
          if [ \$? -ne 0 ]; then
            echo "Evaluation failed - blocking deployment"
            exit 1
          fi
\`\`\`

**Setting Thresholds**:
1. Establish baseline metrics on current version
2. Set thresholds slightly below baseline (allow variance)
3. Fail builds that drop below thresholds
4. Review and adjust thresholds as you improve

**Tracking Over Time**:
- Store evaluation results with timestamps
- Visualize trends in metrics
- Alert on sustained degradation
- Celebrate improvements!`,
        analogy: "Regression testing is like quality control in manufacturing. Before shipping any product change, you run it through the same tests to ensure it still works. A car manufacturer doesn't skip crash tests just because 'we only changed the paint color.'"
      },
      {
        title: "Human-in-the-Loop Evaluation",
        description: `While automated metrics scale, human evaluation provides ground truth. Combine both for comprehensive assessment.

**When Human Evaluation is Essential**:
- Establishing initial baselines
- Validating LLM-as-judge accuracy
- Evaluating subjective qualities (tone, helpfulness)
- Investigating flagged examples
- Creating gold-standard datasets

**Human Evaluation Setup**:
1. **Define criteria**: Clear rubrics with examples
2. **Select evaluators**: Domain experts or trained raters
3. **Blind evaluation**: Hide metadata that might bias
4. **Inter-rater reliability**: Multiple evaluators per example
5. **Calibration**: Regular alignment sessions

**Efficient Human Evaluation**:
- Sample strategically (failures, edge cases, random)
- Use annotation tools (Label Studio, Argilla)
- Track evaluator agreement metrics
- Build feedback loops to improve automated metrics

**Combining Human and Automated**:
\`\`\`python
# Use human labels to validate automated metrics
human_scores = load_human_evaluations()
auto_scores = run_automated_evaluation(same_examples)

correlation = compute_correlation(human_scores, auto_scores)
print(f"Human-Auto correlation: {correlation:.2f}")
# Target: > 0.8 correlation
\`\`\``,
        analogy: "Human evaluation is like taste-testing at a restaurant. Automated metrics can measure temperature and cooking time, but only a human can tell you if the dish is delicious. You need both for a complete quality picture."
      }
    ],

    codeExamples: [
      {
        title: "DeepEval Basic Setup",
        language: "python",
        category: "basic",
        code: `"""DeepEval Basic Setup

Run with: deepeval test run
"""

from deepeval import evaluate
from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric

# Create test cases
test_cases = [
    LLMTestCase(
        input="What is the capital of France?",
        actual_output="Paris is the capital of France, located in the north-central part of the country.",
        expected_output="Paris",
        retrieval_context=["France is a country in Western Europe. Its capital is Paris."]
    ),
    LLMTestCase(
        input="How do I reset my password?",
        actual_output="To reset your password, click 'Forgot Password' on the login page and follow the email instructions.",
        expected_output="Use the Forgot Password link",
        retrieval_context=[
            "Password Reset: Click 'Forgot Password' on the login page.",
            "An email will be sent with reset instructions.",
            "Links expire after 24 hours."
        ]
    )
]

# Configure metrics
metrics = [
    AnswerRelevancyMetric(threshold=0.7),
    FaithfulnessMetric(threshold=0.8)
]

# Run evaluation
results = evaluate(test_cases=test_cases, metrics=metrics)

# Print summary
print(f"\\nEvaluation Results:")
print(f"Total test cases: {len(test_cases)}")
print(f"Passed: {sum(1 for tc in test_cases if all(m.is_successful() for m in metrics))}")
print(f"Failed: {sum(1 for tc in test_cases if not all(m.is_successful() for m in metrics))}")`
      },
      {
        title: "Ragas RAG Evaluation",
        language: "python",
        category: "intermediate",
        code: `"""Ragas RAG Evaluation

Specialized evaluation for retrieval-augmented generation pipelines.
"""

from ragas import evaluate
from ragas.metrics import (
    context_precision,
    context_recall,
    faithfulness,
    answer_relevancy
)
from datasets import Dataset

# Prepare evaluation data
# Each row represents one RAG interaction
data = {
    "question": [
        "What are the shipping options?",
        "Can I return opened items?",
        "What payment methods do you accept?"
    ],
    "answer": [
        "We offer standard (5-7 days), express (2-3 days), and overnight shipping.",
        "Opened items can be returned within 14 days for store credit only.",
        "We accept Visa, Mastercard, PayPal, and Apple Pay."
    ],
    "contexts": [
        [
            "Shipping Options: Standard delivery takes 5-7 business days.",
            "Express shipping available for 2-3 day delivery.",
            "Overnight shipping available for next-day delivery."
        ],
        [
            "Return Policy: Unopened items can be returned for full refund.",
            "Opened items may be returned within 14 days for store credit.",
            "All returns require original packaging."
        ],
        [
            "Payment Methods: We accept all major credit cards.",
            "Visa, Mastercard, American Express, and Discover accepted.",
            "Digital wallets: PayPal, Apple Pay, Google Pay supported."
        ]
    ],
    "ground_truth": [
        "Standard (5-7 days), express (2-3 days), overnight shipping",
        "Yes, opened items can be returned within 14 days for store credit",
        "Visa, Mastercard, Amex, Discover, PayPal, Apple Pay, Google Pay"
    ]
}

dataset = Dataset.from_dict(data)

# Run evaluation with all core metrics
result = evaluate(
    dataset,
    metrics=[
        context_precision,
        context_recall,
        faithfulness,
        answer_relevancy
    ]
)

# Display results
print("\\nRAG Evaluation Results:")
print(f"Context Precision: {result['context_precision']:.3f}")
print(f"Context Recall: {result['context_recall']:.3f}")
print(f"Faithfulness: {result['faithfulness']:.3f}")
print(f"Answer Relevancy: {result['answer_relevancy']:.3f}")

# Convert to DataFrame for detailed analysis
df = result.to_pandas()
print("\\nPer-question breakdown:")
print(df[["question", "faithfulness", "answer_relevancy"]])`
      },
      {
        title: "Custom Agent Metrics",
        language: "python",
        category: "intermediate",
        code: `"""Custom Agent Metrics

Create specialized metrics for agent-specific evaluation.
"""

from deepeval.metrics import BaseMetric
from deepeval.test_case import LLMTestCase
from typing import List, Dict
import json

class ToolAccuracyMetric(BaseMetric):
    """Evaluates if the agent used the correct tools with correct arguments."""

    def __init__(self, threshold: float = 0.9, expected_tools: List[Dict] = None):
        self.threshold = threshold
        self.expected_tools = expected_tools or []
        self.score = None
        self.reason = None

    def measure(self, test_case: LLMTestCase) -> float:
        # Parse actual tool calls from agent output
        actual_tools = self._parse_tool_calls(test_case.actual_output)

        if not self.expected_tools:
            self.score = 1.0
            self.reason = "No expected tools specified"
            return self.score

        # Calculate accuracy
        correct_count = 0
        total_expected = len(self.expected_tools)

        for expected in self.expected_tools:
            for actual in actual_tools:
                if self._tools_match(expected, actual):
                    correct_count += 1
                    break

        self.score = correct_count / total_expected if total_expected > 0 else 1.0
        self.reason = f"Matched {correct_count}/{total_expected} expected tool calls"

        return self.score

    def _parse_tool_calls(self, output: str) -> List[Dict]:
        """Extract tool calls from agent output."""
        # Implementation depends on your agent's output format
        # This is a simplified example
        tools = []
        if "TOOL:" in output:
            for line in output.split("\\n"):
                if line.startswith("TOOL:"):
                    parts = line.replace("TOOL:", "").strip().split("(")
                    if len(parts) == 2:
                        tools.append({
                            "name": parts[0].strip(),
                            "args": parts[1].rstrip(")")
                        })
        return tools

    def _tools_match(self, expected: Dict, actual: Dict) -> bool:
        """Check if tool call matches expected."""
        return expected.get("name") == actual.get("name")

    def is_successful(self) -> bool:
        return self.score >= self.threshold

    @property
    def __name__(self):
        return "Tool Accuracy"


class TaskCompletionMetric(BaseMetric):
    """Evaluates if the agent completed the assigned task."""

    def __init__(self, threshold: float = 0.8, success_criteria: List[str] = None):
        self.threshold = threshold
        self.success_criteria = success_criteria or []
        self.score = None
        self.reason = None

    def measure(self, test_case: LLMTestCase) -> float:
        if not self.success_criteria:
            self.score = 1.0
            self.reason = "No success criteria specified"
            return self.score

        # Check each criterion
        met_criteria = []
        for criterion in self.success_criteria:
            if criterion.lower() in test_case.actual_output.lower():
                met_criteria.append(criterion)

        self.score = len(met_criteria) / len(self.success_criteria)
        self.reason = f"Met {len(met_criteria)}/{len(self.success_criteria)} criteria: {met_criteria}"

        return self.score

    def is_successful(self) -> bool:
        return self.score >= self.threshold

    @property
    def __name__(self):
        return "Task Completion"


# Usage example
test_case = LLMTestCase(
    input="Book a flight from NYC to LA for tomorrow",
    actual_output="""
    TOOL: search_flights(origin=NYC, destination=LA, date=2025-03-30)
    Found 5 available flights.
    TOOL: book_flight(flight_id=UA123, passenger=user)
    Flight booked successfully. Confirmation: ABC123
    """,
    expected_output="Flight booked with confirmation number"
)

tool_metric = ToolAccuracyMetric(
    threshold=0.9,
    expected_tools=[
        {"name": "search_flights"},
        {"name": "book_flight"}
    ]
)

task_metric = TaskCompletionMetric(
    threshold=0.8,
    success_criteria=["flight booked", "confirmation"]
)

tool_metric.measure(test_case)
task_metric.measure(test_case)

print(f"Tool Accuracy: {tool_metric.score:.2f} - {tool_metric.reason}")
print(f"Task Completion: {task_metric.score:.2f} - {task_metric.reason}")`
      },
      {
        title: "Regression Testing Pipeline",
        language: "python",
        category: "advanced",
        code: `"""Regression Testing Pipeline

Automated evaluation for CI/CD integration with threshold checking.
"""

import json
import os
from datetime import datetime
from typing import List, Dict
from deepeval import evaluate
from deepeval.test_case import LLMTestCase
from deepeval.metrics import (
    FaithfulnessMetric,
    AnswerRelevancyMetric,
    HallucinationMetric
)
from deepeval.dataset import EvaluationDataset


class RegressionTester:
    """Manages regression testing for agent deployments."""

    def __init__(self, baseline_path: str = "evaluation_baseline.json"):
        self.baseline_path = baseline_path
        self.results_history: List[Dict] = []

        # Configure metrics with production thresholds
        self.metrics = [
            FaithfulnessMetric(threshold=0.8, model="gpt-4o"),
            AnswerRelevancyMetric(threshold=0.75),
            HallucinationMetric(threshold=0.2)
        ]

    def load_baseline(self) -> Dict:
        """Load baseline metrics from previous run."""
        if os.path.exists(self.baseline_path):
            with open(self.baseline_path, 'r') as f:
                return json.load(f)
        return {}

    def save_baseline(self, results: Dict):
        """Save current results as new baseline."""
        with open(self.baseline_path, 'w') as f:
            json.dump(results, f, indent=2)

    def run_evaluation(self, dataset: EvaluationDataset) -> Dict:
        """Run evaluation and return results."""

        # Run DeepEval evaluation
        evaluate(
            test_cases=dataset.test_cases,
            metrics=self.metrics
        )

        # Aggregate results
        results = {
            "timestamp": datetime.now().isoformat(),
            "num_test_cases": len(dataset.test_cases),
            "metrics": {}
        }

        for metric in self.metrics:
            metric_name = metric.__class__.__name__
            # Calculate average score across all test cases
            scores = [metric.score for _ in dataset.test_cases]
            avg_score = sum(scores) / len(scores) if scores else 0

            results["metrics"][metric_name] = {
                "average_score": avg_score,
                "threshold": metric.threshold,
                "passed": avg_score >= metric.threshold
            }

        return results

    def check_regression(self, current: Dict, baseline: Dict) -> Dict:
        """Compare current results against baseline."""

        regressions = []
        improvements = []

        for metric_name, current_data in current["metrics"].items():
            if metric_name in baseline.get("metrics", {}):
                baseline_score = baseline["metrics"][metric_name]["average_score"]
                current_score = current_data["average_score"]

                # Check for significant regression (> 5% drop)
                if current_score < baseline_score - 0.05:
                    regressions.append({
                        "metric": metric_name,
                        "baseline": baseline_score,
                        "current": current_score,
                        "delta": current_score - baseline_score
                    })
                elif current_score > baseline_score + 0.05:
                    improvements.append({
                        "metric": metric_name,
                        "baseline": baseline_score,
                        "current": current_score,
                        "delta": current_score - baseline_score
                    })

        return {
            "regressions": regressions,
            "improvements": improvements,
            "has_regression": len(regressions) > 0
        }

    def generate_report(self, results: Dict, comparison: Dict) -> str:
        """Generate human-readable evaluation report."""

        report = []
        report.append("=" * 60)
        report.append("AGENT EVALUATION REPORT")
        report.append(f"Timestamp: {results['timestamp']}")
        report.append(f"Test Cases: {results['num_test_cases']}")
        report.append("=" * 60)

        report.append("\\nMETRIC RESULTS:")
        for metric_name, data in results["metrics"].items():
            status = "PASS" if data["passed"] else "FAIL"
            report.append(f"  {metric_name}: {data['average_score']:.3f} (threshold: {data['threshold']}) [{status}]")

        if comparison["regressions"]:
            report.append("\\n⚠️  REGRESSIONS DETECTED:")
            for reg in comparison["regressions"]:
                report.append(f"  {reg['metric']}: {reg['baseline']:.3f} -> {reg['current']:.3f} ({reg['delta']:+.3f})")

        if comparison["improvements"]:
            report.append("\\n✅ IMPROVEMENTS:")
            for imp in comparison["improvements"]:
                report.append(f"  {imp['metric']}: {imp['baseline']:.3f} -> {imp['current']:.3f} ({imp['delta']:+.3f})")

        report.append("\\n" + "=" * 60)
        overall = "FAILED - Regressions detected" if comparison["has_regression"] else "PASSED"
        report.append(f"OVERALL: {overall}")
        report.append("=" * 60)

        return "\\n".join(report)


# Usage in CI/CD
def main():
    # Load test dataset
    dataset = EvaluationDataset()
    dataset.add_test_cases([
        LLMTestCase(
            input="What is your return policy?",
            actual_output="You can return items within 30 days.",
            retrieval_context=["Return policy: 30-day returns accepted."]
        ),
        # Add more test cases...
    ])

    # Run regression test
    tester = RegressionTester()
    baseline = tester.load_baseline()
    results = tester.run_evaluation(dataset)
    comparison = tester.check_regression(results, baseline)

    # Generate and print report
    report = tester.generate_report(results, comparison)
    print(report)

    # Exit with error code if regression detected
    if comparison["has_regression"]:
        print("\\n❌ Deployment blocked due to quality regression")
        exit(1)
    else:
        print("\\n✅ Evaluation passed - safe to deploy")
        tester.save_baseline(results)
        exit(0)


if __name__ == "__main__":
    main()`
      }
    ],

    diagrams: [
      {
        type: "mermaid",
        title: "Metrics Hierarchy",
        mermaid: `flowchart TB
    subgraph Quality["Quality Dimensions"]
        direction TB
        A["Agent Quality"]

        subgraph Retrieval["Retrieval Quality"]
            B["Context Precision"]
            C["Context Recall"]
        end

        subgraph Generation["Generation Quality"]
            D["Faithfulness"]
            E["Relevancy"]
            F["Hallucination"]
        end

        subgraph AgentSpecific["Agent-Specific"]
            G["Tool Accuracy"]
            H["Task Completion"]
            I["Reasoning Quality"]
        end
    end

    A --> Retrieval
    A --> Generation
    A --> AgentSpecific

    B --> J["Is retrieved context relevant?"]
    C --> K["Does context cover needed info?"]
    D --> L["Is response grounded in context?"]
    E --> M["Does response answer the question?"]
    F --> N["Did model fabricate information?"]
    G --> O["Right tools, right arguments?"]
    H --> P["Did agent achieve the goal?"]
    I --> Q["Is reasoning sound and logical?"]

    style Quality fill:#f0f9ff,stroke:#0369a1
    style Retrieval fill:#dcfce7,stroke:#16a34a
    style Generation fill:#fef3c7,stroke:#d97706
    style AgentSpecific fill:#fae8ff,stroke:#a855f7`
      },
      {
        type: "mermaid",
        title: "Test Dataset Workflow",
        mermaid: `flowchart LR
    subgraph Sources["Data Sources"]
        A["Manual Curation"]
        B["Production Sampling"]
        C["Synthetic Generation"]
        D["Adversarial Examples"]
    end

    subgraph Processing["Processing"]
        E["Label & Annotate"]
        F["Quality Review"]
        G["Version Control"]
    end

    subgraph Dataset["Test Dataset"]
        H["Golden Examples"]
        I["Edge Cases"]
        J["Failure Modes"]
        K["Category Coverage"]
    end

    subgraph Evaluation["Evaluation Loop"]
        L["Run Metrics"]
        M["Compare Baseline"]
        N["Generate Reports"]
        O["Update Dataset"]
    end

    A & B & C & D --> E
    E --> F
    F --> G
    G --> H & I & J & K
    H & I & J & K --> L
    L --> M
    M --> N
    N --> O
    O --> H

    style Sources fill:#e0f2fe,stroke:#0369a1
    style Processing fill:#fef3c7,stroke:#d97706
    style Dataset fill:#dcfce7,stroke:#16a34a
    style Evaluation fill:#fae8ff,stroke:#a855f7`
      },
      {
        type: "mermaid",
        title: "LLM-as-Judge Pattern",
        mermaid: `sequenceDiagram
    participant T as Test Case
    participant E as Evaluator
    participant J as Judge LLM
    participant R as Results

    T->>E: Input, Output, Context
    E->>E: Format evaluation prompt

    Note over E: Include criteria, rubric,<br/>and examples in prompt

    E->>J: "Evaluate this response..."
    J->>J: Reason about quality
    J->>E: Score + Explanation

    E->>E: Parse structured response
    E->>E: Validate score range

    E->>R: {score: 0.85, reason: "..."}

    Note over R: Store for aggregation<br/>and trend analysis`
      }
    ],

    faq: [
      {
        question: "How do I choose between DeepEval and Ragas?",
        answer: "Use **DeepEval** when you need: pytest integration for CI/CD, custom metrics for agent evaluation, or a general-purpose framework. Use **Ragas** when you're focused on RAG evaluation specifically, want to generate test datasets from documents, or prefer the HuggingFace ecosystem. Many teams use both — Ragas for RAG-specific metrics and DeepEval for broader agent testing."
      },
      {
        question: "What's a good threshold for faithfulness?",
        answer: "Start with **0.8** as your threshold. This means 80% of claims in the response should be supported by the context. Adjust based on your domain: medical/legal applications might need 0.9+, while general chatbots might accept 0.7. The key is to establish a baseline on your current system, then set the threshold just below that baseline to catch regressions."
      },
      {
        question: "How many test cases do I need?",
        answer: "**Minimum viable**: 50-100 examples to catch obvious issues. **Solid coverage**: 200-500 examples covering different categories and edge cases. **Production-grade**: 1000+ examples with comprehensive coverage. More important than total count: ensure each category/feature has at least 20 examples. A small, well-curated dataset beats a large, poorly-labeled one."
      },
      {
        question: "Should I use GPT-4 or a cheaper model as the judge?",
        answer: "GPT-4o/Claude Sonnet give the best evaluation quality but cost more. For development iteration, cheaper models (GPT-4o-mini) work fine. For production gates and official metrics, use the best judge you can afford. Test judge consistency — run the same examples multiple times and check variance. If your judge is inconsistent, you're measuring noise."
      },
      {
        question: "How do I handle non-determinism in evaluation?",
        answer: "Three strategies: (1) **Set temperature to 0** for your agent during evaluation for more reproducible outputs. (2) **Run multiple evaluations** and average scores to smooth variance. (3) **Use semantic similarity** instead of exact match when comparing outputs. Accept that some variance is inherent — focus on detecting significant regressions, not small fluctuations."
      },
      {
        question: "Can I evaluate agents without ground truth?",
        answer: "Yes, but with limitations. **Relevancy** and **faithfulness** metrics work without ground truth — they compare response to question/context. **Hallucination** detection works by checking if claims are supported by context. However, you can't measure **correctness** without knowing the right answer. For comprehensive evaluation, invest in creating ground truth datasets."
      },
      {
        question: "How do I evaluate tool usage specifically?",
        answer: "Create custom metrics that check: (1) **Tool selection** — did the agent pick the right tool? (2) **Argument correctness** — are the parameters valid? (3) **Execution success** — did the tool call work? (4) **Efficiency** — did it use unnecessary tools? Parse your agent's tool call logs and compare against expected behavior in your test cases."
      },
      {
        question: "How often should I run evaluation?",
        answer: "**On every PR/commit** that changes agent behavior (prompts, tools, configuration). **Nightly** on your full test suite to catch slow regressions. **Weekly** analysis of production traffic samples. **Before every deployment** as a release gate. Continuous evaluation is like continuous testing — the more you run it, the earlier you catch problems."
      }
    ],

    applications: [
      {
        title: "RAG Quality Assurance",
        description: "E-commerce support chatbot answering product questions from knowledge base. Evaluate faithfulness (answers grounded in product docs), context precision (retrieving relevant docs), and hallucination (not inventing specs). Key metrics: faithfulness, context_precision, context_recall, hallucination. Product information must be accurate — set strict hallucination thresholds (< 0.1)."
      },
      {
        title: "Agentic Workflow Validation",
        description: "Travel booking agent that searches flights, compares options, and makes reservations. Create custom metrics for tool accuracy (correct API calls), task completion (booking confirmed), and efficiency (minimal unnecessary calls). Test multi-step workflows end-to-end. Agentic systems have compounding errors — test individual steps AND full workflows."
      },
      {
        title: "Content Generation QA",
        description: "Marketing content generator creating product descriptions and ad copy. Evaluate relevancy (matches brief), brand voice consistency (custom metric), and factual accuracy (no hallucinated claims). Key metrics: answer_relevancy, custom_brand_voice, faithfulness. Creative content has more valid variations — use semantic similarity over exact match."
      },
      {
        title: "Customer Service Agent Testing",
        description: "Support agent handling refunds, complaints, and technical issues. Test across conversation categories with category-specific metrics including policy adherence, resolution rate, and response appropriateness. Include adversarial examples. Customer-facing agents need toxicity filtering and policy guardrails."
      },
      {
        title: "Research Assistant Evaluation",
        description: "Agent that searches papers, summarizes findings, and answers research questions. Focus on faithfulness (claims traceable to sources), completeness (covers key points), and citation accuracy (references are real). Academic accuracy is critical — hallucinated citations are serious failures. Set very strict faithfulness thresholds."
      }
    ],

    keyTakeaways: [
      "Agent evaluation requires metric-based assessment, not exact output matching",
      "Choose metrics that reflect your specific use case: faithfulness for RAG, tool accuracy for agents",
      "DeepEval provides pytest-like testing with CI/CD integration",
      "Ragas specializes in RAG pipeline evaluation with retrieval-specific metrics",
      "LLM-as-judge enables scalable evaluation without manual labeling",
      "Build datasets from manual curation, production sampling, and synthetic generation",
      "Regression testing prevents quality degradation — run evaluation on every deployment",
      "Track metrics over time to identify trends, not just point-in-time pass/fail",
      "Combine automated metrics with human evaluation for comprehensive assessment",
      "Start with established metrics, add custom metrics for agent-specific behaviors"
    ],

    resources: [
      {
        title: "DeepEval Documentation",
        url: "https://docs.confident-ai.com/",
        type: "docs",
        description: "Complete guide to DeepEval metrics, test cases, and CI/CD integration",
        summaryPath: "data/day-29/summary-deepeval-docs.md"
      },
      {
        title: "Ragas Documentation",
        url: "https://docs.ragas.io/",
        type: "docs",
        description: "RAG-specific evaluation metrics and dataset generation",
        summaryPath: "data/day-29/summary-ragas-docs.md"
      },
      {
        title: "DeepLearning.AI: Evaluating AI Agents",
        url: "https://www.deeplearning.ai/short-courses/",
        type: "course",
        description: "Free course covering agent evaluation fundamentals"
      },
      {
        title: "DeepEval GitHub",
        url: "https://github.com/confident-ai/deepeval",
        type: "github",
        description: "Source code, examples, and community contributions"
      },
      {
        title: "Ragas GitHub",
        url: "https://github.com/explodinggradients/ragas",
        type: "github",
        description: "RAG evaluation framework source and examples"
      },
      {
        title: "LLM Evaluation Best Practices",
        url: "https://www.anthropic.com/research",
        type: "article",
        description: "Research on effective LLM evaluation methodologies"
      }
    ],

    relatedDays: [7, 14, 28, 30]
  }
};
