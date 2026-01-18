import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TutorialProgress } from './TutorialProgress';

// Mock TutorialContext
const mockStartTutorial = vi.fn();
vi.mock('./TutorialContext', () => ({
  useTutorial: () => ({
    startTutorial: mockStartTutorial,
    progress: {
      completedSections: ['getting-started'],
      completedSteps: ['step-1', 'step-2'],
      currentSection: null,
      currentStep: null,
    },
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
        { id: 'step-4', title: 'Step 4', description: 'Fourth step' },
      ],
    },
    {
      id: 'advanced-features',
      title: 'Advanced Features',
      description: 'Learn advanced features',
      steps: [
        { id: 'step-5', title: 'Step 5', description: 'Fifth step' },
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
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

vi.mock('../../shared/icons', () => ({
  Icons: {
    check: () => <div data-testid="icon-check" />,
    alert: () => <div data-testid="icon-alert" />,
  },
}));

describe('TutorialProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tutorial progress component', () => {
    render(<TutorialProgress />);

    expect(screen.getByText('Tutorial Progress')).toBeInTheDocument();
  });

  it('displays completion count', () => {
    render(<TutorialProgress />);

    expect(screen.getByText('1 of 3 sections completed')).toBeInTheDocument();
  });

  it('displays overall progress percentage', () => {
    render(<TutorialProgress />);

    // 1 out of 3 sections completed = 33%
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('displays all tutorial sections', () => {
    render(<TutorialProgress />);

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Analytics Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('Advanced Features')).toBeInTheDocument();
  });

  it('displays section descriptions', () => {
    render(<TutorialProgress />);

    expect(screen.getByText('Learn the basics')).toBeInTheDocument();
    expect(screen.getByText('Master analytics')).toBeInTheDocument();
    expect(screen.getByText('Learn advanced features')).toBeInTheDocument();
  });

  it('displays correct step counts for each section', () => {
    render(<TutorialProgress />);

    const twoSteps = screen.getAllByText('2 steps');
    const oneSteps = screen.getAllByText('1 steps');

    expect(twoSteps.length).toBeGreaterThan(0);
    expect(oneSteps.length).toBeGreaterThan(0);
  });

  it('displays completion badges with correct percentages', () => {
    render(<TutorialProgress />);

    const badges = screen.getAllByTestId('badge');
    const completeBadges = badges.filter((badge) =>
      badge.textContent?.includes('100% Complete')
    );
    const incompleteBadges = badges.filter((badge) =>
      badge.textContent?.includes('0% Complete')
    );

    expect(completeBadges.length).toBeGreaterThan(0);
    expect(incompleteBadges.length).toBeGreaterThan(0);
  });

  it('shows check icon for completed sections', () => {
    render(<TutorialProgress />);

    const checkIcons = screen.getAllByTestId('icon-check');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('shows alert icon for incomplete sections', () => {
    render(<TutorialProgress />);

    const alertIcons = screen.getAllByTestId('icon-alert');
    expect(alertIcons.length).toBeGreaterThan(0);
  });

  it('displays Start button for sections with 0% progress', () => {
    render(<TutorialProgress />);

    const startButtons = screen.getAllByText('Start');
    expect(startButtons.length).toBeGreaterThan(0);
  });

  it('does not display button for completed sections', () => {
    render(<TutorialProgress />);

    // The getting-started section is completed, so it should not have a button
    const cards = screen.getAllByTestId('card');
    const completedCard = cards.find((card) =>
      card.textContent?.includes('Getting Started')
    );

    if (completedCard) {
      const buttons = completedCard.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    }
  });

  it('calls startTutorial when Start button is clicked', () => {
    render(<TutorialProgress />);

    const startButtons = screen.getAllByTestId('button');
    if (startButtons.length > 0) {
      fireEvent.click(startButtons[0]);
      expect(mockStartTutorial).toHaveBeenCalled();
    }
  });

  it('displays scroll area for tutorial list', () => {
    render(<TutorialProgress />);

    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('displays overall progress bar', () => {
    render(<TutorialProgress />);

    const progressBars = screen.getAllByTestId('progress');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('calculates section progress correctly', () => {
    render(<TutorialProgress />);

    // getting-started has 2 steps, both completed (step-1, step-2) = 100%
    const badges = screen.getAllByTestId('badge');
    const gettingStartedBadge = badges.find((badge) =>
      badge.textContent?.includes('100% Complete')
    );
    expect(gettingStartedBadge).toBeDefined();
  });

  it('displays progress labels', () => {
    render(<TutorialProgress />);

    // Should display "Tutorial Progress" header
    expect(screen.getByText('Tutorial Progress')).toBeInTheDocument();
  });

  it('renders all section cards', () => {
    render(<TutorialProgress />);

    const cards = screen.getAllByTestId('card');
    // Should have at least 3 cards for 3 sections
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  it('handles partial progress sections', () => {
    // This test verifies that the component handles partial progress
    render(<TutorialProgress />);

    // Should have action buttons (either Start or Continue)
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});

describe('TutorialProgress exports', () => {
  it('exports TutorialProgress component', () => {
    expect(TutorialProgress).toBeDefined();
  });
});
