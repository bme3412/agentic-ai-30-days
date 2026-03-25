# Playwright Network Interception Summary

**Source**: [playwright.dev/python/docs/network](https://playwright.dev/python/docs/network)

## Overview

Playwright's network layer lets you intercept, inspect, modify, block, and mock any HTTP request made by the browser. For browser agents, this is essential for: speeding up automation by blocking unnecessary resources, mocking API responses in tests, adding authentication headers, and monitoring what the agent fetches.

## Basic Route Interception

```python
# Block a request
await page.route("**/*.png", lambda route: route.abort())

# Fulfill with mock response
await page.route("**/api/users", lambda route: route.fulfill(
    status=200,
    content_type="application/json",
    body='[{"id": 1, "name": "Alice"}]'
))

# Modify and continue
async def modify_request(route):
    headers = {**route.request.headers, "Authorization": "Bearer my-token"}
    await route.continue_(headers=headers)

await page.route("**/api/**", modify_request)
```

## URL Pattern Matching

Playwright uses glob patterns:

```python
# Wildcard segment
await page.route("**/api/v*/users", handler)

# Multiple extensions
await page.route("**/*.{png,jpg,gif,webp}", lambda r: r.abort())

# Exact URL
await page.route("https://api.example.com/data", handler)

# Regex
import re
await page.route(re.compile(r"/api/v\d+/"), handler)
```

## Speeding Up Agents by Blocking Resources

One of the most impactful optimizations for browser agents: block images, fonts, stylesheets, and analytics that don't affect the automation.

```python
BLOCKED_RESOURCE_TYPES = {"image", "font", "stylesheet", "media"}
BLOCKED_DOMAINS = ["google-analytics.com", "doubleclick.net", "facebook.com"]

async def block_unnecessary(route):
    request = route.request
    if request.resource_type in BLOCKED_RESOURCE_TYPES:
        await route.abort()
        return
    if any(domain in request.url for domain in BLOCKED_DOMAINS):
        await route.abort()
        return
    await route.continue_()

await page.route("**/*", block_unnecessary)
# Typical speedup: 40-70% faster page loads
```

## Waiting for Specific Responses

```python
# Wait for a specific API call to complete
async with page.expect_response("**/api/search*") as resp_info:
    await page.fill("#search", "query")
    await page.click("#search-btn")

response = await resp_info.value
data = await response.json()
print(f"API returned {len(data['results'])} results")
```

```python
# Wait for multiple responses
async with page.expect_responses(
    lambda r: r.url.endswith("/api/data") and r.status == 200
) as resp_info:
    await page.click("#load")
responses = await resp_info.value
```

## Intercepting Responses

```python
async def log_api_calls(response):
    if "/api/" in response.url:
        body = await response.body()
        print(f"{response.status} {response.url} — {len(body)} bytes")

page.on("response", log_api_calls)
```

## Mocking APIs for Testing

```python
# Intercept API calls and return canned responses
test_data = {
    "user": {"id": 42, "name": "Test User", "plan": "enterprise"}
}

await page.route("**/api/me", lambda route: route.fulfill(
    status=200,
    content_type="application/json",
    body=json.dumps(test_data["user"])
))

# Now run the agent — it will see the mocked user
```

## Adding Auth Headers Automatically

```python
async def add_auth(route):
    await route.continue_(headers={
        **route.request.headers,
        "Authorization": f"Bearer {os.environ['API_TOKEN']}",
        "X-Agent-ID": "browser-agent-v1"
    })

await page.route("**/api/**", add_auth)
```

## Monitoring All Network Activity

```python
# Track all requests and responses
requests_log = []

def on_request(request):
    requests_log.append({
        "url": request.url,
        "method": request.method,
        "type": request.resource_type
    })

page.on("request", on_request)
page.on("requestfailed", lambda r: print(f"FAILED: {r.url} — {r.failure}"))

# After automation completes:
api_calls = [r for r in requests_log if r["type"] == "fetch"]
print(f"Agent made {len(api_calls)} API calls")
```

## HAR Recording

Capture all network traffic to a HAR file for analysis:

```python
await context.route_from_har("recording.har", update=True)
# Or record:
await context.record_har(path="recording.har", url_filter="**/api/**")
# ...perform actions...
await context.close()  # Saves HAR on close
```

## Practical Patterns for Browser Agents

### Pattern 1: Fast Agent Setup

```python
async def setup_fast_agent(browser):
    context = await browser.new_context()
    page = await context.new_page()

    # Block everything non-essential
    await page.route("**/*.{png,jpg,gif,webp,svg,ico}", lambda r: r.abort())
    await page.route("**/*.{woff,woff2,ttf,otf}", lambda r: r.abort())
    await page.route("**/analytics/**", lambda r: r.abort())
    await page.route("**/gtag/**", lambda r: r.abort())

    return page
```

### Pattern 2: Verify Data Was Submitted

```python
async with page.expect_response(lambda r: "/api/submit" in r.url) as resp_info:
    await page.click("#submit-btn")
response = await resp_info.value
assert response.status == 200, f"Submit failed: {response.status}"
```

### Pattern 3: Inject Auth Without Logging In

```python
# If you have a valid token but want to skip UI login
await context.add_cookies([{
    "name": "session_token",
    "value": os.environ["SESSION_TOKEN"],
    "domain": ".example.com",
    "path": "/"
}])
await page.goto("https://app.example.com/dashboard")
# Already logged in
```
