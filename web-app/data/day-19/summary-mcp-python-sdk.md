# MCP Python SDK Quick Start

## Installation

```bash
pip install mcp
```

Or with UV (recommended):
```bash
uv add mcp
```

## Basic Server Example

```python
from mcp.server import Server
from mcp.types import Tool, TextContent

# Create server instance
server = Server("my-server")

# Define a tool
@server.tool()
async def hello(name: str) -> list[TextContent]:
    """Greet someone by name."""
    return [TextContent(type="text", text=f"Hello, {name}!")]

# Run the server
if __name__ == "__main__":
    import asyncio
    asyncio.run(server.run())
```

## Adding Resources

```python
from mcp.types import Resource, TextResourceContents

@server.list_resources()
async def list_resources() -> list[Resource]:
    return [
        Resource(
            uri="file:///example.txt",
            name="Example File",
            mimeType="text/plain"
        )
    ]

@server.read_resource()
async def read_resource(uri: str) -> TextResourceContents:
    if uri == "file:///example.txt":
        return TextResourceContents(
            uri=uri,
            mimeType="text/plain",
            text="File contents here"
        )
```

## Adding Prompts

```python
from mcp.types import Prompt, PromptMessage, PromptArgument

@server.list_prompts()
async def list_prompts() -> list[Prompt]:
    return [
        Prompt(
            name="code-review",
            description="Review code for issues",
            arguments=[
                PromptArgument(name="code", required=True)
            ]
        )
    ]

@server.get_prompt()
async def get_prompt(name: str, arguments: dict) -> list[PromptMessage]:
    if name == "code-review":
        return [
            PromptMessage(
                role="user",
                content=TextContent(
                    type="text",
                    text=f"Please review this code:\n\n{arguments['code']}"
                )
            )
        ]
```

## Configuration for Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["/path/to/server.py"]
    }
  }
}
```

## Key Links

- [GitHub Repository](https://github.com/modelcontextprotocol/python-sdk)
- [PyPI Package](https://pypi.org/project/mcp/)
- [Server Documentation](https://modelcontextprotocol.io/docs/first-server/python)
