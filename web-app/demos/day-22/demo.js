// ============================================================
// Day 22: ACP - Agent Communication Protocol Demo
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initArchitecture();
    initManifestBuilder();
    initRunSimulator();
    initRestApiExplorer();
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
// Architecture Tab
// ============================================================

const architectureInfo = {
    webapp: {
        title: 'Web Application',
        description: 'Browser-based applications that interact with ACP agents via REST API. Can use any HTTP client to discover agents, create runs, and receive streaming responses.'
    },
    cli: {
        title: 'BeeAI CLI',
        description: 'Command-line interface for managing ACP agents. Provides commands like `beeai list`, `beeai run`, and `beeai compose` for agent orchestration.'
    },
    orchestrator: {
        title: 'Orchestrator Agent',
        description: 'A coordinating agent that delegates work to specialist agents. Uses ACP to discover capabilities, create runs, and aggregate results from multiple agents.'
    },
    rest: {
        title: 'REST API',
        description: 'ACP uses standard HTTP methods: GET /agents lists agents, POST /runs creates tasks, GET /runs/{id} checks status. No specialized SDK required - test with curl or Postman.'
    },
    discovery: {
        title: 'Discovery Service',
        description: 'Indexes agent manifests for discovery. Supports offline discovery where manifests are embedded in packages, enabling scale-to-zero deployments.'
    },
    sessions: {
        title: 'Session Management',
        description: 'Maintains state across multiple interactions. Sessions survive agent restarts, enabling long-running workflows that span hours or days.'
    },
    streaming: {
        title: 'Streaming (SSE/WebSocket)',
        description: 'Real-time updates during long operations. Clients receive incremental content, status updates, and completion events as they happen.'
    },
    researcher: {
        title: 'GPT-Researcher Agent',
        description: 'A research specialist that gathers information from web searches and documents. Returns comprehensive research reports with citations.'
    },
    coder: {
        title: 'Aider (Code Agent)',
        description: 'AI pair programming agent that helps write and edit code. Can work with existing codebases and follow coding standards.'
    },
    summarizer: {
        title: 'Summarizer Agent',
        description: 'Condenses long content into concise summaries. Supports different summary lengths and formats based on input configuration.'
    },
    manifest: {
        title: 'Agent Manifest',
        description: 'JSON document describing agent capabilities, supported interfaces (sync/async/streaming), input schemas, and metadata. Enables discovery without running the agent.'
    },
    'mcp-search': {
        title: 'Search Tool (MCP)',
        description: 'MCP tool for web search. Each agent uses MCP to connect to its tools - ACP handles agent-to-agent communication, MCP handles agent-to-tool communication.'
    },
    'mcp-db': {
        title: 'Database Tool (MCP)',
        description: 'MCP tool for database queries. Demonstrates how agents use MCP for vertical integration with data sources.'
    },
    'mcp-files': {
        title: 'File System Tool (MCP)',
        description: 'MCP tool for reading and writing files. Shows the complementary nature of ACP (horizontal) and MCP (vertical).'
    },
    'mcp-api': {
        title: 'API Tool (MCP)',
        description: 'MCP tool for calling external APIs. Agents expose their capabilities via ACP while using MCP to access external services.'
    }
};

function initArchitecture() {
    const infoPanel = document.getElementById('arch-info');
    const components = document.querySelectorAll('[data-component]');

    components.forEach(comp => {
        comp.addEventListener('click', () => {
            const componentId = comp.dataset.component;
            const info = architectureInfo[componentId];

            if (info) {
                infoPanel.innerHTML = `
                    <h3>${info.title}</h3>
                    <p>${info.description}</p>
                `;

                components.forEach(c => c.classList.remove('selected'));
                comp.classList.add('selected');
            }
        });
    });
}

// ============================================================
// Manifest Builder Tab
// ============================================================

