/**
 * Day 19: MCP Fundamentals - Interactive Demo
 * Model Context Protocol Explorer
 */

// ============================================================================
// Tab Navigation
// ============================================================================

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Update buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update panels
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === targetTab) {
                panel.classList.add('active');
            }
        });
    });
});

// ============================================================================
// Toast Notifications
// ============================================================================

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy');
    });
}

// ============================================================================
// Architecture Tab - Component Info
// ============================================================================

const componentInfo = {
    host: {
        title: 'Host (AI Application)',
        description: 'The host is the AI application that wants to access external tools and data. Examples include Claude Desktop, VS Code with AI extensions, or custom AI applications.',
        details: [
            'Manages multiple MCP client connections',
            'Routes requests between the AI model and servers',
            'Enforces security policies and user consent',
            'Examples: Claude Desktop, IDEs, custom apps'
        ]
    },
    client1: {
        title: 'MCP Client',
        description: 'A protocol handler within the host that manages a 1:1 connection with an MCP server.',
        details: [
            'Handles JSON-RPC 2.0 message framing',
            'Manages capability negotiation',
            'Routes tool calls and resource requests',
            'Each client connects to exactly one server'
        ]
    },
    client2: {
        title: 'MCP Client',
        description: 'A protocol handler within the host that manages a 1:1 connection with an MCP server.',
        details: [
            'Handles JSON-RPC 2.0 message framing',
            'Manages capability negotiation',
            'Routes tool calls and resource requests',
            'Each client connects to exactly one server'
        ]
    },
    client3: {
        title: 'MCP Client',
        description: 'A protocol handler within the host that manages a 1:1 connection with an MCP server.',
        details: [
            'Handles JSON-RPC 2.0 message framing',
            'Manages capability negotiation',
            'Routes tool calls and resource requests',
            'Each client connects to exactly one server'
        ]
    },
    'server-file': {
        title: 'File System Server',
        description: 'An MCP server that provides access to local file system resources.',
        details: [
            'Exposes files as MCP resources',
            'Supports read operations on allowed paths',
            'Can watch for file changes (subscriptions)',
            'Common use: code editing, document access'
        ]
    },
    'server-db': {
        title: 'Database Server',
        description: 'An MCP server that provides database query capabilities.',
        details: [
            'Exposes query execution as tools',
            'Can expose table schemas as resources',
            'Supports parameterized queries for safety',
            'Common use: data analysis, reporting'
        ]
    },
    'server-api': {
        title: 'API Integration Server',
        description: 'An MCP server that wraps external APIs for AI access.',
        details: [
            'Exposes API calls as MCP tools',
            'Provides pre-built prompt templates',
            'Handles authentication and rate limiting',
            'Common use: weather, search, notifications'
        ]
    }
};

// Add click handlers to architecture components
document.querySelectorAll('[data-component]').forEach(el => {
    el.addEventListener('click', () => {
        const component = el.dataset.component;
        const info = componentInfo[component];
        if (info) {
            updateComponentInfo(info);
        }
    });
});

function updateComponentInfo(info) {
    const infoCard = document.getElementById('component-info');
    infoCard.innerHTML = `
        <h3>${info.title}</h3>
        <p>${info.description}</p>
        <div class="info-details">
            <h4>Key Points:</h4>
            <ul>
                ${info.details.map(d => `<li>${d}</li>`).join('')}
            </ul>
        </div>
    `;
}

// ============================================================================
// Protocol Tab - Lifecycle Simulator
// ============================================================================

