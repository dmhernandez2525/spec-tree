import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CelebrationModal } from './CelebrationModal';
import { Achievement } from '@/types/achievements';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock dialog components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

// Mock button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

// Mock badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

// Mock icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    trophy: () => <div data-testid="icon-trophy" />,
    star: () => <div data-testid="icon-star" />,
    check: () => <div data-testid="icon-check" />,
  },
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('CelebrationModal', () => {
  const mockOnClose = vi.fn();

  const mockAchievement: Achievement = {
    id: 'test-achievement',
    title: 'Test Achievement',
    description: 'This is a test achievement',
    icon: 'trophy',
    category: 'mastery',
    unlocked: true,
    unlockedAt: new Date(),
    condition: {
      type: 'task_completion',
      value: 1,
    },
    reward: {
      type: 'badge',
      value: 'Test Badge',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with achievement data', () => {
    render(<CelebrationModal achievement={mockAchievement} onClose={mockOnClose} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Achievement')).toBeInTheDocument();
    expect(screen.getByText('This is a test achievement')).toBeInTheDocument();
  });

  it('displays achievement icon', () => {
    render(<CelebrationModal achievement={mockAchievement} onClose={mockOnClose} />);

    expect(screen.getByTestId('icon-trophy')).toBeInTheDocument();
  });

  it('displays reward information when reward exists', () => {
    render(<CelebrationModal achievement={mockAchievement} onClose={mockOnClose} />);

    expect(screen.getByText('Reward Unlocked:')).toBeInTheDocument();
    expect(screen.getByText('New Badge')).toBeInTheDocument();
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('does not display reward section when no reward', () => {
    const achievementNoReward = { ...mockAchievement, reward: undefined };
    render(<CelebrationModal achievement={achievementNoReward} onClose={mockOnClose} />);

    expect(screen.queryByText('Reward Unlocked:')).not.toBeInTheDocument();
  });

  it('calls onClose when Continue button is clicked', () => {
    render(<CelebrationModal achievement={mockAchievement} onClose={mockOnClose} />);

    const continueButton = screen.getByTestId('button');
    fireEvent.click(continueButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays correct reward type for feature reward', () => {
    const achievementWithFeature = {
      ...mockAchievement,
      reward: { type: 'feature' as const, value: 'Advanced Analytics' },
    };
    render(<CelebrationModal achievement={achievementWithFeature} onClose={mockOnClose} />);

    expect(screen.getByText('New Feature')).toBeInTheDocument();
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
  });

  it('displays correct reward type for theme reward', () => {
    const achievementWithTheme = {
      ...mockAchievement,
      reward: { type: 'theme' as const, value: 'Dark Mode' },
    };
    render(<CelebrationModal achievement={achievementWithTheme} onClose={mockOnClose} />);

    expect(screen.getByText('New Theme')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('renders continue button', () => {
    render(<CelebrationModal achievement={mockAchievement} onClose={mockOnClose} />);

    const continueButtons = screen.getAllByText('Continue');
    expect(continueButtons.length).toBeGreaterThan(0);
  });
});

describe('CelebrationModal exports', () => {
  it('exports CelebrationModal component', () => {
    expect(CelebrationModal).toBeDefined();
  });
});
