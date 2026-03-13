// Day 11: AutoGen/AG2 Demo
// Simulates conversational multi-agent patterns

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTwoAgentDemo();
  initGroupChatDemo();
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

// Two-Agent Demo
function initTwoAgentDemo() {
  const taskSelect = document.getElementById('task-input');
  const customTaskGroup = document.getElementById('custom-task-group');
  const runBtn = document.getElementById('run-two-agent');
  const resetBtn = document.getElementById('reset-two-agent');

  taskSelect.addEventListener('change', () => {
    customTaskGroup.classList.toggle('hidden', taskSelect.value !== 'custom');
  });

  runBtn.addEventListener('click', runTwoAgentConversation);
  resetBtn.addEventListener('click', resetTwoAgent);
}

async function runTwoAgentConversation() {
  const taskSelect = document.getElementById('task-input');
  const humanMode = document.getElementById('human-mode').value;
  const messagesContainer = document.getElementById('chat-messages');
  const executionLog = document.getElementById('execution-log');
  const assistantStatus = document.getElementById('assistant-status');
  const proxyStatus = document.getElementById('proxy-status');

  let task = taskSelect.value;
  if (task === 'custom') {
    task = document.getElementById('custom-task').value || 'Calculate 2 + 2';
  }

  // Clear previous
  messagesContainer.innerHTML = '';
  executionLog.innerHTML = '';

  // Simulate conversation based on task
  const conversations = getConversationScript(task, humanMode);

  for (const msg of conversations) {
    await delay(msg.delay || 800);

    if (msg.type === 'status') {
      if (msg.agent === 'assistant') {
        assistantStatus.textContent = msg.text;
        assistantStatus.classList.add('active');
      } else {
        proxyStatus.textContent = msg.text;
        proxyStatus.classList.add('active');
      }
    } else if (msg.type === 'message') {
      addMessage(messagesContainer, msg);
      assistantStatus.classList.remove('active');
      proxyStatus.classList.remove('active');
    } else if (msg.type === 'execution') {
      addExecutionLog(executionLog, msg);
    } else if (msg.type === 'human-input' && humanMode === 'ALWAYS') {
      await showHumanInput(messagesContainer);
    }
  }

  assistantStatus.textContent = 'Conversation complete';
  proxyStatus.textContent = 'TERMINATE received';
}

