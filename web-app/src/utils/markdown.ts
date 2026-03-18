// ── Markdown Renderer ────────────────────────────────

import { escapeHtml } from './helpers';
import { highlightAgentTrace, highlightSyntax } from './syntax';

export function renderMarkdown(text: string, simple = false): string {
  if (!text) return '';

  if (simple) {
    let html = escapeHtml(text)
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .split(/\n\n+/)
      .map(para => {
        para = para.trim();
        if (!para) return '';
        if (para.startsWith('<h') || para.startsWith('<pre') || para.startsWith('<li>')) {
          if (para.includes('<li>')) return `<ul>${para}</ul>`;
          return para;
        }
        return `<p>${para.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');
    return html;
  }

  return renderMarkdownFull(text);
}

export function renderMarkdownFull(text: string): string {
  // Step 1: Extract code blocks and tables BEFORE any processing
  const codeBlocks: Array<{ lang: string; code: string }> = [];
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push({ lang: lang || 'text', code: code.trim() });
    return placeholder;
  });

  const tables: Array<{ header: string; separator: string; body: string }> = [];
  text = text.replace(/\n(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)+)/g, (_match, header, separator, body) => {
    const placeholder = `__TABLE_${tables.length}__`;
    tables.push({ header, separator, body: body.trim() });
    return '\n' + placeholder + '\n';
  });

  // Step 2: Escape HTML (placeholders stay as plain text)
  let html = escapeHtml(text);

  // Step 3: Apply inline formatting
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^---+$/gm, '<hr>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Step 4: Process paragraphs and lists (placeholders are single lines, preserved)
  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        result.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = [];
        inList = false;
        listType = null;
      }
      continue;
    }

    const ulMatch = trimmed.match(/^[-*] (.+)$/);
    const olMatch = trimmed.match(/^\d+\. (.+)$/);

    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList && listType) result.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = [];
        inList = true;
        listType = 'ul';
      }
      listItems.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList && listType) result.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = [];
        inList = true;
        listType = 'ol';
      }
      listItems.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inList && listType) {
        result.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = [];
        inList = false;
        listType = null;
      }

      // Check for placeholders or HTML elements
      if (trimmed.startsWith('<h') || trimmed.startsWith('<hr') ||
          trimmed.startsWith('<table') || trimmed.startsWith('__CODE_BLOCK_') ||
          trimmed.startsWith('__TABLE_')) {
        result.push(trimmed);
      } else {
        result.push(`<p>${trimmed}</p>`);
      }
    }
  }

  if (inList && listType) {
    result.push(`<${listType}>${listItems.join('')}</${listType}>`);
  }

  html = result.join('\n');

  // Step 5: NOW restore code blocks (after paragraph processing)
  codeBlocks.forEach((block, i) => {
    let processedCode: string;

    // Apply syntax highlighting based on language
    if (block.lang === 'python' || block.lang === 'py' ||
        block.lang === 'javascript' || block.lang === 'js' ||
        block.lang === 'typescript' || block.lang === 'ts') {
      processedCode = highlightSyntax(block.code, block.lang);
    } else {
      // For other languages, just escape and check for agent trace patterns
      processedCode = escapeHtml(block.code);
      processedCode = highlightAgentTrace(processedCode);
    }

    html = html.replace(`__CODE_BLOCK_${i}__`,
      `<pre class="code-block" data-lang="${block.lang}"><code>${processedCode}</code></pre>`);
  });

  // Step 6: Restore tables
  tables.forEach((table, i) => {
    const headerCells = table.header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const bodyRows = table.body.split('\n').filter(r => r.trim()).map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    html = html.replace(`__TABLE_${i}__`,
      `<table class="md-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`);
  });

  return html;
}
