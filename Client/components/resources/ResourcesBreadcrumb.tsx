// components/resources/ResourcesBreadcrumb.tsx
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  title: string;
  href: string;
}

interface ResourcesBreadcrumbProps {
  items: Breadcrumb[];
}

export function ResourcesBreadcrumb({ items }: ResourcesBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/" className="flex items-center hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          <ChevronRight className="h-4 w-4" />
          <Link
            href={item.href}
            className={cn(
              'ml-2 hover:text-foreground',
              index === items.length - 1 && 'text-foreground font-medium'
            )}
          >
            {item.title}
          </Link>
        </div>
      ))}
    </nav>
  );
}
