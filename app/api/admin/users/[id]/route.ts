import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions, messages, cardsDrawn, redemptionCodes } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    // Get user sessions
    const userSessions = await db.select({ id: sessions.id }).from(sessions).where(eq(sessions.userId, userId));
    const sessionIds = userSessions.map(s => s.id);

    if (sessionIds.length > 0) {
      // Delete cards_drawn
      await db.delete(cardsDrawn).where(inArray(cardsDrawn.sessionId, sessionIds));
      
      // Delete messages
      await db.delete(messages).where(inArray(messages.sessionId, sessionIds));
      
      // Delete sessions
      await db.delete(sessions).where(eq(sessions.userId, userId));
    }

    // Update redemption codes (unlink user)
    await db.update(redemptionCodes)
      .set({ usedBy: null })
      .where(eq(redemptionCodes.usedBy, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete User API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
