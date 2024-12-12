'use client';

import { UserNav } from './header/UserNav';
import { Search } from './header/Search';
import { Notifications } from './header/Notifications';
import { useAppSelector } from '@/lib/hooks/use-store';

export function DashboardHeader() {
  const user = useAppSelector((state) => state.user.user);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mr-10	ml-10	flex h-16 items-center justify-between py-4">
        <div>
          <>Hello user </>
          <Notifications />
        </div>

        <div className="flex items-center gap-4">
          <Search />

          <UserNav
            user={{
              name: `${user?.firstName} ${user?.lastName}`,
              email: user?.email || '',
              image:
                'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            }}
          />
        </div>
      </div>
    </header>
  );
}