const protocolSteps = [
    {
        name: 'initialize',
        direction: 'right',
        label: 'initialize →',
        description: {
            title: 'Initialize Request',
            text: 'The client sends an initialize request to the server, including its protocol version and capabilities.',
            points: [
                'Client declares supported protocol version',
                'Client sends its capability flags',
                'Server has not yet responded'
            ]
        },
        request: {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    roots: { listChanged: true },
                    sampling: {}
                },
                clientInfo: {
                    name: 'claude-desktop',
                    version: '1.0.0'
                }
            }
        },
        response: null
    },
    {
        name: 'initialize-response',
        direction: 'left',
        label: '← initialize response',
        description: {
            title: 'Initialize Response',
            text: 'The server responds with its own capabilities and protocol version.',
            points: [
                'Server confirms protocol compatibility',
                'Server declares its capabilities (tools, resources, prompts)',
                'Connection is established but not yet ready'
            ]
        },
        request: null,
        response: {
            jsonrpc: '2.0',
            id: 1,
            result: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {},
                    resources: { subscribe: true },
                    prompts: {}
                },
                serverInfo: {
                    name: 'weather-server',
                    version: '1.0.0'
                }
            }
        }
    },
    {
        name: 'initialized',
        direction: 'right',
        label: 'initialized →',
        description: {
            title: 'Initialized Notification',
            text: 'The client sends an initialized notification to confirm the connection is ready.',
            points: [
                'This is a notification (no response expected)',
                'Connection is now fully established',
                'Server can now accept tool/resource requests'
            ]
        },
        request: {
            jsonrpc: '2.0',
            method: 'notifications/initialized'
        },
        response: null
    },
    {
        name: 'tools-list',
        direction: 'right',
        label: 'tools/list →',
        description: {
            title: 'List Tools Request',
            text: 'The client requests a list of available tools from the server.',
            points: [
                'Discovers what actions the server can perform',
                'Each tool includes name, description, and input schema',
                'Tools can be invoked by the AI model'
            ]
        },
        request: {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {}
        },
        response: null
    },
    {
        name: 'tools-list-response',
        direction: 'left',
        label: '← tools list',
        description: {
            title: 'Tools List Response',
            text: 'The server responds with its available tools.',
            points: [
                'Each tool has a JSON Schema for inputs',
                'Descriptions help the AI understand when to use each tool',
                'The AI model can now invoke these tools'
            ]
        },
        request: null,
        response: {
            jsonrpc: '2.0',
            id: 2,
            result: {
                tools: [
                    {
                        name: 'get_weather',
                        description: 'Get current weather for a location',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                location: {
                                    type: 'string',
                                    description: 'City name'
                                }
                            },
                            required: ['location']
                        }
                    }
                ]
            }
        }
    },
    {
        name: 'tools-call',
        direction: 'right',
        label: 'tools/call →',
        description: {
            title: 'Call Tool Request',
            text: 'The AI model invokes a tool with specific arguments.',
            points: [
                'Tool name and arguments are specified',
                'Arguments must match the input schema',
                'This is where the actual work happens'
            ]
        },
        request: {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'get_weather',
                arguments: {
                    location: 'San Francisco'
                }
            }
        },
        response: null
    },
    {
        name: 'tools-call-response',
        direction: 'left',
        label: '← tool result',
        description: {
            title: 'Tool Call Response',
            text: 'The server returns the result of the tool execution.',
            points: [
                'Results are returned as content blocks',
                'Can include text, images, or other data types',
                'The AI can use this result in its response'
            ]
        },
        request: null,
        response: {
            jsonrpc: '2.0',
            id: 3,
            result: {
                content: [
                    {
                        type: 'text',
                        text: 'Current weather in San Francisco: 65°F, Partly Cloudy'
                    }
                ]
            }
        }
    }
];

let currentStep = -1;
let simulationStarted = false;

const startBtn = document.getElementById('start-protocol');
const nextBtn = document.getElementById('next-step');
const resetBtn = document.getElementById('reset-protocol');
const timelineSteps = document.getElementById('timeline-steps');
const currentMessage = document.getElementById('current-message');
const messageDirection = document.getElementById('message-direction');
const stepDescription = document.getElementById('step-description');

function initializeTimeline() {
    timelineSteps.innerHTML = protocolSteps.map((step, i) => `
        <div class="timeline-step" data-step="${i}">
            <div class="step-arrow ${step.direction}"></div>
            <div class="step-label">${step.label}</div>
        </div>
    `).join('');
}

function updateProtocolView() {
    // Update timeline highlighting
    document.querySelectorAll('.timeline-step').forEach((el, i) => {
        el.classList.remove('active', 'completed');
        if (i < currentStep) {
            el.classList.add('completed');
        } else if (i === currentStep) {
            el.classList.add('active');
        }
    });

    if (currentStep >= 0 && currentStep < protocolSteps.length) {
        const step = protocolSteps[currentStep];

        // Update message display
        const message = step.request || step.response;
        currentMessage.textContent = JSON.stringify(message, null, 2);
        messageDirection.textContent = step.direction === 'right' ? 'Client → Server' : 'Server → Client';

        // Update description
        stepDescription.innerHTML = `
            <h4>${step.description.title}</h4>
            <p>${step.description.text}</p>
            <ul>
                ${step.description.points.map(p => `<li>${p}</li>`).join('')}
            </ul>
        `;

        // Re-highlight JSON
        if (typeof Prism !== 'undefined') {
            Prism.highlightElement(currentMessage);
        }
    }

    // Update button states
    nextBtn.disabled = currentStep >= protocolSteps.length - 1;
}

