'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TreePine,
  BarChart3,
  Plus,
  Settings,
  HelpCircle,
  Users,
  User,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';

const navItems = [
  {
    title: 'Overview',
    href: '/user-dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Builder',
    href: '/user-dashboard/spec-tree',
    icon: TreePine,
  },
  // Center FAB placeholder
  {
    title: 'fab',
    href: '',
    icon: Plus,
  },
  {
    title: 'Analytics',
    href: '/user-dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/user-dashboard/settings',
    icon: Settings,
  },
];

const moreMenuItems = [
  {
    title: 'Profile',
    href: '/user-dashboard/profile',
    icon: User,
    description: 'View and edit your profile',
  },
  {
    title: 'Support',
    href: '/user-dashboard/support',
    icon: HelpCircle,
    description: 'Get help and submit tickets',
  },
  {
    title: 'Organization',
    href: '/user-dashboard/organization',
    icon: Users,
    description: 'Manage your team and organization',
  },
  {
    title: 'Analytics',
    href: '/user-dashboard/analytics',
    icon: BarChart3,
    description: 'View detailed analytics',
  },
  {
    title: 'Settings',
    href: '/user-dashboard/settings',
    icon: Settings,
    description: 'Account and app settings',
  },
];

export function DashboardBottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const isActive = (href: string) => {
    if (href === '/user-dashboard') {
      return pathname === '/user-dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden animate-slide-up">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            if (item.title === 'fab') {
              return (
                <button
                  key="fab"
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center justify-center -mt-5 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
                  aria-label="Quick actions menu"
                >
                  <Plus className="h-6 w-6" />
                </button>
              );
            }

            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[3.5rem] rounded-lg transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                <span className="text-[10px] font-medium leading-tight">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Quick Actions</DrawerTitle>
            <DrawerDescription>
              Navigate to dashboard sections
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <div className="grid grid-cols-3 gap-3">
              {moreMenuItems.map((item) => (
                <DrawerClose key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors',
                      isActive(item.href)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs font-medium text-center leading-tight">
                      {item.title}
                    </span>
                  </Link>
                </DrawerClose>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
