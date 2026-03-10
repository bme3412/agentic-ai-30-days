# Human-in-the-Loop Patterns

> Comprehensive guide to implementing approval workflows and human intervention in LangGraph

## Why Human-in-the-Loop?

AI agents are powerful but not infallible. Human-in-the-loop (HITL) patterns ensure appropriate oversight for:

| Scenario | Why HITL? | Example |
|----------|-----------|---------|
| **Sensitive Operations** | Irreversible or high-stakes actions | Sending emails, deleting data, financial transactions |
| **Quality Assurance** | Human judgment needed for quality | Publishing content, customer responses |
| **Low Confidence** | AI isn't certain enough | Ambiguous requests, edge cases |
| **Compliance** | Regulatory requirements | Healthcare decisions, legal advice |
| **Escalation** | Beyond AI capability | Complex technical issues, emotional situations |
| **Learning** | Improve AI over time | Correcting mistakes, providing feedback |

## The Fundamental Pattern

Every HITL workflow follows this structure:

```
┌──────────────────────────────────────────────────────────────────┐
│                    HUMAN-IN-THE-LOOP LIFECYCLE                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. EXECUTE         Agent works on the task                       │
│       │                                                           │
│       ▼                                                           │
│  2. CHECKPOINT      State is saved (persistence required!)        │
│       │                                                           │
│       ▼                                                           │
│  3. PAUSE           Workflow stops, waiting for human             │
│       │                                                           │
│    ═══╪═══ EXTERNAL WORLD ═══════════════════════════════         │
│       │   • Notification sent to human                            │
│       │   • Human reviews in UI/app                               │
│       │   • Human makes decision                                  │
│       │   • Decision sent back to system                          │
│    ═══╪═══════════════════════════════════════════════════        │
│       │                                                           │
│       ▼                                                           │
│  4. UPDATE STATE    External system calls update_state()          │
│       │                                                           │
│       ▼                                                           │
│  5. RESUME          invoke(None, config) continues workflow       │
│       │                                                           │
│       ▼                                                           │
│  6. ROUTE           Workflow branches based on decision           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Implementation

### Step 1: Design State for Interruption

Your state needs fields to track the approval process:

```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages

class ApprovalState(TypedDict):
    # Core conversation
    messages: Annotated[list, add_messages]

    # The artifact being reviewed
    draft: str

    # Approval tracking
    approval_status: Literal["pending", "approved", "rejected"] | None
    reviewer_id: str | None
    review_timestamp: str | None

    # Feedback for revisions
    feedback: str
    revision_count: int

    # Metadata
    task_type: str
    priority: Literal["low", "medium", "high", "urgent"]
```

**Key Design Principles:**

1. **Use `None` for "not yet decided"** - distinguishes from explicit rejection
2. **Include feedback field** - humans should explain rejections
3. **Track revision count** - prevent infinite loops
4. **Add metadata** - helps with routing, prioritization, analytics

---

### Step 2: Create the Routing Function

The routing function detects the "waiting" state and directs traffic:

```python
from typing import Literal

def route_after_generation(state: ApprovalState) -> Literal["approved", "rejected", "waiting", "max_revisions"]:
    """Route based on approval status and revision count."""

    # Safety check: prevent infinite revision loops
    if state.get("revision_count", 0) >= 5:
        return "max_revisions"

    # Check approval status
    status = state.get("approval_status")

    if status is None:
        return "waiting"
    elif status == "approved":
        return "approved"
    elif status == "rejected":
        return "rejected"
    else:
        # Unknown status - treat as waiting
        return "waiting"
