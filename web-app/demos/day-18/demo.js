// ============================================
// Day 18: Semantic Caching Demo
// ============================================

// Simulated embedding cache (in real app, use actual embeddings)
const embeddingCache = new Map();

// Sample pre-computed "embeddings" (normalized similarity scores for demo)
const sampleQueries = {
  "What is the capital of France?": {
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
    response: "The capital of France is Paris. Paris is the largest city in France and serves as the country's political, economic, and cultural center."
  },
  "What's France's capital city?": {
    embedding: [0.11, 0.19, 0.31, 0.39, 0.51],
    response: null // Will use cached response
  },
  "Tell me the capital of France": {
    embedding: [0.09, 0.21, 0.29, 0.41, 0.49],
    response: null
  },
  "Which city is the capital of France?": {
    embedding: [0.12, 0.18, 0.32, 0.38, 0.52],
    response: null
  },
  "What is the capital of Germany?": {
    embedding: [0.1, 0.2, 0.3, 0.8, 0.1],
    response: "The capital of Germany is Berlin. Berlin is the largest city in Germany and one of the most important cultural and political centers in Europe."
  },
  "How do I make pasta?": {
    embedding: [0.9, 0.1, 0.8, 0.2, 0.7],
    response: "To make pasta: 1) Boil salted water, 2) Add pasta and cook until al dente, 3) Drain and toss with your favorite sauce. Common sauces include marinara, alfredo, or pesto."
  },
  "What is machine learning?": {
    embedding: [0.3, 0.7, 0.4, 0.6, 0.5],
    response: "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves."
  },
  "Explain ML to me": {
    embedding: [0.31, 0.69, 0.41, 0.59, 0.51],
    response: null
  },
  "What is AI?": {
    embedding: [0.35, 0.65, 0.45, 0.55, 0.5],
    response: "Artificial Intelligence (AI) is the simulation of human intelligence by machines. It includes capabilities like learning, reasoning, problem-solving, perception, and language understanding."
  },
  "What is the weather today?": {
    embedding: [0.5, 0.5, 0.1, 0.1, 0.9],
    response: "I don't have access to real-time weather data. Please check a weather service like Weather.com or your local weather app for current conditions."
  },
  "How's the weather looking?": {
    embedding: [0.51, 0.49, 0.11, 0.09, 0.89],
    response: null
  },
  "What is Python?": {
    embedding: [0.2, 0.8, 0.3, 0.7, 0.4],
    response: "Python is a high-level, interpreted programming language known for its clear syntax and readability. It's widely used in web development, data science, AI/ML, automation, and scientific computing."
  },
  "Explain the Python programming language": {
    embedding: [0.21, 0.79, 0.31, 0.69, 0.41],
    response: null
  },
  "Best restaurants in NYC": {
    embedding: [0.6, 0.3, 0.7, 0.2, 0.8],
    response: "Some top-rated restaurants in NYC include: Le Bernardin (French seafood), Eleven Madison Park (fine dining), Katz's Delicatessen (classic deli), and Peter Luger (steakhouse)."
  },
  "Good places to eat in New York": {
    embedding: [0.59, 0.31, 0.69, 0.21, 0.79],
    response: null
  },
  "How do I cook rice?": {
    embedding: [0.85, 0.15, 0.75, 0.25, 0.65],
    response: "To cook rice: 1) Rinse rice under cold water, 2) Use a 1:2 ratio of rice to water, 3) Bring to boil, then reduce heat and simmer covered for 18-20 minutes, 4) Let rest 5 minutes before fluffing."
  }
};

// Semantic cache state
const cache = [];
let stats = {
  totalQueries: 0,
  hits: 0,
  misses: 0,
  costSaved: 0,
  timeSaved: 0
};

// Constants
const LLM_COST_PER_QUERY = 0.003; // ~$0.003 per query estimate
const LLM_LATENCY_MS = 1500; // Average LLM response time
const CACHE_LATENCY_MS = 5; // Redis lookup time

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

// Calculate cosine similarity between two vectors
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;

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

// Get embedding for a query (simulated)
function getEmbedding(query) {
  // Check if we have a pre-computed embedding
  const normalized = query.trim();
  if (sampleQueries[normalized]) {
    return sampleQueries[normalized].embedding;
  }

  // Generate a pseudo-random embedding based on query hash
  const hash = query.split('').reduce((acc, char, i) => {
    return acc + char.charCodeAt(0) * (i + 1);
  }, 0);

  return [
    (hash % 100) / 100,
    ((hash * 2) % 100) / 100,
    ((hash * 3) % 100) / 100,
    ((hash * 4) % 100) / 100,
    ((hash * 5) % 100) / 100
  ];
}

