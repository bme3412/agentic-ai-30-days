// ============================================================
// Day 23: Browser Automation Agents - Interactive Demo
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initBasicsTab();
    initSelectorsTab();
    initVisualTab();
    initWorkflowsTab();
    initCodeTab();
});

// ============================================================
// Tab Navigation
// ============================================================

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ============================================================
// Tab 1: Automation Basics
// ============================================================

function initBasicsTab() {
    initBrowserStack();
    initTimeline();
    initWaitingStrategies();
}

// Browser Stack Layer Info
const stackInfo = {
    goal: {
        title: 'User Goal / Task',
        description: 'The agent starts with a natural language instruction from the user. For example: "Find the top 3 Hacker News posts about AI" or "Fill out this form with my details". This high-level goal is broken down into actionable steps by the LLM.'
    },
    reasoning: {
        title: 'LLM Reasoning Layer',
        description: 'GPT-4o, Claude, or another multimodal LLM looks at the current page state (DOM tree + screenshot) and decides what action to take next. It reasons about navigation paths, form fields to fill, buttons to click, and data to extract.'
    },
    grounding: {
        title: 'DOM + Visual Grounding',
        description: 'The agent understands the page structure through two channels: (1) The accessibility tree / DOM (fast, precise), and (2) Screenshots processed by vision models (slow, works everywhere). This dual approach handles both standard HTML and visual UIs like canvases.'
    },
    playwright: {
        title: 'Playwright Actions',
        description: 'Playwright executes the actual browser commands: navigate, wait, click, fill, screenshot. It provides a stable API for controlling Chromium, Firefox, and WebKit. All the agent\'s "thoughts" turn into concrete Playwright method calls here.'
    },
    browser: {
        title: 'Real Browser Engine',
        description: 'A real Chromium/Firefox/WebKit instance renders the page, runs JavaScript, makes network requests, and handles cookies. Unlike headless scrapers, this sees the page exactly as a human would - including dynamic content and authentication states.'
    }
};

function initBrowserStack() {
    const layers = document.querySelectorAll('.stack-layer');
    const infoPanel = document.getElementById('stack-info-panel');

    layers.forEach(layer => {
        layer.addEventListener('click', () => {
            const layerId = layer.dataset.layer;
            const info = stackInfo[layerId];

            // Update selected state
            layers.forEach(l => l.classList.remove('selected'));
            layer.classList.add('selected');

            // Show info panel
            infoPanel.style.display = 'block';
            infoPanel.innerHTML = `
                <h4>${info.title}</h4>
                <p>${info.description}</p>
            `;
        });
    });
}

// Timeline Simulator
let timelineInterval = null;
let currentStep = 0;

const timelineData = [
    { step: 1, name: 'Navigate', detail: 'page.goto("https://example.com") loads the target URL and waits for initial HTML response. The browser starts rendering the page.' },
    { step: 2, name: 'Wait', detail: 'wait_for_load_state("networkidle") waits until no network requests for 500ms. This ensures dynamic content has loaded.' },
    { step: 3, name: 'Select', detail: 'get_by_role("button", name="Submit") finds the button using ARIA role and accessible name. This is the most stable selector strategy.' },
    { step: 4, name: 'Execute', detail: 'element.click() triggers the button click event, which may navigate to a new page or submit a form.' },
    { step: 5, name: 'Verify', detail: 'Assert that the URL changed or expected content appeared. Verification confirms the action succeeded before moving on.' }
];

function initTimeline() {
    const playBtn = document.getElementById('timeline-play');
    const pauseBtn = document.getElementById('timeline-pause');
    const resetBtn = document.getElementById('timeline-reset');
    const detailDiv = document.getElementById('timeline-detail');

    playBtn.addEventListener('click', () => {
        if (timelineInterval) return; // Already playing

        timelineInterval = setInterval(() => {
            currentStep++;
            if (currentStep > 5) {
                currentStep = 5;
                clearInterval(timelineInterval);
                timelineInterval = null;
                return;
            }
            updateTimelineStep(currentStep);
        }, 1000);
    });

    pauseBtn.addEventListener('click', () => {
        if (timelineInterval) {
            clearInterval(timelineInterval);
            timelineInterval = null;
        }
    });

    resetBtn.addEventListener('click', () => {
        if (timelineInterval) {
            clearInterval(timelineInterval);
            timelineInterval = null;
        }
        currentStep = 0;
        updateTimelineStep(0);
        detailDiv.style.display = 'none';
    });

    // Click on steps to see details
    document.querySelectorAll('.timeline-step').forEach(step => {
        step.addEventListener('click', () => {
            const stepNum = parseInt(step.dataset.step);
            const data = timelineData[stepNum - 1];
            detailDiv.style.display = 'block';
            detailDiv.innerHTML = `
                <h4>Step ${data.step}: ${data.name}</h4>
                <p>${data.detail}</p>
            `;
        });
    });
}

