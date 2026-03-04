// Day 2 Demo: Structured Outputs & Function Calling
// Interactive playground demonstrating structured LLM outputs

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initExtractPanel();
  initFunctionPanel();
  initSchemaPanel();
});

// =============================================================================
// TAB NAVIGATION
// =============================================================================

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.demo-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      // Update active tab
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active panel
      panels.forEach(p => p.classList.remove('active'));
      document.getElementById(`${tabId}-panel`).classList.add('active');
    });
  });
}

// =============================================================================
// PANEL 1: EXTRACT STRUCTURED DATA
// =============================================================================

const extractionExamples = {
  person: {
    input: "Contact Sarah Johnson at sarah.j@company.com. She's 28 years old and works as a Product Manager in the Engineering department.",
    schema: [
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'age', type: 'integer' },
      { name: 'role', type: 'string' },
      { name: 'department', type: 'string | null' }
    ],
    output: {
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      age: 28,
      role: "Product Manager",
      department: "Engineering"
    }
  },
  invoice: {
    input: "Invoice #INV-2024-0892 from Acme Corp. Total amount: $1,542.00. Due date: March 15, 2024. Payment terms: Net 30.",
    schema: [
      { name: 'invoice_number', type: 'string' },
      { name: 'vendor', type: 'string' },
      { name: 'amount', type: 'number' },
      { name: 'due_date', type: 'string' },
      { name: 'payment_terms', type: 'string | null' }
    ],
    output: {
      invoice_number: "INV-2024-0892",
      vendor: "Acme Corp",
      amount: 1542.00,
      due_date: "2024-03-15",
      payment_terms: "Net 30"
    }
  },
  event: {
    input: "Join us for the Annual Tech Conference 2024 at the San Francisco Convention Center on April 20-22. Early bird tickets: $299. Register at techconf.io/register",
    schema: [
      { name: 'event_name', type: 'string' },
      { name: 'location', type: 'string' },
      { name: 'start_date', type: 'string' },
      { name: 'end_date', type: 'string' },
      { name: 'price', type: 'number' },
      { name: 'registration_url', type: 'string | null' }
    ],
    output: {
      event_name: "Annual Tech Conference 2024",
      location: "San Francisco Convention Center",
      start_date: "2024-04-20",
      end_date: "2024-04-22",
      price: 299,
      registration_url: "techconf.io/register"
    }
  }
};

let currentExtractExample = 'person';

function initExtractPanel() {
  const extractBtn = document.getElementById('extract-btn');
  const sampleBtns = document.querySelectorAll('.sample-btn');

  extractBtn.addEventListener('click', runExtraction);

  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sample = btn.dataset.sample;
      loadExtractSample(sample);
    });
  });
}

function loadExtractSample(sample) {
  const example = extractionExamples[sample];
  if (!example) return;

  currentExtractExample = sample;

  // Update input
  document.getElementById('extract-input').value = example.input;

  // Update schema preview
  const schemaPreview = document.querySelector('.schema-preview');
  schemaPreview.innerHTML = example.schema.map(field => `
    <div class="schema-field">
      <span class="field-name">${field.name}</span>
      <span class="field-type">${field.type}</span>
    </div>
  `).join('');

  // Reset output
  const nullOutput = {};
  example.schema.forEach(f => nullOutput[f.name] = null);
  document.getElementById('extract-output').textContent = JSON.stringify(nullOutput, null, 2);
  document.getElementById('extract-status').textContent = 'Ready';
  document.getElementById('extract-status').className = 'output-badge';
  document.getElementById('validation-results').innerHTML = '';
}

