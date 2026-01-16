# Spec Tree - AI Integration Architecture

**Date**: January 15, 2025
**Purpose**: Document how AI integration works in the Spec Tree codebase

## Overview

Spec Tree uses OpenAI's GPT models to generate work items (Epics, Features, User Stories, Tasks) and contextual questions. The architecture follows a three-tier model:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│ Microservice │────▶│   OpenAI    │
│  (Next.js)  │◀────│  (Express)   │◀────│    API      │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Architecture Flow

### 1. Client Layer

**Location**: `Client/components/spec-tree/lib/`

```
lib/
├── api/
│   └── openai.ts           # API functions for AI calls
├── constants/
│   └── prompts.ts          # Prompt templates
└── hooks/
    └── useAI.ts            # React hooks for AI operations
```

### 2. Microservice Layer

**Location**: `Microservice/src/`

```
src/
├── routes/
│   └── openai.routes.ts    # API endpoints
└── services/
    └── openai.service.ts   # OpenAI SDK integration
```

### 3. External API

**Provider**: OpenAI
**Models**: gpt-3.5-turbo (default), gpt-4 (configurable)

---

## Request Flow

### Work Item Generation

```
User clicks "Generate Features"
         │
         ▼
┌─────────────────────────────────────┐
│  Client: generateAdditionalFeatures │
│  - Builds prompt from epic data     │
│  - Includes existing features       │
│  - Adds optional context            │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Client: makeProxyCall()            │
│  POST /api/openai/chat              │
│  Body: {                            │
│    systemPrompt,                    │
│    userPrompt,                      │
│    selectedModel                    │
│  }                                  │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Microservice: OpenAI Route         │
│  - Validates request                │
│  - Calls OpenAI service             │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Microservice: OpenAI Service       │
│  openai.chat.completions.create({   │
│    model: selectedModel,            │
│    messages: [                      │
│      { role: "system", content },   │
│      { role: "user", content }      │
│    ]                                │
│  })                                 │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  OpenAI API Response                │
│  completion.choices[0].message      │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Client: Parse Response             │
│  - Split by "=+=" separator         │
│  - Parse each JSON object           │
│  - Validate against schema          │
│  - Add to Redux store               │
└─────────────────────────────────────┘
```

---

## Key Files

### Client/components/spec-tree/lib/api/openai.ts

```typescript
// Main proxy call function
export const makeProxyCall = async (
  systemPrompt: string,
  userPrompt: string,
  selectedModel: string
) => {
  const response = await axios.post(
    `${MICROSERVICE_URL}/api/openai/chat`,
    { systemPrompt, userPrompt, selectedModel }
  );
  return response.data;
};

// Work item generators
export const generateAdditionalFeatures = async ({
  epic,
  state,
  selectedModel,
  context
}: GenerateFeaturesParams) => {
  const systemPrompt = "You are an AI model trained to generate...";
  const userPrompt = featurePrompt(epic, state, context);
  return makeProxyCall(systemPrompt, userPrompt, selectedModel);
};

export const generateAdditionalEpics = async (...) => {...};
export const generateUserStories = async (...) => {...};
export const generateTasks = async (...) => {...};

// Context question generators
export const generateQuestionsForEpic = async (...) => {...};
export const generateQuestionsForFeature = async (...) => {...};
export const generateQuestionsForGlobalRefinement = async (...) => {...};
```

### Client/components/spec-tree/lib/constants/prompts.ts

```typescript
// Prompt builders for each work item type
export const epicPrompt = (requirements: string, context?: string) => `...`;
export const featurePrompt = (epic: EpicType, state: RootState, context?: string) => `...`;
export const userStoryPrompt = (feature: FeatureType, state: RootState, context?: string) => `...`;
export const taskPrompt = (userStory: UserStoryType, state: RootState, context?: string) => `...`;

// Context question generators
export const generateContextQuestionsForEpic = (epic: EpicType) => `...`;
export const generateContextQuestionsForFeature = (feature: FeatureType) => `...`;
export const generateContextQuestionsForGlobalRefinement = (globalInfo: string) => `...`;
```

