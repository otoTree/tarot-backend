'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SpreadPosition {
  id?: number;
  positionIndex: string;
  name: string;
  description: string;
  x: number;
  y: number;
}

interface SpreadThumbnailProps {
  positions: SpreadPosition[];
  className?: string;
}

export function SpreadThumbnail({ positions, className }: SpreadThumbnailProps) {
  const CANVAS_WIDTH = 100;
  const CANVAS_HEIGHT = 100; // 与主画布保持一致
  const CARD_WIDTH = 13.814;
  const CARD_HEIGHT = 23.824;

  // Sort positions by index for the connection lines
  const sortedPositions = [...positions].sort((a, b) => 
    parseInt(a.positionIndex) - parseInt(b.positionIndex)
  );

  return (
    <div 
      className={cn(
        "relative aspect-[100/100] bg-zinc-50 border border-black/[0.04] rounded overflow-hidden",
        className
      )}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        {sortedPositions.map((pos, i) => {
          if (i === sortedPositions.length - 1) return null;
          const nextPos = sortedPositions[i + 1];
          return (
            <line
              key={`line-${i}`}
              x1={`${(pos.x / CANVAS_WIDTH) * 100}%`}
              y1={`${(pos.y / CANVAS_HEIGHT) * 100}%`}
              x2={`${(nextPos.x / CANVAS_WIDTH) * 100}%`}
              y2={`${(nextPos.y / CANVAS_HEIGHT) * 100}%`}
              stroke="#00000010"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {positions.map((pos, index) => (
        <div
          key={index}
          className="absolute -translate-x-1/2 -translate-y-1/2 bg-white border border-black/10 rounded-[1px] shadow-[0_0.5px_1px_rgba(0,0,0,0.05)]"
          style={{
            left: `${(pos.x / CANVAS_WIDTH) * 100}%`,
            top: `${(pos.y / CANVAS_HEIGHT) * 100}%`,
            width: `${(CARD_WIDTH / CANVAS_WIDTH) * 100}%`,
            height: `${(CARD_HEIGHT / CANVAS_HEIGHT) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
