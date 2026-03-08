# Self-Refine: Iterative Refinement with Self-Feedback

**Focus:** Using LLMs to critique and iteratively improve their own outputs

**Authors:** Aman Madaan et al. (CMU, Allen AI, University of Washington)
**Published:** NeurIPS 2023

## The Big Idea

What if an LLM could act as its own editor? Self-Refine introduces a simple but powerful framework: generate an initial output, critique it, and then refine based on that critique—all using the same model. No external feedback or human intervention required.

The insight is that LLMs are often better at *identifying* problems in text than *avoiding* them in the first place. By separating generation from evaluation, we can leverage this asymmetry.

## The Three-Step Loop

Self-Refine operates through iterative cycles:

1. **Generate**: Produce an initial output for the task
2. **Feedback**: The same model critiques the output, identifying specific issues
3. **Refine**: The model revises the output based on its own feedback

This loop repeats until the feedback indicates no further improvements are needed (or a maximum iteration count is reached).

## Why Separate Feedback and Refinement?

The key insight is **role specialization**. When generating, the model focuses on producing content. When critiquing, it focuses on evaluation. When refining, it focuses on targeted improvements. Each step has a different objective, and prompting for each separately produces better results than trying to "generate perfectly" in one shot.

## Key Results

Self-Refine was tested across seven diverse tasks:

| Task | Initial | After Refinement | Improvement |
|------|---------|------------------|-------------|
| Code Optimization | 1.00x | 1.54x speedup | +54% |
| Math Reasoning | 72.3% | 79.8% | +7.5% |
| Sentiment Transfer | 55.2% | 74.4% | +19.2% |
| Dialogue Response | 3.12 | 3.48 rating | +12% |
| Code Readability | 2.89 | 3.34 rating | +16% |
| Acronym Generation | 54.4% | 71.2% | +17% |
| Constrained Generation | 78.1% | 91.1% | +13% |

The pattern holds across tasks: initial outputs improve significantly through self-refinement.

## The Feedback Format

Effective feedback is specific and actionable:

```
FEEDBACK:
1. The variable name 'x' is not descriptive. Consider renaming to 'user_count'.
2. The nested loops on lines 5-8 have O(n²) complexity. This could be optimized using a hash map.
3. The function lacks error handling for empty input.

REFINED CODE:
[Improved version addressing each point]
```

## Comparison with Other Approaches

| Approach | External Feedback | Multiple Models | Training Required |
|----------|-------------------|-----------------|-------------------|
| RLHF | Yes (human) | No | Yes |
| Constitutional AI | Yes (principles) | No | Yes |
| Self-Consistency | No | No | No |
| **Self-Refine** | **No** | **No** | **No** |

Self-Refine requires no external feedback source and no training—just prompting.

## Why This Matters

Self-Refine shows that:

1. **One model, three roles**: The same LLM can generate, critique, and refine
2. **Iteration beats single-shot**: Multiple refinement passes outperform single attempts
3. **No training needed**: Pure prompting achieves significant improvements
4. **Task-agnostic**: The framework works across diverse domains

This makes it practical to deploy iterative improvement without specialized models or training infrastructure.

## Limitations

- Adds latency (2-4x more API calls)
- Increases cost proportionally
- May not help when the model fundamentally lacks knowledge
- Quality of refinement depends on quality of feedback
- Can sometimes make outputs worse if feedback is incorrect

## When to Use Self-Refine

Best suited for:
- Tasks where quality matters more than speed
- Outputs that benefit from polish (writing, code review)
- Situations where initial attempts are "close but not perfect"
- Applications with tolerance for multiple LLM calls

Less suited for:
- Real-time applications
- Simple factual queries
- Tasks requiring external knowledge

## Resources

- [Paper (arXiv)](https://arxiv.org/abs/2303.17651)
- [GitHub Repository](https://github.com/madaan/self-refine)
- [Project Page](https://selfrefine.info/)
