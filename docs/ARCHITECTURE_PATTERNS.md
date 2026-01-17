# Spec Tree Architecture Patterns

**Version:** 1.0.0
**Last Updated:** January 17, 2026

---

## Overview

This document defines the architectural patterns, system designs, and infrastructure standards for the Spec Tree project. These patterns ensure scalability, maintainability, and consistency across the codebase.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Component Architecture](#3-component-architecture)
4. [State Management Architecture](#4-state-management-architecture)
5. [API Architecture](#5-api-architecture)
6. [CMS Integration Architecture](#6-cms-integration-architecture)
7. [Testing Architecture](#7-testing-architecture)
8. [Multi-Agent Orchestration](#8-multi-agent-orchestration)
9. [Infrastructure Patterns](#9-infrastructure-patterns)
10. [Security Architecture](#10-security-architecture)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Next.js 14    │  │   React Admin   │                   │
│  │   (Client App)  │  │   (Dashboard)   │                   │
│  │   App Router    │  │   Vite Build    │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            └─────────┬──────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                      API Layer                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Express       │  │   Strapi V5     │                   │
│  │   Microservice  │  │   CMS API       │                   │
│  │   (AI Proxy)    │  │   (Content)     │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            └─────────┬──────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   PostgreSQL    │  │   Redis         │                   │
│  │   (Primary DB)  │  │   (Cache/Queue) │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Architecture

```
User Request → Next.js → TanStack Query → API Service
                                              ↓
                                         Microservice
                                              ↓
                                         Strapi CMS → PostgreSQL
                                              ↓
                                         Response ← Cache (Redis)
                                              ↓
                                         TanStack Query Cache
                                              ↓
                                         Zustand (Client State)
                                              ↓
                                         React Component
```

---

## 2. Monorepo Structure

### 2.1 Turborepo Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "env": ["NODE_ENV", "NEXT_PUBLIC_*"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": ["tsconfig.tsbuildinfo"],
      "cache": true
    }
  }
}
```

### 2.2 Package Structure

```
spectree/
├── apps/
│   ├── client/                 # Next.js 14 client application
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # App-specific components
│   │   │   ├── features/       # Feature modules
│   │   │   └── lib/            # App utilities
│   │   └── package.json
│   │
│   ├── server/                 # Strapi 5 CMS
│   │   ├── src/
│   │   │   ├── api/            # Content types
│   │   │   ├── components/     # Strapi components
│   │   │   └── plugins/        # Custom plugins
│   │   └── package.json
│   │
│   └── microservice/           # Express AI proxy service
│       ├── src/
│       │   ├── routes/         # API routes
│       │   ├── services/       # Business logic
│       │   └── middleware/     # Express middleware
│       └── package.json
│
├── packages/
│   ├── shared-types/           # TypeScript definitions
│   ├── shared-utils/           # Utility functions
│   ├── ui/                     # UI component library
│   └── strapi-client/          # Strapi API client
│
├── turbo.json                  # Turborepo configuration
└── package.json                # Root package.json
```

### 2.3 Shared Package Pattern

```typescript
// packages/shared-types/src/index.ts
export * from './work-items';
export * from './api';
export * from './common';

// packages/shared-types/src/work-items.ts
export interface WorkItem {
  id: string;
  documentId: string;
  title: string;
  description: string;
  type: WorkItemType;
  status: WorkItemStatus;
  priority: Priority;
  parentId: string | null;
  children: WorkItem[];
  createdAt: string;
  updatedAt: string;
}

export type WorkItemType = 'app' | 'epic' | 'feature' | 'story' | 'task';
export type WorkItemStatus = 'draft' | 'active' | 'completed' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Components                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Layout → Error Boundary → Suspense → Feature Container  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Feature Components                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │  Data Loader  │  │   State       │  │  Presenter    │   │
│  │  (TanStack)   │→ │   Manager     │→ │  Component    │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI Components                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │  Atoms    │  │ Molecules │  │ Organisms │  │Templates │ │
│  │ (Button,  │  │ (Card,    │  │ (Form,    │  │ (Page    │ │
│  │  Input)   │  │  List)    │  │  Table)   │  │  Layout) │ │
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Feature Module Pattern

```typescript
// features/work-items/index.ts
export { WorkItemsPage } from './components/WorkItemsPage';
export { WorkItemEditor } from './components/WorkItemEditor';
export { useWorkItems } from './hooks/useWorkItems';
export { useWorkItemMutations } from './hooks/useWorkItemMutations';
export { workItemsStore } from './store/workItemsStore';
export type { WorkItem, CreateWorkItemDto } from './types';

// features/work-items/components/WorkItemsPage.tsx
import { useWorkItems } from '../hooks/useWorkItems';
import { WorkItemsList } from './WorkItemsList';
import { WorkItemsToolbar } from './WorkItemsToolbar';

export function WorkItemsPage() {
  const { data, isLoading, error } = useWorkItems();

  if (isLoading) return <WorkItemsPageSkeleton />;
  if (error) return <WorkItemsPageError error={error} />;

  return (
    <div className="work-items-page">
      <WorkItemsToolbar />
      <WorkItemsList items={data?.items ?? []} />
    </div>
  );
}
```

### 3.3 Compound Component Pattern

```typescript
// components/Tree/Tree.tsx
import { createContext, useContext, useState } from 'react';

interface TreeContextValue {
  expandedIds: Set<string>;
  selectedId: string | null;
  toggleExpanded: (id: string) => void;
  select: (id: string) => void;
}

const TreeContext = createContext<TreeContextValue | null>(null);

function useTreeContext() {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('Tree components must be used within Tree.Root');
  }
  return context;
}

// Root component
function Root({ children }: { children: React.ReactNode }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <TreeContext.Provider
      value={{ expandedIds, selectedId, toggleExpanded, select: setSelectedId }}
    >
      <div role="tree">{children}</div>
    </TreeContext.Provider>
  );
}

// Item component
function Item({
  id,
  children,
  label,
}: {
  id: string;
  children?: React.ReactNode;
  label: React.ReactNode;
}) {
  const { expandedIds, selectedId, toggleExpanded, select } = useTreeContext();
  const isExpanded = expandedIds.has(id);
  const isSelected = selectedId === id;

  return (
    <div role="treeitem" aria-expanded={isExpanded} aria-selected={isSelected}>
      <div onClick={() => select(id)}>
        {children && (
          <button onClick={(e) => { e.stopPropagation(); toggleExpanded(id); }}>
            {isExpanded ? '-' : '+'}
          </button>
        )}
        {label}
      </div>
      {isExpanded && children && <div role="group">{children}</div>}
    </div>
  );
}

// Export compound component
export const Tree = { Root, Item };

// Usage
<Tree.Root>
  <Tree.Item id="1" label="Parent">
    <Tree.Item id="1.1" label="Child 1" />
    <Tree.Item id="1.2" label="Child 2" />
  </Tree.Item>
</Tree.Root>
```

---

## 4. State Management Architecture

### 4.1 State Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    State Architecture                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                        │
│  │   URL State     │  React Router / Next.js Router         │
│  │   (Navigation)  │  - Page parameters                     │
│  └─────────────────┘  - Search/filter state                 │
│          │                                                  │
│          ▼                                                  │
│  ┌─────────────────┐                                        │
│  │   Server State  │  TanStack Query                        │
│  │   (Remote Data) │  - API data caching                    │
│  └─────────────────┘  - Background refetching               │
│          │            - Optimistic updates                  │
│          ▼                                                  │
│  ┌─────────────────┐                                        │
│  │   Client State  │  Zustand                               │
│  │   (UI State)    │  - Selection state                     │
│  └─────────────────┘  - Modal state                         │
│          │            - Sidebar state                       │
│          ▼                                                  │
│  ┌─────────────────┐                                        │
│  │   Form State    │  React Hook Form                       │
│  │   (Inputs)      │  - Form values                         │
│  └─────────────────┘  - Validation                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 TanStack Query Architecture

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query key factory pattern
export const queryKeys = {
  workItems: {
    all: ['workItems'] as const,
    lists: () => [...queryKeys.workItems.all, 'list'] as const,
    list: (filters: WorkItemFilters) =>
      [...queryKeys.workItems.lists(), filters] as const,
    details: () => [...queryKeys.workItems.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.workItems.details(), id] as const,
    tree: (rootId: string) =>
      [...queryKeys.workItems.all, 'tree', rootId] as const,
  },
  templates: {
    all: ['templates'] as const,
    list: () => [...queryKeys.templates.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.templates.all, id] as const,
  },
};
```

### 4.3 Optimistic Update Pattern

```typescript
// hooks/useWorkItemMutations.ts
export function useUpdateWorkItem() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: (input: { id: string; data: UpdateWorkItemDto }) =>
      workItemsApi.update(input.id, input.data),

    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.workItems.detail(id) });

      // Snapshot previous value
      const previousItem = queryClient.getQueryData<WorkItem>(
        queryKeys.workItems.detail(id)
      );

      // Optimistically update
      queryClient.setQueryData(queryKeys.workItems.detail(id), (old: WorkItem | undefined) =>
        old ? { ...old, ...data } : old
      );

      return { previousItem };
    },

    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousItem) {
        queryClient.setQueryData(
          queryKeys.workItems.detail(id),
          context.previousItem
        );
      }
      logger.error('mutation.update', 'Failed to update work item', { error, id });
      notify.error('Failed to update work item');
    },

    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workItems.lists() });
      notify.success('Work item updated');
    },
  });
}
```

---

## 5. API Architecture

### 5.1 API Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    API Architecture                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Client                                                     │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────┐                                        │
│  │  API Service    │  Type-safe API client                  │
│  │  Layer          │  - Request/response types              │
│  └────────┬────────┘  - Error handling                      │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │  Fetch Wrapper  │  Base HTTP client                      │
│  │                 │  - Auth headers                        │
│  └────────┬────────┘  - Logging                             │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Gateway                               ││
│  │  ┌───────────────┐  ┌───────────────┐                   ││
│  │  │  Microservice │  │  Strapi CMS   │                   ││
│  │  │  /api/ai/*    │  │  /api/*       │                   ││
│  │  └───────────────┘  └───────────────┘                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Strapi Client Pattern

```typescript
// packages/strapi-client/src/StrapiClient.ts
interface StrapiClientConfig {
  baseUrl: string;
  token?: string;
}

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export class StrapiClient {
  private baseUrl: string;
  private token?: string;

  constructor(config: StrapiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.token = config.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new StrapiError(error.message || 'Request failed', response.status);
    }

    return response.json();
  }

  // Collection methods
  async find<T>(
    contentType: string,
    params?: StrapiQueryParams
  ): Promise<StrapiResponse<T[]>> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    return this.request<StrapiResponse<T[]>>(`/${contentType}${queryString}`);
  }

  async findOne<T>(
    contentType: string,
    documentId: string,
    params?: StrapiQueryParams
  ): Promise<StrapiResponse<T>> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    return this.request<StrapiResponse<T>>(
      `/${contentType}/${documentId}${queryString}`
    );
  }

  async create<T>(
    contentType: string,
    data: Record<string, unknown>
  ): Promise<StrapiResponse<T>> {
    return this.request<StrapiResponse<T>>(`/${contentType}`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async update<T>(
    contentType: string,
    documentId: string,
    data: Record<string, unknown>
  ): Promise<StrapiResponse<T>> {
    return this.request<StrapiResponse<T>>(`/${contentType}/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async delete(contentType: string, documentId: string): Promise<void> {
    await this.request(`/${contentType}/${documentId}`, { method: 'DELETE' });
  }

  private buildQueryString(params: StrapiQueryParams): string {
    return qs.stringify(params, { encodeValuesOnly: true });
  }
}
```

---

## 6. CMS Integration Architecture

### 6.1 Content Type Schema Pattern

```typescript
// Strapi content type schema
// server/src/api/work-item/content-types/work-item/schema.json
{
  "kind": "collectionType",
  "collectionName": "work_items",
  "info": {
    "singularName": "work-item",
    "pluralName": "work-items",
    "displayName": "Work Item",
    "description": "Software specification work items"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "maxLength": 200
    },
    "description": {
      "type": "richtext"
    },
    "type": {
      "type": "enumeration",
      "enum": ["app", "epic", "feature", "story", "task"],
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["draft", "active", "completed", "archived"],
      "default": "draft"
    },
    "priority": {
      "type": "enumeration",
      "enum": ["low", "medium", "high", "critical"],
      "default": "medium"
    },
    "parent": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::work-item.work-item",
      "inversedBy": "children"
    },
    "children": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::work-item.work-item",
      "mappedBy": "parent"
    },
    "acceptanceCriteria": {
      "type": "component",
      "repeatable": true,
      "component": "work.acceptance-criterion"
    },
    "aiContext": {
      "type": "json"
    }
  }
}
```

### 6.2 Component Schema Pattern

```typescript
// server/src/components/work/acceptance-criterion.json
{
  "collectionName": "components_work_acceptance_criteria",
  "info": {
    "displayName": "Acceptance Criterion",
    "description": "Individual acceptance criterion"
  },
  "attributes": {
    "description": {
      "type": "text",
      "required": true
    },
    "completed": {
      "type": "boolean",
      "default": false
    },
    "order": {
      "type": "integer",
      "default": 0
    }
  }
}
```

---

## 7. Testing Architecture

### 7.1 Test Pyramid

```
                    ┌───────────┐
                    │    E2E    │  Playwright
                    │   Tests   │  - Critical user flows
                    │           │  - 5-10% of tests
                   ─┼───────────┼─
                  ┌─┴───────────┴─┐
                  │  Integration   │  Vitest + MSW
                  │    Tests       │  - API integration
                  │                │  - Component interactions
                  │                │  - 20-30% of tests
                 ─┼────────────────┼─
               ┌──┴────────────────┴──┐
               │      Unit Tests       │  Vitest
               │                       │  - Business logic
               │                       │  - Utility functions
               │                       │  - 60-70% of tests
              ─┴───────────────────────┴─
```

### 7.2 Test Structure Pattern

```
src/
├── __tests__/                  # Global integration tests
│   ├── api/
│   │   └── work-items.test.ts
│   └── flows/
│       └── create-sdd.test.ts
├── components/
│   └── WorkItemCard/
│       ├── WorkItemCard.tsx
│       └── WorkItemCard.test.tsx  # Component unit tests
├── hooks/
│   └── useWorkItems/
│       ├── useWorkItems.ts
│       └── useWorkItems.test.ts   # Hook unit tests
├── services/
│   └── workItemsApi/
│       ├── workItemsApi.ts
│       └── workItemsApi.test.ts   # Service unit tests
└── test/
    ├── setup.ts               # Global test setup
    ├── test-utils.tsx         # Custom render
    ├── fixtures/              # Test data factories
    │   ├── workItems.ts
    │   └── users.ts
    └── mocks/                 # MSW handlers
        ├── handlers.ts
        └── server.ts
```

### 7.3 Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Critical paths have higher thresholds
        'src/services/**/*.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.tsx',
        'src/test/**',
        'src/types/**',
      ],
    },
  },
});
```

---

## 8. Multi-Agent Orchestration

### 8.1 Work Coordination System

```
┌─────────────────────────────────────────────────────────────┐
│                Multi-Agent Work System                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                        │
│  │  Work Registry  │  Tracks claimed work                   │
│  │  (File-based)   │  - Priority assignments                │
│  └────────┬────────┘  - Agent IDs                           │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │  Lock System    │  Prevents conflicts                    │
│  │  (Directories)  │  - Priority locks                      │
│  └────────┬────────┘  - File locks                          │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │  Heartbeat      │  Detects stale agents                  │
│  │  Monitor        │  - 30s intervals                       │
│  └────────┬────────┘  - Auto-release stale locks            │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │  Commit Log     │  Atomic append-only log                │
│  │  (JSON Lines)   │  - Agent attribution                   │
│  └─────────────────┘  - Audit trail                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Work Claiming Protocol

