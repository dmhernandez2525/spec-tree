# Software Design Documents (SDDs)

This directory contains Software Design Documents for Spec Tree features. Each feature that requires implementation receives its own SDD before development begins.

## Phase Overviews

| Phase | Focus | Document |
|-------|-------|----------|
| Phase 1 | Foundation | [PHASE_1_OVERVIEW.md](./phase-1/PHASE_1_OVERVIEW.md) |
| Phase 2 | AI Tool Integration | [PHASE_2_OVERVIEW.md](./phase-2/PHASE_2_OVERVIEW.md) |
| Phase 3 | Advanced Integrations | [PHASE_3_OVERVIEW.md](./phase-3/PHASE_3_OVERVIEW.md) |
| Phase 4 | Enterprise & Scale | [PHASE_4_OVERVIEW.md](./phase-4/PHASE_4_OVERVIEW.md) |
| Phase 6 | Collaboration | [PHASE_6_OVERVIEW.md](./phase-6/PHASE_6_OVERVIEW.md) |

## Directory Structure

```
sdd/
├── README.md                         # This file
├── templates/
│   └── FEATURE_SDD_TEMPLATE.md      # SDD template
├── phase-1/                          # Foundation (Q1 2026)
│   ├── PHASE_1_OVERVIEW.md          # Phase overview
│   └── F1.1.9-multi-provider-ai-backend.md
├── phase-2/                          # AI Tool Integration (Q2 2026)
│   ├── PHASE_2_OVERVIEW.md          # Phase overview
│   ├── F2.1.1-cursor-rules-export.md
│   └── F2.1.5-copilot-export.md
├── phase-3/                          # Advanced Integrations (Q3 2026)
│   └── PHASE_3_OVERVIEW.md          # Phase overview
├── phase-4/                          # Enterprise & Scale (Q4 2026)
│   └── PHASE_4_OVERVIEW.md          # Phase overview
└── phase-6/                          # Collaboration
    ├── PHASE_6_OVERVIEW.md          # Phase overview
    └── F2.3.3-version-control.md    # Feature SDD
```

## SDD Workflow

### 1. Before Starting a Feature

1. Create SDD from template in appropriate phase directory
2. Fill out all required sections
3. Review with stakeholders if needed
4. Create feature branch: `feat/{feature-id}-{short-name}`

### 2. During Development

1. Reference SDD during implementation
2. Update SDD if requirements change
3. Check off acceptance criteria as completed
4. Note any deviations from original design

### 3. After Completion

1. Mark SDD as implemented
2. Create pull request referencing SDD
3. Archive SDD with implementation date

## Naming Convention

SDD files follow this pattern:
```
{Feature-ID}-{kebab-case-name}.md
```

Examples:
- `F1.1.1-drag-drop-reordering.md`
- `F2.1.1-cursor-rules-export.md`
- `F3.1.1-mcp-server-core.md`

## Feature ID Convention

Feature IDs follow: `F{Phase}.{Category}.{Number}`

- **Phase**: 1+ (project-defined phase groups)
- **Category**: Subcategory within phase
- **Number**: Sequential feature number

## SDD Sections

Every SDD must include:

1. **Metadata** - ID, status, dates, assignee
2. **Overview** - Brief description and business value
3. **User Story** - As a/I want/So that format
4. **Acceptance Criteria** - Testable requirements
5. **Technical Design** - Architecture and implementation details
6. **Files Affected** - List of files to create/modify
7. **Testing Strategy** - Unit, integration, E2E tests
8. **Dependencies** - What this feature depends on
9. **Risks & Mitigations** - Potential issues and solutions
10. **Definition of Done** - Completion checklist

## Status Values

| Status | Description |
|--------|-------------|
| Draft | SDD being written |
| Ready | SDD complete, ready for development |
| In Progress | Feature being developed |
| Implemented | Feature complete, PR merged |
| Archived | Feature shipped to production |

## Related Documents

- [FEATURE_BACKLOG.md](../FEATURE_BACKLOG.md) - Master feature list
- [ROADMAP.md](../ROADMAP.md) - Product roadmap
- [IMPLEMENTATION_PRIORITY_MATRIX.md](../IMPLEMENTATION_PRIORITY_MATRIX.md) - Top 50 priorities

---

**Last Updated:** February 15, 2026
