# Multi-AI Agent Systems with CrewAI

> Notes from the DeepLearning.AI short course by João Moura (CrewAI founder)

## Course Overview

This course teaches how to build multi-agent systems where AI agents collaborate like a well-coordinated team. Each agent has a role, uses tools, and works with others to accomplish complex tasks.

**Key Insight**: Just as companies organize into specialized teams, AI agents work better when they have clear roles and responsibilities rather than one agent doing everything.

---

## Lesson 1: Introduction to Multi-Agent Systems

### Why Multiple Agents?

Single agents face limitations:
- Prompts become unwieldy with multiple responsibilities
- One context window for everything
- Same settings for all tasks (temperature, model)
- No review or quality control

Multi-agent systems solve this:
- Focused prompts per agent
- Separate context per task
- Optimized settings per role
- Agents can review each other's work

### The Restaurant Analogy

You *could* have one person greet customers, take orders, cook, serve, and handle payments. But restaurants have specialized staff:
- Host (greeting, seating)
- Server (orders, delivery)
- Chef (cooking)
- Busboy (cleanup)

Each role is focused. Handoffs are clear. The restaurant runs smoothly.

---

## Lesson 2: Creating Agents

### Agent Components

```python
from crewai import Agent

researcher = Agent(
    role="Senior Research Analyst",
    goal="Uncover cutting-edge developments in AI",
    backstory="""You work at a leading tech think tank.
    Your expertise lies in identifying emerging trends and
    analyzing complex data to provide actionable insights.""",
    verbose=True,
    allow_delegation=False,
    tools=[search_tool]
)
```

### Role vs. Backstory

| Aspect | Role | Backstory |
|--------|------|-----------|
| What | Job title | Personality/history |
| Example | "Research Analyst" | "10 years at McKinsey, known for thoroughness" |
| Impact | Defines function | Shapes approach and style |

**Backstory is powerful**: Two agents with the same role but different backstories produce meaningfully different work.

### Agent Capabilities

- **Tools**: External capabilities (search, file read, APIs)
- **LLM**: Which model powers the agent
- **Delegation**: Can request help from other agents
- **Memory**: Remember previous interactions

---

## Lesson 3: Defining Tasks

### Task Anatomy

```python
from crewai import Task

task = Task(
    description="""Conduct comprehensive analysis of {topic}.
    Identify key trends, challenges, and opportunities.
    Your final report should be detailed and actionable.""",
    expected_output="""A 3-paragraph summary covering:
    1. Current state of the field
    2. Key trends and developments
    3. Recommendations for stakeholders""",
    agent=researcher,
    tools=[search_tool]
)
```

### Task Best Practices

1. **Be specific in descriptions** - What exactly should be done?
2. **Define expected output** - Format, length, structure
3. **Assign appropriate agent** - Match expertise to task
4. **Provide relevant tools** - Only what's needed

### Task Dependencies

```python
research_task = Task(
    description="Research AI trends",
    agent=researcher
)

analysis_task = Task(
    description="Analyze the research findings",
    agent=analyst,
    context=[research_task]  # Gets research output
)
```

---

## Lesson 4: Building Crews

### Crew Configuration

```python
from crewai import Crew, Process

crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential,
    verbose=True
)
```

### Process Types Explained

| Process | How It Works | When to Use |
|---------|--------------|-------------|
| Sequential | Tasks run in order | Clear dependencies, predictable flow |
| Hierarchical | Manager delegates | Dynamic task breakdown needed |
| Consensual | Agents discuss/debate | Need multiple perspectives |

### Running the Crew

```python
result = crew.kickoff(inputs={
    "topic": "AI agents in healthcare"
})

print(result)
```

---

## Lesson 5: Tools and Capabilities

### Built-in Tools

```python
from crewai_tools import (
    SerperDevTool,      # Google search
    ScrapeWebsiteTool,  # Web scraping
    FileReadTool,       # Read files
    PDFSearchTool,      # Search PDFs
)

search_tool = SerperDevTool()
scrape_tool = ScrapeWebsiteTool()
```

### Creating Custom Tools

```python
from crewai.tools import BaseTool

class CalculatorTool(BaseTool):
    name: str = "Calculator"
    description: str = "Performs mathematical calculations"

    def _run(self, expression: str) -> str:
        try:
            result = eval(expression)  # In production, use safe eval
            return f"Result: {result}"
        except:
            return "Error: Invalid expression"
```

### Tool Tips

1. **Quality descriptions** - LLM uses these to decide when to call
2. **Focused tools** - Do one thing well
3. **Error handling** - Return helpful messages on failure
4. **Match to roles** - Don't give every tool to every agent

---

## Lesson 6: Practical Applications

### Example: Content Marketing Crew

```python
# Research trending topics
researcher = Agent(
    role="Content Researcher",
    goal="Find trending topics and gather data",
    backstory="You're a skilled researcher who identifies viral content opportunities"
)

# Write engaging content
writer = Agent(
    role="Content Writer",
    goal="Create compelling, shareable content",
    backstory="You write in a conversational, engaging style that resonates with readers"
)

# Optimize for SEO
editor = Agent(
    role="SEO Editor",
    goal="Optimize content for search engines",
    backstory="You balance readability with SEO best practices"
)

# Tasks flow: Research -> Write -> Edit
```

### Example: Financial Analysis Crew

```python
# Gather market data
market_analyst = Agent(
    role="Market Research Analyst",
    goal="Gather comprehensive market data",
    tools=[stock_tool, news_tool]
)

# Evaluate investment potential
financial_analyst = Agent(
    role="Financial Analyst",
    goal="Analyze data and identify opportunities",
    backstory="CFA with 15 years experience in equity research"
)

# Provide recommendations
advisor = Agent(
    role="Investment Advisor",
    goal="Synthesize analysis into actionable recommendations",
    backstory="You consider both opportunities and risks"
)
```

---

## Key Takeaways

1. **Multi-agent > Single agent** for complex tasks requiring diverse expertise

2. **Role clarity matters** - Non-overlapping roles prevent confusion

3. **Backstory is underrated** - It significantly shapes agent behavior

4. **Start sequential** - Hierarchical adds complexity

5. **Context chains tasks** - Information flows through context parameter

6. **Tools extend capability** - But match tools to roles

7. **Start small** - 2-3 agents often sufficient; add only when needed

8. **Verbose for debugging** - See what agents are thinking

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Vague roles | Agents don't know their job | Specific role + goal |
| Too many agents | Complexity, cost, confusion | Start with 2-3 |
| Every tool to every agent | Agent confusion | Match tools to roles |
| Skipping backstory | Generic outputs | Detailed backstories |
| Hierarchical by default | Unpredictable, expensive | Start sequential |
| No expected_output | Inconsistent results | Define format clearly |