```bash
# Agent workflow for claiming work

# 1. Check for conflicts
check_conflicts() {
    local priority=$1
    local lock_dir=".locks/priorities/$(echo $priority | tr '.' '-')"

    if [ -d "$lock_dir" ]; then
        echo "CONFLICT: Priority $priority already claimed"
        return 1
    fi

    echo "OK: Priority $priority available"
    return 0
}

# 2. Atomic claim (using directory creation)
claim_work_atomic() {
    local priority=$1
    local agent_id=$2
    local lock_dir=".locks/priorities/$(echo $priority | tr '.' '-')"

    # mkdir is atomic - only one agent succeeds
    if mkdir "$lock_dir" 2>/dev/null; then
        echo "agent: $agent_id" > "$lock_dir/lock.info"
        echo "claimed_at: $(date -Iseconds)" >> "$lock_dir/lock.info"
        echo "SUCCESS: Claimed priority $priority"
        return 0
    else
        echo "FAILED: Another agent claimed first"
        return 1
    fi
}

# 3. Release work
release_work() {
    local priority=$1
    local agent_id=$2
    local lock_dir=".locks/priorities/$(echo $priority | tr '.' '-')"

    if [ -f "$lock_dir/lock.info" ]; then
        local owner=$(grep "^agent:" "$lock_dir/lock.info" | cut -d' ' -f2)
        if [ "$owner" = "$agent_id" ]; then
            rm -rf "$lock_dir"
            echo "SUCCESS: Released priority $priority"
        fi
    fi
}
```

