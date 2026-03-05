# OpenAI Structured Outputs

Structured Outputs is a feature that ensures the model always generates responses adhering to your supplied JSON Schema. You don't need to worry about the model omitting required keys or hallucinating invalid enum values. This provides reliable type-safety without validating or retrying incorrectly formatted responses, explicit programmatic detection of safety-based refusals, and simpler prompting without strongly worded instructions to achieve consistent formatting.

The OpenAI SDKs make it easy to define schemas using Pydantic in Python or Zod in JavaScript. You define a class with typed fields, pass it to the API, and get back a fully parsed object with IDE autocomplete support. The schema guarantees the output structure, so you can trust the data without additional validation.

```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

response = client.responses.parse(
    model="gpt-4o-2024-08-06",
    input=[
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."}
    ],
    text_format=CalendarEvent
)

event = response.output_parsed
```

Structured Outputs comes in two forms. Function calling is for when you're bridging the model to functions in your application—querying databases, interacting with UIs, or executing actions. Response format with `json_schema` is for structuring the model's output when it responds to the user, like generating a math tutoring UI that displays steps differently from the final answer. Use function calling for tools and actions, use response format for structured user-facing output.

The difference between Structured Outputs and JSON mode is schema adherence. Both ensure valid JSON, but only Structured Outputs guarantees the output matches your exact schema. JSON mode with older models like gpt-3.5-turbo will produce valid JSON but may not follow your structure. Always prefer Structured Outputs when available.

| Feature | Structured Outputs | JSON Mode |
|---------|-------------------|-----------|
| Valid JSON | Yes | Yes |
| Schema adherence | Yes | No |
| Compatible models | gpt-4o-mini, gpt-4o-2024-08-06+ | gpt-3.5-turbo, all gpt-4 models |

To use Structured Outputs, first define your JSON Schema with clear property names, descriptions for important fields, and required arrays listing mandatory fields. Supply the schema in your API call with `strict: true` to enable schema enforcement. The first request with any new schema has additional latency for processing, but subsequent requests are fast.

```python
response = client.responses.create(
    model="gpt-4o-2024-08-06",
    input=[
        {"role": "system", "content": "You are a helpful math tutor."},
        {"role": "user", "content": "how can I solve 8x + 7 = -23"}
    ],
    text={
        "format": {
            "type": "json_schema",
            "name": "math_response",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "explanation": {"type": "string"},
                                "output": {"type": "string"}
                            },
                            "required": ["explanation", "output"],
                            "additionalProperties": False
                        }
                    },
                    "final_answer": {"type": "string"}
                },
                "required": ["steps", "final_answer"],
                "additionalProperties": False
            }
        }
    }
)
```

When the model refuses to answer for safety reasons, it returns a refusal message instead of structured data. Your code should check for refusals and handle them appropriately—displaying the refusal in your UI or falling back to alternative logic. Edge cases like hitting max tokens can also result in incomplete responses that need handling.

Streaming works with Structured Outputs using the SDK's `stream()` method. You can process fields as they're generated rather than waiting for the complete response, which is useful for displaying progressive results in a UI.

```python
with client.responses.stream(
    model="gpt-4.1",
    input=[
        {"role": "system", "content": "Extract entities from the input text"},
        {"role": "user", "content": "The quick brown fox jumps over the lazy dog"}
    ],
    text_format=EntitiesModel
) as stream:
    for event in stream:
        if event.type == "response.output_text.delta":
            print(event.delta, end="")
```

Structured Outputs supports most JSON Schema features but has some constraints. All fields must be in the required array—use union types with null like `["string", "null"]` for optional fields. Every object must have `additionalProperties: false`. The root schema must be an object, not anyOf. Schemas can have up to 5000 properties with 10 levels of nesting. Enums are limited to 1000 values total. Recursive schemas using `$ref` and `$defs` are supported for complex hierarchical structures.

| Schema Constraint | Requirement |
|-------------------|-------------|
| All fields required | Use null union for optional fields |
| Additional properties | Must be false on all objects |
| Root type | Must be object (not anyOf) |
| Maximum properties | 5000 total |
| Maximum nesting | 10 levels |
| Enum values | 1000 maximum |

For user-generated input, include instructions on handling cases where input cannot produce a valid response. The model will try to adhere to your schema even with unrelated input, which can cause hallucination. If you see mistakes in outputs, adjust your instructions, provide examples in the system message, or split tasks into simpler subtasks. Using Pydantic or Zod in your codebase keeps schemas in sync with your types and prevents divergence.
