import type { Day } from '../../types';

export const day06: Day = {
  day: 6,
  phase: 2,
  title: "LangChain: Functions, Tools & Agents",
  partner: "LangChain",
  tags: ["langchain", "tools", "agents", "bind_tools"],
  concept: "Building agents with tools using LangChain's bind_tools() interface",
  demoUrl: "demos/day-6/",
  demoDescription: "Build a toolbox for your agent, simulate how agents reason about tool selection, and step through the complete tool-calling lifecycle from binding to execution.",
  learn: {
    overview: {
      summary: "Learn how to build LangChain agents that can take action in the real world through tools.",
      fullDescription: `Tools transform language models from "thinking" to "doing." Without tools, an LLM can only generate text. With tools, it can search the web, query databases, call APIs, execute code, and interact with virtually any external system.

LangChain provides a unified interface for tool-based agents that works across all major model providers. The core abstraction is elegantly simple: define tools with clear descriptions, bind them to a model, and let the model decide which tools to call based on the user's request.

**The Tool Calling Revolution**

In 2023-2024, every major model provider introduced native tool calling (also called function calling). Instead of relying on prompt engineering to extract structured actions, models now output explicit tool invocations with structured arguments. LangChain's bind_tools() interface provides a provider-agnostic way to leverage this capability.

**What You'll Learn**

This day covers the complete LangChain tools and agents ecosystem:

1. **Tools**: Creating custom tools with @tool, using built-in tools (search, Wikipedia, calculators), and understanding tool schemas
2. **Tool Calling Interface**: The bind_tools() method, AIMessage.tool_calls, and ToolMessage for results
3. **Agents**: How AgentExecutor orchestrates the tool-calling loop, handles errors, and manages iteration
4. **LangChain vs LangGraph**: When to use the simpler LangChain agents vs the more powerful LangGraph framework

**Why LangChain for Tools?**

LangChain's main value proposition for tools is **provider abstraction**. The same tool definition works with OpenAI, Anthropic, Google, Mistral, and others. You write tools once, and they work everywhere.

By the end of this day, you'll be able to build production-ready agents that can take meaningful action in the world—not just generate text about taking action.`,
      prerequisites: ["Day 1-5: Agent fundamentals and patterns", "Basic Python and async programming", "Familiarity with LLM APIs (OpenAI/Anthropic)"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "Tools: The Agent's Interface to the World",
        description: "A tool is a function that an agent can invoke to perform a specific task. Each tool has a name, description (critical for model reasoning), input schema (parameters), and the actual function code. The description is how the model decides when to use the tool—clear, specific descriptions dramatically improve reliability.",
        analogy: "Tools are like apps on a smartphone. The phone (model) is powerful on its own, but apps let it do specific things: check weather, send messages, take photos. Each app has a clear purpose.",
        gotchas: ["Vague descriptions lead to wrong tool selection", "Too many tools (>5-7) confuse the model", "Missing error handling crashes the agent loop"]
      },
      {
        title: "The @tool Decorator",
        description: "LangChain's simplest way to create tools. Decorate a function with @tool, and LangChain extracts the name from the function, the description from the docstring, and the schema from type hints. The docstring is critical—it's what the model reads to decide when to use the tool.",
        analogy: "Like writing a clear label for a kitchen drawer. 'Utensils' is vague. 'Cooking spoons, spatulas, and whisks' tells you exactly what's inside.",
        gotchas: ["Always include a docstring—no docstring = unusable tool", "Use type hints for reliable schema generation", "Return strings for model consumption"]
      },
      {
        title: "bind_tools(): The Universal Interface",
        description: "The bind_tools() method attaches tools to any chat model that supports tool calling. It accepts LangChain tools, Pydantic models, plain functions, or raw JSON schemas. This abstraction lets you write tools once and use them with any provider.",
        analogy: "Like a universal power adapter. Your tool (device) works in any country (model provider) through the same interface.",
        gotchas: ["Not all models support tool calling equally well", "Some models support parallel tool calls, others don't", "Use tool_choice parameter to force or prevent tool use"]
      },
      {
        title: "AIMessage.tool_calls",
        description: "When a model decides to call tools, the response includes a tool_calls attribute with structured invocations. Each tool call has an id (for tracking), name (which tool), and args (the parameters). This standardized format works across all providers.",
        gotchas: ["Always check if tool_calls exists before processing", "Models can request multiple parallel tool calls", "The id is required when returning ToolMessage results"]
      },
      {
        title: "The Agent Loop",
        description: "An agent is a loop: invoke model, check for tool calls, execute tools, feed results back, repeat until done. AgentExecutor handles this loop, plus error handling, iteration limits, and parsing. It's the runtime that turns a model + tools into an autonomous agent.",
        analogy: "Like a chef working through a recipe. Read step, do step, check result, read next step. Keep going until the dish is complete.",
        gotchas: ["Always set max_iterations to prevent infinite loops", "Use handle_parsing_errors=True for robustness", "Consider timeouts for long-running tools"]
      },
      {
        title: "LangChain vs LangGraph for Agents",
        description: "LangChain agents (AgentExecutor) are simple and fast to build—great for prototypes and straightforward use cases. LangGraph agents offer more control: custom state, conditional edges, cycles, checkpointing, and human-in-the-loop. Start with LangChain, graduate to LangGraph for production.",
        gotchas: ["LangChain agents can't do cycles or complex branching", "LangGraph requires more setup but offers more control", "They're complementary, not competing—LangGraph builds on LangChain"]
      }
    ],
    codeExamples: [
      {
        title: "Creating Tools with @tool",
        language: "python",
        category: "basic",
        code: `from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city.

    Use this when the user asks about weather, temperature,
    or conditions in a specific location.

    Args:
        city: The city name (e.g., "Tokyo", "New York")
    """
    # In production, call a real weather API
    weather_data = {
        "Tokyo": "22C, Partly cloudy",
        "New York": "18C, Sunny",
        "London": "14C, Rainy",
    }
    return weather_data.get(city, f"Weather data not available for {city}")

@tool
def calculator(expression: str) -> str:
    """Evaluate a mathematical expression.

    Use this for arithmetic calculations, percentages,
    or any math the user needs computed.

    Args:
        expression: A math expression (e.g., "15 * 7 + 3")
    """
    try:
        allowed = set("0123456789+-*/(). ")
        if not all(c in allowed for c in expression):
            return "Error: Invalid characters in expression"
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"

# Bind tools to model
model = ChatOpenAI(model="gpt-4")
model_with_tools = model.bind_tools([get_weather, calculator])

# The model can now call these tools
response = model_with_tools.invoke("What's the weather in Tokyo?")
print(response.tool_calls)
# [{'id': 'call_abc123', 'name': 'get_weather', 'args': {'city': 'Tokyo'}}]`,
        explanation: "The @tool decorator converts functions into LangChain tools. The docstring becomes the description that guides the model's tool selection. Type hints define the parameter schema."
      },
      {
        title: "Complete Tool Calling Flow",
        language: "python",
        category: "intermediate",
        code: `from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_openai import ChatOpenAI

@tool
def search_web(query: str) -> str:
    """Search the web for current information."""
    return f"Search results for '{query}': [Simulated results...]"

@tool
def get_stock_price(ticker: str) -> str:
    """Get current stock price for a ticker symbol."""
    prices = {"AAPL": "$178.50", "GOOGL": "$141.25", "MSFT": "$378.90"}
    return prices.get(ticker.upper(), f"Price not found for {ticker}")

# Setup
model = ChatOpenAI(model="gpt-4")
tools = [search_web, get_stock_price]
model_with_tools = model.bind_tools(tools)

# Build tool lookup
tool_map = {t.name: t for t in tools}

def run_agent(user_input: str) -> str:
    """Run the complete tool-calling loop."""
    messages = [HumanMessage(content=user_input)]

    while True:
        # Step 1: Invoke model
        response = model_with_tools.invoke(messages)
        messages.append(response)

        # Step 2: Check for tool calls
        if not response.tool_calls:
            return response.content

        # Step 3: Execute each tool call
        for tool_call in response.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]

            if tool_name in tool_map:
                result = tool_map[tool_name].invoke(tool_args)
            else:
                result = f"Error: Unknown tool {tool_name}"

            # Step 4: Package result as ToolMessage
            messages.append(ToolMessage(
                content=str(result),
                tool_call_id=tool_call["id"]
            ))

# Usage
answer = run_agent("What's Apple's stock price?")
print(answer)  # "Apple (AAPL) is currently trading at $178.50."`,
        explanation: "This shows the complete flow: invoke model, check tool_calls, execute tools, append ToolMessage, repeat. The loop continues until the model responds without requesting tools."
      },
      {
        title: "Using AgentExecutor",
        language: "python",
        category: "intermediate",
        code: `from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

# Define tools
@tool
def get_weather(city: str) -> str:
    """Get weather for a city."""
    return f"{city}: 22C, Sunny"

@tool
def search_wikipedia(topic: str) -> str:
    """Search Wikipedia for information."""
    return f"Wikipedia summary for {topic}: [Detailed info...]"

# Create prompt with agent_scratchpad placeholder
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful assistant with access to tools.
Use tools when needed to answer questions accurately.
Always explain your reasoning before using tools."""),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Setup model and tools
model = ChatOpenAI(model="gpt-4")
tools = [get_weather, search_wikipedia]

# Create the agent
agent = create_tool_calling_agent(model, tools, prompt)

# Create executor with safety settings
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=5,
    return_intermediate_steps=True,
    handle_parsing_errors=True,
)

# Run the agent
result = executor.invoke({
    "input": "What's the weather in Paris and tell me about the Eiffel Tower"
})

print(result["output"])`,
        explanation: "AgentExecutor automates the tool-calling loop, handles errors, and enforces iteration limits. The verbose flag shows the reasoning process, useful for debugging."
      },
      {
        title: "Pydantic Tools for Complex Inputs",
        language: "python",
        category: "advanced",
        code: `from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from typing import Optional

class FlightSearchInput(BaseModel):
    """Input schema for flight search."""
    origin: str = Field(description="Origin airport code (e.g., 'JFK')")
    destination: str = Field(description="Destination airport code")
    departure_date: str = Field(description="Departure date (YYYY-MM-DD)")
    return_date: Optional[str] = Field(
        default=None,
        description="Return date for round trip (YYYY-MM-DD)"
    )
    passengers: int = Field(
        default=1,
        ge=1,
        le=9,
        description="Number of passengers (1-9)"
    )

@tool(args_schema=FlightSearchInput)
def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    return_date: Optional[str] = None,
    passengers: int = 1
) -> str:
    """Search for available flights between airports.

    Use this when users want to find flights for travel.
    Returns flight options with prices and times.
    """
    trip_type = "round-trip" if return_date else "one-way"
    return f"""Found 3 {trip_type} flights from {origin} to {destination}:
1. Morning departure: $299 ({passengers} passengers)
2. Afternoon departure: $349 ({passengers} passengers)
3. Evening departure: $279 ({passengers} passengers)"""

# Bind to model
model = ChatOpenAI(model="gpt-4")
model_with_tools = model.bind_tools([search_flights])

# Test with a complex query
response = model_with_tools.invoke(
    "Find me round-trip flights from JFK to LAX, "
    "leaving March 15 and returning March 22, for 2 passengers"
)

print(response.tool_calls[0]["args"])
# {'origin': 'JFK', 'destination': 'LAX', ...}`,
        explanation: "Pydantic schemas provide validation, defaults, and detailed field descriptions. The model receives the full schema and generates valid, structured arguments."
      }
    ],
    diagrams: [
      {
        title: "Tool Calling Flow",
        type: "mermaid",
        mermaid: `flowchart TB
    input[User Input] --> model[Model + Tools]
    model --> check{Tools Needed?}
    check -->|Yes| execute[Execute Tools]
    check -->|No| answer[Final Answer]
    execute --> result[ToolMessage]
    result --> model

    style model fill:#3b82f6,color:#fff
    style execute fill:#00d084,color:#000
    style answer fill:#8b5cf6,color:#fff`,
        caption: "The tool calling loop: Model decides, Tools execute, Results feed back, Repeat until complete"
      },
      {
        title: "LangChain vs LangGraph Agents",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph LangChain
        lc1[Agent] --> lc2[Tool] --> lc3[Agent] --> lc4[Output]
    end
    subgraph LangGraph
        lg1[Node] --> lg2[Node]
        lg2 --> lg3[Node]
        lg2 --> lg1
        lg3 --> state[State]
    end

    style lc1 fill:#3b82f6,color:#fff
    style lg1 fill:#00d084,color:#000
    style state fill:#8b5cf6,color:#fff`,
        caption: "Start with LangChain agents for speed, graduate to LangGraph for control and production needs."
      }
    ],
    keyTakeaways: [
      "Tools extend agents from text generation to real-world action—searching, calculating, querying, and more",
      "The @tool decorator converts functions to tools; the docstring is critical for model reasoning",
      "bind_tools() provides a universal interface that works across all major model providers",
      "AgentExecutor automates the tool loop, error handling, and iteration limits",
      "Keep your toolbox small (3-5 tools) with clear, specific descriptions",
      "Start with LangChain agents for prototypes, migrate to LangGraph for production"
    ],
    resources: [
      {
        title: "LangChain Tools Documentation",
        url: "https://docs.langchain.com/oss/python/langchain/tools",
        type: "docs",
        description: "Official documentation for LangChain tool calling",
        summaryPath: "data/day-6/summary-langchain-tools.md"
      },
      {
        title: "LangChain Agents Documentation",
        url: "https://docs.langchain.com/oss/python/langchain/agents",
        type: "docs",
        description: "Official documentation for LangChain agents",
        summaryPath: "data/day-6/summary-langchain-agents.md"
      },
      {
        title: "Tool Calling with LangChain (Blog)",
        url: "https://blog.langchain.com/tool-calling-with-langchain/",
        type: "article",
        description: "LangChain team's guide to the tool calling interface",
        summaryPath: "data/day-6/summary-tool-calling-interface.md"
      },
      {
        title: "LangChain vs LangGraph: When to Use Each",
        url: "https://www.langchain.com/langgraph",
        type: "article",
        description: "Understanding when to use LangChain agents vs LangGraph",
        summaryPath: "data/day-6/summary-langchain-vs-langgraph.md"
      },
      {
        title: "Building Custom Tools Guide",
        url: "https://docs.langchain.com/oss/python/langchain/tools",
        type: "tutorial",
        description: "Comprehensive guide to creating custom LangChain tools",
        summaryPath: "data/day-6/summary-custom-tools.md"
      }
    ],
    applications: [
      {
        title: "Research Assistant",
        description: "An agent that searches multiple sources (web, Wikipedia, academic papers), synthesizes information, and answers questions with citations. Tools provide access to real-time information beyond the model's training data."
      },
      {
        title: "Customer Support Agent",
        description: "An agent with tools to query the knowledge base, look up customer accounts, check order status, and create support tickets. The agent handles routine queries autonomously while escalating complex issues."
      },
      {
        title: "Data Analysis Agent",
        description: "An agent that can query SQL databases, execute Python for calculations, generate visualizations, and explain results in natural language. Tools provide the computational capabilities the model lacks."
      },
      {
        title: "DevOps Assistant",
        description: "An agent with tools to check service health, query logs, restart services, and create incident tickets. It can diagnose issues, take corrective action, and document what happened—all through natural language."
      }
    ],
    relatedDays: [1, 2, 3, 4, 5, 7, 8]
  }
};
