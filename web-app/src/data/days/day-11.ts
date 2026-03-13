import type { Day } from '../../types';

export const day11: Day = {
  day: 11,
  phase: 2,
  title: "AutoGen/AG2: Conversational Multi-Agent",
  partner: "Microsoft / AG2",
  tags: ["autogen", "ag2", "multi-agent", "conversations", "code-execution", "group-chat"],
  concept: "Agents that converse dynamically to solve problems through message exchange and code execution",
  demoUrl: "demos/day-11/",
  demoDescription: "Explore AutoGen patterns: simulate two-agent conversations with code execution, visualize GroupChat speaker selection, and generate AutoGen Python code.",
  lesson: {
    overview: `AutoGen (now also developed as AG2 by the original creators) takes a different approach to multi-agent systems: agents converse with each other to solve problems. Rather than following a predefined task sequence like CrewAI, AutoGen agents exchange messages dynamically, debating approaches and collaborating organically until they reach a solution.

The framework centers on ConversableAgent—any agent that can send and receive messages. From this base, AutoGen provides specialized agents: AssistantAgent (an LLM-powered helper) and UserProxyAgent (a human proxy that can execute code and request human input). These agents initiate conversations, respond to each other, and—crucially—execute code to verify solutions work.

**Why This Matters**: Some problems don't have predetermined workflows. You need agents that can reason together, try solutions, observe results, and iterate. AutoGen's conversational model enables emergent collaboration—agents figure out the solution path as they work, rather than following a script.`,

    principles: [
      {
        title: "Conversations Are the Unit of Work",
        description: "In AutoGen, work happens through message exchanges. Agents don't execute isolated tasks—they converse. One agent proposes, another critiques, a third executes code. This back-and-forth continues until termination conditions are met or human input is requested."
      },
      {
        title: "ConversableAgent Is the Foundation",
        description: "Every agent inherits from ConversableAgent—the ability to send/receive messages and optionally generate replies. AssistantAgent adds LLM capabilities; UserProxyAgent adds code execution and human interaction. Custom agents extend this foundation for specialized behaviors."
      },
      {
        title: "Code Execution Enables Verification",
        description: "Unlike frameworks where agents only generate text, AutoGen agents can execute code in Docker or locally. When an AssistantAgent writes Python, a UserProxyAgent can run it, return results, and let the assistant correct errors. This creates a verify-and-iterate loop."
      },
      {
        title: "Human-in-the-Loop Is Built In",
        description: "The human_input_mode parameter (ALWAYS, TERMINATE, NEVER) controls when humans intervene. Set to ALWAYS for full oversight, TERMINATE to approve only at conversation end, or NEVER for full automation. This spectrum lets you calibrate autonomy to risk."
      }
    ],

    codeExample: {
      language: "python",
      title: "Two-Agent Conversation with Code Execution",
      code: `from autogen import AssistantAgent, UserProxyAgent

# LLM-powered assistant that generates solutions
assistant = AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4o", "api_key": "..."},
    system_message="You are a helpful AI assistant. Write Python code to solve problems."
)

# Human proxy that executes code automatically
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",  # Only ask human at end
    code_execution_config={
        "work_dir": "coding",
        "use_docker": True  # Safe execution in container
    }
)

# Start the conversation
user_proxy.initiate_chat(
    assistant,
    message="Calculate the 20th Fibonacci number and verify the result."
)
# Assistant writes code -> user_proxy executes -> assistant sees result`
    },

    diagram: {
      type: "flow",
      title: "AutoGen Two-Agent Conversation",
      ascii: `
    ┌─────────────────────────────────────────────────────────────┐
    │                    AUTOGEN CONVERSATION                      │
    │                   (Message-Based Collaboration)              │
    └───────────────────────────┬─────────────────────────────────┘
                                │
         ┌──────────────────────┴──────────────────────┐
         │                                             │
         ▼                                             ▼
    ┌───────────────────┐                    ┌───────────────────┐
    │  USER PROXY AGENT │                    │  ASSISTANT AGENT  │
    │  ───────────────  │                    │  ───────────────  │
    │  • Execute code   │◄──── messages ────►│  • LLM-powered    │
    │  • Human input    │                    │  • Generate code  │
    │  • Termination    │                    │  • Suggest fixes  │
    └───────────────────┘                    └───────────────────┘
              │                                       │
              │    "Calculate Fibonacci..."           │
              │────────────────────────────────────►  │
              │                                       │
              │    "Here's Python code:..."          │
              │ ◄────────────────────────────────────│
              │                                       │
              │    [executes] "Result: 6765"          │
              │────────────────────────────────────►  │
              │                                       │
              │    "The 20th Fibonacci is 6765"       │
              │ ◄────────────────────────────────────│
              │                                       │
         TERMINATE                                    │`
    },

    keyTakeaways: [
      "AutoGen agents converse dynamically rather than following predefined task sequences",
      "ConversableAgent is the foundation; AssistantAgent and UserProxyAgent are specialized versions",
      "Code execution (Docker or local) enables agents to verify solutions, not just generate text",
      "human_input_mode controls autonomy: ALWAYS (full oversight), TERMINATE (end only), NEVER (autonomous)",
      "GroupChat and GroupChatManager enable multi-agent discussions with LLM-based speaker selection"
    ],

    resources: [
      { title: "AutoGen Documentation", url: "https://microsoft.github.io/autogen/stable/", type: "docs", summaryPath: "data/day-11/summary-autogen-docs.md" },
      { title: "AG2: The Community Fork", url: "https://ag2.ai/", type: "docs", summaryPath: "data/day-11/summary-ag2.md" }
    ]
  },
  learn: {
    overview: {
      summary: "Build conversational multi-agent systems where agents exchange messages, execute code, and iterate toward solutions dynamically.",
      fullDescription: `Day 9 and 10 introduced CrewAI's role-based, task-oriented approach to multi-agent systems. AutoGen takes a fundamentally different path: agents converse. Rather than assigning tasks with explicit context dependencies, you create agents that exchange messages, propose solutions, execute code, and iterate until the problem is solved.

Consider debugging a piece of code. With CrewAI, you might create a Debugger agent with a specific task. With AutoGen, you create an AssistantAgent that can write code and a UserProxyAgent that can execute it. They converse: the assistant proposes a fix, the proxy runs it, returns the error, and the assistant tries again. The solution emerges from conversation, not predetermined steps.

**The AutoGen Ecosystem**: AutoGen was created by Microsoft Research and has evolved into two paths:
- **Microsoft AutoGen 0.4+**: A complete architectural redesign with an event-driven, actor-based model
- **AG2**: A community fork by the original creators, maintaining backward compatibility with the familiar API

For this lesson, we focus on the established patterns that work in both versions.

**Core Concepts**: AutoGen is built around three agent types. ConversableAgent is the base class—any agent that can send and receive messages. AssistantAgent adds LLM capabilities, generating responses and code. UserProxyAgent acts as a human proxy, executing code and optionally requesting human input.

**The Power of Code Execution**: Unlike most frameworks, AutoGen can actually run the code agents generate. Configure a UserProxyAgent with Docker execution, and when the AssistantAgent writes Python, the UserProxyAgent runs it in a container, returns results, and lets the conversation continue. This enables verify-then-fix loops that produce working solutions.

**Group Chat**: When you need more than two agents, GroupChat and GroupChatManager orchestrate multi-agent discussions. The manager uses an LLM to select the next speaker based on conversation context—enabling dynamic, emergent collaboration.

By the end of this lesson, you'll understand AutoGen's conversational model, when it outshines task-based approaches, and how to build agents that truly collaborate.`,
      prerequisites: ["Day 9: CrewAI fundamentals", "Day 10: Advanced CrewAI patterns", "Python with async understanding helpful"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "Agent Types: ConversableAgent, AssistantAgent, UserProxyAgent",
        description: `AutoGen's agent hierarchy starts with ConversableAgent—the fundamental ability to send and receive messages.

**ConversableAgent** is the base class:

\`\`\`python
from autogen import ConversableAgent

agent = ConversableAgent(
    name="my_agent",
    llm_config={"model": "gpt-4o"},  # Optional LLM
    system_message="You are a helpful assistant.",
    human_input_mode="NEVER"  # ALWAYS, TERMINATE, or NEVER
)
\`\`\`

**AssistantAgent** is an LLM-powered agent optimized for code generation:

\`\`\`python
from autogen import AssistantAgent

assistant = AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4o", "api_key": os.environ["OPENAI_API_KEY"]},
    system_message="You are a helpful AI assistant. Solve tasks step by step."
)
\`\`\`

The default system message instructs it to write Python code in code blocks, return 'TERMINATE' when done, and handle edge cases properly.

**UserProxyAgent** represents a human or automated executor:

\`\`\`python
from autogen import UserProxyAgent

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    code_execution_config={
        "work_dir": "coding",
        "use_docker": True
    }
)
\`\`\`

The key insight: UserProxyAgent doesn't use an LLM—it executes code and manages human interaction. When it receives a message with code blocks, it can run them automatically.`
      },
      {
        title: "Two-Agent Conversations",
        description: `The simplest AutoGen pattern is two agents conversing until a termination condition is met.

**Initiating a Chat**:

\`\`\`python
# User proxy starts the conversation
user_proxy.initiate_chat(
    assistant,
    message="Find the prime factors of 2024."
)
\`\`\`

This triggers a loop:
1. user_proxy sends the initial message
2. assistant generates a response (possibly with code)
3. user_proxy may execute code and return results
4. assistant refines based on results
5. Repeat until 'TERMINATE' or max_turns reached

**Controlling Termination**:

\`\`\`python
user_proxy = UserProxyAgent(
    name="user_proxy",
    is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", ""),
    max_consecutive_auto_reply=10,  # Prevent infinite loops
    human_input_mode="TERMINATE"
)
\`\`\`

The \`is_termination_msg\` function checks if a message signals completion. Combined with \`max_consecutive_auto_reply\`, this prevents runaway conversations.

**Conversation Flow Example**:

\`\`\`
User: "Calculate compound interest for $10000 at 5% over 10 years"
     ↓
Assistant: "Here's Python code to calculate this:
           principal = 10000
           rate = 0.05
           years = 10
           result = principal * (1 + rate) ** years
           print(f'Final amount: \${result:.2f}')"
     ↓
User Proxy: [executes code]
            "exitcode: 0 (execution succeeded)
             Final amount: $16288.95"
     ↓
Assistant: "The compound interest calculation shows that $10,000
           at 5% annual interest grows to $16,288.95 over 10 years.
           TERMINATE"
\`\`\``
      },
      {
        title: "Code Execution: Docker vs Local",
        description: `AutoGen's code execution capability is what enables verify-then-fix loops. Agents don't just generate code—they run it.

**Docker Execution (Recommended)**:

\`\`\`python
from autogen.coding import DockerCommandLineCodeExecutor

executor = DockerCommandLineCodeExecutor(
    image="python:3.11-slim",  # Container image
    work_dir="./coding",       # Mounted directory
    timeout=60                 # Execution timeout
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    code_execution_config={"executor": executor},
    human_input_mode="NEVER"
)
\`\`\`

Docker provides isolation—code runs in a container, not on your machine. The default image is \`python:3-slim\`, but you can specify custom images with additional dependencies.

**Local Execution (Use with Caution)**:

\`\`\`python
from autogen.coding import LocalCommandLineCodeExecutor

executor = LocalCommandLineCodeExecutor(
    work_dir="./coding",
    timeout=60
)

# Optionally use a virtual environment
from autogen.code_utils import create_virtual_env
venv = create_virtual_env(".venv")
executor = LocalCommandLineCodeExecutor(
    work_dir="./coding",
    virtual_env_context=venv
)
\`\`\`

Local execution runs directly on your machine. Use virtual environments to isolate dependencies and prevent pollution.

**Security Considerations**:
- **Always use Docker** for untrusted or experimental code
- **Virtual environments** help but don't provide true isolation
- **Timeout settings** prevent runaway execution
- **work_dir** isolates file operations

**Disabling Execution**:

\`\`\`python
user_proxy = UserProxyAgent(
    name="user_proxy",
    code_execution_config=False  # No code execution
)
\`\`\``
      },
      {
        title: "Tool and Function Calling",
        description: `Beyond code execution, AutoGen agents can call registered functions/tools—structured interfaces that extend agent capabilities.

**Defining a Tool**:

\`\`\`python
from typing import Annotated

def get_stock_price(
    ticker: Annotated[str, "Stock ticker symbol, e.g., 'AAPL'"]
) -> str:
    # Your implementation
    prices = {"AAPL": 178.50, "GOOGL": 141.80, "MSFT": 378.90}
    price = prices.get(ticker.upper())
    if price:
        return f"{ticker.upper()}: \${price}"
    return f"Unknown ticker: {ticker}"
\`\`\`

**Registering Tools (Method 1 - Decorators)**:

\`\`\`python
@user_proxy.register_for_execution()
@assistant.register_for_llm(description="Get current stock price")
def get_stock_price(ticker: Annotated[str, "Ticker symbol"]) -> str:
    # Implementation
    pass
\`\`\`

**Registering Tools (Method 2 - Function Call)**:

\`\`\`python
from autogen import register_function

register_function(
    get_stock_price,
    caller=assistant,      # Agent that suggests tool calls
    executor=user_proxy,   # Agent that executes
    name="get_stock_price",
    description="Get current stock price for a ticker symbol"
)
\`\`\`

**How It Works**:
1. Assistant's LLM sees the tool schema (auto-generated from type hints)
2. During conversation, LLM decides when to call the tool
3. Tool call request goes to user_proxy
4. user_proxy executes and returns result
5. Assistant continues conversation with result

**Best Practices**:
- **Clear descriptions** help the LLM decide when to use tools
- **Type hints** enable automatic schema generation
- **Handle errors gracefully**—return informative error messages
- **One tool per function**—focused tools work better than Swiss Army knives`
      },
      {
        title: "GroupChat and Multi-Agent Discussions",
        description: `When you need more than two agents, GroupChat enables dynamic multi-agent conversations.

**Setting Up a Group Chat**:

\`\`\`python
from autogen import GroupChat, GroupChatManager

# Define specialized agents
coder = AssistantAgent(name="Coder", llm_config=llm_config)
reviewer = AssistantAgent(
    name="Reviewer",
    system_message="You review code for bugs and improvements.",
    llm_config=llm_config
)
tester = AssistantAgent(
    name="Tester",
    system_message="You write test cases for code.",
    llm_config=llm_config
)

user_proxy = UserProxyAgent(
    name="User",
    human_input_mode="TERMINATE",
    code_execution_config={"use_docker": True}
)

# Create the group chat
groupchat = GroupChat(
    agents=[user_proxy, coder, reviewer, tester],
    messages=[],
    max_round=15
)

# Manager coordinates speaker selection
manager = GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config
)

# Start the conversation
user_proxy.initiate_chat(
    manager,
    message="Build a function to validate email addresses with tests."
)
\`\`\`

**Speaker Selection**: The GroupChatManager uses its LLM to decide who speaks next based on conversation context. This enables natural flow—the coder writes code, the reviewer critiques, the tester adds tests.

**Controlling Transitions**:

\`\`\`python
groupchat = GroupChat(
    agents=[user_proxy, coder, reviewer, tester],
    allowed_or_disallowed_speaker_transitions={
        coder: [reviewer, user_proxy],      # Coder can hand off to reviewer or user
        reviewer: [coder, tester],           # Reviewer to coder (fixes) or tester
        tester: [coder, user_proxy]          # Tester to coder (failing tests) or done
    },
    speaker_transitions_type="allowed"       # These are allowed transitions
)
\`\`\`

**When to Use GroupChat**:
- Problems requiring multiple perspectives
- Code review and testing workflows
- Research with specialists (analyst, fact-checker, writer)
- Brainstorming and consensus-building`
      },
      {
        title: "Human-in-the-Loop Patterns",
        description: `AutoGen provides fine-grained control over human involvement through the \`human_input_mode\` parameter.

**Three Modes**:

\`\`\`python
# ALWAYS: Human approves every agent response
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="ALWAYS"  # Maximum oversight
)

# TERMINATE: Human only involved at conversation end
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    is_termination_msg=lambda msg: "TERMINATE" in msg["content"]
)

# NEVER: Fully autonomous (use with caution)
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10  # Safety limit
)
\`\`\`

**Choosing a Mode**:

| Mode | Use Case | Risk Level |
|------|----------|------------|
| ALWAYS | High-stakes decisions, learning/debugging | Low |
| TERMINATE | Production with review, batch processing | Medium |
| NEVER | Trusted workflows, automated pipelines | Higher |

**Practical Pattern - Escalation**:

\`\`\`python
def should_escalate(msg):
    content = msg.get("content", "").lower()
    # Escalate on uncertainty or high-risk actions
    return any(word in content for word in ["unsure", "delete", "irreversible"])

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    is_termination_msg=should_escalate  # Escalate to human
)
\`\`\`

**Human Input in Group Chat**:
In group chats, the UserProxyAgent still respects its human_input_mode. When set to ALWAYS, the human can guide group discussions, approve specific actions, or redirect the conversation.`
      }
    ],
    codeExamples: [
      {
        title: "Two-Agent Code Generation and Execution",
        language: "python",
        category: "basic",
        code: `import os
from autogen import AssistantAgent, UserProxyAgent

# Configure the LLM
llm_config = {
    "model": "gpt-4o",
    "api_key": os.environ["OPENAI_API_KEY"]
}

# Assistant agent - generates code and explanations
assistant = AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message="""You are a helpful AI assistant.
    Solve tasks step by step. When you need to perform calculations
    or data processing, write Python code in code blocks.
    When the task is complete, reply with TERMINATE."""
)

# User proxy - executes code, manages conversation
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    code_execution_config={
        "work_dir": "coding",
        "use_docker": True,  # Safe containerized execution
    },
    is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", "")
)

# Start the conversation
result = user_proxy.initiate_chat(
    assistant,
    message="""
    Analyze this dataset and find the top 3 products by revenue:
    products = [
        {"name": "Widget A", "price": 25.99, "quantity": 150},
        {"name": "Widget B", "price": 45.50, "quantity": 80},
        {"name": "Gadget X", "price": 199.99, "quantity": 25},
        {"name": "Gadget Y", "price": 89.99, "quantity": 60}
    ]
    """
)

# Access conversation history
print(f"Total messages: {len(result.chat_history)}")`,
        explanation: "A minimal two-agent setup demonstrating AutoGen's core pattern: an LLM assistant generates code, a user proxy executes it, and the conversation continues until TERMINATE is reached."
      },
      {
        title: "GroupChat with Coder, Reviewer, and Tester",
        language: "python",
        category: "intermediate",
        code: `import os
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

llm_config = {
    "model": "gpt-4o",
    "api_key": os.environ["OPENAI_API_KEY"]
}

# Specialized agents for a development workflow
coder = AssistantAgent(
    name="Coder",
    system_message="""You are an expert Python developer.
    Write clean, well-documented code. Include docstrings
    and type hints. When you finish code, say 'Ready for review.'""",
    llm_config=llm_config
)

reviewer = AssistantAgent(
    name="Reviewer",
    system_message="""You are a code reviewer. Check code for:
    - Bugs and edge cases
    - Performance issues
    - Code style and best practices
    Provide specific, actionable feedback. If code is good, say 'Approved.'""",
    llm_config=llm_config
)

tester = AssistantAgent(
    name="Tester",
    system_message="""You are a QA engineer. Write comprehensive test cases
    using pytest. Cover normal cases, edge cases, and error handling.
    When tests pass, say 'All tests passing.'""",
    llm_config=llm_config
)

user_proxy = UserProxyAgent(
    name="User",
    human_input_mode="TERMINATE",
    code_execution_config={"work_dir": "coding", "use_docker": True},
    is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", "")
)

# Create group chat with transition rules
groupchat = GroupChat(
    agents=[user_proxy, coder, reviewer, tester],
    messages=[],
    max_round=20,
    speaker_selection_method="auto"  # LLM selects next speaker
)

manager = GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config
)

# Start the development workflow
user_proxy.initiate_chat(
    manager,
    message="""Create a function called 'parse_email' that:
    1. Validates email format
    2. Extracts username and domain
    3. Returns a dict with the parts or raises ValueError

    Include comprehensive tests. When done, reply TERMINATE."""
)`,
        explanation: "A three-agent development team demonstrating GroupChat. The Coder writes code, the Reviewer critiques it, and the Tester adds test cases. The GroupChatManager coordinates who speaks based on conversation context."
      },
      {
        title: "Tool/Function Calling with Multiple Tools",
        language: "python",
        category: "intermediate",
        code: `import os
from typing import Annotated
from autogen import AssistantAgent, UserProxyAgent, register_function

llm_config = {
    "model": "gpt-4o",
    "api_key": os.environ["OPENAI_API_KEY"]
}

# Define tools with type hints and descriptions
def get_weather(
    city: Annotated[str, "City name, e.g., 'San Francisco'"]
) -> str:
    """Get current weather for a city."""
    # Mock implementation
    weather_data = {
        "san francisco": "65F, Partly Cloudy",
        "new york": "45F, Rainy",
        "london": "50F, Overcast",
    }
    result = weather_data.get(city.lower())
    if result:
        return f"Weather in {city}: {result}"
    return f"Weather data not available for {city}"

def convert_temperature(
    temp: Annotated[float, "Temperature value"],
    from_unit: Annotated[str, "'F' for Fahrenheit, 'C' for Celsius"],
    to_unit: Annotated[str, "'F' for Fahrenheit, 'C' for Celsius"]
) -> str:
    """Convert temperature between Fahrenheit and Celsius."""
    if from_unit.upper() == to_unit.upper():
        return f"{temp} degrees {to_unit.upper()}"

    if from_unit.upper() == "F":
        result = (temp - 32) * 5/9
        return f"{temp}F = {result:.1f}C"
    else:
        result = temp * 9/5 + 32
        return f"{temp}C = {result:.1f}F"

# Create agents
assistant = AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message="""You are a helpful weather assistant.
    Use the available tools to answer questions about weather.
    Always convert temperatures if the user asks for different units."""
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    code_execution_config=False,  # Only use tools, no code execution
    is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", "")
)

# Register tools with both agents
register_function(
    get_weather,
    caller=assistant,
    executor=user_proxy,
    name="get_weather",
    description="Get current weather for a city"
)

register_function(
    convert_temperature,
    caller=assistant,
    executor=user_proxy,
    name="convert_temperature",
    description="Convert temperature between Fahrenheit and Celsius"
)

# Start conversation
user_proxy.initiate_chat(
    assistant,
    message="What's the weather in San Francisco? Please give me the temperature in Celsius."
)`,
        explanation: "Demonstrates tool/function calling in AutoGen. The assistant agent decides when to call tools based on the conversation. Tools are registered with both the caller (who requests) and executor (who runs). Type hints auto-generate the tool schema for the LLM."
      }
    ],
    diagrams: [
      {
        title: "AutoGen Agent Hierarchy",
        type: "architecture",
        ascii: `
    ┌─────────────────────────────────────────────────────────────┐
    │                    CONVERSABLE AGENT                         │
    │         (Base class: send/receive messages)                  │
    │                                                              │
    │    • name: str                                               │
    │    • llm_config: Optional[dict]                              │
    │    • human_input_mode: ALWAYS | TERMINATE | NEVER            │
    │    • is_termination_msg: Callable                            │
    └───────────────────────────┬─────────────────────────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
    ┌───────────────────────┐         ┌───────────────────────┐
    │   ASSISTANT AGENT     │         │   USER PROXY AGENT    │
    │   ─────────────────   │         │   ─────────────────   │
    │                       │         │                       │
    │   + LLM capabilities  │         │   + Code execution    │
    │   + Code generation   │         │   + Human interaction │
    │   + System message    │         │   + Tool execution    │
    │   + Suggests tools    │         │   + Runs tools        │
    │                       │         │                       │
    │   llm_config REQUIRED │         │   llm_config=False    │
    └───────────────────────┘         └───────────────────────┘`,
        caption: "ConversableAgent is the foundation. AssistantAgent adds LLM capabilities; UserProxyAgent adds execution capabilities."
      },
      {
        title: "GroupChat Flow with Manager",
        type: "flow",
        ascii: `
    ┌─────────────────────────────────────────────────────────────┐
    │                    GROUP CHAT MANAGER                        │
    │              (LLM-based speaker selection)                   │
    │                                                              │
    │   "Based on the conversation, who should speak next?"        │
    └───────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                       GROUP CHAT                             │
    │                    agents=[A, B, C, D]                       │
    │                     max_round=15                             │
    └─────────────────────────────────────────────────────────────┘
         │                │                │                │
         ▼                ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
    │  User   │      │  Coder  │      │ Reviewer│      │ Tester  │
    │  Proxy  │      │         │      │         │      │         │
    └─────────┘      └─────────┘      └─────────┘      └─────────┘
         │
         │ initiate_chat(manager, message)
         ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                  CONVERSATION FLOW                           │
    │                                                              │
    │  User: "Build a sorting function"                            │
    │     ↓ [Manager selects: Coder]                               │
    │  Coder: "Here's quicksort:..."                               │
    │     ↓ [Manager selects: Reviewer]                            │
    │  Reviewer: "Edge case issue with empty list..."              │
    │     ↓ [Manager selects: Coder]                               │
    │  Coder: "Fixed version:..."                                  │
    │     ↓ [Manager selects: Tester]                              │
    │  Tester: "Test cases:..."                                    │
    │     ↓ [Manager selects: User (TERMINATE)]                    │
    └─────────────────────────────────────────────────────────────┘`,
        caption: "GroupChatManager uses an LLM to dynamically select the next speaker based on conversation context."
      }
    ],
    keyTakeaways: [
      "AutoGen uses conversational collaboration—agents exchange messages dynamically rather than following predefined tasks",
      "ConversableAgent is the foundation; AssistantAgent adds LLM, UserProxyAgent adds code execution and human interaction",
      "Code execution in Docker provides sandboxed verification—agents can run code and iterate on results",
      "Tool/function calling extends agents with structured capabilities using @register_for_llm and @register_for_execution",
      "GroupChat enables multi-agent discussions with LLM-based speaker selection via GroupChatManager",
      "human_input_mode (ALWAYS/TERMINATE/NEVER) controls human oversight at different risk levels",
      "AutoGen excels when solutions emerge from iteration rather than predetermined workflows"
    ],
    resources: [
      { title: "AutoGen Documentation", url: "https://microsoft.github.io/autogen/stable/", type: "docs", description: "Official Microsoft AutoGen documentation", summaryPath: "data/day-11/summary-autogen-docs.md" },
      { title: "AG2 - Community Fork", url: "https://ag2.ai/", type: "docs", description: "AG2 project by original AutoGen creators", summaryPath: "data/day-11/summary-ag2.md" },
      { title: "AutoGen GitHub Repository", url: "https://github.com/microsoft/autogen", type: "github", description: "Source code and examples" },
      { title: "AG2 GitHub Repository", url: "https://github.com/ag2ai/ag2", type: "github", description: "Community fork with backward compatibility" }
    ],
    faq: [
      {
        question: "When should I use AutoGen vs CrewAI?",
        answer: "Use AutoGen when problems require iterative, conversational problem-solving—especially with code execution and verification. Use CrewAI when you have well-defined workflows with clear role boundaries and task dependencies. AutoGen is more flexible but less predictable; CrewAI is more structured but requires upfront task design."
      },
      {
        question: "What's the difference between AutoGen and AG2?",
        answer: "AutoGen was created by Microsoft Research. In late 2024, the original creators forked it as AG2 (AutoGen 2.0) under community governance. AG2 maintains backward compatibility with AutoGen 0.2's familiar API. Microsoft's AutoGen 0.4+ is a complete architectural redesign. For learning, patterns work in both—just note the import changes."
      },
      {
        question: "Is code execution safe? Should I use Docker?",
        answer: "Code execution is powerful but risky. Always use Docker for untrusted or experimental code—it provides containerized isolation. Local execution runs on your machine, so only use it with trusted code and virtual environments. Set timeouts to prevent runaway processes, and use work_dir to isolate file operations."
      },
      {
        question: "How do I prevent infinite conversation loops?",
        answer: "Use multiple safeguards: (1) is_termination_msg to detect completion signals, (2) max_consecutive_auto_reply to limit turns, (3) max_round in GroupChat, and (4) clear system messages instructing agents to say 'TERMINATE' when done. Start with human_input_mode='TERMINATE' to review before final completion."
      }
    ],
    applications: [
      {
        title: "Code Generation and Testing Pipeline",
        description: "Coder agent writes code, Executor agent runs it, Tester agent writes tests, Reviewer agent critiques. The conversation continues until tests pass and code is approved—true iterative development."
      },
      {
        title: "Data Analysis with Verification",
        description: "Analyst agent proposes analysis approaches, Coder agent implements them, Executor runs code and returns results. The analyst interprets findings, suggests refinements, and the cycle continues until insights are validated."
      },
      {
        title: "Research and Fact-Checking Workflow",
        description: "Researcher agent gathers information, Fact-Checker agent verifies claims, Writer agent drafts content. GroupChat enables natural back-and-forth as agents challenge each other's findings."
      }
    ],
    relatedDays: [9, 10, 12]
  }
};