```

**Using Literal Type Hints:**

Always use `Literal` for routing return types. This provides:
- IDE autocomplete and type checking
- Runtime validation (in strict mode)
- Self-documenting code

---

### Step 3: Build the Graph

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres import PostgresSaver

def generate_draft(state: ApprovalState) -> dict:
    """Generate initial draft or revision."""
    if state.get("feedback"):
        # This is a revision
        prompt = f"""
        Original draft: {state['draft']}
        Feedback: {state['feedback']}

        Please revise the draft to address the feedback.
        """
    else:
        # Initial generation
        prompt = state["messages"][-1].content

    response = llm.invoke([
        {"role": "system", "content": "You are a professional writer."},
        {"role": "user", "content": prompt}
    ])

    return {
        "draft": response.content,
        "approval_status": None,  # Reset to pending
        "feedback": "",  # Clear feedback
        "revision_count": state.get("revision_count", 0) + 1
    }

def prepare_for_review(state: ApprovalState) -> dict:
    """Prepare the draft for human review."""
    # This node can send notifications, log events, etc.
    return {
        "review_timestamp": datetime.now().isoformat()
    }

def finalize_draft(state: ApprovalState) -> dict:
    """Finalize and publish the approved draft."""
    # Perform final actions (save to DB, send, publish, etc.)
    return {
        "messages": [("assistant", f"Draft approved and finalized:\n\n{state['draft']}")]
    }

def handle_max_revisions(state: ApprovalState) -> dict:
    """Handle case where max revisions exceeded."""
    return {
        "messages": [("assistant", "Maximum revisions reached. Please start a new request or contact support.")]
    }

# Build the graph
graph = StateGraph(ApprovalState)

# Add nodes
graph.add_node("generate", generate_draft)
graph.add_node("prepare_review", prepare_for_review)
graph.add_node("finalize", finalize_draft)
graph.add_node("max_revisions", handle_max_revisions)

# Set entry point
graph.set_entry_point("generate")

# Connect generate to review preparation
graph.add_edge("generate", "prepare_review")

# Add conditional routing after review preparation
graph.add_conditional_edges(
    "prepare_review",
    route_after_generation,
    {
        "approved": "finalize",
        "rejected": "generate",  # Loop back for revision
        "waiting": END,  # Pause execution here
        "max_revisions": "max_revisions"
    }
)

# Terminal nodes
graph.add_edge("finalize", END)
graph.add_edge("max_revisions", END)

# Compile with persistent checkpointer (REQUIRED for HITL!)
checkpointer = PostgresSaver.from_conn_string("postgresql://...")
agent = graph.compile(checkpointer=checkpointer)
```

---

### Step 4: Run Until Pause

```python
# Initial invocation
config = {"configurable": {"thread_id": "approval-workflow-123"}}

result = agent.invoke({
    "messages": [("human", "Write a product announcement for our new AI feature")],
    "draft": "",
    "approval_status": None,
    "reviewer_id": None,
    "review_timestamp": None,
    "feedback": "",
    "revision_count": 0,
    "task_type": "content",
    "priority": "medium"
}, config)

# Check state
state = agent.get_state(config)
print(f"Draft generated: {result['draft'][:100]}...")
print(f"Waiting for review: {state.next}")  # Should show workflow is paused
```

---

### Step 5: External System Integration

Your application needs to:
1. Notify humans when approval is needed
2. Display the draft for review
3. Collect the decision
4. Update the agent state

**Example: FastAPI Integration**

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class ReviewDecision(BaseModel):
    decision: Literal["approved", "rejected"]
    feedback: str = ""
    reviewer_id: str

@app.get("/pending-reviews")
async def get_pending_reviews():
    """Get all workflows waiting for review."""
    # Query your database for pending reviews
    pending = db.query(
        "SELECT thread_id, draft, priority, created_at FROM pending_reviews"
    )
    return pending

@app.get("/review/{thread_id}")
async def get_review_details(thread_id: str):
    """Get details for a specific review."""
    config = {"configurable": {"thread_id": thread_id}}
    state = agent.get_state(config)

    if not state or "waiting" not in str(state.next):
        raise HTTPException(404, "Review not found or not pending")

    return {
        "thread_id": thread_id,
        "draft": state.values.get("draft"),
        "revision_count": state.values.get("revision_count"),
        "messages": state.values.get("messages")
    }

