import type {
  Phase,
  Day,
  JournalEntry,
  BlogPost,
  BlogData,
  BlogFilterOptions,
  Achievement,
  GamificationData,
  Streak,
  DayActivity,
  GamificationStats,
  ReadingProgressData,
  CompletedResource,
  SectionProgressData,
  SectionItem,
  SectionProgressCounts,
  DayOverallProgress,
  DayCompletion,
  DayCompletionRequirement,
  DayCompletionCheck,
  MarkDayCompleteResult,
  LocalResource,
  MicroPost,
} from './types';

// ══════════════════════════════════════════════════════════════
// PHASE & DAY DATA
// ══════════════════════════════════════════════════════════════

export const PHASES: Phase[] = [
  { id: 1, title: "Foundations of Agentic AI", subtitle: "Core concepts, design patterns, and building your first agent.", badge: "p1" },
  { id: 2, title: "Agent Frameworks", subtitle: "Mastering LangGraph, CrewAI, AutoGen, OpenAI SDK, and PydanticAI.", badge: "p2" },
  { id: 3, title: "Agentic RAG & Memory", subtitle: "Building retrieval-augmented agents with long-term memory and knowledge graphs.", badge: "p3" },
  { id: 4, title: "Protocols & Interoperability", subtitle: "Connecting agents with MCP, A2A, and ACP protocols.", badge: "p4" },
  { id: 5, title: "Specialized Agents", subtitle: "Building browser, coding, document, voice, and data agents.", badge: "p5" },
  { id: 6, title: "Production & Evaluation", subtitle: "Observability, testing, guardrails, and deploying agents at scale.", badge: "p6" },
];

