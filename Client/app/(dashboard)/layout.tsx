import { Metadata } from 'next';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TutorialProvider } from '@/components/dashboard/tutorial/TutorialContext';
import { TutorialOverlay } from '@/components/dashboard/tutorial/TutorialOverlay';
import { TutorialControls } from '@/components/dashboard/tutorial/TutorialControls';
import { AchievementsProvider } from '@/components/dashboard/achievements/AchievementsProvider';
import { TutorialManagerProvider } from '@/components/dashboard/tutorial/TutorialManager';
import { FeatureAnnouncementProvider } from '@/components/dashboard/announcement/FeatureAnnouncementContext';
import { FeatureAnnouncementManager } from '@/components/dashboard/announcement/FeatureAnnouncementManager';
import { Icons } from '@/components/shared/icons';

export const metadata: Metadata = {
  title: 'Dashboard | Spec Tree',
  description: 'Manage your projects and account settings',
};

const sidebarNavItems: Array<{
  title: string;
  href: string;
  icon: keyof typeof Icons;
}> = [
  {
    title: 'Overview',
    href: '/user-dashboard',
    icon: 'brain',
  },
  {
    title: 'Builder',
    href: '/user-dashboard/spec-tree',
    icon: 'brain',
  },
  {
    title: 'Analytics',
    href: '/user-dashboard/analytics',
    icon: 'barChart',
  },
  {
    title: 'Settings',
    href: '/user-dashboard/settings',
    icon: 'menu',
  },
  {
    title: 'Support',
    href: '/user-dashboard/support',
    icon: 'alert',
  },
  {
    title: 'Organization',
    href: '/user-dashboard/organization',
    icon: 'users',
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <FeatureAnnouncementProvider>
      <TutorialProvider>
        <TutorialManagerProvider>
          <AchievementsProvider>
            <div className="flex min-h-screen flex-col">
              <DashboardHeader />
              <div className="mr-10 ml-10 flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-5">
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
              <FeatureAnnouncementManager />
            </div>
          </AchievementsProvider>
        </TutorialManagerProvider>
      </TutorialProvider>
    </FeatureAnnouncementProvider>
  );
}
