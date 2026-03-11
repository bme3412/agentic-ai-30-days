import type { Day } from '../../types';

export const day02: Day = {
  day: 2,
  phase: 1,
  title: "Structured Outputs & Function Calling",
  partner: "OpenAI / DeepLearning.AI",
  tags: ["tool-use", "json", "schemas"],
  concept: "Forcing LLMs to return valid JSON schemas for reliable downstream processing",
  demoUrl: "demos/day-2/",
  demoDescription: "Define a JSON schema, then watch as the LLM generates responses that exactly match your structure. Try different schemas and see how function calling enables the model to express intent through structured tool requests.",
  lesson: {
    overview: `Structured outputs and function calling are the foundation of reliable AI systems. While LLMs naturally produce free-form text, production applications need predictable, parseable data structures. This lesson teaches you how to constrain LLM outputs to valid JSON schemas and enable models to call external functions—the core capability that transforms chatbots into agents.

**Why This Matters**: Without structured outputs, you're parsing free text with regex and hoping for the best. With them, you get guaranteed-valid JSON that your code can trust. Function calling takes this further—instead of just returning data, the model can express *intent to act*, which your application then executes.`,

    principles: [
      {
        title: "Structured Outputs Guarantee Valid JSON",
        description: "Traditional prompting asks the model to 'return JSON' but provides no guarantees—the model might return malformed JSON, add explanatory text, or deviate from your schema. Structured outputs use constrained decoding to ensure every response is valid JSON matching your exact schema. The model literally cannot produce invalid output."
      },
      {
        title: "Function Calling Separates Intent from Execution",
        description: "Function calling (also called tool use) lets the model express what it wants to do without actually doing it. The model returns a structured request like 'call get_weather with location=Paris', and your code decides whether to execute it. This separation is crucial for safety, logging, and control."
      },
      {
        title: "Schemas Are Documentation for the Model",
        description: "When you define a JSON schema or function signature, you're not just specifying types—you're teaching the model what each field means. Good descriptions in your schema dramatically improve output quality. Think of schemas as prompts in disguise."
      },
      {
        title: "Tools Enable the ACT Phase",
        description: "Remember the OBSERVE-THINK-ACT-REFLECT loop from Day 1? Function calling is how agents ACT. The model thinks about what to do, then expresses that decision as a function call. Your code executes the function and returns results for the next iteration."
      }
    ],

    codeExample: {
      language: "python",
      title: "Basic Function Calling with OpenAI",
      code: `from openai import OpenAI

client = OpenAI()

# Define the tools (functions) the model can call
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name, e.g. 'Paris' or 'New York'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# Call the model with tools available
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools,
    tool_choice="auto"  # Let model decide when to use tools
)

# Check if the model wants to call a function
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    print(f"Function: {tool_call.function.name}")
    print(f"Arguments: {tool_call.function.arguments}")
    # Output: Function: get_weather
    # Output: Arguments: {"location": "Paris", "unit": "celsius"}`
    },

    diagram: {
      type: "flow",
      title: "Function Calling Flow",
      ascii: `
    ┌─────────────────────────────────────────────────────────────┐
    │                     USER MESSAGE                            │
    │              "What's the weather in Paris?"                 │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                      LLM + TOOLS                            │
    │  ┌─────────────────────────────────────────────────────┐    │
    │  │  Available Tools:                                    │    │
    │  │  • get_weather(location, unit)                      │    │
    │  │  • search_web(query)                                │    │
    │  │  • send_email(to, subject, body)                    │    │
    │  └─────────────────────────────────────────────────────┘    │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   TOOL CALL (JSON)                          │
    │  {                                                          │
    │    "name": "get_weather",                                   │
    │    "arguments": {"location": "Paris", "unit": "celsius"}   │
    │  }                                                          │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                YOUR CODE EXECUTES TOOL                      │
    │         result = get_weather("Paris", "celsius")            │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │               TOOL RESULT → BACK TO LLM                     │
    │            {"temp": 18, "condition": "sunny"}               │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   FINAL RESPONSE                            │
    │     "It's currently 18°C and sunny in Paris!"              │
    └─────────────────────────────────────────────────────────────┘`
    },

    keyTakeaways: [
      "Structured outputs guarantee valid JSON—no more parsing failures or malformed responses",
      "Function calling lets models express intent to act, while you control execution",
      "Good schema descriptions are as important as good prompts—they guide the model",
      "Tools are how agents interact with the world: APIs, databases, file systems, and more",
      "Always validate tool arguments before execution—the model might hallucinate values"
    ],

    resources: [
      { title: "OpenAI Function Calling Guide", url: "https://platform.openai.com/docs/guides/function-calling", type: "docs", summaryPath: "data/day-2/summary-openai-function-calling.md" },
      { title: "OpenAI Structured Outputs", url: "https://platform.openai.com/docs/guides/structured-outputs", type: "docs", summaryPath: "data/day-2/summary-openai-structured-outputs.md" },
      { title: "Anthropic Tool Use", url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use", type: "docs", summaryPath: "data/day-2/summary-anthropic-tool-use.md" },
      { title: "Functions, Tools and Agents with LangChain", url: "https://learn.deeplearning.ai/courses/functions-tools-agents-langchain", type: "course", summaryPath: "data/day-2/summary-langchain-functions-tools.md" }
    ],
    localResources: [
      {
        id: "structured-outputs-guide",
        title: "Structured Outputs & Function Calling Guide",
        description: "Comprehensive guide covering OpenAI, Anthropic, Instructor library, JSON schemas, and best practices",
        filePath: "data/day-2/01-structured-outputs-function-calling.md",
        type: "notes",
        estimatedTime: "30 min read"
      }
    ]
  },
  learn: {
    overview: {
      summary: "Master structured outputs and function calling to build reliable AI systems that return predictable data and can take actions in the world.",
      fullDescription: `If Day 1 taught you that agents are loops, Day 2 teaches you how those agents actually *do* things. The secret is **function calling** (also called tool use)—the ability for an LLM to express "I want to call this function with these arguments" in a structured, parseable way.

But function calling is actually a specific case of a broader capability: **structured outputs**. Instead of hoping the model returns valid JSON, structured outputs *guarantee* it. The model is constrained during generation to only produce tokens that result in valid JSON matching your schema. No more regex parsing. No more "please return JSON" prompt engineering. Just reliable, typed data.

**Why does this matter for agents?**

Remember the OBSERVE-THINK-ACT-REFLECT loop from Day 1. The ACT phase is where function calling comes in. When the agent decides to take an action—search the web, query a database, send an email—it expresses that intent as a function call. Your code then executes the function safely, logs it, and returns the result for the agent to observe.

This lesson covers:
1. **JSON Mode vs Structured Outputs**: The difference between "try to return JSON" and "guaranteed valid JSON"
2. **Defining Schemas**: How to specify exactly what structure you need using JSON Schema or Pydantic
3. **Function Calling Mechanics**: How tools are defined, how the model selects them, and how to handle responses
4. **Multi-Tool Scenarios**: When the model needs to call multiple functions or chain them together
5. **Error Handling**: What happens when tool calls fail, and how to recover gracefully
6. **Provider Differences**: How OpenAI, Anthropic, and other providers implement these features

By the end, you'll be able to build AI systems that reliably extract structured data from text, call external APIs, and form the foundation of agentic applications.`,
      prerequisites: ["Basic Python programming", "Familiarity with LLM APIs (OpenAI, Anthropic)", "Understanding of JSON"],
      estimatedTime: "2-3 hours",
      difficulty: "beginner"
    },
    concepts: [
      {
        title: "The Problem: LLMs Output Text, Applications Need Structure",
        description: `Large language models generate text token by token. When you ask GPT-4 to "return a JSON object with name and age," it will usually comply—but there's no guarantee. The model might:

- Add explanatory text before or after the JSON
- Use slightly wrong syntax (trailing commas, unquoted keys)
- Omit required fields or add unexpected ones
- Return a valid JSON that doesn't match your expected schema

This creates a fundamental tension: **LLMs are probabilistic text generators, but applications need deterministic data structures.**

Consider a simple example. You prompt: "Extract the person's name and age from this text: 'John Smith is 34 years old.'"

The model might return any of these:
\`\`\`
{"name": "John Smith", "age": 34}              ← Perfect
{"name": "John Smith", "age": "34"}            ← Age is string, not int
Here's the extracted data: {"name": "John"}    ← Missing age, has preamble
{"person": {"name": "John Smith", "age": 34}}  ← Different structure
\`\`\`

Traditional approaches use prompt engineering ("You MUST return valid JSON with exactly these fields...") and hope for the best. This works most of the time, but "most of the time" isn't good enough for production systems.

**Structured outputs solve this completely.** Instead of asking nicely, you *constrain* the model to only generate valid tokens. The model literally cannot produce output that doesn't match your schema.`
      },
      {
        title: "JSON Mode: The First Step",
        description: `Before structured outputs existed, providers introduced "JSON mode"—a weaker guarantee that the model will output valid JSON (but not necessarily matching your schema).

With OpenAI, you enable JSON mode like this:
\`\`\`python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extract name and age as JSON"}],
    response_format={"type": "json_object"}
)
\`\`\`

JSON mode guarantees:
✅ The output will be valid JSON (parseable with json.loads)
✅ No text before or after the JSON

JSON mode does NOT guarantee:
❌ The JSON matches any particular schema
❌ Required fields are present
❌ Field types are correct

JSON mode is useful when you need valid JSON but have flexible requirements. For strict schemas, you need full structured outputs.

**Important caveat**: With JSON mode, you must mention "JSON" somewhere in your prompt, or the model may not comply. The instruction to output JSON still comes from the prompt—JSON mode just enforces validity.`
      },
      {
        title: "Structured Outputs: Guaranteed Schema Compliance",
        description: `Structured outputs (introduced by OpenAI in 2024) go further than JSON mode: they guarantee the output matches your exact schema. This uses a technique called **constrained decoding**—at each token generation step, the model is only allowed to produce tokens that keep the output valid according to your schema.

Here's how it works with OpenAI:
\`\`\`python
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    age: int
    email: str | None = None

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[{"role": "user", "content": "John is 34, john@email.com"}],
    response_format=Person
)

person = response.choices[0].message.parsed
print(person.name)  # "John"
print(person.age)   # 34 (guaranteed to be int!)
\`\`\`

Notice we pass a Pydantic model directly. The SDK converts it to JSON Schema, sends it to the API, and parses the response back into a typed Python object.

**What the schema controls**:
- **Types**: String, integer, boolean, array, object, null
- **Required fields**: Which fields must be present
- **Enums**: Restrict to specific allowed values
- **Nested objects**: Complex hierarchical structures
- **Arrays with typed items**: Lists of specific object types

**Limitations**:
- Maximum schema complexity (nesting depth, number of properties)
- Some JSON Schema features unsupported (patterns, conditionals)
- First request with a new schema has latency overhead (schema compilation)

The key insight: **structured outputs make the schema part of the generation process, not just a validation step afterward.** The model is guided token-by-token to produce valid output.`
      },
      {
        title: "Function Calling: Teaching Models to Use Tools",
        description: `Function calling (also called tool use) extends structured outputs to a specific use case: letting the model request that your code execute a function.

Instead of the model directly taking actions (which would be unsafe), it outputs a structured request:
\`\`\`json
{
  "name": "send_email",
  "arguments": {
    "to": "john@example.com",
    "subject": "Hello",
    "body": "Hi John, just checking in!"
  }
}
\`\`\`

Your code then decides whether to actually send the email. This separation of **intent** (what the model wants to do) from **execution** (what actually happens) is crucial for:

1. **Safety**: You can validate, filter, or reject dangerous actions
2. **Logging**: Every action is captured before execution
3. **Simulation**: Test agent behavior without real side effects
4. **Human-in-the-loop**: Require approval for sensitive actions

**How function calling works**:

1. **Define tools**: Describe available functions with name, description, and parameters
2. **Send message with tools**: The model sees what functions it can call
3. **Model responds**: Either with text OR with a tool call request
4. **Execute tool**: Your code runs the function and gets a result
5. **Send result back**: Add the tool result to the conversation
6. **Model continues**: Generate final response using the tool result

This is a multi-turn interaction. The model doesn't execute functions—it requests them, you execute, and then the model incorporates the results.`
      },
      {
        title: "Defining Tools: The Art of Good Descriptions",
        description: `The quality of your tool definitions directly impacts how well the model uses them. A tool definition has three parts:

**1. Name**: A clear, descriptive function name
\`\`\`
✅ "search_knowledge_base"
✅ "get_current_weather"
❌ "function1"
❌ "do_thing"
\`\`\`

**2. Description**: Explains when and why to use this tool
\`\`\`
✅ "Search the company knowledge base for information about products,
    policies, and procedures. Use this when the user asks about company-
    specific information that wouldn't be in your training data."

❌ "Searches stuff"
\`\`\`

**3. Parameters**: JSON Schema defining the arguments
\`\`\`python
{
    "type": "object",
    "properties": {
        "query": {
            "type": "string",
            "description": "Search query. Be specific and include relevant keywords."
        },
        "max_results": {
            "type": "integer",
            "description": "Maximum number of results to return (1-10)",
            "default": 5
        },
        "category": {
            "type": "string",
            "enum": ["products", "policies", "procedures", "all"],
            "description": "Filter results to a specific category"
        }
    },
    "required": ["query"]
}
\`\`\`

**Pro tips for tool definitions**:
- Descriptions should explain *when* to use the tool, not just *what* it does
- Include examples in descriptions when helpful
- Use enums to constrain choices when there are limited valid options
- Make parameter descriptions guide the model toward good inputs
- Consider what the model might get wrong and add clarifying text`
      },
      {
        title: "Tool Choice: Auto, Required, and Specific",
        description: `When you provide tools to the model, you can control how it decides whether to use them:

**tool_choice: "auto"** (default)
The model decides whether to call a tool or respond with text. Use this for conversational agents that should only use tools when relevant.
\`\`\`python
tool_choice="auto"  # Model decides
# User: "Hello!" → Text response
# User: "What's the weather?" → Tool call
\`\`\`

**tool_choice: "required"**
The model MUST call at least one tool. It cannot respond with just text. Use this when you're building a pipeline where a tool call is always expected.
\`\`\`python
tool_choice="required"  # Must call something
# User: "Hello!" → Still calls a tool (might be awkward)
\`\`\`

**tool_choice: {"type": "function", "function": {"name": "specific_tool"}}**
Force the model to call a specific tool. Use this when you know which tool should be called and just need the model to fill in arguments.
\`\`\`python
tool_choice={"type": "function", "function": {"name": "get_weather"}}
# Model MUST call get_weather, just decides on arguments
\`\`\`

**Parallel tool calls**:
Modern models can request multiple tool calls in a single response:
\`\`\`json
[
  {"name": "get_weather", "arguments": {"location": "Paris"}},
  {"name": "get_weather", "arguments": {"location": "London"}}
]
\`\`\`

Your code should handle arrays of tool calls and potentially execute them in parallel for efficiency.`
      },
      {
        title: "The Tool Call Conversation Pattern",
        description: `Function calling creates a specific conversation pattern. Understanding this pattern is essential for implementing agents.

**Step 1: User message + tools**
\`\`\`python
messages = [{"role": "user", "content": "What's the weather in Paris?"}]
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools
)
\`\`\`

**Step 2: Model requests tool call**
\`\`\`python
assistant_message = response.choices[0].message
# assistant_message.tool_calls = [
#   ToolCall(id="call_abc123", function=Function(name="get_weather", arguments='{"location": "Paris"}'))
# ]
\`\`\`

**Step 3: Add assistant message and tool result**
\`\`\`python
messages.append(assistant_message)  # Add the assistant's tool call request

# Execute the tool
weather_data = get_weather("Paris")

# Add the tool result
messages.append({
    "role": "tool",
    "tool_call_id": "call_abc123",  # Must match the tool call ID
    "content": json.dumps(weather_data)
})
\`\`\`

**Step 4: Get final response**
\`\`\`python
final_response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools  # Still provide tools in case more calls needed
)
# "The weather in Paris is 18°C and sunny."
\`\`\`

**Key points**:
- Tool results are messages with role="tool"
- Each result must include tool_call_id matching the request
- The model might request more tool calls after seeing results
- Continue the loop until the model responds with text (no tool calls)`
      },
      {
        title: "Handling Tool Execution Errors",
        description: `Tools will sometimes fail—APIs go down, inputs are invalid, permissions are denied. Your agent needs to handle these gracefully.

**Strategy 1: Return error as tool result**
\`\`\`python
try:
    result = execute_tool(name, arguments)
    tool_result = {"success": True, "data": result}
except Exception as e:
    tool_result = {"success": False, "error": str(e)}

messages.append({
    "role": "tool",
    "tool_call_id": tool_call.id,
    "content": json.dumps(tool_result)
})
\`\`\`

The model will see the error and can:
- Try a different approach
- Ask the user for clarification
- Explain what went wrong

**Strategy 2: Retry with modifications**
\`\`\`python
if "rate_limit" in str(error):
    time.sleep(60)
    result = execute_tool(name, arguments)  # Retry
elif "invalid_location" in str(error):
    # Let the model know so it can try different input
    tool_result = {"error": "Location not found. Try a different city name."}
\`\`\`

**Strategy 3: Graceful degradation**
\`\`\`python
try:
    weather = get_live_weather(location)
except APIError:
    weather = get_cached_weather(location)  # Fallback to cache
    weather["note"] = "Using cached data from 1 hour ago"
\`\`\`

**What NOT to do**:
- Don't silently swallow errors—the model needs to know what happened
- Don't crash the entire agent on tool failure
- Don't retry infinitely without backoff`
      },
      {
        title: "Provider Differences: OpenAI vs Anthropic vs Others",
        description: `While the concepts are similar, each provider implements function calling slightly differently.

**OpenAI**:
- Uses "tools" array with "function" type
- Tool results have role="tool" with tool_call_id
- Supports parallel tool calls
- Has structured outputs with Pydantic integration
\`\`\`python
tools = [{"type": "function", "function": {...}}]
\`\`\`

**Anthropic (Claude)**:
- Uses "tools" array directly (no "function" wrapper)
- Tool results use role="user" with tool_result content blocks
- Supports parallel tool calls
- Tool use and text can be interleaved in responses
\`\`\`python
tools = [{"name": "...", "description": "...", "input_schema": {...}}]
\`\`\`

**Key differences in Anthropic**:
\`\`\`python
# Anthropic tool result format
messages.append({
    "role": "user",
    "content": [{
        "type": "tool_result",
        "tool_use_id": tool_use_block.id,
        "content": json.dumps(result)
    }]
})
\`\`\`

**Google (Gemini)**:
- Uses "function_declarations" in tools
- Different response structure
- Function calling modes: AUTO, ANY, NONE

**Abstraction layers** like LangChain, LlamaIndex, and Instructor normalize these differences, letting you write provider-agnostic code.`
      },
      {
        title: "Pydantic and Instructor: Type-Safe Tool Definitions",
        description: `Writing JSON schemas by hand is tedious and error-prone. Pydantic models provide a better developer experience, and the **Instructor** library makes working with structured outputs even easier.

**Pydantic for schema definition**:
\`\`\`python
from pydantic import BaseModel, Field
from typing import Literal

class WeatherRequest(BaseModel):
    """Get current weather for a location."""
    location: str = Field(description="City name, e.g. 'Paris'")
    unit: Literal["celsius", "fahrenheit"] = Field(
        default="celsius",
        description="Temperature unit"
    )

# Convert to JSON Schema for the API
schema = WeatherRequest.model_json_schema()
\`\`\`

**Instructor for structured extraction**:
\`\`\`python
import instructor
from openai import OpenAI

client = instructor.from_openai(OpenAI())

class UserInfo(BaseModel):
    name: str
    age: int
    email: str | None = None

# Automatically handles structured output
user = client.chat.completions.create(
    model="gpt-4o",
    response_model=UserInfo,
    messages=[{"role": "user", "content": "John Smith, 34, john@test.com"}]
)

print(user.name)  # "John Smith"
print(user.age)   # 34
\`\`\`

**Benefits of Pydantic + Instructor**:
- Type hints provide IDE autocomplete
- Validation happens automatically
- Schemas stay in sync with code
- Cleaner, more maintainable definitions
- Works with multiple providers`
      }
    ],
    codeExamples: [
      {
        title: "Complete Function Calling Loop",
        language: "python",
        category: "intermediate",
        code: `import json
from openai import OpenAI

client = OpenAI()

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City name"},
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_restaurants",
            "description": "Search for restaurants in a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"},
                    "cuisine": {"type": "string"},
                    "price_range": {"type": "string", "enum": ["$", "$$", "$$$"]}
                },
                "required": ["location"]
            }
        }
    }
]

# Tool implementations
def execute_tool(name: str, arguments: dict) -> str:
    if name == "get_weather":
        # Mock implementation
        return json.dumps({
            "location": arguments["location"],
            "temperature": 22,
            "condition": "sunny",
            "unit": arguments.get("unit", "celsius")
        })
    elif name == "search_restaurants":
        return json.dumps({
            "restaurants": [
                {"name": "Le Petit Bistro", "cuisine": "French", "rating": 4.5},
                {"name": "Pasta Palace", "cuisine": "Italian", "rating": 4.2}
            ]
        })
    return json.dumps({"error": f"Unknown tool: {name}"})

def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        assistant_message = response.choices[0].message
        messages.append(assistant_message)

        # If no tool calls, we're done
        if not assistant_message.tool_calls:
            return assistant_message.content

        # Execute each tool call
        for tool_call in assistant_message.tool_calls:
            result = execute_tool(
                tool_call.function.name,
                json.loads(tool_call.function.arguments)
            )
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result
            })

# Test it
print(run_agent("What's the weather in Paris and can you recommend restaurants?"))`,
        explanation: "This implements a complete function calling loop that handles multiple tools and continues until the model responds with text."
      },
      {
        title: "Structured Output with Pydantic",
        language: "python",
        category: "basic",
        code: `from pydantic import BaseModel, Field
from openai import OpenAI

client = OpenAI()

class MovieReview(BaseModel):
    """Structured movie review extraction."""
    title: str = Field(description="The movie title")
    rating: float = Field(ge=0, le=10, description="Rating from 0-10")
    sentiment: str = Field(description="Overall sentiment: positive, negative, or mixed")
    key_points: list[str] = Field(description="Main points from the review")
    recommended: bool = Field(description="Whether the reviewer recommends the movie")

review_text = """
Just watched Inception again - what a masterpiece! Nolan's direction is
impeccable, and the concept of dreams within dreams never gets old. The
cast, especially DiCaprio and Hardy, deliver stellar performances. The
only slight issue is the runtime - it's a bit long. Still, I'd give it
a solid 9/10 and definitely recommend it to anyone who loves smart sci-fi.
"""

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "Extract structured data from movie reviews."},
        {"role": "user", "content": review_text}
    ],
    response_format=MovieReview
)

review = response.choices[0].message.parsed
print(f"Title: {review.title}")
print(f"Rating: {review.rating}/10")
print(f"Sentiment: {review.sentiment}")
print(f"Recommended: {review.recommended}")
print(f"Key points: {review.key_points}")`,
        explanation: "Uses OpenAI's structured outputs with Pydantic to extract typed data from free-form text with guaranteed schema compliance."
      },
      {
        title: "Anthropic Tool Use",
        language: "python",
        category: "intermediate",
        code: `import anthropic
import json

client = anthropic.Anthropic()

tools = [
    {
        "name": "get_stock_price",
        "description": "Get the current stock price for a ticker symbol",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {
                    "type": "string",
                    "description": "Stock ticker symbol (e.g., AAPL, GOOGL)"
                }
            },
            "required": ["ticker"]
        }
    }
]

def get_stock_price(ticker: str) -> dict:
    # Mock implementation
    prices = {"AAPL": 178.50, "GOOGL": 141.25, "MSFT": 378.90}
    return {"ticker": ticker, "price": prices.get(ticker, 0), "currency": "USD"}

messages = [{"role": "user", "content": "What's Apple's stock price?"}]

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=messages
)

# Process the response
for block in response.content:
    if block.type == "tool_use":
        # Execute the tool
        result = get_stock_price(block.input["ticker"])

        # Continue conversation with tool result
        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [{
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(result)
            }]
        })

        # Get final response
        final = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )
        print(final.content[0].text)`,
        explanation: "Demonstrates the Anthropic/Claude approach to tool use, which has a different message format than OpenAI."
      }
    ],
    diagrams: [
      {
        title: "Structured Output Constraint Flow",
        type: "ascii",
        content: `
    ┌─────────────────────────────────────────────────────────────┐
    │                    YOUR SCHEMA                              │
    │  {                                                          │
    │    "type": "object",                                        │
    │    "properties": {                                          │
    │      "name": {"type": "string"},                           │
    │      "age": {"type": "integer"}                            │
    │    }                                                        │
    │  }                                                          │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                 CONSTRAINED DECODING                        │
    │                                                             │
    │  Token generation is RESTRICTED at each step:               │
    │                                                             │
    │  After '{"name": "John", '                                  │
    │  ┌─────────────────────────────────────────┐                │
    │  │ ALLOWED tokens:  "age"                   │                │
    │  │ BLOCKED tokens:  "foo", "xyz", "}"      │                │
    │  └─────────────────────────────────────────┘                │
    │                                                             │
    │  After '"age": '                                            │
    │  ┌─────────────────────────────────────────┐                │
    │  │ ALLOWED tokens:  0, 1, 2, 3, 4...       │                │
    │  │ BLOCKED tokens:  "abc", true, null      │                │
    │  └─────────────────────────────────────────┘                │
    │                                                             │
    └───────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                GUARANTEED VALID OUTPUT                      │
    │                                                             │
    │  {"name": "John", "age": 34}  ← Always valid JSON!         │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘`,
        caption: "Structured outputs constrain token generation to guarantee schema-valid JSON"
      }
    ],
    keyTakeaways: [
      "Structured outputs guarantee valid JSON matching your schema—no more parsing failures",
      "Function calling lets models express intent to act while you control execution",
      "Good tool descriptions are as important as good prompts—they guide model behavior",
      "The tool call loop: request → execute → result → continue until text response",
      "Pydantic + Instructor provide type-safe, maintainable tool definitions",
      "Different providers have different formats—abstraction layers help",
      "Always handle tool execution errors gracefully—return them as results for the model to process"
    ],
    resources: [
      { title: "OpenAI Function Calling Guide", url: "https://platform.openai.com/docs/guides/function-calling", type: "docs", description: "Official OpenAI documentation on function calling", summaryPath: "data/day-2/summary-openai-function-calling.md" },
      { title: "OpenAI Structured Outputs", url: "https://platform.openai.com/docs/guides/structured-outputs", type: "docs", description: "Guaranteed JSON schema compliance", summaryPath: "data/day-2/summary-openai-structured-outputs.md" },
      { title: "Anthropic Tool Use", url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use", type: "docs", description: "Claude's approach to function calling", summaryPath: "data/day-2/summary-anthropic-tool-use.md" },
      { title: "Instructor Library", url: "https://python.useinstructor.com/", type: "docs", description: "Pydantic-powered structured outputs for multiple providers", summaryPath: "data/day-2/summary-instructor-library.md" },
      { title: "Functions, Tools and Agents with LangChain", url: "https://learn.deeplearning.ai/courses/functions-tools-agents-langchain", type: "course", duration: "1h", difficulty: "beginner", description: "DeepLearning.AI course on tool use patterns", summaryPath: "data/day-2/summary-langchain-functions-tools.md" },
      { title: "JSON Schema Reference", url: "https://json-schema.org/understanding-json-schema/", type: "docs", description: "Learn to write effective JSON schemas", summaryPath: "data/day-2/summary-json-schema.md" }
    ],
    localResources: [
      {
        id: "structured-outputs-guide",
        title: "Structured Outputs & Function Calling Guide",
        description: "Comprehensive guide covering OpenAI, Anthropic, Instructor library, JSON schemas, and best practices",
        filePath: "data/day-2/01-structured-outputs-function-calling.md",
        type: "notes",
        estimatedTime: "30 min read"
      }
    ],
    faq: [
      {
        question: "What's the difference between JSON mode and structured outputs?",
        answer: "JSON mode guarantees valid JSON but not schema compliance—the model might return any valid JSON. Structured outputs guarantee the JSON matches your exact schema with correct types and required fields. Use structured outputs when you need predictable structure."
      },
      {
        question: "Can the model call multiple tools at once?",
        answer: "Yes, modern models support parallel tool calls. The response will contain an array of tool calls, and you should execute all of them (potentially in parallel) before sending results back. This is useful for queries like 'What's the weather in Paris AND London?'"
      },
      {
        question: "What happens if tool execution fails?",
        answer: "Return the error as the tool result. The model will see the error and can try a different approach, ask for clarification, or explain the failure to the user. Never silently swallow errors—the model needs feedback to reason about what went wrong."
      },
      {
        question: "How do I prevent the model from hallucinating tool arguments?",
        answer: "Use enums for constrained choices, add detailed descriptions, and validate arguments before execution. For critical values like IDs, consider having the model search/lookup first rather than guess. Always validate on your end before executing."
      },
      {
        question: "Should I use OpenAI's native tools or a library like LangChain?",
        answer: "Start with native APIs to understand the fundamentals. Libraries like LangChain and Instructor add convenience (provider abstraction, retries, validation) that's valuable in production. Learn the raw API first, then choose tools that solve real problems you encounter."
      }
    ],
    applications: [
      {
        title: "Data Extraction Pipeline",
        description: "Extract structured data from unstructured documents: invoices, receipts, contracts, emails. Define schemas for each document type and process at scale with guaranteed output format."
      },
      {
        title: "API Integration Agent",
        description: "An agent that can query multiple APIs (weather, stocks, news, databases) to answer complex questions. Each API becomes a tool the model can call with appropriate parameters."
      },
      {
        title: "Form-Filling Assistant",
        description: "Help users complete complex forms by extracting information from conversation and outputting structured data matching form schemas. Works for insurance applications, tax forms, onboarding flows."
      },
      {
        title: "Customer Support Automation",
        description: "Tools for looking up order status, checking inventory, initiating refunds, and escalating to humans. The model decides which actions to take based on the customer query."
      }
    ],
    relatedDays: [1, 3, 4, 6]
  }
};