@app.post("/review/{thread_id}")
async def submit_review(thread_id: str, decision: ReviewDecision):
    """Submit a review decision."""
    config = {"configurable": {"thread_id": thread_id}}

    # Verify workflow is waiting for review
    state = agent.get_state(config)
    if not state or state.values.get("approval_status") is not None:
        raise HTTPException(400, "Workflow not awaiting review")

    # Update state with decision
    agent.update_state(config, {
        "approval_status": decision.decision,
        "feedback": decision.feedback,
        "reviewer_id": decision.reviewer_id
    })

    # Resume execution
    result = agent.invoke(None, config)

    return {
        "status": "processed",
        "final_state": result.get("approval_status"),
        "thread_id": thread_id
    }
```

**Example: Slack Integration**

```python
from slack_bolt import App

slack_app = App(token=os.environ["SLACK_BOT_TOKEN"])

def send_review_request(thread_id: str, draft: str, channel: str):
    """Send review request to Slack."""
    slack_app.client.chat_postMessage(
        channel=channel,
        blocks=[
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*New Content for Review*\n\n{draft[:500]}..."
                }
            },
            {
                "type": "actions",
                "block_id": f"review_{thread_id}",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Approve"},
                        "style": "primary",
                        "action_id": "approve",
                        "value": thread_id
                    },
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Reject"},
                        "style": "danger",
                        "action_id": "reject",
                        "value": thread_id
                    }
                ]
            }
        ]
    )

@slack_app.action("approve")
def handle_approve(ack, body):
    ack()
    thread_id = body["actions"][0]["value"]
    user_id = body["user"]["id"]

    config = {"configurable": {"thread_id": thread_id}}
    agent.update_state(config, {
        "approval_status": "approved",
        "reviewer_id": user_id
    })
    agent.invoke(None, config)

@slack_app.action("reject")
def handle_reject(ack, body, client):
    ack()
    thread_id = body["actions"][0]["value"]

    # Open modal for feedback
    client.views_open(
        trigger_id=body["trigger_id"],
        view={
            "type": "modal",
            "callback_id": f"reject_feedback_{thread_id}",
            "title": {"type": "plain_text", "text": "Rejection Feedback"},
            "submit": {"type": "plain_text", "text": "Submit"},
            "blocks": [
                {
                    "type": "input",
                    "block_id": "feedback",
                    "element": {
                        "type": "plain_text_input",
                        "multiline": True,
                        "action_id": "feedback_input"
                    },
                    "label": {"type": "plain_text", "text": "What should be changed?"}
                }
            ]
        }
    )
```

---

## Common HITL Patterns

### Pattern 1: Simple Approval Gate

Single approval before execution:

```
Generate → [Approval Gate] → Execute
                │
                └─rejected─→ END (abort)
```

### Pattern 2: Revision Loop

Iterative refinement until approved:

```
Generate → [Approval Gate] → Finalize
                │
                └─rejected─→ Revise → [Approval Gate]
                                           │
                                           └─(loop)
```

### Pattern 3: Confidence-Based Routing

Only pause when AI isn't confident:

```python
def route_by_confidence(state) -> Literal["auto_proceed", "human_review"]:
    confidence = state.get("confidence_score", 1.0)
    if confidence < 0.7:
        return "human_review"
    return "auto_proceed"
```

### Pattern 4: Escalation Chain

Multiple levels of review:

```
Generate → [L1 Review] → [L2 Review] → Execute
              │              │
              │              └─rejected─→ Revise
              └─rejected─→ Revise
```

### Pattern 5: Parallel Review

Multiple reviewers must agree:

```python
class MultiReviewState(TypedDict):
    draft: str
    reviews: dict[str, Literal["approved", "rejected"]]
    required_approvals: int

def check_consensus(state) -> Literal["approved", "rejected", "waiting"]:
    reviews = state.get("reviews", {})
    required = state.get("required_approvals", 2)

    approvals = sum(1 for v in reviews.values() if v == "approved")
    rejections = sum(1 for v in reviews.values() if v == "rejected")

    if approvals >= required:
        return "approved"
    elif rejections > 0:
        return "rejected"
    else:
        return "waiting"
```

### Pattern 6: Time-Boxed Review

Auto-proceed if no response within timeout:

```python
def route_with_timeout(state) -> Literal["approved", "rejected", "waiting", "timeout"]:
    status = state.get("approval_status")

    if status is not None:
        return status

    # Check timeout
    review_start = state.get("review_timestamp")
    if review_start:
        elapsed = datetime.now() - datetime.fromisoformat(review_start)
        if elapsed > timedelta(hours=24):
            return "timeout"

    return "waiting"
