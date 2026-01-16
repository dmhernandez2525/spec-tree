# Spec Tree - Strapi Content Types

## Overview

These are the actual data models used in Spec Tree's Strapi backend. The hierarchy flows: Organization -> App -> Epic -> Feature -> UserStory -> Task

## Entity Relationship Diagram

```
Organization (1) ──── (N) App (1) ──── (N) Epic (1) ──── (N) Feature (1) ──── (N) UserStory (1) ──── (N) Task
                                  │                 │                    │                     │
                                  └── ContextualQuestion (can attach to any work item level)
```

## Core Work Item Content Types

### Organization

**Collection Type** | `api::organization.organization`

```json
{
  "kind": "collectionType",
  "collectionName": "organizations",
  "attributes": {
    "name": { "type": "string", "required": true },
    "size": {
      "type": "enumeration",
      "enum": ["micro_1_10", "small_11_50", "medium_51_200", "large_201_500", "xlarge_501_1000", "enterprise_1001_plus"],
      "required": true
    },
    "industry": {
      "type": "enumeration",
      "enum": ["technology", "finance", "healthcare", "education", "manufacturing", "retail", "other"],
      "required": true
    },
    "description": { "type": "text" },
    "websiteUrl": { "type": "string" },
    "ownerId": { "type": "string", "required": true },
    "apps": { "relation": "oneToMany", "target": "api::app.app" },
    "supportTickets": { "relation": "oneToMany", "target": "api::support-ticket.support-ticket" }
  }
}
```

**Purpose:** Multi-tenant container for organizations using Spec Tree

### App

**Collection Type** | `api::app.app`

```json
{
  "kind": "collectionType",
  "collectionName": "apps",
  "attributes": {
    "applactionInformation": { "type": "text" },
    "globalInformation": { "type": "text" },
    "selectedModel": { "type": "string" },
    "organization": { "relation": "manyToOne", "target": "api::organization.organization" },
    "epics": { "relation": "oneToMany", "target": "api::epic.epic" },
    "contextualQuestions": { "relation": "oneToMany", "target": "api::contextual-question.contextual-question" }
  }
}
```

**Purpose:** Top-level project container. Stores global context for AI generation.

**Key Fields:**
- `applactionInformation` - Description of the application being built
- `globalInformation` - Context that propagates to all child work items
- `selectedModel` - AI model preference (e.g., "gpt-4", "gpt-3.5-turbo")

### Epic

**Collection Type** | `api::epic.epic`

```json
{
  "kind": "collectionType",
  "collectionName": "epics",
  "attributes": {
    "title": { "type": "string" },
    "description": { "type": "text" },
    "goal": { "type": "string" },
    "successCriteria": { "type": "string" },
    "dependencies": { "type": "string" },
    "timeline": { "type": "string" },
    "resources": { "type": "string" },
    "notes": { "type": "string" },
    "app": { "relation": "manyToOne", "target": "api::app.app" },
    "features": { "relation": "oneToMany", "target": "api::feature.feature" },
    "contextualQuestions": { "relation": "oneToMany", "target": "api::contextual-question.contextual-question" },
    "risksAndMitigation": {
      "type": "component",
      "repeatable": true,
      "component": "datasets.risks-and-mitigation"
    }
  }
}
```

**Purpose:** Large initiative or theme containing multiple features

**Key Fields:**
- `risksAndMitigation` - Component with resolve/own/accept/mitigate strategies

### Feature

**Collection Type** | `api::feature.feature`

```json
{
  "kind": "collectionType",
  "collectionName": "features",
  "attributes": {
    "title": { "type": "string" },
    "description": { "type": "text" },
    "details": { "type": "text" },
    "notes": { "type": "string" },
    "epic": { "relation": "manyToOne", "target": "api::epic.epic" },
    "userStories": { "relation": "oneToMany", "target": "api::user-story.user-story" },
    "contextualQuestions": { "relation": "oneToMany", "target": "api::contextual-question.contextual-question" },
    "acceptanceCriteria": {
      "type": "component",
      "repeatable": true,
      "component": "micro-component.acceptance-criteria"
    }
  }
}
```

**Purpose:** Specific functionality within an Epic

### UserStory

**Collection Type** | `api::user-story.user-story`

```json
{
  "kind": "collectionType",
  "collectionName": "user_stories",
  "attributes": {
    "title": { "type": "string" },
    "goal": { "type": "text" },
    "role": { "type": "string" },
    "actionStr": { "type": "string" },
    "points": { "type": "integer" },
    "developmentOrder": { "type": "integer" },
    "notes": { "type": "string" },
    "feature": { "relation": "manyToOne", "target": "api::feature.feature" },
    "tasks": { "relation": "oneToMany", "target": "api::task.task" },
    "contextualQuestions": { "relation": "oneToMany", "target": "api::contextual-question.contextual-question" },
    "acceptanceCriteria": {
      "type": "component",
      "repeatable": true,
      "component": "micro-component.acceptance-criteria"
    }
  }
}
```

**Purpose:** User-focused requirement (As a [role], I want [action] so that [goal])

**Key Fields:**
- `points` - Fibonacci estimation (1, 2, 3, 5, 8, 13, 21)
- `developmentOrder` - Suggested implementation sequence

### Task

**Collection Type** | `api::task.task`

```json
{
  "kind": "collectionType",
  "collectionName": "tasks",
  "attributes": {
    "title": { "type": "string" },
    "details": { "type": "string" },
    "priority": { "type": "integer" },
    "notes": { "type": "string" },
    "userStory": { "relation": "manyToOne", "target": "api::user-story.user-story" },
    "contextualQuestions": { "relation": "oneToMany", "target": "api::contextual-question.contextual-question" }
  }
}
```

**Purpose:** Implementation task (~1 day of work)

### ContextualQuestion

**Collection Type** | `api::contextual-question.contextual-question`

```json
{
  "kind": "collectionType",
  "collectionName": "contextual_questions",
  "attributes": {
    "question": { "type": "text" },
    "answer": { "type": "text" },
    "app": { "relation": "manyToOne", "target": "api::app.app" },
    "epic": { "relation": "manyToOne", "target": "api::epic.epic" },
    "feature": { "relation": "manyToOne", "target": "api::feature.feature" },
    "task": { "relation": "manyToOne", "target": "api::task.task" },
    "userStories": { "relation": "manyToOne", "target": "api::user-story.user-story" }
  }
}
```

**Purpose:** AI-generated questions with user answers to gather context for work item generation

**Key Pattern:** Can be attached to ANY work item level (App, Epic, Feature, UserStory, Task)

## Component Types

### datasets.risks-and-mitigation

Used in Epic for risk management:
```json
{
  "resolve": [{ "text": "string" }],
  "own": [{ "text": "string" }],
  "accept": [{ "text": "string" }],
  "mitigate": [{ "text": "string" }]
}
```

### micro-component.acceptance-criteria

Used in Feature and UserStory:
```json
{
  "text": "string"
}
```

## Usage Notes

1. **Draft/Publish**: All content types support `draftAndPublish: true`
2. **Relations**: Use inverse relations for bidirectional queries
3. **Context Propagation**: ContextualQuestions can attach to any level and propagate context down
