// Day 7: LangGraph Demo - Interactive Graph Visualization

// ============================================
// Tab Navigation
// ============================================

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;

    // Update buttons
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update content
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
  });
});

// ============================================
// Graph Visualizer Tab
// ============================================

const agentState = {
  messages: [],
  iteration: 0,
  currentNode: null,
  isRunning: false,
  stepMode: false
};

const graphNodes = {
  start: document.getElementById('node-start'),
  agent: document.getElementById('node-agent'),
  decision: document.getElementById('node-decision'),
  tools: document.getElementById('node-tools'),
  end: document.getElementById('node-end')
};

const graphEdges = {
  startAgent: document.getElementById('edge-start-agent'),
  agentDecision: document.getElementById('edge-agent-decision'),
  decisionTools: document.getElementById('edge-decision-tools'),
  decisionEnd: document.getElementById('edge-decision-end'),
  toolsAgent: document.getElementById('edge-tools-agent')
};

function updateStateDisplay() {
  const display = document.getElementById('state-display');
  const stateObj = {
    messages: agentState.messages.map(m => ({
      type: m.type,
      content: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : ''),
      tool_calls: m.tool_calls || undefined
    })),
    iteration: agentState.iteration
  };
  display.innerHTML = `<pre>${JSON.stringify(stateObj, null, 2)}</pre>`;
}

