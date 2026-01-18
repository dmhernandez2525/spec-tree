import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AchievementsProvider, useAchievements } from './AchievementsProvider';
import * as useLocalStorageModule from '@/lib/hooks/use-local-storage';
import * as useToastModule from '@/lib/hooks/use-toast';
import * as TutorialContextModule from '../tutorial/TutorialContext';

// Mock dependencies
vi.mock('@/lib/hooks/use-local-storage');
vi.mock('@/lib/hooks/use-toast');
vi.mock('../tutorial/TutorialContext');
vi.mock('../tutorial/CelebrationModal', () => ({
  CelebrationModal: ({ achievement, onClose }: any) => (
    <div data-testid="celebration-modal">
      <div>{achievement?.title}</div>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

vi.mock('./achievements-data', () => ({
  tutorialAchievements: [
    {
      id: 'test-achievement-1',
      title: 'Test Achievement',
      description: 'Test Description',
      icon: 'trophy',
      category: 'tutorial',
      requiredSteps: ['step1', 'step2'],
      reward: {
        type: 'badge',
        value: 'test-badge',
      },
    },
  ],
}));

describe('AchievementsProvider', () => {
  const mockToast = vi.fn();
  const mockSetProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useToastModule, 'useToast').mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: [],
    });

    vi.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([
      {
        completedSteps: [],
        unlockedAchievements: [],
        lastAchievementDate: undefined,
      },
      mockSetProgress,
    ]);

    vi.spyOn(TutorialContextModule, 'useTutorial').mockReturnValue({
      progress: {
        completedSteps: [],
        currentStep: null,
        isComplete: false,
      },
      completeStep: vi.fn(),
      resetProgress: vi.fn(),
      skipTutorial: vi.fn(),
      restartTutorial: vi.fn(),
      goToStep: vi.fn(),
    });
  });

  it('exports AchievementsProvider component', () => {
    expect(AchievementsProvider).toBeDefined();
    expect(typeof AchievementsProvider).toBe('function');
  });

  it('exports useAchievements hook', () => {
    expect(useAchievements).toBeDefined();
    expect(typeof useAchievements).toBe('function');
  });

  it('renders children', () => {
    render(
      <AchievementsProvider>
        <div data-testid="child">Test Child</div>
      </AchievementsProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('provides context to children', () => {
    const TestComponent = () => {
      const context = useAchievements();
      return <div data-testid="context-test">{context.achievements.length}</div>;
    };

    render(
      <AchievementsProvider>
        <TestComponent />
      </AchievementsProvider>
    );

    expect(screen.getByTestId('context-test')).toBeInTheDocument();
  });

  it('throws error when useAchievements is used outside provider', () => {
    const TestComponent = () => {
      try {
        useAchievements();
        return <div>Should not render</div>;
      } catch (error) {
        return <div data-testid="error">{(error as Error).message}</div>;
      }
    };

    render(<TestComponent />);

    expect(screen.getByTestId('error')).toHaveTextContent(
      'useAchievements must be used within an AchievementsProvider'
    );
  });

  it('initializes with default progress', () => {
    const TestComponent = () => {
      const { progress } = useAchievements();
      return (
        <div data-testid="progress">
          {JSON.stringify({
            completedSteps: progress.completedSteps.length,
            unlockedAchievements: progress.unlockedAchievements.length,
          })}
        </div>
      );
    };

    render(
      <AchievementsProvider>
        <TestComponent />
      </AchievementsProvider>
    );

    expect(screen.getByTestId('progress')).toHaveTextContent(
      '{"completedSteps":0,"unlockedAchievements":0}'
    );
  });

  it('provides achievements list', () => {
    const TestComponent = () => {
      const { achievements } = useAchievements();
      return <div data-testid="achievements">{achievements.length}</div>;
    };

    render(
      <AchievementsProvider>
        <TestComponent />
      </AchievementsProvider>
    );

    expect(screen.getByTestId('achievements')).toHaveTextContent('1');
  });

  it('provides checkAchievements function', () => {
    const TestComponent = () => {
      const { checkAchievements } = useAchievements();
      return (
        <div data-testid="check">
          {typeof checkAchievements === 'function' ? 'function' : 'not-function'}
        </div>
      );
    };

    render(
      <AchievementsProvider>
        <TestComponent />
      </AchievementsProvider>
    );

    expect(screen.getByTestId('check')).toHaveTextContent('function');
  });

  it('provides getUnlockedAchievements function', () => {
    const TestComponent = () => {
      const { getUnlockedAchievements } = useAchievements();
      return (
        <div data-testid="unlocked">
          {typeof getUnlockedAchievements === 'function' ? 'function' : 'not-function'}
        </div>
      );
    };

    render(
      <AchievementsProvider>
        <TestComponent />
      </AchievementsProvider>
    );

    expect(screen.getByTestId('unlocked')).toHaveTextContent('function');
  });

  it('provides hasUnlockedAchievement function', () => {
    const TestComponent = () => {
      const { hasUnlockedAchievement } = useAchievements();
      return (
        <div data-testid="has-unlocked">
          {typeof hasUnlockedAchievement === 'function' ? 'function' : 'not-function'}
        </div>
      );
    };

    render(
      <AchievementsProvider>
        <TestComponent />
      </AchievementsProvider>
    );

    expect(screen.getByTestId('has-unlocked')).toHaveTextContent('function');
  });

  it('provides getAchievementProgress function', () => {
    const TestComponent = () => {
      const { getAchievementProgress } = useAchievements();
      return (
        <div data-testid="get-progress">
          {typeof getAchievementProgress === 'function' ? 'function' : 'not-function'}
        </div>
      );
    };

    render(
      <AchievementsProvider>
        <TestComponent />
      </AchievementsProvider>
    );

    expect(screen.getByTestId('get-progress')).toHaveTextContent('function');
  });

  it('provides resetProgress function', () => {
    const TestComponent = () => {
      const { resetProgress } = useAchievements();
      return (
        <div data-testid="reset">
          {typeof resetProgress === 'function' ? 'function' : 'not-function'}
        </div>
      );
    };

    render(
      <AchievementsProvider>
        <TestComponent />
      </AchievementsProvider>
    );

    expect(screen.getByTestId('reset')).toHaveTextContent('function');
  });

  it('uses local storage for persistence', () => {
    render(
      <AchievementsProvider>
        <div>Test</div>
      </AchievementsProvider>
    );

    expect(useLocalStorageModule.useLocalStorage).toHaveBeenCalledWith(
      'achievements-progress',
      expect.any(Object)
    );
  });

  it('uses tutorial context', () => {
    render(
      <AchievementsProvider>
        <div>Test</div>
      </AchievementsProvider>
    );

    expect(TutorialContextModule.useTutorial).toHaveBeenCalled();
  });
});
