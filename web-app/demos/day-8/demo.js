// Day 8: Memory & Checkpoints Demo

// ==================== TAB SWITCHING ====================

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;

    // Update button states
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
  });
});

// ==================== CONVERSATION MEMORY DEMO ====================

const conversationMemory = {
  threadId: 'user-demo-001',
  checkpoints: [],
  messages: [],
  extractedInfo: {},

  init() {
    this.addCheckpoint('Initial state', { messages: 0, info: 'Empty' });
  },

  addMessage(role, content) {
    this.messages.push({ role, content, timestamp: Date.now() });

    // Extract information from user messages
    if (role === 'user') {
      this.extractInfo(content);
    }

    this.addCheckpoint(`After ${role} message`, {
      messages: this.messages.length,
      info: Object.keys(this.extractedInfo).length > 0
        ? JSON.stringify(this.extractedInfo).slice(0, 50) + '...'
        : 'No info extracted'
    });

    return this.generateResponse(content);
  },

  extractInfo(content) {
    const lowerContent = content.toLowerCase();

    // Extract name
    const namePatterns = [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i
    ];
    for (const pattern of namePatterns) {
      const match = content.match(pattern);
      if (match) {
        this.extractedInfo.name = match[1];
        break;
      }
    }

    // Extract other info
    if (lowerContent.includes('favorite') || lowerContent.includes('favourite')) {
      const favMatch = content.match(/favorite (\w+) is (\w+)/i) ||
                       content.match(/favourite (\w+) is (\w+)/i);
      if (favMatch) {
        this.extractedInfo[`favorite_${favMatch[1]}`] = favMatch[2];
      }
    }

    if (lowerContent.includes('from')) {
      const fromMatch = content.match(/from (\w+)/i);
      if (fromMatch) {
        this.extractedInfo.location = fromMatch[1];
      }
    }
  },

  generateResponse(userMessage) {
    const lowerMsg = userMessage.toLowerCase();

    // Check if asking about remembered info
    if (lowerMsg.includes('my name') || lowerMsg.includes('who am i') ||
        lowerMsg.includes('remember me') || lowerMsg.includes('what\'s my name')) {
      if (this.extractedInfo.name) {
        return `Your name is ${this.extractedInfo.name}! I remembered that from our conversation.`;
      } else {
        return "I don't know your name yet. You haven't told me!";
      }
    }

    if (lowerMsg.includes('what do you know') || lowerMsg.includes('what have you learned')) {
      if (Object.keys(this.extractedInfo).length > 0) {
        const facts = Object.entries(this.extractedInfo)
          .map(([k, v]) => `${k.replace('_', ' ')}: ${v}`)
          .join(', ');
        return `Here's what I remember about you: ${facts}`;
      }
      return "I haven't learned anything about you yet. Tell me something!";
    }

    // Greeting with name if known
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      if (this.extractedInfo.name) {
        return `Hello again, ${this.extractedInfo.name}! How can I help you?`;
      }
      return "Hello! I'm your AI assistant. Feel free to tell me your name!";
    }

    // Default responses based on extracted info
    if (this.extractedInfo.name) {
      const responses = [
        `Got it, ${this.extractedInfo.name}! Is there anything else you'd like to tell me?`,
        `Thanks for sharing that, ${this.extractedInfo.name}. I'll remember it!`,
        `Interesting, ${this.extractedInfo.name}! What else would you like to chat about?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    return "I understand. Feel free to tell me more about yourself - I'll remember everything for our conversation!";
  },

  addCheckpoint(label, statePreview) {
    this.checkpoints.push({
      num: this.checkpoints.length,
      label,
      statePreview,
      timestamp: Date.now()
    });
    this.renderCheckpoints();
    this.updateStats();
  },

  renderCheckpoints() {
    const list = document.getElementById('checkpoint-list');
    list.innerHTML = this.checkpoints.map((cp, i) => `
      <div class="checkpoint-item ${i === 0 ? 'initial' : ''} ${i === this.checkpoints.length - 1 ? 'latest' : ''}">
        <span class="checkpoint-num">${cp.num}</span>
        <span class="checkpoint-label">${cp.label}</span>
      </div>
    `).join('');
    list.scrollTop = list.scrollHeight;
  },

  updateStats() {
    document.getElementById('msg-count').textContent = this.messages.length;
    document.getElementById('checkpoint-count').textContent = this.checkpoints.length;
  },

  simulateRestart() {
    // Messages and extractedInfo are preserved (simulating persistence)
    this.addCheckpoint('Server restarted (state preserved)', {
      messages: this.messages.length,
      info: 'Loaded from checkpoint'
    });

    // Add system message
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `
      <div class="chat-message system">
        <div class="message-content">Server restarted. State loaded from checkpoint - conversation continues!</div>
      </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  },

  reset() {
    this.checkpoints = [];
    this.messages = [];
    this.extractedInfo = {};
    this.init();

    document.getElementById('chat-messages').innerHTML = `
      <div class="chat-message system">
        <div class="message-content">Conversation reset. Start a new conversation!</div>
      </div>
    `;
  }
};

// Initialize conversation memory
conversationMemory.init();

// Chat input handlers
document.getElementById('send-btn').addEventListener('click', sendChatMessage);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChatMessage();
});

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  const chatMessages = document.getElementById('chat-messages');

  // Add user message
  chatMessages.innerHTML += `
    <div class="chat-message user">
      <div class="message-content">${escapeHtml(message)}</div>
    </div>
  `;

  // Generate and add response
  const response = conversationMemory.addMessage('user', message);
  chatMessages.innerHTML += `
    <div class="chat-message assistant">
      <div class="message-content">${escapeHtml(response)}</div>
    </div>
  `;

  conversationMemory.addMessage('assistant', response);

  input.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById('restart-btn').addEventListener('click', () => {
  conversationMemory.simulateRestart();
});

