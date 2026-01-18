import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock all dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
    <div className={className} data-testid="card" {...props}>{children}</div>
  ),
  CardContent: ({ children }: React.PropsWithChildren) => <div data-testid="card-content">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    ...props
  }: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean; variant?: string }>) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: React.PropsWithChildren<{ variant?: string }>) => (
    <div role="alert" data-variant={variant}>{children}</div>
  ),
  AlertDescription: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <span data-testid="loader">Loading...</span>,
  ChevronRight: () => <span data-testid="chevron-right">-&gt;</span>,
  ChevronLeft: () => <span data-testid="chevron-left">&lt;-</span>,
}));

vi.mock('@/components/ui/steps', () => ({
  Steps: ({ children, value }: React.PropsWithChildren<{ value: number }>) => (
    <div data-testid="steps" data-value={value}>{children}</div>
  ),
  StepsContent: ({ children, value }: React.PropsWithChildren<{ value: number }>) => (
    <div data-testid="steps-content" data-value={value}>{children}</div>
  ),
  StepsHeader: ({ children }: React.PropsWithChildren) => (
    <div data-testid="steps-header">{children}</div>
  ),
  StepsItem: ({
    title,
    onClick,
    disabled,
    value,
  }: {
    title: string;
    onClick?: () => void;
    disabled?: boolean;
    value: number;
  }) => (
    <button
      data-testid={`step-${title}`}
      data-value={value}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  ),
}));

// Import after mocks
import Wizard from './wizard';
import { WizardStep } from './types';

