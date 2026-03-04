# Anthropic Tool Use (Claude)

Claude's tool use capability allows the model to interact with external functions and data sources you define. Like OpenAI's function calling, Claude doesn't execute tools directly—it returns structured requests that your code handles. You define the tool schema, Claude decides when and how to use it, and you control the actual execution.

Anthropic distinguishes between two types of tools. Client tools are functions you implement and execute on your own systems, giving you full control over the execution environment. Server tools are built-in capabilities like web search that execute on Anthropic's infrastructure automatically, with results incorporated directly into Claude's response.

The flow for client tools follows a specific pattern. You send a request with your tool definitions and the user's message. If Claude decides to use a tool, it returns a response with `stop_reason: "tool_use"` containing one or more `tool_use` blocks. Each block includes a unique ID, the tool name, and the input arguments. Your code executes the tool and sends back a `tool_result` block that references the original tool use ID. Claude then generates its final response incorporating the tool results.

There are important differences between Anthropic and OpenAI's implementations. Anthropic uses `input_schema` instead of `parameters` for the JSON Schema. Tool definitions are direct objects rather than wrapped in a `{"type": "function", "function": {...}}` structure. Most notably, tool results are sent as content blocks within a `user` role message, not as a separate `tool` role like OpenAI uses. The tool result must include the `tool_use_id` that matches the original request.

Claude supports parallel tool calls, returning multiple `tool_use` blocks in a single response. You should execute all of them and return all results in a single message before asking Claude to continue. For production agents, enabling `strict: true` on your tools guarantees schema compliance, similar to OpenAI's strict mode.

Anthropic offers built-in server tools like web search and web fetch that execute automatically on their infrastructure. You include these by specifying their type in the tools array, and results are automatically incorporated into Claude's response without requiring a tool result exchange.

Different Claude models have different behaviors around tool use. Claude Opus tends to ask for clarification when required parameters are missing, while Claude Sonnet may attempt to guess reasonable values. To improve tool selection, consider adding a chain-of-thought instruction that asks Claude to reason about which tool is relevant before making a call, and to verify that all required parameters have been provided by the user.

Tool definitions count against input tokens, with approximately 346 tokens of overhead when tools are enabled. If you're building MCP (Model Context Protocol) integrations, you'll need to convert MCP tool definitions to Claude's format by renaming `inputSchema` to `input_schema`.
