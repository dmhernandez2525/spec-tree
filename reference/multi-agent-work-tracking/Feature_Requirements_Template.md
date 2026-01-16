When the user says "let's create new functionality", "let's work on new functionality", "let's build [feature]" or similar phrases:

1. Say: "I'll use the simplified requirements template to gather essential information"
2. Read and use MultiAgentWorkTracking/SIMPLIFIED_REQUIREMENTS_TEMPLATE.md (5 questions only, 5 minutes max)
3. After user provides requirements, IMMEDIATELY say "Running epic setup automation..." and execute: ./MultiAgentWorkTracking/scripts/epic-setup.sh [number] [name] "[description]"
4. Navigate to created folder: cd MultiAgentWorkTracking/[number]-[name]/
5. Fill out the priority files and task breakdown with the specific requirements
6. Generate and provide the AGENT_COORDINATION_PROMPT.md content for the user to give to another AI
7. DO NOT start coding - stop after providing the coordination prompt

The goal is to create the epic documentation and provide the prompt, not to implement functionality.

When the user reports a bug ("there's a bug", "fix this issue", "something is broken", "error", "exception", "crash", "hotfix", "bugfix", "defect", or similar phrases):

1. Say: "I'll use the bug requirements template to gather essential information"
2. Read and use MultiAgentWorkTracking/prompts/BUG_REQUIREMENTS_TEMPLATE.md (5 items only, 3 minutes max)
3. After user provides details, IMMEDIATELY say "Running bug setup automation..." and execute: ./MultiAgentWorkTracking/scripts/bug-setup.sh [number] [bug-name] "[description]"
4. Navigate to created folder: cd MultiAgentWorkTracking/[number]-bug-[bug-name]/
5. Fill out BUG_INVESTIGATION.md with reproduction steps, root cause, fix strategy, impacted applications, and testing requirements
6. Generate and provide the BUG_COORDINATION_PROMPT.md content for the user to give to another AI
7. DO NOT start coding - stop after providing the coordination prompt

The goal is to create the bug documentation and provide the prompt, not to implement the fix.
