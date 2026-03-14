import type { Day } from '../../types';

export const day03: Day = {
  day: 3,
  phase: 1,
  title: "Building an Agent from Scratch",
  partner: "DeepLearning.AI",
  tags: ["python", "llm", "fundamentals"],
  concept: "Implement a complete agent with tool registry, parsing, and execution loop—no frameworks required",
  demoUrl: "demos/day-3/",
  demoDescription: "Interact with a from-scratch agent that has no framework dependencies. Ask questions that require tool use and watch the message history, tool calls, and execution loop unfold step by step.",
  learn: {
    overview: {
      summary: "Build a complete agent using only Python and LLM APIs—no frameworks, no magic.",
      fullDescription: `Today we build an agent from scratch. Not with LangChain. Not with LangGraph. Just Python, an LLM API, and about 150 lines of code. This hands-on approach reveals what every agent framework is actually doing under the hood.

Frameworks like LangChain, LangGraph, and CrewAI have made agent development accessible to developers who might otherwise never attempt it. They provide convenient abstractions, pre-built components, and established patterns that can get a prototype running in minutes. But this convenience extracts a price that becomes apparent the moment something goes wrong.

When your LangChain agent produces unexpected output, you're left guessing at the cause. Is the output parser failing to extract the action? Is the context window overflowing, causing the model to lose track of earlier instructions? Is a tool silently throwing an exception that gets swallowed somewhere in the chain? The framework's abstractions, which seemed so helpful during the happy path, now obscure the very information you need to diagnose the problem. You find yourself adding print statements, reading framework source code, and performing trial-and-error debugging that consumes hours.

Building from scratch strips away these layers of abstraction. You see exactly what messages go to the API, exactly what comes back, exactly how parsing happens, and exactly where errors originate. This transparency isn't just useful for debugging—it fundamentally changes your understanding of what agents are and how they work.

The benefits compound across several dimensions. You gain **complete control** over every aspect of agent behavior: how actions are parsed from model output, how errors are surfaced and handled, how conversation history accumulates over time, and precisely when execution should terminate. There are no framework-imposed limitations or opinionated defaults fighting against your requirements.

You work with **minimal dependencies**—just an HTTP client for API calls and a JSON library for parsing responses. This simplicity eliminates version conflicts between framework components, avoids the churn of keeping up with rapidly evolving framework APIs, and reduces the surface area for security vulnerabilities. Your agent's behavior depends only on code you wrote and can inspect.

Most importantly, you develop **transferable knowledge** that makes you effective with any framework. Every agent framework, regardless of its specific API, wraps the same fundamental primitives: message construction, API calls, response parsing, tool execution, and history management. Once you understand these primitives through direct implementation, frameworks become tools you choose deliberately rather than abstractions you depend on blindly.

The agent we build today implements the OBSERVE-THINK-ACT-REFLECT pattern from Day 1 and uses the structured outputs and function calling from Day 2. We'll create an Agent class with message history, a tool registry mapping names to functions, a parser to extract actions from LLM output, and an execution loop that ties it all together.

By the end of this day, you'll have a working agent that can use multiple tools to answer complex questions. More importantly, you'll understand every line of code that makes it work—and you'll be able to debug, extend, and optimize it without fighting framework constraints.`,
      prerequisites: ["Day 1: Understanding the OBSERVE-THINK-ACT-REFLECT loop", "Day 2: Structured outputs and function calling basics", "Python fundamentals (classes, functions, dictionaries)"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "Agent Class Anatomy",
        description: `At its core, an agent needs just three things:

**1. An LLM client** - Connection to your model (OpenAI, Anthropic, etc.). Just HTTP calls to an API.

**2. Message history** - A list storing the conversation. Each turn appends: user request, assistant response, tool observations. The full history is sent with each API call.

**3. A system prompt** - Defines the agent's behavior and output format. Your parsing logic expects a specific structure; the prompt establishes that contract.

\`\`\`python
class Agent:
    def __init__(self, system_prompt: str):
        self.client = OpenAI()
        self.system = system_prompt
        self.messages = []  # Conversation history
\`\`\`

Message history IS the agent's context—LLMs have no memory between calls. By accumulating history, you create the illusion of continuous conversation.

**History management trade-offs:** Full history grows expensive and may exceed context limits. Production agents use sliding windows (last N turns), summarization, or retrieval-based approaches.`
      },
      {
        title: "Tool Registry Pattern",
        description: `Tools are what transform a text generator into an agent that can take action. Day 2 covered how to define tools for LLM APIs using JSON schemas and function descriptions. Here we implement the other side of that contract: the execution machinery that runs when the LLM requests a tool call.

The registry is simply a dictionary that maps tool names to callable functions:

\`\`\`python
def search_web(query: str) -> str:
    """Search the web for current information on any topic."""
    return f"Results for: {query}"  # Production: call real API

def calculate(expression: str) -> str:
    """Evaluate a mathematical expression and return the result."""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"Error evaluating expression: {e}"

tools = {
    "search": search_web,
    "calculate": calculate,
}
\`\`\`

When the agent decides to call "search", we look it up in the registry and execute the corresponding function. That's it—no magic. The "intelligence" lies entirely in how the LLM decides when to invoke them.

**Why a dictionary?** It makes dispatch simple and explicit. When you add a new tool, you add a function and register it. When you want to know what tools are available, you inspect the dictionary keys. When execution fails, you can log exactly which function was called with what arguments.

**Tools always return strings.** Even when a tool performs a calculation that produces a number, convert it to a string before returning. The result will be inserted into the conversation as text, and the LLM will interpret it as part of the ongoing dialogue.

**Tools should handle their own errors.** Rather than raising exceptions that crash the agent, catch errors internally and return descriptive error messages. This allows the LLM to see what went wrong and potentially adapt—maybe it misformatted the arguments and can try again, or maybe it needs to approach the problem differently.

This error-as-observation pattern is crucial for robust agents. Rather than crashing on errors, we feed error information back into the conversation. The LLM can then reason about what happened and try a different approach.`
      },
      {
        title: "ReAct-Style Prompting",
        description: `The system prompt is the contract between your code and the LLM. Every word matters because ambiguity here causes parsing failures downstream. The model will do its best to follow your instructions, but "its best" can vary significantly based on how precisely you specify the expected format.

The **ReAct format** (Reasoning + Acting) structures agent output into parseable segments. ReAct emerged from research showing that models perform better on complex tasks when they externalize their reasoning before acting. The "Thought" step isn't just for human readability—it actually improves the model's decision-making by forcing it to articulate its plan before committing to an action.

\`\`\`
You are a helpful assistant with access to tools.

IMPORTANT: Always respond using EXACTLY one of these two formats:

FORMAT 1 - When you need to use a tool:
Thought: [explain your reasoning about what information you need]
Action: tool_name(arguments)

FORMAT 2 - When you have enough information to answer:
Thought: [explain how you reached your conclusion]
Answer: [your complete response to the user]

Available tools:
- search(query): Search the web for information
- calculate(expression): Evaluate math expressions (e.g., "2 + 2", "sqrt(16)")
\`\`\`

**Why this format works:**

1. **Thought** makes the agent's reasoning explicit. This helps with debugging and makes outputs more interpretable. You can trace why the agent made each decision.

2. **Action** is a consistent pattern you can parse with regex or structured outputs. The model knows exactly how to request tool execution.

3. **Answer** signals completion. When you see this, you know to stop the loop and return the result. Without this explicit signal, you'd have to guess whether output is a final answer or intermediate reasoning.

**Explicit format specification matters.** Rather than describing the format in prose ("respond with your reasoning followed by an action"), show the exact structure with labeled components. The model has a clear template to follow.

**Include few-shot examples.** Complete examples of the expected format dramatically improve compliance. The model sees exactly what a valid Thought/Action sequence looks like and mimics that structure.

The quality of your prompt directly impacts parsing reliability. Vague instructions like "respond with your reasoning and then your action" invite the model to improvise, producing outputs that your parser can't handle.`
      },
      {
        title: "Response Parsing",
        description: `Parsing bridges free-form LLM output to structured execution. This is where the rubber meets the road—and where most agent failures originate. Models drift from specified formats, add unexpected flourishes, or structure their output slightly differently than your parser expects.

**Regex parsing** is fast, requires no additional dependencies, and works well when format compliance is high. The key is designing patterns that are specific enough to match valid actions but tolerant enough to handle common variations:

\`\`\`python
import re

def parse_action(response: str) -> tuple[str, str] | None:
    # Pattern breakdown:
    # Action: - literal prefix
    # \\s* - any whitespace
    # (\\w+) - tool name (captured)
    # \\( \\) - literal parentheses
    # (.+?) - arguments, non-greedy (captured)
    pattern = r"Action:\\s*(\\w+)\\((.+?)\\)"
    match = re.search(pattern, response, re.IGNORECASE | re.DOTALL)
    if match:
        return (match.group(1).lower(), match.group(2).strip())
    return None

def parse_answer(response: str) -> str | None:
    match = re.search(r"Answer:\\s*(.+)", response, re.DOTALL)
    return match.group(1).strip() if match else None
\`\`\`

The \`re.IGNORECASE\` flag handles variations like "action:" or "ACTION:". The \`re.DOTALL\` flag allows the pattern to work even if there are newlines in unexpected places.

**Models drift from format over time.** A model might add markdown formatting (\`**Action**:\`), use slightly different wording (\`I'll use Action:\`), or structure arguments differently than expected. Robust parsers anticipate common deviations by trying multiple patterns in sequence.

**Structured outputs approach** (guaranteed reliability): Use Day 2's structured outputs to guarantee valid format. Define a Pydantic model for the response and let the API enforce it—no regex needed, no edge cases to handle. The trade-off is you're locked into JSON format, which some find less readable for debugging.

**Parsing Strategy Options:**

- **Basic Regex** — Medium reliability, best for prototypes and controlled settings
- **Robust Regex** — Medium-High reliability, best for production with natural language
- **Structured Outputs** — Guaranteed reliability, best for high reliability requirements`
      },
      {
        title: "The Execution Loop",
        description: `This is the core of the agent—where the **OBSERVE-THINK-ACT-REFLECT** pattern from Day 1 becomes running code. Every concept we've discussed converges in this loop: message history, tool execution, parsing, and termination conditions.

\`\`\`python
def run(self, user_message: str, max_turns: int = 10) -> str:
    # Initialize with the user's request
    self.messages.append({"role": "user", "content": user_message})

    for turn in range(max_turns):
        # OBSERVE + THINK: Call the LLM with full history
        response = self._call_llm()
        self.messages.append({"role": "assistant", "content": response})

        # Check for completion
        answer = self._parse_answer(response)
        if answer:
            return answer

        # ACT: Parse and execute tool
        action_result = self._parse_action(response)
        if action_result:
            action, args = action_result
            observation = self._execute_tool(action, args)

            # REFLECT: Add observation to history
            self.messages.append({
                "role": "user",
                "content": f"Observation: {observation}"
            })
        else:
            # No action or answer - nudge model back on track
            self.messages.append({
                "role": "user",
                "content": "Please respond with Action: or Answer: format."
            })

    return "Max turns reached."
\`\`\`

**Tracing through the Day 1 concepts:**

1. **OBSERVE**: When \`_call_llm()\` is called, the model receives the full message history including all previous observations. It "sees" everything that has happened so far.

2. **THINK**: The model generates a response with a "Thought:" component, articulating its reasoning about what to do next.

3. **ACT**: If the response contains an "Action:", we parse it and execute the corresponding tool. The tool performs some operation on the external world.

4. **REFLECT**: We format the tool's output as an "Observation:" and append it to history. This observation becomes part of what the model sees on the next iteration.

**Why observations use "user" role:** The conversation model has a simple structure—messages alternate between "user" and "assistant." When we inject an observation, we're simulating a user providing new information. The model will naturally continue by generating another assistant message, which is exactly what we want.

Understanding the execution loop is essential because it's where most agent failures originate. When you've built the loop yourself, debugging becomes straightforward: you can log each step, inspect message contents, and pinpoint exactly where things go wrong.`
      },
      {
        title: "Error Handling Patterns",
        description: `Production agents don't crash—they surface errors as observations so the LLM can adapt. The philosophy is simple: errors are information, and information should flow to the model so it can make better decisions.

**Informative error messages matter.** When a tool fails, the error message should give the model everything it needs to understand what went wrong and potentially recover. Compare:

- **Bad:** \`"Error"\` — tells the model nothing
- **Good:** \`"Error: Tool 'serch' not found. Available: search, calculate, time. Did you mean 'search'?"\` — lists alternatives and suggests correction

**Unknown tools**: Return a helpful message listing available tools. The model usually just misremembered or mistyped the name.
\`\`\`python
if action not in self.tools:
    available = ", ".join(sorted(self.tools.keys()))
    return f"Error: Unknown tool '{action}'. Available: {available}"
\`\`\`

**Tool execution errors**: Catch exceptions and return them as observations. The model can then try a different approach.
\`\`\`python
try:
    result = self.tools[action](args)
except TypeError as e:
    result = f"Error: Invalid arguments for {action}. {e}"
except TimeoutError:
    result = f"Error: {action} timed out. Try a simpler query."
except Exception as e:
    result = f"Error: {action} failed with {type(e).__name__}: {e}"
\`\`\`

**Parse failures**: When output can't be parsed, guide the model back on track with an explicit reminder of the format.
\`\`\`python
if not action_result and not answer:
    self.messages.append({
        "role": "user",
        "content": "I couldn't parse your response. Please use exactly:\\n"
                   "- Thought: [reasoning]\\n  Action: tool_name(args)\\n"
                   "- Thought: [reasoning]\\n  Answer: [response]"
    })
\`\`\`

**Loop detection**: If the agent repeats the same response multiple times, it's stuck. Detect this by comparing recent assistant messages and terminate gracefully rather than burning tokens.`
      },
      {
        title: "Stop Conditions & Termination",
        description: `An agent without stop conditions runs until it exhausts resources—your API budget, your patience, or your context window. Defense in depth means layering multiple termination checks, each catching different failure modes.

**1. Answer detected**: The model outputs "Answer:" signaling completion. This is the happy path—the agent finished successfully.

**2. Max turns reached**: Hard limit on iterations (typically 5-15). Prevents infinite loops and controls costs. But turns alone aren't sufficient—a model could burn through 15 turns in seconds.

**3. Token budget**: Track cumulative token usage and terminate when approaching a budget. This prevents expensive runaway conversations.

**4. Wall-clock timeout**: Catches agents stuck in slow tool executions or network delays. Some tasks shouldn't run forever.

**5. Loop detection**: Compare recent assistant messages. If they're repeating, the agent is trapped in a cycle. Surface this to the user rather than continuing to burn tokens.

\`\`\`python
def run(self, message: str, max_turns=10, max_tokens=50000, timeout=300):
    start_time = time.time()
    total_tokens = 0

    for turn in range(max_turns):
        if time.time() - start_time > timeout:
            return self._graceful_exit("Timeout reached")
        if total_tokens > max_tokens:
            return self._graceful_exit("Token budget exceeded")
        if self._detect_loop():
            return self._graceful_exit("Agent appears stuck")
        # ... normal execution
\`\`\`

**Graceful termination**: When you must stop early, don't just return an error. Ask the model to provide its best answer given what it's learned so far:

\`\`\`python
def _graceful_exit(self, reason: str) -> str:
    self.messages.append({
        "role": "user",
        "content": f"We need to stop ({reason}). Give your best answer based on what you've learned."
    })
    response = self._call_llm()
    return self._parse_answer(response) or f"Incomplete: {reason}"
\`\`\`

This provides partial value even when full completion isn't possible—much better than returning empty-handed.`
      }
    ],
    codeExamples: [
      {
        title: "Basic Agent Class",
        language: "python",
        category: "basic",
        code: `from openai import OpenAI

class Agent:
    """A minimal agent with message history."""

    def __init__(self, system_prompt: str):
        self.client = OpenAI()
        self.system = system_prompt
        self.messages = []

    def _call_llm(self) -> str:
        """Send messages to LLM and get response."""
        messages = [{"role": "system", "content": self.system}]
        messages.extend(self.messages)

        completion = self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0
        )
        return completion.choices[0].message.content

    def chat(self, user_message: str) -> str:
        """Single-turn conversation."""
        self.messages.append({"role": "user", "content": user_message})
        response = self._call_llm()
        self.messages.append({"role": "assistant", "content": response})
        return response`,
        explanation: "The foundation: an LLM client, system prompt, and message history. The _call_llm method prepends the system message and sends everything to the model."
      },
      {
        title: "Tool Registry & Execution",
        language: "python",
        category: "basic",
        code: `# Define tool functions
def search_web(query: str) -> str:
    """Search the web for information."""
    # Production: call a real search API
    return f"Top results for '{query}': Wikipedia article about {query}"

def calculate(expression: str) -> str:
    """Evaluate a math expression."""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"Error: {e}"

def get_weather(city: str) -> str:
    """Get current weather."""
    # Production: call a weather API
    weathers = {"Paris": "72°F sunny", "Tokyo": "65°F cloudy", "NYC": "58°F rainy"}
    return weathers.get(city, f"Weather unavailable for {city}")

# Tool registry
tools = {
    "search": search_web,
    "calculate": calculate,
    "weather": get_weather,
}

# Execute tool by name
def execute_tool(name: str, args: str) -> str:
    if name not in tools:
        return f"Error: Unknown tool '{name}'. Available: {list(tools.keys())}"
    try:
        return tools[name](args)
    except Exception as e:
        return f"Error: {e}"`,
        explanation: "Tools are just functions. The registry maps names to callables. Error handling returns informative messages the LLM can use."
      },
      {
        title: "Complete Agent with Tool Loop",
        language: "python",
        category: "intermediate",
        code: `import re
from openai import OpenAI

class Agent:
    def __init__(self, system_prompt: str, tools: dict = None):
        self.client = OpenAI()
        self.system = system_prompt
        self.tools = tools or {}
        self.messages = []

    def _call_llm(self) -> str:
        messages = [{"role": "system", "content": self.system}]
        messages.extend(self.messages)
        completion = self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0
        )
        return completion.choices[0].message.content

    def _parse_action(self, response: str):
        match = re.search(r"Action:\\s*(\\w+)\\((.+?)\\)", response, re.IGNORECASE)
        if match:
            return (match.group(1).lower(), match.group(2).strip())
        return None

    def _parse_answer(self, response: str):
        match = re.search(r"Answer:\\s*(.+)", response, re.DOTALL)
        return match.group(1).strip() if match else None

    def _execute_tool(self, action: str, args: str) -> str:
        if action not in self.tools:
            return f"Error: Unknown tool '{action}'. Available: {list(self.tools.keys())}"
        try:
            return str(self.tools[action](args))
        except Exception as e:
            return f"Error: {e}"

    def run(self, user_message: str, max_turns: int = 10) -> str:
        self.messages.append({"role": "user", "content": user_message})

        for turn in range(max_turns):
            response = self._call_llm()
            self.messages.append({"role": "assistant", "content": response})

            answer = self._parse_answer(response)
            if answer:
                return answer

            action_result = self._parse_action(response)
            if action_result:
                action, args = action_result
                observation = self._execute_tool(action, args)
                self.messages.append({
                    "role": "user",
                    "content": f"Observation: {observation}"
                })
            else:
                self.messages.append({
                    "role": "user",
                    "content": "Please respond with Action: or Answer: format."
                })

        return "Max turns reached."

# Usage
PROMPT = """You are a helpful assistant with tools.
Available tools:
- calculate(expression): Evaluate math
- weather(city): Get weather

Format:
Thought: [reasoning]
Action: tool(args)

When done:
Answer: [response]"""

agent = Agent(PROMPT, tools={"calculate": calculate, "weather": get_weather})
result = agent.run("What is 25 * 17, and what's the weather in Paris?")
print(result)`,
        explanation: "The complete agent: parsing, tool execution, and loop control. Under 60 lines of core logic, fully functional for multi-tool queries."
      },
      {
        title: "Production Agent with Error Handling",
        language: "python",
        category: "advanced",
        code: `import re
import time
from openai import OpenAI

class ProductionAgent:
    def __init__(self, system_prompt: str, tools: dict, model: str = "gpt-4o"):
        self.client = OpenAI()
        self.system = system_prompt
        self.tools = tools
        self.model = model
        self.messages = []
        self.total_tokens = 0

    def run(
        self,
        user_message: str,
        max_turns: int = 10,
        max_tokens: int = 50000,
        timeout_seconds: int = 300
    ) -> str:
        start_time = time.time()
        parse_failures = 0
        self.messages.append({"role": "user", "content": user_message})

        for turn in range(max_turns):
            # Check stop conditions
            if time.time() - start_time > timeout_seconds:
                return self._graceful_exit("Timeout reached")
            if self.total_tokens > max_tokens:
                return self._graceful_exit("Token budget exceeded")
            if self._detect_loop():
                return self._graceful_exit("Agent appears stuck")

            # Call LLM
            response, tokens = self._call_llm_with_usage()
            self.total_tokens += tokens
            self.messages.append({"role": "assistant", "content": response})

            # Check for answer
            answer = self._parse_answer(response)
            if answer:
                return answer

            # Parse action
            action_result = self._parse_action(response)
            if action_result:
                parse_failures = 0
                action, args = action_result
                observation = self._execute_tool(action, args)
                self.messages.append({
                    "role": "user",
                    "content": f"Observation: {observation}"
                })
            else:
                parse_failures += 1
                if parse_failures >= 3:
                    return self._graceful_exit("Unable to parse agent responses")
                self.messages.append({
                    "role": "user",
                    "content": "Please use exact format: Action: tool(args) or Answer: response"
                })

        return self._graceful_exit("Max turns reached")

    def _detect_loop(self, window: int = 3) -> bool:
        if len(self.messages) < window * 2:
            return False
        recent = [m["content"] for m in self.messages[-window:] if m["role"] == "assistant"]
        return len(set(recent)) == 1 and len(recent) == window

    def _graceful_exit(self, reason: str) -> str:
        self.messages.append({
            "role": "user",
            "content": f"We need to stop ({reason}). Give your best answer based on what you've learned."
        })
        response, _ = self._call_llm_with_usage()
        answer = self._parse_answer(response)
        return answer if answer else f"Incomplete: {reason}"`,
        explanation: "Production-ready: timeout handling, token budgets, loop detection, parse failure recovery, and graceful degradation."
      }
    ],
    diagrams: [
      {
        title: "Agent Execution Loop",
        type: "ascii",
        content: `
    ┌─────────────────────────────────────────────────────────────────┐
    │                      AGENT EXECUTION LOOP                       │
    └─────────────────────────────────────────────────────────────────┘

         ┌──────────────┐
         │  User Query  │
         └──────┬───────┘
                │
                ▼
    ┌───────────────────────┐
    │   Add to messages[]   │◀───────────────────────────────────┐
    └───────────┬───────────┘                                    │
                │                                                 │
                ▼                                                 │
    ┌───────────────────────┐                                    │
    │      OBSERVE          │  Read full message history          │
    │    + THINK            │  Send to LLM                        │
    └───────────┬───────────┘                                    │
                │                                                 │
                ▼                                                 │
    ┌───────────────────────┐     Yes    ┌──────────────────┐    │
    │   Answer: detected?   │───────────▶│   Return answer  │    │
    └───────────┬───────────┘            └──────────────────┘    │
                │ No                                              │
                ▼                                                 │
    ┌───────────────────────┐     No     ┌──────────────────┐    │
    │   Action: detected?   │───────────▶│ Prompt for format│────┤
    └───────────┬───────────┘            └──────────────────┘    │
                │ Yes                                             │
                ▼                                                 │
    ┌───────────────────────┐                                    │
    │        ACT            │  Look up tool in registry           │
    │   Execute tool(args)  │  Call function with arguments       │
    └───────────┬───────────┘                                    │
                │                                                 │
                ▼                                                 │
    ┌───────────────────────┐                                    │
    │      REFLECT          │  Format: "Observation: {result}"   │
    │  Add to messages[]    │────────────────────────────────────┘
    └───────────────────────┘`,
        caption: "The agent loop: observe history, think via LLM, act with tools, reflect by adding results"
      }
    ],
    keyTakeaways: [
      "An agent is just a loop: call LLM, parse action, execute tool, add result, repeat",
      "Message history is the agent's memory—manage it carefully",
      "The system prompt defines output format—make it explicit and parseable",
      "Tools are just functions mapped in a dictionary—no magic required",
      "Error handling should return informative messages, not crash",
      "Multiple stop conditions prevent runaway execution: max turns, tokens, timeout, loops",
      "Build from scratch first, then you'll understand what frameworks abstract",
      "The OBSERVE-THINK-ACT-REFLECT pattern maps directly to the execution loop"
    ],
    resources: [
      { title: "Agentic AI Course", url: "https://learn.deeplearning.ai/courses/agentic-ai", type: "course", duration: "6h", difficulty: "intermediate", description: "Andrew Ng's comprehensive course on building agents from first principles", summaryPath: "data/day-3/summary-deeplearning-agentic-ai.md" },
      { title: "Build an Agent from Scratch (LangGraph Lesson)", url: "https://learn.deeplearning.ai/courses/ai-agents-in-langgraph/lesson/c1l2c/build-an-agent-from-scratch", type: "course", duration: "30m", difficulty: "beginner", description: "Focused lesson on implementing the ReAct pattern without frameworks", summaryPath: "data/day-3/summary-langgraph-scratch-lesson.md" },
      { title: "OpenAI Function Calling", url: "https://platform.openai.com/docs/guides/function-calling", type: "docs", description: "Official documentation for OpenAI's function calling API", summaryPath: "data/day-2/summary-openai-function-calling.md" },
      { title: "Anthropic Tool Use", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview", type: "docs", description: "Claude's approach to tool use and function calling", summaryPath: "data/day-3/summary-anthropic-tool-use.md" }
    ],
    localResources: [
      {
        id: "agent-from-scratch-guide",
        title: "Building an Agent from Scratch Guide",
        description: "Comprehensive guide covering agent class design, tool registry, parsing, the execution loop, and production patterns",
        filePath: "data/day-3/01-building-agent-from-scratch.md",
        type: "notes",
        estimatedTime: "45 min read"
      }
    ],
    faq: [
      {
        question: "Why not just use LangChain or LangGraph?",
        answer: "Frameworks add value, but they also add abstraction. When your agent misbehaves, you need to understand what's happening underneath to debug it. Building from scratch first teaches you the fundamentals. Then you can use frameworks more effectively—and know when you don't need them."
      },
      {
        question: "How do I prevent infinite loops?",
        answer: "Multiple stop conditions: max_turns limits iterations (typically 5-15), detect repeated outputs (loop detection), set token budgets, and add wall-clock timeouts. Never rely on just one condition."
      },
      {
        question: "Should I use regex or structured outputs for parsing?",
        answer: "Start with regex for simplicity—it works for most cases if your prompt is clear. Move to structured outputs (Day 2) when you need guaranteed format compliance or when you're seeing frequent parse failures. Structured outputs eliminate parsing errors entirely but require more setup."
      },
      {
        question: "How do I handle tools that take a long time?",
        answer: "Add timeouts to tool execution (using threading or asyncio). If a tool times out, return an error observation so the agent can try a different approach. Consider showing progress to the user for long-running operations."
      },
      {
        question: "What's the right max_turns value?",
        answer: "Start with 5-10 for simple tasks, 10-15 for complex ones. If your agent frequently hits the limit, either the task is too complex, the prompt needs refinement, or tools need better error messages. Monitor completion rates and adjust."
      }
    ],
    applications: [
      {
        title: "Customer Support Agent",
        description: "An agent with tools for looking up order status, checking inventory, processing refunds, and escalating to humans. The raw loop gives you full control over sensitive operations and audit logging."
      },
      {
        title: "Research Assistant",
        description: "Tools for web search, document retrieval, citation extraction, and fact-checking. The agent gathers information across sources and synthesizes answers with references."
      },
      {
        title: "Code Review Agent",
        description: "Tools for reading files, running tests, checking style, and searching documentation. The agent analyzes code changes and provides actionable feedback."
      },
      {
        title: "Data Analysis Agent",
        description: "Tools for querying databases, running calculations, and generating visualizations. The agent breaks down analytical questions and executes the steps to answer them."
      }
    ],
    relatedDays: [1, 2, 4, 6]
  }
};
