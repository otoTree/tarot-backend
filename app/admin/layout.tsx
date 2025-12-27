import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-black/5 bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center gap-2">
                <Link href="/admin" className="text-lg font-light tracking-tight text-foreground hover:opacity-70 transition-opacity">
                  Tarot <span className="font-medium">Admin</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-gray-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-gray-700"
                >
                  Users
                </Link>
                <Link
                  href="/admin/sessions"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-gray-700"
                >
                  Sessions
                </Link>
                <Link
                  href="/admin/codes"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-gray-700"
                >
                  Codes
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View Site
                </Button>
              </Link>
              <form action="/api/admin/logout" method="POST"> 
                 <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">Logout</Button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 px-4">{children}</div>
      </main>
    </div>
  );
}
