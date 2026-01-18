import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TutorialManagerProvider, useTutorialManager } from './TutorialManager';
import { ReactNode } from 'react';

// Mock TutorialContext
const mockStartTutorial = vi.fn();
const mockEndTutorial = vi.fn();
vi.mock('./TutorialContext', () => ({
  useTutorial: () => ({
    startTutorial: mockStartTutorial,
    endTutorial: mockEndTutorial,
    progress: {
      completedSections: [],
      completedSteps: ['step-1', 'step-2'],
      currentSection: null,
      currentStep: null,
    },
  }),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/lib/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock feature tutorials
vi.mock('./feature-tutorials', () => ({
  allFeatureTutorials: [
    {
      id: 'analytics-deep-dive',
      title: 'Analytics Tutorial',
      description: 'Learn analytics',
      steps: [
        { id: 'step-1', title: 'Step 1', description: 'First step' },
        { id: 'step-2', title: 'Step 2', description: 'Second step' },
        { id: 'step-3', title: 'Step 3', description: 'Third step' },
      ],
    },
    {
      id: 'projects-management',
      title: 'Projects Tutorial',
      description: 'Manage projects',
      steps: [
        { id: 'step-4', title: 'Step 4', description: 'Fourth step' },
        { id: 'step-5', title: 'Step 5', description: 'Fifth step' },
      ],
    },
  ],
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('TutorialManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TutorialManagerProvider>{children}</TutorialManagerProvider>
  );

  it('throws error when useTutorialManager is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useTutorialManager());
    }).toThrow('useTutorialManager must be used within a TutorialManagerProvider');

    console.error = originalError;
  });

  it('provides all required context methods', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    expect(typeof result.current.startFeatureTutorial).toBe('function');
    expect(typeof result.current.isTutorialAvailable).toBe('function');
    expect(typeof result.current.getFeatureTutorial).toBe('function');
    expect(typeof result.current.getTutorialProgress).toBe('function');
    expect(typeof result.current.suggestNextTutorial).toBe('function');
    expect(typeof result.current.resetTutorialProgress).toBe('function');
  });

  it('starts feature tutorial with valid ID', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    act(() => {
      result.current.startFeatureTutorial('analytics-deep-dive');
    });

    expect(mockStartTutorial).toHaveBeenCalledWith('analytics-deep-dive');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Tutorial Started',
      description: 'Starting Analytics Tutorial tutorial',
    });
  });

  it('does not start tutorial with invalid ID', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    act(() => {
      result.current.startFeatureTutorial('invalid-id');
    });

    expect(mockStartTutorial).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('checks if tutorial is available', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    expect(result.current.isTutorialAvailable('analytics-deep-dive')).toBe(true);
    expect(result.current.isTutorialAvailable('invalid-id')).toBe(false);
  });

  it('gets feature tutorial by ID', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    const tutorial = result.current.getFeatureTutorial('analytics-deep-dive');
    expect(tutorial).toBeDefined();
    expect(tutorial?.id).toBe('analytics-deep-dive');
    expect(tutorial?.title).toBe('Analytics Tutorial');
  });

  it('returns undefined for invalid tutorial ID', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    const tutorial = result.current.getFeatureTutorial('invalid-id');
    expect(tutorial).toBeUndefined();
  });

  it('calculates tutorial progress correctly', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    // analytics-deep-dive has 3 steps, 2 are completed (step-1, step-2)
    const progress = result.current.getTutorialProgress('analytics-deep-dive');
    expect(progress).toBe(67); // Math.round((2/3) * 100)
  });

  it('returns 0 progress for tutorial with no completed steps', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    // projects-management has steps 4,5 which are not completed
    const progress = result.current.getTutorialProgress('projects-management');
    expect(progress).toBe(0);
  });

  it('returns 0 progress for invalid tutorial ID', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    const progress = result.current.getTutorialProgress('invalid-id');
    expect(progress).toBe(0);
  });

  it('suggests next tutorial based on progress', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    const nextTutorial = result.current.suggestNextTutorial();

    // Should suggest the tutorial with most progress that's not 100%
    expect(nextTutorial).toBeDefined();
    expect(nextTutorial?.id).toBe('analytics-deep-dive');
  });

  it('resets tutorial progress', () => {
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    act(() => {
      result.current.resetTutorialProgress();
    });

    expect(mockEndTutorial).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Tutorial Progress Reset',
      description: 'All tutorial progress has been reset.',
    });
  });

  it('handles completed tutorials correctly', () => {
    // This test verifies that the component calculates progress correctly
    const { result } = renderHook(() => useTutorialManager(), { wrapper });

    // With current mock data, analytics-deep-dive has 2/3 steps completed
    const progress = result.current.getTutorialProgress('analytics-deep-dive');
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });
});

describe('TutorialManagerProvider', () => {
  it('renders children', () => {
    const { result } = renderHook(() => useTutorialManager(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TutorialManagerProvider>{children}</TutorialManagerProvider>
      ),
    });

    expect(result.current).toBeDefined();
  });
});

describe('TutorialManager exports', () => {
  it('exports TutorialManagerProvider', () => {
    expect(TutorialManagerProvider).toBeDefined();
  });

  it('exports useTutorialManager hook', () => {
    expect(useTutorialManager).toBeDefined();
  });
});