startBtn.addEventListener('click', () => {
    simulationStarted = true;
    currentStep = 0;
    startBtn.disabled = true;
    nextBtn.disabled = false;
    updateProtocolView();
});

nextBtn.addEventListener('click', () => {
    if (currentStep < protocolSteps.length - 1) {
        currentStep++;
        updateProtocolView();
    }
});

resetBtn.addEventListener('click', () => {
    simulationStarted = false;
    currentStep = -1;
    startBtn.disabled = false;
    nextBtn.disabled = true;

    document.querySelectorAll('.timeline-step').forEach(el => {
        el.classList.remove('active', 'completed');
    });

    currentMessage.textContent = '// Click "Start Simulation" to begin';
    messageDirection.textContent = '—';
    stepDescription.innerHTML = `
        <h4>Protocol Overview</h4>
        <p>The MCP protocol uses JSON-RPC 2.0 for communication. It follows a structured lifecycle:</p>
        <ol>
            <li><strong>Initialize:</strong> Client sends capabilities, server responds with its capabilities</li>
            <li><strong>Initialized:</strong> Client confirms, connection is ready</li>
            <li><strong>Operation:</strong> Tools, resources, and prompts can be used</li>
            <li><strong>Shutdown:</strong> Graceful disconnection</li>
        </ol>
    `;
});

initializeTimeline();

// ============================================================================
// Tool Builder Tab
// ============================================================================

let paramCount = 1;
let currentLang = 'python';

const toolNameInput = document.getElementById('tool-name');
const toolDescInput = document.getElementById('tool-description');
const paramsList = document.getElementById('params-list');
const addParamBtn = document.getElementById('add-param');
const toolOutput = document.getElementById('tool-output');
const langButtons = document.querySelectorAll('.lang-btn');

function generateToolCode() {
    const toolName = toolNameInput.value || 'my_tool';
    const toolDesc = toolDescInput.value || 'Tool description';

    // Gather parameters
    const params = [];
    document.querySelectorAll('.param-row').forEach(row => {
        const name = row.querySelector('.param-name').value;
        const type = row.querySelector('.param-type').value;
        const desc = row.querySelector('.param-desc').value;
        const required = row.querySelector('.param-required input').checked;
        if (name) {
            params.push({ name, type, desc, required });
        }
    });

    if (currentLang === 'python') {
        return generatePythonTool(toolName, toolDesc, params);
    } else {
        return generateTypeScriptTool(toolName, toolDesc, params);
    }
}

function generatePythonTool(name, desc, params) {
    const typeMap = {
        string: 'str',
        number: 'float',
        boolean: 'bool',
        array: 'list',
        object: 'dict'
    };

    const paramDefs = params.map(p => {
        const pyType = typeMap[p.type] || 'str';
        return `${p.name}: ${pyType}`;
    }).join(', ');

    const docParams = params.map(p =>
        `        ${p.name}: ${p.desc || 'Parameter description'}`
    ).join('\n');

    const returnContent = `TextContent(type="text", text=f"${name} called with: ${params.map(p => `{${p.name}}`).join(', ')}")`;

    return `from mcp.server import Server
from mcp.types import TextContent

server = Server("my-server")

@server.tool()
async def ${name}(${paramDefs}) -> list[TextContent]:
    """${desc}

    Args:
${docParams}

    Returns:
        Tool execution result
    """
    # TODO: Implement tool logic here
    return [${returnContent}]

# Run the server
if __name__ == "__main__":
    import asyncio
    asyncio.run(server.run())`;
}

function generateTypeScriptTool(name, desc, params) {
    const typeMap = {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        array: 'array',
        object: 'object'
    };

    const properties = params.map(p => `
          ${p.name}: {
            type: "${p.type}",
            description: "${p.desc || 'Parameter description'}"
          }`).join(',');

    const required = params.filter(p => p.required).map(p => `"${p.name}"`).join(', ');

    return `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Define the tool
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "${name}",
      description: "${desc}",
      inputSchema: {
        type: "object",
        properties: {${properties}
        },
        required: [${required}]
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "${name}") {
    const args = request.params.arguments;
    // TODO: Implement tool logic here
    return {
      content: [{
        type: "text",
        text: \`${name} called with: \${JSON.stringify(args)}\`
      }]
    };
  }
  throw new Error("Unknown tool");
});

// Run server
const transport = new StdioServerTransport();
await server.connect(transport);`;
}

