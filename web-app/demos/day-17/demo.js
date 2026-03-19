// ============================================
// Day 17: Knowledge Graphs Demo
// ============================================

// Sample graph data
const graphData = {
  nodes: [
    { id: 'alice', label: 'Alice Chen', type: 'person', properties: { title: 'CEO', skills: ['Leadership', 'AI Strategy'] } },
    { id: 'bob', label: 'Bob Smith', type: 'person', properties: { title: 'CTO', skills: ['ML', 'Systems'] } },
    { id: 'carol', label: 'Carol Wu', type: 'person', properties: { title: 'Engineer', skills: ['Python', 'PyTorch'] } },
    { id: 'dave', label: 'Dave Park', type: 'person', properties: { title: 'Engineer', skills: ['NLP', 'Transformers'] } },
    { id: 'techcorp', label: 'TechCorp', type: 'company', properties: { industry: 'AI', founded: 2020 } },
    { id: 'neuraltech', label: 'NeuralTech', type: 'company', properties: { industry: 'AI', founded: 2022 } },
    { id: 'visionai', label: 'VisionAI', type: 'company', properties: { industry: 'Computer Vision', founded: 2019 } },
    { id: 'aibot', label: 'AIBot', type: 'product', properties: { category: 'SaaS', price: 99 } },
    { id: 'visionpro', label: 'VisionPro', type: 'product', properties: { category: 'Enterprise', price: 499 } },
    { id: 'pytorch', label: 'PyTorch', type: 'technology', properties: { category: 'Framework' } },
    { id: 'tensorflow', label: 'TensorFlow', type: 'technology', properties: { category: 'Framework' } },
    { id: 'transformers', label: 'Transformers', type: 'technology', properties: { category: 'Architecture' } }
  ],
  relationships: [
    { source: 'alice', target: 'techcorp', type: 'FOUNDED' },
    { source: 'alice', target: 'techcorp', type: 'WORKS_AT' },
    { source: 'bob', target: 'techcorp', type: 'WORKS_AT' },
    { source: 'carol', target: 'neuraltech', type: 'WORKS_AT' },
    { source: 'dave', target: 'neuraltech', type: 'WORKS_AT' },
    { source: 'alice', target: 'bob', type: 'MANAGES' },
    { source: 'bob', target: 'carol', type: 'KNOWS' },
    { source: 'techcorp', target: 'aibot', type: 'MAKES' },
    { source: 'visionai', target: 'visionpro', type: 'MAKES' },
    { source: 'techcorp', target: 'visionai', type: 'COMPETES_WITH' },
    { source: 'neuraltech', target: 'visionai', type: 'COMPETES_WITH' },
    { source: 'techcorp', target: 'pytorch', type: 'USES' },
    { source: 'neuraltech', target: 'pytorch', type: 'USES' },
    { source: 'visionai', target: 'tensorflow', type: 'USES' },
    { source: 'aibot', target: 'transformers', type: 'USES' }
  ]
};

// Cypher query presets
const cypherPresets = {
  basic: `// Find all people
MATCH (p:Person)
RETURN p.name, p.title`,

  relationship: `// Find who works where
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
RETURN p.name, c.name, c.industry`,

  multihop: `// Find competitors of Alice's company
MATCH (alice:Person {name: "Alice Chen"})-[:WORKS_AT]->(c:Company)
MATCH (c)-[:COMPETES_WITH]->(competitor:Company)
RETURN c.name as company, competitor.name as competitor`,

  aggregate: `// Count employees per company
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
RETURN c.name, count(p) as employees
ORDER BY employees DESC`,

  path: `// Find connection path between Alice and Dave
MATCH path = shortestPath(
  (a:Person {name: "Alice Chen"})-[*]-(b:Person {name: "Dave Park"})
)
RETURN path`
};

// Initialize tabs
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

