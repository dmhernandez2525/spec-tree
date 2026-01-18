import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureTutorialButton } from './FeatureTutorialButton';

// Mock TutorialManager
const mockStartFeatureTutorial = vi.fn();
const mockIsTutorialAvailable = vi.fn();
const mockGetTutorialProgress = vi.fn();

vi.mock('./TutorialManager', () => ({
  useTutorialManager: () => ({
    startFeatureTutorial: mockStartFeatureTutorial,
    isTutorialAvailable: mockIsTutorialAvailable,
    getTutorialProgress: mockGetTutorialProgress,
  }),
}));

// Mock Tooltip components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="tutorial-button">
      {children}
    </button>
  ),
}));

// Mock Icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    alert: () => <div data-testid="icon-alert" />,
  },
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('FeatureTutorialButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when tutorial is not available', () => {
    mockIsTutorialAvailable.mockReturnValue(false);
    mockGetTutorialProgress.mockReturnValue(0);

    const { container } = render(<FeatureTutorialButton featureId="test-feature" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders when tutorial is available', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(0);

    render(<FeatureTutorialButton featureId="test-feature" />);

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tutorial-button')).toBeInTheDocument();
  });

  it('displays alert icon', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(0);

    render(<FeatureTutorialButton featureId="test-feature" />);

    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
  });

  it('calls startFeatureTutorial when clicked', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(0);

    render(<FeatureTutorialButton featureId="test-feature" />);

    const button = screen.getByTestId('tutorial-button');
    fireEvent.click(button);

    expect(mockStartFeatureTutorial).toHaveBeenCalledWith('test-feature');
    expect(mockStartFeatureTutorial).toHaveBeenCalledTimes(1);
  });

  it('displays progress indicator when progress is between 0 and 100', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(50);

    render(<FeatureTutorialButton featureId="test-feature" />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('does not display progress indicator when progress is 0', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(0);

    render(<FeatureTutorialButton featureId="test-feature" />);

    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('does not display progress indicator when progress is 100', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(100);

    render(<FeatureTutorialButton featureId="test-feature" />);

    expect(screen.queryByText('100%')).not.toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(0);

    render(<FeatureTutorialButton featureId="test-feature" className="custom-class" />);

    const button = screen.getByTestId('tutorial-button');
    expect(button.className).toContain('custom-class');
  });

  it('shows tooltip content', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(0);

    render(<FeatureTutorialButton featureId="test-feature" />);

    expect(screen.getByText('View tutorial for this feature')).toBeInTheDocument();
  });

  it('checks tutorial availability with correct featureId', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(0);

    render(<FeatureTutorialButton featureId="analytics" />);

    expect(mockIsTutorialAvailable).toHaveBeenCalledWith('analytics');
  });

  it('gets tutorial progress with correct featureId', () => {
    mockIsTutorialAvailable.mockReturnValue(true);
    mockGetTutorialProgress.mockReturnValue(75);

    render(<FeatureTutorialButton featureId="analytics" />);

    expect(mockGetTutorialProgress).toHaveBeenCalledWith('analytics');
  });
});

describe('FeatureTutorialButton exports', () => {
  it('exports FeatureTutorialButton component', () => {
    expect(FeatureTutorialButton).toBeDefined();
  });
});
