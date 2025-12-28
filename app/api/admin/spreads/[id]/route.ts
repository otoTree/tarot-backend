import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { spreads, spreadPositions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const spread = await db.query.spreads.findFirst({
      where: eq(spreads.id, id),
      with: {
        positions: true,
      },
    });

    if (!spread) {
      return NextResponse.json({ error: 'Spread not found' }, { status: 404 });
    }

    return NextResponse.json(spread);
  } catch (error) {
    console.error('Get Spread API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { slug, name, description, detail, difficulty, recommended, tags, lang, positions } = body;

    // Update spread details
    await db.update(spreads)
      .set({
        slug,
        name,
        description,
        detail,
        difficulty,
        recommended,
        tags,
        lang,
        updatedAt: new Date(),
      })
      .where(eq(spreads.id, id));

    // Update positions
    // Strategy: Delete all existing positions for this spread and re-insert new ones.
    if (positions && Array.isArray(positions)) {
        await db.delete(spreadPositions).where(eq(spreadPositions.spreadId, id));
        
        if (positions.length > 0) {
            await db.insert(spreadPositions).values(
                positions.map((p: any) => ({
                    spreadId: id,
                    positionIndex: p.positionIndex,
                    name: p.name,
                    description: p.description,
                    x: Number(p.x) || 0,
                    y: Number(p.y) || 0,
                }))
            );
        }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Spread API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await db.delete(spreads).where(eq(spreads.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Spread API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
