import type { Day } from '../../types';

export const day27: Day = {
  day: 27,
  phase: 5,
  title: "Data Agents & SQL Generation",
  partner: "Snowflake",
  tags: ["data-agents", "sql", "analytics", "text-to-sql"],
  concept: "Natural language to SQL with agentic query planning",
  demoUrl: "demos/day-27/",
  demoDescription: "Interactive text-to-SQL demo with schema exploration and query validation",

  lesson: {
    overview: `Data agents represent a paradigm shift in how we interact with databases. Instead of requiring users to learn SQL or rely on pre-built dashboards, data agents translate natural language questions directly into executable queries. This democratizes data access across organizations while maintaining the precision and power of SQL.

The key challenge in text-to-SQL is bridging the semantic gap between human intent and database structure. Users think in terms of business concepts ("revenue," "top customers," "growth rate") while databases store raw data in normalized tables. Effective data agents must understand both domains and translate between them reliably.

Snowflake Cortex Analyst exemplifies the modern approach to this problem: combining large language models with semantic models that encode business logic, table relationships, and metric definitions. This hybrid approach achieves production-grade accuracy while remaining flexible enough to handle novel questions.`,

    principles: [
      {
        title: "Semantic Models as Translation Layer",
        description: "Semantic models bridge the gap between business language and database schema. They encode metric definitions, table relationships, and synonyms that help the agent translate 'revenue' into SUM(quantity * price)."
      },
      {
        title: "Query Validation & Self-Correction",
        description: "Production deployments require validation loops that execute generated SQL, detect errors, and automatically iterate to fix issues. This transforms unreliable generation into reliable query execution."
      },
      {
        title: "Multi-Step Reasoning",
        description: "Complex analytical questions like 'YoY growth by region' require breaking the problem into sub-queries (current revenue, prior revenue, comparison) that are executed in sequence and combined."
      },
      {
        title: "Context Preservation",
        description: "Natural conversations include follow-ups like 'how about last year?' The agent must maintain context across turns to resolve references without requiring the user to repeat background information."
      },
      {
        title: "Confidence Scoring",
        description: "Not all queries have equal certainty. Confidence scoring enables human-in-the-loop review for edge cases, allowing automatic processing of clear requests while flagging ambiguous ones for review."
      },
      {
        title: "Result Verification",
        description: "Visual grounding through result verification prevents hallucinated data. Execute queries and verify results match expected patterns before presenting them to users."
      }
    ],

    codeExample: {
      language: "python",
      title: "Basic Cortex Analyst Query",
      code: `"""Snowflake Cortex Analyst: Natural Language to SQL"""

import snowflake.connector
from snowflake.cortex import Analyst

# Connect to Snowflake
conn = snowflake.connector.connect(
    account="your_account",
    user="your_user",
    password="your_password",
    warehouse="COMPUTE_WH",
    database="SALES_DB",
    schema="PUBLIC"
)

# Initialize Cortex Analyst with semantic model
analyst = Analyst(
    connection=conn,
    semantic_model="sales_semantic_model"
)

# Ask a natural language question
question = "What was our total revenue last quarter by region?"

# Generate and execute SQL
result = analyst.ask(question)

print(f"Generated SQL:\\n{result.sql}")
print(f"\\nResults:")
for row in result.data:
    print(f"  {row}")

# Check confidence and metadata
print(f"\\nConfidence: {result.confidence}")
print(f"Tables used: {result.tables_referenced}")`
    },

    diagram: {
      type: "mermaid",
      title: "Data Agent Pipeline",
      mermaid: `flowchart LR
    subgraph Input
        A[Natural Language Question]
    end

    subgraph Agent["Data Agent"]
        B[Parse Intent]
        C[Schema Lookup]
        D[SQL Generation]
        E[Validation]
    end

    subgraph Execution
        F[Database Query]
        G[Result Processing]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E -->|Valid| F
    E -->|Error| D
    F --> G
    G --> H[Answer + Data]

    style Agent fill:#e0f2fe,stroke:#0284c7
    style H fill:#dcfce7,stroke:#16a34a`
    },

    keyTakeaways: [
      "Text-to-SQL agents translate business questions into database queries",
      "Semantic models encode business logic, metrics, and table relationships",
      "Cortex Analyst combines LLMs with semantic context for production accuracy",
      "Self-correction loops handle SQL errors and iterate to working queries",
      "Multi-step reasoning decomposes complex questions into sub-queries",
      "Confidence scoring enables appropriate human review for uncertain cases",
      "Context preservation enables natural conversational follow-ups"
    ],

    resources: [
      {
        title: "Snowflake Cortex Analyst Documentation",
        url: "https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst",
        type: "docs"
      },
      {
        title: "Building Semantic Models for Cortex Analyst",
        url: "https://quickstarts.snowflake.com/guide/getting_started_with_cortex_analyst/",
        type: "tutorial"
      },
      {
        title: "Text-to-SQL: State of the Art",
        url: "https://arxiv.org/abs/2406.08426",
        type: "paper"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Build intelligent data agents that translate natural language questions into SQL queries, validate results, and iterate when errors occur.",
      fullDescription: `Data agents are transforming how organizations access and analyze their data. Instead of requiring SQL expertise or waiting for analysts to build reports, business users can simply ask questions in plain English and receive accurate, data-backed answers.

This day covers the full spectrum of text-to-SQL technology: from understanding why it's challenging, to building production systems with Snowflake Cortex Analyst, to implementing self-correcting query pipelines that handle errors gracefully.

You'll learn how semantic models bridge the gap between human language and database schema, enabling agents to understand concepts like "revenue," "growth rate," and "top customers" without being explicitly programmed for each question. We'll also cover multi-step reasoning for complex analytical questions and techniques for maintaining conversation context across follow-up queries.

By the end of this day, you'll understand how to build data agents that democratize access to organizational data while maintaining the accuracy and reliability required for business-critical decisions.`,
      prerequisites: ["Basic SQL knowledge", "Python programming", "Understanding of relational databases"],
      estimatedTime: "3-4 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "The Text-to-SQL Challenge",
        description: "Understanding why converting natural language to SQL is difficult and how modern approaches solve this problem.",
        analogy: "It's like translating between two people who speak different languages AND think about the world differently - a business user asks about 'customer growth' while the database only knows about rows in tables with dates and IDs.",
        gotchas: [
          "Ambiguous terms like 'last month' can mean different things in different contexts",
          "Users may ask about concepts that require joining multiple tables they don't know exist",
          "The same business metric may have multiple valid SQL implementations"
        ]
      },
      {
        title: "Semantic Models",
        description: "Semantic models define the mapping between business concepts and database structures, including metrics, dimensions, and relationships.",
        analogy: "A semantic model is like a translator's dictionary that not only maps words but also explains cultural context - it tells the agent that 'revenue' means SUM(quantity * price) and that 'customers' should be joined through the orders table.",
        gotchas: [
          "Semantic models require upfront investment to define correctly",
          "They need maintenance as business definitions or schemas change",
          "Incomplete semantic models lead to incorrect or failed queries"
        ]
      },
      {
        title: "Cortex Analyst Architecture",
        description: "How Snowflake Cortex Analyst combines LLMs with semantic models to achieve production-grade text-to-SQL accuracy.",
        analogy: "Cortex Analyst is like having a brilliant data analyst who has memorized your entire data dictionary - they understand both what you're asking AND exactly how your data is structured.",
        gotchas: [
          "Requires a Snowflake account and appropriate permissions",
          "Semantic model YAML format has specific requirements",
          "Query complexity affects response latency"
        ]
      },
      {
        title: "Query Validation & Self-Correction",
        description: "Implementing validation loops that execute generated SQL, detect errors, and automatically iterate to fix issues.",
        analogy: "Like a student who checks their homework by running the numbers - if the answer doesn't make sense, they go back and find where they made a mistake rather than just submitting wrong work.",
        gotchas: [
          "Need to set maximum retry limits to avoid infinite loops",
          "Some errors require schema knowledge to fix, not just syntax correction",
          "Validation should check semantic correctness, not just execution success"
        ]
      },
      {
        title: "Multi-Step Query Planning",
        description: "Breaking complex analytical questions into multiple sub-queries that are executed and combined for the final answer.",
        analogy: "It's like solving a complex math problem step by step - first calculate this year's revenue, then last year's revenue, then compute the percentage change, rather than trying to do it all in one equation.",
        gotchas: [
          "Sub-query dependencies must be tracked and executed in order",
          "Intermediate results may need to be stored or passed between steps",
          "Complex plans increase latency and potential for errors"
        ]
      },
      {
        title: "Result Interpretation",
        description: "Going beyond raw query results to provide business-relevant insights and natural language summaries.",
        analogy: "Like a financial advisor who doesn't just hand you a spreadsheet, but explains what the numbers mean for your goals - 'Revenue grew 15% which exceeds your 10% target.'",
        gotchas: [
          "Interpretation requires understanding of business context",
          "Automated insights can be misleading without proper guardrails",
          "Users may need both raw data and interpreted summaries"
        ]
      },
      {
        title: "Conversational Context",
        description: "Maintaining context across multiple questions to enable natural follow-up queries without repeating context.",
        analogy: "Like a good assistant who remembers the conversation - when you ask 'how about last year?' after discussing Q3 revenue, they know you mean Q3 revenue from last year, not total revenue.",
        gotchas: [
          "Context windows have limits on how much history can be retained",
          "Ambiguous references need to be resolved correctly",
          "Users may want to start fresh without accumulated context"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Basic Cortex Analyst Usage",
        language: "python",
        category: "basic",
        explanation: "Simple example of querying data using natural language with Snowflake Cortex Analyst.",
        code: `"""Basic Cortex Analyst: Natural Language Data Queries"""

import snowflake.connector
from snowflake.cortex import Analyst

# Establish connection
conn = snowflake.connector.connect(
    account="myaccount",
    user="myuser",
    password="mypassword",
    warehouse="COMPUTE_WH",
    database="ANALYTICS",
    schema="PUBLIC"
)

# Create analyst with semantic model
analyst = Analyst(
    connection=conn,
    semantic_model="company_metrics"  # Pre-defined semantic model
)

# Ask questions in natural language
questions = [
    "What was total revenue last quarter?",
    "Show me top 10 customers by lifetime value",
    "How has monthly active users trended this year?"
]

for question in questions:
    print(f"Q: {question}")
    result = analyst.ask(question)

    print(f"SQL: {result.sql[:100]}...")
    print(f"Rows: {len(result.data)}")
    print(f"Confidence: {result.confidence:.2%}")
    print("---")`
      },
      {
        title: "Semantic Model Definition",
        language: "yaml",
        category: "intermediate",
        explanation: "Define a semantic model that maps business concepts to database schema for accurate query generation.",
        code: `# semantic_model.yaml - Cortex Analyst Semantic Model

name: sales_analytics
description: "Sales and revenue analytics semantic layer"
version: "1.0"

tables:
  - name: customers
    description: "Customer master data"
    columns:
      - name: customer_id
        description: "Unique customer identifier"
        data_type: INTEGER
        is_primary_key: true
      - name: customer_name
        description: "Company or individual name"
        data_type: VARCHAR
        synonyms: ["name", "account name", "company"]
      - name: segment
        description: "Customer tier (Enterprise, SMB, Consumer)"
        data_type: VARCHAR
        synonyms: ["tier", "type", "category"]
      - name: region
        description: "Geographic sales region"
        data_type: VARCHAR
        synonyms: ["territory", "area", "location"]

  - name: orders
    description: "Sales transactions"
    columns:
      - name: order_id
        description: "Unique order identifier"
        data_type: INTEGER
        is_primary_key: true
      - name: customer_id
        description: "Customer who placed order"
        data_type: INTEGER
        foreign_key: customers.customer_id
      - name: order_date
        description: "When order was placed"
        data_type: TIMESTAMP
        is_time_dimension: true
        synonyms: ["date", "transaction date", "when"]

metrics:
  - name: total_revenue
    description: "Sum of all order values"
    sql: "SUM(order_items.quantity * order_items.unit_price)"
    synonyms: ["revenue", "sales", "income", "total sales"]

  - name: order_count
    description: "Number of orders"
    sql: "COUNT(DISTINCT orders.order_id)"
    synonyms: ["orders", "transactions", "order volume"]

  - name: average_order_value
    description: "Average revenue per order"
    sql: "SUM(order_items.quantity * order_items.unit_price) / NULLIF(COUNT(DISTINCT orders.order_id), 0)"
    synonyms: ["AOV", "avg order", "average order size"]

relationships:
  - from_table: orders
    from_column: customer_id
    to_table: customers
    to_column: customer_id
    type: many_to_one

time_expressions:
  - name: last_quarter
    sql: "order_date >= DATEADD(quarter, -1, DATE_TRUNC('quarter', CURRENT_DATE)) AND order_date < DATE_TRUNC('quarter', CURRENT_DATE)"
  - name: this_year
    sql: "YEAR(order_date) = YEAR(CURRENT_DATE)"
  - name: YoY
    description: "Year over year comparison"
    requires_window: true`
      },
      {
        title: "Self-Correcting Query Pipeline",
        language: "python",
        category: "intermediate",
        explanation: "Implement a query pipeline that automatically detects and fixes SQL errors through iterative correction.",
        code: `"""Self-Correcting SQL Generation Pipeline"""

from dataclasses import dataclass
from anthropic import Anthropic
import snowflake.connector
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class QueryResult:
    success: bool
    sql: str
    data: list | None
    attempts: int
    error: str | None = None

class SelfCorrectingDataAgent:
    """Data agent with automatic error correction."""

    SYSTEM_PROMPT = """You are a SQL expert. Generate Snowflake SQL for the user's question.

Available tables:
- customers (customer_id, customer_name, region, segment, signup_date)
- orders (order_id, customer_id, order_date, status)
- order_items (item_id, order_id, product_id, quantity, unit_price)
- products (product_id, product_name, category)

Important:
- Use Snowflake SQL syntax
- Always qualify column names with table aliases
- Use appropriate date functions (DATE_TRUNC, DATEADD, etc.)

Return ONLY the SQL query, no explanations."""

    def __init__(self, anthropic_client: Anthropic, snowflake_conn, max_attempts: int = 3):
        self.client = anthropic_client
        self.conn = snowflake_conn
        self.max_attempts = max_attempts

    def query(self, question: str) -> QueryResult:
        """Generate SQL and execute with automatic error correction."""
        attempts = 0
        last_error = None
        last_sql = ""

        while attempts < self.max_attempts:
            attempts += 1

            # Generate SQL (include error context for retries)
            if last_error:
                prompt = f"""Question: {question}

Previous SQL that failed:
{last_sql}

Error message:
{last_error}

Please fix the SQL to resolve this error."""
            else:
                prompt = f"Question: {question}"

            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=self.SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )

            sql = response.content[0].text.strip()
            # Remove markdown code blocks if present
            if sql.startswith("\`\`\`"):
                sql = sql.split("\\n", 1)[-1].rsplit("\\n", 1)[0]
            last_sql = sql

            logger.info(f"Attempt {attempts}: {sql[:100]}...")

            # Execute and validate
            try:
                cursor = self.conn.cursor()
                cursor.execute(sql)
                data = cursor.fetchall()

                logger.info(f"Success! Returned {len(data)} rows")
                return QueryResult(
                    success=True,
                    sql=sql,
                    data=data,
                    attempts=attempts
                )

            except Exception as e:
                last_error = str(e)
                logger.warning(f"Attempt {attempts} failed: {last_error}")

        return QueryResult(
            success=False,
            sql=last_sql,
            data=None,
            attempts=attempts,
            error=last_error
        )

# Usage
client = Anthropic()
conn = snowflake.connector.connect(...)

agent = SelfCorrectingDataAgent(client, conn)
result = agent.query("Show me revenue by region for Q3 2024")

if result.success:
    print(f"Solved in {result.attempts} attempt(s)")
    for row in result.data[:5]:
        print(row)
else:
    print(f"Failed after {result.attempts} attempts: {result.error}")`
      },
      {
        title: "Full Agentic Data Analyst",
        language: "python",
        category: "advanced",
        explanation: "Production-grade data agent with multi-step reasoning, result interpretation, and conversation context.",
        code: `"""Production Agentic Data Analyst with Multi-Step Reasoning"""

from anthropic import Anthropic
import snowflake.connector
from dataclasses import dataclass, field
from typing import Literal
import json

@dataclass
class AnalysisStep:
    step_type: Literal["query", "compute", "interpret"]
    description: str
    sql: str | None = None
    result: dict | None = None

@dataclass
class Analysis:
    question: str
    steps: list[AnalysisStep] = field(default_factory=list)
    answer: str = ""
    follow_ups: list[str] = field(default_factory=list)

class AgenticDataAnalyst:
    """Multi-step data analyst with conversation memory."""

    PLANNER_PROMPT = """You are a data analysis planner. Break down the user's question
into logical steps. Each step should be either:
- query: Execute SQL to get data
- compute: Calculate derived metrics from previous results
- interpret: Generate business insights from data

Return JSON: {"steps": [{"type": "query|compute|interpret", "description": "..."}]}"""

    SQL_PROMPT = """Generate Snowflake SQL for this analysis step.
Available tables: customers, orders, order_items, products, regions
Return only SQL, no explanation."""

    INTERPRET_PROMPT = """You are a business analyst. Interpret these query results
in the context of the original question. Provide clear, actionable insights."""

    def __init__(self, anthropic_client: Anthropic, snowflake_conn):
        self.client = anthropic_client
        self.conn = snowflake_conn
        self.conversation_history: list[Analysis] = []

    def analyze(self, question: str) -> Analysis:
        """Run full analysis pipeline with multi-step reasoning."""
        analysis = Analysis(question=question)

        # Include conversation context
        context = self._build_context()

        # Step 1: Plan the analysis
        plan = self._plan_analysis(question, context)

        # Step 2: Execute each step
        accumulated_data = {}
        for step_plan in plan:
            step = AnalysisStep(
                step_type=step_plan["type"],
                description=step_plan["description"]
            )

            if step.step_type == "query":
                step.sql, step.result = self._execute_query(
                    step.description,
                    context,
                    accumulated_data
                )
                if step.result:
                    accumulated_data[step.description] = step.result

            elif step.step_type == "interpret":
                step.result = {"interpretation": self._interpret(
                    question,
                    accumulated_data
                )}

            analysis.steps.append(step)

        # Step 3: Generate final answer
        analysis.answer = self._generate_answer(question, analysis.steps)

        # Step 4: Suggest follow-ups
        analysis.follow_ups = self._suggest_follow_ups(question, analysis.steps)

        # Save to conversation history
        self.conversation_history.append(analysis)

        return analysis

    def _build_context(self) -> str:
        """Build context from conversation history."""
        if not self.conversation_history:
            return ""

        context_parts = []
        for prev in self.conversation_history[-3:]:  # Last 3 analyses
            context_parts.append(f"Previous Q: {prev.question}")
            context_parts.append(f"Previous A: {prev.answer[:200]}...")

        return "\\n".join(context_parts)

    def _plan_analysis(self, question: str, context: str) -> list[dict]:
        """Use LLM to plan analysis steps."""
        prompt = f"Question: {question}"
        if context:
            prompt = f"Context:\\n{context}\\n\\n{prompt}"

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=self.PLANNER_PROMPT,
            messages=[{"role": "user", "content": prompt}]
        )

        return json.loads(response.content[0].text)["steps"]

    def _execute_query(self, description: str, context: str, prior_data: dict) -> tuple:
        """Generate and execute SQL with error correction."""
        prompt = f"Step: {description}"
        if prior_data:
            prompt += f"\\nPrior results: {json.dumps(prior_data)[:500]}"

        for attempt in range(3):
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=self.SQL_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )

            sql = response.content[0].text.strip()

            try:
                cursor = self.conn.cursor()
                cursor.execute(sql)
                columns = [desc[0] for desc in cursor.description]
                data = cursor.fetchall()
                return sql, {"columns": columns, "rows": data[:100]}
            except Exception as e:
                prompt = f"{prompt}\\nError: {e}\\nFix the SQL."

        return sql, None

    def _interpret(self, question: str, data: dict) -> str:
        """Generate business interpretation of results."""
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=self.INTERPRET_PROMPT,
            messages=[{
                "role": "user",
                "content": f"Question: {question}\\nData: {json.dumps(data)[:2000]}"
            }]
        )
        return response.content[0].text

    def _generate_answer(self, question: str, steps: list[AnalysisStep]) -> str:
        """Generate final answer from all steps."""
        step_summaries = []
        for s in steps:
            if s.result:
                step_summaries.append(f"{s.description}: {str(s.result)[:200]}")

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"Answer this question based on the analysis:\\nQ: {question}\\n\\nSteps:\\n" + "\\n".join(step_summaries)
            }]
        )
        return response.content[0].text

    def _suggest_follow_ups(self, question: str, steps: list) -> list[str]:
        """Suggest natural follow-up questions."""
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=256,
            messages=[{
                "role": "user",
                "content": f"Suggest 3 follow-up questions after: {question}"
            }]
        )
        return [line.strip() for line in response.content[0].text.split("\\n") if line.strip()]

# Usage
client = Anthropic()
conn = snowflake.connector.connect(...)

analyst = AgenticDataAnalyst(client, conn)

# First question
result1 = analyst.analyze("Why did revenue drop in Q3?")
print(result1.answer)
print("Follow-ups:", result1.follow_ups)

# Follow-up (uses conversation context)
result2 = analyst.analyze("How does that compare to last year?")
print(result2.answer)`
      }
    ],

    diagrams: [
      {
        title: "Text-to-SQL Pipeline Architecture",
        type: "architecture",
        mermaid: `flowchart TB
    subgraph Input
        A[Natural Language Question]
    end

    subgraph SemanticLayer["Semantic Layer"]
        B[Semantic Model]
        C[Table Definitions]
        D[Metric Definitions]
        E[Relationships]
    end

    subgraph Agent["Data Agent"]
        F[Intent Parser]
        G[SQL Generator]
        H[Query Validator]
        I[Error Corrector]
    end

    subgraph Execution
        J[(Database)]
        K[Result Processor]
    end

    A --> F
    B --> F
    C --> G
    D --> G
    E --> G
    F --> G
    G --> H
    H -->|Valid| J
    H -->|Invalid| I
    I --> G
    J --> K
    K --> L[Answer + Insights]

    style SemanticLayer fill:#fef3c7,stroke:#d97706
    style Agent fill:#e0f2fe,stroke:#0284c7`,
        caption: "Complete text-to-SQL pipeline from natural language to database results"
      },
      {
        title: "Query Validation Loop",
        type: "flow",
        mermaid: `flowchart LR
    A[Generate SQL] --> B{Execute}
    B -->|Success| C{Validate Results}
    C -->|Valid| D[Return Data]
    C -->|Suspicious| E[Analyze Issue]
    B -->|Error| E
    E --> F{Attempts < Max?}
    F -->|Yes| G[Fix SQL]
    G --> A
    F -->|No| H[Return Error]

    style D fill:#dcfce7,stroke:#16a34a
    style H fill:#fee2e2,stroke:#dc2626`,
        caption: "Self-correction loop for handling SQL errors and validation failures"
      },
      {
        title: "Multi-Step Query Planning",
        type: "sequence",
        mermaid: `sequenceDiagram
    participant U as User
    participant A as Agent
    participant P as Planner
    participant DB as Database

    U->>A: "Compare Q3 revenue YoY by region"
    A->>P: Plan analysis steps
    P-->>A: [current_revenue, prior_revenue, comparison]

    A->>DB: Query current Q3 revenue
    DB-->>A: Current results

    A->>DB: Query prior year Q3 revenue
    DB-->>A: Prior results

    A->>A: Compute YoY change
    A->>A: Generate insights

    A->>U: Results + interpretation`,
        caption: "Breaking complex questions into multiple coordinated queries"
      }
    ],

    faq: [
      {
        question: "How accurate is text-to-SQL compared to hand-written queries?",
        answer: "Modern text-to-SQL systems with semantic models achieve 85-95% accuracy on well-defined schemas. The key is having comprehensive semantic models that capture business definitions. For critical queries, implementing validation and human-in-the-loop review for low-confidence results maintains high reliability."
      },
      {
        question: "What's the difference between Cortex Analyst and generic LLM SQL generation?",
        answer: "Cortex Analyst uses semantic models that encode your specific schema, business metrics, and relationships. This context makes it far more accurate than generic LLMs that only see the question. It also integrates natively with Snowflake for optimized execution and security."
      },
      {
        question: "How do I handle ambiguous questions like 'recent customers'?",
        answer: "Semantic models can define default interpretations (e.g., 'recent' = last 30 days). For truly ambiguous cases, implement clarification dialogs where the agent asks follow-up questions before generating SQL. You can also provide confidence scores and let users refine unclear queries."
      },
      {
        question: "Can data agents handle complex analytical questions with multiple steps?",
        answer: "Yes, through multi-step reasoning. The agent breaks complex questions into sub-queries (e.g., 'YoY growth' requires current period, prior period, then calculation), executes them in order, and combines results. This approach handles questions that would require CTEs or multiple queries."
      },
      {
        question: "How do I prevent SQL injection or unauthorized data access?",
        answer: "Data agents should run with appropriate database permissions that limit accessible tables/views. Cortex Analyst inherits Snowflake's role-based access control. Always validate that generated SQL doesn't contain unexpected commands (DROP, DELETE, etc.) before execution."
      },
      {
        question: "What happens when the agent generates incorrect SQL?",
        answer: "Implement validation loops that execute queries and check results. If execution fails, pass the error message back to the LLM to generate corrected SQL. Set maximum retry limits (typically 2-3) to avoid infinite loops. For semantic errors (query runs but wrong data), implement result validation checks."
      }
    ],

    applications: [
      {
        title: "Self-Service Business Intelligence",
        description: "Enable business users to query data directly without SQL knowledge. Sales teams can ask 'What are my top accounts this quarter?' and get instant answers without waiting for analyst reports."
      },
      {
        title: "Conversational Analytics",
        description: "Build chat interfaces for data exploration where users can ask follow-up questions naturally. 'Show me revenue by region' followed by 'What about just enterprise customers?' maintains context automatically."
      },
      {
        title: "Automated Report Generation",
        description: "Generate dynamic reports by translating report specifications into queries. 'Weekly sales summary by product category with WoW comparison' produces the data needed for automated dashboards."
      },
      {
        title: "Data Validation Agents",
        description: "Create agents that validate data quality by generating and executing validation queries. 'Check if all orders have matching customers' becomes automated data quality checks."
      },
      {
        title: "Executive Dashboards",
        description: "Power executive dashboards with natural language queries that update in real-time. Executives can ask ad-hoc questions that supplement pre-built visualizations."
      }
    ],

    keyTakeaways: [
      "Text-to-SQL bridges the gap between business questions and database queries",
      "Semantic models are essential for accurate query generation - they encode business logic, metrics, and relationships",
      "Snowflake Cortex Analyst combines LLMs with semantic context for production-grade accuracy",
      "Self-correction loops handle SQL errors by passing error messages back to the LLM for fixes",
      "Multi-step reasoning breaks complex questions into coordinated sub-queries",
      "Confidence scoring enables appropriate human review for uncertain results",
      "Conversation context enables natural follow-up questions without repeating background",
      "Proper database permissions and query validation prevent security issues",
      "Result validation catches semantic errors beyond just SQL syntax issues",
      "Synonyms in semantic models help handle varied user terminology"
    ],

    resources: [
      {
        title: "Snowflake Cortex Analyst Documentation",
        url: "https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst",
        type: "docs"
      },
      {
        title: "Building Semantic Models Quickstart",
        url: "https://quickstarts.snowflake.com/guide/getting_started_with_cortex_analyst/",
        type: "tutorial"
      },
      {
        title: "Text-to-SQL Survey Paper",
        url: "https://arxiv.org/abs/2406.08426",
        type: "paper"
      },
      {
        title: "LangChain SQL Agent",
        url: "https://python.langchain.com/docs/use_cases/sql/",
        type: "docs"
      },
      {
        title: "Vanna.AI - Text-to-SQL Training",
        url: "https://vanna.ai/docs/",
        type: "tool"
      },
      {
        title: "Spider Benchmark for Text-to-SQL",
        url: "https://yale-lily.github.io/spider",
        type: "link"
      },
      {
        title: "DuckDB for Local SQL Agents",
        url: "https://duckdb.org/docs/api/python/overview",
        type: "tool"
      }
    ],

    relatedDays: [3, 14, 17, 22]
  }
};