async function runExtraction() {
  const statusBadge = document.getElementById('extract-status');
  const outputEl = document.getElementById('extract-output');
  const validationEl = document.getElementById('validation-results');

  // Show processing state
  statusBadge.textContent = 'Processing...';
  statusBadge.className = 'output-badge processing';

  // Simulate LLM processing delay
  await sleep(800);

  // Get the current example output
  const example = extractionExamples[currentExtractExample];
  const output = example.output;

  // Animate the output appearing field by field
  const fields = Object.keys(output);
  const partialOutput = {};

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    partialOutput[field] = output[field];
    outputEl.textContent = JSON.stringify(partialOutput, null, 2);
    await sleep(150);
  }

  // Show success state
  statusBadge.textContent = 'Extracted';
  statusBadge.className = 'output-badge success';

  // Show validation results
  validationEl.innerHTML = `
    <div class="validation-success">
      <span class="validation-icon">&#10003;</span>
      <span>All ${fields.length} fields extracted and validated</span>
    </div>
    <div class="validation-details">
      ${fields.map(f => `
        <div class="field-validation">
          <span class="field-check">&#10003;</span>
          <span class="field-key">${f}</span>
          <span class="field-value">${formatValue(output[f])}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function formatValue(val) {
  if (val === null) return '<null>';
  if (typeof val === 'string') return `"${val}"`;
  return String(val);
}

// =============================================================================
// PANEL 2: FUNCTION CALLING FLOW
// =============================================================================

const functionExamples = {
  weather: {
    query: "What's the weather in Tokyo?",
    analysis: "User is asking about weather conditions. I should use the get_weather tool.",
    tool: "get_weather",
    args: { location: "Tokyo", unit: "celsius" },
    result: { temperature: 22, condition: "Partly Cloudy", humidity: 65 },
    response: "It's currently 22°C and partly cloudy in Tokyo, with 65% humidity."
  },
  search: {
    query: "Find information about the James Webb Space Telescope",
    analysis: "User wants information that requires searching. I'll use the search_web tool.",
    tool: "search_web",
    args: { query: "James Webb Space Telescope", max_results: 3 },
    result: {
      results: [
        { title: "NASA JWST Homepage", snippet: "The most powerful telescope ever launched..." },
        { title: "JWST Wikipedia", snippet: "Space telescope designed for infrared astronomy..." }
      ]
    },
    response: "The James Webb Space Telescope is NASA's most powerful telescope, designed for infrared astronomy. It was launched in December 2021 and is positioned at the L2 Lagrange point."
  },
  calc: {
    query: "What is 15% of 847?",
    analysis: "This is a mathematical calculation. I'll use the calculate tool.",
    tool: "calculate",
    args: { expression: "0.15 * 847" },
    result: { answer: 127.05 },
    response: "15% of 847 is 127.05"
  }
};

let currentFunctionExample = 'weather';

function initFunctionPanel() {
  const functionBtn = document.getElementById('function-btn');
  const queryBtns = document.querySelectorAll('.query-btn');

  functionBtn.addEventListener('click', runFunctionCall);

  queryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.dataset.query;
      loadFunctionQuery(query);
    });
  });
}

function loadFunctionQuery(queryType) {
  const example = functionExamples[queryType];
  if (!example) return;

  currentFunctionExample = queryType;
  document.getElementById('function-query').value = example.query;

  // Reset flow steps
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`flow-step-${i}`);
    stepEl.textContent = 'Waiting...';
    stepEl.parentElement.classList.remove('active', 'completed');
  }
}

async function runFunctionCall() {
  const example = functionExamples[currentFunctionExample];

  // Reset all steps
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`flow-step-${i}`);
    stepEl.textContent = 'Waiting...';
    stepEl.parentElement.classList.remove('active', 'completed');
  }

  await sleep(300);

  // Step 1: User Query
  await animateStep(1, `"${example.query}"`, 400);

  // Step 2: Model Decides
  await animateStep(2, example.analysis, 600);

  // Step 3: Tool Request
  const toolRequest = `${example.tool}(${JSON.stringify(example.args)})`;
  await animateStep(3, toolRequest, 500);

  // Step 4: Execute Tool
  await animateStep(4, `Result: ${JSON.stringify(example.result, null, 2)}`, 700);

  // Step 5: Final Response
  await animateStep(5, example.response, 500);

  // Mark all as completed
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`flow-step-${i}`).parentElement.classList.add('completed');
    document.getElementById(`flow-step-${i}`).parentElement.classList.remove('active');
  }
}

