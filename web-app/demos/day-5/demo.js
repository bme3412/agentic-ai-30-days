// Day 5: Reflection & Self-Improvement Demo

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
  });
});

// Self-Refine Demo Data
const refineExamples = {
  code: {
    initial: `def factorial(n):
    result = 1
    for i in range(n):
        result *= i
    return result`,
    critique: [
      "The loop starts at 0, which means result *= 0 on the first iteration, making the result always 0.",
      "Missing edge case handling for negative numbers.",
      "No docstring explaining the function's purpose."
    ],
    refined: `def factorial(n):
    """Calculate the factorial of a non-negative integer.

    Args:
        n: A non-negative integer

    Returns:
        The factorial of n (n!)

    Raises:
        ValueError: If n is negative
    """
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    if n <= 1:
        return 1
    result = 1
    for i in range(2, n + 1):  # Start at 2, go up to n
        result *= i
    return result`
  },
  email: {
    initial: `Hi,

I can't make it to the meeting tomorrow. Something came up.

Thanks`,
    critique: [
      "Too informal for a professional context - missing proper greeting.",
      "Doesn't explain the reason or express regret.",
      "No offer to reschedule or alternative solution.",
      "Missing professional sign-off with full name."
    ],
    refined: `Dear [Name],

Thank you for the meeting invitation for tomorrow. Unfortunately, I have a scheduling conflict that prevents me from attending.

I apologize for any inconvenience this may cause. I would be happy to:
- Review the meeting notes afterward
- Schedule a brief follow-up call at your convenience
- Provide any input via email beforehand

Please let me know how I can best contribute despite my absence.

Best regards,
[Your Name]`
  },
  summary: {
    initial: `Machine learning is when computers learn stuff from data. They look at examples and figure out patterns. There are different types like supervised and unsupervised. It's used in lots of things today.`,
    critique: [
      "Too vague and informal - 'learn stuff' lacks precision.",
      "Missing key concepts: training, models, algorithms, features.",
      "No concrete examples of applications.",
      "Doesn't explain the difference between supervised and unsupervised."
    ],
    refined: `Machine learning is a subset of artificial intelligence where algorithms learn patterns from data without being explicitly programmed. Key concepts include:

**Supervised Learning**: Models train on labeled data (input-output pairs) to make predictions. Examples: spam detection, image classification.

**Unsupervised Learning**: Models find hidden patterns in unlabeled data. Examples: customer segmentation, anomaly detection.

**Core Process**: Data collection → feature engineering → model training → evaluation → deployment.

Modern applications span recommendation systems, natural language processing, computer vision, and autonomous vehicles.`
  }
};

// Run Self-Refine
document.getElementById('run-refine')?.addEventListener('click', () => {
  const taskSelect = document.getElementById('refine-task');
  const task = taskSelect.value;
  const example = refineExamples[task];

  const initialOutput = document.getElementById('initial-output');
  const critiqueOutput = document.getElementById('critique-output');
  const refinedOutput = document.getElementById('refined-output');

  // Clear and show loading
  initialOutput.innerHTML = '<p class="placeholder">Generating...</p>';
  critiqueOutput.innerHTML = '<p class="placeholder">Waiting...</p>';
  refinedOutput.innerHTML = '<p class="placeholder">Waiting...</p>';

  // Simulate generation timing
  setTimeout(() => {
    initialOutput.innerHTML = `<pre>${example.initial}</pre>`;

    setTimeout(() => {
      critiqueOutput.innerHTML = example.critique.map(c =>
        `<div class="critique-item">${c}</div>`
      ).join('');

      setTimeout(() => {
        refinedOutput.innerHTML = `<pre>${example.refined}</pre>`;
      }, 800);
    }, 600);
  }, 400);
});

// Constitutional Review
const constitutionViolations = [
  {
    principle: "Code must not contain hardcoded secrets or API keys",
    issue: 'Line 2: Hardcoded API key "sk-1234567890abcdef" found',
    fix: "Use environment variables: api_key = os.environ.get('API_KEY')"
  },
  {
    principle: "Code must handle errors gracefully with try/except",
    issue: "No error handling for database operations",
    fix: "Wrap db.execute() in try/except to handle connection errors"
  },
  {
    principle: "Functions must have docstrings explaining their purpose",
    issue: "Function get_user() has no docstring",
    fix: 'Add docstring: """Retrieve user by ID from database."""'
  },
  {
    principle: "SQL queries must use parameterized queries",
    issue: "SQL injection vulnerability: f-string used for query construction",
    fix: 'Use parameterized query: "SELECT * FROM users WHERE id = ?" with (user_id,)'
  }
];

document.getElementById('run-constitution')?.addEventListener('click', () => {
  const results = document.getElementById('constitution-results');
  const checkboxes = document.querySelectorAll('.principle-item input[type="checkbox"]');

  // Get which principles are enabled
  const enabledPrinciples = [];
  checkboxes.forEach((cb, idx) => {
    if (cb.checked) {
      enabledPrinciples.push(idx);
    }
  });

  results.innerHTML = '<p class="placeholder">Analyzing code against constitution...</p>';

  setTimeout(() => {
    // Filter violations based on enabled principles
    const relevantViolations = constitutionViolations.filter((v, idx) =>
      enabledPrinciples.includes(idx)
    );

    if (relevantViolations.length === 0) {
      results.innerHTML = '<p style="color: var(--success);">No violations found for selected principles.</p>';
      return;
    }

    results.innerHTML = relevantViolations.map(v => `
      <div class="violation">
        <div class="violation-principle">Violation: ${v.principle}</div>
        <div class="violation-issue">${v.issue}</div>
        <div class="violation-fix">Fix: ${v.fix}</div>
      </div>
    `).join('');
  }, 600);
});
