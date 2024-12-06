'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { motion } from 'framer-motion';

interface SidebarNavItem {
  title: string;
  href: string;
  icon: keyof typeof Icons;
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[];
}

export function SidebarNav({ items, className, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col space-y-1', className)} {...props}>
      {items.map((item, index) => {
        const Icon = Icons[item.icon];
        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'justify-start w-full',
                pathname === item.href
                  ? 'bg-muted hover:bg-muted'
                  : 'hover:bg-transparent hover:underline',
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              {/* <Icon className="mr-2 h-4 w-4" /> */}
              <span>{item.title}</span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