async function animateStep(stepNum, content, delay) {
  const stepEl = document.getElementById(`flow-step-${stepNum}`);
  const containerEl = stepEl.parentElement;

  // Mark as active
  containerEl.classList.add('active');

  // Animate typing effect for longer content
  if (content.length > 50) {
    stepEl.textContent = '';
    for (let i = 0; i < content.length; i += 3) {
      stepEl.textContent = content.substring(0, i + 3);
      await sleep(10);
    }
    stepEl.textContent = content;
  } else {
    stepEl.textContent = content;
  }

  await sleep(delay);
}

// =============================================================================
// PANEL 3: SCHEMA PLAYGROUND
// =============================================================================

const schemaTemplates = {
  person: {
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Full name of the person"
        },
        age: {
          type: "integer",
          minimum: 0,
          maximum: 150
        },
        email: {
          type: ["string", "null"],
          description: "Email address (optional)"
        }
      },
      required: ["name", "age"]
    },
    testData: {
      name: "John Doe",
      age: 30,
      email: null
    }
  },
  task: {
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          minLength: 1,
          maxLength: 200
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "critical"]
        },
        completed: {
          type: "boolean"
        },
        due_date: {
          type: ["string", "null"],
          description: "ISO date format (YYYY-MM-DD)"
        }
      },
      required: ["title", "priority", "completed"]
    },
    testData: {
      title: "Review pull request",
      priority: "high",
      completed: false,
      due_date: "2024-03-15"
    }
  },
  order: {
    schema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          pattern: "^ORD-[0-9]+$"
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              quantity: { type: "integer", minimum: 1 },
              price: { type: "number" }
            },
            required: ["name", "quantity", "price"]
          },
          minItems: 1
        },
        total: {
          type: "number",
          minimum: 0
        }
      },
      required: ["order_id", "items", "total"]
    },
    testData: {
      order_id: "ORD-12345",
      items: [
        { name: "Widget A", quantity: 2, price: 29.99 },
        { name: "Widget B", quantity: 1, price: 49.99 }
      ],
      total: 109.97
    }
  }
};

