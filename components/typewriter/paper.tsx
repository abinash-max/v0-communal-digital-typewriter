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

const CHAR_WIDTH = 10.0

const Paper = forwardRef<HTMLDivElement, PaperProps>(
  ({ lines, currentLineIndex, currentPosition, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-[260px] overflow-y-auto hide-scrollbar",
          "rounded-sm paper-ruled-lines paper-margin-line paper-noise",
          className
        )}
        style={{
          background: '#f0e8d0',
          boxShadow:
            '0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.4), inset 0 0 60px rgba(0,0,0,0.03)',
        }}
      >
        {/* Paper content — left padding clears the margin line */}
        <div className="relative pt-[28px]" style={{ paddingLeft: '72px', paddingRight: '24px' }}>
          {lines.map((line, index) => (
            <div
              key={line.id}
              className="relative"
              style={{ height: '28px', lineHeight: '28px' }}
            >
              <span
                className="typewriter-text whitespace-pre"
                style={{
                  fontSize: '16px',
                  color: line.color === 'black' ? '#1a0f08' : '#a03020',
                }}
              >
                {line.content}
              </span>

              {index === currentLineIndex && (
                <span
                  className="absolute top-[4px] w-[2px] animate-pulse"
                  style={{
                    height: '20px',
                    left: `${currentPosition * CHAR_WIDTH}px`,
                    animationDuration: '1s',
                    background: '#c8902a',
                  }}
                />
              )}
            </div>
          ))}

          <div className="h-64" />
        </div>

        {/* Bottom fade to paper color */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #f0e8d0, transparent)',
            zIndex: 3,
          }}
        />
      </div>
    )
  }
)

Paper.displayName = 'Paper'

export { Paper }
