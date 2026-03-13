# AG2 (AutoGen 2.0) Summary

> Source: [AG2 Website](https://ag2.ai/) and [AG2 GitHub](https://github.com/ag2ai/ag2)

## What is AG2?

AG2 is a community-driven fork of AutoGen, created by the original AutoGen developers after leaving Microsoft. It maintains backward compatibility with AutoGen 0.2's familiar API while adding new features and improvements.

## Why AG2 Exists

In late 2024, Microsoft's AutoGen team underwent significant changes:
- Original developers left to form AG2 under community governance
- Microsoft continued AutoGen with a complete architectural redesign (0.4+)
- AG2 preserves the established patterns developers learned

## Key Features

### Backward Compatibility
- Works with existing AutoGen 0.2 code
- Same imports: `from autogen import ...`
- Familiar agent classes and patterns
- Minimal migration effort

### Community Governance
- Open development process
- Community-driven roadmap
- Active maintenance and bug fixes
- Regular updates

### Enhanced Capabilities
- Improved GroupChat functionality
- Better tool integration
- Enhanced code execution
- Performance optimizations

## Installation

```bash
pip install ag2
```

Or with additional features:
```bash
pip install ag2[all]  # All optional dependencies
pip install ag2[tools]  # Tool support
```

## Migration from AutoGen

For most code, migration is seamless:

```python
# AutoGen
from autogen import AssistantAgent, UserProxyAgent

# AG2 (same imports work)
from autogen import AssistantAgent, UserProxyAgent
```

## When to Use AG2 vs AutoGen

**Use AG2 when:**
- You have existing AutoGen 0.2 code
- You prefer the familiar API
- You want community-driven development
- Backward compatibility is important

**Use AutoGen 0.4+ when:**
- Starting a new project
- You need the new actor-based model
- Enterprise Microsoft support is required
- You want the latest architectural patterns

## Community Resources

- **GitHub**: [github.com/ag2ai/ag2](https://github.com/ag2ai/ag2)
- **Discord**: Active community support
- **Documentation**: Comprehensive guides and examples

## Relationship to AutoGen

Think of it like:
- **AutoGen 0.2** → The original, stable API
- **AG2** → Community continuation of 0.2 patterns
- **AutoGen 0.4+** → Microsoft's redesigned framework

For learning purposes, patterns work in both AG2 and AutoGen 0.2, making your skills transferable.
