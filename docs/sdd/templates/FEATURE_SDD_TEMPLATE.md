# Software Design Document: [Feature Name]

## Document Control

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Feature ID** | F{X}.{Y}.{Z} |
| **Status** | Draft |
| **Created** | YYYY-MM-DD |
| **Last Updated** | YYYY-MM-DD |
| **Author** | [Name] |
| **Reviewers** | [Names] |

### Status Legend

| Symbol | Status | Description |
|--------|--------|-------------|
| 📋 | Planned | Not started |
| 🟡 | In Progress | Active development |
| ✅ | Complete | Finished and verified |
| 🔴 | Blocked | Waiting on dependency |
| ❌ | Deprecated | No longer needed |

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | YYYY-MM-DD | [Name] | Initial draft |

---

## Executive Summary

### Overview
[2-3 sentences describing what this feature does and why it matters]

### Business Value
- [Key benefit 1]
- [Key benefit 2]
- [Key benefit 3]

### Success Metrics
| Metric | Target | Current |
|--------|--------|---------|
| [Metric name] | [Target value] | N/A |
| [Metric name] | [Target value] | N/A |

---

## Feature Metadata

| Field | Value |
|-------|-------|
| **Phase** | 1 / 2 / 3 / 4 |
| **Priority** | P0 / P1 / P2 / P3 |
| **Estimated Effort** | [X] days |
| **Assignee** | [Name or TBD] |
| **Branch** | `feat/{feature-id}-{short-name}` |
| **PR** | #[number] or N/A |

### Priority Definitions

| Priority | SLA | Description |
|----------|-----|-------------|
| **P0** | Same day | Critical - Core functionality broken |
| **P1** | 1-2 days | High - Essential feature, blocks others |
| **P2** | 3-5 days | Medium - Important but not blocking |
| **P3** | Next sprint | Low - Nice to have, future enhancement |

---

## User Story

**As a** [user type],
**I want** [capability],
**So that** [benefit].

### User Personas Affected

| Persona | Impact | Notes |
|---------|--------|-------|
| Product Manager | ⬜ Low / 🟨 Medium / 🟧 High | |
| Developer | ⬜ Low / 🟨 Medium / 🟧 High | |
| Tech Lead | ⬜ Low / 🟨 Medium / 🟧 High | |
| Designer | ⬜ Low / 🟨 Medium / 🟧 High | |
| Admin | ⬜ Low / 🟨 Medium / 🟧 High | |

---

## Requirements

### Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001 | [Requirement description] | P0/P1/P2 | 📋 |
| FR-002 | [Requirement description] | P0/P1/P2 | 📋 |
| FR-003 | [Requirement description] | P0/P1/P2 | 📋 |
| FR-004 | [Requirement description] | P0/P1/P2 | 📋 |

### Non-Functional Requirements

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-001 | Performance | [Requirement] | [Measurable target] |
| NFR-002 | Accessibility | [Requirement] | WCAG 2.1 AA |
| NFR-003 | Security | [Requirement] | [Standard/Certification] |
| NFR-004 | Scalability | [Requirement] | [Capacity target] |

### Edge Cases

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-001 | [Edge case] | [Behavior] |
| EC-002 | [Edge case] | [Behavior] |

---

## Technical Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Diagram                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Describe architecture with ASCII diagram]                 │
│                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│  │  Client  │────▶│   API    │────▶│ Database │           │
│  └──────────┘     └──────────┘     └──────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Models

```typescript
/**
 * [Interface description]
 * @example
 * const item: NewInterface = {
 *   id: 'uuid-here',
 *   field: 'value'
 * };
 */
interface NewInterface {
  /** Unique identifier */
  id: string;
  /** [Field description] */
  field: Type;
  /** [Optional field description] */
  optionalField?: Type;
}
```

### API Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/v1/...` | [Purpose] | Yes/No |
| POST | `/api/v1/...` | [Purpose] | Yes/No |
| PUT | `/api/v1/...` | [Purpose] | Yes/No |
| DELETE | `/api/v1/...` | [Purpose] | Yes/No |

#### Request/Response Examples

```typescript
// POST /api/v1/example
// Request
interface CreateExampleRequest {
  field: string;
  optionalField?: string;
}

// Response (200 OK)
interface CreateExampleResponse {
  success: true;
  data: {
    id: string;
    field: string;
    createdAt: string;
  };
}

// Response (Error)
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

### State Management

```typescript
// Zustand slice definition
interface FeatureState {
  // State properties
  items: Item[];
  isLoading: boolean;
  error: string | null;
}

interface FeatureActions {
  // Action definitions
  fetchItems: () => Promise<void>;
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
}