function updateTimelineStep(step) {
    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach((s, idx) => {
        s.classList.remove('active', 'completed');
        if (idx + 1 < step) {
            s.classList.add('completed');
        } else if (idx + 1 === step) {
            s.classList.add('active');
        }
    });
}

// Waiting Strategies
const strategyDetails = {
    networkidle: {
        title: 'Network Idle Strategy',
        explanation: 'Waits until there have been no network requests for 500ms. This is the most reliable way to ensure dynamic content (AJAX, fetch) has fully loaded. Use this as your default waiting strategy.',
        code: 'await page.wait_for_load_state("networkidle")'
    },
    selector: {
        title: 'Wait for Selector',
        explanation: 'Waits until a specific element appears in the DOM. Fast and precise when you know exactly what element signals "ready". Fails fast if the element never appears (respects timeout).',
        code: 'await page.wait_for_selector(".results-grid", timeout=5000)'
    },
    function: {
        title: 'Wait for Function',
        explanation: 'Waits until a custom JavaScript function returns truthy. Most flexible option for complex conditions like "wait until loading spinner disappears" or "wait until table has > 10 rows".',
        code: 'await page.wait_for_function(() => document.querySelectorAll(".item").length > 10)'
    },
    sleep: {
        title: 'Fixed Sleep (Anti-Pattern)',
        explanation: 'Never use fixed delays! They're too slow (you wait the full duration even if ready earlier) and fragile (sometimes not long enough). Always wait for actual conditions instead of guessing timing.',
        code: 'time.sleep(3)  # ❌ BAD: what if it takes 4 seconds? Or only 1?'
    }
};

function initWaitingStrategies() {
    document.querySelectorAll('.strategy-card').forEach(card => {
        card.addEventListener('click', () => {
            const strategy = card.dataset.strategy;
            const detail = strategyDetails[strategy];

            showToast(detail.explanation);
        });
    });
}

// ============================================================
// Tab 2: Element Selection
// ============================================================

function initSelectorsTab() {
    initSelectorHierarchy();
    initSelectorTester();
}

// Selector Hierarchy
const selectorExamples = {
    aria: {
        title: 'ARIA Roles + Labels',
        code: `# Most stable selector - survives redesigns
page.get_by_role("button", name="Add to cart")
page.get_by_role("textbox", name="Email address")
page.get_by_role("link", name="Sign in")

# Why it works:
# - Semantic meaning stays even if styling changes
# - Screen readers use this, so it's maintained
# - Works with accessibility best practices`,
        stability: '95%'
    },
    testid: {
        title: 'Test IDs (data-testid)',
        code: `# Explicit test markers - very stable
page.get_by_test_id("checkout-button")
page.get_by_test_id("product-card-123")

# Why it works:
# - Added specifically for testing
# - Won't change in redesigns
# - Team knows not to remove them`,
        stability: '98%'
    },
    text: {
        title: 'Visible Text Content',
        code: `# Readable but fragile
page.get_by_text("Sign in")
page.get_by_text("Submit", exact=True)

# Risks:
# - Copy changes break selectors
# - Translations break selectors
# - Use only for unique, stable text`,
        stability: '70%'
    },
    css: {
        title: 'CSS Selectors',
        code: `# Classic approach, but fragile
page.locator("#submit-button")  # ID is stable
page.locator(".btn.btn-primary")  # Classes change!

# When to use:
# - IDs are stable (if not dynamically generated)
# - Classes break on redesigns
# - Avoid deep nesting (.container > .row > .col > button)`,
        stability: '60%'
    },
    xpath: {
        title: 'XPath Expressions',
        code: `# Positional queries - very fragile
page.locator("//div[@class='container']/button[2]")
page.locator("//form/input[@type='text'][3]")

# Why to avoid:
# - Breaks when layout changes
# - Hard to read and maintain
# - Only use as last resort`,
        stability: '40%'
    },
    visual: {
        title: 'Visual Grounding (Screenshot + LLM)',
        code: `# The escape hatch for everything else
screenshot = await page.screenshot()
coords = await ask_gpt4v("Where is the Submit button?", screenshot)
await page.mouse.click(coords.x, coords.y)

# When to use:
# - Canvas-based UIs (Figma, games)
# - PDFs and images
# - Shadow DOM / iframed content
# - Legacy apps with poor accessibility`,
        stability: '80%'
    }
};

