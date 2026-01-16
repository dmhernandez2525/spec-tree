# Spec Tree AI Prompt Library

## Overview

This document contains the **actual AI prompts** used in Spec Tree for generating work items. These prompts are production-tested and follow specific patterns for structured output.

**Source:** `Client/components/spec-tree/lib/constants/prompts.ts`

## Work Item Generation Prompts

### Epic Generation Prompt

**System Prompt:**
```
You are an AI model trained to generate additional epics for software development projects.
```

**User Prompt Template:**
```typescript
const epicPrompt = (requirements: string, context?: string): string => `
  ${context ? `Additional Context: ${context}\n` : ''}
    Given the following requirements, generate an Epic in the JSON format as follows:
    {
      "title": "epic title",
      "description": "epic description",
      "goal": "epic goal",
      "successCriteria": "success criteria",
      "dependencies": "dependencies",
      "timeline": "timeline",
      "resources": "resources",
      "risksAndMitigation": {
        "resolve": [{ "text": "resolve strategy one" }, { "text": "resolve strategy two" }]
        "own": [{ "text": "own strategy one" }, { "text": "own strategy two" }]
        "accept": [{ "text": "accept strategy one" }, { "text": "accept strategy two" }]
        "mitigate": [{ "text": "mitigate strategy one" }, { "text": "mitigate strategy two" }]
      },
      "notes": "notes"
    }
    Please avoid repeating epics that have already been mentioned.
    Do not start a new JSON object if you cannot complete it within the character limit.
    Separate each JSON object with "=+=".
    ${requirements}
  `;
```

### Feature Generation Prompt

**System Prompt:**
```
You are an AI model trained to generate additional features and user stories for software development projects.
```

**User Prompt Template:**
```typescript
const featurePrompt = (epic: EpicType, state: RootState, context?: string): string => `
  ${context ? `Additional Context: ${context}\n` : ''}
  Given the epic with the following details:
  Title: ${epic.title}
  Description: ${epic.description}
  Goal: ${epic.goal}
  Success Criteria: ${epic.successCriteria}
  Dependencies: ${epic.dependencies}
  Timeline: ${epic.timeline}
  Resources: ${epic.resources}
  Risks and Mitigation Strategies: ${JSON.stringify(epic.risksAndMitigation)}
  Existing Features: ${mapFeatures(epic.featureIds, state)}

  Generate the technical details necessary for a developer to implement this feature.
  Please avoid repeating features that have already been mentioned.
  Return the response in the following JSON format:{
    "title": "feature title",
    "description": "feature description",
    "details": "feature details",
    "dependencies": "dependencies",
    "acceptanceCriteria": [
      { "text": "criteria one" },
      { "text": "criteria two" }
    ]
    "parent": "parent feature",
    "notes": "notes"
  }.
  Do not start a new JSON object if you cannot complete it within the character limit.
  Separate each JSON object with "=+=".
  `;
```

### User Story Generation Prompt

**System Prompt:**
```
You are an AI model trained to generate additional features and user stories for software development projects.
```

**User Prompt Template:**
```typescript
const userStoryPrompt = (feature: FeatureType, state: RootState, context?: string): string => `
  ${context ? `Additional Context: ${context}\n` : ''}
    Existing User Stories: ${mapUserStories(feature.userStoryIds, state)}
    Given the feature "${feature}", generate granular user stories from a development perspective.
    Each user story should be detailed enough that it would take a developer approximately one week to implement.
    Please avoid repeating user stories that have already been mentioned.
    Return each user story in the following JSON format: {
    "title": "user story title",
    "role": "user role",
    "action": "action",
    "goal": "goal",
    "points": "estimated points",
    "acceptanceCriteria": [
      { "text": "criteria one" },
      { "text": "criteria two" }
    ],
    "notes": "notes",
    "parent": "parent user story",
    "developmentOrder": "development order",
    "dependentUserStories": ["user story one", "user story two"]
    }.
    Do not start a new JSON object if you cannot complete it within the character limit.
    Separate each JSON object with "=+=".
  `;
```

### Task Generation Prompt

**System Prompt:**
```
You are an AI model trained to generate tasks for software development projects.
```

**User Prompt Template:**
```typescript
const taskPrompt = (userStory: UserStoryType, state: RootState, context?: string): string => `
  ${context ? `Additional Context: ${context}\n` : ''}
  Given the user story "${userStory.title}
  Role: ${userStory.role}
  Action: ${userStory.action}
  Acceptance criteria: ${userStory.acceptanceCriteria}
  Existing Tasks: ${mapTasks(userStory.taskIds, state)},

  generate granular tasks from a development perspective.
  Each task should be detailed enough that it would take a developer approximately one day to implement.
  Please avoid repeating tasks that have already been mentioned.
  Return each task in the following JSON format: {
    "title": "task title",
    "details": "task details",
    "priority": "task priority",
    "notes": "notes",
    "parent": "parent task",
    "dependentTasks": ["task one", "task two"]
  }.
  Do not start a new JSON object if you cannot complete it within the character limit.
  Separate each JSON object with "=+=".
  `;
```

