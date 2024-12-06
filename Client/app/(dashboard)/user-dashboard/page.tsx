// app/(dashboard)/user-dashboard/page.tsx
'use client';

import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { useAppSelector } from '@/lib/hooks/use-store';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.user.user);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container grid gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      <aside className="hidden md:block"></aside>
      <main>
        <DashboardContent />
      </main>
    </div>
  );
}
