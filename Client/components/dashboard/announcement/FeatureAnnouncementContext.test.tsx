import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  FeatureAnnouncementProvider,
  useFeatureAnnouncements,
} from './FeatureAnnouncementContext';
import * as useLocalStorageModule from '@/lib/hooks/use-local-storage';

// Mock dependencies
vi.mock('@/lib/hooks/use-local-storage');
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

vi.mock('@/lib/data/mocks/feature-announcements', () => ({
  FEATURE_ANNOUNCEMENTS: [
    {
      id: 'test-announcement-1',
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
    },
  ],
}));

describe('FeatureAnnouncementContext', () => {
  const mockSetAnnouncementState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([
      {
        seenAnnouncements: [],
        lastSeenAt: undefined,
      },
      mockSetAnnouncementState,
    ]);
  });

  it('exports FeatureAnnouncementProvider component', () => {
    expect(FeatureAnnouncementProvider).toBeDefined();
    expect(typeof FeatureAnnouncementProvider).toBe('function');
  });

  it('exports useFeatureAnnouncements hook', () => {
    expect(useFeatureAnnouncements).toBeDefined();
    expect(typeof useFeatureAnnouncements).toBe('function');
  });

  it('renders children', () => {
    render(
      <FeatureAnnouncementProvider>
        <div data-testid="child">Test Child</div>
      </FeatureAnnouncementProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('provides context to children', () => {
    const TestComponent = () => {
      const context = useFeatureAnnouncements();
      return (
        <div data-testid="context-test">{context.announcements.length}</div>
      );
    };

    render(
      <FeatureAnnouncementProvider>
        <TestComponent />
      </FeatureAnnouncementProvider>
    );

    expect(screen.getByTestId('context-test')).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    const TestComponent = () => {
      try {
        useFeatureAnnouncements();
        return <div>Should not render</div>;
      } catch (error) {
        return <div data-testid="error">{(error as Error).message}</div>;
      }
    };

    render(<TestComponent />);

    expect(screen.getByTestId('error')).toHaveTextContent(
      'useFeatureAnnouncements must be used within a FeatureAnnouncementProvider'
    );
  });

  it('provides announcements list', () => {
    const TestComponent = () => {
      const { announcements } = useFeatureAnnouncements();
      return <div data-testid="announcements">{announcements.length}</div>;
    };

    render(
      <FeatureAnnouncementProvider>
        <TestComponent />
      </FeatureAnnouncementProvider>
    );

    expect(screen.getByTestId('announcements')).toHaveTextContent('1');
  });

  it('provides seenAnnouncements set', () => {
    const TestComponent = () => {
      const { seenAnnouncements } = useFeatureAnnouncements();
      return (
        <div data-testid="seen">
          {seenAnnouncements instanceof Set ? 'Set' : 'Not a Set'}
        </div>
      );
    };

    render(
      <FeatureAnnouncementProvider>
        <TestComponent />
      </FeatureAnnouncementProvider>
    );

    expect(screen.getByTestId('seen')).toHaveTextContent('Set');
  });

  it('provides showAnnouncement function', () => {
    const TestComponent = () => {
      const { showAnnouncement } = useFeatureAnnouncements();
      return (
        <div data-testid="show">
          {typeof showAnnouncement === 'function' ? 'function' : 'not-function'}
        </div>
      );
    };

    render(
      <FeatureAnnouncementProvider>
        <TestComponent />
      </FeatureAnnouncementProvider>
    );

    expect(screen.getByTestId('show')).toHaveTextContent('function');
  });

  it('provides dismissAnnouncement function', () => {
    const TestComponent = () => {
      const { dismissAnnouncement } = useFeatureAnnouncements();
      return (
        <div data-testid="dismiss">
          {typeof dismissAnnouncement === 'function' ? 'function' : 'not-function'}
        </div>
      );
    };

    render(
      <FeatureAnnouncementProvider>
        <TestComponent />
      </FeatureAnnouncementProvider>
    );

    expect(screen.getByTestId('dismiss')).toHaveTextContent('function');
  });

  it('provides markAnnouncementAsSeen function', () => {
    const TestComponent = () => {
      const { markAnnouncementAsSeen } = useFeatureAnnouncements();
      return (
        <div data-testid="mark">
          {typeof markAnnouncementAsSeen === 'function' ? 'function' : 'not-function'}
        </div>
      );
    };

    render(
      <FeatureAnnouncementProvider>
        <TestComponent />
      </FeatureAnnouncementProvider>
    );

    expect(screen.getByTestId('mark')).toHaveTextContent('function');
  });

  it('provides hasUnseenAnnouncements boolean', () => {
    const TestComponent = () => {
      const { hasUnseenAnnouncements } = useFeatureAnnouncements();
      return (
        <div data-testid="has-unseen">
          {typeof hasUnseenAnnouncements === 'boolean' ? 'boolean' : 'not-boolean'}
        </div>
      );
    };

    render(
      <FeatureAnnouncementProvider>
        <TestComponent />
      </FeatureAnnouncementProvider>
    );

    expect(screen.getByTestId('has-unseen')).toHaveTextContent('boolean');
  });

  it('uses local storage for persistence', () => {
    render(
      <FeatureAnnouncementProvider>
        <div>Test</div>
      </FeatureAnnouncementProvider>
    );

    expect(useLocalStorageModule.useLocalStorage).toHaveBeenCalledWith(
      'feature-announcements',
      expect.any(Object)
    );
  });

  it('initializes with empty seen announcements', () => {
    const TestComponent = () => {
      const { seenAnnouncements } = useFeatureAnnouncements();
      return <div data-testid="size">{seenAnnouncements.size}</div>;
    };

    render(
      <FeatureAnnouncementProvider>
        <TestComponent />
      </FeatureAnnouncementProvider>
    );

    expect(screen.getByTestId('size')).toHaveTextContent('0');
  });

  it('tracks current announcement', () => {
    const TestComponent = () => {
      const { currentAnnouncement } = useFeatureAnnouncements();
      return (
        <div data-testid="current">
          {currentAnnouncement ? 'has-current' : 'no-current'}
        </div>
      );
    };

    render(
      <FeatureAnnouncementProvider>
        <TestComponent />
      </FeatureAnnouncementProvider>
    );

    const currentDiv = screen.getByTestId('current');
    expect(currentDiv).toBeInTheDocument();
  });
});