type FeatureSlice = FeatureState & FeatureActions;
```

### UI Components

| Component | Purpose | Props | Status |
|-----------|---------|-------|--------|
| `ComponentName` | [What it does] | `prop1: Type, prop2?: Type` | 📋 |

---

## Implementation Plan

### Phase 1: Foundation
| Step | Task | Estimated | Status |
|------|------|-----------|--------|
| 1 | [Task description] | [X]h | 📋 |
| 2 | [Task description] | [X]h | 📋 |

### Phase 2: Core Implementation
| Step | Task | Estimated | Status |
|------|------|-----------|--------|
| 3 | [Task description] | [X]h | 📋 |
| 4 | [Task description] | [X]h | 📋 |

### Phase 3: Integration & Testing
| Step | Task | Estimated | Status |
|------|------|-----------|--------|
| 5 | [Task description] | [X]h | 📋 |
| 6 | [Task description] | [X]h | 📋 |

---

## Files Affected

### New Files

| File Path | Purpose | LOC Est. |
|-----------|---------|----------|
| `src/path/to/new/file.tsx` | [Purpose] | ~[X] |
| `src/path/to/new/file.ts` | [Purpose] | ~[X] |

### Modified Files

| File Path | Changes | Impact |
|-----------|---------|--------|
| `src/path/to/existing/file.tsx` | [What changes] | Low/Med/High |
| `src/path/to/existing/file.ts` | [What changes] | Low/Med/High |

---

## Testing Strategy

### Test Coverage Targets

| Type | Target | Current |
|------|--------|---------|
| Unit Tests | 80% | N/A |
| Integration Tests | 70% | N/A |
| E2E Tests | Critical paths | N/A |

### Unit Tests

| Test Suite | Description | File |
|------------|-------------|------|
| `FeatureName.test.tsx` | [What it tests] | `__tests__/FeatureName.test.tsx` |

### Integration Tests

| Test Suite | Description | File |
|------------|-------------|------|
| `feature-api.test.ts` | [What it tests] | `__tests__/integration/feature-api.test.ts` |

### E2E Tests

| Test | Description | File |
|------|-------------|------|
| `feature-workflow.spec.ts` | [What it tests] | `e2e/feature-workflow.spec.ts` |

### Manual Testing Checklist

- [ ] Feature works in Chrome, Firefox, Safari
- [ ] Feature works on mobile viewport (375px)
- [ ] Keyboard navigation functional
- [ ] Screen reader announces correctly
- [ ] Error states display properly
- [ ] Loading states display properly
- [ ] Empty states display properly

---

## Dependencies

### Internal Dependencies

| Feature ID | Name | Status | Blocking? |
|------------|------|--------|-----------|
| F{X}.{Y}.{Z} | [Feature name] | 📋/🟡/✅ | Yes/No |

### External Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `package-name` | `^X.Y.Z` | [Why needed] | MIT/Apache |

### This Feature Blocks

| Feature ID | Name | Impact if Delayed |
|------------|------|-------------------|
| F{X}.{Y}.{Z} | [Feature name] | [Impact description] |

---

## Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|------------|--------|------------|-------|
| R-001 | [Risk description] | Low/Med/High | Low/Med/High | [Mitigation strategy] | [Name] |
| R-002 | [Risk description] | Low/Med/High | Low/Med/High | [Mitigation strategy] | [Name] |

---

## Rollout Plan

### Feature Flag Configuration

| Setting | Value |
|---------|-------|
| Flag Name | `feature_{feature_id}` |
| Default Value | `false` |
| Kill Switch | Yes |

### Rollout Phases

| Phase | Target | Duration | Rollback Criteria |
|-------|--------|----------|-------------------|
| 1. Internal | Team only | 3 days | Any P0 bugs |
| 2. Beta | 10% users | 1 week | Error rate > 1% |
| 3. GA | 100% users | - | Error rate > 0.5% |

### Monitoring

- [ ] Error tracking configured
- [ ] Performance metrics defined
- [ ] Alerts configured
- [ ] Dashboard created

---

## Definition of Done

### Code Quality
- [ ] All acceptance criteria met
- [ ] No `any` types in code
- [ ] No `@ts-ignore` or `eslint-disable`
- [ ] No `console.log` statements (use logger)
- [ ] All errors properly handled
- [ ] TypeScript strict mode passes

### Testing
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] E2E tests for critical paths
- [ ] Manual testing completed
- [ ] Accessibility tested (keyboard, screen reader)

### Documentation
- [ ] Code comments for complex logic
- [ ] API documentation updated
- [ ] README updated if needed
- [ ] CHANGELOG entry added

### Review & Deployment
- [ ] Code reviewed and approved
- [ ] PR merged to main
- [ ] Feature flag configured
- [ ] Monitoring configured
- [ ] Rollback plan verified

---

## Code Quality Standards

### Forbidden Patterns (NEVER Use)

```typescript
// FORBIDDEN - Will fail code review
any                           // Use specific types
@ts-ignore                    // Fix the type error
@ts-expect-error              // Fix the type error
eslint-disable                // Follow lint rules
console.log/warn/error        // Use logger service
catch(e) {}                   // Handle all errors
```

### Required Patterns

```typescript
// REQUIRED - Always use these patterns
const [items, setItems] = useState<ItemType[]>([]);  // Typed state
const notification = useNotification();              // Not useToast
logger.error('message', { context });                // Structured logging
```

### Import Order

```typescript
// 1. React/Next
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. External packages
import { z } from 'zod';

