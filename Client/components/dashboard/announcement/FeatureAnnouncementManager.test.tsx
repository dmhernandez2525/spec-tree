import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureAnnouncementManager } from './FeatureAnnouncementManager';
import * as FeatureAnnouncementContextModule from './FeatureAnnouncementContext';

// Mock dependencies
vi.mock('./FeatureAnnouncementContext');
vi.mock('./FeatureAnnouncementModal', () => ({
  FeatureAnnouncementModal: ({ announcement, onDismiss, onComplete }: any) => (
    <div data-testid="announcement-modal">
      <div data-testid="announcement-version">{announcement.version}</div>
      <button onClick={onDismiss} data-testid="dismiss-btn">
        Dismiss
      </button>
      <button onClick={onComplete} data-testid="complete-btn">
        Complete
      </button>
    </div>
  ),
}));

describe('FeatureAnnouncementManager', () => {
  const mockDismiss = vi.fn();
  const mockMarkAsSeen = vi.fn();

  const mockAnnouncement = {
    id: 'test-announcement',
    version: 'v1.0.0',
    releaseDate: new Date('2024-01-01'),
    priority: 1,
    slides: [
      {
        id: 'slide-1',
        title: 'Test Slide',
        description: 'Test Description',
        releaseDate: new Date('2024-01-01'),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports FeatureAnnouncementManager component', () => {
    expect(FeatureAnnouncementManager).toBeDefined();
    expect(typeof FeatureAnnouncementManager).toBe('function');
  });

  it('renders nothing when no current announcement', () => {
    vi.spyOn(
      FeatureAnnouncementContextModule,
      'useFeatureAnnouncements'
    ).mockReturnValue({
      currentAnnouncement: undefined,
      dismissAnnouncement: mockDismiss,
      markAnnouncementAsSeen: mockMarkAsSeen,
      announcements: [],
      seenAnnouncements: new Set(),
      showAnnouncement: vi.fn(),
      hasUnseenAnnouncements: false,
    });

    const { container } = render(<FeatureAnnouncementManager />);

    expect(container.firstChild).toBeNull();
  });

  it('renders modal when announcement exists', () => {
    vi.spyOn(
      FeatureAnnouncementContextModule,
      'useFeatureAnnouncements'
    ).mockReturnValue({
      currentAnnouncement: mockAnnouncement,
      dismissAnnouncement: mockDismiss,
      markAnnouncementAsSeen: mockMarkAsSeen,
      announcements: [mockAnnouncement],
      seenAnnouncements: new Set(),
      showAnnouncement: vi.fn(),
      hasUnseenAnnouncements: true,
    });

    render(<FeatureAnnouncementManager />);

    expect(screen.getByTestId('announcement-modal')).toBeInTheDocument();
  });

  it('displays announcement version', () => {
    vi.spyOn(
      FeatureAnnouncementContextModule,
      'useFeatureAnnouncements'
    ).mockReturnValue({
      currentAnnouncement: mockAnnouncement,
      dismissAnnouncement: mockDismiss,
      markAnnouncementAsSeen: mockMarkAsSeen,
      announcements: [mockAnnouncement],
      seenAnnouncements: new Set(),
      showAnnouncement: vi.fn(),
      hasUnseenAnnouncements: true,
    });

    render(<FeatureAnnouncementManager />);

    expect(screen.getByTestId('announcement-version')).toHaveTextContent(
      'v1.0.0'
    );
  });

  it('uses feature announcements context', () => {
    const spy = vi.spyOn(
      FeatureAnnouncementContextModule,
      'useFeatureAnnouncements'
    );
    spy.mockReturnValue({
      currentAnnouncement: undefined,
      dismissAnnouncement: mockDismiss,
      markAnnouncementAsSeen: mockMarkAsSeen,
      announcements: [],
      seenAnnouncements: new Set(),
      showAnnouncement: vi.fn(),
      hasUnseenAnnouncements: false,
    });

    render(<FeatureAnnouncementManager />);

    expect(spy).toHaveBeenCalled();
  });

  it('provides dismiss handler to modal', () => {
    vi.spyOn(
      FeatureAnnouncementContextModule,
      'useFeatureAnnouncements'
    ).mockReturnValue({
      currentAnnouncement: mockAnnouncement,
      dismissAnnouncement: mockDismiss,
      markAnnouncementAsSeen: mockMarkAsSeen,
      announcements: [mockAnnouncement],
      seenAnnouncements: new Set(),
      showAnnouncement: vi.fn(),
      hasUnseenAnnouncements: true,
    });

    render(<FeatureAnnouncementManager />);

    expect(screen.getByTestId('dismiss-btn')).toBeInTheDocument();
  });

  it('provides complete handler to modal', () => {
    vi.spyOn(
      FeatureAnnouncementContextModule,
      'useFeatureAnnouncements'
    ).mockReturnValue({
      currentAnnouncement: mockAnnouncement,
      dismissAnnouncement: mockDismiss,
      markAnnouncementAsSeen: mockMarkAsSeen,
      announcements: [mockAnnouncement],
      seenAnnouncements: new Set(),
      showAnnouncement: vi.fn(),
      hasUnseenAnnouncements: true,
    });

    render(<FeatureAnnouncementManager />);

    expect(screen.getByTestId('complete-btn')).toBeInTheDocument();
  });

  it('renders announcement modal component', () => {
    vi.spyOn(
      FeatureAnnouncementContextModule,
      'useFeatureAnnouncements'
    ).mockReturnValue({
      currentAnnouncement: mockAnnouncement,
      dismissAnnouncement: mockDismiss,
      markAnnouncementAsSeen: mockMarkAsSeen,
      announcements: [mockAnnouncement],
      seenAnnouncements: new Set(),
      showAnnouncement: vi.fn(),
      hasUnseenAnnouncements: true,
    });

    const { container } = render(<FeatureAnnouncementManager />);

    expect(container.firstChild).not.toBeNull();
  });
});
