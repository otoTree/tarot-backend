import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allSessions = await db.select({
      id: sessions.id,
      userId: sessions.userId,
      userEmail: users.email,
      question: sessions.question,
      createdAt: sessions.createdAt,
    })
    .from(sessions)
    .leftJoin(users, eq(sessions.userId, users.id))
    .orderBy(desc(sessions.createdAt));

    return NextResponse.json(allSessions);
  } catch (error) {
    console.error('Sessions API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