const exampleManifests = {
    researcher: {
        name: 'Research Agent',
        description: 'Performs comprehensive research on any topic using web search and document analysis.',
        version: '1.2.0',
        interfaces: { sync: true, async: true, streaming: true },
        capabilities: ['research', 'web-search', 'synthesis']
    },
    coder: {
        name: 'Code Agent',
        description: 'AI pair programmer that helps write, edit, and refactor code.',
        version: '2.0.0',
        interfaces: { sync: true, async: true, streaming: true },
        capabilities: ['code-generation', 'refactoring', 'debugging']
    },
    summarizer: {
        name: 'Summarizer',
        description: 'Condenses long content into concise, accurate summaries.',
        version: '1.0.0',
        interfaces: { sync: true, async: false, streaming: true },
        capabilities: ['summarization', 'extraction']
    },
    analyst: {
        name: 'Data Analyst',
        description: 'Analyzes data, generates visualizations, and identifies patterns.',
        version: '1.5.0',
        interfaces: { sync: true, async: true, streaming: false },
        capabilities: ['analysis', 'visualization', 'statistics']
    }
};

function initManifestBuilder() {
    const nameInput = document.getElementById('agent-name');
    const descInput = document.getElementById('agent-desc');
    const versionInput = document.getElementById('agent-version');
    const syncCheck = document.getElementById('int-sync');
    const asyncCheck = document.getElementById('int-async');
    const streamingCheck = document.getElementById('int-streaming');
    const capabilitiesList = document.getElementById('capabilities-list');
    const addCapBtn = document.getElementById('add-capability');
    const manifestPreview = document.getElementById('manifest-json');
    const copyBtn = document.getElementById('copy-manifest');

    function updatePreview() {
        const capabilities = [];
        document.querySelectorAll('.capability-input').forEach(input => {
            if (input.value.trim()) {
                capabilities.push(input.value.trim());
            }
        });

        const manifest = {
            name: nameInput.value.toLowerCase().replace(/\s+/g, '-'),
            displayName: nameInput.value,
            description: descInput.value,
            version: versionInput.value,
            author: 'Your Organization',
            capabilities: capabilities,
            interfaces: {
                sync: syncCheck.checked,
                async: asyncCheck.checked,
                streaming: streamingCheck.checked
            },
            inputSchema: {
                type: 'object',
                properties: {
                    content: { type: 'string', description: 'Input content to process' },
                    options: { type: 'object', description: 'Optional configuration' }
                },
                required: ['content']
            }
        };

        manifestPreview.innerHTML = `<code class="language-json">${JSON.stringify(manifest, null, 2)}</code>`;
        if (window.Prism) {
            Prism.highlightElement(manifestPreview.querySelector('code'));
        }

        // Update endpoint badge
        const badge = document.querySelector('.endpoint-badge code');
        if (badge) {
            badge.textContent = `GET /agents/${manifest.name}`;
        }
    }

    // Event listeners
    [nameInput, descInput, versionInput].forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    [syncCheck, asyncCheck, streamingCheck].forEach(check => {
        check.addEventListener('change', updatePreview);
    });

    capabilitiesList.addEventListener('input', updatePreview);

    // Add capability
    addCapBtn.addEventListener('click', () => {
        const item = document.createElement('div');
        item.className = 'capability-item';
        item.innerHTML = `
            <input type="text" class="capability-input" placeholder="e.g., summarization">
            <button class="btn-remove">×</button>
        `;
        capabilitiesList.appendChild(item);
        updatePreview();
    });

    // Remove capability
    capabilitiesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            e.target.parentElement.remove();
            updatePreview();
        }
    });

    // Copy manifest
    copyBtn.addEventListener('click', () => {
        const code = manifestPreview.textContent;
        navigator.clipboard.writeText(code).then(() => {
            showToast('Manifest copied to clipboard!');
        });
    });

    // Example cards
    document.querySelectorAll('.example-card').forEach(card => {
        card.addEventListener('click', () => {
            const example = exampleManifests[card.dataset.example];
            if (example) {
                nameInput.value = example.name;
                descInput.value = example.description;
                versionInput.value = example.version;
                syncCheck.checked = example.interfaces.sync;
                asyncCheck.checked = example.interfaces.async;
                streamingCheck.checked = example.interfaces.streaming;

                // Update capabilities
                capabilitiesList.innerHTML = '';
                example.capabilities.forEach(cap => {
                    const item = document.createElement('div');
                    item.className = 'capability-item';
                    item.innerHTML = `
                        <input type="text" class="capability-input" value="${cap}" placeholder="e.g., summarization">
                        <button class="btn-remove">×</button>
                    `;
                    capabilitiesList.appendChild(item);
                });

                updatePreview();
            }
        });
    });

    // Initial preview
    updatePreview();
}

