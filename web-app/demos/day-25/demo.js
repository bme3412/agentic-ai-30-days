/**
 * Day 25: Document AI - Agentic Extraction
 * Interactive Demo JavaScript
 */

// ═══════════════════════════════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════════════════════════════

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        // Update button states
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update panel visibility
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
    });
});

// ═══════════════════════════════════════════════════════════════
// TAB 1: OCR EVOLUTION
// ═══════════════════════════════════════════════════════════════

const waveData = {
    1: {
        title: 'Traditional OCR (1990s-2010s)',
        description: 'Character-by-character pattern matching using template-based recognition.',
        capabilities: [
            'Converts images of text to machine-readable characters',
            'Works well on clean, typed documents',
            'Fast processing for simple documents'
        ],
        limitations: [
            'Loses all document structure and layout',
            'Tables become jumbled text',
            'No semantic understanding',
            'Fragile with variations in formatting'
        ],
        tech: 'Tesseract, ABBYY FineReader'
    },
    2: {
        title: 'Rule-Based IDP (2010s)',
        description: 'OCR + handcrafted rules and templates for structured extraction.',
        capabilities: [
            'Can extract specific fields from known templates',
            'Better handling of forms and invoices',
            'Regex patterns for validation'
        ],
        limitations: [
            'Requires manual template creation for each document type',
            'Breaks when documents change format',
            'Expensive to maintain',
            'Cannot generalize to new documents'
        ],
        tech: 'UiPath Document Understanding, Kofax'
    },
    3: {
        title: 'LLM-Based Extraction (2022-2023)',
        description: 'Send document text or image to GPT-4/Claude for extraction.',
        capabilities: [
            'No templates needed - works on any document',
            'Semantic understanding of content',
            'Can handle varied formats'
        ],
        limitations: [
            'Hallucination risk - may invent data',
            'No visual grounding - cannot cite sources',
            'Loses layout context in text conversion',
            'Black box - hard to verify outputs'
        ],
        tech: 'GPT-4V, Claude 3, Gemini'
    },
    4: {
        title: 'Agentic Document Extraction (2024+)',
        description: 'Vision-first, schema-driven extraction with visual grounding and self-correction.',
        capabilities: [
            'Visual understanding of document structure',
            'Every extraction traced to source coordinates',
            'Schema-driven structured output',
            'Confidence scoring for each field',
            'Iterative refinement for complex tasks'
        ],
        limitations: [
            'Higher latency than simple OCR',
            'Requires API calls (not fully offline)',
            'Cost scales with document volume'
        ],
        tech: 'LandingAI ADE, LlamaIndex Agentic OCR'
    }
};

