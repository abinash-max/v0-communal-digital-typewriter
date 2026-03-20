"use client"

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CarriageProps {
  offset: number
  maxOffset: number
  isReturning: boolean
  onCarriageReturn: () => void
  className?: string
}

export function Carriage({
  offset,
  maxOffset,
  isReturning,
  onCarriageReturn,
  className
}: CarriageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const carriageRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startOffset = useRef(0)

  const currentOffset = isReturning ? 0 : offset + dragOffset

  // Show return indicator when near end of line
  const showReturnIndicator = offset > maxOffset * 0.85 && !isDragging && !isReturning

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startX.current = e.clientX
    startOffset.current = offset
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    startX.current = e.touches[0].clientX
    startOffset.current = offset
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (clientX: number) => {
      const deltaX = clientX - startX.current
      // Only allow dragging left (negative direction)
      if (deltaX < 0) {
        setDragOffset(deltaX)
      }
    }

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX)

    const handleEnd = () => {
      setIsDragging(false)
      // If dragged far enough left, trigger carriage return
      if (dragOffset < -100) {
        onCarriageReturn()
      }
      setDragOffset(0)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, dragOffset, onCarriageReturn])

  return (
    <div className={cn("relative h-12 w-full overflow-hidden", className)}>
      {/* Carriage track */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-typewriter-metal/30 rounded-full" />
      
      {/* Carriage handle */}
      <div
        ref={carriageRef}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing",
          "transition-transform duration-75",
          isReturning && "transition-transform duration-300 ease-out"
        )}
        style={{
          transform: `translateX(${currentOffset}px) translateY(-50%)`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Carriage lever */}
        <div className="relative flex items-center gap-2">
          {/* Return lever handle */}
          <div 
            className={cn(
              "w-8 h-8 rounded-full bg-typewriter-body border-2 border-typewriter-metal",
              "shadow-md hover:shadow-lg transition-shadow",
              "flex items-center justify-center"
            )}
          >
            <div className="w-4 h-1 bg-typewriter-metal rounded-full" />
          </div>
          
          {/* Carriage bar */}
          <div className="w-4 h-2 bg-typewriter-metal rounded-sm" />
        </div>

        {/* Return hint tooltip */}
        {showReturnIndicator && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded shadow-sm">
              drag left to return
            </span>
          </div>
        )}
      </div>

      {/* Bell indicator - shows when approaching line end */}
      {offset > maxOffset * 0.9 && !isReturning && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
        </div>
      )}
    </div>
  )
}
