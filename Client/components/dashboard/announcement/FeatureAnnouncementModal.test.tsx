import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureAnnouncementModal } from './FeatureAnnouncementModal';

// Mock dependencies
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="next-image" />
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }: any) => (
    <button
      onClick={onClick}
      data-testid="button"
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, _onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogFooter: ({ children, className }: any) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <div data-testid="dialog-title" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/shared/icons', () => ({
  Icons: {
    x: ({ className }: any) => (
      <span data-testid="icon-x" className={className}>
        X
      </span>
    ),
  },
}));

describe('FeatureAnnouncementModal', () => {
  const mockOnDismiss = vi.fn();
  const mockOnComplete = vi.fn();

  const mockAnnouncement = {
    id: 'test-announcement',
    version: 'v1.0.0',
    releaseDate: new Date('2024-01-01'),
    priority: 1,
    slides: [
      {
        id: 'slide-1',
        title: 'First Slide',
        description: 'First Description',
        releaseDate: new Date('2024-01-01'),
      },
      {
        id: 'slide-2',
        title: 'Second Slide',
        description: 'Second Description',
        imageUrl: '/test-image.png',
        releaseDate: new Date('2024-01-01'),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports FeatureAnnouncementModal component', () => {
    expect(FeatureAnnouncementModal).toBeDefined();
    expect(typeof FeatureAnnouncementModal).toBe('function');
  });

  it('renders dialog', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('displays announcement version', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('displays first slide title', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('First Slide')).toBeInTheDocument();
  });

  it('displays first slide description', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('First Description')).toBeInTheDocument();
  });

  it('renders dialog header', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
  });

  it('renders dialog footer', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByTestId('icon-x')).toBeInTheDocument();
  });

  it('renders slide indicators', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    const footer = screen.getByTestId('dialog-footer');
    expect(footer).toBeInTheDocument();
  });

  it('renders Next button', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('renders single slide announcement', () => {
    const singleSlideAnnouncement = {
      ...mockAnnouncement,
      slides: [mockAnnouncement.slides[0]],
    };

    render(
      <FeatureAnnouncementModal
        announcement={singleSlideAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('uses dialog component', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    const dialog = screen.getByTestId('dialog');
    expect(dialog).toHaveAttribute('data-open', 'true');
  });

  it('renders buttons in footer', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays dialog content', () => {
    render(
      <FeatureAnnouncementModal
        announcement={mockAnnouncement}
        onDismiss={mockOnDismiss}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
  });
});
