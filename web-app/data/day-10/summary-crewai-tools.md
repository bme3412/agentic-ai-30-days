# CrewAI Tools: Extending Agent Capabilities

> Guide to building and using custom tools in CrewAI

## What Are Tools?

Tools give agents the ability to interact with the world beyond text generation:

| Capability | Example Tools |
|------------|---------------|
| **Search** | Web search, database queries |
| **Read** | File reading, PDF parsing |
| **Write** | File creation, API calls |
| **Compute** | Calculations, data processing |
| **Integrate** | External APIs, services |

---

## Built-in Tools

CrewAI provides common tools out of the box:

```python
from crewai_tools import (
    SerperDevTool,       # Google search via Serper API
    ScrapeWebsiteTool,   # Extract content from web pages
    FileReadTool,        # Read local files
    DirectoryReadTool,   # List directory contents
    PDFSearchTool,       # Search within PDFs
    WebsiteSearchTool,   # Search specific websites
    YoutubeVideoSearchTool,  # Search YouTube
)

# Usage
search_tool = SerperDevTool()
scrape_tool = ScrapeWebsiteTool()

agent = Agent(
    role="Researcher",
    tools=[search_tool, scrape_tool],
    ...
)
```

---

## Creating Custom Tools

### Basic Structure

```python
from crewai.tools import BaseTool

class MyTool(BaseTool):
    name: str = "my_tool"
    description: str = "What this tool does and when to use it"

    def _run(self, argument: str) -> str:
        # Implementation
        return result
```

### With Input Validation

```python
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type

class ToolInput(BaseModel):
    """Schema for tool input."""
    query: str = Field(description="The search query")
    limit: int = Field(default=10, description="Max results")

class SearchTool(BaseTool):
    name: str = "search"
    description: str = "Search for information"
    args_schema: Type[BaseModel] = ToolInput

    def _run(self, query: str, limit: int = 10) -> str:
        results = perform_search(query, limit)
        return format_results(results)
```

### With Error Handling

```python
class RobustTool(BaseTool):
    name: str = "api_call"
    description: str = "Call external API"

    def _run(self, endpoint: str) -> str:
        try:
            response = requests.get(endpoint, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.Timeout:
            return "Error: Request timed out. Try again later."
        except requests.RequestException as e:
            return f"Error: API request failed - {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"
```

---

## Tool Patterns

### Pattern 1: Database Query Tool

```python
class DatabaseTool(BaseTool):
    name: str = "query_db"
    description: str = """Query the customer database.
    Input: SQL-like query (e.g., 'customers where status=active')
    Output: Matching records as JSON"""

    db_connection: Any = None

    def __init__(self, connection_string: str):
        super().__init__()
        self.db_connection = connect(connection_string)

    def _run(self, query: str) -> str:
        try:
            # Parse and validate query (prevent injection)
            safe_query = self.sanitize(query)
            results = self.db_connection.execute(safe_query)
            return json.dumps(results, indent=2)
        except Exception as e:
            return f"Query error: {str(e)}"
```

### Pattern 2: API Integration Tool

```python
class WeatherTool(BaseTool):
    name: str = "weather"
    description: str = """Get current weather for a location.
    Input: City name (e.g., 'Paris', 'New York')
    Output: Temperature, conditions, humidity"""

    api_key: str

    def __init__(self, api_key: str):
        super().__init__()
        self.api_key = api_key

    def _run(self, city: str) -> str:
        response = requests.get(
            f"https://api.weather.com/v1/current",
            params={"city": city, "key": self.api_key}
        )
        data = response.json()
        return f"{city}: {data['temp']}°F, {data['conditions']}"
```

### Pattern 3: Cached Tool

```python
import hashlib
from functools import lru_cache

class CachedSearchTool(BaseTool):
    name: str = "cached_search"
    description: str = "Search with caching for repeated queries"

    cache: dict = {}
    cache_ttl: int = 3600  # 1 hour

    def _run(self, query: str) -> str:
        cache_key = hashlib.md5(query.encode()).hexdigest()

        # Check cache
        if cache_key in self.cache:
            cached_time, result = self.cache[cache_key]
            if time.time() - cached_time < self.cache_ttl:
                return result

        # Fetch and cache
        result = self._search(query)
        self.cache[cache_key] = (time.time(), result)
        return result
```

