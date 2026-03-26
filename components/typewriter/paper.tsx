"use client"

import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
  type Ref,
} from 'react'
import { cn } from '@/lib/utils'
import type { TypewriterLine } from '@/hooks/use-typewriter'

interface PaperProps {
  lines: TypewriterLine[]
  currentLineIndex: number
  currentPosition: number
  className?: string
}

const CHAR_WIDTH = 10.0

function assignRef<T>(r: Ref<T> | undefined, el: T | null) {
  if (!r) return
  if (typeof r === 'function') (r as (instance: T | null) => void)(el)
  else (r as MutableRefObject<T | null>).current = el
}

function scrollPaperToBottom(el: HTMLDivElement | null) {
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const Paper = forwardRef<HTMLDivElement, PaperProps>(
  ({ lines, currentLineIndex, currentPosition, className }, ref) => {
    const paperScrollRef = useRef<HTMLDivElement | null>(null)
    const paperContentRef = useRef<HTMLDivElement | null>(null)

    const setScrollContainerRef = useCallback(
      (el: HTMLDivElement | null) => {
        paperScrollRef.current = el
        assignRef(ref, el)
      },
      [ref]
    )

    useLayoutEffect(() => {
      const el = paperScrollRef.current
      scrollPaperToBottom(el)
      let innerRaf = 0
      const outerRaf = requestAnimationFrame(() => {
        innerRaf = requestAnimationFrame(() =>
          scrollPaperToBottom(paperScrollRef.current)
        )
      })
      return () => {
        cancelAnimationFrame(outerRaf)
        cancelAnimationFrame(innerRaf)
      }
    }, [lines, currentLineIndex, currentPosition])

    useLayoutEffect(() => {
      const outer = paperScrollRef.current
      const inner = paperContentRef.current
      if (!outer || !inner) return
      const ro = new ResizeObserver(() => {
        scrollPaperToBottom(outer)
      })
      ro.observe(inner)
      return () => ro.disconnect()
    }, [])

    return (
      <div
        ref={setScrollContainerRef}
        className={cn(
          'paper-scroll relative h-[260px] w-full shrink-0 overflow-x-hidden overflow-y-scroll box-border',
          'rounded-sm paper-ruled-lines paper-margin-line paper-noise',
          className
        )}
        style={{
          scrollBehavior: 'auto',
          background: '#f0e8d0',
          boxShadow:
            '0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.4), inset 0 0 60px rgba(0,0,0,0.03)',
        }}
      >
        <div
          ref={paperContentRef}
          className="relative z-[2] box-border max-w-full overflow-x-hidden pt-[28px] pb-6"
          style={{ paddingLeft: '72px', paddingRight: '16px' }}
        >
          {lines.map((line, index) => (
            <div
              key={line.id}
              className="relative box-border max-w-full overflow-x-hidden"
              style={{ minHeight: '28px', lineHeight: '28px' }}
            >
              <span
                className="typewriter-text typewriter-paper-line-text block"
                style={{
                  fontSize: '16px',
                  color: line.color === 'black' ? '#1a0f08' : '#a03020',
                }}
              >
                {line.content}
              </span>

              {index === currentLineIndex && (
                <span
                  data-typewriter-cursor="true"
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
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3] h-16"
          style={{
            background: 'linear-gradient(to top, #f0e8d0, transparent)',
          }}
        />
      </div>
    )
  }
)

Paper.displayName = 'Paper'

export { Paper }
