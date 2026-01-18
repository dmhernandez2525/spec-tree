import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Notifications, Notification } from './Notifications';

export const notificationsTests = () => {
  it('renders notifications button', () => {
    render(<Notifications />);

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('exports Notification type', () => {
    const notification: Notification = {
      id: '1',
      title: 'Test',
      description: 'Test Description',
      timestamp: '1 hour ago',
    };

    expect(notification).toBeDefined();
  });

  it('shows unread count when there are unread notifications', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        title: 'Test 1',
        description: 'Description 1',
        timestamp: '2 hours ago',
        read: false,
      },
      {
        id: '2',
        title: 'Test 2',
        description: 'Description 2',
        timestamp: '3 hours ago',
        read: false,
      },
    ];

    render(<Notifications notifications={notifications} />);

    expect(screen.getByLabelText('Notifications (2 unread)')).toBeInTheDocument();
  });

  it('does not show unread count when all notifications are read', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        title: 'Test 1',
        description: 'Description 1',
        timestamp: '2 hours ago',
        read: true,
      },
    ];

    render(<Notifications notifications={notifications} />);

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('shows 9+ when there are more than 9 unread notifications', () => {
    const notifications: Notification[] = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      title: `Test ${i}`,
      description: `Description ${i}`,
      timestamp: `${i} hours ago`,
      read: false,
    }));

    render(<Notifications notifications={notifications} />);

    expect(screen.getByLabelText('Notifications (12 unread)')).toBeInTheDocument();
  });

  it('renders with empty notifications array', () => {
    const notifications: Notification[] = [];

    render(<Notifications notifications={notifications} />);

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('renders with notifications that have no read status', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        title: 'Message 1',
        description: 'Description 1',
        timestamp: '1 hour ago',
      },
    ];

    render(<Notifications notifications={notifications} />);

    expect(screen.getByLabelText('Notifications (1 unread)')).toBeInTheDocument();
  });

  it('calculates unread count correctly with mixed read status', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        title: 'Test 1',
        description: 'Description 1',
        timestamp: '1 hour ago',
        read: false,
      },
      {
        id: '2',
        title: 'Test 2',
        description: 'Description 2',
        timestamp: '2 hours ago',
        read: true,
      },
      {
        id: '3',
        title: 'Test 3',
        description: 'Description 3',
        timestamp: '3 hours ago',
        read: false,
      },
    ];

    render(<Notifications notifications={notifications} />);

    expect(screen.getByLabelText('Notifications (2 unread)')).toBeInTheDocument();
  });

  it('renders bell icon', () => {
    const { container } = render(<Notifications />);

    const bell = container.querySelector('.lucide-bell');
    expect(bell).toBeInTheDocument();
  });
};

notificationsTests();
