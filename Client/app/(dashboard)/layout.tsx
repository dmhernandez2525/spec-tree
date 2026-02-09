import { Metadata } from 'next';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { TutorialProvider } from '@/components/dashboard/tutorial/TutorialContext';
import { TutorialOverlay } from '@/components/dashboard/tutorial/TutorialOverlay';
import { TutorialControls } from '@/components/dashboard/tutorial/TutorialControls';
import { AchievementsProvider } from '@/components/dashboard/achievements/AchievementsProvider';
import { TutorialManagerProvider } from '@/components/dashboard/tutorial/TutorialManager';
// import { useAppSelector } from '@/lib/hooks/use-store';
import { FeatureAnnouncementProvider } from '@/components/dashboard/announcement/FeatureAnnouncementContext';
import { FeatureAnnouncementManager } from '@/components/dashboard/announcement/FeatureAnnouncementManager';
import { DashboardBottomNav } from '@/components/layout/DashboardBottomNav';

export const metadata: Metadata = {
  title: 'Dashboard | Spec Tree',
  description: 'Manage your projects and account settings',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const user = useAppSelector((state) => state.user.user);
  // if (!user) {
  //   redirect('/login');
  // }
  return (
    <FeatureAnnouncementProvider>
      <TutorialProvider>
        <TutorialManagerProvider>
          <AchievementsProvider>
            <div className="flex min-h-screen">
              <div className="hidden md:block">
                <SidebarNav />
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader />
                <main className="flex-1 p-4 md:p-6">{children}</main>
              </div>
              <DashboardBottomNav />
              <TutorialOverlay />
              <TutorialControls />
              <FeatureAnnouncementManager />
            </div>
          </AchievementsProvider>
        </TutorialManagerProvider>
      </TutorialProvider>
    </FeatureAnnouncementProvider>
  );
}
