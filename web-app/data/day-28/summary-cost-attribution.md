# Cost Attribution for LLM Applications

## Overview

Cost attribution tracks token usage and computes costs per trace, user, feature, or time period. This enables budgeting, chargeback, optimization decisions, and anomaly detection.

## Token Counting

### API Response Tokens
Most reliable method - use the API's reported usage:

```python
response = client.chat.completions.create(...)

# OpenAI
usage = response.usage
input_tokens = usage.prompt_tokens
output_tokens = usage.completion_tokens

# Anthropic
usage = response.usage
input_tokens = usage.input_tokens
output_tokens = usage.output_tokens
```

### Pre-Request Estimation
For budget checks before calling:

```python
import tiktoken

def estimate_tokens(text: str, model: str = "gpt-4") -> int:
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))
```

### Caveats
- Cached tokens may be billed differently
- System prompts count every time
- Tool definitions add to input tokens
- Streaming may delay usage reporting

## Pricing Models

### Per-Million Token Pricing (as of early 2025)

| Model | Input ($/1M) | Output ($/1M) |
|-------|--------------|---------------|
| Claude Sonnet | $3.00 | $15.00 |
| Claude Haiku | $0.80 | $4.00 |
| GPT-4o | $2.50 | $10.00 |
| GPT-4o Mini | $0.15 | $0.60 |

### Cost Calculation

```python
def calculate_cost(input_tokens: int, output_tokens: int, model: str) -> float:
    pricing = MODEL_PRICING[model]
    return (input_tokens * pricing["input"] +
            output_tokens * pricing["output"]) / 1_000_000
```

### Cached Token Discounts
Some providers offer reduced pricing for cached prompts:
- Anthropic: 90% discount on cached input tokens
- OpenAI: Context caching for specific use cases

## Attribution Dimensions

### By User
```python
# Track cost per user
user_costs = defaultdict(float)

def on_llm_end(response, user_id):
    cost = calculate_cost(response)
    user_costs[user_id] += cost
```

### By Feature
```python
# Tag spans with feature name
span.set_attribute("feature", "customer_support")
span.set_attribute("feature.sub", "ticket_search")
```

### By Time Period
```python
# Aggregate by hour/day/month
from datetime import datetime

def record_cost(cost: float, timestamp: datetime):
    hour_key = timestamp.strftime("%Y-%m-%d-%H")
    hourly_costs[hour_key] += cost
```

### By Model
```python
# Compare costs across models
model_costs = {
    "claude-sonnet": {"calls": 0, "cost": 0.0},
    "claude-haiku": {"calls": 0, "cost": 0.0},
}
```

## Budget Controls

### Pre-Request Checks
```python
def check_budget(user_id: str, estimated_cost: float) -> bool:
    current_spend = get_user_spend(user_id)
    budget = get_user_budget(user_id)
    return current_spend + estimated_cost <= budget
```

### Rate Limiting by Cost
```python
from datetime import datetime, timedelta

class CostRateLimiter:
    def __init__(self, max_cost_per_minute: float):
        self.max_cost = max_cost_per_minute
        self.window_start = datetime.now()
        self.window_cost = 0.0

    def allow(self, estimated_cost: float) -> bool:
        now = datetime.now()
        if now - self.window_start > timedelta(minutes=1):
            self.window_start = now
            self.window_cost = 0.0

        if self.window_cost + estimated_cost > self.max_cost:
            return False

        self.window_cost += estimated_cost
        return True
```

### Alerting
```python
def check_cost_alerts(hourly_cost: float, thresholds: dict):
    alerts = []
    if hourly_cost > thresholds["warning"]:
        alerts.append({"level": "warning", "cost": hourly_cost})
    if hourly_cost > thresholds["critical"]:
        alerts.append({"level": "critical", "cost": hourly_cost})
    return alerts
```

## Cost Optimization Strategies

### Model Selection
Use cheaper models for simple tasks:
```python
def select_model(task_complexity: str) -> str:
    if task_complexity == "simple":
        return "claude-haiku"  # 4x cheaper
    return "claude-sonnet"
```

### Prompt Optimization
Reduce token usage:
- Shorter system prompts
- Concise examples
- Structured outputs (less verbose)

### Caching
Cache frequent queries:
```python
cache_key = hash(prompt + model)
if cache_key in cache:
    return cache[cache_key]  # Free!
```

### Batching
Combine multiple small requests:
```python
# Instead of 10 separate calls
for item in items:
    result = llm.invoke(item)

# One batched call
results = llm.batch(items)  # Often cheaper
```

## Chargeback Models

### Direct Attribution
Charge teams/users for their actual usage:
```python
monthly_bill = sum(user_costs[user_id] for trace in user_traces)
```

### Shared Cost Pools
Distribute shared infrastructure costs:
```python
team_share = (team_usage / total_usage) * infrastructure_cost
```

### Tiered Pricing
Internal pricing tiers:
- First 1M tokens/month: Free
- 1M-10M tokens: $0.01 per 1K
- 10M+: $0.005 per 1K

## Monitoring Dashboard Metrics

Essential cost metrics to track:
- **Cost per trace** (avg, P95, max)
- **Cost per user** (daily, monthly)
- **Cost by feature**
- **Cost trend** (hour over hour, day over day)
- **Token efficiency** (output tokens / input tokens)
- **Cost anomalies** (sudden spikes)

## Implementation Checklist

- [ ] Token counting from API responses
- [ ] Pricing table maintained
- [ ] Cost calculated per span
- [ ] Attribution dimensions tagged
- [ ] Budget limits configured
- [ ] Alerting thresholds set
- [ ] Dashboard created
- [ ] Chargeback reports generated
