'use client';

// import { UserNav } from '@/components/dashboard/UserNav';
// import { MainNav } from '@/components/dashboard/MainNav';
// import { Search } from '@/components/dashboard/Search';
// import { Notifications } from '@/components/dashboard/Notifications';
import { useAppSelector } from '@/lib/hooks/use-store';

export function DashboardHeader() {
  const user = useAppSelector((state) => state.user.user);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        {/* <MainNav />
        <div className="flex items-center gap-4">
          <Search />
          <Notifications />
          <UserNav
            user={{
              name: `${user?.firstName} ${user?.lastName}`,
              email: user?.email || '',
              image: '/placeholder-avatar.jpg',
            }}
          />
        </div> */}
      </div>
    </header>
  );
}