// Initialize graph visualization
function initGraphExplorer() {
  const container = document.getElementById('graph-viz');
  if (!container) return;

  // Create SVG
  const width = container.clientWidth;
  const height = 400;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  container.appendChild(svg);

  // Calculate positions using force-directed layout simulation
  const nodePositions = calculateLayout(graphData.nodes, graphData.relationships, width, height);

  // Draw relationships first (so they appear behind nodes)
  const linksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  graphData.relationships.forEach(rel => {
    const sourcePos = nodePositions[rel.source];
    const targetPos = nodePositions[rel.target];

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', sourcePos.x);
    line.setAttribute('y1', sourcePos.y);
    line.setAttribute('x2', targetPos.x);
    line.setAttribute('y2', targetPos.y);
    line.setAttribute('stroke', '#2a2a3a');
    line.setAttribute('stroke-width', '2');
    linksGroup.appendChild(line);

    // Relationship label
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = (sourcePos.y + targetPos.y) / 2;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', midX);
    text.setAttribute('y', midY - 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#606070');
    text.setAttribute('font-size', '9');
    text.setAttribute('font-family', 'JetBrains Mono, monospace');
    text.textContent = rel.type;
    linksGroup.appendChild(text);
  });
  svg.appendChild(linksGroup);

  // Draw nodes
  const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  graphData.nodes.forEach(node => {
    const pos = nodePositions[node.id];
    const color = getNodeColor(node.type);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', 20);
    circle.setAttribute('fill', color);
    circle.setAttribute('cursor', 'pointer');
    circle.setAttribute('class', 'graph-node-circle');
    circle.dataset.nodeId = node.id;
    nodesGroup.appendChild(circle);

    // Node label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y + 35);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#f0f0f5');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-family', 'Bricolage Grotesque, sans-serif');
    text.textContent = node.label;
    nodesGroup.appendChild(text);

    // Click handler
    circle.addEventListener('click', () => showNodeDetails(node));
  });
  svg.appendChild(nodesGroup);

  // Update stats
  document.getElementById('node-count').textContent = graphData.nodes.length;
  document.getElementById('rel-count').textContent = graphData.relationships.length;
  document.getElementById('type-count').textContent = [...new Set(graphData.nodes.map(n => n.type))].length;
}

function calculateLayout(nodes, relationships, width, height) {
  const positions = {};
  const padding = 60;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  // Simple force-directed simulation
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    const radius = Math.min(usableWidth, usableHeight) / 2.5;
    positions[node.id] = {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle)
    };
  });

  // Run simple force simulation
  for (let iteration = 0; iteration < 50; iteration++) {
    // Repulsion between all nodes
    nodes.forEach((nodeA, i) => {
      nodes.forEach((nodeB, j) => {
        if (i >= j) return;
        const posA = positions[nodeA.id];
        const posB = positions[nodeB.id];
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 500 / (dist * dist);
        posA.x -= (dx / dist) * force;
        posA.y -= (dy / dist) * force;
        posB.x += (dx / dist) * force;
        posB.y += (dy / dist) * force;
      });
    });

    // Attraction along edges
    relationships.forEach(rel => {
      const posA = positions[rel.source];
      const posB = positions[rel.target];
      const dx = posB.x - posA.x;
      const dy = posB.y - posA.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * 0.01;
      posA.x += (dx / dist) * force;
      posA.y += (dy / dist) * force;
      posB.x -= (dx / dist) * force;
      posB.y -= (dy / dist) * force;
    });

    // Keep within bounds
    nodes.forEach(node => {
      const pos = positions[node.id];
      pos.x = Math.max(padding, Math.min(width - padding, pos.x));
      pos.y = Math.max(padding, Math.min(height - padding, pos.y));
    });
  }

  return positions;
}

function getNodeColor(type) {
  const colors = {
    person: '#6366f1',
    company: '#10b981',
    product: '#f59e0b',
    technology: '#ec4899'
  };
  return colors[type] || '#6366f1';
}

function showNodeDetails(node) {
  const detailsDiv = document.getElementById('node-details');
  const connections = graphData.relationships.filter(
    r => r.source === node.id || r.target === node.id
  );

  let connectionsHtml = connections.map(rel => {
    const isSource = rel.source === node.id;
    const otherNode = graphData.nodes.find(n => n.id === (isSource ? rel.target : rel.source));
    const direction = isSource ? '→' : '←';
    return `<div class="connection-item">${direction} ${rel.type} → ${otherNode.label}</div>`;
  }).join('');

  detailsDiv.innerHTML = `
    <h4>${node.label}</h4>
    <div class="node-type" style="background: ${getNodeColor(node.type)}; color: white; padding: 2px 8px; border-radius: 4px; display: inline-block; font-size: 0.75rem; margin-bottom: 0.75rem;">${node.type.toUpperCase()}</div>
    <div class="node-properties" style="margin-bottom: 0.75rem;">
      ${Object.entries(node.properties).map(([key, value]) =>
        `<div style="font-size: 0.85rem;"><span style="color: #a0a0b0;">${key}:</span> ${Array.isArray(value) ? value.join(', ') : value}</div>`
      ).join('')}
    </div>
    <div class="node-connections">
      <div style="font-size: 0.85rem; color: #a0a0b0; margin-bottom: 0.5rem;">Connections (${connections.length}):</div>
      ${connectionsHtml}
    </div>
  `;
}

