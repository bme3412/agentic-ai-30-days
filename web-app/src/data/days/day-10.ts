import type { Day } from '../../types';

export const day10: Day = {
  day: 10,
  phase: 2,
  title: "CrewAI: Advanced (Tasks, Tools, Flows)",
  partner: "CrewAI",
  tags: ["crewai", "orchestration", "flows", "tools"],
  concept: "Orchestrating multi-step workflows with task dependencies and custom tools",
  demoUrl: "demos/day-10/",
  demoDescription: "Explore advanced CrewAI patterns: configure tasks with callbacks and human input, build custom tools with validation, and visualize Flow execution with conditional routing.",
  lesson: {
    overview: `Building on Day 9's foundations, this lesson explores advanced CrewAI patterns: complex task configurations, custom tool development, and CrewAI Flows—a new orchestration layer for event-driven, stateful workflows. You'll learn to build production-ready multi-agent systems with proper error handling, human-in-the-loop controls, and sophisticated task dependencies.

**Why This Matters**: Real-world applications need more than basic crews. You need tasks that wait for human approval, tools that connect to your APIs, and workflows that handle failures gracefully. These advanced patterns turn prototype crews into production systems.`,

    principles: [
      {
        title: "Tasks Have Callbacks and Controls",
        description: "Beyond basic execution, tasks support callbacks (functions called on completion), human_input (pause for approval), async_execution (parallel runs), and output validation. These controls let you build workflows with checkpoints and quality gates."
      },
      {
        title: "Custom Tools Extend Agent Capabilities",
        description: "Built-in tools handle common cases, but real applications need custom tools—connecting to your databases, APIs, and services. CrewAI's BaseTool class makes this straightforward: define name, description, and a _run method."
      },
      {
        title: "Flows Orchestrate Beyond Linear Execution",
        description: "CrewAI Flows provide event-driven orchestration with state management, conditional routing, and crew composition. Use Flows when you need branching logic, persistent state, or complex multi-crew coordination."
      },
      {
        title: "Production Needs Error Handling",
        description: "Agents fail—tools timeout, APIs error, LLMs hallucinate. Production crews need retry logic, fallback strategies, and graceful degradation. Plan for failure from the start."
      }
    ],

    codeExample: {
      language: "python",
      title: "Task with Callbacks and Human Input",
      code: `from crewai import Agent, Task, Crew

def on_task_complete(output):
    """Called when task finishes."""
    print(f"Task completed: {output.raw[:100]}...")
    # Log to monitoring, trigger notifications, etc.

review_task = Task(
    description="Review the analysis for accuracy",
    expected_output="Approval or revision requests",
    agent=reviewer,
    human_input=True,  # Pauses for human approval
    callback=on_task_complete
)

# When crew runs, it will pause at review_task
# and wait for human input before proceeding`
    },

    diagram: {
      type: "flow",
      title: "CrewAI Flow Architecture",
      ascii: `
    ┌─────────────────────────────────────────────────────────────┐
    │                      CREWAI FLOW                            │
    │                   (Event-Driven State)                      │
    └───────────────────────────┬─────────────────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
    ┌─────────┐           ┌─────────┐           ┌─────────┐
    │ @start  │──────────▶│ @listen │──────────▶│ @router │
    │ entry   │           │ events  │           │ branch  │
    └─────────┘           └─────────┘           └────┬────┘
                                                     │
                               ┌─────────────────────┼─────────────────────┐
                               ▼                     ▼                     ▼
                         ┌──────────┐          ┌──────────┐          ┌──────────┐
                         │ Crew A   │          │ Crew B   │          │ Crew C   │
                         │ research │          │ analyze  │          │ escalate │
                         └──────────┘          └──────────┘          └──────────┘`
    },

    keyTakeaways: [
      "Tasks support callbacks, human_input, async execution, and output validation",
      "Custom tools extend agents with your APIs, databases, and services",
      "CrewAI Flows enable event-driven orchestration with state and branching",
      "Production crews need retry logic, error handling, and monitoring",
      "Use @start, @listen, and @router decorators to define Flow logic"
    ],

    resources: [
      { title: "CrewAI Flows Documentation", url: "https://docs.crewai.com/concepts/flows", type: "docs", summaryPath: "data/day-10/summary-crewai-flows.md" },
      { title: "CrewAI Tools Guide", url: "https://docs.crewai.com/concepts/tools", type: "docs", summaryPath: "data/day-10/summary-crewai-tools.md" }
    ]
  },
  learn: {
    overview: {
      summary: "Master advanced CrewAI patterns: complex task configurations, custom tool development, and event-driven Flows for production workflows.",
      fullDescription: `Day 9 introduced CrewAI's core abstractions—agents, tasks, and crews. That foundation is enough for simple workflows, but production applications demand more sophisticated patterns.

Consider a real-world scenario: a research crew that gathers data, analyzes findings, and produces a report. In production, you need the analysis to pause for human review before finalizing. You need custom tools that query your proprietary databases. You need the workflow to branch—sending high-confidence findings directly to reporting while flagging uncertain results for additional research. And when things go wrong (they will), you need graceful recovery.

This lesson covers three areas that transform basic crews into production systems:

**Advanced Task Configuration**: Tasks aren't just descriptions and outputs. They support callbacks for monitoring and logging, human_input for approval gates, async execution for parallelism, and output validation to ensure quality. These features let you build workflows with proper checkpoints and controls.

**Custom Tool Development**: Built-in tools like web search and file reading handle common cases. But your agents need to call your APIs, query your databases, and integrate with your services. CrewAI's tool system makes this straightforward—inherit from BaseTool, define your interface, implement the logic.

**CrewAI Flows**: The newest addition to CrewAI, Flows provide event-driven orchestration on top of crews. With decorators like @start, @listen, and @router, you can build stateful workflows with conditional branching, parallel execution, and crew composition. Flows are the answer when sequential/hierarchical processes aren't enough.

By the end of this lesson, you'll understand how to build crews that handle real-world complexity—with proper controls, custom integrations, and sophisticated orchestration.`,
      prerequisites: ["Day 9: CrewAI fundamentals", "Intermediate Python", "Understanding of async patterns helpful"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "Advanced Task Configuration",
        description: `Tasks in CrewAI support several advanced features beyond basic description and output.

**Callbacks** let you hook into task completion:

\`\`\`python
def log_completion(output):
    """Called when task completes."""
    log.info(f"Task done: {output.raw[:100]}")
    metrics.increment("tasks_completed")

task = Task(
    description="Analyze market data",
    agent=analyst,
    callback=log_completion  # Called on completion
)
\`\`\`

**Human Input** pauses execution for approval:

\`\`\`python
approval_task = Task(
    description="Review the final report for accuracy",
    agent=reviewer,
    human_input=True  # Crew pauses here for input
)
\`\`\`

When the crew reaches this task, it stops and waits. The human can approve, request changes, or provide additional context. This is essential for high-stakes workflows.

**Async Execution** enables parallel tasks:

\`\`\`python
research_task_1 = Task(
    description="Research competitor A",
    agent=researcher,
    async_execution=True  # Runs in parallel
)

research_task_2 = Task(
    description="Research competitor B",
    agent=researcher,
    async_execution=True  # Also parallel
)

# Both research tasks run concurrently
# Next task waits for both to complete if it depends on them
\`\`\`

**Output Validation** with Pydantic models:

\`\`\`python
from pydantic import BaseModel

class AnalysisOutput(BaseModel):
    summary: str
    confidence: float
    recommendations: list[str]

task = Task(
    description="Analyze the data",
    agent=analyst,
    output_pydantic=AnalysisOutput  # Validates output structure
)
\`\`\`

The task will ensure the output matches the schema, providing type safety and structure.`
      },
      {
        title: "Building Custom Tools",
        description: `Built-in tools cover common needs, but real applications require custom integrations. CrewAI makes tool creation straightforward.

**Basic Custom Tool**:

\`\`\`python
from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field

class StockPriceInput(BaseModel):
    """Input schema for stock price tool."""
    ticker: str = Field(description="Stock ticker symbol, e.g., 'AAPL'")

class StockPriceTool(BaseTool):
    name: str = "stock_price"
    description: str = "Get current stock price and daily change"
    args_schema: Type[BaseModel] = StockPriceInput

    def _run(self, ticker: str) -> str:
        # Your implementation
        import yfinance as yf
        stock = yf.Ticker(ticker)
        price = stock.info.get('regularMarketPrice', 'N/A')
        change = stock.info.get('regularMarketChangePercent', 'N/A')
        return f"{ticker}: ${price}, {change:.2f}% change"
\`\`\`

**Tool with Error Handling**:

\`\`\`python
class DatabaseQueryTool(BaseTool):
    name: str = "query_database"
    description: str = "Query the company database for customer information"

    def _run(self, query: str) -> str:
        try:
            result = self.db.execute(query)
            return json.dumps(result)
        except DatabaseError as e:
            return f"Database error: {str(e)}. Try a simpler query."
        except Exception as e:
            return f"Unexpected error: {str(e)}"
\`\`\`

Always return helpful error messages—the agent uses them to decide what to do next.

**Tool Best Practices**:

1. **Clear descriptions**: The LLM reads these to decide when to use the tool
2. **Typed inputs**: Use Pydantic schemas for validation
3. **Graceful errors**: Return informative messages, not exceptions
4. **Focused scope**: Each tool should do one thing well
5. **Stateless when possible**: Easier to debug and test`
      },
      {
        title: "CrewAI Flows: Event-Driven Orchestration",
        description: `Flows are CrewAI's answer to complex orchestration needs. They provide event-driven execution with state management, conditional routing, and crew composition.

**Why Flows?**

Sequential and hierarchical processes work for linear workflows. But real applications need:
- Conditional branching based on results
- Parallel execution of independent crews
- Shared state across multiple crews
- Event-driven triggers

**Basic Flow Structure**:

\`\`\`python
from crewai.flow.flow import Flow, listen, start, router

class ResearchFlow(Flow):
    @start()
    def begin_research(self):
        """Entry point - runs first."""
        return {"topic": self.inputs["topic"]}

    @listen(begin_research)
    def run_research_crew(self, state):
        """Triggered when begin_research completes."""
        crew = create_research_crew()
        result = crew.kickoff(inputs={"topic": state["topic"]})
        return {"research": result.raw}

    @listen(run_research_crew)
    def analyze_results(self, state):
        """Triggered when research completes."""
        # Access accumulated state
        research = state["research"]
        # Run analysis...
        return {"analysis": analysis_result}

# Run the flow
flow = ResearchFlow()
result = flow.kickoff(inputs={"topic": "AI trends"})
\`\`\`

**Conditional Routing**:

\`\`\`python
@router(analyze_results)
def route_by_confidence(self, state):
    """Branch based on analysis results."""
    if state["confidence"] > 0.8:
        return "publish"  # High confidence -> publish
    else:
        return "review"   # Low confidence -> human review

@listen("publish")
def auto_publish(self, state):
    # Direct to publication
    pass

@listen("review")
def human_review(self, state):
    # Route to human review process
    pass
\`\`\`

**State Management**:

Flows maintain state across methods. Each method receives the accumulated state and can add to it. This enables complex workflows where later steps depend on earlier results.`
      },
      {
        title: "Flow Patterns",
        description: `Common patterns for structuring CrewAI Flows.

**Pattern 1: Sequential Crews**

\`\`\`python
class ContentPipeline(Flow):
    @start()
    def research(self):
        crew = research_crew()
        return {"research": crew.kickoff(self.inputs).raw}

    @listen(research)
    def write(self, state):
        crew = writing_crew()
        return {"draft": crew.kickoff({"research": state["research"]}).raw}

    @listen(write)
    def edit(self, state):
        crew = editing_crew()
        return {"final": crew.kickoff({"draft": state["draft"]}).raw}
\`\`\`

**Pattern 2: Parallel Crews**

\`\`\`python
from crewai.flow.flow import and_

class ParallelResearch(Flow):
    @start()
    def init(self):
        return {"topic": self.inputs["topic"]}

    @listen(init)
    def research_academic(self, state):
        # Runs in parallel with research_industry
        return {"academic": academic_crew().kickoff(state).raw}

    @listen(init)
    def research_industry(self, state):
        # Runs in parallel with research_academic
        return {"industry": industry_crew().kickoff(state).raw}

    @listen(and_(research_academic, research_industry))
    def synthesize(self, state):
        # Waits for BOTH to complete
        return {"synthesis": combine(state["academic"], state["industry"])}
\`\`\`

**Pattern 3: Retry with Fallback**

\`\`\`python
class ResilientFlow(Flow):
    @start()
    def attempt_primary(self):
        try:
            result = primary_crew().kickoff(self.inputs)
            return {"result": result.raw, "success": True}
        except Exception as e:
            return {"error": str(e), "success": False}

    @router(attempt_primary)
    def check_success(self, state):
        return "complete" if state["success"] else "fallback"

    @listen("fallback")
    def use_fallback(self, state):
        # Try simpler approach or human escalation
        return {"result": fallback_crew().kickoff(self.inputs).raw}
\`\`\`

**Pattern 4: Human-in-the-Loop**

\`\`\`python
class ApprovalFlow(Flow):
    @start()
    def generate(self):
        return {"draft": generation_crew().kickoff(self.inputs).raw}

    @listen(generate)
    def request_approval(self, state):
        # In production, this might send an email/Slack and wait
        approval = get_human_approval(state["draft"])
        return {"approved": approval, "draft": state["draft"]}

    @router(request_approval)
    def route_approval(self, state):
        return "publish" if state["approved"] else "revise"

    @listen("revise")
    def revise_draft(self, state):
        # Send back for revision with feedback
        return {"draft": revision_crew().kickoff(state).raw}
\`\`\``
      },
      {
        title: "Error Handling and Resilience",
        description: `Production crews need robust error handling. Things will go wrong—APIs timeout, rate limits hit, LLMs hallucinate.

**Task-Level Retries**:

\`\`\`python
from tenacity import retry, stop_after_attempt, wait_exponential

class ResilientTool(BaseTool):
    name: str = "api_call"

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def _run(self, query: str) -> str:
        response = requests.get(f"https://api.example.com?q={query}")
        response.raise_for_status()
        return response.json()
\`\`\`

**Crew-Level Error Handling**:

\`\`\`python
try:
    result = crew.kickoff(inputs)
except CrewExecutionError as e:
    # Log the failure
    logger.error(f"Crew failed: {e}")
    # Try fallback or notify
    notify_ops_team(e)
    result = fallback_response()
\`\`\`

**Graceful Degradation**:

\`\`\`python
class DegradingCrew:
    def run(self, inputs):
        try:
            # Try full crew
            return self.full_crew.kickoff(inputs)
        except RateLimitError:
            # Fall back to simpler model
            return self.simple_crew.kickoff(inputs)
        except Exception:
            # Last resort: rule-based response
            return self.rule_based_fallback(inputs)
\`\`\`

**Monitoring and Observability**:

\`\`\`python
def task_callback(output):
    # Track metrics
    metrics.histogram("task_duration", output.duration)
    metrics.counter("tasks_completed").inc()

    # Log for debugging
    logger.info(f"Task completed", extra={
        "task": output.task_name,
        "agent": output.agent_role,
        "tokens": output.token_usage
    })

    # Alert on issues
    if output.token_usage > 10000:
        alert("High token usage detected")
\`\`\``
      },
      {
        title: "Production Patterns",
        description: `Patterns for deploying CrewAI in production environments.

**Configuration Management**:

\`\`\`python
from pydantic_settings import BaseSettings

class CrewSettings(BaseSettings):
    openai_api_key: str
    model_name: str = "gpt-4o"
    max_rpm: int = 60  # Rate limit
    verbose: bool = False

    class Config:
        env_file = ".env"

settings = CrewSettings()

agent = Agent(
    role="Analyst",
    llm=ChatOpenAI(
        model=settings.model_name,
        api_key=settings.openai_api_key
    ),
    verbose=settings.verbose
)
\`\`\`

**Rate Limiting**:

\`\`\`python
from crewai import Crew

crew = Crew(
    agents=[...],
    tasks=[...],
    max_rpm=60,  # Max requests per minute across crew
    share_crew=True  # Share rate limit across agents
)
\`\`\`

**Caching Results**:

\`\`\`python
import hashlib
import json
from functools import lru_cache

class CachedTool(BaseTool):
    name: str = "cached_search"

    def _run(self, query: str) -> str:
        cache_key = hashlib.md5(query.encode()).hexdigest()

        # Check cache
        cached = redis.get(cache_key)
        if cached:
            return cached

        # Compute and cache
        result = self._search(query)
        redis.setex(cache_key, 3600, result)  # 1 hour TTL
        return result
\`\`\`

**Async Execution for APIs**:

\`\`\`python
from fastapi import FastAPI, BackgroundTasks
from crewai import Crew

app = FastAPI()

@app.post("/analyze")
async def analyze(request: AnalysisRequest, background_tasks: BackgroundTasks):
    # Return immediately, process in background
    job_id = str(uuid.uuid4())
    background_tasks.add_task(run_crew, job_id, request)
    return {"job_id": job_id, "status": "processing"}

@app.get("/status/{job_id}")
async def status(job_id: str):
    return get_job_status(job_id)
\`\`\``
      }
    ],
    codeExamples: [
      {
        title: "Complete Flow with Routing",
        language: "python",
        category: "advanced",
        code: `from crewai import Agent, Task, Crew
from crewai.flow.flow import Flow, listen, start, router

class InvestmentAnalysisFlow(Flow):
    """Flow that routes based on investment risk level."""

    @start()
    def gather_data(self):
        """Entry point: collect market data."""
        data_crew = Crew(
            agents=[data_analyst],
            tasks=[data_collection_task],
            verbose=True
        )
        result = data_crew.kickoff(inputs=self.inputs)
        return {"market_data": result.raw}

    @listen(gather_data)
    def analyze_risk(self, state):
        """Analyze risk level of the investment."""
        risk_crew = Crew(
            agents=[risk_analyst],
            tasks=[risk_analysis_task],
            verbose=True
        )
        result = risk_crew.kickoff(inputs={"data": state["market_data"]})

        # Parse risk level from result
        risk_level = extract_risk_level(result.raw)
        return {"risk_level": risk_level, "analysis": result.raw}

    @router(analyze_risk)
    def route_by_risk(self, state):
        """Route to appropriate workflow based on risk."""
        if state["risk_level"] == "low":
            return "fast_track"
        elif state["risk_level"] == "medium":
            return "standard_review"
        else:
            return "deep_review"

    @listen("fast_track")
    def fast_track_approval(self, state):
        """Low risk: auto-approve with basic checks."""
        return {"recommendation": "approve", "process": "fast_track"}

    @listen("standard_review")
    def standard_review(self, state):
        """Medium risk: full analysis crew."""
        review_crew = Crew(
            agents=[senior_analyst, compliance_officer],
            tasks=[detailed_analysis, compliance_check],
            process=Process.sequential
        )
        result = review_crew.kickoff(inputs=state)
        return {"recommendation": result.raw, "process": "standard"}

    @listen("deep_review")
    def deep_review(self, state):
        """High risk: human review required."""
        # Prepare materials for human review
        prep_crew = Crew(
            agents=[analyst, writer],
            tasks=[prepare_briefing],
            verbose=True
        )
        briefing = prep_crew.kickoff(inputs=state)

        # In production, this would notify humans
        return {
            "recommendation": "requires_human_review",
            "briefing": briefing.raw,
            "process": "deep_review"
        }

# Usage
flow = InvestmentAnalysisFlow()
result = flow.kickoff(inputs={"ticker": "AAPL", "amount": 100000})`,
        explanation: "A complete Flow demonstrating routing based on risk analysis. Different risk levels trigger different review processes, from auto-approval to human review."
      },
      {
        title: "Custom Tool with Validation",
        language: "python",
        category: "intermediate",
        code: `from crewai.tools import BaseTool
from pydantic import BaseModel, Field, validator
from typing import Type
import requests

class CompanySearchInput(BaseModel):
    """Validated input for company search."""
    company_name: str = Field(
        description="Company name to search for"
    )
    include_financials: bool = Field(
        default=True,
        description="Whether to include financial data"
    )

    @validator("company_name")
    def validate_company_name(cls, v):
        if len(v) < 2:
            raise ValueError("Company name too short")
        return v.strip()

class CompanySearchTool(BaseTool):
    name: str = "company_search"
    description: str = """Search for company information.
    Returns company overview, recent news, and optionally financials.
    Use this when you need detailed information about a specific company."""
    args_schema: Type[BaseModel] = CompanySearchInput

    # Tool can have its own state
    api_key: str = None

    def __init__(self, api_key: str):
        super().__init__()
        self.api_key = api_key

    def _run(self, company_name: str, include_financials: bool = True) -> str:
        try:
            # Search for company
            overview = self._get_overview(company_name)
            news = self._get_news(company_name)

            result = f"## {company_name}\\n\\n"
            result += f"### Overview\\n{overview}\\n\\n"
            result += f"### Recent News\\n{news}\\n\\n"

            if include_financials:
                financials = self._get_financials(company_name)
                result += f"### Financials\\n{financials}"

            return result

        except requests.RequestException as e:
            return f"API error searching for {company_name}: {str(e)}"
        except Exception as e:
            return f"Error: {str(e)}. Try with a different company name."

    def _get_overview(self, name: str) -> str:
        # Implementation
        pass

    def _get_news(self, name: str) -> str:
        # Implementation
        pass

    def _get_financials(self, name: str) -> str:
        # Implementation
        pass

# Usage
tool = CompanySearchTool(api_key="your-key")
analyst = Agent(
    role="Company Analyst",
    tools=[tool],
    ...
)`,
        explanation: "A production-ready custom tool with Pydantic validation, error handling, and configurable behavior. The tool validates inputs, handles errors gracefully, and returns formatted results."
      }
    ],
    diagrams: [
      {
        title: "Flow Execution Model",
        type: "flow",
        ascii: `
    ┌─────────────────────────────────────────────────────────────┐
    │                         FLOW                                │
    │                    (Stateful Context)                       │
    └───────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
                          ┌──────────┐
                          │  @start  │ ─── Entry Point
                          └────┬─────┘
                               │
                               ▼
                          ┌──────────┐
                          │ @listen  │ ─── Reacts to Events
                          └────┬─────┘
                               │
                               ▼
                          ┌──────────┐
                          │ @router  │ ─── Conditional Branch
                          └────┬─────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         "path_a"         "path_b"         "path_c"
              │                │                │
              ▼                ▼                ▼
         ┌────────┐       ┌────────┐       ┌────────┐
         │@listen │       │@listen │       │@listen │
         │path_a  │       │path_b  │       │path_c  │
         └────────┘       └────────┘       └────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ @listen(and_(...)) │ ─── Wait for All
                    └─────────────────────┘`,
        caption: "Flow execution with @start entry, @listen reactions, and @router branching"
      }
    ],
    keyTakeaways: [
      "Tasks support callbacks, human_input, async_execution, and Pydantic output validation",
      "Custom tools need clear descriptions, typed inputs, and graceful error handling",
      "CrewAI Flows enable event-driven orchestration with @start, @listen, and @router decorators",
      "Use and_() to wait for multiple parallel paths to complete before continuing",
      "Production crews need retry logic, rate limiting, caching, and monitoring",
      "Configure crews via environment variables and Pydantic settings for different environments"
    ],
    resources: [
      { title: "CrewAI Flows Documentation", url: "https://docs.crewai.com/concepts/flows", type: "docs", description: "Official guide to event-driven flows", summaryPath: "data/day-10/summary-crewai-flows.md" },
      { title: "CrewAI Tools Guide", url: "https://docs.crewai.com/concepts/tools", type: "docs", description: "Building and using custom tools", summaryPath: "data/day-10/summary-crewai-tools.md" },
      { title: "CrewAI Task Configuration", url: "https://docs.crewai.com/concepts/tasks", type: "docs", description: "Advanced task options and callbacks" },
      { title: "Production Best Practices", url: "https://docs.crewai.com/how-to/llm-connections", type: "docs", description: "Configuring LLMs and rate limits" }
    ],
    faq: [
      {
        question: "When should I use Flows vs. regular Crews?",
        answer: "Use regular Crews for linear workflows with clear task sequences. Use Flows when you need conditional branching, parallel crew execution, persistent state across crews, or event-driven triggers. Flows add complexity, so start with Crews and migrate to Flows when you hit their limits."
      },
      {
        question: "How do I debug a Flow that's not routing correctly?",
        answer: "Add logging in your @router method to see what state it receives. Check that your router returns exact string matches for your @listen decorators. Use verbose=True on crews within the flow. Test each path independently before combining."
      },
      {
        question: "Can I have multiple @start methods in a Flow?",
        answer: "No, a Flow has exactly one @start method—the entry point. If you need multiple entry points, create separate Flows or use parameters in your single @start to branch early."
      },
      {
        question: "How do I share data between crews in a Flow?",
        answer: "Return data from each method—it accumulates in the state dict passed to subsequent methods. Each @listen method receives the full accumulated state from all previous methods in that execution path."
      }
    ],
    applications: [
      {
        title: "Document Processing Pipeline",
        description: "Flow that routes documents by type (contract, invoice, report), applies appropriate extraction crews, and handles exceptions with human escalation."
      },
      {
        title: "Customer Support Escalation",
        description: "Flow that starts with basic Q&A agent, routes complex issues to specialized crews (billing, technical, sales), and escalates unresolved cases to humans."
      },
      {
        title: "Investment Analysis Platform",
        description: "Flow that gathers market data, runs parallel analysis crews (fundamental, technical, sentiment), synthesizes findings, and routes by confidence level."
      }
    ],
    relatedDays: [9, 11, 12]
  }
};
