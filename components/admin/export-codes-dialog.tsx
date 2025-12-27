'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Copy, Download } from 'lucide-react';

type Code = {
  id: number;
  code: string;
  points: number;
  isUsed: boolean;
};

interface ExportCodesDialogProps {
  codes: Code[];
}

export function ExportCodesDialog({ codes }: ExportCodesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<string>('all');
  const [isCopying, setIsCopying] = useState(false);

  // Filter only unused codes
  const unusedCodes = useMemo(() => codes.filter(c => !c.isUsed), [codes]);

  // Group by points to see available options
  const pointOptions = useMemo(() => {
    const points = new Set(unusedCodes.map(c => c.points));
    return Array.from(points).sort((a, b) => a - b);
  }, [unusedCodes]);

  // Filter codes based on selection
  const filteredCodes = useMemo(() => {
    if (selectedPoints === 'all') return unusedCodes;
    return unusedCodes.filter(c => c.points === parseInt(selectedPoints));
  }, [unusedCodes, selectedPoints]);

  const handleCopy = async () => {
    if (filteredCodes.length === 0) return;

    const textToCopy = filteredCodes.map(c => c.code).join('\n');
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Unused
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Unused Codes</DialogTitle>
          <DialogDescription>
            Copy unused redemption codes to clipboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="points" className="text-right">
              Points
            </Label>
            <div className="col-span-3">
              <Select
                value={selectedPoints}
                onValueChange={setSelectedPoints}
              >
                <SelectTrigger id="points">
                  <SelectValue placeholder="Select points value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Points ({unusedCodes.length})</SelectItem>
                  {pointOptions.map((point) => (
                    <SelectItem key={point} value={point.toString()}>
                      {point} Points ({unusedCodes.filter(c => c.points === point).length} codes)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            <p>Selected: {filteredCodes.length} codes</p>
            <p className="mt-1 text-xs font-mono">
              {filteredCodes.length > 0 ? (
                <>Example: {filteredCodes[0].code}</>
              ) : (
                'No codes available'
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            onClick={handleCopy} 
            disabled={filteredCodes.length === 0}
            className="gap-2"
          >
            {isCopying ? (
              <>Copied!</>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
