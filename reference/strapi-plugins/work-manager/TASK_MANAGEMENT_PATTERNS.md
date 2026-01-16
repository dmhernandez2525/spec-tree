# Task Management Patterns from work-manager Plugin

## Overview

The `strapi-plugin-work-manager` contains task management components that could inform Spec Tree's task handling. This document captures the key patterns.

**Source Location**: `TT-REPOS.../dry/libs/strapi-plugins/work-manager/admin/src/pages/tasks/`

## Type Definitions

### Task Types

```typescript
// Priority levels
export type TaskPriority = 'High' | 'Medium' | 'Low';

// Status values
export type TaskStatus = 'Open' | 'In Progress' | 'Completed';

// View modes for time-based views
export type ViewMode = 'Month' | 'Week' | 'Day';

// Service categories (configurable)
export type ServiceType =
  | 'Service 1'
  | 'Service 2'
  // ... etc
  | 'Service 9';
```

### User Interface

```typescript
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}
```

### Task Metrics

```typescript
export interface TaskMetrics {
  numberOfProjects: number;
  openTasks: number;
  unassignedTasks: number;
  completedTasks: number;
  metrics: {
    projects: {
      value: number;
      change: number;    // Percentage change
      period: string;    // e.g., "vs last month"
    };
    open: { value: number; change: number; period: string; };
    unassigned: { value: number; change: number; period: string; };
    completed: { value: number; change: number; period: string; };
  };
}
```

### Task Structure

```typescript
export interface Task {
  id: string;
  name: string;
  parentTask?: string;      // For subtasks
  isSubtask: boolean;
  dueDate: string;
  client: {
    name: string;
    id: string;
  };
  assignee?: User;
  priority: TaskPriority;
  status: TaskStatus;
  service: ServiceType;
}
```

### Filter Configuration

```typescript
export interface TaskFilters {
  search: string;
  service: ServiceType[];
  status: TaskStatus[];
  priority: TaskPriority[];
  assignee: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortConfig {
  field: keyof Task | null;
  direction: 'asc' | 'desc';
}
```

## Component Structure

```
tasks/
├── _types/
│   └── index.ts              # Type definitions
├── _lib/
│   ├── constants.ts          # Static values
│   ├── utils.ts              # Utility functions
│   ├── validation.ts         # Validation logic
│   └── task-utils.ts         # Task-specific utilities
├── _hooks/
│   ├── use-task-sorting.ts   # Sorting hook
│   └── use-task-pagination.ts # Pagination hook
├── _components/
│   ├── add-task-dialog.tsx   # Create task dialog
│   ├── task-table.tsx        # Main task table
│   ├── task-header.tsx       # Page header
│   ├── task-filters.tsx      # Filter controls
│   ├── task-filters-dialog.tsx # Advanced filters
│   ├── task-metrics.tsx      # Metrics cards
│   ├── task-detail-view.tsx  # Task details panel
│   ├── task-comments.tsx     # Comments section
│   ├── task-documents.tsx    # Attached documents
│   ├── task-activity.tsx     # Activity timeline
│   ├── activity-item.tsx     # Single activity entry
│   ├── service-tabs.tsx      # Service category tabs
│   ├── status-select.tsx     # Status dropdown
│   ├── priority-select.tsx   # Priority dropdown
│   └── assignee-select.tsx   # Assignee dropdown
```

## Patterns Worth Adopting

### 1. Metrics Dashboard

Display key metrics at the top of task views:
- Total projects
- Open tasks
- Unassigned tasks
- Completed tasks
- Change percentages vs previous period

### 2. Advanced Filtering

Multiple filter dimensions:
- Text search
- Multi-select for categories
- Multi-select for status
- Multi-select for priority
- Multi-select for assignee
- Date range picker

### 3. Task Hierarchy

Support for parent-child relationships:
```typescript
{
  id: string;
  parentTask?: string;  // Reference to parent
  isSubtask: boolean;   // Quick flag
}
```

### 4. Activity Tracking

Track task changes over time:
- Status changes
- Assignee changes
- Comments
- Document attachments

### 5. Custom Hooks

Reusable hooks for common patterns:
- `useTaskSorting` - Manage sort state
- `useTaskPagination` - Handle pagination

## Applicability to Spec Tree

### Direct Applications

1. **Task Management**: BB already has tasks - can enhance with these patterns
2. **Filtering**: Add advanced filtering to work item lists
3. **Metrics**: Add summary metrics to dashboard
4. **Activity Tracking**: Track changes to work items

### Enhancements to Consider

1. **Status Visualization**: Color-coded status badges
2. **Priority Indicators**: Visual priority markers
3. **Assignee Avatars**: Show who's responsible
4. **Due Date Tracking**: Highlight overdue items
5. **Subtask Support**: Nested task structure

### Implementation Notes

The work-manager uses a flat file structure within the pages directory:
- `_types/` for TypeScript types (underscore prefix = not routes)
- `_lib/` for utilities
- `_hooks/` for React hooks
- `_components/` for UI components

This pattern keeps related code together while distinguishing from Next.js routes.
