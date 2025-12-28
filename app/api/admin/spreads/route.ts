import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { spreads, spreadPositions } from '@/lib/db/schema';
import { desc, eq, ilike, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (search) {
      whereClause = ilike(spreads.name, `%${search}%`);
    }

    const allSpreads = await db.query.spreads.findMany({
      where: whereClause,
      limit: limit,
      offset: offset,
      orderBy: [desc(spreads.createdAt)],
      with: {
        positions: true,
      }
    });
      
    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(spreads)
      .where(whereClause);

    return NextResponse.json({
      spreads: allSpreads,
      total: Number(countResult.count),
      page,
      totalPages: Math.ceil(Number(countResult.count) / limit),
    });
  } catch (error) {
    console.error('Spreads API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, lang, name, description, detail, difficulty, recommended, tags, positions } = body;

    if (!slug || !name || !description) {
      return NextResponse.json({ error: 'Slug, name, and description are required' }, { status: 400 });
    }

    // Check for uniqueness of slug + lang
    const existing = await db.query.spreads.findFirst({
        where: (spreads, { and, eq }) => and(eq(spreads.slug, slug), eq(spreads.lang, lang || 'en')),
    });

    if (existing) {
        return NextResponse.json({ error: 'Spread with this slug and language already exists' }, { status: 400 });
    }

    const [newSpread] = await db.insert(spreads).values({
      slug,
      lang: lang || 'en',
      name,
      description,
      detail,
      difficulty,
      recommended: recommended || false,
      tags: tags || [],
    }).returning();

    // Insert positions if any
    if (positions && Array.isArray(positions) && positions.length > 0) {
        await db.insert(spreadPositions).values(
            positions.map((p: any) => ({
                spreadId: newSpread.id,
                positionIndex: p.positionIndex,
                name: p.name,
                description: p.description,
                x: Number(p.x) || 0,
                y: Number(p.y) || 0,
            }))
        );
    }

    return NextResponse.json(newSpread);
  } catch (error) {
    console.error('Create Spread API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
