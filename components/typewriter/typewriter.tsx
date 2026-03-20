"use client"

import { useEffect, useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Paper } from './paper'
import { Carriage } from './carriage'
import { InkRibbon } from './ink-ribbon'
import { useTypewriter } from '@/hooks/use-typewriter'
import type { Snapshot } from '@/hooks/use-typewriter'

interface TypewriterProps {
  onSnapshot?: (snapshot: Snapshot) => void
  className?: string
}

export function Typewriter({ onSnapshot, className }: TypewriterProps) {
  const {
    lines,
    currentLineIndex,
    currentPosition,
    carriageOffset,
    inkColor,
    isCarriageReturning,
    paperRef,
    handleKeyDown,
    carriageReturn,
    scrollToCurrentLine,
    takeSnapshot,
    changeInkColor,
    CHARS_PER_LINE,
    CHAR_WIDTH
  } = useTypewriter()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Focus handling for keyboard input
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Make container focusable
    container.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      handleKeyDown(e)
    }

    container.addEventListener('keydown', onKeyDown)
    
    return () => {
      container.removeEventListener('keydown', onKeyDown)
    }
  }, [handleKeyDown])

  // Click to focus
  const handleContainerClick = useCallback(() => {
    containerRef.current?.focus()
    scrollToCurrentLine()
  }, [scrollToCurrentLine])

  // Take snapshot handler
  const handleTakeSnapshot = useCallback(() => {
    const snapshot = takeSnapshot()
    onSnapshot?.(snapshot)
  }, [takeSnapshot, onSnapshot])

  const maxCarriageOffset = CHARS_PER_LINE * CHAR_WIDTH

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={handleContainerClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative w-full max-w-2xl mx-auto outline-none",
        "focus:ring-0",
        className
      )}
    >
      {/* Typewriter frame */}
      <div className="relative">
        {/* Top controls bar */}
        <div className="flex items-center justify-between mb-4 px-2">
          <InkRibbon 
            currentColor={inkColor} 
            onColorChange={changeInkColor} 
          />
          
          <button
            type="button"
            onClick={handleTakeSnapshot}
            className={cn(
              "text-xs uppercase tracking-wider text-muted-foreground",
              "hover:text-foreground transition-colors",
              "border-b border-dashed border-muted-foreground/50 hover:border-foreground/50",
              "pb-0.5"
            )}
          >
            take a snapshot
          </button>
        </div>

        {/* Carriage mechanism */}
        <div className="mb-2">
          <Carriage
            offset={carriageOffset}
            maxOffset={maxCarriageOffset}
            isReturning={isCarriageReturning}
            onCarriageReturn={carriageReturn}
          />
        </div>

        {/* Paper area */}
        <div 
          className="relative border border-paper-shadow/50 rounded-sm overflow-hidden"
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <Paper
            ref={paperRef}
            lines={lines}
            currentLineIndex={currentLineIndex}
            currentPosition={currentPosition}
          />
        </div>

        {/* Focus hint */}
        {!isFocused && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-sm">
            <p className="text-sm text-muted-foreground">
              Click to start typing
            </p>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Use your keyboard to type. Drag the carriage handle left to start a new line.
        </p>
      </div>
    </div>
  )
}