// Cypher Lab
function initCypherLab() {
  const presetBtns = document.querySelectorAll('.preset-btn');
  const cypherInput = document.getElementById('cypher-input');
  const runBtn = document.getElementById('run-query');
  const explainBtn = document.getElementById('explain-query');
  const clearBtn = document.getElementById('clear-query');
  const resultsDiv = document.getElementById('query-results');

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.query;
      cypherInput.value = cypherPresets[preset];
    });
  });

  runBtn.addEventListener('click', () => {
    const query = cypherInput.value;
    const results = executeCypher(query);
    displayResults(results, resultsDiv);
  });

  explainBtn.addEventListener('click', () => {
    const query = cypherInput.value;
    const explanation = explainCypher(query);
    resultsDiv.innerHTML = `<div style="color: #a0a0b0;">${explanation}</div>`;
  });

  clearBtn.addEventListener('click', () => {
    cypherInput.value = '';
    resultsDiv.innerHTML = '<p class="placeholder-text">Run a query to see results here...</p>';
  });
}

function executeCypher(query) {
  // Simplified Cypher execution against our sample data
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('person') && lowerQuery.includes('works_at') && lowerQuery.includes('company')) {
    return graphData.nodes
      .filter(n => n.type === 'person')
      .map(person => {
        const rel = graphData.relationships.find(r => r.source === person.id && r.type === 'WORKS_AT');
        if (rel) {
          const company = graphData.nodes.find(n => n.id === rel.target);
          return { person: person.label, company: company?.label, industry: company?.properties?.industry };
        }
        return null;
      })
      .filter(Boolean);
  }

  if (lowerQuery.includes('person') && !lowerQuery.includes('->')) {
    return graphData.nodes
      .filter(n => n.type === 'person')
      .map(n => ({ name: n.label, title: n.properties.title }));
  }

  if (lowerQuery.includes('competes_with')) {
    return graphData.relationships
      .filter(r => r.type === 'COMPETES_WITH')
      .map(rel => {
        const source = graphData.nodes.find(n => n.id === rel.source);
        const target = graphData.nodes.find(n => n.id === rel.target);
        return { company: source.label, competitor: target.label };
      });
  }

  if (lowerQuery.includes('count')) {
    const counts = {};
    graphData.relationships
      .filter(r => r.type === 'WORKS_AT')
      .forEach(rel => {
        const company = graphData.nodes.find(n => n.id === rel.target);
        if (company) {
          counts[company.label] = (counts[company.label] || 0) + 1;
        }
      });
    return Object.entries(counts).map(([name, count]) => ({ company: name, employees: count }));
  }

  if (lowerQuery.includes('shortestpath')) {
    return [{ path: 'Alice Chen → MANAGES → Bob Smith → KNOWS → Carol Wu → WORKS_AT → NeuralTech ← WORKS_AT ← Dave Park' }];
  }

  return [{ message: 'Query executed. Showing sample results based on pattern.' }];
}

