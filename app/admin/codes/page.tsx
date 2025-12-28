import { db } from '@/lib/db';
import { redemptionCodes, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GenerateCodesDialog } from '@/components/admin/generate-codes-dialog';
import { ExportCodesDialog } from '@/components/admin/export-codes-dialog';

export const dynamic = 'force-dynamic';

export default async function CodesPage() {
  const codes = await db.select({
    id: redemptionCodes.id,
    code: redemptionCodes.code,
    points: redemptionCodes.points,
    description: redemptionCodes.description,
    expiresAt: redemptionCodes.expiresAt,
    isUsed: redemptionCodes.isUsed,
    usedByEmail: users.email,
    createdAt: redemptionCodes.createdAt,
    usedAt: redemptionCodes.usedAt,
  })
  .from(redemptionCodes)
  .leftJoin(users, eq(redemptionCodes.usedBy, users.id))
  .orderBy(desc(redemptionCodes.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-light tracking-tight">Redemption Codes</h2>
        <div className="flex gap-2">
          <ExportCodesDialog codes={codes.map(c => ({
            id: c.id,
            code: c.code,
            points: c.points,
            isUsed: c.isUsed
          }))} />
          <GenerateCodesDialog />
        </div>
      </div>

      <div className="rounded-lg border border-black/5 bg-white/50 shadow-sm backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-black/5">
              <TableHead>Code</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Used By</TableHead>
              <TableHead>Used At</TableHead>
              <TableHead className="text-right">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((code) => (
              <TableRow key={code.id} className="border-black/5 hover:bg-black/[0.02]">
                <TableCell className="font-mono font-medium">{code.code}</TableCell>
                <TableCell>{code.points}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={code.description || ''}>{code.description || '-'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    code.isUsed 
                      ? 'bg-gray-50 text-gray-600 ring-gray-500/10' 
                      : 'bg-green-50 text-green-700 ring-green-600/20'
                  }`}>
                    {code.isUsed ? 'Used' : 'Active'}
                  </span>
                </TableCell>
                <TableCell>{code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{code.usedByEmail || '-'}</TableCell>
                <TableCell>{code.usedAt ? new Date(code.usedAt).toLocaleString() : '-'}</TableCell>
                <TableCell className="text-right text-muted-foreground">{new Date(code.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {codes.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No codes generated yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
