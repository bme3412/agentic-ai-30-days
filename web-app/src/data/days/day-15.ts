import type { Day } from '../../types';

export const day15: Day = {
  day: 15,
  phase: 3,
  title: "Building Agentic RAG Systems",
  partner: "LlamaIndex",
  tags: ["agentic-rag", "llamaindex", "retrieval", "query-engine", "tools", "reasoning"],
  concept: "Agents that decide when and how to retrieve information",
  demoUrl: "demos/day-15/",
  demoDescription: "Build and experiment with agentic RAG patterns: query planning, multi-index routing, and tool-augmented retrieval using LlamaIndex.",

  lesson: {
    overview: `Traditional RAG is passive: retrieve documents, stuff them into context, generate a response. It works for simple questions but fails when queries require reasoning about what to retrieve, combining information from multiple sources, or deciding whether retrieval is even necessary.

Agentic RAG transforms retrieval into an active reasoning process. Instead of blindly fetching the top-k documents, an agentic system decides: Should I search? Which index? What query? Should I refine and search again? This transforms RAG from a pipeline into an intelligent decision-making process.

LlamaIndex provides the building blocks for agentic RAG: QueryEngines that encapsulate retrieval strategies, Tools that expose these engines to agents, and agent frameworks that orchestrate reasoning over multiple retrieval sources. The result is systems that can handle complex queries like "Compare the security approaches in our 2023 and 2024 architecture docs" by planning multiple retrievals and synthesizing results.

**Why This Matters**: Simple RAG hits a ceiling quickly. Real-world questions often require reasoning about information needs, querying multiple sources, and iterating on retrieval strategy. Agentic RAG breaks through this ceiling by treating retrieval as a tool that agents can wield intelligently.`,

    principles: [
      {
        title: "Retrieval as a Tool, Not a Pipeline",
        description: "In agentic RAG, retrieval becomes a tool the agent can choose to use (or not). The agent reasons about whether it needs external information, what query to use, and which data source to consult—rather than automatically retrieving for every query."
      },
      {
        title: "Query Planning Before Execution",
        description: "Complex questions often decompose into sub-questions. Agentic RAG systems can plan a retrieval strategy: 'First find X, then use that to search for Y, finally synthesize.' This query planning enables multi-hop reasoning over documents."
      },
      {
        title: "Multi-Index Routing",
        description: "Real applications have multiple data sources: documentation, code, conversations, databases. Agentic RAG routes queries to the appropriate index based on the question type, rather than searching everything or forcing users to specify."
      },
      {
        title: "Iterative Refinement",
        description: "Initial retrieval may not surface the right information. Agentic systems can evaluate retrieved context, reformulate queries, and retrieve again—mimicking how humans search for information iteratively."
      },
      {
        title: "Synthesis Over Concatenation",
        description: "Instead of dumping all retrieved chunks into context, agentic RAG can reason about relevance, resolve contradictions between sources, and synthesize a coherent answer from multiple documents."
      }
    ],

    codeExample: {
      language: "python",
      title: "LlamaIndex Agentic RAG with Query Engine Tools",
      code: `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI

# Load documents from different sources
docs_2023 = SimpleDirectoryReader("./data/docs_2023").load_data()
docs_2024 = SimpleDirectoryReader("./data/docs_2024").load_data()

# Create separate indices for each document set
index_2023 = VectorStoreIndex.from_documents(docs_2023)
index_2024 = VectorStoreIndex.from_documents(docs_2024)

# Create query engines
engine_2023 = index_2023.as_query_engine(similarity_top_k=3)
engine_2024 = index_2024.as_query_engine(similarity_top_k=3)

# Wrap as tools with descriptions for the agent
tools = [
    QueryEngineTool(
        query_engine=engine_2023,
        metadata=ToolMetadata(
            name="docs_2023",
            description="Search 2023 documentation. Use for questions about historical features, old architecture, or comparing with current state."
        )
    ),
    QueryEngineTool(
        query_engine=engine_2024,
        metadata=ToolMetadata(
            name="docs_2024",
            description="Search 2024 documentation. Use for current features, latest architecture, and up-to-date information."
        )
    )
]

# Create ReAct agent that reasons about which tool to use
llm = OpenAI(model="gpt-4o")
agent = ReActAgent.from_tools(tools, llm=llm, verbose=True)

# Agent decides how to handle complex queries
response = agent.chat(
    "How has our authentication system changed between 2023 and 2024?"
)
print(response)`
    },

    diagram: {
      type: "mermaid",
      title: "Agentic RAG Decision Flow",
      mermaid: `flowchart TB
    subgraph Input
        Q[User Query]
    end

    subgraph Agent["ReAct Agent"]
        R[Reason about query]
        P{Need retrieval?}
        S[Select tool/index]
        F[Formulate search query]
        E[Evaluate results]
        RF{Sufficient?}
    end

    subgraph Tools["Query Engine Tools"]
        T1[Index A]
        T2[Index B]
        T3[Index C]
    end

    subgraph Output
        SY[Synthesize answer]
        A[Final Response]
    end

    Q --> R
    R --> P
    P -->|No| SY
    P -->|Yes| S
    S --> F
    F --> T1 & T2 & T3
    T1 & T2 & T3 --> E
    E --> RF
    RF -->|No| F
    RF -->|Yes| SY
    SY --> A`
    },

    keyTakeaways: [
      "Agentic RAG treats retrieval as a tool the agent can reason about, not an automatic step",
      "LlamaIndex QueryEngines encapsulate retrieval logic; wrapping them as Tools exposes them to agents",
      "Multi-index routing lets agents choose the right data source based on query semantics",
      "ReAct agents can plan multi-step retrieval strategies for complex questions",
      "Query refinement allows agents to iterate on retrieval when initial results are insufficient",
      "Tool descriptions are critical—they guide the agent's routing decisions"
    ],

    resources: [
      {
        title: "LlamaIndex Documentation",
        url: "https://docs.llamaindex.ai/",
        type: "docs",
        description: "Official LlamaIndex documentation covering agents, query engines, and tools"
      },
      {
        title: "Building Agentic RAG with LlamaIndex",
        url: "https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex/",
        type: "course",
        description: "DeepLearning.AI course on agentic RAG patterns with LlamaIndex"
      },
      {
        title: "LlamaIndex GitHub",
        url: "https://github.com/run-llama/llama_index",
        type: "github",
        description: "Open-source repository with examples and community contributions"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Agentic RAG transforms retrieval from a passive pipeline into an active reasoning process where agents decide when, how, and what to retrieve.",
      fullDescription: `Traditional Retrieval-Augmented Generation (RAG) follows a fixed pattern: embed the query, find similar documents, stuff them into context, generate. This works for simple questions but breaks down for complex queries that require reasoning about information needs.

Consider the query: "Compare our security architecture from 2023 to 2024 and identify what changed." Traditional RAG would retrieve documents containing "security architecture" but has no mechanism to ensure it gets both 2023 and 2024 information, or to synthesize a comparison. It treats retrieval as a dumb pipe.

Agentic RAG introduces intelligence into the retrieval process. An agent can:
- **Decide if retrieval is needed** (some questions don't require external data)
- **Route to the right index** (2023 docs vs 2024 docs vs code repository)
- **Plan multi-step retrieval** (first find X, then use that context to find Y)
- **Evaluate and refine** (initial results insufficient? reformulate and retry)
- **Synthesize across sources** (combine information from multiple retrievals)

LlamaIndex provides the abstractions that make this possible: QueryEngines encapsulate retrieval strategies, Tools expose engines to agents with semantic descriptions, and ReActAgent orchestrates reasoning over these tools. The result is RAG systems that can handle the kind of complex, multi-faceted questions that humans naturally ask.

This lesson covers building agentic RAG systems from the ground up: creating indices, wrapping them as tools, building agents that reason over multiple sources, and implementing advanced patterns like query decomposition and iterative refinement.`,
      prerequisites: [
        "Basic understanding of RAG concepts (Day 14)",
        "Python fundamentals",
        "Familiarity with vector embeddings and similarity search",
        "OpenAI API key"
      ],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "From Passive RAG to Agentic RAG",
        description: `Traditional RAG is a pipeline: query → embed → retrieve → generate. Every query triggers retrieval, retrieval parameters are fixed, and there's no reasoning about what information is actually needed.

**Passive RAG limitations:**
- Retrieves for every query, even when unnecessary
- Fixed retrieval strategy (always top-k from one index)
- No ability to combine information from multiple sources intelligently
- Can't reformulate queries when initial retrieval fails

\`\`\`python
# Traditional RAG - fixed pipeline
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

docs = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(docs)
query_engine = index.as_query_engine()

# Every query triggers the same retrieval pattern
response = query_engine.query("What is our refund policy?")
\`\`\`

**Agentic RAG** wraps retrieval in tools that agents can reason about:

\`\`\`python
# Agentic RAG - agent decides when/how to retrieve
from llama_index.core.tools import QueryEngineTool
from llama_index.core.agent import ReActAgent

# Retrieval becomes a tool the agent can choose to use
refund_tool = QueryEngineTool.from_defaults(
    query_engine=refund_engine,
    name="refund_policy",
    description="Search refund and return policies. Use for questions about returns, refunds, and exchanges."
)

agent = ReActAgent.from_tools([refund_tool, shipping_tool, product_tool], llm=llm)

# Agent reasons about which tool (if any) to use
response = agent.chat("What's your return policy for electronics?")
\`\`\`

The agent can now decide: "This is a refund question → use refund_policy tool → formulate appropriate query."`,
        analogy: "Passive RAG is like a library with one librarian who always searches the same shelf. Agentic RAG is like having a research assistant who thinks about your question, decides which library section to check, and may search multiple areas before answering.",
        gotchas: [
          "Agentic RAG adds latency—each reasoning step takes time",
          "Tool descriptions matter enormously—vague descriptions lead to poor routing",
          "Not every query needs agentic RAG—simple questions work fine with traditional RAG"
        ]
      },
      {
        title: "LlamaIndex Core Abstractions",
        description: `LlamaIndex provides layered abstractions for building agentic RAG:

**Documents & Nodes**: Raw data gets parsed into Documents, then chunked into Nodes for indexing.

\`\`\`python
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter

# Load documents
docs = SimpleDirectoryReader("./data").load_data()

# Parse into nodes (chunks)
parser = SentenceSplitter(chunk_size=512, chunk_overlap=50)
nodes = parser.get_nodes_from_documents(docs)
\`\`\`

**Indices**: Data structures that enable retrieval. VectorStoreIndex is most common.

\`\`\`python
from llama_index.core import VectorStoreIndex

# Create index (embeds nodes automatically)
index = VectorStoreIndex(nodes)

# Or directly from documents
index = VectorStoreIndex.from_documents(docs)
\`\`\`

**Query Engines**: Wrap indices with retrieval + synthesis logic.

\`\`\`python
# Basic query engine
query_engine = index.as_query_engine(
    similarity_top_k=3,
    response_mode="compact"  # How to synthesize from retrieved nodes
)

response = query_engine.query("Explain the authentication flow")
\`\`\`

**Tools**: Wrap query engines for agent use.

\`\`\`python
from llama_index.core.tools import QueryEngineTool, ToolMetadata

tool = QueryEngineTool(
    query_engine=query_engine,
    metadata=ToolMetadata(
        name="auth_docs",
        description="Search authentication documentation"
    )
)
\`\`\`

**Agents**: Orchestrate reasoning over tools.

\`\`\`python
from llama_index.core.agent import ReActAgent

agent = ReActAgent.from_tools([tool], llm=llm)
\`\`\``,
        gotchas: [
          "Embedding model must be consistent across indexing and querying",
          "Chunk size affects retrieval quality—too small loses context, too large adds noise",
          "Index persistence matters for production—don't rebuild on every request"
        ]
      },
      {
        title: "Building Multi-Index Agentic Systems",
        description: `Real applications have multiple data sources. Agentic RAG shines when routing queries to the appropriate index.

\`\`\`python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI

# Create indices for different document types
api_docs = SimpleDirectoryReader("./data/api").load_data()
tutorials = SimpleDirectoryReader("./data/tutorials").load_data()
changelog = SimpleDirectoryReader("./data/changelog").load_data()

api_index = VectorStoreIndex.from_documents(api_docs)
tutorial_index = VectorStoreIndex.from_documents(tutorials)
changelog_index = VectorStoreIndex.from_documents(changelog)

# Create query engines with appropriate settings
api_engine = api_index.as_query_engine(similarity_top_k=5)
tutorial_engine = tutorial_index.as_query_engine(similarity_top_k=3)
changelog_engine = changelog_index.as_query_engine(similarity_top_k=10)

# Wrap as tools with descriptive metadata
tools = [
    QueryEngineTool(
        query_engine=api_engine,
        metadata=ToolMetadata(
            name="api_reference",
            description="Search API reference documentation. Use for questions about function signatures, parameters, return types, and API endpoints."
        )
    ),
    QueryEngineTool(
        query_engine=tutorial_engine,
        metadata=ToolMetadata(
            name="tutorials",
            description="Search tutorials and guides. Use for how-to questions, step-by-step instructions, and learning materials."
        )
    ),
    QueryEngineTool(
        query_engine=changelog_engine,
        metadata=ToolMetadata(
            name="changelog",
            description="Search version history and changelogs. Use for questions about when features were added, breaking changes, and version differences."
        )
    )
]

# Create agent
llm = OpenAI(model="gpt-4o")
agent = ReActAgent.from_tools(
    tools,
    llm=llm,
    verbose=True,  # See agent's reasoning
    max_iterations=10  # Limit reasoning steps
)

# Test with different query types
print(agent.chat("What parameters does the create_user function accept?"))
# → Agent uses api_reference tool

print(agent.chat("How do I set up authentication for my app?"))
# → Agent uses tutorials tool

print(agent.chat("When was the async API introduced?"))
# → Agent uses changelog tool
\`\`\`

The agent reads tool descriptions and routes appropriately. For complex queries, it may use multiple tools:

\`\`\`python
response = agent.chat(
    "Show me how to use the new batch API that was added in v2.0"
)
# Agent might:
# 1. Search changelog for "batch API v2.0"
# 2. Search api_reference for batch API details
# 3. Search tutorials for usage examples
# 4. Synthesize a complete answer
\`\`\``,
        analogy: "Multi-index routing is like having a reference desk that knows which department to send you to: API questions go to technical reference, how-to questions go to the learning center, version questions go to archives.",
        gotchas: [
          "Overlapping tool descriptions cause confusion—make them distinct",
          "Too many tools slow down reasoning—group related functionality",
          "Agent may use wrong tool if descriptions are ambiguous"
        ]
      },
      {
        title: "Query Decomposition and Planning",
        description: `Complex queries often need to be broken into sub-queries. LlamaIndex provides patterns for query decomposition.

**Sub-Question Query Engine**: Automatically decomposes complex queries.

\`\`\`python
from llama_index.core.query_engine import SubQuestionQueryEngine
from llama_index.core.tools import QueryEngineTool, ToolMetadata

# Create tools from multiple query engines
tools = [
    QueryEngineTool(
        query_engine=revenue_engine,
        metadata=ToolMetadata(
            name="revenue_data",
            description="Search revenue and financial data"
        )
    ),
    QueryEngineTool(
        query_engine=product_engine,
        metadata=ToolMetadata(
            name="product_data",
            description="Search product information and metrics"
        )
    )
]

# Sub-question engine decomposes complex queries
sub_question_engine = SubQuestionQueryEngine.from_defaults(
    query_engine_tools=tools,
    llm=llm
)

# This query gets decomposed into sub-questions
response = sub_question_engine.query(
    "Which product line contributed most to revenue growth in Q3?"
)
# Internally generates:
# - Sub-question 1: "What was the revenue growth in Q3?"
# - Sub-question 2: "What are the product lines and their Q3 revenue?"
# Then synthesizes the final answer
\`\`\`

**Router Query Engine**: Routes to different engines based on query type.

\`\`\`python
from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core.selectors import LLMSingleSelector

router_engine = RouterQueryEngine(
    selector=LLMSingleSelector.from_defaults(llm=llm),
    query_engine_tools=tools
)

# Router decides which engine to use
response = router_engine.query("What's our return policy?")
# LLM selects the most appropriate tool based on query
\`\`\`

**Custom Query Planning**: For complex workflows, define explicit plans.

\`\`\`python
from llama_index.core.agent import ReActAgent

# Agent with explicit planning prompt
planning_prompt = """
When answering complex questions:
1. Identify what information is needed
2. Determine which tools can provide each piece
3. Execute queries in logical order
4. Synthesize information, noting any conflicts
"""

agent = ReActAgent.from_tools(
    tools,
    llm=llm,
    system_prompt=planning_prompt
)
\`\`\``,
        gotchas: [
          "Over-decomposition adds latency—not every query needs sub-questions",
          "Sub-questions can drift from original intent—validate relevance",
          "Router selection can fail for ambiguous queries—provide clear tool descriptions"
        ]
      },
      {
        title: "Iterative Retrieval and Refinement",
        description: `Sometimes the first retrieval doesn't return what's needed. Agentic RAG can evaluate and retry.

\`\`\`python
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import FunctionTool
from llama_index.core import VectorStoreIndex

class IterativeRetriever:
    """Retriever that can refine queries based on results."""

    def __init__(self, index: VectorStoreIndex, llm):
        self.index = index
        self.llm = llm
        self.retriever = index.as_retriever(similarity_top_k=5)

    def retrieve_with_refinement(
        self,
        query: str,
        max_iterations: int = 3
    ) -> str:
        """Retrieve with automatic query refinement if needed."""

        for i in range(max_iterations):
            # Retrieve
            nodes = self.retriever.retrieve(query)

            # Check relevance
            context = "\\n".join([n.text for n in nodes])

            relevance_check = self.llm.complete(
                f"""Given the query: "{query}"

And retrieved context:
{context[:2000]}

Is this context sufficient to answer the query?
Reply with either:
- "SUFFICIENT" if the context answers the query
- "REFINE: <new query>" if we need different information

Response:"""
            ).text.strip()

            if relevance_check.startswith("SUFFICIENT"):
                return context
            elif relevance_check.startswith("REFINE:"):
                query = relevance_check[7:].strip()
                print(f"Refining query to: {query}")
            else:
                return context  # Fallback

        return context  # Return best effort after max iterations

# Wrap as a tool
def search_with_refinement(query: str) -> str:
    """Search documents with automatic query refinement."""
    retriever = IterativeRetriever(index, llm)
    return retriever.retrieve_with_refinement(query)

refinement_tool = FunctionTool.from_defaults(
    fn=search_with_refinement,
    name="smart_search",
    description="Search documents with automatic query refinement. Use when you need thorough, accurate retrieval."
)
\`\`\`

**Built-in refinement with response synthesizers:**

\`\`\`python
from llama_index.core.response_synthesizers import get_response_synthesizer

# Refine mode iterates through nodes
synthesizer = get_response_synthesizer(
    response_mode="refine",
    llm=llm
)

query_engine = index.as_query_engine(
    response_synthesizer=synthesizer
)

# Each node refines the previous answer
response = query_engine.query("Summarize our security architecture")
\`\`\``,
        analogy: "Iterative retrieval is like a researcher who reads initial search results, realizes they need different keywords, and searches again with refined terms until they find what they're looking for.",
        gotchas: [
          "Iteration adds latency—set reasonable max_iterations",
          "Refinement can loop if the information doesn't exist in the index",
          "Monitor token usage—each iteration costs API calls"
        ]
      },
      {
        title: "Building a Complete Agentic RAG System",
        description: `Let's build a complete agentic RAG system that combines multiple patterns.

\`\`\`python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.tools import QueryEngineTool, ToolMetadata, FunctionTool
from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
import os

# Configure LlamaIndex settings
Settings.llm = OpenAI(model="gpt-4o", temperature=0)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

class AgenticRAGSystem:
    """A complete agentic RAG system with multi-index routing."""

    def __init__(self, data_dirs: dict[str, str]):
        """
        Initialize with a mapping of index names to data directories.

        Args:
            data_dirs: {"index_name": "path/to/data", ...}
        """
        self.indices = {}
        self.tools = []

        # Build indices
        for name, path in data_dirs.items():
            if os.path.exists(path):
                docs = SimpleDirectoryReader(path).load_data()
                self.indices[name] = VectorStoreIndex.from_documents(docs)
                print(f"Built index '{name}' with {len(docs)} documents")

        # Create query engine tools
        self._create_tools()

        # Create agent
        self.agent = ReActAgent.from_tools(
            self.tools,
            llm=Settings.llm,
            verbose=True,
            max_iterations=10,
            system_prompt=self._get_system_prompt()
        )

    def _create_tools(self):
        """Create tools from indices with appropriate descriptions."""

        tool_configs = {
            "documentation": {
                "top_k": 5,
                "description": "Search product documentation. Use for feature explanations, architecture details, and technical specifications."
            },
            "api_reference": {
                "top_k": 8,
                "description": "Search API reference. Use for function signatures, parameters, return types, and code examples."
            },
            "tutorials": {
                "top_k": 3,
                "description": "Search tutorials and guides. Use for step-by-step instructions, how-to guides, and learning materials."
            },
            "troubleshooting": {
                "top_k": 5,
                "description": "Search troubleshooting guides. Use for error messages, debugging steps, and known issues."
            }
        }

        for name, index in self.indices.items():
            config = tool_configs.get(name, {"top_k": 5, "description": f"Search {name}"})

            query_engine = index.as_query_engine(
                similarity_top_k=config["top_k"],
                response_mode="compact"
            )

            tool = QueryEngineTool(
                query_engine=query_engine,
                metadata=ToolMetadata(
                    name=name,
                    description=config["description"]
                )
            )
            self.tools.append(tool)

        # Add utility tools
        self.tools.append(self._create_comparison_tool())

    def _create_comparison_tool(self) -> FunctionTool:
        """Tool for comparing information across sources."""

        def compare_sources(query: str, sources: str) -> str:
            """Compare information about a topic across multiple sources."""
            source_list = [s.strip() for s in sources.split(",")]

            results = []
            for source in source_list:
                if source in self.indices:
                    engine = self.indices[source].as_query_engine()
                    response = engine.query(query)
                    results.append(f"**{source}**:\\n{response}")

            if not results:
                return "No valid sources specified."

            return "\\n\\n---\\n\\n".join(results)

        return FunctionTool.from_defaults(
            fn=compare_sources,
            name="compare_sources",
            description="Compare information across multiple sources. Provide the query and comma-separated source names."
        )

    def _get_system_prompt(self) -> str:
        return """You are a helpful assistant with access to multiple documentation sources.

When answering questions:
1. Consider which source(s) are most likely to have the answer
2. Use specific tools rather than searching everything
3. For comparison questions, use multiple tools or the compare_sources tool
4. If initial results are insufficient, try different tools or reformulate your query
5. Synthesize information from multiple sources when needed

Always cite which source(s) you used in your answer."""

    def chat(self, message: str) -> str:
        """Send a message and get a response."""
        response = self.agent.chat(message)
        return str(response)

    def reset(self):
        """Reset conversation history."""
        self.agent.reset()


# Usage
system = AgenticRAGSystem({
    "documentation": "./data/docs",
    "api_reference": "./data/api",
    "tutorials": "./data/tutorials",
    "troubleshooting": "./data/troubleshooting"
})

# Simple routing query
print(system.chat("How do I authenticate API requests?"))

# Multi-source query
print(system.chat("I'm getting a 403 error on the /users endpoint. What could be wrong?"))

# Comparison query
print(system.chat("Compare the sync and async approaches for batch processing"))
\`\`\`

This system demonstrates:
- Multi-index architecture with separate concerns
- Tool descriptions guiding routing
- Custom tools for specialized operations
- Conversation memory across turns
- Agent reasoning about retrieval strategy`,
        gotchas: [
          "Index building can be slow for large document sets—consider persistence",
          "Token limits still apply—very large contexts may need chunking",
          "Agent verbosity helps debugging but should be off in production"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Basic LlamaIndex Setup",
        language: "python",
        category: "basic",
        code: `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

# Configure global settings
Settings.llm = OpenAI(model="gpt-4o")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# Load documents
documents = SimpleDirectoryReader("./data").load_data()
print(f"Loaded {len(documents)} documents")

# Build index (automatically embeds documents)
index = VectorStoreIndex.from_documents(documents)

# Create query engine
query_engine = index.as_query_engine(similarity_top_k=3)

# Query
response = query_engine.query("What is the main topic of these documents?")
print(response)`,
        explanation: "Basic LlamaIndex workflow: configure LLM and embedding model, load documents, build a vector index, create a query engine, and query. This is the foundation for more complex agentic patterns."
      },
      {
        title: "Creating Query Engine Tools",
        language: "python",
        category: "basic",
        code: `from llama_index.core.tools import QueryEngineTool, ToolMetadata

# Assume we have query engines for different document sets
policy_engine = policy_index.as_query_engine(similarity_top_k=5)
product_engine = product_index.as_query_engine(similarity_top_k=3)
support_engine = support_index.as_query_engine(similarity_top_k=5)

# Wrap as tools with descriptive metadata
policy_tool = QueryEngineTool(
    query_engine=policy_engine,
    metadata=ToolMetadata(
        name="company_policies",
        description="Search company policies including HR policies, security policies, and operational guidelines. Use for questions about rules, procedures, and compliance."
    )
)

product_tool = QueryEngineTool(
    query_engine=product_engine,
    metadata=ToolMetadata(
        name="product_catalog",
        description="Search product information including features, pricing, and specifications. Use for questions about what products do and their capabilities."
    )
)

support_tool = QueryEngineTool(
    query_engine=support_engine,
    metadata=ToolMetadata(
        name="support_articles",
        description="Search customer support articles and FAQs. Use for troubleshooting, how-to questions, and common issues."
    )
)

tools = [policy_tool, product_tool, support_tool]`,
        explanation: "QueryEngineTool wraps a query engine for agent use. The ToolMetadata description is critical—it guides the agent's decision about when to use each tool."
      },
      {
        title: "ReAct Agent with Multiple Tools",
        language: "python",
        category: "intermediate",
        code: `from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI

# Create LLM
llm = OpenAI(model="gpt-4o", temperature=0)

# Create ReAct agent with tools
agent = ReActAgent.from_tools(
    tools,  # List of QueryEngineTool objects
    llm=llm,
    verbose=True,  # Print reasoning steps
    max_iterations=10,  # Prevent infinite loops
    system_prompt="""You are a helpful customer service assistant.

Use the available tools to answer questions accurately:
- company_policies: For rules and procedures
- product_catalog: For product information
- support_articles: For troubleshooting

Always base your answers on information from the tools.
If you can't find relevant information, say so clearly."""
)

# Interactive chat
print("Agent ready. Type 'quit' to exit.")
while True:
    user_input = input("You: ")
    if user_input.lower() == 'quit':
        break

    response = agent.chat(user_input)
    print(f"Agent: {response}")
    print("-" * 50)`,
        explanation: "ReActAgent uses the Reason-Act pattern to decide which tools to use. With verbose=True, you can see the agent's reasoning process. The system prompt provides context for how to use the tools."
      },
      {
        title: "Sub-Question Query Engine",
        language: "python",
        category: "intermediate",
        code: `from llama_index.core.query_engine import SubQuestionQueryEngine
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.llms.openai import OpenAI

# Create tools from query engines
tools = [
    QueryEngineTool(
        query_engine=sales_engine,
        metadata=ToolMetadata(
            name="sales_data",
            description="Contains sales figures, revenue data, and transaction records"
        )
    ),
    QueryEngineTool(
        query_engine=marketing_engine,
        metadata=ToolMetadata(
            name="marketing_data",
            description="Contains campaign performance, ad spend, and marketing metrics"
        )
    ),
    QueryEngineTool(
        query_engine=customer_engine,
        metadata=ToolMetadata(
            name="customer_data",
            description="Contains customer feedback, surveys, and satisfaction scores"
        )
    )
]

# Create sub-question query engine
llm = OpenAI(model="gpt-4o")
sub_question_engine = SubQuestionQueryEngine.from_defaults(
    query_engine_tools=tools,
    llm=llm,
    verbose=True  # See decomposition
)

# Complex query that requires multiple sources
response = sub_question_engine.query(
    "How did our Q3 marketing campaigns impact customer satisfaction and sales?"
)

# The engine automatically:
# 1. Decomposes into sub-questions
# 2. Routes each to appropriate tool
# 3. Synthesizes final answer
print(response)`,
        explanation: "SubQuestionQueryEngine automatically breaks complex queries into simpler sub-questions, routes each to the appropriate tool, and synthesizes a comprehensive answer. Great for analytical questions spanning multiple data sources."
      },
      {
        title: "Custom Function Tools",
        language: "python",
        category: "intermediate",
        code: `from llama_index.core.tools import FunctionTool
from llama_index.core.agent import ReActAgent
from datetime import datetime
import json

# Custom function tools give agents additional capabilities

def get_current_date() -> str:
    """Get the current date and time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def calculate_percentage(part: float, whole: float) -> str:
    """Calculate what percentage 'part' is of 'whole'."""
    if whole == 0:
        return "Error: Cannot divide by zero"
    percentage = (part / whole) * 100
    return f"{part} is {percentage:.2f}% of {whole}"

def format_as_table(data: str) -> str:
    """Format JSON data as a readable table."""
    try:
        parsed = json.loads(data)
        if isinstance(parsed, list):
            if not parsed:
                return "Empty data"
            headers = list(parsed[0].keys())
            rows = [[str(item.get(h, "")) for h in headers] for item in parsed]

            # Simple table formatting
            col_widths = [max(len(h), max(len(r[i]) for r in rows)) for i, h in enumerate(headers)]
            header_row = " | ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers))
            separator = "-+-".join("-" * w for w in col_widths)
            data_rows = "\\n".join(" | ".join(r[i].ljust(col_widths[i]) for i in range(len(headers))) for r in rows)

            return f"{header_row}\\n{separator}\\n{data_rows}"
        return str(parsed)
    except json.JSONDecodeError:
        return "Error: Invalid JSON data"

# Create function tools
date_tool = FunctionTool.from_defaults(
    fn=get_current_date,
    name="get_current_date",
    description="Get the current date and time. Use when user asks about today's date or needs timestamp."
)

calc_tool = FunctionTool.from_defaults(
    fn=calculate_percentage,
    name="calculate_percentage",
    description="Calculate percentage. Parameters: part (numerator), whole (denominator)."
)

table_tool = FunctionTool.from_defaults(
    fn=format_as_table,
    name="format_table",
    description="Format JSON array data as a readable table. Parameter: data (JSON string)."
)

# Combine with query engine tools
all_tools = query_engine_tools + [date_tool, calc_tool, table_tool]

agent = ReActAgent.from_tools(all_tools, llm=llm, verbose=True)

# Agent can now use both retrieval and computation
response = agent.chat("What percentage of Q3 sales came from enterprise customers?")`,
        explanation: "FunctionTool lets you add arbitrary Python functions as agent tools. Combine with QueryEngineTool to create agents that can both retrieve information and perform computations or transformations."
      },
      {
        title: "Persistent Index with ChromaDB",
        language: "python",
        category: "advanced",
        code: `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

# Create or connect to persistent ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection("my_documents")

# Create vector store
vector_store = ChromaVectorStore(chroma_collection=collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# Check if we need to build or can load existing
if collection.count() == 0:
    # First time: load and index documents
    print("Building new index...")
    documents = SimpleDirectoryReader("./data").load_data()
    index = VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context
    )
    print(f"Indexed {len(documents)} documents")
else:
    # Subsequent runs: load existing index
    print(f"Loading existing index with {collection.count()} vectors...")
    index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store,
        storage_context=storage_context
    )

# Use the index
query_engine = index.as_query_engine(similarity_top_k=5)
response = query_engine.query("What are the main features?")
print(response)`,
        explanation: "For production, persist indices to avoid rebuilding on every restart. ChromaDB provides local persistence. LlamaIndex also supports Weaviate, Pinecone, and other vector stores for production deployments."
      },
      {
        title: "Complete Agentic RAG Pipeline",
        language: "python",
        category: "advanced",
        code: `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.tools import QueryEngineTool, ToolMetadata, FunctionTool
from llama_index.core.agent import ReActAgent
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from typing import Optional
import os

class ProductionAgenticRAG:
    """Production-ready agentic RAG system."""

    def __init__(
        self,
        data_paths: dict[str, str],
        persist_dir: Optional[str] = None
    ):
        # Configure settings
        Settings.llm = OpenAI(model="gpt-4o", temperature=0)
        Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
        Settings.node_parser = SentenceSplitter(
            chunk_size=512,
            chunk_overlap=50
        )

        self.persist_dir = persist_dir
        self.indices = {}
        self.conversation_history = []

        # Build or load indices
        for name, path in data_paths.items():
            self.indices[name] = self._build_or_load_index(name, path)

        # Create agent
        self.agent = self._create_agent()

    def _build_or_load_index(
        self,
        name: str,
        data_path: str
    ) -> VectorStoreIndex:
        """Build new index or load from persistence."""

        persist_path = None
        if self.persist_dir:
            persist_path = os.path.join(self.persist_dir, name)

            if os.path.exists(persist_path):
                print(f"Loading persisted index: {name}")
                from llama_index.core import load_index_from_storage
                from llama_index.core import StorageContext
                storage_context = StorageContext.from_defaults(persist_dir=persist_path)
                return load_index_from_storage(storage_context)

        # Build new index
        print(f"Building index: {name}")
        documents = SimpleDirectoryReader(data_path).load_data()
        index = VectorStoreIndex.from_documents(documents)

        if persist_path:
            os.makedirs(persist_path, exist_ok=True)
            index.storage_context.persist(persist_dir=persist_path)
            print(f"Persisted index to: {persist_path}")

        return index

    def _create_agent(self) -> ReActAgent:
        """Create agent with all tools."""

        tools = []

        # Query engine tools
        for name, index in self.indices.items():
            engine = index.as_query_engine(similarity_top_k=5)
            tool = QueryEngineTool(
                query_engine=engine,
                metadata=ToolMetadata(
                    name=name,
                    description=f"Search {name.replace('_', ' ')} documentation"
                )
            )
            tools.append(tool)

        # Conversation memory tool
        def get_conversation_context(n: int = 5) -> str:
            """Get recent conversation history."""
            recent = self.conversation_history[-n:]
            if not recent:
                return "No previous conversation."
            return "\\n".join([
                f"{msg['role']}: {msg['content']}"
                for msg in recent
            ])

        memory_tool = FunctionTool.from_defaults(
            fn=get_conversation_context,
            name="conversation_memory",
            description="Retrieve recent conversation history for context. Use when user references previous discussion."
        )
        tools.append(memory_tool)

        return ReActAgent.from_tools(
            tools,
            llm=Settings.llm,
            verbose=False,
            max_iterations=15,
            system_prompt=self._system_prompt()
        )

    def _system_prompt(self) -> str:
        return """You are a knowledgeable assistant with access to documentation.

Guidelines:
1. Search relevant documentation to answer questions accurately
2. Cite sources when providing information
3. Use conversation_memory for context when user references previous discussion
4. If information isn't in the documentation, say so clearly
5. For complex questions, break them down and search multiple sources

Be helpful, accurate, and concise."""

    def chat(self, message: str) -> str:
        """Process a chat message."""

        # Store user message
        self.conversation_history.append({
            "role": "user",
            "content": message
        })

        # Get response
        response = self.agent.chat(message)
        response_text = str(response)

        # Store assistant response
        self.conversation_history.append({
            "role": "assistant",
            "content": response_text
        })

        return response_text

    def reset(self):
        """Reset conversation state."""
        self.conversation_history.clear()
        self.agent.reset()


# Usage
rag_system = ProductionAgenticRAG(
    data_paths={
        "product_docs": "./data/products",
        "api_reference": "./data/api",
        "tutorials": "./data/tutorials"
    },
    persist_dir="./index_cache"
)

# Interactive session
response = rag_system.chat("How do I authenticate API requests?")
print(response)

response = rag_system.chat("Can you show me an example of that?")
print(response)`,
        explanation: "This production-ready system includes index persistence (don't rebuild every time), conversation memory (context across turns), configurable settings, and a clean interface. Ready to extend with logging, error handling, and rate limiting."
      }
    ],

    diagrams: [
      {
        title: "Agentic RAG vs Traditional RAG",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Traditional["Traditional RAG"]
        TQ[Query] --> TE[Embed]
        TE --> TR[Retrieve Top-K]
        TR --> TC[Context]
        TC --> TG[Generate]
    end

    subgraph Agentic["Agentic RAG"]
        AQ[Query] --> AR[Reason]
        AR --> AD{Decide}
        AD -->|Need info| AS[Select Tool]
        AD -->|No retrieval| AG
        AS --> AF[Formulate Query]
        AF --> AT[Retrieve]
        AT --> AE{Evaluate}
        AE -->|Insufficient| AF
        AE -->|Good| AG[Generate]
    end`,
        caption: "Traditional RAG follows a fixed pipeline. Agentic RAG reasons about retrieval needs, selects appropriate sources, and can iterate when results are insufficient."
      },
      {
        title: "LlamaIndex Architecture",
        type: "mermaid",
        mermaid: `flowchart TB
    subgraph Data["Data Layer"]
        D[Documents] --> N[Nodes/Chunks]
    end

    subgraph Index["Index Layer"]
        N --> V[(Vector Index)]
        N --> K[(Keyword Index)]
        N --> G[(Graph Index)]
    end

    subgraph Query["Query Layer"]
        V --> QE1[Query Engine]
        K --> QE2[Query Engine]
        G --> QE3[Query Engine]
    end

    subgraph Tools["Tool Layer"]
        QE1 --> T1[Tool]
        QE2 --> T2[Tool]
        QE3 --> T3[Tool]
    end

    subgraph Agent["Agent Layer"]
        T1 --> A[ReAct Agent]
        T2 --> A
        T3 --> A
        A --> R[Response]
    end`,
        caption: "LlamaIndex provides layered abstractions: Documents become Nodes, indexed for retrieval, wrapped in QueryEngines, exposed as Tools, orchestrated by Agents."
      },
      {
        title: "Query Decomposition Flow",
        type: "mermaid",
        mermaid: `flowchart TB
    Q["Complex Query:<br/>How did Q3 marketing affect sales?"]

    Q --> D[Decompose]

    D --> SQ1["Sub-Q1: Q3 marketing campaigns?"]
    D --> SQ2["Sub-Q2: Q3 sales figures?"]
    D --> SQ3["Sub-Q3: Customer acquisition cost?"]

    SQ1 --> T1[Marketing Tool]
    SQ2 --> T2[Sales Tool]
    SQ3 --> T3[Finance Tool]

    T1 --> R1[Results]
    T2 --> R2[Results]
    T3 --> R3[Results]

    R1 --> S[Synthesize]
    R2 --> S
    R3 --> S

    S --> A[Comprehensive Answer]`,
        caption: "Sub-question decomposition breaks complex queries into simpler parts, routes each to the appropriate tool, and synthesizes results into a complete answer."
      }
    ],

    keyTakeaways: [
      "Agentic RAG treats retrieval as a tool that agents reason about, not an automatic pipeline step",
      "LlamaIndex QueryEngines encapsulate retrieval; wrapping as Tools exposes them to agents",
      "Tool descriptions guide routing—make them specific and distinct",
      "ReActAgent reasons through Thought → Action → Observation cycles",
      "SubQuestionQueryEngine automatically decomposes complex queries",
      "Combine QueryEngineTool with FunctionTool for agents that can retrieve and compute",
      "Persist indices in production to avoid rebuilding on restart",
      "Conversation memory enables multi-turn context in agent interactions"
    ],

    resources: [
      {
        title: "LlamaIndex Documentation",
        url: "https://docs.llamaindex.ai/",
        type: "docs",
        description: "Official LlamaIndex documentation with guides, API reference, and examples"
      },
      {
        title: "Building Agentic RAG with LlamaIndex",
        url: "https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex/",
        type: "course",
        description: "DeepLearning.AI course covering agentic RAG patterns with LlamaIndex"
      },
      {
        title: "LlamaIndex GitHub Repository",
        url: "https://github.com/run-llama/llama_index",
        type: "github",
        description: "Open-source repository with examples, integrations, and community contributions"
      },
      {
        title: "RAG and Agents: LlamaIndex Guide",
        url: "https://docs.llamaindex.ai/en/stable/understanding/putting_it_all_together/agents/",
        type: "docs",
        description: "LlamaIndex guide on building agents with query engine tools"
      }
    ],

    faq: [
      {
        question: "When should I use agentic RAG vs traditional RAG?",
        answer: "Use traditional RAG for simple, single-source queries where fixed top-k retrieval works well. Use agentic RAG when queries might need multiple sources, when the retrieval strategy should vary by query type, or when some queries don't need retrieval at all. Agentic RAG adds latency but handles complex queries better."
      },
      {
        question: "How does LlamaIndex compare to LangChain for RAG?",
        answer: "LlamaIndex is RAG-focused with sophisticated indexing, retrieval modes, and query engines. LangChain is a broader agent framework. They complement each other—many projects use LlamaIndex for document indexing within a LangChain agent. LlamaIndex's native agent support has grown significantly, making it a complete solution for RAG-heavy applications."
      },
      {
        question: "What's the cost of agentic RAG?",
        answer: "Agentic RAG costs more than traditional RAG due to: (1) agent reasoning tokens for deciding which tools to use, (2) potentially multiple retrieval calls, (3) possibly multiple LLM calls for complex queries. For simple queries, overhead might double costs. For complex queries requiring multiple sources, agentic RAG is more efficient because it retrieves only what's needed."
      },
      {
        question: "How do I debug agent tool selection?",
        answer: "Set verbose=True on ReActAgent to see the Thought/Action/Observation reasoning chain. Poor tool selection usually means: (1) tool descriptions are too similar, (2) descriptions don't match query language users actually use, or (3) query is genuinely ambiguous. Improve descriptions first, then consider adding router logic."
      },
      {
        question: "Can I use open-source LLMs with LlamaIndex agents?",
        answer: "Yes! LlamaIndex supports many LLM backends: OpenAI, Anthropic, local models via Ollama, HuggingFace models, and more. Agent quality depends heavily on the LLM's reasoning capability. GPT-4 class models work best for complex reasoning; smaller models may struggle with multi-step tool use."
      }
    ],

    applications: [
      {
        title: "Multi-Repository Code Assistant",
        description: "Index multiple code repositories as separate sources. Agent routes questions to the right repo, can cross-reference implementations, and finds examples across projects. Handles 'How does service A call service B?' by searching both."
      },
      {
        title: "Enterprise Knowledge Base",
        description: "Connect HR policies, product docs, engineering wikis, and support tickets as separate indices. Agent understands 'What's our PTO policy for remote employees in Germany?' requires HR + regional policy lookup."
      },
      {
        title: "Research Paper Analysis",
        description: "Index papers by topic, author, or publication year. Agent can handle 'Compare methodologies between Smith 2022 and Jones 2023' by retrieving from multiple sources and synthesizing a comparison."
      }
    ],

    relatedDays: [14, 16, 17, 6, 7]
  }
};
