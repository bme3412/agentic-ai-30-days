// Day 16: Long-Term Agent Memory Demo
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initCheckpointingDemo();
  initMemoryDemo();
  initThreadsDemo();
  initPersistenceDemo();
  initCodeBuilder();
});

// ============ Tab Navigation ============
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

// ============ Checkpointing Demo ============
let currentStep = 0;
let checkpoints = [
  { id: 0, state: 'Initial State', messages: [], data: { thread_id: 'demo-session-1' } }
];

const stepStates = [
  { name: 'Initial State', messages: [] },
  { name: 'Input Received', messages: [{ role: 'user', content: 'What is the weather in Tokyo?' }] },
  { name: 'Agent Processing', messages: [{ role: 'user', content: 'What is the weather in Tokyo?' }], tool_calls: ['weather_api'] },
  { name: 'Tool Executed', messages: [{ role: 'user', content: 'What is the weather in Tokyo?' }, { role: 'tool', content: 'Tokyo: 22°C, Sunny' }] },
  { name: 'Response Generated', messages: [{ role: 'user', content: 'What is the weather in Tokyo?' }, { role: 'tool', content: 'Tokyo: 22°C, Sunny' }, { role: 'assistant', content: 'The weather in Tokyo is currently 22°C and sunny!' }] }
];

function initCheckpointingDemo() {
  const stepBtn = document.getElementById('step-execution');
  const resetBtn = document.getElementById('reset-execution');

  stepBtn.addEventListener('click', stepExecution);
  resetBtn.addEventListener('click', resetExecution);

  updateCheckpointUI();
}

function stepExecution() {
  if (currentStep >= 4) return;

  currentStep++;

  // Update graph visualization
  const nodes = document.querySelectorAll('.graph-node');
  nodes.forEach((node, i) => {
    node.classList.remove('active', 'completed');
    if (i < currentStep) {
      node.classList.add('completed');
    } else if (i === currentStep) {
      node.classList.add('active');
    }
  });

  // Add checkpoint
  const newCheckpoint = {
    id: currentStep,
    state: stepStates[currentStep].name,
    messages: stepStates[currentStep].messages,
    data: { thread_id: 'demo-session-1', step: currentStep }
  };
  checkpoints.push(newCheckpoint);

  updateCheckpointUI();
}

function resetExecution() {
  currentStep = 0;
  checkpoints = [
    { id: 0, state: 'Initial State', messages: [], data: { thread_id: 'demo-session-1' } }
  ];

  const nodes = document.querySelectorAll('.graph-node');
  nodes.forEach(node => {
    node.classList.remove('active', 'completed');
  });

  updateCheckpointUI();
}

function updateCheckpointUI() {
  document.getElementById('current-step').textContent = currentStep;

  // Update checkpoints list
  const container = document.getElementById('checkpoints-container');
  container.innerHTML = checkpoints.map((cp, i) => `
    <div class="checkpoint-item ${i === checkpoints.length - 1 ? 'active' : ''}" data-checkpoint="${cp.id}">
      <span class="checkpoint-id">CP-${cp.id}</span>
      <span class="checkpoint-state">${cp.state}</span>
      <button class="btn-time-travel" onclick="timeTravel(${cp.id})">Jump Here</button>
    </div>
  `).join('');

  // Update state inspector
  const latestCheckpoint = checkpoints[checkpoints.length - 1];
  document.getElementById('state-output').textContent = JSON.stringify({
    messages: latestCheckpoint.messages,
    thread_id: latestCheckpoint.data.thread_id,
    checkpoint_id: `CP-${latestCheckpoint.id}`
  }, null, 2);
}

function timeTravel(checkpointId) {
  const targetIndex = checkpoints.findIndex(cp => cp.id === checkpointId);
  if (targetIndex === -1) return;

  // Reset to that checkpoint
  currentStep = checkpointId;
  checkpoints = checkpoints.slice(0, targetIndex + 1);

  // Update graph
  const nodes = document.querySelectorAll('.graph-node');
  nodes.forEach((node, i) => {
    node.classList.remove('active', 'completed');
    if (i < currentStep) {
      node.classList.add('completed');
    } else if (i === currentStep) {
      node.classList.add('active');
    }
  });

  updateCheckpointUI();
}

// Make timeTravel globally accessible
window.timeTravel = timeTravel;

// ============ Memory Demo ============
let conversationMessages = [];
const WINDOW_K = 3;