// ==================== THREAD ISOLATION DEMO ====================

const threadSystem = {
  threads: {
    alice: { id: 'user-alice-001', messages: [], info: {} },
    bob: { id: 'user-bob-001', messages: [], info: {} },
    charlie: { id: 'user-charlie-001', messages: [], info: {} }
  },
  activeUser: 'alice',

  switchUser(user) {
    this.activeUser = user;
    document.getElementById('active-thread-id').textContent = this.threads[user].id;

    // Update UI
    document.querySelectorAll('.user-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.user === user);
    });

    document.querySelectorAll('.thread-box').forEach(box => {
      box.classList.toggle('active', box.dataset.thread === user);
    });

    this.renderMessages();
    this.updateThreadStates();
  },

  addMessage(content) {
    const thread = this.threads[this.activeUser];
    thread.messages.push({ role: 'user', content });

    // Extract info for this thread only
    this.extractInfo(thread, content);

    // Generate response based on this thread's context only
    const response = this.generateResponse(thread, content);
    thread.messages.push({ role: 'assistant', content: response });

    this.renderMessages();
    this.updateThreadStates();

    return response;
  },

  extractInfo(thread, content) {
    const nameMatch = content.match(/my name is (\w+)/i) ||
                      content.match(/i'm (\w+)/i) ||
                      content.match(/i am (\w+)/i);
    if (nameMatch) {
      thread.info.name = nameMatch[1];
    }

    const topicMatch = content.match(/about (\w+)/i);
    if (topicMatch) {
      thread.info.topic = topicMatch[1];
    }
  },

  generateResponse(thread, userMessage) {
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('my name') || lowerMsg.includes('who am i')) {
      if (thread.info.name) {
        return `Your name is ${thread.info.name}!`;
      }
      return "I don't know your name in this conversation. Tell me!";
    }

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      if (thread.info.name) {
        return `Hi ${thread.info.name}! Nice to continue our conversation.`;
      }
      return "Hello! I'm your isolated assistant. What's your name?";
    }

    if (thread.info.name) {
      return `Got it, ${thread.info.name}! This conversation is isolated from other users.`;
    }

    return "I understand. Remember, each user has their own isolated conversation!";
  },

  renderMessages() {
    const thread = this.threads[this.activeUser];
    const container = document.getElementById('thread-messages');

    if (thread.messages.length === 0) {
      container.innerHTML = `
        <div class="chat-message system">
          <div class="message-content">This is ${this.activeUser.charAt(0).toUpperCase() + this.activeUser.slice(1)}'s conversation. Try switching users to see isolation.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = thread.messages.map(m => `
      <div class="chat-message ${m.role === 'user' ? 'user' : 'assistant'}">
        <div class="message-content">${escapeHtml(m.content)}</div>
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  },

  updateThreadStates() {
    for (const [user, thread] of Object.entries(this.threads)) {
      const stateEl = document.getElementById(`${user}-state`);
      if (thread.messages.length === 0) {
        stateEl.textContent = 'Empty';
      } else {
        const info = thread.info.name ? `Name: ${thread.info.name}` : 'No name';
        stateEl.textContent = `${thread.messages.length} msgs, ${info}`;
      }
    }
  }
};

