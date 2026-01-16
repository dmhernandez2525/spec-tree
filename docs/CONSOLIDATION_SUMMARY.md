# Spec Tree Consolidation Summary

**Date**: January 15, 2025
**Updated**: January 15, 2025 (Phase 2 - Deep Dive)
**Consolidated by**: AI Agent

## Executive Summary

This consolidation gathered Spec Tree-related content from multiple repositories into the main `bb/` folder. The goal was to preserve historical context, capture useful patterns, and prepare BB as a flagship portfolio project.

**Phase 2 Update**: Deep-dive into branches, actual AI prompts, Strapi schemas, and FormBuilder patterns completed.

---

## Sources Checked

### Repositories Analyzed

| Repository | Location | BB-Related Content Found |
|------------|----------|--------------------------|
| bb/ | ALL-BB-APPs-OVER-TIME/bb/ | Main current version |
| spec-tree (old) | ALL-BB-APPs-OVER-TIME/TT-REPOS.../spec-tree/ | Original version with docs |
| Tailored-Golf | TT-REPOS.../Tailored-Golf/ | MultiAgentWorkTracking, prompts |
| dry | TT-REPOS.../dry/ | Strapi plugins |
| ui-l | Projects/ui-l/ | FormBuilder/FlowBuilder on main |

### Branch Analysis (Phase 2)

| Repository | Branch | Status | Actual Content |
|------------|--------|--------|----------------|
| bb/ | main | Active | Full BB application |
| bb/ | feture/cp | Abandoned | Cleanup branch (NOT context propagation) |
| ui-l | main | Active | **FormBuilder + FlowBuilder** |
| ui-l | spec-tree | Historical | **Removes** builders (counter-intuitive) |
| dry | dev | Active | Strapi plugins |
| dry | WorkManager | Feature | Task management enhancements |
| dry | API-Routes | Feature | Custom API routes |

**Key Discovery**: The `ui-l` repository's `main` branch contains the comprehensive FormBuilder/FlowBuilder, while the `spec-tree` branch actually REMOVES these builders.

---

## Documentation Created

### Phase 1 - Initial Consolidation

| Document | Location | Description |
|----------|----------|-------------|
| DEVELOPMENT_HISTORY.md | docs/history/ | Complete version timeline |
| FEATURE_COMPARISON.md | docs/history/ | Side-by-side feature comparison |
| OLD_VERSION_*.md | docs/history/ | Original project documentation |
| FLOWBUILDER_PATTERNS.md | reference/strapi-plugins/document-builder/ | FlowBuilder architecture |
| TASK_MANAGEMENT_PATTERNS.md | reference/strapi-plugins/work-manager/ | Task management patterns |
| Multi-agent templates | reference/multi-agent-work-tracking/ | 5 template files |

### Phase 2 - Deep Dive Documentation

| Document | Location | Description |
|----------|----------|-------------|
| **CONTENT_TYPES.md** | docs/strapi-schemas/ | Actual Strapi content type schemas |
| **AI_PROMPT_LIBRARY.md** | docs/prompts/ | Real prompts from bb/ codebase |
| **BRANCH_INVENTORY.md** | docs/ | All branches across all repos |
| **AI_INTEGRATION.md** | docs/architecture/ | AI integration architecture |

---

## Branch Analysis Details

### bb/ Repository

#### main (Active)
Full Spec Tree application with:
- Client (Next.js 14)
- Server (Strapi CMS)
- Microservice (Express.js AI proxy)
- Work item hierarchy: Epic → Feature → UserStory → Task
- AI-powered generation

#### feture/cp (Abandoned)
**Important**: Despite the name suggesting "feature/context-propagation", this is a **cleanup branch** that removes files. The branch name has a typo ("feture" vs "feature").

**Recommendation**: Do not merge. Consider deleting.

### ui-l Repository

#### main (Active) - Contains Builders!
Comprehensive FormBuilder and FlowBuilder:
```
app/builders/
├── builder/
│   ├── FormBuilder/     # Full form builder
│   │   └── types/       # 16+ component types
│   └── FlowBuilder/     # Multi-step workflow builder
└── shared/              # Shared components
```