function initSelectorHierarchy() {
    const cards = document.querySelectorAll('.selector-card');
    const detailPanel = document.getElementById('selector-detail');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const selectorType = card.dataset.selector;
            const example = selectorExamples[selectorType];

            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            detailPanel.style.display = 'block';
            detailPanel.innerHTML = `
                <h4>${example.title}</h4>
                <p><strong>Stability:</strong> ${example.stability}</p>
                <pre><code class="language-python">${example.code}</code></pre>
            `;

            // Re-highlight syntax
            if (window.Prism) {
                Prism.highlightAllUnder(detailPanel);
            }
        });
    });
}

// Selector Tester
const testScenarios = {
    'aria-submit': {
        success: true,
        explanation: '✓ ARIA role selector works! The button has role="button" and accessible name "Submit Form". This will survive redesigns.'
    },
    'text-submit': {
        success: true,
        explanation: '✓ Text selector works! But it will break if the button text changes to "Send" or is translated to other languages.'
    },
    'css-submit': {
        success: false,
        explanation: '✗ CSS class selector failed! The button doesn\'t have that specific class. Classes often change during redesigns.'
    },
    'xpath-submit': {
        success: false,
        explanation: '✗ XPath selector failed! The positional path is wrong. Even if it worked today, it would break when the layout changes.'
    }
};