function displayResults(results, container) {
  if (!results || results.length === 0) {
    container.innerHTML = '<p class="placeholder-text">No results found.</p>';
    return;
  }

  const headers = Object.keys(results[0]);
  let html = '<table style="width: 100%; border-collapse: collapse;">';
  html += '<thead><tr>';
  headers.forEach(h => {
    html += `<th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #2a2a3a; color: #a0a0b0;">${h}</th>`;
  });
  html += '</tr></thead><tbody>';

  results.forEach(row => {
    html += '<tr>';
    headers.forEach(h => {
      html += `<td style="padding: 0.5rem; border-bottom: 1px solid #1a1a24;">${row[h]}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function explainCypher(query) {
  const patterns = [
    { match: /MATCH/i, explain: 'MATCH: Find patterns in the graph' },
    { match: /\((\w+):(\w+)\)/g, explain: 'Node pattern: (variable:Label)' },
    { match: /-\[:(\w+)\]->/g, explain: 'Relationship pattern: -[:TYPE]->' },
    { match: /WHERE/i, explain: 'WHERE: Filter matched patterns' },
    { match: /RETURN/i, explain: 'RETURN: Specify what to output' },
    { match: /count\(/i, explain: 'count(): Aggregate function' },
    { match: /shortestPath/i, explain: 'shortestPath(): Find shortest connection' }
  ];

  const explanations = patterns
    .filter(p => p.match.test(query))
    .map(p => `• ${p.explain}`);

  return explanations.length > 0
    ? '<strong>Query Explanation:</strong><br><br>' + explanations.join('<br>')
    : 'Enter a Cypher query to see explanation.';
}

// GraphRAG Demo
function initGraphRAG() {
  const questionInput = document.getElementById('rag-question');
  const runBtn = document.getElementById('run-rag');
  const exampleBtns = document.querySelectorAll('.example-btn');

  exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      questionInput.value = btn.dataset.question;
    });
  });

  runBtn.addEventListener('click', () => {
    const question = questionInput.value;
    if (!question) return;
    runRAGComparison(question);
  });
}

function runRAGComparison(question) {
  const vectorResult = document.getElementById('vector-result').querySelector('.result-content');
  const graphResult = document.getElementById('graph-result').querySelector('.result-content');
  const vectorVerdict = document.getElementById('vector-verdict');
  const graphVerdict = document.getElementById('graph-verdict');

  // Simulate vector search results
  vectorResult.innerHTML = '<span class="loading">Searching...</span>';
  graphResult.innerHTML = '<span class="loading">Querying graph...</span>';

  setTimeout(() => {
    // Vector RAG - finds semantically similar but may miss relationships
    const vectorResults = simulateVectorSearch(question);
    vectorResult.innerHTML = vectorResults.context;
    vectorVerdict.className = 'rag-verdict ' + (vectorResults.success ? 'success' : 'failure');
    vectorVerdict.innerHTML = `
      <span class="verdict-icon">${vectorResults.success ? '✓' : '✗'}</span>
      <span class="verdict-text">${vectorResults.verdict}</span>
    `;
  }, 800);

  setTimeout(() => {
    // Graph RAG - traverses relationships
    const graphResults = simulateGraphRAG(question);
    graphResult.innerHTML = graphResults.context;
    graphVerdict.className = 'rag-verdict ' + (graphResults.success ? 'success' : 'failure');
    graphVerdict.innerHTML = `
      <span class="verdict-icon">${graphResults.success ? '✓' : '✗'}</span>
      <span class="verdict-text">${graphResults.verdict}</span>
    `;
  }, 1200);
}

function simulateVectorSearch(question) {
  const lowerQ = question.toLowerCase();

  if (lowerQ.includes('competitor') || lowerQ.includes('compete')) {
    return {
      context: `Found chunks mentioning:<br>
        • "TechCorp is an AI company founded in 2020"<br>
        • "VisionAI specializes in computer vision"<br>
        • "NeuralTech entered the market in 2022"<br><br>
        <em style="color: #606070;">No explicit competitor relationships found in text chunks.</em>`,
      success: false,
      verdict: 'Partial - Missing relationship context'
    };
  }

  if (lowerQ.includes('works at') || lowerQ.includes('employees')) {
    return {
      context: `Found chunks mentioning:<br>
        • "Alice Chen is the CEO"<br>
        • "Bob Smith works in engineering"<br>
        • "Company profiles mention various roles"<br><br>
        <em style="color: #10b981;">Can answer with semantic matching.</em>`,
      success: true,
      verdict: 'Success - Semantic match found'
    };
  }

  if (lowerQ.includes('manages') || lowerQ.includes('alice') && lowerQ.includes('product')) {
    return {
      context: `Found chunks mentioning:<br>
        • "Alice Chen is CEO of TechCorp"<br>
        • "AIBot is a SaaS product"<br><br>
        <em style="color: #606070;">Cannot infer company → product relationship.</em>`,
      success: false,
      verdict: 'Failed - Multi-hop reasoning needed'
    };
  }

  return {
    context: `Found semantically similar text chunks but cannot traverse relationships between entities.`,
    success: false,
    verdict: 'Limited - Relationship queries need graphs'
  };
}

function simulateGraphRAG(question) {
  const lowerQ = question.toLowerCase();

  if (lowerQ.includes('competitor') || lowerQ.includes('compete')) {
    return {
      context: `Generated Cypher:<br>
        <code style="color: #818cf8;">MATCH (c:Company)-[:COMPETES_WITH]->(competitor)<br>
        RETURN c.name, competitor.name</code><br><br>
        Results:<br>
        • TechCorp ↔ VisionAI<br>
        • NeuralTech ↔ VisionAI<br><br>
        <em style="color: #10b981;">Traversed COMPETES_WITH relationships.</em>`,
      success: true,
      verdict: 'Success - Relationship traversal'
    };
  }

  if (lowerQ.includes('works at') || lowerQ.includes('employees') || lowerQ.includes('ai companies')) {
    return {
      context: `Generated Cypher:<br>
        <code style="color: #818cf8;">MATCH (p:Person)-[:WORKS_AT]->(c:Company)<br>
        WHERE c.industry = "AI"<br>
        RETURN p.name, c.name</code><br><br>
        Results:<br>
        • Alice Chen → TechCorp<br>
        • Bob Smith → TechCorp<br>
        • Carol Wu → NeuralTech<br>
        • Dave Park → NeuralTech`,
      success: true,
      verdict: 'Success - Pattern matched'
    };
  }

  if (lowerQ.includes('alice') && lowerQ.includes('product')) {
    return {
      context: `Generated Cypher:<br>
        <code style="color: #818cf8;">MATCH (a:Person {name: "Alice Chen"})-[:WORKS_AT]->(c:Company)<br>
        MATCH (c)-[:MAKES]->(p:Product)<br>
        RETURN p.name</code><br><br>
        Results:<br>
        • AIBot (via TechCorp)<br><br>
        <em style="color: #10b981;">Multi-hop: Person → Company → Product</em>`,
      success: true,
      verdict: 'Success - Multi-hop traversal'
    };
  }

  if (lowerQ.includes('manages')) {
    return {
      context: `Generated Cypher:<br>
        <code style="color: #818cf8;">MATCH (m:Person)-[:MANAGES]->(e:Person)-[:WORKS_AT]->(c:Company)<br>
        WHERE e.title = "Engineer"<br>
        RETURN m.name, e.name</code><br><br>
        Results:<br>
        • Alice Chen manages Bob Smith`,
      success: true,
      verdict: 'Success - Hierarchical query'
    };
  }

  return {
    context: `Generated Cypher query from natural language. Traversed relationships to find connected entities.`,
    success: true,
    verdict: 'Success - Graph traversal'
  };
}

// Entity Extraction Demo
function initEntityExtraction() {
  const extractBtn = document.getElementById('extract-btn');
  const sourceText = document.getElementById('source-text');
  const entityList = document.getElementById('entity-list');
  const relationshipList = document.getElementById('relationship-list');
  const extractionGraph = document.getElementById('extraction-graph');

  extractBtn.addEventListener('click', () => {
    const text = sourceText.value;
    if (!text) return;

    // Simulate extraction
    entityList.innerHTML = '<span class="loading">Extracting entities...</span>';
    relationshipList.innerHTML = '<span class="loading">Extracting relationships...</span>';

    setTimeout(() => {
      const extracted = extractEntities(text);
      displayExtractedEntities(extracted.entities, entityList);
      displayExtractedRelationships(extracted.relationships, relationshipList);
      visualizeExtractedGraph(extracted, extractionGraph);
    }, 1000);
  });
}

function extractEntities(text) {
  // Simplified entity extraction simulation
  const entities = [];
  const relationships = [];

  // Simple pattern matching for demo
  const personPatterns = /(?:([A-Z][a-z]+\s[A-Z][a-z]+)|she|he)/gi;
  const companyPatterns = /(?:([A-Z][a-z]+(?:Corp|Tech|AI))|Google|Sequoia)/gi;
  const techPatterns = /(?:PyTorch|AI|computer vision|deep learning)/gi;

  // Extract based on the sample text
  if (text.toLowerCase().includes('sarah chen')) {
    entities.push({ id: 'sarah', label: 'Sarah Chen', type: 'person' });
  }
  if (text.toLowerCase().includes('neuraltech')) {
    entities.push({ id: 'neuraltech', label: 'NeuralTech', type: 'company' });
  }
  if (text.toLowerCase().includes('google')) {
    entities.push({ id: 'google', label: 'Google', type: 'company' });
  }
  if (text.toLowerCase().includes('visionai')) {
    entities.push({ id: 'visionai', label: 'VisionAI', type: 'company' });
  }
  if (text.toLowerCase().includes('cloudcorp')) {
    entities.push({ id: 'cloudcorp', label: 'CloudCorp', type: 'company' });
  }
  if (text.toLowerCase().includes('sequoia')) {
    entities.push({ id: 'sequoia', label: 'Sequoia Capital', type: 'company' });
  }
  if (text.toLowerCase().includes('pytorch')) {
    entities.push({ id: 'pytorch', label: 'PyTorch', type: 'technology' });
  }
  if (text.toLowerCase().includes('computer vision')) {
    entities.push({ id: 'cv', label: 'Computer Vision', type: 'technology' });
  }

  // Extract relationships
  if (text.toLowerCase().includes('founded')) {
    relationships.push({ source: 'Sarah Chen', type: 'FOUNDED', target: 'NeuralTech' });
  }
  if (text.toLowerCase().includes('worked at google')) {
    relationships.push({ source: 'Sarah Chen', type: 'WORKED_AT', target: 'Google' });
  }
  if (text.toLowerCase().includes('competes with')) {
    relationships.push({ source: 'NeuralTech', type: 'COMPETES_WITH', target: 'VisionAI' });
  }
  if (text.toLowerCase().includes('partnered with')) {
    relationships.push({ source: 'NeuralTech', type: 'PARTNERS_WITH', target: 'CloudCorp' });
  }
  if (text.toLowerCase().includes('uses pytorch')) {
    relationships.push({ source: 'NeuralTech', type: 'USES', target: 'PyTorch' });
  }
  if (text.toLowerCase().includes('funding from')) {
    relationships.push({ source: 'Sequoia Capital', type: 'INVESTED_IN', target: 'NeuralTech' });
  }

  return { entities, relationships };
}

function displayExtractedEntities(entities, container) {
  if (entities.length === 0) {
    container.innerHTML = '<p class="placeholder-text">No entities extracted.</p>';
    return;
  }

  container.innerHTML = entities.map(e => `
    <div class="entity-item">
      <span class="entity-badge ${e.type}">${e.type}</span>
      <span>${e.label}</span>
    </div>
  `).join('');
}

function displayExtractedRelationships(relationships, container) {
  if (relationships.length === 0) {
    container.innerHTML = '<p class="placeholder-text">No relationships extracted.</p>';
    return;
  }

  container.innerHTML = relationships.map(r => `
    <div class="relationship-item">
      <span>${r.source}</span>
      <span class="rel-arrow">→</span>
      <span class="rel-type">${r.type}</span>
      <span class="rel-arrow">→</span>
      <span>${r.target}</span>
    </div>
  `).join('');
}

function visualizeExtractedGraph(extracted, container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: #a0a0b0;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🔗</div>
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${extracted.entities.length} Nodes</div>
      <div style="font-size: 1rem;">${extracted.relationships.length} Relationships</div>
      <div style="margin-top: 1rem; font-size: 0.85rem;">Ready to load into Neo4j</div>
    </div>
  `;
}

// Code Builder
function initCodeBuilder() {
  const options = document.querySelectorAll('#builder select, #builder input[type="checkbox"]');
  const codeOutput = document.getElementById('generated-code');
  const copyBtn = document.getElementById('copy-code');

  function updateCode() {
    const code = generateCode();
    codeOutput.querySelector('code').textContent = code;
  }

  options.forEach(opt => {
    opt.addEventListener('change', updateCode);
  });

  copyBtn.addEventListener('click', () => {
    const code = codeOutput.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      copyBtn.innerHTML = '<span>✓</span> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<span>📋</span> Copy';
      }, 2000);
    });
  });

  updateCode();
}