**16+ Component Types**:
- Input: text, email, phone, number, shorttext, mask
- Selection: radio, checkbox, select, slider
- Date: datepicker, daterange
- Content: title, bodytext, document
- Layout: columns, section, tabs
- Advanced: file, signature, color

**Tech Stack**: Next.js 14, TypeScript, DND Kit, shadcn/ui, Zod

#### spec-tree (Historical)
Counter-intuitively, this branch **REMOVES** the FormBuilder/FlowBuilder and adds survey/dashboard components instead.

**Recommendation**: Keep as historical reference only. Do NOT merge into main.

---

## AI Prompts - Actual Patterns

**Source**: `bb/Client/components/spec-tree/lib/constants/prompts.ts`

### Prompt Types

| Prompt | System Role | Output Format |
|--------|-------------|---------------|
| epicPrompt | "generate additional epics" | JSON with =+= separator |
| featurePrompt | "generate additional features" | JSON with =+= separator |
| userStoryPrompt | "generate user stories" | JSON with =+= separator |
| taskPrompt | "generate tasks" | JSON with =+= separator |
| contextQuestions | "generate contextual questions" | Questions with =+= separator |

### Key Patterns Extracted

1. **Structured JSON Output**
   ```
   Return the response in the following JSON format:{
     "title": "...", "description": "..."
   }
   ```

2. **Separator Pattern**: `"=+="` for multiple items

3. **Deduplication**
   ```
   Existing Features: ${mapFeatures(epic.featureIds, state)}
   Please avoid repeating features that have already been mentioned.
   ```

4. **Context Injection**
   ```typescript
   ${context ? `Additional Context: ${context}\n` : ''}
   ```

5. **Granularity Guidelines**
   - User Story: "~1 week of work"
   - Task: "~1 day of work"

6. **Token Handling**
   ```
   Do not start a new JSON object if you cannot complete it within the character limit.
   ```

### AI Architecture Flow

```
Client (Next.js)          Microservice (Express)       OpenAI
      │                          │                        │
      │  makeProxyCall()         │                        │
      │ ─────────────────────────>                        │
      │  { systemPrompt,         │  chat.completions      │
      │    userPrompt,           │ ─────────────────────> │
      │    selectedModel }       │                        │
      │                          │                        │
      │  <───────────────────────  <───────────────────── │
      │  response.data.choices[0].message.content         │
      │                          │                        │
      │  Parse with "=+="        │                        │
      │  Add to Redux store      │                        │
```

---

## Schema Documentation

**Source**: `bb/Server/src/api/*/content-types/*/schema.json`

### Content Type Hierarchy

```
Organization (1) ──── (N) App (1) ──── (N) Epic (1) ──── (N) Feature (1) ──── (N) UserStory (1) ──── (N) Task
                                  │                 │                    │                     │
                                  └── ContextualQuestion (can attach to any work item level)
```

### Key Schemas Documented

| Content Type | Key Fields | Relations |
|--------------|------------|-----------|
| Organization | name, size, industry, ownerId | apps (oneToMany) |
| App | applicationInformation, globalInformation, selectedModel | organization (manyToOne), epics (oneToMany) |
| Epic | title, description, goal, successCriteria, risksAndMitigation | app (manyToOne), features (oneToMany) |
| Feature | title, description, details, acceptanceCriteria | epic (manyToOne), userStories (oneToMany) |
| UserStory | title, role, action, goal, points, developmentOrder | feature (manyToOne), tasks (oneToMany) |
| Task | title, details, priority | userStory (manyToOne) |
| ContextualQuestion | question, answer | Polymorphic relations to any work item |

### Components

- `datasets.risks-and-mitigation`: resolve[], own[], accept[], mitigate[]
- `micro-component.acceptance-criteria`: text

---

## FormBuilder Patterns (ui-l)

### Component Architecture

```typescript
interface FormComponent {
  id: string;
  type: ComponentType;
  properties: ComponentPropertyTypes;
  parentId: string | null;
  children?: FormComponent[];
}
```

### Form Structure

```typescript
interface Form {
  id: string;
  name: string;
  description?: string;
  components: FormComponent[];
  status: 'draft' | 'published';
  settings?: FormSettings;
}
```

