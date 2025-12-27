import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { count, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Total Users
    const [userCount] = await db.select({ count: count() }).from(users);
    
    // Total Sessions
    const [sessionCount] = await db.select({ count: count() }).from(sessions);

    // Daily New Users (Last 7 days)
    // Note: SQLite syntax is different from Postgres. Assuming Postgres based on package.json
    const dailyUsers = await db.execute(sql`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM ${users}
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    return NextResponse.json({
      totalUsers: userCount.count,
      totalSessions: sessionCount.count,
      dailyUsers: dailyUsers.rows,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
