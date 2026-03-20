"use client"

import { useEffect, useCallback, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { Paper } from './paper'
import { TypewriterKeyboard } from './typewriter-keyboard'
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
    inkColor,
    isCarriageReturning,
    pressedKey,
    paperRef,
    handleKeyDown,
    carriageReturn,
    scrollToCurrentLine,
    takeSnapshot,
    changeInkColor,
  } = useTypewriter()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Focus handling for keyboard input
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

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

  // Handle Enter key for carriage return
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        carriageReturn()
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => container.removeEventListener('keydown', onKeyDown)
  }, [carriageReturn])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={handleContainerClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative w-full max-w-3xl mx-auto outline-none",
        "focus:ring-0",
        className
      )}
    >
      {/* Controls bar */}
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

      {/* Paper area - inserted into typewriter roller */}
      <div className="relative">
        {/* Paper sheet - positioned to look like it's coming out of the typewriter */}
        <div 
          className="relative mx-auto mb-[-20px] z-10"
          style={{
            width: '85%',
            maxWidth: '480px',
          }}
        >
          {/* Paper with rough edges */}
          <div 
            className="relative bg-white rough-paper"
            style={{
              boxShadow: '2px 4px 12px rgba(0,0,0,0.1), -1px 2px 8px rgba(0,0,0,0.05)',
              minHeight: '200px',
            }}
          >
            {/* Hand-drawn paper border effect */}
            <svg 
              className="absolute inset-0 w-full h-full text-gray-300 pointer-events-none"
              preserveAspectRatio="none"
              style={{ filter: 'url(#sketchy)' }}
            >
              <rect 
                x="1" y="1" 
                width="calc(100% - 2px)" 
                height="calc(100% - 2px)" 
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
            
            <Paper
              ref={paperRef}
              lines={lines}
              currentLineIndex={currentLineIndex}
              currentPosition={currentPosition}
            />
          </div>
        </div>
        
        {/* Visual typewriter keyboard */}
        <div className="relative">
          <TypewriterKeyboard pressedKey={pressedKey} />
        
        {/* Focus hint overlay */}
          {!isFocused && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl z-10">
              <p className="text-sm text-muted-foreground bg-background/80 px-4 py-2 rounded-full shadow-sm">
                Click to start typing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hint text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Press Enter for a new line. Watch the keys as you type.
        </p>
      </div>
    </div>
  )
}