function initMemoryDemo() {
  const addBtn = document.getElementById('add-message');
  const clearBtn = document.getElementById('clear-messages');
  const input = document.getElementById('user-message');

  addBtn.addEventListener('click', () => {
    const msg = input.value.trim();
    if (msg) {
      addConversationMessage('user', msg);
      // Simulate assistant response
      setTimeout(() => {
        addConversationMessage('assistant', generateAssistantResponse(msg));
      }, 300);
      input.value = '';
    }
  });

  clearBtn.addEventListener('click', () => {
    conversationMessages = [];
    updateMemoryDisplays();
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.msg;
    });
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBtn.click();
  });
}

function generateAssistantResponse(userMsg) {
  const responses = [
    "I understand. That's interesting information about your project.",
    "Got it! I'll remember that for our conversation.",
    "Thanks for sharing. This context helps me assist you better.",
    "Noted! This is valuable information for me to know.",
    "I see. Let me keep that in mind as we continue."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function addConversationMessage(role, content) {
  conversationMessages.push({ role, content });
  updateMemoryDisplays();
}

function updateMemoryDisplays() {
  // Buffer Memory - shows everything
  const bufferContent = document.getElementById('buffer-content');
  const bufferTokens = document.getElementById('buffer-tokens');

  if (conversationMessages.length === 0) {
    bufferContent.innerHTML = '<p class="empty-state">No messages yet</p>';
    bufferTokens.textContent = '0';
  } else {
    bufferContent.innerHTML = conversationMessages.map(msg => `
      <div class="memory-message ${msg.role}">
        <strong>${msg.role}:</strong> ${msg.content}
      </div>
    `).join('');
    bufferTokens.textContent = estimateTokens(conversationMessages.map(m => m.content).join(' '));
  }

  // Summary Memory - summarizes everything
  const summaryContent = document.getElementById('summary-content');
  const summaryTokens = document.getElementById('summary-tokens');

  if (conversationMessages.length === 0) {
    summaryContent.innerHTML = '<p class="empty-state">No messages yet</p>';
    summaryTokens.textContent = '0';
  } else {
    const summary = generateSummary(conversationMessages);
    summaryContent.innerHTML = `
      <div class="memory-summary">
        <strong>Summary:</strong> ${summary}
      </div>
    `;
    summaryTokens.textContent = estimateTokens(summary);
  }

  // Window Memory - shows last K messages
  const windowContent = document.getElementById('window-content');
  const windowTokens = document.getElementById('window-tokens');

  if (conversationMessages.length === 0) {
    windowContent.innerHTML = '<p class="empty-state">No messages yet</p>';
    windowTokens.textContent = '0';
  } else {
    const windowMessages = conversationMessages.slice(-WINDOW_K * 2); // K exchanges = 2K messages
    windowContent.innerHTML = windowMessages.map(msg => `
      <div class="memory-message ${msg.role}">
        <strong>${msg.role}:</strong> ${msg.content}
      </div>
    `).join('');
    if (conversationMessages.length > WINDOW_K * 2) {
      windowContent.innerHTML = `<p class="empty-state" style="color: var(--accent-red); font-size: 0.75rem;">${conversationMessages.length - WINDOW_K * 2} earlier messages forgotten</p>` + windowContent.innerHTML;
    }
    windowTokens.textContent = estimateTokens(windowMessages.map(m => m.content).join(' '));
  }

  // Summary Buffer Memory - summary of old + recent verbatim
  const summaryBufferContent = document.getElementById('summary-buffer-content');
  const summaryBufferTokens = document.getElementById('summary-buffer-tokens');

  if (conversationMessages.length === 0) {
    summaryBufferContent.innerHTML = '<p class="empty-state">No messages yet</p>';
    summaryBufferTokens.textContent = '0';
  } else {
    let html = '';
    let totalTokens = 0;

    if (conversationMessages.length > 4) {
      const oldMessages = conversationMessages.slice(0, -4);
      const summary = generateSummary(oldMessages);
      html += `<div class="memory-summary"><strong>Summary of earlier:</strong> ${summary}</div>`;
      totalTokens += estimateTokens(summary);
    }

    const recentMessages = conversationMessages.slice(-4);
    html += recentMessages.map(msg => `
      <div class="memory-message ${msg.role}">
        <strong>${msg.role}:</strong> ${msg.content}
      </div>
    `).join('');
    totalTokens += estimateTokens(recentMessages.map(m => m.content).join(' '));

    summaryBufferContent.innerHTML = html;
    summaryBufferTokens.textContent = totalTokens;
  }
}

function estimateTokens(text) {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

function generateSummary(messages) {
  if (messages.length === 0) return '';

  // Extract key topics from messages
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);

  if (userMessages.length === 0) return 'Conversation started.';

  if (userMessages.length === 1) {
    return `User discussed: ${userMessages[0].substring(0, 50)}...`;
  }

  // Generate a simple summary
  const topics = userMessages.map(m => {
    const words = m.split(' ').slice(0, 4).join(' ');
    return words;
  });

  return `User discussed: ${topics.join(', ')}. ${messages.length} total messages exchanged.`;
}

// ============ Threads Demo ============
let threads = {
  'user-alice-session-1': []
};
let activeThread = 'user-alice-session-1';

function initThreadsDemo() {
  const createBtn = document.getElementById('create-thread');
  const sendBtn = document.getElementById('send-thread-message');
  const threadInput = document.getElementById('thread-message-input');

  createBtn.addEventListener('click', () => {
    const newId = document.getElementById('new-thread-id').value.trim();
    if (newId && !threads[newId]) {
      threads[newId] = [];
      switchThread(newId);
      updateThreadList();
      document.getElementById('new-thread-id').value = '';
    }
  });

  sendBtn.addEventListener('click', () => {
    const msg = threadInput.value.trim();
    if (msg && activeThread) {
      threads[activeThread].push({ role: 'user', content: msg });
      threads[activeThread].push({ role: 'assistant', content: 'I received your message in this thread.' });
      updateThreadMessages();
      updateThreadList();
      threadInput.value = '';
    }
  });

  threadInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });

  // Thread item clicks
  document.getElementById('thread-list-items').addEventListener('click', (e) => {
    const threadItem = e.target.closest('.thread-item');
    if (threadItem) {
      switchThread(threadItem.dataset.thread);
    }
  });

  updateThreadList();
  updateThreadMessages();
}

