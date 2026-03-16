// ═══════════════════════════════════════════════════════════════
// Day 14: Vector Databases Demo
// ═══════════════════════════════════════════════════════════════

// ─── Tab Navigation ─────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update active content
    const tabId = btn.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
  });
});

// ═══════════════════════════════════════════════════════════════
// Tab 1: Embeddings Explorer
// ═══════════════════════════════════════════════════════════════

// Simulated embedding generation (deterministic based on text hash)
function generateSimulatedEmbedding(text, dimensions = 1536) {
  const embedding = [];
  let hash = 0;

  // Simple string hash
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Generate pseudo-random but deterministic values
  const seed = Math.abs(hash);
  for (let i = 0; i < dimensions; i++) {
    const x = Math.sin(seed * (i + 1) * 0.001) * 10000;
    embedding.push((x - Math.floor(x)) * 2 - 1); // Range: -1 to 1
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

function countTokens(text) {
  // Simple approximation: ~4 chars per token
  return Math.ceil(text.length / 4);
}

function visualizeEmbedding(embedding) {
  const vectorBars = document.getElementById('vector-bars');
  vectorBars.innerHTML = '';

  const displayDims = 50;
  const maxHeight = 40;

  for (let i = 0; i < displayDims; i++) {
    const value = embedding[i];
    const bar = document.createElement('div');
    bar.className = 'vector-bar' + (value < 0 ? ' negative' : '');
    bar.style.height = `${Math.abs(value) * maxHeight + 5}px`;
    bar.title = `Dim ${i}: ${value.toFixed(4)}`;
    vectorBars.appendChild(bar);
  }
}

function updateRawVector(embedding) {
  const display = embedding.slice(0, 20).map(v => v.toFixed(4)).join(', ');
  document.getElementById('raw-vector-output').textContent = `[${display}, ...]`;
}

document.getElementById('generate-embedding')?.addEventListener('click', () => {
  const text = document.getElementById('embedding-input').value;
  if (!text.trim()) return;

  const embedding = generateSimulatedEmbedding(text);

  document.getElementById('token-count').textContent = countTokens(text);
  visualizeEmbedding(embedding);
  updateRawVector(embedding);
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const initialText = document.getElementById('embedding-input')?.value;
  if (initialText) {
    const embedding = generateSimulatedEmbedding(initialText);
    visualizeEmbedding(embedding);
    updateRawVector(embedding);
  }
});

// ═══════════════════════════════════════════════════════════════
// Tab 2: Similarity Calculator
// ═══════════════════════════════════════════════════════════════

function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function calculateAllSimilarities() {
  const query = document.getElementById('query-input').value;
  const queryEmbedding = generateSimulatedEmbedding(query);

  const documents = [];
  document.querySelectorAll('.doc-input').forEach(input => {
    const text = input.value;
    const embedding = generateSimulatedEmbedding(text);
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    documents.push({ text, similarity });
  });

  // Sort by similarity (descending)
  documents.sort((a, b) => b.similarity - a.similarity);

  // Display results
  const resultBars = document.querySelector('.result-bars');
  resultBars.innerHTML = '';

  documents.forEach((doc, idx) => {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
      <div class="result-text">${escapeHtml(doc.text)}</div>
      <div class="result-score">
        <div class="score-bar">
          <div class="score-fill" style="width: ${doc.similarity * 100}%"></div>
        </div>
        <span class="score-value">${doc.similarity.toFixed(3)}</span>
      </div>
    `;
    resultBars.appendChild(item);
  });
}

document.getElementById('calculate-similarity')?.addEventListener('click', calculateAllSimilarities);

// ═══════════════════════════════════════════════════════════════
// Tab 3: Collection Designer
// ═══════════════════════════════════════════════════════════════

const defaultProperties = [
  { name: 'content', type: 'TEXT' },
  { name: 'role', type: 'TEXT' },
  { name: 'user_id', type: 'TEXT' },
  { name: 'timestamp', type: 'DATE' }
];

let properties = [...defaultProperties];

function renderProperties() {
  const list = document.getElementById('properties-list');
  list.innerHTML = '';

  properties.forEach((prop, idx) => {
    const row = document.createElement('div');
    row.className = 'property-row';
    row.innerHTML = `
      <input type="text" value="${prop.name}" placeholder="Property name" data-idx="${idx}" class="prop-name">
      <select data-idx="${idx}" class="prop-type">
        <option value="TEXT" ${prop.type === 'TEXT' ? 'selected' : ''}>TEXT</option>
        <option value="INT" ${prop.type === 'INT' ? 'selected' : ''}>INT</option>
        <option value="NUMBER" ${prop.type === 'NUMBER' ? 'selected' : ''}>NUMBER</option>
        <option value="BOOLEAN" ${prop.type === 'BOOLEAN' ? 'selected' : ''}>BOOLEAN</option>
        <option value="DATE" ${prop.type === 'DATE' ? 'selected' : ''}>DATE</option>
        <option value="UUID" ${prop.type === 'UUID' ? 'selected' : ''}>UUID</option>
      </select>
      <button class="remove-property" data-idx="${idx}">&times;</button>
    `;
    list.appendChild(row);
  });

  // Update event listeners
  list.querySelectorAll('.prop-name').forEach(input => {
    input.addEventListener('change', (e) => {
      properties[e.target.dataset.idx].name = e.target.value;
      generateCollectionCode();
    });
  });

  list.querySelectorAll('.prop-type').forEach(select => {
    select.addEventListener('change', (e) => {
      properties[e.target.dataset.idx].type = e.target.value;
      generateCollectionCode();
    });
  });

  list.querySelectorAll('.remove-property').forEach(btn => {
    btn.addEventListener('click', (e) => {
      properties.splice(e.target.dataset.idx, 1);
      renderProperties();
      generateCollectionCode();
    });
  });
}

function generateCollectionCode() {
  const name = document.getElementById('collection-name').value || 'MyCollection';
  const vectorizer = document.getElementById('vectorizer-select').value;

  let vectorizerConfig = '';
  if (vectorizer === 'text2vec-openai') {
    vectorizerConfig = `vectorizer_config=Configure.Vectorizer.text2vec_openai(
        model="text-embedding-3-small"
    ),`;
  } else if (vectorizer === 'text2vec-cohere') {
    vectorizerConfig = `vectorizer_config=Configure.Vectorizer.text2vec_cohere(
        model="embed-english-v3.0"
    ),`;
  } else if (vectorizer === 'text2vec-huggingface') {
    vectorizerConfig = `vectorizer_config=Configure.Vectorizer.text2vec_huggingface(
        model="sentence-transformers/all-MiniLM-L6-v2"
    ),`;
  } else {
    vectorizerConfig = '# No vectorizer - bring your own vectors';
  }

  const propsCode = properties.map(p =>
    `        Property(name="${p.name}", data_type=DataType.${p.type}),`
  ).join('\n');

  const code = `from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    name="${name}",
    ${vectorizerConfig}
    properties=[
${propsCode}
    ]
)

print(f"Collection '${name}' created successfully!")`;

  document.getElementById('collection-code').textContent = code;
}

document.getElementById('add-property')?.addEventListener('click', () => {
  properties.push({ name: 'new_property', type: 'TEXT' });
  renderProperties();
  generateCollectionCode();
});

document.getElementById('collection-name')?.addEventListener('input', generateCollectionCode);
document.getElementById('vectorizer-select')?.addEventListener('change', generateCollectionCode);

document.getElementById('copy-collection-code')?.addEventListener('click', () => {
  const code = document.getElementById('collection-code').textContent;
  copyToClipboard(code, 'copy-collection-code');
});

// Initialize collections tab
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('properties-list')) {
    renderProperties();
    generateCollectionCode();
  }
});

// ═══════════════════════════════════════════════════════════════
// Tab 4: Search Comparison
// ═══════════════════════════════════════════════════════════════

const sampleDocuments = [
  { id: 1, title: "Python asyncio tutorial", content: "Learn how to write concurrent code with Python's asyncio module and async/await syntax." },
  { id: 2, title: "Debugging Python errors", content: "Tips for debugging Python exceptions, using print statements, breakpoints, and pdb." },
  { id: 3, title: "JavaScript promises guide", content: "Understanding JavaScript Promises, async functions, and handling asynchronous operations." },
  { id: 4, title: "Python threading basics", content: "Introduction to multithreading in Python using the threading module for parallel execution." },
  { id: 5, title: "Best restaurants NYC", content: "Top 10 restaurants in New York City for fine dining and casual eats." },
  { id: 6, title: "Python concurrency patterns", content: "Advanced patterns for concurrent programming including futures, executors, and event loops." },
  { id: 7, title: "Web scraping with Python", content: "How to scrape websites using BeautifulSoup and requests library in Python." },
  { id: 8, title: "Parallel processing guide", content: "Running multiple tasks simultaneously using multiprocessing and concurrent.futures." }
];

// Pre-compute embeddings for documents
const documentEmbeddings = sampleDocuments.map(doc =>
  generateSimulatedEmbedding(doc.title + ' ' + doc.content)
);

function keywordSearch(query, docs) {
  const queryTerms = query.toLowerCase().split(/\s+/);

  return docs.map((doc, idx) => {
    const text = (doc.title + ' ' + doc.content).toLowerCase();
    let score = 0;

    queryTerms.forEach(term => {
      const regex = new RegExp(term, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

    return { ...doc, score, idx };
  })
  .filter(d => d.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);
}

function semanticSearch(query, docs, embeddings) {
  const queryEmbedding = generateSimulatedEmbedding(query);

  return docs.map((doc, idx) => {
    const similarity = cosineSimilarity(queryEmbedding, embeddings[idx]);
    return { ...doc, score: similarity, idx };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);
}

function hybridSearch(query, docs, embeddings, alpha = 0.5) {
  const keywordResults = keywordSearch(query, docs);
  const semanticResults = semanticSearch(query, docs, embeddings);

  // Combine scores using RRF (Reciprocal Rank Fusion)
  const scores = {};

  keywordResults.forEach((doc, rank) => {
    scores[doc.idx] = scores[doc.idx] || { doc, keywordScore: 0, semanticScore: 0 };
    scores[doc.idx].keywordScore = 1 / (rank + 60); // RRF constant = 60
  });

  semanticResults.forEach((doc, rank) => {
    scores[doc.idx] = scores[doc.idx] || { doc, keywordScore: 0, semanticScore: 0 };
    scores[doc.idx].semanticScore = 1 / (rank + 60);
  });

  return Object.values(scores)
    .map(item => ({
      ...item.doc,
      score: (1 - alpha) * item.keywordScore + alpha * item.semanticScore
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function displaySearchResults(containerId, results, isKeyword = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = '<div class="search-result-item">No results found</div>';
    return;
  }

  results.forEach((doc, idx) => {
    const item = document.createElement('div');
    item.className = 'search-result-item' + (idx === 0 ? ' highlight' : '');
    item.innerHTML = `
      <div class="title">${escapeHtml(doc.title)}</div>
      <div class="score">${isKeyword ? `matches: ${doc.score}` : `score: ${doc.score.toFixed(4)}`}</div>
    `;
    container.appendChild(item);
  });
}

document.getElementById('run-search')?.addEventListener('click', () => {
  const query = document.getElementById('search-query').value;

  const keywordResults = keywordSearch(query, sampleDocuments);
  const semanticResults = semanticSearch(query, sampleDocuments, documentEmbeddings);
  const hybridResults = hybridSearch(query, sampleDocuments, documentEmbeddings);

  displaySearchResults('keyword-results', keywordResults, true);
  displaySearchResults('semantic-results', semanticResults);
  displaySearchResults('hybrid-results', hybridResults);
});

// Dataset modal
document.getElementById('show-dataset')?.addEventListener('click', () => {
  const modal = document.getElementById('dataset-modal');
  const list = document.getElementById('dataset-list');

  list.innerHTML = '';
  sampleDocuments.forEach(doc => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${escapeHtml(doc.title)}</strong><br>${escapeHtml(doc.content)}`;
    list.appendChild(li);
  });

  modal.classList.remove('hidden');
});

