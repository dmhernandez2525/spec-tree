# FlowBuilder Patterns from document-builder Plugin

## Overview

The `strapi-plugin-document-builder` contains a sophisticated FlowBuilder component that manages multi-step form flows. This document captures the key patterns that could be adopted for Spec Tree.

**Source Location**: `TT-REPOS.../dry/libs/strapi-plugins/document-builder/admin/src/components/builder/FlowBuilder/`

## Architecture

### Component Structure

```
FlowBuilder/
├── index.tsx                    # Main FlowBuilder component
├── context/
│   ├── FlowBuilderContext.tsx   # Flow state and operations
│   ├── FlowStateContext.tsx     # Runtime flow state
│   └── types.ts                 # Context type definitions
├── components/
│   ├── FlowCanvas.tsx           # Step visualization
│   ├── FlowPreview.tsx          # Live preview panel
│   ├── FlowSettings.tsx         # Flow-level settings
│   ├── GlobalFlowSettings.tsx   # Global configuration dialog
│   ├── StepContent.tsx          # Step content editor
│   ├── StepContentHeader.tsx    # Step header bar
│   ├── StepContentRenderer.tsx  # Content rendering
│   ├── StepList.tsx             # Step navigation
│   ├── StepProperties.tsx       # Step property panel
│   ├── StepConditionBuilder.tsx # Conditional logic
│   ├── DraggableStep.tsx        # Drag-and-drop step
│   ├── FormRenderer.tsx         # Embedded form rendering
│   ├── FormSelector.tsx         # Form selection dialog
│   ├── FormAndComponentSelector.tsx  # Combined selector
│   ├── FlowSubmissionHandler.tsx     # Form submission
│   └── FlowProgressManager.tsx       # Progress tracking
│   └── settings/
│       ├── BehaviorSettings.tsx      # Flow behavior config
│       ├── AnalyticsSettings.tsx     # Analytics config
│       └── flowAnalytics.ts          # Analytics utilities
└── types/
    ├── index.ts                 # Main type exports
    └── stepItems.ts             # Step item types
```

## Key Patterns

### 1. Context-Based State Management

The FlowBuilder uses React Context for state management with clear separation:

```tsx
// FlowBuilderContext - handles flow operations
const {
  flow,              // Current flow data
  selectedStep,      // Currently selected step
  updateFlow,        // Update flow properties
  setSelectedStep,   // Select a step
  addStep,           // Add new step
  updateStep,        // Update step properties
  autosaveStatus,    // 'saving' | 'saved' | 'error'
  error,             // Error message if any
  undo,              // Undo last action
  redo,              // Redo undone action
  canUndo,           // Undo availability
  canRedo,           // Redo availability
  deleteFlow,        // Delete entire flow
  publishFlow,       // Publish flow
  unpublishFlow,     // Unpublish flow
  saveFlow,          // Manual save
} = useFlowBuilder();
```

### 2. Panel Layout Pattern

The UI uses a three-panel layout that can be toggled:

```tsx
// Left panel: Step navigation (collapsible)
// Center: Step content editor (expands when panels collapse)
// Right panel: Properties (collapsible)

const [showLeftPanel, setShowLeftPanel] = useState(true);
const [showRightPanel, setShowRightPanel] = useState(true);

// Dynamic width calculation
const getContentWidth = () => {
  if (!showLeftPanel && !showRightPanel) return 'w-full';
  if (!showLeftPanel && showRightPanel) return 'w-[calc(100%-20rem)]';
  if (showLeftPanel && !showRightPanel) return 'w-[calc(100%-16rem)]';
  return 'w-[calc(100%-36rem)]';
};
```

### 3. Autosave with Status Indicator

```tsx
// Status states
type AutosaveStatus = 'saving' | 'saved' | 'error';

// Visual indicator component
function StatusIndicator({ status, autosaveStatus, isPublishing }) {
  const statusConfig = {
    saving: { text: 'Saving...', class: 'bg-muted text-muted-foreground' },
    saved: { text: 'All changes saved', class: 'bg-green-100 text-green-800' },
    error: { text: 'Error saving', class: 'bg-red-100 text-red-800' },
  };
  // ...
}
```

### 4. Keyboard Shortcuts

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Skip if in input field
    if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const modifierKey = e.metaKey || e.ctrlKey;

    if (modifierKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          e.shiftKey ? handlePublish() : saveFlow();
          break;
        case 'z':
          e.preventDefault();
          e.shiftKey ? redo() : undo();
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [saveFlow, handlePublish, undo, redo]);
```

### 5. Step Item Types

Steps can contain multiple types of items:

```tsx
// Form item - references an existing form
type FormItem = {
  id: string;
  type: 'form';
  formId: string;
  displayName: string;
  isRequired: boolean;
};

// Component item - individual form component
type ComponentItem = {
  id: string;
  type: 'component';
  componentType: string;  // 'text-input', 'select', etc.
  displayName: string;
  isRequired: boolean;
  properties: {
    label: string;
    placeholder: string;
    helpText: string;
    required: boolean;
    // Component-specific properties
  };
};
```

### 6. Draft/Published Workflow

```tsx
// Flow status
type FlowStatus = 'draft' | 'published' | 'error';

// Publish handling
const handlePublish = async () => {
  setIsPublishing(true);
  try {
    await publishFlow();
  } finally {
    setIsPublishing(false);
  }
};

// Unpublish with confirmation dialog
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">Unpublish</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Unpublish Flow?</AlertDialogTitle>
    <AlertDialogDescription>
      This will make the flow unavailable to users.
    </AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleUnpublish}>Unpublish</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Applicability to Spec Tree

### Patterns to Adopt

1. **Context-Based State**: Use similar context pattern for work item management
2. **Undo/Redo**: Implement history for work item editing
3. **Autosave**: Add autosave with visual status indicator
4. **Panel Layout**: Consider three-panel layout for builder interface
5. **Keyboard Shortcuts**: Add Cmd+S for save, Cmd+Z for undo
6. **Draft/Publish**: Consider draft mode for work item templates

### Implementation Priority

1. **High**: Undo/redo for work item editing
2. **High**: Autosave with status indicator
3. **Medium**: Keyboard shortcuts
4. **Medium**: Three-panel layout refinement
5. **Low**: Draft/publish workflow (if templates are added)

## Dependencies

The FlowBuilder uses these key libraries:

- `react-dnd` + `react-dnd-html5-backend` - Drag and drop
- `@brainydeveloper/tailored-ui` - UI components (equivalent to Shadcn)
- `lucide-react` - Icons
- `crypto.randomUUID()` - ID generation
