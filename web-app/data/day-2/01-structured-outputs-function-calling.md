# Structured Outputs & Function Calling

**Sources:** OpenAI Documentation, Anthropic Documentation, DeepLearning.AI, Instructor Library
**Topics:** JSON Mode, Structured Outputs, Function Calling, Tool Use, Pydantic Integration

---

## Table of Contents

1. [Overview: Why Structured Outputs Matter](#1-overview-why-structured-outputs-matter)
2. [JSON Mode vs Structured Outputs](#2-json-mode-vs-structured-outputs)
3. [OpenAI Function Calling](#3-openai-function-calling)
4. [OpenAI Structured Outputs](#4-openai-structured-outputs)
5. [Anthropic Tool Use](#5-anthropic-tool-use)
6. [Instructor Library](#6-instructor-library)
7. [JSON Schema Essentials](#7-json-schema-essentials)
8. [Best Practices & Patterns](#8-best-practices--patterns)
9. [Common Pitfalls](#9-common-pitfalls)

---

## 1. Overview: Why Structured Outputs Matter

### The Problem with Free-Form Text

LLMs naturally generate free-form text. When you ask for JSON, you might get:

```
Here's the data you requested:
{"name": "John", "age": 34}
Hope that helps!
```

Or worse:

```json
{name: "John", age: "thirty-four"}  // Invalid JSON!
```

### The Solution

**Structured outputs** constrain the model's generation to guarantee valid, schema-compliant JSON. The model literally cannot produce invalid output.

| Approach | Valid JSON? | Schema Compliant? | Use Case |
|----------|-------------|-------------------|----------|
| Prompt engineering | Sometimes | No guarantee | Quick prototypes |
| JSON Mode | Always | No guarantee | Flexible JSON needs |
| Structured Outputs | Always | Always | Production systems |
| Function Calling | Always | Always | Agent tool use |

---

## 2. JSON Mode vs Structured Outputs

### JSON Mode (OpenAI)

Guarantees valid JSON, but NOT schema compliance.

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Return JSON with name and age fields."},
        {"role": "user", "content": "John is 34 years old."}
    ],
    response_format={"type": "json_object"}
)

# Guaranteed valid JSON, but structure may vary
data = json.loads(response.choices[0].message.content)
```

**Important:** You MUST mention "JSON" in your prompt when using JSON mode.

### Structured Outputs (OpenAI)

Guarantees BOTH valid JSON AND schema compliance.

```python
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    age: int
    email: str | None = None

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[{"role": "user", "content": "John is 34, john@test.com"}],
    response_format=Person
)

person = response.choices[0].message.parsed
# person.name = "John" (str, guaranteed)
# person.age = 34 (int, guaranteed)
```

---

## 3. OpenAI Function Calling

### Core Concept

Function calling allows the model to request execution of functions you define. The model doesn't execute anything—it returns a structured request that your code handles.

### Defining Tools

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a location. Use this when the user asks about weather conditions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city name, e.g., 'San Francisco' or 'London, UK'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit preference"
                    }
                },
                "required": ["location"]
            }
        }
    }
]
```

### Making a Function Call Request

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools,
    tool_choice="auto"  # or "required" or {"type": "function", "function": {"name": "get_weather"}}
)

message = response.choices[0].message

if message.tool_calls:
    for tool_call in message.tool_calls:
        print(f"Function: {tool_call.function.name}")
        print(f"Arguments: {tool_call.function.arguments}")
        print(f"Call ID: {tool_call.id}")
```

### Tool Choice Options

| Option | Behavior |
|--------|----------|
| `"auto"` | Model decides whether to call a tool |
| `"required"` | Model must call at least one tool |
| `"none"` | Model cannot call tools |
| `{"type": "function", "function": {"name": "X"}}` | Model must call specific function X |

### Complete Function Calling Loop

```python
import json

def execute_function(name: str, arguments: dict) -> str:
    """Execute a tool and return the result as a string."""
    if name == "get_weather":
        # Mock implementation
        return json.dumps({
            "location": arguments["location"],
            "temperature": 22,
            "unit": arguments.get("unit", "celsius"),
            "condition": "sunny"
        })
    return json.dumps({"error": f"Unknown function: {name}"})

def run_conversation(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools
        )

        assistant_message = response.choices[0].message
        messages.append(assistant_message)

        # If no tool calls, return the text response
        if not assistant_message.tool_calls:
            return assistant_message.content

        # Execute each tool call and add results
        for tool_call in assistant_message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)

            result = execute_function(function_name, function_args)

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result
            })
```

### Parallel Function Calls

Models can request multiple function calls in a single response:

```python
# User: "What's the weather in Paris and London?"

# Response might contain:
# tool_calls = [
#     {"name": "get_weather", "arguments": {"location": "Paris"}},
#     {"name": "get_weather", "arguments": {"location": "London"}}
# ]

# Execute in parallel for efficiency
import asyncio

async def execute_parallel(tool_calls):
    tasks = [
        execute_function_async(tc.function.name, json.loads(tc.function.arguments))
        for tc in tool_calls
    ]
    return await asyncio.gather(*tasks)
```

---

## 4. OpenAI Structured Outputs

### Using Pydantic Models

```python
from pydantic import BaseModel, Field
from typing import Literal
from enum import Enum

class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Task(BaseModel):
    """A task extracted from user input."""
    title: str = Field(description="Short task title")
    description: str = Field(description="Detailed task description")
    priority: Priority = Field(description="Task priority level")
    due_date: str | None = Field(default=None, description="Due date in YYYY-MM-DD format")
    tags: list[str] = Field(default_factory=list, description="Relevant tags")

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "Extract tasks from the user's message."},
        {"role": "user", "content": "I need to finish the quarterly report by Friday, it's urgent!"}
    ],
    response_format=Task
)