describe('Wizard Component', () => {
  // Mock window.scrollTo
  const originalScrollTo = window.scrollTo;

  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
  });

  const createMockSteps = (overrides?: Partial<WizardStep>[]): WizardStep[] => [
    {
      id: 1,
      title: 'Step 1',
      text: 'Step 1 description',
      component: <div data-testid="step-1-content">Step 1 Content</div>,
      ...overrides?.[0],
    },
    {
      id: 2,
      title: 'Step 2',
      text: 'Step 2 description',
      component: <div data-testid="step-2-content">Step 2 Content</div>,
      ...overrides?.[1],
    },
    {
      id: 3,
      title: 'Step 3',
      text: 'Step 3 description',
      component: <div data-testid="step-3-content">Step 3 Content</div>,
      ...overrides?.[2],
    },
  ];

  describe('Module Exports', () => {
    it('module can be imported', () => {
      // Wizard is imported at the top of the file as default export
      expect(Wizard).toBeDefined();
    });

    it('exports a default component', () => {
      // Wizard is imported at the top as default export
      expect(typeof Wizard).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('renders steps header with all steps', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('step-Step 1')).toBeInTheDocument();
      expect(screen.getByTestId('step-Step 2')).toBeInTheDocument();
      expect(screen.getByTestId('step-Step 3')).toBeInTheDocument();
    });

    it('renders first step content by default', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('step-1-content')).toBeInTheDocument();
    });

    it('renders card component', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders card content', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('renders steps container', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('steps')).toBeInTheDocument();
    });

    it('renders steps content', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('steps-content')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state when loading prop is true', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} loading={true} />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('does not show steps when loading', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} loading={true} />);

      expect(screen.queryByTestId('steps')).not.toBeInTheDocument();
    });

    it('shows loading state during navigation', async () => {
      const mockOnNext = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const mockSteps = createMockSteps([{ onNext: mockOnNext }]);

      render(<Wizard steps={mockSteps} />);

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // While loading, the loader should appear
      await waitFor(() => {
        expect(screen.getByTestId('loader')).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('displays error message when error prop is provided', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} error="Test error message" />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders error in alert component', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} error="Test error" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('updates error when error prop changes', () => {
      const mockSteps = createMockSteps();
      const { rerender } = render(<Wizard steps={mockSteps} error="Initial error" />);

      expect(screen.getByText('Initial error')).toBeInTheDocument();

      rerender(<Wizard steps={mockSteps} error="Updated error" />);

      expect(screen.getByText('Updated error')).toBeInTheDocument();
    });

    it('removes error when error prop is cleared', () => {
      const mockSteps = createMockSteps();
      const { rerender } = render(<Wizard steps={mockSteps} error="Test error" />);

      expect(screen.getByText('Test error')).toBeInTheDocument();

      rerender(<Wizard steps={mockSteps} error={undefined} />);

      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Buttons', () => {
    it('previous button is disabled on first step', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      const previousButton = screen.getByText('Previous').closest('button');
      expect(previousButton).toBeDisabled();
    });

    it('next button is enabled on first step', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      const nextButton = screen.getByText('Next').closest('button');
      expect(nextButton).not.toBeDisabled();
    });

    it('next button is disabled on last step', async () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} currentStep={2} />);

      await waitFor(() => {
        const nextButton = screen.getByText('Next').closest('button');
        expect(nextButton).toBeDisabled();
      });
    });

    it('renders chevron icons in navigation buttons', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    it('calls onStepChange when navigating to next step', async () => {
      const onStepChange = vi.fn();
      const mockSteps = createMockSteps();

      render(<Wizard steps={mockSteps} onStepChange={onStepChange} />);

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(onStepChange).toHaveBeenCalledWith(1);
      });
    });

    it('calls onStepChange when navigating to previous step', async () => {
      const onStepChange = vi.fn();
      const mockSteps = createMockSteps();

      render(<Wizard steps={mockSteps} currentStep={1} onStepChange={onStepChange} />);

      await waitFor(() => {
        const previousButton = screen.getByText('Previous');
        fireEvent.click(previousButton);
      });

      await waitFor(() => {
        expect(onStepChange).toHaveBeenCalledWith(0);
      });
    });

    it('navigates to next step when next button is clicked', async () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('step-1-content')).toBeInTheDocument();

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('step-2-content')).toBeInTheDocument();
      });
    });

    it('navigates to previous step when previous button is clicked', async () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} currentStep={1} />);

      await waitFor(() => {
        expect(screen.getByTestId('step-2-content')).toBeInTheDocument();
      });

      const previousButton = screen.getByText('Previous');
      fireEvent.click(previousButton);

      await waitFor(() => {
        expect(screen.getByTestId('step-1-content')).toBeInTheDocument();
      });
    });

    it('allows clicking on completed steps to navigate', async () => {
      const onStepChange = vi.fn();
      const mockSteps = createMockSteps();

      render(<Wizard steps={mockSteps} currentStep={2} onStepChange={onStepChange} />);

      const step1Button = screen.getByTestId('step-Step 1');
      fireEvent.click(step1Button);

      await waitFor(() => {
        expect(onStepChange).toHaveBeenCalledWith(0);
      });
    });

    it('disables navigation to future steps', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} currentStep={0} />);

      const step3Button = screen.getByTestId('step-Step 3');
      expect(step3Button).toBeDisabled();
    });

    it('scrolls to top when navigating', async () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });
    });
  });

  describe('Custom Button Labels', () => {
    it('uses custom next button label when provided', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} nextButtonLabel="Continue" />);

      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('uses custom previous button label when provided', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} previousButtonLabel="Go Back" />);

      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('uses default labels when not provided', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('hides progress bar when hideProgressBar is true', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} hideProgressBar={true} />);

      expect(screen.queryByTestId('steps')).not.toBeInTheDocument();
    });

    it('shows progress bar by default', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('steps')).toBeInTheDocument();
    });

    it('shows progress bar when hideProgressBar is false', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} hideProgressBar={false} />);

      expect(screen.getByTestId('steps')).toBeInTheDocument();
    });
  });

  describe('Step Validation', () => {
    it('prevents navigation when validation fails', async () => {
      const validateFn = vi.fn().mockReturnValue(false);
      const mockSteps = createMockSteps([{ validate: validateFn }]);

      render(<Wizard steps={mockSteps} />);

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(validateFn).toHaveBeenCalled();
        expect(screen.getByTestId('step-1-content')).toBeInTheDocument();
      });
    });

    it('allows navigation when validation passes', async () => {
      const validateFn = vi.fn().mockReturnValue(true);
      const mockSteps = createMockSteps([{ validate: validateFn }]);

      render(<Wizard steps={mockSteps} />);

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(validateFn).toHaveBeenCalled();
        expect(screen.getByTestId('step-2-content')).toBeInTheDocument();
      });
    });

    it('disables next button when current step validation fails', () => {
      const validateFn = vi.fn().mockReturnValue(false);
      const mockSteps = createMockSteps([{ validate: validateFn }]);

      render(<Wizard steps={mockSteps} />);

      const nextButton = screen.getByText('Next').closest('button');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Step Callbacks', () => {
    it('calls onNext callback when navigating forward', async () => {
      const onNextMock = vi.fn();
      const mockSteps = createMockSteps([{ onNext: onNextMock }]);

      render(<Wizard steps={mockSteps} />);

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(onNextMock).toHaveBeenCalled();
      });
    });

    it('calls onPrevious callback when navigating backward', async () => {
      const onPreviousMock = vi.fn();
      const mockSteps = createMockSteps([{}, { onPrevious: onPreviousMock }]);

      render(<Wizard steps={mockSteps} currentStep={1} />);

      await waitFor(() => {
        const previousButton = screen.getByText('Previous');
        fireEvent.click(previousButton);
      });

      await waitFor(() => {
        expect(onPreviousMock).toHaveBeenCalled();
      });
    });

    it('calls onStepChanging callback with next step index', async () => {
      const onStepChangingMock = vi.fn().mockResolvedValue(undefined);
      const mockSteps = createMockSteps();

      render(<Wizard steps={mockSteps} onStepChanging={onStepChangingMock} />);

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(onStepChangingMock).toHaveBeenCalledWith(1);
      });
    });

    it('awaits async onNext callback', async () => {
      let resolved = false;
      const onNextMock = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        resolved = true;
      });
      const mockSteps = createMockSteps([{ onNext: onNextMock }]);

      render(<Wizard steps={mockSteps} />);

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(resolved).toBe(true);
      });
    });

    it('awaits async onPrevious callback', async () => {
      let resolved = false;
      const onPreviousMock = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        resolved = true;
      });
      const mockSteps = createMockSteps([{}, { onPrevious: onPreviousMock }]);

      render(<Wizard steps={mockSteps} currentStep={1} />);

      await waitFor(() => {
        const previousButton = screen.getByText('Previous');
        fireEvent.click(previousButton);
      });

      await waitFor(() => {
        expect(resolved).toBe(true);
      });
    });
  });

  describe('Button Visibility', () => {
    it('hides buttons when removeButtons is true', () => {
      const mockSteps = createMockSteps([{ removeButtons: true }]);

      render(<Wizard steps={mockSteps} />);

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('hides next button when noNextButton is true', () => {
      const mockSteps = createMockSteps([{ noNextButton: true }]);

      render(<Wizard steps={mockSteps} />);

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('shows both buttons by default', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} />);

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  describe('External Step Control', () => {
    it('syncs with external currentStep prop', () => {
      const mockSteps = createMockSteps();
      const { rerender } = render(<Wizard steps={mockSteps} currentStep={0} />);

      expect(screen.getByTestId('step-1-content')).toBeInTheDocument();

      rerender(<Wizard steps={mockSteps} currentStep={1} />);

      expect(screen.getByTestId('step-2-content')).toBeInTheDocument();
    });

    it('syncs with external loading prop', () => {
      const mockSteps = createMockSteps();
      const { rerender } = render(<Wizard steps={mockSteps} loading={false} />);

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();

      rerender(<Wizard steps={mockSteps} loading={true} />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className to card', () => {
      const mockSteps = createMockSteps();
      render(<Wizard steps={mockSteps} className="custom-class" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Step State Management', () => {
    it('passes stepState to step component', async () => {
      let receivedStepState: unknown = undefined;
      const StepComponent = ({ stepState }: { stepState?: unknown }) => {
        receivedStepState = stepState;
        return <div>Step with state</div>;
      };

      const mockSteps: WizardStep[] = [
        {
          id: 1,
          title: 'Step 1',
          text: 'Step 1',
          component: <StepComponent />,
        },
      ];

      render(<Wizard steps={mockSteps} />);

      // Initial state is undefined
      expect(receivedStepState).toBeUndefined();
    });

    it('provides onStepChange callback to update step state', async () => {
      let stepChangeCallback: ((state: unknown) => void) | undefined;
      const StepComponent = ({ onStepChange }: { onStepChange?: (state: unknown) => void }) => {
        stepChangeCallback = onStepChange;
        return <div>Step with callback</div>;
      };

      const mockSteps: WizardStep[] = [
        {
          id: 1,
          title: 'Step 1',
          text: 'Step 1',
          component: <StepComponent />,
        },
      ];

      render(<Wizard steps={mockSteps} />);

      expect(stepChangeCallback).toBeDefined();
    });
  });

  describe('Step Index without ID', () => {
    it('uses index as key when step has no id', () => {
      const mockSteps: WizardStep[] = [
        {
          title: 'Step Without ID',
          text: 'No ID',
          component: <div>Content</div>,
        },
      ];

      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('step-Step Without ID')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('renders card even when steps are provided', () => {
      // The component requires at least one step to function properly
      // Testing that card renders with minimal steps
      const mockSteps: WizardStep[] = [
        {
          id: 1,
          title: 'Single Step',
          text: 'Only step',
          component: <div data-testid="single-step">Single Step Content</div>,
        },
      ];

      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('handles single step', () => {
      const mockSteps: WizardStep[] = [
        {
          id: 1,
          title: 'Only Step',
          text: 'Single step',
          component: <div data-testid="only-step">Only Step Content</div>,
        },
      ];

      render(<Wizard steps={mockSteps} />);

      expect(screen.getByTestId('only-step')).toBeInTheDocument();

      // Previous and Next should both be disabled
      const previousButton = screen.getByText('Previous').closest('button');
      const nextButton = screen.getByText('Next').closest('button');
      expect(previousButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('does not navigate when clicking same step', () => {
      const onStepChange = vi.fn();
      const mockSteps = createMockSteps();

      render(<Wizard steps={mockSteps} currentStep={0} onStepChange={onStepChange} />);

      const step1Button = screen.getByTestId('step-Step 1');
      fireEvent.click(step1Button);

      // Should not call onStepChange when clicking current step
      expect(onStepChange).not.toHaveBeenCalled();
    });

    it('handles rapid navigation clicks gracefully', async () => {
      const onNextMock = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const mockSteps = createMockSteps([{ onNext: onNextMock }]);

      render(<Wizard steps={mockSteps} />);

      const nextButton = screen.getByText('Next');

      // Click multiple times rapidly
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Should only call onNext once because isLoading prevents additional clicks
      await waitFor(() => {
        expect(onNextMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