document.querySelector('.close-modal')?.addEventListener('click', () => {
  document.getElementById('dataset-modal').classList.add('hidden');
});

document.getElementById('dataset-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'dataset-modal') {
    e.target.classList.add('hidden');
  }
});

// ═══════════════════════════════════════════════════════════════
// Tab 5: Code Builder
// ═══════════════════════════════════════════════════════════════

function generateBuilderCode() {
  const connectionType = document.querySelector('input[name="connection"]:checked')?.value || 'cloud';
  const collectionName = document.getElementById('builder-collection')?.value || 'Memory';
  const includeCreate = document.getElementById('include-create')?.checked;
  const includeInsert = document.getElementById('include-insert')?.checked;
  const includeQuery = document.getElementById('include-query')?.checked;
  const queryType = document.getElementById('query-type')?.value || 'hybrid';

  let code = `import weaviate
from weaviate.classes.init import Auth
`;

  if (includeCreate) {
    code += `from weaviate.classes.config import Configure, Property, DataType
`;
  }

  if (includeQuery) {
    code += `from weaviate.classes.query import MetadataQuery, Filter
`;
  }

  code += `from datetime import datetime

# ─── Connection ───────────────────────────────────────────────
`;

  if (connectionType === 'cloud') {
    code += `client = weaviate.connect_to_weaviate_cloud(
    cluster_url="https://your-cluster-id.weaviate.network",
    auth_credentials=Auth.api_key("your-weaviate-api-key"),
    headers={
        "X-OpenAI-Api-Key": "your-openai-api-key"
    }
)
`;
  } else {
    code += `client = weaviate.connect_to_local(
    host="localhost",
    port=8080,
    headers={
        "X-OpenAI-Api-Key": "your-openai-api-key"
    }
)
`;
  }

  code += `
print(f"Connected: {client.is_ready()}")
`;

  if (includeCreate) {
    code += `
# ─── Create Collection ────────────────────────────────────────
if not client.collections.exists("${collectionName}"):
    client.collections.create(
        name="${collectionName}",
        vectorizer_config=Configure.Vectorizer.text2vec_openai(
            model="text-embedding-3-small"
        ),
        properties=[
            Property(name="content", data_type=DataType.TEXT),
            Property(name="role", data_type=DataType.TEXT),
            Property(name="user_id", data_type=DataType.TEXT),
            Property(name="timestamp", data_type=DataType.DATE),
        ]
    )
    print("Collection created!")
`;
  }

  if (includeInsert) {
    code += `
# ─── Insert Data ──────────────────────────────────────────────
collection = client.collections.get("${collectionName}")

# Single insert
collection.data.insert({
    "content": "User asked about Python async programming",
    "role": "user",
    "user_id": "user-123",
    "timestamp": datetime.now()
})

# Batch insert (faster for multiple items)
items = [
    {"content": "Explained asyncio basics", "role": "assistant", "user_id": "user-123", "timestamp": datetime.now()},
    {"content": "Asked about error handling", "role": "user", "user_id": "user-123", "timestamp": datetime.now()},
]

with collection.batch.dynamic() as batch:
    for item in items:
        batch.add_object(properties=item)

print(f"Inserted {len(items) + 1} items")
`;
  }

  if (includeQuery) {
    code += `
# ─── Query Data ───────────────────────────────────────────────
collection = client.collections.get("${collectionName}")

`;

    if (queryType === 'hybrid') {
      code += `# Hybrid search (recommended for RAG)
response = collection.query.hybrid(
    query="How do I handle concurrent operations?",
    limit=5,
    alpha=0.6,  # 0 = keyword only, 1 = vector only
    filters=Filter.by_property("user_id").equal("user-123"),
    return_metadata=MetadataQuery(score=True)
)
`;
    } else if (queryType === 'near_text') {
      code += `# Semantic search (vector similarity)
response = collection.query.near_text(
    query="How do I handle concurrent operations?",
    limit=5,
    filters=Filter.by_property("user_id").equal("user-123"),
    return_metadata=MetadataQuery(distance=True)
)
`;
    } else {
      code += `# Keyword search (BM25)
response = collection.query.bm25(
    query="concurrent operations Python",
    limit=5,
    filters=Filter.by_property("user_id").equal("user-123"),
    return_metadata=MetadataQuery(score=True)
)
`;
    }

    code += `
for obj in response.objects:
    print(f"Content: {obj.properties['content']}")
    print(f"Role: {obj.properties['role']}")
    print("---")
`;
  }

  code += `
# ─── Cleanup ──────────────────────────────────────────────────
client.close()
`;

  document.getElementById('builder-output').textContent = code;
}

// Event listeners for code builder
document.querySelectorAll('input[name="connection"]').forEach(radio => {
  radio.addEventListener('change', generateBuilderCode);
});

document.getElementById('builder-collection')?.addEventListener('input', generateBuilderCode);
document.getElementById('include-create')?.addEventListener('change', generateBuilderCode);
document.getElementById('include-insert')?.addEventListener('change', generateBuilderCode);
document.getElementById('include-query')?.addEventListener('change', generateBuilderCode);
document.getElementById('query-type')?.addEventListener('change', generateBuilderCode);
document.getElementById('generate-code')?.addEventListener('click', generateBuilderCode);

document.getElementById('copy-builder-code')?.addEventListener('click', () => {
  const code = document.getElementById('builder-output').textContent;
  copyToClipboard(code, 'copy-builder-code');
});

// Initialize code builder on load
document.addEventListener('DOMContentLoaded', generateBuilderCode);

// ═══════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyToClipboard(text, buttonId) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(buttonId);
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
  });
}