// ============================================================
// Run Simulator Tab
// ============================================================

function initRunSimulator() {
    const scenarioSelect = document.getElementById('scenario');
    const runBtn = document.getElementById('run-scenario');
    const runJson = document.getElementById('run-json');
    const timeline = document.getElementById('timeline-events');
    const stateNodes = document.querySelectorAll('.state-node');

    const scenarios = {
        simple: [
            { state: 'pending', delay: 500 },
            { state: 'running', delay: 1000 },
            { state: 'completed', delay: 1500 }
        ],
        clarification: [
            { state: 'pending', delay: 500 },
            { state: 'running', delay: 1000 },
            { state: 'awaiting', delay: 1500, message: 'Agent asks: What time period should I research?' },
            { state: 'running', delay: 2500 },
            { state: 'completed', delay: 3500 }
        ],
        streaming: [
            { state: 'pending', delay: 500 },
            { state: 'running', delay: 1000 },
            { state: 'running', delay: 1500, message: 'Stream: Searching sources...' },
            { state: 'running', delay: 2000, message: 'Stream: Found 15 relevant documents' },
            { state: 'running', delay: 2500, message: 'Stream: Generating summary...' },
            { state: 'completed', delay: 3500 }
        ],
        'long-running': [
            { state: 'pending', delay: 500 },
            { state: 'running', delay: 1000 },
            { state: 'running', delay: 2000, message: 'Progress: 25%' },
            { state: 'running', delay: 3000, message: 'Progress: 50%' },
            { state: 'running', delay: 4000, message: 'Progress: 75%' },
            { state: 'completed', delay: 5000 }
        ],
        error: [
            { state: 'pending', delay: 500 },
            { state: 'running', delay: 1000 },
            { state: 'failed', delay: 2000, message: 'Error: Rate limit exceeded' }
        ]
    };

    function updateRunObject(state, extra = {}) {
        const run = {
            id: 'run-uuid-12345',
            agent: 'researcher',
            status: state.toUpperCase(),
            created_at: '2025-03-23T10:00:00Z',
            input: { role: 'user', parts: [{ content: 'Research AI trends', content_type: 'text/plain' }] },
            output: state === 'completed' ? { role: 'agent/researcher', parts: [{ content: 'Research results...', content_type: 'text/plain' }] } : null,
            ...extra
        };

        if (state === 'failed') {
            run.error = 'Rate limit exceeded';
        }

        runJson.innerHTML = `<code class="language-json">${JSON.stringify(run, null, 2)}</code>`;
        if (window.Prism) {
            Prism.highlightElement(runJson.querySelector('code'));
        }
    }

    function addTimelineEvent(state, message) {
        const event = document.createElement('div');
        event.className = `timeline-event ${state}`;
        const time = new Date().toLocaleTimeString();
        event.innerHTML = `
            <strong>${time}</strong> - ${state.toUpperCase()}
            ${message ? `<br><small>${message}</small>` : ''}
        `;
        timeline.appendChild(event);
        timeline.scrollTop = timeline.scrollHeight;
    }

    function setActiveState(state) {
        stateNodes.forEach(node => node.classList.remove('active'));
        const activeNode = document.querySelector(`[data-state="${state}"]`);
        if (activeNode) {
            activeNode.classList.add('active');
        }
    }

    runBtn.addEventListener('click', () => {
        // Reset
        timeline.innerHTML = '';
        stateNodes.forEach(node => node.classList.remove('active'));
        updateRunObject('pending');

        const scenario = scenarios[scenarioSelect.value];
        let index = 0;

        function runStep() {
            if (index >= scenario.length) return;

            const step = scenario[index];
            setTimeout(() => {
                setActiveState(step.state);
                updateRunObject(step.state);
                addTimelineEvent(step.state, step.message);
                index++;
                runStep();
            }, step.delay - (index > 0 ? scenario[index - 1].delay : 0));
        }

        runStep();
    });
}

// ============================================================
// REST API Explorer Tab
// ============================================================