function updateToolPreview() {
    const code = generateToolCode();
    toolOutput.textContent = code;
    toolOutput.className = currentLang === 'python' ? 'language-python' : 'language-typescript';
    if (typeof Prism !== 'undefined') {
        Prism.highlightElement(toolOutput);
    }
}

// Event listeners
toolNameInput.addEventListener('input', updateToolPreview);
toolDescInput.addEventListener('input', updateToolPreview);

addParamBtn.addEventListener('click', () => {
    const newParam = document.createElement('div');
    newParam.className = 'param-row';
    newParam.dataset.paramIndex = paramCount++;
    newParam.innerHTML = `
        <input type="text" class="param-name" placeholder="Name">
        <select class="param-type">
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="array">array</option>
            <option value="object">object</option>
        </select>
        <input type="text" class="param-desc" placeholder="Description">
        <label class="param-required">
            <input type="checkbox" checked> Required
        </label>
        <button class="btn-icon remove-param" title="Remove">×</button>
    `;
    paramsList.appendChild(newParam);
    attachParamListeners(newParam);
    updateToolPreview();
});

function attachParamListeners(row) {
    row.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', updateToolPreview);
        el.addEventListener('input', updateToolPreview);
    });
    row.querySelector('.remove-param').addEventListener('click', () => {
        row.remove();
        updateToolPreview();
    });
}

// Initialize existing param row
document.querySelectorAll('.param-row').forEach(attachParamListeners);

langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        langButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLang = btn.dataset.lang;
        updateToolPreview();
    });
});

document.getElementById('copy-tool').addEventListener('click', () => {
    copyToClipboard(toolOutput.textContent);
});

// Initial preview
updateToolPreview();

// ============================================================================
// Messages Tab
// ============================================================================

