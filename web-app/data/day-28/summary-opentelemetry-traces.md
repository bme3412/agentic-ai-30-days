# OpenTelemetry Traces Concepts Summary

> Source: https://opentelemetry.io/docs/concepts/signals/traces/

## Overview

OpenTelemetry (OTEL) is the industry standard for observability, providing vendor-neutral APIs and SDKs for collecting telemetry data. Traces are one of the three OTEL signals (alongside metrics and logs).

## Core Concepts

### Traces
A **trace** represents the complete journey of a request through a system. It contains:
- A unique trace ID
- One or more spans
- Context that propagates across services

### Spans
A **span** represents a single operation within a trace:
- **Span ID**: Unique identifier
- **Parent span ID**: Links to parent operation
- **Name**: Describes the operation
- **Start/end timestamps**: Duration measurement
- **Attributes**: Key-value metadata
- **Events**: Timestamped logs within the span
- **Status**: OK, ERROR, or UNSET

### Span Context
Context that travels with the trace:
- **Trace ID**: Identifies the entire trace
- **Span ID**: Current span identifier
- **Trace flags**: Sampling decisions
- **Trace state**: Vendor-specific data

## Span Hierarchy

```
Trace: user_request_12345
├── Span: HTTP Request (root)
│   ├── Span: Authenticate
│   ├── Span: Process Data
│   │   ├── Span: Database Query
│   │   └── Span: External API Call
│   └── Span: Generate Response
```

## Span Attributes

Attributes provide context about operations:

```python
span.set_attribute("user.id", "12345")
span.set_attribute("http.method", "POST")
span.set_attribute("db.statement", "SELECT * FROM users")
```

### Semantic Conventions
OTEL defines standard attribute names:
- `http.method`, `http.url`, `http.status_code`
- `db.system`, `db.statement`
- `rpc.service`, `rpc.method`

### LLM Semantic Conventions
Emerging conventions for LLM operations:
- `llm.model_name`
- `llm.token_count.prompt`
- `llm.token_count.completion`
- `llm.request.type`

## Span Events

Events are timestamped logs within a span:

```python
span.add_event("cache_miss", {
    "cache.key": "user_preferences",
    "cache.type": "redis"
})
```

## Span Status

Indicates operation outcome:
- **UNSET**: Default, operation succeeded
- **OK**: Explicitly successful
- **ERROR**: Operation failed

```python
span.set_status(Status(StatusCode.ERROR, "Database connection failed"))
```

## Context Propagation

Traces cross service boundaries via context propagation:

### W3C Trace Context
Standard HTTP headers:
- `traceparent`: Trace ID, span ID, flags
- `tracestate`: Vendor-specific data

### Propagation in Code
```python
from opentelemetry import propagate

# Extract context from incoming request
context = propagate.extract(carrier=request.headers)

# Inject context into outgoing request
propagate.inject(carrier=outgoing_headers)
```

## Sampling

Not all traces need to be collected:

### Head-based Sampling
Decision made at trace start:
- **Always On**: Collect everything
- **Always Off**: Collect nothing
- **Probability**: Random percentage

### Tail-based Sampling
Decision made after trace completes:
- Keep error traces
- Keep slow traces
- Keep based on attributes

## Instrumentation

### Automatic Instrumentation
Libraries wrap common frameworks:
```bash
pip install opentelemetry-instrumentation-requests
opentelemetry-instrument python app.py
```

### Manual Instrumentation
Explicit span creation:
```python
from opentelemetry import trace

tracer = trace.get_tracer("my-service")

with tracer.start_as_current_span("my_operation") as span:
    span.set_attribute("key", "value")
    # Do work
```

## Exporters

Send traces to observability backends:
- **Console**: Debug output
- **OTLP**: Standard protocol (Jaeger, Phoenix)
- **Zipkin**: Zipkin format
- **Cloud providers**: AWS, GCP, Azure

## Best Practices for LLM Applications

1. **Create spans for each LLM call**: Track model, tokens, latency
2. **Include tool/function calls**: Trace the full agent flow
3. **Add business context**: User ID, session, feature flags
4. **Handle async operations**: Maintain context across async boundaries
5. **Sample appropriately**: Balance visibility with cost
6. **Redact sensitive data**: Don't log PII in span attributes
