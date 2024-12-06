'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks/use-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/shared/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  title: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

const routes: NavItem[] = [
  {
    title: 'About',
    href: '/about',
    children: [
      {
        title: 'About Us',
        href: '/about',
        description: 'Learn more about our company and mission',
      },
      {
        title: 'Our Process',
        href: '/our-process',
        description: 'Discover how we work with our clients',
      },
    ],
  },
  {
    title: 'Features',
    href: '/features',
    children: [
      {
        title: 'AI-Powered Context',
        href: '/features/ai-context',
        description: 'Intelligent context gathering and analysis',
      },
      {
        title: 'Work Item Generation',
        href: '/features/work-items',
        description: 'Automated generation of epics, features, and tasks',
      },
      {
        title: 'Template System',
        href: '/features/templates',
        description: 'Reusable templates for faster project setup',
      },
      {
        title: 'Integration Hub',
        href: '/features/integrations',
        description: 'Connect with your favorite project management tools',
      },
    ],
  },
  {
    title: 'Solutions',
    href: '/solutions',
    children: [
      {
        title: 'For Enterprises',
        href: '/solutions/industry/enterprise',
        description: 'Scale your project management across teams',
      },
      {
        title: 'For Startups',
        href: '/solutions/industry/startups',
        description: 'Move fast with efficient project planning',
      },
      {
        title: 'For Agencies',
        href: '/solutions/industry/digital-marketing',
        description: 'Manage multiple client projects seamlessly',
      },
    ],
  },
  {
    title: 'Resources',
    href: '/resources',
    children: [
      {
        title: 'Documentation',
        href: '/resources/documentation',
        description: 'Detailed guides and API references',
      },
      {
        title: 'Case Studies',
        href: '/resources/case-studies',
        description: 'Real-world success stories',
      },
      {
        title: 'Blog',
        href: '/blog',
        description: 'Latest updates and insights',
      },
    ],
  },
  {
    title: 'Pricing',
    href: '/pricing',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
  {
    title: 'Spec Tree',
    href: '/spec-tree',
  },
  {
    title: 'Theme',
    href: '/theam',
  },
];

interface UserNavProps {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

function UserNav({ user }: UserNavProps) {
  const handleSignOut = (event: Event) => {
    event.preventDefault();
    // Add sign out logic here
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <span className="sr-only">Open user menu</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-medium uppercase">
              {user.firstName?.[0] || user.email[0]}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user-dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user-dashboard/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user-dashboard/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={handleSignOut as any}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav({ routes }: { routes: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 px-2 py-4">
      {routes.map((route) =>
        route.children ? (
          <div key={route.href} className="flex flex-col gap-2">
            <h4 className="font-medium">{route.title}</h4>
            {route.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'text-muted-foreground hover:text-foreground',
                  pathname === child.href && 'text-foreground'
                )}
              >
                {child.title}
              </Link>
            ))}
          </div>
        ) : (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              pathname === route.href && 'text-foreground'
            )}
          >
            {route.title}
          </Link>
        )
      )}
    </div>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user.user);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Spec Tree</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {routes.map((route) => (
                <NavigationMenuItem key={route.href}>
                  {route.children ? (
                    <>
                      <NavigationMenuTrigger>
                        {route.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {route.children.map((child) => (
                            <li key={child.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.href}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {child.title}
                                  </div>
                                  {child.description && (
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {child.description}
                                    </p>
                                  )}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link href={route.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50',
                          pathname === route.href && 'bg-accent/50'
                        )}
                      >
                        {route.title}
                      </NavigationMenuLink>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus:ring-0 md:hidden"
            >
              <Icons.menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav routes={routes} />
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
          <span className="font-bold">Spec Tree</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <UserNav user={user} />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
