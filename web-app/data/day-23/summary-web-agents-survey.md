# Web Navigation Agents Survey Paper Summary

**Source**: [arxiv.org/abs/2307.12856](https://arxiv.org/abs/2307.12856)  
**Title**: "A Survey on Large Language Model based Autonomous Agents"  
**Authors**: Wang et al. (2023)

## Overview

This survey provides a comprehensive review of LLM-based autonomous agents, covering the construction, application, and evaluation of agents that can perceive environments, reason about goals, and take actions. The paper is foundational reading for understanding where browser/web agents fit in the broader agent landscape.

## Agent Architecture Framework

The paper defines four core components that all autonomous agents share:

```
┌─────────────────────────────────────────┐
│          Autonomous Agent               │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Profile  │  │ Memory   │            │
│  │ (Role,   │  │ (Short / │            │
│  │  Goals)  │  │  Long)   │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Planning │  │  Action  │            │
│  │ (Reason) │  │(Execute) │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### 1. Profile
Defines the agent's role, personality, and goals. For web agents: "You are a web research assistant. Your goal is to find specific information on web pages."

### 2. Memory
- **In-context (working memory)**: The current conversation, recent observations, last few actions
- **External (long-term memory)**: A persistent store the agent can read/write across sessions — useful for learned preferences, site-specific knowledge

### 3. Planning
How the agent breaks down and approaches goals:
- **Task decomposition**: Breaking a complex goal into sub-tasks
- **Reflection**: Evaluating past actions and correcting course
- **ReAct pattern**: Alternating between Reasoning (thinking) and Acting (doing)

### 4. Action
Categories of actions agents can take:
- **Internal**: Memory operations, planning steps, tool calls
- **External**: File I/O, API calls, browser actions (click, type, navigate)

## Web Agent Taxonomy

The paper classifies web agents along several dimensions:

### By Input Modality
| Type | Input | Example |
|------|-------|---------|
| Text-only | HTML/DOM text | Extracting structured data from HTML |
| Vision-only | Screenshots | Click-on-what-you-see agents |
| Multimodal | Both | Hybrid DOM + visual agents |

### By Action Space
| Type | Actions | Granularity |
|------|---------|-------------|
| Low-level | x,y click, keystroke | Fine-grained, precise |
| High-level | click(element_id), type(text) | Abstract, robust |
| Programmatic | Write code, execute | Flexible, powerful |

### By Planning Strategy
| Strategy | Description | Best for |
|----------|-------------|----------|
| Direct | Single LLM call → action | Simple, deterministic tasks |
| ReAct | Reason → Act → Observe loop | Multi-step navigation |
| Tree search | Explore action branches | Complex decision points |
| Retrospective | Reflect on past failures | Learning from mistakes |

## Key Benchmarks for Web Agents

### MiniWoB++
- **Type**: Simplified web interaction tasks
- **Tasks**: 100+ mini web environments (login forms, calendar widgets, email)
- **Metric**: Task completion rate
- **Best performance (2023)**: ~80% with GPT-4 + grounding

### WebArena
- **Type**: Realistic web tasks on full-featured sites (Reddit, GitLab, Amazon)
- **Tasks**: 812 long-horizon tasks requiring multi-page navigation
- **Metric**: Task success rate
- **Baseline performance**: 10-20% for early LLM agents (hard benchmark)

### Mind2Web
- **Type**: Real-world website interactions
- **Tasks**: 2,000 tasks collected from real browser recordings
- **Metric**: Element accuracy, operation accuracy, step success

## Challenges Identified

### Observation Space
- **HTML verbosity**: A typical page DOM is 10k-100k tokens — too large for most LLMs
- **Dynamic content**: JavaScript renders content after initial HTML load
- **Visual complexity**: Rich UIs have semantic meaning not captured in DOM text

### Action Grounding
- **Element identification**: Matching an abstract "click the submit button" to the correct DOM element
- **Coordinate precision**: Visual grounding coordinates drift with window size / DPI
- **Action ordering**: Some actions must happen in sequence; parallel execution causes errors

### Memory Limitations
- **Context window**: Fitting the entire page + history + task into a context window
- **Task drift**: Agents lose track of original goals during long multi-step tasks
- **Hallucination**: Agents act on remembered (hallucinated) page state rather than current state

### Generalization
- **Out-of-distribution sites**: Training on site A doesn't guarantee performance on site B
- **Layout changes**: Sites that redesign break agents tuned on old layouts
- **Pop-up handling**: Unexpected modals, cookie banners, and login walls interrupt flows

## Evolution 2021–2023

| Year | Key Development |
|------|----------------|
| 2021 | WebGPT: GPT with search actions for question answering |
| 2022 | ACT-1: Transformer fine-tuned on browser interaction data |
| 2023 | ReAct + GPT-4: Zero-shot web navigation via reasoning traces |
| 2023 | WebAgent: HTML summarization + Flan-U-PaLM for planning |
| 2023 | browser-use precursors: DOM extraction + GPT-4 action loops |

## Recommendations for Practitioners

1. **Use semantic selectors**: ARIA roles beat coordinates for robustness
2. **Compress observations**: Extract only interactive elements + visible text; don't feed raw HTML
3. **Reflection loops**: Let agents self-critique failed steps before retrying
4. **Human checkpoints**: Insert human review before irreversible actions
5. **Evaluation**: Test on diverse sites, not just your development target
6. **Task decomposition**: Break long workflows into independently verifiable sub-tasks

## Citation

```bibtex
@article{wang2023survey,
  title={A Survey on Large Language Model based Autonomous Agents},
  author={Wang, Lei and Ma, Chen and Feng, Xueyang and ...},
  journal={arXiv preprint arXiv:2307.12856},
  year={2023}
}
```
