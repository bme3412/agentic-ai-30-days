import type { Phase } from '../types';

export const PHASES: Phase[] = [
  { id: 1, title: "Foundations of Agentic AI", subtitle: "Core concepts, design patterns, and building your first agent.", badge: "p1" },
  { id: 2, title: "Agent Frameworks", subtitle: "Mastering LangGraph, CrewAI, AutoGen, OpenAI SDK, and PydanticAI.", badge: "p2" },
  { id: 3, title: "Agentic RAG & Memory", subtitle: "Building retrieval-augmented agents with long-term memory and knowledge graphs.", badge: "p3" },
  { id: 4, title: "Protocols & Interoperability", subtitle: "Connecting agents with MCP, A2A, and ACP protocols.", badge: "p4" },
  { id: 5, title: "Specialized Agents", subtitle: "Building browser, coding, document, voice, and data agents.", badge: "p5" },
  { id: 6, title: "Production & Evaluation", subtitle: "Observability, testing, guardrails, and deploying agents at scale.", badge: "p6" },
];
