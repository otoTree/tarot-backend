import { db } from '@/lib/db';
import { spreads } from '@/lib/db/schema';
import { desc, ilike, sql } from 'drizzle-orm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddSpreadDialog } from '@/components/admin/add-spread-dialog';
import { SpreadSearch } from '@/components/admin/spread-search';
import { Pagination } from '@/components/admin/pagination';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SpreadsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = searchParams.search;

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
        positions: true
    }
  });
    
  const [countResult] = await db.select({ count: sql<number>`count(*)` })
    .from(spreads)
    .where(whereClause);
    
  const totalPages = Math.ceil(Number(countResult.count) / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-light tracking-tight">Spread Management</h2>
        <div className="flex gap-2">
            <SpreadSearch />
            <AddSpreadDialog />
        </div>
      </div>

      <div className="rounded-lg border border-black/5 bg-white/50 shadow-sm backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-black/5">
              <TableHead>Slug</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Lang</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Positions</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allSpreads.map((spread) => (
              <TableRow key={spread.id} className="border-black/5 hover:bg-black/[0.02]">
                <TableCell className="font-medium">{spread.slug}</TableCell>
                <TableCell>{spread.name}</TableCell>
                <TableCell className="uppercase">{spread.lang}</TableCell>
                <TableCell>{spread.difficulty}</TableCell>
                <TableCell>{spread.positions.length}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(spread.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/spreads/${spread.id}`}>
                        <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination totalPages={totalPages} currentPage={page} />
    </div>
  );
}