function switchThread(threadId) {
  activeThread = threadId;
  document.getElementById('active-thread-name').textContent = threadId;

  document.querySelectorAll('.thread-item').forEach(item => {
    item.classList.toggle('active', item.dataset.thread === threadId);
  });

  updateThreadMessages();
}

function updateThreadList() {
  const container = document.getElementById('thread-list-items');
  container.innerHTML = Object.entries(threads).map(([id, msgs]) => `
    <div class="thread-item ${id === activeThread ? 'active' : ''}" data-thread="${id}">
      <span class="thread-name">${id}</span>
      <span class="thread-msg-count">${msgs.length} messages</span>
    </div>
  `).join('');
}

function updateThreadMessages() {
  const container = document.getElementById('thread-messages');
  const messages = threads[activeThread] || [];

  if (messages.length === 0) {
    container.innerHTML = '<p class="empty-state">No messages in this thread</p>';
  } else {
    container.innerHTML = messages.map(msg => `
      <div class="memory-message ${msg.role}">
        <strong>${msg.role}:</strong> ${msg.content}
      </div>
    `).join('');
  }
}

// ============ Persistence Demo ============
let saverStates = {
  memory: { count: 0, active: true },
  sqlite: { count: 0, active: true },
  postgres: { count: 0, active: true }
};

function initPersistenceDemo() {
  document.querySelectorAll('.btn-add-msg').forEach(btn => {
    btn.addEventListener('click', () => {
      const saver = btn.dataset.saver;
      if (saverStates[saver].active) {
        saverStates[saver].count++;
        updatePersistenceUI();
      }
    });
  });

  document.getElementById('simulate-restart').addEventListener('click', simulateRestart);

  updatePersistenceUI();
}

function updatePersistenceUI() {
  // Memory Saver
  document.getElementById('memory-saver-count').textContent = saverStates.memory.count;
  document.getElementById('memory-saver-state').textContent = saverStates.memory.active ? 'Active' : 'Lost';
  document.getElementById('memory-saver-state').className = 'indicator-value' + (saverStates.memory.active ? '' : ' lost');
  document.querySelector('.persistence-card.memory-saver').classList.toggle('lost', !saverStates.memory.active);

  // SQLite Saver
  document.getElementById('sqlite-saver-count').textContent = saverStates.sqlite.count;
  document.getElementById('sqlite-saver-state').textContent = saverStates.sqlite.active ? 'Active' : 'Lost';
  document.getElementById('sqlite-saver-state').className = 'indicator-value' + (saverStates.sqlite.active ? '' : ' lost');

  // Postgres Saver
  document.getElementById('postgres-saver-count').textContent = saverStates.postgres.count;
  document.getElementById('postgres-saver-state').textContent = saverStates.postgres.active ? 'Active' : 'Lost';
  document.getElementById('postgres-saver-state').className = 'indicator-value' + (saverStates.postgres.active ? '' : ' lost');
}