task = response.choices[0].message.parsed
print(f"Title: {task.title}")
print(f"Priority: {task.priority}")  # Guaranteed to be "low", "medium", or "high"
```

### Nested Objects

```python
class Address(BaseModel):
    street: str
    city: str
    country: str
    postal_code: str | None = None

class Company(BaseModel):
    name: str
    industry: str
    address: Address  # Nested object
    employee_count: int | None = None

class Person(BaseModel):
    name: str
    email: str
    company: Company  # Nested object with its own nested object
```

### Arrays of Objects

```python
class LineItem(BaseModel):
    description: str
    quantity: int
    unit_price: float

class Invoice(BaseModel):
    invoice_number: str
    customer_name: str
    items: list[LineItem]  # Array of objects
    total: float

    @property
    def calculated_total(self) -> float:
        return sum(item.quantity * item.unit_price for item in self.items)
```

### Handling Refusals

Sometimes the model refuses to generate output (e.g., for harmful requests):

```python
response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[...],
    response_format=MyModel
)

if response.choices[0].message.refusal:
    print(f"Model refused: {response.choices[0].message.refusal}")
else:
    result = response.choices[0].message.parsed
```

---

## 5. Anthropic Tool Use

### Tool Definition Format

Anthropic uses a slightly different format:

```python
import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a location",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City name"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"]
                }
            },
            "required": ["location"]
        }
    }
]
```

### Making Tool Requests

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What's the weather in Paris?"}]
)

# Check response content blocks
for block in response.content:
    if block.type == "text":
        print(f"Text: {block.text}")
    elif block.type == "tool_use":
        print(f"Tool: {block.name}")
        print(f"Input: {block.input}")
        print(f"ID: {block.id}")
```

### Returning Tool Results

```python
# After executing the tool, continue the conversation
messages = [
    {"role": "user", "content": "What's the weather in Paris?"},
    {"role": "assistant", "content": response.content},
    {
        "role": "user",
        "content": [
            {
                "type": "tool_result",
                "tool_use_id": tool_use_block.id,
                "content": json.dumps({"temperature": 18, "condition": "sunny"})
            }
        ]
    }
]

final_response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=messages
)
```

### Key Differences from OpenAI

| Aspect | OpenAI | Anthropic |
|--------|--------|-----------|
| Tool definition | `{"type": "function", "function": {...}}` | Direct object with `input_schema` |
| Parameters key | `parameters` | `input_schema` |
| Tool result role | `"tool"` | `"user"` with `tool_result` block |
| Result format | `{"role": "tool", "tool_call_id": ..., "content": ...}` | Content block with `type: "tool_result"` |

---

## 6. Instructor Library

Instructor provides a unified, type-safe interface for structured outputs across providers.

### Installation

```bash
pip install instructor
```

### Basic Usage

```python
import instructor
from openai import OpenAI
from pydantic import BaseModel

# Patch the client
client = instructor.from_openai(OpenAI())

class UserInfo(BaseModel):
    name: str
    age: int

# Simple extraction with automatic retry
user = client.chat.completions.create(
    model="gpt-4o",
    response_model=UserInfo,
    messages=[{"role": "user", "content": "John is 25 years old"}]
)

print(user.name)  # "John"
print(user.age)   # 25
```

### Multiple Providers

