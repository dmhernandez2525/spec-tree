'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export function Notifications() {
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Message',
      description: 'You have a new message from John Doe',
      timestamp: '5m ago',
    },
    {
      id: '2',
      title: 'New Order',
      description: 'You received a new order #1234',
      timestamp: '1h ago',
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {notifications.length}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="flex flex-col items-start p-4"
          >
            <div className="flex w-full flex-col gap-1">
              <p className="text-sm font-medium leading-none">
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {notification.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {notification.timestamp}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full text-center">
          <span className="text-xs text-muted-foreground">
            View all notifications
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
