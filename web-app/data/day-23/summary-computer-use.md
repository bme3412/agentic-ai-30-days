# Developing Computer Use - Anthropic Summary

**Source**: [anthropic.com/news/developing-computer-use](https://www.anthropic.com/news/developing-computer-use)

## Overview

Anthropic's "computer use" capability gives Claude the ability to control a computer like a human would — moving a cursor, clicking buttons, typing text, and reading screen content through screenshots. This article documents how Anthropic built this capability into Claude 3.5 Sonnet and what it learned about the challenges and safety considerations.

## How Computer Use Works

Claude's computer use is built around a simple loop:

1. **Observe**: Take a screenshot of the current screen state
2. **Reason**: Claude analyzes the screenshot and determines what action to take next
3. **Act**: Execute the action (mouse_move, left_click, type, key, screenshot, etc.)
4. **Repeat** until the task is complete

Unlike DOM-based automation, computer use is entirely visual — Claude only sees screenshots, not the underlying HTML. This makes it universally applicable but inherently less precise than DOM-based approaches.

## Available Actions

| Action | Description |
|--------|-------------|
| `screenshot` | Capture the current screen state |
| `left_click(x, y)` | Click at coordinates |
| `right_click(x, y)` | Right-click at coordinates |
| `double_click(x, y)` | Double-click at coordinates |
| `left_click_drag(start, end)` | Click and drag |
| `type(text)` | Type a string |
| `key(key_combo)` | Press a key combination |
| `cursor_position` | Get current cursor position |
| `scroll(x, y, direction, clicks)` | Scroll |

## Implementation Example

```python
import anthropic
import base64

client = anthropic.Anthropic()

def take_screenshot():
    # Platform-specific screenshot capture
    import subprocess
    subprocess.run(["scrot", "/tmp/screen.png"])
    with open("/tmp/screen.png", "rb") as f:
        return base64.b64encode(f.read()).decode()

def run_computer_use_task(task: str):
    messages = []

    while True:
        # Add screenshot to messages
        screenshot = take_screenshot()
        messages.append({
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64",
                 "media_type": "image/png", "data": screenshot}},
                {"type": "text", "text": f"Task: {task}\nWhat should I do next?"}
            ]
        })

        response = client.beta.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            tools=[{"type": "computer_20241022", "name": "computer",
                    "display_width_px": 1920, "display_height_px": 1080}],
            messages=messages,
            betas=["computer-use-2024-10-22"]
        )

        # Execute returned tool calls
        for block in response.content:
            if block.type == "tool_use" and block.name == "computer":
                execute_action(block.input)

        if response.stop_reason == "end_turn":
            break
```

## Key Findings from Anthropic's Research

### What Works Well
- **General web browsing**: Navigating sites, filling forms, reading content
- **File management**: Creating, moving, organizing files via GUI
- **Cross-application workflows**: Tasks that span multiple apps
- **Legacy software**: Apps with no API but a working GUI

### Current Limitations
- **Slower than DOM automation**: Every action requires a screenshot API call
- **Coordinate precision**: Misclicks on small UI elements, especially at 1x DPI
- **Scrolling challenges**: Claude sometimes struggles with dynamic content below the fold
- **Latency**: A full computer use loop (screenshot → reason → act) takes 2-5 seconds per step

### Error Patterns
- Clicking in the wrong location due to coordinate drift
- Getting stuck in loops (clicking the same element repeatedly)
- Losing track of the original task when navigating away
- Hallucinating UI elements that aren't actually visible

## Safety Considerations

Anthropic classifies computer use as a high-risk capability requiring careful deployment:

**Prompt injection risk**: Malicious content on web pages could instruct Claude to take unintended actions. Claude is trained to be skeptical of instructions that appear in the environment rather than from the user.

**Irreversible actions**: Computer use can interact with any GUI — including clicking "Delete Account" or sending emails. Human confirmation gates are strongly recommended before destructive actions.

**Minimal footprint principle**: Claude is instructed to request only necessary permissions, avoid storing sensitive information beyond the immediate task, and prefer reversible actions.

**Sandboxed environments**: Anthropic recommends running computer use agents in isolated VMs with limited network access and no access to sensitive credentials.

## Comparison: Computer Use vs. Browser Automation

| Aspect | Computer Use (Visual) | Browser Automation (DOM) |
|--------|----------------------|--------------------------|
| Target | Any GUI application | Web pages only |
| Speed | Slow (screenshot per step) | Fast (direct DOM access) |
| Precision | Lower (pixel coordinates) | Higher (semantic selectors) |
| Fragility | Robust to redesigns | Breaks on DOM changes |
| Setup | Minimal | Requires selector knowledge |
| Best for | Legacy apps, cross-app workflows | Web-native automation |

## Practical Guidance

Use computer use when:
- The target is a desktop app with no web version
- The web page is canvas-rendered (Figma, Google Docs)
- You need to work across multiple applications
- DOM selectors are too complex to maintain

Use DOM-based automation (Playwright) when:
- Target is a standard HTML web page
- Speed and reliability matter
- You need to run at scale
