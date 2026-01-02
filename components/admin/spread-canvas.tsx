'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SpreadPosition {
  id?: number;
  positionIndex: string;
  name: string;
  description: string;
  x: number;
  y: number;
}

interface SpreadCanvasProps {
  positions: SpreadPosition[];
  onPositionChange: (index: number, x: number, y: number) => void;
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  className?: string;
}

export function SpreadCanvas({ 
  positions, 
  onPositionChange, 
  selectedIndex,
  onSelect,
  className 
}: SpreadCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const CANVAS_WIDTH = 100;
  const CANVAS_HEIGHT = 100; // 物理高度增加到 100，为锚点最大 80 留出空间
  const MAX_ANCHOR_Y = 80;
  const CARD_WIDTH = 13.814;
  const CARD_HEIGHT = 23.824;

  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingIndex(index);
    onSelect?.(index);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingIndex === null || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      const rawY = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

      // Clamp values within canvas boundaries
      const x = Math.max(0, Math.min(CANVAS_WIDTH, Math.round(rawX)));
      const y = Math.max(0, Math.min(MAX_ANCHOR_Y, Math.round(rawY)));

      onPositionChange(draggingIndex, x, y);
    };

    const handleMouseUp = () => {
      setDraggingIndex(null);
    };

    if (draggingIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingIndex, onPositionChange]);

  const sortedPositions = [...positions].sort((a, b) => 
    parseInt(a.positionIndex) - parseInt(b.positionIndex)
  );

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative aspect-[100/100] bg-zinc-50 border border-black/[0.04] rounded-lg overflow-hidden cursor-crosshair",
        className
      )}
      style={{
        backgroundImage: 'radial-gradient(circle, #00000008 1px, transparent 1px)',
        backgroundSize: '5% 5%', // 20x20 网格，每格 5 个单位
      }}
    >
      {/* SVG Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#00000015" />
          </marker>
        </defs>
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
               strokeDasharray="4 2"
               markerEnd="url(#arrowhead)"
             />
           );
         })}
      </svg>

      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-black" style={{ left: `${i * 10}%` }} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-black" style={{ top: `${(i * 10 / 80) * 100}%` }} />
        ))}
      </div>

      {positions.map((pos, index) => (
        <div
          key={index}
          onMouseDown={handleMouseDown(index)}
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 bg-white border shadow-sm rounded flex flex-col items-center justify-center cursor-move transition-all hover:shadow-md select-none",
            draggingIndex === index ? "border-black ring-2 ring-black/5 z-20 scale-105" : 
            selectedIndex === index ? "border-black z-10 scale-105 ring-1 ring-black/10" : "border-black/20"
          )}
          style={{
            left: `${(pos.x / CANVAS_WIDTH) * 100}%`,
            top: `${(pos.y / CANVAS_HEIGHT) * 100}%`,
            width: `${(CARD_WIDTH / CANVAS_WIDTH) * 100}%`,
            height: `${(CARD_HEIGHT / CANVAS_HEIGHT) * 100}%`,
          }}
        >
          <div className={cn(
            "absolute inset-0 rounded bg-black/[0.02] opacity-0 transition-opacity",
            selectedIndex === index && "opacity-100"
          )} />
          <span className={cn(
            "text-[10px] font-medium mb-0.5 transition-colors",
            selectedIndex === index ? "text-black" : "text-black/40"
          )}>{pos.positionIndex}</span>
          <span className={cn(
            "text-[9px] font-bold truncate w-full px-1 text-center transition-colors",
            selectedIndex === index ? "text-black" : "text-black/60"
          )}>
            {pos.name || `#${index + 1}`}
          </span>
          
          {/* Coordinate indicator */}
          <div className={cn(
            "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] whitespace-nowrap transition-opacity",
            selectedIndex === index || draggingIndex === index ? "text-black/60 opacity-100" : "text-black/30 opacity-0"
          )}>
            {pos.x}, {pos.y}
          </div>
        </div>
      ))}

      {positions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-black/20 text-sm font-light italic">
          No positions added yet. Click &quot;Add&quot; to start.
        </div>
      )}
    </div>
  );
}