// Find best cache match
function findCacheMatch(queryEmbedding, threshold) {
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of cache) {
    const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatch = entry;
    }
  }

  if (bestScore >= threshold) {
    return { match: bestMatch, score: bestScore };
  }

  return { match: null, score: bestScore };
}

// Get LLM response (simulated)
function getLLMResponse(query) {
  const normalized = query.trim();
  if (sampleQueries[normalized] && sampleQueries[normalized].response) {
    return sampleQueries[normalized].response;
  }

  // Generic response for unknown queries
  return `This is a simulated LLM response for: "${query}". In a real implementation, this would call an actual LLM API like OpenAI or Anthropic.`;
}

// Initialize cache simulator
function initCacheSimulator() {
  const queryInput = document.getElementById('query-input');
  const submitBtn = document.getElementById('submit-query');
  const clearBtn = document.getElementById('clear-cache');
  const thresholdSlider = document.getElementById('threshold-slider');
  const thresholdValue = document.getElementById('threshold-value');
  const queryChips = document.querySelectorAll('.query-chip');

  // Threshold slider
  thresholdSlider.addEventListener('input', () => {
    thresholdValue.textContent = thresholdSlider.value;
  });

  // Query chips
  queryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      queryInput.value = chip.dataset.query;
    });
  });

  // Submit query
  submitBtn.addEventListener('click', () => {
    const query = queryInput.value.trim();
    if (!query) return;

    const threshold = parseFloat(thresholdSlider.value);
    processQuery(query, threshold);
  });

  // Clear cache
  clearBtn.addEventListener('click', () => {
    cache.length = 0;
    stats = { totalQueries: 0, hits: 0, misses: 0, costSaved: 0, timeSaved: 0 };
    updateStatsDisplay();
    updateCacheTable();
    document.getElementById('cache-status').innerHTML = `
      <span class="status-icon">&#10067;</span>
      <span class="status-text">Cache cleared. Waiting for query...</span>
    `;
    document.getElementById('cache-status').className = 'status-indicator';
    document.getElementById('cache-details').innerHTML = '';
    document.getElementById('response-content').innerHTML = '<p class="placeholder-text">Submit a query to see the response...</p>';
  });

  // Enter key to submit
  queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitBtn.click();
    }
  });
}

