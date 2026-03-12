# CrewAI Flows: Event-Driven Orchestration

> Comprehensive guide to building stateful, event-driven workflows with CrewAI Flows

## What Are Flows?

Flows are CrewAI's orchestration layer for complex, multi-crew workflows. They provide:

| Feature | Description |
|---------|-------------|
| **Event-Driven** | Methods trigger based on completion of other methods |
| **Stateful** | Accumulated state passes through the workflow |
| **Conditional** | Route to different paths based on results |
| **Composable** | Combine multiple crews in sophisticated patterns |

---

## When to Use Flows

**Use Flows when:**
- Workflow requires conditional branching
- Multiple crews need to coordinate
- State must persist across crews
- You need parallel execution with sync points

**Stick with regular Crews when:**
- Workflow is linear (sequential tasks)
- Single crew handles the entire job
- No branching or complex coordination needed

---

## Core Decorators

### @start()

Entry point for the flow. Exactly one per Flow.

```python
from crewai.flow.flow import Flow, start

class MyFlow(Flow):
    @start()
    def begin(self):
        """First method to run."""
        return {"initial_data": self.inputs["topic"]}
```

### @listen()

Triggers when another method completes.

```python
from crewai.flow.flow import listen

@listen(begin)  # Triggered when begin() completes
def process(self, state):
    # state contains output from begin()
    return {"processed": transform(state["initial_data"])}
```

### @router()

Routes to different paths based on conditions.

```python
from crewai.flow.flow import router

@router(analyze)
def route_by_result(self, state):
    if state["confidence"] > 0.8:
        return "approve"  # Routes to @listen("approve")
    else:
        return "review"   # Routes to @listen("review")

@listen("approve")
def auto_approve(self, state):
    pass

@listen("review")
def manual_review(self, state):
    pass
```

---

## State Management

Each method receives accumulated state and can add to it:

```python
class StatefulFlow(Flow):
    @start()
    def step1(self):
        return {"a": 1}  # State: {"a": 1}

    @listen(step1)
    def step2(self, state):
        # state = {"a": 1}
        return {"b": 2}  # State: {"a": 1, "b": 2}

    @listen(step2)
    def step3(self, state):
        # state = {"a": 1, "b": 2}
        total = state["a"] + state["b"]
        return {"total": total}  # State: {"a": 1, "b": 2, "total": 3}
```

---

## Parallel Execution

Multiple methods can listen to the same event:

```python
class ParallelFlow(Flow):
    @start()
    def init(self):
        return {"topic": self.inputs["topic"]}

    @listen(init)  # Runs in parallel
    def research_a(self, state):
        return {"research_a": crew_a.kickoff(state).raw}

    @listen(init)  # Runs in parallel
    def research_b(self, state):
        return {"research_b": crew_b.kickoff(state).raw}
```

### Waiting for Multiple Paths

Use `and_()` to wait for multiple methods:

```python
from crewai.flow.flow import and_

@listen(and_(research_a, research_b))
def synthesize(self, state):
    # Only runs after BOTH research_a and research_b complete
    return {
        "synthesis": combine(
            state["research_a"],
            state["research_b"]
        )
    }
```

Use `or_()` to proceed when ANY completes:

```python
from crewai.flow.flow import or_

@listen(or_(fast_path, slow_path))
def continue_flow(self, state):
    # Runs when either path completes first
    pass
```

---

## Integrating Crews

Flows orchestrate crews:

```python
class ContentFlow(Flow):
    @start()
    def research(self):
        crew = Crew(
            agents=[researcher],
            tasks=[research_task],
            verbose=True
        )
        result = crew.kickoff(inputs=self.inputs)
        return {"research": result.raw}

    @listen(research)
    def write(self, state):
        crew = Crew(
            agents=[writer],
            tasks=[writing_task],
            verbose=True
        )
        result = crew.kickoff(inputs={"research": state["research"]})
        return {"draft": result.raw}
```

---

## Common Patterns

### Pattern 1: Sequential Crews

```python
class Pipeline(Flow):
    @start()
    def step1(self):
        return {"result": crew1.kickoff(self.inputs).raw}

    @listen(step1)
    def step2(self, state):
        return {"result": crew2.kickoff(state).raw}

    @listen(step2)
    def step3(self, state):
        return {"result": crew3.kickoff(state).raw}
```

### Pattern 2: Branch and Merge

```python
class BranchMerge(Flow):
    @start()
    def init(self):
        return {"data": self.inputs}

    @listen(init)
    def branch_a(self, state):
        return {"a_result": process_a(state)}

    @listen(init)
    def branch_b(self, state):
        return {"b_result": process_b(state)}

    @listen(and_(branch_a, branch_b))
    def merge(self, state):
        return {"merged": combine(state["a_result"], state["b_result"])}
```

### Pattern 3: Retry Loop

```python
class RetryFlow(Flow):
    @start()
    def attempt(self):
        try:
            result = risky_operation()
            return {"result": result, "success": True}
        except Exception as e:
            return {"error": str(e), "success": False, "attempts": 1}

    @router(attempt)
    def check_result(self, state):
        if state["success"]:
            return "complete"
        elif state.get("attempts", 0) < 3:
            return "retry"
        else:
            return "fail"

    @listen("retry")
    def retry_attempt(self, state):
        try:
            result = risky_operation()
            return {"result": result, "success": True}
        except Exception as e:
            return {
                "error": str(e),
                "success": False,
                "attempts": state["attempts"] + 1
            }

    # retry_attempt feeds back to check_result via router
```

### Pattern 4: Human Approval Gate

```python
class ApprovalFlow(Flow):
    @start()
    def generate(self):
        return {"draft": generation_crew.kickoff(self.inputs).raw}

    @listen(generate)
    def submit_for_approval(self, state):
        # In production: send notification, create ticket
        approval = await get_human_decision(state["draft"])
        return {"approved": approval, "feedback": approval.feedback}

    @router(submit_for_approval)
    def route_approval(self, state):
        if state["approved"]:
            return "publish"
        else:
            return "revise"

    @listen("publish")
    def publish(self, state):
        return {"status": "published", "content": state["draft"]}

    @listen("revise")
    def revise(self, state):
        revised = revision_crew.kickoff({
            "draft": state["draft"],
            "feedback": state["feedback"]
        })
        return {"draft": revised.raw}
        # Could loop back to submit_for_approval
```

---

## Running Flows

```python
# Create flow instance
flow = MyFlow()

# Run with inputs
result = flow.kickoff(inputs={
    "topic": "AI trends",
    "depth": "comprehensive"
})

# Access final state
print(result)
```

---

## Best Practices

1. **One @start**: Each flow has exactly one entry point
2. **Clear routing**: Router return values must match @listen strings exactly
3. **Immutable state**: Don't modify state in place; return new values
4. **Error handling**: Wrap crew calls in try/except for resilience
5. **Logging**: Add logging to track flow execution
6. **Testing**: Test individual paths before combining

---

## Debugging Tips

```python
class DebuggableFlow(Flow):
    @start()
    def begin(self):
        print(f"Starting with inputs: {self.inputs}")
        return {"start": True}

    @listen(begin)
    def process(self, state):
        print(f"Process received state: {state}")
        result = some_operation()
        print(f"Process returning: {result}")
        return result

    @router(process)
    def route(self, state):
        decision = "path_a" if state["condition"] else "path_b"
        print(f"Routing to: {decision}")
        return decision
```