function renderWaveDetail(waveNum) {
    const wave = waveData[waveNum];
    const panel = document.getElementById('wave-detail');

    panel.innerHTML = `
        <h4>${wave.title}</h4>
        <p class="wave-description">${wave.description}</p>
        <div class="wave-grid">
            <div class="wave-section capabilities">
                <h5>Capabilities</h5>
                <ul>
                    ${wave.capabilities.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            <div class="wave-section limitations">
                <h5>Limitations</h5>
                <ul>
                    ${wave.limitations.map(l => `<li>${l}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div class="wave-tech">
            <strong>Technologies:</strong> ${wave.tech}
        </div>
    `;
}

document.querySelectorAll('.timeline-wave').forEach(wave => {
    wave.addEventListener('click', () => {
        document.querySelectorAll('.timeline-wave').forEach(w => w.classList.remove('selected'));
        wave.classList.add('selected');
        renderWaveDetail(parseInt(wave.dataset.wave));
    });
});

// Initialize with wave 1
renderWaveDetail(1);

// OCR vs ADE comparison outputs
const ocrOutput = `INVOICE #2024-0342
Vendor: Acme Corp
Date: March 15, 2024
Due: April 15, 2024
Item Qty Price
Widget A 10 $50.00
Widget B 5 $75.00
Service Fee 1 $25.00
Subtotal: $900.00
Tax (8%): $72.00
Total: $972.00`;

const adeOutput = `{
  "document_type": "invoice",
  "invoice_number": "2024-0342",
  "vendor": {
    "name": "Acme Corp",
    "confidence": 0.98,
    "bbox": {"page": 1, "x1": 0.12, "y1": 0.08, "x2": 0.35, "y2": 0.11}
  },
  "dates": {
    "invoice_date": "2024-03-15",
    "due_date": "2024-04-15"
  },
  "line_items": [
    {"description": "Widget A", "quantity": 10, "unit_price": 50.00, "total": 500.00},
    {"description": "Widget B", "quantity": 5, "unit_price": 75.00, "total": 375.00},
    {"description": "Service Fee", "quantity": 1, "unit_price": 25.00, "total": 25.00}
  ],
  "totals": {
    "subtotal": 900.00,
    "tax_rate": 0.08,
    "tax_amount": 72.00,
    "total": 972.00
  },
  "overall_confidence": 0.96
}`;

document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.mode === 'ocr') {
            document.getElementById('ocr-result').textContent = ocrOutput;
            document.getElementById('ade-result').textContent = '';
        } else {
            document.getElementById('ocr-result').textContent = '';
            document.getElementById('ade-result').textContent = adeOutput;
        }
    });
});

// Initialize with ADE result
document.getElementById('ade-result').textContent = adeOutput;

// ═══════════════════════════════════════════════════════════════
// TAB 2: DOCUMENT PARSING
// ═══════════════════════════════════════════════════════════════

const documentTemplates = {
    invoice: {
        html: `
            <div class="parsed-doc invoice-doc">
                <div class="chunk chunk-header" data-chunk="0">INVOICE #INV-2024-0567</div>
                <div class="chunk chunk-text" data-chunk="1">
                    <strong>From:</strong> Global Tech Solutions<br>
                    123 Business Ave, Suite 400<br>
                    San Francisco, CA 94102
                </div>
                <div class="chunk chunk-text" data-chunk="2">
                    <strong>To:</strong> Enterprise Corp<br>
                    456 Corporate Blvd<br>
                    New York, NY 10001
                </div>
                <div class="chunk chunk-table" data-chunk="3">
                    <table>
                        <tr><th>Description</th><th>Hours</th><th>Rate</th><th>Amount</th></tr>
                        <tr><td>Consulting Services</td><td>40</td><td>$150</td><td>$6,000</td></tr>
                        <tr><td>Development Work</td><td>80</td><td>$125</td><td>$10,000</td></tr>
                        <tr><td>Project Management</td><td>20</td><td>$175</td><td>$3,500</td></tr>
                    </table>
                </div>
                <div class="chunk chunk-text total" data-chunk="4">
                    <strong>Total Due: $19,500.00</strong><br>
                    Payment Terms: Net 30
                </div>
            </div>
        `,
        chunks: [
            { type: 'header', text: 'INVOICE #INV-2024-0567', page: 1, bbox: { x1: 0.3, y1: 0.05, x2: 0.7, y2: 0.1 } },
            { type: 'text', text: 'From: Global Tech Solutions, 123 Business Ave...', page: 1, bbox: { x1: 0.05, y1: 0.12, x2: 0.45, y2: 0.22 } },
            { type: 'text', text: 'To: Enterprise Corp, 456 Corporate Blvd...', page: 1, bbox: { x1: 0.55, y1: 0.12, x2: 0.95, y2: 0.22 } },
            { type: 'table', text: '| Description | Hours | Rate | Amount |...', page: 1, bbox: { x1: 0.05, y1: 0.28, x2: 0.95, y2: 0.55 } },
            { type: 'text', text: 'Total Due: $19,500.00, Payment Terms: Net 30', page: 1, bbox: { x1: 0.55, y1: 0.6, x2: 0.95, y2: 0.68 } }
        ],
        markdown: `# INVOICE #INV-2024-0567

**From:** Global Tech Solutions
123 Business Ave, Suite 400
San Francisco, CA 94102

**To:** Enterprise Corp
456 Corporate Blvd
New York, NY 10001

| Description | Hours | Rate | Amount |
|-------------|-------|------|--------|
| Consulting Services | 40 | $150 | $6,000 |
| Development Work | 80 | $125 | $10,000 |
| Project Management | 20 | $175 | $3,500 |

**Total Due: $19,500.00**
Payment Terms: Net 30`
    },
    contract: {
        html: `
            <div class="parsed-doc contract-doc">
                <div class="chunk chunk-header" data-chunk="0">SERVICE AGREEMENT</div>
                <div class="chunk chunk-text" data-chunk="1">
                    This Agreement is entered into as of <strong>January 15, 2024</strong>
                    between <strong>Acme Corporation</strong> ("Provider") and
                    <strong>Beta Industries</strong> ("Client").
                </div>
                <div class="chunk chunk-header" data-chunk="2">1. SERVICES</div>
                <div class="chunk chunk-text" data-chunk="3">
                    Provider agrees to deliver software development services
                    as outlined in Exhibit A, attached hereto.
                </div>
                <div class="chunk chunk-header" data-chunk="4">2. COMPENSATION</div>
                <div class="chunk chunk-text" data-chunk="5">
                    Client shall pay Provider a total fee of <strong>$150,000</strong>,
                    payable in three installments of $50,000 each.
                </div>
                <div class="chunk chunk-header" data-chunk="6">3. TERM</div>
                <div class="chunk chunk-text" data-chunk="7">
                    This Agreement shall commence on <strong>February 1, 2024</strong>
                    and terminate on <strong>July 31, 2024</strong>.
                </div>
            </div>
        `,
        chunks: [
            { type: 'header', text: 'SERVICE AGREEMENT', page: 1, bbox: { x1: 0.3, y1: 0.05, x2: 0.7, y2: 0.1 } },
            { type: 'text', text: 'This Agreement is entered into as of January 15, 2024...', page: 1, bbox: { x1: 0.1, y1: 0.12, x2: 0.9, y2: 0.22 } },
            { type: 'header', text: '1. SERVICES', page: 1, bbox: { x1: 0.1, y1: 0.25, x2: 0.3, y2: 0.28 } },
            { type: 'text', text: 'Provider agrees to deliver software development services...', page: 1, bbox: { x1: 0.1, y1: 0.3, x2: 0.9, y2: 0.38 } },
            { type: 'header', text: '2. COMPENSATION', page: 1, bbox: { x1: 0.1, y1: 0.42, x2: 0.35, y2: 0.45 } },
            { type: 'text', text: 'Client shall pay Provider a total fee of $150,000...', page: 1, bbox: { x1: 0.1, y1: 0.47, x2: 0.9, y2: 0.55 } },
            { type: 'header', text: '3. TERM', page: 1, bbox: { x1: 0.1, y1: 0.58, x2: 0.25, y2: 0.61 } },
            { type: 'text', text: 'This Agreement shall commence on February 1, 2024...', page: 1, bbox: { x1: 0.1, y1: 0.63, x2: 0.9, y2: 0.71 } }
        ],
        markdown: `# SERVICE AGREEMENT

This Agreement is entered into as of **January 15, 2024** between **Acme Corporation** ("Provider") and **Beta Industries** ("Client").

## 1. SERVICES

Provider agrees to deliver software development services as outlined in Exhibit A, attached hereto.

## 2. COMPENSATION

Client shall pay Provider a total fee of **$150,000**, payable in three installments of $50,000 each.

## 3. TERM

This Agreement shall commence on **February 1, 2024** and terminate on **July 31, 2024**.`
    },
    receipt: {
        html: `
            <div class="parsed-doc receipt-doc">
                <div class="chunk chunk-header" data-chunk="0">COFFEE HOUSE</div>
                <div class="chunk chunk-text" data-chunk="1">
                    789 Main Street<br>
                    Seattle, WA 98101<br>
                    (206) 555-0123
                </div>
                <div class="chunk chunk-text" data-chunk="2">
                    Date: 03/28/2024 10:45 AM<br>
                    Order #: 4521
                </div>
                <div class="chunk chunk-table" data-chunk="3">
                    <table>
                        <tr><td>Latte (Large)</td><td>$5.75</td></tr>
                        <tr><td>Croissant</td><td>$3.50</td></tr>
                        <tr><td>Oat Milk (+)</td><td>$0.75</td></tr>
                    </table>
                </div>
                <div class="chunk chunk-text total" data-chunk="4">
                    Subtotal: $10.00<br>
                    Tax (10.1%): $1.01<br>
                    <strong>Total: $11.01</strong><br>
                    <br>
                    Paid: Visa ***1234
                </div>
            </div>
        `,
        chunks: [
            { type: 'header', text: 'COFFEE HOUSE', page: 1, bbox: { x1: 0.3, y1: 0.05, x2: 0.7, y2: 0.12 } },
            { type: 'text', text: '789 Main Street, Seattle, WA 98101...', page: 1, bbox: { x1: 0.25, y1: 0.14, x2: 0.75, y2: 0.24 } },
            { type: 'text', text: 'Date: 03/28/2024 10:45 AM, Order #: 4521', page: 1, bbox: { x1: 0.2, y1: 0.28, x2: 0.8, y2: 0.34 } },
            { type: 'table', text: '| Item | Price |...', page: 1, bbox: { x1: 0.15, y1: 0.38, x2: 0.85, y2: 0.58 } },
            { type: 'text', text: 'Subtotal: $10.00, Tax: $1.01, Total: $11.01...', page: 1, bbox: { x1: 0.2, y1: 0.62, x2: 0.8, y2: 0.82 } }
        ],
        markdown: `# COFFEE HOUSE

789 Main Street
Seattle, WA 98101
(206) 555-0123

**Date:** 03/28/2024 10:45 AM
**Order #:** 4521

| Item | Price |
|------|-------|
| Latte (Large) | $5.75 |
| Croissant | $3.50 |
| Oat Milk (+) | $0.75 |

**Subtotal:** $10.00
**Tax (10.1%):** $1.01
**Total:** $11.01

Paid: Visa ***1234`
    },
    report: {
        html: `
            <div class="parsed-doc report-doc">
                <div class="chunk chunk-header" data-chunk="0">Q4 2024 FINANCIAL REPORT</div>
                <div class="chunk chunk-text" data-chunk="1">
                    <strong>Executive Summary</strong><br>
                    Revenue grew 15% YoY to $42.5M. Operating margin improved
                    to 18.5% from 16.2% in Q3.
                </div>
                <div class="chunk chunk-table" data-chunk="2">
                    <table>
                        <tr><th>Metric</th><th>Q4 2024</th><th>Q3 2024</th><th>Change</th></tr>
                        <tr><td>Revenue</td><td>$42.5M</td><td>$38.2M</td><td>+11.3%</td></tr>
                        <tr><td>Gross Profit</td><td>$28.3M</td><td>$24.8M</td><td>+14.1%</td></tr>
                        <tr><td>Operating Income</td><td>$7.9M</td><td>$6.2M</td><td>+27.4%</td></tr>
                    </table>
                </div>
                <div class="chunk chunk-figure" data-chunk="3">
                    <div class="chart-placeholder">[Revenue Trend Chart]</div>
                </div>
                <div class="chunk chunk-text" data-chunk="4">
                    <strong>Outlook</strong><br>
                    Management expects Q1 2025 revenue of $44-46M with
                    continued margin expansion.
                </div>
            </div>
        `,
        chunks: [
            { type: 'header', text: 'Q4 2024 FINANCIAL REPORT', page: 1, bbox: { x1: 0.2, y1: 0.05, x2: 0.8, y2: 0.1 } },
            { type: 'text', text: 'Executive Summary: Revenue grew 15% YoY to $42.5M...', page: 1, bbox: { x1: 0.1, y1: 0.12, x2: 0.9, y2: 0.24 } },
            { type: 'table', text: '| Metric | Q4 2024 | Q3 2024 | Change |...', page: 1, bbox: { x1: 0.1, y1: 0.28, x2: 0.9, y2: 0.5 } },
            { type: 'figure', text: '[Revenue Trend Chart]', page: 1, bbox: { x1: 0.15, y1: 0.54, x2: 0.85, y2: 0.72 } },
            { type: 'text', text: 'Outlook: Management expects Q1 2025 revenue of $44-46M...', page: 1, bbox: { x1: 0.1, y1: 0.76, x2: 0.9, y2: 0.88 } }
        ],
        markdown: `# Q4 2024 FINANCIAL REPORT

## Executive Summary

Revenue grew 15% YoY to $42.5M. Operating margin improved to 18.5% from 16.2% in Q3.

| Metric | Q4 2024 | Q3 2024 | Change |
|--------|---------|---------|--------|
| Revenue | $42.5M | $38.2M | +11.3% |
| Gross Profit | $28.3M | $24.8M | +14.1% |
| Operating Income | $7.9M | $6.2M | +27.4% |

![Revenue Trend Chart](chart.png)

## Outlook

Management expects Q1 2025 revenue of $44-46M with continued margin expansion.`
    }
};

let currentDoc = 'invoice';
let showBoundingBoxes = false;

function renderDocument(docType) {
    currentDoc = docType;
    const doc = documentTemplates[docType];
    document.getElementById('doc-canvas').innerHTML = doc.html;
    renderParsingOutput('chunks');

    // Reattach chunk click handlers
    document.querySelectorAll('.chunk').forEach(chunk => {
        chunk.addEventListener('click', () => {
            const idx = parseInt(chunk.dataset.chunk);
            highlightChunkInfo(idx);
        });
    });
}

function renderParsingOutput(outputType) {
    const doc = documentTemplates[currentDoc];
    const result = document.getElementById('parsing-result');

    if (outputType === 'chunks') {
        result.innerHTML = doc.chunks.map((c, i) => `
            <div class="chunk-item" data-idx="${i}">
                <span class="chunk-type ${c.type}">${c.type}</span>
                <span class="chunk-text">${c.text.substring(0, 50)}${c.text.length > 50 ? '...' : ''}</span>
            </div>
        `).join('');
    } else if (outputType === 'markdown') {
        result.innerHTML = `<pre class="markdown-output">${doc.markdown}</pre>`;
    } else if (outputType === 'json') {
        result.innerHTML = `<pre class="json-output">${JSON.stringify({ chunks: doc.chunks }, null, 2)}</pre>`;
    }
}

function highlightChunkInfo(idx) {
    const doc = documentTemplates[currentDoc];
    const chunk = doc.chunks[idx];

    document.querySelectorAll('.chunk').forEach((c, i) => {
        c.classList.toggle('highlighted', i === idx);
    });

    document.querySelectorAll('.chunk-item').forEach((c, i) => {
        c.classList.toggle('highlighted', i === idx);
    });
}

document.querySelectorAll('.doc-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.doc-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDocument(btn.dataset.doc);
    });
});

document.querySelectorAll('.output-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderParsingOutput(tab.dataset.output);
    });
});

document.getElementById('toggle-boxes')?.addEventListener('click', () => {
    showBoundingBoxes = !showBoundingBoxes;
    document.getElementById('doc-canvas').classList.toggle('show-boxes', showBoundingBoxes);
    document.getElementById('toggle-boxes').textContent = showBoundingBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes';
});

// Initialize
renderDocument('invoice');

// ═══════════════════════════════════════════════════════════════
// TAB 3: SCHEMA EXTRACTION
// ═══════════════════════════════════════════════════════════════

let schemaFields = [
    { name: 'vendor', type: 'str', desc: 'Company name' },
    { name: 'total', type: 'float', desc: 'Total amount' },
    { name: 'date', type: 'str', desc: 'Invoice date' }
];

function renderFieldList() {
    const list = document.getElementById('field-list');
    list.innerHTML = schemaFields.map(f => `
        <div class="field-item" data-field="${f.name}">
            <span class="field-type">${f.type}</span>
            <span class="field-name">${f.name}</span>
            <span class="field-desc">${f.desc}</span>
            <button class="remove-field">&times;</button>
        </div>
    `).join('');

    // Add remove handlers
    list.querySelectorAll('.remove-field').forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            schemaFields.splice(i, 1);
            renderFieldList();
            renderPydanticCode();
        });
    });

    renderPydanticCode();
}

function renderPydanticCode() {
    const code = document.querySelector('#pydantic-code code');
    const fields = schemaFields.map(f =>
        `    ${f.name}: ${f.type} = Field(description="${f.desc}")`
    ).join('\n');

    code.textContent = `from pydantic import BaseModel, Field

class Document(BaseModel):
${fields || '    pass'}`;

    if (window.Prism) {
        Prism.highlightElement(code);
    }
}

document.getElementById('add-field-btn')?.addEventListener('click', () => {
    const type = document.getElementById('new-field-type').value;
    const name = document.getElementById('new-field-name').value.trim();
    const desc = document.getElementById('new-field-desc').value.trim();

    if (name && !schemaFields.find(f => f.name === name)) {
        schemaFields.push({ name, type, desc: desc || name });
        document.getElementById('new-field-name').value = '';
        document.getElementById('new-field-desc').value = '';
        renderFieldList();
    }
});

document.getElementById('run-extraction')?.addEventListener('click', () => {
    const result = document.getElementById('extraction-result');
    result.style.display = 'block';

    // Simulate extraction results
    const extractedData = {};
    const confidenceBars = [];

    schemaFields.forEach(f => {
        const confidence = 0.75 + Math.random() * 0.24;
        const confClass = confidence > 0.9 ? 'high' : confidence > 0.8 ? 'medium' : 'low';

        // Generate fake data based on type
        if (f.type === 'str') {
            if (f.name.includes('vendor') || f.name.includes('name')) {
                extractedData[f.name] = 'Global Tech Solutions';
            } else if (f.name.includes('date')) {
                extractedData[f.name] = '2024-03-28';
            } else {
                extractedData[f.name] = 'Sample text value';
            }
        } else if (f.type === 'float' || f.type === 'int') {
            extractedData[f.name] = f.name.includes('total') ? 19500.00 : 42.5;
        } else if (f.type === 'bool') {
            extractedData[f.name] = true;
        } else if (f.type.includes('list')) {
            extractedData[f.name] = ['item1', 'item2', 'item3'];
        }

        confidenceBars.push(`
            <div class="confidence-row">
                <span class="conf-label">${f.name}</span>
                <div class="conf-bar-bg">
                    <div class="conf-bar ${confClass}" style="width: ${confidence * 100}%"></div>
                </div>
                <span class="conf-value">${confidence.toFixed(2)}</span>
            </div>
        `);
    });

    document.getElementById('extracted-data').textContent = JSON.stringify(extractedData, null, 2);
    document.getElementById('confidence-bars').innerHTML = confidenceBars.join('');
});

// Initialize schema
renderFieldList();

// ═══════════════════════════════════════════════════════════════
// TAB 4: VISUAL GROUNDING
// ═══════════════════════════════════════════════════════════════

const groundingRegions = {
    header: { x1: 0.2, y1: 0.02, x2: 0.8, y2: 0.08 },
    vendor: { x1: 0.08, y1: 0.1, x2: 0.55, y2: 0.15 },
    date: { x1: 0.08, y1: 0.16, x2: 0.45, y2: 0.21 },
    delivery: { x1: 0.08, y1: 0.22, x2: 0.45, y2: 0.27 },
    items: { x1: 0.05, y1: 0.32, x2: 0.95, y2: 0.65 },
    total: { x1: 0.08, y1: 0.68, x2: 0.55, y2: 0.74 },
    terms: { x1: 0.08, y1: 0.76, x2: 0.45, y2: 0.82 }
};

const bboxData = {
    header: { field: 'order_number', value: 'PO-2024-789', page: 1, confidence: 0.98 },
    vendor: { field: 'vendor', value: 'TechSupply Industries', page: 1, confidence: 0.96 },
    date: { field: 'order_date', value: 'March 28, 2024', page: 1, confidence: 0.99 },
    delivery: { field: 'delivery_date', value: 'April 10, 2024', page: 1, confidence: 0.94 },
    items: { field: 'line_items', value: '[3 items]', page: 1, confidence: 0.87 },
    total: { field: 'total', value: 3390.00, page: 1, confidence: 0.99 },
    terms: { field: 'payment_terms', value: 'Net 30', page: 1, confidence: 0.95 }
};

function highlightRegion(regionId) {
    const overlay = document.getElementById('highlight-overlay');
    const doc = document.getElementById('grounding-doc');
    const region = groundingRegions[regionId];

    if (!region) {
        overlay.style.display = 'none';
        return;
    }

    const docRect = doc.getBoundingClientRect();
    const contentEl = doc.querySelector('.doc-content');
    const contentRect = contentEl.getBoundingClientRect();

    overlay.style.display = 'block';
    overlay.style.left = `${region.x1 * 100}%`;
    overlay.style.top = `${region.y1 * 100}%`;
    overlay.style.width = `${(region.x2 - region.x1) * 100}%`;
    overlay.style.height = `${(region.y2 - region.y1) * 100}%`;

    // Update bbox info
    const data = bboxData[regionId];
    document.getElementById('bbox-info').textContent = JSON.stringify({
        field: data.field,
        page: data.page,
        bbox: region,
        confidence: data.confidence
    }, null, 2);
}

document.querySelectorAll('.value-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        const target = item.dataset.target;
        highlightRegion(target);
        item.classList.add('active');
    });

    item.addEventListener('mouseleave', () => {
        document.getElementById('highlight-overlay').style.display = 'none';
        item.classList.remove('active');
    });

    item.addEventListener('click', () => {
        const target = item.dataset.target;
        highlightRegion(target);
        // Keep highlight on click
        document.querySelectorAll('.value-item').forEach(v => v.classList.remove('selected'));
        item.classList.add('selected');
    });
});

// ═══════════════════════════════════════════════════════════════
// TAB 5: CODE EXAMPLES
// ═══════════════════════════════════════════════════════════════

document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const example = btn.dataset.example;

        document.querySelectorAll('.example-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.example-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`example-${example}`).classList.add('active');
    });
});

// Copy button functionality
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const code = document.getElementById(targetId)?.textContent || '';

        navigator.clipboard.writeText(code).then(() => {
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('copied');
            }, 2000);
        });
    });
});

// Initialize Prism highlighting
if (window.Prism) {
    Prism.highlightAll();
}
