"use client"

import { useState, useCallback, useRef, useEffect } from 'react'

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
  const stateRef = useRef({ currentLineIndex: 0, currentPosition: 0, inkColor: 'black' as InkColor })

  useEffect(() => {
    stateRef.current = { currentLineIndex, currentPosition, inkColor }
  }, [currentLineIndex, currentPosition, inkColor])

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
    }, 300)
  }, [currentLineIndex, inkColor, isCarriageReturning])

  const injectCharacter = useCallback((char: string) => {
    if (char.length !== 1) return
    setPressedKey(char === ' ' ? ' ' : char)
    setTimeout(() => setPressedKey(null), 120)

    const { currentLineIndex: lineIdx, currentPosition: pos, inkColor: ink } = stateRef.current
    if (pos >= CHARS_PER_LINE) return

    if (char === ' ') {
      setLines(prev => {
        const next = [...prev]
        const line = next[lineIdx]
        next[lineIdx] = { ...line, content: line.content + ' ' }
        return next
      })
      setCurrentPosition(p => p + 1)
      return
    }

    setLines(prev => {
      const next = [...prev]
      const line = next[lineIdx]
      next[lineIdx] = { ...line, content: line.content + char, color: ink }
      return next
    })
    setCurrentPosition(p => p + 1)
  }, [])

  const waitCarriageReturn = useCallback(async () => {
    return new Promise<void>((resolve) => {
      carriageReturn()
      setTimeout(resolve, 450)
    })
  }, [carriageReturn])

  const injectCharacterWithWrap = useCallback(
    async (char: string) => {
      let guard = 0
      while (stateRef.current.currentPosition >= CHARS_PER_LINE && guard < 8) {
        guard += 1
        await waitCarriageReturn()
        await new Promise((r) => setTimeout(r, 50))
      }
      injectCharacter(char)
    },
    [injectCharacter, waitCarriageReturn]
  )

  const scrollToCurrentLine = useCallback(() => {
    const el = paperRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

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
    injectCharacter,
    injectCharacterWithWrap,
    waitCarriageReturn,
    scrollToCurrentLine,
    takeSnapshot,
    changeInkColor,
    CHARS_PER_LINE,
    CHAR_WIDTH
  }
}
