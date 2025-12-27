import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, lt, or, isNull, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check for authorization header if needed (optional for now)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Update users who are on 'basic' plan AND (have no expiration date OR have expired credits)
    const result = await db.update(users)
      .set({
        creditBalance: 10,
        creditsExpiresAt: thirtyDaysFromNow,
        updatedAt: now,
      })
      .where(
        and(
          eq(users.plan, 'basic'),
          or(
            isNull(users.creditsExpiresAt),
            lt(users.creditsExpiresAt, now)
          )
        )
      )
      .returning({ id: users.id, email: users.email });

    return NextResponse.json({
      success: true,
      updatedCount: result.length,
      updatedUsers: result.map(u => u.email),
      message: `Successfully renewed credits for ${result.length} users.`
    });
  } catch (error) {
    console.error('Monthly Credit Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
