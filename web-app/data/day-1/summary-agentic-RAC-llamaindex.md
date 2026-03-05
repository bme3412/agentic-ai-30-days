# Building Agentic RAG with LlamaIndex

Agentic RAG extends traditional retrieval-augmented generation by adding reasoning and decision-making capabilities. Rather than following a fixed pipeline of retrieve-then-generate, an agentic RAG system dynamically decides which tools to use, formulates queries on the fly, and adjusts its approach based on intermediate results. This makes it capable of handling complex, multi-step research questions that would fail with standard RAG.

The simplest form of agentic behavior is routing. A router query engine examines the user's question and selects the most appropriate retrieval strategy. You create different index types—a vector index for specific fact lookup and a summary index that processes all chunks for overview questions—then wrap them as tools with descriptions. The router looks at the query, considers the descriptions, and directs the request to the right engine.

```python
from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core.selectors import LLMSingleSelector

summary_tool = QueryEngineTool.from_defaults(
    query_engine=summary_query_engine,
    description="Useful for summarization questions related to the document"
)

vector_tool = QueryEngineTool.from_defaults(
    query_engine=vector_query_engine,
    description="Useful for retrieving specific context from the document"
)

router = RouterQueryEngine(
    selector=LLMSingleSelector.from_defaults(),
    query_engine_tools=[summary_tool, vector_tool]
)
```

Tool calling adds another layer of capability. Instead of just picking between pre-built query engines, the LLM can select functions and infer their arguments. You wrap Python functions as tools with clear type annotations and docstrings—these become the prompts that guide the model's decisions. The model sees a question like "What are the results on page 2?" and generates a call to your vector search function with both the query string and a page filter it inferred from the question.

```python
from llama_index.core.tools import FunctionTool

def vector_query(query: str, page_numbers: list[str] = None) -> str:
    """Perform vector search with optional page filtering."""
    if page_numbers:
        filters = MetadataFilters.from_dicts([
            {"key": "page_label", "operator": "in", "value": page_numbers}
        ])
        engine = vector_index.as_query_engine(filters=filters)
    else:
        engine = vector_index.as_query_engine()
    return str(engine.query(query))

vector_tool = FunctionTool.from_defaults(fn=vector_query)
response = llm.predict_and_call(
    tools=[vector_tool],
    user_msg="What are the high-level results on page 2?"
)
```

The agent reasoning loop enables true multi-step problem solving. An agent can decompose complex questions, execute multiple tool calls in sequence, and maintain memory of what it has learned. When asked to explain agent roles and how they communicate, the agent calls the summary tool for roles, processes the response, formulates a follow-up query about communication, and synthesizes both results. The chat interface maintains conversational memory so follow-up questions understand earlier context.

```python
from llama_index.core.agent import FunctionCallingAgentWorker, AgentRunner

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=[vector_tool, summary_tool],
    llm=llm,
    verbose=True
)
agent = AgentRunner(agent_worker)

response = agent.chat("Tell me about the agent roles and how they communicate.")
```

LlamaIndex provides a low-level API for debugging and human-in-the-loop control. You can create a task, step through execution one call at a time, inspect intermediate states, and inject human guidance mid-process. This is essential for understanding agent behavior and implementing approval workflows.

Scaling to multiple documents introduces a challenge: stuffing all tool definitions into the prompt causes context overflow and selection confusion. The solution is tool retrieval—creating a vector index over the tools themselves. When a question comes in, you first retrieve the most relevant tools, then give only those to the agent. This lets you build systems that reason across dozens of documents without overwhelming the context window.

```python
from llama_index.core.objects import ObjectIndex

tool_index = ObjectIndex.from_objects(all_tools, index_cls=VectorStoreIndex)
tool_retriever = tool_index.as_retriever(similarity_top_k=3)

agent_worker = FunctionCallingAgentWorker.from_tools(
    tool_retriever=tool_retriever,
    llm=llm
)
```

The progression of capabilities follows a clear path: routing adds decision-making about which engine to use, tool calling adds the ability to select functions and generate arguments, the agent loop adds multi-step reasoning with memory, and tool retrieval enables scaling across many documents. Clear tool descriptions are critical at every level—the LLM's decisions are only as good as the information you provide about each tool.