## Contextual Question Generation Prompts

### Epic Context Questions

**System Prompt:**
```
You are an AI trained to generate contextual questions for software development projects.
```

**User Prompt Template:**
```typescript
const generateContextQuestionsForEpic = (epic: EpicType): string => `
Given the epic with the following details:
Title: ${epic.title}
Description: ${epic.description}
Goal: ${epic.goal}
Success Criteria: ${epic.successCriteria}
Dependencies: ${epic.dependencies}
Timeline: ${epic.timeline}
Resources: ${epic.resources}
Risks and Mitigation Strategies: ${JSON.stringify(epic.risksAndMitigation)}

Generate a set of questions that would help in understanding the detailed requirements,
dependencies, goals, and other aspects of this epic.
The answers to these questions will be used to create a detailed context for generating
work items related to this epic.

Return each question in a separate line and use "=+=" as a separator between questions.
Please include only the questions and "=+=" separators without any additional text or formatting.
`;
```

### Feature Context Questions

```typescript
const generateContextQuestionsForFeature = (feature: FeatureType): string => `
Given the feature with the following details:
Title: ${feature.title}
Description: ${feature.description}
Details: ${feature.details}
Dependencies: ${feature.dependencies}
Acceptance Criteria: ${JSON.stringify(feature.acceptanceCriteria)}
Notes: ${feature.notes}

Generate a set of questions that would help in understanding the detailed requirements,
dependencies, user needs, and technical aspects of this feature.

Return each question in a separate line and use "=+=" as a separator between questions.
`;
```

### Global Refinement Questions

```typescript
const generateContextQuestionsForGlobalRefinement = (globalInformation: string): string => `
Global Information: ${globalInformation}

Please generate a set of questions that would help in refining and understanding the overall
context, requirements, architecture, and other aspects of the application.

Return each question on a new line, and separate each question with "=+=".
Include only the questions and "=+=" separators in the response.
`;
```

## Key Prompt Engineering Patterns

### 1. Structured JSON Output

All prompts request JSON output with explicit schema:
```
Return the response in the following JSON format:{
  "field1": "value",
  "field2": "value"
}
```

### 2. Separator Pattern

Use custom separators for parsing multiple items:
- `"=+="` - Primary separator for multiple JSON objects
- `"####"` - Alternative separator in some prompts

### 3. Deduplication Instructions

All prompts include:
```
Please avoid repeating [items] that have already been mentioned.
```

### 4. Context Injection

Optional context parameter at the start:
```typescript
${context ? `Additional Context: ${context}\n` : ''}
```

### 5. Existing Item Awareness

Include existing items to prevent duplicates:
```typescript
Existing Features: ${mapFeatures(epic.featureIds, state)}
```

### 6. Granularity Guidelines

- Epic: Large initiative
- Feature: Technical details
- User Story: ~1 week of work
- Task: ~1 day of work

### 7. Token Limit Handling

```
Do not start a new JSON object if you cannot complete it within the character limit.
```

## AI Integration Architecture

```
Client                      Microservice                 OpenAI
  │                              │                          │
  │  makeProxyCall()             │                          │
  │ ─────────────────────────────>                          │
  │  { systemPrompt,             │                          │
  │    userPrompt,               │  openai.chat.completions │
  │    selectedModel }           │ ────────────────────────>│
  │                              │                          │
  │                              │  completion.choices[0]   │
  │  <─────────────────────────── <────────────────────────│
  │  response.data.choices[0]    │                          │
  │  .message.content            │                          │
  │                              │                          │
  │  Parse JSON with "=+="       │                          │
  │  separator                   │                          │
```

## Model Configuration

**Default Model:** `gpt-3.5-turbo` (used in hooks)

**Configurable via:** `selectedModel` parameter

**Available in UI:** AISettings component allows model selection

## Error Handling

```typescript
const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorContext: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${errorContext}:`, error);
    throw error;
  }
};
```

## Usage Examples

### Generate Features for an Epic

```typescript
const response = await generateAdditionalFeatures({
  epic: selectedEpic,
  state: reduxState,
  selectedModel: 'gpt-4',
  context: userProvidedContext // optional
});
```

### Generate Context Questions

```typescript
const questions = await generateQuestionsForEpic({
  epic: selectedEpic,
  selectedModel: 'gpt-3.5-turbo'
});

// Parse response
const parsedQuestions = response.data.choices[0].message.content
  .split('=+=')
  .map(q => q.trim())
  .filter(q => q.length > 0);
```
