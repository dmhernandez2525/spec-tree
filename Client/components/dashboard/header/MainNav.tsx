'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
  },
  {
    title: 'Customers',
    href: '/dashboard/customers',
  },
  {
    title: 'Products',
    href: '/dashboard/products',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
