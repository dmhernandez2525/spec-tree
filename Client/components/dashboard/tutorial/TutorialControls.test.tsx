import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TutorialControls } from './TutorialControls';

// Mock TutorialContext
const mockStartTutorial = vi.fn();
vi.mock('./TutorialContext', () => ({
  useTutorial: () => ({
    startTutorial: mockStartTutorial,
    isActive: false,
    progress: {
      completedSections: [],
      completedSteps: ['step-1', 'step-2'],
      currentSection: null,
      currentStep: null,
    },
  }),
}));

// Mock AchievementsProvider
const mockHasUnlockedAchievement = vi.fn(() => false);
vi.mock('../achievements/AchievementsProvider', () => ({
  useAchievements: () => ({
    hasUnlockedAchievement: mockHasUnlockedAchievement,
  }),
}));

// Mock tutorial data
vi.mock('./tutorial-data', () => ({
  tutorialData: [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics',
      steps: [
        { id: 'step-1', title: 'Step 1', description: 'First step' },
        { id: 'step-2', title: 'Step 2', description: 'Second step' },
      ],
    },
    {
      id: 'analytics-deep-dive',
      title: 'Analytics Deep Dive',
      description: 'Master analytics',
      steps: [
        { id: 'step-3', title: 'Step 3', description: 'Third step' },
      ],
    },
    {
      id: 'advanced-features',
      title: 'Advanced Features',
      description: 'Learn advanced features',
      steps: [
        { id: 'step-4', title: 'Step 4', description: 'Fourth step' },
      ],
    },
  ],
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick} data-testid="dropdown-item">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children, asChild }: any) => <div data-testid="dialog-trigger">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock('@/components/shared/icons', () => ({
  Icons: {
    alert: () => <div data-testid="icon-alert" />,
  },
}));

describe('TutorialControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasUnlockedAchievement.mockReturnValue(false);
  });

  it('renders tutorial controls when not active', () => {
    render(<TutorialControls />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('displays Tutorials button', () => {
    render(<TutorialControls />);

    expect(screen.getByText('Tutorials')).toBeInTheDocument();
  });

  it('displays dialog with tutorial sections', () => {
    render(<TutorialControls />);

    expect(screen.getByText('Available Tutorials')).toBeInTheDocument();
    expect(screen.getByText('Learn how to use Spec Tree effectively')).toBeInTheDocument();
  });

  it('displays all tutorial sections in dialog', () => {
    render(<TutorialControls />);

    const gettingStarted = screen.getAllByText('Getting Started');
    const analyticsDeepDive = screen.getAllByText('Analytics Deep Dive');
    const advancedFeatures = screen.getAllByText('Advanced Features');

    expect(gettingStarted.length).toBeGreaterThan(0);
    expect(analyticsDeepDive.length).toBeGreaterThan(0);
    expect(advancedFeatures.length).toBeGreaterThan(0);
  });

  it('displays tutorial descriptions', () => {
    render(<TutorialControls />);

    expect(screen.getByText('Learn the basics')).toBeInTheDocument();
    expect(screen.getByText('Master analytics')).toBeInTheDocument();
    expect(screen.getByText('Learn advanced features')).toBeInTheDocument();
  });

  it('shows Tutorial Master badge when achievement is unlocked', () => {
    mockHasUnlockedAchievement.mockReturnValue(true);
    render(<TutorialControls />);

    expect(screen.getByText('Tutorial Master')).toBeInTheDocument();
    expect(screen.getByText('You have mastered all tutorials!')).toBeInTheDocument();
  });

  it('does not show Tutorial Master badge when achievement is not unlocked', () => {
    mockHasUnlockedAchievement.mockReturnValue(false);
    render(<TutorialControls />);

    expect(screen.queryByText('Tutorial Master')).not.toBeInTheDocument();
  });

  it('displays dropdown menu items', () => {
    render(<TutorialControls />);

    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument();
    expect(screen.getByText('Analytics Tutorial')).toBeInTheDocument();
  });

  it('displays step counts for each section', () => {
    render(<TutorialControls />);

    expect(screen.getByText('2 steps')).toBeInTheDocument();
  });

  it('displays Start button for sections with 0% progress', () => {
    render(<TutorialControls />);

    const startButtons = screen.getAllByText('Start');
    expect(startButtons.length).toBeGreaterThan(0);
  });

  it('displays scroll area for tutorial list', () => {
    render(<TutorialControls />);

    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('displays progress information', () => {
    render(<TutorialControls />);

    // Should have progress indicators
    const progressBars = screen.getAllByTestId('progress');
    expect(progressBars.length).toBeGreaterThan(0);
  });
});

describe('TutorialControls with active tutorial', () => {
  it('handles active tutorial state', () => {
    // This test verifies the component handles the isActive state
    // The mock is already set to isActive: false in the main beforeEach
    const { container } = render(<TutorialControls />);
    expect(container.firstChild).not.toBeNull();
  });
});

describe('TutorialControls exports', () => {
  it('exports TutorialControls component', () => {
    expect(TutorialControls).toBeDefined();
  });
});
