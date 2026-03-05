# AI Agentic Design Patterns with AutoGen

AutoGen is a multi-agent conversational framework that enables you to create multiple agents with different roles and capabilities. Rather than building a single monolithic AI system, you create specialized agents—researcher, data collector, writer, executor—that work together, iteratively reviewing and improving results through conversation.

The foundational building block is the ConversableAgent, an entity that can send and receive messages, perform actions, generate replies, and interact with other agents. You configure each agent with a name, system message defining its role, and settings for how it handles human input—never asking, always asking, or asking only when the conversation ends.

```python
from autogen import ConversableAgent

agent = ConversableAgent(
    name="chatbot",
    llm_config={"model": "gpt-4o-mini"},
    human_input_mode="NEVER"
)

reply = agent.generate_reply(
    messages=[{"content": "Tell me a joke", "role": "user"}]
)
```

Two-agent conversations let you define agents with different personas and have them interact. One agent initiates with `initiate_chat()`, specifying the recipient, initial message, and maximum turns. The chat result includes the full history, token usage and cost, and a summary. You can customize summaries using LLM reflection rather than just taking the last message, and define termination conditions based on message content rather than fixed turn counts.

| Human Input Mode | Behavior |
|------------------|----------|
| NEVER | Agent uses LLM only, no human input |
| ALWAYS | Always asks human before generating reply |
| TERMINATE | Asks human only when conversation ends |

Sequential chats run multiple conversations in sequence with context carrying forward. You define a chat queue where each entry specifies a recipient agent, message, and how to carry over context from previous chats. This enables step-by-step task execution—gather customer information, identify interests, create an engagement plan—where each step builds on previous context.

The reflection pattern enables iterative improvement through writer-critic conversations. A writer agent generates content while a critic provides feedback, iterating until the critic says "APPROVED" or a turn limit is reached. Nested chats extend this by letting an agent consult other agents before responding—the writer might trigger conversations with an SEO expert and legal reviewer whenever it receives feedback from the main critic.

```python
writer = ConversableAgent(
    name="writer",
    system_message="You are a writer. Write content based on feedback.",
    llm_config=llm_config
)

critic = ConversableAgent(
    name="critic",
    system_message="Provide feedback. When satisfied, say 'APPROVED'.",
    llm_config=llm_config,
    is_termination_msg=lambda msg: "APPROVED" in msg["content"]
)

chat_result = writer.initiate_chat(
    recipient=critic,
    message="Write a blog post about AI agents",
    max_turns=5
)
```

Tool use provides agents with callable functions they can invoke during conversations. You register functions with both a caller agent that suggests tool use and an executor agent that runs the actual code. The caller generates tool call requests, the executor runs them and returns results, enabling agents to access external data and perform calculations.

Code execution lets agents write Python code and run it in a sandboxed environment. A coder agent writes code in markdown blocks, and an executor agent runs it using Docker for isolation. This enables dynamic computation—plotting stock prices, analyzing data, generating reports—with proper safety through containerization and timeouts.

Group chats orchestrate multiple specialists working together. You create agents for different roles—planner, researcher, writer, reviewer—and add them to a GroupChat managed by a GroupChatManager. Speaker selection can be automatic (LLM decides who speaks next), round-robin, random, or controlled by custom logic that determines the next speaker based on the last one.

```python
from autogen import GroupChat, GroupChatManager

group_chat = GroupChat(
    agents=[planner, researcher, writer, reviewer],
    messages=[],
    max_round=10,
    speaker_selection_method="auto"
)

manager = GroupChatManager(groupchat=group_chat, llm_config=llm_config)
user_proxy.initiate_chat(manager, message="Create a report on AI trends")
```

| Pattern | When to Use |
|---------|-------------|
| Two-Agent Chat | Simple back-and-forth like debate or interview |
| Sequential Chat | Step-by-step pipeline like customer onboarding |
| Reflection | Iterative improvement like writing with review |
| Nested Chat | Agent needs sub-consultations for complex research |
| Tool Use | Need external functions for API calls or calculations |
| Code Execution | Dynamic computation like data analysis or plotting |
| Group Chat | Multi-expert collaboration like report generation |

Best practices include defining each agent's role precisely in system messages, always specifying termination conditions, using Docker for code execution, monitoring costs through chat results, and matching the pattern complexity to your task requirements.