function initSchemaPanel() {
  const validateBtn = document.getElementById('validate-btn');
  const templateBtns = document.querySelectorAll('.template-btn');

  validateBtn.addEventListener('click', validateSchema);

  templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const template = btn.dataset.template;
      loadSchemaTemplate(template);

      templateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function loadSchemaTemplate(template) {
  const tmpl = schemaTemplates[template];
  if (!tmpl) return;

  document.getElementById('schema-editor').value = JSON.stringify(tmpl.schema, null, 2);
  document.getElementById('test-data').value = JSON.stringify(tmpl.testData, null, 2);
  document.getElementById('schema-validation-output').innerHTML = `
    <div class="validation-placeholder">
      Click "Validate" to check if your test data matches the schema
    </div>
  `;
}

function validateSchema() {
  const schemaText = document.getElementById('schema-editor').value;
  const dataText = document.getElementById('test-data').value;
  const strictMode = document.getElementById('strict-mode').checked;
  const outputEl = document.getElementById('schema-validation-output');

  let schema, data;

  try {
    schema = JSON.parse(schemaText);
  } catch (e) {
    outputEl.innerHTML = `
      <div class="validation-error">
        <span class="validation-icon">&#10007;</span>
        <span>Invalid JSON in schema: ${e.message}</span>
      </div>
    `;
    return;
  }

  try {
    data = JSON.parse(dataText);
  } catch (e) {
    outputEl.innerHTML = `
      <div class="validation-error">
        <span class="validation-icon">&#10007;</span>
        <span>Invalid JSON in test data: ${e.message}</span>
      </div>
    `;
    return;
  }

  const errors = validateAgainstSchema(data, schema, strictMode);

  if (errors.length === 0) {
    outputEl.innerHTML = `
      <div class="validation-success">
        <span class="validation-icon">&#10003;</span>
        <span>Valid! Data matches schema${strictMode ? ' (strict mode)' : ''}</span>
      </div>
      <div class="validation-details">
        <div class="schema-info">
          <strong>Schema Summary:</strong>
          <ul>
            <li>Type: ${schema.type || 'any'}</li>
            <li>Required fields: ${(schema.required || []).join(', ') || 'none'}</li>
            <li>Properties: ${Object.keys(schema.properties || {}).length}</li>
          </ul>
        </div>
      </div>
    `;
  } else {
    outputEl.innerHTML = `
      <div class="validation-error">
        <span class="validation-icon">&#10007;</span>
        <span>Validation failed: ${errors.length} error(s)</span>
      </div>
      <div class="validation-details error-list">
        ${errors.map(err => `
          <div class="error-item">
            <span class="error-path">${err.path || 'root'}</span>
            <span class="error-msg">${err.message}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function validateAgainstSchema(data, schema, strict, path = '') {
  const errors = [];

  // Check type
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actualType = getJsonType(data);

    if (!types.includes(actualType)) {
      errors.push({
        path: path || 'root',
        message: `Expected ${types.join(' | ')}, got ${actualType}`
      });
      return errors;
    }
  }

  // Object validation
  if (schema.type === 'object' || (schema.properties && typeof data === 'object')) {
    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push({
            path: path ? `${path}.${field}` : field,
            message: `Required field missing`
          });
        }
      }
    }

    // Strict mode: check for additional properties
    if (strict && schema.properties) {
      for (const key of Object.keys(data)) {
        if (!(key in schema.properties)) {
          errors.push({
            path: path ? `${path}.${key}` : key,
            message: `Additional property not allowed in strict mode`
          });
        }
      }
    }

    // Validate each property
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in data) {
          const propPath = path ? `${path}.${key}` : key;
          errors.push(...validateAgainstSchema(data[key], propSchema, strict, propPath));
        }
      }
    }
  }

  // Array validation
  if (schema.type === 'array' && Array.isArray(data)) {
    if (schema.minItems && data.length < schema.minItems) {
      errors.push({
        path: path || 'root',
        message: `Array must have at least ${schema.minItems} items`
      });
    }
    if (schema.maxItems && data.length > schema.maxItems) {
      errors.push({
        path: path || 'root',
        message: `Array must have at most ${schema.maxItems} items`
      });
    }
    if (schema.items) {
      data.forEach((item, i) => {
        const itemPath = `${path}[${i}]`;
        errors.push(...validateAgainstSchema(item, schema.items, strict, itemPath));
      });
    }
  }

  // String validation
  if (typeof data === 'string') {
    if (schema.minLength && data.length < schema.minLength) {
      errors.push({
        path: path || 'root',
        message: `String must be at least ${schema.minLength} characters`
      });
    }
    if (schema.maxLength && data.length > schema.maxLength) {
      errors.push({
        path: path || 'root',
        message: `String must be at most ${schema.maxLength} characters`
      });
    }
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(data)) {
        errors.push({
          path: path || 'root',
          message: `String does not match pattern: ${schema.pattern}`
        });
      }
    }
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push({
        path: path || 'root',
        message: `Value must be one of: ${schema.enum.join(', ')}`
      });
    }
  }

  // Number validation
  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push({
        path: path || 'root',
        message: `Value must be >= ${schema.minimum}`
      });
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push({
        path: path || 'root',
        message: `Value must be <= ${schema.maximum}`
      });
    }
  }

  return errors;
}

function getJsonType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number';
  }
  return typeof value;
}

// =============================================================================
// UTILITIES
// =============================================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
