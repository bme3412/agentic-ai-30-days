# Chain-of-Thought Prompting Elicits Reasoning in Large Language Models

**Focus:** The foundational paper showing that step-by-step reasoning dramatically improves LLM performance on complex tasks

**Authors:** Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, Denny Zhou (Google Research)

**Published:** January 2022

## The Core Technique

Chain-of-thought (CoT) prompting provides the model with **few-shot examples that include intermediate reasoning steps**, not just final answers. The model learns to generate similar step-by-step reasoning before producing its answer.

**Standard prompting:**
```
Q: Roger has 5 tennis balls. He buys 2 cans of 3 tennis balls each. How many?
A: 11
```

**Chain-of-thought prompting:**
```
Q: Roger has 5 tennis balls. He buys 2 cans of 3 tennis balls each. How many?
A: Roger starts with 5 balls. He buys 2 cans × 3 balls = 6 balls. Total: 5 + 6 = 11.
```

By including reasoning in the examples, the model generates reasoning in its responses.

## Key Results

On the **GSM8K** benchmark (grade school math word problems):
- **PaLM-540B with CoT: 58% accuracy** (state-of-the-art at the time)
- This beat fine-tuned GPT-3 175B with a verifier (55%)
- Used only **8 hand-crafted examples**

The paper showed gains across arithmetic, commonsense, and symbolic reasoning tasks.

## Critical Limitation: Scale Matters

CoT only works with **large models**. The paper's results used a 540-billion parameter model. Smaller models showed minimal or no improvement from CoT prompting. This is described as an "emergent ability"—it appears only above a certain scale threshold.

This matters for practitioners: don't expect CoT to help with smaller, cheaper models.

## Related Work (Separate Papers)

The original CoT paper spawned several important follow-ups that are often confused with it:

**Zero-Shot CoT** (Kojima et al., May 2022)
- Key finding: Just adding "Let's think step by step" works without examples
- MultiArith: 17.7% → 78.7% accuracy
- GSM8K: 10.4% → 40.7% accuracy
- This is the famous "magic phrase" that went viral

**Self-Consistency** (Wang et al., March 2022)
- Generate multiple reasoning chains, take majority vote on final answer
- Pushed GSM8K to 74% (+17.9% over basic CoT)
- Trade-off: More API calls for better accuracy

**Tree of Thought** (Yao et al., 2023)
- Explores multiple reasoning paths as a tree, with backtracking
- Enables deliberate planning and search
- A separate paradigm, published a year later

## Why CoT Works

1. **Decomposition**: Complex problems become sequences of simple steps
2. **Working memory**: Intermediate results are written out, not held implicitly
3. **Error localization**: Each step can be checked independently
4. **Training data**: Models were trained on text showing step-by-step reasoning

## Limitations

- **Ungrounded**: Reasoning is based on training data, not external facts
- **Scale-dependent**: Doesn't help smaller models
- **Error propagation**: Mistakes in early steps compound
- **Not universal**: Doesn't help on all task types (e.g., simple retrieval)

## Connection to ReAct

ReAct directly builds on CoT by adding **grounding**. While CoT reasoning comes entirely from the model's "memory" (training data), ReAct interleaves reasoning with tool use:

- **CoT**: "Paris is the capital of France. Paris has about 2 million people." (from training data)
- **ReAct**: "I need the population. [searches] The result says 2.1 million." (from observation)

CoT is the "Think" in ReAct. ReAct adds "Act" and "Observe" to ground that thinking in reality.
