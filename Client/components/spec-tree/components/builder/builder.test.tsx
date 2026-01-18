import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Hoisted mocks for state management
const mockStartLoading = vi.fn();
const mockStopLoading = vi.fn();
const mockHandleError = vi.fn();
const mockClearError = vi.fn();
const mockDispatch = vi.fn().mockImplementation(() => ({ unwrap: () => Promise.resolve() }));
const mockSetSelectedApp = vi.fn();

// Variables to control async state behavior
let mockAsyncState = {
  state: 'idle' as 'idle' | 'loading' | 'error',
  errorMessage: null as string | null,
};

// Mock all dependencies first - vi.mock is hoisted, so use inline implementations
vi.mock('react-redux', () => ({
  useSelector: vi.fn((selector) => {
    const mockState = {
      sow: {
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Test Epic',
            description: 'Test Description',
            featureIds: ['feature-1'],
          },
        },
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Test Feature',
            userStoryIds: ['story-1'],
          },
        },
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Test Story',
            taskIds: ['task-1'],
          },
        },
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Test Task',
          },
        },
        selectedModel: 'gpt-4',
      },
    };
    return selector ? selector(mockState) : mockState;
  }),
  useDispatch: () => mockDispatch,
}));

vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: React.PropsWithChildren<{ onDragEnd: (result: unknown) => void }>) => (
    <div data-testid="drag-drop-context" onClick={() => onDragEnd({
      destination: { droppableId: 'epics', index: 1 },
      source: { droppableId: 'epics', index: 0 },
      type: 'EPIC',
      draggableId: 'epic-1',
    })}>{children}</div>
  ),
  Droppable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
    children({
      innerRef: vi.fn(),
      droppableProps: {},
      placeholder: null,
    }),
  Draggable: ({ children }: { children: (provided: unknown, snapshot: unknown) => React.ReactNode }) =>
    children(
      {
        innerRef: vi.fn(),
        draggableProps: {},
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

vi.mock('../../../../lib/store/sow-slice', () => ({
  addEpics: vi.fn((epic) => ({ type: 'ADD_EPICS', payload: epic })),
  requestAdditionalEpics: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  requestAdditionalFeatures: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  requestUserStories: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  requestTasks: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  selectAllEpics: vi.fn(() => [
    {
      id: 'epic-1',
      title: 'Test Epic',
      description: 'Test Description',
      featureIds: ['feature-1'],
    },
  ]),
  selectAllFeatures: vi.fn(() => [
    {
      id: 'feature-1',
      title: 'Test Feature',
      userStoryIds: ['story-1'],
    },
  ]),
  selectAllUserStories: vi.fn(() => [
    {
      id: 'story-1',
      title: 'Test Story',
      taskIds: ['task-1'],
    },
  ]),
  selectAllTasks: vi.fn(() => [
    {
      id: 'task-1',
      title: 'Test Task',
    },
  ]),
  selectFeatureById: vi.fn(() => ({
    id: 'feature-1',
    title: 'Test Feature',
    userStoryIds: ['story-1'],
  })),
  selectUserStoryById: vi.fn(() => ({
    id: 'story-1',
    title: 'Test Story',
    taskIds: ['task-1'],
  })),
  reorderEpics: vi.fn(),
  reorderFeatures: vi.fn(),
  reorderUserStories: vi.fn(),
  reorderTasks: vi.fn(),
}));

vi.mock('../../lib/api/strapi-service', () => ({
  strapiService: {
    updateEpicPosition: vi.fn().mockResolvedValue({}),
    updateFeaturePosition: vi.fn().mockResolvedValue({}),
    updateUserStoryPosition: vi.fn().mockResolvedValue({}),
    updateTaskPosition: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../../lib/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../lib/utils/generate-id', () => ({
  default: vi.fn(() => 'generated-epic-id'),
}));

vi.mock('../../lib/utils/calculation-utils', () => ({
  calculateTotalTasks: vi.fn(() => 10),
  calculateTotalFeatures: vi.fn(() => 5),
  calculateTotalUserStories: vi.fn(() => 15),
}));

vi.mock('../../lib/utils/calculate-total-points', () => ({
  default: vi.fn(() => 100),
}));

vi.mock('@/lib/hooks/useAsyncState', () => ({
  default: vi.fn(() => ({
    state: mockAsyncState.state,
    errorMessage: mockAsyncState.errorMessage,
    startLoading: mockStartLoading,
    stopLoading: mockStopLoading,
    handleError: mockHandleError,
    clearError: mockClearError,
  })),
}));

vi.mock('../loading-spinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('../metrics-display', () => ({
  default: ({ metrics }: { metrics: Array<{ label: string; value: number | string }> }) => (
    <div data-testid="metrics-display">
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label.toLowerCase().replace(/\s+/g, '-')}`}>
          {m.label}: {m.value}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('../epic', () => ({
  default: ({ epic }: { epic: { title: string } }) => (
    <div data-testid="mock-epic">{epic.title}</div>
  ),
}));

vi.mock('../contextual-questions', () => ({
  default: ({ workItemType }: { workItemType: string }) => (
    <div data-testid="contextual-questions">Contextual - {workItemType}</div>
  ),
}));

vi.mock('../sow-input', () => ({
  default: ({ selectedApp }: { selectedApp: string | null }) => (
    <div data-testid="sow-input">SOW Input - {selectedApp}</div>
  ),
}));

vi.mock('../format-data', () => ({
  default: () => <div data-testid="format-data">Format Data</div>,
}));

vi.mock('../config', () => ({
  default: () => <div data-testid="config">Config</div>,
}));

vi.mock('../chat', () => ({
  default: () => <div data-testid="chat">Chat</div>,
}));

vi.mock('../import-export', () => ({
  default: ({ appId }: { appId: string | null }) => (
    <div data-testid="import-export">Import Export - {appId}</div>
  ),
}));

vi.mock('../templates', () => ({
  default: ({ appId }: { appId: string | null }) => (
    <div data-testid="templates">Templates - {appId}</div>
  ),
}));

vi.mock('../builder-search', () => ({
  default: ({ onResultSelect }: { onResultSelect: (result: unknown) => void }) => (
    <div data-testid="builder-search" onClick={() => onResultSelect({ item: { id: 'test' } })}>
      Builder Search
    </div>
  ),
  SearchResult: {},
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: React.PropsWithChildren<{ onClick?: () => void; variant?: string }>) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren) => (
    <div data-testid="card" {...props}>{children}</div>
  ),
  CardContent: ({ children }: React.PropsWithChildren) => <div data-testid="card-content">{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: React.PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void }>) => (
    open ? (
      <div data-testid="dialog">
        <button data-testid="dialog-close" onClick={() => onOpenChange?.(false)}>Close</button>
        {children}
      </div>
    ) : null
  ),
  DialogContent: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, id, ...props }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; id?: string }) => (
    <input value={value} onChange={onChange} id={id} data-testid={id ? `input-${id}` : undefined} {...props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: React.PropsWithChildren<{ htmlFor?: string }>) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, id, ...props }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; id?: string }) => (
    <textarea value={value} onChange={onChange} id={id} data-testid={id ? `textarea-${id}` : undefined} {...props} />
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: React.PropsWithChildren<{ variant?: string }>) => (
    <div role="alert" data-variant={variant}>{children}</div>
  ),
  AlertDescription: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: React.PropsWithChildren) => <div data-testid="scroll-area">{children}</div>,
}));

// Import after mocks
import Builder from './builder';
import { addEpics, requestAdditionalEpics, requestAdditionalFeatures, requestUserStories, requestTasks, reorderEpics } from '../../../../lib/store/sow-slice';
import { strapiService } from '../../lib/api/strapi-service';

describe('Builder Component', () => {
  const defaultProps = {
    setSelectedApp: mockSetSelectedApp,
    selectedApp: 'app-1',
    chatApi: '/api/chat',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAsyncState = { state: 'idle', errorMessage: null };
  });

  describe('Module Exports', () => {
    it('module can be imported', () => {
      // Builder is imported at the top of the file as default export
      expect(Builder).toBeDefined();
    });

    it('exports a default component', () => {
      // Builder is imported at the top as default export
      expect(typeof Builder).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('renders builder component', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('metrics-display')).toBeInTheDocument();
    });

    it('renders sidebar components', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('contextual-questions')).toBeInTheDocument();
      expect(screen.getByTestId('format-data')).toBeInTheDocument();
      expect(screen.getByTestId('chat')).toBeInTheDocument();
      expect(screen.getByTestId('config')).toBeInTheDocument();
      expect(screen.getByTestId('sow-input')).toBeInTheDocument();
    });

    it('renders templates and import-export', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('templates')).toBeInTheDocument();
      expect(screen.getByTestId('import-export')).toBeInTheDocument();
    });

    it('renders builder search', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('builder-search')).toBeInTheDocument();
    });

    it('renders scroll area for epics', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });

    it('renders drag drop context', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument();
    });

    it('renders epics from the store', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('mock-epic')).toBeInTheDocument();
      expect(screen.getByText('Test Epic')).toBeInTheDocument();
    });

    it('renders separator component', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading spinner when state is loading', () => {
      mockAsyncState = { state: 'loading', errorMessage: null };
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('does not render main content when loading', () => {
      mockAsyncState = { state: 'loading', errorMessage: null };
      render(<Builder {...defaultProps} />);

      expect(screen.queryByTestId('metrics-display')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error alert when state is error', () => {
      mockAsyncState = { state: 'error', errorMessage: 'Test error message' };
      render(<Builder {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders dismiss button in error alert', () => {
      mockAsyncState = { state: 'error', errorMessage: 'Test error message' };
      render(<Builder {...defaultProps} />);

      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('calls clearError when dismiss button is clicked', () => {
      mockAsyncState = { state: 'error', errorMessage: 'Test error message' };
      render(<Builder {...defaultProps} />);

      const dismissButton = screen.getByText('Dismiss');
      fireEvent.click(dismissButton);

      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Metrics Display', () => {
    it('renders metrics display', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('metrics-display')).toBeInTheDocument();
    });

    it('displays total project points metric', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('metric-total-project-points')).toBeInTheDocument();
    });

    it('displays total epics metric', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('metric-total-epics')).toBeInTheDocument();
    });

    it('displays total features metric', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('metric-total-features')).toBeInTheDocument();
    });

    it('displays total user stories metric', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('metric-total-user-stories')).toBeInTheDocument();
    });

    it('displays total tasks metric', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('metric-total-tasks')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('passes selectedApp to sow input', () => {
      render(<Builder {...defaultProps} selectedApp="custom-app" />);

      expect(screen.getByText('SOW Input - custom-app')).toBeInTheDocument();
    });

    it('passes appId to templates', () => {
      render(<Builder {...defaultProps} selectedApp="test-app" />);

      expect(screen.getByText('Templates - test-app')).toBeInTheDocument();
    });

    it('passes appId to import-export', () => {
      render(<Builder {...defaultProps} selectedApp="test-app" />);

      expect(screen.getByText('Import Export - test-app')).toBeInTheDocument();
    });

    it('renders Back to Apps button when selectedApp is set', () => {
      render(<Builder {...defaultProps} selectedApp="app-1" />);

      expect(screen.getByText('Back to Apps')).toBeInTheDocument();
    });

    it('does not render Back to Apps button when selectedApp is null', () => {
      render(<Builder {...defaultProps} selectedApp={null} />);

      expect(screen.queryByText('Back to Apps')).not.toBeInTheDocument();
    });

    it('calls setSelectedApp with null when Back to Apps is clicked', () => {
      render(<Builder {...defaultProps} selectedApp="app-1" />);

      const backButton = screen.getByText('Back to Apps');
      fireEvent.click(backButton);

      expect(mockSetSelectedApp).toHaveBeenCalledWith(null);
    });
  });

  describe('Contextual Questions', () => {
    it('renders contextual questions', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('contextual-questions')).toBeInTheDocument();
    });

    it('passes Global workItemType to contextual questions', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByText('Contextual - Global')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders Add Epics button', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByText('Add Epics')).toBeInTheDocument();
    });

    it('renders Add Features button', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByText('Add Features')).toBeInTheDocument();
    });

    it('renders Add User Stories button', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByText('Add User Stories')).toBeInTheDocument();
    });

    it('renders Add Tasks button', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByText('Add Tasks')).toBeInTheDocument();
    });

    it('renders Add Epic Manually button', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByText('Add Epic Manually')).toBeInTheDocument();
    });

    it('calls dispatch with requestAdditionalEpics when Add Epics is clicked', async () => {
      render(<Builder {...defaultProps} />);

      const addEpicsButton = screen.getByText('Add Epics');
      fireEvent.click(addEpicsButton);

      await waitFor(() => {
        expect(mockStartLoading).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('calls dispatch with requestAdditionalFeatures when Add Features is clicked', async () => {
      render(<Builder {...defaultProps} />);

      const addFeaturesButton = screen.getByText('Add Features');
      fireEvent.click(addFeaturesButton);

      await waitFor(() => {
        expect(mockStartLoading).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('calls dispatch with requestUserStories when Add User Stories is clicked', async () => {
      render(<Builder {...defaultProps} />);

      const addUserStoriesButton = screen.getByText('Add User Stories');
      fireEvent.click(addUserStoriesButton);

      await waitFor(() => {
        expect(mockStartLoading).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('calls dispatch with requestTasks when Add Tasks is clicked', async () => {
      render(<Builder {...defaultProps} />);

      const addTasksButton = screen.getByText('Add Tasks');
      fireEvent.click(addTasksButton);

      await waitFor(() => {
        expect(mockStartLoading).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Add Epic Dialog', () => {
    it('opens dialog when Add Epic Manually is clicked', () => {
      render(<Builder {...defaultProps} />);

      const addEpicButton = screen.getByText('Add Epic Manually');
      fireEvent.click(addEpicButton);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Epic')).toBeInTheDocument();
    });

    it('renders form fields in dialog', () => {
      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epic Manually'));

      expect(screen.getByTestId('input-Title')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument();
      expect(screen.getByTestId('input-Goal')).toBeInTheDocument();
      expect(screen.getByTestId('input-SuccessCriteria')).toBeInTheDocument();
      expect(screen.getByTestId('input-Dependencies')).toBeInTheDocument();
      expect(screen.getByTestId('input-Timeline')).toBeInTheDocument();
      expect(screen.getByTestId('input-Resources')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-Notes')).toBeInTheDocument();
    });

    it('updates form state when input changes', () => {
      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epic Manually'));

      const titleInput = screen.getByTestId('input-Title');
      fireEvent.change(titleInput, { target: { value: 'New Epic Title' } });

      expect(titleInput).toHaveValue('New Epic Title');
    });

    it('updates form state when textarea changes', () => {
      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epic Manually'));

      const descriptionTextarea = screen.getByTestId('textarea-Description');
      fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });

      expect(descriptionTextarea).toHaveValue('New Description');
    });

    it('renders Add Epic button in dialog footer', () => {
      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epic Manually'));

      const dialogFooter = screen.getByTestId('dialog-footer');
      expect(dialogFooter).toContainElement(screen.getByText('Add Epic'));
    });

    it('dispatches addEpics action when Add Epic button is clicked', () => {
      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epic Manually'));

      const titleInput = screen.getByTestId('input-Title');
      fireEvent.change(titleInput, { target: { value: 'New Epic Title' } });

      const addButton = screen.getByTestId('dialog-footer').querySelector('button');
      fireEvent.click(addButton!);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('closes dialog after adding epic', () => {
      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epic Manually'));
      expect(screen.getByTestId('dialog')).toBeInTheDocument();

      const addButton = screen.getByTestId('dialog-footer').querySelector('button');
      fireEvent.click(addButton!);

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('clears form state after adding epic', () => {
      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epic Manually'));

      const titleInput = screen.getByTestId('input-Title');
      fireEvent.change(titleInput, { target: { value: 'New Epic Title' } });

      const addButton = screen.getByTestId('dialog-footer').querySelector('button');
      fireEvent.click(addButton!);

      // Open dialog again
      fireEvent.click(screen.getByText('Add Epic Manually'));

      const newTitleInput = screen.getByTestId('input-Title');
      expect(newTitleInput).toHaveValue('');
    });

    it('can close dialog without adding epic', () => {
      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epic Manually'));
      expect(screen.getByTestId('dialog')).toBeInTheDocument();

      const closeButton = screen.getByTestId('dialog-close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Search Result Selection', () => {
    it('handles search result selection', () => {
      // Mock scrollIntoView
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      render(<Builder {...defaultProps} />);

      const builderSearch = screen.getByTestId('builder-search');
      fireEvent.click(builderSearch);

      // The mock onResultSelect is triggered
      expect(scrollIntoViewMock).not.toHaveBeenCalled(); // Element doesn't exist in test DOM
    });
  });

  describe('Drag and Drop', () => {
    it('renders drag drop context', () => {
      render(<Builder {...defaultProps} />);

      expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument();
    });

    it('handles epic drag end by dispatching reorderEpics', () => {
      render(<Builder {...defaultProps} />);

      // Trigger the mock drag end handler
      const dragDropContext = screen.getByTestId('drag-drop-context');
      fireEvent.click(dragDropContext);

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Error Handling in Async Operations', () => {
    it('handles error when adding epics fails', async () => {
      mockDispatch.mockImplementationOnce(() => ({
        unwrap: () => Promise.reject(new Error('Failed to add epics')),
      }));

      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epics'));

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith('Failed to add epics');
      });
    });

    it('handles error when adding features fails', async () => {
      mockDispatch.mockImplementationOnce(() => ({
        unwrap: () => Promise.reject(new Error('Failed to add features')),
      }));

      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Features'));

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith('Failed to add features');
      });
    });

    it('handles generic error when adding epics fails without Error instance', async () => {
      mockDispatch.mockImplementationOnce(() => ({
        unwrap: () => Promise.reject('some error'),
      }));

      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Epics'));

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith('Failed to generate epics. Please try again.');
      });
    });

    it('handles generic error when adding features fails without Error instance', async () => {
      mockDispatch.mockImplementationOnce(() => ({
        unwrap: () => Promise.reject('some error'),
      }));

      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Features'));

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith('Failed to generate features. Please try again.');
      });
    });

    it('handles generic error when adding user stories fails without Error instance', async () => {
      mockDispatch.mockImplementationOnce(() => ({
        unwrap: () => Promise.reject('some error'),
      }));

      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add User Stories'));

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith('Failed to generate user stories. Please try again.');
      });
    });

    it('handles generic error when adding tasks fails without Error instance', async () => {
      mockDispatch.mockImplementationOnce(() => ({
        unwrap: () => Promise.reject('some error'),
      }));

      render(<Builder {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Tasks'));

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith('Failed to generate tasks. Please try again.');
      });
    });
  });
});
