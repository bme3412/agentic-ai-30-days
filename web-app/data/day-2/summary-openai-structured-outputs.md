# OpenAI Structured Outputs

Structured outputs solve one of the most frustrating problems in working with LLMs: getting reliable, schema-compliant JSON. While JSON mode guarantees valid JSON syntax, it doesn't guarantee the JSON matches your expected structure. Structured outputs go further—they guarantee both valid JSON and exact schema compliance. Every field will be present with the correct type, and the model literally cannot produce output that violates your schema.

This works through a technique called constrained decoding. At each step of token generation, the model is only allowed to produce tokens that keep the output valid according to your schema. For example, after generating `{"name": "John",` the model can only generate tokens like `"age"` that continue the valid JSON structure—it cannot produce random text, close the object prematurely, or add unexpected fields.

The easiest way to use structured outputs is with Pydantic models. You define a Python class that describes your expected data structure, then pass it directly to the API. The SDK handles converting your Pydantic model to a JSON Schema, sending it to the API, and parsing the response back into a typed Python object. The result is that you get full IDE autocomplete and type checking on the extracted data.

There are specific requirements for schemas in strict mode. The `additionalProperties` field must be set to `false` on all objects to prevent unexpected fields. All fields must be listed in the `required` array—there's no concept of truly optional fields. Instead, you make fields optional by using a union with null, like `str | None` in Python or `{"type": ["string", "null"]}` in JSON Schema. This means the field will always be present, but its value can be null.

Structured outputs support nested objects, arrays of objects, enums, and reusable definitions through `$ref`. However, some JSON Schema features are not supported, including regex patterns, string formats like email validation, length constraints on strings, numeric range constraints, and array length constraints. The model will try to respect these in spirit, but they're not enforced at the token generation level.

Field descriptions in your Pydantic models become part of the schema and guide the model's behavior—think of them as additional prompts. Adding clear descriptions dramatically improves extraction quality. The first request with a new schema has some latency overhead due to schema compilation, but schemas are cached after first use.

Common use cases include data extraction from unstructured text, classification tasks where you want both a label and confidence score, and multi-item extraction where you need to pull out multiple entities from a single document. Always check for refusals before accessing the parsed result, as the model may decline to generate output for harmful requests.
