import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc, ilike, sql } from 'drizzle-orm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EditCreditDialog } from '@/components/admin/edit-credit-dialog';
import { AddUserDialog } from '@/components/admin/add-user-dialog';
import { DeleteUserButton } from '@/components/admin/delete-user-button';
import { UserSearch } from '@/components/admin/user-search';
import { Pagination } from '@/components/admin/pagination';

export const dynamic = 'force-dynamic';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = searchParams.search;

  let whereClause = undefined;
  if (search) {
    whereClause = ilike(users.email, `%${search}%`);
  }

  const allUsers = await db.query.users.findMany({
    where: whereClause,
    limit: limit,
    offset: offset,
    orderBy: [desc(users.createdAt)],
    with: {
      subscriptions: true,
    }
  });
    
  const [countResult] = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(whereClause);
    
  const totalPages = Math.ceil(Number(countResult.count) / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-light tracking-tight">User Management</h2>
        <div className="flex gap-2">
            <UserSearch />
            <AddUserDialog />
        </div>
      </div>

      <div className="rounded-lg border border-black/5 bg-white/50 shadow-sm backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-black/5">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Points Expires</TableHead>
              <TableHead>Version Expires</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.map((user) => {
              const activeSubscription = user.subscriptions?.find((s) => s.status === 'active') || user.subscriptions?.[0];

              return (
                <TableRow key={user.id} className="border-black/5 hover:bg-black/[0.02]">
                  <TableCell className="font-medium text-xs text-muted-foreground">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="capitalize">{user.status}</TableCell>
                  <TableCell className="capitalize">{user.plan}</TableCell>
                  <TableCell>{user.creditBalance}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.creditsExpiresAt ? new Date(user.creditsExpiresAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {activeSubscription?.currentPeriodEnd ? new Date(activeSubscription.currentPeriodEnd).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(user.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditCreditDialog 
                        userId={user.id} 
                        currentBalance={user.creditBalance} 
                        userEmail={user.email} 
                        expiresAt={user.creditsExpiresAt}
                      />
                      <DeleteUserButton 
                        userId={user.id}
                        userEmail={user.email}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {allUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination totalPages={totalPages} currentPage={page} />
    </div>
  );
}
