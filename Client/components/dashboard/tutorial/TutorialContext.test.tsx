import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TutorialProvider, useTutorial } from './TutorialContext';
import { ReactNode } from 'react';

// Mock useLocalStorage hook
const mockSetProgress = vi.fn();
vi.mock('@/lib/hooks/use-local-storage', () => ({
  useLocalStorage: () => [
    {
      completedSections: [],
      completedSteps: [],
      currentSection: null,
      currentStep: null,
    },
    mockSetProgress,
  ],
}));

// Mock tutorial data
vi.mock('./tutorial-data', () => ({
  tutorialData: [
    {
      id: 'test-section',
      title: 'Test Section',
      description: 'Test description',
      steps: [
        {
          id: 'step-1',
          title: 'Step 1',
          description: 'First step',
          target: '.target-1',
          placement: 'bottom' as const,
          order: 1,
        },
        {
          id: 'step-2',
          title: 'Step 2',
          description: 'Second step',
          target: '.target-2',
          placement: 'bottom' as const,
          order: 2,
        },
      ],
    },
  ],
}));

describe('TutorialContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TutorialProvider>{children}</TutorialProvider>
  );

  it('throws error when useTutorial is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useTutorial());
    }).toThrow('useTutorial must be used within a TutorialProvider');

    console.error = originalError;
  });

  it('provides default context values', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    expect(result.current.isActive).toBe(false);
    expect(result.current.currentStep).toBeNull();
    expect(result.current.currentSection).toBeNull();
    expect(result.current.progress).toEqual({
      completedSections: [],
      completedSteps: [],
      currentSection: null,
      currentStep: null,
    });
  });

  it('provides all required context methods', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    expect(typeof result.current.startTutorial).toBe('function');
    expect(typeof result.current.endTutorial).toBe('function');
    expect(typeof result.current.nextStep).toBe('function');
    expect(typeof result.current.previousStep).toBe('function');
    expect(typeof result.current.skipTutorial).toBe('function');
    expect(typeof result.current.goToStep).toBe('function');
    expect(typeof result.current.markStepComplete).toBe('function');
    expect(typeof result.current.markSectionComplete).toBe('function');
  });

  it('starts tutorial with valid section ID', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.currentSection?.id).toBe('test-section');
    expect(result.current.currentStep?.id).toBe('step-1');
  });

  it('does not start tutorial with invalid section ID', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('invalid-section');
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.currentSection).toBeNull();
    expect(result.current.currentStep).toBeNull();
  });

  it('ends tutorial correctly', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.endTutorial();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.currentSection).toBeNull();
    expect(result.current.currentStep).toBeNull();
  });

  it('advances to next step', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    expect(result.current.currentStep?.id).toBe('step-1');

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep?.id).toBe('step-2');
  });

  it('ends tutorial when advancing past last step', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep?.id).toBe('step-2');

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.isActive).toBe(false);
  });

  it('goes to previous step', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep?.id).toBe('step-2');

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.currentStep?.id).toBe('step-1');
  });

  it('does not go before first step', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    expect(result.current.currentStep?.id).toBe('step-1');

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.currentStep?.id).toBe('step-1');
  });

  it('goes to specific step by ID', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    act(() => {
      result.current.goToStep('step-2');
    });

    expect(result.current.currentStep?.id).toBe('step-2');
  });

  it('does not change step for invalid step ID', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    const currentStepBefore = result.current.currentStep?.id;

    act(() => {
      result.current.goToStep('invalid-step');
    });

    expect(result.current.currentStep?.id).toBe(currentStepBefore);
  });

  it('marks step as complete', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.markStepComplete('step-1');
    });

    expect(mockSetProgress).toHaveBeenCalled();
  });

  it('marks section as complete', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.markSectionComplete('test-section');
    });

    expect(mockSetProgress).toHaveBeenCalled();
  });

  it('skips tutorial and marks section complete', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.skipTutorial();
    });

    expect(result.current.isActive).toBe(false);
    expect(mockSetProgress).toHaveBeenCalled();
  });

  it('updates progress when starting tutorial', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.startTutorial('test-section');
    });

    expect(mockSetProgress).toHaveBeenCalled();
  });

  it('handles nextStep when no current section', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBeNull();
  });

  it('handles previousStep when no current section', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.currentStep).toBeNull();
  });

  it('handles goToStep when no current section', () => {
    const { result } = renderHook(() => useTutorial(), { wrapper });

    act(() => {
      result.current.goToStep('step-1');
    });

    expect(result.current.currentStep).toBeNull();
  });
});

describe('TutorialProvider', () => {
  it('renders children', () => {
    const { result } = renderHook(() => useTutorial(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TutorialProvider>{children}</TutorialProvider>
      ),
    });

    expect(result.current).toBeDefined();
  });
});

describe('TutorialContext exports', () => {
  it('exports TutorialProvider', () => {
    expect(TutorialProvider).toBeDefined();
  });

  it('exports useTutorial hook', () => {
    expect(useTutorial).toBeDefined();
  });
});
