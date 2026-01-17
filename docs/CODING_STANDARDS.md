# Spec Tree Coding Standards

**Version:** 1.0.0
**Last Updated:** January 17, 2026

---

## Overview

This document defines the coding standards, patterns, and best practices for the Spec Tree project. These standards are derived from enterprise-grade patterns and are mandatory for all contributions.

---

## Table of Contents

1. [Critical Rules](#1-critical-rules)
2. [TypeScript Standards](#2-typescript-standards)
3. [React Patterns](#3-react-patterns)
4. [State Management](#4-state-management)
5. [API Service Patterns](#5-api-service-patterns)
6. [Form Handling](#6-form-handling)
7. [Error Handling](#7-error-handling)
8. [Logging Standards](#8-logging-standards)
9. [Notification System](#9-notification-system)
10. [Testing Requirements](#10-testing-requirements)
11. [File Organization](#11-file-organization)
12. [Performance Patterns](#12-performance-patterns)

---

## 1. Critical Rules

### 1.1 Forbidden Patterns - Auto-Reject

The following patterns will cause automatic rejection in code review:

```typescript
// FORBIDDEN PATTERNS - NEVER USE

any                    // Use specific types
@ts-ignore            // Fix the type error properly
@ts-expect-error      // Fix the type error properly
eslint-disable        // Follow lint rules
console.log           // Use logger service
console.error         // Use logger service
console.warn          // Use logger service
alert()               // Use notification system
toast()               // Use notification system
catch(e) {}           // Handle errors properly
// TODO:              // Create issue instead
```

### 1.2 Required Imports

Always use these standard imports instead of native alternatives:

```typescript
// REQUIRED - Use these patterns

// Logging
import { logger } from '@/services/logger';
logger.log('category.action', 'Message', { context });
logger.error('category.error', 'Error message', { error, context });

// Notifications
import { useNotification } from '@/hooks/useNotification';
const notify = useNotification();
notify.success('Operation completed');
notify.error('Operation failed');

// Class names
import { cn } from '@/lib/utils';
const className = cn('base-class', conditional && 'conditional-class');

// State with types
const [items, setItems] = useState<ItemType[]>([]);
```

### 1.3 Commit Checklist

Before every commit:

- [ ] No `any` types
- [ ] No `@ts-ignore` or `eslint-disable`
- [ ] No `console.log` statements
- [ ] No native `alert()` or `toast()` calls
- [ ] All errors properly handled
- [ ] Tests written and passing
- [ ] Lint passes (`npm run lint`)
- [ ] Type check passes (`npm run type-check`)

---

## 2. TypeScript Standards

### 2.1 Type Definitions

```typescript
// GOOD: Explicit return types for functions
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// GOOD: Interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// GOOD: Type for unions/aliases
type UserRole = 'admin' | 'editor' | 'viewer';
type Status = 'pending' | 'active' | 'completed' | 'cancelled';

// GOOD: Generic types for reusability
interface ApiResponse<T> {
  data: T;
  meta: ResponseMeta;
  success: boolean;
}

// GOOD: Discriminated unions for state
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

### 2.2 Strict Mode Requirements

The following `tsconfig.json` strict settings are required:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2.3 Type Guards

```typescript
// GOOD: Type guard functions
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}

// GOOD: Narrowing with type guards
function processResult(result: LoadingState<User>) {
  switch (result.status) {
    case 'success':
      return result.data.name; // TypeScript knows data exists
    case 'error':
      return result.error.message; // TypeScript knows error exists
    default:
      return null;
  }
}
```

---

## 3. React Patterns

### 3.1 Component Structure

```typescript
// Standard component structure
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/services/logger';
import type { ComponentProps } from './types';

interface MyComponentProps {
  title: string;
  items: Item[];
  onSelect?: (item: Item) => void;
  className?: string;
}

export function MyComponent({
  title,
  items,
  onSelect,
  className,
}: MyComponentProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = useCallback((item: Item) => {
    logger.log('component.select', 'Item selected', { itemId: item.id });
    setSelectedId(item.id);
    onSelect?.(item);
  }, [onSelect]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  return (
    <div className={cn('my-component', className)}>
      <h2>{title}</h2>
      <ul>
        {sortedItems.map((item) => (
          <li
            key={item.id}
            onClick={() => handleSelect(item)}
            className={cn(
              'item',
              selectedId === item.id && 'item--selected'
            )}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.2 Custom Hooks Pattern

```typescript
// Custom hook structure
import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/services/logger';
import type { LoadingState } from '@/types';

interface UseDataFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): UseDataFetchResult<T> {
  const [state, setState] = useState<LoadingState<T>>({ status: 'idle' });

  const fetch = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchFn();
      setState({ status: 'success', data });
    } catch (error) {
      logger.error('hook.fetch', 'Data fetch failed', { error });
      setState({ status: 'error', error: error as Error });
    }
  }, [fetchFn]);

  useEffect(() => {
    fetch();
  }, deps);

  return {
    data: state.status === 'success' ? state.data : null,
    isLoading: state.status === 'loading',
    error: state.status === 'error' ? state.error : null,
    refetch: fetch,
  };
}
```

### 3.3 Component File Organization

```
src/components/
├── MyComponent/
│   ├── index.tsx           # Main component export
│   ├── MyComponent.tsx     # Component implementation
│   ├── MyComponent.test.tsx # Unit tests
│   ├── MyComponent.stories.tsx # Storybook stories (optional)
│   ├── types.ts            # Component-specific types
│   ├── utils.ts            # Component-specific utilities
│   └── hooks.ts            # Component-specific hooks
```

---

## 4. State Management

### 4.1 Zustand Store Pattern

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { logger } from '@/services/logger';

interface WorkItem {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface WorkItemsState {
  items: WorkItem[];
  selectedId: string | null;
  isLoading: boolean;
}

interface WorkItemsActions {
  setItems: (items: WorkItem[]) => void;
  addItem: (item: WorkItem) => void;
  updateItem: (id: string, updates: Partial<WorkItem>) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type WorkItemsStore = WorkItemsState & WorkItemsActions;

export const useWorkItemsStore = create<WorkItemsStore>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        items: [],
        selectedId: null,
        isLoading: false,

        // Actions
        setItems: (items) => {
          logger.log('store.setItems', 'Setting items', { count: items.length });
          set((state) => {
            state.items = items;
          });
        },

        addItem: (item) => {
          logger.log('store.addItem', 'Adding item', { itemId: item.id });
          set((state) => {
            state.items.push(item);
          });
        },

        updateItem: (id, updates) => {
          logger.log('store.updateItem', 'Updating item', { itemId: id, updates });
          set((state) => {
            const index = state.items.findIndex((item) => item.id === id);
            if (index !== -1) {
              Object.assign(state.items[index], updates);
            }
          });
        },

        removeItem: (id) => {
          logger.log('store.removeItem', 'Removing item', { itemId: id });
          set((state) => {
            state.items = state.items.filter((item) => item.id !== id);
          });
        },

        selectItem: (id) => {
          set((state) => {
            state.selectedId = id;
          });
        },

        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },
      })),
      {
        name: 'work-items-storage',
        partialize: (state) => ({
          items: state.items,
        }),
      }
    ),
    { name: 'WorkItemsStore' }
  )
);
```

### 4.2 TanStack Query Pattern

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workItemsApi } from '@/services/api';
import { logger } from '@/services/logger';
import { useNotification } from '@/hooks/useNotification';

// Query keys factory
export const workItemKeys = {
  all: ['workItems'] as const,
  lists: () => [...workItemKeys.all, 'list'] as const,
  list: (filters: WorkItemFilters) => [...workItemKeys.lists(), filters] as const,
  details: () => [...workItemKeys.all, 'detail'] as const,
  detail: (id: string) => [...workItemKeys.details(), id] as const,
};

// Query hook
export function useWorkItems(filters: WorkItemFilters) {
  return useQuery({
    queryKey: workItemKeys.list(filters),
    queryFn: () => workItemsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}

// Mutation hook
export function useCreateWorkItem() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: workItemsApi.create,
    onSuccess: (data) => {
      logger.log('mutation.create', 'Work item created', { itemId: data.id });
      notify.success('Work item created successfully');
      queryClient.invalidateQueries({ queryKey: workItemKeys.lists() });
    },
    onError: (error) => {
      logger.error('mutation.create', 'Failed to create work item', { error });
      notify.error('Failed to create work item');
    },
  });
}
```

---

## 5. API Service Patterns

### 5.1 Base API Service

```typescript
import { logger } from '@/services/logger';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

interface ApiError {
  message: string;
  code: string;
  status: number;
}

class BaseApiService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, ...fetchConfig } = config;

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const requestId = crypto.randomUUID();
    logger.log('api.request', `${config.method || 'GET'} ${endpoint}`, {
      requestId,
      params,
    });

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers: {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || 'Request failed',
          code: errorData.code || 'UNKNOWN_ERROR',
          status: response.status,
        };
        throw error;
      }

      const data = await response.json();
      logger.log('api.response', `${config.method || 'GET'} ${endpoint}`, {
        requestId,
        status: response.status,
      });

      return data;
    } catch (error) {
      logger.error('api.error', `${config.method || 'GET'} ${endpoint}`, {
        requestId,
        error,
      });
      throw error;
    }
  }

  protected get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  protected post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  protected put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  protected delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export { BaseApiService };
```

### 5.2 Domain API Service

```typescript
import { BaseApiService } from './BaseApiService';
import type { WorkItem, CreateWorkItemDto, UpdateWorkItemDto } from '@/types';

interface WorkItemsResponse {
  data: WorkItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

class WorkItemsApiService extends BaseApiService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL || '/api');
  }

  async getAll(filters?: { status?: string; search?: string }) {
    return this.get<WorkItemsResponse>('/work-items', filters as Record<string, string>);
  }

  async getById(id: string) {
    return this.get<{ data: WorkItem }>(`/work-items/${id}`);
  }

  async create(data: CreateWorkItemDto) {
    return this.post<{ data: WorkItem }>('/work-items', data);
  }

  async update(id: string, data: UpdateWorkItemDto) {
    return this.put<{ data: WorkItem }>(`/work-items/${id}`, data);
  }

  async remove(id: string) {
    return this.delete<void>(`/work-items/${id}`);
  }
}

export const workItemsApi = new WorkItemsApiService();
```

---

## 6. Form Handling

### 6.1 React Hook Form + Zod Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { logger } from '@/services/logger';
import { useNotification } from '@/hooks/useNotification';

// Schema definition
const workItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Priority is required',
  }),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().uuid().optional(),
});

type WorkItemFormData = z.infer<typeof workItemSchema>;

// Form component
export function WorkItemForm({ onSubmit }: { onSubmit: (data: WorkItemFormData) => Promise<void> }) {
  const notify = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WorkItemFormData>({
    resolver: zodResolver(workItemSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const handleFormSubmit = async (data: WorkItemFormData) => {
    try {
      logger.log('form.submit', 'Submitting work item form', { data });
      await onSubmit(data);
      notify.success('Work item created');
      reset();
    } catch (error) {
      logger.error('form.submit', 'Form submission failed', { error });
      notify.error('Failed to create work item');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" {...register('title')} />
        {errors.title && <span className="error">{errors.title.message}</span>}
      </div>

      <div>
        <label htmlFor="priority">Priority</label>
        <select id="priority" {...register('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {errors.priority && <span className="error">{errors.priority.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Work Item'}
      </button>
    </form>
  );
}
```

---

## 7. Error Handling

### 7.1 Error Boundary Pattern

```typescript
import { Component, ReactNode } from 'react';
import { logger } from '@/services/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('component.error', 'React error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7.2 Async Error Handling

```typescript
// Error handling utility
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  context: string
): Promise<[T, null] | [null, Error]> {
  try {
    const result = await asyncFn();
    return [result, null];
  } catch (error) {
    logger.error('async.error', `Error in ${context}`, { error });
    return [null, error as Error];
  }
}

// Usage
async function loadData() {
  const [data, error] = await withErrorHandling(
    () => api.fetchData(),
    'loadData'
  );

  if (error) {
    notify.error('Failed to load data');
    return;
  }

  setData(data);
}
```

---

## 8. Logging Standards

### 8.1 Logger Service

```typescript
type LogLevel = 'log' | 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

class Logger {
  private sessionId: string;
  private enabled: boolean;

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.enabled = process.env.NODE_ENV !== 'test';
  }

  private createEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      category,
      message,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };
  }

  private output(entry: LogEntry): void {
    if (!this.enabled) return;

    if (process.env.NODE_ENV === 'development') {
      const style = this.getStyle(entry.level);
      console.groupCollapsed(
        `%c[${entry.level.toUpperCase()}] ${entry.category}: ${entry.message}`,
        style
      );
      if (entry.data) {
        console.log('Data:', entry.data);
      }
      console.log('Time:', entry.timestamp);
      console.groupEnd();
    }

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToService(entry);
    }
  }

  private getStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      log: 'color: #888',
      debug: 'color: #9B59B6',
      info: 'color: #3498DB',
      warn: 'color: #F39C12',
      error: 'color: #E74C3C; font-weight: bold',
    };
    return styles[level];
  }

  private async sendToService(entry: LogEntry): Promise<void> {
    // Send to centralized logging service
    // Implementation depends on chosen service (Sentry, DataDog, etc.)
  }

  log(category: string, message: string, data?: Record<string, unknown>): void {
    this.output(this.createEntry('log', category, message, data));
  }

  debug(category: string, message: string, data?: Record<string, unknown>): void {
    this.output(this.createEntry('debug', category, message, data));
  }

  info(category: string, message: string, data?: Record<string, unknown>): void {
    this.output(this.createEntry('info', category, message, data));
  }

  warn(category: string, message: string, data?: Record<string, unknown>): void {
    this.output(this.createEntry('warn', category, message, data));
  }

  error(category: string, message: string, data?: Record<string, unknown>): void {
    this.output(this.createEntry('error', category, message, data));
  }
}

export const logger = new Logger();
```

### 8.2 Logging Categories

Use consistent category naming:

| Category Pattern | Usage |
|------------------|-------|
| `component.*` | Component lifecycle and interactions |
| `hook.*` | Custom hook operations |
| `api.*` | API requests and responses |
| `store.*` | State management actions |
| `form.*` | Form submissions and validations |
| `auth.*` | Authentication operations |
| `nav.*` | Navigation events |
| `error.*` | Error tracking |

---

## 9. Notification System

### 9.1 Notification Hook

```typescript
import { toast, ToastOptions } from 'react-hot-toast';

interface NotificationOptions extends ToastOptions {
  description?: string;
}

export function useNotification() {
  const success = (message: string, options?: NotificationOptions) => {
    toast.success(message, {
      duration: 4000,
      ...options,
    });
  };

  const error = (message: string, options?: NotificationOptions) => {
    toast.error(message, {
      duration: 5000,
      ...options,
    });
  };

  const info = (message: string, options?: NotificationOptions) => {
    toast(message, {
      duration: 4000,
      icon: 'i',
      ...options,
    });
  };

  const warning = (message: string, options?: NotificationOptions) => {
    toast(message, {
      duration: 4000,
      icon: '???',
      style: {
        background: '#FFF3CD',
        color: '#856404',
      },
      ...options,
    });
  };

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  };

  return { success, error, info, warning, promise };
}
```

---

## 10. Testing Requirements

### 10.1 Test Coverage Thresholds

```typescript
// vitest.config.ts coverage settings
{
  coverage: {
    thresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      // Higher thresholds for critical code
      'src/api/**/*.ts': {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
      'src/hooks/**/*.ts': {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
  },
}
```

### 10.2 Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with default props', () => {
      render(<MyComponent title="Test" />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<MyComponent title="Test" isLoading />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('handles click events', async () => {
      const onClick = vi.fn();
      const { user } = render(<MyComponent title="Test" onClick={onClick} />);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('async behavior', () => {
    it('loads data on mount', async () => {
      render(<MyComponent title="Test" />);

      await waitFor(() => {
        expect(screen.getByText('Loaded')).toBeInTheDocument();
      });
    });
  });
});
```

---

## 11. File Organization

### 11.1 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/             # Auth-protected routes
│   ├── (public)/           # Public routes
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI components (shadcn)
│   └── [feature]/          # Feature-specific components
├── features/               # Feature modules
│   └── [feature]/
│       ├── components/     # Feature components
│       ├── hooks/          # Feature hooks
│       ├── services/       # Feature services
│       ├── store/          # Feature state
│       └── types.ts        # Feature types
├── hooks/                  # Global custom hooks
├── lib/                    # Utility libraries
├── services/               # Global services
│   ├── api/                # API services
│   └── logger.ts           # Logger service
├── stores/                 # Global state stores
├── types/                  # Global type definitions
└── test/                   # Test utilities
    ├── setup.ts            # Test setup
    ├── test-utils.tsx      # Custom render
    ├── fixtures/           # Test fixtures
    └── mocks/              # MSW handlers
```

### 11.2 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `WorkItemCard.tsx` |
| Hooks | camelCase with `use` prefix | `useWorkItems.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `WorkItem`, `ApiResponse<T>` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_ITEMS`, `API_URL` |
| Files | kebab-case (except components) | `work-items-api.ts` |

---

## 12. Performance Patterns

### 12.1 Memoization

```typescript
// Memoize expensive calculations
const sortedItems = useMemo(
  () => items.sort((a, b) => a.priority - b.priority),
  [items]
);

// Memoize callbacks
const handleClick = useCallback(
  (item: Item) => {
    onSelect(item);
  },
  [onSelect]
);

// Memoize components
const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* complex rendering */}</div>;
});
```

### 12.2 Code Splitting

```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Use with Suspense
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 12.3 Virtual Lists

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              height: virtualItem.size,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Quick Reference Card

### Required Imports
```typescript
import { logger } from '@/services/logger';
import { useNotification } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';
```

### Before Every Commit
```bash
npm run lint        # No errors
npm run type-check  # No errors
npm run test        # All pass
```

### Forbidden
```
any, @ts-ignore, eslint-disable, console.log, alert(), toast()
```

---

**Document Version:** 1.0.0
**Last Updated:** January 17, 2026
**Maintained By:** Spec Tree Team
