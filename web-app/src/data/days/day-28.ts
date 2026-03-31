import type { Day } from '../../types';

export const day28: Day = {
  day: 28,
  phase: 6,
  title: "Agent Observability (LangSmith & Phoenix)",
  partner: "LangChain / Arize",
  tags: ["observability", "tracing", "debugging", "monitoring", "production"],
  concept: "Tracing and debugging agent execution in production",
  demoUrl: "demos/day-28/",
  demoDescription: "Interactive trace visualization with span timelines, cost tracking, and error debugging",

  // ═══════════════════════════════════════════════════════════════
  // LESSON
  // ═══════════════════════════════════════════════════════════════
  lesson: {
    overview: `Agent observability transforms debugging from guesswork to precision. Unlike traditional applications where you can step through code, agents are non-deterministic systems that make decisions, call tools, and iterate in ways that vary with each run. Without observability, debugging a failed agent is like reconstructing a crime scene from memory.

The core insight: **every agent run is a trace** — a structured record of everything that happened. Each LLM call, tool invocation, and decision becomes a **span** within that trace. By capturing this data, you can replay exactly what happened, identify bottlenecks, attribute costs, and build evaluation datasets from production traffic.

Two platforms dominate this space: **LangSmith** (from LangChain) provides zero-config automatic tracing for LangChain/LangGraph applications with deep ecosystem integration. **Phoenix** (from Arize) offers vendor-neutral observability built on OpenTelemetry standards, working with any LLM framework. Both provide trace visualization, cost tracking, and production monitoring — your choice depends on your stack and vendor preferences.`,

    principles: [
      {
        title: "Traces Tell the Story",
        description: "Every agent run produces a trace containing all operations in sequence. Unlike logs that capture disconnected events, traces show causality — which LLM call triggered which tool, how the agent's reasoning evolved, and what information was available at each decision point. Without traces, debugging is reconstructing a journey from scattered footprints."
      },
      {
        title: "Spans Are Your Building Blocks",
        description: "Each operation within a trace is a span: LLM calls, tool invocations, retrievals, and custom logic. Spans have parent-child relationships showing how work flows through your agent. They capture inputs, outputs, latency, token counts, and errors — everything you need to understand what happened and why."
      },
      {
        title: "Attribute Everything",
        description: "Raw traces are useful; attributed traces are powerful. Add metadata to every span: user_id, session_id, model version, prompt template version, feature flags. This enables filtering ('show me all failures for user X'), aggregation ('cost by feature'), and correlation ('did the new prompt version improve latency?')."
      },
      {
        title: "Latency is User Experience",
        description: "Track P50, P95, and P99 latencies — averages hide problems. Use span timing to identify bottlenecks: is it the LLM call, the tool execution, or the retrieval? Set alerting thresholds based on user-facing SLAs, not internal benchmarks. A 5-second response that feels slow to users is slow, regardless of what your benchmarks say."
      },
      {
        title: "Errors Need Context",
        description: "Stack traces alone are insufficient for agent debugging. You need the LLM's reasoning that led to the error, the tool inputs that failed, the retry attempts, and the state of the conversation. Capture full context in error spans — this is what makes the difference between 'it failed' and 'I know exactly why it failed and how to fix it.'"
      },
      {
        title: "Evaluate Continuously",
        description: "Production traces become evaluation datasets. Export interesting traces (failures, edge cases, high-cost runs), add human labels or LLM-based scores, and track quality metrics over time. This closes the loop between production behavior and model improvement — you're not just monitoring, you're learning."
      }
    ],

    codeExample: {
      language: "python",
      title: "Basic LangSmith Tracing Setup",
      code: `"""Basic LangSmith Tracing Setup

Enable observability for LangChain agents with three environment variables.
Every agent run is automatically traced to your LangSmith project.
"""

import os
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate

# ══════════════════════════════════════════════════════════════
# Enable LangSmith tracing — just set these environment variables
# ══════════════════════════════════════════════════════════════
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "ls_..."  # Your LangSmith API key
os.environ["LANGCHAIN_PROJECT"] = "production-support-agent"

# Optional: Add tags to all traces for filtering
os.environ["LANGCHAIN_TAGS"] = "production,v2.1"


# ══════════════════════════════════════════════════════════════
# Define tools — these calls will be traced as child spans
# ══════════════════════════════════════════════════════════════
@tool
def search_knowledge_base(query: str) -> str:
    """Search the knowledge base for relevant articles."""
    # In production: call your vector DB or search API
    return f"Found 3 articles matching '{query}': [Article 1], [Article 2], [Article 3]"

@tool
def get_ticket_status(ticket_id: str) -> str:
    """Get the current status of a support ticket."""
    # In production: call your ticketing system API
    return f"Ticket {ticket_id}: Status=Open, Priority=High, Assigned=Support Team"


# ══════════════════════════════════════════════════════════════
# Create agent — all LLM calls are automatically traced
# ══════════════════════════════════════════════════════════════
llm = ChatAnthropic(model="claude-sonnet-4-20250514")
tools = [search_knowledge_base, get_ticket_status]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful customer support assistant. Use the available tools to help users."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)


# ══════════════════════════════════════════════════════════════
# Run the agent — trace appears in LangSmith automatically
# ══════════════════════════════════════════════════════════════
result = executor.invoke({
    "input": "What's the status of ticket TKT-12345? Also search for articles about password reset."
})

print(result["output"])

# View trace at: https://smith.langchain.com/projects/production-support-agent
# You'll see:
#   - Root span: AgentExecutor (total latency, token count)
#   - Child span: LLM call for planning (which tools to use)
#   - Child span: Tool call - search_knowledge_base
#   - Child span: Tool call - get_ticket_status
#   - Child span: LLM call for synthesis (final response)`
    },

    diagram: {
      type: "mermaid",
      title: "Trace and Span Hierarchy",
      mermaid: `flowchart TB
    subgraph Trace["Trace: agent_run_abc123"]
        A["<b>Root Span: AgentExecutor</b><br/>Total: 3.2s | Tokens: 1,847"]

        subgraph Planning["Planning Phase"]
            B["Span: LLM Call 1<br/>Intent Classification"]
            B1["Input: 250 tokens"]
            B2["Output: 45 tokens"]
            B3["Latency: 1.1s"]
        end

        subgraph Execution["Tool Execution"]
            C["Span: search_knowledge_base"]
            C1["Input: query='password reset'"]
            C2["Latency: 0.3s"]
            D["Span: get_ticket_status"]
            D1["Input: ticket_id='TKT-12345'"]
            D2["Latency: 0.2s"]
        end

        subgraph Synthesis["Response Synthesis"]
            E["Span: LLM Call 2<br/>Final Response"]
            E1["Input: 890 tokens"]
            E2["Output: 312 tokens"]
            E3["Latency: 1.6s"]
        end

        A --> B
        B --> C
        B --> D
        C --> E
        D --> E
    end

    style Trace fill:#f0f9ff,stroke:#0369a1
    style Planning fill:#fef3c7,stroke:#d97706
    style Execution fill:#dcfce7,stroke:#16a34a
    style Synthesis fill:#fae8ff,stroke:#a855f7`
    },

    keyTakeaways: [
      "Observability transforms agent debugging from guesswork to precision — every run is a trace you can replay",
      "Traces capture the full execution path; spans capture individual operations with parent-child relationships",
      "LangSmith provides automatic tracing for LangChain/LangGraph with zero configuration",
      "Phoenix offers vendor-neutral observability based on OpenTelemetry standards",
      "Cost attribution requires tracking tokens at every LLM call and multiplying by model-specific pricing",
      "Latency analysis identifies bottlenecks — track P50/P95/P99, not just averages",
      "Production traces become evaluation datasets — close the loop between monitoring and improvement"
    ],

    resources: [
      {
        title: "LangSmith Documentation",
        url: "https://docs.smith.langchain.com/",
        type: "docs",
        description: "Official docs for LangSmith tracing and evaluation",
        summaryPath: "data/day-28/summary-langsmith-docs.md"
      },
      {
        title: "Phoenix by Arize Documentation",
        url: "https://docs.arize.com/phoenix",
        type: "docs",
        description: "OpenTelemetry-based observability for LLM applications",
        summaryPath: "data/day-28/summary-phoenix-docs.md"
      },
      {
        title: "OpenTelemetry Traces Concepts",
        url: "https://opentelemetry.io/docs/concepts/signals/traces/",
        type: "docs",
        description: "Understanding the trace/span data model",
        summaryPath: "data/day-28/summary-opentelemetry-traces.md"
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // LEARN
  // ═══════════════════════════════════════════════════════════════
  learn: {
    overview: {
      summary: "Master observability for AI agents with LangSmith and Phoenix — from basic tracing to production monitoring, cost attribution, and evaluation pipelines.",
      fullDescription: `Agent observability is fundamentally different from traditional application monitoring. Agents are non-deterministic systems that make decisions, call tools, and iterate in ways that vary with each run. A single user request might trigger 3 LLM calls or 15, depending on the complexity of the task. Without observability, you're flying blind.

This module covers two leading platforms: **LangSmith** provides deep integration with the LangChain ecosystem, offering automatic tracing, dataset management, and evaluation features. **Phoenix** takes a vendor-neutral approach built on OpenTelemetry, working with any LLM framework and offering self-hosted deployment options.

You'll learn to capture traces that tell the complete story of each agent run, attribute costs to specific users and features, analyze latency to meet SLAs, debug failures with full context, and build evaluation pipelines from production traffic. By the end, you'll have the tools to operate agents in production with confidence.`,
      prerequisites: [
        "Python programming experience",
        "Basic understanding of agent architectures (Day 3-4)",
        "Familiarity with LangChain or similar frameworks (Day 6-8)"
      ],
      estimatedTime: "3-4 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "Traces and Spans",
        description: "The hierarchical data model for observability. A trace represents a complete unit of work (one agent run), containing multiple spans (individual operations). Spans have parent-child relationships — an LLM call span might be a child of an AgentExecutor span, and a tool call span might be a child of the LLM span that requested it. Each span captures timing, inputs, outputs, and metadata.",
        analogy: "A trace is like a detailed restaurant receipt — it shows every dish ordered, when it was prepared, how long it took, and the final bill. Spans are individual line items. The receipt (trace) tells the complete story; each line item (span) provides specific details.",
        gotchas: [
          "Span granularity is a trade-off: too fine wastes storage, too coarse loses debugging detail",
          "Async operations need careful parent tracking to maintain correct hierarchy",
          "Large payloads in spans can explode storage costs — summarize or truncate"
        ]
      },
      {
        title: "LangSmith Architecture",
        description: "LangChain's native observability platform with automatic instrumentation. Set three environment variables and every LangChain/LangGraph operation is traced automatically — no code changes required. LangSmith organizes traces by project, supports tagging and filtering, and provides a web UI for exploration. It also includes dataset management for evaluation and a prompt playground for iteration.",
        analogy: "LangSmith is like having a flight recorder built into your agent. Every decision, every tool call, every LLM response is captured automatically. After a crash (or just a confusing result), you can replay the recording to see exactly what happened.",
        gotchas: [
          "Requires LangChain/LangGraph for automatic tracing — other frameworks need manual instrumentation",
          "API key management across dev/staging/prod environments needs attention",
          "Data retention and privacy: traces contain potentially sensitive data"
        ]
      },
      {
        title: "Phoenix (Arize)",
        description: "Open-source observability built on OpenTelemetry, working with any LLM framework. Phoenix provides instrumentation libraries for LangChain, OpenAI, Anthropic, LlamaIndex, and more. It can run locally (great for development) or connect to Arize's hosted platform. The OpenTelemetry foundation means traces are portable and can integrate with existing observability infrastructure.",
        analogy: "Phoenix is like a universal translator for agent telemetry. It speaks OpenTelemetry, the lingua franca of observability, so it works with any framework that does too. Your traces aren't locked into one vendor's format.",
        gotchas: [
          "Requires explicit instrumentation setup (unlike LangSmith's automatic approach)",
          "Self-hosted option needs infrastructure management",
          "OpenTelemetry concepts have a learning curve if you're new to observability"
        ]
      },
      {
        title: "Cost Attribution",
        description: "Tracking token usage and computing costs per trace, user, or feature. Every LLM call reports input and output tokens; multiply by model-specific pricing to get cost. Aggregate across traces to answer 'how much did user X cost us this month?' or 'which feature consumes the most tokens?' Cost attribution enables budgeting, chargeback, and optimization decisions.",
        analogy: "Cost attribution is like an itemized phone bill. You can see exactly which calls (LLM invocations) are running up your charges, who made them, and when. Without itemization, you just get a scary total with no way to optimize.",
        gotchas: [
          "Different models have different pricing structures (input vs output, cached tokens)",
          "Pricing changes — your cost calculation code needs model-specific pricing tables that stay updated",
          "Streaming responses may not report token counts until completion"
        ]
      },
      {
        title: "Latency Analysis",
        description: "Breaking down end-to-end latency to identify bottlenecks. A 5-second agent response might be 3 seconds of LLM calls, 1 second of tool execution, and 1 second of overhead. Track P50, P95, and P99 latencies — averages hide the long tail that ruins user experience. Set alerting thresholds based on SLAs, not internal benchmarks.",
        analogy: "Latency analysis is like timing each leg of a relay race. You might find the second runner (tool execution) is fast, but the baton passes (LLM calls) are slow. Knowing which leg is the bottleneck tells you where to focus optimization.",
        gotchas: [
          "Network latency vs processing time — distinguish between waiting and working",
          "Cold starts in serverless environments skew metrics",
          "Percentiles matter more than averages — P99 reveals worst-case user experience"
        ]
      },
      {
        title: "Error Tracking and Debugging",
        description: "Capturing failures with full context for root cause analysis. When an agent fails, you need more than a stack trace — you need the LLM's reasoning that led to the error, the tool inputs that failed, the retry attempts, and the conversation state. Good error tracking makes the difference between 'it broke' and 'I know exactly why and how to fix it.'",
        analogy: "Error tracking with traces is like having security camera footage of a crime. You see exactly what happened, in what order, with all the context. Without footage, you're interviewing witnesses who remember different things.",
        gotchas: [
          "Sensitive data in error contexts needs redaction before storage",
          "Partial traces from crashes need careful handling — ensure errors are recorded even if the trace doesn't complete",
          "Error categorization requires domain knowledge — 'timeout' means different things in different contexts"
        ]
      },
      {
        title: "Callbacks and Instrumentation",
        description: "The mechanism for capturing telemetry data during agent execution. Callbacks are hooks that fire at key points: on_llm_start, on_llm_end, on_tool_start, on_tool_end, on_error. They receive context about what's happening and can record it to your observability platform. LangSmith uses callbacks internally; Phoenix provides OpenTelemetry instrumentation that wraps framework calls.",
        analogy: "Callbacks are like reporters stationed at key points in your agent's journey, filing updates about what's happening at each stage. The reports (spans) get assembled into a complete story (trace) at the end.",
        gotchas: [
          "Callback overhead can impact performance — keep processing minimal",
          "Async callbacks need careful error handling to avoid swallowing exceptions",
          "Custom callbacks require maintenance as frameworks evolve their callback signatures"
        ]
      },
      {
        title: "Evaluation from Production Data",
        description: "Using production traces to build evaluation datasets and measure quality. Export interesting traces (failures, edge cases, high-cost runs), add human labels or LLM-based scores, and track metrics over time. This closes the loop between production behavior and model improvement — you're learning from real users, not just test cases.",
        analogy: "It's like a restaurant tracking which dishes get sent back and which get compliments. You learn from real customer feedback, not just test kitchen results. The dishes that fail in production teach you more than the ones that pass QA.",
        gotchas: [
          "Selection bias — 'interesting' traces may not be representative",
          "Ground truth labeling is expensive — consider LLM-based evaluation for scale",
          "Evaluation metrics need to match business goals, not just model capabilities"
        ]
      }
    ],

    codeExamples: [
      {
        title: "LangSmith: Basic Tracing Configuration",
        language: "python",
        category: "basic",
        code: `"""LangSmith: Basic Tracing Configuration

Zero-code tracing for LangChain applications. Set environment
variables and every operation is captured automatically.
"""

import os
from langsmith import Client
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool

# ══════════════════════════════════════════════════════════════
# Configure LangSmith — this is all you need for automatic tracing
# ══════════════════════════════════════════════════════════════
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "ls_..."
os.environ["LANGCHAIN_PROJECT"] = "inventory-agent"

# Optional: Add metadata to all traces for filtering
os.environ["LANGCHAIN_TAGS"] = "production,v2.1,inventory"


@tool
def search_products(query: str) -> str:
    """Search the product catalog."""
    return f"Found 5 products matching '{query}'"

@tool
def check_inventory(product_id: str) -> str:
    """Check inventory levels for a product."""
    return f"Product {product_id}: 42 units in stock"

@tool
def place_order(product_id: str, quantity: int) -> str:
    """Place an order for a product."""
    return f"Order placed: {quantity}x {product_id}, confirmation #ORD-12345"


# Create traced agent
llm = ChatAnthropic(model="claude-sonnet-4-20250514")
tools = [search_products, check_inventory, place_order]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an inventory assistant. Help users find products, check stock, and place orders."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# ══════════════════════════════════════════════════════════════
# Run with automatic tracing
# ══════════════════════════════════════════════════════════════
result = executor.invoke({
    "input": "Find laptops, check inventory for the first one, and order 5 units"
})

print(result["output"])

# View trace at: https://smith.langchain.com/projects/inventory-agent
# The trace shows:
#   - AgentExecutor (root span with total cost/latency)
#   - LLM calls (with token counts)
#   - Tool calls (with inputs/outputs)
#   - Decision flow (which tool was called and why)`,
        explanation: "LangSmith automatic tracing requires only environment variables. Every LangChain operation — LLM calls, tool invocations, chain executions — is captured as spans within a trace. The trace appears in your LangSmith project dashboard where you can explore timing, tokens, and errors."
      },
      {
        title: "Phoenix: OpenTelemetry-Based Tracing",
        language: "python",
        category: "intermediate",
        code: `"""Phoenix: OpenTelemetry-Based Tracing

Vendor-neutral observability that works with any LLM framework.
Uses OpenTelemetry standards for portable, extensible tracing.
"""

import phoenix as px
from phoenix.otel import register
from openinference.instrumentation.langchain import LangChainInstrumentor
from openinference.instrumentation.openai import OpenAIInstrumentor

# ══════════════════════════════════════════════════════════════
# Start Phoenix — can run locally or connect to hosted service
# ══════════════════════════════════════════════════════════════
# Option 1: Local Phoenix server (great for development)
px.launch_app()

# Option 2: Connect to hosted Phoenix/Arize
# px.Client(endpoint="https://your-phoenix-instance.com")


# ══════════════════════════════════════════════════════════════
# Register OpenTelemetry tracer and instrument frameworks
# ══════════════════════════════════════════════════════════════
tracer_provider = register(
    project_name="my-agent",
    endpoint="http://localhost:6006/v1/traces"  # Local Phoenix
)

# Instrument the frameworks you're using
LangChainInstrumentor().instrument(tracer_provider=tracer_provider)
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)

# Now all LangChain and OpenAI calls are automatically traced


# ══════════════════════════════════════════════════════════════
# Example: Mixed framework usage — all traced to Phoenix
# ══════════════════════════════════════════════════════════════
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from openai import OpenAI

# LangChain calls are traced
langchain_llm = ChatOpenAI(model="gpt-4o")
response1 = langchain_llm.invoke([HumanMessage(content="Hello from LangChain!")])
print(f"LangChain: {response1.content}")

# Direct OpenAI calls are also traced
openai_client = OpenAI()
response2 = openai_client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello from OpenAI SDK!"}]
)
print(f"OpenAI: {response2.choices[0].message.content}")

# View traces at: http://localhost:6006
# Phoenix shows both calls with:
#   - Framework identification (LangChain vs OpenAI)
#   - Token counts and latency
#   - Full request/response payloads`,
        explanation: "Phoenix uses OpenTelemetry, the industry standard for observability. This means traces are portable and can integrate with existing infrastructure (Jaeger, Zipkin, Datadog). The openinference instrumentation libraries automatically wrap framework calls to capture telemetry."
      },
      {
        title: "Custom Cost and Latency Tracking",
        language: "python",
        category: "intermediate",
        code: `"""Custom Observability: Cost Attribution & Latency Analysis

Build your own cost tracking when you need fine-grained control
or want to integrate with existing systems.
"""

import time
from dataclasses import dataclass, field
from typing import Any
from langchain.callbacks.base import BaseCallbackHandler
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage

# ══════════════════════════════════════════════════════════════
# Model pricing (per 1M tokens, as of early 2025)
# ══════════════════════════════════════════════════════════════
MODEL_PRICING = {
    "claude-sonnet-4-20250514": {"input": 3.00, "output": 15.00},
    "claude-3-5-haiku-20241022": {"input": 0.80, "output": 4.00},
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
}


@dataclass
class TraceMetrics:
    """Accumulated metrics for a single trace."""
    total_tokens_in: int = 0
    total_tokens_out: int = 0
    total_cost_usd: float = 0.0
    llm_calls: int = 0
    total_latency_ms: float = 0.0
    spans: list = field(default_factory=list)


class CostTrackingCallback(BaseCallbackHandler):
    """Custom callback that tracks cost and latency per LLM call."""

    def __init__(self, trace_id: str):
        self.trace_id = trace_id
        self.metrics = TraceMetrics()
        self._start_times: dict[str, float] = {}

    def on_llm_start(self, serialized: dict, prompts: list, **kwargs) -> None:
        """Record start time when LLM call begins."""
        run_id = str(kwargs.get("run_id", "unknown"))
        self._start_times[run_id] = time.time()

    def on_llm_end(self, response: Any, **kwargs) -> None:
        """Calculate cost and latency when LLM call completes."""
        run_id = str(kwargs.get("run_id", "unknown"))
        end_time = time.time()
        start_time = self._start_times.pop(run_id, end_time)
        latency_ms = (end_time - start_time) * 1000

        # Extract token usage from response
        usage = response.llm_output.get("usage", {})
        tokens_in = usage.get("input_tokens", 0)
        tokens_out = usage.get("output_tokens", 0)

        # Get model name for pricing lookup
        model = response.llm_output.get("model_name", "unknown")
        pricing = MODEL_PRICING.get(model, {"input": 0, "output": 0})

        # Calculate cost in USD
        cost = (tokens_in * pricing["input"] + tokens_out * pricing["output"]) / 1_000_000

        # Update aggregate metrics
        self.metrics.total_tokens_in += tokens_in
        self.metrics.total_tokens_out += tokens_out
        self.metrics.total_cost_usd += cost
        self.metrics.llm_calls += 1
        self.metrics.total_latency_ms += latency_ms

        # Record individual span
        self.metrics.spans.append({
            "type": "llm",
            "model": model,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "cost_usd": cost,
            "latency_ms": latency_ms
        })

    def get_report(self) -> dict:
        """Generate summary report for this trace."""
        return {
            "trace_id": self.trace_id,
            "total_cost": f"\${self.metrics.total_cost_usd:.6f}",
            "total_tokens": self.metrics.total_tokens_in + self.metrics.total_tokens_out,
            "token_breakdown": {
                "input": self.metrics.total_tokens_in,
                "output": self.metrics.total_tokens_out
            },
            "llm_calls": self.metrics.llm_calls,
            "total_latency_ms": round(self.metrics.total_latency_ms, 1),
            "avg_latency_ms": round(
                self.metrics.total_latency_ms / max(self.metrics.llm_calls, 1), 1
            ),
            "spans": self.metrics.spans
        }


# ══════════════════════════════════════════════════════════════
# Usage example
# ══════════════════════════════════════════════════════════════
callback = CostTrackingCallback(trace_id="trace_12345")
llm = ChatAnthropic(model="claude-sonnet-4-20250514", callbacks=[callback])

# Make multiple calls
response1 = llm.invoke([HumanMessage(content="Explain quantum computing in one paragraph.")])
response2 = llm.invoke([HumanMessage(content="Now explain it to a 5-year-old.")])

# Get the report
report = callback.get_report()
print(f"Trace: {report['trace_id']}")
print(f"Total Cost: {report['total_cost']}")
print(f"Total Tokens: {report['total_tokens']} ({report['token_breakdown']})")
print(f"LLM Calls: {report['llm_calls']}")
print(f"Total Latency: {report['total_latency_ms']}ms")
print(f"Avg Latency: {report['avg_latency_ms']}ms")

# Output:
# Trace: trace_12345
# Total Cost: $0.002847
# Total Tokens: 523 ({'input': 412, 'output': 111})
# LLM Calls: 2
# Total Latency: 2340.5ms
# Avg Latency: 1170.2ms`,
        explanation: "Custom callbacks give you full control over telemetry. This pattern is useful when integrating with existing monitoring systems, implementing custom pricing logic, or adding business-specific metrics. The callback pattern works with any LangChain component."
      },
      {
        title: "Production Monitoring and Alerting",
        language: "python",
        category: "advanced",
        code: `"""Production Monitoring: Metrics, Alerts, and Dashboards

Query LangSmith programmatically to build monitoring dashboards
and trigger alerts when agents misbehave.
"""

import os
from datetime import datetime, timedelta
from dataclasses import dataclass
from langsmith import Client

os.environ["LANGCHAIN_API_KEY"] = "ls_..."


@dataclass
class AlertThresholds:
    """Configurable thresholds for production alerts."""
    max_cost_per_trace_usd: float = 0.50
    max_latency_p95_ms: float = 5000
    max_error_rate_pct: float = 5.0
    min_traces_for_alert: int = 100


class ProductionMonitor:
    """Monitor production agent performance and trigger alerts."""

    def __init__(self, project_name: str, thresholds: AlertThresholds | None = None):
        self.client = Client()
        self.project_name = project_name
        self.thresholds = thresholds or AlertThresholds()

    def get_recent_metrics(self, hours: int = 1) -> dict:
        """Fetch metrics from recent traces."""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)

        # Query LangSmith for recent runs
        runs = list(self.client.list_runs(
            project_name=self.project_name,
            start_time=start_time,
            end_time=end_time,
            is_root=True  # Only top-level traces
        ))

        if not runs:
            return {"status": "no_data", "trace_count": 0}

        # Calculate metrics
        costs: list[float] = []
        latencies: list[float] = []
        errors = 0

        for run in runs:
            # Cost calculation from token counts
            if run.total_tokens:
                # Simplified: $0.01 per 1K tokens (adjust per model)
                cost = run.total_tokens * 0.00001
                costs.append(cost)

            # Latency calculation
            if run.end_time and run.start_time:
                latency_ms = (run.end_time - run.start_time).total_seconds() * 1000
                latencies.append(latency_ms)

            # Error counting
            if run.error:
                errors += 1

        # Calculate percentiles
        sorted_latencies = sorted(latencies)
        p50_idx = len(sorted_latencies) // 2
        p95_idx = int(len(sorted_latencies) * 0.95)

        return {
            "status": "ok",
            "trace_count": len(runs),
            "cost": {
                "avg_usd": sum(costs) / len(costs) if costs else 0,
                "max_usd": max(costs) if costs else 0,
                "total_usd": sum(costs)
            },
            "latency": {
                "p50_ms": sorted_latencies[p50_idx] if sorted_latencies else 0,
                "p95_ms": sorted_latencies[p95_idx] if len(sorted_latencies) > 20 else max(latencies, default=0),
                "avg_ms": sum(latencies) / len(latencies) if latencies else 0
            },
            "errors": {
                "count": errors,
                "rate_pct": (errors / len(runs)) * 100 if runs else 0
            }
        }

    def check_alerts(self, metrics: dict) -> list[dict]:
        """Check metrics against thresholds and return alerts."""
        alerts = []

        if metrics["trace_count"] < self.thresholds.min_traces_for_alert:
            return alerts  # Not enough data for meaningful alerts

        # Cost alert
        if metrics["cost"]["max_usd"] > self.thresholds.max_cost_per_trace_usd:
            alerts.append({
                "severity": "warning",
                "type": "cost_spike",
                "message": f"High cost trace: \${metrics['cost']['max_usd']:.4f}",
                "threshold": self.thresholds.max_cost_per_trace_usd,
                "runbook": "Check for infinite loops or excessive tool calls"
            })

        # Latency alert
        if metrics["latency"]["p95_ms"] > self.thresholds.max_latency_p95_ms:
            alerts.append({
                "severity": "critical",
                "type": "latency_degradation",
                "message": f"P95 latency exceeded: {metrics['latency']['p95_ms']:.0f}ms",
                "threshold": self.thresholds.max_latency_p95_ms,
                "runbook": "Check LLM provider status, review slow spans"
            })

        # Error rate alert
        if metrics["errors"]["rate_pct"] > self.thresholds.max_error_rate_pct:
            alerts.append({
                "severity": "critical",
                "type": "error_rate",
                "message": f"Error rate elevated: {metrics['errors']['rate_pct']:.1f}%",
                "threshold": self.thresholds.max_error_rate_pct,
                "runbook": "Review error traces, check for provider outages"
            })

        return alerts

    def get_dashboard(self) -> dict:
        """Get data for monitoring dashboard."""
        hourly = self.get_recent_metrics(hours=1)
        daily = self.get_recent_metrics(hours=24)
        alerts = self.check_alerts(hourly)

        return {
            "last_hour": hourly,
            "last_24h": daily,
            "active_alerts": alerts,
            "status": "degraded" if alerts else "healthy",
            "checked_at": datetime.utcnow().isoformat()
        }


# ══════════════════════════════════════════════════════════════
# Usage
# ══════════════════════════════════════════════════════════════
monitor = ProductionMonitor(
    project_name="production-support-agent",
    thresholds=AlertThresholds(
        max_cost_per_trace_usd=0.25,
        max_latency_p95_ms=3000,
        max_error_rate_pct=2.0
    )
)

dashboard = monitor.get_dashboard()

print(f"Status: {dashboard['status'].upper()}")
print(f"Last Hour: {dashboard['last_hour']['trace_count']} traces")
print(f"  Avg Cost: \${dashboard['last_hour']['cost']['avg_usd']:.4f}")
print(f"  P95 Latency: {dashboard['last_hour']['latency']['p95_ms']:.0f}ms")
print(f"  Error Rate: {dashboard['last_hour']['errors']['rate_pct']:.1f}%")

if dashboard['active_alerts']:
    print(f"\\nAlerts ({len(dashboard['active_alerts'])}):")
    for alert in dashboard['active_alerts']:
        print(f"  [{alert['severity'].upper()}] {alert['message']}")
        print(f"    Runbook: {alert['runbook']}")`,
        explanation: "Production monitoring requires proactive alerting. This pattern queries LangSmith programmatically to calculate metrics and check against thresholds. In production, you'd run this on a schedule (cron, Lambda) and send alerts to Slack, PagerDuty, or your incident management system."
      }
    ],

    diagrams: [
      {
        title: "Observability Architecture",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Application["Agent Application"]
        A[Agent Executor]
        B[LLM Calls]
        C[Tool Calls]
        D[Callbacks / Instrumentation]
    end

    subgraph Pipeline["Telemetry Pipeline"]
        E[Span Collector]
        F[Trace Assembler]
        G[Metrics Aggregator]
    end

    subgraph Platform["Observability Platform"]
        H[(Trace Storage)]
        I[Query Engine]
        J[Dashboard UI]
        K[Alerting]
        L[Evaluation]
    end

    A --> D
    B --> D
    C --> D
    D -->|"spans"| E
    E --> F
    F --> H
    E --> G
    G --> K
    H --> I
    I --> J
    H --> L

    style Application fill:#e0f2fe,stroke:#0284c7
    style Pipeline fill:#fef3c7,stroke:#d97706
    style Platform fill:#dcfce7,stroke:#16a34a`,
        caption: "Agent observability data flows from instrumented application code through a telemetry pipeline to storage, dashboards, and alerting systems."
      },
      {
        title: "Span Hierarchy in Agent Execution",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph Trace["Trace: Complete Agent Run (4.2s)"]
        direction TB
        R["<b>Root Span</b><br/>AgentExecutor<br/>4.2s total"]

        subgraph Iter1["Iteration 1"]
            L1["LLM: Planning<br/>1.1s, 295 tokens"]
            T1["Tool: search<br/>0.4s"]
        end

        subgraph Iter2["Iteration 2"]
            L2["LLM: Reasoning<br/>0.9s, 412 tokens"]
            T2["Tool: calculate<br/>0.2s"]
        end

        subgraph Final["Final"]
            L3["LLM: Synthesis<br/>1.6s, 523 tokens"]
        end

        R --> L1
        L1 --> T1
        T1 --> L2
        L2 --> T2
        T2 --> L3
    end

    style R fill:#f0f9ff,stroke:#0369a1
    style Iter1 fill:#fef3c7,stroke:#d97706
    style Iter2 fill:#fef3c7,stroke:#d97706
    style Final fill:#dcfce7,stroke:#16a34a`,
        caption: "Each agent iteration creates nested spans. The trace captures the full decision-making journey with timing and token counts at each step."
      },
      {
        title: "LangSmith vs Phoenix Comparison",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph LangSmith["LangSmith (LangChain)"]
        LS1[Automatic LangChain Tracing]
        LS2[Dataset Management]
        LS3[Evaluation Hub]
        LS4[Prompt Playground]
        LS5[Hosted Cloud Service]
    end

    subgraph Phoenix["Phoenix (Arize)"]
        PH1[OpenTelemetry Standard]
        PH2[Multi-Framework Support]
        PH3[Self-Hosted Option]
        PH4[Embeddings Analysis]
        PH5[Drift Detection]
    end

    subgraph Common["Shared Capabilities"]
        C1[Trace Visualization]
        C2[Latency Analysis]
        C3[Cost Tracking]
        C4[Error Debugging]
        C5[Production Monitoring]
    end

    LangSmith --> Common
    Phoenix --> Common

    style LangSmith fill:#f0f9ff,stroke:#0369a1
    style Phoenix fill:#fef3c7,stroke:#d97706
    style Common fill:#dcfce7,stroke:#16a34a`,
        caption: "Both platforms provide core observability features. LangSmith excels with LangChain integration; Phoenix offers vendor neutrality and self-hosting."
      }
    ],

    faq: [
      {
        question: "When should I use LangSmith vs Phoenix?",
        answer: "Use LangSmith if you're building with LangChain/LangGraph — it provides zero-config automatic tracing and deep ecosystem integration (datasets, evaluation, prompt playground). Choose Phoenix if you need vendor neutrality, want to use OpenTelemetry standards for portability, work with multiple frameworks (OpenAI SDK, Anthropic SDK, LlamaIndex), or require a self-hosted option for data sovereignty. Both provide excellent trace visualization, cost tracking, and production monitoring."
      },
      {
        question: "How much overhead does tracing add to my agent?",
        answer: "Minimal — typically 1-5ms per span for local collection. Callbacks are designed to be non-blocking, and data is batched for async transmission to the observability platform. The real cost is storage, which can grow quickly with detailed span payloads (full prompts, tool outputs). Most platforms offer sampling to reduce volume while maintaining statistical significance. In production, the observability value far outweighs the small performance cost."
      },
      {
        question: "How do I calculate the cost of each agent run?",
        answer: "Track token counts at each LLM call (input_tokens + output_tokens from the API response), multiply by model-specific pricing per million tokens, and sum across all LLM spans in the trace. Store total cost in trace metadata for easy aggregation. Include any external costs (API calls, compute time) if significant. Set up alerting on cost anomalies to catch runaway agents early."
      },
      {
        question: "What should I capture in span attributes?",
        answer: "Essential: model name, token counts (input/output), latency, error status. Recommended: user_id, session_id, prompt template version, temperature, tool inputs/outputs (summarized if large). Avoid: PII, full prompt text for very long prompts (summarize instead), large binary data, credentials. Use attribute cardinality wisely — high-cardinality attributes (unique user IDs) enable filtering but increase storage."
      },
      {
        question: "How do I debug a failing agent with traces?",
        answer: "Start from the failed trace's root span and follow child spans chronologically. Look for: (1) the last successful span before failure, (2) error messages and stack traces in the failed span, (3) LLM outputs that show incorrect reasoning (the model misunderstood something), (4) tool inputs that may have been malformed. Compare with successful traces handling similar queries to spot divergence points. The trace shows exactly what the agent saw and did — the bug is usually in what it decided, not what it executed."
      },
      {
        question: "Can I use traces for evaluation?",
        answer: "Yes — this is one of the most powerful patterns. Export production traces as evaluation datasets, add human labels (correct/incorrect, quality scores) or use LLM-based evaluation at scale, and track metrics over time. LangSmith has built-in features for this workflow; Phoenix integrates with external evaluation frameworks. This closes the loop between production behavior and model improvement — you're learning from real users, not just synthetic tests."
      },
      {
        question: "How do I handle sensitive data in traces?",
        answer: "Implement redaction callbacks that scrub PII before sending to the observability platform. Both LangSmith and Phoenix support custom preprocessing. Use regex patterns for common PII (emails, phone numbers, SSNs) and domain-specific patterns (account numbers, medical IDs). For highly sensitive applications, consider self-hosted Phoenix or on-premise deployment. Never log credentials, API keys, or auth tokens in span attributes."
      },
      {
        question: "What alerting thresholds should I set for production agents?",
        answer: "Start with: latency P95 > 2x your SLA target (if SLA is 3s, alert at 6s P95), error rate > 2% over 15 minutes, cost per trace > 2x your average. Refine based on your application's sensitivity and baseline. Set up tiered alerts: warnings for degradation (approaching thresholds), critical for outages (thresholds exceeded significantly). Include runbook links in alert messages to speed up incident response."
      }
    ],

    applications: [
      {
        title: "Customer Support Agents",
        description: "Track resolution time, escalation rate, and per-ticket cost. Debug failed resolutions by reviewing trace context to see what information the agent had and why it made wrong decisions. Identify common failure patterns to build training data and improve prompts."
      },
      {
        title: "Research Assistants",
        description: "Monitor source retrieval quality and citation accuracy through traces. Track cost per research query for budgeting across teams. Analyze latency breakdown between retrieval (vector search) and synthesis (LLM) to optimize the right component."
      },
      {
        title: "Code Generation Agents",
        description: "Measure compilation success rate from traces — every failed compile is a trace you can analyze. Debug incorrect code by examining the LLM reasoning steps that led to bugs. Track token efficiency for complex codegen tasks where prompt engineering significantly impacts cost."
      },
      {
        title: "Data Analysis Pipelines",
        description: "Cost attribution by analyst, query type, or dataset enables internal chargeback. Set latency SLAs for interactive queries (under 30s) vs batch queries (under 5 minutes). Track SQL generation failures by query complexity to identify where the agent needs improvement."
      },
      {
        title: "Multi-Agent Systems",
        description: "Cross-agent trace correlation is essential for debugging distributed workflows. A trace should follow the request across all agents involved, showing handoffs and delegation. Identify bottleneck agents that slow down the whole system. Track handoff quality — is the receiving agent getting the context it needs?"
      }
    ],

    keyTakeaways: [
      "Observability is not optional for production agents — without traces, debugging is guesswork",
      "A trace captures the complete agent run; spans capture individual operations with parent-child hierarchy",
      "LangSmith: zero-config for LangChain, includes datasets and evaluation, cloud-hosted",
      "Phoenix: OpenTelemetry-based, vendor-neutral, supports self-hosting, works with any framework",
      "Cost attribution = tokens × pricing, tracked at every LLM call and aggregated by user/feature",
      "Track P50, P95, P99 latencies — averages hide the long tail that frustrates users",
      "Error debugging needs full context: the LLM reasoning, tool inputs, and conversation state",
      "Production alerts: latency > 2x SLA, error rate > 2%, cost > 2x average",
      "Traces become evaluation datasets — close the loop between production and improvement",
      "Start with automatic tracing (LangSmith or Phoenix instrumentation), add custom metrics as needed"
    ],

    resources: [
      {
        title: "LangSmith Documentation",
        url: "https://docs.smith.langchain.com/",
        type: "docs",
        description: "Official docs for LangSmith tracing, datasets, and evaluation",
        summaryPath: "data/day-28/summary-langsmith-docs.md"
      },
      {
        title: "Phoenix by Arize Documentation",
        url: "https://docs.arize.com/phoenix",
        type: "docs",
        description: "OpenTelemetry-based observability for LLM applications",
        summaryPath: "data/day-28/summary-phoenix-docs.md"
      },
      {
        title: "OpenTelemetry Traces Concepts",
        url: "https://opentelemetry.io/docs/concepts/signals/traces/",
        type: "docs",
        description: "Understanding the trace/span data model that Phoenix is built on",
        summaryPath: "data/day-28/summary-opentelemetry-traces.md"
      },
      {
        title: "LangSmith Cookbook",
        url: "https://github.com/langchain-ai/langsmith-cookbook",
        type: "github",
        description: "Practical examples for tracing, evaluation, and production workflows"
      },
      {
        title: "OpenInference Instrumentation",
        url: "https://github.com/Arize-ai/openinference",
        type: "github",
        description: "OpenTelemetry instrumentation libraries for LLM frameworks"
      },
      {
        title: "Arize AI Blog: LLM Observability",
        url: "https://arize.com/blog-course/llm-observability/",
        type: "article",
        description: "Best practices for production LLM monitoring"
      }
    ],

    relatedDays: [7, 8, 29, 30]
  }
};
