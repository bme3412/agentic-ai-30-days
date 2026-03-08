# Constitutional AI: Self-Critique with Principles

**Focus:** Training AI to critique and revise its outputs using explicit principles

**Authors:** Yuntao Bai et al. (Anthropic)
**Published:** 2022

## The Big Idea

Constitutional AI (CAI) introduced a foundational idea: instead of relying solely on human feedback, AI systems can critique their own outputs against a set of explicit principles (a "constitution"). This enables scalable self-improvement while maintaining alignment with human values.

The key innovation is using the model itself as both generator and critic, guided by natural language principles rather than reward signals.

## How Constitutional AI Works

The process has two phases:

### Phase 1: Supervised Learning with Self-Critique

1. **Generate**: Model produces a response to a prompt
2. **Critique**: Model identifies issues based on constitutional principles
3. **Revise**: Model rewrites the response to address the critique
4. The revised responses are used as training data

### Phase 2: Reinforcement Learning from AI Feedback (RLAIF)

1. Model generates pairs of responses
2. Another model (or the same model) evaluates which is better per the constitution
3. These preferences train a reward model
4. The original model is fine-tuned using this reward model

## The Constitution

The constitution is a set of principles like:

```
1. Choose the response that is most helpful and informative
2. Choose the response that is least harmful or toxic
3. Choose the response that is most honest and accurate
4. Avoid responses that are deceptive or manipulative
5. Prefer responses that acknowledge uncertainty appropriately
```

These principles guide both critique and revision.

## Self-Critique in Action

**Original response:**
"To make a bomb, you would need to..."

**Critique (guided by principle #2):**
"This response provides harmful information that could enable violence. It violates the principle of avoiding harmful content."

**Revised response:**
"I can't provide instructions for creating weapons. If you're interested in chemistry or engineering, I'd be happy to suggest educational resources about those fields."

## Why This Matters for Agents

Constitutional AI demonstrates several key ideas relevant to agentic systems:

1. **Self-supervision works**: Models can effectively identify problems in their own outputs
2. **Principles beat examples**: Natural language rules are more generalizable than curated examples
3. **Iterative improvement**: Multiple rounds of critique/revision produce better outputs
4. **Scalable alignment**: Reduces dependence on expensive human feedback

## Connection to Other Reflection Patterns

| Pattern | External Feedback | Training | Critique Source |
|---------|-------------------|----------|-----------------|
| Constitutional AI | Minimal | Yes | Principles |
| Self-Refine | None | No | Self-evaluation |
| Reflexion | Environment | No | Self-reflection |
| RLHF | Human | Yes | Human preferences |

Constitutional AI sits at the intersection of self-improvement and alignment research.

## Key Insights

1. **Critique is easier than generation**: Models can identify issues they couldn't avoid initially
2. **Principles provide guidance**: Explicit rules help focus the critique
3. **Self-consistency emerges**: Iterative revision produces more coherent outputs
4. **Red-teaming at scale**: Models can probe their own weaknesses

## Limitations

- Quality depends on how well principles are specified
- Models may find loopholes in imprecise principles
- Self-critique can miss errors the model would consistently make
- Requires careful principle engineering

## Resources

- [Paper (arXiv)](https://arxiv.org/abs/2212.08073)
- [Anthropic Blog Post](https://www.anthropic.com/research/constitutional-ai)
