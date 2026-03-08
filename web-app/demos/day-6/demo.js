// Day 6: LangChain Tools & Agents Demo

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
  });
});

// Tool data
const toolsData = {
  search: { icon: '&#128269;', name: 'web_search' },
  calculator: { icon: '&#129518;', name: 'calculator' },
  weather: { icon: '&#127782;', name: 'get_weather' },
  wikipedia: { icon: '&#128214;', name: 'wikipedia' },
  database: { icon: '&#128451;', name: 'query_database' }
};

// Selected tools state
let selectedTools = new Set();

// Tool Builder Logic
document.querySelectorAll('.add-tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const toolId = btn.dataset.tool;

    if (selectedTools.has(toolId)) {
      // Remove tool
      selectedTools.delete(toolId);
      btn.textContent = '+ Add';
      btn.classList.remove('added');
      btn.closest('.tool-card').classList.remove('selected');
    } else {
      // Add tool
      selectedTools.add(toolId);
      btn.textContent = 'Added';
      btn.classList.add('added');
      btn.closest('.tool-card').classList.add('selected');
    }

    updateSelectedToolsList();
  });
});

function updateSelectedToolsList() {
  const container = document.getElementById('selected-tools');
  const countEl = document.getElementById('tool-count');

  if (selectedTools.size === 0) {
    container.innerHTML = '<p class="placeholder">Click "+ Add" to add tools to your agent...</p>';
    countEl.textContent = '0 tools selected';
    return;
  }

  const html = Array.from(selectedTools).map(toolId => {
    const tool = toolsData[toolId];
    return `
      <div class="selected-tool">
        <span class="tool-icon">${tool.icon}</span>
        <span class="tool-name">${tool.name}</span>
        <button class="remove-tool-btn" data-tool="${toolId}">&times;</button>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
  countEl.textContent = `${selectedTools.size} tool${selectedTools.size > 1 ? 's' : ''} selected`;

  // Add remove handlers
  container.querySelectorAll('.remove-tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const toolId = btn.dataset.tool;
      selectedTools.delete(toolId);

      // Update add button
      const addBtn = document.querySelector(`.add-tool-btn[data-tool="${toolId}"]`);
      if (addBtn) {
        addBtn.textContent = '+ Add';
        addBtn.classList.remove('added');
        addBtn.closest('.tool-card').classList.remove('selected');
      }

      updateSelectedToolsList();
    });
  });
}

// Clear all tools
document.getElementById('clear-tools')?.addEventListener('click', () => {
  selectedTools.clear();

  document.querySelectorAll('.add-tool-btn').forEach(btn => {
    btn.textContent = '+ Add';
    btn.classList.remove('added');
    btn.closest('.tool-card').classList.remove('selected');
  });

  updateSelectedToolsList();
});

// Agent Simulator Data
const agentScenarios = {
  'weather-calc': {
    thinking: 'The user wants weather in Paris AND a temperature conversion. I need to:\n1. Get the weather in Paris\n2. Convert 22°C to Fahrenheit using calculation',
    toolCalls: [
      {
        name: 'get_weather',
        args: { city: 'Paris' },
        result: 'Paris: 18°C, Light rain'
      },
      {
        name: 'calculator',
        args: { expression: '22 * 9/5 + 32' },
        result: '71.6'
      }
    ],
    finalResponse: 'The current weather in Paris is 18°C with light rain. As for your conversion: 22°C equals 71.6°F.'
  },
  'search-wiki': {
    thinking: 'The user wants to know who won the 2024 Super Bowl (recent event) and when the team was founded (historical fact). I\'ll:\n1. Search for 2024 Super Bowl results\n2. Look up the winning team on Wikipedia',
    toolCalls: [
      {
        name: 'web_search',
        args: { query: '2024 Super Bowl winner' },
        result: 'The Kansas City Chiefs won Super Bowl LVIII on February 11, 2024, defeating the San Francisco 49ers 25-22 in overtime.'
      },
      {
        name: 'wikipedia',
        args: { topic: 'Kansas City Chiefs' },
        result: 'The Kansas City Chiefs are a professional American football team based in Kansas City, Missouri. The team was founded in 1960 as the Dallas Texans before relocating to Kansas City in 1963.'
      }
    ],
    finalResponse: 'The Kansas City Chiefs won Super Bowl LVIII (2024) on February 11, 2024, defeating the San Francisco 49ers 25-22 in overtime. The Chiefs were originally founded in 1960 as the Dallas Texans, then relocated to Kansas City in 1963.'
  },
  'multi-search': {
    thinking: 'The user wants to compare populations of two cities. I\'ll search for each city\'s population data.',
    toolCalls: [
      {
        name: 'web_search',
        args: { query: 'Tokyo population 2024' },
        result: 'Tokyo metropolitan area population: approximately 37.4 million (2024), making it the most populous metropolitan area in the world.'
      },
      {
        name: 'web_search',
        args: { query: 'New York City population 2024' },
        result: 'New York City population: approximately 8.3 million (2024). The NYC metropolitan area has about 19.6 million residents.'
      }
    ],
    finalResponse: 'Population comparison:\n\n**Tokyo:** ~37.4 million (metropolitan area) - the world\'s most populous metro area\n\n**New York City:** ~8.3 million (city proper), ~19.6 million (metropolitan area)\n\nTokyo\'s metropolitan population is nearly twice that of NYC\'s metro area, and over 4x the size of NYC proper.'
  },
  'simple': {
    thinking: 'Simple math calculation. I\'ll use the calculator tool.',
    toolCalls: [
      {
        name: 'calculator',
        args: { expression: '340 * 0.15' },
        result: '51'
      }
    ],
    finalResponse: '15% of 340 is **51**.'
  }
};

// Run Agent Simulation
document.getElementById('run-agent')?.addEventListener('click', () => {
  const querySelect = document.getElementById('user-query');
  const scenarioKey = querySelect.value;
  const scenario = agentScenarios[scenarioKey];
  const traceContainer = document.getElementById('agent-trace');

  // Clear and start
  traceContainer.innerHTML = '';

  let delay = 0;

  // Step 1: Thinking
  setTimeout(() => {
    traceContainer.innerHTML += `
      <div class="trace-step thinking">
        <div class="trace-label">Agent Thinking</div>
        <div class="trace-content">${scenario.thinking}</div>
      </div>
    `;
  }, delay);
  delay += 500;

  // Step 2: Tool calls
  scenario.toolCalls.forEach((call, idx) => {
    // Tool call
    setTimeout(() => {
      traceContainer.innerHTML += `
        <div class="trace-step tool-call">
          <div class="trace-label">Tool Call ${idx + 1}</div>
          <div class="trace-content">
            Calling <strong>${call.name}</strong>
            <pre>${JSON.stringify(call.args, null, 2)}</pre>
          </div>
        </div>
      `;
    }, delay);
    delay += 400;

    // Tool result
    setTimeout(() => {
      traceContainer.innerHTML += `
        <div class="trace-step tool-result">
          <div class="trace-label">Tool Result</div>
          <div class="trace-content">${call.result}</div>
        </div>
      `;
    }, delay);
    delay += 400;
  });

  // Step 3: Final response
  setTimeout(() => {
    traceContainer.innerHTML += `
      <div class="trace-step final">
        <div class="trace-label">Final Response</div>
        <div class="trace-content">${scenario.finalResponse.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
      </div>
    `;
  }, delay);
});
