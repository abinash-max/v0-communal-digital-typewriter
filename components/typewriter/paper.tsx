"use client"

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { TypewriterLine } from '@/hooks/use-typewriter'

interface PaperProps {
  lines: TypewriterLine[]
  currentLineIndex: number
  currentPosition: number
  className?: string
}

const Paper = forwardRef<HTMLDivElement, PaperProps>(
  ({ lines, currentLineIndex, currentPosition, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-[500px] overflow-y-auto hide-scrollbar",
          "bg-paper rounded-sm",
          className
        )}
        style={{
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.03)'
        }}
      >
        {/* Paper texture overlay */}
        <div className="absolute inset-0 paper-texture pointer-events-none opacity-50" />
        
        {/* Paper content */}
        <div className="relative p-8 pt-12">
          {/* Typed lines */}
          {lines.map((line, index) => (
            <div
              key={line.id}
              className="relative h-6 leading-6"
            >
              <span
                className={cn(
                  "typewriter-text text-[15px] whitespace-pre",
                  line.color === 'black' ? 'text-ink-black' : 'text-ink-red'
                )}
              >
                {line.content}
              </span>
              
              {/* Cursor on current line */}
              {index === currentLineIndex && (
                <span
                  className="absolute top-0 h-5 w-[2px] bg-ink-black animate-pulse"
                  style={{
                    left: `${currentPosition * 9.6}px`,
                    animationDuration: '1s'
                  }}
                />
              )}
            </div>
          ))}
          
          {/* Extra space at bottom for scrolling */}
          <div className="h-64" />
        </div>

        {/* Paper edge shadow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(245,243,237,1), transparent)'
          }}
        />
      </div>
    )
  }
)

Paper.displayName = 'Paper'

export { Paper }
