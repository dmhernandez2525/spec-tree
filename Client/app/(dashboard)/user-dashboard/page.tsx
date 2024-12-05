// app/(dashboard)/user-dashboard/page.tsx
'use client';

import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import useAppSelector from '@/lib/hooks/useAuthCheck';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const user = useAppSelector();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container grid gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      <aside className="hidden md:block">
        <DashboardNav />
      </aside>
      <main>
        <DashboardContent />
      </main>
    </div>
  );
}
