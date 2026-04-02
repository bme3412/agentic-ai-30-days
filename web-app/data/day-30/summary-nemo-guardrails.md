# NeMo Guardrails Documentation Summary

> Source: https://docs.nvidia.com/nemo/guardrails/

## Overview

NeMo Guardrails is Nvidia's open-source toolkit for adding programmable guardrails to LLM-based conversational systems. It provides a domain-specific language (Colang) for defining dialog flows, input/output filters, and safety constraints without modifying the underlying LLM.

## Key Features

### Colang Language
- **User messages**: Define expected user intents with example utterances
- **Bot messages**: Define templated bot responses
- **Flows**: Chain user/bot messages into dialog patterns
- **Actions**: Call external functions and services

### Rail Types
- **Input rails**: Filter/validate user messages before LLM processing
- **Output rails**: Check/modify LLM responses before delivery
- **Dialog rails**: Control conversation flow and topic handling
- **Retrieval rails**: Gate RAG retrieval operations

### Installation
```bash
pip install nemoguardrails
```

## Colang 2.0 Syntax

### Define User Messages
```colang
define user ask about returns
  "How do I return an item?"
  "What's your return policy?"
  "Can I get a refund?"
```

### Define Bot Messages
```colang
define bot explain return policy
  "You can return most items within 30 days of purchase for a full refund. Items must be in original condition with tags attached."
```

### Define Flows
```colang
define flow handle returns
  user ask about returns
  bot explain return policy
  bot offer additional help
```

### Subflows and Conditions
```colang
define flow main
  if $user_is_authenticated
    bot greet returning user
  else
    bot greet new user

  activate handle customer query
```

## Configuration

### config.yml
```yaml
models:
  - type: main
    engine: openai
    model: gpt-4o

rails:
  input:
    flows:
      - self check input
      - check jailbreak
  output:
    flows:
      - self check output
      - check hallucination

  config:
    jailbreak_detection:
      enabled: true
      threshold: 0.8
```

## Python Integration

### Basic Setup
```python
from nemoguardrails import LLMRails, RailsConfig

config = RailsConfig.from_path("./config")
rails = LLMRails(config)

response = rails.generate(messages=[{
    "role": "user",
    "content": "What's your return policy?"
}])

print(response["content"])
```

### Streaming Responses
```python
async for chunk in rails.stream_async(messages=[...]):
    print(chunk, end="", flush=True)
```

### Custom Actions
```python
from nemoguardrails.actions import action

@action(name="check_inventory")
async def check_inventory(item_id: str):
    # Check inventory system
    return {"in_stock": True, "quantity": 42}
```

## Built-in Rails

### Input Rails
- **self_check_input**: LLM-based input validation
- **check_jailbreak**: Detect jailbreak attempts
- **mask_sensitive_data**: Redact PII before processing

### Output Rails
- **self_check_output**: LLM-based output validation
- **check_hallucination**: Verify factual accuracy
- **check_facts**: Cross-reference with knowledge base

### Dialog Rails
- **topic_control**: Keep conversations on topic
- **content_safety**: Block harmful content generation

## Best Practices

1. **Start simple**: Begin with basic topic control, add complexity gradually
2. **Test extensively**: Use diverse inputs including adversarial examples
3. **Layer defenses**: Combine multiple rail types for defense in depth
4. **Monitor in production**: Log rail activations for analysis
5. **Iterate on flows**: Refine based on real user interactions
6. **Balance safety and UX**: Overly aggressive filtering hurts user experience

## Performance Considerations

- Each rail adds latency (LLM calls for self-check rails)
- Use rule-based rails where possible for speed
- Consider caching for frequently triggered patterns
- Profile rail execution times in production

## Integration with LangChain

```python
from nemoguardrails.integrations.langchain.runnable_rails import RunnableRails

# Wrap any LangChain chain with guardrails
guarded_chain = RunnableRails(config) | your_langchain_chain
```
