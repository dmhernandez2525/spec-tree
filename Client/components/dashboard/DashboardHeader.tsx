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
      <div className="mr-10	ml-10	flex h-16 items-center justify-between py-4">
        <div>
          <span className="text-2xl font-bold">
            {user ? `Welcome Back ${user?.firstName}` : 'Dashboard'}
          </span>

          <Notifications />
        </div>

        <div className="flex items-center gap-4">
          <Search />

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
