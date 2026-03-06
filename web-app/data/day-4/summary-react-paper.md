# ReAct: Synergizing Reasoning and Acting in Language Models

**Focus:** The paper that defined how modern AI agents think and act

**Authors:** Shunyu Yao et al. (Princeton & Google)
**Published:** ICLR 2023

## The Big Idea

Before ReAct, AI models either *thought* or *acted*, but not both together:

- **Chain-of-thought (CoT)**: Models reason step-by-step, but only from what they already "know" (training data). Great for math, but can confidently make up facts.

- **Action-only**: Models use tools (like search), but jump straight to actions without explaining why. Hard to debug when things go wrong.

**ReAct combines both**: Think out loud, then act, then look at what happened, then think again.

```
Thought → Action → Observation → Thought → Action → ...
```

## What They Found

The researchers tested ReAct on question-answering and decision-making tasks:

**The headline result: 90% less hallucination**
- CoT made things up **56%** of the time
- ReAct made things up only **6%** of the time

This is because ReAct *grounds* its reasoning in real observations from tools, rather than guessing from memory.

**On fact-checking (FEVER)**
- ReAct: 60.9% accuracy
- CoT: 56.3% accuracy
- *ReAct wins by looking things up instead of guessing*

**On multi-hop questions (HotpotQA)**
- ReAct alone: 27.4%
- CoT alone: 29.4%
- *Surprise: CoT actually wins here!*

But here's the twist—**combining them works best**:
- ReAct + CoT: **35.1%** accuracy

The lesson: ReAct isn't always better alone, but it's almost always better *combined* with other techniques.

**On interactive tasks (games and web shopping)**
- ReAct beat reinforcement learning methods by 34% on ALFWorld
- ReAct beat them by 10% on WebShop
- Using just 1-2 examples, no training required

## Why Thoughts Matter

The "Thought" step isn't just for show. It actually helps the model:

1. **Track progress** - "I found X, now I need Y"
2. **Catch mistakes** - "That search didn't help, let me try differently"
3. **Plan ahead** - "To answer this, I'll need to find A, then B, then C"
4. **Stay grounded** - Reasoning ties directly to observations, not imagination

## The Format

```
Question: Where was the director of Jaws born?

Thought: I need to find who directed Jaws, then where they were born.
Action: search("Jaws director")
Observation: Jaws was directed by Steven Spielberg.

Thought: Steven Spielberg directed Jaws. Now I need his birthplace.
Action: search("Steven Spielberg birthplace")
Observation: Spielberg was born in Cincinnati, Ohio.

Thought: I have the answer.
Answer: The director of Jaws, Steven Spielberg, was born in Cincinnati, Ohio.
```

## Why This Paper Matters

ReAct became the default pattern for AI agents. When you use ChatGPT with tools, Claude with computer use, or any "agent" framework—they're all using some version of ReAct.

The key insight is simple: **make the AI show its work, and let it check its work against reality**.

## Resources

- [Original Paper](https://arxiv.org/abs/2210.03629)
- [Google Research Blog Post](https://research.google/blog/react-synergizing-reasoning-and-acting-in-language-models/)
- [Official Project Page](https://react-lm.github.io/)
