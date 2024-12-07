'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/shared/icons';

interface Activity {
  id: string;
  type: 'create' | 'update' | 'complete' | 'comment';
  user: string;
  target: string;
  timestamp: string;
  project: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'create',
    user: 'John Doe',
    target: 'New Feature Request',
    timestamp: '2024-03-20T10:30:00Z',
    project: 'Website Redesign',
  },
  {
    id: '2',
    type: 'update',
    user: 'Sarah Miller',
    target: 'Homepage Design',
    timestamp: '2024-03-20T09:15:00Z',
    project: 'Mobile App Development',
  },
  {
    id: '3',
    type: 'complete',
    user: 'Mike Ross',
    target: 'User Authentication',
    timestamp: '2024-03-20T08:45:00Z',
    project: 'Website Redesign',
  },
  {
    id: '4',
    type: 'comment',
    user: 'Emma Smith',
    target: 'API Documentation',
    timestamp: '2024-03-20T08:30:00Z',
    project: 'Mobile App Development',
  },
];

const activityIcons = {
  create: <Icons.check className="h-4 w-4 text-green-500" />,
  update: <Icons.check className="h-4 w-4 text-blue-500" />,
  complete: <Icons.check className="h-4 w-4 text-purple-500" />,
  comment: <Icons.check className="h-4 w-4 text-yellow-500" />,
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 rounded-lg border p-3"
              >
                <div className="mt-0.5">{activityIcons[activity.type]}</div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.type === 'create' && 'created'}
                    {activity.type === 'update' && 'updated'}
                    {activity.type === 'complete' && 'completed'}
                    {activity.type === 'comment' && 'commented on'}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.project} •{' '}
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
