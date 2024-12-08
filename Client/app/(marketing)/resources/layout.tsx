'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu } from 'lucide-react';

interface ResourceLink {
  title: string;
  href: string;
  description: string;
}

const resourceLinks: ResourceLink[] = [
  {
    title: 'Documentation',
    href: '/resources/documentation',
    description: 'Detailed guides and API documentation',
  },
  {
    title: 'Guides',
    href: '/resources/guides',
    description: 'Step-by-step tutorials and best practices',
  },
  {
    title: 'API Reference',
    href: '/resources/api-reference',
    description: 'Complete API documentation and examples',
  },
  {
    title: 'Case Studies',
    href: '/resources/case-studies',
    description: 'Real-world success stories and implementations',
  },
  {
    title: 'Tutorials',
    href: '/resources/tutorials',
    description: 'Interactive learning resources and videos',
  },
];

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const ResourceNav = () => (
    <div className="space-y-1">
      {resourceLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'block w-full px-3 py-2 hover:bg-accent rounded-md transition-colors',
            pathname === link.href ? 'bg-accent' : 'text-muted-foreground'
          )}
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">{link.title}</span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {link.description}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          className="lg:hidden fixed left-4 top-4 z-50"
          aria-label="Open navigation"
        >
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Resources</SheetTitle>
          </SheetHeader>
          <ScrollArea className="my-4 h-[calc(100vh-8rem)]">
            <ResourceNav />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex w-[300px] flex-shrink-0">
        <div className="fixed h-screen w-[300px] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ScrollArea className="h-full">
            <nav className="space-y-4 p-4">
              <ResourceNav />
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-0">
        <div className="h-full min-h-screen">{children}</div>
      </main>
    </div>
  );
}
