// Day 10: CrewAI Advanced Demo

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTaskDemo();
  initToolBuilder();
  initFlowDemo();
});

// Tab Navigation
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// ==========================================
// Task Controls Demo
// ==========================================
function initTaskDemo() {
  const runBtn = document.getElementById('run-task-demo');
  const timeline = document.getElementById('task-timeline');
  const codeDisplay = document.getElementById('task-code');

  const options = {
    callback: document.getElementById('opt-callback'),
    human: document.getElementById('opt-human'),
    async: document.getElementById('opt-async'),
    validation: document.getElementById('opt-validation')
  };

  // Update code preview when options change
  Object.values(options).forEach(opt => {
    opt.addEventListener('change', () => updateTaskCode(options, codeDisplay));
  });

  runBtn.addEventListener('click', () => {
    runTaskDemo(options, timeline);
  });

  // Initial code update
  updateTaskCode(options, codeDisplay);
}

function updateTaskCode(options, codeDisplay) {
  let code = `task = Task(
    description="Analyze the market data",
    expected_output="Analysis report",
    agent=analyst`;

  if (options.callback.checked) {
    code += `,
    callback=log_completion`;
  }
  if (options.human.checked) {
    code += `,
    human_input=True`;
  }
  if (options.async.checked) {
    code += `,
    async_execution=True`;
  }
  if (options.validation.checked) {
    code += `,
    output_pydantic=AnalysisOutput`;
  }

  code += `
)`;

  codeDisplay.innerHTML = `<code>${code}</code>`;
}

async function runTaskDemo(options, timeline) {
  timeline.innerHTML = '';

  const events = [];

  // System start
  events.push({
    icon: '▶',
    type: 'system',
    label: 'CREW',
    message: 'Starting task execution...'
  });

  // Async check
  if (options.async.checked) {
    events.push({
      icon: '⚡',
      type: 'async',
      label: 'ASYNC',
      message: 'Task running in parallel mode'
    });
  }

  // Task execution
  events.push({
    icon: '⚙',
    type: 'system',
    label: 'TASK',
    message: 'Analyst starting: Analyze the market data'
  });

  events.push({
    icon: '💭',
    type: 'system',
    label: 'THINKING',
    message: 'Processing market data and identifying trends...'
  });

  events.push({
    icon: '📊',
    type: 'system',
    label: 'WORKING',
    message: 'Generating analysis report...'
  });

  // Validation check
  if (options.validation.checked) {
    events.push({
      icon: '✓',
      type: 'validation',
      label: 'VALIDATION',
      message: 'Validating output against AnalysisOutput schema...'
    });
    events.push({
      icon: '✓',
      type: 'validation',
      label: 'VALIDATION',
      message: 'Schema valid: {summary: str, confidence: float, recommendations: list}'
    });
  }

  // Human input check
  if (options.human.checked) {
    events.push({
      icon: '👤',
      type: 'human',
      label: 'HUMAN_INPUT',
      message: 'Pausing for human review and approval...'
    });
    events.push({
      icon: '👤',
      type: 'human',
      label: 'HUMAN_INPUT',
      message: 'Waiting for input... (simulated 2s delay)'
    });
    events.push({
      icon: '✓',
      type: 'human',
      label: 'APPROVED',
      message: 'Human approved. Continuing execution.'
    });
  }

  // Callback check
  if (options.callback.checked) {
    events.push({
      icon: '📞',
      type: 'callback',
      label: 'CALLBACK',
      message: 'Executing callback: log_completion(output)'
    });
    events.push({
      icon: '📝',
      type: 'callback',
      label: 'LOGGED',
      message: 'Task completed: Analysis report ready (1,247 tokens)'
    });
  }

  // Complete
  events.push({
    icon: '✅',
    type: 'system',
    label: 'COMPLETE',
    message: 'Task finished successfully'
  });

  // Animate events
  for (const event of events) {
    await addTimelineEvent(timeline, event);
    await sleep(event.type === 'human' && event.message.includes('Waiting') ? 2000 : 600);
  }
}

function addTimelineEvent(timeline, event) {
  return new Promise(resolve => {
    const div = document.createElement('div');
    div.className = 'timeline-event';
    div.innerHTML = `
      <div class="timeline-icon ${event.type}">${event.icon}</div>
      <div class="timeline-content">
        <div class="timeline-label">${event.label}</div>
        <div class="timeline-message">${event.message}</div>
      </div>
    `;
    timeline.appendChild(div);
    timeline.scrollTop = timeline.scrollHeight;
    setTimeout(resolve, 50);
  });
}