### 8.3 Agent Work Status Tracking

```markdown
# AGENT_WORK_STATUS.md

## Current Work Status

| Agent ID | Priority | Status | Started | Files |
|----------|----------|--------|---------|-------|
| AGENT_2026-01-17_A | F1.1.1 | IN_PROGRESS | 09:00 | TreeView.tsx |
| AGENT_2026-01-17_B | F1.1.2 | COMPLETED | 08:30 | ContextProvider.tsx |

## Completed Today

| Priority | Agent | Commit | Time |
|----------|-------|--------|------|
| F1.1.2 | AGENT_2026-01-17_B | abc123 | 10:45 |

## Available Work (Not Claimed)

- F1.1.3 - Template System
- F1.1.4 - Export Engine
- F1.1.5 - Import System
```

---

## 9. Infrastructure Patterns

### 9.1 Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: spectree
      POSTGRES_USER: spectree
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U spectree"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  strapi:
    build:
      context: ./apps/server
      dockerfile: Dockerfile
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: spectree
      DATABASE_USERNAME: spectree
      DATABASE_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "1337:1337"

  client:
    build:
      context: ./apps/client
      dockerfile: Dockerfile
    depends_on:
      - strapi
    environment:
      NEXT_PUBLIC_STRAPI_URL: http://strapi:1337
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  redis_data:
```

### 9.2 Port Allocation Standard

| Service | Development | Staging | Production |
|---------|-------------|---------|------------|
| PostgreSQL | 5432 | 5432 | 5432 |
| Redis | 6379 | 6379 | 6379 |
| Strapi CMS | 1337 | 1337 | 1337 |
| Microservice | 3001 | 3001 | 3001 |
| Next.js Client | 3000 | 3000 | 3000 |

---

## 10. Security Architecture

### 10.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Authentication Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User                                                       │
│    │                                                        │
│    ▼                                                        │
│  ┌─────────────────┐                                        │
│  │   Login Form    │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │   Strapi Auth   │  POST /api/auth/local                  │
│  │   Endpoint      │  - Validate credentials                │
│  └────────┬────────┘  - Generate JWT                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │   JWT Token     │  Stored in:                            │
│  │                 │  - HTTP-only cookie (recommended)      │
│  └────────┬────────┘  - OR localStorage (with XSS risk)     │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │   Auth Context  │  React Context provides:               │
│  │                 │  - User state                          │
│  └────────┬────────┘  - Login/logout functions              │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │   Protected     │  Route guards check:                   │
│  │   Routes        │  - Token validity                      │
│  └─────────────────┘  - User permissions                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 API Security Headers

```typescript
// middleware/security.ts
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
```

---

## Quick Reference

### Architecture Decision Records

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Next.js 14 | App Router, RSC support, Vercel deployment |
| State Management | Zustand + TanStack Query | Simple client state + powerful server state |
| CMS | Strapi 5 | Self-hosted, TypeScript, flexible content types |
| Database | PostgreSQL | Reliable, JSON support, Strapi compatible |
| Testing | Vitest + Playwright | Fast unit tests, reliable E2E |
| Monorepo | Turborepo | Fast builds, good caching, simple config |

### Key Patterns Summary

1. **Feature Modules** - Self-contained feature directories
2. **Compound Components** - Flexible, composable UI components
3. **Query Keys Factory** - Consistent TanStack Query cache management
4. **Optimistic Updates** - Responsive UI with rollback on error
5. **Strapi Client** - Type-safe CMS API interactions
6. **Multi-Agent Locks** - Atomic directory-based work claiming

---

**Document Version:** 1.0.0
**Last Updated:** January 17, 2026
**Maintained By:** Spec Tree Team
