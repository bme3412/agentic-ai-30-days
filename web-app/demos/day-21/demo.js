// ============================================================
// Day 21: A2A Protocol - Interactive Demo
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initArchitecture();
    initAgentCardBuilder();
    initTaskSimulator();
    initMessageSimulator();
    initComparison();
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
    client: {
        title: 'Client Agent (Orchestrator)',
        description: 'The client agent initiates communication with remote agents. It fetches Agent Cards to discover capabilities, sends messages to create tasks, and handles responses. In enterprise systems, this is often an orchestrator that coordinates multiple specialist agents.'
    },
    discovery: {
        title: 'Discovery Layer',
        description: 'Agent discovery happens via Agent Cards served at /.well-known/agent-card.json. The client fetches these cards to learn what skills remote agents offer, what authentication they require, and how to communicate with them.'
    },
    messaging: {
        title: 'Messaging Layer',
        description: 'Messages are sent via JSON-RPC 2.0 over HTTPS. Each message contains Parts (text, data, URLs, or binary content). Messages can reference existing tasks for multi-turn conversations or create new tasks.'
    },
    tasks: {
        title: 'Task Management',
        description: 'Every interaction creates a Task with a unique ID and lifecycle state. Tasks progress through states (SUBMITTED → WORKING → COMPLETED) and can branch to INPUT_REQUIRED or AUTH_REQUIRED when the agent needs more information.'
    },
    research: {
        title: 'Research Agent',
        description: 'A specialist agent that performs research tasks - searching literature, gathering data, synthesizing information. The client agent can delegate research subtasks to this agent and receive structured results.'
    },
    analytics: {
        title: 'Analytics Agent',
        description: 'A specialist agent for data analysis - running statistical models, generating visualizations, identifying patterns. Can receive data from other agents and return analytical insights.'
    },
    booking: {
        title: 'Booking Agent',
        description: 'A specialist agent for travel booking - searching flights, hotels, and car rentals. Demonstrates how agents from different vendors can be coordinated through A2A.'
    },
    card: {
        title: 'Agent Card',
        description: 'A JSON manifest that describes the agent\'s capabilities, skills, authentication requirements, and connection details. Served at /.well-known/agent-card.json for discovery by client agents.'
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

    // Flow demo
    const startFlowBtn = document.getElementById('start-flow');
    const resetFlowBtn = document.getElementById('reset-flow');
    const flowSteps = document.querySelectorAll('.flow-step');

    startFlowBtn.addEventListener('click', () => {
        flowSteps.forEach(step => step.classList.remove('active', 'completed'));

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep > 0) {
                flowSteps[currentStep - 1].classList.remove('active');
                flowSteps[currentStep - 1].classList.add('completed');
            }

            if (currentStep < flowSteps.length) {
                flowSteps[currentStep].classList.add('active');
                currentStep++;
            } else {
                clearInterval(interval);
            }
        }, 1000);
    });

    resetFlowBtn.addEventListener('click', () => {
        flowSteps.forEach(step => {
            step.classList.remove('active', 'completed');
        });
    });
}

// ============================================================
// Agent Card Builder
// ============================================================

const exampleCards = {
    weather: {
        name: 'Weather Agent',
        description: 'Provides weather forecasts and historical weather data for any location worldwide.',
        organization: 'WeatherCorp',
        capabilities: { streaming: true, pushNotifications: false, extendedCards: false },
        auth: 'apiKey',
        skills: [
            { id: 'weather-forecast', name: 'Weather Forecast' },
            { id: 'historical-weather', name: 'Historical Data' }
        ]
    },
    research: {
        name: 'Research Agent',
        description: 'Performs comprehensive research on any topic, synthesizing information from multiple sources.',
        organization: 'ResearchAI',
        capabilities: { streaming: true, pushNotifications: true, extendedCards: true },
        auth: 'oauth2',
        skills: [
            { id: 'literature-search', name: 'Literature Search' },
            { id: 'data-synthesis', name: 'Data Synthesis' },
            { id: 'fact-check', name: 'Fact Checking' }
        ]
    },
    booking: {
        name: 'Travel Booking Agent',
        description: 'Books flights, hotels, and rental cars. Handles complex multi-leg itineraries.',
        organization: 'TravelTech',
        capabilities: { streaming: true, pushNotifications: true, extendedCards: false },
        auth: 'oauth2',
        skills: [
            { id: 'flight-search', name: 'Flight Search' },
            { id: 'hotel-booking', name: 'Hotel Booking' },
            { id: 'car-rental', name: 'Car Rental' }
        ]
    },
    analytics: {
        name: 'Analytics Agent',
        description: 'Performs data analysis, generates visualizations, and identifies statistical patterns.',
        organization: 'DataInsights',
        capabilities: { streaming: true, pushNotifications: false, extendedCards: true },
        auth: 'bearer',
        skills: [
            { id: 'statistical-analysis', name: 'Statistical Analysis' },
            { id: 'visualization', name: 'Data Visualization' },
            { id: 'trend-detection', name: 'Trend Detection' }
        ]
    }
};

