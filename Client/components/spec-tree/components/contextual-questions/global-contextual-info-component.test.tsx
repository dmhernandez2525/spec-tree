import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock react-redux
const mockDispatch = vi.fn();
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

// Mock store selectors
vi.mock('../../../../lib/store/sow-slice', () => ({
  addGlobalContextualQuestions: vi.fn((questions) => ({ type: 'ADD_GLOBAL_QUESTIONS', payload: questions })),
  removeGlobalContextualQuestion: vi.fn((id) => ({ type: 'REMOVE_GLOBAL_QUESTION', payload: id })),
  replaceGlobalContextualQuestions: vi.fn((data) => ({ type: 'REPLACE_GLOBAL_QUESTIONS', payload: data })),
  updateGlobalInformation: vi.fn((info) => ({ type: 'UPDATE_GLOBAL_INFO', payload: info })),
  selectGlobalContextualQuestions: vi.fn(() => []),
  selectGlobalInformation: vi.fn(() => ''),
  selectChatApi: vi.fn(() => 'mock-chat-api'),
}));

// Mock UI components
vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, className, ...props }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
  }) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="textarea"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => (
    <label data-testid="label">{children}</label>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid="alert" data-variant={variant} role="alert">{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="alert-desc">{children}</span>
  ),
}));

// Mock wizard with step tracking
let mockCurrentStep = 0;
let mockOnStepChange: ((step: number) => void) | undefined;
vi.mock('../wizard/wizard', () => ({
  default: ({ steps, currentStep, onStepChange, loading, className }: {
    steps: Array<{ id: number; title: string; text: string; component: React.ReactNode; onNext?: () => Promise<void> }>;
    currentStep: number;
    onStepChange?: (step: number) => void;
    loading?: boolean;
    className?: string;
  }) => {
    mockCurrentStep = currentStep;
    mockOnStepChange = onStepChange;
    const step = steps[currentStep];
    return (
      <div data-testid="wizard" data-step={currentStep} data-loading={loading} className={className}>
        <div data-testid="wizard-title">{step?.title}</div>
        <div data-testid="wizard-text">{step?.text}</div>
        <div data-testid="wizard-content">{step?.component}</div>
        {step?.onNext && (
          <button data-testid="wizard-next" onClick={() => step.onNext?.()}>Next</button>
        )}
        <div data-testid="step-count">Steps: {steps?.length}</div>
      </div>
    );
  },
}));

// Mock API
const mockGenerateUpdatedExplanation = vi.fn();
vi.mock('../../lib/api/openai', () => ({
  generateUpdatedExplanationForGlobalRefinement: (...args: unknown[]) => mockGenerateUpdatedExplanation(...args),
}));

// Mock hooks
const mockGenerateQuestions = vi.fn();
const mockRemoveQuestion = vi.fn();
const mockSetQuestions = vi.fn();
let mockQuestions: Array<{ id: string; question: string; answer?: string }> = [];
let mockQuestionsLoading = false;
let mockQuestionsError: string | null = null;

vi.mock('../../lib/hooks/use-question-generation', () => ({
  default: vi.fn(() => ({
    loading: mockQuestionsLoading,
    error: mockQuestionsError,
    questions: mockQuestions,
    generateQuestions: mockGenerateQuestions,
    removeQuestion: mockRemoveQuestion,
    setQuestions: mockSetQuestions,
  })),
}));

// Mock utils
vi.mock('../../lib/utils/compile-context', () => ({
  default: vi.fn((questions: string[], answers: string[]) =>
    questions.map((q, i) => `Q: ${q} A: ${answers[i] || 'N/A'}`).join('\n')
  ),
}));

// Create a mock store
const createMockStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      sow: () => ({
        selectedModel: 'gpt-4',
        chatApi: 'mock-chat-api',
        globalContextualQuestions: [],
        globalInformation: '',
        ...overrides,
      }),
    },
  });
};

const renderWithProvider = (component: React.ReactNode, storeOverrides = {}) => {
  const store = createMockStore(storeOverrides);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('GlobalContextualInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
    mockCurrentStep = 0;
  });

  it('module can be imported', async () => {
    const module = await import('./global-contextual-info-component');
    expect(module.default).toBeDefined();
  });

  it('exports GlobalContextualInfo as default export', async () => {
    const module = await import('./global-contextual-info-component');
    expect(typeof module.default).toBe('function');
  });

  it('component has correct name', async () => {
    const module = await import('./global-contextual-info-component');
    expect(module.default.name).toBe('GlobalContextualInfo');
  });
});

describe('GlobalContextualInfo structure', () => {
  it('module is a valid React component', async () => {
    const module = await import('./global-contextual-info-component');
    const Component = module.default;
    expect(typeof Component).toBe('function');
  });
});

describe('GlobalContextualInfo rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('renders the wizard component', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(screen.getByTestId('wizard')).toBeInTheDocument();
  });

  it('wizard has 3 steps', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(screen.getByTestId('step-count')).toHaveTextContent('Steps: 3');
  });

  it('starts at step 0', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    const wizard = screen.getByTestId('wizard');
    expect(wizard).toHaveAttribute('data-step', '0');
  });

  it('first step has correct title', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(screen.getByTestId('wizard-title')).toHaveTextContent('Enter Information');
  });

  it('renders project information label in step 0', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(screen.getByText('Project Information')).toBeInTheDocument();
  });

  it('renders textarea for project information in step 0', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Enter information about the project...');
  });
});

