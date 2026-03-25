# Playwright Python Documentation Summary

**Source**: [playwright.dev/python/docs/intro](https://playwright.dev/python/docs/intro)

## Overview

Playwright is a Microsoft-developed browser automation library that provides a high-level async Python API for controlling Chromium, Firefox, and WebKit browsers. Originally built for end-to-end testing, it has become the go-to foundation for browser automation agents thanks to its auto-waiting, cross-browser support, and rich feature set.

## Installation

```bash
pip install playwright
playwright install  # Downloads browser binaries
```

## Core Concepts

### Browser, Context, and Page

```python
async with async_playwright() as p:
    browser = await p.chromium.launch(headless=True)
    context = await browser.new_context(
        viewport={"width": 1280, "height": 720},
        storage_state="auth.json"  # Load saved session
    )
    page = await context.new_page()
```

- **Browser**: The browser process (Chromium, Firefox, WebKit)
- **Context**: An isolated session with its own cookies, localStorage, and cache — like an incognito window
- **Page**: A single browser tab; most operations happen on the page

### Navigation

```python
await page.goto("https://example.com")
await page.wait_for_load_state("networkidle")  # Wait until quiet
await page.go_back()
await page.reload()
```

### Auto-Waiting

Playwright automatically waits for elements to be **visible**, **stable** (not animating), and **enabled** before acting. No manual sleep() calls needed for most interactions.

## Locators (Element Selection)

```python
# By ARIA role + name (most stable)
await page.get_by_role("button", name="Submit").click()

# By label text
await page.get_by_label("Email").fill("user@example.com")

# By placeholder
await page.get_by_placeholder("Search...").fill("query")

# By visible text
await page.get_by_text("Sign in").click()

# By test ID
await page.get_by_test_id("checkout-btn").click()

# CSS selector
await page.locator("#submit-btn").click()

# XPath (last resort)
await page.locator("//button[@type='submit']").click()
```

## Actions

```python
await page.click(".button")          # Click
await page.fill("input", "text")     # Clear and fill
await page.type("input", "text")     # Type character by character
await page.press("input", "Enter")   # Key press
await page.select_option("select", "value")
await page.check("input[type=checkbox]")
await page.hover(".menu-item")
await page.drag_and_drop(".src", ".dst")
```

## Waiting Strategies

```python
# Wait for element
await page.wait_for_selector(".results", state="visible")
await page.wait_for_selector("#spinner", state="hidden")

# Wait for navigation
await page.wait_for_url("**/dashboard")

# Wait for network idle
await page.wait_for_load_state("networkidle")

# Custom condition
await page.wait_for_function("() => window.loaded === true")

# Wait for response
async with page.expect_response("**/api/data") as resp:
    await page.click("#load-data")
response = await resp.value
```

## Screenshots and Video

```python
await page.screenshot(path="screenshot.png")
await page.screenshot(path="full.png", full_page=True)
screenshot_bytes = await page.screenshot()  # Returns bytes

# Record video
context = await browser.new_context(
    record_video_dir="videos/"
)
```

## JavaScript Evaluation

```python
# Run JS in page context
result = await page.evaluate("() => document.title")
await page.evaluate("window.scrollTo(0, 500)")

# Expose Python function to JS
async def handle_js_call(data):
    print(f"JS called: {data}")

await page.expose_function("pythonFn", handle_js_call)
```

## Network Interception

```python
# Block images and CSS
await page.route("**/*.{png,jpg,css}", lambda route: route.abort())

# Mock API response
await page.route("**/api/users", lambda route: route.fulfill(
    status=200,
    content_type="application/json",
    body='[{"id": 1, "name": "Test"}]'
))
```

## Browser Contexts for Session Management

```python
# Save auth state
await context.storage_state(path="auth.json")

# Reuse in next run
context = await browser.new_context(storage_state="auth.json")
```

## Tracing

```python
await context.tracing.start(screenshots=True, snapshots=True)
# ... perform actions ...
await context.tracing.stop(path="trace.zip")
# View with: playwright show-trace trace.zip
```

## Key Strengths for Agent Development

- **Auto-waiting**: Eliminates timing issues without sleep()
- **Cross-browser**: Same code for Chromium, Firefox, WebKit
- **Async-native**: Non-blocking, works well with async agent loops
- **Rich waiting API**: Condition-based waits for any page state
- **Network interception**: Block irrelevant resources to speed up automation
- **Tracing**: Full replay of what the agent did for debugging