// Initialize thread system
threadSystem.updateThreadStates();

// User switching
document.querySelectorAll('.user-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    threadSystem.switchUser(btn.dataset.user);
  });
});

// Thread chat input
document.getElementById('thread-send-btn').addEventListener('click', sendThreadMessage);
document.getElementById('thread-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendThreadMessage();
});

function sendThreadMessage() {
  const input = document.getElementById('thread-input');
  const message = input.value.trim();
  if (!message) return;

  threadSystem.addMessage(message);
  input.value = '';
}

// ==================== APPROVAL WORKFLOW DEMO ====================

const approvalWorkflow = {
  state: 'idle', // idle, generating, waiting, revising, finalizing, complete
  draft: '',
  revisionCount: 0,
  log: [],

  start() {
    this.state = 'generating';
    this.draft = '';
    this.revisionCount = 0;
    this.log = [];

    this.updateStatus('running', 'Generating draft...');
    this.addLog('generate', 'Starting workflow: Generate node active');
    this.highlightNode('approval-generate');

    // Simulate generation delay
    setTimeout(() => {
      this.draft = this.generateDraft();
      this.revisionCount++;
      this.addLog('generate', `Draft #${this.revisionCount} generated`);

      // Transition to waiting
      this.state = 'waiting';
      this.updateStatus('waiting', 'Waiting for human approval...');
      this.highlightNode('approval-wait');
      this.showDraft();
      this.showHumanActions();
      this.addLog('wait', 'Workflow paused - checkpoint saved, waiting for human input');
    }, 1500);
  },

  generateDraft() {
    const drafts = [
      "Introducing AI Assistant Pro - Your intelligent companion for everyday tasks. Experience the future of productivity with our cutting-edge AI technology.",
      "Meet the next generation of AI assistance. Our new platform combines advanced natural language processing with intuitive design for seamless interaction.",
      "Transform your workflow with AI-powered automation. Our latest release brings intelligent document processing, smart scheduling, and personalized recommendations."
    ];

    if (this.revisionCount > 0) {
      return "REVISED: " + drafts[this.revisionCount % drafts.length] + " (More accessible and exciting tone as requested)";
    }
    return drafts[0];
  },

  approve() {
    this.addLog('approve', 'Human approved the draft');
    this.hideHumanActions();

    this.state = 'finalizing';
    this.updateStatus('running', 'Finalizing...');
    this.highlightNode('approval-finalize');
    this.addLog('info', 'update_state({"approved": True}) called');
    this.addLog('info', 'invoke(None, config) - resuming from checkpoint');

    setTimeout(() => {
      this.state = 'complete';
      this.updateStatus('complete', 'Workflow complete');
      this.highlightNode('approval-end');
      this.addLog('complete', `Content finalized after ${this.revisionCount} revision(s)`);
    }, 1000);
  },

  reject() {
    document.getElementById('feedback-input').style.display = 'flex';
    document.querySelector('.action-buttons').style.display = 'none';
  },

  submitFeedback(feedback) {
    this.addLog('reject', `Human rejected: "${feedback}"`);
    this.hideHumanActions();
    document.getElementById('feedback-input').style.display = 'none';
    document.querySelector('.action-buttons').style.display = 'flex';

    this.state = 'revising';
    this.updateStatus('running', 'Revising based on feedback...');
    this.highlightNode('approval-revise');
    this.addLog('info', 'update_state({"approved": False, "feedback": "..."}) called');
    this.addLog('info', 'invoke(None, config) - resuming, routing to revise node');

    setTimeout(() => {
      // Back to generate
      this.state = 'generating';
      this.updateStatus('running', 'Generating revised draft...');
      this.highlightNode('approval-generate');
      this.addLog('generate', 'Revise node complete, looping back to Generate');

      setTimeout(() => {
        this.draft = this.generateDraft();
        this.revisionCount++;
        this.addLog('generate', `Revised draft #${this.revisionCount} generated`);

        this.state = 'waiting';
        this.updateStatus('waiting', 'Waiting for approval on revision...');
        this.highlightNode('approval-wait');
        this.showDraft();
        this.showHumanActions();
        this.addLog('wait', 'Workflow paused again - awaiting human decision');
      }, 1500);
    }, 1000);
  },

  updateStatus(type, text) {
    const indicator = document.getElementById('workflow-status');
    indicator.innerHTML = `
      <span class="status-dot ${type}"></span>
      <span class="status-text">${text}</span>
    `;
  },

  showDraft() {
    document.querySelector('.draft-content').innerHTML = `
      <strong>Draft #${this.revisionCount}:</strong><br>
      ${escapeHtml(this.draft)}
    `;
  },

  showHumanActions() {
    document.getElementById('human-actions').style.display = 'block';
    document.getElementById('start-workflow-btn').style.display = 'none';
  },

  hideHumanActions() {
    document.getElementById('human-actions').style.display = 'none';
  },

  highlightNode(nodeId) {
    document.querySelectorAll('.workflow-node').forEach(n => n.classList.remove('active'));
    const node = document.getElementById(nodeId);
    if (node) node.classList.add('active');
  },

  addLog(type, message) {
    this.log.push({ type, message, timestamp: Date.now() });
    const container = document.getElementById('approval-log');
    container.innerHTML = this.log.map(l => `
      <div class="log-entry ${l.type}">${l.message}</div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  },

  reset() {
    this.state = 'idle';
    this.draft = '';
    this.revisionCount = 0;
    this.log = [];

    this.updateStatus('idle', 'Ready to start');
    document.querySelector('.draft-content').innerHTML = '<em>No draft yet. Start the workflow to generate content.</em>';
    document.getElementById('human-actions').style.display = 'none';
    document.getElementById('start-workflow-btn').style.display = 'inline-flex';
    document.getElementById('feedback-input').style.display = 'none';
    document.querySelector('.action-buttons').style.display = 'flex';
    document.getElementById('approval-log').innerHTML = '<div class="log-entry info">Click "Start Workflow" to begin</div>';
    document.querySelectorAll('.workflow-node').forEach(n => n.classList.remove('active'));
  }
};

// Approval workflow buttons
document.getElementById('start-workflow-btn').addEventListener('click', () => {
  approvalWorkflow.start();
});

document.getElementById('approve-btn').addEventListener('click', () => {
  approvalWorkflow.approve();
});

document.getElementById('reject-btn').addEventListener('click', () => {
  approvalWorkflow.reject();
});

document.getElementById('submit-feedback-btn').addEventListener('click', () => {
  const feedback = document.getElementById('rejection-feedback').value.trim();
  if (feedback) {
    approvalWorkflow.submitFeedback(feedback);
    document.getElementById('rejection-feedback').value = '';
  }
});

// ==================== UTILITY FUNCTIONS ====================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