### Implementation Phases (from README)

1. **Core Infrastructure** - State management, DND Kit, property system
2. **Advanced Components** - Additional form components, custom components
3. **Logic & Validation** - Advanced validation, conditional logic
4. **Data & Integration** - Form submission, persistence, API integration
5. **Polish & Performance** - Optimization, accessibility, documentation

---

## Final Folder Structure

```
bb/
├── docs/
│   ├── architecture/
│   │   └── AI_INTEGRATION.md        # [NEW] AI architecture
│   ├── design/                      # [Empty - for future]
│   ├── features/                    # [Empty - for future]
│   ├── history/
│   │   ├── DEVELOPMENT_HISTORY.md
│   │   ├── FEATURE_COMPARISON.md
│   │   └── OLD_VERSION_*.md
│   ├── prompts/
│   │   └── AI_PROMPT_LIBRARY.md     # [UPDATED] Real prompts
│   ├── strapi-schemas/
│   │   └── CONTENT_TYPES.md         # [NEW] Actual schemas
│   ├── BRANCH_INVENTORY.md          # [NEW] All branches
│   └── CONSOLIDATION_SUMMARY.md     # [UPDATED] This file
├── reference/
│   ├── multi-agent-work-tracking/   # 5 template files
│   └── strapi-plugins/
│       ├── document-builder/FLOWBUILDER_PATTERNS.md
│       └── work-manager/TASK_MANAGEMENT_PATTERNS.md
└── [existing: Client/, Server/, Microservice/]
```

---

## Key Findings

### Branch Name vs Reality

| Branch | Expected | Actual |
|--------|----------|--------|
| bb/feture/cp | Context Propagation | File cleanup (abandoned) |
| ui-l/spec-tree | Add builders | Remove builders |

### AI Prompts Location

- **NOT in**: Tailored-Golf/.ACTIVE-PROMPTS (Strapi/Swing Bays specific)
- **Actual location**: bb/Client/components/spec-tree/lib/constants/prompts.ts

### FormBuilder Location

- **NOT in**: ui-l/spec-tree branch
- **Actual location**: ui-l main branch at app/builders/

---

## Recommendations

### Immediate Actions

1. **Do NOT merge bb/feture/cp** - It's a cleanup branch, not context propagation
2. **Do NOT merge ui-l/spec-tree** - Main branch has the correct builders
3. **Review ui-l main branch** for FormBuilder patterns to potentially port to BB

### Before Publishing BB

1. Remove any client-specific references
2. Update screenshots with current UI
3. Ensure complete setup guide in README
4. Verify no API keys in committed code
5. Add proper .env.example files

### Future Enhancements

Based on consolidation findings:

1. **From ui-l FormBuilder**:
   - 16+ component types
   - DND Kit integration
   - Zod validation patterns
   - Component property system

2. **From dry WorkManager**:
   - Task metrics dashboard
   - Advanced filtering
   - Activity tracking

3. **From Original Vision** (detailedBreakdown.md):
   - Template marketplace
   - Integration with project management tools
   - Automated diagram generation

---

## Questions Resolved

| Question | Answer |
|----------|--------|
| Should ui-l spec-tree branch be merged? | **NO** - main has the builders, this branch removes them |
| Are .ACTIVE-PROMPTS from Tailored-Golf useful? | **NO** - They're Strapi/project-specific, not BB-related |
| Where are the actual BB prompts? | bb/Client/components/spec-tree/lib/constants/prompts.ts |
| What is feture/cp branch? | A cleanup branch (misspelled), NOT context propagation |

---

## Files Not Copied (Intentionally)

- **.ACTIVE-PROMPTS/**: Strapi-specific, project-specific content
- **Tailored-Golf app code**: Not directly relevant to BB
- **Strapi plugin source code**: Better to reference than copy
- **Client-specific configurations**: Contain project-specific settings
- **ui-l spec-tree branch content**: Removes builders (wrong direction)

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Repositories analyzed | 5 |
| Branches checked | 8 |
| Documents created | 12 |
| Content types documented | 7 |
| AI prompts documented | 9 |
| Component types discovered | 16+ |
