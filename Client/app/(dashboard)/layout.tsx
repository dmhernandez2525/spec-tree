import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col space-y-6 py-8">
      <div className="container flex-1">
        <div className="grid gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
          <aside className="hidden md:block">
            <DashboardNav />
          </aside>
          <main className="flex w-full flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
