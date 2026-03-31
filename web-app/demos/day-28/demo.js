/**
 * Day 28: Agent Observability - Interactive Demo
 * ══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// Sample Trace Data
// ═══════════════════════════════════════════════════════════════

const TRACES = {
    support: {
        id: "trace_abc123",
        name: "Customer Support Query",
        timestamp: "2025-03-15 14:32:18 UTC",
        duration: 3200,
        tokens: 1847,
        cost: 0.028,
        status: "success",
        spans: [
            {
                id: "span_1",
                name: "AgentExecutor",
                type: "agent",
                start: 0,
                duration: 3200,
                parent: null,
                tokens: { input: 0, output: 0 },
                cost: 0
            },
            {
                id: "span_2",
                name: "LLM: Intent Classification",
                type: "llm",
                start: 50,
                duration: 1100,
                parent: "span_1",
                tokens: { input: 250, output: 45 },
                cost: 0.0082,
                model: "claude-sonnet-4-20250514"
            },
            {
                id: "span_3",
                name: "Tool: search_knowledge_base",
                type: "tool",
                start: 1180,
                duration: 320,
                parent: "span_1",
                input: { query: "password reset" },
                output: "Found 3 articles..."
            },
            {
                id: "span_4",
                name: "Tool: get_ticket_status",
                type: "tool",
                start: 1180,
                duration: 280,
                parent: "span_1",
                input: { ticket_id: "TKT-12345" },
                output: "Status: Open, Priority: High"
            },
            {
                id: "span_5",
                name: "LLM: Response Synthesis",
                type: "llm",
                start: 1550,
                duration: 1600,
                parent: "span_1",
                tokens: { input: 890, output: 312 },
                cost: 0.0073,
                model: "claude-sonnet-4-20250514"
            },
            {
                id: "span_6",
                name: "LLM: Final Answer",
                type: "llm",
                start: 3170,
                duration: 30,
                parent: "span_1",
                tokens: { input: 180, output: 170 },
                cost: 0.0031,
                model: "claude-sonnet-4-20250514"
            }
        ]
    },
    research: {
        id: "trace_def456",
        name: "Research Assistant",
        timestamp: "2025-03-15 14:28:45 UTC",
        duration: 5800,
        tokens: 3421,
        cost: 0.051,
        status: "success",
        spans: [
            {
                id: "span_1",
                name: "AgentExecutor",
                type: "agent",
                start: 0,
                duration: 5800,
                parent: null,
                tokens: { input: 0, output: 0 },
                cost: 0
            },
            {
                id: "span_2",
                name: "LLM: Query Understanding",
                type: "llm",
                start: 50,
                duration: 900,
                parent: "span_1",
                tokens: { input: 320, output: 85 },
                cost: 0.0122,
                model: "claude-sonnet-4-20250514"
            },
            {
                id: "span_3",
                name: "Tool: vector_search",
                type: "tool",
                start: 1000,
                duration: 450,
                parent: "span_1",
                input: { query: "machine learning best practices" },
                output: "Retrieved 8 documents..."
            },
            {
                id: "span_4",
                name: "Tool: web_search",
                type: "tool",
                start: 1000,
                duration: 820,
                parent: "span_1",
                input: { query: "ML best practices 2025" },
                output: "Found 12 results..."
            },
            {
                id: "span_5",
                name: "LLM: Document Analysis",
                type: "llm",
                start: 1900,
                duration: 2100,
                parent: "span_1",
                tokens: { input: 1850, output: 420 },
                cost: 0.0185,
                model: "claude-sonnet-4-20250514"
            },
            {
                id: "span_6",
                name: "LLM: Final Synthesis",
                type: "llm",
                start: 4100,
                duration: 1650,
                parent: "span_1",
                tokens: { input: 520, output: 226 },
                cost: 0.0049,
                model: "claude-sonnet-4-20250514"
            }
        ]
    },
    error: {
        id: "trace_err789",
        name: "Failed Tool Call",
        timestamp: "2025-03-15 14:25:03 UTC",
        duration: 2100,
        tokens: 892,
        cost: 0.013,
        status: "error",
        spans: [
            {
                id: "span_1",
                name: "AgentExecutor",
                type: "agent",
                start: 0,
                duration: 2100,
                parent: null,
                tokens: { input: 0, output: 0 },
                cost: 0,
                error: true
            },
            {
                id: "span_2",
                name: "LLM: Planning",
                type: "llm",
                start: 50,
                duration: 850,
                parent: "span_1",
                tokens: { input: 280, output: 62 },
                cost: 0.0093,
                model: "claude-sonnet-4-20250514"
            },
            {
                id: "span_3",
                name: "Tool: external_api",
                type: "tool",
                start: 950,
                duration: 1100,
                parent: "span_1",
                input: { endpoint: "/api/data", params: { id: 12345 } },
                error: true,
                errorMessage: "TimeoutError: Request timed out after 1000ms",
                errorStack: "at ExternalAPI.fetch (external_api.py:45)\nat Tool.execute (tools.py:123)\nat AgentExecutor.run (agent.py:89)"
            },
            {
                id: "span_4",
                name: "LLM: Error Handling",
                type: "llm",
                start: 2080,
                duration: 20,
                parent: "span_1",
                tokens: { input: 380, output: 170 },
                cost: 0.0037,
                model: "claude-sonnet-4-20250514"
            }
        ]
    }
};

const MODEL_PRICING = {
    "claude-sonnet": { input: 3.00, output: 15.00, name: "Claude Sonnet" },
    "claude-haiku": { input: 0.80, output: 4.00, name: "Claude Haiku" },
    "gpt-4o": { input: 2.50, output: 10.00, name: "GPT-4o" },
    "gpt-4o-mini": { input: 0.15, output: 0.60, name: "GPT-4o Mini" }
};

// ═══════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════

let currentTrace = "support";
let selectedSpan = null;
let debugStep = 1;

// ═══════════════════════════════════════════════════════════════
// Tab Navigation
// ═══════════════════════════════════════════════════════════════

function initTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(tabId).classList.add("active");
        });
    });
}

// ═══════════════════════════════════════════════════════════════
// Trace Viewer
// ═══════════════════════════════════════════════════════════════

function initTraceViewer() {
    const traceCards = document.querySelectorAll(".trace-card");

    traceCards.forEach(card => {
        card.addEventListener("click", () => {
            traceCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            currentTrace = card.dataset.trace;
            renderTrace();
        });
    });

    renderTrace();
}

function renderTrace() {
    const trace = TRACES[currentTrace];

    // Update header
    document.getElementById("trace-duration").textContent = (trace.duration / 1000).toFixed(1) + "s";
    document.getElementById("trace-tokens").textContent = trace.tokens.toLocaleString();
    document.getElementById("trace-cost").textContent = "$" + trace.cost.toFixed(3);

    const statusEl = document.getElementById("trace-status");
    statusEl.textContent = trace.status === "success" ? "Success" : "Error";
    statusEl.className = "status-badge " + trace.status;

    // Render span tree
    const tree = document.getElementById("span-tree");
    tree.innerHTML = renderSpanTree(trace.spans, null, 0);

    // Add click handlers
    tree.querySelectorAll(".span-item").forEach(item => {
        item.addEventListener("click", () => {
            tree.querySelectorAll(".span-item").forEach(i => i.classList.remove("selected"));
            item.classList.add("selected");
            selectedSpan = trace.spans.find(s => s.id === item.dataset.spanId);
            renderSpanDetail();
        });
    });

    // Reset detail panel
    document.getElementById("span-detail").innerHTML = `
        <h4>Span Details</h4>
        <p class="hint">Click on a span to view details</p>
    `;

    // Update timeline
    renderTimeline();
    renderCostAnalysis();
}

function renderSpanTree(spans, parentId, depth) {
    const children = spans.filter(s => s.parent === parentId);
    if (children.length === 0) return "";

    return children.map(span => {
        const indent = '<span class="span-indent"></span>'.repeat(depth);
        const icon = span.type === "llm" ? "&#129302;" :
                    span.type === "tool" ? "&#128295;" :
                    span.error ? "&#10060;" : "&#128193;";
        const typeClass = span.error ? "error" : span.type;
        const durationMs = span.duration + "ms";

        return `
            <div class="span-item ${typeClass}" data-span-id="${span.id}">
                ${indent}
                <span class="span-icon">${icon}</span>
                <span class="span-name">${span.name}</span>
                <span class="span-info">${durationMs}</span>
            </div>
            ${renderSpanTree(spans, span.id, depth + 1)}
        `;
    }).join("");
}

function renderSpanDetail() {
    if (!selectedSpan) return;

    const detail = document.getElementById("span-detail");
    const span = selectedSpan;

    let content = `<h4>${span.name}</h4>`;
    content += `<div class="detail-grid">`;
    content += `<div class="detail-item"><label>Type</label><div class="value">${span.type}</div></div>`;
    content += `<div class="detail-item"><label>Duration</label><div class="value">${span.duration}ms</div></div>`;
    content += `<div class="detail-item"><label>Start</label><div class="value">${span.start}ms</div></div>`;

    if (span.tokens) {
        content += `<div class="detail-item"><label>Input Tokens</label><div class="value">${span.tokens.input}</div></div>`;
        content += `<div class="detail-item"><label>Output Tokens</label><div class="value">${span.tokens.output}</div></div>`;
    }

    if (span.cost) {
        content += `<div class="detail-item"><label>Cost</label><div class="value">$${span.cost.toFixed(4)}</div></div>`;
    }

    if (span.model) {
        content += `<div class="detail-item"><label>Model</label><div class="value">${span.model}</div></div>`;
    }

    content += `</div>`;

    if (span.input) {
        content += `<div class="context-panel"><h5>Input</h5><div class="detail-content">${JSON.stringify(span.input, null, 2)}</div></div>`;
    }

    if (span.output) {
        content += `<div class="context-panel"><h5>Output</h5><div class="detail-content">${span.output}</div></div>`;
    }

    if (span.error) {
        content += `
            <div class="error-trace">
                <div class="error-message">${span.errorMessage || "Error occurred"}</div>
                <div class="stack-trace">${span.errorStack || ""}</div>
            </div>
        `;
    }

    detail.innerHTML = content;
}

// ═══════════════════════════════════════════════════════════════
// Timeline
// ═══════════════════════════════════════════════════════════════

function renderTimeline() {
    const trace = TRACES[currentTrace];
    const body = document.getElementById("timeline-body");
    const total = trace.duration;

    document.getElementById("timeline-total").textContent = total + "ms";

    // Update axis
    const axis = document.querySelector(".timeline-axis");
    axis.innerHTML = [0, 0.25, 0.5, 0.75, 1].map(p => `<span>${Math.round(total * p)}ms</span>`).join("");

    // Render bars (skip root span)
    const spans = trace.spans.filter(s => s.parent !== null);

    body.innerHTML = spans.map(span => {
        const left = (span.start / total * 100).toFixed(1);
        const width = Math.max((span.duration / total * 100), 3).toFixed(1);
        const typeClass = span.error ? "error" : span.type;

        return `
            <div class="timeline-row">
                <div class="timeline-label" title="${span.name}">${span.name}</div>
                <div class="timeline-bar-container">
                    <div class="timeline-bar ${typeClass}" style="left: ${left}%; width: ${width}%;">
                        ${span.duration}ms
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Render insights
    const llmSpans = spans.filter(s => s.type === "llm");
    const toolSpans = spans.filter(s => s.type === "tool");
    const llmTime = llmSpans.reduce((sum, s) => sum + s.duration, 0);
    const toolTime = toolSpans.reduce((sum, s) => sum + s.duration, 0);

    const insights = document.getElementById("timing-insights");
    insights.innerHTML = `
        <div class="insight-card">
            <div class="insight-label">LLM Time</div>
            <div class="insight-value llm">${llmTime}ms</div>
        </div>
        <div class="insight-card">
            <div class="insight-label">Tool Time</div>
            <div class="insight-value tool">${toolTime}ms</div>
        </div>
        <div class="insight-card">
            <div class="insight-label">LLM % of Total</div>
            <div class="insight-value">${(llmTime / total * 100).toFixed(0)}%</div>
        </div>
        <div class="insight-card">
            <div class="insight-label">Avg LLM Latency</div>
            <div class="insight-value">${Math.round(llmTime / llmSpans.length) || 0}ms</div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════
// Cost Analysis
// ═══════════════════════════════════════════════════════════════

function renderCostAnalysis() {
    const trace = TRACES[currentTrace];
    const llmSpans = trace.spans.filter(s => s.type === "llm" && s.tokens);

    const totalTokens = llmSpans.reduce((sum, s) => sum + s.tokens.input + s.tokens.output, 0);
    const totalCost = llmSpans.reduce((sum, s) => sum + (s.cost || 0), 0);

    document.getElementById("total-cost").textContent = "$" + totalCost.toFixed(3);
    document.getElementById("total-tokens").textContent = totalTokens.toLocaleString();
    document.getElementById("llm-calls").textContent = llmSpans.length;
    document.getElementById("avg-cost").textContent = "$" + (totalCost / llmSpans.length).toFixed(4);

    // Cost breakdown chart
    const maxCost = Math.max(...llmSpans.map(s => s.cost || 0));
    const costChart = document.getElementById("cost-chart");
    costChart.innerHTML = llmSpans.map(span => {
        const width = maxCost > 0 ? (span.cost / maxCost * 100) : 0;
        return `
            <div class="chart-row">
                <div class="chart-label">${span.name}</div>
                <div class="chart-bar-container">
                    <div class="chart-bar cost" style="width: ${width}%"></div>
                </div>
                <div class="chart-value">$${(span.cost || 0).toFixed(4)}</div>
            </div>
        `;
    }).join("");

    // Token breakdown chart
    const maxTokens = Math.max(...llmSpans.map(s => s.tokens.input + s.tokens.output));
    const tokenChart = document.getElementById("token-chart");
    tokenChart.innerHTML = llmSpans.map(span => {
        const inputWidth = maxTokens > 0 ? (span.tokens.input / maxTokens * 100) : 0;
        const outputWidth = maxTokens > 0 ? (span.tokens.output / maxTokens * 100) : 0;
        return `
            <div class="chart-row">
                <div class="chart-label">${span.name}</div>
                <div class="chart-bar-container">
                    <div class="chart-bar input" style="width: ${inputWidth}%"></div>
                </div>
                <div class="chart-value">${span.tokens.input} in</div>
            </div>
            <div class="chart-row">
                <div class="chart-label"></div>
                <div class="chart-bar-container">
                    <div class="chart-bar output" style="width: ${outputWidth}%"></div>
                </div>
                <div class="chart-value">${span.tokens.output} out</div>
            </div>
        `;
    }).join("");

    // Initialize calculator
    initCalculator();
}

function initCalculator() {
    const tracesInput = document.getElementById("traces-per-day");
    const tokensInput = document.getElementById("avg-tokens");
    const modelSelect = document.getElementById("model-select");

    const calculate = () => {
        const traces = parseInt(tracesInput.value) || 0;
        const tokens = parseInt(tokensInput.value) || 0;
        const model = MODEL_PRICING[modelSelect.value];

        // Assume 60% input, 40% output
        const inputTokens = tokens * 0.6;
        const outputTokens = tokens * 0.4;
        const costPerTrace = (inputTokens * model.input + outputTokens * model.output) / 1_000_000;
        const daily = costPerTrace * traces;
        const monthly = daily * 30;

        document.getElementById("daily-cost").textContent = "$" + daily.toFixed(2);
        document.getElementById("monthly-cost").textContent = "$" + monthly.toFixed(2);
    };

    tracesInput.addEventListener("input", calculate);
    tokensInput.addEventListener("input", calculate);
    modelSelect.addEventListener("change", calculate);

    calculate();
}

// ═══════════════════════════════════════════════════════════════
// Error Debugging
// ═══════════════════════════════════════════════════════════════

const DEBUG_STEPS = {
    1: {
        title: "Identify the Failed Span",
        content: `
            <div class="debug-content">
                <h4>Finding the Error</h4>
                <p>Look for spans with error status (red indicators). In this trace:</p>
                <div class="error-trace" style="margin-top: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--accent-red);">&#10060;</span>
                        <strong>Tool: external_api</strong>
                        <span style="color: var(--text-muted);">Duration: 1100ms</span>
                    </div>
                </div>
                <p style="margin-top: 16px; color: var(--text-secondary);">
                    The external_api tool call has an error status. Let's examine it.
                </p>
            </div>
        `
    },
    2: {
        title: "Examine Error Details",
        content: `
            <div class="debug-content">
                <h4>Error Message & Stack Trace</h4>
                <div class="error-trace">
                    <div class="error-message">TimeoutError: Request timed out after 1000ms</div>
                    <div class="stack-trace">at ExternalAPI.fetch (external_api.py:45)
at Tool.execute (tools.py:123)
at AgentExecutor.run (agent.py:89)</div>
                </div>
                <p style="margin-top: 16px; color: var(--text-secondary);">
                    The error is a timeout. The tool waited 1000ms but the API didn't respond in time.
                    The actual duration (1100ms) exceeds the 1000ms timeout threshold.
                </p>
            </div>
        `
    },
    3: {
        title: "Review Context",
        content: `
            <div class="debug-content">
                <h4>What Was the Agent Trying to Do?</h4>
                <div class="context-panel">
                    <div class="context-item">
                        <span class="context-label">Tool Input:</span>
                        <span class="context-value">{ endpoint: "/api/data", params: { id: 12345 } }</span>
                    </div>
                    <div class="context-item">
                        <span class="context-label">LLM Reasoning:</span>
                        <span class="context-value">"I need to fetch data for item 12345 from the external API..."</span>
                    </div>
                    <div class="context-item">
                        <span class="context-label">User Query:</span>
                        <span class="context-value">"Get me the details for order #12345"</span>
                    </div>
                </div>
                <p style="margin-top: 16px; color: var(--text-secondary);">
                    The agent correctly identified the need to call the external API. The input parameters look valid.
                    The issue is the API response time, not the agent's decision-making.
                </p>
            </div>
        `
    },
    4: {
        title: "Compare with Success",
        content: `
            <div class="debug-content">
                <h4>Similar Successful Traces</h4>
                <p>Looking at successful traces that called the same tool:</p>
                <div style="display: grid; gap: 12px; margin-top: 16px;">
                    <div class="context-item" style="background: rgba(34, 197, 94, 0.1); border-left: 3px solid var(--accent-green);">
                        <span class="context-label">trace_xyz001</span>
                        <span class="context-value">external_api: 280ms (success)</span>
                    </div>
                    <div class="context-item" style="background: rgba(34, 197, 94, 0.1); border-left: 3px solid var(--accent-green);">
                        <span class="context-label">trace_xyz002</span>
                        <span class="context-value">external_api: 450ms (success)</span>
                    </div>
                    <div class="context-item" style="background: rgba(234, 179, 8, 0.1); border-left: 3px solid var(--accent-yellow);">
                        <span class="context-label">trace_xyz003</span>
                        <span class="context-value">external_api: 920ms (success, near timeout)</span>
                    </div>
                </div>
                <p style="margin-top: 16px; color: var(--text-secondary);">
                    Most calls succeed in 200-500ms. This suggests the API occasionally has slow responses,
                    and our 1000ms timeout is too aggressive for edge cases.
                </p>
            </div>
        `
    },
    5: {
        title: "Identify Fix",
        content: `
            <div class="debug-content">
                <h4>Root Cause & Solution</h4>
                <div style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-md); margin-bottom: 16px;">
                    <h5 style="color: var(--accent-red); margin-bottom: 8px;">Root Cause</h5>
                    <p>The external API occasionally has response times > 1000ms, but our tool has a hard timeout at 1000ms.</p>
                </div>
                <div style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-md);">
                    <h5 style="color: var(--accent-green); margin-bottom: 8px;">Recommended Fixes</h5>
                    <ol style="margin-left: 20px; color: var(--text-secondary);">
                        <li style="margin-bottom: 8px;"><strong>Increase timeout to 3000ms</strong> - Based on P99 latency data</li>
                        <li style="margin-bottom: 8px;"><strong>Add retry with backoff</strong> - Retry once on timeout before failing</li>
                        <li style="margin-bottom: 8px;"><strong>Set up API monitoring</strong> - Alert when P95 latency exceeds 800ms</li>
                        <li><strong>Graceful degradation</strong> - Return cached/default data on timeout</li>
                    </ol>
                </div>
            </div>
        `
    }
};

function initDebugging() {
    const prevBtn = document.getElementById("prev-step");
    const nextBtn = document.getElementById("next-step");
    const stepIndicator = document.getElementById("current-step");
    const steps = document.querySelectorAll(".debug-step");

    const updateStep = () => {
        stepIndicator.textContent = debugStep;
        prevBtn.disabled = debugStep === 1;
        nextBtn.textContent = debugStep === 5 ? "Done" : "Next \u2192";

        steps.forEach((step, i) => {
            step.classList.remove("active", "completed");
            if (i + 1 < debugStep) step.classList.add("completed");
            if (i + 1 === debugStep) step.classList.add("active");
        });

        document.getElementById("debug-viz").innerHTML = DEBUG_STEPS[debugStep].content;
    };

    prevBtn.addEventListener("click", () => {
        if (debugStep > 1) {
            debugStep--;
            updateStep();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (debugStep < 5) {
            debugStep++;
            updateStep();
        }
    });

    updateStep();
}

// ═══════════════════════════════════════════════════════════════
// Code Examples
// ═══════════════════════════════════════════════════════════════

function initCodeExamples() {
    const codeTabs = document.querySelectorAll(".code-tab");
    const codePanels = document.querySelectorAll(".code-panel");

    codeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            codeTabs.forEach(t => t.classList.remove("active"));
            codePanels.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById("code-" + tab.dataset.code).classList.add("active");
        });
    });

    // Copy buttons
    document.querySelectorAll(".copy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = document.getElementById(btn.dataset.target);
            const code = target.textContent;

            navigator.clipboard.writeText(code).then(() => {
                const originalText = btn.textContent;
                btn.textContent = "Copied!";
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        });
    });
}

// ═══════════════════════════════════════════════════════════════
// Initialize
// ═══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initTraceViewer();
    initDebugging();
    initCodeExamples();

    // Re-highlight code
    if (typeof Prism !== "undefined") {
        Prism.highlightAll();
    }
});
