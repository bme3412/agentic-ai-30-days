# CrewAI Documentation Summary

> Core concepts and patterns from the official CrewAI documentation

## What is CrewAI?

CrewAI is a Python framework for orchestrating role-playing, autonomous AI agents. It enables you to create collaborative AI teams where agents work together, each with specialized roles and capabilities.

| Component | Purpose | Key Properties |
|-----------|---------|----------------|
| **Agent** | Team member with expertise | role, goal, backstory, tools, llm |
| **Task** | Unit of work to complete | description, expected_output, agent, context |
| **Crew** | Orchestrator of agents/tasks | agents, tasks, process, verbose |
| **Process** | Execution strategy | sequential, hierarchical, consensual |

---

## Core Concepts

### Agents

Agents are the workers in your crew. Each has a distinct personality and capabilities.

```python
from crewai import Agent
from langchain_openai import ChatOpenAI

agent = Agent(
    role="Senior Research Analyst",          # Job title
    goal="Find accurate, comprehensive data", # What drives this agent
    backstory="""You worked at McKinsey for 10 years.
    You're known for thorough research and citing sources.""",
    tools=[search_tool, scrape_tool],        # Capabilities
    llm=ChatOpenAI(model="gpt-4o"),
    verbose=True,                             # Show agent thinking
    allow_delegation=False,                   # Can delegate to others?
    max_iter=5                                # Max reasoning iterations
)
```

#### Key Agent Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | str | The agent's job title/function |
| `goal` | str | What the agent is trying to achieve |
| `backstory` | str | Background that shapes personality and approach |
| `tools` | list | Tools the agent can use |
| `llm` | LLM | Language model (defaults to GPT-4) |
| `verbose` | bool | Print agent's reasoning process |
| `allow_delegation` | bool | Can delegate tasks to other agents |
| `max_iter` | int | Maximum iterations for task completion |

### Tasks

Tasks define the work to be done and who does it.

```python
from crewai import Task

task = Task(
    description="""Research the current state of {topic}.
    Focus on market size, key players, and trends.
    Be thorough and cite your sources.""",
    expected_output="A detailed research report with data and citations",
    agent=researcher,
    context=[previous_task],     # Output from other tasks
    output_file="report.md",     # Save output to file
    async_execution=False,       # Run synchronously
    human_input=False            # Require human approval?
)
```

#### Task Dependencies with Context

The `context` parameter enables task chaining:

```python
research_task = Task(
    description="Research the EV market",
    agent=researcher
)

analysis_task = Task(
    description="Analyze the research and identify trends",
    agent=analyst,
    context=[research_task]  # Receives research output
)

writing_task = Task(
    description="Write executive summary from analysis",
    agent=writer,
    context=[research_task, analysis_task]  # Both outputs available
)
```

### Crews

Crews bring agents and tasks together for execution.

```python
from crewai import Crew, Process

crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential,
    verbose=True,
    memory=True,                  # Enable crew memory
    embedder={                    # For memory embeddings
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"}
    }
)

result = crew.kickoff(inputs={"topic": "Electric Vehicles"})
```

---

## Process Types

### Sequential (Default)

Tasks execute in order. Simple, predictable, easy to debug.

```python
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential  # Task 1 -> Task 2
)
```

**Best for**: Workflows with clear dependencies, predictable pipelines.

### Hierarchical

A manager agent coordinates workers, delegating dynamically.

```python
crew = Crew(
    agents=[researcher, writer, analyst],
    tasks=[complex_task],
    process=Process.hierarchical,
    manager_llm=ChatOpenAI(model="gpt-4o"),
    manager_agent=None  # Auto-create manager, or provide custom
)
```

**Best for**: Complex projects where task decomposition isn't predetermined.

### Consensual

Agents discuss and reach consensus. Most expensive but produces diverse perspectives.

```python
crew = Crew(
    agents=[optimist, pessimist, realist],
    tasks=[decision_task],
    process=Process.consensual
)
```

**Best for**: Decisions requiring multiple viewpoints, brainstorming.

---

## Tools

### Built-in Tools

```python
from crewai_tools import (
    SerperDevTool,       # Web search via Serper API
    ScrapeWebsiteTool,   # Scrape web pages
    FileReadTool,        # Read local files
    DirectoryReadTool,   # List directory contents
    PDFSearchTool,       # Search within PDFs
    WebsiteSearchTool,   # Search specific websites
)
```

### Custom Tools

```python
from crewai.tools import BaseTool
from pydantic import Field

class StockPriceTool(BaseTool):
    name: str = "stock_price"
    description: str = """Get current stock price.
    Input: ticker symbol (e.g., 'AAPL')
    Output: price, change, volume"""

    def _run(self, ticker: str) -> str:
        # Implementation here
        return f"{ticker}: $150.00, +2.5%"
```

### Tool Best Practices

1. **Match tools to roles** - Researcher gets search; writer gets documents
2. **Limit tools per agent** - Too many tools causes confusion
3. **Write clear descriptions** - The LLM reads these to decide when to use
4. **Handle errors gracefully** - Return informative error messages

---

## Memory System

CrewAI supports multiple memory types:

| Memory Type | Scope | Purpose |
|-------------|-------|---------|
| **Short-Term** | Single execution | Current task context |
| **Long-Term** | Across executions | Learn from past runs |
| **Entity** | Persistent | Remember key entities |

```python
crew = Crew(
    agents=[...],
    tasks=[...],
    memory=True,  # Enable memory system
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"}
    }
)
```

---

## Best Practices

### Agent Design

1. **Clear, non-overlapping roles** - Each agent should have distinct expertise
2. **Specific goals** - Vague goals produce vague results
3. **Detailed backstories** - Shape how agents approach problems
4. **Appropriate tools** - Only what's needed for the role

### Task Design

1. **Specific descriptions** - Include what to do and how
2. **Clear expected outputs** - Define format and content
3. **Explicit context** - Reference what information to use
4. **Reasonable scope** - Break large tasks into smaller ones

### Crew Design

1. **Start small** - 2-3 agents is often sufficient
2. **Sequential first** - Easier to debug than hierarchical
3. **Enable verbose** - See what agents are thinking
4. **Test incrementally** - Verify each agent works before combining

---

## Common Patterns

### Research + Write

```python
researcher = Agent(role="Researcher", ...)
writer = Agent(role="Writer", ...)

research = Task(description="Research {topic}", agent=researcher)
write = Task(description="Write article", agent=writer, context=[research])

crew = Crew(agents=[researcher, writer], tasks=[research, write])
```

### Analyze + Recommend

```python
analyst = Agent(role="Data Analyst", ...)
advisor = Agent(role="Strategic Advisor", ...)

analyze = Task(description="Analyze data", agent=analyst)
recommend = Task(description="Make recommendations", agent=advisor, context=[analyze])
```

### Research + Analyze + Write + Edit

```python
# Four-agent pipeline for comprehensive content
crew = Crew(
    agents=[researcher, analyst, writer, editor],
    tasks=[research_task, analysis_task, writing_task, editing_task],
    process=Process.sequential
)
```