// ==========================================
// Tool Builder Demo
// ==========================================
function initToolBuilder() {
  const testBtn = document.getElementById('test-tool');
  const executionLog = document.getElementById('tool-execution');
  const codeDisplay = document.getElementById('tool-code');

  const inputs = {
    name: document.getElementById('tool-name'),
    description: document.getElementById('tool-description'),
    input: document.getElementById('tool-input'),
    retry: document.getElementById('tool-retry'),
    graceful: document.getElementById('tool-graceful')
  };

  // Update code on input change
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', () => updateToolCode(inputs, codeDisplay));
    input.addEventListener('change', () => updateToolCode(inputs, codeDisplay));
  });

  testBtn.addEventListener('click', () => {
    runToolTest(inputs, executionLog);
  });

  // Initial code update
  updateToolCode(inputs, codeDisplay);
}

function updateToolCode(inputs, codeDisplay) {
  const name = inputs.name.value || 'my_tool';
  const description = inputs.description.value || 'Tool description';
  const inputParam = inputs.input.value || 'query';

  let code = `class ${toPascalCase(name)}Tool(BaseTool):
    name: str = "${name}"
    description: str = """${description}"""

    def _run(self, ${inputParam}: str) -> str:`;

  if (inputs.retry.checked) {
    code = `from tenacity import retry, stop_after_attempt

class ${toPascalCase(name)}Tool(BaseTool):
    name: str = "${name}"
    description: str = """${description}"""

    @retry(stop=stop_after_attempt(3))
    def _run(self, ${inputParam}: str) -> str:`;
  }

  if (inputs.graceful.checked) {
    code += `
        try:
            result = self._fetch_data(${inputParam})
            return result
        except Exception as e:
            return f"Error: {str(e)}"`;
  } else {
    code += `
        result = self._fetch_data(${inputParam})
        return result`;
  }

  codeDisplay.innerHTML = `<code>${escapeHtml(code)}</code>`;
}

async function runToolTest(inputs, executionLog) {
  executionLog.innerHTML = '';

  const toolName = inputs.name.value || 'my_tool';
  const inputParam = inputs.input.value || 'query';

  const logs = [
    { type: 'info', text: `Agent deciding to use tool: ${toolName}` },
    { type: 'input', text: `Tool called with ${inputParam}="AAPL"` },
  ];

  if (inputs.retry.checked) {
    logs.push({ type: 'info', text: 'Retry wrapper enabled (max 3 attempts)' });
  }

  // Simulate potential failure and retry
  const shouldFail = Math.random() < 0.3;

  if (shouldFail && inputs.retry.checked) {
    logs.push({ type: 'error', text: 'Attempt 1: Connection timeout' });
    logs.push({ type: 'info', text: 'Retrying in 1s...' });
    logs.push({ type: 'info', text: 'Attempt 2: Fetching data...' });
  }

  logs.push({ type: 'info', text: 'Fetching data from API...' });

  if (shouldFail && !inputs.retry.checked && inputs.graceful.checked) {
    logs.push({ type: 'error', text: 'Error: Connection timeout' });
    logs.push({ type: 'output', text: 'Returned: "Error: Connection timeout. Try again later."' });
  } else if (shouldFail && !inputs.retry.checked && !inputs.graceful.checked) {
    logs.push({ type: 'error', text: 'Exception: ConnectionError - timeout' });
    logs.push({ type: 'error', text: 'Agent execution failed!' });
  } else {
    logs.push({ type: 'output', text: 'Returned: "AAPL: $178.50, +1.2%, 45M volume"' });
    logs.push({ type: 'info', text: 'Agent received tool output successfully' });
  }

  for (const log of logs) {
    await addLogLine(executionLog, log);
    await sleep(400);
  }
}

function addLogLine(container, log) {
  return new Promise(resolve => {
    const div = document.createElement('div');
    div.className = `log-line ${log.type}`;
    div.textContent = log.text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    setTimeout(resolve, 50);
  });
}

// ==========================================
// Flow Visualizer Demo
// ==========================================
function initFlowDemo() {
  const runBtn = document.getElementById('run-flow');
  const confidenceSlider = document.getElementById('confidence-level');
  const confidenceValue = document.getElementById('confidence-value');
  const stateDisplay = document.getElementById('flow-state-display');
  const executionLog = document.getElementById('flow-execution-log');

  const nodes = {
    start: document.getElementById('node-start'),
    analyze: document.getElementById('node-analyze'),
    router: document.getElementById('node-router'),
    approve: document.getElementById('node-approve'),
    review: document.getElementById('node-review')
  };

  const arrows = {
    arrow1: document.getElementById('arrow-1'),
    arrow2: document.getElementById('arrow-2'),
    arrowApprove: document.getElementById('arrow-approve'),
    arrowReview: document.getElementById('arrow-review')
  };

  confidenceSlider.addEventListener('input', () => {
    confidenceValue.textContent = confidenceSlider.value + '%';
  });

  runBtn.addEventListener('click', () => {
    const confidence = parseInt(confidenceSlider.value) / 100;
    runFlowDemo(confidence, nodes, arrows, stateDisplay, executionLog);
  });
}