function generateCode() {
  const instance = document.getElementById('neo4j-instance').value;
  const auth = document.getElementById('neo4j-auth').value;
  const useGraphQA = document.getElementById('use-graphqa').checked;
  const useVector = document.getElementById('use-vector').checked;
  const useExtraction = document.getElementById('use-extraction').checked;
  const llmProvider = document.getElementById('llm-provider').value;
  const validateCypher = document.getElementById('validate-cypher').checked;
  const returnSteps = document.getElementById('return-steps').checked;
  const addCaching = document.getElementById('add-caching').checked;
  const addMonitoring = document.getElementById('add-monitoring').checked;
  const addRetry = document.getElementById('add-retry').checked;

  let code = `"""
GraphRAG Agent with Neo4j and LangChain
Generated for Day 17: Knowledge Graphs for Agents
"""

`;

  // Imports
  code += `from langchain_community.graphs import Neo4jGraph\n`;
  if (useGraphQA) {
    code += `from langchain.chains import GraphCypherQAChain\n`;
  }
  if (useVector) {
    code += `from langchain_community.vectorstores import Neo4jVector\n`;
    code += `from langchain_openai import OpenAIEmbeddings\n`;
  }
  if (useExtraction) {
    code += `from langchain_experimental.graph_transformers import LLMGraphTransformer\n`;
    code += `from langchain_core.documents import Document\n`;
  }

  // LLM import
  if (llmProvider === 'openai') {
    code += `from langchain_openai import ChatOpenAI\n`;
  } else if (llmProvider === 'anthropic') {
    code += `from langchain_anthropic import ChatAnthropic\n`;
  } else {
    code += `from langchain_community.llms import Ollama\n`;
  }

  if (addMonitoring) {
    code += `import logging\nimport time\n`;
  }
  if (addCaching) {
    code += `import hashlib\n`;
  }

  code += `\n`;

  // Connection config
  if (auth === 'env') {
    code += `import os\n\n`;
    code += `NEO4J_URL = os.getenv("NEO4J_URL", "bolt://localhost:7687")\n`;
    code += `NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")\n`;
    code += `NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")\n\n`;
  } else {
    let url = 'bolt://localhost:7687';
    if (instance === 'aura') url = 'neo4j+s://your-instance.databases.neo4j.io';
    if (instance === 'docker') url = 'bolt://neo4j:7687';
    code += `# Connection configuration\n`;
    code += `NEO4J_URL = "${url}"\n`;
    code += `NEO4J_USER = "neo4j"\n`;
    code += `NEO4J_PASSWORD = "your-password"  # Use environment variables in production!\n\n`;
  }

  // Main class
  code += `class GraphRAGAgent:\n`;
  code += `    """Knowledge Graph Agent with Neo4j backend."""\n\n`;
  code += `    def __init__(self):\n`;
  code += `        # Connect to Neo4j\n`;
  code += `        self.graph = Neo4jGraph(\n`;
  code += `            url=NEO4J_URL,\n`;
  code += `            username=NEO4J_USER,\n`;
  code += `            password=NEO4J_PASSWORD\n`;
  code += `        )\n\n`;

  // LLM setup
  code += `        # Initialize LLM\n`;
  if (llmProvider === 'openai') {
    code += `        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)\n\n`;
  } else if (llmProvider === 'anthropic') {
    code += `        self.llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)\n\n`;
  } else {
    code += `        self.llm = Ollama(model="llama2")\n\n`;
  }

  // GraphQA Chain
  if (useGraphQA) {
    code += `        # Graph QA Chain\n`;
    code += `        self.graph_qa = GraphCypherQAChain.from_llm(\n`;
    code += `            llm=self.llm,\n`;
    code += `            graph=self.graph,\n`;
    code += `            verbose=True,\n`;
    code += `            validate_cypher=${validateCypher ? 'True' : 'False'},\n`;
    code += `            return_intermediate_steps=${returnSteps ? 'True' : 'False'},\n`;
    code += `            top_k=20\n`;
    code += `        )\n\n`;
  }

  // Vector store
  if (useVector) {
    code += `        # Vector store for hybrid search\n`;
    code += `        self.vector_store = Neo4jVector.from_existing_graph(\n`;
    code += `            embedding=OpenAIEmbeddings(),\n`;
    code += `            url=NEO4J_URL,\n`;
    code += `            username=NEO4J_USER,\n`;
    code += `            password=NEO4J_PASSWORD,\n`;
    code += `            index_name="entity_embeddings",\n`;
    code += `            node_label="Entity",\n`;
    code += `            text_node_properties=["name", "description"],\n`;
    code += `            embedding_node_property="embedding"\n`;
    code += `        )\n\n`;
  }

  // Entity extraction
  if (useExtraction) {
    code += `        # Entity extraction transformer\n`;
    code += `        self.transformer = LLMGraphTransformer(\n`;
    code += `            llm=self.llm,\n`;
    code += `            allowed_nodes=["Person", "Company", "Product", "Technology"],\n`;
    code += `            allowed_relationships=["WORKS_AT", "FOUNDED", "USES", "COMPETES_WITH"]\n`;
    code += `        )\n\n`;
  }

  // Caching
  if (addCaching) {
    code += `        # Query cache\n`;
    code += `        self.cache = {}\n\n`;
  }

  // Monitoring
  if (addMonitoring) {
    code += `        # Logging\n`;
    code += `        self.logger = logging.getLogger(__name__)\n\n`;
  }

  // Query method
  if (useGraphQA) {
    code += `    def query(self, question: str) -> str:\n`;
    code += `        """Query the knowledge graph with natural language."""\n`;

    if (addCaching) {
      code += `        # Check cache\n`;
      code += `        cache_key = hashlib.md5(question.lower().encode()).hexdigest()\n`;
      code += `        if cache_key in self.cache:\n`;
      code += `            return self.cache[cache_key]\n\n`;
    }

    if (addMonitoring) {
      code += `        start_time = time.time()\n`;
      code += `        self.logger.info(f"Processing query: {question}")\n\n`;
    }

    if (addRetry) {
      code += `        # Query with retry logic\n`;
      code += `        max_retries = 3\n`;
      code += `        for attempt in range(max_retries):\n`;
      code += `            try:\n`;
      code += `                result = self.graph_qa.invoke({"query": question})\n`;
      code += `                break\n`;
      code += `            except Exception as e:\n`;
      code += `                if attempt == max_retries - 1:\n`;
      code += `                    raise\n`;
      code += `                self.logger.warning(f"Retry {attempt + 1}: {e}")\n\n`;
    } else {
      code += `        result = self.graph_qa.invoke({"query": question})\n\n`;
    }

    if (addMonitoring) {
      code += `        latency = (time.time() - start_time) * 1000\n`;
      code += `        self.logger.info(f"Query completed in {latency:.2f}ms")\n\n`;
    }

    if (addCaching) {
      code += `        # Cache result\n`;
      code += `        self.cache[cache_key] = result["result"]\n\n`;
    }

    code += `        return result["result"]\n\n`;
  }

  // Hybrid search
  if (useVector) {
    code += `    def hybrid_search(self, query: str, k: int = 5) -> list:\n`;
    code += `        """Combine vector search with graph expansion."""\n`;
    code += `        # Vector similarity search\n`;
    code += `        similar = self.vector_store.similarity_search(query, k=k)\n\n`;
    code += `        # Expand via graph relationships\n`;
    code += `        results = []\n`;
    code += `        for doc in similar:\n`;
    code += `            name = doc.metadata.get("name")\n`;
    code += `            neighbors = self.graph.query(f"""\n`;
    code += `                MATCH (n {{name: "{name}"}})-[r]-(connected)\n`;
    code += `                RETURN type(r) as rel, connected.name as connected\n`;
    code += `                LIMIT 10\n`;
    code += `            """)\n`;
    code += `            results.append({"entity": name, "connections": neighbors})\n\n`;
    code += `        return results\n\n`;
  }

  // Entity extraction method
  if (useExtraction) {
    code += `    def extract_and_load(self, text: str) -> dict:\n`;
    code += `        """Extract entities from text and load into graph."""\n`;
    code += `        doc = Document(page_content=text)\n`;
    code += `        graph_docs = self.transformer.convert_to_graph_documents([doc])\n\n`;
    code += `        # Load into Neo4j\n`;
    code += `        self.graph.add_graph_documents(\n`;
    code += `            graph_docs,\n`;
    code += `            baseEntityLabel=True,\n`;
    code += `            include_source=True\n`;
    code += `        )\n\n`;
    code += `        return {\n`;
    code += `            "nodes": len(graph_docs[0].nodes),\n`;
    code += `            "relationships": len(graph_docs[0].relationships)\n`;
    code += `        }\n\n`;
  }

  // Usage example
  code += `\n# Usage\n`;
  code += `if __name__ == "__main__":\n`;
  code += `    agent = GraphRAGAgent()\n\n`;

  if (useGraphQA) {
    code += `    # Natural language query\n`;
    code += `    answer = agent.query("Who works at AI companies?")\n`;
    code += `    print(f"Answer: {answer}")\n\n`;
  }

  if (useVector) {
    code += `    # Hybrid search\n`;
    code += `    results = agent.hybrid_search("machine learning experts")\n`;
    code += `    print(f"Found {len(results)} relevant entities")\n\n`;
  }

  if (useExtraction) {
    code += `    # Extract from text\n`;
    code += `    text = "Alice founded TechCorp in 2020. The company develops AI products."\n`;
    code += `    stats = agent.extract_and_load(text)\n`;
    code += `    print(f"Extracted: {stats}")\n`;
  }

  return code;
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initGraphExplorer();
  initCypherLab();
  initGraphRAG();
  initEntityExtraction();
  initCodeBuilder();
});
