'use client';

import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function UserSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get('search') || '');
  
  useEffect(() => {
    const timer = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (text) {
            params.set('search', text);
        } else {
            params.delete('search');
        }
        params.set('page', '1'); // Reset page on search
        router.push(`?${params.toString()}`);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [text, router, searchParams]);

  return (
    <Input 
      placeholder="Search by email..." 
      value={text} 
      onChange={e => setText(e.target.value)} 
      className="max-w-xs" 
    />
  );
}