function addLogEntry(message, type = 'info') {
  const log = document.getElementById('execution-log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = message;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function clearLog() {
  const log = document.getElementById('execution-log');
  log.innerHTML = '';
}

function highlightNode(nodeId) {
  // Clear all highlights
  Object.values(graphNodes).forEach(node => {
    if (node) node.classList.remove('active');
  });

  // Highlight current node
  if (nodeId && graphNodes[nodeId]) {
    graphNodes[nodeId].classList.add('active');
  }
  agentState.currentNode = nodeId;
}

function highlightEdge(edgeId) {
  Object.values(graphEdges).forEach(edge => {
    if (edge) {
      edge.classList.remove('active', 'flowing');
    }
  });

  if (edgeId && graphEdges[edgeId]) {
    graphEdges[edgeId].classList.add('active', 'flowing');
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulated tools
const tools = {
  get_weather: (city) => `Weather in ${city}: 22°C, Sunny with light clouds`,
  calculator: (expr) => {
    try {
      return `Result: ${eval(expr)}`;
    } catch {
      return 'Error: Invalid expression';
    }
  },
  search_web: (query) => `Search results for "${query}": [Top 3 relevant articles...]`
};

function parseToolCalls(query) {
  const toolCalls = [];
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('weather')) {
    const cityMatch = query.match(/weather\s+(?:in\s+)?(\w+)/i);
    const city = cityMatch ? cityMatch[1] : 'Tokyo';
    toolCalls.push({ name: 'get_weather', args: { city }, id: 'call_' + Math.random().toString(36).substr(2, 9) });
  }

  if (lowerQuery.includes('calculate') || /\d+\s*[\+\-\*\/]\s*\d+/.test(query)) {
    const exprMatch = query.match(/(\d+\s*[\+\-\*\/\s\d]+)/);
    const expr = exprMatch ? exprMatch[1].trim() : '1+1';
    toolCalls.push({ name: 'calculator', args: { expression: expr }, id: 'call_' + Math.random().toString(36).substr(2, 9) });
  }

  if (lowerQuery.includes('search')) {
    const searchMatch = query.match(/search\s+(?:for\s+)?(.+)/i);
    const searchQuery = searchMatch ? searchMatch[1] : query;
    toolCalls.push({ name: 'search_web', args: { query: searchQuery }, id: 'call_' + Math.random().toString(36).substr(2, 9) });
  }

  return toolCalls;
}

async function runAgentStep() {
  if (!agentState.isRunning) return;

  const currentNode = agentState.currentNode;

  switch (currentNode) {
    case 'start':
      highlightEdge('startAgent');
      await sleep(500);
      highlightNode('agent');
      addLogEntry('Moving to AGENT node', 'info');
      break;

    case 'agent':
      addLogEntry(`Iteration ${agentState.iteration + 1}: Calling LLM...`, 'agent');
      await sleep(800);

      // Simulate LLM response
      const query = document.getElementById('agent-query').value;
      const toolCalls = agentState.iteration === 0 ? parseToolCalls(query) : [];

      if (toolCalls.length > 0) {
        agentState.messages.push({
          type: 'ai',
          content: `I'll help you with that. Let me use some tools.`,
          tool_calls: toolCalls
        });
        addLogEntry(`LLM requested ${toolCalls.length} tool(s): ${toolCalls.map(t => t.name).join(', ')}`, 'agent');
      } else {
        agentState.messages.push({
          type: 'ai',
          content: `Based on the information gathered, here's my response to your query about "${query}".`
        });
        addLogEntry('LLM generated final response (no tool calls)', 'agent');
      }

      agentState.iteration++;
      updateStateDisplay();

      highlightEdge('agentDecision');
      await sleep(500);
      highlightNode('decision');
      addLogEntry('Checking for tool calls...', 'decision');
      break;

    case 'decision':
      await sleep(600);
      const lastMessage = agentState.messages[agentState.messages.length - 1];
      const hasToolCalls = lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0;

      if (hasToolCalls) {
        addLogEntry('Tool calls detected! Routing to TOOLS node', 'decision');
        highlightEdge('decisionTools');
        await sleep(500);
        highlightNode('tools');
      } else {
        addLogEntry('No tool calls. Routing to END', 'decision');
        highlightEdge('decisionEnd');
        await sleep(500);
        highlightNode('end');
      }
      break;

    case 'tools':
      addLogEntry('Executing tool calls...', 'tools');
      await sleep(600);

      const aiMessage = agentState.messages[agentState.messages.length - 1];
      if (aiMessage && aiMessage.tool_calls) {
        for (const call of aiMessage.tool_calls) {
          const toolFn = tools[call.name];
          if (toolFn) {
            const argValue = Object.values(call.args)[0];
            const result = toolFn(argValue);
            agentState.messages.push({
              type: 'tool',
              content: result,
              tool_call_id: call.id
            });
            addLogEntry(`${call.name}(${argValue}) => ${result}`, 'tools');
          }
        }
      }

      updateStateDisplay();
      highlightEdge('toolsAgent');
      await sleep(500);
      highlightNode('agent');
      addLogEntry('Looping back to AGENT with tool results', 'info');
      break;

    case 'end':
      agentState.isRunning = false;
      addLogEntry('Agent completed successfully!', 'complete');
      highlightNode(null);
      return;
  }

  if (agentState.iteration >= 5) {
    agentState.isRunning = false;
    addLogEntry('Max iterations reached. Stopping.', 'complete');
    highlightNode(null);
    return;
  }

  if (!agentState.stepMode && agentState.isRunning) {
    await sleep(300);
    runAgentStep();
  }
}

function startAgent(stepMode = false) {
  const query = document.getElementById('agent-query').value.trim();
  if (!query) return;

  // Reset state
  agentState.messages = [{ type: 'human', content: query }];
  agentState.iteration = 0;
  agentState.isRunning = true;
  agentState.stepMode = stepMode;
  agentState.currentNode = 'start';

  clearLog();
  addLogEntry(`Starting agent with query: "${query}"`, 'info');
  updateStateDisplay();
  highlightNode('start');

  if (!stepMode) {
    runAgentStep();
  }
}

function resetAgent() {
  agentState.messages = [];
  agentState.iteration = 0;
  agentState.isRunning = false;
  agentState.currentNode = null;

  clearLog();
  addLogEntry('Click "Run Agent" to start', 'info');
  updateStateDisplay();
  highlightNode(null);
  highlightEdge(null);
}

document.getElementById('run-agent').addEventListener('click', () => startAgent(false));
document.getElementById('step-agent').addEventListener('click', () => {
  if (!agentState.isRunning) {
    startAgent(true);
  } else {
    runAgentStep();
  }
});
document.getElementById('reset-agent').addEventListener('click', resetAgent);

// ============================================
// Conditional Routing Tab
// ============================================

const routingPaths = {
  calc: document.getElementById('path-calc'),
  search: document.getElementById('path-search'),
  chat: document.getElementById('path-chat')
};

const routingNodes = {
  classifier: document.getElementById('route-classifier'),
  calc: document.getElementById('route-calc'),
  search: document.getElementById('route-search'),
  chat: document.getElementById('route-chat')
};

function classifyInput(input) {
  const lower = input.toLowerCase();

  if (/calculate|compute|math|\d+\s*[\+\-\*\/]\s*\d+/.test(lower)) {
    return {
      route: 'calc',
      reason: 'Detected math keywords or arithmetic expression'
    };
  }

  if (/search|find|look up|what is|who is|where is|how|why/.test(lower)) {
    return {
      route: 'search',
      reason: 'Detected question or search keywords'
    };
  }

  return {
    route: 'chat',
    reason: 'General conversation (no specific task detected)'
  };
}

function showRoutingResult(input) {
  const result = classifyInput(input);

  // Clear all highlights
  Object.values(routingPaths).forEach(p => p && p.classList.remove('active'));
  Object.values(routingNodes).forEach(n => n && n.classList.remove('active'));

  // Highlight the path and node
  if (routingPaths[result.route]) {
    routingPaths[result.route].classList.add('active');
  }
  if (routingNodes[result.route]) {
    routingNodes[result.route].classList.add('active');
  }
  routingNodes.classifier.classList.add('active');

  // Update result display
  const resultDiv = document.getElementById('routing-result');
  const routeNames = {
    calc: 'CALCULATE Handler',
    search: 'SEARCH Handler',
    chat: 'CHAT Handler'
  };

  resultDiv.querySelector('.result-value').textContent = routeNames[result.route];
  resultDiv.querySelector('.result-reason').textContent = result.reason;

  // Update button states
  document.querySelectorAll('.routing-example').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.input === input);
  });
}

