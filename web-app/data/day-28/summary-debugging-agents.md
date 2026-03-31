# Debugging Agents with Traces

## Overview

Debugging LLM-powered agents is fundamentally different from debugging traditional code. Agents make decisions based on natural language reasoning, and their behavior varies with each run. Traces provide the visibility needed to understand what happened and why.

## Common Agent Failure Modes

### 1. Tool Call Failures
**Symptoms**: Error in tool execution span
**Causes**:
- API timeouts
- Invalid tool inputs
- Authentication failures
- Rate limiting

**Debugging approach**:
1. Find the failed tool span
2. Examine input parameters
3. Check error message
4. Compare with successful calls

### 2. Incorrect Reasoning
**Symptoms**: Agent makes wrong decisions
**Causes**:
- Ambiguous instructions
- Missing context
- Prompt issues
- Model limitations

**Debugging approach**:
1. Read the LLM's reasoning output
2. Check what context was available
3. Compare with expected reasoning
4. Test with clearer prompts

### 3. Infinite Loops
**Symptoms**: Trace runs forever, high token count
**Causes**:
- No stop condition
- Circular dependencies
- Repeated tool calls

**Debugging approach**:
1. Look for repeated span patterns
2. Check loop detection logic
3. Verify stop conditions
4. Add iteration limits

### 4. Hallucination
**Symptoms**: Agent invents facts or tools
**Causes**:
- Insufficient grounding
- Missing information
- Overly creative prompts

**Debugging approach**:
1. Check retrieval spans
2. Verify source documents
3. Compare response to sources
4. Strengthen grounding prompts

### 5. Token Budget Exhaustion
**Symptoms**: Truncated context, degraded quality
**Causes**:
- Overly long conversations
- Large tool outputs
- Verbose system prompts

**Debugging approach**:
1. Check token counts per span
2. Identify token-heavy operations
3. Implement summarization
4. Trim context strategically

## Trace-Based Debugging Workflow

### Step 1: Identify the Problem Trace
```python
# Find failed traces
failed_runs = client.list_runs(
    project_name="my-project",
    filter='status = "error"',
    start_time=datetime.now() - timedelta(hours=1)
)
```

### Step 2: Navigate to Root Cause
1. Start at root span
2. Follow child spans chronologically
3. Look for first error or anomaly
4. Note the span type (LLM, tool, etc.)

### Step 3: Examine Span Details
Key information to check:
- **Inputs**: What did the span receive?
- **Outputs**: What did it produce?
- **Latency**: Was it abnormally slow?
- **Error**: What was the error message?
- **Context**: What was the agent state?

### Step 4: Compare with Success
```python
# Find similar successful traces
successful = client.list_runs(
    project_name="my-project",
    filter='status = "success" AND metadata.query_type = "same_type"'
)

# Compare span patterns
```

### Step 5: Reproduce and Fix
1. Extract inputs from failed trace
2. Create minimal reproduction
3. Apply fix
4. Verify with similar inputs

## Error Categorization

### Transient Errors
Will likely succeed on retry:
- Network timeouts
- Rate limits
- Temporary service outages

**Action**: Implement retry with backoff

### Recoverable Errors
Agent can handle gracefully:
- Tool not found
- Invalid parameters
- Missing data

**Action**: Add error handling prompts

### Fatal Errors
Require intervention:
- Authentication failures
- Configuration errors
- Critical bugs

**Action**: Alert and fix

## Reproducing Issues from Traces

### Extract Trace Data
```python
run = client.read_run(run_id="...")

# Get inputs
inputs = run.inputs

# Get intermediate state
child_runs = client.list_runs(run_ids=[run.id])
```

### Create Test Case
```python
def test_reproduction():
    # Use exact inputs from trace
    result = executor.invoke({
        "input": trace_inputs["input"],
        "context": trace_inputs.get("context")
    })

    # Verify behavior matches trace or is fixed
    assert result != trace_output  # Should be different (fixed)
```

## Regression Testing with Traces

### Build Test Dataset from Production
```python
# Export interesting traces
interesting_traces = client.list_runs(
    filter='metadata.interesting = "true"'
)

# Create dataset
dataset = client.create_dataset("regression-tests")
for trace in interesting_traces:
    client.create_example(
        inputs=trace.inputs,
        outputs=trace.outputs,  # Expected output
        dataset_id=dataset.id
    )
```

### Run Regression Tests
```python
def run_regression():
    examples = client.list_examples(dataset_id=dataset.id)
    results = []

    for example in examples:
        actual = executor.invoke(example.inputs)
        results.append({
            "input": example.inputs,
            "expected": example.outputs,
            "actual": actual,
            "match": actual == example.outputs
        })

    return results
```

## Incident Response with Observability

### Detection
- Alert on error rate spike
- Alert on latency degradation
- Alert on cost anomaly

### Triage
1. Check recent error traces
2. Identify common patterns
3. Categorize error type
4. Assess blast radius

### Investigation
1. Find first occurrence
2. Trace timeline of errors
3. Identify root cause
4. Document findings

### Resolution
1. Apply fix
2. Verify with test traces
3. Monitor recovery
4. Update runbooks

## Debugging Checklist

- [ ] Error trace identified
- [ ] Failed span located
- [ ] Error message examined
- [ ] Input parameters reviewed
- [ ] Context at failure understood
- [ ] Compared with successful traces
- [ ] Root cause identified
- [ ] Fix applied and tested
- [ ] Regression test added
- [ ] Runbook updated
