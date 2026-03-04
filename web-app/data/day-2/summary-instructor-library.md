# Instructor Library

Instructor is the most popular Python library for extracting structured, validated data from LLMs. Built on top of Pydantic, it provides a clean abstraction that works identically across more than 15 providers including OpenAI, Anthropic, Google, and local models through Ollama. The core idea is simple: define a Pydantic model describing the data you want, and Instructor handles all the complexity of getting the LLM to produce valid, typed output.

The library's main value proposition is reliability. When the LLM returns data that doesn't match your schema—wrong types, missing fields, constraint violations—Instructor automatically retries the request with feedback about what went wrong. You specify `max_retries` and the library handles the retry loop, validation, and error messaging. This means you can trust that when you get a result back, it actually conforms to your schema.

Using Instructor is straightforward. You create a client by specifying your provider and model, define your Pydantic model with the fields you want to extract, then call `client.create()` with your messages and the response model. The library returns a fully typed Python object with IDE autocomplete support. The same code works whether you're using OpenAI, Anthropic, Google Gemini, or a local Ollama model—just change the provider string.

Pydantic's full validation capabilities are available. You can use Field constraints like min_length, max_length, gt, lt, and custom validators. Enums constrain values to specific options. Nested models handle complex hierarchical data. When validation fails, Instructor sends the error message back to the LLM as context for the retry, often resulting in corrected output.

For real-time applications, Instructor supports streaming through two methods. The `create_partial()` method streams partial objects as they're being generated, letting you display fields as they become available. The `create_iterable()` method streams complete objects one at a time, useful when extracting multiple items from a single prompt. Both maintain type safety throughout the streaming process.

The library includes hooks for logging and monitoring. You can attach callbacks to events like request start, completion, and errors. This makes it easy to log all LLM interactions, track costs, or integrate with observability tools. There's also support for Jinja templating in prompts, letting you inject dynamic content into your messages cleanly.

One advanced feature is LLM-powered validation, where you can use the language model itself to validate semantic constraints that are hard to express in code. For example, you could validate that an answer doesn't contain objectionable content by having the LLM check it during the validation step.