const mcpMessages = {
    'initialize': {
        title: 'initialize',
        type: 'Request',
        description: 'Initial handshake message sent by the client to establish connection and negotiate capabilities.',
        request: {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    roots: { listChanged: true },
                    sampling: {}
                },
                clientInfo: {
                    name: 'my-client',
                    version: '1.0.0'
                }
            }
        },
        response: {
            jsonrpc: '2.0',
            id: 1,
            result: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {},
                    resources: { subscribe: true },
                    prompts: {}
                },
                serverInfo: {
                    name: 'my-server',
                    version: '1.0.0'
                }
            }
        }
    },
    'initialized': {
        title: 'notifications/initialized',
        type: 'Notification',
        description: 'Sent by the client after receiving the initialize response to confirm the connection is ready.',
        request: {
            jsonrpc: '2.0',
            method: 'notifications/initialized'
        },
        response: null
    },
    'shutdown': {
        title: 'shutdown',
        type: 'Request',
        description: 'Request to gracefully close the connection. Server should clean up resources.',
        request: {
            jsonrpc: '2.0',
            id: 99,
            method: 'shutdown'
        },
        response: {
            jsonrpc: '2.0',
            id: 99,
            result: {}
        }
    },
    'tools-list': {
        title: 'tools/list',
        type: 'Request',
        description: 'Request to list all available tools provided by the server.',
        request: {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {}
        },
        response: {
            jsonrpc: '2.0',
            id: 2,
            result: {
                tools: [
                    {
                        name: 'get_weather',
                        description: 'Get current weather for a location',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                location: { type: 'string', description: 'City name' },
                                units: { type: 'string', enum: ['celsius', 'fahrenheit'] }
                            },
                            required: ['location']
                        }
                    },
                    {
                        name: 'search_web',
                        description: 'Search the web for information',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: { type: 'string', description: 'Search query' },
                                limit: { type: 'number', description: 'Max results' }
                            },
                            required: ['query']
                        }
                    }
                ]
            }
        }
    },
    'tools-call': {
        title: 'tools/call',
        type: 'Request',
        description: 'Invoke a tool with the specified arguments. The server executes the tool and returns results.',
        request: {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'get_weather',
                arguments: {
                    location: 'San Francisco',
                    units: 'celsius'
                }
            }
        },
        response: {
            jsonrpc: '2.0',
            id: 3,
            result: {
                content: [
                    {
                        type: 'text',
                        text: 'Current weather in San Francisco: 18°C, Partly Cloudy\nHumidity: 65%\nWind: 12 km/h W'
                    }
                ],
                isError: false
            }
        }
    },
    'tools-result': {
        title: 'tools/call (error)',
        type: 'Response',
        description: 'Example of a tool call that returns an error.',
        request: {
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: {
                name: 'get_weather',
                arguments: {
                    location: 'InvalidCity123'
                }
            }
        },
        response: {
            jsonrpc: '2.0',
            id: 4,
            result: {
                content: [
                    {
                        type: 'text',
                        text: 'Error: Location not found. Please provide a valid city name.'
                    }
                ],
                isError: true
            }
        }
    },
    'resources-list': {
        title: 'resources/list',
        type: 'Request',
        description: 'Request to list all available resources that the server can provide.',
        request: {
            jsonrpc: '2.0',
            id: 5,
            method: 'resources/list',
            params: {}
        },
        response: {
            jsonrpc: '2.0',
            id: 5,
            result: {
                resources: [
                    {
                        uri: 'file:///project/README.md',
                        name: 'Project README',
                        mimeType: 'text/markdown',
                        description: 'Project documentation'
                    },
                    {
                        uri: 'db://users/schema',
                        name: 'Users Table Schema',
                        mimeType: 'application/json',
                        description: 'Database schema for users table'
                    }
                ]
            }
        }
    },
    'resources-read': {
        title: 'resources/read',
        type: 'Request',
        description: 'Request to read the contents of a specific resource by its URI.',
        request: {
            jsonrpc: '2.0',
            id: 6,
            method: 'resources/read',
            params: {
                uri: 'file:///project/README.md'
            }
        },
        response: {
            jsonrpc: '2.0',
            id: 6,
            result: {
                contents: [
                    {
                        uri: 'file:///project/README.md',
                        mimeType: 'text/markdown',
                        text: '# My Project\n\nThis is a sample project demonstrating MCP integration.\n\n## Getting Started\n\n...'
                    }
                ]
            }
        }
    },
    'resources-subscribe': {
        title: 'resources/subscribe',
        type: 'Request',
        description: 'Subscribe to updates for a specific resource. Server will send notifications when the resource changes.',
        request: {
            jsonrpc: '2.0',
            id: 7,
            method: 'resources/subscribe',
            params: {
                uri: 'file:///project/config.json'
            }
        },
        response: {
            jsonrpc: '2.0',
            id: 7,
            result: {}
        }
    },
    'prompts-list': {
        title: 'prompts/list',
        type: 'Request',
        description: 'Request to list all available prompt templates provided by the server.',
        request: {
            jsonrpc: '2.0',
            id: 8,
            method: 'prompts/list',
            params: {}
        },
        response: {
            jsonrpc: '2.0',
            id: 8,
            result: {
                prompts: [
                    {
                        name: 'code-review',
                        description: 'Review code for bugs and improvements',
                        arguments: [
                            { name: 'code', description: 'Code to review', required: true },
                            { name: 'language', description: 'Programming language', required: false }
                        ]
                    },
                    {
                        name: 'summarize-document',
                        description: 'Summarize a document or text',
                        arguments: [
                            { name: 'text', description: 'Text to summarize', required: true },
                            { name: 'length', description: 'Summary length (short/medium/long)', required: false }
                        ]
                    }
                ]
            }
        }
    },
    'prompts-get': {
        title: 'prompts/get',
        type: 'Request',
        description: 'Get a specific prompt template with argument substitution.',
        request: {
            jsonrpc: '2.0',
            id: 9,
            method: 'prompts/get',
            params: {
                name: 'code-review',
                arguments: {
                    code: 'function add(a, b) { return a + b; }',
                    language: 'javascript'
                }
            }
        },
        response: {
            jsonrpc: '2.0',
            id: 9,
            result: {
                description: 'Review code for bugs and improvements',
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: 'Please review the following javascript code for bugs, security issues, and potential improvements:\n\n```javascript\nfunction add(a, b) { return a + b; }\n```\n\nProvide specific suggestions with code examples.'
                        }
                    }
                ]
            }
        }
    }
};

let currentMsgKey = 'initialize';
let currentView = 'request';

const msgTitle = document.getElementById('msg-title');
const msgType = document.getElementById('msg-type');
const msgDescription = document.getElementById('msg-description');
const msgCode = document.getElementById('msg-code');
const msgButtons = document.querySelectorAll('.msg-btn');
const detailTabs = document.querySelectorAll('.detail-tab');

