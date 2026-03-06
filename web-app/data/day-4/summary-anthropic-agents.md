# Building Effective Agents - Anthropic

**Focus:** Anthropic's framework for choosing between workflows and autonomous agents

Anthropic's guide introduces a critical distinction that shapes how you should approach agentic systems: not everything needs to be a fully autonomous agent.

## Workflows vs Agents

**Workflows** are systems where LLMs and tools are orchestrated through **predefined code paths**. You control the flow; the LLM handles specific steps.

**Agents** are systems where LLMs **dynamically direct their own processes** and tool usage. The LLM decides what to do next.

The key insight: start with workflows. Only graduate to agents when the task genuinely requires dynamic decision-making.

## The Five Workflow Patterns

Anthropic identifies five patterns that handle most use cases without full agent autonomy:

**1. Prompt Chaining**
Decompose a task into sequential steps. Each LLM call processes the output of the previous one. Trades latency for accuracy by keeping individual steps simple.

**2. Routing**
Classify inputs first, then direct them to specialized handlers. Enables separation of concerns—optimize each handler for its specific input type.

**3. Parallelization**
Two variants:
- **Sectioning**: Break task into independent subtasks, run simultaneously
- **Voting**: Run the same task multiple times for diverse outputs, then aggregate

**4. Orchestrator-Workers**
A central LLM dynamically breaks down tasks and delegates to worker LLMs, then synthesizes results. Unlike parallelization, subtasks aren't predefined—the orchestrator decides based on context.

**5. Evaluator-Optimizer**
Create feedback loops: one LLM generates responses, another evaluates and suggests refinements. Iterate until quality threshold is met.

## The Augmented LLM

The foundational building block is the **augmented LLM**—a base model enhanced with:
- **Retrieval** for external knowledge
- **Tools** for taking actions
- **Memory** for persistence across interactions

Anthropic highlights their **Model Context Protocol (MCP)** as an approach for standardizing tool integration.

## Design Principles

Three principles guide effective agent design:

1. **Simplicity**: "Success isn't about building the most sophisticated system—it's about building the right system for your needs."

2. **Transparency**: Make agent reasoning visible through explicit planning steps. This enables debugging and builds trust.

3. **Interface Design**: Carefully document and test the agent-computer interface. Tools should be unambiguous and well-specified.

## Real-World Applications

**Customer Support**: Combine conversational interface with tool access (order lookup, refunds, knowledge base). Workflows handle common paths; agents handle edge cases.

**Coding Agents**: Solve GitHub issues through iterative cycles of code generation, testing, and refinement. The evaluator-optimizer pattern shines here.

## Connection to ReAct

ReAct fits within this framework as a pattern for **autonomous agents**—when you need the LLM to dynamically decide what to do. But Anthropic's guide reminds us: consider whether a simpler workflow pattern might suffice first. The thought-action-observation loop is powerful, but predefined workflows are often more reliable and debuggable.
