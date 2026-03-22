import type { Day } from '../../types';

export const day20: Day = {
  day: 20,
  phase: 4,
  title: "MCP: Building Servers & Clients",
  partner: "Anthropic / Hugging Face",
  tags: ["mcp", "servers", "python", "integrations", "database", "api"],
  concept: "Creating custom MCP servers to expose tools and resources",
  demoUrl: "demos/day-20/",
  demoDescription: "Build and test MCP servers interactively: connect to a simulated database, call wrapped APIs, and explore file resources through a live MCP playground.",

  lesson: {
    overview: `Day 19 introduced MCP's architecture and primitives. Now we put that knowledge into practice by building **real-world MCP servers** that solve actual problems: querying databases, wrapping external APIs, and providing secure file access.

The key insight is that MCP servers are **adapters**—they translate between the standardized MCP protocol and specific backend systems. A database server adapts SQL databases to MCP tools. An API server adapts REST endpoints to MCP resources. A file server adapts the filesystem to MCP with security boundaries.

**What You'll Build Today**:
- A **SQLite database server** with query and schema tools
- An **API wrapper server** that exposes external services
- A **file system server** with security sandboxing
- Patterns for **composing multiple servers** in production

By the end, you'll have templates for the most common MCP integration patterns, ready to adapt to your specific needs.`,

    principles: [
      {
        title: "Servers as Adapters",
        description: "MCP servers translate between the universal MCP protocol and specific backend systems. Design your server as a thin adapter layer: validate inputs, call the backend, format the response. Keep business logic in the backend, protocol handling in the server."
      },
      {
        title: "Security at the Boundary",
        description: "MCP servers are trust boundaries. Every input from the AI is potentially adversarial—validate everything. Sanitize SQL queries, restrict file paths, validate API parameters. The server protects the backend from misuse."
      },
      {
        title: "Minimal Privilege",
        description: "Grant servers only the permissions they need. A read-only analytics server shouldn't have write access. A file server should be sandboxed to specific directories. Use database roles, API scopes, and filesystem permissions."
      },
      {
        title: "Observable Operations",
        description: "Every operation should be logged and traceable. Include request IDs, timing metrics, and error details. This enables debugging, auditing, and monitoring of how AI systems use your tools."
      }
    ],

    codeExample: {
      language: "python",
      title: "SQLite Database MCP Server",
      code: `"""
MCP Server for SQLite Database Access
Provides query and schema exploration tools
"""
from mcp.server import Server
from mcp.types import Tool, TextContent
import sqlite3
import json
import re

server = Server("sqlite-server")
DB_PATH = "data.db"

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="query",
            description="Execute a read-only SQL query",
            inputSchema={
                "type": "object",
                "properties": {
                    "sql": {
                        "type": "string",
                        "description": "SELECT query to execute"
                    }
                },
                "required": ["sql"]
            }
        ),
        Tool(
            name="list_tables",
            description="List all tables in the database",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="describe_table",
            description="Get schema for a table",
            inputSchema={
                "type": "object",
                "properties": {
                    "table": {"type": "string", "description": "Table name"}
                },
                "required": ["table"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    try:
        if name == "query":
            sql = arguments.get("sql", "")
            # Security: Only allow SELECT statements
            if not re.match(r"^\\s*SELECT\\s", sql, re.IGNORECASE):
                return [TextContent(type="text", text="Error: Only SELECT queries allowed", isError=True)]

            cursor = conn.execute(sql)
            rows = [dict(row) for row in cursor.fetchall()]
            return [TextContent(type="text", text=json.dumps(rows, indent=2, default=str))]

        elif name == "list_tables":
            cursor = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
            tables = [row["name"] for row in cursor.fetchall()]
            return [TextContent(type="text", text=json.dumps({"tables": tables}))]

        elif name == "describe_table":
            table = arguments.get("table", "")
            # Security: Validate table name
            if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", table):
                return [TextContent(type="text", text="Invalid table name", isError=True)]

            cursor = conn.execute(f"PRAGMA table_info({table})")
            columns = [{"name": r["name"], "type": r["type"]} for r in cursor]
            return [TextContent(type="text", text=json.dumps({"columns": columns}))]

    finally:
        conn.close()

    raise ValueError(f"Unknown tool: {name}")`
    },

    diagram: {
      type: "mermaid",
      title: "MCP Server Integration Patterns",
      mermaid: `flowchart TB
    subgraph Host["AI Application"]
        LLM["Language Model"]
        C1["MCP Client"]
        C2["MCP Client"]
        C3["MCP Client"]
    end

    subgraph Servers["MCP Servers (Adapters)"]
        DB["Database Server"]
        API["API Server"]
        FS["File Server"]
    end

    subgraph Backends["Backend Systems"]
        SQL["PostgreSQL<br/>SQLite"]
        REST["External APIs<br/>Weather, Maps"]
        DISK["Filesystem<br/>Sandboxed"]
    end

    LLM --> C1 & C2 & C3
    C1 -->|"tools/call"| DB
    C2 -->|"tools/call"| API
    C3 -->|"resources/read"| FS

    DB -->|"Adapter"| SQL
    API -->|"Adapter"| REST
    FS -->|"Adapter"| DISK

    style Host fill:#e3f2fd
    style Servers fill:#fff3e0
    style Backends fill:#e8f5e9`
    },

    keyTakeaways: [
      "MCP servers act as secure adapters between AI applications and backend systems",
      "Always validate inputs at the server boundary—treat AI requests as untrusted",
      "Use minimal privilege: read-only access, sandboxed directories, scoped API keys",
      "Log all operations for debugging, auditing, and monitoring AI tool usage",
      "Design for composition: multiple focused servers > one monolithic server"
    ],

    resources: [
      {
        title: "MCP Python SDK",
        url: "https://github.com/modelcontextprotocol/python-sdk",
        type: "github",
        description: "Official Python SDK for building MCP servers"
      },
      {
        title: "MCP Servers Repository",
        url: "https://github.com/modelcontextprotocol/servers",
        type: "github",
        description: "Reference implementations of MCP servers for various use cases"
      },
      {
        title: "FastMCP",
        url: "https://github.com/jlowin/fastmcp",
        type: "github",
        description: "Pythonic framework for building MCP servers quickly with decorators"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Build production-ready MCP servers that integrate AI applications with databases, APIs, and file systems using real-world patterns and security best practices.",
      fullDescription: `Yesterday we learned *what* MCP is—the protocol, primitives, and architecture. Today we learn *how* to build MCP servers that solve real problems. The difference is like understanding HTTP versus building a web application: theory enables practice, but practice teaches patterns that theory cannot.

**The Core Challenge**: Every backend system has its own interface—SQL for databases, REST for APIs, filesystem calls for files. AI applications speak MCP. Your server bridges this gap, translating between universal MCP protocol and specific backend APIs.

\`\`\`
AI Application                MCP Server                  Backend
     │                            │                          │
     │  tools/call "query"        │                          │
     │  {sql: "SELECT..."}        │                          │
     │ ─────────────────────────► │                          │
     │                            │  conn.execute(sql)       │
     │                            │ ────────────────────────►│
     │                            │                          │
     │                            │  ◄─── rows ────────────  │
     │                            │                          │
     │  ◄── JSON result ───────── │                          │
     │                            │                          │
\`\`\`

**What Makes a Good MCP Server?**

1. **Focused Scope**: Do one thing well. A database server handles databases. An API server wraps APIs. Don't build a Swiss Army knife—build a precision tool.

2. **Security First**: The server is a trust boundary between AI and backend. Validate every input. Sanitize every parameter. Restrict every permission.

3. **Observable**: Log every operation with enough detail to debug problems. Include timing, request IDs, and error details. You'll need this when the AI does something unexpected.

4. **Graceful Errors**: Return helpful error messages that help the AI recover. "Invalid SQL syntax near 'SLECT'" is better than "Query failed."

**Today's Integrations**:

We'll build three servers that cover the most common patterns:

1. **Database Server (SQLite/PostgreSQL)**: Query data, explore schemas, with SQL injection prevention and read-only enforcement.

2. **API Wrapper Server**: Expose external APIs (weather, geocoding, etc.) as MCP tools with caching, rate limiting, and error normalization.

3. **File System Server**: Provide AI access to files with path sandboxing, size limits, and content type detection.

Each server is designed as a template you can adapt. The patterns transfer: once you've built a SQLite server, adapting it to PostgreSQL is straightforward. Once you've wrapped one REST API, wrapping another follows the same structure.`,
      prerequisites: [
        "Day 19: MCP Fundamentals (protocol, primitives, architecture)",
        "Python async/await programming",
        "Basic SQL for database examples",
        "Understanding of REST APIs for API wrapper examples"
      ],
      estimatedTime: "3-4 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "Building a Database MCP Server",
        description: `Database access is one of the most valuable capabilities to give AI applications. A well-designed database server lets AI query data, explore schemas, and understand your data model—all through natural language.

**Design Decisions**:

1. **Read-Only vs Read-Write**: Start with read-only. Write operations (INSERT, UPDATE, DELETE) are powerful but dangerous. If you need writes, require explicit confirmation and audit everything.

2. **Query vs Abstraction**: Do you expose raw SQL, or higher-level operations? Raw SQL is flexible but risky. Abstractions (search_users, get_order) are safer but less flexible. Consider offering both with different permission levels.

3. **Result Formatting**: Databases return rows. How should you format them for AI? JSON is universal. Consider limiting rows (LIMIT 100), paginating large results, and summarizing when results exceed reasonable sizes.

**Complete SQLite Server Implementation**:

\`\`\`python
"""
Production SQLite MCP Server
Full implementation with security, logging, and error handling
"""
from mcp.server import Server
from mcp.types import Tool, Resource, TextContent, TextResourceContents
import sqlite3
import json
import re
import logging
from pathlib import Path
from typing import Optional
from contextlib import contextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sqlite-mcp")

class SQLiteServer:
    def __init__(self, db_path: str, read_only: bool = True):
        self.db_path = db_path
        self.read_only = read_only
        self.server = Server("sqlite-server")
        self._register_handlers()

    @contextmanager
    def get_connection(self):
        """Context manager for database connections."""
        # SQLite URI for read-only mode
        uri = f"file:{self.db_path}"
        if self.read_only:
            uri += "?mode=ro"

        conn = sqlite3.connect(uri, uri=True)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def validate_sql(self, sql: str) -> tuple[bool, str]:
        """Validate SQL for safety."""
        sql_upper = sql.strip().upper()

        # Only allow SELECT in read-only mode
        if self.read_only:
            if not sql_upper.startswith("SELECT"):
                return False, "Only SELECT queries allowed in read-only mode"

        # Block dangerous patterns
        dangerous = ["DROP", "TRUNCATE", "ALTER", "ATTACH", "DETACH"]
        for keyword in dangerous:
            if keyword in sql_upper:
                return False, f"Dangerous keyword detected: {keyword}"

        return True, ""

    def _register_handlers(self):
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            tools = [
                Tool(
                    name="query",
                    description="Execute a SQL query. Returns up to 100 rows.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "sql": {
                                "type": "string",
                                "description": "SQL query to execute"
                            },
                            "params": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Query parameters for ? placeholders"
                            }
                        },
                        "required": ["sql"]
                    }
                ),
                Tool(
                    name="list_tables",
                    description="List all tables in the database",
                    inputSchema={"type": "object", "properties": {}}
                ),
                Tool(
                    name="describe_table",
                    description="Get column information for a table",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "table": {
                                "type": "string",
                                "description": "Table name"
                            }
                        },
                        "required": ["table"]
                    }
                ),
                Tool(
                    name="sample_data",
                    description="Get sample rows from a table",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "table": {
                                "type": "string",
                                "description": "Table name"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Number of rows (default 5, max 20)",
                                "default": 5
                            }
                        },
                        "required": ["table"]
                    }
                )
            ]
            return tools

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent]:
            logger.info(f"Tool call: {name}, args: {arguments}")

            try:
                if name == "query":
                    return await self._handle_query(arguments)
                elif name == "list_tables":
                    return await self._handle_list_tables()
                elif name == "describe_table":
                    return await self._handle_describe(arguments)
                elif name == "sample_data":
                    return await self._handle_sample(arguments)
                else:
                    raise ValueError(f"Unknown tool: {name}")
            except Exception as e:
                logger.error(f"Tool error: {e}")
                return [TextContent(
                    type="text",
                    text=json.dumps({"error": str(e)}),
                    isError=True
                )]

    async def _handle_query(self, args: dict) -> list[TextContent]:
        sql = args.get("sql", "")
        params = args.get("params", [])

        valid, error = self.validate_sql(sql)
        if not valid:
            return [TextContent(type="text", text=error, isError=True)]

        # Add LIMIT if not present
        if "LIMIT" not in sql.upper():
            sql = sql.rstrip(";") + " LIMIT 100"

        with self.get_connection() as conn:
            cursor = conn.execute(sql, params)
            rows = [dict(row) for row in cursor.fetchall()]

            return [TextContent(
                type="text",
                text=json.dumps({
                    "row_count": len(rows),
                    "rows": rows
                }, indent=2, default=str)
            )]

    async def _handle_list_tables(self) -> list[TextContent]:
        with self.get_connection() as conn:
            cursor = conn.execute(
                "SELECT name, type FROM sqlite_master "
                "WHERE type IN ('table', 'view') "
                "ORDER BY type, name"
            )
            objects = [{"name": r["name"], "type": r["type"]}
                      for r in cursor.fetchall()]

            return [TextContent(
                type="text",
                text=json.dumps({"objects": objects}, indent=2)
            )]

    async def _handle_describe(self, args: dict) -> list[TextContent]:
        table = args.get("table", "")

        # Validate table name (prevent injection)
        if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", table):
            return [TextContent(
                type="text",
                text="Invalid table name",
                isError=True
            )]

        with self.get_connection() as conn:
            # Get columns
            cursor = conn.execute(f"PRAGMA table_info({table})")
            columns = [{
                "name": r["name"],
                "type": r["type"],
                "nullable": not r["notnull"],
                "primary_key": bool(r["pk"])
            } for r in cursor.fetchall()]

            # Get row count
            cursor = conn.execute(f"SELECT COUNT(*) as count FROM {table}")
            count = cursor.fetchone()["count"]

            return [TextContent(
                type="text",
                text=json.dumps({
                    "table": table,
                    "columns": columns,
                    "row_count": count
                }, indent=2)
            )]

    async def _handle_sample(self, args: dict) -> list[TextContent]:
        table = args.get("table", "")
        limit = min(args.get("limit", 5), 20)  # Cap at 20

        if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", table):
            return [TextContent(type="text", text="Invalid table name", isError=True)]

        with self.get_connection() as conn:
            cursor = conn.execute(f"SELECT * FROM {table} LIMIT ?", [limit])
            rows = [dict(row) for row in cursor.fetchall()]

            return [TextContent(
                type="text",
                text=json.dumps({"sample": rows}, indent=2, default=str)
            )]

    def run(self):
        import asyncio
        asyncio.run(self.server.run())

if __name__ == "__main__":
    server = SQLiteServer("analytics.db", read_only=True)
    server.run()
\`\`\`

**PostgreSQL Adaptation**:

For PostgreSQL, swap sqlite3 for asyncpg and adjust connection handling:

\`\`\`python
import asyncpg

class PostgresServer:
    async def get_connection(self):
        return await asyncpg.connect(
            host="localhost",
            database="mydb",
            user="mcp_readonly",  # Minimal privilege role
            password=os.environ["DB_PASSWORD"]
        )
\`\`\`

**Security Checklist**:
- [ ] Read-only database role/connection
- [ ] SQL validation (no DROP, TRUNCATE, etc.)
- [ ] Parameter binding (never string concatenation)
- [ ] Result limits (LIMIT 100)
- [ ] Table name validation (alphanumeric only)
- [ ] Query logging for audit`,
        analogy: "A database MCP server is like a reference librarian. The librarian (server) has access to the library's catalog system (database). Patrons (AI) can ask questions, but the librarian decides how to search, validates requests, and enforces rules (no writing in books, limited checkouts). The librarian translates patron requests into catalog queries and formats results clearly.",
        gotchas: [
          "Never concatenate user input into SQL—always use parameter binding",
          "LIMIT results even when the AI doesn't ask for limits—100 rows is usually enough",
          "Table/column names can't be parameterized in SQL—validate them with regex",
          "Log actual queries executed, not just tool calls—you'll need this for debugging",
          "Consider query timeout limits to prevent long-running queries"
        ]
      },
      {
        title: "Building an API Wrapper Server",
        description: `External APIs are powerful capabilities for AI: weather data, geocoding, search, translation, and countless others. An API wrapper server makes these accessible through MCP while handling authentication, rate limiting, and error normalization.

**Design Decisions**:

1. **Caching**: External APIs are often slow and rate-limited. Cache responses when appropriate—weather data is valid for minutes, geocoding results for days.

2. **Rate Limiting**: Protect against runaway AI that might call the same API thousands of times. Implement both per-minute and per-day limits.

3. **Error Normalization**: Different APIs have different error formats. Normalize them to consistent MCP responses so the AI can understand and recover.

4. **Credential Security**: Never expose API keys in tool responses. Store credentials in environment variables, not code.

**Complete Weather API Server**:

\`\`\`python
"""
Weather API MCP Server
Wraps OpenWeatherMap API with caching and rate limiting
"""
from mcp.server import Server
from mcp.types import Tool, TextContent
import httpx
import json
import os
import time
from dataclasses import dataclass, field
from typing import Optional

# Configuration from environment
API_KEY = os.environ.get("OPENWEATHERMAP_API_KEY", "")
BASE_URL = "https://api.openweathermap.org/data/2.5"

@dataclass
class CacheEntry:
    data: dict
    expires_at: float

@dataclass
class RateLimiter:
    calls_per_minute: int = 30
    calls_per_day: int = 1000
    minute_calls: list = field(default_factory=list)
    day_calls: list = field(default_factory=list)

    def check(self) -> tuple[bool, str]:
        now = time.time()
        minute_ago = now - 60
        day_ago = now - 86400

        # Clean old entries
        self.minute_calls = [t for t in self.minute_calls if t > minute_ago]
        self.day_calls = [t for t in self.day_calls if t > day_ago]

        if len(self.minute_calls) >= self.calls_per_minute:
            return False, f"Rate limit: {self.calls_per_minute}/minute exceeded"
        if len(self.day_calls) >= self.calls_per_day:
            return False, f"Rate limit: {self.calls_per_day}/day exceeded"

        return True, ""

    def record(self):
        now = time.time()
        self.minute_calls.append(now)
        self.day_calls.append(now)

class WeatherServer:
    def __init__(self):
        self.server = Server("weather-server")
        self.cache: dict[str, CacheEntry] = {}
        self.rate_limiter = RateLimiter()
        self.client = httpx.AsyncClient(timeout=10.0)
        self._register_handlers()

    def _get_cached(self, key: str) -> Optional[dict]:
        if key in self.cache:
            entry = self.cache[key]
            if time.time() < entry.expires_at:
                return entry.data
            del self.cache[key]
        return None

    def _set_cached(self, key: str, data: dict, ttl_seconds: int = 600):
        self.cache[key] = CacheEntry(
            data=data,
            expires_at=time.time() + ttl_seconds
        )

    def _register_handlers(self):
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            return [
                Tool(
                    name="get_weather",
                    description="Get current weather for a location",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "City name (e.g., 'London' or 'London,UK')"
                            },
                            "units": {
                                "type": "string",
                                "enum": ["metric", "imperial"],
                                "description": "Temperature units (default: metric)"
                            }
                        },
                        "required": ["location"]
                    }
                ),
                Tool(
                    name="get_forecast",
                    description="Get 5-day weather forecast",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "City name"
                            },
                            "units": {
                                "type": "string",
                                "enum": ["metric", "imperial"],
                                "default": "metric"
                            }
                        },
                        "required": ["location"]
                    }
                ),
                Tool(
                    name="get_air_quality",
                    description="Get air quality index for coordinates",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "lat": {"type": "number", "description": "Latitude"},
                            "lon": {"type": "number", "description": "Longitude"}
                        },
                        "required": ["lat", "lon"]
                    }
                )
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent]:
            # Check rate limit
            allowed, error = self.rate_limiter.check()
            if not allowed:
                return [TextContent(type="text", text=error, isError=True)]

            try:
                if name == "get_weather":
                    return await self._get_weather(arguments)
                elif name == "get_forecast":
                    return await self._get_forecast(arguments)
                elif name == "get_air_quality":
                    return await self._get_air_quality(arguments)
                else:
                    raise ValueError(f"Unknown tool: {name}")
            except httpx.HTTPError as e:
                return [TextContent(
                    type="text",
                    text=f"API error: {str(e)}",
                    isError=True
                )]

    async def _get_weather(self, args: dict) -> list[TextContent]:
        location = args.get("location", "")
        units = args.get("units", "metric")

        # Check cache
        cache_key = f"weather:{location}:{units}"
        cached = self._get_cached(cache_key)
        if cached:
            cached["cached"] = True
            return [TextContent(type="text", text=json.dumps(cached, indent=2))]

        # Call API
        self.rate_limiter.record()
        response = await self.client.get(
            f"{BASE_URL}/weather",
            params={
                "q": location,
                "units": units,
                "appid": API_KEY
            }
        )
        response.raise_for_status()
        data = response.json()

        # Format response
        result = {
            "location": data.get("name", location),
            "country": data.get("sys", {}).get("country"),
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "conditions": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
            "units": "celsius" if units == "metric" else "fahrenheit"
        }

        self._set_cached(cache_key, result, ttl_seconds=600)  # 10 min cache
        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    async def _get_forecast(self, args: dict) -> list[TextContent]:
        location = args.get("location", "")
        units = args.get("units", "metric")

        cache_key = f"forecast:{location}:{units}"
        cached = self._get_cached(cache_key)
        if cached:
            cached["cached"] = True
            return [TextContent(type="text", text=json.dumps(cached, indent=2))]

        self.rate_limiter.record()
        response = await self.client.get(
            f"{BASE_URL}/forecast",
            params={"q": location, "units": units, "appid": API_KEY}
        )
        response.raise_for_status()
        data = response.json()

        # Summarize to daily forecasts
        daily = {}
        for item in data["list"]:
            date = item["dt_txt"].split(" ")[0]
            if date not in daily:
                daily[date] = {
                    "date": date,
                    "high": item["main"]["temp_max"],
                    "low": item["main"]["temp_min"],
                    "conditions": item["weather"][0]["description"]
                }
            else:
                daily[date]["high"] = max(daily[date]["high"], item["main"]["temp_max"])
                daily[date]["low"] = min(daily[date]["low"], item["main"]["temp_min"])

        result = {
            "location": data["city"]["name"],
            "forecast": list(daily.values())[:5]
        }

        self._set_cached(cache_key, result, ttl_seconds=3600)  # 1 hour cache
        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    async def _get_air_quality(self, args: dict) -> list[TextContent]:
        lat = args.get("lat")
        lon = args.get("lon")

        self.rate_limiter.record()
        response = await self.client.get(
            f"{BASE_URL}/air_pollution",
            params={"lat": lat, "lon": lon, "appid": API_KEY}
        )
        response.raise_for_status()
        data = response.json()

        aqi = data["list"][0]["main"]["aqi"]
        aqi_labels = {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}

        return [TextContent(type="text", text=json.dumps({
            "aqi": aqi,
            "label": aqi_labels.get(aqi, "Unknown"),
            "components": data["list"][0]["components"]
        }, indent=2))]

    def run(self):
        import asyncio
        asyncio.run(self.server.run())

if __name__ == "__main__":
    WeatherServer().run()
\`\`\`

**Adapting for Other APIs**:

The pattern transfers to any REST API:

\`\`\`python
# Geocoding API
@server.call_tool()
async def geocode(name: str, args: dict):
    address = args["address"]
    response = await client.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        params={"address": address, "key": API_KEY}
    )
    # ... parse and format response

# Translation API
@server.call_tool()
async def translate(name: str, args: dict):
    response = await client.post(
        "https://api.deepl.com/v2/translate",
        headers={"Authorization": f"DeepL-Auth-Key {API_KEY}"},
        json={"text": [args["text"]], "target_lang": args["target"]}
    )
    # ... parse and format response
\`\`\``,
        analogy: "An API wrapper server is like a travel agent. The travel agent (server) has accounts with airlines, hotels, and car rentals (external APIs). Customers (AI) make requests, and the agent handles the complexity: remembering frequent flyer numbers (credentials), checking prices across providers (API calls), caching recent searches, and presenting options in a consistent format.",
        gotchas: [
          "Store API keys in environment variables, never in code or tool responses",
          "Implement caching—external APIs are slow and often rate-limited",
          "Normalize errors so AI can understand and recover from failures",
          "Consider timeout limits—don't let slow APIs block indefinitely",
          "Log API calls for debugging and cost tracking"
        ]
      },
      {
        title: "Building a File System Server",
        description: `File access is essential for AI assistants working with documents, code, and data. A file system server provides this access while enforcing security boundaries—sandboxing to specific directories, filtering file types, and limiting file sizes.

**Design Decisions**:

1. **Sandboxing**: The most critical decision. What directories can the AI access? Start restrictive (one specific folder) and expand only when needed.

2. **Operations**: Read-only is safest. If writes are needed, consider write-to-temporary-location with user confirmation before committing.

3. **Content Handling**: Text files can be returned directly. Binary files might need base64 encoding or summary descriptions. Large files need pagination or truncation.

**Complete File System Server**:

\`\`\`python
"""
Secure File System MCP Server
Sandboxed access with content type detection
"""
from mcp.server import Server
from mcp.types import Tool, Resource, TextContent, TextResourceContents, BlobResourceContents
import os
import json
import mimetypes
import hashlib
from pathlib import Path
from typing import Optional

class FileServer:
    def __init__(self, sandbox_root: str, max_file_size: int = 1_000_000):
        self.sandbox = Path(sandbox_root).resolve()
        self.max_file_size = max_file_size  # 1MB default
        self.server = Server("file-server")

        if not self.sandbox.is_dir():
            raise ValueError(f"Sandbox directory does not exist: {sandbox_root}")

        self._register_handlers()

    def _resolve_path(self, path: str) -> Optional[Path]:
        """Resolve path safely within sandbox."""
        try:
            # Resolve to absolute path
            if path.startswith("/"):
                full_path = Path(path).resolve()
            else:
                full_path = (self.sandbox / path).resolve()

            # Security: Ensure path is within sandbox
            if not str(full_path).startswith(str(self.sandbox)):
                return None

            return full_path
        except (ValueError, OSError):
            return None

    def _get_file_info(self, path: Path) -> dict:
        """Get metadata about a file."""
        stat = path.stat()
        mime_type, _ = mimetypes.guess_type(str(path))

        return {
            "name": path.name,
            "path": str(path.relative_to(self.sandbox)),
            "size": stat.st_size,
            "mime_type": mime_type or "application/octet-stream",
            "is_text": self._is_text_file(path),
            "modified": stat.st_mtime
        }

    def _is_text_file(self, path: Path) -> bool:
        """Determine if file is likely text."""
        text_extensions = {
            ".txt", ".md", ".py", ".js", ".ts", ".json", ".yaml", ".yml",
            ".html", ".css", ".xml", ".csv", ".sh", ".bash", ".zsh",
            ".c", ".cpp", ".h", ".java", ".go", ".rs", ".rb", ".php"
        }
        return path.suffix.lower() in text_extensions

    def _register_handlers(self):
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            return [
                Tool(
                    name="list_directory",
                    description="List files and subdirectories in a directory",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "path": {
                                "type": "string",
                                "description": "Directory path relative to sandbox root"
                            },
                            "pattern": {
                                "type": "string",
                                "description": "Optional glob pattern (e.g., '*.py')"
                            }
                        },
                        "required": []
                    }
                ),
                Tool(
                    name="read_file",
                    description="Read contents of a text file",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "path": {
                                "type": "string",
                                "description": "File path relative to sandbox root"
                            },
                            "start_line": {
                                "type": "integer",
                                "description": "Start from this line (1-indexed)"
                            },
                            "max_lines": {
                                "type": "integer",
                                "description": "Maximum lines to return (default 200)"
                            }
                        },
                        "required": ["path"]
                    }
                ),
                Tool(
                    name="search_files",
                    description="Search for files by name or content",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query"
                            },
                            "search_content": {
                                "type": "boolean",
                                "description": "Search file contents (slower)"
                            },
                            "file_pattern": {
                                "type": "string",
                                "description": "File pattern to search (e.g., '*.py')"
                            }
                        },
                        "required": ["query"]
                    }
                ),
                Tool(
                    name="file_info",
                    description="Get detailed information about a file",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "path": {
                                "type": "string",
                                "description": "File path"
                            }
                        },
                        "required": ["path"]
                    }
                )
            ]

        @self.server.list_resources()
        async def list_resources() -> list[Resource]:
            """Expose sandbox root as browseable resource."""
            return [
                Resource(
                    uri=f"file://{self.sandbox}",
                    name="Sandbox Root",
                    description=f"Root directory: {self.sandbox}",
                    mimeType="inode/directory"
                )
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent]:
            try:
                if name == "list_directory":
                    return await self._list_directory(arguments)
                elif name == "read_file":
                    return await self._read_file(arguments)
                elif name == "search_files":
                    return await self._search_files(arguments)
                elif name == "file_info":
                    return await self._file_info(arguments)
                else:
                    raise ValueError(f"Unknown tool: {name}")
            except Exception as e:
                return [TextContent(
                    type="text",
                    text=json.dumps({"error": str(e)}),
                    isError=True
                )]

    async def _list_directory(self, args: dict) -> list[TextContent]:
        path_str = args.get("path", "")
        pattern = args.get("pattern", "*")

        path = self._resolve_path(path_str) if path_str else self.sandbox
        if not path or not path.is_dir():
            return [TextContent(type="text", text="Directory not found", isError=True)]

        items = []
        for item in sorted(path.glob(pattern)):
            rel_path = item.relative_to(self.sandbox)
            if item.is_dir():
                items.append({
                    "name": item.name,
                    "path": str(rel_path),
                    "type": "directory"
                })
            else:
                items.append({
                    "name": item.name,
                    "path": str(rel_path),
                    "type": "file",
                    "size": item.stat().st_size
                })

        return [TextContent(type="text", text=json.dumps({
            "directory": path_str or "/",
            "items": items[:100]  # Limit results
        }, indent=2))]

    async def _read_file(self, args: dict) -> list[TextContent]:
        path = self._resolve_path(args.get("path", ""))
        if not path or not path.is_file():
            return [TextContent(type="text", text="File not found", isError=True)]

        # Size check
        if path.stat().st_size > self.max_file_size:
            return [TextContent(
                type="text",
                text=f"File too large ({path.stat().st_size} bytes, max {self.max_file_size})",
                isError=True
            )]

        # Text file check
        if not self._is_text_file(path):
            return [TextContent(
                type="text",
                text=f"Not a text file: {path.suffix}. Use file_info for binary files.",
                isError=True
            )]

        start_line = args.get("start_line", 1)
        max_lines = min(args.get("max_lines", 200), 500)  # Cap at 500

        with open(path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        total_lines = len(lines)
        selected = lines[start_line-1:start_line-1+max_lines]

        return [TextContent(type="text", text=json.dumps({
            "path": str(path.relative_to(self.sandbox)),
            "total_lines": total_lines,
            "showing": f"lines {start_line}-{start_line+len(selected)-1}",
            "content": "".join(selected)
        }, indent=2))]

    async def _search_files(self, args: dict) -> list[TextContent]:
        query = args.get("query", "").lower()
        search_content = args.get("search_content", False)
        file_pattern = args.get("file_pattern", "*")

        results = []
        for path in self.sandbox.rglob(file_pattern):
            if not path.is_file():
                continue

            # Name match
            if query in path.name.lower():
                results.append({
                    "path": str(path.relative_to(self.sandbox)),
                    "match": "filename"
                })
                continue

            # Content match (optional, slower)
            if search_content and self._is_text_file(path):
                if path.stat().st_size > 100_000:  # Skip large files
                    continue
                try:
                    with open(path, "r", errors="ignore") as f:
                        if query in f.read().lower():
                            results.append({
                                "path": str(path.relative_to(self.sandbox)),
                                "match": "content"
                            })
                except:
                    pass

            if len(results) >= 50:
                break

        return [TextContent(type="text", text=json.dumps({
            "query": query,
            "results": results
        }, indent=2))]

    async def _file_info(self, args: dict) -> list[TextContent]:
        path = self._resolve_path(args.get("path", ""))
        if not path or not path.exists():
            return [TextContent(type="text", text="Path not found", isError=True)]

        info = self._get_file_info(path)

        # Add content hash for integrity checking
        if path.is_file() and path.stat().st_size < 1_000_000:
            with open(path, "rb") as f:
                info["sha256"] = hashlib.sha256(f.read()).hexdigest()[:16]

        return [TextContent(type="text", text=json.dumps(info, indent=2, default=str))]

    def run(self):
        import asyncio
        asyncio.run(self.server.run())

if __name__ == "__main__":
    server = FileServer(
        sandbox_root="./documents",
        max_file_size=2_000_000  # 2MB
    )
    server.run()
\`\`\`

**Security Checklist**:
- [ ] Sandbox to specific directory—never allow traversal
- [ ] Resolve paths and verify they're within sandbox
- [ ] Size limits on files to prevent memory exhaustion
- [ ] Text-only content reading (or explicit binary handling)
- [ ] No executable permissions on served files
- [ ] Line limits for partial reads
- [ ] Result limits for directory listings`,
        analogy: "A file server is like a bank's document vault. The bank (server) stores important papers (files) in a secure vault (sandbox directory). Customers (AI) can request to see specific documents, but can't wander freely through the vault. The bank verifies each request (path validation), limits what can be accessed (sandbox), and keeps records of every access (logging).",
        gotchas: [
          "Always resolve and validate paths—path traversal attacks are common",
          "Use os.path.commonprefix or Path.is_relative_to for sandbox validation",
          "Binary files need special handling—don't return raw bytes in JSON",
          "Set file size limits to prevent memory exhaustion on large files",
          "Consider content type detection beyond file extensions for security"
        ]
      },
      {
        title: "Composing Multiple MCP Servers",
        description: `Real-world AI applications rarely need just one capability. They need database access AND file reading AND API calls. MCP's architecture naturally supports this through multiple clients connecting to multiple servers.

**Composition Patterns**:

1. **Independent Servers**: Each server handles one domain. The AI host runs multiple MCP clients, one per server. This is the standard pattern.

\`\`\`
┌─────────────────────────────────────────┐
│            AI Application               │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Client 1 │ │ Client 2 │ │ Client 3 ││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘│
└───────┼────────────┼────────────┼───────┘
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │   DB    │  │   API   │  │  Files  │
   │ Server  │  │ Server  │  │ Server  │
   └─────────┘  └─────────┘  └─────────┘
\`\`\`

2. **Aggregator Server**: A single server that coordinates multiple backends. Useful when backends are tightly coupled or when you need cross-cutting concerns (unified auth, logging).

\`\`\`python
"""
Aggregator MCP Server
Combines multiple backends into a single MCP interface
"""
from mcp.server import Server
from mcp.types import Tool, TextContent
import json

class AggregatorServer:
    def __init__(self, db_path: str, api_key: str, file_root: str):
        self.server = Server("unified-server")

        # Initialize backend clients
        self.db = DatabaseClient(db_path)
        self.api = APIClient(api_key)
        self.files = FileClient(file_root)

        self._register_handlers()

    def _register_handlers(self):
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            # Combine tools from all backends with prefixes
            tools = []

            # Database tools
            tools.extend([
                Tool(name="db_query", description="Query the database", ...),
                Tool(name="db_tables", description="List database tables", ...),
            ])

            # API tools
            tools.extend([
                Tool(name="api_weather", description="Get weather data", ...),
                Tool(name="api_translate", description="Translate text", ...),
            ])

            # File tools
            tools.extend([
                Tool(name="file_read", description="Read a file", ...),
                Tool(name="file_list", description="List directory", ...),
            ])

            return tools

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent]:
            # Route to appropriate backend
            if name.startswith("db_"):
                return await self._handle_db(name[3:], arguments)
            elif name.startswith("api_"):
                return await self._handle_api(name[4:], arguments)
            elif name.startswith("file_"):
                return await self._handle_file(name[5:], arguments)
            else:
                raise ValueError(f"Unknown tool: {name}")
\`\`\`

3. **Proxy Server**: A server that proxies requests to other MCP servers. Useful for adding authentication, logging, or transformation layers.

**Claude Desktop Configuration**:

When using Claude Desktop (or similar hosts), configure multiple servers in the config file:

\`\`\`json
{
  "mcpServers": {
    "database": {
      "command": "python",
      "args": ["-m", "mcp_servers.database"],
      "env": {
        "DATABASE_URL": "sqlite:///data.db"
      }
    },
    "weather": {
      "command": "python",
      "args": ["-m", "mcp_servers.weather"],
      "env": {
        "OPENWEATHERMAP_API_KEY": "your-key"
      }
    },
    "files": {
      "command": "python",
      "args": ["-m", "mcp_servers.files"],
      "env": {
        "SANDBOX_ROOT": "/home/user/documents"
      }
    }
  }
}
\`\`\`

**Orchestration Considerations**:

- **Startup Order**: Servers start independently. Design for eventual availability.
- **Error Isolation**: One server's failure shouldn't affect others. Handle connection errors gracefully.
- **Resource Sharing**: Avoid contention (same database, same API quota). Use connection pooling and quota management.
- **Unified Logging**: Consider a shared logging infrastructure for debugging cross-server interactions.

**Testing Multi-Server Setups**:

\`\`\`python
"""
Test harness for multiple MCP servers
"""
import asyncio
from mcp.client import Client

async def test_servers():
    # Connect to each server
    db_client = Client("db-client")
    await db_client.connect_stdio("python", ["-m", "mcp_servers.database"])

    api_client = Client("api-client")
    await api_client.connect_stdio("python", ["-m", "mcp_servers.weather"])

    # Test each server
    print("Testing database...")
    tables = await db_client.call_tool("list_tables", {})
    print(f"Tables: {tables}")

    print("Testing weather API...")
    weather = await api_client.call_tool("get_weather", {"location": "London"})
    print(f"Weather: {weather}")

    # Combined workflow
    print("Combined query...")
    # Get weather for cities in database
    cities = await db_client.call_tool("query", {
        "sql": "SELECT name FROM cities LIMIT 5"
    })
    for city in cities["rows"]:
        weather = await api_client.call_tool("get_weather", {
            "location": city["name"]
        })
        print(f"{city['name']}: {weather['temperature']}°")

if __name__ == "__main__":
    asyncio.run(test_servers())
\`\`\``,
        analogy: "Composing MCP servers is like building with LEGO bricks. Each server is a specialized brick—a database brick, an API brick, a file brick. You don't need one giant brick that does everything; you snap together the bricks you need for your application. The MCP protocol is the universal connector that makes all bricks compatible.",
        gotchas: [
          "Tool name collisions across servers—use prefixes (db_query, api_weather)",
          "Startup order matters if servers depend on each other—design for independence",
          "One failing server shouldn't crash the entire application—handle errors gracefully",
          "Consider unified logging and monitoring across all servers",
          "Watch for resource contention (database connections, API rate limits)"
        ]
      }
    ],

    codeExamples: [
      {
        title: "FastMCP: Rapid Server Development",
        language: "python",
        category: "basic",
        code: `"""
FastMCP Example
The fastest way to build MCP servers with decorators
"""
from fastmcp import FastMCP

# Create server with one line
mcp = FastMCP("my-tools")

# Define tools with simple decorators
@mcp.tool()
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression."""
    import math
    # Safe eval with math functions only
    result = eval(expression, {"__builtins__": {}}, vars(math))
    return f"Result: {result}"

@mcp.tool()
def word_count(text: str) -> dict:
    """Count words, sentences, and characters in text."""
    words = len(text.split())
    sentences = text.count('.') + text.count('!') + text.count('?')
    characters = len(text)
    return {
        "words": words,
        "sentences": sentences,
        "characters": characters
    }

@mcp.tool()
def json_format(data: str, indent: int = 2) -> str:
    """Format a JSON string with indentation."""
    import json
    parsed = json.loads(data)
    return json.dumps(parsed, indent=indent)

# Define resources just as easily
@mcp.resource("config://app/settings")
def get_settings() -> str:
    """Application configuration."""
    return json.dumps({
        "version": "1.0",
        "debug": False,
        "features": ["tools", "resources"]
    })

# Define prompts with arguments
@mcp.prompt()
def review_code(code: str, language: str = "python") -> str:
    """Review code for issues and improvements."""
    return f"""Please review this {language} code:

\`\`\`{language}
{code}
\`\`\`

Check for:
1. Bugs and errors
2. Security issues
3. Performance problems
4. Style improvements"""

# Run the server
if __name__ == "__main__":
    mcp.run()`,
        explanation: "FastMCP dramatically simplifies MCP server development. Tools, resources, and prompts are defined with simple decorators. Type hints are automatically converted to JSON schemas. The framework handles all protocol details."
      },
      {
        title: "PostgreSQL MCP Server",
        language: "python",
        category: "intermediate",
        code: `"""
Production PostgreSQL MCP Server
Async queries with connection pooling
"""
from mcp.server import Server
from mcp.types import Tool, TextContent
import asyncpg
import json
import re
import os
from typing import Optional

class PostgresServer:
    def __init__(self):
        self.server = Server("postgres-server")
        self.pool: Optional[asyncpg.Pool] = None
        self._register_handlers()

    async def init_pool(self):
        """Initialize connection pool on first use."""
        if not self.pool:
            self.pool = await asyncpg.create_pool(
                host=os.environ.get("PGHOST", "localhost"),
                database=os.environ.get("PGDATABASE", "postgres"),
                user=os.environ.get("PGUSER", "mcp_readonly"),
                password=os.environ.get("PGPASSWORD", ""),
                min_size=2,
                max_size=10,
                command_timeout=30
            )

    def validate_query(self, sql: str) -> tuple[bool, str]:
        """Validate SQL query for safety."""
        sql_upper = sql.strip().upper()

        # Only SELECT, WITH (CTEs), and EXPLAIN allowed
        allowed_starts = ("SELECT", "WITH", "EXPLAIN")
        if not any(sql_upper.startswith(s) for s in allowed_starts):
            return False, "Only SELECT queries allowed"

        # Block dangerous patterns
        blocked = ["INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE",
                   "ALTER", "CREATE", "GRANT", "REVOKE"]
        for keyword in blocked:
            # Match keyword as whole word
            if re.search(rf"\\b{keyword}\\b", sql_upper):
                return False, f"Blocked keyword: {keyword}"

        return True, ""

    def _register_handlers(self):
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            return [
                Tool(
                    name="query",
                    description="Execute a read-only SQL query",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "sql": {"type": "string", "description": "SQL query"},
                            "params": {
                                "type": "array",
                                "items": {},
                                "description": "Query parameters for $1, $2, etc."
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Max rows (default 100)",
                                "default": 100
                            }
                        },
                        "required": ["sql"]
                    }
                ),
                Tool(
                    name="list_tables",
                    description="List all tables with row counts",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "schema": {
                                "type": "string",
                                "description": "Schema name (default: public)",
                                "default": "public"
                            }
                        }
                    }
                ),
                Tool(
                    name="describe_table",
                    description="Get detailed table schema",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "table": {"type": "string", "description": "Table name"},
                            "schema": {"type": "string", "default": "public"}
                        },
                        "required": ["table"]
                    }
                ),
                Tool(
                    name="explain_query",
                    description="Get query execution plan",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "sql": {"type": "string", "description": "Query to explain"},
                            "analyze": {
                                "type": "boolean",
                                "description": "Include actual timing (runs query)",
                                "default": False
                            }
                        },
                        "required": ["sql"]
                    }
                )
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent]:
            await self.init_pool()

            try:
                if name == "query":
                    return await self._query(arguments)
                elif name == "list_tables":
                    return await self._list_tables(arguments)
                elif name == "describe_table":
                    return await self._describe_table(arguments)
                elif name == "explain_query":
                    return await self._explain(arguments)
                else:
                    raise ValueError(f"Unknown tool: {name}")
            except asyncpg.PostgresError as e:
                return [TextContent(
                    type="text",
                    text=json.dumps({"error": str(e), "type": type(e).__name__}),
                    isError=True
                )]

    async def _query(self, args: dict) -> list[TextContent]:
        sql = args.get("sql", "")
        params = args.get("params", [])
        limit = min(args.get("limit", 100), 1000)

        valid, error = self.validate_query(sql)
        if not valid:
            return [TextContent(type="text", text=error, isError=True)]

        # Add LIMIT if not present
        if "LIMIT" not in sql.upper():
            sql = f"SELECT * FROM ({sql}) AS q LIMIT {limit}"

        async with self.pool.acquire() as conn:
            rows = await conn.fetch(sql, *params)
            result = [dict(row) for row in rows]

            return [TextContent(type="text", text=json.dumps({
                "row_count": len(result),
                "rows": result
            }, indent=2, default=str))]

    async def _list_tables(self, args: dict) -> list[TextContent]:
        schema = args.get("schema", "public")

        async with self.pool.acquire() as conn:
            tables = await conn.fetch("""
                SELECT
                    t.table_name,
                    t.table_type,
                    pg_catalog.obj_description(
                        (quote_ident(t.table_schema) || '.' ||
                         quote_ident(t.table_name))::regclass
                    ) as description,
                    (SELECT reltuples::bigint
                     FROM pg_class
                     WHERE oid = (quote_ident(t.table_schema) || '.' ||
                                  quote_ident(t.table_name))::regclass) as row_estimate
                FROM information_schema.tables t
                WHERE t.table_schema = $1
                ORDER BY t.table_name
            """, schema)

            return [TextContent(type="text", text=json.dumps({
                "schema": schema,
                "tables": [dict(t) for t in tables]
            }, indent=2, default=str))]

    async def _describe_table(self, args: dict) -> list[TextContent]:
        table = args.get("table", "")
        schema = args.get("schema", "public")

        if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", table):
            return [TextContent(type="text", text="Invalid table name", isError=True)]

        async with self.pool.acquire() as conn:
            # Get columns
            columns = await conn.fetch("""
                SELECT
                    column_name, data_type, is_nullable,
                    column_default, character_maximum_length
                FROM information_schema.columns
                WHERE table_schema = $1 AND table_name = $2
                ORDER BY ordinal_position
            """, schema, table)

            # Get indexes
            indexes = await conn.fetch("""
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE schemaname = $1 AND tablename = $2
            """, schema, table)

            # Get foreign keys
            fks = await conn.fetch("""
                SELECT
                    kcu.column_name,
                    ccu.table_name AS foreign_table,
                    ccu.column_name AS foreign_column
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = $1 AND tc.table_name = $2
            """, schema, table)

            return [TextContent(type="text", text=json.dumps({
                "table": table,
                "schema": schema,
                "columns": [dict(c) for c in columns],
                "indexes": [dict(i) for i in indexes],
                "foreign_keys": [dict(f) for f in fks]
            }, indent=2, default=str))]

    async def _explain(self, args: dict) -> list[TextContent]:
        sql = args.get("sql", "")
        analyze = args.get("analyze", False)

        valid, error = self.validate_query(sql)
        if not valid:
            return [TextContent(type="text", text=error, isError=True)]

        explain_sql = f"EXPLAIN {'ANALYZE ' if analyze else ''}(FORMAT JSON) {sql}"

        async with self.pool.acquire() as conn:
            result = await conn.fetchval(explain_sql)
            return [TextContent(type="text", text=json.dumps(result, indent=2))]

    def run(self):
        import asyncio
        asyncio.run(self.server.run())

if __name__ == "__main__":
    PostgresServer().run()`,
        explanation: "Full PostgreSQL server with connection pooling, query validation, schema inspection, and query explanation. Uses asyncpg for high-performance async database access."
      },
      {
        title: "Multi-API Wrapper Server",
        language: "python",
        category: "advanced",
        code: `"""
Multi-API MCP Server
Wraps multiple external services with unified interface
"""
from mcp.server import Server
from mcp.types import Tool, TextContent
import httpx
import json
import os
from dataclasses import dataclass
from typing import Optional
import time

@dataclass
class CacheConfig:
    ttl_seconds: int = 300
    max_entries: int = 1000

class APIWrapper:
    """Base class for API wrappers."""

    def __init__(self, name: str, base_url: str, api_key: str = ""):
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.cache: dict = {}

    async def request(
        self,
        client: httpx.AsyncClient,
        method: str,
        path: str,
        params: dict = None,
        json_body: dict = None,
        cache_ttl: int = 0
    ) -> dict:
        url = f"{self.base_url}{path}"
        cache_key = f"{method}:{url}:{json.dumps(params or {})}"

        # Check cache
        if cache_ttl > 0 and cache_key in self.cache:
            entry = self.cache[cache_key]
            if time.time() < entry["expires"]:
                return entry["data"]

        # Make request
        headers = self._get_headers()
        response = await client.request(
            method, url, params=params, json=json_body, headers=headers
        )
        response.raise_for_status()
        data = response.json()

        # Cache if needed
        if cache_ttl > 0:
            self.cache[cache_key] = {
                "data": data,
                "expires": time.time() + cache_ttl
            }

        return data

    def _get_headers(self) -> dict:
        return {}

class OpenWeatherAPI(APIWrapper):
    def __init__(self):
        super().__init__(
            "weather",
            "https://api.openweathermap.org/data/2.5",
            os.environ.get("OPENWEATHERMAP_API_KEY", "")
        )

    async def current(self, client: httpx.AsyncClient, location: str, units: str = "metric") -> dict:
        data = await self.request(
            client, "GET", "/weather",
            params={"q": location, "units": units, "appid": self.api_key},
            cache_ttl=600
        )
        return {
            "location": data["name"],
            "temp": data["main"]["temp"],
            "conditions": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"]
        }

class GeocodingAPI(APIWrapper):
    def __init__(self):
        super().__init__(
            "geocoding",
            "https://nominatim.openstreetmap.org",
            ""
        )

    def _get_headers(self) -> dict:
        return {"User-Agent": "MCP-Server/1.0"}

    async def geocode(self, client: httpx.AsyncClient, address: str) -> dict:
        data = await self.request(
            client, "GET", "/search",
            params={"q": address, "format": "json", "limit": 1},
            cache_ttl=86400  # Cache for 1 day
        )
        if not data:
            return {"error": "Location not found"}
        return {
            "lat": float(data[0]["lat"]),
            "lon": float(data[0]["lon"]),
            "display_name": data[0]["display_name"]
        }

class NewsAPI(APIWrapper):
    def __init__(self):
        super().__init__(
            "news",
            "https://newsapi.org/v2",
            os.environ.get("NEWS_API_KEY", "")
        )

    def _get_headers(self) -> dict:
        return {"X-Api-Key": self.api_key}

    async def headlines(self, client: httpx.AsyncClient, query: str = "", country: str = "us") -> dict:
        params = {"country": country, "pageSize": 5}
        if query:
            params["q"] = query

        data = await self.request(
            client, "GET", "/top-headlines",
            params=params,
            cache_ttl=300
        )
        return {
            "articles": [{
                "title": a["title"],
                "source": a["source"]["name"],
                "url": a["url"],
                "published": a["publishedAt"]
            } for a in data.get("articles", [])]
        }

class MultiAPIServer:
    def __init__(self):
        self.server = Server("multi-api")
        self.client = httpx.AsyncClient(timeout=15.0)

        # Initialize APIs
        self.weather = OpenWeatherAPI()
        self.geo = GeocodingAPI()
        self.news = NewsAPI()

        self._register_handlers()

    def _register_handlers(self):
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            return [
                Tool(
                    name="weather",
                    description="Get current weather for a location",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "location": {"type": "string", "description": "City name"},
                            "units": {"type": "string", "enum": ["metric", "imperial"]}
                        },
                        "required": ["location"]
                    }
                ),
                Tool(
                    name="geocode",
                    description="Convert address to coordinates",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "address": {"type": "string", "description": "Address to geocode"}
                        },
                        "required": ["address"]
                    }
                ),
                Tool(
                    name="news",
                    description="Get top news headlines",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query"},
                            "country": {"type": "string", "description": "Country code (us, gb, etc.)"}
                        }
                    }
                ),
                Tool(
                    name="weather_at_address",
                    description="Get weather for an address (combines geocoding + weather)",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "address": {"type": "string", "description": "Full address"}
                        },
                        "required": ["address"]
                    }
                )
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent]:
            try:
                if name == "weather":
                    result = await self.weather.current(
                        self.client,
                        arguments["location"],
                        arguments.get("units", "metric")
                    )
                elif name == "geocode":
                    result = await self.geo.geocode(self.client, arguments["address"])
                elif name == "news":
                    result = await self.news.headlines(
                        self.client,
                        arguments.get("query", ""),
                        arguments.get("country", "us")
                    )
                elif name == "weather_at_address":
                    # Combined workflow: geocode then weather
                    geo = await self.geo.geocode(self.client, arguments["address"])
                    if "error" in geo:
                        return [TextContent(type="text", text=json.dumps(geo), isError=True)]

                    weather = await self.weather.current(self.client, f"{geo['lat']},{geo['lon']}")
                    result = {
                        "location": geo["display_name"],
                        "coordinates": {"lat": geo["lat"], "lon": geo["lon"]},
                        "weather": weather
                    }
                else:
                    raise ValueError(f"Unknown tool: {name}")

                return [TextContent(type="text", text=json.dumps(result, indent=2))]

            except httpx.HTTPError as e:
                return [TextContent(
                    type="text",
                    text=json.dumps({"error": str(e), "type": "http_error"}),
                    isError=True
                )]

    def run(self):
        import asyncio
        asyncio.run(self.server.run())

if __name__ == "__main__":
    MultiAPIServer().run()`,
        explanation: "A server that wraps multiple external APIs with a unified interface. Demonstrates API abstraction, caching, and combined workflows (geocode + weather). Each API wrapper handles authentication and response formatting independently."
      }
    ],

    diagrams: [
      {
        title: "MCP Server Security Layers",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Request["Incoming Request"]
        R1["AI wants to query data"]
    end

    subgraph Validation["Server Validation Layer"]
        V1["Parse JSON-RPC"]
        V2["Validate tool name"]
        V3["Validate arguments"]
        V4["Check permissions"]
    end

    subgraph Sanitization["Input Sanitization"]
        S1["SQL injection prevention"]
        S2["Path traversal check"]
        S3["Parameter bounds check"]
    end

    subgraph Execution["Safe Execution"]
        E1["Use parameterized queries"]
        E2["Apply resource limits"]
        E3["Timeout protection"]
    end

    subgraph Response["Response Handling"]
        RES1["Format results"]
        RES2["Redact sensitive data"]
        RES3["Log operation"]
    end

    R1 --> V1 --> V2 --> V3 --> V4
    V4 --> S1 --> S2 --> S3
    S3 --> E1 --> E2 --> E3
    E3 --> RES1 --> RES2 --> RES3

    style Validation fill:#ffebee
    style Sanitization fill:#fff3e0
    style Execution fill:#e8f5e9`,
        caption: "Every MCP server should implement multiple security layers to protect backend systems from misuse."
      },
      {
        title: "Database Server Data Flow",
        type: "mermaid",
        mermaid: `sequenceDiagram
    participant AI as AI Application
    participant MCP as MCP Server
    participant Pool as Connection Pool
    participant DB as Database

    AI->>MCP: tools/call "query"<br/>{sql: "SELECT..."}

    MCP->>MCP: Validate SQL<br/>(no DROP, UPDATE, etc.)

    alt Invalid SQL
        MCP-->>AI: Error: Only SELECT allowed
    else Valid SQL
        MCP->>Pool: Get connection
        Pool-->>MCP: Connection

        MCP->>DB: Execute query
        DB-->>MCP: Result rows

        MCP->>Pool: Release connection

        MCP->>MCP: Format as JSON<br/>Apply LIMIT

        MCP-->>AI: {rows: [...], count: N}
    end`,
        caption: "Database server validates queries before execution and manages connection lifecycle."
      },
      {
        title: "File Server Path Validation",
        type: "mermaid",
        mermaid: `flowchart TD
    Input["Input: /documents/../../../etc/passwd"]

    Resolve["Resolve to absolute path"]
    Resolved["/etc/passwd"]

    Sandbox["Sandbox root: /home/user/documents"]

    Check{"Path starts with<br/>sandbox root?"}

    Reject["REJECT<br/>Path traversal blocked"]
    Accept["ACCEPT<br/>Path within sandbox"]

    Input --> Resolve --> Resolved
    Resolved --> Check
    Sandbox --> Check
    Check -->|No| Reject
    Check -->|Yes| Accept

    style Reject fill:#ffcdd2
    style Accept fill:#c8e6c9`,
        caption: "Always resolve paths and verify they remain within the sandbox directory."
      }
    ],

    keyTakeaways: [
      "MCP servers are adapters—they translate between universal MCP protocol and specific backend systems",
      "Security is paramount: validate all inputs, use minimal privileges, log everything",
      "Database servers should be read-only by default with SQL injection prevention",
      "API wrappers benefit from caching, rate limiting, and error normalization",
      "File servers must sandbox paths and prevent directory traversal attacks",
      "Compose focused servers rather than building monolithic ones",
      "FastMCP dramatically simplifies server development for quick prototypes",
      "Test servers independently before combining them in production"
    ],

    resources: [
      {
        title: "MCP Python SDK",
        url: "https://github.com/modelcontextprotocol/python-sdk",
        type: "github",
        description: "Official Python SDK for building MCP servers and clients"
      },
      {
        title: "FastMCP",
        url: "https://github.com/jlowin/fastmcp",
        type: "github",
        description: "Pythonic framework for rapid MCP server development"
      },
      {
        title: "MCP Servers Repository",
        url: "https://github.com/modelcontextprotocol/servers",
        type: "github",
        description: "Reference implementations for file, Git, PostgreSQL, and other servers"
      },
      {
        title: "asyncpg Documentation",
        url: "https://magicstack.github.io/asyncpg/current/",
        type: "docs",
        description: "High-performance PostgreSQL driver for async Python"
      },
      {
        title: "HTTPX Documentation",
        url: "https://www.python-httpx.org/",
        type: "docs",
        description: "Modern async HTTP client for Python, ideal for API wrappers"
      }
    ],

    faq: [
      {
        question: "Should I use FastMCP or the raw SDK?",
        answer: "FastMCP is ideal for rapid prototyping and simple servers—it handles boilerplate with decorators. Use the raw SDK when you need fine-grained control over connection lifecycle, custom transports, or when building complex servers with shared state. Many production servers start with FastMCP and migrate to raw SDK only if needed."
      },
      {
        question: "How do I handle database credentials securely?",
        answer: "Never hardcode credentials. Use environment variables (PGPASSWORD, DATABASE_URL) and ensure your server process has appropriate permissions. For production, consider secrets managers (AWS Secrets Manager, HashiCorp Vault) that inject credentials at runtime. Create minimal-privilege database roles that can only SELECT from specific tables."
      },
      {
        question: "What if my API has rate limits?",
        answer: "Implement rate limiting in your server with multiple levels: per-minute for burst protection, per-day for quota management. Cache responses when appropriate—weather data is valid for minutes, geocoding results for days. Consider queuing requests when limits are approached and returning helpful error messages that tell the AI to wait."
      },
      {
        question: "How do I test MCP servers?",
        answer: "Use the MCP Inspector tool for interactive testing. For automated tests, create a test client that connects to your server and verifies responses. Test both happy paths and error conditions. Mock external dependencies (databases, APIs) in unit tests. For integration tests, use test databases with known data."
      },
      {
        question: "Can I combine multiple servers into one?",
        answer: "Yes, you can either: 1) Run multiple independent servers (recommended—better isolation), or 2) Create an aggregator server that combines multiple backends with tool name prefixes (db_query, api_weather). Independent servers are easier to maintain and update, but aggregators reduce connection overhead and simplify configuration."
      },
      {
        question: "How do I handle large files or query results?",
        answer: "Implement pagination or streaming. For files: return line ranges (lines 1-100, 101-200). For queries: use LIMIT/OFFSET or cursor-based pagination. Set maximum sizes and reject requests that would return too much data. Consider summarization for very large datasets—return counts, samples, or aggregates instead of full data."
      }
    ],

    applications: [
      {
        title: "Data Analytics Assistant",
        description: "Connect AI to your data warehouse through an MCP database server. Users can ask natural language questions about sales, customers, or operations, and the AI translates to SQL, executes safely, and interprets results."
      },
      {
        title: "Code Repository Explorer",
        description: "File server sandboxed to a Git repository lets AI browse source code, read documentation, and understand project structure. Combine with a Git MCP server for commit history and blame information."
      },
      {
        title: "API Integration Hub",
        description: "Wrap your company's internal APIs in MCP servers so AI assistants can check order status, update CRM records, or query inventory—all through natural language with proper authentication and audit logging."
      },
      {
        title: "Document Research System",
        description: "File server for document access combined with search capabilities. AI can find relevant documents, read contents, and synthesize information across multiple sources for research tasks."
      },
      {
        title: "DevOps Dashboard",
        description: "Combine servers for metrics APIs (Datadog, Prometheus), log systems (Elasticsearch), and deployment tools (Kubernetes). AI can diagnose issues by correlating data across systems."
      }
    ],

    relatedDays: [2, 19, 21]
  }
};