function initAgentCardBuilder() {
    const nameInput = document.getElementById('agent-name');
    const descInput = document.getElementById('agent-desc');
    const orgInput = document.getElementById('agent-org');
    const streamingCheck = document.getElementById('cap-streaming');
    const pushCheck = document.getElementById('cap-push');
    const extendedCheck = document.getElementById('cap-extended');
    const authSelect = document.getElementById('auth-type');
    const skillsList = document.getElementById('skills-list');
    const addSkillBtn = document.getElementById('add-skill');
    const cardPreview = document.getElementById('card-json');
    const copyBtn = document.getElementById('copy-card');

    function updatePreview() {
        const skills = [];
        document.querySelectorAll('.skill-item').forEach(item => {
            const id = item.querySelector('.skill-name').value;
            const name = item.querySelector('.skill-display').value;
            if (id && name) {
                skills.push({ id, name });
            }
        });

        const card = {
            name: nameInput.value,
            description: descInput.value,
            provider: {
                organization: orgInput.value,
                url: `https://${orgInput.value.toLowerCase().replace(/\s+/g, '')}.example.com`
            },
            version: '1.0.0',
            documentationUrl: `https://docs.${orgInput.value.toLowerCase().replace(/\s+/g, '')}.example.com`,
            capabilities: {
                streaming: streamingCheck.checked,
                pushNotifications: pushCheck.checked,
                extendedCards: extendedCheck.checked
            },
            interfaces: [
                {
                    type: 'JSON_RPC_2_0',
                    url: `https://api.${orgInput.value.toLowerCase().replace(/\s+/g, '')}.example.com/a2a`
                }
            ],
            securitySchemes: getSecurityScheme(authSelect.value),
            defaultSecurity: [authSelect.value],
            skills: skills.map(s => ({
                id: s.id,
                name: s.name,
                description: `${s.name} capability`,
                inputModes: ['text'],
                outputModes: ['text', 'data']
            }))
        };

        cardPreview.innerHTML = `<code class="language-json">${JSON.stringify(card, null, 2)}</code>`;
        Prism.highlightElement(cardPreview.querySelector('code'));
    }

    function getSecurityScheme(type) {
        const schemes = {
            apiKey: {
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key'
                }
            },
            oauth2: {
                oauth2: {
                    type: 'oauth2',
                    flows: {
                        clientCredentials: {
                            tokenUrl: 'https://auth.example.com/token',
                            scopes: {
                                'agent:read': 'Read agent capabilities',
                                'task:write': 'Create and manage tasks'
                            }
                        }
                    }
                }
            },
            bearer: {
                bearer: {
                    type: 'http',
                    scheme: 'bearer'
                }
            },
            mtls: {
                mtls: {
                    type: 'mutualTLS',
                    description: 'Client certificate authentication'
                }
            }
        };
        return schemes[type] || schemes.apiKey;
    }

    // Event listeners
    [nameInput, descInput, orgInput].forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    [streamingCheck, pushCheck, extendedCheck].forEach(check => {
        check.addEventListener('change', updatePreview);
    });

    authSelect.addEventListener('change', updatePreview);

    addSkillBtn.addEventListener('click', () => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerHTML = `
            <input type="text" class="skill-name" placeholder="Skill ID">
            <input type="text" class="skill-display" placeholder="Display Name">
            <button class="btn-remove-skill">×</button>
        `;
        skillsList.appendChild(skillItem);

        skillItem.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updatePreview);
        });

        skillItem.querySelector('.btn-remove-skill').addEventListener('click', () => {
            skillItem.remove();
            updatePreview();
        });
    });

    // Initial remove button
    document.querySelectorAll('.btn-remove-skill').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.skill-item').remove();
            updatePreview();
        });
    });

    document.querySelectorAll('.skill-item input').forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    copyBtn.addEventListener('click', () => {
        const code = cardPreview.textContent;
        navigator.clipboard.writeText(code).then(() => {
            showToast('Agent Card copied to clipboard!');
        });
    });

    // Example cards
    document.querySelectorAll('.example-card').forEach(card => {
        card.addEventListener('click', () => {
            const example = exampleCards[card.dataset.example];
            if (example) {
                nameInput.value = example.name;
                descInput.value = example.description;
                orgInput.value = example.organization;
                streamingCheck.checked = example.capabilities.streaming;
                pushCheck.checked = example.capabilities.pushNotifications;
                extendedCheck.checked = example.capabilities.extendedCards;
                authSelect.value = example.auth;

                // Update skills
                skillsList.innerHTML = '';
                example.skills.forEach(skill => {
                    const skillItem = document.createElement('div');
                    skillItem.className = 'skill-item';
                    skillItem.innerHTML = `
                        <input type="text" class="skill-name" value="${skill.id}" placeholder="Skill ID">
                        <input type="text" class="skill-display" value="${skill.name}" placeholder="Display Name">
                        <button class="btn-remove-skill">×</button>
                    `;
                    skillsList.appendChild(skillItem);

                    skillItem.querySelectorAll('input').forEach(input => {
                        input.addEventListener('input', updatePreview);
                    });

                    skillItem.querySelector('.btn-remove-skill').addEventListener('click', () => {
                        skillItem.remove();
                        updatePreview();
                    });
                });

                updatePreview();
                showToast(`Loaded ${example.name} example`);
            }
        });
    });

    updatePreview();
}

