import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementsDisplay } from './AchievementsDisplay';
import * as AchievementsProviderModule from './AchievementsProvider';
import { Achievement } from '@/types/achievements';

// Mock dependencies
vi.mock('./AchievementsProvider');
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <div data-testid="badge" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div data-testid="progress" data-value={value} className={className} />
  ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children, className }: any) => (
    <div data-testid="card-description" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: any) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: () => <div data-testid="select-value" />,
}));

describe('AchievementsDisplay', () => {
  const mockAchievements: Achievement[] = [
    {
      id: 'achievement-1',
      title: 'Test Achievement 1',
      description: 'Description 1',
      icon: 'trophy',
      category: 'tutorial',
      requiredSteps: ['step1', 'step2'],
      reward: {
        type: 'badge',
        value: 'test-badge',
      },
    },
    {
      id: 'achievement-2',
      title: 'Test Achievement 2',
      description: 'Description 2',
      icon: 'star',
      category: 'mastery',
      requiredSteps: ['step3', 'step4'],
      unlockedAt: '2024-01-01',
    },
  ];

  const mockProgress = {
    completedSteps: ['step1', 'step2'],
    unlockedAchievements: ['achievement-2'],
    lastAchievementDate: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AchievementsProviderModule, 'useAchievements').mockReturnValue({
      achievements: mockAchievements,
      progress: mockProgress,
      checkAchievements: vi.fn(),
      getUnlockedAchievements: vi.fn(() => [mockAchievements[1]]),
      hasUnlockedAchievement: vi.fn((id: string) => id === 'achievement-2'),
      getAchievementProgress: vi.fn(() => 50),
      resetProgress: vi.fn(),
    });
  });

  it('exports AchievementsDisplay component', () => {
    expect(AchievementsDisplay).toBeDefined();
    expect(typeof AchievementsDisplay).toBe('function');
  });

  it('renders achievements display', () => {
    render(<AchievementsDisplay />);

    expect(screen.getAllByTestId('card')[0]).toBeInTheDocument();
  });

  it('displays achievements header', () => {
    render(<AchievementsDisplay />);

    expect(screen.getByText('Achievements')).toBeInTheDocument();
  });

  it('shows total achievements count', () => {
    render(<AchievementsDisplay />);

    expect(screen.getByText(/1 of 2 achievements unlocked/)).toBeInTheDocument();
  });

  it('renders filter select', () => {
    render(<AchievementsDisplay />);

    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('displays progress bar', () => {
    render(<AchievementsDisplay />);

    const progressBars = screen.getAllByTestId('progress');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('renders scroll area for achievements', () => {
    render(<AchievementsDisplay />);

    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('displays achievement titles', () => {
    render(<AchievementsDisplay />);

    expect(screen.getByText('Test Achievement 1')).toBeInTheDocument();
    expect(screen.getByText('Test Achievement 2')).toBeInTheDocument();
  });

  it('displays achievement descriptions', () => {
    render(<AchievementsDisplay />);

    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('shows locked/unlocked badges', () => {
    render(<AchievementsDisplay />);

    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('displays reward information when available', () => {
    render(<AchievementsDisplay />);

    expect(screen.getByText(/Reward:/)).toBeInTheDocument();
  });

  it('shows unlocked date for completed achievements', () => {
    render(<AchievementsDisplay />);

    expect(screen.getByText(/Unlocked on/)).toBeInTheDocument();
  });

  it('uses achievements context', () => {
    render(<AchievementsDisplay />);

    expect(AchievementsProviderModule.useAchievements).toHaveBeenCalled();
  });

  it('renders tooltips for achievements', () => {
    render(<AchievementsDisplay />);

    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
  });
});