```

---

## Handling Edge Cases

### Timeout Handling

```python
def handle_timeout(state: ApprovalState) -> dict:
    """Handle review timeout."""
    priority = state.get("priority", "medium")

    if priority == "urgent":
        # Escalate to manager
        notify_manager(state)
        return {"approval_status": None, "escalated": True}
    elif priority in ["low", "medium"]:
        # Auto-approve low-risk items
        return {"approval_status": "approved", "auto_approved": True}
    else:
        # Reject and notify
        notify_requester("Review timed out")
        return {"approval_status": "rejected", "feedback": "Timed out"}
```

### Reviewer Not Available

```python
def reassign_review(thread_id: str, new_reviewer_id: str):
    """Reassign a review to a different person."""
    config = {"configurable": {"thread_id": thread_id}}

    agent.update_state(config, {
        "reviewer_id": new_reviewer_id,
        "review_timestamp": datetime.now().isoformat()
    })

    notify_reviewer(new_reviewer_id, thread_id)
```

### Concurrent Modifications

```python
def submit_review_safe(thread_id: str, decision: str, reviewer_id: str):
    """Submit review with optimistic locking."""
    config = {"configurable": {"thread_id": thread_id}}

    # Get current state
    state = agent.get_state(config)
    current_status = state.values.get("approval_status")

    if current_status is not None:
        raise ConflictError("Review already submitted by another user")

    # Update with reviewer check
    agent.update_state(config, {
        "approval_status": decision,
        "reviewer_id": reviewer_id,
        "review_timestamp": datetime.now().isoformat()
    })
```

---

## Best Practices

### Do:

1. **Always use persistent checkpointers** (SqliteSaver or PostgresSaver)
2. **Implement timeouts** - don't let workflows hang forever
3. **Log all decisions** - create audit trails
4. **Provide context** - humans need information to decide
5. **Allow feedback** - rejections should explain why
6. **Limit revisions** - prevent infinite loops
7. **Send notifications** - humans need to know action is required
8. **Handle errors gracefully** - what if the human's response is invalid?

### Don't:

1. **Use MemorySaver** - data will be lost on restart
2. **Assume immediate response** - humans are slow
3. **Block synchronously** - workflows can wait hours or days
4. **Expose sensitive data** - redact PII in review UIs
5. **Forget cleanup** - old pending reviews should be handled

---

## Monitoring and Analytics

Track these metrics:

| Metric | Purpose |
|--------|---------|
| Pending review count | Workload monitoring |
| Average review time | SLA tracking |
| Approval rate | Process health |
| Revision count distribution | Content quality |
| Timeout rate | Process bottlenecks |
| Reviewer response time | Individual performance |

```python
# Example: Log review metrics
def log_review_completion(state: ApprovalState):
    metrics.record({
        "event": "review_completed",
        "thread_id": state["thread_id"],
        "decision": state["approval_status"],
        "revision_count": state["revision_count"],
        "review_duration_seconds": calculate_duration(state),
        "reviewer_id": state["reviewer_id"],
        "task_type": state["task_type"]
    })
```

---

## Key Takeaways

1. **HITL requires persistent checkpointing** - MemorySaver won't work
2. **Design state with approval fields** - `approval_status`, `feedback`, `reviewer_id`
3. **Use conditional routing** to detect "waiting" state and pause execution
4. **update_state() + invoke(None)** is the pattern to resume
5. **Build external infrastructure** - notifications, review UI, API endpoints
6. **Always handle timeouts** - don't let workflows hang indefinitely
7. **Limit revision cycles** - prevent infinite loops
8. **Log everything** - you'll need audit trails

## Resources

- [Human-in-the-Loop Docs](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/)
- [Breakpoints and Interrupts](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/breakpoints/)
- [Wait for User Input](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/wait-user-input/)
- [Review Tool Calls](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/review-tool-calls/)
- [Dynamic Breakpoints](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/dynamic_breakpoints/)