// 3. Internal modules
import { Button } from '@/components/ui';

// 4. Types
import type { User } from '@/types';
```

---

## References

- [Link to design mockups]
- [Link to related documentation]
- [Link to competitor implementation]
- [Link to relevant research]

---

## AI Agent Export Formats

### Cursor Rules Export

<details>
<summary>Click to expand Cursor rules format</summary>

```markdown
---
title: [Feature Name] Rules
description: AI coding rules for [Feature Name]
globs: ["src/features/[feature]/**/*"]
---

# Feature: [Feature Name]

## Context
[Brief description of the feature]

## Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS
- State: Zustand + React Query

## Code Patterns
- Follow pattern in: `src/components/ui/`
- Use `cn()` for conditional Tailwind classes
- Components in PascalCase

## Acceptance Criteria
[List from FR-001 through FR-XXX]

## Files
[List from Files Affected section]
```

</details>

### GitHub Copilot WRAP Export

<details>
<summary>Click to expand Copilot WRAP format</summary>

```markdown
## What
[User story: As a... I want... So that...]

## Requirements
- [ ] FR-001: [Requirement]
- [ ] FR-002: [Requirement]
- [ ] FR-003: [Requirement]

## Actual files
- `path/to/file.tsx` - [Purpose]
- `path/to/file.ts` - [Purpose]

## Patterns
Follow the pattern established in `src/components/ExistingFeature.tsx`
```

</details>

### Devin Task Export

<details>
<summary>Click to expand Devin task format</summary>

```markdown
## Task: [Feature Name]

**Scope**: [X] hours estimated work
**Labels**: devin, [frontend/backend/fullstack], [category]

### Context
[Brief description and dependencies]

### Acceptance Criteria
- [ ] FR-001: [Requirement]
- [ ] FR-002: [Requirement]
- [ ] Tests pass: `npm test -- --testPathPattern=[feature]`

### Technical Details
- File to create/modify: `src/path/to/file.tsx`
- Interface required: [TypeScript interface name]
- Follow pattern: `src/existing/reference.tsx`

### Verification Commands
\`\`\`bash
pnpm lint
pnpm typecheck
pnpm test -- --testPathPattern=[feature]
pnpm build
\`\`\`
```

</details>

### Universal JSON Export

<details>
<summary>Click to expand JSON specification</summary>

```json
{
  "specVersion": "2.0",
  "generatedBy": "SpecTree",
  "generatedAt": "[ISO timestamp]",
  "feature": {
    "id": "F{X}.{Y}.{Z}",
    "title": "[Feature Name]",
    "type": "[frontend/backend/fullstack]",
    "phase": [1-4],
    "priority": "[P0/P1/P2/P3]",
    "status": "[Draft/Ready/InProgress/Complete]",
    "context": {
      "project": "Spec Tree",
      "techStack": ["Next.js 14", "TypeScript", "Tailwind", "Strapi"],
      "existingPatterns": ["path/to/reference"]
    },
    "userStory": {
      "asA": "[user type]",
      "iWant": "[capability]",
      "soThat": "[benefit]"
    },
    "requirements": {
      "functional": [
        {"id": "FR-001", "description": "[requirement]", "priority": "P0"}
      ],
      "nonFunctional": [
        {"id": "NFR-001", "category": "Performance", "target": "[target]"}
      ]
    },
    "filesAffected": {
      "new": ["path/to/new/file.tsx"],
      "modified": ["path/to/existing/file.tsx"]
    },
    "testing": {
      "unit": ["test description"],
      "integration": ["test description"],
      "e2e": ["test description"]
    },
    "constraints": {
      "mustUse": ["[library]", "[pattern]"],
      "mustNotUse": ["any", "@ts-ignore", "console.log"],
      "performanceTarget": "[requirement]"
    }
  }
}
```

</details>