// ============================================================
// Task Simulator
// ============================================================

const scenarios = {
    simple: {
        name: 'Simple Query',
        steps: [
            { state: 'TASK_STATE_SUBMITTED', message: 'Task received by agent', delay: 500 },
            { state: 'TASK_STATE_WORKING', message: 'Processing query...', delay: 1000 },
            { state: 'TASK_STATE_COMPLETED', message: 'Response generated', delay: 1000, artifact: true }
        ]
    },
    clarification: {
        name: 'Needs Clarification',
        steps: [
            { state: 'TASK_STATE_SUBMITTED', message: 'Task received', delay: 500 },
            { state: 'TASK_STATE_WORKING', message: 'Analyzing request...', delay: 1000 },
            { state: 'TASK_STATE_INPUT_REQUIRED', message: 'Which city did you mean?', delay: 1500 },
            { state: 'TASK_STATE_WORKING', message: 'Processing with clarification...', delay: 2000 },
            { state: 'TASK_STATE_COMPLETED', message: 'Response ready', delay: 1000, artifact: true }
        ]
    },
    auth: {
        name: 'Requires Authorization',
        steps: [
            { state: 'TASK_STATE_SUBMITTED', message: 'Task received', delay: 500 },
            { state: 'TASK_STATE_WORKING', message: 'Processing...', delay: 1000 },
            { state: 'TASK_STATE_AUTH_REQUIRED', message: 'Calendar access needed', delay: 1500 },
            { state: 'TASK_STATE_WORKING', message: 'Authorized, continuing...', delay: 2000 },
            { state: 'TASK_STATE_COMPLETED', message: 'Task completed', delay: 1000, artifact: true }
        ]
    },
    'long-running': {
        name: 'Long-Running Task',
        steps: [
            { state: 'TASK_STATE_SUBMITTED', message: 'Research task queued', delay: 500 },
            { state: 'TASK_STATE_WORKING', message: 'Searching sources... (10%)', delay: 1500 },
            { state: 'TASK_STATE_WORKING', message: 'Analyzing data... (40%)', delay: 2000 },
            { state: 'TASK_STATE_WORKING', message: 'Synthesizing results... (70%)', delay: 2000 },
            { state: 'TASK_STATE_WORKING', message: 'Generating report... (90%)', delay: 1500 },
            { state: 'TASK_STATE_COMPLETED', message: 'Research complete', delay: 1000, artifact: true }
        ]
    },
    error: {
        name: 'Error Scenario',
        steps: [
            { state: 'TASK_STATE_SUBMITTED', message: 'Task received', delay: 500 },
            { state: 'TASK_STATE_WORKING', message: 'Processing...', delay: 1000 },
            { state: 'TASK_STATE_FAILED', message: 'Error: Service unavailable', delay: 1500 }
        ]
    }
};

