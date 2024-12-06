'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { User, Settings, Bell, Home } from 'lucide-react';

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string;
    title: string;
    icon?: any;
  }[];
}

export function DashboardNav({
  className,
  items = [
    {
      href: '/user-dashboard',
      title: 'Homeds',
      icon: Home,
    },
    {
      href: '/user-dashboard/profile',
      title: 'Profile',
      icon: User,
    },
    {
      href: '/user-dashboard/notifications',
      title: 'Notifications',
      icon: Bell,
    },
    {
      href: '/user-dashboard/settings',
      title: 'Settings',
      icon: Settings,
    },
  ],
  ...props
}: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              pathname === item.href
                ? 'bg-muted hover:bg-muted'
                : 'hover:bg-transparent hover:underline',
              'justify-start'
            )}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
