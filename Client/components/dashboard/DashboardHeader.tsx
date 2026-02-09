'use client';

import { UserNav } from './header/UserNav';
import { Search } from './header/Search';
import { Notifications } from './header/Notifications';
import { useAppSelector } from '@/lib/hooks/use-store';
import { UserAttributes } from '@/types/user';

export function DashboardHeader() {
  const user: UserAttributes | null = useAppSelector(
    (state) => state.user.user
  );
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-4 md:mx-10 flex h-14 md:h-16 items-center justify-between py-2 md:py-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg md:text-2xl font-bold truncate">
            {user ? `Welcome ${user?.firstName}` : 'Dashboard'}
          </span>
          <Notifications />
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="hidden sm:block">
            <Search />
          </div>

          <UserNav
            user={{
              name: `${user?.firstName} ${user?.lastName}`,
              email: user?.email || '',
              image: user?.avatar?.url,
            }}
          />
        </div>
      </div>
    </header>
  );
}
