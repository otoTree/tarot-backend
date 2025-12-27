import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc, eq, ilike, sql } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password, role, status } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    await db.insert(users).values({
      email,
      password: hashedPassword,
      role: role || 'user',
      status: status || 'active',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create User API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (search) {
      whereClause = ilike(users.email, `%${search}%`);
    }

    const allUsers = await db.select()
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
      
    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    // Remove password from response
    const safeUsers = allUsers.map(user => {
      const { password, ...rest } = user;
      return rest;
    });

    return NextResponse.json({
      users: safeUsers,
      total: Number(countResult.count),
      page,
      totalPages: Math.ceil(Number(countResult.count) / limit),
    });
  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