function initSelectorTester() {
    const options = document.querySelectorAll('.selector-option');
    const resultDiv = document.getElementById('test-result');

    options.forEach(option => {
        option.addEventListener('click', () => {
            const testId = option.dataset.test;
            const result = testScenarios[testId];

            options.forEach(o => o.classList.remove('active'));
            option.classList.add('active');

            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="result-status ${result.success ? 'success' : 'fail'}">
                    ${result.success ? '✓ Success' : '✗ Failed'}
                </div>
                <p class="result-explanation">${result.explanation}</p>
            `;
        });
    });
}

// ============================================================
// Tab 3: Visual Grounding
// ============================================================

function initVisualTab() {
    initCoordinatePicker();
}

function initCoordinatePicker() {
    const clickables = document.querySelectorAll('.mock-input, .mock-button');
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    const askLlmBtn = document.getElementById('ask-llm-btn');
    const llmSimDiv = document.getElementById('llm-simulation');

    clickables.forEach(elem => {
        elem.addEventListener('click', () => {
            const coords = elem.dataset.coords.split(',');
            const x = coords[0];
            const y = coords[1];

            coordX.textContent = x;
            coordY.textContent = y;

            // Simulate LLM response
            llmSimDiv.style.display = 'block';
            const elemType = elem.className.includes('button') ? 'Sign In button' : 'input field';
            llmSimDiv.querySelector('.llm-response').innerHTML = `
                {<br>
                &nbsp;&nbsp;"element": "${elemType}",<br>
                &nbsp;&nbsp;"coordinates": { "x": ${x}, "y": ${y} },<br>
                &nbsp;&nbsp;"confidence": 0.95,<br>
                &nbsp;&nbsp;"reasoning": "Located the ${elemType} based on visual appearance and position on the page"<br>
                }
            `;
        });
    });

    askLlmBtn.addEventListener('click', () => {
        llmSimDiv.style.display = 'block';
        llmSimDiv.querySelector('.llm-response').innerHTML = `
            {<br>
            &nbsp;&nbsp;"element": "Sign In button",<br>
            &nbsp;&nbsp;"coordinates": { "x": 120, "y": 300 },<br>
            &nbsp;&nbsp;"confidence": 0.95,<br>
            &nbsp;&nbsp;"reasoning": "The blue button with text 'Sign In' is located at the bottom of the form"<br>
            }
        `;
        coordX.textContent = '120';
        coordY.textContent = '300';
        showToast('GPT-4o analyzed the screenshot and found the button!');
    });
}

// ============================================================
// Tab 4: Workflows
// ============================================================

function initWorkflowsTab() {
    initStateMachine();
    initErrorRecovery();
}

// State Machine
const stateDetails = {
    initial: {
        title: 'Initial State',
        description: 'Starting point with task configuration and empty state object.',
        code: `state = {
    "step": "initial",
    "url": None,
    "data": [],
    "errors": []
}`
    },
    navigate: {
        title: 'Navigate State',
        description: 'Load the target URL and wait for page to be ready.',
        code: `state["step"] = "navigate"
await page.goto(target_url)
await page.wait_for_load_state("networkidle")
state["url"] = page.url`
    },
    extract: {
        title: 'Extract State',
        description: 'Pull data from the page - text, links, form values, etc.',
        code: `state["step"] = "extract"
elements = await page.locator(".item").all()
for elem in elements:
    title = await elem.text_content()
    state["data"].append(title)`
    },
    verify: {
        title: 'Verify State',
        description: 'Check that extracted data meets requirements before proceeding.',
        code: `state["step"] = "verify"
if len(state["data"]) == 0:
    raise ValueError("No data extracted")
if not all(item.strip() for item in state["data"]):
    raise ValueError("Empty items found")`
    },
    complete: {
        title: 'Complete State',
        description: 'Task finished successfully. Return results to user.',
        code: `state["step"] = "complete"
return {
    "success": True,
    "data": state["data"],
    "url": state["url"]
}`
    }
};

function initStateMachine() {
    const stateNodes = document.querySelectorAll('.state-node');
    const detailPanel = document.getElementById('state-detail-panel');

    stateNodes.forEach(node => {
        node.addEventListener('click', () => {
            const stateId = node.dataset.state;
            const detail = stateDetails[stateId];

            if (!detail) return;

            stateNodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');
            node.classList.add('visited');

            detailPanel.style.display = 'block';
            detailPanel.innerHTML = `
                <h4>${detail.title}</h4>
                <p>${detail.description}</p>
                <pre><code class="language-python">${detail.code}</code></pre>
            `;

            if (window.Prism) {
                Prism.highlightAllUnder(detailPanel);
            }
        });
    });
}

// Error Recovery
const errorDetails = {
    transient: {
        title: 'Transient Error Recovery',
        explanation: 'Network timeouts and rate limits are usually temporary. Retry with exponential backoff: wait 1s, then 2s, then 4s, then 8s. Most transient issues resolve within 3-4 retries.',
        code: `async def retry_with_backoff(func, max_retries=4):
    for attempt in range(max_retries):
        try:
            return await func()
        except (TimeoutError, RateLimitError) as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt  # 1s, 2s, 4s, 8s
            await asyncio.sleep(wait_time)`
    },
    recoverable: {
        title: 'Recoverable Error Recovery',
        explanation: 'Element not found or stale reference means the page state changed. Re-navigate to the page and try the action again. This handles dynamic content and SPA navigation.',
        code: `try:
    await page.get_by_role("button", name="Submit").click()
except PlaywrightError:
    # Re-navigate and try again
    await page.goto(page.url)
    await page.wait_for_load_state("networkidle")
    await page.get_by_role("button", name="Submit").click()`
    },
    blocker: {
        title: 'Blocker Handling',
        explanation: 'CAPTCHAs, login walls, and paywalls require human intervention. Save state, notify the user, and provide a way to resume once the blocker is resolved.',
        code: `if await page.locator("iframe[src*='recaptcha']").count() > 0:
    # Save current state
    save_checkpoint(state)

    # Notify user
    send_notification("CAPTCHA detected. Please solve it and resume.")

    # Pause and wait for manual resolution
    await page.pause()  # Opens Playwright inspector`
    },
    logic: {
        title: 'Logic Error Handling',
        explanation: 'Assertion failures and invalid states indicate bugs in your agent logic. Log comprehensive error details for debugging, then stop gracefully instead of retrying forever.',
        code: `try:
    assert len(extracted_data) > 0, "No data found"
    assert page.url.startswith("https://"), "Not on secure page"
except AssertionError as e:
    logger.error(f"Logic error: {e}")
    logger.error(f"Current state: {state}")
    logger.error(f"Page URL: {page.url}")
    raise  # Don't retry - fix the bug`
    }
};

function initErrorRecovery() {
    document.querySelectorAll('.error-card').forEach(card => {
        card.addEventListener('click', () => {
            const errorType = card.dataset.error;
            const detail = errorDetails[errorType];

            showToast(detail.explanation);
        });
    });
}

// ============================================================
// Tab 5: Code Examples
// ============================================================

function initCodeTab() {
    initCodeSwitcher();
    initCopyButtons();
}

function initCodeSwitcher() {
    const exampleTabs = document.querySelectorAll('.example-tab');
    const exampleContents = document.querySelectorAll('.example-content');

    exampleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const exampleId = tab.dataset.example;

            exampleTabs.forEach(t => t.classList.remove('active'));
            exampleContents.forEach(c => c.style.display = 'none');

            tab.classList.add('active');
            document.getElementById(`example-${exampleId}`).style.display = 'block';
        });
    });
}

function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.closest('.example-content').querySelector('code');
            const text = codeBlock.textContent;

            navigator.clipboard.writeText(text).then(() => {
                showToast('✓ Code copied to clipboard!');
            });
        });
    });
}

// ============================================================
// Utilities
// ============================================================

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
