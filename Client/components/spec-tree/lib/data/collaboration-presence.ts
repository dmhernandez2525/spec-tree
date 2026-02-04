import type { PresenceUser, CollaborationActivity } from '@/types/collaboration';

export const mockPresenceUsers: PresenceUser[] = [
  {
    id: 'user-1',
    name: 'Avery Kim',
    color: '#2563eb',
    status: 'active',
    lastActive: new Date().toISOString(),
    currentItemId: undefined,
  },
  {
    id: 'user-2',
    name: 'Jordan Lee',
    color: '#16a34a',
    status: 'active',
    lastActive: new Date().toISOString(),
    currentItemId: undefined,
  },
  {
    id: 'user-3',
    name: 'Riley Patel',
    color: '#f97316',
    status: 'idle',
    lastActive: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    currentItemId: undefined,
  },
];

export const mockActivitySeed: CollaborationActivity[] = [
  {
    id: 'activity-1',
    userId: 'user-1',
    userName: 'Avery Kim',
    action: 'created',
    targetType: 'epic',
    targetTitle: 'Authentication & Access',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'activity-2',
    userId: 'user-2',
    userName: 'Jordan Lee',
    action: 'generated',
    targetType: 'feature',
    targetTitle: 'Role-based permissions',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'activity-3',
    userId: 'user-3',
    userName: 'Riley Patel',
    action: 'updated',
    targetType: 'task',
    targetTitle: 'Sync permissions for viewers',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
];
