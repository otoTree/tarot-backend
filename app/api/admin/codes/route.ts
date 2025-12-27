import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redemptionCodes } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const codes = await db.select().from(redemptionCodes).orderBy(desc(redemptionCodes.createdAt));
    return NextResponse.json(codes);
  } catch (error) {
    console.error('Codes API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { points, count, prefix, description, expiresAt } = await request.json();
    
    if (!points || points <= 0) {
      return NextResponse.json({ error: 'Invalid points' }, { status: 400 });
    }

    const codesToCreate = Array.from({ length: count || 1 }).map(() => ({
      code: (prefix || '') + nanoid(10), // Generate a 10-character unique code with optional prefix
      points: points,
      description: description || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }));

    await db.insert(redemptionCodes).values(codesToCreate);

    return NextResponse.json({ success: true, count: codesToCreate.length });
  } catch (error) {
    console.error('Generate Codes API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
