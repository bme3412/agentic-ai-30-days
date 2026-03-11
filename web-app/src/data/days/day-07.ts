import type { Day } from '../../types';

export const day07: Day = {
  day: 7,
  phase: 2,
  title: "LangGraph: Stateful Agent Workflows",
  partner: "LangChain",
  tags: ["langgraph", "state", "graphs", "workflows", "conditional-routing"],
  concept: "Graph-based workflows with conditional branching and cycles",
  demoUrl: "demos/day-7/",
  demoDescription: "Build a visual state graph, add nodes and edges, then watch state flow through your workflow with conditional routing.",
  learn: {
    overview: {
      summary: "Master LangGraph for building production agent systems with explicit control flow, state management, and conditional routing.",
      fullDescription: `Day 6 introduced AgentExecutor—a simple abstraction that runs a loop: call model, execute tools, repeat until done. This works beautifully for straightforward tasks, but production agents face challenges that simple loops cannot handle:

- What if a tool fails and you need to try an alternative?
- What if certain actions require human approval before proceeding?
- What if the agent needs to branch into completely different workflows based on what it discovers?
- What if you need to pause execution, persist state, and resume hours or days later?

**LangGraph** solves all of these by representing your agent as a **directed graph**. Instead of a fixed loop, you define:
- **Nodes**: Processing steps (call LLM, execute tools, validate, transform)
- **Edges**: Transitions between nodes (simple or conditional)
- **State**: A typed data structure that flows through the graph, accumulating information

This graph-based architecture gives you **explicit control** over execution flow. You can see exactly how your agent makes decisions, add conditional branches, implement retry logic, and create sophisticated multi-step workflows.

**Why Graphs?**

Consider a customer support agent. With a simple loop, every query follows the same path. But in reality:
- Simple FAQs should route directly to a response generator
- Technical issues should search the knowledge base first
- Billing questions should check the account database
- Sensitive issues should escalate to a human

LangGraph lets you express this naturally as a graph with conditional routing.

**The LangGraph Mental Model**

Think of your agent as a flowchart, not a while loop:
1. **Entry Point**: Where does execution start?
2. **Decision Points**: What conditions determine the next step?
3. **Processing Nodes**: What operations happen at each step?
4. **Exit Conditions**: When is the workflow complete?

**What You'll Master Today**

1. **StateGraph Fundamentals**: Creating graphs, adding nodes, connecting edges
2. **State Design**: TypedDict schemas, reducers for message accumulation
3. **Node Functions**: Reading state, performing operations, returning updates
4. **Conditional Routing**: Dynamic paths based on state values
5. **The Tool-Calling Loop**: Implementing ReAct as a graph with cycles
6. **Prebuilt Agents**: Using create_react_agent() for common patterns
7. **Checkpointing**: Persisting state for long-running workflows
8. **Human-in-the-Loop**: Pausing for approval and resuming

By the end, you'll understand when and how to use LangGraph to build agents that are more controllable, debuggable, and production-ready than simple loop-based approaches.`,
      prerequisites: ["Day 6: LangChain Tools & Agents (bind_tools, tool_calls)", "Understanding of directed graphs (nodes + edges)", "Python type hints (TypedDict, Annotated)", "Basic async programming concepts"],
      estimatedTime: "3-4 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "Why Graphs Over Loops",
        description: `AgentExecutor works well for simple cases, but its fixed loop structure limits what you can express. Consider the limitations:

**Fixed Control Flow**: The loop always follows the same pattern: call model -> check for tool calls -> execute tools -> repeat. You can't add conditional branches or alternative paths.

**Hidden State**: State is managed internally. You can't easily inspect what the agent "knows" at each step, making debugging difficult.

**No Persistence**: When the loop ends, state is gone. You can't pause mid-workflow, persist to a database, and resume later.

**No Cycles Beyond Tool Calling**: The only loop is the tool-calling loop. What if you want to retry a failed operation? Loop through a list of items? Implement iterative refinement?

LangGraph solves these by making the execution structure explicit. A graph is just nodes (functions) and edges (transitions). You can:
- Add conditional edges that route based on any state value
- Create cycles that loop back to any previous node
- Inspect state at every step
- Checkpoint state for persistence and resume
- Implement arbitrary control flow patterns

The cost is more explicit setup. The benefit is complete control and visibility.`,
        analogy: "AgentExecutor is like a vending machine: insert query, receive answer, same process every time. LangGraph is like a factory floor: you design the assembly line, decide where quality checks happen, add branches for different product types, and can pause the line at any station.",
        gotchas: ["Don't use LangGraph when AgentExecutor suffices—added complexity has costs", "Draw your graph on paper before coding—visual planning prevents confusion", "Graphs can have cycles (loops) but must have clear termination conditions"]
      },
      {
        title: "StateGraph: The Container",
        description: `StateGraph is the core LangGraph class. It holds your workflow definition: the nodes, the edges, and the state schema. Think of it as a blueprint that you configure, then compile into a runnable agent.

**Creating a StateGraph**:
You pass a state schema (TypedDict) that defines what data flows through the graph:

from langgraph.graph import StateGraph

class MyState(TypedDict):
    messages: list
    current_step: str

graph = StateGraph(MyState)

**Adding Nodes**:
Nodes are functions. Add them with a name and the function reference:

graph.add_node("process", process_function)
graph.add_node("validate", validate_function)

**Adding Edges**:
Simple edges always go to the same destination:

graph.add_edge("process", "validate")

Conditional edges use a routing function:

graph.add_conditional_edges("validate", decide_next, {...})

**Setting Entry Point**:
Define where execution starts:

graph.set_entry_point("process")

**Compiling**:
Transform the blueprint into a runnable agent:

agent = graph.compile()
result = agent.invoke({"messages": [...]})

The compiled agent is a Runnable—you can invoke it, stream from it, and use it anywhere LangChain expects a runnable.`,
        analogy: "StateGraph is like an architect's blueprint. You draw the rooms (nodes), the hallways (edges), and specify the front door (entry point). Then you 'compile' it by actually building the house—now people can walk through it (invoke it).",
        gotchas: ["You must set an entry point or compilation fails", "Forgetting to compile gives you a builder, not a runnable agent", "Node names are strings—typos cause runtime errors, not compile errors", "The StateGraph itself is mutable until compiled; the compiled graph is immutable"]
      },
      {
        title: "State: The Flowing Data Structure",
        description: `State is a typed dictionary that flows through your graph. Every node receives the current state and returns updates that get merged back. This is fundamentally different from passing variables between functions.

**Defining State with TypedDict**:
Use Python's TypedDict for type-safe state:

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]  # Accumulates
    iteration: int                            # Replaces
    error: str | None                         # Nullable field

**State Reducers: How Updates Merge**

When a node returns {"messages": [new_msg]}, how does it combine with existing messages? This is where reducers come in.

The add_messages reducer appends new messages to the existing list:
messages: Annotated[list, add_messages]

Without a reducer, new values replace old ones:
iteration: int  # Node returning {"iteration": 5} replaces any previous value

You can use other reducers from the operator module:
from operator import add
token_count: Annotated[int, add]  # Adds values together

**State Flows, Nodes Return Updates**

Nodes receive the full state but only return the fields they modify:

def my_node(state: AgentState) -> dict:
    # Read from state
    last_message = state["messages"][-1]

    # Return only what changes
    return {
        "messages": [new_response],
        "iteration": state["iteration"] + 1
    }
    # Note: we don't return 'error' because we're not changing it

**Why This Matters**

This architecture enables:
1. Parallel node execution (non-overlapping state updates can run concurrently)
2. Clean debugging (you can log state between every node)
3. Checkpointing (state is just a dict—easy to serialize)
4. Time travel (save snapshots, replay from any point)`,
        analogy: "State is like a patient's medical chart in a hospital. Each specialist (node) reads the relevant sections, adds their notes, and passes it along. The chart accumulates all observations. Some fields append (visit notes), others replace (current diagnosis).",
        gotchas: ["Always use add_messages for message lists—without it, each node's messages replace all previous", "State must be JSON-serializable for checkpointing (no functions, classes, or file handles)", "Don't mutate state directly—return updates and let the graph merge them", "Optional fields should use str | None, not Optional[str] for TypedDict"]
      },
      {
        title: "Nodes: The Processing Units",
        description: `A node is a function that receives state and returns state updates. Nodes are where actual work happens: calling LLMs, executing tools, validating data, making API calls, or any computation.

**Node Function Signature**:

def my_node(state: AgentState) -> dict:
    # Read from state
    # Do work
    # Return updates

**Types of Nodes**:

1. **LLM Nodes**: Call a language model
def call_model(state):
    response = model.invoke(state["messages"])
    return {"messages": [response]}

2. **Tool Nodes**: Execute tool calls
def execute_tools(state):
    tool_calls = state["messages"][-1].tool_calls
    results = [run_tool(tc) for tc in tool_calls]
    return {"messages": results}

3. **Decision Nodes**: Set flags for routing
def classify_intent(state):
    # Analyze the request
    intent = determine_intent(state["messages"][-1])
    return {"intent": intent}

4. **Validation Nodes**: Check and transform
def validate_output(state):
    if is_valid(state["draft"]):
        return {"status": "valid"}
    return {"status": "invalid", "error": "Validation failed"}

5. **Side Effect Nodes**: External operations
def send_notification(state):
    send_email(state["result"])
    return {"notified": True}

**Single Responsibility Principle**

Each node should do one thing well. Instead of:
def do_everything(state):  # BAD
    response = call_llm(state)
    validated = validate(response)
    formatted = format(validated)
    return {"result": formatted}

Split into:
graph.add_node("call_llm", call_llm_node)
graph.add_node("validate", validate_node)
graph.add_node("format", format_node)

This makes the workflow visible, debuggable, and modifiable.`,
        analogy: "Nodes are workers on an assembly line. The car (state) arrives at each station. The worker reads what's needed (current state), does their specific job (processing), attaches their work (returns updates), and the car moves on. No worker tries to do everyone's job.",
        gotchas: ["Return a dict of updates, never the full state object", "Nodes must be deterministic for replay/debugging—avoid random behavior without seeding", "Side effects (API calls, file writes) should be idempotent when possible", "Keep nodes stateless—don't use global variables or class state"]
      },
      {
        title: "Edges: Simple Connections",
        description: `Edges define how state flows from node to node. Simple edges are unconditional—after node A completes, always go to node B.

**Adding Simple Edges**:

graph.add_edge("node_a", "node_b")  # After A, go to B
graph.add_edge("node_b", END)       # After B, terminate

**The END Constant**:

Import END from langgraph.graph to mark terminal nodes:

from langgraph.graph import StateGraph, END

graph.add_edge("final_step", END)  # Workflow complete

**Edge Chains**:

You can chain edges to create sequences:

graph.add_edge("step1", "step2")
graph.add_edge("step2", "step3")
graph.add_edge("step3", END)

This creates a linear flow: step1 -> step2 -> step3 -> END

**Entry Point**:

The entry point is where execution begins:

graph.set_entry_point("step1")

Alternatively, use START:

from langgraph.graph import START
graph.add_edge(START, "step1")

**When to Use Simple Edges**:

Simple edges are appropriate when:
- The flow is unconditional (validation always follows processing)
- You're building linear pipelines
- No decision-making is needed between nodes

For conditional logic, you need conditional edges (next concept).`,
        analogy: "Simple edges are like assembly line conveyor belts. After Station A finishes, the product automatically moves to Station B. No decision, no routing—just a direct connection.",
        gotchas: ["Every non-END node must have an outgoing edge (orphan nodes cause errors)", "END is imported from langgraph.graph, not a string 'END'", "You can have multiple edges from START (parallel execution) but typically have one entry point", "Forgetting to add an edge from the last node to END means execution never terminates"]
      },
      {
        title: "Conditional Edges: Dynamic Routing",
        description: `Conditional edges are LangGraph's superpower. Instead of a fixed destination, a routing function examines state and decides where to go next.

**Anatomy of Conditional Edges**:

graph.add_conditional_edges(
    "source_node",           # Where to route FROM
    routing_function,        # Function that decides
    {                        # Map of return values to destinations
        "option_a": "node_a",
        "option_b": "node_b",
        "option_c": END,
    }
)

**The Routing Function**:

The routing function receives state and returns a string matching one of the destination keys:

def route_by_intent(state: AgentState) -> Literal["search", "calculate", "respond"]:
    intent = state.get("intent")
    if intent == "question":
        return "search"
    elif intent == "math":
        return "calculate"
    return "respond"

Use Literal type hints for type safety—your IDE will catch typos.

**Common Routing Patterns**:

1. **Tool Call Check** (most common):
def should_continue(state) -> Literal["tools", "end"]:
    last_msg = state["messages"][-1]
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tools"
    return "end"

2. **Error Recovery**:
def check_error(state) -> Literal["retry", "fallback", "continue"]:
    if state.get("error_count", 0) >= 3:
        return "fallback"
    elif state.get("last_error"):
        return "retry"
    return "continue"

3. **Confidence Threshold**:
def needs_human(state) -> Literal["human_review", "proceed"]:
    if state.get("confidence", 1.0) < 0.7:
        return "human_review"
    return "proceed"

4. **Content Classification**:
def route_content(state) -> Literal["text", "image", "code"]:
    content_type = detect_type(state["input"])
    return content_type  # Returns "text", "image", or "code"

**Routing Creates Graph Structure**

Conditional edges create branches in your graph. After a decision node, execution can go multiple directions—this is what makes graphs more powerful than loops.`,
        analogy: "Conditional edges are like train track switches. The train (state) arrives at a junction. The signalman (routing function) checks the manifest (state) and throws the switch to send the train down the appropriate track.",
        gotchas: ["Return values MUST exactly match keys in the destination map—typos cause runtime errors", "Routing functions should be fast—they run on every decision point", "Keep routing logic simple: read state flags, don't compute heavy operations", "Always handle all possible cases—an unhandled return value crashes the graph"]
      },
      {
        title: "Cycles: The Power of Loops",
        description: `Unlike simple chains, graphs can have cycles—edges that loop back to previous nodes. This enables iterative patterns that are awkward or impossible with linear flows.

**The Agent Loop as a Cycle**:

The classic tool-calling pattern is a cycle:

graph.add_node("agent", call_model)
graph.add_node("tools", execute_tools)

graph.add_edge("tools", "agent")  # After tools, back to agent!
graph.add_conditional_edges("agent", should_continue,
    {"tools": "tools", "end": END})

This creates: agent -> tools -> agent -> tools -> ... -> END

**Preventing Infinite Loops**:

Cycles require termination conditions. Common approaches:

1. **Iteration Counter**:
def agent(state):
    return {"iteration": state["iteration"] + 1, ...}

def should_continue(state):
    if state["iteration"] >= 10:
        return "end"
    # ... other conditions

2. **Success Detection**:
def should_continue(state):
    if state.get("task_complete"):
        return "end"
    return "continue"

3. **Error Accumulation**:
def should_continue(state):
    if state.get("consecutive_errors", 0) >= 3:
        return "fallback"
    return "retry"

**Other Cycle Patterns**:

1. **Iterative Refinement**:
draft -> review -> (if not good enough) -> draft -> review -> ... -> publish

2. **List Processing**:
get_item -> process -> (if more items) -> get_item -> ... -> aggregate

3. **Retry with Backoff**:
try -> (if failed) -> wait -> try -> ... -> (success or give up)

**Cycles + Checkpointing**:

When you add checkpointing, cycles become even more powerful. You can:
- Resume a failed iteration from the last checkpoint
- Implement human-in-the-loop in the middle of a cycle
- Debug by replaying specific iterations`,
        analogy: "Cycles are like a revision process. Write draft (node 1) -> Get feedback (node 2) -> Is it good enough? If no, loop back to Write draft. If yes, proceed to Publish. The graph naturally expresses 'keep refining until done.'",
        gotchas: ["Every cycle MUST have a termination condition—infinite loops burn API credits", "Use iteration counters as safety stops even when other termination logic exists", "Test cycles with edge cases: what if termination never triggers?", "Checkpointing helps debug cycles by letting you inspect state at each iteration"]
      },
      {
        title: "Prebuilt: create_react_agent",
        description: `LangGraph includes create_react_agent(), a function that builds a complete tool-calling agent graph. It implements the standard ReAct pattern (Reason + Act) that you learned on Day 4, but as a proper graph with all of LangGraph's benefits.

**Basic Usage**:

from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")
tools = [search_tool, calculator_tool]

agent = create_react_agent(model, tools)
result = agent.invoke({"messages": [("human", "What's 15 * 7?")]})

**With Checkpointing**:

from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
agent = create_react_agent(model, tools, checkpointer=checkpointer)

# Now conversations persist
config = {"configurable": {"thread_id": "user-123"}}
result1 = agent.invoke({"messages": [("human", "Hi, I'm Alice")]}, config)
result2 = agent.invoke({"messages": [("human", "What's my name?")]}, config)
# Agent remembers: "Your name is Alice"

**With Custom System Prompt**:

agent = create_react_agent(
    model,
    tools,
    state_modifier="You are a helpful math tutor. Always explain your reasoning."
)

**What It Builds**:

Under the hood, create_react_agent builds this graph:

START -> agent (calls LLM with tools)
        |
        +-> has tool_calls? --yes--> tools (execute) -> agent
        |
        +-> no tool_calls? ---------> END

This is exactly what you'd build manually, but in one function call.

**When to Use It**:

Use create_react_agent when:
- You need a standard tool-calling agent
- You don't need custom branching logic
- You want quick setup with production features (checkpointing, streaming)
- You're migrating from AgentExecutor

Build a custom graph when:
- You need conditional routing beyond tool checking
- You want human-in-the-loop approval gates
- You have multiple specialized handlers for different query types
- You need custom error recovery logic`,
        analogy: "create_react_agent is like a meal kit: all ingredients pre-measured, recipe included, just follow the steps. Building a custom graph is cooking from scratch: more effort, but you can make exactly what you want.",
        gotchas: ["Prebuilt agent still uses LangGraph underneath—understanding custom graphs helps debug it", "The default system prompt is minimal; customize with state_modifier for production", "Checkpointing with MemorySaver is in-memory only—use SqliteSaver or PostgresSaver for production", "You can't add conditional branches to prebuilt agent—build custom if you need them"]
      },
      {
        title: "Checkpointing: Persistent State",
        description: `Checkpointing saves the graph's state at each step, enabling persistence, debugging, and human-in-the-loop workflows. This is one of LangGraph's killer features.

**Enabling Checkpointing**:

from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()  # In-memory (dev only)
agent = graph.compile(checkpointer=checkpointer)

**Using Thread IDs**:

Each conversation gets a unique thread_id. State persists within a thread:

config = {"configurable": {"thread_id": "conversation-abc123"}}

# First message
result1 = agent.invoke({"messages": [("human", "Hi")]}, config)

# Later: continue the same conversation
result2 = agent.invoke({"messages": [("human", "What did I just say?")]}, config)
# Agent has access to previous messages!

**Production Checkpointers**:

MemorySaver is for development. For production:

# SQLite (single server)
from langgraph.checkpoint.sqlite import SqliteSaver
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")

# PostgreSQL (distributed)
from langgraph.checkpoint.postgres import PostgresSaver
checkpointer = PostgresSaver.from_conn_string("postgresql://...")

**What Checkpointing Enables**:

1. **Conversation Memory**: Agent remembers previous messages in a thread

2. **Resume After Crash**: If your server restarts, resume from last checkpoint

3. **Human-in-the-Loop**: Pause at an interrupt node, wait for human input, resume

4. **Time Travel Debugging**: Replay from any checkpoint to understand behavior

5. **Long-Running Workflows**: Agent can pause for days, then continue

**Inspecting Checkpoints**:

# Get checkpoint state
state = agent.get_state(config)
print(state.values)  # Current state
print(state.next)    # Next nodes to execute

# List all checkpoints for a thread
for checkpoint in agent.get_state_history(config):
    print(checkpoint.values["messages"])`,
        analogy: "Checkpointing is like auto-save in a video game. Every time you reach a checkpoint, your progress is saved. If you die (crash), you restart from the last checkpoint, not the beginning. You can even load old saves (replay) to see what happened.",
        gotchas: ["MemorySaver loses data on restart—always use persistent checkpointers in production", "Thread IDs must be unique per conversation—use UUIDs or user IDs", "Large states (big messages, embeddings) slow down checkpointing—keep state lean", "Checkpoints accumulate—implement cleanup for old threads in production"]
      },
      {
        title: "Human-in-the-Loop Patterns",
        description: `LangGraph supports workflows that pause for human input. This is essential for sensitive operations, quality assurance, or when AI confidence is low.

**The Interrupt Pattern**:

1. Agent reaches a decision point
2. Graph pauses and saves state (checkpoint)
3. Human reviews and provides input
4. Graph resumes with human input incorporated

**Implementing with Conditional Routing**:

class State(TypedDict):
    messages: Annotated[list, add_messages]
    draft_response: str
    approved: bool | None

def generate_draft(state):
    draft = llm.invoke("Generate response for: " + state["messages"][-1].content)
    return {"draft_response": draft.content, "approved": None}

def check_approval(state) -> Literal["send", "revise", "waiting"]:
    if state["approved"] is None:
        return "waiting"  # Stay here until human responds
    elif state["approved"]:
        return "send"
    else:
        return "revise"

# Graph pauses at "approval_gate" waiting for external input
# Your app updates state["approved"] via API
# Graph resumes based on the decision

**Practical Implementation**:

# 1. Invoke until interrupt
config = {"configurable": {"thread_id": "review-123"}}
result = agent.invoke({"messages": [("human", "Send email to CEO")]}, config)

# 2. Agent generates draft and pauses at approval gate
# Your app shows draft to human

# 3. Human approves
agent.update_state(config, {"approved": True})

# 4. Resume execution
result = agent.invoke(None, config)  # None = continue from checkpoint

**Common Human-in-the-Loop Patterns**:

1. **Approval Gates**: Sensitive actions require sign-off
2. **Quality Review**: AI drafts, human polishes
3. **Disambiguation**: When agent isn't sure, ask human
4. **Escalation**: Complex queries route to human expert
5. **Feedback Loops**: Human corrections improve future behavior`,
        analogy: "Human-in-the-loop is like a document approval workflow. The system generates a draft, routes it to a manager's inbox, and waits. When the manager clicks Approve or Reject, the workflow continues down the appropriate path.",
        gotchas: ["You need external infrastructure to notify humans and collect responses", "Long waits require persistent checkpointing (not MemorySaver)", "Design timeouts for cases where humans don't respond", "Update_state must match your state schema exactly"]
      }
    ],
    codeExamples: [
      {
        title: "Complete Basic Graph",
        language: "python",
        category: "basic",
        code: `from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage

# 1. Define state schema
class ChatState(TypedDict):
    messages: Annotated[list, add_messages]
    message_count: int

# 2. Define node functions
def greeter(state: ChatState) -> dict:
    """First node: greet the user."""
    return {
        "messages": [AIMessage(content="Hello! How can I help you today?")],
        "message_count": len(state["messages"]) + 1
    }

def responder(state: ChatState) -> dict:
    """Second node: respond based on message count."""
    count = state["message_count"]
    return {
        "messages": [AIMessage(content=f"I've seen {count} messages. Goodbye!")],
    }

# 3. Build the graph
graph = StateGraph(ChatState)
graph.add_node("greeter", greeter)
graph.add_node("responder", responder)

# 4. Connect nodes with edges
graph.add_edge(START, "greeter")
graph.add_edge("greeter", "responder")
graph.add_edge("responder", END)

# 5. Compile to runnable agent
agent = graph.compile()

# 6. Invoke with initial state
result = agent.invoke({
    "messages": [HumanMessage(content="Hi there!")],
    "message_count": 0
})

# Print results
for msg in result["messages"]:
    print(f"{msg.type}: {msg.content}")`,
        explanation: "This shows the complete pattern: define state with TypedDict, create node functions that return updates, build the graph with StateGraph, connect nodes with edges, compile, and invoke. The add_messages reducer ensures messages accumulate rather than replace."
      },
      {
        title: "Conditional Routing with Classification",
        language: "python",
        category: "intermediate",
        code: `from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI

class RouterState(TypedDict):
    messages: Annotated[list, add_messages]
    query_type: str

model = ChatOpenAI(model="gpt-4o-mini")

def classify_query(state: RouterState) -> dict:
    """Analyze the query and determine its type."""
    user_msg = state["messages"][-1].content.lower()

    if any(word in user_msg for word in ["weather", "temperature", "forecast"]):
        return {"query_type": "weather"}
    elif any(word in user_msg for word in ["calculate", "math", "compute", "+", "-", "*", "/"]):
        return {"query_type": "math"}
    elif any(word in user_msg for word in ["search", "find", "look up"]):
        return {"query_type": "search"}
    else:
        return {"query_type": "general"}

def route_by_type(state: RouterState) -> Literal["weather", "math", "search", "general"]:
    """Routing function: returns the node name to go to next."""
    return state["query_type"]

def handle_weather(state: RouterState) -> dict:
    response = model.invoke([
        {"role": "system", "content": "You are a weather assistant. Provide weather information."},
        {"role": "user", "content": state["messages"][-1].content}
    ])
    return {"messages": [response]}

def handle_math(state: RouterState) -> dict:
    response = model.invoke([
        {"role": "system", "content": "You are a math tutor. Solve problems step by step."},
        {"role": "user", "content": state["messages"][-1].content}
    ])
    return {"messages": [response]}

def handle_search(state: RouterState) -> dict:
    response = model.invoke([
        {"role": "system", "content": "You are a research assistant. Provide informative answers."},
        {"role": "user", "content": state["messages"][-1].content}
    ])
    return {"messages": [response]}

def handle_general(state: RouterState) -> dict:
    response = model.invoke([
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": state["messages"][-1].content}
    ])
    return {"messages": [response]}

# Build graph
graph = StateGraph(RouterState)

# Add nodes
graph.add_node("classifier", classify_query)
graph.add_node("weather", handle_weather)
graph.add_node("math", handle_math)
graph.add_node("search", handle_search)
graph.add_node("general", handle_general)

# Set entry and add routing
graph.set_entry_point("classifier")
graph.add_conditional_edges(
    "classifier",
    route_by_type,
    {
        "weather": "weather",
        "math": "math",
        "search": "search",
        "general": "general"
    }
)

# All handlers go to END
for handler in ["weather", "math", "search", "general"]:
    graph.add_edge(handler, END)

# Compile and test
agent = graph.compile()

# Test different queries
test_queries = [
    "What's the weather in Tokyo?",
    "Calculate 15 * 7 + 23",
    "Search for information about LangGraph",
    "Hello, how are you?"
]

for query in test_queries:
    result = agent.invoke({"messages": [("human", query)], "query_type": ""})
    print(f"Query: {query}")
    print(f"Response: {result['messages'][-1].content[:100]}...")
    print()`,
        explanation: "This demonstrates conditional routing: the classifier node sets query_type in state, and the route_by_type function reads it to determine the next node. Each handler gets specialized instructions. Use Literal type hints for type-safe routing."
      },
      {
        title: "Tool-Calling Agent with Loop",
        language: "python",
        category: "advanced",
        code: `from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import ToolMessage

# Define tools
@tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    weather_data = {
        "tokyo": "72°F, Sunny",
        "london": "58°F, Cloudy",
        "new york": "65°F, Partly cloudy"
    }
    return weather_data.get(city.lower(), f"Weather data not available for {city}")

@tool
def calculator(expression: str) -> str:
    """Evaluate a mathematical expression."""
    try:
        # Safe evaluation (in production, use a proper math parser)
        allowed = set("0123456789+-*/.(). ")
        if all(c in allowed for c in expression):
            return f"Result: {eval(expression)}"
        return "Error: Invalid expression"
    except Exception as e:
        return f"Error: {str(e)}"

tools = [get_weather, calculator]
tool_map = {t.name: t for t in tools}

# State with iteration tracking
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    iteration: int

# Create model with tools
model = ChatOpenAI(model="gpt-4o").bind_tools(tools)

def agent_node(state: AgentState) -> dict:
    """Call the LLM with tools bound."""
    response = model.invoke(state["messages"])
    return {
        "messages": [response],
        "iteration": state.get("iteration", 0) + 1
    }

def tool_node(state: AgentState) -> dict:
    """Execute all tool calls from the last message."""
    last_message = state["messages"][-1]
    results = []

    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]

        if tool_name in tool_map:
            # Execute the tool
            result = tool_map[tool_name].invoke(tool_args)
            results.append(ToolMessage(
                content=str(result),
                tool_call_id=tool_call["id"]
            ))
        else:
            results.append(ToolMessage(
                content=f"Error: Unknown tool {tool_name}",
                tool_call_id=tool_call["id"]
            ))

    return {"messages": results}

def should_continue(state: AgentState) -> Literal["tools", "end"]:
    """Decide whether to execute tools or finish."""
    # Safety: limit iterations
    if state.get("iteration", 0) >= 10:
        return "end"

    last_message = state["messages"][-1]

    # Check for tool calls
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"

    return "end"

# Build the graph
graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_node("tools", tool_node)

graph.set_entry_point("agent")
graph.add_conditional_edges(
    "agent",
    should_continue,
    {"tools": "tools", "end": END}
)
graph.add_edge("tools", "agent")  # Loop back after tool execution!

# Compile
agent = graph.compile()

# Test with a multi-tool query
result = agent.invoke({
    "messages": [("human", "What's the weather in Tokyo and calculate 15 * 7 + 3")],
    "iteration": 0
})

# Print the conversation
for msg in result["messages"]:
    if hasattr(msg, "tool_calls") and msg.tool_calls:
        print(f"AI: [Calling tools: {[tc['name'] for tc in msg.tool_calls]}]")
    elif msg.type == "tool":
        print(f"Tool: {msg.content}")
    else:
        print(f"{msg.type.upper()}: {msg.content}")`,
        explanation: "This implements the complete ReAct pattern as a graph. The agent node calls the LLM, the routing function checks for tool_calls, the tools node executes them, and the edge loops back to agent. The iteration counter prevents infinite loops. This is exactly what create_react_agent() builds internally."
      },
      {
        title: "Using create_react_agent with Checkpointing",
        language: "python",
        category: "intermediate",
        code: `from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

# Define tools
@tool
def get_user_info(user_id: str) -> str:
    """Look up information about a user."""
    users = {
        "123": "Alice, Premium member since 2022",
        "456": "Bob, Free tier user",
    }
    return users.get(user_id, "User not found")

@tool
def update_preferences(user_id: str, preference: str) -> str:
    """Update a user's preferences."""
    return f"Updated preferences for user {user_id}: {preference}"

# Setup
model = ChatOpenAI(model="gpt-4o")
tools = [get_user_info, update_preferences]

# Create checkpointer for conversation persistence
checkpointer = MemorySaver()

# Create the agent with custom system prompt
agent = create_react_agent(
    model,
    tools,
    checkpointer=checkpointer,
    state_modifier="You are a helpful customer service agent. Always be polite and thorough."
)

# Use thread_id to maintain conversation state
config = {"configurable": {"thread_id": "customer-session-789"}}

# First interaction
result1 = agent.invoke({
    "messages": [("human", "Hi, I'm user 123. What's my account status?")]
}, config)
print("First response:", result1["messages"][-1].content)

# Second interaction - agent remembers the conversation!
result2 = agent.invoke({
    "messages": [("human", "Please update my preferences to receive weekly newsletters")]
}, config)
print("Second response:", result2["messages"][-1].content)

# Third interaction - still has context
result3 = agent.invoke({
    "messages": [("human", "What changes did we just make to my account?")]
}, config)
print("Third response:", result3["messages"][-1].content)

# Different thread = different conversation
other_config = {"configurable": {"thread_id": "other-session"}}
result4 = agent.invoke({
    "messages": [("human", "What's my account status?")]
}, other_config)
# This agent doesn't know about user 123 - it's a fresh conversation`,
        explanation: "create_react_agent() provides a production-ready agent with minimal code. Add MemorySaver for conversation persistence. Each thread_id gets its own conversation history. Use state_modifier to customize the system prompt."
      },
      {
        title: "Human-in-the-Loop Approval",
        language: "python",
        category: "advanced",
        code: `from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI

class ApprovalState(TypedDict):
    messages: Annotated[list, add_messages]
    draft_email: str
    approved: bool | None  # None = pending, True = approved, False = rejected
    feedback: str

model = ChatOpenAI(model="gpt-4o")

def generate_draft(state: ApprovalState) -> dict:
    """Generate an email draft based on the request."""
    user_request = state["messages"][-1].content

    response = model.invoke([
        {"role": "system", "content": "Generate a professional email based on the user's request. Be concise."},
        {"role": "user", "content": user_request}
    ])

    return {
        "draft_email": response.content,
        "approved": None  # Pending approval
    }

def approval_check(state: ApprovalState) -> dict:
    """This node exists for the conditional edge to evaluate."""
    # In a real system, this might send a notification
    return {}

def route_approval(state: ApprovalState) -> Literal["send", "revise", "waiting"]:
    """Route based on approval status."""
    if state["approved"] is None:
        return "waiting"  # Still pending
    elif state["approved"]:
        return "send"
    else:
        return "revise"

def send_email(state: ApprovalState) -> dict:
    """Send the approved email."""
    # In production, actually send the email here
    return {
        "messages": [("assistant", f"Email sent successfully!\\n\\nContent:\\n{state['draft_email']}")]
    }

def revise_draft(state: ApprovalState) -> dict:
    """Revise the draft based on feedback."""
    response = model.invoke([
        {"role": "system", "content": "Revise this email based on the feedback provided."},
        {"role": "user", "content": f"Original: {state['draft_email']}\\n\\nFeedback: {state['feedback']}"}
    ])

    return {
        "draft_email": response.content,
        "approved": None,  # Reset to pending
        "feedback": ""
    }

# Build graph
graph = StateGraph(ApprovalState)
graph.add_node("generate", generate_draft)
graph.add_node("approval", approval_check)
graph.add_node("send", send_email)
graph.add_node("revise", revise_draft)

graph.set_entry_point("generate")
graph.add_edge("generate", "approval")
graph.add_conditional_edges(
    "approval",
    route_approval,
    {
        "send": "send",
        "revise": "revise",
        "waiting": "approval"  # Stay at approval node
    }
)
graph.add_edge("send", END)
graph.add_edge("revise", "approval")  # Back to approval after revision

# Compile with checkpointer
checkpointer = MemorySaver()
agent = graph.compile(checkpointer=checkpointer)

# --- Workflow execution ---

config = {"configurable": {"thread_id": "email-approval-001"}}

# Step 1: User requests an email
result = agent.invoke({
    "messages": [("human", "Write an email to the team about the project delay")],
    "draft_email": "",
    "approved": None,
    "feedback": ""
}, config)

print("Draft generated:")
print(result["draft_email"])
print("\\nWaiting for approval...")

# Step 2: Human reviews and rejects with feedback
agent.update_state(config, {
    "approved": False,
    "feedback": "Make it more apologetic and include a new timeline"
})

# Step 3: Resume - agent will revise
result = agent.invoke(None, config)
print("\\nRevised draft:")
print(result["draft_email"])

# Step 4: Human approves
agent.update_state(config, {"approved": True})

# Step 5: Resume and finalize
result = agent.invoke(None, config)
print("\\nFinal result:")
print(result["messages"][-1].content)`,
        explanation: "This implements a human-in-the-loop approval workflow. The graph pauses at the approval node when approved is None. External code (your app's UI/API) calls update_state to set the approval decision, then invokes with None to resume. The graph loops through revisions until approved."
      },
      {
        title: "Error Recovery with Fallback",
        language: "python",
        category: "advanced",
        code: `from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

class RobustState(TypedDict):
    messages: Annotated[list, add_messages]
    attempt: int
    last_error: str | None
    result: str | None

def primary_handler(state: RobustState) -> dict:
    """Try the primary approach."""
    try:
        # Simulate an operation that might fail
        if state["attempt"] < 2:
            raise Exception("Service temporarily unavailable")

        return {
            "result": "Success from primary handler!",
            "last_error": None
        }
    except Exception as e:
        return {
            "last_error": str(e),
            "attempt": state["attempt"] + 1
        }

def fallback_handler(state: RobustState) -> dict:
    """Fallback approach when primary fails."""
    return {
        "result": "Success from fallback handler (degraded service)",
        "last_error": None,
        "messages": [("assistant", "Note: Using fallback service due to primary failure")]
    }

def error_reporter(state: RobustState) -> dict:
    """Report error and exit gracefully."""
    return {
        "messages": [("assistant", f"Unable to complete request after multiple attempts. Error: {state['last_error']}")]
    }

def route_after_primary(state: RobustState) -> Literal["success", "retry", "fallback"]:
    """Decide next step based on result."""
    if state["result"]:
        return "success"
    elif state["attempt"] < 3:
        return "retry"
    else:
        return "fallback"

def route_after_fallback(state: RobustState) -> Literal["success", "error"]:
    """Check if fallback succeeded."""
    if state["result"]:
        return "success"
    return "error"

def format_success(state: RobustState) -> dict:
    """Format successful result."""
    return {
        "messages": [("assistant", f"Completed: {state['result']}")]
    }

# Build graph
graph = StateGraph(RobustState)

graph.add_node("primary", primary_handler)
graph.add_node("fallback", fallback_handler)
graph.add_node("error", error_reporter)
graph.add_node("success", format_success)

graph.set_entry_point("primary")

graph.add_conditional_edges(
    "primary",
    route_after_primary,
    {
        "success": "success",
        "retry": "primary",  # Loop back to retry
        "fallback": "fallback"
    }
)

graph.add_conditional_edges(
    "fallback",
    route_after_fallback,
    {
        "success": "success",
        "error": "error"
    }
)

graph.add_edge("success", END)
graph.add_edge("error", END)

agent = graph.compile()

# Test - will retry twice then succeed
result = agent.invoke({
    "messages": [("human", "Process this request")],
    "attempt": 0,
    "last_error": None,
    "result": None
})

print(f"Attempts made: {result['attempt']}")
print(f"Final message: {result['messages'][-1].content}")`,
        explanation: "This demonstrates error recovery: the primary handler fails and loops back to retry (up to 3 times). If retries exhaust, it falls back to an alternative approach. The graph structure makes the retry and fallback logic explicit and debuggable."
      }
    ],
    diagrams: [
      {
        title: "LangGraph Agent Architecture",
        type: "architecture",
        ascii: `
+------------------------------------------------------------------+
|                        LANGGRAPH AGENT                            |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------+                                                  |
|  |   STATE     |  TypedDict that flows through the graph          |
|  | - messages  |  Each node reads and returns updates             |
|  | - flags     |                                                  |
|  +------+------+                                                  |
|         |                                                         |
|         v                                                         |
|  +------+------+     +-------------+     +-------------+          |
|  |   NODE A    | --> |   NODE B    | --> |   NODE C    |          |
|  | (function)  |     | (function)  |     | (function)  |          |
|  +-------------+     +------+------+     +-------------+          |
|                             |                                     |
|                             v                                     |
|                      +------+------+                              |
|                      |  ROUTING    |  Examines state              |
|                      |  FUNCTION   |  Returns next node name      |
|                      +------+------+                              |
|                             |                                     |
|              +--------------+--------------+                      |
|              |              |              |                      |
|              v              v              v                      |
|         +--------+     +--------+     +--------+                  |
|         | PATH A |     | PATH B |     | PATH C |                  |
|         +--------+     +--------+     +--------+                  |
|                                                                   |
|  +-------------+                                                  |
|  | CHECKPOINTER|  Saves state at each step for persistence        |
|  +-------------+                                                  |
|                                                                   |
+------------------------------------------------------------------+`,
        caption: "LangGraph architecture: State flows through nodes, routing functions direct traffic, checkpointer enables persistence."
      },
      {
        title: "Tool-Calling Loop Detail",
        type: "flow",
        ascii: `
+------------------------------------------------------------------+
|                     TOOL-CALLING LOOP                             |
+------------------------------------------------------------------+
|                                                                   |
|                    +----------------+                             |
|                    |     START      |                             |
|                    +-------+--------+                             |
|                            |                                      |
|                            v                                      |
|  +-----------------------------------------------------+          |
|  |                    AGENT NODE                        |          |
|  |  1. Receives state with messages                     |          |
|  |  2. Calls LLM with tools bound                       |          |
|  |  3. Returns AIMessage (may include tool_calls)       |          |
|  |  4. Increments iteration counter                     |          |
|  +------------------------+----------------------------+          |
|                           |                                       |
|                           v                                       |
|  +------------------------+----------------------------+          |
|  |              ROUTING FUNCTION                        |          |
|  |  if iteration >= 10: return "end"                    |          |
|  |  if message has tool_calls: return "tools"           |          |
|  |  else: return "end"                                  |          |
|  +------------------------+----------------------------+          |
|              |                            |                       |
|         "tools"                        "end"                      |
|              |                            |                       |
|              v                            v                       |
|  +-----------------------+      +------------------+              |
|  |      TOOLS NODE       |      |       END        |              |
|  | For each tool_call:   |      | Return final     |              |
|  |   Execute tool        |      | state to caller  |              |
|  |   Create ToolMessage  |      +------------------+              |
|  | Return tool results   |                                        |
|  +-----------+-----------+                                        |
|              |                                                    |
|              | (edge loops back)                                  |
|              +-------------------------> AGENT NODE               |
|                                                                   |
+------------------------------------------------------------------+`,
        caption: "The tool-calling loop in detail: Agent generates response, routing checks for tool_calls, tools execute and loop back until no more tool calls or max iterations reached."
      },
      {
        title: "Human-in-the-Loop Flow",
        type: "flow",
        ascii: `
+------------------------------------------------------------------+
|                   HUMAN-IN-THE-LOOP WORKFLOW                      |
+------------------------------------------------------------------+
|                                                                   |
|    +----------+         +---------------+                         |
|    |  START   | ------> |   GENERATE    |                         |
|    +----------+         |   (AI draft)  |                         |
|                         +-------+-------+                         |
|                                 |                                 |
|                                 v                                 |
|    +------------------------------------------------+             |
|    |              APPROVAL GATE (INTERRUPT)          |             |
|    |                                                 |             |
|    |  State saved to checkpoint                      |             |
|    |  External system notified                       |             |
|    |  WAITING FOR HUMAN INPUT...                     |             |
|    |                                                 |             |
|    |  Human reviews draft                            |             |
|    |  Human calls: update_state({"approved": ...})   |             |
|    |  Human calls: invoke(None) to resume            |             |
|    +------------------------+------------------------+             |
|                             |                                      |
|              +--------------+--------------+                       |
|              |              |              |                       |
|          APPROVED       REJECTED        TIMEOUT                    |
|              |              |              |                       |
|              v              v              v                       |
|         +--------+     +--------+     +--------+                   |
|         |  SEND  |     | REVISE |     | CANCEL |                   |
|         +---+----+     +---+----+     +--------+                   |
|             |              |                                       |
|             |              +--------> APPROVAL GATE (loop)         |
|             |                                                      |
|             v                                                      |
|         +--------+                                                 |
|         |  END   |                                                 |
|         +--------+                                                 |
|                                                                   |
+------------------------------------------------------------------+`,
        caption: "Human-in-the-loop: Agent generates draft, pauses at approval gate with state checkpointed. Human reviews externally and updates state. Agent resumes based on decision."
      },
      {
        title: "State Flow and Reducers",
        type: "architecture",
        ascii: `
+------------------------------------------------------------------+
|                    STATE FLOW WITH REDUCERS                       |
+------------------------------------------------------------------+
|                                                                   |
|  Initial State:                                                   |
|  {                                                                |
|    messages: [HumanMessage("Hi")],  <-- add_messages reducer     |
|    count: 0,                         <-- replace (no reducer)     |
|    total: 0                          <-- operator.add reducer     |
|  }                                                                |
|                                                                   |
|  Node A returns: {messages: [AIMessage("Hello")], count: 1, total: 5}
|                                                                   |
|  After merge:                                                     |
|  {                                                                |
|    messages: [Human("Hi"), AI("Hello")],  <-- APPENDED            |
|    count: 1,                               <-- REPLACED           |
|    total: 5                                <-- ADDED (0+5)        |
|  }                                                                |
|                                                                   |
|  Node B returns: {messages: [AIMessage("Bye")], total: 3}         |
|                                                                   |
|  After merge:                                                     |
|  {                                                                |
|    messages: [Human, AI, AI],              <-- APPENDED again     |
|    count: 1,                               <-- UNCHANGED          |
|    total: 8                                <-- ADDED (5+3)        |
|  }                                                                |
|                                                                   |
|  Reducer definitions:                                             |
|    messages: Annotated[list, add_messages]  # Append              |
|    count: int                                # Replace            |
|    total: Annotated[int, operator.add]       # Sum                |
|                                                                   |
+------------------------------------------------------------------+`,
        caption: "State reducers control how node updates merge: add_messages appends, no reducer replaces, operator.add sums values."
      }
    ],
    keyTakeaways: [
      "LangGraph represents agent workflows as directed graphs with nodes (processing steps) and edges (transitions)",
      "State is a TypedDict that flows through the graph—use Annotated[list, add_messages] for message accumulation",
      "Nodes are functions that receive state and return updates (not the full state)",
      "Simple edges always go to the same destination; conditional edges use routing functions for dynamic paths",
      "Cycles (loops) enable iterative patterns—always include termination conditions to prevent infinite loops",
      "create_react_agent() provides a ready-made tool-calling agent; build custom graphs for complex routing",
      "Checkpointing with MemorySaver (dev) or PostgresSaver (prod) enables conversation persistence",
      "Human-in-the-loop patterns use checkpointing to pause, wait for external input, and resume",
      "Use iteration counters, error tracking, and clear termination conditions for robust production agents",
      "Draw your graph before coding—visual planning prevents confused, unmaintainable agent architectures"
    ],
    resources: [
      {
        title: "LangGraph Documentation",
        url: "https://langchain-ai.github.io/langgraph/",
        type: "docs",
        description: "Official LangGraph documentation with concepts, tutorials, and API reference",
        summaryPath: "data/day-7/summary-langgraph-concepts.md"
      },
      {
        title: "LangGraph Quick Start Tutorial",
        url: "https://langchain-ai.github.io/langgraph/tutorials/introduction/",
        type: "tutorial",
        description: "Step-by-step introduction to building your first LangGraph agent"
      },
      {
        title: "AI Agents in LangGraph (DeepLearning.AI)",
        url: "https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/",
        type: "course",
        description: "Free 1.5-hour course by Harrison Chase on building agents with LangGraph",
        duration: "1.5 hours"
      },
      {
        title: "LangGraph Examples Repository",
        url: "https://github.com/langchain-ai/langgraph/tree/main/examples",
        type: "github",
        description: "Production-ready example implementations covering various patterns"
      },
      {
        title: "LangGraph Conceptual Guide",
        url: "https://langchain-ai.github.io/langgraph/concepts/",
        type: "docs",
        description: "Deep dive into LangGraph concepts: state, nodes, edges, persistence"
      },
      {
        title: "Human-in-the-Loop with LangGraph",
        url: "https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/",
        type: "tutorial",
        description: "Guide to implementing approval workflows and human intervention"
      }
    ],
    localResources: [
      {
        id: "langgraph-concepts",
        title: "LangGraph Core Concepts",
        description: "Summary of StateGraph, nodes, edges, and compilation patterns",
        filePath: "data/day-7/summary-langgraph-concepts.md",
        type: "guide"
      },
      {
        id: "state-management",
        title: "State Management Patterns",
        description: "Deep dive into state design, reducers, and best practices",
        filePath: "data/day-7/summary-state-management.md",
        type: "guide"
      },
      {
        id: "conditional-routing",
        title: "Conditional Routing Guide",
        description: "Patterns for dynamic control flow and branching logic",
        filePath: "data/day-7/summary-conditional-routing.md",
        type: "guide"
      }
    ],
    faq: [
      {
        question: "What's the difference between LangChain agents (AgentExecutor) and LangGraph?",
        answer: "AgentExecutor runs a fixed loop: call model, execute tools, repeat. It's simple but inflexible—you can't add conditional branches, custom error recovery, or human approval steps. LangGraph represents workflows as graphs where you explicitly define nodes (processing steps), edges (transitions), and routing logic. This gives you complete control over execution flow, state management, and persistence. Use AgentExecutor for simple prototypes; use LangGraph when you need production-grade control, debugging visibility, or complex routing."
      },
      {
        question: "When should I use create_react_agent() vs building a custom graph?",
        answer: "Use create_react_agent() when you need a standard tool-calling agent without complex branching. It handles the ReAct pattern (call LLM, check for tools, execute, loop) and supports checkpointing out of the box. Build a custom graph when you need: (1) conditional routing based on query type or intermediate results, (2) human-in-the-loop approval gates, (3) custom error recovery with fallbacks, (4) multiple specialized handlers for different scenarios, or (5) multi-agent coordination. The prebuilt agent is actually a LangGraph graph internally—understanding custom graphs helps you debug and extend it."
      },
      {
        question: "How do I prevent infinite loops in my graph?",
        answer: "Every cycle needs a termination condition. Best practices: (1) Add an iteration counter to state (iteration: int), increment it in your loop nodes, and check it in routing functions—return 'end' when it exceeds a limit (typically 5-10). (2) Track consecutive errors—if error_count >= 3, route to fallback or end. (3) Detect task completion—if the LLM indicates the task is done, exit. (4) Set a timeout at the application level. Always test with edge cases: what if your normal termination condition never triggers?"
      },
      {
        question: "What happens if a node raises an exception?",
        answer: "By default, exceptions propagate up and stop graph execution—the invoke() call raises the exception. This is usually not what you want in production. Better approach: wrap node logic in try/except, catch errors, and store them in state (e.g., last_error: str | None). Then use conditional routing to handle errors: route to a retry node, a fallback handler, or an error reporter. This keeps errors within the graph's control flow and makes error handling explicit and debuggable."
      },
      {
        question: "How does checkpointing work and when should I use it?",
        answer: "Checkpointing saves the graph's state after each node execution. Enable it by passing a checkpointer to graph.compile(). Use thread_id in the config to track separate conversations. Use cases: (1) Conversation memory—agent remembers previous messages in a thread. (2) Crash recovery—if your server restarts, resume from last checkpoint. (3) Human-in-the-loop—pause at approval nodes, wait for external input, resume. (4) Debugging—replay from any checkpoint to understand what happened. In development, use MemorySaver (in-memory). In production, use SqliteSaver or PostgresSaver for persistence across restarts."
      },
      {
        question: "How do I implement human-in-the-loop approval?",
        answer: "Pattern: (1) Create a state field for approval status (approved: bool | None). (2) Add an 'approval_gate' node that doesn't modify state. (3) Add a routing function that checks approval—return 'waiting' if None, 'proceed' if True, 'revise' if False. (4) When 'waiting', the graph loops on the approval node. Your external app shows the pending item to a human and collects their decision. (5) Call agent.update_state(config, {'approved': True/False}) to update. (6) Call agent.invoke(None, config) to resume execution. The checkpointer preserves state between the pause and resume."
      },
      {
        question: "Can I use LangGraph with models other than OpenAI?",
        answer: "Absolutely. LangGraph is model-agnostic—it orchestrates the workflow; the model is just a component. Use any LangChain-compatible chat model: ChatAnthropic (Claude), ChatGoogleGenerativeAI (Gemini), ChatMistral, open-source models via Ollama, etc. You can even use different models for different nodes—a fast/cheap model for classification, a powerful model for generation, a specialized model for code. Just bind tools with model.bind_tools() as usual."
      },
      {
        question: "How do I debug a LangGraph agent?",
        answer: "Several approaches: (1) Enable verbose mode when available to see execution traces. (2) Add logging in your node functions—print state before and after operations. (3) Use checkpointing and inspect state with agent.get_state(config) to see current values and agent.get_state_history(config) to see all checkpoints. (4) Draw your graph structure (LangGraph can export to Mermaid diagrams) to visualize the flow. (5) Test nodes in isolation before assembling the graph. (6) Use LangSmith for comprehensive tracing and debugging of production agents."
      },
      {
        question: "What's the performance overhead of LangGraph vs a simple loop?",
        answer: "Minimal for most use cases. The graph structure adds some overhead for routing decisions and state management, but this is negligible compared to LLM API latency (hundreds of milliseconds to seconds). Checkpointing adds I/O overhead—MemorySaver is fastest, SQLite adds milliseconds, PostgreSQL adds network latency. For high-throughput scenarios, consider: (1) Async execution with agent.ainvoke(), (2) Connection pooling for database checkpointers, (3) Keeping state lean (don't store large objects). The benefits of explicit control flow usually outweigh the minor performance cost."
      },
      {
        question: "Can LangGraph handle parallel execution of nodes?",
        answer: "Yes, with some caveats. If you add edges from one node to multiple destinations (fan-out), and those nodes don't have dependencies on each other's outputs, LangGraph can execute them in parallel. Use the async interface (ainvoke) for best results. However, be careful with state updates—if two parallel nodes update the same field without proper reducers, you may get unexpected results. The add_messages reducer handles parallel message additions correctly. For complex parallel patterns, consider using LangGraph's 'Send' feature to explicitly route to multiple nodes simultaneously."
      }
    ],
    applications: [
      {
        title: "Customer Support Triage System",
        description: "Classifies incoming tickets by urgency and topic, routes to specialized handlers (billing, technical, general), escalates to human agents when confidence is low, and maintains conversation context across sessions with checkpointing."
      },
      {
        title: "Document Processing Pipeline",
        description: "Receives documents, classifies type (invoice, contract, resume, etc.), routes to appropriate extraction nodes, validates extracted data, handles errors with fallback extractors, and queues for human review when confidence thresholds aren't met."
      },
      {
        title: "Research Agent with Source Verification",
        description: "Searches multiple sources for information, cross-references findings across sources, flags contradictions for review, synthesizes verified information into reports, and maintains an audit trail of all sources consulted."
      },
      {
        title: "Code Review Assistant",
        description: "Analyzes pull requests, categorizes changes (refactor, feature, bugfix, security), runs type-specific checks, aggregates findings, generates review comments, and routes security-sensitive changes for human review before approval."
      },
      {
        title: "Sales Lead Qualification",
        description: "Receives lead information, enriches with external data, scores based on multiple criteria, routes high-value leads to immediate follow-up, schedules nurture sequences for lower-priority leads, and syncs state with CRM systems."
      },
      {
        title: "Content Moderation Pipeline",
        description: "Screens user-generated content through multiple checks (toxicity, spam, policy violation), routes flagged content to appropriate review queues, auto-approves clearly safe content, and maintains audit logs for compliance."
      }
    ],
    relatedDays: [1, 4, 5, 6, 8]
  }
};