document.querySelectorAll('.routing-example').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.dataset.input;
    document.getElementById('routing-input').value = input;
    showRoutingResult(input);
  });
});

document.getElementById('route-btn').addEventListener('click', () => {
  const input = document.getElementById('routing-input').value.trim();
  if (input) {
    showRoutingResult(input);
  }
});

document.getElementById('routing-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const input = e.target.value.trim();
    if (input) {
      showRoutingResult(input);
    }
  }
});

// ============================================
// Build Your Own Tab
// ============================================

const builderState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  connectMode: false,
  connectSource: null,
  nextId: 1,
  dragNode: null,
  dragOffset: { x: 0, y: 0 }
};

const builderSvg = document.getElementById('builder-svg');
const nodesGroup = document.getElementById('builder-nodes');
const edgesGroup = document.getElementById('builder-edges');

function addBuilderLog(message) {
  const log = document.getElementById('builder-log');
  const entry = document.createElement('div');
  entry.className = 'log-entry info';
  entry.textContent = message;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;

  // Keep only last 10 entries
  while (log.children.length > 10) {
    log.removeChild(log.firstChild);
  }
}

function createBuilderNode(type, x, y) {
  const id = `builder-node-${builderState.nextId++}`;
  const node = {
    id,
    type,
    x,
    y,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  };

  builderState.nodes.push(node);
  renderBuilderNode(node);
  addBuilderLog(`Added ${type} node`);

  return node;
}

function renderBuilderNode(node) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', node.id);
  g.setAttribute('class', 'builder-node');
  g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
  g.dataset.nodeId = node.id;

  let shape;
  const colors = {
    start: '#4ade80',
    process: '#4a9eff',
    decision: '#fb923c',
    end: '#f87171'
  };

  if (node.type === 'start' || node.type === 'end') {
    shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    shape.setAttribute('r', '25');
    shape.setAttribute('fill', colors[node.type]);
    shape.setAttribute('stroke', colors[node.type]);
    shape.setAttribute('stroke-width', '2');
  } else if (node.type === 'decision') {
    shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    shape.setAttribute('points', '0,-30 40,0 0,30 -40,0');
    shape.setAttribute('fill', '#22222e');
    shape.setAttribute('stroke', colors[node.type]);
    shape.setAttribute('stroke-width', '2');
  } else {
    shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    shape.setAttribute('x', '-40');
    shape.setAttribute('y', '-25');
    shape.setAttribute('width', '80');
    shape.setAttribute('height', '50');
    shape.setAttribute('rx', '8');
    shape.setAttribute('fill', colors[node.type]);
    shape.setAttribute('stroke', colors[node.type]);
    shape.setAttribute('stroke-width', '2');
  }

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('y', '5');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', 'white');
  text.setAttribute('font-family', 'var(--font-display)');
  text.setAttribute('font-size', '12');
  text.setAttribute('font-weight', '600');
  text.textContent = node.label.toUpperCase();

  g.appendChild(shape);
  g.appendChild(text);
  nodesGroup.appendChild(g);

  // Add event listeners
  g.addEventListener('mousedown', (e) => startDrag(e, node));
  g.addEventListener('click', (e) => handleNodeClick(e, node));
}

function startDrag(e, node) {
  if (builderState.connectMode) return;

  builderState.dragNode = node;
  const point = getSvgPoint(e);
  builderState.dragOffset = {
    x: point.x - node.x,
    y: point.y - node.y
  };

  document.getElementById(node.id).classList.add('dragging');
}

