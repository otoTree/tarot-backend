import { AdminNav } from '@/components/admin/admin-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 px-4">{children}</div>
      </main>
    </div>
  );
}
