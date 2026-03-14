// Day 12: OpenAI Agents SDK Demo
// Demonstrates Agents, Tools, Handoffs, and Guardrails

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAgentToolsDemo();
  initHandoffsDemo();
  initGuardrailsDemo();
  initCodeBuilder();
});

// Tab Navigation
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// Agent + Tools Demo
function initAgentToolsDemo() {
  const taskSelect = document.getElementById('agent-task');
  const customTaskGroup = document.getElementById('custom-task-group');
  const runBtn = document.getElementById('run-agent');
  const resetBtn = document.getElementById('reset-agent');

  taskSelect.addEventListener('change', () => {
    customTaskGroup.classList.toggle('hidden', taskSelect.value !== 'custom');
  });

  runBtn.addEventListener('click', runAgentDemo);
  resetBtn.addEventListener('click', resetAgentDemo);
}

async function runAgentDemo() {
  const taskSelect = document.getElementById('agent-task');
  const flowContainer = document.getElementById('execution-flow');

  let task = taskSelect.value;
  if (task === 'custom') {
    task = document.getElementById('custom-task').value || 'Hello!';
  }

  flowContainer.innerHTML = '';

  const steps = getAgentSteps(task);

  for (const step of steps) {
    await delay(step.delay || 600);
    addFlowStep(flowContainer, step);
  }
}

function getAgentSteps(task) {
  const scenarios = {
    weather: [
      { type: 'user', label: 'User Input', content: "What's the weather in San Francisco?" },
      { type: 'thinking', label: 'Agent Processing', content: 'Analyzing request... need weather data for San Francisco.' },
      { type: 'tool-call', label: 'Tool Call', content: '<code>get_weather(city="San Francisco")</code>' },
      { type: 'tool-result', label: 'Tool Result', content: '"San Francisco: 65°F, Partly Cloudy"' },
      { type: 'response', label: 'Agent Response', content: 'The weather in San Francisco is currently 65°F and partly cloudy.' }
    ],
    stock: [
      { type: 'user', label: 'User Input', content: "What's Apple's stock price?" },
      { type: 'thinking', label: 'Agent Processing', content: 'User wants stock price. Apple ticker is AAPL.' },
      { type: 'tool-call', label: 'Tool Call', content: '<code>get_stock_price(ticker="AAPL")</code>' },
      { type: 'tool-result', label: 'Tool Result', content: '"AAPL: $178.50"' },
      { type: 'response', label: 'Agent Response', content: "Apple's stock (AAPL) is currently trading at $178.50." }
    ],
    multi: [
      { type: 'user', label: 'User Input', content: "Weather in NYC and GOOGL stock price?" },
      { type: 'thinking', label: 'Agent Processing', content: 'Two requests: weather for NYC and stock for GOOGL. Will call both tools.' },
      { type: 'tool-call', label: 'Tool Call #1', content: '<code>get_weather(city="New York")</code>' },
      { type: 'tool-result', label: 'Tool Result #1', content: '"New York: 42°F, Clear"' },
      { type: 'tool-call', label: 'Tool Call #2', content: '<code>get_stock_price(ticker="GOOGL")</code>' },
      { type: 'tool-result', label: 'Tool Result #2', content: '"GOOGL: $141.80"' },
      { type: 'response', label: 'Agent Response', content: "The weather in New York is 42°F and clear. Google's stock (GOOGL) is trading at $141.80." }
    ],
    custom: [
      { type: 'user', label: 'User Input', content: document.getElementById('custom-task')?.value || 'Hello!' },
      { type: 'thinking', label: 'Agent Processing', content: 'Processing your request...' },
      { type: 'response', label: 'Agent Response', content: 'In a real scenario, the agent would use its tools to help with your request.' }
    ]
  };

  return scenarios[task] || scenarios.custom;
}

