# Playwright Selectors & Locators Guide Summary

**Source**: [playwright.dev/python/docs/locators](https://playwright.dev/python/docs/locators)

## Overview

Playwright's Locator API is the recommended way to find and interact with elements. Unlike raw selectors, Locators are "lazy" — they re-query the DOM on every action, making them resilient to dynamic page updates. This guide covers the full selection strategy from most to least robust.

## Recommended Locators (Most to Least Stable)

### 1. `get_by_role()` — Most Stable

Uses WAI-ARIA roles and accessible names. Survives visual redesigns.

```python
# Buttons
await page.get_by_role("button", name="Submit").click()
await page.get_by_role("button", name="Add to cart").click()

# Links
await page.get_by_role("link", name="Sign in").click()

# Form elements
await page.get_by_role("textbox", name="Email").fill("user@example.com")
await page.get_by_role("checkbox", name="Remember me").check()

# Headings
heading = await page.get_by_role("heading", name="Product Details")

# Available roles: button, link, checkbox, radio, textbox, combobox,
# listbox, option, menuitem, tab, dialog, heading, img, table, etc.
```

### 2. `get_by_label()` — Form Fields

Finds inputs associated with a `<label>` element.

```python
await page.get_by_label("Password").fill("secret")
await page.get_by_label("Country").select_option("US")
```

### 3. `get_by_placeholder()` — Input Fields

```python
await page.get_by_placeholder("Search products...").fill("laptop")
```

### 4. `get_by_text()` — Visible Text

```python
await page.get_by_text("Welcome back").is_visible()
# Exact match:
await page.get_by_text("Sign in", exact=True).click()
```

### 5. `get_by_alt_text()` — Images

```python
await page.get_by_alt_text("Company logo").click()
```

### 6. `get_by_test_id()` — Test IDs

Requires `data-testid` attributes (or custom attribute via `test_id_attribute` config).

```python
await page.get_by_test_id("checkout-button").click()
await page.get_by_test_id("product-grid").query_selector_all(".item")
```

### 7. `locator()` with CSS / XPath — Fallback

```python
# CSS by ID (stable)
await page.locator("#submit-btn").click()

# CSS by class (fragile — classes change)
await page.locator(".checkout-primary-btn").click()

# CSS attribute selector (more stable)
await page.locator("button[data-action='submit']").click()

# XPath (last resort)
await page.locator("//div[@role='dialog']//button[last()]").click()
```

## Locator Chaining and Filtering

```python
# Chain locators to narrow scope
dialog = page.get_by_role("dialog")
await dialog.get_by_role("button", name="Confirm").click()

# Filter by text
product_list = page.locator(".product-card")
laptop = product_list.filter(has_text="MacBook Pro")
await laptop.get_by_role("button", name="Add to cart").click()

# Filter by child element
rows = page.locator("tr").filter(has=page.locator("td.status", has_text="Active"))
```

## Lists and Multiple Elements

```python
# Count elements
count = await page.locator(".result-item").count()

# Iterate
items = page.locator(".product-card")
for i in range(await items.count()):
    title = await items.nth(i).get_by_role("heading").inner_text()
    print(title)

# First / Last
await page.locator(".item").first.click()
await page.locator(".item").last.click()
await page.locator(".item").nth(2).click()
```

## Frame Locators (iFrames)

```python
# Enter an iframe
frame = page.frame_locator("iframe[name='checkout']")
await frame.get_by_role("button", name="Pay now").click()

# Nested iframes
nested = page.frame_locator("#outer-frame").frame_locator("#inner-frame")
```

## Shadow DOM

```python
# Pierce through shadow roots
await page.locator("pierce/custom-element >> .inner-button").click()
```

## Assertions with Locators

```python
from playwright.async_api import expect

# Element state
await expect(page.get_by_role("button", name="Submit")).to_be_enabled()
await expect(page.get_by_role("dialog")).to_be_visible()
await expect(page.locator(".error-msg")).to_be_hidden()

# Text content
await expect(page.locator(".price")).to_have_text("$99.99")
await expect(page.locator("h1")).to_contain_text("Dashboard")

# Attribute
await expect(page.locator("input")).to_have_value("expected@email.com")
await expect(page.get_by_role("button")).to_have_attribute("disabled", "")

# Count
await expect(page.locator(".result")).to_have_count(10)
```

## Strict Mode

By default, if a locator matches multiple elements and you call a single-element action (`.click()`), Playwright throws an error. This catches ambiguous selectors early.

```python
# This throws if multiple elements match
await page.get_by_role("button", name="OK").click()  # Error if 2 "OK" buttons

# Use .first / .nth / .filter to resolve ambiguity
await page.get_by_role("button", name="OK").first.click()
```

## Best Practices for Agent Development

1. **Build a selector priority list** in your agent's prompt: prefer ARIA → label → text → CSS → XPath
2. **Log the locator used** for each action — it makes debugging much easier
3. **Never use auto-generated CSS** (`.className_abc123`): these change on every build
4. **Use `filter(has_text=...)` over nth()**: "the row containing 'John'" is more robust than "the 3rd row"
5. **Locators are lazy** — safe to define upfront and act on later