```python
import instructor
from openai import OpenAI
from anthropic import Anthropic

# OpenAI
openai_client = instructor.from_openai(OpenAI())

# Anthropic
anthropic_client = instructor.from_anthropic(Anthropic())

# Same model, same code!
class Person(BaseModel):
    name: str
    age: int

# Works with both:
person = openai_client.chat.completions.create(
    model="gpt-4o",
    response_model=Person,
    messages=[...]
)

person = anthropic_client.messages.create(
    model="claude-sonnet-4-20250514",
    response_model=Person,
    messages=[...]
)
```

### Validation with Retry

```python
from pydantic import BaseModel, field_validator

class ValidatedUser(BaseModel):
    name: str
    age: int
    email: str

    @field_validator('age')
    @classmethod
    def age_must_be_positive(cls, v):
        if v < 0:
            raise ValueError('Age must be positive')
        return v

    @field_validator('email')
    @classmethod
    def email_must_be_valid(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v

# Instructor will retry if validation fails
user = client.chat.completions.create(
    model="gpt-4o",
    response_model=ValidatedUser,
    max_retries=3,  # Retry up to 3 times on validation failure
    messages=[{"role": "user", "content": "..."}]
)
```

### Streaming Partial Objects

```python
from instructor import Partial

class Article(BaseModel):
    title: str
    content: str
    summary: str

# Stream partial results as they're generated
for partial in client.chat.completions.create_partial(
    model="gpt-4o",
    response_model=Article,
    messages=[{"role": "user", "content": "Write an article about AI"}]
):
    print(f"Title: {partial.title}")
    print(f"Content so far: {partial.content[:100]}...")
```

---

## 7. JSON Schema Essentials

### Basic Types

```json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "age": {"type": "integer"},
    "score": {"type": "number"},
    "active": {"type": "boolean"},
    "data": {"type": "null"}
  }
}
```

### String Constraints

```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 100,
  "pattern": "^[A-Za-z]+$"
}
```

### Number Constraints

```json
{
  "type": "integer",
  "minimum": 0,
  "maximum": 100,
  "multipleOf": 5
}
```

### Enums (Fixed Values)

```json
{
  "type": "string",
  "enum": ["low", "medium", "high"]
}
```

### Arrays

```json
{
  "type": "array",
  "items": {"type": "string"},
  "minItems": 1,
  "maxItems": 10,
  "uniqueItems": true
}
```

### Arrays of Objects

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {"type": "integer"},
      "name": {"type": "string"}
    },
    "required": ["id", "name"]
  }
}
```

### Optional vs Required

```json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "nickname": {"type": "string"}
  },
  "required": ["name"]
}
```

### Union Types (anyOf)

```json
{
  "anyOf": [
    {"type": "string"},
    {"type": "integer"}
  ]
}
```

### Pydantic to JSON Schema

```python
from pydantic import BaseModel, Field
from typing import Literal

class Task(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    priority: Literal["low", "medium", "high"]
    tags: list[str] = Field(default_factory=list, max_length=5)

# Get JSON Schema
schema = Task.model_json_schema()
print(json.dumps(schema, indent=2))
```

---

## 8. Best Practices & Patterns

### 1. Write Descriptive Tool Definitions

```python
# Bad
{
    "name": "search",
    "description": "Search for things",
    "parameters": {"query": {"type": "string"}}
}

# Good
{
    "name": "search_knowledge_base",
    "description": "Search the company knowledge base for product information, policies, and procedures. Use this when the user asks questions about company-specific topics that wouldn't be in general training data. Returns the top 5 most relevant documents.",
    "parameters": {
        "query": {
            "type": "string",
            "description": "Search query. Be specific and include relevant keywords. Example: 'return policy electronics'"
        },
        "category": {
            "type": "string",
            "enum": ["products", "policies", "procedures", "faq"],
            "description": "Filter results to a specific category for more relevant results"
        }
    }
}
```

### 2. Validate Before Execution

```python
def execute_tool(name: str, arguments: dict) -> str:
    # Validate arguments before execution
    if name == "send_email":
        email = arguments.get("to", "")
        if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
            return json.dumps({"error": "Invalid email format"})

        # Check against allowlist for sensitive operations
        if email.endswith("@competitor.com"):
            return json.dumps({"error": "Cannot send to this domain"})

    # Now safe to execute
    return actual_execution(name, arguments)
```

### 3. Handle Errors Gracefully

```python
def execute_with_error_handling(name: str, arguments: dict) -> str:
    try:
        result = execute_tool(name, arguments)
        return json.dumps({"success": True, "data": result})
    except RateLimitError:
        return json.dumps({
            "success": False,
            "error": "Rate limit exceeded. Please try again in a few minutes.",
            "retry_after": 60
        })
    except NotFoundError as e:
        return json.dumps({
            "success": False,
            "error": f"Resource not found: {e}",
            "suggestion": "Try searching with different terms"
        })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Unexpected error: {type(e).__name__}: {str(e)}"
        })
