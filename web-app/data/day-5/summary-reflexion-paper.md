# Reflexion: Language Agents with Verbal Reinforcement Learning

**Focus:** Teaching AI agents to learn from their mistakes through self-reflection

**Authors:** Noah Shinn, Federico Cassano, Ashwin Gopinath, Karthik Narasimhan, Shunyu Yao (Princeton & Northeastern)
**Published:** NeurIPS 2023

## The Big Idea

Traditional reinforcement learning requires massive amounts of trial-and-error with numerical rewards. Reflexion introduces a paradigm shift: instead of learning from scalar rewards, agents learn by generating **verbal reflections** on their failures and storing these insights in memory.

The key insight is that language models can critique their own performance in natural language, identify what went wrong, and use this self-generated feedback to improve on subsequent attempts—much like how humans learn from experience.

## How It Works

Reflexion operates in a loop:

1. **Act**: The agent attempts a task using its current approach
2. **Evaluate**: The environment provides feedback (success/failure)
3. **Reflect**: On failure, the agent generates a verbal analysis of what went wrong
4. **Remember**: The reflection is stored in episodic memory
5. **Retry**: On the next attempt, the agent conditions on past reflections

The magic is in step 3: rather than just receiving a "wrong" signal, the agent articulates *why* it failed and *how* to do better. This verbal feedback is far richer than numerical rewards.

## Key Results

The researchers tested Reflexion across three domains:

**Decision Making (ALFWorld):**
- Base agent: 75% success rate
- With Reflexion: 97% success rate
- Agents learned to avoid repeated mistakes like searching wrong locations

**Reasoning (HotpotQA):**
- Baseline: 34% accuracy
- With Reflexion: 51% accuracy
- Agents learned to identify gaps in their reasoning chains

**Programming (HumanEval):**
- GPT-4 baseline: 80% pass@1
- With Reflexion: 91% pass@1
- Agents learned from test failures to fix bugs iteratively

## The Reflection Format

A typical reflection looks like:

```
In this environment, my task was to find and heat a tomato.
I failed because I looked for the tomato in the wrong locations.
I should have checked the refrigerator and countertop first,
as these are the most common places for food items.
For next time, I will prioritize checking food storage areas.
```

This natural language feedback is more actionable than a simple reward signal.

## Why This Matters

Reflexion demonstrates that:

1. **Self-critique works**: LLMs can effectively identify their own errors
2. **Verbal memory is powerful**: Natural language reflections transfer better than numerical rewards
3. **Few-shot learning**: Agents improve dramatically with just 2-3 reflection cycles
4. **No weight updates**: All learning happens through in-context memory, not fine-tuning

This opens the door to agents that continuously improve during deployment without retraining.

## Limitations & Considerations

- Relies on the model's ability to accurately self-diagnose failures
- Memory accumulation can slow down inference over time
- Works best when the environment provides clear success/failure signals
- May overfit to specific failure modes without generalizing

## Resources

- [Paper (arXiv)](https://arxiv.org/abs/2303.11366)
- [GitHub Repository](https://github.com/noahshinn/reflexion)
- [Project Page](https://reflexion-agent.github.io/)
