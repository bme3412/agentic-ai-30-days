# Building Custom Tools in LangChain

## Overview

While LangChain provides many built-in tools, real-world applications often need custom tools tailored to specific domains. This guide covers patterns for building robust, production-ready custom tools.

## The @tool Decorator

The simplest way to create a tool:

```python
from langchain_core.tools import tool

@tool
def get_user_profile(user_id: str) -> str:
    """Fetch a user's profile information.

    Use this when you need details about a specific user,
    such as their name, email, or account status.

    Args:
        user_id: The unique identifier for the user

    Returns:
        JSON string with user profile data
    """
    user = database.get_user(user_id)
    return json.dumps(user.to_dict())
```

### Docstring Best Practices

The docstring is **critical**—it's what the model uses to decide when to call your tool:

```python
# ❌ Bad: Vague, unhelpful
@tool
def process(data: str) -> str:
    """Process the data."""

# ✅ Good: Specific, actionable
@tool
def validate_email(email: str) -> str:
    """Check if an email address is valid and deliverable.

    Use this BEFORE sending emails to verify the address exists.
    Returns validation status and any issues found.
    Do NOT use for checking email content or spam detection.

    Args:
        email: The email address to validate (e.g., 'user@example.com')
    """
```

## Structured Input with Pydantic

For tools with multiple parameters or complex validation:

```python
from langchain_core.tools import tool
from pydantic import BaseModel, Field, validator

class FlightSearchInput(BaseModel):
    """Input for flight search."""

    origin: str = Field(
        description="Origin airport code (e.g., 'JFK', 'LAX')"
    )
    destination: str = Field(
        description="Destination airport code"
    )
    date: str = Field(
        description="Travel date in YYYY-MM-DD format"
    )
    passengers: int = Field(
        default=1,
        ge=1,
        le=9,
        description="Number of passengers (1-9)"
    )

    @validator("date")
    def validate_date(cls, v):
        from datetime import datetime
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Date must be YYYY-MM-DD format")

@tool(args_schema=FlightSearchInput)
def search_flights(
    origin: str,
    destination: str,
    date: str,
    passengers: int = 1
) -> str:
    """Search for available flights between airports.

    Use this when users want to find flights for travel.
    Returns flight options with prices and times.
    """
    flights = flight_api.search(origin, destination, date, passengers)
    return format_flight_results(flights)
```

## The StructuredTool Class

For more control, use `StructuredTool` directly:

```python
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

class CalculatorInput(BaseModel):
    expression: str = Field(description="Math expression to evaluate")

def safe_calculate(expression: str) -> str:
    """Safely evaluate a math expression."""
    # Whitelist allowed operations
    allowed = set("0123456789+-*/().e ")
    if not all(c in allowed for c in expression):
        return "Error: Invalid characters in expression"

    try:
        result = eval(expression)  # Safe due to whitelist
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"

calculator = StructuredTool.from_function(
    func=safe_calculate,
    name="calculator",
    description="Evaluate mathematical expressions. Supports +, -, *, /, parentheses.",
    args_schema=CalculatorInput,
    return_direct=False,  # Let agent process result
)
```

## Async Tools

For I/O-bound operations, use async tools:

```python
from langchain_core.tools import tool
import httpx

@tool
async def fetch_webpage(url: str) -> str:
    """Fetch and return the content of a webpage.

    Use this to retrieve information from websites.
    Returns the text content of the page.

    Args:
        url: Full URL including https://
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)
        response.raise_for_status()
        return response.text[:5000]  # Limit response size
```

## Tools with Side Effects

Some tools modify state. Handle carefully:

```python
@tool
def create_calendar_event(
    title: str,
    date: str,
    time: str,
    duration_minutes: int = 60
) -> str:
    """Create a new calendar event.

    IMPORTANT: This will actually create an event on the user's calendar.
    Always confirm details with the user before calling.

    Args:
        title: Event title/name
        date: Date in YYYY-MM-DD format
        time: Start time in HH:MM format (24-hour)
        duration_minutes: Event duration in minutes (default 60)
    """
    event = calendar_api.create_event(
        title=title,
        start=f"{date}T{time}:00",
        duration=duration_minutes
    )
    return f"Created event '{title}' on {date} at {time}. Event ID: {event.id}"
```

## Error Handling Patterns

### Return Errors as Strings
```python
@tool
def query_database(sql: str) -> str:
    """Execute a read-only SQL query."""
    if not sql.strip().upper().startswith("SELECT"):
        return "Error: Only SELECT queries are allowed"

    try:
        results = db.execute(sql)
        return json.dumps(results)
    except DatabaseError as e:
        return f"Database error: {str(e)}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"
```

### Raise ToolException for Retries
```python
from langchain_core.tools import ToolException

@tool(handle_tool_error=True)
def unreliable_api_call(query: str) -> str:
    """Call an external API that might fail."""
    try:
        return api.call(query)
    except RateLimitError:
        raise ToolException(
            "API rate limited. Wait a moment and try again."
        )
```

## Context-Aware Tools

Tools that need access to conversation context:

```python
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig

@tool
def get_user_orders(config: RunnableConfig) -> str:
    """Get the current user's recent orders.

    Returns the last 10 orders for the authenticated user.
    """
    # Access user info from config
    user_id = config.get("configurable", {}).get("user_id")
    if not user_id:
        return "Error: No user authenticated"

    orders = order_service.get_orders(user_id, limit=10)
    return format_orders(orders)
```

Usage:
```python
result = agent.invoke(
    {"input": "Show my recent orders"},
    config={"configurable": {"user_id": "user-123"}}
)
```

## Tool Composition

Build complex tools from simpler ones:

```python
@tool
def analyze_sentiment(text: str) -> str:
    """Analyze sentiment of text."""
    # ... implementation

@tool
def extract_entities(text: str) -> str:
    """Extract named entities from text."""
    # ... implementation

@tool
def full_text_analysis(text: str) -> str:
    """Perform comprehensive text analysis including sentiment and entities.

    Use this for deep analysis of text content.
    Returns sentiment, entities, and key themes.
    """
    sentiment = json.loads(analyze_sentiment.invoke(text))
    entities = json.loads(extract_entities.invoke(text))

    return json.dumps({
        "sentiment": sentiment,
        "entities": entities,
        "word_count": len(text.split()),
    })
```

## Testing Tools

Always test tools in isolation:

```python
import pytest
from my_tools import search_flights

def test_search_flights_valid_input():
    result = search_flights.invoke({
        "origin": "JFK",
        "destination": "LAX",
        "date": "2025-06-15",
        "passengers": 2
    })
    assert "Error" not in result
    data = json.loads(result)
    assert len(data["flights"]) > 0

def test_search_flights_invalid_date():
    result = search_flights.invoke({
        "origin": "JFK",
        "destination": "LAX",
        "date": "invalid-date",
        "passengers": 1
    })
    assert "Error" in result or "invalid" in result.lower()
```

## Key Takeaways

1. **Docstrings matter**: They're how the model decides to use your tool
2. **Use Pydantic** for complex inputs with validation
3. **Handle errors gracefully**: Return error messages, don't crash
4. **Async for I/O**: Use async tools for network/database operations
5. **Test thoroughly**: Tools should work reliably in isolation
6. **Limit scope**: Each tool should do one thing well
7. **Document side effects**: Clearly state when tools modify state
