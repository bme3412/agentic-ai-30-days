import type { Day } from '../../types';

export const day23: Day = {
  day: 23,
  phase: 5,
  title: "Browser Automation Agents",
  partner: "AGI Inc / Playwright",
  tags: ["browser", "automation", "web-agents", "playwright", "computer-use", "dom", "visual-grounding"],
  concept: "Agents that navigate and interact with web pages autonomously using DOM understanding and computer vision",
  demoUrl: "demos/day-23/",
  demoDescription: "See browser automation in action: observe an agent navigate pages, locate elements via ARIA and CSS selectors, fill forms, handle dynamic content, and complete multi-step web workflows.",

  lesson: {
    overview: `**The web is the world's largest application interface**—and most of it was never designed for AI agents. Yet browser automation agents can navigate, click, fill, and extract just as a human would, unlocking access to legacy systems, SaaS tools, and any workflow that lives behind a web UI.

**Two complementary approaches define the space.** The first is DOM-based automation: the agent reads the page's structure (HTML, ARIA labels, CSS) to locate elements and issue precise actions. This is fast and reliable when the page is well-structured. The second is visual grounding: the agent looks at a screenshot of the page and uses computer vision to decide what to click. This works even on canvases, PDFs, and poorly labeled UIs—anywhere the DOM doesn't tell the full story.

**Playwright has emerged as the foundation layer.** Originally built by Microsoft for test automation, Playwright's cross-browser, async Python API is exactly what browser agents need: a programmatic way to control Chromium, Firefox, or WebKit, intercept network traffic, handle pop-ups, and take screenshots. AGI Inc's browser agent framework builds on top of Playwright to add the AI reasoning layer—deciding *what* to do based on the current page state.

**The key challenge is reliability.** Web pages are dynamic: elements appear after JavaScript runs, modals interrupt flows, and CAPTCHAs block bots. A robust browser agent needs retry logic, state detection, error recovery, and—for sensitive workflows—human-in-the-loop checkpoints before destructive actions.`,

    principles: [
      {
        title: "DOM-First Element Selection",
        description: "Prefer ARIA roles and labels, then semantic HTML elements, then CSS selectors, and use XPath only as a last resort. ARIA attributes are designed to describe UI intent and remain stable across visual redesigns. A button with aria-label='Submit order' is far more reliable than a button identified by its pixel position or a brittle CSS class like .btn-blue-v2."
      },
      {
        title: "Screenshot + Visual Grounding as Fallback",
        description: "When the DOM is ambiguous or the target isn't exposed via accessibility attributes—canvases, embedded PDFs, iframes from third-party origins—take a screenshot and use a multimodal model to identify the target. The model returns normalized coordinates; scale them to the viewport and issue a mouse click. Visual grounding is slower and less precise but universal."
      },
      {
        title: "Wait for State, Not for Time",
        description: "Never use fixed sleep() calls. Instead, wait for network idle, specific elements to appear, or explicit state conditions. Playwright's page.wait_for_selector() and page.wait_for_load_state('networkidle') ensure the page is actually ready before the agent acts. Fixed delays either waste time or fail on slow connections—condition-based waits do neither."
      },
      {
        title: "Atomic Action Recording and Replay",
        description: "Decompose workflows into small, verifiable actions—navigate, click, fill, assert. After each action, capture the new page state (DOM snapshot or screenshot) and verify the expected outcome before proceeding. This makes failures loud and specific: 'Expected checkout button, got login redirect' tells you exactly where the workflow broke."
      },
      {
        title: "Human-in-the-Loop Checkpoints",
        description: "For irreversible actions—placing orders, submitting forms, deleting records—pause the agent and show the planned action to a human before execution. Browser agents operating autonomously at scale will eventually encounter edge cases they can't handle correctly. Checkpoints before high-stakes actions prevent hard-to-reverse mistakes."
      }
    ],

    codeExample: {
      language: "python",
      title: "Basic Browser Agent with Playwright",
      code: `from playwright.async_api import async_playwright
import asyncio

async def search_and_extract():
    async with async_playwright() as p:
        # Launch browser (headless=False to watch it work)
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        # Navigate to target
        await page.goto("https://news.ycombinator.com")
        await page.wait_for_load_state("networkidle")

        # DOM-first element selection using ARIA + CSS
        stories = await page.query_selector_all(".athing")

        results = []
        for story in stories[:5]:
            title_el = await story.query_selector(".titleline a")
            if title_el:
                title = await title_el.inner_text()
                href = await title_el.get_attribute("href")
                results.append({"title": title, "url": href})

        await browser.close()
        return results

if __name__ == "__main__":
    data = asyncio.run(search_and_extract())
    for item in data:
        print(f"- {item['title']}")`
    },

    diagram: {
      type: "mermaid",
      title: "Browser Agent Decision Loop",
      mermaid: `flowchart TD
    GOAL["User Goal"] --> OBSERVE
    OBSERVE["Observe Page State\n(DOM + Screenshot)"] --> PLAN
    PLAN["Agent Plans\nNext Action"] --> ACT
    ACT["Execute Action\n(click / fill / navigate)"] --> VERIFY
    VERIFY{"Expected\nOutcome?"}
    VERIFY -->|Yes| DONE_CHECK
    VERIFY -->|No| RETRY
    RETRY{"Retries\nExhausted?"}
    RETRY -->|No| OBSERVE
    RETRY -->|Yes| HUMAN["Human-in-the-Loop"]
    DONE_CHECK{"Goal\nAchieved?"}
    DONE_CHECK -->|No| OBSERVE
    DONE_CHECK -->|Yes| DONE["Return Result"]`
    },

    keyTakeaways: [
      "Playwright provides cross-browser async control—the reliable foundation for all browser agents",
      "Prefer ARIA labels and semantic HTML for element selection; fall back to visual grounding for canvas/PDF/iframe content",
      "Wait for DOM conditions, never fixed timeouts—page.wait_for_selector() and wait_for_load_state() are essential",
      "Capture page state after every action and verify the expected outcome before the next step",
      "Insert human-in-the-loop checkpoints before irreversible actions (purchases, deletions, form submissions)",
      "Browser agents bridge the AI-to-legacy-UI gap: any workflow a human does in a browser, an agent can too"
    ],

    resources: [
      {
        title: "Playwright Python Documentation",
        url: "https://playwright.dev/python/docs/intro",
        type: "docs",
        description: "Official async Python API reference for Playwright",
        summaryPath: "data/day-23/summary-playwright-docs.md"
      },
      {
        title: "AGI Inc Browser Use",
        url: "https://github.com/browser-use/browser-use",
        type: "github",
        description: "The browser-use library: connect any LLM to a Playwright-controlled browser",
        summaryPath: "data/day-23/summary-browser-use.md"
      },
      {
        title: "Computer Use in Practice",
        url: "https://www.anthropic.com/news/developing-computer-use",
        type: "article",
        description: "Anthropic's overview of building agents that control a desktop/browser",
        summaryPath: "data/day-23/summary-computer-use.md"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Browser automation agents use Playwright for low-level browser control combined with DOM analysis and computer vision to navigate web pages, interact with UI elements, and complete multi-step workflows autonomously.",
      fullDescription: `The promise of browser automation agents is straightforward: if a task can be done in a browser by a human, an agent should be able to do it too. The reality is harder. Web pages are JavaScript-rendered mazes of dynamic content, authentication walls, CAPTCHAs, and brittle DOM structures. Building reliable browser agents requires a layered approach.

**Layer 1: Browser control.** Playwright gives you a Python API to control a real browser—navigate to URLs, click elements, fill inputs, take screenshots, intercept network requests, handle dialogs. It works across Chromium, Firefox, and WebKit. Everything else builds on top of this foundation.

**Layer 2: Page understanding.** An agent needs to know what's on the page before it can act. There are two approaches: DOM parsing (reading the HTML/ARIA tree to understand structure) and visual grounding (analyzing a screenshot with a multimodal model). DOM parsing is fast and precise. Visual grounding handles pages where the DOM doesn't reflect the visual UI—embedded PDFs, canvas-rendered apps, third-party iframes.

**Layer 3: Action planning.** Given the current page state and the goal, the agent decides what action to take next. This is where the LLM comes in—it reasons about the UI state and selects the right action from a predefined set (navigate, click, fill, scroll, screenshot). The planning loop is: observe → plan → act → verify → repeat.

**Layer 4: Error recovery.** Things go wrong. Elements don't load in time. Unexpected modals appear. Authentication sessions expire. A robust browser agent has retry logic, error classification, and escalation paths. Some failures are transient (retry); others are blockers (escalate to human).

\`\`\`
Browser Agent Stack:
┌─────────────────────────────────┐
│  Goal / Task Description        │  ← User intent
├─────────────────────────────────┤
│  LLM Reasoning Layer            │  ← Decides next action
├─────────────────────────────────┤
│  DOM Parser + Vision Grounding  │  ← Page understanding
├─────────────────────────────────┤
│  Playwright Browser Control     │  ← Action execution
├─────────────────────────────────┤
│  Chromium / Firefox / WebKit    │  ← Real browser
└─────────────────────────────────┘
\`\`\`

The **browser-use** library from AGI Inc packages this stack into a clean API. You provide a task description and an LLM; browser-use handles the loop. Under the hood it uses Playwright for actions, builds a compressed DOM representation for the LLM, and manages screenshots for visual grounding when needed.`,
      prerequisites: [
        "Python async/await basics (Playwright is async-first)",
        "Day 19-20: MCP (browser agents often expose Playwright as MCP tools)",
        "Basic HTML/CSS knowledge helps for understanding selectors",
        "Familiarity with LLM API calls (for the reasoning layer)"
      ],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "Playwright: The Browser Control Foundation",
        description: `Playwright is a Microsoft-developed library for programmatic browser automation. Unlike older tools like Selenium, Playwright was built with modern web apps in mind: it uses async APIs, auto-waits for elements before acting, and provides first-class support for network interception, multiple browser contexts, and cross-browser testing.

For browser agents, Playwright provides the action primitives: \`page.goto(url)\`, \`page.click(selector)\`, \`page.fill(selector, value)\`, \`page.screenshot()\`, \`page.evaluate(js)\`. These are the "muscles" of the agent—the physical capabilities it has in the browser.

Playwright also handles several hard problems automatically:
- **Auto-waiting**: Before clicking an element, Playwright waits for it to be visible, enabled, and stable (not animating). This eliminates the most common source of flaky automation.
- **Browser contexts**: Each context is an isolated browser session with its own cookies, localStorage, and network state. Agents can run multiple contexts in parallel without interference.
- **Network interception**: Playwright can intercept, modify, or block network requests. This is useful for injecting auth tokens, mocking API responses during testing, or blocking ads that interfere with automation.
- **Tracing**: Playwright can record a trace of every action, screenshot, and network request. Invaluable for debugging complex workflows.

The async Python API is the right choice for agents because browser operations are I/O-bound—while waiting for a page to load, the agent can do other work. \`async with async_playwright() as p\` is the entry point for everything.`,
        analogy: "Playwright is like power steering in a car. It doesn't decide where to go—that's the agent's job—but it handles all the mechanical complexity of actually turning the wheels, making control precise and reliable.",
        gotchas: [
          "Playwright's auto-wait is powerful but has a default 30s timeout—set it explicitly for slow pages",
          "Headless mode is faster but some sites detect it; use headless=False or stealth plugins for such sites",
          "Each browser.new_context() creates a fresh session—reuse contexts to stay logged in across steps",
          "page.evaluate() runs JavaScript in the page—useful but be careful with untrusted content"
        ]
      },
      {
        title: "DOM-Based Element Selection",
        description: `The Document Object Model is the agent's primary way of understanding a web page. The DOM is a tree of HTML elements, each with attributes (id, class, aria-label, role, href, etc.) that describe its purpose. Selecting the right element is the most critical—and fragile—part of browser automation.

**Selection strategy, from most to least robust:**

1. **ARIA roles and labels** — \`page.get_by_role("button", name="Add to cart")\`. ARIA attributes are designed to describe UI semantics for accessibility tools. They're maintained by developers and survive visual redesigns.

2. **Test IDs** — \`page.get_by_test_id("checkout-btn")\`. Some apps add \`data-testid\` attributes specifically for automation. Extremely stable.

3. **Semantic text** — \`page.get_by_text("Sign in")\` or \`page.get_by_label("Email address")\`. Text-based selection is readable but breaks when copy changes.

4. **CSS selectors** — \`page.locator("#submit-btn")\` or \`page.locator(".cart-item:nth-child(2)")\`. ID-based CSS is reliable; class-based can break on redesigns.

5. **XPath** — \`page.locator("//button[contains(@class,'submit')]")\`. Verbose and brittle; use only when nothing else works.

For AI agents, ARIA roles are particularly valuable because they're naturally language-model-friendly: a button with \`role="button"\` and \`aria-label="Close dialog"\` is unambiguously described in plain language. Agents can be instructed to prefer ARIA attributes and the resulting automation is both robust and interpretable.

When building agents programmatically, generating a compact ARIA tree from the DOM (extracting only interactive elements and their labels) gives the LLM a manageable view of what's on the page without the noise of all the HTML.`,
        analogy: "ARIA attributes are like the labels on a control panel. A well-labeled panel says 'Engine Start', 'Landing Gear', 'Autopilot'. A poorly labeled one has unlabeled switches. DOM-first selection looks for the labels; visual grounding looks at the switch itself.",
        gotchas: [
          "Single-page apps often update the DOM without a navigation—don't assume selectors from step 1 exist in step 3",
          "Shadow DOM in web components hides elements from standard selectors—use page.locator('pierce/selector')",
          "Dynamic class names (CSS modules, Tailwind JIT) change on every build—never use them for selection",
          "iframes have separate DOMs—use page.frame_locator('iframe') to enter them"
        ]
      },
      {
        title: "Visual Grounding: Computer Vision for Web UI",
        description: `Not all web pages are DOM-friendly. Canvas-based apps (like Figma), PDF viewers, embedded third-party widgets, and heavily dynamic UIs often have poor ARIA coverage. For these, visual grounding is the answer: take a screenshot, ask a multimodal model to identify the target, and translate its description into click coordinates.

The basic visual grounding loop:
1. Take a full-page screenshot (\`await page.screenshot(full_page=True)\`)
2. Send the screenshot to a multimodal LLM (GPT-4o, Claude 3.5 Sonnet) with a prompt like: "Where is the 'Submit' button? Return normalized x,y coordinates."
3. Scale the returned coordinates to the actual viewport dimensions
4. Issue \`page.mouse.click(x, y)\`

More sophisticated approaches use **Set-of-Mark (SoM) prompting**: number all interactive elements in the screenshot with overlaid labels, then ask the model to return the label number. This removes ambiguity about what "the submit button" means when there are three on screen.

**When to use visual grounding vs. DOM selection:**
- Canvas/WebGL apps: always visual
- PDF viewers: always visual  
- Standard HTML forms: prefer DOM
- Hybrid: DOM first, fall back to visual if selector fails

Visual grounding is slower (adds an LLM API call per action), less precise (click coordinates drift with zoom/DPR), and costs more. Use it as a fallback, not a first choice. The browser-use library implements this fallback automatically.`,
        analogy: "DOM selection is like reading a map. Visual grounding is like looking out the window. Maps are faster and more precise, but when you're in unmarked territory, your eyes are the only option.",
        gotchas: [
          "High-DPI displays return screenshots at 2x resolution—scale coordinates accordingly",
          "Scrolled-down pages need scroll position factored into absolute coordinates",
          "Visual grounding adds 1-3 LLM API calls per action—it's expensive at scale",
          "Multimodal models can hallucinate UI elements that don't exist—verify with DOM check after click"
        ]
      },
      {
        title: "Handling Dynamic Content and Waiting",
        description: `Modern web apps render content asynchronously. The initial HTML is a shell; JavaScript fetches data and builds the DOM. An agent that acts before the page is ready will fail—clicking a button that isn't there yet, or reading a form that hasn't loaded its options.

Playwright provides three waiting strategies:

**1. Load state waits**
\`\`\`python
await page.wait_for_load_state("domcontentloaded")  # DOM parsed
await page.wait_for_load_state("load")               # Images loaded  
await page.wait_for_load_state("networkidle")        # No requests for 500ms
\`\`\`
\`networkidle\` is the safest for SPAs—it waits until all async data fetches are done.

**2. Element-level waits**
\`\`\`python
await page.wait_for_selector(".product-grid", state="visible")
await page.wait_for_selector("#loading-spinner", state="hidden")
\`\`\`
Wait for the target element to appear, OR wait for a loading indicator to disappear—both are reliable signals.

**3. Custom condition waits**
\`\`\`python
await page.wait_for_function("() => document.querySelectorAll('.item').length > 0")
\`\`\`
For complex conditions that don't map to a single element.

Playwright's built-in actions (click, fill, etc.) auto-wait for the target element to be actionable—visible, not disabled, not animating. But navigation and data loading still require explicit waits.

For agents, the most reliable pattern is: navigate → wait for networkidle → take DOM snapshot → plan action → wait for target element → execute → wait for state change → verify.`,
        analogy: "Waiting for page state is like waiting for your food to arrive before eating. You don't sit down and immediately start chewing—you wait until the plate is in front of you. Fixed sleeps are like always waiting exactly 10 minutes, regardless of when the food arrives.",
        gotchas: [
          "networkidle can be too conservative on apps that poll—use a specific element wait instead",
          "Some pages never reach networkidle if they have persistent WebSocket connections",
          "Animations can trigger 'not stable' errors—increase page.set_default_timeout() or wait for animation to complete",
          "Always set a maximum timeout to prevent infinite hangs in production agents"
        ]
      },
      {
        title: "Multi-Step Workflow Automation",
        description: `The real power of browser agents is completing workflows that span multiple pages, forms, and decisions—tasks that would take a human several minutes of careful navigation. Think: compare prices across three e-commerce sites, extract a table from a PDF report, or fill in a government form that spans eight pages.

**Workflow design principles:**

**State tracking**: Maintain a workflow state object that records what has been accomplished, what inputs were used, and what outputs were collected. This enables resumption after failures.

\`\`\`python
state = {
    "step": "search",
    "query": "ergonomic chair under $500",
    "results": [],
    "selected": None
}
\`\`\`

**Step verification**: After each step, assert that the expected outcome occurred. Don't proceed from "filled shipping address" to "click Place Order" without verifying the address actually appears on the confirmation page.

**Idempotency where possible**: Design steps to be safely re-runnable. "Navigate to checkout" is idempotent. "Click Place Order" is not—guard it with a confirmation check.

**Parallel execution**: For workflows that involve the same task on multiple pages (comparing products, checking multiple accounts), use multiple browser contexts in parallel:
\`\`\`python
contexts = [browser.new_context() for _ in range(3)]
results = await asyncio.gather(*[scrape_site(ctx, url) for ctx, url in zip(contexts, urls)])
\`\`\`

**Checkpointing**: For long workflows, periodically save state to disk. If the agent crashes, it can resume from the last checkpoint rather than starting over.`,
        analogy: "Multi-step browser automation is like following a recipe. Each step builds on the last, ingredients must be ready before you need them, and you verify the dish looks right before serving. A good recipe also tells you what to do if something goes wrong.",
        gotchas: [
          "Browser sessions expire—re-authenticate if a workflow takes longer than the session timeout",
          "Pages change between runs—don't hard-code element positions from a one-time recording",
          "Rate limiting: aggressive automation can get your IP blocked—add random delays between actions",
          "Form validation errors are silent failures—always check for error messages after submitting"
        ]
      },
      {
        title: "Error Recovery and Human-in-the-Loop",
        description: `Browser agents fail in interesting ways. A CAPTCHA appears. The site returns a 503. An unexpected modal blocks the intended click. A form field has validation that the agent didn't anticipate. How the agent handles failure is as important as how it handles success.

**Error classification:**
- **Transient errors** (network timeout, temporary 503): retry with exponential backoff
- **Recoverable errors** (unexpected modal, wrong page): add a handler, dismiss the modal, re-navigate
- **Blockers** (CAPTCHA, mandatory login, session expiry): escalate to human
- **Logic errors** (agent misunderstood the task): log, report, stop

**CAPTCHA handling**: Modern CAPTCHAs (reCAPTCHA v3, hCaptcha) are specifically designed to detect automated browsers. For legitimate automation use cases, services like 2captcha or Anti-Captcha provide human-solved CAPTCHAs via API. For many enterprise workflows, solving this means negotiating with the site owner for an API key or whitelisted IP range.

**Human-in-the-Loop (HiTL) integration:**
Before irreversible actions, surface a confirmation UI. The agent pauses, shows the user what it's about to do (take a screenshot, list the planned action), and waits for approval:

\`\`\`python
if action.is_irreversible:
    screenshot = await page.screenshot()
    approved = await hitl_confirm(
        screenshot=screenshot,
        action=str(action),
        timeout=300  # 5 minute window
    )
    if not approved:
        return ActionResult(status="cancelled")
\`\`\`

HiTL turns an autonomous agent into a supervised one for the moments that matter most.`,
        analogy: "Error recovery in browser agents is like a pilot's emergency procedures. Most flights are uneventful (happy path). When something goes wrong, you work through a checklist: is this transient? Can I handle it? Do I need to divert? Do I declare an emergency? The procedure is pre-planned, not improvised.",
        gotchas: [
          "Agents that retry too aggressively can trigger rate limits or account locks",
          "Screenshot the page on every unexpected error—it's the best debugging artifact",
          "HiTL adds latency—design workflows so humans are only needed for genuinely ambiguous or risky steps",
          "Keep a full action log—when agents fail in production, you need to replay exactly what happened"
        ]
      },
      {
        title: "The browser-use Library: AGI Inc's Agent Framework",
        description: `The browser-use library (from AGI Inc) packages the browser automation agent pattern into a simple API. You bring an LLM and a task; browser-use handles the action loop.

**Core architecture:**
- **Browser**: wraps Playwright with agent-friendly utilities (compressed DOM extraction, screenshot management, action history)
- **Agent**: the reasoning loop—takes the current page state, the task, and action history; asks the LLM what to do next; executes the action
- **Controller**: maps LLM output to Playwright actions (click, fill, scroll, navigate, extract_content, done)

**Minimal usage:**
\`\`\`python
from browser_use import Agent
from langchain_openai import ChatOpenAI

agent = Agent(
    task="Find the price of the MacBook Pro M4 on apple.com",
    llm=ChatOpenAI(model="gpt-4o"),
)
result = await agent.run()
print(result.final_result())
\`\`\`

**What browser-use handles automatically:**
- DOM extraction: converts the live DOM into a compact, LLM-readable format (removes scripts, styles, irrelevant attributes)
- Action history: maintains a window of recent actions so the LLM has context
- Screenshot capture: takes screenshots when the LLM requests visual grounding
- Error handling: basic retry logic and error reporting
- Multi-tab: agents can open, switch between, and close tabs

**What you still need to handle:**
- Authentication (log in before handing off to the agent)
- Domain-specific error handling (site-specific modals, CAPTCHAs)
- Output parsing (structuring the agent's extracted data into a useful format)
- Rate limiting and politeness delays`,
        analogy: "browser-use is like a trained employee who knows how to use a browser. You tell them the goal ('find the cheapest flight to Paris next weekend'); they figure out the steps. You don't need to specify every click—but you do need to make sure they're logged in and know what to do if something unusual happens.",
        gotchas: [
          "browser-use's DOM extraction may strip content that's important for your use case—inspect the extracted DOM",
          "The LLM makes decisions per-action—complex workflows can use many tokens; set max_steps",
          "browser-use works best with capable models (GPT-4o, Claude 3.5+); weaker models lose track of goal",
          "Always run in headless=False during development to see what the agent is actually doing"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Playwright Basics: Navigate, Click, Fill, Extract",
        language: "python",
        category: "basic",
        explanation: "Core Playwright operations every browser agent uses: navigation, waiting, element interaction, and data extraction.",
        code: `"""Playwright Browser Automation Basics

Covers the core operations:
- Navigate to a page and wait for it to load
- Find elements using ARIA roles and CSS selectors
- Fill inputs and click buttons
- Extract text and attributes from elements
- Take screenshots
"""

from playwright.async_api import async_playwright
import asyncio

async def demo_basics():
    async with async_playwright() as p:
        # Launch a browser (headless=False to watch)
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()

        # ── 1. Navigation ────────────────────────────────────
        await page.goto("https://example.com")
        # Wait until no network requests for 500ms
        await page.wait_for_load_state("networkidle")
        print(f"Title: {await page.title()}")

        # ── 2. ARIA-based element selection (most stable) ────
        # Get by role + accessible name
        # heading = await page.get_by_role("heading", name="Example Domain")
        # print(await heading.inner_text())

        # ── 3. CSS selector ──────────────────────────────────
        heading = await page.query_selector("h1")
        if heading:
            print(f"H1: {await heading.inner_text()}")

        # ── 4. Filling a form ────────────────────────────────
        # (Using httpbin for a safe demo form)
        await page.goto("https://httpbin.org/forms/post")
        await page.wait_for_load_state("load")

        # Fill by label text
        custname = await page.query_selector('input[name="custname"]')
        if custname:
            await custname.fill("Test User")

        # Fill by aria-label or placeholder
        comments = await page.query_selector('textarea[name="comments"]')
        if comments:
            await comments.fill("Automated test comment")

        # Click a radio button
        radio = await page.query_selector('input[value="medium"]')
        if radio:
            await radio.click()

        print("Form filled successfully")

        # ── 5. Screenshot ────────────────────────────────────
        await page.screenshot(path="page_state.png")
        print("Screenshot saved to page_state.png")

        # ── 6. Extract multiple elements ─────────────────────
        await page.goto("https://news.ycombinator.com")
        await page.wait_for_load_state("networkidle")

        stories = await page.query_selector_all(".athing .titleline a")
        top_5 = []
        for story in stories[:5]:
            top_5.append({
                "title": await story.inner_text(),
                "url": await story.get_attribute("href")
            })

        print("\\nTop 5 HN stories:")
        for s in top_5:
            print(f"  - {s['title']}")

        await browser.close()

asyncio.run(demo_basics())`
      },
      {
        title: "Multi-Step Workflow with State Tracking",
        language: "python",
        category: "intermediate",
        explanation: "A complete multi-step automation workflow with state tracking, error handling, and verification after each step.",
        code: `"""Multi-Step Browser Workflow with State Tracking

Demonstrates:
- Workflow state management
- Step-by-step verification
- Error classification and retry
- Structured output extraction
"""

from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeout
from dataclasses import dataclass, field
from typing import Optional
import asyncio
import json
import time

@dataclass
class WorkflowState:
    step: str = "start"
    query: str = ""
    results: list = field(default_factory=list)
    error: Optional[str] = None
    retries: int = 0
    started_at: float = field(default_factory=time.time)

async def wait_and_verify(page: Page, selector: str, timeout: int = 10000) -> bool:
    """Wait for an element and return True if found, False if not."""
    try:
        await page.wait_for_selector(selector, timeout=timeout)
        return True
    except PlaywrightTimeout:
        return False

async def search_github_repos(query: str) -> list[dict]:
    """Search GitHub repos and extract structured results."""
    state = WorkflowState(query=query)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()
        page.set_default_timeout(15000)

        try:
            # ── Step 1: Navigate to GitHub search ───────────
            state.step = "navigate"
            await page.goto(f"https://github.com/search?q={query}&type=repositories&s=stars")
            await page.wait_for_load_state("networkidle")

            # Verify we're on the right page
            if not await wait_and_verify(page, '[data-testid="results-list"], .repo-list'):
                # Take screenshot for debugging
                await page.screenshot(path=f"debug_step1.png")
                raise RuntimeError("Search results did not load")

            state.step = "extract_results"

            # ── Step 2: Extract repository cards ────────────
            repo_items = await page.query_selector_all(
                '[data-testid="results-list"] > div, .repo-list-item'
            )

            print(f"Found {len(repo_items)} results")

            for item in repo_items[:10]:
                try:
                    # Name
                    name_el = await item.query_selector('a[href*="/"] h3, .v-align-middle')
                    name = await name_el.inner_text() if name_el else "unknown"

                    # Stars
                    stars_el = await item.query_selector(
                        '[aria-label*="star"], .repo-stars-counter-uniq'
                    )
                    stars = await stars_el.inner_text() if stars_el else "0"

                    # Description
                    desc_el = await item.query_selector('p.color-fg-muted, .mb-1')
                    desc = await desc_el.inner_text() if desc_el else ""

                    state.results.append({
                        "name": name.strip(),
                        "stars": stars.strip(),
                        "description": desc.strip()[:120]
                    })

                except Exception as e:
                    # Log but continue with next item
                    print(f"  Skipped one result: {e}")

            # ── Step 3: Verify extraction succeeded ─────────
            state.step = "verify"
            if len(state.results) == 0:
                raise RuntimeError("Extraction produced no results")

            state.step = "done"
            print(f"\\nWorkflow complete: {len(state.results)} repos extracted")
            return state.results

        except PlaywrightTimeout as e:
            state.error = f"Timeout at step '{state.step}': {e}"
            print(f"ERROR: {state.error}")
            await page.screenshot(path=f"error_{state.step}.png")
            return []

        except Exception as e:
            state.error = f"Error at step '{state.step}': {e}"
            print(f"ERROR: {state.error}")
            return []

        finally:
            elapsed = round(time.time() - state.started_at, 2)
            print(f"Elapsed: {elapsed}s | Steps reached: {state.step}")
            await browser.close()


async def main():
    results = await search_github_repos("browser+agent+playwright")
    print(json.dumps(results[:3], indent=2))

asyncio.run(main())`
      },
      {
        title: "Browser Agent with browser-use and GPT-4o",
        language: "python",
        category: "advanced",
        explanation: "Use the browser-use library to let an LLM autonomously navigate and complete a task. The agent decides what to click and fill based on the current page state.",
        code: `"""Browser Agent with browser-use

Demonstrates the AGI Inc browser-use library:
- Autonomous task execution with GPT-4o
- Agent reasoning over DOM state
- Multi-step goal completion
- Result extraction

Install: pip install browser-use langchain-openai
"""

import asyncio
import os
from browser_use import Agent, Browser, BrowserConfig
from browser_use.browser.context import BrowserContextConfig
from langchain_openai import ChatOpenAI


# ── Configuration ────────────────────────────────────────────
TASK = """
Go to news.ycombinator.com and find the top 3 posts
that mention 'AI' or 'LLM' in their title today.
For each one, extract:
1. The post title
2. The number of points
3. The URL

Return the results as a JSON list.
"""


async def run_browser_agent():
    # Configure the browser
    browser = Browser(
        config=BrowserConfig(
            headless=True,
            # chrome_instance_path="/Applications/Google Chrome.app/...",
        )
    )

    # Use GPT-4o as the reasoning model
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=os.environ["OPENAI_API_KEY"],
        temperature=0,  # Deterministic for automation
    )

    # Create the agent
    agent = Agent(
        task=TASK,
        llm=llm,
        browser=browser,
        # Context config: persist cookies, set viewport
        browser_context_config=BrowserContextConfig(
            viewport_expansion=500,  # Expand viewport for more DOM context
        ),
        max_actions_per_step=5,   # Actions per LLM call
        max_failures=3,            # Stop after 3 consecutive failures
        use_vision=True,           # Enable screenshot fallback
    )

    print("Starting browser agent...")
    print(f"Task: {TASK.strip()}\\n")

    # Run the agent
    history = await agent.run(max_steps=15)

    # Inspect results
    final_result = history.final_result()
    print("\\n─── Agent Result ───────────────────────────────")
    print(final_result)

    # Agent action history for debugging
    print("\\n─── Action History ─────────────────────────────")
    for i, action in enumerate(history.model_actions()):
        print(f"  Step {i+1}: {action}")

    print(f"\\nTotal actions: {len(history.model_actions())}")
    print(f"Success: {history.is_done()}")

    await browser.close()
    return final_result


# ── Variant: Custom Agent with Pre-Authentication ────────────
async def run_authenticated_agent():
    """Run an agent that needs to be logged in first."""

    browser = Browser(config=BrowserConfig(headless=False))
    context = await browser.new_context()
    page = await context.get_current_page()

    # ── Manual auth step (before handing off to agent) ──────
    await page.goto("https://example.com/login")
    await page.fill('input[name="email"]', os.environ["SITE_EMAIL"])
    await page.fill('input[name="password"]', os.environ["SITE_PASSWORD"])
    await page.click('button[type="submit"]')
    await page.wait_for_load_state("networkidle")
    print("Authenticated successfully")

    # ── Now run the agent with the authenticated session ─────
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    agent = Agent(
        task="Download my last 3 invoices and extract the total amounts",
        llm=llm,
        browser=browser,
        browser_context=context,  # Reuse authenticated context
    )

    result = await agent.run(max_steps=20)
    await browser.close()
    return result


if __name__ == "__main__":
    asyncio.run(run_browser_agent())`
      },
      {
        title: "Visual Grounding with Screenshots",
        language: "python",
        category: "intermediate",
        explanation: "When DOM selectors fail, use a multimodal LLM to identify elements from a screenshot and click at the returned coordinates.",
        code: `"""Visual Grounding: Click What You See

When the DOM doesn't expose what you need,
use a multimodal model to find it visually.

Demonstrates:
- Screenshot capture
- Multimodal LLM coordinate extraction
- Coordinate scaling for high-DPI displays
- DOM verification after visual click
"""

from playwright.async_api import async_playwright, Page
from openai import AsyncOpenAI
import asyncio
import base64
import re
import os

client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])


async def screenshot_to_base64(page: Page) -> tuple[str, int, int]:
    """Capture screenshot and return base64 + dimensions."""
    screenshot_bytes = await page.screenshot(type="png")
    b64 = base64.b64encode(screenshot_bytes).decode("utf-8")
    viewport = page.viewport_size or {"width": 1280, "height": 720}
    return b64, viewport["width"], viewport["height"]


async def find_element_visually(
    page: Page,
    description: str
) -> tuple[int, int] | None:
    """
    Use GPT-4o to locate an element by description.
    Returns (x, y) pixel coordinates, or None if not found.
    """
    b64, width, height = await screenshot_to_base64(page)

    prompt = f"""You are looking at a web page screenshot ({width}x{height} pixels).

Find the element that best matches this description: "{description}"

Return ONLY a JSON object with the center coordinates:
{{"x": <0 to {width}>, "y": <0 to {height}>, "found": true}}

If the element is not visible, return:
{{"found": false}}

Do not include any other text."""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{b64}",
                            "detail": "high"
                        }
                    }
                ]
            }
        ],
        max_tokens=100,
        temperature=0,
    )

    text = response.choices[0].message.content or ""

    # Extract JSON from response
    match = re.search(r'\\{[^}]+\\}', text)
    if not match:
        return None

    import json
    data = json.loads(match.group())
    if not data.get("found"):
        return None

    return int(data["x"]), int(data["y"])


async def click_element_with_fallback(
    page: Page,
    selector: str,
    visual_description: str
) -> bool:
    """
    Try DOM selector first, fall back to visual grounding.
    Returns True if click succeeded.
    """
    # ── Attempt 1: DOM selector ──────────────────────────────
    try:
        element = await page.wait_for_selector(selector, timeout=3000)
        if element:
            await element.click()
            print(f"Clicked via DOM selector: {selector}")
            return True
    except Exception:
        pass

    # ── Attempt 2: Visual grounding ──────────────────────────
    print(f"DOM selector failed, trying visual grounding: '{visual_description}'")
    coords = await find_element_visually(page, visual_description)

    if coords:
        x, y = coords
        print(f"Visual grounding found element at ({x}, {y})")
        await page.mouse.click(x, y)

        # Brief wait for any click response
        await page.wait_for_timeout(500)
        return True

    print(f"Element not found: '{visual_description}'")
    return False


async def demo_visual_grounding():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("https://example.com")
        await page.wait_for_load_state("networkidle")

        # Try clicking a link that might or might not have a clean selector
        success = await click_element_with_fallback(
            page=page,
            selector='a[href="https://www.iana.org/domains/reserved"]',
            visual_description="the 'More information' link at the bottom of the page"
        )

        if success:
            await page.wait_for_load_state("networkidle")
            print(f"Now at: {page.url}")

        await browser.close()


asyncio.run(demo_visual_grounding())`
      }
    ],

    diagrams: [
      {
        title: "Browser Agent Architecture",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph User["User / Orchestrator"]
        TASK["Task Description"]
        RESULT["Structured Result"]
    end

    subgraph Agent["Browser Agent (browser-use)"]
        REASON["LLM Reasoning\n(GPT-4o / Claude)"]
        DOM_PARSE["DOM Extractor\n(ARIA tree)"]
        VIS["Visual Grounding\n(screenshot + LLM)"]
        HISTORY["Action History"]
    end

    subgraph Playwright["Playwright Layer"]
        ACTIONS["Actions\n(click/fill/navigate)"]
        WAIT["Wait Conditions\n(networkidle/selector)"]
        INTERCEPT["Network\nInterception"]
    end

    subgraph Browser["Real Browser (Chromium)"]
        PAGE["Live Page"]
        DOM["DOM Tree"]
        SCREEN["Rendered UI"]
    end

    TASK --> REASON
    REASON -->|"next action"| ACTIONS
    ACTIONS --> PAGE
    PAGE --> DOM --> DOM_PARSE --> REASON
    PAGE --> SCREEN --> VIS --> REASON
    HISTORY --> REASON
    ACTIONS --> WAIT --> PAGE
    RESULT -.->|"extracted data"| REASON`,
        caption: "The agent reasons over a compressed DOM view and screenshots, issues Playwright actions, and loops until the goal is achieved."
      },
      {
        title: "Element Selection Strategy",
        type: "mermaid",
        mermaid: `flowchart TD
    START["Need to select element"] --> ARIA
    ARIA{"ARIA role +\nlabel available?"}
    ARIA -->|Yes| USE_ARIA["get_by_role('button', name='...')"]
    ARIA -->|No| TESTID

    TESTID{"data-testid\nattribute?"}
    TESTID -->|Yes| USE_TESTID["get_by_test_id('...')"]
    TESTID -->|No| TEXT

    TEXT{"Unique visible\ntext?"}
    TEXT -->|Yes| USE_TEXT["get_by_text('...') or get_by_label('...')"]
    TEXT -->|No| CSS

    CSS{"Stable CSS\nselector?"}
    CSS -->|"ID selector"| USE_CSS["locator('#element-id')"]
    CSS -->|No| VISUAL

    VISUAL["Visual Grounding\n(screenshot + LLM coords)"]

    USE_ARIA --> VERIFY["Verify click succeeded"]
    USE_TESTID --> VERIFY
    USE_TEXT --> VERIFY
    USE_CSS --> VERIFY
    VISUAL --> VERIFY`,
        caption: "Always prefer the most semantically stable selector. Visual grounding is the last resort."
      },
      {
        title: "Multi-Step Workflow State Machine",
        type: "mermaid",
        mermaid: `stateDiagram-v2
    [*] --> Navigating: Start workflow

    Navigating --> Waiting: page.goto() called
    Waiting --> Observing: networkidle / selector ready

    Observing --> Planning: DOM snapshot captured
    Planning --> Acting: LLM chose action

    Acting --> Verifying: Action executed
    Verifying --> Observing: Outcome confirmed
    Verifying --> Retrying: Unexpected state

    Retrying --> Acting: Transient error
    Retrying --> HumanCheckpoint: Max retries exceeded

    HumanCheckpoint --> Acting: Human approves
    HumanCheckpoint --> [*]: Human cancels

    Observing --> [*]: Goal achieved`,
        caption: "Browser automation workflows cycle through observe-plan-act-verify until the goal is reached or human intervention is needed."
      }
    ],

    faq: [
      {
        question: "When should I use browser automation vs. a direct API?",
        answer: "Always prefer a direct API when one exists—it's faster, more reliable, and less likely to break. Use browser automation for: legacy systems with no API, SaaS tools that don't expose an API for your use case, filling out forms on government or institutional sites, or any workflow that genuinely requires a browser UI. If you're scraping data from a site that has a public API, use the API."
      },
      {
        question: "How do I handle login and session management?",
        answer: "Authenticate manually before handing off to the agent, then reuse the browser context (which has the session cookies). You can also save browser storage state with context.storage_state(path='auth.json') and load it in future sessions with browser.new_context(storage_state='auth.json'). This avoids re-logging in on every run."
      },
      {
        question: "Is browser automation legal / ethical?",
        answer: "It depends on what you're doing and whose site you're accessing. Check the site's Terms of Service and robots.txt. Automation for personal productivity (your own accounts) is generally fine. Scraping data that the site explicitly forbids, bypassing paywalls, or automating actions that harm others is not. For enterprise workflows on internal systems, you typically have full permission. When in doubt, ask the site owner for API access."
      },
      {
        question: "How do I handle CAPTCHAs?",
        answer: "For legitimate use cases: (1) negotiate with the site owner for API access or an allowlisted IP, (2) use CAPTCHA-solving services like 2captcha or Anti-Captcha for human-in-the-loop solving, or (3) use browser fingerprinting tools (Playwright stealth) to avoid triggering CAPTCHAs in the first place. Many modern CAPTCHAs (reCAPTCHA v3) are invisible—they score your browser's behavior, not your puzzle-solving."
      },
      {
        question: "How do I make browser agents faster?",
        answer: "Run multiple browser contexts in parallel for independent tasks. Use request interception to block images, fonts, and analytics scripts that don't affect the automation. Run headless. Use browser.new_context() to reuse an authenticated session instead of logging in each time. Profile your waits—networkidle is conservative; use element-level waits when possible."
      },
      {
        question: "What's the difference between browser-use and other agent frameworks that support browsers?",
        answer: "browser-use is purpose-built for browser automation—its DOM extraction, action space, and prompting are all optimized for web page interaction. General agent frameworks like LangChain or CrewAI can use Playwright tools, but you'd need to build the DOM extraction and action loop yourself. browser-use gives you a production-ready loop out of the box. The tradeoff is less flexibility in the orchestration layer."
      }
    ],

    applications: [
      {
        title: "Automated Data Collection from Web Portals",
        description: "Enterprise portals (government data, financial filings, healthcare records) often have no API. A browser agent can log in, navigate paginated results, extract structured data, and export it to a database—running nightly to keep data fresh. What would take hours of manual copying runs in minutes."
      },
      {
        title: "RPA (Robotic Process Automation) with AI",
        description: "Traditional RPA bots break when UI layouts change because they rely on pixel-perfect coordinates. Browser agents using ARIA selectors and visual grounding are resilient to redesigns. Replace brittle UiPath/Automation Anywhere scripts with Playwright-based agents that understand the semantic UI."
      },
      {
        title: "Autonomous Research Assistant",
        description: "An agent given a research question can navigate search engines, open relevant articles, extract key findings, cross-reference sources, and compile a structured summary—following citation trails and looking up referenced studies. The browsing is autonomous; the researcher reviews the final synthesis."
      },
      {
        title: "E-Commerce Price Monitoring",
        description: "Track competitor prices across multiple e-commerce sites that don't offer price APIs. A browser agent visits product pages, handles authentication on trade portals, extracts current prices, and writes them to a time-series database. Alerts fire when prices cross thresholds."
      },
      {
        title: "Form Automation for Compliance Workflows",
        description: "Regulatory filings, vendor onboarding forms, and permit applications often live in ancient web portals. A browser agent can ingest structured data from an internal system and fill out the corresponding web forms—reducing manual data entry and transcription errors in compliance-heavy industries."
      }
    ],

    keyTakeaways: [
      "Playwright is the foundation: async, cross-browser, auto-waiting, network interception, and tracing out of the box",
      "Prefer ARIA roles/labels for element selection—they're semantic, stable, and LLM-friendly",
      "Use visual grounding (screenshot + multimodal LLM) as a fallback for canvas, PDF, and poorly labeled UIs",
      "Wait for DOM conditions (networkidle, wait_for_selector), never fixed sleep() calls",
      "Track workflow state explicitly; verify each step's outcome before proceeding to the next",
      "Insert human-in-the-loop checkpoints before irreversible actions (purchases, deletions, form submissions)",
      "browser-use packages the agent loop: DOM extraction, action planning, and screenshot fallback in one library",
      "Browser automation bridges AI to any legacy system—if a human can do it in a browser, an agent can too"
    ],

    resources: [
      {
        title: "Playwright Python Documentation",
        url: "https://playwright.dev/python/docs/intro",
        type: "docs",
        description: "Official async Python API reference—essential reading for browser agent development",
        summaryPath: "data/day-23/summary-playwright-docs.md"
      },
      {
        title: "browser-use GitHub Repository",
        url: "https://github.com/browser-use/browser-use",
        type: "github",
        description: "AGI Inc's browser agent library: connect any LLM to a Playwright-controlled browser",
        summaryPath: "data/day-23/summary-browser-use.md"
      },
      {
        title: "Playwright Selectors & Locators Guide",
        url: "https://playwright.dev/python/docs/locators",
        type: "docs",
        description: "Deep dive on Playwright's locator API—ARIA, text, test IDs, CSS, XPath",
        summaryPath: "data/day-23/summary-playwright-locators.md"
      },
      {
        title: "Computer Use in Practice - Anthropic",
        url: "https://www.anthropic.com/news/developing-computer-use",
        type: "article",
        description: "Anthropic's overview of building agents that control a desktop browser with Claude",
        summaryPath: "data/day-23/summary-computer-use.md"
      },
      {
        title: "Playwright Network Interception",
        url: "https://playwright.dev/python/docs/network",
        type: "docs",
        description: "How to intercept, mock, and block network requests—critical for fast and reliable automation",
        summaryPath: "data/day-23/summary-playwright-network.md"
      },
      {
        title: "Web Agents Survey Paper",
        url: "https://arxiv.org/abs/2307.12856",
        type: "paper",
        description: "Academic survey of web navigation agents: benchmarks, architectures, and open challenges",
        summaryPath: "data/day-23/summary-web-agents-survey.md"
      }
    ],

    relatedDays: [19, 20, 24]
  }
};
