import { Metadata } from 'next';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TutorialProvider } from '@/components/tutorial/TutorialContext';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { TutorialControls } from '@/components/tutorial/TutorialControls';

export const metadata: Metadata = {
  title: 'Dashboard | Spec Tree',
  description: 'Manage your projects and account settings',
};

const sidebarNavItems = [
  {
    title: 'Overview',
    href: '/user-dashboard',
    icon: 'home',
  },
  {
    title: 'Projects',
    href: '/user-dashboard/projects',
    icon: 'folder',
  },
  {
    title: 'Analytics',
    href: '/user-dashboard/analytics',
    icon: 'barChart',
  },
  {
    title: 'Billing',
    href: '/user-dashboard/billing',
    icon: 'creditCard',
  },
  {
    title: 'Settings',
    href: '/user-dashboard/settings',
    icon: 'settings',
  },
  {
    title: 'Support',
    href: '/user-dashboard/support',
    icon: 'helpCircle',
  },
  {
    title: 'Spec Tree',
    href: '/user-dashboard/spec-tree',
    icon: 'helpCircle',
  },
  {
    title: 'Theme',
    href: '/user-dashboard/theme',
    icon: 'helpCircle',
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <TutorialProvider>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <ScrollArea className="py-6 pr-6 lg:py-8">
              <SidebarNav items={sidebarNavItems} />
            </ScrollArea>
          </aside>
          <main className="flex w-full flex-col overflow-hidden">
            <TutorialControls />
            {children}
          </main>
        </div>
        <TutorialOverlay />
      </div>
    </TutorialProvider>
  );
}
