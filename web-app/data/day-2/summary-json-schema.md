# JSON Schema Reference

JSON Schema is the standard for defining the structure of JSON data. When working with LLM function calling and structured outputs, you use JSON Schema to specify exactly what parameters a function accepts or what structure an output should have. Understanding JSON Schema is essential because both OpenAI and Anthropic use it for tool definitions.

The basic structure of a JSON Schema defines an object with properties. Each property has a type—the primitive types are string, number, integer, boolean, null, array, and object. You list which properties are required in a separate array, and you can set `additionalProperties` to false to prevent any unlisted fields from appearing in valid data.

Strings can be constrained with minimum and maximum length requirements, regular expression patterns, and semantic formats like email, uri, or date-time. Numbers support minimum and maximum bounds, exclusive bounds, and a multipleOf constraint for values that must be divisible by a specific number. These constraints help guide the LLM toward producing valid values, though not all providers enforce all constraints at the token generation level.

Enums restrict a value to a fixed set of options—useful for things like status fields, priority levels, or unit choices. The const keyword pins a value to exactly one allowed option. Arrays define their element type through the items keyword and can specify minimum and maximum lengths. The uniqueItems constraint ensures no duplicates.

Objects can be nested to any depth, with each level having its own properties, required fields, and constraints. This lets you model complex hierarchical data structures. For optional fields in strict mode, you use a union with null by specifying the type as an array like `["string", "null"]`. The field is still required in the schema, but its value can be null.

JSON Schema provides composition keywords for combining schemas. The anyOf keyword accepts values matching any of the listed schemas—useful for union types. The oneOf keyword requires exactly one schema to match. The allOf keyword requires all schemas to match, commonly used to merge multiple constraints. The not keyword rejects values matching the specified schema.

Conditional schemas with if/then/else let you apply different validation rules based on field values. For example, if a type field equals "email", you might require the value field to match an email format, otherwise require a phone number pattern.

Reusable definitions through `$defs` and `$ref` keep schemas DRY. You define common structures once under $defs, then reference them wherever needed. This is particularly useful when the same structure—like an address—appears multiple times in your schema.

For LLM function calling specifically, OpenAI's strict mode requires `additionalProperties: false` on all objects, all fields in the required array, and optional fields expressed as unions with null. Following these conventions ensures your schemas work reliably across providers.
