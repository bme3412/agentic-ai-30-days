// ── Mermaid Diagram Utilities ────────────────────────

import { escapeHtml } from './helpers';

// Declare mermaid global from CDN
declare const mermaid: {
  initialize: (config: object) => void;
  run: (config?: { nodes?: HTMLElement[]; querySelector?: string }) => Promise<void>;
};

// Initialize mermaid with config
let mermaidInitialized = false;

export function initMermaid(): void {
  if (mermaidInitialized || typeof mermaid === 'undefined') return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      primaryColor: '#e8ddd4',
      primaryTextColor: '#1a1a1a',
      primaryBorderColor: '#c4b5a5',
      lineColor: '#8b7355',
      secondaryColor: '#f5f0eb',
      tertiaryColor: '#fff',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px'
    },
    flowchart: {
      curve: 'basis',
      padding: 20
    }
  });
  mermaidInitialized = true;
}

// Wait for mermaid to load
export function waitForMermaid(maxWait = 5000): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof mermaid !== 'undefined') {
      resolve(true);
      return;
    }
    const start = Date.now();
    const check = () => {
      if (typeof mermaid !== 'undefined') {
        resolve(true);
      } else if (Date.now() - start > maxWait) {
        resolve(false);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

// Render mermaid diagrams on page
export async function renderMermaidDiagrams(): Promise<void> {
  const mermaidElements = document.querySelectorAll('.mermaid:not([data-processed="true"])');
  if (mermaidElements.length === 0) return;

  const loaded = await waitForMermaid();
  if (!loaded) return;

  initMermaid();

  try {
    await mermaid.run();
  } catch (err) {
    console.error('Mermaid error:', err);
  }
}

// Helper to render a diagram (ascii or mermaid)
export function renderDiagram(
  diag: { title?: string; ascii?: string; mermaid?: string; content?: string; caption?: string },
  className = 'diagram-ascii'
): string {
  if (diag.mermaid) {
    // Don't escape mermaid content - it needs raw syntax
    return `<pre class="mermaid">${diag.mermaid}</pre>`;
  }
  return `<pre class="${className}">${escapeHtml(diag.ascii || diag.content || '')}</pre>`;
}