function updateMessageView() {
    const msg = mcpMessages[currentMsgKey];
    if (!msg) return;

    msgTitle.textContent = msg.title;
    msgType.textContent = msg.type;
    msgDescription.textContent = msg.description;

    const content = currentView === 'request' ? msg.request : msg.response;
    if (content) {
        msgCode.textContent = JSON.stringify(content, null, 2);
    } else {
        msgCode.textContent = '// No ' + currentView + ' for this message type';
    }

    if (typeof Prism !== 'undefined') {
        Prism.highlightElement(msgCode);
    }
}

msgButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        msgButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMsgKey = btn.dataset.msg;
        updateMessageView();
    });
});

detailTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        detailTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentView = tab.dataset.view;
        updateMessageView();
    });
});

document.getElementById('copy-msg').addEventListener('click', () => {
    copyToClipboard(msgCode.textContent);
});

// Initial message view
updateMessageView();

// ============================================================================
// Config Tab
// ============================================================================

const serverNameInput = document.getElementById('server-name');
const serverPathInput = document.getElementById('server-path');
const extraArgsInput = document.getElementById('extra-args');
const runtimeRadios = document.querySelectorAll('input[name="runtime"]');
const envVars = document.getElementById('env-vars');
const addEnvBtn = document.getElementById('add-env');
const configOutput = document.getElementById('config-output');

function generateConfig() {
    const serverName = serverNameInput.value || 'my-server';
    const serverPath = serverPathInput.value || '/path/to/server.py';
    const runtime = document.querySelector('input[name="runtime"]:checked').value;
    const extraArgs = extraArgsInput.value.trim();

    // Build command and args based on runtime
    let command, args;
    switch (runtime) {
        case 'python':
            command = 'python';
            args = [serverPath];
            break;
        case 'node':
            command = 'node';
            args = [serverPath];
            break;
        case 'uv':
            command = 'uv';
            args = ['run', serverPath];
            break;
    }

    // Add extra args
    if (extraArgs) {
        args.push(...extraArgs.split(/\s+/));
    }

    // Build environment variables
    const env = {};
    document.querySelectorAll('.env-row').forEach(row => {
        const key = row.querySelector('.env-key').value;
        const value = row.querySelector('.env-value').value;
        if (key) {
            env[key] = value;
        }
    });

    // Build config object
    const config = {
        mcpServers: {
            [serverName]: {
                command,
                args
            }
        }
    };

    // Add env if not empty
    if (Object.keys(env).length > 0) {
        config.mcpServers[serverName].env = env;
    }

    return JSON.stringify(config, null, 2);
}

function updateConfigPreview() {
    const config = generateConfig();
    configOutput.textContent = config;
    if (typeof Prism !== 'undefined') {
        Prism.highlightElement(configOutput);
    }
}

// Event listeners
serverNameInput.addEventListener('input', updateConfigPreview);
serverPathInput.addEventListener('input', updateConfigPreview);
extraArgsInput.addEventListener('input', updateConfigPreview);
runtimeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        // Update path extension based on runtime
        const runtime = document.querySelector('input[name="runtime"]:checked').value;
        if (runtime === 'node') {
            serverPathInput.value = serverPathInput.value.replace(/\.py$/, '.js');
        } else {
            serverPathInput.value = serverPathInput.value.replace(/\.js$/, '.py');
        }
        updateConfigPreview();
    });
});

addEnvBtn.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'env-row';
    newRow.innerHTML = `
        <input type="text" class="env-key" placeholder="KEY">
        <span class="env-equals">=</span>
        <input type="text" class="env-value" placeholder="value">
        <button class="btn-icon remove-env" title="Remove">×</button>
    `;
    envVars.appendChild(newRow);
    attachEnvListeners(newRow);
});

function attachEnvListeners(row) {
    row.querySelectorAll('input').forEach(el => {
        el.addEventListener('input', updateConfigPreview);
    });
    row.querySelector('.remove-env').addEventListener('click', () => {
        row.remove();
        updateConfigPreview();
    });
}

// Initialize existing env rows
document.querySelectorAll('.env-row').forEach(attachEnvListeners);

document.getElementById('copy-config').addEventListener('click', () => {
    copyToClipboard(configOutput.textContent);
});

// Initial config preview
updateConfigPreview();

// ============================================================================
// Initialization
// ============================================================================

console.log('MCP Demo initialized');