function getConversationScript(task, humanMode) {
  const scripts = {
    fibonacci: [
      { type: 'status', agent: 'proxy', text: 'Sending task...', delay: 300 },
      { type: 'message', agent: 'proxy', text: 'Calculate the 20th Fibonacci number and verify the result.', direction: 'right' },
      { type: 'status', agent: 'assistant', text: 'Generating response...', delay: 500 },
      { type: 'message', agent: 'assistant', text: "I'll calculate the 20th Fibonacci number using Python.", direction: 'left', hasCode: true, code: `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

result = fibonacci(20)
print(f"The 20th Fibonacci number is: {result}")` },
      { type: 'status', agent: 'proxy', text: 'Executing code...', delay: 600 },
      { type: 'execution', output: 'The 20th Fibonacci number is: 6765', exitCode: 0 },
      { type: 'message', agent: 'proxy', text: 'exitcode: 0 (execution succeeded)\nOutput: The 20th Fibonacci number is: 6765', direction: 'right' },
      { type: 'status', agent: 'assistant', text: 'Analyzing results...', delay: 400 },
      { type: 'message', agent: 'assistant', text: 'The 20th Fibonacci number is **6765**.\n\nTo verify: The sequence goes 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765.\n\nTERMINATE', direction: 'left' }
    ],
    sort: [
      { type: 'status', agent: 'proxy', text: 'Sending task...', delay: 300 },
      { type: 'message', agent: 'proxy', text: 'Sort this list and find the median: [34, 12, 89, 45, 23, 67, 1, 90, 56]', direction: 'right' },
      { type: 'status', agent: 'assistant', text: 'Generating response...', delay: 500 },
      { type: 'message', agent: 'assistant', text: "I'll sort the list and calculate the median.", direction: 'left', hasCode: true, code: `numbers = [34, 12, 89, 45, 23, 67, 1, 90, 56]
sorted_nums = sorted(numbers)
n = len(sorted_nums)
median = sorted_nums[n // 2] if n % 2 == 1 else (sorted_nums[n//2 - 1] + sorted_nums[n//2]) / 2
print(f"Sorted: {sorted_nums}")
print(f"Median: {median}")` },
      { type: 'status', agent: 'proxy', text: 'Executing code...', delay: 600 },
      { type: 'execution', output: 'Sorted: [1, 12, 23, 34, 45, 56, 67, 89, 90]\nMedian: 45', exitCode: 0 },
      { type: 'message', agent: 'proxy', text: 'exitcode: 0 (execution succeeded)\nOutput:\nSorted: [1, 12, 23, 34, 45, 56, 67, 89, 90]\nMedian: 45', direction: 'right' },
      { type: 'message', agent: 'assistant', text: 'The sorted list is [1, 12, 23, 34, 45, 56, 67, 89, 90] and the **median is 45** (the middle value of 9 numbers).\n\nTERMINATE', direction: 'left' }
    ],
    analyze: [
      { type: 'status', agent: 'proxy', text: 'Sending task...', delay: 300 },
      { type: 'message', agent: 'proxy', text: 'Analyze this sales data and find the top product:\nWidget A: $25.99 x 150 units\nWidget B: $45.50 x 80 units\nGadget X: $199.99 x 25 units', direction: 'right' },
      { type: 'status', agent: 'assistant', text: 'Generating analysis...', delay: 500 },
      { type: 'message', agent: 'assistant', text: "I'll calculate revenue for each product.", direction: 'left', hasCode: true, code: `products = [
    {"name": "Widget A", "price": 25.99, "qty": 150},
    {"name": "Widget B", "price": 45.50, "qty": 80},
    {"name": "Gadget X", "price": 199.99, "qty": 25}
]

for p in products:
    p["revenue"] = p["price"] * p["qty"]

sorted_prods = sorted(products, key=lambda x: x["revenue"], reverse=True)
for p in sorted_prods:
    print(f"{p['name']}: ${p['revenue']:.2f}")
print(f"\\nTop product: {sorted_prods[0]['name']}")` },
      { type: 'status', agent: 'proxy', text: 'Executing code...', delay: 600 },
      { type: 'execution', output: 'Gadget X: $4999.75\nWidget A: $3898.50\nWidget B: $3640.00\n\nTop product: Gadget X', exitCode: 0 },
      { type: 'message', agent: 'proxy', text: 'exitcode: 0 (execution succeeded)\nOutput:\nGadget X: $4999.75\nWidget A: $3898.50\nWidget B: $3640.00\n\nTop product: Gadget X', direction: 'right' },
      { type: 'message', agent: 'assistant', text: 'Analysis complete! **Gadget X** is the top product by revenue at **$4,999.75**, despite having the lowest unit sales.\n\nTERMINATE', direction: 'left' }
    ],
    custom: [
      { type: 'status', agent: 'proxy', text: 'Sending task...', delay: 300 },
      { type: 'message', agent: 'proxy', text: 'Custom task received...', direction: 'right' },
      { type: 'status', agent: 'assistant', text: 'Processing...', delay: 500 },
      { type: 'message', agent: 'assistant', text: "I'll work on this task step by step.\n\n[In a real scenario, the LLM would generate appropriate code based on your task.]\n\nTERMINATE", direction: 'left' }
    ]
  };

  return scripts[task] || scripts.custom;
}