function addFlowStep(container, step) {
  const div = document.createElement('div');
  div.className = `flow-step ${step.type}`;
  div.innerHTML = `
    <div class="step-label">${step.label}</div>
    <div class="step-content">${step.content}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function resetAgentDemo() {
  document.getElementById('execution-flow').innerHTML = '<div class="flow-placeholder">Click "Run Agent" to see the execution flow</div>';
}

// Handoffs Demo
function initHandoffsDemo() {
  const runBtn = document.getElementById('run-handoff');
  const resetBtn = document.getElementById('reset-handoff');

  runBtn.addEventListener('click', runHandoffDemo);
  resetBtn.addEventListener('click', resetHandoffDemo);
}

async function runHandoffDemo() {
  const messageSelect = document.getElementById('customer-message');
  const logContainer = document.getElementById('handoff-log');
  const triageCard = document.getElementById('triage-card');
  const specialistCard = document.getElementById('specialist-card');
  const handoffArrow = document.getElementById('handoff-arrow');

  const scenario = messageSelect.value;
  logContainer.innerHTML = '';
  specialistCard.classList.add('hidden');
  handoffArrow.classList.remove('visible');
  triageCard.classList.remove('active');

  const flow = getHandoffFlow(scenario);

  for (const step of flow) {
    await delay(step.delay || 800);

    if (step.action === 'activate-triage') {
      triageCard.classList.add('active');
    } else if (step.action === 'handoff') {
      triageCard.classList.remove('active');
      handoffArrow.classList.add('visible');
      await delay(400);
      showSpecialist(step.specialist);
      specialistCard.classList.remove('hidden');
      specialistCard.classList.add('active');
    } else if (step.action === 'message') {
      addHandoffMessage(logContainer, step);
    }
  }
}

function getHandoffFlow(scenario) {
  const flows = {
    billing: [
      { action: 'message', agent: 'Customer', text: 'I need help with my bill', type: 'user' },
      { action: 'activate-triage' },
      { action: 'message', agent: 'TriageAgent', text: 'This is a billing question. Transferring to billing specialist...', type: 'system' },
      { action: 'message', agent: 'System', text: 'Calling transfer_to_billing()', type: 'transfer' },
      { action: 'handoff', specialist: 'billing' },
      { action: 'message', agent: 'BillingAgent', text: "Hi! I'm the billing specialist. I can help you with invoices, payments, and refunds. What's the issue with your bill?" }
    ],
    support: [
      { action: 'message', agent: 'Customer', text: "I can't login to my account", type: 'user' },
      { action: 'activate-triage' },
      { action: 'message', agent: 'TriageAgent', text: 'This is a technical support issue. Transferring to support...', type: 'system' },
      { action: 'message', agent: 'System', text: 'Calling transfer_to_support()', type: 'transfer' },
      { action: 'handoff', specialist: 'support' },
      { action: 'message', agent: 'SupportAgent', text: "I'm here to help with your login issue. Let me walk you through some troubleshooting steps. First, have you tried resetting your password?" }
    ],
    sales: [
      { action: 'message', agent: 'Customer', text: 'What plans do you offer?', type: 'user' },
      { action: 'activate-triage' },
      { action: 'message', agent: 'TriageAgent', text: "This is a sales inquiry. Transferring to sales team...", type: 'system' },
      { action: 'message', agent: 'System', text: 'Calling transfer_to_sales()', type: 'transfer' },
      { action: 'handoff', specialist: 'sales' },
      { action: 'message', agent: 'SalesAgent', text: "Great question! We have three plans: Starter ($29/mo), Pro ($99/mo), and Enterprise (custom pricing). What are your main needs?" }
    ],
    refund: [
      { action: 'message', agent: 'Customer', text: 'I want a refund', type: 'user' },
      { action: 'activate-triage' },
      { action: 'message', agent: 'TriageAgent', text: 'Refund request is a billing matter. Transferring to billing...', type: 'system' },
      { action: 'message', agent: 'System', text: 'Calling transfer_to_billing()', type: 'transfer' },
      { action: 'handoff', specialist: 'billing' },
      { action: 'message', agent: 'BillingAgent', text: "I can help with your refund request. Could you provide your order number or the email associated with your account?" }
    ]
  };

  return flows[scenario] || flows.billing;
}

function showSpecialist(type) {
  const icon = document.getElementById('specialist-icon');
  const name = document.getElementById('specialist-name');
  const role = document.getElementById('specialist-role');

  const specialists = {
    billing: { icon: '&#128176;', name: 'BillingAgent', role: 'Handles payments & invoices' },
    support: { icon: '&#128736;', name: 'SupportAgent', role: 'Technical troubleshooting' },
    sales: { icon: '&#128200;', name: 'SalesAgent', role: 'Plans & pricing' }
  };

  const spec = specialists[type] || specialists.billing;
  icon.innerHTML = spec.icon;
  name.textContent = spec.name;
  role.textContent = spec.role;
}

function addHandoffMessage(container, step) {
  const div = document.createElement('div');
  div.className = `handoff-message ${step.type || ''}`;
  div.innerHTML = `
    <div class="msg-agent">${step.agent}</div>
    <div class="msg-text">${step.text}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function resetHandoffDemo() {
  document.getElementById('handoff-log').innerHTML = '<div class="log-placeholder">Start a conversation to see the handoff flow</div>';
  document.getElementById('specialist-card').classList.add('hidden');
  document.getElementById('handoff-arrow').classList.remove('visible');
  document.getElementById('triage-card').classList.remove('active');
}

// Guardrails Demo
function initGuardrailsDemo() {
  document.getElementById('test-input').addEventListener('click', testInputGuardrail);
  document.getElementById('test-output').addEventListener('click', testOutputGuardrail);
}

function testInputGuardrail() {
  const inputSelect = document.getElementById('input-test');
  const resultDiv = document.getElementById('input-result');
  const value = inputSelect.value;

  const tests = {
    safe: { passed: true, message: 'Input is safe. Proceeding to agent.' },
    injection1: { passed: false, message: 'Blocked: Detected "ignore previous" pattern - potential prompt injection.' },
    injection2: { passed: false, message: 'Blocked: Detected "system:" and role manipulation attempt.' },
    safe2: { passed: true, message: 'Input is safe. Proceeding to agent.' }
  };

  const result = tests[value] || tests.safe;
  showGuardrailResult(resultDiv, result);
}

function testOutputGuardrail() {
  const outputSelect = document.getElementById('output-test');
  const resultDiv = document.getElementById('output-result');
  const value = outputSelect.value;

  const tests = {
    safe: { passed: true, message: 'Response is safe to send.' },
    ssn: { passed: false, message: 'Blocked: Response contains SSN pattern (###-##-####).' },
    card: { passed: false, message: 'Blocked: Response contains credit card number pattern.' },
    safe2: { passed: true, message: 'Response is safe to send.' }
  };

  const result = tests[value] || tests.safe;
  showGuardrailResult(resultDiv, result);
}

function showGuardrailResult(container, result) {
  container.innerHTML = `
    <div class="${result.passed ? 'result-pass' : 'result-fail'}">
      <div class="result-status ${result.passed ? 'pass' : 'fail'}">
        ${result.passed ? '&#10004; PASSED' : '&#10006; BLOCKED'}
      </div>
      <div class="result-message">${result.message}</div>
    </div>
  `;
}

// Code Builder
function initCodeBuilder() {
  const patternRadios = document.querySelectorAll('input[name="pattern"]');
  const generateBtn = document.getElementById('generate-code');
  const copyBtn = document.getElementById('copy-code');
  const toolsSection = document.getElementById('tools-section');
  const handoffSection = document.getElementById('handoff-agents-section');

  patternRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      toolsSection.style.display = (radio.value === 'basic' || radio.value === 'streaming') ? 'block' : 'none';
      handoffSection.style.display = radio.value === 'handoffs' ? 'block' : 'none';
      generateCode();
    });
  });

  document.querySelectorAll('.builder-config input, .builder-config select').forEach(el => {
    el.addEventListener('change', generateCode);
  });

  generateBtn.addEventListener('click', generateCode);
  copyBtn.addEventListener('click', copyCode);

  generateCode();
}

