# PydanticAI GitHub Repository - Summary

> Source: [PydanticAI GitHub](https://github.com/pydantic/pydantic-ai)

## Overview

PydanticAI is a Python framework for building production-grade applications with generative AI. Built by the Pydantic team, it brings the FastAPI developer experience to agent and GenAI development.

## Key Features

1. **Built by Pydantic Team** - Created by the maintainers of the validation library that powers most Python AI SDKs
2. **Model-agnostic** - Works with OpenAI, Anthropic, Gemini, Ollama, Groq, and 30+ other providers
3. **Seamless Observability** - Integrates with Pydantic Logfire for monitoring and debugging
4. **Fully Type-safe** - Provides IDE auto-completion and static type checking throughout
5. **Powerful Evals** - Systematic testing and performance evaluation capabilities
6. **MCP, A2A, and UI Standards** - Supports Model Context Protocol and agent interoperability
7. **Human-in-the-Loop Approvals** - Flag tool calls requiring human authorization
8. **Durable Execution** - Handles API failures and preserves progress across restarts
9. **Streamed Outputs** - Continuously stream validated structured data
10. **Graph Support** - Define complex workflows using type hints

## Quick Start

Minimal agent example:

```python
from pydantic_ai import Agent

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    instructions='Be concise, reply with one sentence.'
)

result = agent.run_sync('Where does "hello world" come from?')
print(result.output)
```

## Installation

```bash
pip install pydantic-ai
```

For specific model providers:
```bash
pip install pydantic-ai[openai]
pip install pydantic-ai[anthropic]
pip install pydantic-ai[google]
```

## Project Structure

The repository includes:
- `/docs` - Documentation source
- `/examples` - Example projects and tutorials
- `/pydantic_ai` - Core framework code
- `/pydantic_ai_slim` - Minimal variant
- `/pydantic_graph` - Graph workflow utilities
- `/evals` - Evaluation framework

## Links

- Documentation: https://ai.pydantic.dev/
- Examples: https://ai.pydantic.dev/examples/
- Slack Community: Available via docs
- Issues: GitHub Issues for bug reports and feature requests
