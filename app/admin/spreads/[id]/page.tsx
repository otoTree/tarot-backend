import { db } from '@/lib/db';
import { spreads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { EditSpreadForm } from '@/components/admin/edit-spread-form';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SpreadPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    notFound();
  }

  const spread = await db.query.spreads.findFirst({
    where: eq(spreads.id, id),
  });

  if (!spread) {
    notFound();
  }

  // Fetch all spreads with the same slug to get both languages
  const allSpreads = await db.query.spreads.findMany({
    where: eq(spreads.slug, spread.slug),
    with: {
      positions: true,
    },
  });

  return (
    <div className="space-y-6">
      <EditSpreadForm spreads={allSpreads} />
    </div>
  );
}