function generateCode() {
  const pattern = document.querySelector('input[name="pattern"]:checked').value;
  const model = document.getElementById('model-select').value;

  let code = '';

  switch (pattern) {
    case 'basic':
      code = generateBasicCode(model);
      break;
    case 'handoffs':
      code = generateHandoffsCode(model);
      break;
    case 'guardrails':
      code = generateGuardrailsCode(model);
      break;
    case 'streaming':
      code = generateStreamingCode(model);
      break;
  }

  document.getElementById('generated-code').querySelector('code').textContent = code;
}

function generateBasicCode(model) {
  const tools = [];
  if (document.getElementById('tool-weather').checked) tools.push('get_weather');
  if (document.getElementById('tool-stock').checked) tools.push('get_stock_price');
  if (document.getElementById('tool-search').checked) tools.push('search_docs');

  const toolDefs = [];
  if (tools.includes('get_weather')) {
    toolDefs.push(`def get_weather(city: str) -> str:
    """Get current weather for a city."""
    # Your implementation here
    return f"Weather in {city}: 72°F, Sunny"`);
  }
  if (tools.includes('get_stock_price')) {
    toolDefs.push(`def get_stock_price(ticker: str) -> str:
    """Get current stock price for a ticker symbol."""
    # Your implementation here
    return f"{ticker}: $150.00"`);
  }
  if (tools.includes('search_docs')) {
    toolDefs.push(`def search_docs(query: str) -> str:
    """Search documentation for relevant information."""
    # Your implementation here
    return f"Found results for: {query}"`);
  }

  return `from agents import Agent, Runner

# Define tools as plain functions
${toolDefs.join('\n\n')}

# Create agent with instructions and tools
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant. Use the available tools to help users.",
    model="${model}",
    tools=[${tools.join(', ')}]
)

# Run the agent
result = Runner.run_sync(agent, "Your message here")
print(result.final_output)`;
}

