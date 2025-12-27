import { db } from '@/lib/db';
import { users, sessions, subscriptions } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [sessionCount] = await db.select({ count: sql<number>`count(*)` }).from(sessions);
  
  const [activeSubscriptionCount] = await db.select({ count: sql<number>`count(*)` })
    .from(subscriptions)
    .where(sql`${subscriptions.status} = 'active'`);

  const [totalCreditsResult] = await db.select({ sum: sql<number>`sum(${users.creditBalance})` })
    .from(users);

  // Daily New Users (Last 7 days)
  const dailyUsers = await db.execute(sql`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM ${users}
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) DESC
  `);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
         <h2 className="text-3xl font-light tracking-tight">Dashboard Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-black/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount.count}</div>
          </CardContent>
        </Card>
        <Card className="border-black/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptionCount.count}</div>
          </CardContent>
        </Card>
        <Card className="border-black/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionCount.count}</div>
          </CardContent>
        </Card>
        <Card className="border-black/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsResult.sum || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-black/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(dailyUsers.rows.find((row: any) => 
                new Date(row.date).toDateString() === new Date().toDateString()
              )?.count || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-light tracking-tight">Daily New Users (Last 7 Days)</h3>
        </div>
        <div className="rounded-lg border border-black/5 bg-white/50 shadow-sm backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-black/5">
                <TableHead>Date</TableHead>
                <TableHead>New Users</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyUsers.rows.map((row: any, i) => (
                <TableRow key={i} className="border-black/5 hover:bg-black/[0.02]">
                  <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                  <TableCell>{Number(row.count)}</TableCell>
                </TableRow>
              ))}
              {dailyUsers.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
