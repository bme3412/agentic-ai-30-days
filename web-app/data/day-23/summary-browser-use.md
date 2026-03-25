# browser-use GitHub Repository Summary

**Source**: [github.com/browser-use/browser-use](https://github.com/browser-use/browser-use)

## Overview

browser-use is an open-source Python library by AGI Inc that connects any LLM to a Playwright-controlled browser. It packages the observe → plan → act → verify agent loop into a simple API, handling DOM extraction, action execution, and visual grounding automatically. The library has rapidly become the most popular open-source browser agent framework, with 50k+ GitHub stars.

## Installation

```bash
pip install browser-use
playwright install chromium
```

## Basic Usage

```python
from browser_use import Agent
from langchain_openai import ChatOpenAI
import asyncio

async def main():
    agent = Agent(
        task="Find the cheapest MacBook Pro on Amazon and return its price",
        llm=ChatOpenAI(model="gpt-4o"),
    )
    result = await agent.run()
    print(result.final_result())

asyncio.run(main())
```

## Architecture

### Core Components

**Agent**: The main reasoning loop. Each step:
1. Captures current page state (DOM + optional screenshot)
2. Sends state + task + history to the LLM
3. Executes the returned action
4. Loops until the task is complete or max_steps reached

**Browser**: Wraps Playwright with agent-friendly utilities — compressed DOM extraction, persistent context management, and screenshot capture.

**Controller**: Maps LLM action outputs to Playwright calls. Built-in actions:
- `navigate(url)` — Go to a URL
- `click(index)` — Click an element by its index in the extracted DOM
- `input_text(index, text)` — Fill an input field
- `scroll(direction, amount)` — Scroll the page
- `extract_content(goal)` — Extract specific information from the page
- `go_back()` — Browser back
- `open_tab(url)` / `switch_tab(id)` — Tab management
- `done(text)` — Complete the task and return a result

## DOM Extraction

browser-use extracts the page DOM into a compact, LLM-readable format:

```
[1] <button> Add to Cart </button>
[2] <a href="/products"> Products </a>
[3] <input placeholder="Search..."> </input>
[4] <div> Price: $999.00 </div>
```

Interactive elements are numbered; static content is included as context. This reduces a typical page from hundreds of KB of HTML to a few hundred tokens.

## Configuration

```python
from browser_use import Agent, Browser, BrowserConfig
from browser_use.browser.context import BrowserContextConfig

browser = Browser(
    config=BrowserConfig(
        headless=True,
        disable_security=False,  # Keep browser security on
    )
)

agent = Agent(
    task="...",
    llm=llm,
    browser=browser,
    browser_context_config=BrowserContextConfig(
        viewport_expansion=500,    # Extra DOM context below fold
        minimum_wait_page_load_time=0.5,
        wait_for_network_idle_page_load_time=2.0,
    ),
    max_actions_per_step=5,       # Actions per LLM call
    max_failures=3,                # Consecutive failures before stopping
    use_vision=True,               # Screenshot fallback for visual elements
    save_conversation_path="logs/conversation.json",
)
```

## Result Object

```python
history = await agent.run(max_steps=20)

history.final_result()          # The agent's last output
history.is_done()               # Whether the task completed
history.model_actions()         # List of all actions taken
history.errors()                # Any errors encountered
history.screenshots()           # Screenshots taken during run
history.urls()                  # All URLs visited
```

## Multi-Tab Support

```python
# Agent can open and switch between tabs automatically
# Or manage tabs explicitly:
agent = Agent(
    task="Compare prices on amazon.com and bestbuy.com",
    llm=llm,
)
# Agent will open multiple tabs and navigate between them
```

## Pre-Authentication

```python
# Log in manually, then hand the authenticated context to the agent
browser = Browser(config=BrowserConfig(headless=False))
context = await browser.new_context()
page = await context.get_current_page()

await page.goto("https://app.example.com/login")
await page.fill('[name="email"]', "user@example.com")
await page.fill('[name="password"]', "secret")
await page.click('[type="submit"]')
await page.wait_for_url("**/dashboard")

# Now run the agent with the authenticated session
agent = Agent(
    task="Export last month's usage report",
    llm=llm,
    browser=browser,
    browser_context=context,
)
result = await agent.run()
```

## Custom Actions

```python
from browser_use import Controller
from pydantic import BaseModel

controller = Controller()

class SaveDataInput(BaseModel):
    data: str
    filename: str

@controller.action("Save extracted data to a file", param_model=SaveDataInput)
async def save_data(params: SaveDataInput):
    with open(params.filename, "w") as f:
        f.write(params.data)
    return f"Saved to {params.filename}"

agent = Agent(task="...", llm=llm, controller=controller)
```

## Supported LLMs

Works with any LangChain-compatible LLM:
- OpenAI (gpt-4o, gpt-4o-mini)
- Anthropic (claude-3-5-sonnet, claude-3-5-haiku)
- Google (gemini-1.5-pro, gemini-2.0-flash)
- Open-source via Ollama (llama3, qwen2.5)

## Limitations

- DOM extraction may miss content inside shadow DOM or complex iframes
- Visual grounding adds LLM API calls per step — expensive at scale
- Best results with frontier models (GPT-4o, Claude 3.5+)
- Some sites actively block headless browsers — may need stealth configuration
