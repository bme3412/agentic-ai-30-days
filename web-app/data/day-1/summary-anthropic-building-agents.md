# Building Effective Agents (Anthropic)

The most successful agent implementations use simple, composable patterns rather than complex frameworks. Anthropic's guidance emphasizes starting with the simplest solution and adding complexity only when needed. A single LLM call with good retrieval and examples handles most applications. Workflows suit well-defined tasks needing predictability. Full agents make sense only when you need flexibility and model-driven decision-making at scale.

The distinction between workflows and agents is fundamental. In a workflow, you orchestrate LLMs and tools through predefined code paths—the developer controls the flow. In an agent, the LLM dynamically directs its own processes and tool usage—the model controls the flow. This distinction matters because workflows are more predictable and easier to debug, while agents offer more flexibility for open-ended problems.

| Type | Definition | Control |
|------|------------|---------|
| Workflow | LLMs orchestrated through predefined code paths | Developer controls flow |
| Agent | LLM dynamically directs its own processes | Model controls flow |

The basic building block for both is the augmented LLM—a model enhanced with retrieval for external knowledge, tools for taking actions, and memory for persistent context. Rather than adding every capability, you tailor these augmentations to your specific use case and provide clear, well-documented interfaces.

Prompt chaining decomposes a task into sequential steps where each LLM call processes the output of the previous one. You might generate marketing copy, then translate it to another language, with an optional gate between steps to check quality. This pattern trades latency for higher accuracy and works when tasks decompose cleanly into fixed subtasks.

Routing classifies input and directs it to specialized handlers. A customer service router might send general questions to one handler, refunds to another, and technical issues to a third. You can even route between models—easy questions to a faster model, hard questions to a more capable one. This works when distinct categories benefit from specialized handling and classification can be done accurately.

Parallelization runs LLM calls simultaneously and aggregates results. Sectioning handles independent subtasks in parallel—one LLM processes a query while another screens for inappropriate content. Voting runs the same task multiple times and aggregates results for higher confidence. Both patterns reduce latency when subtasks don't depend on each other.

The orchestrator-workers pattern uses a central LLM to dynamically break down tasks, delegate to workers, and synthesize results. Unlike parallelization where subtasks are predefined, the orchestrator determines subtasks based on the input. This suits coding products making complex multi-file changes or search tasks gathering information from multiple sources.

The evaluator-optimizer pattern has one LLM generate output while another evaluates it, iterating until quality meets a threshold. This works when clear evaluation criteria exist and responses demonstrably improve with feedback—like literary translation requiring nuance refinement or complex searches needing multiple rounds.

Autonomous agents work best for open-ended problems with unpredictable steps where you can't hardcode a fixed path. The agent loop receives a task, reasons about it, selects a tool or action, executes it, observes the result, and decides whether to continue or return. Critical success factors include ground truth at each step from tool results, human checkpoints for feedback at critical points, stopping conditions to maintain control, and thoughtful tool design with clear interfaces.

Tool design deserves as much investment as human interface design. Clear descriptions that a junior developer could understand, example usage with edge cases and format requirements, descriptive parameter names, and testing with many example inputs to catch model mistakes. One lesson from SWE-bench: changing from relative to absolute filepaths eliminated a whole class of errors because the model made mistakes with relative paths after moving directories.

```python
# Good tool definition - clear, constrained, documented
def edit_file(
    absolute_path: str,
    new_content: str,
    create_if_missing: bool = False
) -> dict:
    """
    Replace entire file contents with new content.

    Args:
        absolute_path: Full path to file (e.g., /home/user/file.txt).
                      Must be absolute, not relative.
        new_content: Complete new file contents. Will replace existing.
        create_if_missing: If True, creates file if it doesn't exist.

    Returns:
        {"success": True, "bytes_written": int} or
        {"success": False, "error": str}
    """
```

The core principles are to maintain simplicity in agent design, prioritize transparency by showing the agent's planning steps, and carefully craft your agent-computer interface through thorough documentation and testing. Success isn't about building the most sophisticated system—it's about building the right system for your needs.
