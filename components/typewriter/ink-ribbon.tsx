"use client"

import { cn } from '@/lib/utils'
import type { InkColor } from '@/hooks/use-typewriter'

interface InkRibbonProps {
  currentColor: InkColor
  onColorChange: (color: InkColor) => void
  className?: string
}

export function InkRibbon({ currentColor, onColorChange, className }: InkRibbonProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        ink ribbon:
      </span>
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onColorChange('black')}
          className={cn(
            "w-5 h-5 rounded-full border-2 transition-all",
            "bg-ink-black hover:scale-110",
            currentColor === 'black' 
              ? "border-foreground ring-2 ring-foreground/20" 
              : "border-transparent opacity-60 hover:opacity-100"
          )}
          aria-label="Black ink"
        />
        
        <button
          type="button"
          onClick={() => onColorChange('red')}
          className={cn(
            "w-5 h-5 rounded-full border-2 transition-all",
            "bg-ink-red hover:scale-110",
            currentColor === 'red' 
              ? "border-foreground ring-2 ring-foreground/20" 
              : "border-transparent opacity-60 hover:opacity-100"
          )}
          aria-label="Red ink"
        />
      </div>
    </div>
  )
}