function initTaskSimulator() {
    const scenarioSelect = document.getElementById('scenario');
    const runBtn = document.getElementById('run-scenario');
    const taskJson = document.getElementById('task-json');
    const timeline = document.getElementById('timeline-events');
    const stateNodes = document.querySelectorAll('.state-node');

    runBtn.addEventListener('click', () => {
        const scenario = scenarios[scenarioSelect.value];
        if (!scenario) return;

        // Reset
        timeline.innerHTML = '';
        stateNodes.forEach(node => node.classList.remove('active', 'visited'));
        runBtn.disabled = true;

        let taskId = 'task-' + Math.random().toString(36).substr(2, 9);
        let contextId = 'ctx-' + Math.random().toString(36).substr(2, 9);
        let totalDelay = 0;

        scenario.steps.forEach((step, index) => {
            totalDelay += step.delay;

            setTimeout(() => {
                // Update state visualization
                stateNodes.forEach(node => node.classList.remove('active'));
                const stateMap = {
                    'TASK_STATE_SUBMITTED': 'submitted',
                    'TASK_STATE_WORKING': 'working',
                    'TASK_STATE_COMPLETED': 'completed',
                    'TASK_STATE_FAILED': 'failed',
                    'TASK_STATE_INPUT_REQUIRED': 'input_required',
                    'TASK_STATE_AUTH_REQUIRED': 'auth_required'
                };
                const stateNode = document.querySelector(`[data-state="${stateMap[step.state]}"]`);
                if (stateNode) {
                    stateNode.classList.add('active');
                    stateNode.classList.add('visited');
                }

                // Update task JSON
                const task = {
                    id: taskId,
                    contextId: contextId,
                    status: {
                        state: step.state,
                        timestamp: new Date().toISOString(),
                        message: step.message ? {
                            role: 'ROLE_AGENT',
                            parts: [{ text: step.message }]
                        } : undefined
                    },
                    artifacts: step.artifact ? [{
                        artifactId: 'artifact-' + Math.random().toString(36).substr(2, 9),
                        name: 'Result',
                        parts: [{ text: 'Task output here...' }]
                    }] : [],
                    history: []
                };

                taskJson.innerHTML = `<code class="language-json">${JSON.stringify(task, null, 2)}</code>`;
                Prism.highlightElement(taskJson.querySelector('code'));

                // Add timeline event
                const event = document.createElement('div');
                event.className = 'timeline-event';
                event.innerHTML = `
                    <span class="event-time">${new Date().toLocaleTimeString()}</span>
                    <span class="event-state ${step.state.includes('COMPLETED') ? 'success' : step.state.includes('FAILED') ? 'error' : ''}">${step.state}</span>
                    <span class="event-message">${step.message}</span>
                `;
                timeline.appendChild(event);
                timeline.scrollTop = timeline.scrollHeight;

                // Re-enable button on last step
                if (index === scenario.steps.length - 1) {
                    runBtn.disabled = false;
                }
            }, totalDelay);
        });
    });
}

// ============================================================
// Message Simulator
// ============================================================