function addMessage(container, msg) {
  const div = document.createElement('div');
  div.className = `message ${msg.direction}`;

  let content = `<div class="message-agent">${msg.agent === 'assistant' ? 'AssistantAgent' : 'UserProxyAgent'}</div>`;
  content += `<div class="message-text">${formatMessage(msg.text)}</div>`;

  if (msg.hasCode && msg.code) {
    content += `<pre class="message-code"><code>${escapeHtml(msg.code)}</code></pre>`;
  }

  div.innerHTML = content;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addExecutionLog(container, msg) {
  container.innerHTML = '';
  const div = document.createElement('div');
  div.className = `execution-entry ${msg.exitCode === 0 ? 'success' : 'error'}`;
  div.innerHTML = `
    <div class="exec-status">Exit code: ${msg.exitCode} ${msg.exitCode === 0 ? '(success)' : '(error)'}</div>
    <pre class="exec-output">${escapeHtml(msg.output)}</pre>
  `;
  container.appendChild(div);
}

async function showHumanInput(container) {
  return new Promise(resolve => {
    const div = document.createElement('div');
    div.className = 'human-input-prompt';
    div.innerHTML = `
      <div class="prompt-text">Human input requested. Approve or provide feedback:</div>
      <button class="btn-approve">Approve</button>
    `;
    container.appendChild(div);

    div.querySelector('.btn-approve').addEventListener('click', () => {
      div.remove();
      resolve();
    });
  });
}

function resetTwoAgent() {
  document.getElementById('chat-messages').innerHTML = '<div class="message-placeholder">Click "Start Conversation" to begin</div>';
  document.getElementById('execution-log').innerHTML = '<div class="log-empty">Code execution results will appear here</div>';
  document.getElementById('assistant-status').textContent = 'Waiting for task...';
  document.getElementById('proxy-status').textContent = 'Ready to execute';
}

// GroupChat Demo
function initGroupChatDemo() {
  const runBtn = document.getElementById('run-groupchat');
  const resetBtn = document.getElementById('reset-groupchat');

  runBtn.addEventListener('click', runGroupChat);
  resetBtn.addEventListener('click', resetGroupChat);
}

async function runGroupChat() {
  const scenario = document.getElementById('groupchat-scenario').value;
  const maxRounds = parseInt(document.getElementById('max-rounds').value);
  const agentsRing = document.getElementById('agents-ring');
  const log = document.getElementById('groupchat-log');
  const managerThinking = document.getElementById('manager-thinking');

  // Get agents for scenario
  const agents = getScenarioAgents(scenario);

  // Render agent ring
  renderAgentsRing(agentsRing, agents);

  // Clear log
  log.innerHTML = '';

  // Simulate conversation
  const conversation = getGroupChatScript(scenario, Math.min(maxRounds, 8));

  for (const turn of conversation) {
    // Show manager thinking
    managerThinking.textContent = `Selecting next speaker...`;
    managerThinking.classList.add('visible');
    await delay(600);

    managerThinking.textContent = `Selected: ${turn.agent}`;
    await delay(400);
    managerThinking.classList.remove('visible');

    // Highlight active agent
    highlightAgent(agentsRing, turn.agent);

    // Add to log
    addGroupChatMessage(log, turn);

    await delay(turn.delay || 1000);
  }

  // Final state
  managerThinking.textContent = 'Conversation complete';
  managerThinking.classList.add('visible');
}

function getScenarioAgents(scenario) {
  const scenarios = {
    'code-review': [
      { name: 'User', icon: '&#128100;', role: 'Initiates tasks' },
      { name: 'Coder', icon: '&#128187;', role: 'Writes code' },
      { name: 'Reviewer', icon: '&#128269;', role: 'Reviews code' },
      { name: 'Tester', icon: '&#9989;', role: 'Writes tests' }
    ],
    'research': [
      { name: 'User', icon: '&#128100;', role: 'Initiates research' },
      { name: 'Researcher', icon: '&#128218;', role: 'Gathers info' },
      { name: 'Fact-Checker', icon: '&#9989;', role: 'Verifies claims' },
      { name: 'Writer', icon: '&#9999;', role: 'Drafts content' }
    ],
    'debug': [
      { name: 'User', icon: '&#128100;', role: 'Reports bug' },
      { name: 'Developer', icon: '&#128187;', role: 'Analyzes code' },
      { name: 'Debugger', icon: '&#128027;', role: 'Finds issues' },
      { name: 'Tester', icon: '&#9989;', role: 'Validates fixes' }
    ]
  };
  return scenarios[scenario] || scenarios['code-review'];
}

function renderAgentsRing(container, agents) {
  container.innerHTML = '';
  const angleStep = 360 / agents.length;

  agents.forEach((agent, i) => {
    const div = document.createElement('div');
    div.className = 'ring-agent';
    div.dataset.name = agent.name;
    div.style.setProperty('--angle', `${i * angleStep}deg`);
    div.innerHTML = `
      <div class="ring-agent-icon">${agent.icon}</div>
      <div class="ring-agent-name">${agent.name}</div>
      <div class="ring-agent-role">${agent.role}</div>
    `;
    container.appendChild(div);
  });
}

function highlightAgent(container, agentName) {
  container.querySelectorAll('.ring-agent').forEach(a => {
    a.classList.toggle('active', a.dataset.name === agentName);
  });
}

function getGroupChatScript(scenario, maxRounds) {
  const scripts = {
    'code-review': [
      { agent: 'User', text: 'Create a function to validate email addresses', delay: 800 },
      { agent: 'Coder', text: "Here's an email validation function using regex:\n```python\nimport re\ndef validate_email(email):\n    pattern = r'^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$'\n    return bool(re.match(pattern, email))\n```\nReady for review.", delay: 1200 },
      { agent: 'Reviewer', text: "Good start, but the regex is too simple. It doesn't handle:\n- Plus signs (user+tag@domain.com)\n- Subdomains\n- Special TLDs\nPlease improve.", delay: 1000 },
      { agent: 'Coder', text: "Updated with better pattern:\n```python\ndef validate_email(email):\n    pattern = r'^[\\w\\+\\.-]+@([\\w-]+\\.)+[\\w-]{2,}$'\n    return bool(re.match(pattern, email))\n```", delay: 1000 },
      { agent: 'Reviewer', text: 'Much better! The pattern now handles common cases. Approved for testing.', delay: 800 },
      { agent: 'Tester', text: "Test results:\n- valid@email.com: PASS\n- user+tag@domain.co.uk: PASS\n- invalid@: FAIL (correctly rejected)\n- @nodomain.com: FAIL (correctly rejected)\n\nAll tests passing!", delay: 1200 },
      { agent: 'User', text: 'Great work team! TERMINATE', delay: 600 }
    ],
    'research': [
      { agent: 'User', text: "Research the impact of AI on software development jobs", delay: 800 },
      { agent: 'Researcher', text: "Found several studies:\n1. GitHub Copilot increases productivity by 55% (GitHub study)\n2. 37% of developers use AI tools daily (Stack Overflow 2024)\n3. AI won't replace developers but will change roles", delay: 1200 },
      { agent: 'Fact-Checker', text: "Verified:\n- GitHub study is legitimate (2023)\n- Stack Overflow survey is accurate\n- Claims about job transformation align with multiple sources", delay: 1000 },
      { agent: 'Writer', text: "Draft: AI is transforming software development by augmenting developer capabilities rather than replacing them. Studies show productivity gains of up to 55%...", delay: 1000 },
      { agent: 'Fact-Checker', text: "Draft looks accurate. Suggest adding source citations.", delay: 800 },
      { agent: 'Writer', text: "Updated with citations. Ready for review.", delay: 600 },
      { agent: 'User', text: 'TERMINATE', delay: 400 }
    ],
    'debug': [
      { agent: 'User', text: "There's a bug - users can't login with valid credentials", delay: 800 },
      { agent: 'Developer', text: "Looking at the login handler... Found the authentication function calls the database.", delay: 1000 },
      { agent: 'Debugger', text: "Found it! The password comparison uses == instead of a secure comparison function. This can cause timing attacks AND might fail with certain encodings.", delay: 1200 },
      { agent: 'Developer', text: "Fixed using hmac.compare_digest() for constant-time comparison:\n```python\nimport hmac\ndef verify_password(stored, provided):\n    return hmac.compare_digest(stored.encode(), provided.encode())\n```", delay: 1000 },
      { agent: 'Tester', text: "Tested with various credentials:\n- Valid login: PASS\n- Invalid password: FAIL (correctly rejected)\n- Unicode passwords: PASS\n\nBug is fixed!", delay: 1000 },
      { agent: 'User', text: 'TERMINATE', delay: 400 }
    ]
  };

  const script = scripts[scenario] || scripts['code-review'];
  return script.slice(0, maxRounds);
}

function addGroupChatMessage(container, turn) {
  const div = document.createElement('div');
  div.className = 'groupchat-message';
  div.innerHTML = `
    <div class="gc-agent">${turn.agent}</div>
    <div class="gc-text">${formatMessage(turn.text)}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function resetGroupChat() {
  document.getElementById('agents-ring').innerHTML = '';
  document.getElementById('groupchat-log').innerHTML = '<div class="log-empty">Start the GroupChat to see agent conversations</div>';
  document.getElementById('manager-thinking').textContent = 'Selecting speaker...';
  document.getElementById('manager-thinking').classList.remove('visible');
}

// Code Builder
function initCodeBuilder() {
  const patternRadios = document.querySelectorAll('input[name="pattern"]');
  const generateBtn = document.getElementById('generate-code');
  const copyBtn = document.getElementById('copy-code');
  const groupchatOptions = document.getElementById('groupchat-options');
  const addAgentBtn = document.getElementById('add-agent');

  patternRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      groupchatOptions.classList.toggle('hidden', radio.value !== 'groupchat');
      generateCode();
    });
  });

  document.querySelectorAll('.builder-config input, .builder-config select').forEach(el => {
    el.addEventListener('change', generateCode);
  });

  addAgentBtn.addEventListener('click', addAgentField);
  generateBtn.addEventListener('click', generateCode);
  copyBtn.addEventListener('click', copyCode);

  // Initial generation
  generateCode();
}

function addAgentField() {
  const list = document.getElementById('agent-list');
  const div = document.createElement('div');
  div.className = 'agent-item';
  div.innerHTML = `
    <input type="text" value="Agent" placeholder="Agent name">
    <input type="text" value="Your system message" placeholder="System message">
    <button class="btn-remove">X</button>
  `;
  div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
  list.appendChild(div);
}

function generateCode() {
  const pattern = document.querySelector('input[name="pattern"]:checked').value;
  const model = document.getElementById('model-select').value;
  const useDocker = document.getElementById('use-docker').checked;
  const enableExecution = document.getElementById('enable-execution').checked;
  const workDir = document.getElementById('work-dir').value;
  const humanMode = document.getElementById('builder-human-mode').value;

  let code = '';

  if (pattern === 'two-agent') {
    code = generateTwoAgentCode(model, useDocker, enableExecution, workDir, humanMode);
  } else if (pattern === 'groupchat') {
    const agents = getBuilderAgents();
    code = generateGroupChatCode(model, useDocker, workDir, humanMode, agents);
  } else if (pattern === 'tools') {
    code = generateToolsCode(model, humanMode);
  }

  document.getElementById('generated-code').querySelector('code').textContent = code;
}

function getBuilderAgents() {
  const items = document.querySelectorAll('#agent-list .agent-item');
  return Array.from(items).map(item => {
    const inputs = item.querySelectorAll('input');
    return { name: inputs[0].value, message: inputs[1].value };
  });
}

function generateTwoAgentCode(model, useDocker, enableExecution, workDir, humanMode) {
  return `import os
from autogen import AssistantAgent, UserProxyAgent

# Configure LLM
llm_config = {
    "model": "${model}",
    "api_key": os.environ["OPENAI_API_KEY"]
}

# Assistant agent - LLM-powered
assistant = AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message="""You are a helpful AI assistant.
    Solve tasks step by step. Write Python code when needed.
    Reply TERMINATE when the task is complete."""
)

# User proxy - executes code, manages conversation
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="${humanMode}",
    code_execution_config=${enableExecution ? `{
        "work_dir": "${workDir}",
        "use_docker": ${useDocker}
    }` : 'False'},
    is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", "")
)

