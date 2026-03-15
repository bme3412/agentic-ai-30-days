// Day 13: PydanticAI Demo
// Demonstrates Type Safety, Tools, Dependencies, and Validation

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTypeSafetyDemo();
  initToolsDemo();
  initValidationDemo();
  initCodeBuilder();
});

// Tab Navigation
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// Type Safety Demo
function initTypeSafetyDemo() {
  const outputSelect = document.getElementById('output-type');
  const depsSelect = document.getElementById('deps-type');
  const showBtn = document.getElementById('show-types');

  const updateTypes = () => {
    const output = outputSelect.value;
    const deps = depsSelect.value;

    const outputTypes = {
      str: { type: 'str', access: 'result.output  # str' },
      weather: {
        type: 'WeatherReport',
        access: `result.output.temperature  # int
result.output.condition    # str`
      },
      review: {
        type: 'MovieReview',
        access: `result.output.rating    # int (1-10)
result.output.recommend  # bool`
      },
      union: {
        type: 'Union[Success, Error]',
        access: `match result.output:
    case Success(): ...
    case Error(): ...`
      }
    };

    const depsTypes = {
      none: { type: 'None', code: "'openai:gpt-4o'" },
      simple: { type: 'str', code: "'openai:gpt-4o',\n    deps_type=str" },
      dataclass: { type: 'AppDeps', code: "'openai:gpt-4o',\n    deps_type=AppDeps" }
    };

    const o = outputTypes[output];
    const d = depsTypes[deps];

    document.getElementById('agent-def-code').textContent =
      `Agent[${d.type}, ${o.type}](
    ${d.code},
    output_type=${o.type}
)`;

    document.getElementById('result-type-code').textContent =
      `result: AgentRunResult[${o.type}]

# Type-safe access:
${o.access}`;
  };

  outputSelect.addEventListener('change', updateTypes);
  depsSelect.addEventListener('change', updateTypes);
  showBtn.addEventListener('click', updateTypes);
}

// Tools Demo
function initToolsDemo() {
  const generateBtn = document.getElementById('generate-schema');

  generateBtn.addEventListener('click', () => {
    const name = document.getElementById('tool-name').value || 'my_tool';
    const params = document.getElementById('tool-params').value;
    const docstring = document.getElementById('tool-docstring').value;

    const schema = generateSchemaFromInputs(name, params, docstring);
    document.querySelector('#schema-result code').textContent = JSON.stringify(schema, null, 2);
  });
}

