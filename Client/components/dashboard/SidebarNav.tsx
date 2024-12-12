'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/shared/icons';

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarNav({ className }: SidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'relative border-r bg-white transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[52px]' : 'w-[240px]',
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute -right-0 top-0 z-10 h-8 w-8 rounded-full border bg-white',
          'hover:bg-accent hover:text-accent-foreground'
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Icons.chevronLeft
          className={cn(
            'h-4 w-4 transition-transform duration-300',
            isCollapsed && 'rotate-180'
          )}
        />
      </Button>

      <ScrollArea className="h-full">
        <div
          className={cn(
            'flex flex-col gap-2 p-6',
            isCollapsed && 'items-center p-2'
          )}
        >
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'Overview',
                href: '/user-dashboard',
                icon: 'brain',
                variant: pathname === '/user-dashboard' ? 'default' : 'ghost',
              },
              {
                title: 'Builder',
                href: '/user-dashboard/spec-tree',
                icon: 'brain',
                variant:
                  pathname === '/user-dashboard/spec-tree'
                    ? 'default'
                    : 'ghost',
              },
              {
                title: 'Analytics',
                href: '/user-dashboard/analytics',
                icon: 'barChart',
                variant:
                  pathname === '/user-dashboard/analytics'
                    ? 'default'
                    : 'ghost',
              },
              {
                title: 'Settings',
                href: '/user-dashboard/settings',
                icon: 'menu',
                variant:
                  pathname === '/user-dashboard/settings' ? 'default' : 'ghost',
              },
              {
                title: 'Support',
                href: '/user-dashboard/support',
                icon: 'alert',
                variant:
                  pathname === '/user-dashboard/support' ? 'default' : 'ghost',
              },
              {
                title: 'Organization',
                href: '/user-dashboard/organization',
                icon: 'users',
                variant:
                  pathname === '/user-dashboard/organization'
                    ? 'default'
                    : 'ghost',
              },
            ]}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    href: string;
    icon: keyof typeof Icons;
    variant: 'default' | 'ghost';
  }[];
}

function Nav({ links, isCollapsed }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-4 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          const Icon = Icons[link.icon];
          return (
            <Link
              key={index}
              href={link.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                'hover:bg-accent hover:text-accent-foreground',
                link.variant === 'default' &&
                  'bg-accent text-accent-foreground',
                isCollapsed ? 'justify-center' : 'gap-3'
              )}
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed && <span>{link.title}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
