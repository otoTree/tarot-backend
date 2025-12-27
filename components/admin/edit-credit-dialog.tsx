'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditCreditDialogProps {
  userId: number;
  currentBalance: number;
  userEmail: string;
  expiresAt?: Date | null;
}

export function EditCreditDialog({ userId, currentBalance, userEmail, expiresAt }: EditCreditDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(currentBalance.toString());
  const [expirationDate, setExpirationDate] = useState(
    expiresAt ? new Date(expiresAt).toISOString().split('T')[0] : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}/credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: parseInt(amount),
          expiresAt: expirationDate ? new Date(expirationDate).toISOString() : null
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update credit');
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to update credit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Points
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Points</DialogTitle>
          <DialogDescription>
            Update the credit balance for {userEmail}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdate}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Points
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiresAt" className="text-right">
                Expires
              </Label>
              <Input
                id="expiresAt"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