### Pattern 4: Composite Tool

```python
class ResearchTool(BaseTool):
    name: str = "deep_research"
    description: str = "Comprehensive research combining search and scraping"

    def __init__(self):
        super().__init__()
        self.search = SerperDevTool()
        self.scraper = ScrapeWebsiteTool()

    def _run(self, topic: str) -> str:
        # Search for relevant URLs
        search_results = self.search._run(topic)
        urls = extract_urls(search_results)

        # Scrape top results
        content = []
        for url in urls[:3]:
            try:
                page_content = self.scraper._run(url)
                content.append(page_content)
            except Exception:
                continue

        return "\n\n---\n\n".join(content)
```

---

## Tool Description Best Practices

The description is critical—the LLM reads it to decide when and how to use the tool.

### Good Descriptions

```python
# Clear, specific, with examples
description = """Search for current stock prices and market data.
Input: Stock ticker symbol (e.g., 'AAPL', 'GOOGL', 'TSLA')
Output: Current price, daily change %, market cap, P/E ratio

Use this tool when you need real-time stock information.
Do NOT use for historical data or company fundamentals."""
```

### Bad Descriptions

```python
# Too vague
description = "Gets stock data"

# Missing input format
description = "Returns stock prices for companies"

# No guidance on when to use
description = "Stock price lookup tool"
```

---

## Assigning Tools to Agents

### Match Tools to Roles

```python
# Good: Focused tool sets
researcher = Agent(
    role="Research Analyst",
    tools=[search_tool, scrape_tool, pdf_reader]
)

writer = Agent(
    role="Content Writer",
    tools=[file_writer, grammar_checker]
)

# Bad: Every tool on every agent
agent = Agent(
    role="General Agent",
    tools=[search, scrape, write, analyze, calculate, ...]  # Too many!
)
```

### Tool Delegation

```python
# Allow agent to request tools from others
lead_agent = Agent(
    role="Project Lead",
    allow_delegation=True,  # Can ask other agents to use their tools
    tools=[planning_tool]
)
```

---

## Testing Tools

```python
def test_stock_tool():
    tool = StockPriceTool(api_key="test-key")

    # Test normal case
    result = tool._run("AAPL")
    assert "AAPL" in result
    assert "$" in result

    # Test error handling
    result = tool._run("INVALID")
    assert "error" in result.lower()

    # Test edge cases
    result = tool._run("")
    assert "error" in result.lower()
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Vague description | Agent doesn't know when to use | Be specific with examples |
| No error handling | Exceptions crash the agent | Always return string, even on error |
| Too many tools | Agent confused about which to use | 3-5 tools per agent max |
| Blocking I/O | Slow execution | Use async or timeouts |
| No input validation | Invalid inputs cause errors | Use Pydantic schemas |
| Hardcoded credentials | Security risk | Use environment variables |

---

## Production Considerations

### Rate Limiting

```python
from ratelimit import limits, sleep_and_retry

class RateLimitedTool(BaseTool):
    @sleep_and_retry
    @limits(calls=10, period=60)  # 10 calls per minute
    def _run(self, query: str) -> str:
        return self._make_api_call(query)
```

### Logging

```python
import logging

class LoggedTool(BaseTool):
    logger = logging.getLogger(__name__)

    def _run(self, query: str) -> str:
        self.logger.info(f"Tool called with: {query}")
        start = time.time()

        result = self._process(query)

        duration = time.time() - start
        self.logger.info(f"Tool completed in {duration:.2f}s")

        return result
```

### Metrics

```python
class MetricsTool(BaseTool):
    def _run(self, query: str) -> str:
        with metrics.timer("tool.duration"):
            metrics.increment("tool.calls")
            try:
                result = self._process(query)
                metrics.increment("tool.success")
                return result
            except Exception as e:
                metrics.increment("tool.errors")
                raise
```
