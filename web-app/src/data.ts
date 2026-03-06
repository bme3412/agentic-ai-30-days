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
        { title: "AI Agentic Design Patterns with AutoGen", url: "https://learn.deeplearning.ai/courses/ai-agentic-design-patterns-with-autogen", type: "course", summaryPath: "data/day-1/summary-autogen.md" },
        { title: "Building Agentic RAG with LlamaIndex", url: "https://learn.deeplearning.ai/courses/building-agentic-rag-with-llamaindex", type: "course", summaryPath: "data/day-1/summary-agentic-RAC-llamaindex.md" },
        { title: "Anthropic's Building Effective Agents", url: "https://www.anthropic.com/research/building-effective-agents", type: "article", summaryPath: "data/day-1/summary-anthropic-building-agents.md" },
        { title: "LangChain: What is an Agent?", url: "https://python.langchain.com/docs/concepts/agents/", type: "docs", summaryPath: "data/day-1/summary-langchain-agents.md" },
        { title: "ReAct Paper", url: "https://arxiv.org/abs/2210.03629", type: "paper", summaryPath: "data/day-1/summary-reAct-paper.md" }
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
        { title: "AI Agentic Design Patterns with AutoGen", url: "https://learn.deeplearning.ai/courses/ai-agentic-design-patterns-with-autogen", type: "course", duration: "1h", difficulty: "beginner", description: "DeepLearning.AI course covering core agentic patterns", summaryPath: "data/day-1/summary-autogen.md" },
        { title: "Building Agentic RAG with LlamaIndex", url: "https://learn.deeplearning.ai/courses/building-agentic-rag-with-llamaindex", type: "course", duration: "1h", difficulty: "intermediate", description: "Learn to build agents that retrieve and reason over documents", summaryPath: "data/day-1/summary-agentic-RAC-llamaindex.md" },
        { title: "Anthropic's Building Effective Agents", url: "https://www.anthropic.com/research/building-effective-agents", type: "article", description: "Best practices and patterns from the Claude team", summaryPath: "data/day-1/summary-anthropic-building-agents.md" },
        { title: "LangChain: What is an Agent?", url: "https://python.langchain.com/docs/concepts/agents/", type: "docs", description: "LangChain's conceptual guide to agents", summaryPath: "data/day-1/summary-langchain-agents.md" },
        { title: "ReAct Paper", url: "https://arxiv.org/abs/2210.03629", type: "paper", description: "The foundational research paper on reasoning + acting", summaryPath: "data/day-1/summary-reAct-paper.md" }
      ],
      localResources: [
        {
          id: "autogen-comprehensive-notes",
          title: "Comprehensive AutoGen Course Notes",
          description: "Detailed notes covering all lessons from the AutoGen course: conversable agents, sequential chats, reflection, nested chats, tool use, code execution, and group chats",
          filePath: "data/day-1/01-resource-autogen.md",
          type: "notes",
          estimatedTime: "30 min"
        }
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
    demoUrl: "demos/day-2/",
    concept: "Forcing LLMs to return valid JSON schemas for reliable downstream processing",
    lesson: {
      overview: `Structured outputs and function calling are the foundation of reliable AI systems. While LLMs naturally produce free-form text, production applications need predictable, parseable data structures. This lesson teaches you how to constrain LLM outputs to valid JSON schemas and enable models to call external functions—the core capability that transforms chatbots into agents.

**Why This Matters**: Without structured outputs, you're parsing free text with regex and hoping for the best. With them, you get guaranteed-valid JSON that your code can trust. Function calling takes this further—instead of just returning data, the model can express *intent to act*, which your application then executes.`,

      principles: [
        {
          title: "Structured Outputs Guarantee Valid JSON",
          description: "Traditional prompting asks the model to 'return JSON' but provides no guarantees—the model might return malformed JSON, add explanatory text, or deviate from your schema. Structured outputs use constrained decoding to ensure every response is valid JSON matching your exact schema. The model literally cannot produce invalid output."
        },
        {
          title: "Function Calling Separates Intent from Execution",
          description: "Function calling (also called tool use) lets the model express what it wants to do without actually doing it. The model returns a structured request like 'call get_weather with location=Paris', and your code decides whether to execute it. This separation is crucial for safety, logging, and control."
        },
        {
          title: "Schemas Are Documentation for the Model",
          description: "When you define a JSON schema or function signature, you're not just specifying types—you're teaching the model what each field means. Good descriptions in your schema dramatically improve output quality. Think of schemas as prompts in disguise."
        },
        {
          title: "Tools Enable the ACT Phase",
          description: "Remember the OBSERVE-THINK-ACT-REFLECT loop from Day 1? Function calling is how agents ACT. The model thinks about what to do, then expresses that decision as a function call. Your code executes the function and returns results for the next iteration."
        }
      ],

      codeExample: {
        language: "python",
        title: "Basic Function Calling with OpenAI",
        code: `from openai import OpenAI

client = OpenAI()

# Define the tools (functions) the model can call
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name, e.g. 'Paris' or 'New York'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# Call the model with tools available
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools,
    tool_choice="auto"  # Let model decide when to use tools
)

# Check if the model wants to call a function
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    print(f"Function: {tool_call.function.name}")
    print(f"Arguments: {tool_call.function.arguments}")
    # Output: Function: get_weather
    # Output: Arguments: {"location": "Paris", "unit": "celsius"}`
      },

      diagram: {
        type: "flow",
        title: "Function Calling Flow",
        ascii: `
    ┌─────────────────────────────────────────────────────────────┐
    │                     USER MESSAGE                            │
    │              "What's the weather in Paris?"                 │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                      LLM + TOOLS                            │
    │  ┌─────────────────────────────────────────────────────┐    │
    │  │  Available Tools:                                    │    │
    │  │  • get_weather(location, unit)                      │    │
    │  │  • search_web(query)                                │    │
    │  │  • send_email(to, subject, body)                    │    │
    │  └─────────────────────────────────────────────────────┘    │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   TOOL CALL (JSON)                          │
    │  {                                                          │
    │    "name": "get_weather",                                   │
    │    "arguments": {"location": "Paris", "unit": "celsius"}   │
    │  }                                                          │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                YOUR CODE EXECUTES TOOL                      │
    │         result = get_weather("Paris", "celsius")            │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │               TOOL RESULT → BACK TO LLM                     │
    │            {"temp": 18, "condition": "sunny"}               │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   FINAL RESPONSE                            │
    │     "It's currently 18°C and sunny in Paris!"              │
    └─────────────────────────────────────────────────────────────┘`
      },

      keyTakeaways: [
        "Structured outputs guarantee valid JSON—no more parsing failures or malformed responses",
        "Function calling lets models express intent to act, while you control execution",
        "Good schema descriptions are as important as good prompts—they guide the model",
        "Tools are how agents interact with the world: APIs, databases, file systems, and more",
        "Always validate tool arguments before execution—the model might hallucinate values"
      ],

      resources: [
        { title: "OpenAI Function Calling Guide", url: "https://platform.openai.com/docs/guides/function-calling", type: "docs", summaryPath: "data/day-2/summary-openai-function-calling.md" },
        { title: "OpenAI Structured Outputs", url: "https://platform.openai.com/docs/guides/structured-outputs", type: "docs", summaryPath: "data/day-2/summary-openai-structured-outputs.md" },
        { title: "Anthropic Tool Use", url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use", type: "docs", summaryPath: "data/day-2/summary-anthropic-tool-use.md" },
        { title: "Functions, Tools and Agents with LangChain", url: "https://learn.deeplearning.ai/courses/functions-tools-agents-langchain", type: "course", summaryPath: "data/day-2/summary-langchain-functions-tools.md" }
      ],
      localResources: [
        {
          id: "structured-outputs-guide",
          title: "Structured Outputs & Function Calling Guide",
          description: "Comprehensive guide covering OpenAI, Anthropic, Instructor library, JSON schemas, and best practices",
          filePath: "data/day-2/01-structured-outputs-function-calling.md",
          type: "notes",
          estimatedTime: "30 min read"
        }
      ]
    },
    learn: {
      overview: {
        summary: "Master structured outputs and function calling to build reliable AI systems that return predictable data and can take actions in the world.",
        fullDescription: `If Day 1 taught you that agents are loops, Day 2 teaches you how those agents actually *do* things. The secret is **function calling** (also called tool use)—the ability for an LLM to express "I want to call this function with these arguments" in a structured, parseable way.

But function calling is actually a specific case of a broader capability: **structured outputs**. Instead of hoping the model returns valid JSON, structured outputs *guarantee* it. The model is constrained during generation to only produce tokens that result in valid JSON matching your schema. No more regex parsing. No more "please return JSON" prompt engineering. Just reliable, typed data.

**Why does this matter for agents?**

Remember the OBSERVE-THINK-ACT-REFLECT loop from Day 1. The ACT phase is where function calling comes in. When the agent decides to take an action—search the web, query a database, send an email—it expresses that intent as a function call. Your code then executes the function safely, logs it, and returns the result for the agent to observe.

This lesson covers:
1. **JSON Mode vs Structured Outputs**: The difference between "try to return JSON" and "guaranteed valid JSON"
2. **Defining Schemas**: How to specify exactly what structure you need using JSON Schema or Pydantic
3. **Function Calling Mechanics**: How tools are defined, how the model selects them, and how to handle responses
4. **Multi-Tool Scenarios**: When the model needs to call multiple functions or chain them together
5. **Error Handling**: What happens when tool calls fail, and how to recover gracefully
6. **Provider Differences**: How OpenAI, Anthropic, and other providers implement these features

By the end, you'll be able to build AI systems that reliably extract structured data from text, call external APIs, and form the foundation of agentic applications.`,
        prerequisites: ["Basic Python programming", "Familiarity with LLM APIs (OpenAI, Anthropic)", "Understanding of JSON"],
        estimatedTime: "2-3 hours",
        difficulty: "beginner"
      },
      concepts: [
        {
          title: "The Problem: LLMs Output Text, Applications Need Structure",
          description: `Large language models generate text token by token. When you ask GPT-4 to "return a JSON object with name and age," it will usually comply—but there's no guarantee. The model might:

- Add explanatory text before or after the JSON
- Use slightly wrong syntax (trailing commas, unquoted keys)
- Omit required fields or add unexpected ones
- Return a valid JSON that doesn't match your expected schema

This creates a fundamental tension: **LLMs are probabilistic text generators, but applications need deterministic data structures.**

Consider a simple example. You prompt: "Extract the person's name and age from this text: 'John Smith is 34 years old.'"

The model might return any of these:
\`\`\`
{"name": "John Smith", "age": 34}              ← Perfect
{"name": "John Smith", "age": "34"}            ← Age is string, not int
Here's the extracted data: {"name": "John"}    ← Missing age, has preamble
{"person": {"name": "John Smith", "age": 34}}  ← Different structure
\`\`\`

Traditional approaches use prompt engineering ("You MUST return valid JSON with exactly these fields...") and hope for the best. This works most of the time, but "most of the time" isn't good enough for production systems.

**Structured outputs solve this completely.** Instead of asking nicely, you *constrain* the model to only generate valid tokens. The model literally cannot produce output that doesn't match your schema.`
        },
        {
          title: "JSON Mode: The First Step",
          description: `Before structured outputs existed, providers introduced "JSON mode"—a weaker guarantee that the model will output valid JSON (but not necessarily matching your schema).

With OpenAI, you enable JSON mode like this:
\`\`\`python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extract name and age as JSON"}],
    response_format={"type": "json_object"}
)
\`\`\`

JSON mode guarantees:
✅ The output will be valid JSON (parseable with json.loads)
✅ No text before or after the JSON

JSON mode does NOT guarantee:
❌ The JSON matches any particular schema
❌ Required fields are present
❌ Field types are correct

JSON mode is useful when you need valid JSON but have flexible requirements. For strict schemas, you need full structured outputs.

**Important caveat**: With JSON mode, you must mention "JSON" somewhere in your prompt, or the model may not comply. The instruction to output JSON still comes from the prompt—JSON mode just enforces validity.`
        },
        {
          title: "Structured Outputs: Guaranteed Schema Compliance",
          description: `Structured outputs (introduced by OpenAI in 2024) go further than JSON mode: they guarantee the output matches your exact schema. This uses a technique called **constrained decoding**—at each token generation step, the model is only allowed to produce tokens that keep the output valid according to your schema.

Here's how it works with OpenAI:
\`\`\`python
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    age: int
    email: str | None = None

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[{"role": "user", "content": "John is 34, john@email.com"}],
    response_format=Person
)

person = response.choices[0].message.parsed
print(person.name)  # "John"
print(person.age)   # 34 (guaranteed to be int!)
\`\`\`

Notice we pass a Pydantic model directly. The SDK converts it to JSON Schema, sends it to the API, and parses the response back into a typed Python object.

**What the schema controls**:
- **Types**: String, integer, boolean, array, object, null
- **Required fields**: Which fields must be present
- **Enums**: Restrict to specific allowed values
- **Nested objects**: Complex hierarchical structures
- **Arrays with typed items**: Lists of specific object types

**Limitations**:
- Maximum schema complexity (nesting depth, number of properties)
- Some JSON Schema features unsupported (patterns, conditionals)
- First request with a new schema has latency overhead (schema compilation)

The key insight: **structured outputs make the schema part of the generation process, not just a validation step afterward.** The model is guided token-by-token to produce valid output.`
        },
        {
          title: "Function Calling: Teaching Models to Use Tools",
          description: `Function calling (also called tool use) extends structured outputs to a specific use case: letting the model request that your code execute a function.

Instead of the model directly taking actions (which would be unsafe), it outputs a structured request:
\`\`\`json
{
  "name": "send_email",
  "arguments": {
    "to": "john@example.com",
    "subject": "Hello",
    "body": "Hi John, just checking in!"
  }
}
\`\`\`

Your code then decides whether to actually send the email. This separation of **intent** (what the model wants to do) from **execution** (what actually happens) is crucial for:

1. **Safety**: You can validate, filter, or reject dangerous actions
2. **Logging**: Every action is captured before execution
3. **Simulation**: Test agent behavior without real side effects
4. **Human-in-the-loop**: Require approval for sensitive actions

**How function calling works**:

1. **Define tools**: Describe available functions with name, description, and parameters
2. **Send message with tools**: The model sees what functions it can call
3. **Model responds**: Either with text OR with a tool call request
4. **Execute tool**: Your code runs the function and gets a result
5. **Send result back**: Add the tool result to the conversation
6. **Model continues**: Generate final response using the tool result

This is a multi-turn interaction. The model doesn't execute functions—it requests them, you execute, and then the model incorporates the results.`
        },
        {
          title: "Defining Tools: The Art of Good Descriptions",
          description: `The quality of your tool definitions directly impacts how well the model uses them. A tool definition has three parts:

**1. Name**: A clear, descriptive function name
\`\`\`
✅ "search_knowledge_base"
✅ "get_current_weather"
❌ "function1"
❌ "do_thing"
\`\`\`

**2. Description**: Explains when and why to use this tool
\`\`\`
✅ "Search the company knowledge base for information about products,
    policies, and procedures. Use this when the user asks about company-
    specific information that wouldn't be in your training data."

❌ "Searches stuff"
\`\`\`

**3. Parameters**: JSON Schema defining the arguments
\`\`\`python
{
    "type": "object",
    "properties": {
        "query": {
            "type": "string",
            "description": "Search query. Be specific and include relevant keywords."
        },
        "max_results": {
            "type": "integer",
            "description": "Maximum number of results to return (1-10)",
            "default": 5
        },
        "category": {
            "type": "string",
            "enum": ["products", "policies", "procedures", "all"],
            "description": "Filter results to a specific category"
        }
    },
    "required": ["query"]
}
\`\`\`

**Pro tips for tool definitions**:
- Descriptions should explain *when* to use the tool, not just *what* it does
- Include examples in descriptions when helpful
- Use enums to constrain choices when there are limited valid options
- Make parameter descriptions guide the model toward good inputs
- Consider what the model might get wrong and add clarifying text`
        },
        {
          title: "Tool Choice: Auto, Required, and Specific",
          description: `When you provide tools to the model, you can control how it decides whether to use them:

**tool_choice: "auto"** (default)
The model decides whether to call a tool or respond with text. Use this for conversational agents that should only use tools when relevant.
\`\`\`python
tool_choice="auto"  # Model decides
# User: "Hello!" → Text response
# User: "What's the weather?" → Tool call
\`\`\`

**tool_choice: "required"**
The model MUST call at least one tool. It cannot respond with just text. Use this when you're building a pipeline where a tool call is always expected.
\`\`\`python
tool_choice="required"  # Must call something
# User: "Hello!" → Still calls a tool (might be awkward)
\`\`\`

**tool_choice: {"type": "function", "function": {"name": "specific_tool"}}**
Force the model to call a specific tool. Use this when you know which tool should be called and just need the model to fill in arguments.
\`\`\`python
tool_choice={"type": "function", "function": {"name": "get_weather"}}
# Model MUST call get_weather, just decides on arguments
\`\`\`

**Parallel tool calls**:
Modern models can request multiple tool calls in a single response:
\`\`\`json
[
  {"name": "get_weather", "arguments": {"location": "Paris"}},
  {"name": "get_weather", "arguments": {"location": "London"}}
]
\`\`\`

Your code should handle arrays of tool calls and potentially execute them in parallel for efficiency.`
        },
        {
          title: "The Tool Call Conversation Pattern",
          description: `Function calling creates a specific conversation pattern. Understanding this pattern is essential for implementing agents.

**Step 1: User message + tools**
\`\`\`python
messages = [{"role": "user", "content": "What's the weather in Paris?"}]
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools
)
\`\`\`

**Step 2: Model requests tool call**
\`\`\`python
assistant_message = response.choices[0].message
# assistant_message.tool_calls = [
#   ToolCall(id="call_abc123", function=Function(name="get_weather", arguments='{"location": "Paris"}'))
# ]
\`\`\`

**Step 3: Add assistant message and tool result**
\`\`\`python
messages.append(assistant_message)  # Add the assistant's tool call request

# Execute the tool
weather_data = get_weather("Paris")

# Add the tool result
messages.append({
    "role": "tool",
    "tool_call_id": "call_abc123",  # Must match the tool call ID
    "content": json.dumps(weather_data)
})
\`\`\`

**Step 4: Get final response**
\`\`\`python
final_response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools  # Still provide tools in case more calls needed
)
# "The weather in Paris is 18°C and sunny."
\`\`\`

**Key points**:
- Tool results are messages with role="tool"
- Each result must include tool_call_id matching the request
- The model might request more tool calls after seeing results
- Continue the loop until the model responds with text (no tool calls)`
        },
        {
          title: "Handling Tool Execution Errors",
          description: `Tools will sometimes fail—APIs go down, inputs are invalid, permissions are denied. Your agent needs to handle these gracefully.

**Strategy 1: Return error as tool result**
\`\`\`python
try:
    result = execute_tool(name, arguments)
    tool_result = {"success": True, "data": result}
except Exception as e:
    tool_result = {"success": False, "error": str(e)}

messages.append({
    "role": "tool",
    "tool_call_id": tool_call.id,
    "content": json.dumps(tool_result)
})
\`\`\`

The model will see the error and can:
- Try a different approach
- Ask the user for clarification
- Explain what went wrong

**Strategy 2: Retry with modifications**
\`\`\`python
if "rate_limit" in str(error):
    time.sleep(60)
    result = execute_tool(name, arguments)  # Retry
elif "invalid_location" in str(error):
    # Let the model know so it can try different input
    tool_result = {"error": "Location not found. Try a different city name."}
\`\`\`

**Strategy 3: Graceful degradation**
\`\`\`python
try:
    weather = get_live_weather(location)
except APIError:
    weather = get_cached_weather(location)  # Fallback to cache
    weather["note"] = "Using cached data from 1 hour ago"
\`\`\`

**What NOT to do**:
- Don't silently swallow errors—the model needs to know what happened
- Don't crash the entire agent on tool failure
- Don't retry infinitely without backoff`
        },
        {
          title: "Provider Differences: OpenAI vs Anthropic vs Others",
          description: `While the concepts are similar, each provider implements function calling slightly differently.

**OpenAI**:
- Uses "tools" array with "function" type
- Tool results have role="tool" with tool_call_id
- Supports parallel tool calls
- Has structured outputs with Pydantic integration
\`\`\`python
tools = [{"type": "function", "function": {...}}]
\`\`\`

**Anthropic (Claude)**:
- Uses "tools" array directly (no "function" wrapper)
- Tool results use role="user" with tool_result content blocks
- Supports parallel tool calls
- Tool use and text can be interleaved in responses
\`\`\`python
tools = [{"name": "...", "description": "...", "input_schema": {...}}]
\`\`\`

**Key differences in Anthropic**:
\`\`\`python
# Anthropic tool result format
messages.append({
    "role": "user",
    "content": [{
        "type": "tool_result",
        "tool_use_id": tool_use_block.id,
        "content": json.dumps(result)
    }]
})
\`\`\`

**Google (Gemini)**:
- Uses "function_declarations" in tools
- Different response structure
- Function calling modes: AUTO, ANY, NONE

**Abstraction layers** like LangChain, LlamaIndex, and Instructor normalize these differences, letting you write provider-agnostic code.`
        },
        {
          title: "Pydantic and Instructor: Type-Safe Tool Definitions",
          description: `Writing JSON schemas by hand is tedious and error-prone. Pydantic models provide a better developer experience, and the **Instructor** library makes working with structured outputs even easier.

**Pydantic for schema definition**:
\`\`\`python
from pydantic import BaseModel, Field
from typing import Literal

class WeatherRequest(BaseModel):
    """Get current weather for a location."""
    location: str = Field(description="City name, e.g. 'Paris'")
    unit: Literal["celsius", "fahrenheit"] = Field(
        default="celsius",
        description="Temperature unit"
    )

# Convert to JSON Schema for the API
schema = WeatherRequest.model_json_schema()
\`\`\`

**Instructor for structured extraction**:
\`\`\`python
import instructor
from openai import OpenAI

client = instructor.from_openai(OpenAI())

class UserInfo(BaseModel):
    name: str
    age: int
    email: str | None = None

# Automatically handles structured output
user = client.chat.completions.create(
    model="gpt-4o",
    response_model=UserInfo,
    messages=[{"role": "user", "content": "John Smith, 34, john@test.com"}]
)

print(user.name)  # "John Smith"
print(user.age)   # 34
\`\`\`

**Benefits of Pydantic + Instructor**:
- Type hints provide IDE autocomplete
- Validation happens automatically
- Schemas stay in sync with code
- Cleaner, more maintainable definitions
- Works with multiple providers`
        }
      ],
      codeExamples: [
        {
          title: "Complete Function Calling Loop",
          language: "python",
          category: "intermediate",
          code: `import json
from openai import OpenAI

client = OpenAI()

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City name"},
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_restaurants",
            "description": "Search for restaurants in a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"},
                    "cuisine": {"type": "string"},
                    "price_range": {"type": "string", "enum": ["$", "$$", "$$$"]}
                },
                "required": ["location"]
            }
        }
    }
]

# Tool implementations
def execute_tool(name: str, arguments: dict) -> str:
    if name == "get_weather":
        # Mock implementation
        return json.dumps({
            "location": arguments["location"],
            "temperature": 22,
            "condition": "sunny",
            "unit": arguments.get("unit", "celsius")
        })
    elif name == "search_restaurants":
        return json.dumps({
            "restaurants": [
                {"name": "Le Petit Bistro", "cuisine": "French", "rating": 4.5},
                {"name": "Pasta Palace", "cuisine": "Italian", "rating": 4.2}
            ]
        })
    return json.dumps({"error": f"Unknown tool: {name}"})

def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        assistant_message = response.choices[0].message
        messages.append(assistant_message)

        # If no tool calls, we're done
        if not assistant_message.tool_calls:
            return assistant_message.content

        # Execute each tool call
        for tool_call in assistant_message.tool_calls:
            result = execute_tool(
                tool_call.function.name,
                json.loads(tool_call.function.arguments)
            )
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result
            })

# Test it
print(run_agent("What's the weather in Paris and can you recommend restaurants?"))`,
          explanation: "This implements a complete function calling loop that handles multiple tools and continues until the model responds with text."
        },
        {
          title: "Structured Output with Pydantic",
          language: "python",
          category: "basic",
          code: `from pydantic import BaseModel, Field
from openai import OpenAI

client = OpenAI()

class MovieReview(BaseModel):
    """Structured movie review extraction."""
    title: str = Field(description="The movie title")
    rating: float = Field(ge=0, le=10, description="Rating from 0-10")
    sentiment: str = Field(description="Overall sentiment: positive, negative, or mixed")
    key_points: list[str] = Field(description="Main points from the review")
    recommended: bool = Field(description="Whether the reviewer recommends the movie")

review_text = """
Just watched Inception again - what a masterpiece! Nolan's direction is
impeccable, and the concept of dreams within dreams never gets old. The
cast, especially DiCaprio and Hardy, deliver stellar performances. The
only slight issue is the runtime - it's a bit long. Still, I'd give it
a solid 9/10 and definitely recommend it to anyone who loves smart sci-fi.
"""

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "Extract structured data from movie reviews."},
        {"role": "user", "content": review_text}
    ],
    response_format=MovieReview
)

review = response.choices[0].message.parsed
print(f"Title: {review.title}")
print(f"Rating: {review.rating}/10")
print(f"Sentiment: {review.sentiment}")
print(f"Recommended: {review.recommended}")
print(f"Key points: {review.key_points}")`,
          explanation: "Uses OpenAI's structured outputs with Pydantic to extract typed data from free-form text with guaranteed schema compliance."
        },
        {
          title: "Anthropic Tool Use",
          language: "python",
          category: "intermediate",
          code: `import anthropic
import json

client = anthropic.Anthropic()

tools = [
    {
        "name": "get_stock_price",
        "description": "Get the current stock price for a ticker symbol",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {
                    "type": "string",
                    "description": "Stock ticker symbol (e.g., AAPL, GOOGL)"
                }
            },
            "required": ["ticker"]
        }
    }
]

def get_stock_price(ticker: str) -> dict:
    # Mock implementation
    prices = {"AAPL": 178.50, "GOOGL": 141.25, "MSFT": 378.90}
    return {"ticker": ticker, "price": prices.get(ticker, 0), "currency": "USD"}

messages = [{"role": "user", "content": "What's Apple's stock price?"}]

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=messages
)

# Process the response
for block in response.content:
    if block.type == "tool_use":
        # Execute the tool
        result = get_stock_price(block.input["ticker"])

        # Continue conversation with tool result
        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [{
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(result)
            }]
        })

        # Get final response
        final = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )
        print(final.content[0].text)`,
          explanation: "Demonstrates the Anthropic/Claude approach to tool use, which has a different message format than OpenAI."
        }
      ],
      diagrams: [
        {
          title: "Structured Output Constraint Flow",
          type: "ascii",
          content: `
    ┌─────────────────────────────────────────────────────────────┐
    │                    YOUR SCHEMA                              │
    │  {                                                          │
    │    "type": "object",                                        │
    │    "properties": {                                          │
    │      "name": {"type": "string"},                           │
    │      "age": {"type": "integer"}                            │
    │    }                                                        │
    │  }                                                          │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                 CONSTRAINED DECODING                        │
    │                                                             │
    │  Token generation is RESTRICTED at each step:               │
    │                                                             │
    │  After '{"name": "John", '                                  │
    │  ┌─────────────────────────────────────────┐                │
    │  │ ALLOWED tokens:  "age"                   │                │
    │  │ BLOCKED tokens:  "foo", "xyz", "}"      │                │
    │  └─────────────────────────────────────────┘                │
    │                                                             │
    │  After '"age": '                                            │
    │  ┌─────────────────────────────────────────┐                │
    │  │ ALLOWED tokens:  0, 1, 2, 3, 4...       │                │
    │  │ BLOCKED tokens:  "abc", true, null      │                │
    │  └─────────────────────────────────────────┘                │
    │                                                             │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                GUARANTEED VALID OUTPUT                      │
    │                                                             │
    │  {"name": "John", "age": 34}  ← Always valid JSON!         │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘`,
          caption: "Structured outputs constrain token generation to guarantee schema-valid JSON"
        }
      ],
      exercises: [
        {
          title: "Build a Data Extraction Pipeline",
          objective: "Create a system that extracts structured contact information from unstructured text",
          steps: [
            "Define a Pydantic model for ContactInfo (name, email, phone, company, role)",
            "Write a function that takes raw text and returns a ContactInfo object",
            "Handle cases where some fields are missing (make them Optional)",
            "Test with various input formats (emails, LinkedIn bios, business cards)",
            "Add validation (email format, phone number format)"
          ],
          hints: [
            "Use Field(default=None) for optional fields",
            "Add regex patterns to Field for validation",
            "Consider a list output for text with multiple contacts"
          ]
        },
        {
          title: "Multi-Tool Agent",
          objective: "Build an agent with 3+ tools that can chain tool calls to answer complex questions",
          steps: [
            "Define tools: get_weather, search_web, calculate (math expressions)",
            "Implement the tool execution loop from the code examples",
            "Test with: 'What's 15% tip on dinner if it's raining in NYC and restaurants are expensive?'",
            "The agent should call multiple tools and combine results",
            "Add error handling for failed tool calls"
          ],
          hints: [
            "Start simple—get one tool working before adding more",
            "Print the conversation history to debug",
            "Models might not always chain tools—prompt engineering helps"
          ]
        },
        {
          title: "Provider Abstraction Layer",
          objective: "Create a unified interface that works with both OpenAI and Anthropic",
          steps: [
            "Define a common Tool dataclass with name, description, parameters",
            "Create an abstract Agent base class with call_with_tools method",
            "Implement OpenAIAgent and AnthropicAgent subclasses",
            "Handle the different message formats internally",
            "Test the same tool definition with both providers"
          ],
          hints: [
            "Focus on the message format differences",
            "Tool definitions are similar enough to share",
            "Use a factory function to create the right agent type"
          ]
        }
      ],
      keyTakeaways: [
        "Structured outputs guarantee valid JSON matching your schema—no more parsing failures",
        "Function calling lets models express intent to act while you control execution",
        "Good tool descriptions are as important as good prompts—they guide model behavior",
        "The tool call loop: request → execute → result → continue until text response",
        "Pydantic + Instructor provide type-safe, maintainable tool definitions",
        "Different providers have different formats—abstraction layers help",
        "Always handle tool execution errors gracefully—return them as results for the model to process"
      ],
      resources: [
        { title: "OpenAI Function Calling Guide", url: "https://platform.openai.com/docs/guides/function-calling", type: "docs", description: "Official OpenAI documentation on function calling", summaryPath: "data/day-2/summary-openai-function-calling.md" },
        { title: "OpenAI Structured Outputs", url: "https://platform.openai.com/docs/guides/structured-outputs", type: "docs", description: "Guaranteed JSON schema compliance", summaryPath: "data/day-2/summary-openai-structured-outputs.md" },
        { title: "Anthropic Tool Use", url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use", type: "docs", description: "Claude's approach to function calling", summaryPath: "data/day-2/summary-anthropic-tool-use.md" },
        { title: "Instructor Library", url: "https://python.useinstructor.com/", type: "docs", description: "Pydantic-powered structured outputs for multiple providers", summaryPath: "data/day-2/summary-instructor-library.md" },
        { title: "Functions, Tools and Agents with LangChain", url: "https://learn.deeplearning.ai/courses/functions-tools-agents-langchain", type: "course", duration: "1h", difficulty: "beginner", description: "DeepLearning.AI course on tool use patterns", summaryPath: "data/day-2/summary-langchain-functions-tools.md" },
        { title: "JSON Schema Reference", url: "https://json-schema.org/understanding-json-schema/", type: "docs", description: "Learn to write effective JSON schemas", summaryPath: "data/day-2/summary-json-schema.md" }
      ],
      localResources: [
        {
          id: "structured-outputs-guide",
          title: "Structured Outputs & Function Calling Guide",
          description: "Comprehensive guide covering OpenAI, Anthropic, Instructor library, JSON schemas, and best practices",
          filePath: "data/day-2/01-structured-outputs-function-calling.md",
          type: "notes",
          estimatedTime: "30 min read"
        }
      ],
      faq: [
        {
          question: "What's the difference between JSON mode and structured outputs?",
          answer: "JSON mode guarantees valid JSON but not schema compliance—the model might return any valid JSON. Structured outputs guarantee the JSON matches your exact schema with correct types and required fields. Use structured outputs when you need predictable structure."
        },
        {
          question: "Can the model call multiple tools at once?",
          answer: "Yes, modern models support parallel tool calls. The response will contain an array of tool calls, and you should execute all of them (potentially in parallel) before sending results back. This is useful for queries like 'What's the weather in Paris AND London?'"
        },
        {
          question: "What happens if tool execution fails?",
          answer: "Return the error as the tool result. The model will see the error and can try a different approach, ask for clarification, or explain the failure to the user. Never silently swallow errors—the model needs feedback to reason about what went wrong."
        },
        {
          question: "How do I prevent the model from hallucinating tool arguments?",
          answer: "Use enums for constrained choices, add detailed descriptions, and validate arguments before execution. For critical values like IDs, consider having the model search/lookup first rather than guess. Always validate on your end before executing."
        },
        {
          question: "Should I use OpenAI's native tools or a library like LangChain?",
          answer: "Start with native APIs to understand the fundamentals. Libraries like LangChain and Instructor add convenience (provider abstraction, retries, validation) that's valuable in production. Learn the raw API first, then choose tools that solve real problems you encounter."
        }
      ],
      applications: [
        {
          title: "Data Extraction Pipeline",
          description: "Extract structured data from unstructured documents: invoices, receipts, contracts, emails. Define schemas for each document type and process at scale with guaranteed output format."
        },
        {
          title: "API Integration Agent",
          description: "An agent that can query multiple APIs (weather, stocks, news, databases) to answer complex questions. Each API becomes a tool the model can call with appropriate parameters."
        },
        {
          title: "Form-Filling Assistant",
          description: "Help users complete complex forms by extracting information from conversation and outputting structured data matching form schemas. Works for insurance applications, tax forms, onboarding flows."
        },
        {
          title: "Customer Support Automation",
          description: "Tools for looking up order status, checking inventory, initiating refunds, and escalating to humans. The model decides which actions to take based on the customer query."
        }
      ],
      relatedDays: [1, 3, 4, 6]
    }
  },
  {
    day: 3,
    phase: 1,
    title: "Building an Agent from Scratch",
    partner: "DeepLearning.AI",
    tags: ["python", "llm", "fundamentals"],
    concept: "Implement a complete agent with tool registry, parsing, and execution loop—no frameworks required",
    demoUrl: "demos/day-3/",
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
          description: `Strip away the abstractions and marketing language, and an agent reveals itself as a remarkably simple construct. At minimum, it needs just three things working together:

**1. An LLM client** - The connection to your model (OpenAI, Anthropic, etc.). This is simply an HTTP client that sends requests and receives responses. Nothing magical—just API calls.

**2. Message history** - A list that stores the conversation. This is the agent's working memory, implementing the OBSERVE phase from Day 1. Each turn appends new entries: the user's request, the assistant's reasoning and action, the observation from tool execution. When you make an API call, you send the full history, giving the model complete context about what has happened so far.

**3. A system prompt** - Defines the agent's persona, capabilities, and—most critically—its output format. Think of it as a contract between your code and the model. Your parsing logic expects responses in a specific structure; the system prompt is where you establish that expectation. The precision of your format specification directly determines parsing reliability.

\`\`\`python
class Agent:
    def __init__(self, system_prompt: str):
        self.client = OpenAI()
        self.system = system_prompt
        self.messages = []  # Conversation history
\`\`\`

The key insight: message history IS the agent's context. The LLM has no memory between calls—it sees only what you send it. By accumulating history, you create the illusion of a continuous conversation with an agent that remembers what it has done and learned.

History management involves trade-offs that become apparent in longer conversations. Full history provides complete context but grows expensive as token counts increase. Eventually, you'll exceed context limits or find that important early instructions get "lost" as the model pays more attention to recent messages. Production agents often implement sliding windows (keeping only the last N turns), summarization (compressing old context into summaries), or retrieval (storing history externally and fetching relevant portions).`
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

| Strategy | Reliability | Best For |
|----------|-------------|----------|
| Basic Regex | Medium | Prototypes, controlled settings |
| Robust Regex | Medium-High | Production with natural language |
| Structured Outputs | Guaranteed | High reliability requirements |`
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
      exercises: [
        {
          title: "Build a Research Agent",
          objective: "Create an agent that can search the web and synthesize information to answer questions",
          steps: [
            "Start with the basic Agent class from the code examples",
            "Add a search tool that returns mock search results",
            "Add a calculate tool for any math operations",
            "Write a system prompt that instructs the agent to cite sources",
            "Test with: 'What is the population of France and what is 15% of that number?'"
          ],
          hints: [
            "The agent should call search first, then calculate",
            "Include source attribution in the Answer format",
            "Start with simpler queries before complex multi-step ones"
          ]
        },
        {
          title: "Add Conversation Memory",
          objective: "Extend the agent to remember context across multiple user queries",
          steps: [
            "Modify the run() method to NOT clear message history between calls",
            "Add a reset() method to clear history when needed",
            "Test a multi-turn conversation: 'What's 10 + 5?' then 'Double that'",
            "The agent should remember the previous answer",
            "Add a summary tool that summarizes the conversation so far"
          ],
          hints: [
            "The key is not resetting self.messages between run() calls",
            "Consider max history length to prevent context overflow",
            "Pronouns like 'that' should resolve to previous values"
          ]
        },
        {
          title: "Implement Retry Logic",
          objective: "Make your agent more robust by adding automatic retries for tool failures",
          steps: [
            "Modify _execute_tool to accept a retry count parameter",
            "If a tool fails, wait briefly and retry up to 3 times",
            "Use exponential backoff: 1s, 2s, 4s delays",
            "Only retry for transient errors (network, rate limits), not permanent ones",
            "Log each retry attempt for debugging"
          ],
          hints: [
            "time.sleep() for delays",
            "Distinguish error types: some should retry, others shouldn't",
            "Consider a @retry decorator pattern"
          ]
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
        { title: "Anthropic Tool Use", url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use", type: "docs", description: "Claude's approach to tool use and function calling", summaryPath: "data/day-3/summary-anthropic-tool-use.md" }
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
  },
  {
    day: 4,
    phase: 1,
    title: "The ReAct Pattern: Reasoning + Acting",
    partner: "DeepLearning.AI",
    tags: ["react", "reasoning", "tool-use"],
    concept: "Interleaving reasoning traces with actions for explainable decision-making",
    demoUrl: "demos/day-4/",
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
          description: `To appreciate ReAct, you need to understand the two approaches it synthesizes—and why neither works well alone.

**Chain-of-Thought (CoT) Reasoning**: Introduced in 2022, CoT prompting dramatically improved LLM performance on reasoning tasks by adding "Let's think step by step" to prompts. The model would generate intermediate reasoning steps before producing an answer.

The problem? CoT reasoning is entirely internal. When asked "What's the population of the capital of France?", a CoT model might reason: "The capital of France is Paris. Paris has a population of about 2 million." But where did "2 million" come from? The model's training data, which might be outdated or wrong. There's no way to verify or update this information.

**Action-Only Approaches**: Other research gave models access to tools—search engines, calculators, databases. The model could call \`search("Paris population")\` and get current data.

The problem? Models would often call tools prematurely or incorrectly. Without explicit reasoning, they might search for the wrong thing, misinterpret results, or fail to connect pieces of information across multiple tool calls.

**ReAct's Synthesis**: By interleaving thoughts and actions, ReAct gets the best of both worlds:

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
      exercises: [
        {
          title: "Implement a ReAct Calculator Agent",
          objective: "Build an agent that answers math word problems using the ReAct pattern",
          steps: [
            "Create a calculate tool that evaluates mathematical expressions",
            "Write a ReAct system prompt with thought/action/answer format",
            "Implement the main loop with parsing and tool execution",
            "Test with: 'If I have 23 apples and buy 3 bags of 12 apples each, how many do I have?'",
            "Verify the agent shows its reasoning before each calculation"
          ],
          hints: [
            "Use eval() for simple calculations (but sanitize inputs in production!)",
            "The agent should break down the word problem step by step",
            "Check that thoughts actually explain the reasoning, not just announce actions"
          ]
        },
        {
          title: "Add Search Grounding to Your Agent",
          objective: "Extend your agent to ground its answers in search results",
          steps: [
            "Add a mock search function that returns relevant information",
            "Update the system prompt to include the search tool",
            "Implement grounding instructions: 'Only state facts supported by observations'",
            "Test with factual questions and verify the agent uses search before answering",
            "Add a case where search returns no results and observe agent behavior"
          ],
          hints: [
            "Mock search can return hardcoded results for specific queries",
            "Good grounding means the agent cites its observations in the answer",
            "Watch for the agent making up facts not in the observations"
          ]
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
  },
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
  // A day is "in progress" if it has ANY activity but is NOT reading-complete
  const readingComplete = getCompletedReadingDays();
  const inProgressDays = new Set<number>();

  // Check all 30 days
  for (let day = 1; day <= 30; day++) {
    // Skip if already reading-complete
    if (readingComplete.has(day)) continue;

    // Check for any progress indicators:
    // 1. Section items completed (concepts, takeaways)
    const sectionProgress = getSectionProgressForDay(day, 'concept').length > 0 ||
                           getSectionProgressForDay(day, 'takeaway').length > 0;

    // 2. External resources completed
    const resourceProgress = getCompletedResourcesForDay(day).length > 0;

    // 3. Local resources viewed
    const localResourceProgress = getLocalResourcesForDay(day).some(r =>
      isLocalResourceCompleted(day, r.id)
    );

    // 4. Journal entry has content
    const entry = getEntry(day);
    const hasJournalContent = entry && (entry.body?.trim() || entry.microPost?.content);

    // 5. Demo completed (for days with demos)
    const demoProgress = isDemoCompleted(day);

    if (sectionProgress || resourceProgress || localResourceProgress || hasJournalContent || demoProgress) {
      inProgressDays.add(day);
    }
  }

  return inProgressDays;
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
