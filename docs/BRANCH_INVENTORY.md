# Spec Tree - Branch Inventory

**Date**: January 15, 2025
**Purpose**: Comprehensive inventory of all branches across BB-related repositories

## Repository Overview

| Repository | Location | Default Branch | Other Branches |
|------------|----------|----------------|----------------|
| bb/ | ALL-BB-APPs-OVER-TIME/bb/ | main | feture/cp |
| ui-l | Projects/ui-l/ | main | spec-tree |
| dry | TT-REPOS.../dry/ | dev | main, WorkManager, API-Routes |
| spec-tree (old) | TT-REPOS.../spec-tree/ | main | None |
| Tailored-Golf | TT-REPOS.../Tailored-Golf/ | main | None |

---

## bb/ Repository

### Branch: main (Default)

**Status**: Active development
**Content**: Full Spec Tree application

```
bb/
├── Client/           # Next.js 14 frontend
│   ├── components/spec-tree/
│   │   ├── lib/constants/prompts.ts    # AI prompts
│   │   └── lib/api/openai.ts           # OpenAI integration
├── Server/           # Strapi CMS backend
│   └── src/api/      # Content type schemas
└── Microservice/     # Express.js AI proxy
    └── src/services/openai.service.ts
```

**Key Features**:
- Work item hierarchy (Epic → Feature → UserStory → Task)
- AI-powered work item generation
- Contextual question system
- Redux state management

### Branch: feture/cp

**Status**: Cleanup branch (NOT Context Propagation)
**Reality**: Despite the name suggesting "feature/context-propagation", this branch appears to be a cleanup branch that REMOVES files rather than adding context propagation functionality.

**Key Findings**:
- Branch name is misspelled ("feture" not "feature")
- Removes various files from the codebase
- Does NOT contain context propagation implementation
- May have been an experimental branch that was abandoned

**Recommendation**: Do not merge; main branch is the authoritative version.

---

## ui-l Repository

### Branch: main (Default)

**Status**: Active development
**Content**: Comprehensive FormBuilder and FlowBuilder system

```
ui-l/
└── app/builders/
    ├── builder/
    │   ├── FormBuilder/
    │   │   ├── types/index.ts      # 16+ component types
    │   │   ├── components/         # Form components
    │   │   └── hooks/              # State management
    │   └── FlowBuilder/            # Multi-step workflow builder
    └── shared/
        └── components/             # Shared component library
```

**Component Types (16+)**:
```typescript
type ComponentType =
  | 'title' | 'text' | 'email' | 'number' | 'radio' | 'checkbox'
  | 'select' | 'textarea' | 'datepicker' | 'daterange' | 'file'
  | 'phone' | 'shorttext' | 'slider' | 'bodytext' | 'document'
  | 'columns' | 'section' | 'tabs' | 'signature' | 'mask' | 'color';
```

**Tech Stack**:
- Next.js 14
- TypeScript (strict)
- DND Kit (drag-and-drop)
- shadcn/ui
- Zod validation
- date-fns

### Branch: spec-tree (13 commits ahead)

**Status**: REMOVES builders
**Reality**: Counter-intuitively, this branch REMOVES the FormBuilder/FlowBuilder components rather than adding them.

**Key Findings**:
- 13 commits ahead of main
- Removes `app/builders/` directory structure
- Contains survey/dashboard components instead
- Historical branch from before builders were implemented on main

**Content Differences**:
| Feature | main | spec-tree |
|---------|------|-------------------|
| FormBuilder | ✅ Full implementation | ❌ Removed |
| FlowBuilder | ✅ Full implementation | ❌ Removed |
| Survey components | ❌ Not present | ✅ Added |
| Dashboard layout | Basic | Enhanced |

**Recommendation**: Do NOT merge into main. The main branch has the correct FormBuilder/FlowBuilder implementation. The spec-tree branch appears to be an older iteration or different project direction.

---

## dry Repository

### Branch: dev (Default)

**Status**: Active Strapi plugins
**Content**: Strapi plugin infrastructure

```
dry/
└── libs/strapi-plugins/
    ├── document-builder/
    │   └── admin/src/components/FlowBuilder/
    └── work-manager/
        └── admin/src/components/Tasks/
```

**Plugin Summary**:

| Plugin | Server Content Types | Admin Components |
|--------|---------------------|------------------|
| document-builder | Skeleton only | FlowBuilder (full) |
| work-manager | Skeleton only | Task management (full) |

### Branch: main

**Status**: Base branch
**Content**: Similar to dev, may have older code

### Branch: WorkManager

**Status**: Feature branch
**Content**: Work manager specific development

**Key Files**:
- Enhanced task management components
- Additional filtering capabilities
- Metrics dashboard components

### Branch: API-Routes

**Status**: Feature branch
**Content**: API route implementations

**Key Files**:
- Custom Strapi API routes
- Additional endpoints for work item management

**Recommendation**: Review WorkManager and API-Routes branches for patterns that could be useful in BB.

---

## Legacy Repositories (Reference Only)

### spec-tree (old)

**Location**: `TT-REPOS.../spec-tree/`
**Branches**: main only
**Status**: Archived/Reference

**Historical Docs Copied**:
- README.md → docs/history/OLD_VERSION_README.md
- SDD.md → docs/history/OLD_VERSION_SDD.md
- CHANGELOG.md → docs/history/OLD_VERSION_CHANGELOG.md
- detailedBreakdown.md → docs/history/OLD_VERSION_ROADMAP.md

### Tailored-Golf

**Location**: `TT-REPOS.../Tailored-Golf/`
**Branches**: main only
**Status**: Reference for patterns

**Useful Content Copied**:
- MultiAgentWorkTracking/ → reference/multi-agent-work-tracking/
- .ACTIVE-PROMPTS/ → Analyzed (Strapi-specific, not BB-related)

---

## Branch Naming Conventions Discovered

| Pattern | Example | Purpose |
|---------|---------|---------|
| feature/* | feture/cp | Feature development |
| WorkManager | WorkManager | Module-specific work |
| API-Routes | API-Routes | API development |
| project-name | spec-tree | Project-specific features |

**Note**: Some branch names have typos (feture vs feature).

---

## Recommendations

### Immediate Actions

1. **Do NOT merge ui-l spec-tree into main** - main has the correct builders
2. **Do NOT merge bb/ feture/cp** - it's a cleanup branch, not a feature
3. **Review dry WorkManager branch** for useful patterns

### Branch Cleanup Candidates

| Branch | Repository | Action |
|--------|------------|--------|
| feture/cp | bb/ | Delete (abandoned cleanup) |
| spec-tree | ui-l | Keep as historical reference |
| WorkManager | dry | Review then merge or delete |
| API-Routes | dry | Review then merge or delete |

### Pattern Extraction

From analysis, useful patterns to extract:

1. **From ui-l main**:
   - FormBuilder component architecture
   - DND Kit integration patterns
   - Component type system

2. **From dry WorkManager**:
   - Task management components
   - Filtering patterns
   - Metrics visualization

3. **From dry document-builder**:
   - FlowBuilder undo/redo system
   - Autosave patterns
   - Keyboard shortcuts

---

## Summary

| Repository | Branch | Status | Action |
|------------|--------|--------|--------|
| bb/main | Active | Keep as primary |
| bb/feture/cp | Abandoned | Consider deleting |
| ui-l/main | Active | Source for FormBuilder patterns |
| ui-l/spec-tree | Historical | Keep as reference only |
| dry/dev | Active | Primary plugin development |
| dry/WorkManager | Feature | Review for patterns |
| dry/API-Routes | Feature | Review for patterns |
