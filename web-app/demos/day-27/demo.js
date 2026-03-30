/**
 * Day 27: Data Agents & SQL Generation
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
// TAB 1: TEXT-TO-SQL
// ═══════════════════════════════════════════════════════════════

const queryExamples = {
    revenue: {
        nl: "What was our total revenue last quarter?",
        semantic: {
            metric: "revenue (sum)",
            time: "last quarter",
            tables: "orders, order_items"
        },
        sql: `SELECT
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_date >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
  AND o.order_date < DATE_TRUNC('quarter', CURRENT_DATE);`,
        result: {
            columns: ["total_revenue"],
            rows: [["$2,847,392.50"]]
        }
    },
    "top-products": {
        nl: "Show me the top 5 products by sales volume",
        semantic: {
            metric: "sales volume (count)",
            dimension: "product",
            limit: "top 5",
            tables: "products, order_items"
        },
        sql: `SELECT
    p.product_name,
    SUM(oi.quantity) AS total_units_sold
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.product_name
ORDER BY total_units_sold DESC
LIMIT 5;`,
        result: {
            columns: ["product_name", "total_units_sold"],
            rows: [
                ["Premium Widget Pro", "12,847"],
                ["Enterprise Suite License", "8,234"],
                ["Cloud Storage (1TB)", "7,891"],
                ["Developer Toolkit", "6,543"],
                ["Analytics Dashboard", "5,127"]
            ]
        }
    },
    "customer-growth": {
        nl: "How has customer count grown month over month?",
        semantic: {
            metric: "customer count (distinct)",
            dimension: "month",
            calculation: "growth %",
            tables: "customers"
        },
        sql: `WITH monthly_customers AS (
    SELECT
        DATE_TRUNC('month', signup_date) AS month,
        COUNT(DISTINCT customer_id) AS new_customers
    FROM customers
    WHERE signup_date >= DATEADD(month, -6, CURRENT_DATE)
    GROUP BY 1
)
SELECT
    month,
    new_customers,
    LAG(new_customers) OVER (ORDER BY month) AS prev_month,
    ROUND((new_customers - LAG(new_customers) OVER (ORDER BY month))::FLOAT
          / LAG(new_customers) OVER (ORDER BY month) * 100, 1) AS growth_pct
FROM monthly_customers
ORDER BY month;`,
        result: {
            columns: ["month", "new_customers", "prev_month", "growth_pct"],
            rows: [
                ["2024-01", "1,247", "-", "-"],
                ["2024-02", "1,389", "1,247", "11.4%"],
                ["2024-03", "1,562", "1,389", "12.5%"],
                ["2024-04", "1,421", "1,562", "-9.0%"],
                ["2024-05", "1,687", "1,421", "18.7%"]
            ]
        }
    },
    regional: {
        nl: "Compare revenue across regions for 2024",
        semantic: {
            metric: "revenue (sum)",
            dimension: "region",
            filter: "year 2024",
            tables: "orders, order_items, customers, regions"
        },
        sql: `SELECT
    r.region_name,
    SUM(oi.quantity * oi.unit_price) AS total_revenue,
    COUNT(DISTINCT o.order_id) AS order_count,
    ROUND(SUM(oi.quantity * oi.unit_price) / COUNT(DISTINCT o.order_id), 2) AS avg_order_value
FROM regions r
JOIN customers c ON r.region_id = c.region_id
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE YEAR(o.order_date) = 2024
GROUP BY r.region_id, r.region_name
ORDER BY total_revenue DESC;`,
        result: {
            columns: ["region_name", "total_revenue", "order_count", "avg_order_value"],
            rows: [
                ["North America", "$4,521,340", "28,451", "$158.92"],
                ["Europe", "$3,287,120", "21,234", "$154.82"],
                ["Asia Pacific", "$2,891,450", "19,847", "$145.69"],
                ["Latin America", "$987,230", "8,123", "$121.54"]
            ]
        }
    }
};

function updateQueryDisplay(queryKey) {
    const example = queryExamples[queryKey];
    if (!example) return;

    // Update NL display
    document.getElementById('nl-display').textContent = example.nl;
    document.getElementById('nl-query').value = example.nl;

    // Update semantic display
    const semanticHtml = Object.entries(example.semantic).map(([key, value]) => `
        <div class="semantic-item">
            <span class="semantic-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
            <span class="semantic-value">${value}</span>
        </div>
    `).join('');
    document.getElementById('semantic-display').innerHTML = semanticHtml;

    // Update SQL display
    document.getElementById('sql-display').innerHTML = `<code class="language-sql">${example.sql}</code>`;

    // Update result table
    const resultTable = document.getElementById('result-table');
    const headerRow = example.result.columns.map(col => `<th>${col}</th>`).join('');
    const bodyRows = example.result.rows.map(row =>
        `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
    ).join('');
    resultTable.innerHTML = `<thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody>`;

    // Re-highlight code
    if (window.Prism) {
        Prism.highlightAll();
    }
}

// Query chip clicks
document.querySelectorAll('.query-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.query-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        updateQueryDisplay(chip.dataset.query);
    });
});

// Generate SQL button
document.getElementById('generate-sql')?.addEventListener('click', () => {
    const input = document.getElementById('nl-query').value;

    // Find matching example or use default
    let matchedKey = 'revenue';
    for (const [key, example] of Object.entries(queryExamples)) {
        if (example.nl.toLowerCase() === input.toLowerCase()) {
            matchedKey = key;
            break;
        }
    }

    // Update chip states
    document.querySelectorAll('.query-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.query === matchedKey);
    });

    updateQueryDisplay(matchedKey);

    // Add animation effect
    document.querySelectorAll('.flow-step').forEach((step, i) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(10px)';
        setTimeout(() => {
            step.style.transition = 'all 0.3s ease';
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
        }, i * 200);
    });
});

// ═══════════════════════════════════════════════════════════════
// TAB 2: SCHEMA EXPLORER
// ═══════════════════════════════════════════════════════════════

const schemaData = {
    customers: {
        type: "Dimension Table",
        columns: [
            { name: "customer_id", type: "INTEGER", desc: "Primary key", key: "PK" },
            { name: "customer_name", type: "VARCHAR(200)", desc: "Full company or individual name" },
            { name: "email", type: "VARCHAR(100)", desc: "Contact email address" },
            { name: "region_id", type: "INTEGER", desc: "Foreign key to regions", key: "FK" },
            { name: "segment", type: "VARCHAR(50)", desc: "Enterprise, SMB, or Consumer" },
            { name: "signup_date", type: "DATE", desc: "Account creation date" }
        ],
        relationships: [
            { from: "customers.region_id", to: "regions.region_id", type: "many-to-one" },
            { from: "orders.customer_id", to: "customers.customer_id", type: "many-to-one" }
        ],
        yaml: `table: customers
description: "Customer master data including demographics"
metrics:
  - name: customer_count
    type: count_distinct
    sql: customer_id
  - name: avg_customer_age
    type: average
    sql: DATEDIFF(year, birth_date, CURRENT_DATE)
dimensions:
  - name: region
    type: categorical
    sql: region_name
  - name: customer_segment
    type: categorical
    sql: segment`
    },
    orders: {
        type: "Fact Table",
        columns: [
            { name: "order_id", type: "INTEGER", desc: "Primary key", key: "PK" },
            { name: "customer_id", type: "INTEGER", desc: "Foreign key to customers", key: "FK" },
            { name: "order_date", type: "TIMESTAMP", desc: "When order was placed" },
            { name: "status", type: "VARCHAR(20)", desc: "pending, shipped, delivered, cancelled" },
            { name: "shipping_address", type: "VARCHAR(500)", desc: "Delivery address" }
        ],
        relationships: [
            { from: "orders.customer_id", to: "customers.customer_id", type: "many-to-one" },
            { from: "order_items.order_id", to: "orders.order_id", type: "many-to-one" }
        ],
        yaml: `table: orders
description: "Sales order transactions"
metrics:
  - name: order_count
    type: count_distinct
    sql: order_id
    synonyms: ["orders", "transactions"]
  - name: orders_per_customer
    type: ratio
    sql: COUNT(DISTINCT order_id) / COUNT(DISTINCT customer_id)
time_dimension:
  column: order_date
  granularities: [day, week, month, quarter, year]`
    },
    products: {
        type: "Dimension Table",
        columns: [
            { name: "product_id", type: "INTEGER", desc: "Primary key", key: "PK" },
            { name: "product_name", type: "VARCHAR(200)", desc: "Product display name" },
            { name: "category", type: "VARCHAR(100)", desc: "Product category" },
            { name: "unit_cost", type: "DECIMAL(10,2)", desc: "Cost to produce/acquire" },
            { name: "list_price", type: "DECIMAL(10,2)", desc: "Standard selling price" }
        ],
        relationships: [
            { from: "order_items.product_id", to: "products.product_id", type: "many-to-one" }
        ],
        yaml: `table: products
description: "Product catalog with pricing"
metrics:
  - name: product_count
    type: count_distinct
    sql: product_id
  - name: avg_margin
    type: average
    sql: (list_price - unit_cost) / list_price
dimensions:
  - name: category
    type: categorical
    sql: category
    synonyms: ["product type", "product category"]`
    },
    order_items: {
        type: "Fact Table",
        columns: [
            { name: "item_id", type: "INTEGER", desc: "Primary key", key: "PK" },
            { name: "order_id", type: "INTEGER", desc: "Foreign key to orders", key: "FK" },
            { name: "product_id", type: "INTEGER", desc: "Foreign key to products", key: "FK" },
            { name: "quantity", type: "INTEGER", desc: "Units ordered" },
            { name: "unit_price", type: "DECIMAL(10,2)", desc: "Price at time of sale" }
        ],
        relationships: [
            { from: "order_items.order_id", to: "orders.order_id", type: "many-to-one" },
            { from: "order_items.product_id", to: "products.product_id", type: "many-to-one" }
        ],
        yaml: `table: order_items
description: "Line items within each order"
metrics:
  - name: total_revenue
    type: sum
    sql: quantity * unit_price
    synonyms: ["revenue", "sales", "income"]
  - name: units_sold
    type: sum
    sql: quantity
  - name: average_order_value
    type: average
    sql: SUM(quantity * unit_price) / COUNT(DISTINCT order_id)`
    },
    regions: {
        type: "Dimension Table",
        columns: [
            { name: "region_id", type: "INTEGER", desc: "Primary key", key: "PK" },
            { name: "region_name", type: "VARCHAR(100)", desc: "Geographic region name" },
            { name: "country_count", type: "INTEGER", desc: "Number of countries in region" }
        ],
        relationships: [
            { from: "customers.region_id", to: "regions.region_id", type: "many-to-one" }
        ],
        yaml: `table: regions
description: "Geographic sales regions"
dimensions:
  - name: region
    type: categorical
    sql: region_name
    synonyms: ["territory", "area", "geography"]`
    }
};

function renderTableDetails(tableName) {
    const table = schemaData[tableName];
    if (!table) return;

    // Update header
    document.getElementById('selected-table-name').textContent = tableName;
    document.querySelector('.detail-badge').textContent = table.type;

    // Render columns
    const columnsHtml = table.columns.map(col => `
        <div class="column-item">
            <span class="column-name">${col.name}</span>
            <span class="column-type">${col.type}</span>
            <span class="column-desc">${col.desc}</span>
            ${col.key ? `<span class="column-key">${col.key}</span>` : ''}
        </div>
    `).join('');
    document.getElementById('columns-list').innerHTML = columnsHtml;

    // Render relationships
    const relsHtml = table.relationships.map(rel => `
        <div class="relationship-item">
            <span class="rel-table">${rel.from}</span>
            <span class="rel-arrow">&#8594;</span>
            <span class="rel-table">${rel.to}</span>
            <span class="rel-type">(${rel.type})</span>
        </div>
    `).join('');
    document.getElementById('relationships-list').innerHTML = relsHtml;

    // Render semantic YAML
    document.getElementById('semantic-yaml').innerHTML = `<code class="language-yaml">${table.yaml}</code>`;

    if (window.Prism) {
        Prism.highlightAll();
    }
}

document.querySelectorAll('.table-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.table-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        renderTableDetails(item.dataset.table);
    });
});

// Initialize schema view
renderTableDetails('customers');

// ═══════════════════════════════════════════════════════════════
// TAB 3: QUERY BUILDER
// ═══════════════════════════════════════════════════════════════

let builderAnimationRunning = false;

document.getElementById('run-builder-demo')?.addEventListener('click', async () => {
    if (builderAnimationRunning) return;
    builderAnimationRunning = true;

    const steps = document.querySelectorAll('.build-step');

    // Reset all steps
    steps.forEach(step => {
        step.classList.remove('completed', 'active', 'pending');
        step.classList.add('pending');
        const status = step.querySelector('.build-step-status');
        if (status) {
            status.innerHTML = '&#9675;';
            status.classList.remove('processing');
            status.classList.add('pending');
        }
    });

    // Animate through steps
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const status = step.querySelector('.build-step-status');

        // Mark as active
        step.classList.remove('pending');
        step.classList.add('active');
        if (status) {
            status.innerHTML = '&#8635;';
            status.classList.remove('pending');
            status.classList.add('processing');
        }

        // Wait
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mark as completed
        step.classList.remove('active');
        step.classList.add('completed');
        if (status) {
            status.innerHTML = '&#10003;';
            status.classList.remove('processing');
        }
    }

    builderAnimationRunning = false;
});

// ═══════════════════════════════════════════════════════════════
// TAB 4: VALIDATION LOOP
// ═══════════════════════════════════════════════════════════════

let validationAnimationRunning = false;

function initValidationSteps() {
    const steps = document.querySelectorAll('.val-step');
    steps.forEach(step => step.classList.add('visible'));
}

document.getElementById('replay-validation')?.addEventListener('click', async () => {
    if (validationAnimationRunning) return;
    validationAnimationRunning = true;

    const steps = document.querySelectorAll('.val-step');

    // Hide all steps
    steps.forEach(step => step.classList.remove('visible'));

    // Animate steps appearing
    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        steps[i].classList.add('visible');
    }

    validationAnimationRunning = false;
});

// Initialize validation steps as visible
initValidationSteps();

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