### Microservice/src/services/openai.service.ts

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateChatCompletion = async (
  systemPrompt: string,
  userPrompt: string,
  model: string = 'gpt-3.5-turbo'
) => {
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  return completion.choices[0].message.content;
};
```

---

## Prompt Engineering Patterns

### 1. System Prompts

Each work item type has a specific system prompt:

| Type | System Prompt |
|------|---------------|
| Epic | "You are an AI model trained to generate additional epics for software development projects." |
| Feature | "You are an AI model trained to generate additional features and user stories for software development projects." |
| User Story | Same as Feature |
| Task | "You are an AI model trained to generate tasks for software development projects." |
| Context Questions | "You are an AI trained to generate contextual questions for software development projects." |

### 2. JSON Output Format

All prompts request structured JSON output:

```
Return the response in the following JSON format:{
  "field1": "value",
  "field2": "value"
}
```

### 3. Separator Pattern

Multiple items are separated by `"=+="`:

```
{"title": "Feature 1", ...}
=+=
{"title": "Feature 2", ...}
=+=
{"title": "Feature 3", ...}
```

### 4. Deduplication

All prompts include existing items to prevent duplicates:

```typescript
Existing Features: ${mapFeatures(epic.featureIds, state)}
Please avoid repeating features that have already been mentioned.
```

### 5. Context Injection

Optional context parameter at prompt start:

```typescript
${context ? `Additional Context: ${context}\n` : ''}
```

### 6. Granularity Guidelines

Prompts specify expected work size:
- User Story: "~1 week of work"
- Task: "~1 day of work"

### 7. Token Limit Handling

```
Do not start a new JSON object if you cannot complete it within the character limit.
```

---

## Response Parsing

### Client-Side Parsing

```typescript
const parseAIResponse = (response: string): WorkItem[] => {
  const items = response
    .split('=+=')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => {
      try {
        return JSON.parse(item);
      } catch (e) {
        console.error('Failed to parse item:', item);
        return null;
      }
    })
    .filter(item => item !== null);

  return items;
};
```

### Error Handling

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

---

## Model Configuration

### Default Model

`gpt-3.5-turbo` - Used for most operations

### Configurable via UI

The AISettings component allows users to select:
- gpt-3.5-turbo
- gpt-4
- gpt-4-turbo

### Selection Storage

Model preference stored in:
- App-level: `app.selectedModel` in Strapi
- Session-level: Redux state

---

## Context Propagation

### How Context Flows

1. **Global Context** (`app.globalInformation`)
   - Applies to all work items in the app
   - Set at application level

2. **Contextual Questions**
   - AI generates questions based on work item
   - User answers are stored
   - Answers become context for child generation

3. **Parent Context**
   - Each work item includes parent details
   - Epic context → Feature generation
   - Feature context → User Story generation
   - User Story context → Task generation

### Context Chain Example

```
App (globalInformation)
  └── Epic (goal, successCriteria)
        └── Feature (details, acceptanceCriteria)
              └── User Story (role, action, goal)
                    └── Task (details, priority)
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Microservice
OPENAI_API_KEY=sk-...

# Client
NEXT_PUBLIC_MICROSERVICE_URL=http://localhost:3001
```

### API Rate Limiting

The microservice should implement rate limiting:
- Per-user limits
- Global limits
- Retry with exponential backoff

---

## Security Considerations

1. **API Key Protection**
   - Never expose OpenAI key to client
   - All calls routed through microservice

2. **Input Sanitization**
   - Validate user-provided context
   - Sanitize prompts before sending

3. **Output Validation**
   - Validate parsed JSON against schemas
   - Reject malformed responses

---

## Performance Optimization

### Caching Opportunities

1. **Question caching** - Same work item generates same questions
2. **Partial generation** - Cache incomplete generations for retry

### Streaming (Future)

Consider implementing streaming for long generations:

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

---

## Testing

### Mock Responses

For testing, mock the OpenAI service:

```typescript
jest.mock('../services/openai.service', () => ({
  generateChatCompletion: jest.fn().mockResolvedValue(
    '{"title": "Test Feature", "description": "Test"}'
  )
}));
```

### Integration Tests

Test the full flow with recorded responses:

```typescript
describe('Feature Generation', () => {
  it('generates features from epic', async () => {
    const result = await generateAdditionalFeatures({
      epic: mockEpic,
      state: mockState,
      selectedModel: 'gpt-3.5-turbo'
    });

    expect(result).toHaveProperty('choices');
    expect(result.choices[0].message.content).toContain('title');
  });
});
```