function initMessageSimulator() {
    const messageInput = document.getElementById('user-message');
    const sendBtn = document.getElementById('send-message');
    const agentStatus = document.getElementById('agent-status');
    const protocolMessage = document.getElementById('protocol-message');
    const msgTabs = document.querySelectorAll('.msg-tab');
    const animation = document.getElementById('message-animation');

    let currentMessages = {
        request: null,
        response: null,
        stream: []
    };

    msgTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            msgTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displayMessage(tab.dataset.msg);
        });
    });

    function displayMessage(type) {
        let content = '';
        if (type === 'request' && currentMessages.request) {
            content = JSON.stringify(currentMessages.request, null, 2);
        } else if (type === 'response' && currentMessages.response) {
            content = JSON.stringify(currentMessages.response, null, 2);
        } else if (type === 'stream' && currentMessages.stream.length > 0) {
            content = currentMessages.stream.map(e =>
                `data: ${JSON.stringify(e)}`
            ).join('\n\n');
        } else {
            content = '// Send a message to see protocol data';
        }
        protocolMessage.innerHTML = `<code class="language-json">${content}</code>`;
        Prism.highlightElement(protocolMessage.querySelector('code'));
    }

    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (!text) return;

        sendBtn.disabled = true;
        agentStatus.textContent = 'Processing...';
        agentStatus.className = 'status-indicator processing';

        // Create request
        const messageId = 'msg-' + Math.random().toString(36).substr(2, 9);
        currentMessages.request = {
            jsonrpc: '2.0',
            method: 'message/send',
            params: {
                message: {
                    messageId: messageId,
                    role: 'ROLE_USER',
                    parts: [{ text: text }]
                }
            },
            id: 1
        };

        // Show animation
        animation.innerHTML = '<div class="msg-packet outgoing">📨</div>';

        setTimeout(() => {
            animation.innerHTML = '<div class="msg-packet incoming">📬</div>';
        }, 1000);

        // Simulate response
        setTimeout(() => {
            const taskId = 'task-' + Math.random().toString(36).substr(2, 9);

            currentMessages.response = {
                jsonrpc: '2.0',
                result: {
                    task: {
                        id: taskId,
                        contextId: 'ctx-' + Math.random().toString(36).substr(2, 9),
                        status: {
                            state: 'TASK_STATE_COMPLETED',
                            timestamp: new Date().toISOString()
                        },
                        artifacts: [{
                            artifactId: 'art-' + Math.random().toString(36).substr(2, 9),
                            name: 'Weather Report',
                            parts: [{
                                text: 'Tokyo: 68°F (20°C), Partly Cloudy, Humidity 65%'
                            }, {
                                data: {
                                    temperature: 68,
                                    unit: 'fahrenheit',
                                    conditions: 'partly_cloudy',
                                    humidity: 65,
                                    location: 'Tokyo, Japan'
                                }
                            }]
                        }]
                    }
                },
                id: 1
            };

            currentMessages.stream = [
                { task: { id: taskId, status: { state: 'TASK_STATE_SUBMITTED' } } },
                { statusUpdate: { taskId: taskId, status: { state: 'TASK_STATE_WORKING' } } },
                { artifactUpdate: { taskId: taskId, artifact: currentMessages.response.result.task.artifacts[0] } },
                { statusUpdate: { taskId: taskId, status: { state: 'TASK_STATE_COMPLETED' } } }
            ];

            agentStatus.textContent = 'Completed';
            agentStatus.className = 'status-indicator completed';
            animation.innerHTML = '';
            sendBtn.disabled = false;

            displayMessage('response');
            document.querySelector('[data-msg="response"]').click();

            showToast('Message processed successfully!');
        }, 2000);

        displayMessage('request');
    });

    // Initialize
    displayMessage('request');
}

// ============================================================
// Comparison Tab
// ============================================================

function initComparison() {
    // Highlight rows on hover
    const tableRows = document.querySelectorAll('.comparison-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });

    // Scenario cards interaction
    const scenarioCards = document.querySelectorAll('.scenario-card');
    scenarioCards.forEach(card => {
        card.addEventListener('click', () => {
            scenarioCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

// ============================================================
// Utility Functions
// ============================================================

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
