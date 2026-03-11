import type { Day } from '../../types';

export const day09: Day = {
  day: 9,
  phase: 2,
  title: "CrewAI: Multi-Agent Systems",
  partner: "CrewAI",
  tags: ["crewai", "multi-agent", "roles", "collaboration"],
  concept: "Role-based agent teams that collaborate on complex tasks",
  demoUrl: "demos/day-9/",
  demoDescription: "Watch a CrewAI crew in action. See how agents with different roles collaborate, how context flows between tasks, and design your own crew with generated Python code.",
  learn: {
    overview: {
      summary: "Build collaborative AI teams where specialized agents work together, each with distinct roles, goals, and expertise.",
      fullDescription: `So far, we've built agents that work alone. A single agent observes, thinks, acts, and reflects in a loop until the task is complete. This works well for focused problems, but real-world challenges often require diverse expertise that's hard to combine in a single prompt.

Consider writing a comprehensive market research report. This involves finding relevant data and trends (research), interpreting patterns and drawing conclusions (analysis), and crafting clear prose that communicates findings (writing). A single agent could attempt all of this, but the prompts become unwieldy. The agent might excel at research but produce mediocre writing, or vice versa.

**Multi-agent systems** solve this by decomposing complex tasks across specialized agents. Each agent has a role that defines its expertise, a goal that guides its actions, a backstory that shapes its personality, and tools specific to its needs. These agents collaborate—passing information, building on each other's work, and producing results that exceed what any single agent could achieve.

**CrewAI** is a Python framework designed specifically for orchestrating multi-agent collaboration. It provides clean abstractions for defining agents with roles and personalities, task definitions with deliverables and dependencies, multiple process types (sequential, hierarchical, consensual), and built-in memory for efficient collaboration.

The insight behind CrewAI is that effective teams have clear roles and responsibilities. Just as a consulting firm staffs projects with researchers, analysts, and writers, AI crews can divide complex work among specialized agents. The researcher doesn't try to write polished prose; the writer doesn't conduct primary research. Each agent does what it's best at, and the framework handles coordination.

By the end of this lesson, you'll understand when multi-agent architectures make sense, how to design effective agent roles, and how to orchestrate collaboration patterns that produce high-quality results.`,
      prerequisites: ["Days 1-5: Agentic AI foundations", "Basic Python programming", "Understanding of LLM prompting and tool use"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "When Multi-Agent Makes Sense",
        description: `A single agent can be powerful, but it faces real limits. As you add capabilities, the system prompt grows unwieldy. Everything happens in one context window—research notes mix with draft prose mix with editing feedback. The same temperature settings apply to all tasks, but creative writing benefits from higher temperature while data analysis needs precision.

Multi-agent systems address these limitations. Each agent has a concise prompt focused on one role. Agents pass structured outputs to each other, keeping context relevant to each task. Each agent can use different models or settings suited to its role. And agents can review each other's work, catching errors that a single agent might miss.

**Use multi-agent when:**
- Tasks require diverse expertise that's hard to combine in one prompt
- Work naturally decomposes into distinct phases with clear handoffs
- You need quality control through review and iteration
- Tasks benefit from different perspectives or approaches

**Stick with single agents when:**
- The task is focused within one domain
- You need simple tool use without complex reasoning
- Latency matters (multi-agent adds overhead)
- You're prototyping before investing in architecture

The restaurant analogy is apt: you *could* have one person greet customers, take orders, cook food, serve tables, and handle payments. But a real restaurant has specialized staff—host, server, chef, busboy. Each role is focused, handoffs are clear, and the restaurant runs more smoothly than any single super-employee could manage.`
      },
      {
        title: "Agents, Tasks, and Crews",
        description: `CrewAI is built around three core abstractions that mirror how real teams work.

**Agents** are team members with specific roles:

\`\`\`python
from crewai import Agent

researcher = Agent(
    role="Senior Research Analyst",
    goal="Find comprehensive, accurate information on the given topic",
    backstory="""You are an experienced research analyst with 10 years
    at top consulting firms. You're known for thorough, well-sourced
    research and your ability to find information others miss.""",
    tools=[search_tool, web_scraper],
    llm=ChatOpenAI(model="gpt-4o"),
    verbose=True
)
\`\`\`

The **backstory** is more powerful than it might seem. It's not just flavor text—it shapes how the agent approaches problems. A researcher described as an "investigative journalist" will dig deeper than one described as a "quick research assistant." The same role with different backstories produces meaningfully different work.

**Tasks** are specific pieces of work:

\`\`\`python
research_task = Task(
    description="""Research the current state of the electric vehicle market.
    Focus on: market size, growth trends, major players, and emerging technologies.
    Be thorough and cite your sources.""",
    expected_output="A detailed research report with statistics and citations",
    agent=researcher,
    context=[previous_task],  # Receives output from previous_task
    output_file="research_report.md"
)
\`\`\`

The **context** parameter enables task dependencies—the output of one task becomes input to another. This is how information flows through your crew.

**Crews** bring agents and tasks together:

\`\`\`python
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential,
    verbose=True
)

result = crew.kickoff(inputs={"topic": "Electric vehicles"})
\`\`\`

The Crew orchestrates execution, handles context passing between tasks, and produces the final output. Think of it as the project manager who assigns work, ensures handoffs happen, and delivers results.`
      },
      {
        title: "Process Types",
        description: `CrewAI supports different process types that determine how agents coordinate their work. Choosing the right process matters.

**Sequential** is the simplest: tasks execute one after another in order. Research completes before writing begins. Writing completes before editing starts. This is predictable, easy to debug, and perfect for workflows with natural dependencies.

\`\`\`python
crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, writing_task, editing_task],
    process=Process.sequential
)
\`\`\`

**Hierarchical** adds a manager agent that coordinates workers, delegating tasks and reviewing results:

\`\`\`python
crew = Crew(
    agents=[researcher, writer, analyst],
    tasks=[complex_project_task],
    process=Process.hierarchical,
    manager_llm=ChatOpenAI(model="gpt-4o")
)
\`\`\`

The manager decides which agent handles what, reviews work, and may reassign if results aren't satisfactory. This is powerful for complex, open-ended projects where task decomposition isn't predetermined—but it adds LLM overhead and makes execution less predictable.

**Consensual** enables agents to collaborate, discuss, and reach consensus on decisions. Use it when you want diverse viewpoints considered—for brainstorming, creative tasks, or decisions requiring multiple perspectives. It's the most expensive process (many LLM calls) with unpredictable timing, but produces rich multi-perspective output.

**Start with sequential.** It's the right choice for most workflows. Move to hierarchical when you need dynamic coordination, and consensual when you genuinely need debate and consensus.`
      },
      {
        title: "Tools and Capabilities",
        description: `Agents without tools can only generate text. Tools give them the ability to interact with the world—search the web, query databases, create files.

CrewAI provides several built-in tools:

\`\`\`python
from crewai_tools import (
    SerperDevTool,      # Google search via Serper API
    ScrapeWebsiteTool,  # Extract content from web pages
    FileReadTool,       # Read local files
    PDFSearchTool,      # Search within PDFs
)

researcher = Agent(
    role="Researcher",
    tools=[SerperDevTool(), ScrapeWebsiteTool()]
)
\`\`\`

For specialized needs, create custom tools:

\`\`\`python
from crewai.tools import BaseTool

class StockPriceTool(BaseTool):
    name: str = "stock_price"
    description: str = """Get current stock price and daily change.
    Input: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
    Output: Current price, change %, and trading volume"""

    def _run(self, ticker: str) -> str:
        # Your implementation here
        return f"AAPL: $178.50, +1.2%, 45M volume"
\`\`\`

**Match tools to roles.** Give the researcher search tools, the writer document tools. Don't give every tool to every agent—agents with too many tools get confused about which to use. Focused tool sets lead to more reliable behavior.

Tool descriptions matter because they're part of the prompt. The model reads them to understand what each tool does and when to use it. Clear, specific descriptions lead to better tool selection.`
      },
      {
        title: "Context Flow Between Tasks",
        description: `In real workflows, tasks build on each other. CrewAI's context parameter makes this explicit.

\`\`\`python
research_task = Task(
    description="Research the EV market",
    expected_output="Research findings with data",
    agent=researcher
)

analysis_task = Task(
    description="Analyze the research findings and identify key trends",
    expected_output="Analysis with trends and insights",
    agent=analyst,
    context=[research_task]  # Receives research output
)

writing_task = Task(
    description="Write an executive summary based on the analysis",
    expected_output="Executive summary document",
    agent=writer,
    context=[research_task, analysis_task]  # Both outputs available
)
\`\`\`

When \`analysis_task\` runs, it automatically receives the output from \`research_task\`. The agent sees this as additional context in its prompt. The writer sees both research and analysis outputs.

In sequential process, context flows implicitly—each task sees the previous task's output even without explicit context parameters. But explicit context is clearer and gives you precise control.

**Be specific in task descriptions about how to use context:**

\`\`\`python
analysis_task = Task(
    description="""Analyze the research findings provided in context.
    Focus on: market size, growth rate, and competitive landscape.
    Reference specific data points from the research.""",
    context=[research_task]
)
\`\`\`

**Don't overwhelm with context.** Pass what's needed, not everything. Large context can confuse agents—summarize when appropriate.`
      },
      {
        title: "Designing Effective Teams",
        description: `The success of a multi-agent system depends heavily on team design. Three principles matter most.

**Role Clarity**: Each agent should have a distinct, non-overlapping role. If you find yourself defining "Research Analyst" and "Analysis Researcher," you've got overlap that will cause confusion. Clear separation looks like:

\`\`\`python
researcher = Agent(role="Research Specialist", goal="Find accurate data")
analyst = Agent(role="Data Analyst", goal="Interpret data and identify trends")
writer = Agent(role="Content Writer", goal="Create clear, engaging prose")
\`\`\`

**Goal Alignment**: Agent goals should complement each other toward a shared objective. The researcher finds information *to support the article*. The writer transforms research *into readable content*. The editor ensures *accuracy and clarity*. Each goal reinforces the others.

**Backstory Diversity**: Different backstories produce different approaches. Consider an investment analysis crew:

\`\`\`python
conservative = Agent(
    role="Risk Analyst",
    backstory="""You learned from the 2008 crisis. You always look for
    hidden risks and worst-case scenarios. Better to miss an opportunity
    than lose money."""
)

aggressive = Agent(
    role="Growth Analyst",
    backstory="""You've seen early investments multiply 100x. You focus
    on growth potential and believe calculated risks lead to outsized
    returns."""
)
\`\`\`

Using both provides balanced analysis—neither pure optimism nor pessimism.

**Start small.** Two or three agents is often sufficient. Add agents only when there's clear role differentiation. More agents means more complexity, cost, and potential confusion. If you can't clearly articulate why an agent is different from others, you probably don't need it.`
      }
    ],
    codeExamples: [
      {
        title: "Basic Research and Writing Crew",
        language: "python",
        category: "basic",
        code: `from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI

# Define agents with distinct roles
researcher = Agent(
    role="Senior Research Analyst",
    goal="Find comprehensive, accurate information on the given topic",
    backstory="""You are an experienced research analyst with expertise in
    finding reliable information from multiple sources. You're thorough,
    detail-oriented, and always cite your sources.""",
    llm=ChatOpenAI(model="gpt-4o"),
    verbose=True
)

writer = Agent(
    role="Content Writer",
    goal="Transform research into clear, engaging content",
    backstory="""You are a skilled writer who excels at making complex
    topics accessible. You write in a conversational but professional
    tone and structure content for easy reading.""",
    llm=ChatOpenAI(model="gpt-4o"),
    verbose=True
)

# Define tasks with dependencies
research_task = Task(
    description="""Research the topic: {topic}
    Cover: current state, key statistics, major trends, future outlook.
    Provide detailed findings with data points.""",
    expected_output="A comprehensive research brief with key findings",
    agent=researcher
)

writing_task = Task(
    description="""Based on the research provided, write a blog post.
    Include engaging introduction, clear findings, relevant statistics,
    and thoughtful conclusion. Target: 800-1000 words.""",
    expected_output="A well-structured blog post ready for publication",
    agent=writer,
    context=[research_task]
)

# Create and run the crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,
    verbose=True
)

result = crew.kickoff(inputs={"topic": "The future of renewable energy"})
print(result)`,
        explanation: "A minimal but complete crew: researcher finds information, writer crafts content. Sequential process ensures research completes first. The context parameter passes research output to the writer."
      },
      {
        title: "Crew with Custom Tools",
        language: "python",
        category: "intermediate",
        code: `from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from langchain_openai import ChatOpenAI

# Custom tool for stock data
class StockDataTool(BaseTool):
    name: str = "stock_data"
    description: str = """Get current stock information.
    Input: Stock ticker symbol (e.g., 'AAPL', 'TSLA')
    Returns: Current price, market cap, P/E ratio, recent performance"""

    def _run(self, ticker: str) -> str:
        # In production, use Alpha Vantage, Yahoo Finance, etc.
        mock_data = {
            "AAPL": {"price": 178.50, "market_cap": "2.8T", "pe": 28.5},
            "TSLA": {"price": 245.20, "market_cap": "780B", "pe": 65.2},
        }
        data = mock_data.get(ticker.upper(), {"error": "Not found"})
        return f"Stock data for {ticker}: {data}"

# Agents with specialized tools
analyst = Agent(
    role="Market Research Analyst",
    goal="Gather comprehensive market data for investment analysis",
    backstory="""You combine quantitative data with qualitative analysis.
    You verify information from multiple angles before concluding.""",
    tools=[StockDataTool()],
    llm=ChatOpenAI(model="gpt-4o"),
    verbose=True
)

advisor = Agent(
    role="Investment Advisor",
    goal="Provide clear, actionable investment recommendations",
    backstory="""You are a seasoned advisor known for balanced recommendations.
    You consider both opportunities and risks, always explaining your reasoning.""",
    llm=ChatOpenAI(model="gpt-4o"),
    verbose=True
)

# Tasks
research_task = Task(
    description="""Analyze {ticker} for investment potential.
    Use tools to get current data, then compile a research report.""",
    expected_output="Analysis with data, metrics, and key observations",
    agent=analyst
)

recommendation_task = Task(
    description="""Based on the research, provide an investment recommendation.
    Include: rating, supporting reasons, risk factors, position sizing advice.""",
    expected_output="Clear recommendation with rationale",
    agent=advisor,
    context=[research_task]
)

crew = Crew(
    agents=[analyst, advisor],
    tasks=[research_task, recommendation_task],
    process=Process.sequential
)

result = crew.kickoff(inputs={"ticker": "TSLA"})`,
        explanation: "Custom tools give agents capabilities beyond text generation. The analyst uses StockDataTool to get real data; the advisor synthesizes into recommendations."
      }
    ],
    diagrams: [
      {
        title: "CrewAI Architecture",
        type: "architecture",
        ascii: `
    ┌─────────────────────────────────────────────────────────────┐
    │                         CREW                                 │
    │              (Orchestrator + Process Type)                   │
    └───────────────────────────┬─────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │   AGENT 1     │   │   AGENT 2     │   │   AGENT 3     │
    │   ─────────   │   │   ─────────   │   │   ─────────   │
    │   Role        │   │   Role        │   │   Role        │
    │   Goal        │   │   Goal        │   │   Goal        │
    │   Backstory   │   │   Backstory   │   │   Backstory   │
    │   Tools       │   │   Tools       │   │   Tools       │
    └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
            │                   │                   │
            ▼                   ▼                   ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │   TASK 1      │   │   TASK 2      │   │   TASK 3      │
    │   ─────────   │──▶│   ─────────   │──▶│   ─────────   │
    │   description │   │   description │   │   description │
    │   output      │   │   context     │   │   context     │
    └───────────────┘   └───────────────┘   └───────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │ FINAL OUTPUT │
                                            └──────────────┘`,
        caption: "Crew orchestrates Agents assigned to Tasks. Context flows between tasks, enabling collaboration."
      }
    ],
    keyTakeaways: [
      "Multi-agent systems decompose complex tasks across specialized agents with distinct roles",
      "CrewAI provides three abstractions: Agents (team members), Tasks (work), Crews (orchestration)",
      "Agents are defined by role, goal, backstory, and tools—backstory significantly impacts behavior",
      "Sequential process is best for most workflows; use hierarchical for complex coordination",
      "Task context enables information flow—output from one task becomes input to another",
      "Start with 2-3 agents; add more only when there's clear role differentiation"
    ],
    resources: [
      { title: "CrewAI Documentation", url: "https://docs.crewai.com/", type: "docs", description: "Official guides and API reference" },
      { title: "Multi-Agent AI Systems with CrewAI (DeepLearning.AI)", url: "https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/", type: "course", description: "Free course covering multi-agent concepts" },
      { title: "CrewAI GitHub Repository", url: "https://github.com/crewAIInc/crewAI", type: "github", description: "Source code and examples" },
      { title: "CrewAI Examples", url: "https://github.com/crewAIInc/crewAI-examples", type: "github", description: "Collection of example crews" }
    ],
    faq: [
      {
        question: "When should I use CrewAI vs. a single agent with multiple tools?",
        answer: "Use CrewAI when tasks benefit from distinct expertise that's hard to combine in one prompt, when work naturally decomposes into phases with clear handoffs, or when you need review by different 'perspectives.' Stick with a single agent for focused tasks or when latency matters."
      },
      {
        question: "What's the difference between role and backstory?",
        answer: "Role is the job title ('Research Analyst'). Backstory is the personality and background that shapes HOW the agent approaches the role. Two agents with the same role but different backstories work differently. Backstory is often more impactful than role for output quality."
      },
      {
        question: "Can agents run in parallel in CrewAI?",
        answer: "Tasks within a crew run sequentially. For true parallelism, run multiple crews concurrently using asyncio and combine results. The hierarchical process assigns work dynamically but still executes one task at a time."
      },
      {
        question: "How do I debug a crew producing poor results?",
        answer: "Enable verbose=True to see all agent interactions. Check each task's output—identify where quality drops. Review backstories and task descriptions for vagueness. Test agents in isolation before combining. Use output_file on tasks to inspect intermediate results."
      }
    ],
    applications: [
      {
        title: "Content Marketing Pipeline",
        description: "Research team finds topics, writers create content, editors polish, SEO specialists optimize. Each stage has specialized agents building on previous work."
      },
      {
        title: "Investment Research Team",
        description: "Market researcher gathers data, financial analyst evaluates metrics, risk analyst identifies concerns, portfolio manager synthesizes recommendations."
      },
      {
        title: "Customer Support Escalation",
        description: "First-line agent handles common questions. Complex issues escalate to specialists (billing, technical). A supervisor monitors quality."
      }
    ],
    relatedDays: [8, 10, 11]
  }
};
