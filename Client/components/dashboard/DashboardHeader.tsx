'use client';

import { UserNav } from './header/UserNav';
import { MainNav } from './header/MainNav';
import { Search } from './header/Search';
import { Notifications } from './header/Notifications';
import { useAppSelector } from '@/lib/hooks/use-store';
import Section from '@/components/layout/Section';

export function DashboardHeader() {
  const user = useAppSelector((state) => state.user.user);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <Section className=" flex h-16 items-center justify-between py-4">
        <MainNav />
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
        </div>
      </Section>
    </header>
  );
}