export const DAYS: Day[] = [
  // Phase 1: Foundations of Agentic AI (Days 1-5)
  { day: 1,  phase: 1, title: "Agentic AI: Core Concepts & Design Patterns",    partner: "DeepLearning.AI",                    tags: ["agentic-patterns", "foundations", "design"],
    concept: "The Observe-Think-Act-Reflect loop that powers autonomous AI agents",
    demoUrl: "demos/day-1/",
    lesson: {
      overview: `Agentic AI represents a paradigm shift from simple prompt-response interactions to autonomous systems that can perceive, reason, act, and learn. Unlike traditional LLM applications that respond to single prompts, agentic systems operate in loops—continuously observing their environment, thinking about what to do, taking actions, and reflecting on outcomes.

This foundational lesson introduces the core design pattern that underlies all agentic systems: the **OBSERVE → THINK → ACT → REFLECT** loop.`,

      principles: [
        {
          title: "Agents Are Loops, Not Single Calls",
          description: "Traditional LLM usage involves a single prompt → response cycle. Agents, by contrast, operate in continuous loops. They perceive input, decide on actions, execute those actions, observe the results, and iterate. This loop continues until the agent determines the task is complete."
        },
        {
          title: "The OTAR Framework",
          description: "OBSERVE: Perceive the environment, gather context, understand the user's goal. THINK: Reason about the task, formulate a plan, decide on approach. ACT: Execute the plan—call tools, generate outputs, modify state. REFLECT: Evaluate the result, assess quality, decide if iteration is needed."
        },
        {
          title: "Context Is Everything",
          description: "Agents adapt their behavior based on domain context, available tools, and accumulated knowledge. The same agent architecture can serve vastly different purposes when given different context windows and tool access."
        },
        {
          title: "Self-Reflection Enables Improvement",
          description: "Unlike static models, agentic systems can evaluate their own outputs and decide to iterate. This self-correction capability is what enables agents to handle complex, multi-step tasks that single-shot prompting cannot."
        }
      ],

      codeExample: {
        language: "python",
        title: "Basic Agent Loop Implementation",
        code: `async def run_agent(user_input: str, context: dict) -> dict:
    """The fundamental agent loop pattern."""
    steps = []
    max_iterations = 5

    for iteration in range(max_iterations):
        # 1. OBSERVE: Gather context and perceive state
        observation = observe(user_input, context, steps)
        steps.append({"phase": "OBSERVE", "content": observation})

        # 2. THINK: Reason about what to do next
        plan = await think(observation, context)
        steps.append({"phase": "THINK", "content": plan})

        # 3. ACT: Execute the plan
        result = await act(plan, context)
        steps.append({"phase": "ACT", "content": result})

        # 4. REFLECT: Evaluate if we're done
        reflection = await reflect(result, user_input)
        steps.append({"phase": "REFLECT", "content": reflection})

        if reflection["is_complete"]:
            break

    return {"steps": steps, "result": result}`
      },

      diagram: {
        type: "flow",
        title: "The Agent Loop",
        ascii: `
    ┌─────────────────────────────────────────────────────────┐
    │                    USER INPUT                           │
    └───────────────────────┬─────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────────────┐
    │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
    │  │ OBSERVE │───▶│  THINK  │───▶│   ACT   │───▶│ REFLECT │ │
    │  └─────────┘    └─────────┘    └─────────┘    └────┬────┘ │
    │       ▲                                            │      │
    │       │              ITERATE IF NEEDED             │      │
    │       └────────────────────────────────────────────┘      │
    │                     AGENT LOOP                            │
    └───────────────────────────────────────────────────────────┘
                            │
                            ▼ (when complete)
    ┌─────────────────────────────────────────────────────────┐
    │                    FINAL OUTPUT                         │
    └─────────────────────────────────────────────────────────┘`
      },

      keyTakeaways: [
        "Agentic AI moves beyond single prompt-response to iterative reasoning loops",
        "The OBSERVE-THINK-ACT-REFLECT pattern is the foundation of all agent architectures",
        "Self-reflection enables agents to self-correct and improve their outputs",
        "Context and tool access determine what an agent can perceive and accomplish"
      ],

      resources: [
        { title: "AI Agentic Design Patterns with AutoGen", url: "https://learn.deeplearning.ai/courses/ai-agentic-design-patterns-with-autogen", type: "course" },
        { title: "Building Agentic RAG with LlamaIndex", url: "https://learn.deeplearning.ai/courses/building-agentic-rag-with-llamaindex", type: "course" },
        { title: "Anthropic's Building Effective Agents", url: "https://www.anthropic.com/research/building-effective-agents", type: "article" },
        { title: "LangChain: What is an Agent?", url: "https://python.langchain.com/docs/concepts/agents/", type: "docs" }
      ],
      localResources: [
        {
          id: "autogen-notes",
          title: "AutoGen Course Notes",
          description: "Comprehensive notes from the DeepLearning.AI AutoGen course covering all 6 lessons",
          filePath: "data/day-1/01-resource-autogen.md",
          type: "notes",
          estimatedTime: "45 min read"
        }
      ]
    },
    learn: {
      overview: {
        summary: "Master the fundamental OBSERVE-THINK-ACT-REFLECT loop that powers all autonomous AI agents.",
        fullDescription: `When you interact with ChatGPT or Claude in a typical conversation, you're experiencing what we might call "reactive AI"—you send a message, and the model responds. This works well for simple questions and content generation, but it fundamentally limits what AI can accomplish. The model has no ability to check its work, use external tools, or iterate toward a better solution. It simply generates one response and waits for you to tell it what to do next.

**Agentic AI changes this paradigm entirely.** Instead of a single prompt-response exchange, an agent operates in a continuous loop. It perceives its environment, reasons about what to do, takes action, and then—critically—reflects on the outcome to decide if more work is needed. This loop continues autonomously until the task is complete or the agent determines it cannot proceed further.

Consider a practical example: suppose you ask an AI to "research the latest developments in quantum computing and write a summary." A traditional chatbot would generate a response based solely on its training data, which might be months or years out of date. An agentic system, by contrast, would recognize that it needs current information, decide to search the web, read several recent articles, synthesize the findings, evaluate whether the summary is comprehensive enough, and potentially iterate by searching for additional sources if gaps remain.

This distinction matters because real-world tasks are rarely solvable in a single step. They require gathering information, making decisions, taking actions that change the state of the world, and adapting based on results. The **OBSERVE → THINK → ACT → REFLECT** loop (sometimes called the OTAR pattern) provides the architectural foundation that enables this kind of autonomous, iterative behavior.

Throughout this lesson, we'll break down each phase of this loop, understand why each component is essential, and see how they work together to create systems that can genuinely accomplish complex goals. By the end, you'll have both the conceptual understanding and the practical code patterns needed to build your first agent from scratch—without relying on any framework.`,
        prerequisites: ["Basic Python programming", "Familiarity with LLM APIs (OpenAI, Anthropic, etc.)", "Understanding of prompts and completions"],
        estimatedTime: "2-3 hours",
        difficulty: "beginner"
      },
      concepts: [
        {
          title: "Why Agents Must Be Loops",
          description: `The most fundamental insight in agentic AI is deceptively simple: **agents are loops, not single function calls**. This distinction sounds minor but has profound implications for what AI systems can accomplish.

When you call an LLM API in the traditional way, you send a prompt and receive a completion. The model has exactly one chance to get it right. If the response is incomplete, incorrect, or needs refinement, the model has no way to know this—it has already finished its work. Any iteration must come from you, the human, prompting again.

An agent inverts this dynamic. Instead of generating one response, the agent enters a loop that might execute dozens of times before completing. In each iteration, it observes the current state (including any previous attempts), thinks about what to do next, takes an action, and reflects on whether that action moved it closer to the goal.

This looping structure enables several capabilities that are impossible with single-shot prompting. First, the agent can **break complex tasks into steps**, handling each one sequentially rather than trying to solve everything at once. Second, it can **use tools**—calling APIs, searching databases, or executing code—and incorporate the results into its reasoning. Third, it can **self-correct**, catching its own mistakes and trying alternative approaches.

The loop also introduces a crucial element of **state management**. Unlike a stateless API call, an agent maintains context across iterations. It remembers what it has already tried, what information it has gathered, and how close it is to completing the task. This persistent state is what allows agents to tackle problems that unfold over multiple steps.

However, loops also introduce risks. An agent without proper termination conditions might loop forever, consuming API credits and never producing a result. Every agent implementation must include clear stopping criteria: a maximum iteration count, a confidence threshold, or explicit goal-completion detection.`
        },
        {
          title: "OBSERVE: Perceiving the Environment",
          description: `The OBSERVE phase is where the agent gathers all the information it needs to make decisions. This might sound simple—just read the user's input, right?—but effective observation is more nuanced than it first appears.

At minimum, observation includes the user's original request. But a sophisticated agent observes much more: the current state of any ongoing work, results from previous actions, available tools and their capabilities, relevant context from memory or external sources, and constraints like time limits or resource budgets.

Think of observation like a doctor beginning a patient consultation. The doctor doesn't just listen to the patient's chief complaint—they also review medical history, check vital signs, consider the patient's age and lifestyle, and note what treatments have been tried before. All of this contextual information shapes the diagnosis and treatment plan.

For an agent, the OBSERVE phase might involve:

**Parsing the user request** to understand intent, extract parameters, and identify ambiguities. What exactly is being asked? Are there implicit requirements not stated explicitly?

**Checking current state** to understand what has already been accomplished. If this is iteration 3 of the loop, what did iterations 1 and 2 produce? What's still missing?

**Surveying available tools** to understand what actions are possible. Can the agent search the web? Execute code? Send emails? The set of available tools fundamentally shapes what the agent can accomplish.

**Gathering external context** from memory systems, databases, or APIs that provide relevant background information.

The output of OBSERVE is a structured representation of "everything the agent knows right now." This becomes the input to the THINK phase. The quality of observation directly determines the quality of reasoning—an agent that fails to notice important context will make poor decisions, just as a doctor who skips the medical history might miss a critical diagnosis.`
        },
        {
          title: "THINK: Reasoning and Planning",
          description: `The THINK phase is where the agent decides what to do next. Given everything observed, what action should be taken? This is the phase where the LLM's reasoning capabilities are most directly engaged.

Effective thinking in agents typically involves several sub-steps, though these may be combined in a single prompt. The agent must **analyze the situation**: What is the current state? What is the goal? What's the gap between them? Then it must **consider options**: What actions could potentially close that gap? What are the tradeoffs between different approaches? Finally, it must **commit to a plan**: Which specific action will be taken next, and why?

This last point deserves emphasis: the output of THINK is not just a vague intention but a **concrete, executable plan**. If the agent decides to search the web, the THINK phase should specify exactly what query to use. If it decides to write code, it should outline what the code needs to accomplish. Vague plans lead to vague actions.

One powerful pattern in the THINK phase is **chain-of-thought reasoning**, where the agent explicitly articulates its reasoning process before reaching a conclusion. Research has shown that LLMs perform better on complex tasks when they "show their work" rather than jumping directly to an answer. For agents, this might look like:

"The user asked for a summary of recent quantum computing developments. I don't have access to information past my training date. I should use the web search tool to find recent news. I'll search for 'quantum computing breakthroughs 2024' to get current developments. After gathering several sources, I'll synthesize a summary."

This explicit reasoning serves two purposes: it improves the quality of the agent's decisions, and it creates a transparent record of why the agent chose each action—invaluable for debugging and building trust.

The THINK phase can also include **planning multiple steps ahead**, not just the immediate next action. Some tasks benefit from sketching out a full plan before beginning execution. However, there's a tradeoff: detailed upfront plans may become obsolete as new information emerges. Many agents use a hybrid approach, planning a few steps ahead but remaining flexible.`
        },
        {
          title: "ACT: Executing the Plan",
          description: `The ACT phase is where plans become reality. The agent takes the concrete action it decided upon in the THINK phase and executes it. This might involve calling an external API, generating content, modifying a database, or any other operation that changes the state of the world.

Action execution might seem straightforward—just do what the plan said—but there are important considerations. First, **actions have consequences**. Unlike the OBSERVE and THINK phases, which only read and reason, the ACT phase actually changes things. A buggy observation might lead to confused reasoning, but a buggy action might send an email to the wrong person or delete important data. This is why many agent systems implement human-in-the-loop controls for high-stakes actions.

Second, **actions produce results** that feed back into the next iteration. When an agent searches the web, it receives search results. When it executes code, it receives output or error messages. These results become part of what the agent observes in the next OBSERVE phase. The action-result loop is what allows agents to actually interact with the world rather than just reasoning about it.

Third, **tool use is the primary form of action** for most agents. The LLM itself can only generate text—it cannot browse the web, send messages, or modify files directly. Instead, it generates text that specifies which tool to call and with what parameters. The agent framework then executes the tool and returns the result to the LLM.

This leads to an important architectural pattern: **the tool specification**. Each tool available to the agent must be clearly defined with its name, description, required parameters, and return type. The agent uses these specifications to understand what actions are possible and how to invoke them correctly. Well-written tool descriptions are crucial—they're essentially documentation that the LLM reads to understand how to use each capability.

Finally, actions must handle **errors gracefully**. External APIs might be down, code might throw exceptions, and searches might return no results. The ACT phase should catch these failures and report them clearly so the REFLECT phase can decide how to recover.`
        },
        {
          title: "REFLECT: Evaluation and Iteration",
          description: `The REFLECT phase is what separates true agents from simple automation. After taking an action and observing its results, the agent pauses to evaluate: Did that work? Am I closer to the goal? Should I continue, try something different, or stop?

This self-evaluation capability is profound. Traditional software either succeeds or fails—there's no middle ground where the program assesses its own output quality. But agents can look at what they've produced and make judgments. "This summary is good but missing recent developments. I should search for more sources." "The code runs but doesn't handle edge cases. I should add error handling." "The user asked for three recommendations and I only provided two. I need to continue."

Effective reflection requires clear **success criteria**. What does "done" look like for this task? Sometimes this is explicit in the user's request: "Find five restaurants" has a clear completion condition. Other times it's implicit and the agent must infer reasonable standards: a "comprehensive summary" should probably cover the major themes and cite specific sources.

The REFLECT phase typically answers several questions:

**Completeness**: Does the result fully address what was asked? Are there missing elements or unanswered sub-questions?

**Quality**: Is the output good enough? For generated content, is it clear and accurate? For code, does it run correctly and handle edge cases?

**Confidence**: How certain is the agent that the result is correct? Low confidence might trigger additional verification.

**Next steps**: Should the agent iterate, try a different approach, ask for clarification, or declare completion?

The reflection mechanism enables **self-improvement within a single task**. Unlike fine-tuning or learning from human feedback, which improve the model over many interactions, reflection allows an agent to improve its output within one conversation by critiquing and revising its own work.

One subtle but important point: reflection should be **honest and calibrated**. An agent that always reports high confidence, even when results are poor, provides no value. The reflection phase must be designed to genuinely evaluate quality, which sometimes means using separate prompts or even separate models to avoid self-serving bias.`
        },
        {
          title: "Context: The Fuel That Powers Agents",
          description: `Everything an agent does depends on context—the information available in its working memory at any given moment. Understanding context management is essential for building effective agents.

Context includes several types of information. **The user's request** is the most obvious: what does the user want to accomplish? But context also includes **conversation history** (what has been said before), **system instructions** (how the agent should behave), **tool definitions** (what capabilities are available), **retrieved information** (data pulled from external sources), and **working state** (what the agent has accomplished so far in this task).

All of this information must fit within the LLM's **context window**—the maximum amount of text it can process at once. Context windows have grown dramatically (from 4K tokens to 100K+ in recent models), but they remain finite. An agent working on a complex task might accumulate more information than can fit in context, requiring strategies like summarization, selective retrieval, or hierarchical memory.

Context shapes agent behavior in subtle but important ways. Consider how tool descriptions work: by including a description like "search_web(query: str) - Search the internet for current information," you're not giving the agent a new capability—you're telling it that this capability exists and how to invoke it. The same agent with different tool descriptions would behave completely differently.

This observation leads to a powerful insight: **much of agent behavior is configured through context, not code**. You can dramatically change what an agent does by modifying its system prompt, adding or removing tool definitions, or changing what information it retrieves. This makes agents highly flexible but also requires careful attention to prompt engineering and context construction.

One common pitfall is **context pollution**—including so much information that the agent becomes confused or overlooks important details. Just as a human given a thousand-page document might miss key points, an LLM with too much context may fail to focus on what matters. Effective context management means including relevant information while filtering out noise.`
        }
      ],
      codeExamples: [
        {
          title: "Basic Agent Loop",
          language: "python",
          category: "basic",
          code: `async def run_agent(user_input: str, context: dict) -> dict:
    """The fundamental agent loop pattern."""
    steps = []
    max_iterations = 5

    for iteration in range(max_iterations):
        # 1. OBSERVE: Gather context and perceive state
        observation = observe(user_input, context, steps)
        steps.append({"phase": "OBSERVE", "content": observation})

        # 2. THINK: Reason about what to do next
        plan = await think(observation, context)
        steps.append({"phase": "THINK", "content": plan})

        # 3. ACT: Execute the plan
        result = await act(plan, context)
        steps.append({"phase": "ACT", "content": result})

        # 4. REFLECT: Evaluate if we're done
        reflection = await reflect(result, user_input)
        steps.append({"phase": "REFLECT", "content": reflection})

        if reflection["is_complete"]:
            break

    return {"steps": steps, "result": result}`,
          explanation: "This code shows the core OTAR loop. Each phase is explicit and logged, making the agent's reasoning transparent and debuggable."
        },
        {
          title: "REFLECT Phase Implementation",
          language: "python",
          category: "intermediate",
          code: `async def reflect(result: str, original_goal: str) -> dict:
    """Evaluate if the agent achieved its goal."""
    prompt = f"""Evaluate this result against the original goal.

Goal: {original_goal}
Result: {result}

Answer these questions:
1. Does this fully address the user's request? (yes/no)
2. Is the quality acceptable? (yes/no)
3. What could be improved?

Return JSON: {{"is_complete": bool, "quality_score": 1-10, "improvements": []}}"""

    response = await llm.complete(prompt)
    return json.loads(response)`,
          explanation: "The REFLECT phase is what makes agents self-improving. This implementation asks the LLM to evaluate its own work."
        }
      ],
      diagrams: [
        {
          title: "The Agent Loop",
          type: "ascii",
          content: `
    ┌─────────────────────────────────────────────────────────┐
    │                    USER INPUT                           │
    └───────────────────────┬─────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────────────┐
    │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
    │  │ OBSERVE │───▶│  THINK  │───▶│   ACT   │───▶│ REFLECT │ │
    │  └─────────┘    └─────────┘    └─────────┘    └────┬────┘ │
    │       ▲                                            │      │
    │       │              ITERATE IF NEEDED             │      │
    │       └────────────────────────────────────────────┘      │
    │                     AGENT LOOP                            │
    └───────────────────────────────────────────────────────────┘
                            │
                            ▼ (when complete)
    ┌─────────────────────────────────────────────────────────┐
    │                    FINAL OUTPUT                         │
    └─────────────────────────────────────────────────────────┘`,
          caption: "The fundamental OBSERVE-THINK-ACT-REFLECT cycle that powers all AI agents"
        }
      ],
      exercises: [
        {
          title: "Implement a Simple Research Agent",
          objective: "Build an agent that can research a topic by searching, reading, and synthesizing information",
          steps: [
            "Define the OBSERVE function to parse user queries and track research state",
            "Implement THINK to decide: search more, read a result, or synthesize findings",
            "Create ACT to execute the chosen action (mock the search API)",
            "Build REFLECT to evaluate if enough information has been gathered",
            "Run the loop with max 5 iterations"
          ],
          hints: [
            "Start with hardcoded 'search results' before adding a real API",
            "Track what's been searched/read in the context dict",
            "Use structured output (JSON) for the THINK phase decisions"
          ],
          solution: `# See the Day 1 demo app for a complete implementation`
        },
        {
          title: "Add Conversation Memory",
          objective: "Extend the basic agent loop to remember previous interactions",
          steps: [
            "Create a memory store (list or dict) to track conversation history",
            "Modify OBSERVE to include relevant past context",
            "Update THINK to consider what was discussed before",
            "Test with a multi-turn conversation"
          ],
          hints: [
            "Keep recent messages, summarize older ones to save context space",
            "Consider using a sliding window of the last N interactions"
          ]
        }
      ],
      keyTakeaways: [
        "Agentic AI moves beyond single prompt-response to iterative reasoning loops",
        "The OBSERVE-THINK-ACT-REFLECT pattern is the foundation of all agent architectures",
        "Self-reflection enables agents to self-correct and improve their outputs",
        "Context and tool access determine what an agent can perceive and accomplish",
        "Always set iteration limits to prevent runaway agents"
      ],
      resources: [
        { title: "AI Agentic Design Patterns with AutoGen", url: "https://learn.deeplearning.ai/courses/ai-agentic-design-patterns-with-autogen", type: "course", duration: "1h", difficulty: "beginner", description: "DeepLearning.AI course covering core agentic patterns" },
        { title: "Building Agentic RAG with LlamaIndex", url: "https://learn.deeplearning.ai/courses/building-agentic-rag-with-llamaindex", type: "course", duration: "1h", difficulty: "intermediate", description: "Learn to build agents that retrieve and reason over documents" },
        { title: "Anthropic's Building Effective Agents", url: "https://www.anthropic.com/research/building-effective-agents", type: "article", description: "Best practices and patterns from the Claude team" },
        { title: "LangChain: What is an Agent?", url: "https://python.langchain.com/docs/concepts/agents/", type: "docs", description: "LangChain's conceptual guide to agents" },
        { title: "ReAct Paper", url: "https://arxiv.org/abs/2210.03629", type: "paper", description: "The foundational research paper on reasoning + acting" }
      ],
      faq: [
        {
          question: "How is an agent different from a chatbot?",
          answer: "A chatbot typically responds to a single prompt with a single response. An agent, on the other hand, can take multiple actions, use tools, observe results, and iterate until it achieves a goal. Agents are autonomous—they decide what to do next rather than just responding."
        },
        {
          question: "When should I use an agent vs. a simple prompt?",
          answer: "Use an agent when: (1) the task requires multiple steps, (2) you need to use external tools or APIs, (3) the quality needs self-verification, or (4) the problem requires exploration and iteration. Use simple prompts for straightforward Q&A or content generation."
        },
        {
          question: "How do I prevent infinite loops?",
          answer: "Always set a max_iterations limit. Additionally, implement cost tracking, timeout mechanisms, and have your REFLECT phase explicitly check for 'stuck' states where no progress is being made."
        },
        {
          question: "What's the difference between THINK and ACT?",
          answer: "THINK is planning—deciding what to do and why. ACT is execution—actually doing it. Keep them separate for better observability and to allow the agent to plan multiple steps before executing."
        }
      ],
      applications: [
        {
          title: "Customer Support Agent",
          description: "An agent that observes customer queries, thinks about the best resolution path, acts by searching knowledge bases or escalating, and reflects on customer satisfaction."
        },
        {
          title: "Code Review Agent",
          description: "Observes code changes, thinks about potential issues and best practices, acts by providing feedback, and reflects on whether all concerns were addressed."
        },
        {
          title: "Research Assistant",
          description: "Observes research questions, thinks about search strategies, acts by querying databases and reading papers, and reflects on whether the research goal is met."
        }
      ],
      relatedDays: [3, 4, 5]
    }
  },
  { day: 2,  phase: 1, title: "Structured Outputs & Function Calling",          partner: "OpenAI / DeepLearning.AI",           tags: ["tool-use", "json", "schemas"],
    concept: "Forcing LLMs to return valid JSON schemas for reliable downstream processing" },
  { day: 3,  phase: 1, title: "Building an Agent from Scratch",                 partner: "DeepLearning.AI",                    tags: ["python", "llm", "fundamentals"],
    concept: "Implementing a basic agent loop with tool calling without frameworks" },
  { day: 4,  phase: 1, title: "The ReAct Pattern: Reasoning + Acting",          partner: "DeepLearning.AI",                    tags: ["react", "reasoning", "tool-use"],
    concept: "Interleaving reasoning traces with actions for explainable decision-making" },
  { day: 5,  phase: 1, title: "Reflection & Self-Improvement Patterns",         partner: "IBM / Coursera",                     tags: ["reflection", "reflexion", "self-eval"],
    concept: "Agents that critique and improve their own outputs iteratively" },
  // Phase 2: Agent Frameworks (Days 6-13)
  { day: 6,  phase: 2, title: "LangChain: Functions, Tools & Agents",           partner: "LangChain",                          tags: ["langchain", "tools", "chains"],
    concept: "Building composable chains with tool-augmented LLMs" },
  { day: 7,  phase: 2, title: "LangGraph: Stateful Agent Workflows",            partner: "LangChain",                          tags: ["langgraph", "state", "graphs"],
    concept: "Graph-based workflows with conditional branching and cycles" },
  { day: 8,  phase: 2, title: "LangGraph: Memory & Checkpoints",                partner: "LangChain",                          tags: ["memory", "persistence", "langgraph"],
    concept: "Persisting agent state across sessions with checkpointing" },
  { day: 9,  phase: 2, title: "CrewAI: Multi-Agent Systems",                    partner: "CrewAI",                             tags: ["crewai", "multi-agent", "roles"],
    concept: "Role-based agent teams that collaborate on complex tasks" },
  { day: 10, phase: 2, title: "CrewAI: Advanced (Tasks, Tools, Flows)",         partner: "CrewAI",                             tags: ["crewai", "orchestration", "flows"],
    concept: "Orchestrating multi-step workflows with task dependencies" },
  { day: 11, phase: 2, title: "AutoGen/AG2: Conversational Multi-Agent",        partner: "Microsoft / AG2",                    tags: ["autogen", "ag2", "conversations"],
    concept: "Agents that converse with each other to solve problems" },
  { day: 12, phase: 2, title: "OpenAI Agents SDK",                              partner: "OpenAI",                             tags: ["openai", "agents-sdk", "swarm"],
    concept: "OpenAI's native SDK for building production-ready agents" },
  { day: 13, phase: 2, title: "PydanticAI: Type-Safe Agents",                   partner: "Pydantic",                           tags: ["pydantic-ai", "type-safety", "validation"],
    concept: "Type-safe agent development with Pydantic validation" },
  // Phase 3: Agentic RAG & Memory (Days 14-18)
  { day: 14, phase: 3, title: "Vector Databases for Agents",                    partner: "Weaviate",                           tags: ["vectors", "embeddings", "retrieval"],
    concept: "Semantic search with embeddings for agent knowledge retrieval" },
  { day: 15, phase: 3, title: "Building Agentic RAG Systems",                   partner: "LlamaIndex",                         tags: ["agentic-rag", "llamaindex", "retrieval"],
    concept: "Agents that decide when and how to retrieve information" },
  { day: 16, phase: 3, title: "Long-Term Agent Memory",                         partner: "LangChain",                          tags: ["memory", "persistence", "checkpoints"],
    concept: "Persistent memory systems for agents across conversations" },
  { day: 17, phase: 3, title: "Knowledge Graphs for Agents",                    partner: "Neo4j",                              tags: ["neo4j", "graphrag", "knowledge-graphs"],
    concept: "Graph-based knowledge representation for complex reasoning" },
  { day: 18, phase: 3, title: "Semantic Caching for Agents",                    partner: "Redis",                              tags: ["redis", "caching", "performance"],
    concept: "Caching similar queries to reduce latency and costs" },
  // Phase 4: Protocols & Interoperability (Days 19-22)
  { day: 19, phase: 4, title: "MCP: Model Context Protocol Fundamentals",       partner: "Anthropic",                          tags: ["mcp", "tools", "resources"],
    concept: "Standardized protocol for connecting AI to external tools" },
  { day: 20, phase: 4, title: "MCP: Building Servers & Clients",                partner: "Anthropic / Hugging Face",           tags: ["mcp", "servers", "python"],
    concept: "Creating custom MCP servers to expose tools and resources" },
  { day: 21, phase: 4, title: "A2A: Agent-to-Agent Protocol",                   partner: "Google Cloud",                       tags: ["a2a", "multi-agent", "protocol"],
    concept: "Standardized communication between autonomous agents" },
  { day: 22, phase: 4, title: "ACP: Agent Communication Protocol",              partner: "IBM / BeeAI",                        tags: ["acp", "beeai", "interop"],
    concept: "IBM's protocol for agent interoperability and discovery" },
  // Phase 5: Specialized Agents (Days 23-27)
  { day: 23, phase: 5, title: "Browser Automation Agents",                      partner: "AGI Inc / Playwright",               tags: ["browser", "automation", "web-agents"],
    concept: "Agents that navigate and interact with web pages autonomously" },
  { day: 24, phase: 5, title: "Coding Agents & Sandboxed Execution",            partner: "E2B / Hugging Face",                 tags: ["code-gen", "e2b", "smolagents"],
    concept: "Agents that write, test, and execute code safely" },
  { day: 25, phase: 5, title: "Document AI: Agentic Extraction",                partner: "LandingAI",                          tags: ["ocr", "document-ai", "extraction"],
    concept: "Intelligent document processing with agentic reasoning" },
  { day: 26, phase: 5, title: "Voice Agents for Real-Time Apps",                partner: "LiveKit",                            tags: ["voice", "real-time", "livekit"],
    concept: "Real-time voice interaction with AI agents" },
  { day: 27, phase: 5, title: "Data Agents & SQL Generation",                   partner: "Snowflake",                          tags: ["data-agents", "sql", "analytics"],
    concept: "Natural language to SQL with agentic query planning" },
  // Phase 6: Production & Evaluation (Days 28-30)
  { day: 28, phase: 6, title: "Agent Observability (LangSmith & Phoenix)",      partner: "LangChain / Arize",                  tags: ["observability", "tracing", "debugging"],
    concept: "Tracing and debugging agent execution in production" },
  { day: 29, phase: 6, title: "Evaluating & Testing Agents",                    partner: "Arize / DeepLearning.AI",            tags: ["evaluation", "testing", "metrics"],
    concept: "Measuring agent performance with automated evaluation" },
  { day: 30, phase: 6, title: "Guardrails, Safety & Deployment",                partner: "Nvidia NeMo",                        tags: ["guardrails", "deployment", "production"],
    concept: "Safety constraints and production deployment patterns" },
];

