/**
 * Day 26: Voice Agents - Interactive Demo
 */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initPipelineAnimation();
    initLatencyComparison();
    initCodeTabs();
});

// ========================================
// Tab Navigation
// ========================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            // Update buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update panels
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === tabId) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

// ========================================
// Pipeline Animation
// ========================================

let pipelineAnimating = false;

function initPipelineAnimation() {
    const startBtn = document.getElementById('start-pipeline');
    const resetBtn = document.getElementById('reset-pipeline');

    if (startBtn) {
        startBtn.addEventListener('click', runPipelineAnimation);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetPipeline);
    }
}

async function runPipelineAnimation() {
    if (pipelineAnimating) return;
    pipelineAnimating = true;

    const startBtn = document.getElementById('start-pipeline');
    startBtn.disabled = true;
    startBtn.textContent = 'Running...';

    resetPipeline();

    const stages = ['mic', 'vad', 'stt', 'llm', 'tts', 'speaker'];
    const userTranscript = document.getElementById('user-transcript');
    const agentTranscript = document.getElementById('agent-transcript');

    // Simulated conversation
    const userText = "What's the weather like today?";
    const agentText = "It's 72 degrees and sunny - perfect weather for a walk!";

    // Stage 1: Microphone
    await animateStage('mic', 'Listening...', 200);

    // Stage 2: VAD
    await animateStage('vad', 'Speech detected', 50);

    // Stage 3: STT (show partial results)
    await animateStage('stt', 'Transcribing...', 100);
    await typeText(userTranscript, userText, 30);
    updateStageStatus('stt', 'Complete');

    // Stage 4: LLM (show token streaming)
    await animateStage('llm', 'Thinking...', 200);
    agentTranscript.textContent = '';

    // Stage 5 & 6: TTS and Speaker (overlap with LLM)
    const llmPromise = typeText(agentTranscript, agentText, 40);

    // Start TTS slightly after LLM starts
    await sleep(100);
    animateStage('tts', 'Synthesizing...', 0);

    await sleep(100);
    animateStage('speaker', 'Playing...', 0);

    await llmPromise;

    updateStageStatus('llm', 'Complete');
    updateStageStatus('tts', 'Complete');
    updateStageStatus('speaker', 'Complete');

    // Reset button state
    pipelineAnimating = false;
    startBtn.disabled = false;
    startBtn.textContent = 'Start Conversation';
}

async function animateStage(stageId, status, duration) {
    const stage = document.getElementById(`stage-${stageId}`);
    if (!stage) return;

    stage.classList.add('active');
    updateStageStatus(stageId, status);

    if (duration > 0) {
        await sleep(duration);
    }
}

function updateStageStatus(stageId, status) {
    const stage = document.getElementById(`stage-${stageId}`);
    if (!stage) return;

    const statusEl = stage.querySelector('.stage-status');
    if (statusEl) {
        statusEl.textContent = status;
    }
}

function resetPipeline() {
    const stages = document.querySelectorAll('.pipeline-stage');
    stages.forEach(stage => {
        stage.classList.remove('active');
        const status = stage.querySelector('.stage-status');
        if (status) status.textContent = '';
    });

    const userTranscript = document.getElementById('user-transcript');
    const agentTranscript = document.getElementById('agent-transcript');

    if (userTranscript) userTranscript.textContent = 'Waiting for input...';
    if (agentTranscript) agentTranscript.textContent = 'Waiting for response...';
}

// ========================================
// Latency Comparison Animation
// ========================================

let latencyAnimating = false;

function initLatencyComparison() {
    const runBtn = document.getElementById('run-comparison');
    const resetBtn = document.getElementById('reset-comparison');

    if (runBtn) {
        runBtn.addEventListener('click', runLatencyComparison);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetLatencyComparison);
    }
}

async function runLatencyComparison() {
    if (latencyAnimating) return;
    latencyAnimating = true;

    const runBtn = document.getElementById('run-comparison');
    runBtn.disabled = true;
    runBtn.textContent = 'Running...';

    resetLatencyComparison();

    // Animate non-streaming track (sequential)
    const nonStreamingBars = document.querySelectorAll('#non-streaming-track .track-bar');
    let nonStreamingDelay = 0;

    for (const bar of nonStreamingBars) {
        bar.style.transitionDelay = `${nonStreamingDelay}ms`;
        bar.classList.add('animated');
        const duration = parseInt(bar.dataset.duration);
        nonStreamingDelay += duration;
        await sleep(duration / 4); // Speed up for demo
    }

    // Animate streaming track (overlapped)
    const streamingBars = document.querySelectorAll('#streaming-track .track-bar');

    // All bars start close together with streaming
    for (const bar of streamingBars) {
        const start = parseInt(bar.dataset.start) || 0;
        bar.style.transitionDelay = `${start / 4}ms`;
        bar.classList.add('animated');
    }

    // Show first audio marker
    await sleep(350 / 4);
    const marker = document.querySelector('.first-audio-marker');
    if (marker) {
        marker.classList.add('visible');
    }

    // Wait for animations to complete
    await sleep(500);

    latencyAnimating = false;
    runBtn.disabled = false;
    runBtn.textContent = 'Run Comparison';
}

function resetLatencyComparison() {
    const bars = document.querySelectorAll('.track-bar');
    bars.forEach(bar => {
        bar.classList.remove('animated');
        bar.style.transitionDelay = '0ms';
    });

    const marker = document.querySelector('.first-audio-marker');
    if (marker) {
        marker.classList.remove('visible');
    }
}

// ========================================
// Code Tabs
// ========================================

function initCodeTabs() {
    const codeTabs = document.querySelectorAll('.code-tab');
    const codePanels = document.querySelectorAll('.code-panel');

    codeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const codeId = tab.dataset.code;

            // Update tabs
            codeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panels
            codePanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `code-${codeId}`) {
                    panel.classList.add('active');
                }
            });

            // Re-highlight code
            if (window.Prism) {
                Prism.highlightAll();
            }
        });
    });
}

// ========================================
// Utility Functions
// ========================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeText(element, text, delay = 50) {
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await sleep(delay);
    }
}
