'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Sparkles,
  Plus,
  BookOpen,
  DollarSign,
  Info,
  Briefcase,
  Lightbulb,
  MessageSquare,
  Play,
  Newspaper,
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
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Features',
    href: '/features',
    icon: Sparkles,
  },
  // Center FAB placeholder
  {
    title: 'fab',
    href: '',
    icon: Plus,
  },
  {
    title: 'Pricing',
    href: '/pricing',
    icon: DollarSign,
  },
  {
    title: 'Resources',
    href: '/resources',
    icon: BookOpen,
  },
];

const moreMenuItems = [
  {
    title: 'About',
    href: '/about',
    icon: Info,
    description: 'Learn about our mission',
  },
  {
    title: 'Solutions',
    href: '/solutions',
    icon: Lightbulb,
    description: 'Solutions by industry and role',
  },
  {
    title: 'Demo',
    href: '/demo',
    icon: Play,
    description: 'Try Spec Tree live',
  },
  {
    title: 'Blog',
    href: '/blog',
    icon: Newspaper,
    description: 'Latest updates and insights',
  },
  {
    title: 'Careers',
    href: '/careers',
    icon: Briefcase,
    description: 'Join our team',
  },
  {
    title: 'Contact',
    href: '/contact',
    icon: MessageSquare,
    description: 'Get in touch with us',
  },
];

const isAuthPath = (pathname: string) => {
  const authPaths = ['/login', '/register', '/forgot-password', '/forgot-password-update', '/email-confirmation'];
  return authPaths.some((p) => pathname.startsWith(p));
};

const isDashboardPath = (pathname: string) => {
  return pathname.startsWith('/user-dashboard');
};

export function MarketingBottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Hide on auth pages and dashboard pages
  if (isAuthPath(pathname) || isDashboardPath(pathname)) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
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
                  aria-label="Explore more"
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
            <DrawerTitle>Explore</DrawerTitle>
            <DrawerDescription>
              Discover more about Spec Tree
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
