// ── Syntax Highlighting ─────────────────────────────

import { escapeHtml } from './helpers';

export function highlightSyntax(code: string, language: string): string {
  if (language === 'python' || language === 'py') {
    return highlightPython(code);
  } else if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
    return highlightJavaScript(code);
  }
  return escapeHtml(code);
}

function highlightPython(code: string): string {
  // Protect strings and comments first by replacing them with placeholders
  const protectedTokens: Array<{ type: string; content: string }> = [];

  const protect = (match: string, type: string): string => {
    const idx = protectedTokens.length;
    protectedTokens.push({ type, content: match });
    return `__PROTECTED_${idx}__`;
  };

  // Step 1: Protect multi-line strings (docstrings) - must come first
  code = code.replace(/"""[\s\S]*?"""/g, m => protect(m, 'docstring'));
  code = code.replace(/'''[\s\S]*?'''/g, m => protect(m, 'docstring'));

  // Step 2: Protect single-line strings
  code = code.replace(/"[^"\n]*"/g, m => protect(m, 'string'));
  code = code.replace(/'[^'\n]*'/g, m => protect(m, 'string'));

  // Step 3: Protect comments
  code = code.replace(/#[^\n]*/g, m => protect(m, 'comment'));

  // Step 4: Now escape HTML (after protecting strings/comments)
  code = escapeHtml(code);

  // Step 5: Apply syntax highlighting to keywords, etc.
  // Decorators
  code = code.replace(/@(\w+)/g, '<span class="decorator">@$1</span>');

  // Function/class definitions with names
  code = code.replace(/\b(def|class)\s+(\w+)/g,
    '<span class="keyword">$1</span> <span class="function">$2</span>');

  // Keywords
  const keywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
    'with', 'as', 'import', 'from', 'return', 'yield', 'raise', 'pass', 'break',
    'continue', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False',
    'async', 'await', 'lambda'];
  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  code = code.replace(keywordRegex, '<span class="keyword">$1</span>');

  // Built-in functions (only when followed by parenthesis)
  const builtins = ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict',
    'set', 'tuple', 'bool', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr',
    'open', 'input', 'sorted', 'enumerate', 'zip', 'map', 'filter', 'any', 'all',
    'sum', 'min', 'max', 'abs', 'round'];
  const builtinRegex = new RegExp(`\\b(${builtins.join('|')})(?=\\s*\\()`, 'g');
  code = code.replace(builtinRegex, '<span class="builtin">$1</span>');

  // Numbers
  code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

  // Step 6: Restore protected content with appropriate styling
  protectedTokens.forEach((item: { type: string; content: string }, idx: number) => {
    const escaped = escapeHtml(item.content);
    const className = item.type === 'docstring' ? 'docstring' :
                      item.type === 'comment' ? 'comment' : 'string';
    code = code.replace(`__PROTECTED_${idx}__`, `<span class="${className}">${escaped}</span>`);
  });

  return code;
}

function highlightJavaScript(code: string): string {
  const protectedTokens: Array<{ type: string; content: string }> = [];

  const protect = (match: string, type: string): string => {
    const idx = protectedTokens.length;
    protectedTokens.push({ type, content: match });
    return `__PROTECTED_${idx}__`;
  };

  // Step 1: Protect template literals
  code = code.replace(/`[^`]*`/g, m => protect(m, 'string'));

  // Step 2: Protect strings
  code = code.replace(/"[^"\n]*"/g, m => protect(m, 'string'));
  code = code.replace(/'[^'\n]*'/g, m => protect(m, 'string'));

  // Step 3: Protect comments
  code = code.replace(/\/\/[^\n]*/g, m => protect(m, 'comment'));
  code = code.replace(/\/\*[\s\S]*?\*\//g, m => protect(m, 'comment'));

  // Step 4: Escape HTML
  code = escapeHtml(code);

  // Step 5: Apply highlighting
  // Function/class definitions
  code = code.replace(/\b(function|class)\s+(\w+)/g,
    '<span class="keyword">$1</span> <span class="function">$2</span>');

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'class', 'if', 'else', 'for',
    'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'throw', 'try',
    'catch', 'finally', 'new', 'this', 'typeof', 'instanceof', 'import', 'export',
    'from', 'default', 'async', 'await', 'yield', 'extends', 'implements',
    'interface', 'type', 'enum', 'public', 'private', 'protected', 'static', 'readonly'];
  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  code = code.replace(keywordRegex, '<span class="keyword">$1</span>');

  // Built-ins
  const builtins = ['console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number',
    'Boolean', 'Date', 'Promise', 'Map', 'Set', 'RegExp', 'Error'];
  const builtinRegex = new RegExp(`\\b(${builtins.join('|')})\\b`, 'g');
  code = code.replace(builtinRegex, '<span class="builtin">$1</span>');

  // Numbers
  code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

  // Step 6: Restore protected content
  protectedTokens.forEach((item: { type: string; content: string }, idx: number) => {
    const escaped = escapeHtml(item.content);
    const className = item.type === 'comment' ? 'comment' : 'string';
    code = code.replace(`__PROTECTED_${idx}__`, `<span class="${className}">${escaped}</span>`);
  });

  return code;
}

// Agent trace highlighting for Thought/Action/Observation patterns
export function highlightAgentTrace(code: string): string {
  // Check if this looks like an agent trace
  const hasTracePattern = /^(Thought|Action|Observation)\s*\d*\s*:/m.test(code);
  if (!hasTracePattern) return code;

  // Process line by line for better control
  return code.split('\n').map(line => {
    // Match Thought lines
    if (/^Thought\s*\d*\s*:/.test(line)) {
      const match = line.match(/^(Thought\s*\d*\s*:)(.*)$/);
      if (match) {
        return `<span class="trace-line thought-line"><span class="trace-thought">${match[1]}</span>${match[2]}</span>`;
      }
    }
    // Match Action lines
    if (/^Action\s*\d*\s*:/.test(line)) {
      const match = line.match(/^(Action\s*\d*\s*:)(.*)$/);
      if (match) {
        return `<span class="trace-line action-line"><span class="trace-action">${match[1]}</span>${match[2]}</span>`;
      }
    }
    // Match Observation lines
    if (/^Observation\s*\d*\s*:/.test(line)) {
      const match = line.match(/^(Observation\s*\d*\s*:)(.*)$/);
      if (match) {
        return `<span class="trace-line observation-line"><span class="trace-observation">${match[1]}</span>${match[2]}</span>`;
      }
    }
    return line;
  }).join('\n');
}