# Start the conversation
result = user_proxy.initiate_chat(
    assistant,
    message="Your task here"
)`;
}

function generateGroupChatCode(model, useDocker, workDir, humanMode, agents) {
  const agentDefs = agents.map(a => `
${a.name.toLowerCase()} = AssistantAgent(
    name="${a.name}",
    system_message="${a.message}",
    llm_config=llm_config
)`).join('\n');

  const agentNames = agents.map(a => a.name.toLowerCase()).join(', ');

  return `import os
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

# Configure LLM
llm_config = {
    "model": "${model}",
    "api_key": os.environ["OPENAI_API_KEY"]
}

# Define specialized agents${agentDefs}

# User proxy for code execution
user_proxy = UserProxyAgent(
    name="User",
    human_input_mode="${humanMode}",
    code_execution_config={"work_dir": "${workDir}", "use_docker": ${useDocker}},
    is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", "")
)

# Create group chat
groupchat = GroupChat(
    agents=[user_proxy, ${agentNames}],
    messages=[],
    max_round=15,
    speaker_selection_method="auto"
)

# Manager coordinates speakers
manager = GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config
)

# Start the conversation
user_proxy.initiate_chat(
    manager,
    message="Your task here"
)`;
}

function generateToolsCode(model, humanMode) {
  return `import os
from typing import Annotated
from autogen import AssistantAgent, UserProxyAgent, register_function

# Configure LLM
llm_config = {
    "model": "${model}",
    "api_key": os.environ["OPENAI_API_KEY"]
}

# Define your tool
def my_tool(
    param: Annotated[str, "Description of the parameter"]
) -> str:
    """Description of what this tool does."""
    # Your implementation here
    return f"Result for {param}"

# Create agents
assistant = AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message="You are a helpful assistant. Use the available tools."
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="${humanMode}",
    code_execution_config=False,  # Tools only, no code execution
    is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", "")
)

# Register the tool
register_function(
    my_tool,
    caller=assistant,      # Agent that suggests tool calls
    executor=user_proxy,   # Agent that executes
    name="my_tool",
    description="Description for the LLM"
)

# Start conversation
user_proxy.initiate_chat(
    assistant,
    message="Your task here"
)`;
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatMessage(text) {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}
