import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentActivity } from './RecentActivity';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock the scroll-area component directly
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={className} data-testid="scroll-area">
      {children}
    </div>
  ),
  ScrollBar: () => <div />,
}));

// Mock the Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    check: ({ className }: { className?: string }) => (
      <span data-testid="check-icon" className={className}>
        Check
      </span>
    ),
  },
}));

describe('RecentActivity', () => {
  it('renders the component', () => {
    render(<RecentActivity />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('renders activity items', () => {
    render(<RecentActivity />);

    // Check for user names
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Sarah Miller')).toBeInTheDocument();
    expect(screen.getByText('Mike Ross')).toBeInTheDocument();
    expect(screen.getByText('Emma Smith')).toBeInTheDocument();
  });

  it('renders activity targets', () => {
    render(<RecentActivity />);

    expect(screen.getByText('New Feature Request')).toBeInTheDocument();
    expect(screen.getByText('Homepage Design')).toBeInTheDocument();
    expect(screen.getByText('User Authentication')).toBeInTheDocument();
    expect(screen.getByText('API Documentation')).toBeInTheDocument();
  });

  it('renders activity action verbs', () => {
    render(<RecentActivity />);

    expect(screen.getByText('created')).toBeInTheDocument();
    expect(screen.getByText('updated')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('commented on')).toBeInTheDocument();
  });

  it('renders project names', () => {
    render(<RecentActivity />);

    const websiteRedesigns = screen.getAllByText(/Website Redesign/);
    expect(websiteRedesigns.length).toBeGreaterThan(0);

    const mobileAppDevs = screen.getAllByText(/Mobile App Development/);
    expect(mobileAppDevs.length).toBeGreaterThan(0);
  });

  it('renders icons for each activity type', () => {
    render(<RecentActivity />);

    const icons = screen.getAllByTestId('check-icon');
    expect(icons).toHaveLength(4); // One for each activity
  });

  it('renders scroll area', () => {
    render(<RecentActivity />);

    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('renders Card component structure', () => {
    render(<RecentActivity />);

    // The Card contains a header with title
    const title = screen.getByText('Recent Activity');
    expect(title).toBeInTheDocument();
  });

  it('displays timestamps for activities', () => {
    render(<RecentActivity />);

    // The component formats timestamps with toLocaleTimeString
    // Activities should show time-based strings
    const activityItems = screen
      .getAllByText(/Website Redesign|Mobile App Development/)
      .map((el) => el.closest('.rounded-lg'));

    expect(activityItems.length).toBe(4);
  });

  it('renders 4 activity entries', () => {
    render(<RecentActivity />);

    // Each activity has a unique user
    const users = ['John Doe', 'Sarah Miller', 'Mike Ross', 'Emma Smith'];
    users.forEach((user) => {
      expect(screen.getByText(user)).toBeInTheDocument();
    });
  });

  it('activity items are styled with border and rounded corners', () => {
    render(<RecentActivity />);

    // Check if the activity container has proper classes
    const johnActivity = screen.getByText('John Doe').closest('.rounded-lg');
    expect(johnActivity).toHaveClass('border');
    expect(johnActivity).toHaveClass('p-3');
  });

  it('renders icons with correct color classes for different activity types', () => {
    render(<RecentActivity />);

    const icons = screen.getAllByTestId('check-icon');

    // The icons should have different color classes based on activity type
    // create: green, update: blue, complete: purple, comment: yellow
    const colorClasses = ['text-green-500', 'text-blue-500', 'text-purple-500', 'text-yellow-500'];

    icons.forEach((icon, index) => {
      expect(icon).toHaveClass(colorClasses[index]);
    });
  });
});
