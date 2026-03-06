// Day 4: ReAct Pattern Demo

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initReactDemo();
  initPromptBuilder();
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

// ReAct Demo Visualization
function initReactDemo() {
  const runBtn = document.getElementById('run-react');
  const queryInput = document.getElementById('react-query');
  const traceContainer = document.getElementById('react-trace');

  // Sample ReAct traces for different queries
  const sampleTraces = {
    default: [
      { type: 'thought', content: 'The user wants to know 25% of Tokyo\'s population. I need to first find the current population of Tokyo, then calculate 25% of that number.' },
      { type: 'action', content: 'search("Tokyo population 2024")' },
      { type: 'observation', content: 'Tokyo, Japan has a population of approximately 13.96 million people in the city proper (2024 estimate). The Greater Tokyo Area has about 37.4 million.' },
      { type: 'thought', content: 'I found that Tokyo\'s population is about 13.96 million. Now I need to calculate 25% of this number.' },
      { type: 'action', content: 'calculate("13960000 * 0.25")' },
      { type: 'observation', content: '3490000' },
      { type: 'thought', content: 'I have calculated that 25% of 13.96 million is 3.49 million. I can now provide the complete answer with context.' },
      { type: 'answer', content: '25% of Tokyo\'s population is approximately 3.49 million people. This is based on Tokyo\'s current population of about 13.96 million (2024 city proper estimate).' }
    ],
    weather: [
      { type: 'thought', content: 'The user is asking about current weather. I need to search for real-time weather data.' },
      { type: 'action', content: 'search("Tokyo weather today")' },
      { type: 'observation', content: 'Tokyo Weather: 72°F (22°C), Partly Cloudy. Humidity: 65%. Wind: 8 mph NE.' },
      { type: 'thought', content: 'I have current weather data for Tokyo. I can provide a complete answer.' },
      { type: 'answer', content: 'The current weather in Tokyo is 72°F (22°C) and partly cloudy, with 65% humidity and light winds from the northeast at 8 mph.' }
    ],
    math: [
      { type: 'thought', content: 'This is a straightforward calculation. I\'ll use the calculate tool to get the exact answer.' },
      { type: 'action', content: 'calculate("(15 * 23) + (47 / 2)")' },
      { type: 'observation', content: '368.5' },
      { type: 'thought', content: 'The calculation is complete. I can provide the answer.' },
      { type: 'answer', content: 'The result of (15 × 23) + (47 ÷ 2) is 368.5' }
    ]
  };

  runBtn.addEventListener('click', () => {
    const query = queryInput.value.toLowerCase();

    // Select appropriate trace based on query content
    let trace = sampleTraces.default;
    if (query.includes('weather')) {
      trace = sampleTraces.weather;
    } else if (query.match(/^\d|calculate|math|\+|\-|\*|\//)) {
      trace = sampleTraces.math;
    }

    runReactVisualization(trace, traceContainer);
  });
}

async function runReactVisualization(trace, container) {
  container.innerHTML = '';

  for (let i = 0; i < trace.length; i++) {
    const step = trace[i];
    await delay(600);

    const stepEl = document.createElement('div');
    stepEl.className = 'trace-step';
    stepEl.dataset.type = step.type;

    stepEl.innerHTML = `
      <div class="step-label">${step.type}</div>
      <div class="step-content">${step.content}</div>
    `;

    container.appendChild(stepEl);
    container.scrollTop = container.scrollHeight;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Prompt Builder
function initPromptBuilder() {
  const formatSpec = document.getElementById('format-spec');
  const toolsSpec = document.getElementById('tools-spec');
  const guidelinesSpec = document.getElementById('guidelines-spec');
  const completePrompt = document.getElementById('complete-prompt');
  const copyBtn = document.getElementById('copy-prompt');

  function updatePrompt() {
    const prompt = `You are a helpful assistant using the ReAct pattern.

${formatSpec.value}

${toolsSpec.value}

${guidelinesSpec.value}`;

    completePrompt.textContent = prompt;
  }

  // Update on input
  [formatSpec, toolsSpec, guidelinesSpec].forEach(el => {
    el.addEventListener('input', updatePrompt);
  });

  // Initial update
  updatePrompt();

  // Copy button
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(completePrompt.textContent);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
}