```

### 4. Use Enums for Constrained Choices

```python
# Let the model know exactly what values are valid
{
    "status": {
        "type": "string",
        "enum": ["pending", "in_progress", "completed", "cancelled"],
        "description": "Current status of the order"
    }
}
```

### 5. Provide Examples in Descriptions

```python
{
    "date": {
        "type": "string",
        "description": "Date in ISO format. Examples: '2024-03-15', '2024-12-01'"
    },
    "phone": {
        "type": "string",
        "description": "Phone number with country code. Examples: '+1-555-123-4567', '+44-20-7123-4567'"
    }
}
```

### 6. Set Reasonable Limits

```python
def run_agent(user_message: str, max_iterations: int = 10) -> str:
    messages = [{"role": "user", "content": user_message}]

    for i in range(max_iterations):
        response = client.chat.completions.create(...)

        if not response.choices[0].message.tool_calls:
            return response.choices[0].message.content

        # Execute tools...

    # Reached max iterations
    return "I wasn't able to complete this task within the allowed steps. Here's what I found so far: ..."
```

---

## 9. Common Pitfalls

### Pitfall 1: Not Including Tool Call ID

```python
# Wrong - missing tool_call_id
messages.append({
    "role": "tool",
    "content": result
})

# Correct
messages.append({
    "role": "tool",
    "tool_call_id": tool_call.id,  # Must match!
    "content": result
})
```

### Pitfall 2: Not Re-including Tools

```python
# After getting a tool result, you still need to include tools
# for the model to potentially make more calls

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools  # Don't forget this!
)
```

### Pitfall 3: Forgetting to Add Assistant Message

```python
# The assistant's tool call message must be added to the conversation
assistant_message = response.choices[0].message
messages.append(assistant_message)  # Don't skip this!

# Then add tool results
for tool_call in assistant_message.tool_calls:
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": result
    })
```

### Pitfall 4: JSON Mode Without "JSON" in Prompt

```python
# This might not work!
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extract the name and age"}],
    response_format={"type": "json_object"}
)

# This works
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extract the name and age as JSON"}],
    response_format={"type": "json_object"}
)
```

### Pitfall 5: Not Handling Empty/Null Responses

```python
# The model might return None for optional fields
class Person(BaseModel):
    name: str
    nickname: str | None = None

person = response.choices[0].message.parsed

# Safe access
display_name = person.nickname or person.name
```

### Pitfall 6: Infinite Tool Loops

```python
# Bad: No exit condition
while True:
    response = get_response()
    if response.tool_calls:
        execute_tools()
    # What if the model keeps calling tools forever?

# Good: Iteration limit + detection
seen_calls = set()
for i in range(MAX_ITERATIONS):
    response = get_response()

    if not response.tool_calls:
        break

    # Detect repeated identical calls
    call_sig = str(response.tool_calls)
    if call_sig in seen_calls:
        break  # Model is stuck
    seen_calls.add(call_sig)

    execute_tools()
```

---

## Quick Reference

### OpenAI Function Calling

```python
# Define
tools = [{"type": "function", "function": {"name": "...", "parameters": {...}}}]

# Call
response = client.chat.completions.create(model="gpt-4o", messages=[...], tools=tools)

# Handle
if response.choices[0].message.tool_calls:
    for tc in response.choices[0].message.tool_calls:
        result = execute(tc.function.name, json.loads(tc.function.arguments))
        messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})
```

### OpenAI Structured Outputs

```python
class MyModel(BaseModel):
    field: str

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[...],
    response_format=MyModel
)
result = response.choices[0].message.parsed
```

### Anthropic Tool Use

```python
tools = [{"name": "...", "description": "...", "input_schema": {...}}]

response = client.messages.create(model="claude-sonnet-4-20250514", messages=[...], tools=tools)

for block in response.content:
    if block.type == "tool_use":
        result = execute(block.name, block.input)
        messages.append({"role": "user", "content": [{"type": "tool_result", "tool_use_id": block.id, "content": result}]})
```

### Instructor

```python
client = instructor.from_openai(OpenAI())
result = client.chat.completions.create(model="gpt-4o", response_model=MyModel, messages=[...])
```