// ══════════════════════════════════════════════════════════════
// JOURNAL STORAGE
// ══════════════════════════════════════════════════════════════

const STORAGE_KEY = "genai30_journal";

export function loadJournal(): Record<number, JournalEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveJournal(entries: Record<number, JournalEntry>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getEntry(day: number): JournalEntry | null {
  return loadJournal()[day] || null;
}

export function saveEntry(day: number, entry: Partial<JournalEntry>): void {
  const all = loadJournal();
  const wasCompleted = all[day]?.status === "completed";
  const isNowCompleted = entry.status === "completed";

  all[day] = { ...entry, day, updatedAt: new Date().toISOString() } as JournalEntry;
  saveJournal(all);

  // Record activity for gamification when completing an entry
  if (isNowCompleted && !wasCompleted) {
    recordActivity("journalEntry");
  }
}

export function deleteEntry(day: number): void {
  const all = loadJournal();
  delete all[day];
  saveJournal(all);
}

export function getAllEntries(): JournalEntry[] {
  const all = loadJournal();
  return Object.values(all).sort((a, b) => a.day - b.day);
}

export function getCompletedDays(): Set<number> {
  return new Set(getAllEntries().filter(e => e.status === "completed").map(e => e.day));
}

export function getInProgressDays(): Set<number> {
  return new Set(getAllEntries().filter(e => e.status === "in-progress").map(e => e.day));
}

// ══════════════════════════════════════════════════════════════
// BLOG SYSTEM
// ══════════════════════════════════════════════════════════════

const BLOG_STORAGE_KEY = "genai30_blog";

export function loadBlogData(): BlogData {
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { posts: {}, tags: [], metadata: {} };
  } catch {
    return { posts: {}, tags: [], metadata: {} };
  }
}

