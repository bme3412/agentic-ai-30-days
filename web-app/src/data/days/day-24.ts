import type { Day } from '../../types';

export const day24: Day = {
  day: 24,
  phase: 5,
  title: "Coding Agents & Sandboxed Execution",
  partner: "E2B / Hugging Face",
  tags: ["code-gen", "e2b", "smolagents", "sandbox", "code-interpreter"],
  concept: "Agents that write, test, and execute code safely in isolated environments",
  demoUrl: "demos/day-24/",
  demoDescription: "Experience a coding agent in action: enter a programming task, watch code generation, see sandboxed execution, and observe the iteration loop.",

  lesson: {
    overview: `LLMs can generate code, but running that code is dangerous. An LLM might accidentally (or maliciously, via prompt injection) execute code that deletes files, exfiltrates data, or consumes unbounded resources. You cannot simply exec() LLM-generated Python on your local machine. This is the fundamental tension: coding agents need to execute code to verify it works, but execution is inherently risky.

E2B solves this by providing cloud-hosted sandboxed environments that spin up in milliseconds. Each sandbox is an isolated Linux VM with its own filesystem, network, and process space. The agent sends code to the sandbox, E2B executes it, and returns only the output. If the code tries to delete everything or mine cryptocurrency, it only affects the disposable sandbox. E2B's Code Interpreter SDK makes this as simple as sandbox.run_code(code).

Hugging Face's smolagents library takes a different approach to agent design: instead of having the LLM output JSON tool calls, the LLM writes Python code directly. Research shows this improves composability, object management, and leverages the LLM's training on code. smolagents integrates directly with E2B via a single parameter: executor_type="e2b". This combination gives you agents that think in code and execute safely.`,

    principles: [
      {
        title: "Never Execute LLM Code Locally Without Isolation",
        description: "LLM-generated code is untrusted code. Even well-intentioned models can produce harmful output through errors, prompt injection, or supply chain attacks. Always execute in a sandbox (E2B, Docker, or isolated interpreter) that limits filesystem access, network connectivity, CPU, memory, and execution time."
      },
      {
        title: "Code as the Action Format",
        description: "Traditional tool-calling uses JSON schemas to describe actions. Code agents write Python instead. Code is naturally composable (functions, loops, conditionals), handles complex object management (store the output of generate_image in a variable), and is already well-represented in LLM training data."
      },
      {
        title: "Iterative Execution with Error Feedback",
        description: "Coding agents rarely get it right the first time. The power comes from the feedback loop: generate code, execute in sandbox, capture output/errors, feed back to the LLM, regenerate. Errors are observations, not failures. A good coding agent uses stack traces and error messages to refine its approach."
      },
      {
        title: "Resource Limits Are Non-Negotiable",
        description: "Every sandbox must have hard limits on execution time (typically 30-60 seconds), memory (512MB-1GB), CPU (fraction of a core), and network access (usually disabled or restricted). Without limits, a single infinite loop or memory-hungry operation can exhaust your cloud budget."
      },
      {
        title: "State Persistence Between Executions",
        description: "Effective coding agents maintain state across multiple code executions within a session. The sandbox keeps variables, imported libraries, and created files between runs, allowing the agent to build incrementally. E2B sandboxes persist until explicitly terminated."
      }
    ],

    codeExample: {
      language: "python",
      title: "Simple Coding Agent with E2B Sandbox",
      code: `"""Minimal coding agent using E2B for safe execution."""

from e2b_code_interpreter import Sandbox
from openai import OpenAI

client = OpenAI()

def run_coding_agent(task: str, max_iterations: int = 3) -> str:
    """Run a coding agent that writes and executes Python code."""

    with Sandbox() as sandbox:  # Isolated Linux VM
        messages = [
            {"role": "system", "content": """You are a Python coding assistant.
Write Python code to solve the user's task. Output ONLY the code, no explanation.
If you see an error, fix it and try again."""},
            {"role": "user", "content": task}
        ]

        for iteration in range(max_iterations):
            # Generate code with the LLM
            response = client.chat.completions.create(
                model="gpt-4o", messages=messages, temperature=0
            )
            code = response.choices[0].message.content

            # Strip markdown fences if present
            if code.startswith("\`\`\`"):
                code = code.split("\`\`\`")[1].lstrip("python\\n")

            # Execute in sandbox (isolated, safe)
            execution = sandbox.run_code(code)

            if execution.error:
                # Feed error back for refinement
                messages.append({"role": "assistant", "content": code})
                messages.append({"role": "user", "content": f"Error:\\n{execution.error.traceback}\\nFix it."})
            else:
                return "\\n".join(str(log) for log in execution.logs.stdout)

        return "Max iterations reached"

# Usage
result = run_coding_agent("Calculate the first 20 prime numbers")
print(result)`
    },

    diagram: {
      type: "mermaid",
      title: "Coding Agent Execution Loop",
      mermaid: `flowchart TD
    TASK["User Task"] --> LLM
    LLM["LLM Generates\\nPython Code"] --> SANDBOX
    SANDBOX["E2B Sandbox\\n(Isolated VM)"] --> CHECK
    CHECK{"Execution\\nResult?"}
    CHECK -->|Success| OUTPUT["Return Output"]
    CHECK -->|Error| FEEDBACK["Feed Error\\nBack to LLM"]
    FEEDBACK --> LLM
    CHECK -->|Max Retries| FAIL["Report Failure"]

    subgraph Security ["Security Boundary"]
        SANDBOX
    end`
    },

    keyTakeaways: [
      "Never execute LLM-generated code in your local environment without sandboxing - use E2B, Docker, or isolated interpreters",
      "E2B sandboxes are cloud-hosted Linux VMs that spin up in milliseconds and provide complete isolation",
      "Code agents (smolagents CodeAgent) write Python directly instead of JSON tool calls, enabling better composability",
      "The execution feedback loop is essential: generate code, execute, capture errors, refine, repeat until success",
      "Set hard resource limits (time, memory, CPU) on all sandboxed execution to prevent runaway costs",
      "smolagents integrates with E2B via executor_type='e2b', making sandboxed execution a one-line configuration"
    ],

    resources: [
      {
        title: "E2B Documentation",
        url: "https://e2b.dev/docs",
        type: "docs",
        description: "Official E2B documentation covering sandboxes, templates, and Code Interpreter SDK"
      },
      {
        title: "smolagents Documentation",
        url: "https://huggingface.co/docs/smolagents",
        type: "docs",
        description: "Hugging Face's lightweight agent library with CodeAgent and ToolCallingAgent"
      },
      {
        title: "smolagents Secure Code Execution Guide",
        url: "https://huggingface.co/docs/smolagents/tutorials/secure_code_execution",
        type: "tutorial",
        description: "Deep dive on sandboxed execution options in smolagents (E2B, Docker, Modal)"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Build coding agents that generate, test, and execute Python code safely using E2B cloud sandboxes and Hugging Face's smolagents library for code-first agent design.",
      fullDescription: `The promise of AI coding assistants goes beyond code completion. A true coding agent doesn't just suggest code - it writes complete solutions, runs them to verify they work, and iterates until the task is done. But this capability comes with a fundamental security challenge: you can't let an LLM execute arbitrary code on your machine.

E2B solves this by providing cloud-hosted sandboxed environments. Each sandbox is a lightweight Linux VM with its own isolated filesystem, network stack, and process space. When your agent generates code, you send it to the E2B sandbox for execution. If the code works, you get the output. If it fails (or tries something malicious), only the disposable sandbox is affected. E2B's Code Interpreter SDK reduces this to a single method call: sandbox.run_code(code). Sandboxes spin up in under a second and can persist state across multiple code executions within a session.

Hugging Face's smolagents takes a complementary approach to agent architecture. Instead of the standard "LLM outputs JSON tool calls" pattern, smolagents' CodeAgent writes Python code to accomplish tasks. This code-first approach has several advantages: code is naturally composable (you can define functions, use loops, nest operations), it handles complex objects naturally (store an image in a variable instead of serializing to JSON), and LLMs have extensive training data in code. The agent writes code, executes it, and iterates based on the results.

smolagents integrates directly with multiple sandbox providers. Setting executor_type="e2b" routes all code execution through E2B sandboxes. You can also use Docker, Modal, or Blaxel for different deployment scenarios. The library's local Python executor provides a baseline level of safety by intercepting dangerous operations, but for production use, remote sandboxes are strongly recommended.

The combination of smolagents and E2B creates a powerful pattern: an agent that thinks in code and executes safely. This is the foundation for advanced applications like data analysis agents, code generation tools, and autonomous development assistants.`,
      prerequisites: [
        "Day 3: Building agents from scratch (understand the agent loop)",
        "Day 11: AutoGen code execution (prior exposure to sandboxed execution)",
        "Python fundamentals (classes, async basics)",
        "Basic understanding of containers/VMs (helpful but not required)"
      ],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "Why Sandboxed Execution is Non-Negotiable",
        description: "LLM-generated code is fundamentally untrusted. Even with the best models and careful prompting, several attack vectors remain: plain LLM errors (a model trying to clean up files might generate rm -rf /), prompt injection (malicious instructions hidden in external data), supply chain attacks (compromised model weights), and adversarial users (deliberately harmful prompts). The consequences include filesystem damage, data exfiltration, resource exhaustion, and network attacks from your infrastructure. No amount of prompt engineering eliminates these risks. Sandboxed execution is the only reliable mitigation.",
        analogy: "Running LLM-generated code locally is like letting a stranger drive your car unsupervised. Sandboxed execution is like letting them drive a rental car with GPS tracking and insurance - if something goes wrong, it's contained.",
        gotchas: [
          "'The model seems trustworthy' is not a security strategy - models can be jailbroken",
          "Local isolated interpreters help but aren't bulletproof for production",
          "Even sandboxes need resource limits - an infinite loop still costs money",
          "Network access from sandboxes should be disabled unless explicitly needed"
        ]
      },
      {
        title: "E2B Sandboxes - Architecture and API",
        description: "E2B provides cloud-hosted sandboxes that are isolated Linux VMs provisioned on-demand. Key features include fast startup (~300ms from templates), state persistence (variables, imports, and files persist across run_code calls), resource isolation (each sandbox has isolated CPU, memory, and disk), timeout control (default 30s, configurable), and file I/O (upload files to sandbox, download results). The basic API is straightforward: create a Sandbox(), call sandbox.run_code() with your Python code, and check execution.logs.stdout for output or execution.error for failures.",
        analogy: "E2B sandboxes are like disposable workstations in a clean room. You can do whatever you want inside, but nothing escapes to the real environment. When you're done, you throw the whole workstation away.",
        gotchas: [
          "Sandboxes cost money while running - always close them (use context managers)",
          "Default templates have common packages; custom templates needed for exotic dependencies",
          "Network access is available by default - disable it if not needed",
          "Long-running computations need increased timeout settings"
        ]
      },
      {
        title: "smolagents CodeAgent - Writing Actions as Code",
        description: "smolagents' CodeAgent represents a paradigm shift in agent design. Instead of outputting structured JSON to describe tool calls, the agent writes Python code directly. The code approach offers several advantages: composability (nest function calls, use loops and conditionals naturally), object management (store tool outputs in variables, pass them to other tools), LLM strength (models are heavily trained on code), and debugging (Python stack traces are informative; JSON errors are cryptic).",
        analogy: "Traditional tool-calling is like giving someone a form to fill out. CodeAgent is like letting them write a program. The form is constrained but safe; the program is powerful but needs sandboxing.",
        gotchas: [
          "CodeAgent needs an LLM with strong code generation capabilities (GPT-4, Claude, Llama 70B+)",
          "Without sandboxing, CodeAgent executes in your local environment",
          "Complex tools with tricky APIs may confuse the code generation",
          "Always review generated code in high-stakes scenarios"
        ]
      },
      {
        title: "Integrating smolagents with E2B",
        description: "smolagents provides a one-line integration with E2B and other sandbox providers. Setting executor_type='e2b' routes all code execution to E2B sandboxes. The agent state is serialized and sent to the sandbox, LLM inference happens locally (using your API keys), generated code is sent to the sandbox for execution, and only the output is returned. Available executor types include 'e2b' (recommended for production), 'docker' (local containers), 'modal' (Modal.com sandboxes), and the default local executor with basic safeguards.",
        analogy: "The executor_type parameter is like choosing a shipping method. Default is 'deliver to my house' (convenient but risky). 'e2b' is 'deliver to a secure P.O. box' (safer, slight latency).",
        gotchas: [
          "Multi-agent systems (managed_agents) need full sandbox setup, not just executor_type",
          "API keys for the model stay local; only code goes to the sandbox",
          "Each agent.run() may create a fresh sandbox - use context managers for efficiency",
          "E2B requires an account and API key"
        ]
      },
      {
        title: "The Iterative Code-Execute-Refine Loop",
        description: "The power of coding agents comes from iteration. Unlike one-shot code generation, agents can see their mistakes and fix them. The pattern involves: generate code from the task, execute in sandbox, check for errors, feed error traceback back to LLM if failed, regenerate and retry, return output on success or after max iterations. Key patterns include treating errors as observations (the stack trace tells the agent what went wrong), incremental building (write helper functions, test them, then compose), state accumulation (sandbox state persists), and graceful degradation (return partial results if iteration fails).",
        analogy: "A coding agent is like a student learning to code. They try, make mistakes, read the error message, and try again. The sandbox is their practice environment where mistakes don't matter.",
        gotchas: [
          "Set a max iteration limit - some tasks are impossible and the agent will loop forever",
          "Track token usage - each iteration costs API credits",
          "Consider early termination on repeated identical errors",
          "Log all iterations for debugging"
        ]
      },
      {
        title: "Resource Limits and Security Best Practices",
        description: "Every sandbox execution needs hard limits. Without them, a single rogue execution can exhaust resources. E2B allows configuring timeout (max sandbox lifetime), per-execution timeout, and uses isolated VMs by default. Best practices include: set execution timeouts (30-60s typical), limit memory (512MB-1GB typical), disable network unless needed, run as non-root user, use read-only filesystems where possible, monitor and alert on resource usage, and clean up sandboxes aggressively.",
        analogy: "Resource limits are like lab safety equipment. You wear goggles and gloves even if you don't expect a spill. The limits are there for the unexpected cases.",
        gotchas: [
          "Memory limits that are too tight cause cryptic failures",
          "Timeouts need to account for package installation time",
          "Network access enables exfiltration and attacks - default to disabled",
          "Even with limits, defense in depth is essential"
        ]
      },
      {
        title: "Building Production Coding Agents",
        description: "Moving from prototype to production coding agents requires additional infrastructure. Key components include: logging and observability (log every iteration, code generated, and results), human-in-the-loop for dangerous operations (detect patterns like 'rm', 'delete', 'drop table' and require approval), rate limiting and cost control (cap executions per hour, track token usage), and testing (create test cases with expected outputs, test with adversarial inputs). Production agents also need kill switches for runaway behavior and versioned prompts since small changes have big effects.",
        analogy: "Production coding agents are like production web servers. The core logic is the easy part; logging, monitoring, rate limiting, and error handling are where the real work is.",
        gotchas: [
          "Test with adversarial inputs - not just happy path cases",
          "Monitor costs closely - coding agents can burn through API credits",
          "Version your prompts - small changes have big effects",
          "Have a kill switch for runaway agents"
        ]
      }
    ],

    codeExamples: [
      {
        title: "E2B Sandbox Fundamentals",
        language: "python",
        category: "basic",
        explanation: "Core E2B API for executing Python code in isolated sandboxes, including state persistence and error handling.",
        code: `"""E2B Sandbox Fundamentals - Core Operations"""

from e2b_code_interpreter import Sandbox

# ── Basic Code Execution ──────────────────────────────────
with Sandbox() as sandbox:
    # Simple execution
    execution = sandbox.run_code("print('Hello from the sandbox!')")
    print("Output:", execution.logs.stdout)

    # Computation
    execution = sandbox.run_code("""
import math
result = math.factorial(10)
print(f"10! = {result}")
""")
    print("Factorial:", execution.logs.stdout)

# ── State Persistence ─────────────────────────────────────
with Sandbox() as sandbox:
    # Define a variable
    sandbox.run_code("data = [1, 2, 3, 4, 5]")

    # Use it in subsequent execution
    execution = sandbox.run_code("""
total = sum(data)
avg = total / len(data)
print(f"Sum: {total}, Average: {avg}")
""")
    print("Stats:", execution.logs.stdout)

# ── Error Handling ────────────────────────────────────────
with Sandbox() as sandbox:
    execution = sandbox.run_code("x = 1 / 0")  # ZeroDivisionError

    if execution.error:
        print("Error type:", execution.error.name)
        print("Traceback:", execution.error.traceback)
    else:
        print("Success:", execution.logs.stdout)

# ── File Operations ───────────────────────────────────────
with Sandbox() as sandbox:
    # Create a file in the sandbox
    sandbox.run_code("""
import json
data = {"users": ["Alice", "Bob"]}
with open("data.json", "w") as f:
    json.dump(data, f)
""")

    # Download the file
    content = sandbox.download_file("data.json")
    print("Downloaded:", content.decode())`
      },
      {
        title: "smolagents CodeAgent with E2B",
        language: "python",
        category: "intermediate",
        explanation: "Using smolagents' CodeAgent with E2B sandboxing for safe autonomous code execution.",
        code: `"""smolagents CodeAgent with E2B Sandbox"""

from smolagents import CodeAgent, InferenceClientModel, tool

# ── Define Custom Tools ───────────────────────────────────
@tool
def fetch_weather(city: str) -> str:
    """Fetches current weather for a city.

    Args:
        city: Name of the city to get weather for
    Returns:
        Weather information as a string
    """
    weather_data = {
        "Paris": "18°C, Partly Cloudy",
        "London": "14°C, Rainy",
        "Tokyo": "22°C, Sunny",
    }
    return weather_data.get(city, f"Weather unavailable for {city}")

@tool
def calculate_tip(bill: float, percent: float) -> float:
    """Calculates tip amount for a bill.

    Args:
        bill: The total bill in dollars
        percent: Tip percentage (e.g., 18 for 18%)
    Returns:
        The tip amount in dollars
    """
    return bill * (percent / 100)

# ── CodeAgent with E2B Sandboxing ─────────────────────────
with CodeAgent(
    model=InferenceClientModel(),
    tools=[fetch_weather, calculate_tip],
    executor_type="e2b"  # Routes execution to E2B sandbox
) as agent:
    # Agent writes Python code to solve the task
    result = agent.run("""
        Get the weather in Paris and Tokyo.
        Then calculate a 20% tip on a $85 dinner bill.
        Summarize all results.
    """)
    print("Result:", result)

# ── Using Different Models ────────────────────────────────
from smolagents import LiteLLMModel

# OpenAI
openai_agent = CodeAgent(
    model=LiteLLMModel(model_id="gpt-4o"),
    tools=[],
    executor_type="e2b"
)

# Anthropic
claude_agent = CodeAgent(
    model=LiteLLMModel(model_id="anthropic/claude-3-5-sonnet-20241022"),
    tools=[],
    executor_type="e2b"
)`
      },
      {
        title: "Iteration Loop with Error Recovery",
        language: "python",
        category: "intermediate",
        explanation: "Complete coding agent with error recovery and iteration tracking.",
        code: `"""Coding Agent with Iteration and Error Recovery"""

from e2b_code_interpreter import Sandbox
from openai import OpenAI

client = OpenAI()

def run_coding_agent(task: str, max_iterations: int = 3) -> dict:
    """Run a coding agent with full error recovery."""

    with Sandbox() as sandbox:
        messages = [
            {"role": "system", "content": """You are a Python expert.
Write code to solve the task. Output ONLY executable code.
If you see an error, analyze it and fix your code."""},
            {"role": "user", "content": task}
        ]

        history = []

        for i in range(max_iterations):
            # Generate code
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0
            )
            code = response.choices[0].message.content

            # Clean up code (remove markdown fences)
            if "\`\`\`python" in code:
                code = code.split("\`\`\`python")[1].split("\`\`\`")[0]
            code = code.strip()

            print(f"\\n--- Iteration {i+1} ---")
            print(f"Code: {code[:200]}...")

            # Execute in sandbox
            execution = sandbox.run_code(code)

            iteration_result = {
                "iteration": i + 1,
                "code": code,
                "success": execution.error is None
            }

            if execution.error:
                error_msg = execution.error.traceback
                print(f"Error: {error_msg[:200]}...")

                iteration_result["error"] = error_msg
                history.append(iteration_result)

                # Feed error back to LLM
                messages.append({"role": "assistant", "content": code})
                messages.append({
                    "role": "user",
                    "content": f"Error occurred:\\n{error_msg}\\n\\nFix it."
                })
            else:
                output = "\\n".join(str(log) for log in execution.logs.stdout)
                print(f"Success: {output}")

                iteration_result["output"] = output
                history.append(iteration_result)

                return {
                    "success": True,
                    "output": output,
                    "iterations": i + 1,
                    "history": history
                }

        return {
            "success": False,
            "iterations": max_iterations,
            "history": history,
            "error": "Max iterations reached"
        }

# Example usage
result = run_coding_agent(
    "Calculate the sum of all prime numbers under 100"
)
print(f"\\nFinal: success={result['success']}, iterations={result['iterations']}")`
      },
      {
        title: "Production-Ready Coding Agent",
        language: "python",
        category: "advanced",
        explanation: "Full-featured production agent with safety checks, logging, and structured results.",
        code: `"""Production-Ready Coding Agent with Safety Checks"""

from e2b_code_interpreter import Sandbox
from openai import OpenAI
from dataclasses import dataclass
import re
import logging

logger = logging.getLogger(__name__)

DANGEROUS_PATTERNS = [
    r"os\\.system", r"subprocess", r"__import__",
    r"eval\\(", r"exec\\(", r"open\\(.*['\"]w"
]

@dataclass
class ExecutionResult:
    success: bool
    output: str
    iterations: int
    error: str | None = None
    total_tokens: int = 0

class ProductionCodingAgent:
    def __init__(self, max_iterations: int = 5, timeout: int = 30):
        self.max_iterations = max_iterations
        self.timeout = timeout
        self.client = OpenAI()

    def _check_dangerous(self, code: str) -> str | None:
        """Check for dangerous patterns in generated code."""
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, code):
                return f"Blocked dangerous pattern: {pattern}"
        return None

    def _extract_code(self, response: str) -> str:
        """Extract code from LLM response."""
        code = response.strip()
        if "\`\`\`python" in code:
            code = code.split("\`\`\`python")[1].split("\`\`\`")[0]
        elif "\`\`\`" in code:
            code = code.split("\`\`\`")[1].split("\`\`\`")[0]
        return code.strip()

    def run(self, task: str) -> ExecutionResult:
        """Execute a task with full safety checks."""

        with Sandbox(timeout=120) as sandbox:
            messages = [
                {"role": "system", "content": "Write Python code. Output only code."},
                {"role": "user", "content": task}
            ]

            total_tokens = 0

            for i in range(self.max_iterations):
                response = self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    temperature=0,
                    max_tokens=2000
                )

                total_tokens += response.usage.total_tokens
                code = self._extract_code(response.choices[0].message.content)

                logger.info(f"Iteration {i+1}: Generated {len(code)} chars")

                # Safety check
                if danger := self._check_dangerous(code):
                    logger.warning(f"Blocked: {danger}")
                    return ExecutionResult(
                        success=False, output="", iterations=i+1,
                        error=danger, total_tokens=total_tokens
                    )

                # Execute with timeout
                try:
                    execution = sandbox.run_code(code, timeout=self.timeout)
                except Exception as e:
                    return ExecutionResult(
                        success=False, output="", iterations=i+1,
                        error=f"Sandbox error: {e}", total_tokens=total_tokens
                    )

                if execution.error:
                    messages.append({"role": "assistant", "content": code})
                    messages.append({
                        "role": "user",
                        "content": f"Error:\\n{execution.error.traceback}\\nFix it."
                    })
                else:
                    output = "\\n".join(str(log) for log in execution.logs.stdout)
                    return ExecutionResult(
                        success=True, output=output, iterations=i+1,
                        total_tokens=total_tokens
                    )

            return ExecutionResult(
                success=False, output="", iterations=self.max_iterations,
                error="Max iterations", total_tokens=total_tokens
            )

# Usage
agent = ProductionCodingAgent(max_iterations=3, timeout=30)
result = agent.run("Find all Armstrong numbers under 1000")
print(f"Success: {result.success}, Tokens: {result.total_tokens}")`
      }
    ],

    diagrams: [
      {
        title: "Coding Agent System Architecture",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph User["User Environment"]
        TASK["Task Input"]
        RESULT["Final Result"]
    end

    subgraph Agent["Coding Agent (Local)"]
        LLM["LLM API\\n(GPT-4o / Claude)"]
        PARSE["Code Parser"]
        FEEDBACK["Error Handler"]
    end

    subgraph Sandbox["E2B Sandbox (Cloud)"]
        VM["Isolated Linux VM"]
        EXEC["Python Interpreter"]
        FS["Sandboxed Filesystem"]
    end

    TASK --> LLM
    LLM --> PARSE
    PARSE -->|"Python code"| VM
    VM --> EXEC
    EXEC -->|"stdout/stderr"| FEEDBACK
    FEEDBACK -->|"Error"| LLM
    FEEDBACK -->|"Success"| RESULT`,
        caption: "The agent runs locally, generating code via LLM. Code is sent to an E2B sandbox for safe execution. Results flow back for iteration."
      },
      {
        title: "Code Agent vs Tool-Calling Agent",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph Traditional["Tool-Calling Agent"]
        T_LLM["LLM"] -->|"JSON"| T_PARSE["Parser"]
        T_PARSE -->|"tool(args)"| T_EXEC["Executor"]
        T_EXEC --> T_RESULT["Result"]
    end

    subgraph Code["CodeAgent (smolagents)"]
        C_LLM["LLM"] -->|"Python"| C_SANDBOX["Sandbox"]
        C_SANDBOX --> C_INTERP["Interpreter"]
        C_INTERP --> C_RESULT["Result"]
    end`,
        caption: "Traditional agents output JSON; CodeAgents write Python. Code offers better composability but requires sandboxed execution."
      },
      {
        title: "E2B Sandbox Security Model",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Unsafe["Your Environment"]
        APP["Application"]
        SECRETS["API Keys"]
        DATA["Your Data"]
    end

    subgraph Boundary["Security Boundary"]
        API["E2B API"]
    end

    subgraph Safe["E2B Cloud Sandbox"]
        VM["Isolated VM"]
        LIMITS["Resource Limits"]
        NET["Network Blocked"]
    end

    APP -->|"Code only"| API
    API --> VM
    VM -->|"Output only"| API
    API --> APP

    SECRETS -.->|"Never sent"| API
    DATA -.->|"Never sent"| API`,
        caption: "The sandbox receives only code to execute. Secrets and data remain in your environment. Only output crosses the boundary."
      }
    ],

    faq: [
      {
        question: "Why can't I just use Python's exec() or eval() for LLM-generated code?",
        answer: "exec() and eval() run code with full access to your system - filesystem, network, environment variables, everything. LLM-generated code is untrusted and could be malicious due to model errors, prompt injection, or adversarial inputs. A single 'import os; os.system(\"rm -rf /\")' would be catastrophic. Sandboxes provide the isolation that exec() cannot."
      },
      {
        question: "How is E2B different from AutoGen's Docker code execution (Day 11)?",
        answer: "Both provide sandboxed execution, but E2B is a cloud service (faster startup ~300ms, no local Docker needed, managed infrastructure) while AutoGen uses local Docker containers (no external dependency, works offline, no API costs). E2B handles scaling and security patching; Docker requires you to manage container security yourself."
      },
      {
        question: "When should I use CodeAgent vs ToolCallingAgent in smolagents?",
        answer: "Use CodeAgent when tasks involve computation, data manipulation, or complex logic - anything where code's composability helps. Use ToolCallingAgent when you have specific tools with clear interfaces and don't need complex control flow. CodeAgent requires stronger LLMs (GPT-4-class) to generate reliable code; ToolCallingAgent works with smaller models."
      },
      {
        question: "Can I use my own packages in E2B sandboxes?",
        answer: "Yes, in two ways. First, you can run '!pip install package' inside the sandbox, though this adds latency. Second, you can create custom E2B templates with pre-installed packages - these launch instantly with your dependencies ready. For production, custom templates are strongly recommended."
      },
      {
        question: "What happens if my code runs forever in the sandbox?",
        answer: "Both E2B and smolagents enforce execution timeouts. E2B defaults to 30 seconds per execution (configurable). When timeout hits, execution is killed and an error is returned. The sandbox itself also has a lifetime limit. Always set both per-execution and sandbox-level timeouts to prevent runaway costs."
      },
      {
        question: "Is smolagents' LocalPythonExecutor safe enough for production?",
        answer: "The LocalPythonExecutor provides safety improvements over raw exec() - it whitelists imports, blocks dangerous submodules, and caps operations to prevent infinite loops. However, it's not a true sandbox. Determined attackers could potentially escape. For production with untrusted inputs, use E2B, Docker, or Modal sandboxes."
      }
    ],

    applications: [
      {
        title: "Autonomous Data Analysis Agent",
        description: "An agent that receives datasets and analysis questions, writes pandas/numpy code to explore data, generates visualizations, and iterates until it finds insights. Runs entirely in sandbox so arbitrary data processing can't affect production systems."
      },
      {
        title: "Code Generation and Testing Pipeline",
        description: "Given specifications, the agent generates implementation code, writes test cases, executes both, and iterates until tests pass. Each iteration runs in a fresh sandbox to ensure test isolation. Used for automated code review and generation in CI/CD pipelines."
      },
      {
        title: "Interactive Jupyter-Style Assistant",
        description: "A chat interface where users describe computations in natural language. The agent translates to Python, executes in sandbox, returns results with visualizations. Like a Jupyter notebook where you describe cells instead of writing code."
      },
      {
        title: "Automated Bug Reproduction",
        description: "Given a bug report, the agent writes code to reproduce the issue, validates the reproduction, then attempts fixes. All execution happens in sandboxes matching production environment. Accelerates debugging by automating the reproduction step."
      },
      {
        title: "Educational Code Tutor",
        description: "Students describe what they want to learn; the agent generates example code, executes it to show output, then generates exercises. Student solutions are executed in sandboxes and compared against expected outputs. Safe because student code can't affect the learning platform."
      }
    ],

    keyTakeaways: [
      "LLM-generated code is untrusted by definition - sandboxed execution (E2B, Docker, Modal) is mandatory for any production system",
      "E2B provides cloud sandboxes that spin up in milliseconds with isolated filesystem, network, and process space",
      "smolagents CodeAgent writes Python directly instead of JSON tool calls, enabling better composability and leveraging LLM code training",
      "Integration is simple: executor_type='e2b' in smolagents routes all code execution to E2B sandboxes",
      "The iteration loop is key: generate code, execute, capture errors, refine, repeat until success",
      "Always set hard resource limits: execution timeout (30-60s), memory (512MB-1GB), and sandbox lifetime",
      "For multi-agent systems, run the entire agent orchestration inside the sandbox, not just code snippets",
      "Security is defense in depth: sandboxes + resource limits + pattern detection + human review for dangerous operations"
    ],

    resources: [
      {
        title: "E2B Documentation",
        url: "https://e2b.dev/docs",
        type: "docs",
        description: "Complete guide to E2B sandboxes, templates, and Code Interpreter SDK"
      },
      {
        title: "smolagents Documentation",
        url: "https://huggingface.co/docs/smolagents",
        type: "docs",
        description: "Hugging Face's agent library with CodeAgent, ToolCallingAgent, and tools"
      },
      {
        title: "smolagents Secure Execution Tutorial",
        url: "https://huggingface.co/docs/smolagents/tutorials/secure_code_execution",
        type: "tutorial",
        description: "Deep dive on sandboxing options (E2B, Docker, Modal, Blaxel, WASM)"
      },
      {
        title: "E2B GitHub Repository",
        url: "https://github.com/e2b-dev/e2b",
        type: "github",
        description: "E2B SDK source code and examples"
      },
      {
        title: "Executable Code Actions Paper",
        url: "https://arxiv.org/abs/2402.01030",
        type: "paper",
        description: "Research showing code actions outperform JSON tool calls for agent tasks"
      }
    ],

    relatedDays: [3, 11, 23]
  }
};