function simulateRestart() {
  // MemorySaver loses everything
  saverStates.memory.count = 0;
  saverStates.memory.active = false;

  // SQLite and Postgres persist
  // (just briefly flash to show "restart" then recover)

  updatePersistenceUI();

  // After "restart", restore persistent savers
  setTimeout(() => {
    saverStates.memory.active = true;
    // SQLite and Postgres keep their counts
    updatePersistenceUI();
  }, 1500);
}

// ============ Code Builder ============
function initCodeBuilder() {
  document.getElementById('generate-code').addEventListener('click', generateCode);
  document.getElementById('copy-code').addEventListener('click', copyCode);

  // Generate initial code
  generateCode();
}

function generateCode() {
  const checkpointer = document.querySelector('input[name="checkpointer"]:checked').value;
  const useAsync = document.getElementById('use-async').checked;
  const memoryType = document.getElementById('memory-type').value;
  const includeHitl = document.getElementById('include-hitl').checked;
  const includeTools = document.getElementById('include-tools').checked;
  const includeVector = document.getElementById('include-vector').checked;

  let code = '';

  // Imports
  code += '# Imports\n';
  if (useAsync) {
    code += 'import asyncio\n';
  }

  if (checkpointer === 'memory') {
    code += 'from langgraph.checkpoint.memory import MemorySaver\n';
  } else if (checkpointer === 'sqlite') {
    code += 'from langgraph.checkpoint.sqlite import SqliteSaver\n';
  } else if (checkpointer === 'postgres') {
    if (useAsync) {
      code += 'from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver\n';
      code += 'from psycopg_pool import AsyncConnectionPool\n';
    } else {
      code += 'from langgraph.checkpoint.postgres import PostgresSaver\n';
      code += 'import psycopg\n';
    }
  }

  code += 'from langgraph.graph import StateGraph, MessagesState\n';
  code += 'from langchain_openai import ChatOpenAI\n';

  if (memoryType !== 'none') {
    code += `from langchain.memory import ${getMemoryClassName(memoryType)}\n`;
  }

  if (includeVector) {
    code += 'from langchain_openai import OpenAIEmbeddings\n';
    code += 'from langchain_community.vectorstores import Chroma\n';
  }

  if (includeTools) {
    code += 'from langchain_core.messages import AIMessage\n';
  }

  code += '\n';

  // Vector memory class if needed
  if (includeVector) {
    code += '# Long-term vector memory\n';
    code += 'class LongTermMemory:\n';
    code += '    def __init__(self, user_id: str):\n';
    code += '        self.store = Chroma(\n';
    code += '            collection_name=f"user_{user_id}",\n';
    code += '            embedding_function=OpenAIEmbeddings()\n';
    code += '        )\n';
    code += '\n';
    code += '    def remember(self, fact: str):\n';
    code += '        self.store.add_texts([fact])\n';
    code += '\n';
    code += '    def recall(self, query: str, k: int = 3):\n';
    code += '        results = self.store.similarity_search(query, k=k)\n';
    code += '        return [doc.page_content for doc in results]\n';
    code += '\n';
  }

  // Agent node
  code += '# Define agent node\n';
  if (useAsync) {
    code += 'async def agent_node(state: MessagesState):\n';
  } else {
    code += 'def agent_node(state: MessagesState):\n';
  }

  if (includeTools) {
    code += '    llm = ChatOpenAI(model="gpt-4o").bind_tools([your_tool])\n';
  } else {
    code += '    llm = ChatOpenAI(model="gpt-4o")\n';
  }

  if (useAsync) {
    code += '    response = await llm.ainvoke(state["messages"])\n';
  } else {
    code += '    response = llm.invoke(state["messages"])\n';
  }
  code += '    return {"messages": [response]}\n';
  code += '\n';

  // Tool node if needed
  if (includeTools) {
    code += '# Tool execution node\n';
    if (useAsync) {
      code += 'async def tool_node(state: MessagesState):\n';
    } else {
      code += 'def tool_node(state: MessagesState):\n';
    }
    code += '    last_message = state["messages"][-1]\n';
    code += '    results = []\n';
    code += '    for tool_call in last_message.tool_calls:\n';
    code += '        # Execute your tool here\n';
    code += '        result = execute_tool(tool_call)\n';
    code += '        results.append(result)\n';
    code += '    return {"messages": results}\n';
    code += '\n';
    code += '# Routing function\n';
    code += 'def should_continue(state: MessagesState):\n';
    code += '    last_message = state["messages"][-1]\n';
    code += '    if isinstance(last_message, AIMessage) and last_message.tool_calls:\n';
    code += '        return "tools"\n';
    code += '    return "end"\n';
    code += '\n';
  }

  // Build graph
  code += '# Build graph\n';
  code += 'builder = StateGraph(MessagesState)\n';
  code += 'builder.add_node("agent", agent_node)\n';

  if (includeTools) {
    code += 'builder.add_node("tools", tool_node)\n';
    code += '\n';
    code += 'builder.add_edge("__start__", "agent")\n';
    code += 'builder.add_conditional_edges("agent", should_continue, {\n';
    code += '    "tools": "tools",\n';
    code += '    "end": "__end__"\n';
    code += '})\n';
    code += 'builder.add_edge("tools", "agent")\n';
  } else {
    code += 'builder.add_edge("__start__", "agent")\n';
    code += 'builder.add_edge("agent", "__end__")\n';
  }
  code += '\n';

  // Compile with checkpointer
  code += '# Compile with checkpointer\n';

  if (checkpointer === 'memory') {
    code += 'checkpointer = MemorySaver()\n';
    if (includeHitl && includeTools) {
      code += 'graph = builder.compile(\n';
      code += '    checkpointer=checkpointer,\n';
      code += '    interrupt_before=["tools"]  # Human approval before tools\n';
      code += ')\n';
    } else {
      code += 'graph = builder.compile(checkpointer=checkpointer)\n';
    }
  } else if (checkpointer === 'sqlite') {
    code += 'with SqliteSaver.from_conn_string("checkpoints.db") as checkpointer:\n';
    if (includeHitl && includeTools) {
      code += '    graph = builder.compile(\n';
      code += '        checkpointer=checkpointer,\n';
      code += '        interrupt_before=["tools"]\n';
      code += '    )\n';
    } else {
      code += '    graph = builder.compile(checkpointer=checkpointer)\n';
    }
  } else if (checkpointer === 'postgres') {
    code += 'DB_URI = "postgresql://user:password@localhost:5432/langgraph"\n\n';

    if (useAsync) {
      code += 'async def main():\n';
      code += '    async with AsyncConnectionPool(DB_URI, min_size=5, max_size=20) as pool:\n';
      code += '        checkpointer = AsyncPostgresSaver(pool)\n';
      code += '        await checkpointer.setup()\n';
      code += '\n';
      if (includeHitl && includeTools) {
        code += '        graph = builder.compile(\n';
        code += '            checkpointer=checkpointer,\n';
        code += '            interrupt_before=["tools"]\n';
        code += '        )\n';
      } else {
        code += '        graph = builder.compile(checkpointer=checkpointer)\n';
      }
    } else {
      code += 'with psycopg.connect(DB_URI) as conn:\n';
      code += '    checkpointer = PostgresSaver(conn)\n';
      code += '    checkpointer.setup()\n';
      code += '\n';
      if (includeHitl && includeTools) {
        code += '    graph = builder.compile(\n';
        code += '        checkpointer=checkpointer,\n';
        code += '        interrupt_before=["tools"]\n';
        code += '    )\n';
      } else {
        code += '    graph = builder.compile(checkpointer=checkpointer)\n';
      }
    }
  }

  code += '\n';

  // Usage example
  code += '# Usage\n';
  code += 'config = {"configurable": {"thread_id": "user-123-session-1"}}\n';

  const indent = (checkpointer === 'sqlite' || (checkpointer === 'postgres' && !useAsync)) ? '    ' : '';

  if (useAsync) {
    code += '        result = await graph.ainvoke(\n';
    code += '            {"messages": [("user", "Hello!")]},\n';
    code += '            config\n';
    code += '        )\n';
    code += '        print(result["messages"][-1].content)\n';
    code += '\n';
    code += 'asyncio.run(main())\n';
  } else {
    code += indent + 'result = graph.invoke(\n';
    code += indent + '    {"messages": [("user", "Hello!")]},\n';
    code += indent + '    config\n';
    code += indent + ')\n';
    code += indent + 'print(result["messages"][-1].content)\n';
  }

  document.getElementById('code-output').textContent = code;
}

function getMemoryClassName(type) {
  const classNames = {
    'buffer': 'ConversationBufferMemory',
    'summary': 'ConversationSummaryMemory',
    'window': 'ConversationBufferWindowMemory',
    'summary-buffer': 'ConversationSummaryBufferMemory'
  };
  return classNames[type] || 'ConversationBufferMemory';
}

function copyCode() {
  const code = document.getElementById('code-output').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-code');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}
