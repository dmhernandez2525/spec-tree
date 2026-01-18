# SpecTree Integration with Project Generator

**Version:** 1.0.0
**Last Updated:** January 18, 2026
**Related:** `/Users/daniel/Desktop/agent-prompts/PROJECT_GENERATOR_PROMPT.md`

---

## Overview

SpecTree can export context to the **Project Generator** system, which uses the specifications to create tailored prompts for new projects or to enhance existing project documentation.

This integration enables a powerful workflow:
1. **Gather specifications in SpecTree** (features, user stories, acceptance criteria)
2. **Export to Project Generator** (Universal JSON format)
3. **Generate specialized prompts** (research, build, agent prompts)
4. **Build the project** with rich context already defined

---

## Export Format

### Universal JSON Export

SpecTree's Universal JSON export is the primary format for Project Generator integration.

**Export Location:** Settings → Export → Universal JSON

```json
{
  "$schema": "https://spectree.io/schemas/export-v2.json",
  "specVersion": "2.0",
  "generatedBy": "SpecTree",
  "generatedAt": "2026-01-18T12:00:00Z",
  "project": {
    "id": "proj_123",
    "name": "Project Name",
    "techStack": {
      "framework": "Next.js 14",
      "language": "TypeScript",
      "styling": "Tailwind CSS",
      "stateManagement": "Zustand",
      "testing": "Jest + Testing Library"
    },
    "conventions": {
      "forbidden": ["any", "@ts-ignore", "console.log"],
      "required": ["typed useState", "error boundaries"],
      "patterns": ["src/components/ui/*"]
    }
  },
  "workItems": [
    {
      "id": "E-001",
      "type": "epic",
      "title": "User Authentication",
      "description": "Complete auth system",
      "userStory": {
        "asA": "new user",
        "iWant": "to create an account",
        "soThat": "I can access the platform"
      },
      "acceptanceCriteria": [
        "User can register with email",
        "User can login with credentials",
        "User can reset password"
      ],
      "children": [
        {
          "id": "F-001",
          "type": "feature",
          "title": "Email Registration",
          "priority": "P0",
          "status": "Planned"
        }
      ]
    }
  ]
}
```

---

## How to Use

### Step 1: Create Specifications in SpecTree

Build out your project structure:
- Create Epics for major features
- Add Features with user stories
- Define acceptance criteria
- Set technical preferences

### Step 2: Export Universal JSON

1. Navigate to **Settings → Export**
2. Select **Universal JSON** format
3. Choose scope (entire project or specific items)
4. Click **Export**
5. Copy the JSON output

### Step 3: Feed to Project Generator

Use the following prompt with the Project Generator:

```markdown
Read /Users/daniel/Desktop/agent-prompts/PROJECT_GENERATOR_PROMPT.md

## SpecTree Context (What - Specifications)
[Paste your Universal JSON export here]

## Additional Context
[Any gaps not in SpecTree, like motivation or background]

Generate all prompts for this project.
```

### Step 4: Receive Generated Prompts

The Project Generator will create:
- `{PROJECT}_RESEARCH_PROMPT.md` - Pre-filled with your features as research targets
- `{PROJECT}_BUILD_PROMPT.md` - Architecture and features from your specs
- Template for `{PROJECT}_AGENT_PROMPT.md` - Work items ready to implement

---

## What Gets Enhanced

When you provide SpecTree context, the generator enhances:

| Section | Without SpecTree | With SpecTree |
|---------|------------------|---------------|
| Project Name | User provides | Auto-filled from export |
| Tech Stack | User provides | Copied from project settings |
| Features | User lists ideas | Full work item hierarchy |
| User Stories | Generic template | Actual user stories |
| Acceptance Criteria | Examples only | Real criteria from SDDs |
| Coding Standards | Default patterns | Your project conventions |

---

## Best Practices

### Before Exporting

1. **Complete your work item hierarchy** - Ensure Epics have Features
2. **Write user stories** - "As a... I want... So that..."
3. **Add acceptance criteria** - Testable requirements
4. **Set tech stack** - Framework, styling, testing preferences
5. **Define conventions** - Forbidden patterns, required patterns

### Export Tips

- Export the **entire project** for new builds
- Export **specific Epics** for focused generation
- Include **technical context** settings
- Check **conventions** are up to date

---

## Integration with LifeContext

For maximum effectiveness, combine SpecTree (the "what") with LifeContext (the "why"):

```markdown
Read /Users/daniel/Desktop/agent-prompts/PROJECT_GENERATOR_PROMPT.md

## LifeContext (Why - Motivation)
[Paste LifeContext Context Packet - explains WHY you're building this]

## SpecTree (What - Specifications)
[Paste SpecTree Universal JSON - explains WHAT you're building]

Generate all prompts for this project.
```

This combination provides:
- **Rich motivation** from personal context
- **Detailed specifications** from project planning
- **More accurate research prompts** targeting real pain points
- **Better build prompts** with complete context

---

## Future Enhancements

### CodeReview AI Integration (Planned)

When CodeReview AI is built, SpecTree exports will enable:

1. **Acceptance Criteria Validation**
   - CodeReview AI's PM persona will check PRs against SpecTree criteria
   - Automated verification of requirement completion

2. **Context-Aware Reviews**
   - Reviewers understand feature context from SpecTree
   - More relevant suggestions based on user stories

3. **Bi-directional Sync**
   - Mark features complete when PRs merge
   - Update SpecTree status from CodeReview AI

### MCP Server Integration (Planned)

Real-time context access via MCP:
- AI tools query SpecTree directly
- No manual export needed
- Always up-to-date specifications

---

## Related Documentation

- [AI Tool Export Formats](./AI_TOOL_EXPORT_FORMATS.md) - All export formats
- [Universal JSON Schema](./schemas/export-v2.json) - Full schema reference
- [Project Generator](file:///Users/daniel/Desktop/agent-prompts/PROJECT_GENERATOR_PROMPT.md) - Master prompt

---

**Document Version:** 1.0.0
**Created:** January 18, 2026