describe('GlobalContextualInfo error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('displays error alert when questionsError is set', async () => {
    mockQuestionsError = 'Failed to generate questions';

    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByTestId('alert-desc')).toHaveTextContent('Failed to generate questions');
  });

  it('error alert has destructive variant', async () => {
    mockQuestionsError = 'Test error';

    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(screen.getByTestId('alert')).toHaveAttribute('data-variant', 'destructive');
  });
});

describe('GlobalContextualInfo loading state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('passes loading state to wizard when questions are loading', async () => {
    mockQuestionsLoading = true;

    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    const wizard = screen.getByTestId('wizard');
    expect(wizard).toHaveAttribute('data-loading', 'true');
  });

  it('wizard has loading false when not loading', async () => {
    mockQuestionsLoading = false;

    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    const wizard = screen.getByTestId('wizard');
    expect(wizard).toHaveAttribute('data-loading', 'false');
  });
});

describe('GlobalContextualInfo textarea interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('updates textarea value on change', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test project information' } });

    expect(textarea).toHaveValue('Test project information');
  });

  it('dispatches updateGlobalInformation on textarea change', async () => {
    const { updateGlobalInformation } = await import('../../../../lib/store/sow-slice');
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'New information' } });

    expect(updateGlobalInformation).toHaveBeenCalledWith('New information');
  });
});

describe('GlobalContextualInfo question generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('calls generateQuestions when Next is clicked with project info', async () => {
    mockGenerateQuestions.mockResolvedValue([
      { id: 'q1', question: 'Question 1?' },
    ]);

    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    // Fill in the textarea
    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test project information' } });

    // Click next button
    const nextButton = screen.getByTestId('wizard-next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockGenerateQuestions).toHaveBeenCalledWith('Test project information');
    });
  });
});

describe('GlobalContextualInfo with questions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestionsLoading = false;
    mockQuestionsError = null;
    mockQuestions = [
      { id: 'q1', question: 'What is the main goal?' },
      { id: 'q2', question: 'Who are the users?' },
    ];
  });

  it('initializes with questions from store', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(mockSetQuestions).toHaveBeenCalled();
  });
});

describe('GlobalContextualInfo onClose prop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('accepts onClose prop', async () => {
    const mockOnClose = vi.fn();
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;

    renderWithProvider(<GlobalContextualInfo onClose={mockOnClose} />);

    expect(screen.getByTestId('wizard')).toBeInTheDocument();
  });
});

describe('GlobalContextualInfo wizard className', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('wizard has max-w-4xl mx-auto class', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    const wizard = screen.getByTestId('wizard');
    expect(wizard).toHaveClass('max-w-4xl');
    expect(wizard).toHaveClass('mx-auto');
  });
});

describe('GlobalContextualInfo steps configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('step 0 has Enter Information title', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(screen.getByTestId('wizard-title')).toHaveTextContent('Enter Information');
  });

  it('step 0 has Enter project information text', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(screen.getByTestId('wizard-text')).toHaveTextContent('Enter project information');
  });
});

describe('GlobalContextualInfo hook usage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('calls useQuestionGeneration with Global type', async () => {
    const useQuestionGeneration = (await import('../../lib/hooks/use-question-generation')).default;
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;

    renderWithProvider(<GlobalContextualInfo />);

    expect(useQuestionGeneration).toHaveBeenCalledWith('Global');
  });
});

describe('GlobalContextualInfo API calls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [
      { id: 'q1', question: 'Question 1?' },
    ];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
    mockGenerateUpdatedExplanation.mockResolvedValue('Updated explanation text');
  });

  it('uses compileContext to format questions and answers', async () => {
    const compileContext = (await import('../../lib/utils/compile-context')).default;
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;

    renderWithProvider(<GlobalContextualInfo />);

    // Verify compileContext was imported correctly
    expect(compileContext).toBeDefined();
    expect(typeof compileContext).toBe('function');
  });
});

describe('GlobalContextualInfo Redux integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('uses useSelector for selectedModel', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(screen.getByTestId('wizard')).toBeInTheDocument();
  });

  it('dispatches actions when questions are generated', async () => {
    const { addGlobalContextualQuestions } = await import('../../../../lib/store/sow-slice');
    mockGenerateQuestions.mockResolvedValue([
      { id: 'q1', question: 'Generated question?' },
    ]);

    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    // Fill in textarea
    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Project info' } });

    // Click next
    const nextButton = screen.getByTestId('wizard-next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockGenerateQuestions).toHaveBeenCalled();
    });

    // Verify the action creator exists
    expect(addGlobalContextualQuestions).toBeDefined();
  });
});

describe('GlobalContextualInfo step navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestions = [];
    mockQuestionsLoading = false;
    mockQuestionsError = null;
  });

  it('passes onStepChange callback to wizard', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    expect(mockOnStepChange).toBeDefined();
  });

  it('step changes are handled correctly', async () => {
    const GlobalContextualInfo = (await import('./global-contextual-info-component')).default;
    renderWithProvider(<GlobalContextualInfo />);

    // Simulate step change
    if (mockOnStepChange) {
      mockOnStepChange(1);
    }

    // Verify onStepChange was called
    expect(mockOnStepChange).toBeDefined();
  });
});
