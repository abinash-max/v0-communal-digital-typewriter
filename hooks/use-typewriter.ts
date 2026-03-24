"use client"

import { useState, useCallback, useRef } from 'react'

export type InkColor = 'black' | 'red'

export interface TypewriterLine {
  id: string
  content: string
  color: InkColor
}

export interface TypewriterState {
  lines: TypewriterLine[]
  currentLineIndex: number
  currentPosition: number
  carriagePosition: number
  inkColor: InkColor
}

export interface Snapshot {
  id: string
  lines: TypewriterLine[]
  timestamp: Date
}

const CHARS_PER_LINE = 38
const CHAR_WIDTH = 10.0 // pixels per character at 16px JetBrains Mono

export function useTypewriter() {
  const [lines, setLines] = useState<TypewriterLine[]>([
    { id: crypto.randomUUID(), content: '', color: 'black' }
  ])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [inkColor, setInkColor] = useState<InkColor>('black')
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [isCarriageReturning, setIsCarriageReturning] = useState(false)
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  
  const paperRef = useRef<HTMLDivElement>(null)
  const lineHeight = 28

  // Calculate carriage offset based on current typing position
  const carriageOffset = currentPosition * CHAR_WIDTH

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default for keys we handle
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Tab') {
      e.preventDefault()
    }

    // Show key press animation
    if (e.key.length === 1 || e.key === ' ') {
      setPressedKey(e.key)
      setTimeout(() => setPressedKey(null), 120)
    }

    if (e.key === 'Tab') {
      // Tab adds 4 spaces
      setLines(prev => {
        const newLines = [...prev]
        const currentLine = newLines[currentLineIndex]
        const spacesToAdd = Math.min(4, CHARS_PER_LINE - currentPosition)
        if (spacesToAdd > 0) {
          newLines[currentLineIndex] = {
            ...currentLine,
            content: currentLine.content + '    '.slice(0, spacesToAdd)
          }
        }
        return newLines
      })
      setCurrentPosition(prev => Math.min(prev + 4, CHARS_PER_LINE))
      return
    }

    if (e.key === 'Backspace') {
      if (currentPosition > 0) {
        setLines(prev => {
          const newLines = [...prev]
          const currentLine = newLines[currentLineIndex]
          newLines[currentLineIndex] = {
            ...currentLine,
            content: currentLine.content.slice(0, -1)
          }
          return newLines
        })
        setCurrentPosition(prev => prev - 1)
      }
      return
    }

    // Handle regular character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      // Only type if we haven't reached end of line
      if (currentPosition < CHARS_PER_LINE) {
        setLines(prev => {
          const newLines = [...prev]
          const currentLine = newLines[currentLineIndex]
          newLines[currentLineIndex] = {
            ...currentLine,
            content: currentLine.content + e.key,
            color: inkColor
          }
          return newLines
        })
        setCurrentPosition(prev => prev + 1)
      }
    }
  }, [currentLineIndex, currentPosition, inkColor])

  const carriageReturn = useCallback(() => {
    if (isCarriageReturning) return
    
    setIsCarriageReturning(true)
    
    // After animation, move to new line
    setTimeout(() => {
      setLines(prev => [
        ...prev,
        { id: crypto.randomUUID(), content: '', color: inkColor }
      ])
      setCurrentLineIndex(prev => prev + 1)
      setCurrentPosition(0)
      setIsCarriageReturning(false)
      
      // Scroll paper to show current line
      if (paperRef.current) {
        const scrollTarget = (currentLineIndex + 1) * lineHeight - 200
        paperRef.current.scrollTo({
          top: Math.max(0, scrollTarget),
          behavior: 'smooth'
        })
      }
    }, 300)
  }, [currentLineIndex, inkColor, isCarriageReturning])

  const scrollToCurrentLine = useCallback(() => {
    if (paperRef.current) {
      const scrollTarget = currentLineIndex * lineHeight - 200
      paperRef.current.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: 'smooth'
      })
    }
  }, [currentLineIndex])

  const takeSnapshot = useCallback(() => {
    const snapshot: Snapshot = {
      id: crypto.randomUUID(),
      lines: [...lines],
      timestamp: new Date()
    }
    setSnapshots(prev => [snapshot, ...prev])
    return snapshot
  }, [lines])

  const changeInkColor = useCallback((color: InkColor) => {
    setInkColor(color)
  }, [])

  return {
    lines,
    currentLineIndex,
    currentPosition,
    carriageOffset,
    inkColor,
    snapshots,
    isCarriageReturning,
    pressedKey,
    paperRef,
    handleKeyDown,
    carriageReturn,
    scrollToCurrentLine,
    takeSnapshot,
    changeInkColor,
    CHARS_PER_LINE,
    CHAR_WIDTH
  }
}