export function saveBlogData(data: BlogData): void {
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(data));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

export function generateExcerpt(body: string, maxLength = 160): string {
  const plain = body.replace(/[#*_`\[\]]/g, '').trim();
  return plain.length > maxLength
    ? plain.substring(0, maxLength).trim() + '...'
    : plain;
}

export function createBlogPost(post: {
  title: string;
  body: string;
  excerpt?: string;
  tags?: string[];
  linkedDay?: number | null;
  status?: 'draft' | 'published';
}): BlogPost {
  const data = loadBlogData();
  const id = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const slug = generateSlug(post.title);
  const now = new Date().toISOString();

  data.posts[id] = {
    id,
    slug,
    title: post.title,
    body: post.body,
    excerpt: post.excerpt || generateExcerpt(post.body),
    tags: post.tags || [],
    linkedDay: post.linkedDay || null,
    status: post.status || "draft",
    createdAt: now,
    updatedAt: now,
    publishedAt: post.status === "published" ? now : null
  };

  // Update tags list
  (post.tags || []).forEach(tag => {
    if (!data.tags.includes(tag)) data.tags.push(tag);
  });

  saveBlogData(data);
  if (post.status === "published") {
    recordActivity("blogPost");
  }
  return data.posts[id];
}

export function updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
  const data = loadBlogData();
  if (!data.posts[id]) return null;

  const wasPublished = data.posts[id].status === "published";
  data.posts[id] = {
    ...data.posts[id],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Regenerate excerpt if body changed
  if (updates.body && !updates.excerpt) {
    data.posts[id].excerpt = generateExcerpt(updates.body);
  }

  // Regenerate slug if title changed
  if (updates.title) {
    data.posts[id].slug = generateSlug(updates.title);
  }

  // Set publishedAt if transitioning to published
  if (!wasPublished && updates.status === "published") {
    data.posts[id].publishedAt = new Date().toISOString();
    recordActivity("blogPost");
  }

  // Update tags list
  if (updates.tags) {
    updates.tags.forEach(tag => {
      if (!data.tags.includes(tag)) data.tags.push(tag);
    });
  }

  saveBlogData(data);
  return data.posts[id];
}

export function deleteBlogPost(id: string): void {
  const data = loadBlogData();
  delete data.posts[id];
  saveBlogData(data);
}

export function getBlogPost(id: string): BlogPost | null {
  return loadBlogData().posts[id] || null;
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = Object.values(loadBlogData().posts);
  return posts.find(p => p.slug === slug) || null;
}

export function getAllBlogPosts(options: BlogFilterOptions = {}): BlogPost[] {
  const data = loadBlogData();
  let posts = Object.values(data.posts);

  // Filter by status
  if (options.status) {
    posts = posts.filter(p => p.status === options.status);
  }

  // Filter by tag
  if (options.tag) {
    const tag = options.tag;
    posts = posts.filter(p => p.tags.includes(tag));
  }

  // Filter by linked day
  if (options.linkedDay) {
    posts = posts.filter(p => p.linkedDay === options.linkedDay);
  }

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return posts;
}

export function getAllBlogTags(): string[] {
  return loadBlogData().tags;
}

// ══════════════════════════════════════════════════════════════
// MICRO-POSTS (Quick Updates on Journal Entries)
// ══════════════════════════════════════════════════════════════

export function saveMicroPost(day: number, content: string, mood: string | null = null): void {
  const all = loadJournal();
  if (!all[day]) {
    all[day] = { day, status: "pending", updatedAt: new Date().toISOString() };
  }

  all[day].microPost = {
    content,
    mood,
    createdAt: new Date().toISOString()
  };
  all[day].updatedAt = new Date().toISOString();

  saveJournal(all);
  recordActivity("microPost");
}

export function getMicroPost(day: number): MicroPost | null {
  const entry = getEntry(day);
  return entry?.microPost || null;
}

export function getAllMicroPosts(): (MicroPost & { day: number })[] {
  const entries = getAllEntries();
  return entries
    .filter(e => e.microPost)
    .map(e => ({ day: e.day, ...e.microPost! }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getDaysWithMicroPosts(): Set<number> {
  return new Set(getAllMicroPosts().map(mp => mp.day));
}

// ══════════════════════════════════════════════════════════════
// GAMIFICATION: Streaks & Achievements
// ══════════════════════════════════════════════════════════════

const GAMIFICATION_KEY = "genai30_gamification";

export const ACHIEVEMENTS: Achievement[] = [
  // Milestones
  { id: "first-entry", name: "First Steps", description: "Write your first journal entry", icon: "rocket", category: "milestones" },
  { id: "first-blog", name: "Blogger", description: "Publish your first blog post", icon: "pencil", category: "milestones" },
  { id: "five-entries", name: "Getting Started", description: "Complete 5 journal entries", icon: "star", category: "milestones" },

  // Streaks
  { id: "week-warrior", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "flame", category: "streaks" },
  { id: "fortnight-focus", name: "Fortnight Focus", description: "Maintain a 14-day streak", icon: "fire", category: "streaks" },
  { id: "three-week-trek", name: "Three Week Trek", description: "Maintain a 21-day streak", icon: "mountain", category: "streaks" },

  // Completion
  { id: "halfway-there", name: "Halfway There", description: "Complete 15 days", icon: "flag", category: "completion" },
  { id: "completionist", name: "Completionist", description: "Complete all 30 days", icon: "trophy", category: "completion" },

  // Content
  { id: "prolific-writer", name: "Prolific Writer", description: "Write 5,000+ words total", icon: "book", category: "content" },
  { id: "thought-leader", name: "Thought Leader", description: "Publish 5 blog posts", icon: "lightbulb", category: "content" },
];

export function loadGamificationData(): GamificationData {
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    return raw ? JSON.parse(raw) : getDefaultGamificationData();
  } catch {
    return getDefaultGamificationData();
  }
}

function getDefaultGamificationData(): GamificationData {
  return {
    streak: { current: 0, longest: 0, lastActivityDate: null, startDate: null },
    activityLog: {},
    achievements: {},
    stats: { totalEntries: 0, totalBlogPosts: 0, totalMicroPosts: 0, totalWords: 0 }
  };
}

export function saveGamificationData(data: GamificationData): void {
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
}

function getYesterday(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function updateStreak(data: GamificationData, today: string): void {
  const yesterday = getYesterday(today);

  if (!data.streak.lastActivityDate) {
    // First ever activity
    data.streak.current = 1;
    data.streak.longest = 1;
    data.streak.startDate = today;
  } else if (data.streak.lastActivityDate === today) {
    // Already recorded today, no change
    return;
  } else if (data.streak.lastActivityDate === yesterday) {
    // Consecutive day - extend streak
    data.streak.current += 1;
    if (data.streak.current > data.streak.longest) {
      data.streak.longest = data.streak.current;
    }
  } else {
    // Streak broken - reset
    data.streak.current = 1;
    data.streak.startDate = today;
  }

  data.streak.lastActivityDate = today;
}

function recalculateStats(data: GamificationData): void {
  const entries = getAllEntries();
  const blogPosts = getAllBlogPosts({ status: "published" });

  data.stats.totalEntries = entries.filter(e => e.status === "completed").length;
  data.stats.totalBlogPosts = blogPosts.length;
  data.stats.totalMicroPosts = entries.filter(e => e.microPost).length;
  data.stats.totalWords = entries.reduce((sum, e) =>
    sum + ((e.body || "").split(/\s+/).filter(Boolean).length), 0
  ) + blogPosts.reduce((sum, p) =>
    sum + (p.body.split(/\s+/).filter(Boolean).length), 0
  );
}

function checkAchievements(data: GamificationData): void {
  const stats = data.stats;
  const streak = data.streak;

  ACHIEVEMENTS.forEach(achievement => {
    if (data.achievements[achievement.id]?.unlockedAt) return; // Already unlocked

    let unlocked = false;

    switch (achievement.id) {
      case "first-entry":
        unlocked = stats.totalEntries >= 1;
        break;
      case "first-blog":
        unlocked = stats.totalBlogPosts >= 1;
        break;
      case "five-entries":
        unlocked = stats.totalEntries >= 5;
        break;
      case "week-warrior":
        unlocked = streak.current >= 7 || streak.longest >= 7;
        break;
      case "fortnight-focus":
        unlocked = streak.current >= 14 || streak.longest >= 14;
        break;
      case "three-week-trek":
        unlocked = streak.current >= 21 || streak.longest >= 21;
        break;
      case "halfway-there":
        unlocked = stats.totalEntries >= 15;
        break;
      case "completionist":
        unlocked = stats.totalEntries >= 30;
        break;
      case "prolific-writer":
        unlocked = stats.totalWords >= 5000;
        break;
      case "thought-leader":
        unlocked = stats.totalBlogPosts >= 5;
        break;
    }

    if (unlocked) {
      data.achievements[achievement.id] = {
        ...achievement,
        unlockedAt: new Date().toISOString()
      };
    }
  });
}

export function recordActivity(type: "journalEntry" | "blogPost" | "microPost" | "resourceCompleted" | "sectionCompleted"): void {
  const data = loadGamificationData();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Initialize today's activity if needed
  if (!data.activityLog[today]) {
    data.activityLog[today] = { journalEntry: false, blogPost: false, microPost: false };
  }

  // Record the specific activity type
  if (type === "journalEntry") data.activityLog[today].journalEntry = true;
  if (type === "blogPost") data.activityLog[today].blogPost = true;
  if (type === "microPost") data.activityLog[today].microPost = true;

  // Update streak
  updateStreak(data, today);

  // Update stats
  recalculateStats(data);

  // Check for new achievements
  checkAchievements(data);

  saveGamificationData(data);
}

export function getStreak(): Streak {
  return loadGamificationData().streak;
}

export function getActivityLog(): Record<string, DayActivity> {
  return loadGamificationData().activityLog;
}

export function getAchievements(): (Achievement & { unlocked: boolean; unlockedAt: string | null })[] {
  const data = loadGamificationData();
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: !!data.achievements[a.id]?.unlockedAt,
    unlockedAt: data.achievements[a.id]?.unlockedAt || null
  }));
}

export function getGamificationStats(): GamificationStats {
  return loadGamificationData().stats;
}

export function isStreakAtRisk(): boolean {
  const data = loadGamificationData();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = getYesterday(today);

  return data.streak.current > 0 &&
         data.streak.lastActivityDate === yesterday &&
         !data.activityLog[today];
}

export function getNewlyUnlockedAchievements(): Achievement[] {
  // Returns achievements unlocked in the last check (useful for notifications)
  const data = loadGamificationData();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  return ACHIEVEMENTS.filter(a => {
    const unlocked = data.achievements[a.id];
    return unlocked && unlocked.unlockedAt > fiveMinutesAgo;
  });
}

// ═══════════════════════════════════════════════════════════════
// READING PROGRESS TRACKING
// ═══════════════════════════════════════════════════════════════

const READING_PROGRESS_KEY = "genai30_reading_progress";

export function loadReadingProgress(): ReadingProgressData {
  try {
    const data = localStorage.getItem(READING_PROGRESS_KEY);
    return data ? JSON.parse(data) : { completed: {} };
  } catch (e) {
    console.error("Error loading reading progress:", e);
    return { completed: {} };
  }
}

export function saveReadingProgress(data: ReadingProgressData): void {
  try {
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving reading progress:", e);
  }
}

export function generateResourceId(day: number, resourceUrl: string): string {
  // Create a unique ID for each resource based on day and URL
  return `day${day}_${btoa(resourceUrl).slice(0, 20)}`;
}

export function toggleResourceCompletion(day: number, resourceUrl: string, resourceTitle: string): boolean {
  const data = loadReadingProgress();
  const resourceId = generateResourceId(day, resourceUrl);

  if (data.completed[resourceId]) {
    // Unmark as completed
    delete data.completed[resourceId];
  } else {
    // Mark as completed
    data.completed[resourceId] = {
      completedAt: new Date().toISOString(),
      title: resourceTitle,
      day: day
    };
    // Record activity for gamification
    recordActivity("resourceCompleted");
  }

  saveReadingProgress(data);
  return !data.completed[resourceId]; // Return whether it was just un-completed
}

export function isResourceCompleted(day: number, resourceUrl: string): boolean {
  const data = loadReadingProgress();
  const resourceId = generateResourceId(day, resourceUrl);
  return !!data.completed[resourceId];
}

// For local resources (markdown files in /data/day-N/)
export function toggleLocalResourceCompletion(day: number, resourceId: string, resourceTitle: string): boolean {
  const data = loadReadingProgress();
  const fullId = `local_${day}_${resourceId}`;

  if (data.completed[fullId]) {
    delete data.completed[fullId];
  } else {
    data.completed[fullId] = {
      completedAt: new Date().toISOString(),
      title: resourceTitle,
      resourceId: resourceId,
      isLocal: true,
      day: day
    };
    recordActivity("resourceCompleted");
  }

  saveReadingProgress(data);
  return !data.completed[fullId];
}

export function isLocalResourceCompleted(day: number, resourceId: string): boolean {
  const data = loadReadingProgress();
  const fullId = `local_${day}_${resourceId}`;
  return !!data.completed[fullId];
}

export function getCompletedLocalResourcesForDay(day: number): CompletedResource[] {
  const data = loadReadingProgress();
  return Object.entries(data.completed)
    .filter(([, info]) => info.day === day && info.isLocal === true)
    .map(([, info]) => info);
}

export function getCompletedResourcesForDay(day: number): CompletedResource[] {
  const data = loadReadingProgress();
  return Object.entries(data.completed)
    .filter(([, info]) => info.day === day)
    .map(([, info]) => info);
}

export function getAllCompletedResources(): (CompletedResource & { id: string })[] {
  const data = loadReadingProgress();
  return Object.entries(data.completed).map(([id, info]) => ({
    id,
    ...info
  }));
}

export function getReadingProgressStats(): {
  totalCompleted: number;
  byDay: Record<number, number>;
  recentlyCompleted: CompletedResource[];
} {
  const data = loadReadingProgress();
  const completed = Object.values(data.completed);
  const byDay: Record<number, number> = {};

  completed.forEach(r => {
    byDay[r.day] = (byDay[r.day] || 0) + 1;
  });

  return {
    totalCompleted: completed.length,
    byDay: byDay,
    recentlyCompleted: completed
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5)
  };
}

// ═══════════════════════════════════════════════════════════════
// SECTION PROGRESS TRACKING (Concepts, Exercises, Key Takeaways)
// ═══════════════════════════════════════════════════════════════

const SECTION_PROGRESS_KEY = "genai30_section_progress";

export function loadSectionProgress(): SectionProgressData {
  try {
    const data = localStorage.getItem(SECTION_PROGRESS_KEY);
    return data ? JSON.parse(data) : { items: {} };
  } catch (e) {
    console.error("Error loading section progress:", e);
    return { items: {} };
  }
}

export function saveSectionProgress(data: SectionProgressData): void {
  try {
    localStorage.setItem(SECTION_PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving section progress:", e);
  }
}

export function generateSectionItemId(day: number, type: string, index: number): string {
  // type: 'concept', 'exercise', 'takeaway', 'overview'
  return `day${day}_${type}_${index}`;
}

export function toggleSectionItem(day: number, type: SectionItem['type'], index: number, title = ''): boolean {
  const data = loadSectionProgress();
  const itemId = generateSectionItemId(day, type, index);

  if (data.items[itemId]) {
    delete data.items[itemId];
  } else {
    data.items[itemId] = {
      completedAt: new Date().toISOString(),
      day: day,
      type: type,
      index: index,
      title: title
    };
    // Record activity for gamification
    recordActivity("sectionCompleted");
  }

  saveSectionProgress(data);
  return !!data.items[itemId];
}

export function isSectionItemCompleted(day: number, type: string, index: number): boolean {
  const data = loadSectionProgress();
  const itemId = generateSectionItemId(day, type, index);
  return !!data.items[itemId];
}

export function getSectionProgressForDay(day: number, type: string | null = null): SectionItem[] {
  const data = loadSectionProgress();
  return Object.entries(data.items)
    .filter(([, info]) => info.day === day && (type === null || info.type === type))
    .map(([, info]) => info);
}

export function getSectionProgressCounts(day: number, type: string, total: number): SectionProgressCounts {
  const completed = getSectionProgressForDay(day, type).length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

export function getDayOverallProgress(day: number): DayOverallProgress {
  // Get all completed items for a day across all types
  const data = loadSectionProgress();
  const readingData = loadReadingProgress();

  const sectionItems = Object.values(data.items).filter(i => i.day === day);
  const resourceItems = Object.values(readingData.completed).filter(r => r.day === day);

  return {
    concepts: sectionItems.filter(i => i.type === 'concept').length,
    exercises: sectionItems.filter(i => i.type === 'exercise').length,
    takeaways: sectionItems.filter(i => i.type === 'takeaway').length,
    resources: resourceItems.length,
    total: sectionItems.length + resourceItems.length
  };
}

// ═══════════════════════════════════════════════════════════════
// LOCAL RESOURCES (Markdown files in /data/day-N/)
// ═══════════════════════════════════════════════════════════════

export function getLocalResourcesForDay(day: number): LocalResource[] {
  const dayData = DAYS.find(d => d.day === day);
  if (!dayData) return [];

  // Check both lesson.localResources and learn.localResources
  const lessonResources = dayData.lesson?.localResources || [];
  const learnResources = dayData.learn?.localResources || [];

  return [...lessonResources, ...learnResources];
}

export function getLocalResource(day: number, resourceId: string): LocalResource | null {
  const resources = getLocalResourcesForDay(day);
  return resources.find(r => r.id === resourceId) || null;
}

export async function fetchLocalResource(filePath: string): Promise<string | null> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching local resource:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// DAY COMPLETION TRACKING
// ═══════════════════════════════════════════════════════════════

const DAY_COMPLETION_KEY = "genai30_day_completions";

export function loadDayCompletions(): Record<number, DayCompletion> {
  try {
    const raw = localStorage.getItem(DAY_COMPLETION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDayCompletions(data: Record<number, DayCompletion>): void {
  localStorage.setItem(DAY_COMPLETION_KEY, JSON.stringify(data));
}

/**
 * Check if a day meets completion requirements:
 * - All local resources completed (reading materials)
 * - Has a blog post linked to this day
 * - Demo completed (if day has a demo)
 */
export function checkDayCompletionRequirements(day: number): DayCompletionCheck {
  const dayData = DAYS.find(d => d.day === day);
  if (!dayData) return { canComplete: false, requirements: [] };

  const requirements: DayCompletionRequirement[] = [];
  let allMet = true;

  // 1. Check local resources (study materials)
  const localResources = getLocalResourcesForDay(day);
  const completedLocalCount = localResources.filter(r => isLocalResourceCompleted(day, r.id)).length;
  const allLocalResourcesComplete = localResources.length === 0 ||
    completedLocalCount === localResources.length;

  if (localResources.length > 0) {
    requirements.push({
      label: "Study Materials",
      completed: allLocalResourcesComplete,
      count: `${completedLocalCount}/${localResources.length}`,
      required: true
    });

    if (!allLocalResourcesComplete) {
      allMet = false;
    }
  }

  // 2. External resources are optional (not required for completion)

  // 3. Check blog post linked to this day
  const blogPosts = getAllBlogPosts({ linkedDay: day, status: 'published' });
  const hasBlogPost = blogPosts.length > 0;

  requirements.push({
    label: "Blog Post",
    completed: hasBlogPost,
    count: hasBlogPost ? "1" : "0",
    required: true
  });

  if (!hasBlogPost) {
    allMet = false;
  }

  // 4. Check demo completion (only if day has a demo)
  const hasDemo = !!dayData.demoUrl;
  const demoCompleted = hasDemo ? isDemoCompleted(day) : true;

  if (hasDemo) {
    requirements.push({
      label: "Demo",
      completed: demoCompleted,
      count: demoCompleted ? "done" : "not done",
      required: true
    });

    if (!demoCompleted) {
      allMet = false;
    }
  }

  return {
    canComplete: allMet,
    requirements
  };
}

export function isDemoCompleted(day: number): boolean {
  const data = loadDayCompletions();
  return data[day]?.demoCompleted === true;
}

export function markDemoCompleted(day: number): void {
  const data = loadDayCompletions();
  if (!data[day]) {
    data[day] = {};
  }
  data[day].demoCompleted = true;
  data[day].demoCompletedAt = new Date().toISOString();
  saveDayCompletions(data);
}

export function markDayComplete(day: number): MarkDayCompleteResult {
  const { canComplete, requirements } = checkDayCompletionRequirements(day);

  if (!canComplete) {
    return {
      success: false,
      message: "Cannot complete day - requirements not met",
      requirements
    };
  }

  const data = loadDayCompletions();
  data[day] = {
    ...data[day],
    completed: true,
    completedAt: new Date().toISOString()
  };
  saveDayCompletions(data);

  // Also update journal entry status
  const entry = getEntry(day) || { body: "", status: "pending" as const };
  entry.status = "completed";
  saveEntry(day, entry);

  return {
    success: true,
    completedAt: data[day].completedAt
  };
}

export function getDayCompletion(day: number): DayCompletion | null {
  const data = loadDayCompletions();
  return data[day] || null;
}

export function isDayCompleted(day: number): boolean {
  const data = loadDayCompletions();
  return data[day]?.completed === true;
}

export function getCompletedDaysCount(): number {
  const data = loadDayCompletions();
  return Object.values(data).filter(d => d.completed).length;
}

// Reading completion with date tracking
const READING_KEY = "30days-reading-complete";

interface ReadingCompletion {
  completed: boolean;
  completedAt: string | null;
  blogPostId: string | null;
}

function loadReadingData(): Record<number, ReadingCompletion> {
  const raw = localStorage.getItem(READING_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveReadingData(data: Record<number, ReadingCompletion>): void {
  localStorage.setItem(READING_KEY, JSON.stringify(data));
}

export function isReadingComplete(day: number): boolean {
  return loadReadingData()[day]?.completed === true;
}

export function getReadingCompletion(day: number): ReadingCompletion | null {
  return loadReadingData()[day] || null;
}

export function getCompletedReadingsCount(): number {
  const data = loadReadingData();
  return Object.values(data).filter(r => r.completed).length;
}

export function getCompletedReadingDays(): Set<number> {
  const data = loadReadingData();
  const days = new Set<number>();
  for (const [day, completion] of Object.entries(data)) {
    if (completion.completed) {
      days.add(parseInt(day));
    }
  }
  return days;
}

export function toggleReadingComplete(day: number): boolean {
  const data = loadReadingData();
  const current = data[day] || { completed: false, completedAt: null, blogPostId: null };

  if (!current.completed) {
    // Marking as complete
    current.completed = true;
    current.completedAt = new Date().toISOString();
  } else {
    // Unmarking
    current.completed = false;
    current.completedAt = null;
  }

  data[day] = current;
  saveReadingData(data);
  return current.completed;
}

export function setReadingBlogPostId(day: number, blogPostId: string): void {
  const data = loadReadingData();
  if (data[day]) {
    data[day].blogPostId = blogPostId;
    saveReadingData(data);
  }
}

export function clearDayProgress(day: number): void {
  // Clear reading completion
  const readingData = loadReadingData();
  const blogPostId = readingData[day]?.blogPostId;
  delete readingData[day];
  saveReadingData(readingData);

  // Delete associated blog post if exists
  if (blogPostId) {
    deleteBlogPost(blogPostId);
  }
}

export function generateAutoLogEntry(day: number): BlogPost | null {
  const dayData = DAYS.find(d => d.day === day);
  if (!dayData) return null;

  const learn = dayData.learn;
  const phase = PHASES.find(p => p.id === dayData.phase);

  // Build a concise, colloquial "greatest hits" style entry
  let body = '';

  // One-liner hook
  if (learn?.overview?.summary) {
    body += `**TL;DR:** ${learn.overview.summary}\n\n`;
  }

  // Pick just the top 2-3 concepts as highlights
  if (learn?.concepts?.length) {
    body += `**Key insights:**\n`;
    const topConcepts = learn.concepts.slice(0, 3);
    topConcepts.forEach(c => {
      // Just the title, maybe first sentence of description
      const firstSentence = c.description.split('.')[0];
      body += `- **${c.title}** — ${firstSentence}.\n`;
    });
    body += '\n';
  }

  // Just the takeaways as bullet points (max 4)
  if (learn?.keyTakeaways?.length) {
    body += `**What stuck with me:**\n`;
    const topTakeaways = learn.keyTakeaways.slice(0, 4);
    topTakeaways.forEach(t => {
      body += `- ${t}\n`;
    });
  }

  // Create the blog post with a simpler title
  const title = `Day ${day}: ${dayData.title}`;
  const tags = [...(dayData.tags || [])].slice(0, 3); // max 3 tags

  const post = createBlogPost({
    title,
    body: body.trim() || `Finished Day ${day} — ${dayData.title}`,
    excerpt: learn?.overview?.summary?.slice(0, 120) + '...' || `Notes from Day ${day}`,
    tags,
    linkedDay: day,
    status: 'published'
  });

  // Link the blog post to the reading completion
  setReadingBlogPostId(day, post.id);

  return post;
}
