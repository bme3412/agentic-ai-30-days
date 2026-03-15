import type { Day } from '../../types';

export const day05: Day = {
  day: 5,
  phase: 1,
  title: "Reflection & Self-Improvement Patterns",
  partner: "IBM / Coursera",
  tags: ["reflection", "reflexion", "self-eval"],
  concept: "Agents that critique and improve their own outputs iteratively",
  demoUrl: "demos/day-5/",
  demoDescription: "Explore three reflection patterns hands-on: Self-Refine (generate-critique-refine loop), Reflexion (learning across attempts with memory), and Constitutional AI (principle-based critique).",
  learn: {
    overview: {
      summary: "Learn how AI agents can critique, evaluate, and iteratively improve their own outputs through reflection patterns.",
      fullDescription: `What if an AI agent could learn from its mistakes—not by retraining, but by reflecting on what went wrong and trying again? This is the promise of reflection patterns, a family of techniques that give agents the ability to self-improve during inference.

The core insight is surprisingly simple: language models are often better at *identifying* problems than *avoiding* them in the first place. By separating generation from evaluation, we can leverage this asymmetry. An agent generates an output, critiques it, and then refines based on that critique—all without any weight updates or fine-tuning.

Three landmark papers define this space:

**Reflexion** (2023) introduced verbal reinforcement learning, where agents learn from failures by generating natural language reflections and storing them in memory. On coding tasks, Reflexion improved GPT-4's pass rate from 80% to 91% through self-reflection alone.

**Self-Refine** (2023) showed that a single model can play three roles—generator, critic, and refiner—achieving 15-30% improvements across diverse tasks through iterative refinement.

**Constitutional AI** (2022) demonstrated that models can critique their outputs against explicit principles, enabling scalable alignment without constant human oversight.

But there's a critical caveat: self-correction doesn't always work. Research has shown that on pure reasoning tasks, asking models to "check their work" can actually decrease accuracy. The key is **external grounding**—self-correction needs signals beyond the model's own assessment to be reliable.

This day explores when and how to use reflection patterns effectively. You'll learn the architectural patterns that make self-improvement work, understand the conditions required for successful self-correction, and build agents that genuinely learn from their mistakes.`,
      prerequisites: ["Day 1-4: Agent fundamentals, tool use, and the ReAct pattern", "Understanding of the basic agent loop", "Familiarity with prompt engineering"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },
    concepts: [
      {
        title: "The Recognition-Generation Gap",
        description: `LLMs are often better critics than creators. When generating, the model juggles syntax, logic, and edge cases simultaneously. When critiquing, it focuses on one task: finding problems. By separating these roles, we leverage the model's strength at recognition to improve its generation.`,
        analogy: "Like a writer who produces rough drafts but edits sharply—creating and critiquing are different skills."
      },
      {
        title: "Reflexion: Learning Across Attempts",
        description: `Reflexion stores verbal reflections in memory to improve future attempts. When the agent fails, it generates a natural language analysis of what went wrong. On retry, this reflection is included in the prompt, guiding the agent away from previous mistakes.`,
        analogy: "Like keeping a journal of debugging sessions—each failure teaches a lesson you won't repeat.",
        gotchas: ["Requires external environment feedback (test results, not self-assessment)", "Memory can overflow if reflections accumulate without pruning"]
      },
      {
        title: "Self-Refine: Iterate Within One Attempt",
        description: `Self-Refine uses a single model in three roles: generator, critic, and refiner. Generate output → critique it → refine based on feedback → repeat. No memory persists between tasks. Use this for immediate quality improvement when the model can recognize issues in its own output.`,
        analogy: "Like proofreading your own essay multiple times before submission.",
        gotchas: ["Over-refinement can degrade quality—limit iterations", "Works best for surface improvements, not deep reasoning"]
      },
      {
        title: "External Grounding Is Essential",
        description: `Pure self-critique fails because the critic uses the same knowledge that produced the error. Effective critics need external signals: test execution for code, search for facts, validators for format. Without grounding, "check your work" can actually decrease accuracy.`,
        analogy: "A spell-checker catches typos a human eye misses—external tools see what the model can't.",
        gotchas: ["Asking a model to 'review its answer' without external feedback often makes things worse"]
      },
      {
        title: "When Self-Correction Works (and Doesn't)",
        description: `Self-correction works for surface errors (formatting, grammar, style) but fails for reasoning errors. Research shows that on math and logic tasks, "check your work" prompts can decrease accuracy—models change correct answers as often as they fix wrong ones.`,
        gotchas: ["Works: formatting, style, code polish", "Fails: math reasoning, factual claims, logic errors", "Key difference: can the model recognize quality? Use reflection. Does it need knowledge? Use external tools."]
      },
      {
        title: "Constitutional AI: Principle-Based Critique",
        description: `Instead of open-ended "find problems" prompts, Constitutional AI critiques against explicit principles. A constitution like "code must handle errors gracefully" gives the critic focus, consistency, and interpretability. Custom constitutions let you tailor critique to your domain.`,
        analogy: "Like a code review checklist—specific criteria beat vague 'is it good?' questions."
      }
    ],
    codeExamples: [
      {
        title: "Basic Self-Refine Loop",
        language: "python",
        category: "basic",
        code: `from openai import OpenAI

client = OpenAI()

def generate(task: str) -> str:
    """Generate initial output for a task."""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": task}
        ]
    )
    return response.choices[0].message.content

def critique(output: str, task: str) -> str:
    """Critique the output and identify issues."""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": """You are a critical reviewer.
Identify specific issues with the output. Be concrete and actionable.
If there are no significant issues, respond with "APPROVED"."""},
            {"role": "user", "content": f"""
Task: {task}

Output to review:
{output}

Identify any issues with accuracy, completeness, clarity, or correctness.
"""}
        ]
    )
    return response.choices[0].message.content

def refine(output: str, feedback: str, task: str) -> str:
    """Refine the output based on feedback."""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant who improves outputs based on feedback."},
            {"role": "user", "content": f"""
Original task: {task}

Current output:
{output}

Feedback:
{feedback}

Please revise the output to address the feedback. Only change what needs to be changed.
"""}
        ]
    )
    return response.choices[0].message.content

def self_refine(task: str, max_iterations: int = 3) -> str:
    """Self-refine loop: generate, critique, refine."""
    print(f"Task: {task}\\n")

    # Initial generation
    output = generate(task)
    print(f"Initial output:\\n{output}\\n")

    for i in range(max_iterations):
        # Get critique
        feedback = critique(output, task)
        print(f"Iteration {i+1} feedback:\\n{feedback}\\n")

        # Check if approved
        if "APPROVED" in feedback.upper():
            print("Output approved!")
            break

        # Refine based on feedback
        output = refine(output, feedback, task)
        print(f"Refined output:\\n{output}\\n")

    return output

# Example usage
result = self_refine(
    "Write a Python function to check if a string is a palindrome. "
    "Handle edge cases and add a docstring."
)`,
        explanation: "This basic implementation shows the three-role pattern: generate, critique, and refine. The loop continues until the critic approves or max iterations is reached."
      },
      {
        title: "Reflexion with Memory",
        language: "python",
        category: "intermediate",
        code: `from openai import OpenAI
from typing import List, Optional
from dataclasses import dataclass
import subprocess
import tempfile
import os

client = OpenAI()

@dataclass
class Reflection:
    attempt: int
    code: str
    error: str
    reflection: str

class ReflexionAgent:
    """An agent that learns from failures through verbal reflection."""

    def __init__(self, max_attempts: int = 3):
        self.max_attempts = max_attempts
        self.memory: List[Reflection] = []

    def generate_code(self, task: str) -> str:
        """Generate code, conditioning on past reflections."""
        # Build context from past reflections
        reflection_context = ""
        if self.memory:
            reflection_context = "\\n\\nPrevious attempts and lessons learned:\\n"
            for r in self.memory:
                reflection_context += f"""
Attempt {r.attempt}:
Error: {r.error}
Lesson: {r.reflection}
---"""

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"""You are an expert Python programmer.
Write clean, correct code that solves the given task.
{reflection_context}

Return ONLY the Python code, no explanations."""},
                {"role": "user", "content": task}
            ]
        )
        return response.choices[0].message.content.strip()

    def execute_code(self, code: str, test_code: str) -> tuple[bool, str]:
        """Execute code with tests and return (success, output)."""
        full_code = code + "\\n\\n" + test_code

        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(full_code)
            temp_path = f.name

        try:
            result = subprocess.run(
                ['python', temp_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                return True, result.stdout
            else:
                return False, result.stderr
        except subprocess.TimeoutExpired:
            return False, "Execution timed out"
        finally:
            os.unlink(temp_path)

    def reflect(self, code: str, error: str, task: str) -> str:
        """Generate a reflection on what went wrong."""
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are analyzing why code failed.
Be specific about:
1. What exactly went wrong
2. Why the approach was flawed
3. What to do differently next time

Keep it concise but actionable."""},
                {"role": "user", "content": f"""
Task: {task}

Code that failed:
{code}

Error:
{error}

What went wrong and what should be done differently?
"""}
            ]
        )
        return response.choices[0].message.content

    def solve(self, task: str, test_code: str) -> Optional[str]:
        """Attempt to solve a task with reflection-based learning."""
        self.memory = []  # Reset memory for new task

        for attempt in range(1, self.max_attempts + 1):
            print(f"\\n{'='*50}")
            print(f"Attempt {attempt}/{self.max_attempts}")
            print('='*50)

            # Generate code (with memory of past failures)
            code = self.generate_code(task)
            print(f"\\nGenerated code:\\n{code}")

            # Test the code
            success, output = self.execute_code(code, test_code)

            if success:
                print(f"\\n✓ All tests passed!")
                return code
            else:
                print(f"\\n✗ Tests failed:\\n{output}")

                # Reflect on the failure
                reflection = self.reflect(code, output, task)
                print(f"\\nReflection:\\n{reflection}")

                # Store in memory for next attempt
                self.memory.append(Reflection(
                    attempt=attempt,
                    code=code,
                    error=output,
                    reflection=reflection
                ))

        print(f"\\nFailed to solve after {self.max_attempts} attempts")
        return None

# Example usage
agent = ReflexionAgent(max_attempts=3)

task = "Write a function called 'two_sum' that takes a list of integers and a target, and returns indices of two numbers that add up to target."

test_code = """
# Test cases
assert two_sum([2, 7, 11, 15], 9) == [0, 1], "Basic case failed"
assert two_sum([3, 2, 4], 6) == [1, 2], "Middle elements failed"
assert two_sum([3, 3], 6) == [0, 1], "Duplicate elements failed"
print("All tests passed!")
"""

solution = agent.solve(task, test_code)`,
        explanation: "This Reflexion implementation stores verbal reflections in memory. Each failed attempt generates a lesson that informs the next attempt. The key is that test execution provides external grounding for the reflection."
      },
      {
        title: "Constitutional Critique",
        language: "python",
        category: "intermediate",
        code: `from openai import OpenAI
from typing import List
from dataclasses import dataclass

client = OpenAI()

@dataclass
class ConstitutionalCritique:
    principle_index: int
    principle: str
    violation: str
    suggestion: str

class ConstitutionalReviewer:
    """Reviews outputs against a set of principles."""

    def __init__(self, constitution: List[str]):
        self.constitution = constitution

    def critique(self, output: str, context: str = "") -> List[ConstitutionalCritique]:
        """Evaluate output against all principles."""
        principles_text = "\\n".join(
            f"{i+1}. {p}" for i, p in enumerate(self.constitution)
        )

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are a constitutional reviewer.
Evaluate the output against each principle listed.
For each violation, provide a structured critique.
If a principle is satisfied, skip it.

Format your response as a list of violations:
PRINCIPLE [number]: [principle text]
VIOLATION: [what violates it]
SUGGESTION: [how to fix]
---

If no violations, respond with: NO VIOLATIONS FOUND"""},
                {"role": "user", "content": f"""
Context: {context}

Output to review:
{output}

Principles to check:
{principles_text}
"""}
            ]
        )

        return self._parse_critiques(response.choices[0].message.content)

    def _parse_critiques(self, response: str) -> List[ConstitutionalCritique]:
        """Parse the structured critique response."""
        if "NO VIOLATIONS" in response.upper():
            return []

        critiques = []
        sections = response.split("---")

        for section in sections:
            if "PRINCIPLE" not in section:
                continue

            lines = section.strip().split("\\n")
            principle_line = next((l for l in lines if "PRINCIPLE" in l), "")
            violation_line = next((l for l in lines if "VIOLATION" in l), "")
            suggestion_line = next((l for l in lines if "SUGGESTION" in l), "")

            # Extract principle number
            import re
            match = re.search(r"PRINCIPLE\\s*(\\d+)", principle_line)
            if match:
                idx = int(match.group(1)) - 1
                critiques.append(ConstitutionalCritique(
                    principle_index=idx,
                    principle=self.constitution[idx] if idx < len(self.constitution) else "",
                    violation=violation_line.replace("VIOLATION:", "").strip(),
                    suggestion=suggestion_line.replace("SUGGESTION:", "").strip()
                ))

        return critiques

    def revise(self, output: str, critiques: List[ConstitutionalCritique], context: str = "") -> str:
        """Revise output to address constitutional violations."""
        if not critiques:
            return output

        critique_text = "\\n\\n".join(
            f"Violation of '{c.principle}':\\n{c.violation}\\nFix: {c.suggestion}"
            for c in critiques
        )

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Revise the output to address the violations while maintaining the original intent."},
                {"role": "user", "content": f"""
Context: {context}

Original output:
{output}

Violations to address:
{critique_text}

Provide the revised output:
"""}
            ]
        )
        return response.choices[0].message.content

# Example: Code review constitution
code_constitution = [
    "Code must not contain hardcoded secrets, API keys, or passwords",
    "Code must handle errors gracefully with try/except blocks",
    "Functions must have docstrings explaining their purpose",
    "SQL queries must use parameterized queries to prevent injection",
    "User input must be validated before use"
]

reviewer = ConstitutionalReviewer(code_constitution)

# Example code to review
code_output = """
def get_user(user_id):
    api_key = "sk-1234567890abcdef"
    query = f"SELECT * FROM users WHERE id = {user_id}"
    result = db.execute(query)
    return result
"""

# Critique against constitution
critiques = reviewer.critique(code_output, context="Database access function")

print("Constitutional Review Results:")
print("=" * 50)
for c in critiques:
    print(f"\\nViolation of principle: {c.principle}")
    print(f"Issue: {c.violation}")
    print(f"Suggestion: {c.suggestion}")

# Revise to address violations
if critiques:
    revised = reviewer.revise(code_output, critiques, context="Database access function")
    print("\\n" + "=" * 50)
    print("Revised code:")
    print(revised)`,
        explanation: "This implementation uses a constitution (list of principles) to guide critique. It's more focused than open-ended review and produces consistent, principled feedback."
      },
      {
        title: "Grounded Critic with Tool Use",
        language: "python",
        category: "advanced",
        code: `from openai import OpenAI
from typing import Dict, Any, Optional
import subprocess
import json
import re

client = OpenAI()

class GroundedCritic:
    """A critic that uses external tools to verify claims and code."""

    def __init__(self):
        self.tools = {
            "run_python": self._run_python,
            "check_facts": self._check_facts,
            "validate_json": self._validate_json,
        }

    def _run_python(self, code: str) -> str:
        """Execute Python code and return output or error."""
        try:
            result = subprocess.run(
                ['python', '-c', code],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                return f"Success: {result.stdout}"
            else:
                return f"Error: {result.stderr}"
        except Exception as e:
            return f"Execution failed: {str(e)}"

    def _check_facts(self, claim: str) -> str:
        """Simulate fact-checking (in production, use search API)."""
        # In production, this would call a search API
        return f"[Fact check for: {claim}] - Requires external verification"

    def _validate_json(self, json_str: str) -> str:
        """Validate JSON syntax."""
        try:
            json.loads(json_str)
            return "Valid JSON"
        except json.JSONDecodeError as e:
            return f"Invalid JSON: {str(e)}"

    def critique_with_tools(self, output: str, output_type: str) -> Dict[str, Any]:
        """Critique output using appropriate tools for grounding."""

        # First, get initial critique
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"""You are a critic reviewing {output_type} output.
Identify claims or code that should be verified.
For each item to verify, specify:
- VERIFY_CODE: [python code to test]
- VERIFY_FACT: [claim to fact-check]
- VERIFY_JSON: [json to validate]

Then provide your overall assessment."""},
                {"role": "user", "content": f"Output to review:\\n{output}"}
            ]
        )

        critique_text = response.choices[0].message.content
        verifications = []

        # Extract and run verifications
        for match in re.finditer(r"VERIFY_CODE:\\s*(.+?)(?=VERIFY_|$)", critique_text, re.DOTALL):
            code = match.group(1).strip().strip('\`')
            result = self._run_python(code)
            verifications.append({"type": "code", "input": code, "result": result})

        for match in re.finditer(r"VERIFY_JSON:\\s*(.+?)(?=VERIFY_|$)", critique_text, re.DOTALL):
            json_str = match.group(1).strip()
            result = self._validate_json(json_str)
            verifications.append({"type": "json", "input": json_str, "result": result})

        # Generate final grounded critique
        if verifications:
            verification_summary = "\\n".join(
                f"- {v['type']}: {v['result']}" for v in verifications
            )

            final_response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Provide a final critique based on the verification results."},
                    {"role": "user", "content": f"""
Original output:
{output}

Verification results:
{verification_summary}

Provide your grounded critique, citing the verification results.
"""}
                ]
            )
            final_critique = final_response.choices[0].message.content
        else:
            final_critique = critique_text

        return {
            "output": output,
            "verifications": verifications,
            "critique": final_critique
        }

# Example usage
critic = GroundedCritic()

# Critique some code
code_output = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# This returns 55 for fibonacci(10)
"""

result = critic.critique_with_tools(code_output, "Python code")

print("Grounded Critique Results:")
print("=" * 50)
print(f"\\nVerifications performed: {len(result['verifications'])}")
for v in result['verifications']:
    print(f"  - {v['type']}: {v['result'][:100]}...")
print(f"\\nFinal critique:\\n{result['critique']}")`,
        explanation: "This advanced example shows a critic that uses external tools (code execution, JSON validation, fact-checking) to ground its critique in reality. This addresses the limitation that pure self-critique lacks external signals."
      }
    ],
    diagrams: [
      {
        title: "Self-Refine vs. Reflexion",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph SelfRefine[Self-Refine]
        g1[Generate] --> c1[Critique] --> r1[Refine]
        r1 --> g1
    end
    subgraph Reflexion
        a2[Act] --> e2[Evaluate] --> ref2[Reflect] --> m2[Memory]
        m2 --> a2
    end

    style g1 fill:#3b82f6,color:#fff
    style a2 fill:#00d084,color:#000
    style m2 fill:#8b5cf6,color:#fff`,
        caption: "Self-Refine iterates within one attempt without memory. Reflexion learns across attempts by storing reflections, crucially relying on environment feedback."
      },
      {
        title: "When Self-Correction Works",
        type: "mermaid",
        mermaid: `flowchart TB
    error[Error Type?] --> surface[Surface Errors]
    error --> logic[Logic Errors]
    error --> factual[Factual Errors]
    surface --> works[Works - Self-Refine]
    logic --> external[Needs External Verification]
    factual --> search[Needs Fact-Check]

    style works fill:#00d084,color:#000
    style external fill:#ff9500,color:#000
    style search fill:#ef4444,color:#fff`,
        caption: "Self-correction effectiveness depends on error type. Surface errors can be self-corrected; logical and factual errors require external verification."
      }
    ],
    keyTakeaways: [
      "Self-correction works for surface errors (formatting, style) but fails for reasoning without external grounding",
      "Reflexion learns across attempts by storing verbal reflections in memory—the environment provides the signal",
      "Self-Refine iterates within one attempt using the same model as generator, critic, and refiner",
      "The critic-in-the-loop architecture separates generation from evaluation for better results",
      "Constitutional AI uses explicit principles to guide focused, consistent critique",
      "External signals (test execution, search, validators) are essential for reliable self-correction",
      "Pure 'check your work' prompting can decrease accuracy on reasoning tasks",
      "Choose the right pattern: Self-Refine for polish, Reflexion for learning, Constitution for alignment"
    ],
    resources: [
      {
        title: "Reflexion Paper",
        url: "https://arxiv.org/abs/2303.11366",
        type: "paper",
        description: "The original paper introducing verbal reinforcement learning for agents",
        summaryPath: "data/day-5/summary-reflexion-paper.md"
      },
      {
        title: "Self-Refine Paper",
        url: "https://arxiv.org/abs/2303.17651",
        type: "paper",
        description: "Iterative refinement with self-feedback using a single model",
        summaryPath: "data/day-5/summary-self-refine.md"
      },
      {
        title: "Constitutional AI Paper",
        url: "https://arxiv.org/abs/2212.08073",
        type: "paper",
        description: "Anthropic's approach to principle-guided self-critique",
        summaryPath: "data/day-5/summary-constitutional-ai.md"
      },
      {
        title: "LLMs Cannot Self-Correct Reasoning Yet",
        url: "https://arxiv.org/abs/2310.01798",
        type: "paper",
        description: "Critical analysis of when self-correction fails",
        summaryPath: "data/day-5/summary-self-correction-llms.md"
      },
      {
        title: "IBM AI Developer Course",
        url: "https://www.coursera.org/learn/building-gen-ai-powered-applications",
        type: "course",
        description: "Building AI-powered applications with self-improvement patterns"
      }
    ],
    localResources: [
      {
        id: "critic-patterns-guide",
        title: "Critic-in-the-Loop Design Patterns",
        description: "Architectural patterns for incorporating critique into agent workflows, including grounding strategies",
        filePath: "data/day-5/summary-critic-in-the-loop.md",
        type: "notes",
        estimatedTime: "20 min read"
      }
    ],
    faq: [
      {
        question: "Why can't LLMs just 'check their work' to improve?",
        answer: "When a model reviews its own work, it's using the same knowledge and biases that produced the original output. Without external feedback (test results, search, validation), there's no new signal to drive improvement. Research shows models 'correct' right answers to wrong ones as often as they fix actual mistakes."
      },
      {
        question: "When should I use Reflexion vs. Self-Refine?",
        answer: "Use Self-Refine for single-attempt quality improvement—like polishing writing or improving code style. Use Reflexion when you have multiple attempts at a task with clear success/failure signals—like coding challenges with test suites. Reflexion's memory helps carry lessons across attempts."
      },
      {
        question: "How do I add external grounding to my critic?",
        answer: "The grounding source depends on your domain: for code, execute tests; for facts, use search or RAG; for format, use validators. The key is that the critic should have access to signals beyond what the generator had—otherwise it can't provide new information."
      },
      {
        question: "Can I use different models for generator and critic?",
        answer: "Yes, and sometimes this helps. A more capable model as critic can catch errors a smaller generator model makes. However, the Self-Refine paper shows even the same model can effectively play both roles due to the different prompting context for each."
      },
      {
        question: "How many iterations should I allow?",
        answer: "Typically 2-4 iterations. Beyond that, you often see diminishing returns or the model starts making unnecessary changes. For Reflexion with external tests, 3-5 attempts is usually sufficient. Always set a maximum to prevent infinite loops."
      }
    ],
    applications: [
      {
        title: "Self-Improving Code Assistant",
        description: "A coding agent that generates solutions, runs tests, reflects on failures, and iteratively improves until all tests pass. The test suite provides external grounding for reliable self-correction."
      },
      {
        title: "Writing Enhancement Agent",
        description: "An agent that drafts content, critiques it against style guidelines (constitution), and refines until meeting quality standards. Works well for emails, documentation, and marketing copy."
      },
      {
        title: "Data Validation Pipeline",
        description: "An agent that generates data transformations, validates outputs against schemas and business rules, and self-corrects when validation fails. External validators provide the grounding signal."
      },
      {
        title: "Conversational Agent with Learning",
        description: "A chatbot that reflects on conversation outcomes (user satisfaction, task completion) and stores lessons for future interactions. Reflexion enables improvement over time without retraining."
      }
    ],
    relatedDays: [1, 2, 3, 4, 6]
  }
};
