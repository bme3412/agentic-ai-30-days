import type { Day } from '../../types';

export const day26: Day = {
  day: 26,
  phase: 5,
  title: "Voice Agents for Real-Time Apps",
  partner: "LiveKit",
  tags: ["voice", "real-time", "livekit", "speech", "conversational-ai"],
  concept: "Real-time voice interaction with AI agents using sequential pipeline architecture",

  demoUrl: "demos/day-26/",
  demoDescription: "Explore the voice agent pipeline, compare streaming latencies, and see how VAD, STT, LLM, and TTS work together for natural conversation.",

  lesson: {
    overview: `Voice is the most natural human interface - we've been speaking for 100,000 years but typing for barely 150. Yet building voice AI that feels natural requires solving a fundamental latency problem: humans expect responses within 200-400ms, but AI inference alone can take 300-800ms. The gap between "feels like talking" and "feels like waiting" is measured in fractions of a second.

LiveKit Agents solves this through a sequential pipeline architecture that streams at every stage. Rather than waiting for complete sentences, each component - Voice Activity Detection, Speech-to-Text, Language Model, Text-to-Speech - processes and forwards data as it arrives. The result: AI that responds while you're still finishing your thought, matching the rhythm of natural conversation.

The architecture separates concerns cleanly. VAD distinguishes speech from background noise in 10-50ms. STT transcribes in real-time with partial results. The LLM generates token-by-token. TTS synthesizes audio from the first words while the LLM is still generating the rest. This streaming overlap compresses what would be 1-2 seconds of sequential latency into 400-800ms of natural response time.

Building on the agent patterns from Day 3 and the tool-use principles from Day 7, voice agents extend the reasoning loop to audio: listen, understand, think, speak. The key insight is that conversation is fundamentally asynchronous - you don't wait for someone to finish before starting to formulate your response. Neither should your AI agent.`,

    principles: [
      {
        title: "Sequential Pipeline Design",
        description: "Voice AI decomposes into stages with single responsibilities: VAD detects speech, STT transcribes, LLM reasons, TTS speaks. Each stage streams output to the next, enabling parallel processing and clear debugging. Problems isolate to specific stages."
      },
      {
        title: "Streaming for Sub-Second Latency",
        description: "Without streaming, latencies stack additively (VAD + STT + LLM + TTS = 1-2s delay). With streaming, stages overlap - TTS starts speaking while LLM is still generating. This compression achieves conversational latency under 800ms."
      },
      {
        title: "Semantic Turn Detection",
        description: "Traditional VAD uses audio silence to detect turn boundaries, causing premature cutoffs during pauses. Semantic turn detection uses transformer models to understand when a thought is complete, enabling natural conversational flow even with thinking pauses."
      },
      {
        title: "Provider Abstraction",
        description: "The best STT isn't the best TTS isn't the best LLM. LiveKit's plugin system lets you mix providers - Deepgram for transcription, OpenAI for reasoning, Cartesia for voice synthesis - while maintaining a unified agent interface."
      },
      {
        title: "WebRTC for Reliable Delivery",
        description: "Audio over HTTP introduces buffering latency. WebRTC provides sub-100ms audio transport with automatic adaptation to network conditions. For telephony, SIP trunking bridges traditional phone networks to AI agents."
      }
    ],

    codeExample: {
      language: "python",
      title: "Basic Voice Agent with LiveKit",
      code: `"""Basic Voice Agent with LiveKit Agents Framework"""

from livekit.agents import AgentSession, Agent, AgentServer
from livekit.plugins import deepgram, openai, cartesia, silero

# Define your agent's personality and capabilities
class VoiceAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a helpful voice assistant.
            Keep responses concise - aim for 1-2 sentences.
            Be conversational and natural."""
        )

# Create the agent server
server = AgentServer()

# Register the agent with the server
@server.rtc_session(agent_name="assistant")
async def entrypoint(ctx):
    # Configure the voice pipeline with best-in-class providers
    session = AgentSession(
        # Speech-to-Text: Deepgram Nova for accurate transcription
        stt=deepgram.STT(model="nova-3"),

        # Language Model: GPT-4.1-mini for fast reasoning
        llm=openai.LLM(model="gpt-4.1-mini"),

        # Text-to-Speech: Cartesia Sonic for natural voice
        tts=cartesia.TTS(voice="79a125e8-cd45-4c13-8a67-188112f4dd22"),

        # Voice Activity Detection: Silero for speech detection
        vad=silero.VAD.load(),
    )

    # Start the session - agent now listens and responds
    await session.start(room=ctx.room, agent=VoiceAssistant())

# Run: python agent.py dev
if __name__ == "__main__":
    server.run()`
    },

    diagram: {
      type: "mermaid",
      title: "Voice Agent Pipeline Architecture",
      mermaid: `flowchart LR
    subgraph Input ["Input Processing"]
        MIC["Microphone"] --> VAD["VAD\\n10-50ms"]
        VAD --> STT["STT\\n~200ms"]
    end

    subgraph Process ["AI Processing"]
        STT --> LLM["LLM\\n300-800ms"]
    end

    subgraph Output ["Output Synthesis"]
        LLM --> TTS["TTS\\n100-200ms"]
        TTS --> SPEAK["Speaker"]
    end

    style MIC fill:#3b82f6,color:#fff
    style VAD fill:#8b5cf6,color:#fff
    style STT fill:#8b5cf6,color:#fff
    style LLM fill:#f59e0b,color:#fff
    style TTS fill:#22c55e,color:#fff
    style SPEAK fill:#22c55e,color:#fff`
    },

    keyTakeaways: [
      "Voice AI requires sub-second latency to feel natural - humans expect 200-400ms response times",
      "Sequential pipeline (VAD → STT → LLM → TTS) enables streaming overlap that compresses latency from 1-2s to 400-800ms",
      "Mix best-in-class providers for each stage: Deepgram for STT, OpenAI for LLM, Cartesia for TTS",
      "Semantic turn detection using transformer models prevents premature interruptions during natural pauses",
      "WebRTC provides reliable sub-100ms audio transport; SIP enables telephony integration",
      "LiveKit Agents handles the infrastructure complexity - focus on your agent's personality and capabilities"
    ],

    resources: [
      {
        title: "LiveKit Agents Documentation",
        url: "https://docs.livekit.io/agents/",
        type: "docs",
        description: "Official guide to building voice and multimodal AI agents"
      },
      {
        title: "LiveKit Agents GitHub",
        url: "https://github.com/livekit/agents",
        type: "github",
        description: "Open-source Python and Node.js SDKs with examples"
      },
      {
        title: "Voice Agent Quickstart",
        url: "https://docs.livekit.io/agents/quickstarts/voice-agent/",
        type: "tutorial",
        description: "Build your first voice agent in under 10 minutes"
      },
      {
        title: "Sequential Pipeline Architecture",
        url: "https://livekit.io/blog/sequential-pipeline-architecture-voice-agents",
        type: "article",
        description: "Deep dive into why sequential pipelines beat audio-native approaches"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Master real-time voice AI with LiveKit's sequential pipeline architecture, provider integrations, and production patterns.",
      fullDescription: `Voice agents represent a paradigm shift in human-computer interaction. Instead of adapting to keyboards and screens, users simply speak - and the AI speaks back. But the technical challenge is immense: natural conversation requires latencies under 500ms, yet AI inference alone can take longer than that.

LiveKit Agents solves this through three key innovations. First, the sequential pipeline architecture decomposes voice AI into stages that stream data forward continuously, enabling parallel processing that compresses latency. Second, semantic turn detection uses transformer models to understand conversational boundaries, preventing the frustrating premature cutoffs of traditional silence-based VAD. Third, a plugin architecture lets you combine best-in-class providers - Deepgram's accuracy, Cartesia's voice quality, OpenAI's reasoning - without infrastructure complexity.

The framework supports two agent types for different use cases. VoicePipelineAgent provides maximum control through the STT → LLM → TTS pipeline, allowing you to inspect and modify text at each stage. MultimodalAgent uses OpenAI's Realtime API for audio-to-audio processing, trading some control for potentially more natural prosody. Most production deployments use VoicePipelineAgent for its debuggability and compliance benefits.

This day builds on the agent foundations from Day 3 (reasoning loops), tool patterns from Day 7 (function calling), and the production deployment patterns from Day 24. Voice agents add a new dimension: time. Every millisecond matters, and the architecture must be designed around streaming from the ground up.`,
      prerequisites: ["Day 3: ReAct Agent Patterns", "Day 7: Function Calling", "Day 24: Coding Agents"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "Voice Activity Detection (VAD)",
        description: "VAD is the first stage of the voice pipeline, responsible for distinguishing human speech from background noise. It determines when a user starts and stops speaking, which controls when transcription begins and when the agent should respond. Modern VAD like Silero runs in 10-50ms and can detect speech onset within a single audio frame.",
        analogy: "VAD is like a meeting moderator who watches for raised hands. It doesn't understand what's being said, just that someone is speaking and when they've finished.",
        gotchas: [
          "Silence-based VAD cuts off users during thinking pauses - semantic turn detection is better",
          "Background noise (TV, crowds) can cause false positives - tune sensitivity for your environment",
          "VAD latency adds to total response time - use efficient models like Silero"
        ]
      },
      {
        title: "Speech-to-Text (STT) Streaming",
        description: "STT converts audio to text in real-time. Streaming STT sends partial transcripts as words are recognized, enabling downstream processing to begin before the speaker finishes. This is crucial for low latency - waiting for complete sentences adds 1-2 seconds of delay. Deepgram Nova-3 provides state-of-the-art accuracy with streaming support.",
        analogy: "Streaming STT is like a court stenographer who types each word as it's spoken, rather than waiting for the witness to finish their entire statement.",
        gotchas: [
          "Partial results may change as more context arrives - 'recognize' might become 'recognition'",
          "Accents, background noise, and domain vocabulary affect accuracy - consider fine-tuning",
          "Some STT providers charge per audio minute regardless of speech content"
        ]
      },
      {
        title: "LLM Token Streaming",
        description: "The LLM generates response tokens one at a time. Streaming these tokens to TTS immediately (rather than waiting for the complete response) is essential for conversational latency. The first word can be spoken while the LLM is still generating the fifth word. This requires TTS that accepts streaming text input.",
        analogy: "Token streaming is like a translator who starts speaking the first sentence while still listening to the rest of the speech, rather than waiting for the speaker to finish completely.",
        gotchas: [
          "Some responses should complete before speaking (e.g., tool calls that change the answer)",
          "Streaming makes it harder to modify or filter responses - plan filtering carefully",
          "Token-by-token streaming may produce choppy TTS if the model generates slowly"
        ]
      },
      {
        title: "Text-to-Speech (TTS) with Streaming Input",
        description: "TTS converts text to audio. Modern TTS like Cartesia Sonic accepts streaming text input and produces streaming audio output, enabling speech to begin from the first words. Voice selection significantly impacts user experience - choose voices that match your agent's personality and your users' expectations.",
        analogy: "Streaming TTS is like a voice actor who starts reading from a teleprompter as words appear, rather than waiting for the entire script to be written.",
        gotchas: [
          "Voice cloning requires consent and has legal implications in many jurisdictions",
          "Long silences in input text can cause awkward pauses - filter appropriately",
          "TTS latency varies by provider and voice - test your specific configuration"
        ]
      },
      {
        title: "VoicePipelineAgent vs MultimodalAgent",
        description: "LiveKit supports two agent architectures. VoicePipelineAgent uses the sequential STT → LLM → TTS pipeline, providing full control over each stage with text-based inspection and modification. MultimodalAgent uses OpenAI's Realtime API for direct audio-to-audio processing, potentially more natural but less controllable. Most production systems use VoicePipelineAgent for compliance and debugging.",
        analogy: "VoicePipelineAgent is like having a translator, analyst, and spokesperson as separate team members - you can review each handoff. MultimodalAgent is like one bilingual expert who handles everything internally - faster but less visibility.",
        gotchas: [
          "MultimodalAgent only works with OpenAI Realtime API - no provider flexibility",
          "VoicePipelineAgent enables text-based audit trails required for compliance",
          "Tool calling is more reliable in text-based pipelines than audio-native approaches"
        ]
      },
      {
        title: "Semantic Turn Detection",
        description: "Traditional turn detection uses audio silence - if the user stops speaking for 500ms, assume they're done. This fails for natural speech with thinking pauses. Semantic turn detection uses a transformer model trained on conversation boundaries to understand when a thought is complete, even during pauses. This enables natural conversation rhythm.",
        analogy: "Silence-based detection is like interrupting someone who pauses to think. Semantic detection is like a skilled conversationalist who knows the difference between 'I'm thinking' and 'I'm done speaking.'",
        gotchas: [
          "Semantic detection adds 50-100ms latency but significantly improves conversation quality",
          "May still struggle with very long pauses or non-standard speech patterns",
          "Requires more compute than simple silence detection"
        ]
      },
      {
        title: "Interruption Handling",
        description: "Users may interrupt the agent mid-response. Good voice agents detect this immediately and stop speaking, acknowledging the user's new input. This requires coordinated cancellation across TTS and audio playback, plus graceful handling in the LLM context. LiveKit Agents handles this automatically, but understanding the mechanism helps with debugging.",
        analogy: "Good interruption handling is like a polite conversationalist who immediately stops talking when you start, rather than trying to finish their point over your voice.",
        gotchas: [
          "Interruption detection uses VAD on outbound audio - may trigger on agent's own voice",
          "Some LLMs need context about interruptions to respond appropriately",
          "Very short interruptions may be noise - implement debouncing"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Voice Agent with Tool Calling",
        language: "python",
        category: "intermediate",
        explanation: "Voice agents become powerful when they can take actions. This example adds a weather tool that the agent can call mid-conversation. The function_tool decorator exposes Python functions to the LLM with automatic schema generation from type hints.",
        code: `"""Voice Agent with Tool Calling Capabilities"""

from livekit.agents import AgentSession, Agent, AgentServer, function_tool
from livekit.plugins import deepgram, openai, cartesia, silero
import httpx

# Define tools the agent can use
@function_tool
async def get_weather(location: str) -> str:
    """Get the current weather for a location.

    Args:
        location: City name or location to check weather for
    """
    # In production, call a real weather API
    async with httpx.AsyncClient() as client:
        # Mock response for demo
        return f"The weather in {location} is 72°F and sunny."

@function_tool
async def set_reminder(message: str, minutes: int) -> str:
    """Set a reminder for the user.

    Args:
        message: The reminder message
        minutes: Minutes from now to trigger the reminder
    """
    # In production, integrate with your reminder system
    return f"I've set a reminder: '{message}' in {minutes} minutes."

class WeatherAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a helpful voice assistant with access to
            weather information and reminder capabilities. Keep responses
            brief and conversational. When users ask about weather, use
            the get_weather tool. When they want reminders, use set_reminder.""",
            tools=[get_weather, set_reminder],
        )

server = AgentServer()

@server.rtc_session(agent_name="weather-assistant")
async def entrypoint(ctx):
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=openai.LLM(model="gpt-4.1-mini"),
        tts=cartesia.TTS(voice="79a125e8-cd45-4c13-8a67-188112f4dd22"),
        vad=silero.VAD.load(),
    )
    await session.start(room=ctx.room, agent=WeatherAssistant())

if __name__ == "__main__":
    server.run()`
      },
      {
        title: "Multi-Agent Handoff",
        language: "python",
        category: "advanced",
        explanation: "Complex voice applications often need specialized agents for different tasks. This example demonstrates handoff between a receptionist agent and a technical support agent, preserving conversation context across the transition.",
        code: `"""Multi-Agent Voice System with Handoff"""

from livekit.agents import AgentSession, Agent, AgentServer
from livekit.plugins import deepgram, openai, cartesia, silero

class ReceptionistAgent(Agent):
    def __init__(self, handoff_callback):
        super().__init__(
            instructions="""You are a receptionist for TechCorp. Greet callers
            warmly and determine their needs. For technical issues, transfer
            to technical support by saying 'I'll transfer you to our technical
            team.' For billing, say 'Let me connect you with billing.'

            When you determine the caller needs transfer, end your response
            with [TRANSFER:technical] or [TRANSFER:billing]."""
        )
        self.handoff_callback = handoff_callback

    async def on_message(self, message: str):
        # Check for transfer signals in the response
        if "[TRANSFER:technical]" in message:
            await self.handoff_callback("technical")
        elif "[TRANSFER:billing]" in message:
            await self.handoff_callback("billing")

class TechnicalSupportAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a technical support specialist for TechCorp.
            You help customers troubleshoot issues with their software and
            hardware. Be patient, ask clarifying questions, and guide users
            through solutions step by step. You have access to the knowledge
            base and can escalate to engineering if needed."""
        )

server = AgentServer()

@server.rtc_session(agent_name="receptionist")
async def entrypoint(ctx):
    current_agent = None

    async def handle_handoff(department: str):
        nonlocal current_agent
        if department == "technical":
            current_agent = TechnicalSupportAgent()
            # Transfer context to new agent
            await session.update_agent(current_agent)

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=openai.LLM(model="gpt-4.1-mini"),
        tts=cartesia.TTS(voice="79a125e8-cd45-4c13-8a67-188112f4dd22"),
        vad=silero.VAD.load(),
    )

    receptionist = ReceptionistAgent(handle_handoff)
    current_agent = receptionist

    await session.start(room=ctx.room, agent=receptionist)

if __name__ == "__main__":
    server.run()`
      },
      {
        title: "OpenAI Realtime (MultimodalAgent)",
        language: "python",
        category: "intermediate",
        explanation: "For the most natural-sounding conversations, OpenAI's Realtime API processes audio directly without the STT/TTS stages. This trades some control for lower latency and more natural prosody. Best for simple conversational agents where text audit trails aren't required.",
        code: `"""Voice Agent using OpenAI Realtime API (MultimodalAgent)"""

from livekit.agents import AgentSession, Agent, AgentServer
from livekit.agents.multimodal import MultimodalAgent
from livekit.plugins import openai

class RealtimeAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a friendly conversational assistant.
            Speak naturally and expressively. Keep responses brief
            unless asked for detail. Feel free to use casual language
            and show personality."""
        )

server = AgentServer()

@server.rtc_session(agent_name="realtime-assistant")
async def entrypoint(ctx):
    # MultimodalAgent uses OpenAI Realtime API for audio-to-audio
    # No separate STT/TTS configuration needed
    model = openai.realtime.RealtimeModel(
        model="gpt-4o-realtime-preview",
        voice="alloy",  # OpenAI voice options: alloy, echo, fable, onyx, nova, shimmer
        temperature=0.8,
        turn_detection=openai.realtime.ServerVadOptions(
            threshold=0.5,
            prefix_padding_ms=300,
            silence_duration_ms=500,
        ),
    )

    agent = MultimodalAgent(model=model)

    session = AgentSession()
    await session.start(
        room=ctx.room,
        agent=RealtimeAssistant(),
        multimodal=agent
    )

if __name__ == "__main__":
    server.run()`
      },
      {
        title: "Production Configuration with Error Handling",
        language: "python",
        category: "advanced",
        explanation: "Production voice agents need robust error handling, graceful degradation, and observability. This example shows timeout handling, fallback providers, and structured logging for production deployments.",
        code: `"""Production Voice Agent with Error Handling and Observability"""

import logging
from livekit.agents import AgentSession, Agent, AgentServer
from livekit.plugins import deepgram, openai, cartesia, silero
from contextlib import asynccontextmanager

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("voice-agent")

class ProductionAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a professional customer service agent.
            Be helpful, concise, and empathetic. If you encounter any
            issues, apologize and offer to help in another way."""
        )

server = AgentServer()

@asynccontextmanager
async def create_session_with_fallback():
    """Create session with fallback providers if primary fails."""
    try:
        # Primary configuration: best quality
        session = AgentSession(
            stt=deepgram.STT(
                model="nova-3",
                language="en",
                interim_results=True,
            ),
            llm=openai.LLM(
                model="gpt-4.1-mini",
                temperature=0.7,
            ),
            tts=cartesia.TTS(
                voice="79a125e8-cd45-4c13-8a67-188112f4dd22",
                speed=1.0,
            ),
            vad=silero.VAD.load(
                min_speech_duration=0.1,
                min_silence_duration=0.3,
            ),
        )
        logger.info("Primary session configuration loaded")
        yield session

    except Exception as e:
        logger.warning(f"Primary config failed: {e}, falling back")
        # Fallback configuration: OpenAI only (simpler, more reliable)
        session = AgentSession(
            stt=openai.STT(model="whisper-1"),
            llm=openai.LLM(model="gpt-4.1-mini"),
            tts=openai.TTS(model="tts-1", voice="nova"),
            vad=silero.VAD.load(),
        )
        logger.info("Fallback session configuration loaded")
        yield session

@server.rtc_session(agent_name="production-assistant")
async def entrypoint(ctx):
    logger.info(f"New session: room={ctx.room.name}, participant={ctx.participant.identity}")

    try:
        async with create_session_with_fallback() as session:
            # Set up event handlers for observability
            @session.on("agent_speech_started")
            def on_speech_started():
                logger.debug("Agent started speaking")

            @session.on("user_speech_committed")
            def on_user_speech(text: str):
                logger.info(f"User said: {text[:100]}...")

            @session.on("agent_speech_committed")
            def on_agent_speech(text: str):
                logger.info(f"Agent said: {text[:100]}...")

            @session.on("error")
            def on_error(error: Exception):
                logger.error(f"Session error: {error}")

            await session.start(
                room=ctx.room,
                agent=ProductionAssistant()
            )

    except Exception as e:
        logger.error(f"Fatal session error: {e}")
        raise

if __name__ == "__main__":
    server.run()`
      }
    ],

    diagrams: [
      {
        title: "Streaming vs Non-Streaming Latency",
        type: "mermaid",
        mermaid: `gantt
    title Voice Pipeline Latency Comparison
    dateFormat X
    axisFormat %L ms

    section Non-Streaming
    VAD (50ms)           :a1, 0, 50
    STT wait (800ms)     :a2, after a1, 800
    LLM wait (600ms)     :a3, after a2, 600
    TTS wait (300ms)     :a4, after a3, 300

    section Streaming
    VAD (50ms)           :b1, 0, 50
    STT stream           :b2, after b1, 200
    LLM stream           :b3, 100, 400
    TTS stream           :b4, 200, 300
    First audio          :milestone, b5, 350, 0`,
        caption: "Non-streaming adds latencies sequentially (~1750ms total). Streaming overlaps stages, producing first audio in ~350ms."
      },
      {
        title: "Agent Lifecycle and Session Management",
        type: "mermaid",
        mermaid: `stateDiagram-v2
    [*] --> Initializing: Server Start
    Initializing --> Waiting: Registered with LiveKit

    Waiting --> Connecting: Room Join Request
    Connecting --> Active: WebRTC Connected

    Active --> Listening: VAD Ready
    Listening --> Processing: Speech Detected
    Processing --> Speaking: Response Ready
    Speaking --> Listening: Utterance Complete

    Listening --> Interrupted: User Interrupts
    Speaking --> Interrupted: User Interrupts
    Interrupted --> Listening: Acknowledge

    Active --> Disconnecting: Session End
    Disconnecting --> Waiting: Cleanup Complete
    Waiting --> [*]: Server Shutdown`,
        caption: "Voice agents manage complex state transitions between listening, processing, speaking, and handling interruptions."
      },
      {
        title: "Provider Integration Architecture",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Agent ["LiveKit Agent"]
        AS[AgentSession]
    end

    subgraph STT ["Speech-to-Text"]
        DG[Deepgram Nova]
        AA[AssemblyAI]
        WH[OpenAI Whisper]
    end

    subgraph LLM ["Language Models"]
        GPT[OpenAI GPT-4]
        CL[Anthropic Claude]
        GEM[Google Gemini]
        GR[Groq]
    end

    subgraph TTS ["Text-to-Speech"]
        CA[Cartesia Sonic]
        EL[ElevenLabs]
        OT[OpenAI TTS]
    end

    AS --> DG & AA & WH
    AS --> GPT & CL & GEM & GR
    AS --> CA & EL & OT

    style AS fill:#3b82f6,color:#fff
    style DG fill:#22c55e,color:#fff
    style GPT fill:#f59e0b,color:#fff
    style CA fill:#8b5cf6,color:#fff`,
        caption: "LiveKit's plugin architecture lets you mix best-in-class providers for each pipeline stage."
      }
    ],

    faq: [
      {
        question: "What latency should I target for natural conversation?",
        answer: "Aim for under 500ms from end of user speech to first agent audio. Users perceive responses under 300ms as 'instant' and 300-500ms as 'natural'. Above 800ms feels like waiting. The sequential pipeline with streaming typically achieves 400-600ms. Monitor your p95 latency, not just averages - occasional slow responses break conversation flow more than consistently moderate latency."
      },
      {
        question: "Should I use VoicePipelineAgent or MultimodalAgent?",
        answer: "Use VoicePipelineAgent for most production applications. It provides text-based audit trails (important for compliance), easier debugging (you can log at each stage), provider flexibility (mix Deepgram STT with Anthropic LLM), and more reliable tool calling. Use MultimodalAgent only if you need the lowest possible latency for simple conversational agents where you don't need text logs or tool use."
      },
      {
        question: "How do I handle interruptions gracefully?",
        answer: "LiveKit Agents handles basic interruption detection automatically - when VAD detects user speech while the agent is speaking, it stops TTS playback. For graceful handling, configure your agent instructions to acknowledge interruptions naturally ('Oh, go ahead' or 'Sure, what's up?'). You can also hook into the interruption event to adjust LLM context, ensuring the agent remembers it was interrupted mid-sentence."
      },
      {
        question: "Which providers should I choose for STT, LLM, and TTS?",
        answer: "For STT, Deepgram Nova-3 offers the best accuracy/latency balance for English. For non-English, test AssemblyAI or Whisper. For LLM, GPT-4.1-mini provides good speed/quality balance; use Claude for complex reasoning. For TTS, Cartesia Sonic has the most natural voices with low latency; ElevenLabs is best for custom voice cloning. Always benchmark with your specific use case - provider performance varies significantly by domain and language."
      },
      {
        question: "How do I deploy voice agents to production?",
        answer: "LiveKit Agents run as standard Python processes that connect to LiveKit Cloud or self-hosted LiveKit servers. For production: 1) Containerize your agent with Docker, 2) Deploy to Kubernetes or any container orchestrator, 3) Use LiveKit Cloud for WebRTC infrastructure (handles scaling, TURN servers, global distribution), 4) Configure autoscaling based on concurrent sessions. The agent server handles load balancing and job distribution automatically."
      },
      {
        question: "Can I integrate voice agents with phone systems (PSTN)?",
        answer: "Yes, LiveKit supports SIP trunking for telephony integration. You configure a SIP provider (Twilio, Vonage, etc.) that routes calls to your LiveKit room. The agent joins via WebRTC while the caller uses their phone. This enables AI agents for inbound customer service, outbound campaigns, and IVR replacement. Note that PSTN audio quality is lower than WebRTC, which may affect STT accuracy."
      }
    ],

    applications: [
      {
        title: "AI-Powered Call Centers",
        description: "Replace IVR trees and reduce hold times with voice agents that understand natural language, access customer records, and either resolve issues directly or route to the right human agent with full context. Companies like Sierra and Parloa are deploying AI agents that handle 40-60% of calls autonomously."
      },
      {
        title: "Telehealth Assistants",
        description: "Voice agents can conduct initial patient intake, gather symptoms, check medication interactions, and schedule appointments - all while the patient speaks naturally. This reduces administrative burden on healthcare providers while improving patient access."
      },
      {
        title: "Real-Time Language Translation",
        description: "Voice agents can provide real-time bidirectional translation in conversations. One participant speaks English, the other hears Japanese, and vice versa - with latency low enough to maintain natural conversation flow."
      },
      {
        title: "Gaming NPCs and Virtual Companions",
        description: "Voice-enabled NPCs that can hold genuine conversations rather than playing pre-recorded lines. Players can negotiate with merchants, interrogate suspects, or build relationships with companions through natural speech."
      },
      {
        title: "Robotics Voice Interface",
        description: "Cloud-connected robots can use voice agents as their conversational brain, offloading the compute-intensive AI to powerful servers while maintaining real-time responsiveness. LiveKit's WebRTC infrastructure handles the unreliable wireless connectivity typical in robotics deployments."
      }
    ],

    keyTakeaways: [
      "Voice AI requires sequential pipeline architecture (VAD → STT → LLM → TTS) with streaming at every stage to achieve conversational latency",
      "Target sub-500ms response latency - the difference between 400ms and 800ms is the difference between natural and awkward",
      "Use VoicePipelineAgent for production: it provides text audit trails, provider flexibility, and more reliable tool calling",
      "Semantic turn detection prevents premature interruptions by understanding when thoughts complete, not just when speech stops",
      "Mix providers for best results: Deepgram for STT accuracy, GPT-4 for reasoning, Cartesia for natural voices",
      "Interruption handling is automatic but can be customized - train your agent to acknowledge interruptions gracefully",
      "WebRTC provides reliable sub-100ms audio transport; SIP trunking enables PSTN integration for phone-based agents",
      "Production deployment uses containerized agents with LiveKit Cloud handling WebRTC infrastructure and scaling",
      "Voice agents extend the ReAct pattern to audio: listen → transcribe → think → speak → repeat",
      "The same principles apply across use cases - call centers, telehealth, gaming, and robotics all benefit from low-latency streaming pipelines"
    ],

    resources: [
      {
        title: "LiveKit Agents Documentation",
        url: "https://docs.livekit.io/agents/",
        type: "docs",
        description: "Comprehensive guide to building voice and multimodal AI agents"
      },
      {
        title: "LiveKit Agents GitHub Repository",
        url: "https://github.com/livekit/agents",
        type: "github",
        description: "Open-source Python SDK with examples and plugin integrations"
      },
      {
        title: "Voice Agent Quickstart",
        url: "https://docs.livekit.io/agents/quickstarts/voice-agent/",
        type: "tutorial",
        description: "Build your first voice agent in under 10 minutes"
      },
      {
        title: "Sequential Pipeline Architecture Blog",
        url: "https://livekit.io/blog/sequential-pipeline-architecture-voice-agents",
        type: "article",
        description: "Deep dive into why text-based pipelines beat audio-native approaches"
      },
      {
        title: "LiveKit Examples Repository",
        url: "https://github.com/livekit-examples",
        type: "github",
        description: "Production-ready examples including voice agents, video rooms, and telephony"
      },
      {
        title: "Deepgram Nova Documentation",
        url: "https://developers.deepgram.com/docs/nova-3",
        type: "docs",
        description: "Best-in-class STT model used in most voice agent deployments"
      }
    ],

    relatedDays: [3, 7, 11, 24]
  }
};