function getSvgPoint(e) {
  const svg = builderSvg;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

builderSvg.addEventListener('mousemove', (e) => {
  if (!builderState.dragNode) return;

  const point = getSvgPoint(e);
  const node = builderState.dragNode;
  node.x = point.x - builderState.dragOffset.x;
  node.y = point.y - builderState.dragOffset.y;

  // Keep within bounds
  node.x = Math.max(50, Math.min(450, node.x));
  node.y = Math.max(50, Math.min(350, node.y));

  const el = document.getElementById(node.id);
  el.setAttribute('transform', `translate(${node.x}, ${node.y})`);

  // Update edges
  renderAllEdges();
});

builderSvg.addEventListener('mouseup', () => {
  if (builderState.dragNode) {
    document.getElementById(builderState.dragNode.id).classList.remove('dragging');
    builderState.dragNode = null;
  }
});

function handleNodeClick(e, node) {
  e.stopPropagation();

  if (builderState.connectMode) {
    if (!builderState.connectSource) {
      builderState.connectSource = node;
      document.getElementById(node.id).classList.add('selected');
      addBuilderLog(`Select target node for edge from ${node.label}`);
    } else if (builderState.connectSource.id !== node.id) {
      // Create edge
      const edge = {
        from: builderState.connectSource.id,
        to: node.id
      };
      builderState.edges.push(edge);
      renderAllEdges();
      addBuilderLog(`Connected ${builderState.connectSource.label} -> ${node.label}`);

      // Reset
      document.getElementById(builderState.connectSource.id).classList.remove('selected');
      builderState.connectSource = null;
      builderState.connectMode = false;
      document.getElementById('connect-mode').classList.remove('active');
    }
  }
}

function renderAllEdges() {
  edgesGroup.innerHTML = '';

  builderState.edges.forEach(edge => {
    const fromNode = builderState.nodes.find(n => n.id === edge.from);
    const toNode = builderState.nodes.find(n => n.id === edge.to);

    if (fromNode && toNode) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', fromNode.x);
      line.setAttribute('y1', fromNode.y);
      line.setAttribute('x2', toNode.x);
      line.setAttribute('y2', toNode.y);
      line.setAttribute('stroke', '#a0a0b0');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-end', 'url(#arrowhead)');
      edgesGroup.appendChild(line);
    }
  });
}

// Add palette button handlers
document.querySelectorAll('.palette-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    const x = 100 + Math.random() * 300;
    const y = 100 + Math.random() * 200;
    createBuilderNode(type, x, y);
  });
});

document.getElementById('connect-mode').addEventListener('click', () => {
  builderState.connectMode = !builderState.connectMode;
  document.getElementById('connect-mode').classList.toggle('active', builderState.connectMode);

  if (builderState.connectMode) {
    addBuilderLog('Connect mode: Click source node, then target');
  } else {
    if (builderState.connectSource) {
      document.getElementById(builderState.connectSource.id).classList.remove('selected');
    }
    builderState.connectSource = null;
    addBuilderLog('Connect mode disabled');
  }
});

document.getElementById('run-builder').addEventListener('click', () => {
  if (builderState.nodes.length === 0) {
    addBuilderLog('Add some nodes first!');
    return;
  }

  const startNode = builderState.nodes.find(n => n.type === 'start');
  if (!startNode) {
    addBuilderLog('Error: No START node found');
    return;
  }

  addBuilderLog('Running graph simulation...');

  // Simple BFS traversal
  let current = startNode;
  let visited = new Set();
  let path = [current.label];

  const traverse = () => {
    visited.add(current.id);
    const outEdge = builderState.edges.find(e => e.from === current.id && !visited.has(e.to));

    if (outEdge) {
      current = builderState.nodes.find(n => n.id === outEdge.to);
      path.push(current.label);

      if (current.type !== 'end' && path.length < 10) {
        setTimeout(traverse, 500);
      } else {
        addBuilderLog(`Path: ${path.join(' -> ')}`);
      }
    } else {
      addBuilderLog(`Path: ${path.join(' -> ')} (no more edges)`);
    }
  };

  traverse();
});

document.getElementById('clear-builder').addEventListener('click', () => {
  builderState.nodes = [];
  builderState.edges = [];
  builderState.nextId = 1;
  nodesGroup.innerHTML = '';
  edgesGroup.innerHTML = '';
  addBuilderLog('Canvas cleared');
});

// Initialize
updateStateDisplay();
