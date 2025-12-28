import { db } from '@/lib/db';
import { sessions, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
  const allSessions = await db.select({
    id: sessions.id,
    userId: sessions.userId,
    userEmail: users.email,
    spreadId: sessions.spreadId,
    createdAt: sessions.createdAt,
  })
  .from(sessions)
  .leftJoin(users, eq(sessions.userId, users.id))
  .orderBy(desc(sessions.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light tracking-tight">User Sessions</h2>
      </div>

      <div className="rounded-lg border border-black/5 bg-white/50 shadow-sm backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-black/5">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Spread</TableHead>
              <TableHead className="text-right">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allSessions.map((session) => (
              <TableRow key={session.id} className="border-black/5 hover:bg-black/[0.02]">
                <TableCell className="font-medium text-xs text-muted-foreground truncate max-w-[100px]" title={session.id}>
                  {session.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{session.userEmail}</span>
                    <span className="text-xs text-muted-foreground">ID: {session.userId}</span>
                  </div>
                </TableCell>
                <TableCell>{session.spreadId}</TableCell>
                <TableCell className="text-right text-muted-foreground">{new Date(session.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {allSessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No sessions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