const apiEndpoints = {
    'list-agents': {
        title: 'List Agents',
        desc: 'Get all available agents with their basic metadata',
        curl: `curl -X GET http://localhost:8000/agents \\
  -H "Accept: application/json"`,
        response: `[
  {
    "name": "gpt-researcher",
    "description": "Research agent with web search",
    "version": "1.2.0"
  },
  {
    "name": "summarizer",
    "description": "Text summarization agent",
    "version": "1.0.0"
  }
]`
    },
    'get-agent': {
        title: 'Get Agent Manifest',
        desc: 'Get the full manifest for a specific agent',
        curl: `curl -X GET http://localhost:8000/agents/gpt-researcher \\
  -H "Accept: application/json"`,
        response: `{
  "name": "gpt-researcher",
  "displayName": "GPT Researcher",
  "description": "Research agent with web search",
  "version": "1.2.0",
  "capabilities": ["research", "web-search"],
  "interfaces": {
    "sync": true,
    "async": true,
    "streaming": true
  },
  "inputSchema": { ... }
}`
    },
    'create-run': {
        title: 'Create Run',
        desc: 'Execute an agent with the given input',
        curl: `curl -X POST http://localhost:8000/runs \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "gpt-researcher",
    "input": {
      "role": "user",
      "parts": [{
        "content": "Research AI trends in 2025",
        "content_type": "text/plain"
      }]
    }
  }'`,
        response: `{
  "id": "run-abc123",
  "agent": "gpt-researcher",
  "status": "PENDING",
  "created_at": "2025-03-23T10:00:00Z",
  "input": { ... }
}`
    },
    'get-run': {
        title: 'Get Run Status',
        desc: 'Check the status and output of a run',
        curl: `curl -X GET http://localhost:8000/runs/run-abc123 \\
  -H "Accept: application/json"`,
        response: `{
  "id": "run-abc123",
  "agent": "gpt-researcher",
  "status": "COMPLETED",
  "created_at": "2025-03-23T10:00:00Z",
  "completed_at": "2025-03-23T10:00:15Z",
  "output": {
    "role": "agent/gpt-researcher",
    "parts": [{
      "content": "Research findings...",
      "content_type": "text/plain"
    }]
  }
}`
    },
    'cancel-run': {
        title: 'Cancel Run',
        desc: 'Cancel a running or pending run',
        curl: `curl -X DELETE http://localhost:8000/runs/run-abc123`,
        response: `{
  "id": "run-abc123",
  "status": "CANCELLED"
}`
    },
    'get-session': {
        title: 'Get Session',
        desc: 'Get session state and conversation history',
        curl: `curl -X GET http://localhost:8000/sessions/session-xyz789 \\
  -H "Accept: application/json"`,
        response: `{
  "id": "session-xyz789",
  "created_at": "2025-03-23T09:00:00Z",
  "history": [
    { "run_id": "run-1", "completed_at": "..." },
    { "run_id": "run-2", "completed_at": "..." }
  ]
}`
    }
};

function initRestApiExplorer() {
    const endpoints = document.querySelectorAll('.endpoint');
    const titleEl = document.getElementById('endpoint-title');
    const descEl = document.getElementById('endpoint-desc');
    const curlEl = document.getElementById('curl-command');
    const responseEl = document.getElementById('api-response');
    const copyBtn = document.getElementById('copy-curl');

    function showEndpoint(id) {
        const ep = apiEndpoints[id];
        if (!ep) return;

        titleEl.textContent = ep.title;
        descEl.textContent = ep.desc;
        curlEl.innerHTML = `<code class="language-bash">${ep.curl}</code>`;
        responseEl.innerHTML = `<code class="language-json">${ep.response}</code>`;

        if (window.Prism) {
            Prism.highlightElement(curlEl.querySelector('code'));
            Prism.highlightElement(responseEl.querySelector('code'));
        }

        endpoints.forEach(e => e.classList.remove('active'));
        document.querySelector(`[data-endpoint="${id}"]`).classList.add('active');
    }

    endpoints.forEach(ep => {
        ep.addEventListener('click', () => {
            showEndpoint(ep.dataset.endpoint);
        });
    });

    copyBtn.addEventListener('click', () => {
        const curl = curlEl.textContent;
        navigator.clipboard.writeText(curl).then(() => {
            showToast('curl command copied!');
        });
    });

    // Initial load
    showEndpoint('list-agents');
}

// ============================================================
// Toast Notification
// ============================================================

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}
