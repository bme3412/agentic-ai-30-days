# Tracing Patterns for LLM Applications

## Overview

This guide covers practical patterns for implementing observability in LLM-powered agents, from basic tracing to production-grade monitoring.

## Sampling Strategies

### Head-Based Sampling
Decision made when trace starts:

```python
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

# Sample 10% of traces
sampler = TraceIdRatioBased(0.1)
```

**Pros**: Simple, low overhead
**Cons**: May miss important traces (errors, slow requests)

### Tail-Based Sampling
Decision made after trace completes:

```python
# Keep all error traces
if trace.status == ERROR:
    export(trace)
# Keep slow traces
elif trace.duration > threshold:
    export(trace)
# Sample the rest
elif random() < 0.1:
    export(trace)
```

**Pros**: Captures all interesting traces
**Cons**: Requires buffering, higher memory usage

### Hybrid Approach
Best of both worlds:

1. Head-sample at 10% for baseline
2. Force-sample specific conditions (errors, specific users)
3. Tail-sample for anomalies

## Attribute Cardinality Management

### The Problem
High-cardinality attributes (unique user IDs, request IDs) explode storage:

```python
# BAD: Creates millions of unique time series
span.set_attribute("request.id", uuid4())

# GOOD: Use trace context for unique IDs
span.set_attribute("user.tier", "premium")  # Low cardinality
```

### Best Practices

1. **Categorize, don't enumerate**: Use `user.tier` not `user.id` for metrics
2. **Use events for unique data**: Put unique IDs in span events, not attributes
3. **Truncate long values**: Limit attribute value length
4. **Avoid unbounded arrays**: Don't store full request bodies as attributes

## Async Span Handling

### The Challenge
Async operations can lose trace context:

```python
# BAD: Context may be lost
async def process():
    await some_async_call()  # New context?
```

### Solution: Explicit Context Propagation

```python
from opentelemetry import context

async def process():
    # Capture current context
    ctx = context.get_current()

    async def inner():
        # Restore context in async callback
        token = context.attach(ctx)
        try:
            with tracer.start_as_current_span("inner"):
                await do_work()
        finally:
            context.detach(token)

    await inner()
```

### LangChain Async Patterns

```python
# LangChain handles context automatically for async
result = await executor.ainvoke({"input": query})
```

## Cross-Service Trace Correlation

### HTTP Context Propagation

```python
from opentelemetry.propagate import inject, extract

# Outgoing request
headers = {}
inject(headers)
response = requests.get(url, headers=headers)

# Incoming request (receiving service)
context = extract(request.headers)
with tracer.start_as_current_span("handle_request", context=context):
    process()
```

### Message Queue Propagation

```python
# Producer
headers = {}
inject(headers)
message = {"data": payload, "trace_headers": headers}
queue.publish(message)

# Consumer
context = extract(message["trace_headers"])
with tracer.start_as_current_span("process_message", context=context):
    handle(message["data"])
```

## Privacy and Redaction Patterns

### Pre-Export Redaction

```python
import re

class RedactingSpanProcessor(SpanProcessor):
    PII_PATTERNS = [
        (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]'),
        (r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]'),
        (r'\b\d{16}\b', '[CARD]'),
    ]

    def on_end(self, span):
        for attr_name, attr_value in span.attributes.items():
            if isinstance(attr_value, str):
                for pattern, replacement in self.PII_PATTERNS:
                    attr_value = re.sub(pattern, replacement, attr_value)
```

### Selective Attribute Capture

```python
# Only capture safe attributes
SAFE_ATTRIBUTES = {'model', 'token_count', 'latency', 'status'}

def safe_span_attributes(full_attrs):
    return {k: v for k, v in full_attrs.items() if k in SAFE_ATTRIBUTES}
```

## Performance Impact Mitigation

### Batch Export

```python
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Batch spans for efficient export
processor = BatchSpanProcessor(
    exporter,
    max_queue_size=2048,
    max_export_batch_size=512,
    schedule_delay_millis=5000
)
```

### Async Export

```python
# Non-blocking export
processor = BatchSpanProcessor(exporter)
# Spans are queued and exported in background thread
```

### Payload Size Control

```python
MAX_PAYLOAD_SIZE = 1000  # characters

def truncate_payload(value):
    if isinstance(value, str) and len(value) > MAX_PAYLOAD_SIZE:
        return value[:MAX_PAYLOAD_SIZE] + "...[truncated]"
    return value
```

## Storage Optimization

### Retention Policies

- **Hot storage**: Last 24 hours, fast queries
- **Warm storage**: Last 7 days, slower queries
- **Cold storage**: Archive for compliance

### Compression

- Enable gzip for OTLP export
- Compress span payloads before storage

### Aggregation

- Store aggregate metrics (P50, P95, P99) separately
- Keep detailed traces only for errors and samples

## Production Checklist

- [ ] Sampling configured appropriately
- [ ] Attribute cardinality controlled
- [ ] PII redaction in place
- [ ] Async context propagation verified
- [ ] Cross-service correlation working
- [ ] Export batching enabled
- [ ] Retention policies defined
- [ ] Alerting configured
- [ ] Dashboard created