// Process a query through the cache
function processQuery(query, threshold) {
  const cacheStatus = document.getElementById('cache-status');
  const cacheDetails = document.getElementById('cache-details');
  const responseContent = document.getElementById('response-content');

  stats.totalQueries++;

  // Get query embedding
  const queryEmbedding = getEmbedding(query);

  // Check cache
  const { match, score } = findCacheMatch(queryEmbedding, threshold);

  if (match) {
    // Cache HIT
    stats.hits++;
    stats.costSaved += LLM_COST_PER_QUERY;
    stats.timeSaved += (LLM_LATENCY_MS - CACHE_LATENCY_MS);

    cacheStatus.className = 'status-indicator hit';
    cacheStatus.innerHTML = `
      <span class="status-icon">&#10003;</span>
      <span class="status-text">CACHE HIT</span>
    `;

    cacheDetails.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Similarity Score:</span>
        <span class="detail-value">${score.toFixed(4)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Threshold:</span>
        <span class="detail-value">${threshold}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Matched Query:</span>
        <span class="detail-value">"${match.query.substring(0, 40)}${match.query.length > 40 ? '...' : ''}"</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Response Time:</span>
        <span class="detail-value highlight">${CACHE_LATENCY_MS}ms (saved ${LLM_LATENCY_MS - CACHE_LATENCY_MS}ms)</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Cost:</span>
        <span class="detail-value highlight">$0.00 (saved $${LLM_COST_PER_QUERY.toFixed(4)})</span>
      </div>
    `;

    responseContent.innerHTML = `
      <div class="response-source">From Cache</div>
      <div class="response-text">${match.response}</div>
    `;
  } else {
    // Cache MISS
    stats.misses++;

    const response = getLLMResponse(query);

    // Add to cache
    cache.push({
      id: cache.length + 1,
      query: query,
      embedding: queryEmbedding,
      response: response,
      timestamp: new Date().toISOString()
    });

    cacheStatus.className = 'status-indicator miss';
    cacheStatus.innerHTML = `
      <span class="status-icon">&#10007;</span>
      <span class="status-text">CACHE MISS</span>
    `;

    cacheDetails.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Best Similarity:</span>
        <span class="detail-value">${cache.length > 1 ? score.toFixed(4) : 'N/A (empty cache)'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Threshold:</span>
        <span class="detail-value">${threshold}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Action:</span>
        <span class="detail-value">Called LLM & cached response</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Response Time:</span>
        <span class="detail-value">${LLM_LATENCY_MS}ms</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Cost:</span>
        <span class="detail-value">$${LLM_COST_PER_QUERY.toFixed(4)}</span>
      </div>
    `;

    responseContent.innerHTML = `
      <div class="response-source">From LLM (Cached)</div>
      <div class="response-text">${response}</div>
    `;
  }

  updateStatsDisplay();
  updateCacheTable();
}

// Update statistics display
function updateStatsDisplay() {
  document.getElementById('total-queries').textContent = stats.totalQueries;
  document.getElementById('cache-hits').textContent = stats.hits;
  document.getElementById('cache-misses').textContent = stats.misses;
  document.getElementById('hit-rate').textContent = stats.totalQueries > 0
    ? `${((stats.hits / stats.totalQueries) * 100).toFixed(1)}%`
    : '0%';
  document.getElementById('cost-saved').textContent = `$${stats.costSaved.toFixed(2)}`;
  document.getElementById('time-saved').textContent = `${stats.timeSaved}ms`;
}

// Update cache table
function updateCacheTable() {
  const cacheTable = document.getElementById('cache-table');
  const cacheSize = document.getElementById('cache-size');

  cacheSize.textContent = cache.length;

  if (cache.length === 0) {
    cacheTable.innerHTML = '<p class="placeholder-text">Cache is empty. Submit queries to populate.</p>';
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Query</th>
          <th>Response Preview</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
  `;

  cache.forEach((entry, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${entry.query.substring(0, 50)}${entry.query.length > 50 ? '...' : ''}</td>
        <td>${entry.response.substring(0, 60)}...</td>
        <td>${new Date(entry.timestamp).toLocaleTimeString()}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  cacheTable.innerHTML = html;
}

// Initialize similarity explorer
function initSimilarityExplorer() {
  const compareBtn = document.getElementById('compare-queries');
  const queryA = document.getElementById('query-a');
  const queryB = document.getElementById('query-b');
  const examplePairs = document.querySelectorAll('.example-pair');
  const thresholdSlider = document.getElementById('threshold-slider');

  compareBtn.addEventListener('click', () => {
    const a = queryA.value.trim();
    const b = queryB.value.trim();
    if (!a || !b) return;

    const embeddingA = getEmbedding(a);
    const embeddingB = getEmbedding(b);
    const similarity = cosineSimilarity(embeddingA, embeddingB);
    const threshold = parseFloat(thresholdSlider.value);

    displaySimilarityResult(similarity, threshold);
  });

  examplePairs.forEach(pair => {
    pair.addEventListener('click', () => {
      queryA.value = pair.dataset.a;
      queryB.value = pair.dataset.b;
    });
  });
}

// Display similarity comparison result
function displaySimilarityResult(similarity, threshold) {
  const fill = document.getElementById('similarity-fill');
  const scoreDisplay = document.getElementById('similarity-score');
  const verdict = document.getElementById('cache-verdict');
  const meterThreshold = document.getElementById('meter-threshold');

  // Update meter
  fill.style.width = `${similarity * 100}%`;

  // Color based on similarity
  if (similarity >= threshold) {
    fill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
  } else if (similarity >= 0.7) {
    fill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
  } else {
    fill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
  }

  // Update threshold marker position
  meterThreshold.style.left = `${threshold * 100}%`;

  // Update score
  scoreDisplay.textContent = similarity.toFixed(4);

  // Update verdict
  if (similarity >= threshold) {
    verdict.className = 'cache-verdict hit';
    verdict.innerHTML = `
      <span class="verdict-icon">&#10003;</span>
      <span class="verdict-text">CACHE HIT - Similarity ${similarity.toFixed(4)} >= threshold ${threshold}</span>
    `;
  } else {
    verdict.className = 'cache-verdict miss';
    verdict.innerHTML = `
      <span class="verdict-icon">&#10007;</span>
      <span class="verdict-text">CACHE MISS - Similarity ${similarity.toFixed(4)} < threshold ${threshold}</span>
    `;
  }
}

// Initialize code builder
function initCodeBuilder() {
  const options = document.querySelectorAll('#builder select, #builder input');
  const codeOutput = document.getElementById('generated-code');
  const copyBtn = document.getElementById('copy-code');
  const embeddingModel = document.getElementById('embedding-model');
  const localModelOption = document.getElementById('local-model-option');
  const addTtl = document.getElementById('add-ttl');
  const ttlOption = document.getElementById('ttl-option');

  function updateCode() {
    const code = generateCode();
    codeOutput.querySelector('code').textContent = code;
  }

  // Show/hide local model option
  embeddingModel.addEventListener('change', () => {
    localModelOption.style.display = embeddingModel.value === 'local' ? 'block' : 'none';
    updateCode();
  });

  // Show/hide TTL option
  addTtl.addEventListener('change', () => {
    ttlOption.style.display = addTtl.checked ? 'block' : 'none';
    updateCode();
  });

  options.forEach(opt => {
    opt.addEventListener('change', updateCode);
    opt.addEventListener('input', updateCode);
  });

  copyBtn.addEventListener('click', () => {
    const code = codeOutput.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      copyBtn.innerHTML = '<span>&#10003;</span> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<span>&#128203;</span> Copy';
      }, 2000);
    });
  });

  updateCode();
}

// Generate code based on options
function generateCode() {
  const library = document.getElementById('cache-library').value;
  const embeddingModel = document.getElementById('embedding-model').value;
  const localModel = document.getElementById('local-model').value;
  const redisInstance = document.getElementById('redis-instance').value;
  const redisAuth = document.getElementById('redis-auth').value;
  const threshold = document.getElementById('code-threshold').value;
  const addTtl = document.getElementById('add-ttl').checked;
  const ttlDuration = document.getElementById('ttl-duration').value;
  const addFallback = document.getElementById('add-fallback').checked;
  const addStats = document.getElementById('add-stats').checked;
  const addLogging = document.getElementById('add-logging').checked;

  if (library === 'langchain') {
    return generateLangChainCode(embeddingModel, localModel, redisInstance, redisAuth, threshold, addTtl, ttlDuration, addStats, addLogging);
  } else if (library === 'gptcache') {
    return generateGPTCacheCode(embeddingModel, localModel, redisInstance, redisAuth, threshold, addTtl, ttlDuration, addStats, addLogging);
  } else {
    return generateCustomCode(embeddingModel, localModel, redisInstance, redisAuth, threshold, addTtl, ttlDuration, addFallback, addStats, addLogging);
  }
}

function generateLangChainCode(embedding, localModel, redis, auth, threshold, ttl, ttlDuration, stats, logging) {
  let code = `"""
Semantic Caching with LangChain
Generated for Day 18: Semantic Caching for Agents
"""

`;

  // Imports
  code += `from langchain_community.cache import RedisSemanticCache\n`;
  code += `from langchain.globals import set_llm_cache\n`;

  if (embedding === 'openai' || embedding === 'openai-large') {
    code += `from langchain_openai import OpenAIEmbeddings, ChatOpenAI\n`;
  } else if (embedding === 'cohere') {
    code += `from langchain_cohere import CohereEmbeddings\n`;
    code += `from langchain_openai import ChatOpenAI\n`;
  } else {
    code += `from langchain_community.embeddings import HuggingFaceEmbeddings\n`;
    code += `from langchain_openai import ChatOpenAI\n`;
  }

  if (logging) {
    code += `import logging\n`;
  }
  if (auth === 'env') {
    code += `import os\n`;
  }

  code += `\n`;

  // Logging setup
  if (logging) {
    code += `# Configure logging\n`;
    code += `logging.basicConfig(level=logging.INFO)\n`;
    code += `logger = logging.getLogger(__name__)\n\n`;
  }

  // Redis URL
  code += `# Redis configuration\n`;
  if (auth === 'env') {
    code += `REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")\n\n`;
  } else if (redis === 'cloud') {
    code += `REDIS_URL = "redis://default:your-password@your-instance.redis.cloud:6379"\n\n`;
  } else if (redis === 'docker') {
    code += `REDIS_URL = "redis://redis:6379"\n\n`;
  } else {
    code += `REDIS_URL = "redis://localhost:6379"\n\n`;
  }

  // Embeddings
  code += `# Initialize embeddings\n`;
  if (embedding === 'openai') {
    code += `embeddings = OpenAIEmbeddings(model="text-embedding-3-small")\n\n`;
  } else if (embedding === 'openai-large') {
    code += `embeddings = OpenAIEmbeddings(model="text-embedding-3-large")\n\n`;
  } else if (embedding === 'cohere') {
    code += `embeddings = CohereEmbeddings(model="embed-english-v3.0")\n\n`;
  } else {
    code += `embeddings = HuggingFaceEmbeddings(\n`;
    code += `    model_name="sentence-transformers/${localModel}"\n`;
    code += `)\n\n`;
  }

  // Cache setup
  code += `# Configure semantic cache\n`;
  code += `cache = RedisSemanticCache(\n`;
  code += `    redis_url=REDIS_URL,\n`;
  code += `    embedding=embeddings,\n`;
  code += `    score_threshold=${threshold}\n`;
  code += `)\n\n`;

  code += `# Set as global cache\n`;
  code += `set_llm_cache(cache)\n\n`;

  // LLM setup
  code += `# Initialize LLM (caching is automatic)\n`;
  code += `llm = ChatOpenAI(model="gpt-4o", temperature=0)\n\n`;

  // Usage
  code += `# Example usage\n`;
  code += `def query_with_cache(question: str) -> str:\n`;
  code += `    """Query LLM with automatic semantic caching."""\n`;
  if (logging) {
    code += `    logger.info(f"Processing query: {question}")\n`;
  }
  code += `    response = llm.invoke(question)\n`;
  if (logging) {
    code += `    logger.info("Response received (check logs for cache hit/miss)")\n`;
  }
  code += `    return response.content\n\n`;

  if (stats) {
    code += `# Cache statistics (manual tracking)\n`;
    code += `class CacheStats:\n`;
    code += `    def __init__(self):\n`;
    code += `        self.hits = 0\n`;
    code += `        self.misses = 0\n`;
    code += `    \n`;
    code += `    def record_hit(self):\n`;
    code += `        self.hits += 1\n`;
    code += `    \n`;
    code += `    def record_miss(self):\n`;
    code += `        self.misses += 1\n`;
    code += `    \n`;
    code += `    @property\n`;
    code += `    def hit_rate(self):\n`;
    code += `        total = self.hits + self.misses\n`;
    code += `        return self.hits / total if total > 0 else 0\n\n`;
    code += `stats = CacheStats()\n\n`;
  }

  code += `\nif __name__ == "__main__":\n`;
  code += `    # First query - cache miss\n`;
  code += `    response1 = query_with_cache("What is machine learning?")\n`;
  code += `    print(f"Response 1: {response1[:100]}...")\n\n`;
  code += `    # Similar query - should be cache hit\n`;
  code += `    response2 = query_with_cache("Explain ML to me")\n`;
  code += `    print(f"Response 2: {response2[:100]}...")\n`;

  return code;
}

function generateGPTCacheCode(embedding, localModel, redis, auth, threshold, ttl, ttlDuration, stats, logging) {
  let code = `"""
Semantic Caching with GPTCache
Generated for Day 18: Semantic Caching for Agents
"""

from gptcache import cache
from gptcache.manager import CacheBase, VectorBase, get_data_manager
from gptcache.similarity_evaluation import SearchDistanceEvaluation
`;

  // Embedding imports
  if (embedding === 'openai' || embedding === 'openai-large') {
    code += `from gptcache.embedding import OpenAI as OpenAIEmbedding\n`;
  } else if (embedding === 'local') {
    code += `from gptcache.embedding import Huggingface\n`;
  }

  code += `from gptcache.adapter import openai\n`;
  if (logging) {
    code += `import logging\n`;
  }
  if (auth === 'env') {
    code += `import os\n`;
  }

  code += `\n`;

  if (logging) {
    code += `# Configure logging\n`;
    code += `logging.basicConfig(level=logging.INFO)\n`;
    code += `logger = logging.getLogger(__name__)\n\n`;
  }

  // Embedding setup
  code += `# Initialize embedding function\n`;
  if (embedding === 'openai') {
    code += `embedding = OpenAIEmbedding(model="text-embedding-3-small")\n`;
    code += `dimension = 1536\n\n`;
  } else if (embedding === 'openai-large') {
    code += `embedding = OpenAIEmbedding(model="text-embedding-3-large")\n`;
    code += `dimension = 3072\n\n`;
  } else {
    code += `embedding = Huggingface(model="sentence-transformers/${localModel}")\n`;
    const dims = {
      'all-MiniLM-L6-v2': 384,
      'all-mpnet-base-v2': 768,
      'bge-small-en-v1.5': 384
    };
    code += `dimension = ${dims[localModel] || 384}\n\n`;
  }

  // Redis config
  code += `# Redis configuration\n`;
  if (auth === 'env') {
    code += `redis_config = {\n`;
    code += `    "host": os.getenv("REDIS_HOST", "localhost"),\n`;
    code += `    "port": int(os.getenv("REDIS_PORT", 6379)),\n`;
    code += `    "password": os.getenv("REDIS_PASSWORD", None)\n`;
    code += `}\n\n`;
  } else if (redis === 'cloud') {
    code += `redis_config = {\n`;
    code += `    "host": "your-instance.redis.cloud",\n`;
    code += `    "port": 6379,\n`;
    code += `    "password": "your-password"\n`;
    code += `}\n\n`;
  } else {
    code += `redis_config = {"host": "localhost", "port": 6379}\n\n`;
  }

  // Data manager
  code += `# Initialize cache storage and vector store\n`;
  code += `cache_base = CacheBase("redis", redis_config=redis_config)\n`;
  code += `vector_base = VectorBase(\n`;
  code += `    "redis",\n`;
  code += `    dimension=dimension,\n`;
  code += `    redis_config=redis_config\n`;
  code += `)\n\n`;

  code += `data_manager = get_data_manager(cache_base, vector_base)\n\n`;

  // Similarity evaluation
  code += `# Similarity threshold (convert from similarity to distance)\n`;
  code += `# GPTCache uses distance, so threshold = 1 - similarity\n`;
  code += `distance_threshold = ${(1 - parseFloat(threshold)).toFixed(2)}\n`;
  code += `similarity_evaluation = SearchDistanceEvaluation()\n\n`;

  // Initialize cache
  code += `# Initialize GPTCache\n`;
  code += `cache.init(\n`;
  code += `    embedding_func=embedding.to_embeddings,\n`;
  code += `    data_manager=data_manager,\n`;
  code += `    similarity_evaluation=similarity_evaluation\n`;
  code += `)\n\n`;

  // Usage
  code += `def query_with_cache(question: str) -> str:\n`;
  code += `    """Query OpenAI with GPTCache semantic caching."""\n`;
  if (logging) {
    code += `    logger.info(f"Processing query: {question}")\n`;
  }
  code += `    response = openai.ChatCompletion.create(\n`;
  code += `        model="gpt-4o",\n`;
  code += `        messages=[{"role": "user", "content": question}]\n`;
  code += `    )\n`;
  if (logging) {
    code += `    logger.info(f"Cache stats - Hits: {cache.report.hint_cache_count}, Misses: {cache.report.miss_cache_count}")\n`;
  }
  code += `    return response.choices[0].message.content\n\n`;

  if (stats) {
    code += `def get_cache_stats():\n`;
    code += `    """Get cache hit/miss statistics."""\n`;
    code += `    return {\n`;
    code += `        "hits": cache.report.hint_cache_count,\n`;
    code += `        "misses": cache.report.miss_cache_count,\n`;
    code += `        "hit_rate": cache.report.hint_cache_count / \n`;
    code += `            max(1, cache.report.hint_cache_count + cache.report.miss_cache_count)\n`;
    code += `    }\n\n`;
  }

  code += `\nif __name__ == "__main__":\n`;
  code += `    # First query - cache miss\n`;
  code += `    response1 = query_with_cache("What is the capital of France?")\n`;
  code += `    print(f"Response 1: {response1}")\n\n`;
  code += `    # Similar query - should be cache hit\n`;
  code += `    response2 = query_with_cache("What's France's capital?")\n`;
  code += `    print(f"Response 2: {response2}")\n`;
  if (stats) {
    code += `\n    # Print stats\n`;
    code += `    print(f"Stats: {get_cache_stats()}")\n`;
  }

  return code;
}

function generateCustomCode(embedding, localModel, redis, auth, threshold, ttl, ttlDuration, fallback, stats, logging) {
  let code = `"""
Custom Semantic Cache with Redis
Generated for Day 18: Semantic Caching for Agents
"""

import redis
import numpy as np
import hashlib
import json
from typing import Optional, Dict, Any
`;

  if (embedding === 'openai' || embedding === 'openai-large') {
    code += `from openai import OpenAI\n`;
  } else if (embedding === 'local') {
    code += `from sentence_transformers import SentenceTransformer\n`;
  }

  if (logging) {
    code += `import logging\n`;
  }
  if (auth === 'env') {
    code += `import os\n`;
  }
  if (ttl) {
    code += `from datetime import datetime, timedelta\n`;
  }

  code += `\n`;

  if (logging) {
    code += `logging.basicConfig(level=logging.INFO)\n`;
    code += `logger = logging.getLogger(__name__)\n\n`;
  }

  code += `class SemanticCache:\n`;
  code += `    """Custom semantic cache using Redis vector search."""\n\n`;

  code += `    def __init__(self):\n`;

  // Redis connection
  if (auth === 'env') {
    code += `        self.redis = redis.Redis(\n`;
    code += `            host=os.getenv("REDIS_HOST", "localhost"),\n`;
    code += `            port=int(os.getenv("REDIS_PORT", 6379)),\n`;
    code += `            password=os.getenv("REDIS_PASSWORD"),\n`;
    code += `            decode_responses=True\n`;
    code += `        )\n`;
  } else if (redis === 'cloud') {
    code += `        self.redis = redis.Redis(\n`;
    code += `            host="your-instance.redis.cloud",\n`;
    code += `            port=6379,\n`;
    code += `            password="your-password",\n`;
    code += `            decode_responses=True\n`;
    code += `        )\n`;
  } else {
    code += `        self.redis = redis.Redis(host="localhost", port=6379, decode_responses=True)\n`;
  }

  code += `        self.threshold = ${threshold}\n`;
  if (ttl) {
    code += `        self.ttl = ${ttlDuration}  # seconds\n`;
  }
  code += `        self.index_name = "cache_idx"\n`;

  // Embedding model
  if (embedding === 'openai') {
    code += `        self.openai = OpenAI()\n`;
    code += `        self.model = "text-embedding-3-small"\n`;
    code += `        self.dimension = 1536\n`;
  } else if (embedding === 'openai-large') {
    code += `        self.openai = OpenAI()\n`;
    code += `        self.model = "text-embedding-3-large"\n`;
    code += `        self.dimension = 3072\n`;
  } else {
    code += `        self.model = SentenceTransformer("sentence-transformers/${localModel}")\n`;
    const dims = {
      'all-MiniLM-L6-v2': 384,
      'all-mpnet-base-v2': 768,
      'bge-small-en-v1.5': 384
    };
    code += `        self.dimension = ${dims[localModel] || 384}\n`;
  }

  if (stats) {
    code += `        self.stats = {"hits": 0, "misses": 0}\n`;
  }

  code += `        self._create_index()\n\n`;

  // Create index
  code += `    def _create_index(self):\n`;
  code += `        """Create Redis vector index if not exists."""\n`;
  code += `        try:\n`;
  code += `            self.redis.execute_command(\n`;
  code += `                "FT.CREATE", self.index_name, "ON", "HASH",\n`;
  code += `                "PREFIX", "1", "cache:",\n`;
  code += `                "SCHEMA",\n`;
  code += `                "query", "TEXT",\n`;
  code += `                "response", "TEXT",\n`;
  code += `                "embedding", "VECTOR", "HNSW", "6",\n`;
  code += `                "TYPE", "FLOAT32",\n`;
  code += `                "DIM", str(self.dimension),\n`;
  code += `                "DISTANCE_METRIC", "COSINE"\n`;
  code += `            )\n`;
  if (logging) {
    code += `            logger.info("Created vector index")\n`;
  }
  code += `        except redis.ResponseError as e:\n`;
  code += `            if "Index already exists" not in str(e):\n`;
  code += `                raise\n\n`;

  // Get embedding
  code += `    def _get_embedding(self, text: str) -> np.ndarray:\n`;
  code += `        """Get embedding vector for text."""\n`;
  if (embedding === 'openai' || embedding === 'openai-large') {
    code += `        response = self.openai.embeddings.create(\n`;
    code += `            model=self.model,\n`;
    code += `            input=text\n`;
    code += `        )\n`;
    code += `        return np.array(response.data[0].embedding, dtype=np.float32)\n\n`;
  } else {
    code += `        embedding = self.model.encode(text)\n`;
    code += `        return np.array(embedding, dtype=np.float32)\n\n`;
  }

  // Search cache
  code += `    def search(self, query: str) -> Optional[str]:\n`;
  code += `        """Search cache for similar query."""\n`;

  if (fallback) {
    code += `        # Check exact match first\n`;
    code += `        exact_key = f"exact:{hashlib.md5(query.lower().encode()).hexdigest()}"\n`;
    code += `        exact_match = self.redis.get(exact_key)\n`;
    code += `        if exact_match:\n`;
    if (stats) {
      code += `            self.stats["hits"] += 1\n`;
    }
    if (logging) {
      code += `            logger.info("Exact cache hit")\n`;
    }
    code += `            return exact_match\n\n`;
  }

  code += `        # Semantic search\n`;
  code += `        embedding = self._get_embedding(query)\n`;
  code += `        embedding_bytes = embedding.tobytes()\n\n`;

  code += `        results = self.redis.execute_command(\n`;
  code += `            "FT.SEARCH", self.index_name,\n`;
  code += `            f"*=>[KNN 1 @embedding $vec AS score]",\n`;
  code += `            "PARAMS", "2", "vec", embedding_bytes,\n`;
  code += `            "RETURN", "2", "response", "score",\n`;
  code += `            "DIALECT", "2"\n`;
  code += `        )\n\n`;

  code += `        if results[0] > 0:\n`;
  code += `            score = float(results[2][3])  # Cosine distance\n`;
  code += `            similarity = 1 - (score / 2)  # Convert to similarity\n`;
  code += `            if similarity >= self.threshold:\n`;
  if (stats) {
    code += `                self.stats["hits"] += 1\n`;
  }
  if (logging) {
    code += `                logger.info(f"Cache hit: similarity={similarity:.4f}")\n`;
  }
  code += `                return results[2][1]  # response\n\n`;

  if (stats) {
    code += `        self.stats["misses"] += 1\n`;
  }
  if (logging) {
    code += `        logger.info("Cache miss")\n`;
  }
  code += `        return None\n\n`;

  // Store in cache
  code += `    def store(self, query: str, response: str):\n`;
  code += `        """Store query-response pair in cache."""\n`;
  code += `        embedding = self._get_embedding(query)\n`;
  code += `        key = f"cache:{hashlib.md5(query.encode()).hexdigest()}"\n\n`;

  code += `        self.redis.hset(key, mapping={\n`;
  code += `            "query": query,\n`;
  code += `            "response": response,\n`;
  code += `            "embedding": embedding.tobytes()\n`;
  code += `        })\n`;

  if (ttl) {
    code += `        self.redis.expire(key, self.ttl)\n`;
  }

  if (fallback) {
    code += `\n        # Also store exact match key\n`;
    code += `        exact_key = f"exact:{hashlib.md5(query.lower().encode()).hexdigest()}"\n`;
    code += `        self.redis.set(exact_key, response`;
    if (ttl) {
      code += `, ex=self.ttl`;
    }
    code += `)\n`;
  }

  if (logging) {
    code += `        logger.info(f"Cached response for: {query[:50]}...")\n`;
  }
  code += `\n`;

  if (stats) {
    code += `    def get_stats(self) -> Dict[str, Any]:\n`;
    code += `        """Get cache statistics."""\n`;
    code += `        total = self.stats["hits"] + self.stats["misses"]\n`;
    code += `        return {\n`;
    code += `            **self.stats,\n`;
    code += `            "hit_rate": self.stats["hits"] / max(1, total)\n`;
    code += `        }\n\n`;
  }

  // Usage
  code += `\n# Usage example\n`;
  code += `if __name__ == "__main__":\n`;
  code += `    cache = SemanticCache()\n\n`;
  code += `    # Check cache first\n`;
  code += `    query = "What is machine learning?"\n`;
  code += `    cached = cache.search(query)\n\n`;
  code += `    if cached:\n`;
  code += `        print(f"From cache: {cached}")\n`;
  code += `    else:\n`;
  code += `        # Call LLM (replace with actual call)\n`;
  code += `        response = "Machine learning is a subset of AI..."\n`;
  code += `        cache.store(query, response)\n`;
  code += `        print(f"From LLM: {response}")\n`;
  if (stats) {
    code += `\n    print(f"Stats: {cache.get_stats()}")\n`;
  }

  return code;
}

// Initialize Redis commands copy buttons
function initRedisCommands() {
  const copyBtns = document.querySelectorAll('.command-section .copy-btn');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.parentElement.querySelector('code');
      const code = codeBlock.textContent;

      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 2000);
      });
    });
  });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initCacheSimulator();
  initSimilarityExplorer();
  initCodeBuilder();
  initRedisCommands();
});
