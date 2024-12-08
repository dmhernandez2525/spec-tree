'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks/use-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import Section from '@/components/layout/Section';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDispatch } from 'react-redux';
import { logOut } from '@/lib/store/auth-slice';
import { clearUser } from '@/lib/store/user-slice';
import { routes, NavItem } from './navigationRoutes';
import img from '@/public/spec-tree-icon.svg';

interface UserNavProps {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

function UserNav({ user }: UserNavProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSignOut = () => {
    dispatch(clearUser());
    dispatch(logOut());
    router.push('/');
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
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();

  if (item.children) {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          {item.title === 'Solutions' && (
            <div className="p-4 pt-0">
              <Link
                href="/solutions"
                className="block w-full rounded-md p-3 hover:bg-accent"
              >
                <div className="text-sm font-medium">Overview</div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  Explore all our solutions and capabilities
                </p>
              </Link>
              <div className="mt-4 h-px bg-muted" />
            </div>
          )}
          {item.title === 'Resources' && (
            <div className="p-4 pt-0">
              <Link
                href="/resources"
                className="block w-full rounded-md p-3 hover:bg-accent"
              >
                <div className="text-sm font-medium">Overview</div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  Explore all our Resources
                </p>
              </Link>
              <div className="mt-4 h-px bg-muted" />
            </div>
          )}
          {item.title === 'Features' && (
            <div className="p-4 pt-0">
              <Link
                href="/features"
                className="block w-full rounded-md p-3 hover:bg-accent"
              >
                <div className="text-sm font-medium">Overview</div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  Explore all our Features
                </p>
              </Link>
              <div className="mt-4 h-px bg-muted" />
            </div>
          )}
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
            {item.children.map((child) => (
              <li key={child.href}>
                {child.children ? (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium leading-none mb-2">
                      {child.title}
                    </h4>
                    <ul className="space-y-2">
                      {child.children.map((subChild) => (
                        <li key={subChild.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={subChild.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium">
                                {subChild.title}
                              </div>
                              {subChild.description && (
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {subChild.description}
                                </p>
                              )}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link
                      href={child.href}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium">{child.title}</div>
                      {child.description && (
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {child.description}
                        </p>
                      )}
                    </Link>
                  </NavigationMenuLink>
                )}
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <Link href={item.href} legacyBehavior passHref>
        <NavigationMenuLink
          className={cn(
            'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50',
            pathname === item.href && 'bg-accent/50'
          )}
        >
          {item.title}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
}

function MobileNavItem({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  if (item.children) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-md p-2 text-left text-sm hover:bg-accent',
            depth > 0 && 'pl-6'
          )}
        >
          <span className="font-medium">{item.title}</span>
          <Icons.chevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
        {isOpen && (
          <div className="pl-4 space-y-2">
            {item.children.map((child) => (
              <MobileNavItem key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'block rounded-md p-2 text-sm hover:bg-accent',
        pathname === item.href && 'bg-accent',
        depth > 0 && 'pl-6'
      )}
    >
      {item.title}
    </Link>
  );
}

function MobileNav() {
  return (
    <div className="space-y-4 px-2 py-4">
      {routes.map((route) => (
        <MobileNavItem key={route.href} item={route} />
      ))}
    </div>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user.user);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <Section
        className="flex h-14 items-center relative"
        containerClassName="flex h-14 items-center relative"
      >
        <div className="flex-none">
          <Link href="/" className="flex items-center space-x-2 h-14">
            <img
              src={img.src}
              alt="Spec Tree Logo"
              className="h-20 w-auto"
            />
            <span className="font-bold text-lg">Spec Tree</span>
          </Link>
        </div>

        {/* Center: Navigation links */}
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList className="space-x-1">
              {routes.map((route) => (
                <NavLink key={route.href} item={route} />
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right: Auth actions and Mobile Menu */}
        <div className="flex-none ml-auto flex items-center gap-2">
          {user ? (
            <UserNav user={user} />
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Icons.menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <MobileNav />
            </SheetContent>
          </Sheet>
        </div>
      </Section>
    </header>
  );
}
