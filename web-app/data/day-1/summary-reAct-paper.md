# ReAct: Synergizing Reasoning and Acting in LLMs

The ReAct paper introduced a paradigm that interleaves reasoning traces and actions, enabling LLMs to reason about tasks while interacting with external environments. The key insight comes from how humans naturally work—when cooking, we think "now that everything is cut, I should heat up the water" or "I don't have salt, so let me use soy sauce instead." This tight synergy between acting and reasoning is what makes humans effective at learning new tasks quickly and handling unexpected situations.

Chain-of-thought reasoning alone is static, using only internal knowledge without grounding against external sources. Errors propagate through the reasoning chain with no way to correct course based on new information. Action-only approaches can interact with environments but lack abstract reasoning, working memory, and the ability to adapt to exceptions. ReAct combines both by augmenting the action space to include language thoughts alongside available actions.

A thought is an action that does not affect the external environment but helps the model reason over context and update internal state for future reasoning. The execution interleaves thinking and acting in a loop. Given a question like "Which magazine was started first, Arthur's Magazine or First for Women?", the agent thinks about needing to search both magazines, searches Arthur's Magazine, observes it started in 1844, thinks about searching the second magazine, searches First for Women, observes it started in 1989, then concludes Arthur's Magazine was first.

```
Question: Which magazine was started first?

Thought 1: I need to search Arthur's Magazine and First for Women,
           and find which was started first.
Action 1:  Search[Arthur's Magazine]
Observation 1: Arthur's Magazine was published from 1844 to 1846.

Thought 2: Arthur's Magazine started in 1844. Now search First for Women.
Action 2:  Search[First for Women]
Observation 2: First for Women launched in 1989.

Thought 3: 1844 < 1989, so Arthur's Magazine was started first.
Action 3:  Finish[Arthur's Magazine]
```

Different types of thoughts serve different purposes. Decomposition thoughts break down complex tasks into steps. Knowledge injection adds relevant commonsense. Extraction highlights important information from observations. Progress tracking maintains working memory of what has been accomplished. Exception handling adapts when something goes wrong.

| Thought Type | Example | Purpose |
|--------------|---------|---------|
| Decomposition | "I need to find X then Y then compare" | Break down complex tasks |
| Knowledge injection | "Mammals are warm-blooded" | Add relevant commonsense |
| Extraction | "The key info from that search is..." | Highlight important observations |
| Progress tracking | "I've found X, now I need Y" | Maintain working memory |
| Exception handling | "That didn't work, let me try..." | Adapt to failures |

ReAct outperformed both pure chain-of-thought and action-only approaches across multiple benchmarks. On question answering tasks, it overcame hallucination by grounding in external sources. On decision-making tasks like ALFWorld and WebShop, it achieved significant improvements over imitation and reinforcement learning baselines—with only 1-2 in-context examples and no training required.

Creating ReAct prompts is intuitive because annotators simply write down their thoughts alongside actions, following natural human task-solving trajectories. The pattern generalizes across diverse tasks including question answering, fact verification, text-based games, and web navigation. Because reasoning traces are visible, humans can inspect the decision basis, distinguish internal from external information, and even edit thoughts mid-execution to steer the agent.

For reasoning-heavy tasks like QA and fact verification, the pattern alternates systematically between thought, action, and observation. For action-heavy tasks like games and navigation, thoughts appear more sparsely when the model decides they're needed. ReAct is foundational to modern agentic AI—most agent frameworks implement ReAct-style reasoning, and the thought-action-observation loop is now the dominant paradigm for tool-using language models.
