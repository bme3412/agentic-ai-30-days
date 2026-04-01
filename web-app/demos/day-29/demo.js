/**
 * Day 29: Evaluating & Testing Agents - Interactive Demo
 * ══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// Metrics Data
// ═══════════════════════════════════════════════════════════════

const METRICS = {
    faithfulness: {
        name: "Faithfulness",
        description: "Measures how factually consistent the generated answer is with the provided context. A faithful response only contains information that can be verified from the source documents.",
        formula: "faithfulness = (claims_supported_by_context) / (total_claims_in_response)",
        score: 0.87,
        thresholds: { good: ">= 0.8", warning: "0.6 - 0.8", bad: "< 0.6" },
        breakdown: [
            { label: "Total claims", value: "8" },
            { label: "Supported claims", value: "7", status: "pass" },
            { label: "Unsupported claims", value: "1", status: "fail" },
            { label: "Contradicted claims", value: "0", status: "pass" }
        ]
    },
    relevancy: {
        name: "Answer Relevancy",
        description: "Evaluates how well the generated answer addresses the user's question. High relevancy means the response directly answers what was asked without excessive tangents.",
        formula: "relevancy = cosine_similarity(question_embedding, answer_embedding)",
        score: 0.92,
        thresholds: { good: ">= 0.85", warning: "0.7 - 0.85", bad: "< 0.7" },
        breakdown: [
            { label: "Semantic alignment", value: "0.94", status: "pass" },
            { label: "Coverage score", value: "0.89", status: "pass" },
            { label: "Conciseness", value: "0.91", status: "pass" },
            { label: "Completeness", value: "0.88", status: "pass" }
        ]
    },
    hallucination: {
        name: "Hallucination",
        description: "Detects when the model generates information not present in the context or contradicts the source material. Lower scores indicate less hallucination.",
        formula: "hallucination = 1 - (supported_statements / total_statements)",
        score: 0.12,
        thresholds: { good: "< 0.1", warning: "0.1 - 0.25", bad: "> 0.25" },
        breakdown: [
            { label: "Total statements", value: "15" },
            { label: "Grounded statements", value: "13", status: "pass" },
            { label: "Hallucinated facts", value: "1", status: "fail" },
            { label: "Ambiguous statements", value: "1", status: "fail" }
        ]
    },
    toolAccuracy: {
        name: "Tool Accuracy",
        description: "Measures the agent's ability to select and invoke the correct tools with appropriate arguments. Critical for agentic workflows.",
        formula: "tool_accuracy = (correct_tool_calls) / (total_tool_calls)",
        score: 0.95,
        thresholds: { good: ">= 0.9", warning: "0.75 - 0.9", bad: "< 0.75" },
        breakdown: [
            { label: "Total tool calls", value: "12" },
            { label: "Correct tool selected", value: "12", status: "pass" },
            { label: "Correct arguments", value: "11", status: "pass" },
            { label: "Execution success", value: "11", status: "pass" }
        ]
    }
};

const REGRESSION_DATA = {
    dates: ["Mar 1", "Mar 5", "Mar 9", "Mar 13", "Mar 17", "Mar 21", "Mar 25", "Mar 29"],
    faithfulness: [0.85, 0.87, 0.86, 0.88, 0.84, 0.82, 0.79, 0.87],
    relevancy: [0.90, 0.91, 0.89, 0.92, 0.91, 0.90, 0.88, 0.92],
    hallucination: [0.10, 0.09, 0.11, 0.08, 0.12, 0.15, 0.18, 0.12]
};

const ALERTS = [
    {
        type: "critical",
        title: "Faithfulness Regression Detected",
        description: "Faithfulness score dropped from 0.84 to 0.79 between Mar 17 and Mar 25. This is below the 0.8 threshold.",
        timestamp: "Mar 25, 2025 14:32 UTC"
    },
    {
        type: "warning",
        title: "Hallucination Rate Increasing",
        description: "Hallucination metric has trended upward over the past 3 measurements. Current: 0.12 (threshold: 0.1)",
        timestamp: "Mar 29, 2025 09:15 UTC"
    },
    {
        type: "info",
        title: "New Baseline Established",
        description: "After prompt update v2.3.1, new performance baselines have been recorded for comparison.",
        timestamp: "Mar 29, 2025 08:00 UTC"
    }
];

// ═══════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════

let currentMetric = "faithfulness";
let testCases = [];
let judgeRunning = false;

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
// Metric Explorer
// ═══════════════════════════════════════════════════════════════

function initMetricExplorer() {
    const metricCards = document.querySelectorAll(".metric-card");

    metricCards.forEach(card => {
        card.addEventListener("click", () => {
            metricCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            currentMetric = card.dataset.metric;
            renderMetricVisualization();
        });
    });

    renderMetricVisualization();
}

function renderMetricVisualization() {
    const metric = METRICS[currentMetric];

    // Update gauge
    renderGauge(metric.score, currentMetric === "hallucination");

    // Update breakdown
    const breakdownEl = document.getElementById("score-breakdown");
    breakdownEl.innerHTML = metric.breakdown.map(item => `
        <div class="breakdown-item">
            <span class="label">${item.label}</span>
            <span class="value ${item.status || ''}">${item.value}</span>
        </div>
    `).join("");

    // Update detail panel
    document.getElementById("metric-name").textContent = metric.name;
    document.getElementById("metric-description").textContent = metric.description;
    document.getElementById("metric-formula").textContent = metric.formula;

    // Update thresholds
    document.getElementById("threshold-good").textContent = metric.thresholds.good;
    document.getElementById("threshold-warning").textContent = metric.thresholds.warning;
    document.getElementById("threshold-bad").textContent = metric.thresholds.bad;
}

function renderGauge(score, isInverted = false) {
    const gauge = document.getElementById("gauge-fill");
    const valueEl = document.getElementById("gauge-value");
    const labelEl = document.getElementById("gauge-label");

    // Calculate arc (0 to 180 degrees)
    const radius = 80;
    const circumference = Math.PI * radius;
    const offset = circumference * (1 - score);

    gauge.style.strokeDasharray = `${circumference}`;
    gauge.style.strokeDashoffset = offset;

    // Determine color based on score and whether metric is inverted
    let color;
    if (isInverted) {
        // For hallucination, lower is better
        color = score < 0.1 ? "var(--metric-good)" :
                score < 0.25 ? "var(--metric-warning)" : "var(--metric-bad)";
    } else {
        color = score >= 0.8 ? "var(--metric-good)" :
                score >= 0.6 ? "var(--metric-warning)" : "var(--metric-bad)";
    }
    gauge.style.stroke = color;

    valueEl.textContent = score.toFixed(2);
    valueEl.style.color = color;
    labelEl.textContent = METRICS[currentMetric].name;
}

// ═══════════════════════════════════════════════════════════════
// Test Case Builder
// ═══════════════════════════════════════════════════════════════

function initTestCaseBuilder() {
    const form = document.getElementById("test-case-form");
    const addBtn = document.getElementById("add-test-case");
    const clearBtn = document.getElementById("clear-form");

    addBtn.addEventListener("click", () => {
        const name = document.getElementById("test-name").value.trim();
        const input = document.getElementById("test-input").value.trim();
        const expectedOutput = document.getElementById("expected-output").value.trim();
        const context = document.getElementById("test-context").value.trim();

        // Get selected metrics
        const selectedMetrics = [];
        document.querySelectorAll('input[name="metrics"]:checked').forEach(cb => {
            selectedMetrics.push(cb.value);
        });

        if (!name || !input) {
            alert("Please provide at least a test name and input.");
            return;
        }

        testCases.push({
            id: Date.now(),
            name,
            input,
            expectedOutput,
            context,
            metrics: selectedMetrics
        });

        renderTestCases();
        clearForm();
    });

    clearBtn.addEventListener("click", clearForm);

    function clearForm() {
        document.getElementById("test-name").value = "";
        document.getElementById("test-input").value = "";
        document.getElementById("expected-output").value = "";
        document.getElementById("test-context").value = "";
        document.querySelectorAll('input[name="metrics"]').forEach(cb => {
            cb.checked = false;
        });
    }

    renderTestCases();
}

function renderTestCases() {
    const listEl = document.getElementById("test-cases-list");
    const countEl = document.getElementById("test-count");

    countEl.textContent = testCases.length;

    if (testCases.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">&#128221;</div>
                <p>No test cases yet.<br>Create your first test case using the form.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = testCases.map(tc => `
        <div class="test-case-item" data-id="${tc.id}">
            <div class="test-case-header">
                <div class="test-case-name">${tc.name}</div>
                <button class="test-case-delete" onclick="deleteTestCase(${tc.id})">&#10005;</button>
            </div>
            <div class="test-case-content">
                <div class="field">
                    <span class="field-label">Input</span>
                    ${tc.input.substring(0, 100)}${tc.input.length > 100 ? "..." : ""}
                </div>
                ${tc.expectedOutput ? `
                <div class="field">
                    <span class="field-label">Expected Output</span>
                    ${tc.expectedOutput.substring(0, 80)}${tc.expectedOutput.length > 80 ? "..." : ""}
                </div>
                ` : ""}
            </div>
            ${tc.metrics.length > 0 ? `
            <div class="test-case-metrics">
                ${tc.metrics.map(m => `<span class="metric-tag">${m}</span>`).join("")}
            </div>
            ` : ""}
        </div>
    `).join("");
}

function deleteTestCase(id) {
    testCases = testCases.filter(tc => tc.id !== id);
    renderTestCases();
}

// Make deleteTestCase available globally
window.deleteTestCase = deleteTestCase;

// ═══════════════════════════════════════════════════════════════
// Regression Dashboard
// ═══════════════════════════════════════════════════════════════

function initRegressionDashboard() {
    renderRegressionChart();
    renderAlerts();

    // Filter buttons
    document.querySelectorAll(".chart-filter").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".chart-filter").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderRegressionChart();
        });
    });
}

function renderRegressionChart() {
    const svg = document.getElementById("regression-chart");
    const data = REGRESSION_DATA;

    const width = svg.clientWidth || 800;
    const height = 280;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Scale functions
    const xScale = (i) => padding.left + (i / (data.dates.length - 1)) * chartWidth;
    const yScale = (v) => padding.top + (1 - v) * chartHeight;

    let svgContent = "";

    // Grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (i / 5) * chartHeight;
        const value = (1 - i / 5).toFixed(1);
        svgContent += `<line class="chart-grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />`;
        svgContent += `<text class="chart-axis-label" x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${value}</text>`;
    }

    // X-axis labels
    data.dates.forEach((date, i) => {
        const x = xScale(i);
        svgContent += `<text class="chart-axis-label" x="${x}" y="${height - 10}" text-anchor="middle">${date}</text>`;
    });

    // Line paths
    const metrics = [
        { key: "faithfulness", color: "var(--accent-blue)" },
        { key: "relevancy", color: "var(--metric-good)" },
        { key: "hallucination", color: "var(--metric-bad)" }
    ];

    metrics.forEach(metric => {
        const points = data[metric.key].map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
        svgContent += `<polyline class="chart-line ${metric.key}" points="${points}" />`;

        // Data points
        data[metric.key].forEach((v, i) => {
            svgContent += `<circle class="chart-point" cx="${xScale(i)}" cy="${yScale(v)}" r="4" fill="${metric.color}" />`;
        });
    });

    // Threshold line at 0.8
    const thresholdY = yScale(0.8);
    svgContent += `<line x1="${padding.left}" y1="${thresholdY}" x2="${width - padding.right}" y2="${thresholdY}"
        stroke="var(--accent-yellow)" stroke-dasharray="6 3" stroke-width="1" opacity="0.7" />`;
    svgContent += `<text x="${width - padding.right + 5}" y="${thresholdY + 4}" fill="var(--accent-yellow)" font-size="10">threshold</text>`;

    svg.innerHTML = svgContent;
}

function renderAlerts() {
    const alertsEl = document.getElementById("alerts-list");

    alertsEl.innerHTML = ALERTS.map(alert => `
        <div class="alert-item ${alert.type}">
            <span class="alert-icon">${
                alert.type === "critical" ? "&#9888;" :
                alert.type === "warning" ? "&#9888;" : "&#8505;"
            }</span>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-description">${alert.description}</div>
            </div>
            <div class="alert-timestamp">${alert.timestamp}</div>
        </div>
    `).join("");
}

// ═══════════════════════════════════════════════════════════════
// LLM-as-Judge Simulator
// ═══════════════════════════════════════════════════════════════

function initJudgeSimulator() {
    const runBtn = document.getElementById("run-judge");

    runBtn.addEventListener("click", runJudgeEvaluation);
}

async function runJudgeEvaluation() {
    if (judgeRunning) return;

    const question = document.getElementById("judge-question").value.trim();
    const context = document.getElementById("judge-context").value.trim();
    const response = document.getElementById("judge-response").value.trim();

    if (!question || !response) {
        alert("Please provide at least a question and response to evaluate.");
        return;
    }

    judgeRunning = true;
    const outputEl = document.getElementById("judge-output");
    const statusDot = document.querySelector(".status-dot");
    const statusText = document.querySelector(".judge-status span:last-child");

    statusDot.className = "status-dot running";
    statusText.textContent = "Evaluating...";

    // Show reasoning steps progressively
    outputEl.innerHTML = `
        <div class="judge-reasoning">
            <h4>Judge Reasoning</h4>
            <div class="reasoning-steps" id="reasoning-steps"></div>
        </div>
        <div class="judge-verdict" id="judge-verdict" style="display: none;">
            <h4>Evaluation Verdict</h4>
            <div class="verdict-scores" id="verdict-scores"></div>
        </div>
    `;

    const steps = [
        "Analyzing the question to understand what information is being requested...",
        "Examining the provided context for relevant facts and information...",
        "Comparing the response claims against the available context...",
        "Checking for unsupported statements or potential hallucinations...",
        "Evaluating how directly the response answers the original question..."
    ];

    const stepsEl = document.getElementById("reasoning-steps");

    for (let i = 0; i < steps.length; i++) {
        await sleep(600);
        stepsEl.innerHTML += `
            <div class="reasoning-step">
                <div class="step-number">${i + 1}</div>
                <div class="step-content">${steps[i]}</div>
            </div>
        `;
    }

    await sleep(400);

    // Show verdict
    const scores = {
        faithfulness: (0.75 + Math.random() * 0.2).toFixed(2),
        relevancy: (0.8 + Math.random() * 0.15).toFixed(2),
        hallucination: (Math.random() * 0.2).toFixed(2),
        overall: (0.78 + Math.random() * 0.15).toFixed(2)
    };

    const verdictEl = document.getElementById("judge-verdict");
    verdictEl.style.display = "block";

    document.getElementById("verdict-scores").innerHTML = `
        <div class="verdict-item">
            <div class="label">Faithfulness</div>
            <div class="score ${getScoreClass(parseFloat(scores.faithfulness))}">${scores.faithfulness}</div>
        </div>
        <div class="verdict-item">
            <div class="label">Relevancy</div>
            <div class="score ${getScoreClass(parseFloat(scores.relevancy))}">${scores.relevancy}</div>
        </div>
        <div class="verdict-item">
            <div class="label">Hallucination</div>
            <div class="score ${getScoreClass(parseFloat(scores.hallucination), true)}">${scores.hallucination}</div>
        </div>
        <div class="verdict-item">
            <div class="label">Overall Score</div>
            <div class="score ${getScoreClass(parseFloat(scores.overall))}">${scores.overall}</div>
        </div>
    `;

    statusDot.className = "status-dot complete";
    statusText.textContent = "Complete";
    judgeRunning = false;
}

function getScoreClass(score, inverted = false) {
    if (inverted) {
        return score < 0.1 ? "good" : score < 0.25 ? "warning" : "bad";
    }
    return score >= 0.8 ? "good" : score >= 0.6 ? "warning" : "bad";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    initMetricExplorer();
    initTestCaseBuilder();
    initRegressionDashboard();
    initJudgeSimulator();
    initCodeExamples();

    // Handle window resize for chart
    window.addEventListener("resize", () => {
        renderRegressionChart();
    });

    // Re-highlight code if Prism is available
    if (typeof Prism !== "undefined") {
        Prism.highlightAll();
    }
});