function generateSchemaFromInputs(name, paramsText, docstring) {
  // Parse parameters
  const lines = paramsText.split('\n').filter(l => l.trim());
  const properties = {};
  const required = [];

  lines.forEach(line => {
    const match = line.match(/(\w+):\s*(\w+)(?:\s*=\s*(.+))?/);
    if (match) {
      const [, paramName, paramType, defaultVal] = match;

      const typeMap = {
        str: 'string',
        int: 'integer',
        float: 'number',
        bool: 'boolean',
        list: 'array'
      };

      properties[paramName] = {
        type: typeMap[paramType] || 'string'
      };

      // Extract description from docstring
      const descMatch = docstring.match(new RegExp(`${paramName}:\\s*(.+)`, 'i'));
      if (descMatch) {
        properties[paramName].description = descMatch[1].trim();
      }

      if (defaultVal) {
        properties[paramName].default = defaultVal.replace(/["']/g, '');
      } else {
        required.push(paramName);
      }
    }
  });

  // Extract main description from docstring (first line before Args)
  const mainDesc = docstring.split('\n')[0].trim() || `Function ${name}`;

  return {
    name,
    description: mainDesc,
    parameters: {
      type: 'object',
      properties,
      required
    }
  };
}

// Validation Demo
function initValidationDemo() {
  const runBtn = document.getElementById('run-validation');
  const resetBtn = document.getElementById('reset-validation');

  runBtn.addEventListener('click', runValidationDemo);
  resetBtn.addEventListener('click', resetValidationDemo);
}

async function runValidationDemo() {
  const outputSelect = document.getElementById('llm-output');
  const flowContainer = document.getElementById('validation-flow');
  const scenario = outputSelect.value;

  flowContainer.innerHTML = '';

  const steps = getValidationSteps(scenario);

  for (const step of steps) {
    await delay(step.delay || 700);
    addValidationStep(flowContainer, step);
  }
}

function getValidationSteps(scenario) {
  const scenarios = {
    valid: [
      {
        type: 'output',
        label: 'LLM Output',
        content: `<code>{"title": "Inception", "rating": 8, "summary": "A mind-bending thriller...", "recommend": true}</code>`
      },
      {
        type: 'validating',
        label: 'Pydantic Validation',
        content: 'Checking MovieReview schema...'
      },
      {
        type: 'pass',
        label: 'Validation Passed',
        content: `<strong>All constraints satisfied:</strong><br>
        - rating: 8 (1 <= 8 <= 10) &#10004;<br>
        - summary: 24 chars (< 200) &#10004;<br>
        - All required fields present &#10004;`
      }
    ],
    'invalid-rating': [
      {
        type: 'output',
        label: 'LLM Output (Attempt 1)',
        content: `<code>{"title": "Inception", "rating": 15, "summary": "Amazing film!", "recommend": true}</code>`
      },
      {
        type: 'validating',
        label: 'Pydantic Validation',
        content: 'Checking MovieReview schema...'
      },
      {
        type: 'fail',
        label: 'Validation Failed',
        content: `<code>rating: Input should be less than or equal to 10 (got 15)</code>`
      },
      {
        type: 'retry',
        label: 'Retry with Error Feedback',
        content: 'Error message fed back to LLM: "rating must be <= 10"'
      },
      {
        type: 'output',
        label: 'LLM Output (Attempt 2)',
        content: `<code>{"title": "Inception", "rating": 9, "summary": "Amazing film!", "recommend": true}</code>`
      },
      {
        type: 'pass',
        label: 'Validation Passed',
        content: 'LLM self-corrected. Rating now valid: 9 &#10004;'
      }
    ],
    'invalid-summary': [
      {
        type: 'output',
        label: 'LLM Output (Attempt 1)',
        content: `<code>{"title": "Inception", "rating": 9, "summary": "This is an incredibly long summary that goes on and on about the movie, describing every single plot point and character in excessive detail, far exceeding the 200 character limit that was specified in the schema constraints...", "recommend": true}</code>`
      },
      {
        type: 'validating',
        label: 'Pydantic Validation',
        content: 'Checking MovieReview schema...'
      },
      {
        type: 'fail',
        label: 'Validation Failed',
        content: `<code>summary: String should have at most 200 characters (got 254)</code>`
      },
      {
        type: 'retry',
        label: 'Retry with Error Feedback',
        content: 'Error message fed back to LLM: "summary max_length is 200"'
      },
      {
        type: 'output',
        label: 'LLM Output (Attempt 2)',
        content: `<code>{"title": "Inception", "rating": 9, "summary": "A mind-bending thriller about dreams within dreams. Visually stunning with a compelling story.", "recommend": true}</code>`
      },
      {
        type: 'pass',
        label: 'Validation Passed',
        content: 'LLM self-corrected. Summary now 94 chars &#10004;'
      }
    ],
    'missing-field': [
      {
        type: 'output',
        label: 'LLM Output (Attempt 1)',
        content: `<code>{"title": "Inception", "rating": 9, "summary": "Great movie!"}</code>`
      },
      {
        type: 'validating',
        label: 'Pydantic Validation',
        content: 'Checking MovieReview schema...'
      },
      {
        type: 'fail',
        label: 'Validation Failed',
        content: `<code>recommend: Field required</code>`
      },
      {
        type: 'retry',
        label: 'Retry with Error Feedback',
        content: 'Error message fed back to LLM: "Missing required field: recommend"'
      },
      {
        type: 'output',
        label: 'LLM Output (Attempt 2)',
        content: `<code>{"title": "Inception", "rating": 9, "summary": "Great movie!", "recommend": true}</code>`
      },
      {
        type: 'pass',
        label: 'Validation Passed',
        content: 'LLM self-corrected. All fields present &#10004;'
      }
    ]
  };

  return scenarios[scenario] || scenarios.valid;
}

function addValidationStep(container, step) {
  const div = document.createElement('div');
  div.className = `validation-step ${step.type}`;
  div.innerHTML = `
    <div class="vstep-label">${step.label}</div>
    <div class="vstep-content">${step.content}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function resetValidationDemo() {
  document.getElementById('validation-flow').innerHTML =
    '<div class="flow-placeholder">Select an output scenario and click "Run Validation"</div>';
}

// Code Builder
function initCodeBuilder() {
  const patternRadios = document.querySelectorAll('input[name="pattern"]');
  const generateBtn = document.getElementById('generate-code');
  const copyBtn = document.getElementById('copy-code');
  const toolsSection = document.getElementById('tools-section');

  patternRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      toolsSection.style.display = (radio.value === 'basic' || radio.value === 'deps') ? 'block' : 'none';
      generateCode();
    });
  });

  document.querySelectorAll('.builder-config input, .builder-config select').forEach(el => {
    el.addEventListener('change', generateCode);
  });

  generateBtn.addEventListener('click', generateCode);
  copyBtn.addEventListener('click', copyCode);

  generateCode();
}

function generateCode() {
  const pattern = document.querySelector('input[name="pattern"]:checked').value;
  const model = document.getElementById('model-select').value;

  let code = '';

  switch (pattern) {
    case 'basic':
      code = generateBasicCode(model);
      break;
    case 'structured':
      code = generateStructuredCode(model);
      break;
    case 'deps':
      code = generateDepsCode(model);
      break;
    case 'streaming':
      code = generateStreamingCode(model);
      break;
  }

  document.getElementById('generated-code').querySelector('code').textContent = code;
}

function generateBasicCode(model) {
  const tools = [];
  if (document.getElementById('tool-search').checked) tools.push('search_database');
  if (document.getElementById('tool-fetch').checked) tools.push('fetch_user');
  if (document.getElementById('tool-calc').checked) tools.push('calculate');

  const toolDefs = [];
  if (tools.includes('search_database')) {
    toolDefs.push(`@agent.tool
async def search_database(ctx: RunContext, query: str) -> str:
    """Search the database for matching records.

    Args:
        query: The search query
    """
    # Your implementation here
    return f"Found results for: {query}"`);
  }
  if (tools.includes('fetch_user')) {
    toolDefs.push(`@agent.tool
async def fetch_user(ctx: RunContext, user_id: str) -> str:
    """Fetch user details by ID.

    Args:
        user_id: The user's unique identifier
    """
    return f"User {user_id}: John Doe"`);
  }
  if (tools.includes('calculate')) {
    toolDefs.push(`@agent.tool_plain
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression.

    Args:
        expression: Math expression to evaluate
    """
    # In production, use a safe evaluator
    return f"Result: {eval(expression)}"`);
  }

  return `from pydantic_ai import Agent, RunContext

# Create agent
agent = Agent(
    '${model}',
    system_prompt="You are a helpful assistant."
)

# Define tools
${toolDefs.length > 0 ? toolDefs.join('\n\n') : '# No tools selected'}

# Run the agent
result = agent.run_sync("Your message here")
print(result.output)`;
}

function generateStructuredCode(model) {
  return `from pydantic import BaseModel, Field
from pydantic_ai import Agent

# Define structured output type
class AnalysisResult(BaseModel):
    summary: str = Field(description="Brief summary of findings")
    sentiment: str = Field(pattern="^(positive|negative|neutral)$")
    confidence: float = Field(ge=0.0, le=1.0)
    key_points: list[str] = Field(max_length=5)

# Create agent with typed output
agent = Agent(
    '${model}',
    output_type=AnalysisResult,
    retries=2,  # Retry on validation failure
    system_prompt="You analyze text and provide structured insights."
)

# Run and get validated result
result = agent.run_sync("Analyze this customer feedback: ...")

# Type-safe access to output
print(f"Sentiment: {result.output.sentiment}")
print(f"Confidence: {result.output.confidence:.0%}")
for point in result.output.key_points:
    print(f"  - {point}")`;
}

function generateDepsCode(model) {
  const tools = [];
  if (document.getElementById('tool-search').checked) tools.push('search_database');
  if (document.getElementById('tool-fetch').checked) tools.push('fetch_user');
  if (document.getElementById('tool-calc').checked) tools.push('calculate');

  return `from dataclasses import dataclass
import httpx
from pydantic_ai import Agent, RunContext

# Define dependencies
@dataclass
class AppDeps:
    http_client: httpx.AsyncClient
    api_key: str
    user_id: str

# Create agent with dependency type
agent = Agent(
    '${model}',
    deps_type=AppDeps,
    system_prompt="You help users with their account."
)

# Dynamic system prompt using deps
@agent.system_prompt
def add_context(ctx: RunContext[AppDeps]) -> str:
    return f"Current user: {ctx.deps.user_id}"

# Tool that uses dependencies
@agent.tool
async def fetch_profile(ctx: RunContext[AppDeps]) -> str:
    """Fetch the current user's profile."""
    response = await ctx.deps.http_client.get(
        f"/users/{ctx.deps.user_id}",
        headers={"Authorization": f"Bearer {ctx.deps.api_key}"}
    )
    return response.text

# Run with dependencies
async def main():
    async with httpx.AsyncClient() as client:
        deps = AppDeps(
            http_client=client,
            api_key="sk-xxx",
            user_id="user-123"
        )
        result = await agent.run("Get my profile", deps=deps)
        print(result.output)

# Test with override
def test_agent():
    mock_deps = AppDeps(
        http_client=MockClient(),
        api_key="test-key",
        user_id="test-user"
    )
    with agent.override(deps=mock_deps):
        result = agent.run_sync("Get my profile")
        assert "test-user" in result.output`;
}

function generateStreamingCode(model) {
  return `import asyncio
from pydantic import BaseModel, Field
from pydantic_ai import Agent

# Define structured output
class BlogPost(BaseModel):
    title: str
    introduction: str
    sections: list[str]
    conclusion: str

# Create agent with structured output
agent = Agent(
    '${model}',
    output_type=BlogPost,
    system_prompt="You write engaging blog posts."
)

async def stream_blog_post(topic: str):
    """Stream structured output with progressive validation."""
    print(f"Writing about: {topic}\\n")

    async with agent.run_stream(f"Write about {topic}") as response:
        # Stream partial objects as they're generated
        async for partial in response.stream_output():
            if partial.title:
                print(f"Title: {partial.title}")
            if partial.introduction:
                print(f"Intro length: {len(partial.introduction)} chars")

        # Final validated result
        final = response.output
        print(f"\\nCompleted: {len(final.sections)} sections")
        return final

# Run streaming
asyncio.run(stream_blog_post("AI in 2025"))`;
}

function copyCode() {
  const code = document.getElementById('generated-code').querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-code');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy to Clipboard', 2000);
  });
}

// Utilities
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
