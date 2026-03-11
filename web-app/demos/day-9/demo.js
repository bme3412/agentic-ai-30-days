// Day 9: CrewAI Multi-Agent Systems Demo

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initCrewDemo();
  initCrewBuilder();
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

// Crew Execution Demo
function initCrewDemo() {
  const runBtn = document.getElementById('run-crew');
  const topicInput = document.getElementById('crew-topic');
  const logContainer = document.getElementById('crew-log');

  const agentCards = {
    researcher: document.getElementById('agent-researcher'),
    analyst: document.getElementById('agent-analyst'),
    writer: document.getElementById('agent-writer')
  };

  runBtn.addEventListener('click', () => {
    const topic = topicInput.value || 'The future of renewable energy';
    runCrewVisualization(topic, logContainer, agentCards);
  });
}

async function runCrewVisualization(topic, logContainer, agentCards) {
  // Reset states
  logContainer.innerHTML = '';
  Object.values(agentCards).forEach(card => {
    card.classList.remove('active', 'complete');
    card.querySelector('.agent-status').textContent = 'Waiting';
  });

  const steps = [
    {
      type: 'system',
      message: `Starting crew execution for: "${topic}"`
    },
    {
      type: 'system',
      message: 'Process: Sequential | Agents: 3 | Tasks: 3'
    },
    {
      type: 'agent',
      agent: 'researcher',
      status: 'Working...',
      message: 'Researcher starting Task 1: Research'
    },
    {
      type: 'thought',
      agent: 'researcher',
      message: `I need to find comprehensive information about ${topic}. Let me search for current data and trends.`
    },
    {
      type: 'action',
      agent: 'researcher',
      message: `Searching: "${topic} statistics 2024"`
    },
    {
      type: 'action',
      agent: 'researcher',
      message: `Searching: "${topic} major players"`
    },
    {
      type: 'output',
      agent: 'researcher',
      message: 'Research complete: Found market data, key players, and emerging trends.'
    },
    {
      type: 'complete',
      agent: 'researcher',
      status: 'Complete',
      message: 'Task 1 complete. Passing output to next task.'
    },
    {
      type: 'agent',
      agent: 'analyst',
      status: 'Working...',
      message: 'Analyst starting Task 2: Analysis (context: research output)'
    },
    {
      type: 'thought',
      agent: 'analyst',
      message: 'I have the research findings. Now I need to identify key trends and insights.'
    },
    {
      type: 'action',
      agent: 'analyst',
      message: 'Analyzing market trends and growth patterns...'
    },
    {
      type: 'action',
      agent: 'analyst',
      message: 'Identifying strategic implications...'
    },
    {
      type: 'output',
      agent: 'analyst',
      message: 'Analysis complete: 3 key trends identified, investment implications outlined.'
    },
    {
      type: 'complete',
      agent: 'analyst',
      status: 'Complete',
      message: 'Task 2 complete. Passing output to final task.'
    },
    {
      type: 'agent',
      agent: 'writer',
      status: 'Working...',
      message: 'Writer starting Task 3: Writing (context: research + analysis)'
    },
    {
      type: 'thought',
      agent: 'writer',
      message: 'I have both research and analysis. Time to craft an executive summary.'
    },
    {
      type: 'action',
      agent: 'writer',
      message: 'Drafting executive summary...'
    },
    {
      type: 'action',
      agent: 'writer',
      message: 'Polishing language and structure...'
    },
    {
      type: 'output',
      agent: 'writer',
      message: 'Writing complete: Executive summary ready for publication.'
    },
    {
      type: 'complete',
      agent: 'writer',
      status: 'Complete',
      message: 'Task 3 complete.'
    },
    {
      type: 'success',
      message: 'Crew execution finished! All 3 tasks completed successfully.'
    }
  ];

  for (const step of steps) {
    await delay(500);

    // Update agent card states
    if (step.agent) {
      const card = agentCards[step.agent];
      if (step.type === 'agent') {
        card.classList.add('active');
        card.querySelector('.agent-status').textContent = step.status;
      } else if (step.type === 'complete') {
        card.classList.remove('active');
        card.classList.add('complete');
        card.querySelector('.agent-status').textContent = step.status;
      }
    }

    // Add log entry
    const entry = document.createElement('div');
    entry.className = `log-entry ${step.type}`;

    if (step.agent) {
      entry.innerHTML = `<span class="log-agent">${step.agent}</span> ${step.message}`;
    } else {
      entry.textContent = step.message;
    }

    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Crew Builder
function initCrewBuilder() {
  const processType = document.getElementById('process-type');
  const memoryEnabled = document.getElementById('memory-enabled');
  const generatedCode = document.getElementById('generated-code');
  const copyBtn = document.getElementById('copy-code');
  const addAgentBtn = document.getElementById('add-agent');

  let agentCount = 2;

  function updateCode() {
    const agents = [];
    const agentBuilders = document.querySelectorAll('.agent-builder');

    agentBuilders.forEach((builder, index) => {
      const role = builder.querySelector('.agent-role').value || `Agent ${index + 1}`;
      const goal = builder.querySelector('.agent-goal').value || 'Complete assigned tasks';
      const backstory = builder.querySelector('.agent-backstory').value || 'You are a helpful assistant.';

      const varName = role.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

      agents.push({
        varName,
        role,
        goal,
        backstory
      });
    });

    const process = processType.value;
    const memory = memoryEnabled.value === 'true';

    let code = `from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI

# Define agents
`;

    agents.forEach(agent => {
      code += `${agent.varName} = Agent(
    role="${agent.role}",
    goal="${agent.goal}",
    backstory="""${agent.backstory}""",
    llm=ChatOpenAI(model="gpt-4o"),
    verbose=True
)

`;
    });

    code += `# Define tasks
`;

    agents.forEach((agent, index) => {
      const taskName = `task_${index + 1}`;
      const contextStr = index > 0 ? `,\n    context=[task_${index}]` : '';
      code += `${taskName} = Task(
    description="Task description for ${agent.role}",
    expected_output="Expected deliverable",
    agent=${agent.varName}${contextStr}
)

`;
    });

    const agentVars = agents.map(a => a.varName).join(', ');
    const taskVars = agents.map((_, i) => `task_${i + 1}`).join(', ');
    const processStr = process === 'hierarchical'
      ? `Process.hierarchical,\n    manager_llm=ChatOpenAI(model="gpt-4o")`
      : 'Process.sequential';

    code += `# Create and run crew
crew = Crew(
    agents=[${agentVars}],
    tasks=[${taskVars}],
    process=${processStr},
    memory=${memory ? 'True' : 'False'},
    verbose=True
)

result = crew.kickoff(inputs={"topic": "Your topic here"})
print(result)`;

    generatedCode.textContent = code;
  }

  // Add event listeners
  processType.addEventListener('change', updateCode);
  memoryEnabled.addEventListener('change', updateCode);

  document.querySelectorAll('.agent-builder input, .agent-builder textarea').forEach(el => {
    el.addEventListener('input', updateCode);
  });

  addAgentBtn.addEventListener('click', () => {
    agentCount++;
    const newAgent = document.createElement('div');
    newAgent.className = 'agent-builder';
    newAgent.id = `agent-builder-${agentCount}`;
    newAgent.innerHTML = `
      <div class="builder-row">
        <label>Role:</label>
        <input type="text" class="agent-role" placeholder="e.g., Editor">
      </div>
      <div class="builder-row">
        <label>Goal:</label>
        <input type="text" class="agent-goal" placeholder="e.g., Ensure quality">
      </div>
      <div class="builder-row">
        <label>Backstory:</label>
        <textarea class="agent-backstory" rows="2" placeholder="e.g., You are a meticulous editor..."></textarea>
      </div>
    `;

    addAgentBtn.parentElement.insertBefore(newAgent, addAgentBtn);

    newAgent.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', updateCode);
    });

    updateCode();
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(generatedCode.textContent);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });

  // Initial code generation
  updateCode();
}