function generateHandoffsCode(model) {
  const agents = [];
  if (document.getElementById('agent-sales').checked) agents.push({ name: 'SalesAgent', desc: 'sales inquiries', instructions: 'Handle sales questions. Be enthusiastic about products.' });
  if (document.getElementById('agent-support').checked) agents.push({ name: 'SupportAgent', desc: 'technical support', instructions: 'Help with technical issues. Be patient and thorough.' });
  if (document.getElementById('agent-billing').checked) agents.push({ name: 'BillingAgent', desc: 'billing questions', instructions: 'Handle billing and payments. Be precise with amounts.' });

  const agentDefs = agents.map(a => `${a.name.toLowerCase()} = Agent(
    name="${a.name}",
    instructions="${a.instructions}",
    model="${model}"
)`).join('\n\n');

  const handoffFns = agents.map(a => `def transfer_to_${a.name.toLowerCase().replace('agent', '')}():
    """Transfer to ${a.desc}."""
    return ${a.name.toLowerCase()}`).join('\n\n');

  const toolsList = agents.map(a => `transfer_to_${a.name.toLowerCase().replace('agent', '')}`).join(', ');

  return `from agents import Agent, Runner

# Define specialist agents
${agentDefs}

# Define handoff functions
${handoffFns}

# Triage agent routes to specialists
triage_agent = Agent(
    name="TriageAgent",
    instructions="""You are the first point of contact.
    Determine what the user needs and transfer to the right team.""",
    model="${model}",
    tools=[${toolsList}]
)

# Start conversation
result = Runner.run_sync(triage_agent, "Customer message here")
print(result.final_output)`;
}

function generateGuardrailsCode(model) {
  return `from agents import Agent, Runner, InputGuardrail, OutputGuardrail, GuardrailResult
import re

# Input guardrail: Block prompt injection
async def block_injection(input_text: str) -> GuardrailResult:
    """Detect potential prompt injection attempts."""
    patterns = [
        r"ignore (all )?(previous|prior|above)",
        r"you are now",
        r"system:",
    ]
    for pattern in patterns:
        if re.search(pattern, input_text.lower()):
            return GuardrailResult(
                passed=False,
                message="I can't process that type of request."
            )
    return GuardrailResult(passed=True)

# Output guardrail: Filter PII
async def filter_pii(output_text: str) -> GuardrailResult:
    """Block responses containing PII patterns."""
    pii_patterns = [
        r'\\b\\d{3}-\\d{2}-\\d{4}\\b',  # SSN
        r'\\b\\d{16}\\b',                # Credit card
    ]
    for pattern in pii_patterns:
        if re.search(pattern, output_text):
            return GuardrailResult(
                passed=False,
                message="Response contained sensitive information."
            )
    return GuardrailResult(passed=True)

# Create guarded agent
agent = Agent(
    name="SecureAssistant",
    instructions="You are a helpful assistant. Never reveal sensitive information.",
    model="${model}",
    input_guardrails=[InputGuardrail(func=block_injection)],
    output_guardrails=[OutputGuardrail(func=filter_pii)]
)

# Run the agent
result = Runner.run_sync(agent, "Your message here")
print(result.final_output)`;
}

function generateStreamingCode(model) {
  const tools = [];
  if (document.getElementById('tool-weather').checked) tools.push('get_weather');
  if (document.getElementById('tool-stock').checked) tools.push('get_stock_price');
  if (document.getElementById('tool-search').checked) tools.push('search_docs');

  return `import asyncio
from agents import Agent, Runner

# Define your tools here (see Basic Agent example)
${tools.length > 0 ? `# Tools: ${tools.join(', ')}` : '# No tools selected'}

agent = Agent(
    name="StreamingBot",
    instructions="You are a helpful assistant.",
    model="${model}"${tools.length > 0 ? `,
    tools=[${tools.join(', ')}]` : ''}
)

async def stream_response():
    """Stream agent responses for real-time display."""
    print("Response: ", end="", flush=True)

    async for event in Runner.run_streamed(
        agent,
        "Your message here"
    ):
        if event.type == "text":
            print(event.text, end="", flush=True)
        elif event.type == "tool_call":
            print(f"\\n[Calling: {event.tool_name}]", end="")
        elif event.type == "tool_result":
            print(f" -> Done", end="")

    print()  # Final newline

# Run the streaming example
asyncio.run(stream_response())`;
}

function copyCode() {
  const code = document.getElementById('generated-code').querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-code');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy to Clipboard', 2000);
  });
}

// Utilities
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
