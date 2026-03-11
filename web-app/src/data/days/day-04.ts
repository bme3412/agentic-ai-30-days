import type { Day } from '../../types';

export const day04: Day = {
  day: 4,
  phase: 1,
  title: "The ReAct Pattern: Reasoning + Acting",
  partner: "DeepLearning.AI",
  tags: ["react", "reasoning", "tool-use"],
  concept: "Interleaving reasoning traces with actions for explainable decision-making",
  demoUrl: "demos/day-4/",
  demoDescription: "See the ReAct pattern in action with a live agent. Watch as it generates Thought traces explaining its reasoning, takes Actions to gather information, and processes Observations—all visible in real-time.",
  learn: {
    overview: {
      summary: "Master the ReAct pattern—interleaving reasoning traces with actions for transparent, debuggable AI agents.",
      fullDescription: `In 2022, a research paper from Princeton and Google titled "ReAct: Synergizing Reasoning and Acting in Language Models" introduced a pattern that has become foundational to modern agentic AI. The core insight was deceptively simple: instead of having language models either *think* (chain-of-thought reasoning) or *act* (call tools and APIs), why not have them do both simultaneously?

Before ReAct, researchers had explored two separate approaches to making LLMs more capable. **Chain-of-thought prompting** improved reasoning by having models "think step by step" before answering—great for math problems and logic puzzles, but the reasoning happened entirely in the model's head with no grounding in external information. **Action-based approaches** let models use tools and APIs to gather real information, but the models would jump straight to actions without explaining their reasoning, making it hard to understand why they did what they did or to catch errors in their logic.

ReAct elegantly combines these approaches. The model generates a **Thought** explaining what it's trying to figure out, then takes an **Action** to gather information, receives an **Observation** with the results, and repeats. The thoughts aren't just for show—they genuinely help the model track what it's learned, what questions remain, and what to do next.

This pattern matters for three practical reasons:

**Debuggability**: When an agent makes a mistake, you can trace its reasoning. Did it misunderstand the question? Did it form a wrong hypothesis? Did it misinterpret tool output? The thought trace tells you exactly where things went wrong.

**Reliability**: By forcing explicit reasoning, ReAct reduces the "just guessing" behavior that plagues simpler approaches. The model must articulate what it's trying to learn before acting, which leads to more purposeful tool use.

**Human alignment**: The reasoning traces create natural intervention points. A human can read the thoughts and catch errors before the agent takes consequential actions. This is critical for high-stakes applications.

The pattern has become so influential that virtually every modern agent framework implements some variant of it. Understanding ReAct deeply—not just the syntax, but the reasoning behind the design—will make you more effective with any tool you use.`,
      prerequisites: ["Day 1: OBSERVE-THINK-ACT-REFLECT loop fundamentals", "Day 2: Function calling and tool definitions", "Day 3: Basic agent implementation"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "The Problem ReAct Solves",
        description: `ReAct synthesizes two prior approaches that each fail alone:

**Chain-of-Thought (CoT)**: Models reason step-by-step before answering. Great for logic, but entirely internal—answers come from training data that may be outdated or wrong.

**Action-Only**: Models call tools directly. Gets real data, but without explicit reasoning, tools are often called prematurely or incorrectly.

**ReAct combines both**—thoughts before actions, observations interpreted before the next step:

\`\`\`
Thought: I need to find the population of France's capital. First, let me confirm what the capital is.
Action: search("capital of France")
Observation: Paris is the capital and largest city of France.

Thought: Now I know it's Paris. Let me search for the current population.
Action: search("Paris population 2024")
Observation: The population of Paris proper is approximately 2.1 million.

Thought: I have the information I need. The capital is Paris with ~2.1 million people.
Answer: The capital of France is Paris, with a population of approximately 2.1 million people.
\`\`\`

Each thought explains what the model is trying to learn. Each action is purposeful. Each observation gets interpreted before the next action. This structure prevents the model from acting randomly and creates a traceable reasoning chain.`
      },
      {
        title: "Thought-Action-Observation Loop",
        description: `ReAct structures agent behavior into a repeating cycle with three distinct phases. Understanding each phase—and the transitions between them—is key to implementing and debugging ReAct agents.

**Thought**: The model generates internal reasoning about its current state. What does it know? What does it need to find out? What's the best approach? Crucially, thoughts don't affect the external world—they're planning and reflection.

Good thoughts are:
- **Goal-oriented**: "I need to find X to answer the user's question"
- **State-aware**: "I now know X, but I still need Y"
- **Strategic**: "I'll try approach A first; if that fails, I'll try B"

Bad thoughts are:
- **Vague**: "Let me think about this"
- **Repetitive**: Saying the same thing without new information
- **Disconnected**: Not relating to the actual goal

**Action**: Based on its reasoning, the model decides what tool to call with what arguments. The action format must be precise enough for your parser to extract the tool name and arguments reliably.

\`\`\`
Action: tool_name(argument1, argument2)
\`\`\`

**Observation**: After tool execution, the result is formatted and provided back to the model. Observations should be clear and parseable—the model needs to extract relevant information from them.

\`\`\`
Observation: The search returned: [relevant results here]
\`\`\`

**The Loop**: These three phases repeat until the model determines it has enough information to answer (or hits a limit). The transitions matter:

- Thought → Action: The model decides what to do based on its reasoning
- Action → Observation: Your code executes the tool and formats the result
- Observation → Thought: The model interprets results and plans next steps

This structure makes the agent's reasoning transparent at every step.`
      },
      {
        title: "Grounded Reasoning",
        description: `One of ReAct's most important contributions is the concept of **grounded reasoning**—thoughts that are anchored in actual observations rather than pure speculation.

**Ungrounded reasoning** (pure CoT) looks like this:

\`\`\`
Question: Is Walmart open right now?
Thought: Walmart stores are typically open from 6am to 11pm...
\`\`\`

The model is reasoning from its training data, which might be outdated or wrong for your specific location. There's no connection to reality.

**Grounded reasoning** (ReAct) looks like this:

\`\`\`
Question: Is Walmart open right now?
Thought: I need to find the current hours for the user's local Walmart. Let me search.
Action: search("Walmart hours [user_location]")
Observation: Walmart at 123 Main St is open today 6am-11pm.
Thought: Based on the search results, this Walmart is open 6am-11pm. The current time is 3pm, which is within those hours.
Answer: Yes, the Walmart at 123 Main St is currently open (until 11pm today).
\`\`\`

The reasoning is now *grounded* in actual data retrieved during the conversation. The model isn't guessing—it's interpreting real information.

**Why grounding matters:**

1. **Accuracy**: Grounded answers are based on current data, not training data that might be years old

2. **Verifiability**: You can check the sources—the observations are right there in the trace

3. **Confidence calibration**: The model knows when it has real evidence vs. when it's speculating

4. **Hallucination reduction**: Models are less likely to fabricate facts when they have real data to work with

**Implementing grounding**: Encourage grounding by instructing the model to always base conclusions on observations, not prior knowledge. Include instructions like: "Only state facts that you can support with observations from tool calls. If you're uncertain, use a tool to verify before answering."`
      },
      {
        title: "ReAct Prompt Engineering",
        description: `The system prompt is where you establish the ReAct contract. A well-crafted prompt produces consistent, parseable output; a vague prompt produces chaos.

**Essential components:**

1. **Format specification** with explicit markers:
\`\`\`
Always respond in this EXACT format:

Thought: [your reasoning about what to do next]
Action: tool_name(arguments)

OR when you have the final answer:

Thought: [your reasoning about why you can now answer]
Answer: [your complete response to the user]
\`\`\`

2. **Tool documentation** with clear descriptions:
\`\`\`
Available tools:
- search(query): Search the web for current information. Returns top results.
- calculate(expression): Evaluate a math expression. Returns the numeric result.
- lookup(term): Look up a definition or fact. Returns a concise explanation.
\`\`\`

3. **Behavioral guidelines**:
\`\`\`
Guidelines:
- Think step by step before acting
- Base your conclusions on observations, not assumptions
- If a tool call fails, try a different approach
- Only provide Answer: when you have sufficient information
\`\`\`

4. **Few-shot examples** showing the exact format:
\`\`\`
Example:
User: What's the weather in Tokyo?
Thought: I need to find current weather information for Tokyo.
Action: search("Tokyo weather today")
Observation: Tokyo weather: 72°F, partly cloudy, 45% humidity
Thought: I now have the current weather data for Tokyo.
Answer: The weather in Tokyo is currently 72°F and partly cloudy with 45% humidity.
\`\`\`

**Common prompt pitfalls:**

- Being too vague about format (model improvises)
- Not showing examples (model guesses at structure)
- Forgetting to define all tools (model invents tools)
- Not specifying when to stop (model loops forever)`
      },
      {
        title: "Parsing ReAct Output",
        description: `Reliable parsing transforms ReAct from a prompting technique into a working system. You need to handle the three types of model output: thoughts (for logging), actions (for execution), and answers (for termination).

**Regex-based parsing** is simple and dependency-free:

\`\`\`python
import re

def parse_react_response(response: str):
    """Parse a ReAct-formatted response into components."""

    # Extract thought (for logging/debugging)
    thought_match = re.search(r"Thought:\\s*(.+?)(?=Action:|Answer:|$)", response, re.DOTALL)
    thought = thought_match.group(1).strip() if thought_match else None

    # Check for final answer (signals completion)
    answer_match = re.search(r"Answer:\\s*(.+)", response, re.DOTALL)
    if answer_match:
        return {"type": "answer", "thought": thought, "answer": answer_match.group(1).strip()}

    # Parse action
    action_match = re.search(r"Action:\\s*(\\w+)\\((.*)\\)", response)
    if action_match:
        return {
            "type": "action",
            "thought": thought,
            "tool": action_match.group(1),
            "args": action_match.group(2).strip()
        }

    # Neither action nor answer - malformed response
    return {"type": "error", "thought": thought, "raw": response}
\`\`\`

**Handling edge cases:**

- **Multiple thoughts**: Sometimes models generate multiple "Thought:" lines. Decide whether to concatenate or take the last one.
- **Nested parentheses**: Arguments like \`calculate("(2+3)*4")\` break simple regex. Use a more sophisticated parser or structured outputs.
- **Markdown formatting**: Models often add \`**\` or other formatting. Strip it before parsing.
- **Off-format responses**: When parsing fails, feed the error back to the model with format instructions.

**Structured outputs alternative**: Using Day 2's structured outputs eliminates parsing issues entirely. Define a schema that enforces the ReAct structure:

\`\`\`python
class ReActResponse(BaseModel):
    thought: str
    action: Optional[ActionCall] = None
    answer: Optional[str] = None

    @model_validator
    def check_action_or_answer(cls, v):
        # Exactly one of action or answer must be present
        ...
\`\`\``
      },
      {
        title: "ReAct vs. Other Patterns",
        description: `ReAct isn't the only way to structure agent behavior. Understanding the alternatives helps you choose the right pattern for each use case.

**ReAct (Reasoning + Acting)**:
- Interleaves thoughts and actions
- Best for: Exploratory tasks, research, debugging
- Strength: Transparency, debuggability
- Weakness: Verbose, slower due to reasoning overhead

**Act-Only (Direct Tool Use)**:
- Model directly outputs tool calls without explicit reasoning
- Best for: Simple, well-defined tasks
- Strength: Faster, less token usage
- Weakness: Hard to debug, no visibility into decisions

**Plan-and-Execute**:
- Model first creates a complete plan, then executes steps
- Best for: Predictable multi-step workflows
- Strength: Better for long-horizon tasks
- Weakness: Plans can become invalid as execution proceeds

**Reflexion**:
- Adds explicit self-evaluation after action sequences
- Best for: Tasks requiring quality assessment
- Strength: Self-correction, learning from mistakes
- Weakness: Additional overhead, complexity

**When to use ReAct:**

✅ Information gathering and research tasks
✅ Tasks where you need to understand agent reasoning
✅ Complex multi-step problems requiring adaptation
✅ Situations where grounded reasoning matters
✅ Debugging and development of agent systems

**When to consider alternatives:**

❌ Simple single-tool calls (use Act-Only)
❌ Well-defined workflows (use Plan-and-Execute)
❌ Tasks requiring quality iteration (add Reflexion)
❌ Latency-critical applications (minimize reasoning)`
      },
      {
        title: "Implementing ReAct: Complete Example",
        description: `Let's bring everything together with a complete, minimal ReAct implementation. This code demonstrates the full pattern in under 100 lines.

\`\`\`python
import re
from openai import OpenAI

class ReActAgent:
    def __init__(self):
        self.client = OpenAI()
        self.tools = {
            "search": lambda q: f"Search results for '{q}': [mock results]",
            "calculate": lambda expr: str(eval(expr)),
        }
        self.system_prompt = """You are a helpful assistant using the ReAct pattern.

Always respond in EXACTLY one of these formats:

When you need information:
Thought: [your reasoning]
Action: tool_name(arguments)

When you have the answer:
Thought: [your reasoning]
Answer: [your response]

Available tools:
- search(query): Search for information
- calculate(expression): Do math"""

    def run(self, user_input: str, max_turns: int = 5) -> str:
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_input}
        ]

        for turn in range(max_turns):
            # Get model response
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages
            ).choices[0].message.content

            print(f"\\n--- Turn {turn + 1} ---")
            print(response)

            messages.append({"role": "assistant", "content": response})

            # Check for answer
            answer = re.search(r"Answer:\\s*(.+)", response, re.DOTALL)
            if answer:
                return answer.group(1).strip()

            # Parse and execute action
            action = re.search(r"Action:\\s*(\\w+)\\((.*)\\)", response)
            if action:
                tool_name, args = action.group(1), action.group(2).strip('\\"')
                if tool_name in self.tools:
                    result = self.tools[tool_name](args)
                else:
                    result = f"Unknown tool: {tool_name}"

                observation = f"Observation: {result}"
                messages.append({"role": "user", "content": observation})
            else:
                messages.append({"role": "user", "content": "Please respond with Thought/Action or Thought/Answer format."})

        return "Max turns reached without answer."

# Usage
agent = ReActAgent()
result = agent.run("What is 25 * 47 + 123?")
print(f"\\nFinal: {result}")
\`\`\`

**Key implementation details:**

1. **System prompt** defines the exact format and available tools
2. **Main loop** alternates between model calls and tool execution
3. **Observations** are injected as user messages (the model sees them as input)
4. **Parsing** extracts actions and answers using regex
5. **Termination** occurs on answer or max turns`
      }
    ],
    codeExamples: [
      {
        title: "Basic ReAct Loop",
        language: "python",
        category: "basic",
        code: `def react_loop(query: str, tools: dict, max_turns: int = 5) -> str:
    """Minimal ReAct implementation."""
    messages = [{"role": "user", "content": query}]

    for _ in range(max_turns):
        response = call_llm(messages)
        messages.append({"role": "assistant", "content": response})

        # Check for final answer
        if "Answer:" in response:
            return extract_answer(response)

        # Parse and execute action
        tool, args = parse_action(response)
        if tool and tool in tools:
            observation = tools[tool](args)
            messages.append({"role": "user", "content": f"Observation: {observation}"})

    return "No answer found"`,
        explanation: "The core ReAct loop: call LLM, check for answer, parse action, execute tool, inject observation, repeat."
      },
      {
        title: "ReAct with Error Handling",
        language: "python",
        category: "intermediate",
        code: `def react_with_recovery(query: str, tools: dict) -> str:
    """ReAct loop with graceful error handling."""
    messages = [{"role": "user", "content": query}]
    consecutive_errors = 0

    for turn in range(10):
        response = call_llm(messages)
        messages.append({"role": "assistant", "content": response})

        if "Answer:" in response:
            return extract_answer(response)

        parsed = parse_action(response)
        if not parsed:
            consecutive_errors += 1
            if consecutive_errors > 2:
                messages.append({"role": "user", "content":
                    "Please provide your best answer based on what you know."})
            else:
                messages.append({"role": "user", "content":
                    "Use format: Thought: [reasoning]\\nAction: tool(args)"})
            continue

        consecutive_errors = 0
        tool, args = parsed

        if tool not in tools:
            observation = f"Error: Unknown tool '{tool}'. Available: {list(tools.keys())}"
        else:
            try:
                observation = tools[tool](args)
            except Exception as e:
                observation = f"Error executing {tool}: {str(e)}"

        messages.append({"role": "user", "content": f"Observation: {observation}"})

    return "Max turns reached"`,
        explanation: "Production-ready ReAct with error recovery, format correction, and graceful termination."
      }
    ],
    diagrams: [
      {
        title: "ReAct Flow",
        type: "flow",
        ascii: `
    ┌─────────────────────────────────────────────────────────────┐
    │                      USER QUERY                             │
    └───────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
    ┌───────────────────────────────────────────────────────────────┐
    │                                                               │
    │  ┌──────────────────────────────────────────────────────┐    │
    │  │ THOUGHT: Reason about current state and next steps   │    │
    │  │ "I need to find X to answer this question..."        │    │
    │  └────────────────────────┬─────────────────────────────┘    │
    │                           │                                   │
    │                           ▼                                   │
    │  ┌──────────────────────────────────────────────────────┐    │
    │  │ ACTION: Execute tool based on reasoning              │    │
    │  │ search("query") / calculate("expr") / etc.           │    │
    │  └────────────────────────┬─────────────────────────────┘    │
    │                           │                                   │
    │                           ▼                                   │
    │  ┌──────────────────────────────────────────────────────┐    │
    │  │ OBSERVATION: Tool returns result                     │    │
    │  │ "The search returned: ..."                           │    │
    │  └────────────────────────┬─────────────────────────────┘    │
    │                           │                                   │
    │                           ▼                                   │
    │                    Have enough info?                          │
    │                      /         \\                              │
    │                    No           Yes                           │
    │                    │             │                            │
    │                    ▼             │                            │
    │              Loop back           │                            │
    │              to THOUGHT          │                            │
    │                                  │                            │
    │               REACT LOOP         │                            │
    └──────────────────────────────────┼────────────────────────────┘
                                       │
                                       ▼
    ┌─────────────────────────────────────────────────────────────┐
    │            ANSWER: Final grounded response                  │
    └─────────────────────────────────────────────────────────────┘`,
        caption: "The ReAct pattern: Thought → Action → Observation → (repeat until Answer)"
      }
    ],
    keyTakeaways: [
      "ReAct interleaves reasoning (Thought) with actions (Action) and results (Observation)",
      "Thoughts make agent decisions transparent and debuggable",
      "Grounded reasoning means conclusions based on observations, not training data",
      "The pattern prevents premature action and encourages purposeful tool use",
      "Clear format specification in prompts is essential for reliable parsing"
    ],
    resources: [
      { title: "ReAct: Synergizing Reasoning and Acting (Original Paper)", url: "https://arxiv.org/abs/2210.03629", type: "paper", summaryPath: "data/day-4/summary-react-paper.md" },
      { title: "LangChain ReAct Agent Documentation", url: "https://python.langchain.com/docs/modules/agents/agent_types/react", type: "docs", summaryPath: "data/day-4/summary-langchain-react.md" },
      { title: "Chain-of-Thought Prompting (Background)", url: "https://arxiv.org/abs/2201.11903", type: "paper", summaryPath: "data/day-4/summary-chain-of-thought.md" },
      { title: "Building Effective Agents - Anthropic", url: "https://www.anthropic.com/research/building-effective-agents", type: "article", summaryPath: "data/day-4/summary-anthropic-agents.md" },
      { title: "DeepLearning.AI: Functions, Tools and Agents", url: "https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/", type: "course", summaryPath: "data/day-4/summary-deeplearning-agents.md" }
    ],
    faq: [
      {
        question: "Why use 'Thought' instead of just letting the model reason internally?",
        answer: "External thoughts serve two purposes: they help the model reason more effectively (chain-of-thought effect), and they create a traceable log for debugging. When something goes wrong, you can see exactly what the model was thinking. Internal reasoning would be invisible."
      },
      {
        question: "How is ReAct different from what we built on Day 3?",
        answer: "Day 3's agent used a similar loop structure, but ReAct specifically emphasizes explicit reasoning traces before each action. The 'Thought' component isn't just logging—it's an integral part of the pattern that improves model behavior. ReAct also provides a formal framework with research backing."
      },
      {
        question: "When should I NOT use ReAct?",
        answer: "ReAct adds overhead (extra tokens for thoughts). For simple, well-defined tasks like 'convert this temperature' or 'format this date', direct tool calling is faster and cheaper. Use ReAct when transparency, multi-step reasoning, or debuggability matters."
      },
      {
        question: "How do I know if my agent is grounding properly?",
        answer: "Check whether the agent's answers can be traced back to observations. If the agent states a fact, there should be a prior observation containing that information. If facts appear without supporting observations, the agent is hallucinating from training data."
      }
    ],
    applications: [
      {
        title: "Research Assistant",
        description: "Agents that search multiple sources, synthesize findings, and provide grounded summaries with citations—perfect for ReAct's transparent reasoning traces."
      },
      {
        title: "Customer Support Agent",
        description: "Agents that look up account information, check policies, and explain their reasoning while helping customers—the thought traces create audit logs."
      },
      {
        title: "Code Review Agent",
        description: "Agents that analyze code, search documentation, and explain issues found—ReAct's reasoning makes the review process transparent and educational."
      }
    ],
    relatedDays: [1, 2, 3, 5, 6]
  }
};
