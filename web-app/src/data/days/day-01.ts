import type { Day } from '../../types';

export const day01: Day = {
  day: 1,
  phase: 1,
  title: "Agentic AI: Core Concepts & Design Patterns",
  partner: "DeepLearning.AI",
  tags: ["agentic-patterns", "foundations", "design"],
  concept: "The Observe-Think-Act-Reflect loop that powers autonomous AI agents",
  demoUrl: "demos/day-1/",
  demoDescription: "Watch an agent work through the OBSERVE → THINK → ACT → REFLECT loop in real-time. Enter a task and see how the agent breaks it down, plans its approach, and iterates toward a solution.",
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
      type: "mermaid",
      title: "The Agent Loop",
      mermaid: `flowchart LR
    input[User Input] --> observe[OBSERVE]
    observe --> think[THINK]
    think --> act[ACT]
    act --> reflect[REFLECT]
    reflect -->|Iterate| observe
    reflect -->|Complete| output[Final Output]

    style observe fill:#3b82f6,color:#fff
    style think fill:#8b5cf6,color:#fff
    style act fill:#ff9500,color:#000
    style reflect fill:#00d084,color:#000`
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
      { title: "LangChain: What is an Agent?", url: "https://docs.langchain.com/oss/python/langchain/agents", type: "docs", summaryPath: "data/day-1/summary-langchain-agents.md" },
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
        type: "mermaid",
        mermaid: `flowchart LR
    input[User Input] --> observe[OBSERVE]
    observe --> think[THINK]
    think --> act[ACT]
    act --> reflect[REFLECT]
    reflect -->|Iterate| observe
    reflect -->|Complete| output[Final Output]

    style observe fill:#3b82f6,color:#fff
    style think fill:#8b5cf6,color:#fff
    style act fill:#ff9500,color:#000
    style reflect fill:#00d084,color:#000`,
        caption: "The fundamental OBSERVE-THINK-ACT-REFLECT cycle that powers all AI agents"
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
};
