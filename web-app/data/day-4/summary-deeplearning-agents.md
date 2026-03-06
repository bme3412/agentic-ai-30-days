# Functions, Tools and Agents with LangChain - DeepLearning.AI

**Focus:** Hands-on course covering function calling, tool use, and agent implementation with LangChain

**Instructor:** Harrison Chase, Co-Founder and CEO of LangChain

**Course Details:**
- Duration: 1 hour 44 minutes
- Level: Intermediate
- 8 video lessons with 6 code examples
- Free to access

## Course Structure

### Lesson 1: Introduction (2 min)
Course overview and learning objectives.

### Lesson 2: OpenAI Function Calling (13 min)
Explores ChatGPT's function calling capability—the foundation for tool use in agents. Learn how models can output structured function calls rather than plain text.

### Lesson 3: LangChain Expression Language - LCEL (16 min)
The new composable syntax for building chains and agents. LCEL uses the `|` (pipe) operator to chain components:
```python
chain = prompt | llm | output_parser
```

### Lesson 4: OpenAI Function Calling in LangChain (12 min)
Integrating OpenAI's function calling with LangChain's abstractions. How to bind functions to models and handle responses within the framework.

### Lesson 5: Tagging and Extraction (24 min)
The longest lesson, covering practical applications of function calling:
- **Tagging**: Classifying and labeling text (sentiment, topics, etc.)
- **Extraction**: Pulling structured data from unstructured text
- Using Pydantic models to define output schemas

### Lesson 6: Tools and Routing (17 min)
Defining tools with the `@tool` decorator and routing requests to appropriate tools:
```python
@tool
def search(query: str) -> str:
    """Search for current information about a topic."""
    return search_api(query)
```

### Lesson 7: Conversational Agent (16 min)
Building functional agents that:
- Maintain conversation history
- Use tools based on context
- Handle multi-turn interactions

### Lesson 8: Conclusion (1 min)
Summary and quiz.

## Key Learning Objectives

1. **Generate structured output** including function calls using LLMs
2. **Apply LCEL** for customizing chains and agents
3. **Execute tagging and data extraction** tasks
4. **Implement tool selection and routing** mechanisms

## Practical Takeaways

- **Function calling is the primitive** - understand it before building agents
- **LCEL is the modern way** - composable, readable chain syntax
- **Extraction is powerful** - turn unstructured text into structured data
- **Tool descriptions matter** - models use them to decide when to call tools
- **Verbose mode for debugging** - see the full thought/action trace

## Connection to ReAct

The course builds toward agents that follow the ReAct pattern—using function calling for actions, LCEL for composition, and conversational memory for multi-turn reasoning. Understanding these LangChain primitives helps when building or debugging ReAct agents.

## Recommended For

Developers comfortable with Python who want hands-on experience with LangChain. Complements Day 3's from-scratch approach by showing the framework abstraction layer.

**Course Link:** [deeplearning.ai/short-courses/functions-tools-agents-langchain](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/)
