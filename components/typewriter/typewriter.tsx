"use client"

import { useEffect, useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Paper } from './paper'
import { TypewriterKeyboard } from './typewriter-keyboard'
import { InkRibbon } from './ink-ribbon'
import { AtmosphereLayer } from './atmosphere-layer'
import { useTypewriter } from '@/hooks/use-typewriter'
import { playKeyClick, playCarriageReturn } from '@/src/utils/sounds'
import type { Snapshot } from '@/hooks/use-typewriter'

interface TypewriterProps {
  onSnapshot?: (snapshot: Snapshot) => void
  onWord?: (word: string) => void
  isArriving?: boolean
  smokeAnimationPath?: string
  dustAnimationPath?: string
  smokeAnimationData?: Record<string, unknown>
  dustAnimationData?: Record<string, unknown>
  className?: string
}

const WAKE_KEYS = 'abcdefghijklmnopqrstuvwxyz'.split('')

export function Typewriter({
  onSnapshot,
  onWord,
  isArriving = false,
  smokeAnimationPath,
  dustAnimationPath,
  smokeAnimationData,
  dustAnimationData,
  className,
}: TypewriterProps) {
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
  const [amberFlash, setAmberFlash] = useState(false)
  const flashKeyRef = useRef(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const soundEnabledRef = useRef(true)
  const onWordRef = useRef(onWord)
  onWordRef.current = onWord
  const currentWordRef = useRef('')
  const [wakeKey, setWakeKey] = useState<string | null>(null)

  useEffect(() => {
    if (!isArriving) return
    const timer = setTimeout(() => {
      const key = WAKE_KEYS[Math.floor(Math.random() * WAKE_KEYS.length)]
      setWakeKey(key)
      setTimeout(() => setWakeKey(null), 120)
    }, 2000)
    return () => clearTimeout(timer)
  }, [isArriving])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('typewriter-sound')
      if (stored !== null) {
        const val = stored === 'true'
        setSoundEnabled(val)
        soundEnabledRef.current = val
      }
    } catch {}
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev
      soundEnabledRef.current = next
      try { localStorage.setItem('typewriter-sound', String(next)) } catch {}
      return next
    })
  }, [])

  // Focus handling for keyboard input + sound + word detection via currentWordRef
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const flushWord = () => {
      const word = currentWordRef.current
      currentWordRef.current = ''
      if (word.length >= 2) onWordRef.current?.(word)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (soundEnabledRef.current && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        playKeyClick()
      }

      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        currentWordRef.current += e.key
      } else if (e.key === ' ') {
        flushWord()
      } else if (e.key === 'Backspace') {
        currentWordRef.current = currentWordRef.current.slice(0, -1)
      }

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

  // Amber flash on paper when a key is struck
  useEffect(() => {
    if (pressedKey === null) return
    flashKeyRef.current += 1
    setAmberFlash(true)
    const id = flashKeyRef.current
    const timer = setTimeout(() => {
      if (flashKeyRef.current === id) setAmberFlash(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [pressedKey])

  // Handle Enter key for carriage return + sound + word detection
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const word = currentWordRef.current
        currentWordRef.current = ''
        if (word.length >= 2) onWordRef.current?.(word)
        if (soundEnabledRef.current) playCarriageReturn()
        carriageReturn()
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => container.removeEventListener('keydown', onKeyDown)
  }, [carriageReturn])

  const displayedKey = wakeKey ?? pressedKey

  const inner = (
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
      <div className="flex items-center justify-between mb-2 px-2">
        <InkRibbon 
          currentColor={inkColor} 
          onColorChange={changeInkColor} 
        />

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleSound}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            title={soundEnabled ? 'Sound on' : 'Sound off'}
          >
            {soundEnabled ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

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
      </div>

      {/* 3D typewriter assembly with perspective */}
      <div className="relative">
        {/* Atmospheric Lottie overlays */}
        <AtmosphereLayer
          smokeAnimationPath={smokeAnimationPath}
          dustAnimationPath={dustAnimationPath}
          smokeAnimationData={smokeAnimationData}
          dustAnimationData={dustAnimationData}
        />

        {/* Warm glow behind the typewriter */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '700px',
            height: '300px',
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(ellipse, rgba(200,144,42,0.12) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />

        {/* Perspective wrapper */}
        <div
          className="relative"
          style={{
            transform: 'perspective(800px) rotateX(8deg)',
            transformOrigin: 'center bottom',
            zIndex: 1,
          }}
        >
          {/* Paper sheet — warm paper glowing in the dark */}
          <div 
            className="relative mx-auto mb-[-20px] z-10"
            style={{
              width: '68%',
              maxWidth: '400px',
            }}
          >
            <div 
              className="relative rough-paper"
              style={{
                background: '#f0e8d0',
                boxShadow:
                  '0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.4), 0 0 120px rgba(240,232,208,0.06)',
                minHeight: '200px',
              }}
            >
              <Paper
                ref={paperRef}
                lines={lines}
                currentLineIndex={currentLineIndex}
                currentPosition={currentPosition}
              />

              {/* Amber flash overlay on keystrike */}
              {amberFlash && (
                <div
                  className="absolute inset-0 pointer-events-none amber-flash rounded-sm"
                  style={{ background: 'rgba(200,144,42,0.06)', zIndex: 5 }}
                />
              )}
            </div>
          </div>
          
          {/* Visual typewriter keyboard */}
          <div className="relative">
            <TypewriterKeyboard pressedKey={displayedKey} />
          
            {!isFocused && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl z-10" style={{ background: 'rgba(8,8,15,0.6)', backdropFilter: 'blur(2px)' }}>
                <p className="text-sm px-4 py-2 rounded-full" style={{ color: '#a09070', background: 'rgba(8,8,15,0.8)' }}>
                  Click to start typing
                </p>
              </div>
            )}
          </div>

          {/* Desk surface below typewriter */}
          <div
            style={{
              width: '100%',
              height: '40px',
              background: 'linear-gradient(180deg, #2c1810 0%, #1a0f08 100%)',
              borderRadius: '0 0 4px 4px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200,144,42,0.08)',
            }}
          />
        </div>
      </div>

      {/* Hint text */}
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">
          Press Enter for a new line. Watch the keys as you type.
        </p>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={isArriving ? { opacity: 0, filter: 'brightness(0)' } : false}
      animate={{ opacity: 1, filter: 'brightness(1)' }}
      transition={{ duration: 1.8, ease: 'easeOut' }}
    >
      {inner}
    </motion.div>
  )
}