async function runFlowDemo(confidence, nodes, arrows, stateDisplay, executionLog) {
  // Reset all nodes
  Object.values(nodes).forEach(node => {
    node.classList.remove('active', 'complete', 'skipped');
    node.querySelector('.node-status').textContent = 'Waiting';
  });
  Object.values(arrows).forEach(arrow => {
    arrow.classList.remove('active');
  });

  executionLog.innerHTML = '';
  stateDisplay.textContent = '{}';

  let state = {};

  // Step 1: @start - gather_data
  await addLogLine(executionLog, { type: 'info', text: 'Flow started' });
  nodes.start.classList.add('active');
  nodes.start.querySelector('.node-status').textContent = 'Running...';
  await sleep(800);

  state = { data: 'Market analysis data collected' };
  stateDisplay.textContent = JSON.stringify(state, null, 2);
  await addLogLine(executionLog, { type: 'output', text: '@start gather_data completed' });

  nodes.start.classList.remove('active');
  nodes.start.classList.add('complete');
  nodes.start.querySelector('.node-status').textContent = 'Complete';
  arrows.arrow1.classList.add('active');
  await sleep(400);

  // Step 2: @listen - analyze_data
  nodes.analyze.classList.add('active');
  nodes.analyze.querySelector('.node-status').textContent = 'Running...';
  await addLogLine(executionLog, { type: 'info', text: '@listen(gather_data) triggered' });
  await sleep(800);

  state.confidence = confidence;
  state.analysis = 'Trends identified';
  stateDisplay.textContent = JSON.stringify(state, null, 2);
  await addLogLine(executionLog, { type: 'output', text: `Analysis complete, confidence: ${(confidence * 100).toFixed(0)}%` });

  nodes.analyze.classList.remove('active');
  nodes.analyze.classList.add('complete');
  nodes.analyze.querySelector('.node-status').textContent = 'Complete';
  arrows.arrow2.classList.add('active');
  await sleep(400);

  // Step 3: @router - route_by_confidence
  nodes.router.classList.add('active');
  nodes.router.querySelector('.node-status').textContent = 'Routing...';
  await addLogLine(executionLog, { type: 'info', text: '@router evaluating confidence level...' });
  await sleep(600);

  const route = confidence > 0.8 ? 'approve' : 'review';
  await addLogLine(executionLog, { type: 'info', text: `Routing decision: "${route}"` });

  nodes.router.classList.remove('active');
  nodes.router.classList.add('complete');
  nodes.router.querySelector('.node-status').textContent = `→ ${route}`;
  await sleep(400);

  // Step 4: Branch based on route
  if (route === 'approve') {
    arrows.arrowApprove.classList.add('active');
    nodes.review.classList.add('skipped');
    nodes.review.querySelector('.node-status').textContent = 'Skipped';

    await sleep(300);
    nodes.approve.classList.add('active');
    nodes.approve.querySelector('.node-status').textContent = 'Running...';
    await addLogLine(executionLog, { type: 'info', text: '@listen("approve") triggered' });
    await sleep(600);

    state.status = 'approved';
    state.process = 'auto';
    stateDisplay.textContent = JSON.stringify(state, null, 2);

    nodes.approve.classList.remove('active');
    nodes.approve.classList.add('complete');
    nodes.approve.querySelector('.node-status').textContent = 'Complete';
    await addLogLine(executionLog, { type: 'output', text: 'Auto-approved! Flow complete.' });
  } else {
    arrows.arrowReview.classList.add('active');
    nodes.approve.classList.add('skipped');
    nodes.approve.querySelector('.node-status').textContent = 'Skipped';

    await sleep(300);
    nodes.review.classList.add('active');
    nodes.review.querySelector('.node-status').textContent = 'Running...';
    await addLogLine(executionLog, { type: 'info', text: '@listen("review") triggered' });
    await sleep(600);

    state.status = 'pending_review';
    state.process = 'manual';
    stateDisplay.textContent = JSON.stringify(state, null, 2);

    nodes.review.classList.remove('active');
    nodes.review.classList.add('complete');
    nodes.review.querySelector('.node-status').textContent = 'Complete';
    await addLogLine(executionLog, { type: 'output', text: 'Sent to human review. Flow complete.' });
  }

  await addLogLine(executionLog, { type: 'info', text: `Final state: ${JSON.stringify(state)}` });
}

// ==========================================
// Utilities
// ==========================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
