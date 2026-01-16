# Spec Tree - Type Issues (`any` usages)

**Generated:** January 16, 2026
**Total:** 75 occurrences across 19 files

Using `any` type defeats the purpose of TypeScript. Each should be replaced with proper typing.

---

## By File

| File | Count | Priority |
|------|-------|----------|
| `api/fetchData.ts` | 19 | High - core API file |
| `components/spec-tree/components/format-data/format-data.tsx` | 19 | High - data formatting |
| `lib/store/sow-slice.ts` | 18 | High - core Redux state |
| `lib/store/user-slice.ts` | 3 | Medium |
| `lib/store/subscription-slice.ts` | 2 | Medium |
| `components/marketing/ResultsGraph.tsx` | 2 | Low - marketing |
| `types/main.ts` | 1 | High - type definitions |
| `lib/hooks/useLoadingMessage.ts` | 1 | Low |
| `lib/hooks/useHomePageData.ts` | 1 | Low |
| `utils/protectedRoutes.ts` | 1 | Medium |
| `components/dashboard/DashboardNav.tsx` | 1 | Low |
| `components/spec-tree/lib/api/strapi-service.ts` | 1 | Medium |
| `components/marketing/blog/BlogList.tsx` | 1 | Low |
| `components/spec-tree/lib/types/api.ts` | 1 | Medium |
| `components/dashboard/theme/index.tsx` | 1 | Low |
| `components/spec-tree/lib/utils/make-delete-handler.ts` | 1 | Low |
| `components/spec-tree/lib/hooks/use-question-generation.ts` | 1 | Medium |
| `components/spec-tree/lib/utils/make-update-handler.ts` | 1 | Low |
| `components/dashboard/organization/OrganizationManagement.tsx` | 1 | Medium |
| `components/dashboard/organization/SubscriptionManagement.tsx` | 1 | Medium |

---

## High Priority Fixes

### 1. `api/fetchData.ts` (19 occurrences)

**Common patterns:**

```typescript
// Before
const handleError = (error: any, endpoint: string) => { ... }

// After
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
const handleError = (error: ApiError | Error, endpoint: string) => { ... }
```

```typescript
// Before
const createData = async <T>(endpoint: string, data: any): Promise<T> => { ... }

// After
const createData = async <T, D = unknown>(endpoint: string, data: D): Promise<T> => { ... }
```

### 2. `lib/store/sow-slice.ts` (18 occurrences)

**Common patterns:**

```typescript
// Before
reducers: {
  setSow: (state, action: PayloadAction<any>) => { ... }
}

// After
interface SowPayload {
  id: string;
  epics: Record<string, EpicType>;
  features: Record<string, FeatureType>;
  // etc.
}
reducers: {
  setSow: (state, action: PayloadAction<SowPayload>) => { ... }
}
```

### 3. `format-data.tsx` (19 occurrences)

**Likely dealing with Strapi response parsing:**

```typescript
// Before
const parseData = (data: any) => { ... }

// After
interface StrapiResponse<T> {
  data: {
    id: number;
    attributes: T;
  }[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}
const parseData = <T>(data: StrapiResponse<T>) => { ... }
```

---

## Type Definition Suggestions

### Strapi API Response Types

```typescript
// types/strapi.ts
export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface StrapiResponse<T> {
  data: StrapiEntity<T> | StrapiEntity<T>[] | null;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
  };
}
```

### API Error Types

```typescript
// types/api.ts
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };
```

### Redux Action Payloads

```typescript
// types/store.ts
export interface UpdateFieldPayload {
  id: string;
  field: string;
  value: string | number | boolean | object;
}

export interface DeletePayload {
  id: string;
}

export interface AddItemPayload<T> {
  parentId: string;
  item: T;
}
```

---

## Refactoring Strategy

### Step 1: Define Core Types
Create comprehensive types for all entities in `types/` directory.

### Step 2: Fix High Priority Files
Start with core files that are used everywhere:
1. `api/fetchData.ts`
2. `lib/store/sow-slice.ts`
3. `types/main.ts`

### Step 3: Fix Spec Tree Types
Address types in the core feature:
1. `format-data.tsx`
2. `strapi-service.ts`
3. Various hooks and utils

### Step 4: Fix Remaining Files
Clean up marketing and dashboard components.

---

## ESLint Rule

Consider adding strict type checking:

```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

This will prevent new `any` types from being introduced.

---

## Progress Tracking

| File | Status | Assignee |
|------|--------|----------|
| `api/fetchData.ts` | ⬜ Not Started | - |
| `lib/store/sow-slice.ts` | ⬜ Not Started | - |
| `format-data.tsx` | ⬜ Not Started | - |
| `lib/store/user-slice.ts` | ⬜ Not Started | - |
| `lib/store/subscription-slice.ts` | ⬜ Not Started | - |
| Others (13 files) | ⬜ Not Started | - |
