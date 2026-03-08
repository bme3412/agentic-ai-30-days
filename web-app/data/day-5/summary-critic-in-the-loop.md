# Critic-in-the-Loop: Teaching Agents to Improve via Feedback

**Focus:** Architectural patterns for incorporating critique into agent workflows

## The Big Idea

Effective self-improvement requires more than just asking a model to "check its work." The critic-in-the-loop pattern separates the roles of generation, evaluation, and revision into distinct components—each with specialized prompts, and often external tools for grounding.

This architectural pattern underpins successful reflection systems like Reflexion, Self-Refine, and Constitutional AI.

## Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CRITIC-IN-THE-LOOP                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │ Generator│───►│  Critic  │───►│ Refiner  │──┐          │
│   └──────────┘    └────┬─────┘    └──────────┘  │          │
│        ▲               │               │         │          │
│        │               ▼               │         │          │
│        │         ┌──────────┐          │         │          │
│        │         │ External │          │         │          │
│        │         │ Signals  │          │         │          │
│        │         └──────────┘          │         │          │
│        │               │               │         │          │
│        └───────────────┴───────────────┘         │          │
│                                                   │          │
│   ┌───────────────────────────────────────────────┘          │
│   │                                                          │
│   ▼                                                          │
│ ┌──────────┐                                                │
│ │  Memory  │  Stores reflections for future attempts        │
│ └──────────┘                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## The Three Roles

### 1. Generator
- Focuses purely on producing output
- Has access to task context and past reflections
- Does not self-censor during generation

### 2. Critic
- Evaluates the generation against criteria
- Identifies specific, actionable issues
- May use external tools for grounding:
  - Code execution for testing
  - Search for fact-checking
  - Validators for format compliance

### 3. Refiner
- Takes original output + critique
- Makes targeted improvements
- Explains changes made

## Why Separation Matters

Research shows that role separation improves performance:

| Approach | Quality | Why |
|----------|---------|-----|
| Single-shot | Baseline | Model tries to be perfect on first attempt |
| "Check your work" | ~Same | Same model, same biases, no new information |
| Separated roles | +15-30% | Each role has focused objective and context |

The key insight: **generation and evaluation require different cognitive modes**. Separating them allows each to be optimized independently.

## External Grounding Strategies

The critic's effectiveness depends on external signals:

### For Code
```python
def critic_with_execution(code: str, tests: List[str]) -> Critique:
    # Run code against tests
    results = execute_tests(code, tests)

    # Critique based on actual failures
    return generate_critique(code, results)
```

### For Facts
```python
def critic_with_retrieval(claim: str) -> Critique:
    # Search for evidence
    evidence = search_knowledge_base(claim)

    # Critique based on retrieved facts
    return generate_critique(claim, evidence)
```

### For Reasoning
```python
def critic_with_verification(solution: str) -> Critique:
    # Use symbolic solver to verify
    is_valid = symbolic_verify(solution)

    # Critique based on verification result
    return generate_critique(solution, is_valid)
```

## Implementation Patterns

### Basic Loop
```python
def reflect_and_improve(task, max_iterations=3):
    output = generate(task)

    for i in range(max_iterations):
        critique = critic(output, task)

        if critique.no_issues:
            break

        output = refine(output, critique)

    return output
```

### With Memory
```python
def reflexion_loop(task, memory, max_attempts=3):
    for attempt in range(max_attempts):
        output = generate(task, past_reflections=memory)
        result = environment.evaluate(output)

        if result.success:
            return output

        reflection = reflect(output, result)
        memory.add(reflection)

    return output
```

## When to Use Each Pattern

| Situation | Pattern | Why |
|-----------|---------|-----|
| Single task, immediate | Self-Refine | Quick iteration without memory |
| Multiple attempts, learn | Reflexion | Memory carries lessons forward |
| Value alignment | Constitutional | Principles guide critique |
| Code generation | Test-driven critic | Execution provides ground truth |
| Factual tasks | RAG-augmented critic | External knowledge grounds critique |

## Key Design Decisions

1. **Same model vs. different models**: Specialized critic models can outperform, but add complexity
2. **Synchronous vs. async**: Can critique run in parallel with generation?
3. **Memory scope**: Per-task, per-session, or persistent?
4. **Termination criteria**: Max iterations, quality threshold, or no-issues signal?

## Common Pitfalls

- **Missing external signal**: Pure self-critique without grounding
- **Over-refinement**: Too many iterations can degrade quality
- **Critique drift**: Focusing on minor issues while missing major ones
- **Memory overflow**: Accumulating too many reflections

## Resources

- [Reflexion Paper](https://arxiv.org/abs/2303.11366)
- [Self-Refine Paper](https://arxiv.org/abs/2303.17651)
- [Constitutional AI Paper](https://arxiv.org/abs/2212.08073)
