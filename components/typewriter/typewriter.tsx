"use client"

import {
  useEffect,
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Paper } from './paper'
import { TypewriterKeyboard } from './typewriter-keyboard'
import { InkRibbon } from './ink-ribbon'
import { AtmosphereLayer } from './atmosphere-layer'
import { useTypewriter } from '@/hooks/use-typewriter'
import { playKeyClick, playCarriageReturn } from '@/src/utils/sounds'
import type { Snapshot } from '@/hooks/use-typewriter'

export type GirlfriendSentencePack = {
  en: string
  hi: string
  es: string
  ja: string
}

export type TypewriterRef = {
  startGirlfriendFlow: () => void
}

const GIRLFRIEND_SENTENCES: GirlfriendSentencePack[] = [
  {
    en: "The stars didn't align for you, you became one. Every step, every storm, every sunrise brought the world someone rare. Happy Birthday. Always keep shining — let no one dim your light.",
    hi: "तुम्हारे लिए सितारे नहीं मिले—तुम खुद एक सितारा बन गए। हर कदम, हर तूफ़ान, हर सूर्योदय ने दुनिया को कोई बेहद दुर्लभ इंसान दिया। जन्मदिन मुबारक हो। हमेशा चमकते रहो—किसी को भी तुम्हारी रोशनी कम न करने देना।",
    es: "Las estrellas no se alinearon para ti: tú te convertiste en una. Cada paso, cada tormenta, cada amanecer le trajo al mundo a alguien raro. Feliz cumpleaños. Sigue brillando siempre: no dejes que nadie apague tu luz.",
    ja: "君のために星が並んだんじゃない。君が星になったんだ。どんな一歩も、嵐も、朝日も、世界に稀な存在を連れてきた。お誕生日おめでとう。これからもずっと輝いていて——誰にもその光を消させないで。",
  },
  {
    en: "A mind that moves mountains, a heart that stays soft. The rarest of rare — to know so much, and still bow to wonder.",
    hi: "ऐसा दिमाग जो पहाड़ हिला दे, और ऐसा दिल जो नरम ही रहे। सबसे दुर्लभ बात यही है—इतना जानकर भी, हैरानी और आश्चर्य के आगे झुक जाना।",
    es: "Una mente que mueve montañas, un corazón que se mantiene suave. Lo más raro entre lo raro: saber tanto y aun así inclinarse ante el asombro.",
    ja: "山を動かすほどの知性、柔らかいままの心。いちばん稀なのは——たくさん知っていながら、なお驚きに頭を下げられること。",
  },
  {
    en: "Not everyone is born to light rooms they walk into. You don't even know you do it. That's what makes you extraordinary and the most precious.",
    hi: "हर कोई जिस कमरे में जाए उसे रोशन करने के लिए पैदा नहीं होता। तुम्हें तो पता भी नहीं चलता कि तुम यह कर देते हो। यही बात तुम्हें असाधारण और सबसे कीमती बनाती है।",
    es: "No todos nacen para iluminar las habitaciones en las que entran. Ni siquiera te das cuenta de que lo haces. Eso es lo que te hace extraordinario y lo más valioso.",
    ja: "入った部屋を明るくしてしまう人は、誰もがそうじゃない。君はそれに気づいてさえいない。それが君を特別で、いちばん大切な存在にしている。",
  },
  {
    en: "In a world full of people trying to be seen, you make others feel seen. That is the rarest gift of all.",
    hi: "एक ऐसी दुनिया में जहाँ हर कोई दिखना चाहता है, तुम दूसरों को महसूस कराते हो कि वे दिखते हैं। यही सबसे दुर्लभ तोहफ़ा है।",
    es: "En un mundo lleno de gente que intenta ser vista, tú haces que los demás se sientan vistos. Ese es el regalo más raro de todos.",
    ja: "見られたい人であふれる世界で、君は誰かに「見てもらえた」と感じさせる。それは何よりも稀な贈り物だ。",
  },
]

function splitTypingLines(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w
    if (candidate.length <= maxLen) {
      cur = candidate
    } else {
      if (cur) lines.push(cur)
      if (w.length > maxLen) {
        let rest = w
        while (rest.length > maxLen) {
          lines.push(rest.slice(0, maxLen))
          rest = rest.slice(maxLen)
        }
        cur = rest
      } else {
        cur = w
      }
    }
  }
  if (cur) lines.push(cur)
  return lines
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

interface TypewriterProps {
  onSnapshot?: (snapshot: Snapshot) => void
  onWord?: (word: string) => void
  isArriving?: boolean
  paperOpen?: boolean
  onGirlfriendSticky?: (pack: GirlfriendSentencePack | null) => void
  onGirlfriendLine?: (line: string) => void
  onGirlfriendTyping?: (typing: boolean) => void
  onKeyHit?: (key: string) => void
  onGirlfriendComplete?: () => void
  smokeAnimationPath?: string
  dustAnimationPath?: string
  smokeAnimationData?: Record<string, unknown>
  dustAnimationData?: Record<string, unknown>
  className?: string
}

const WAKE_KEYS = 'abcdefghijklmnopqrstuvwxyz'.split('')

export const Typewriter = forwardRef<TypewriterRef, TypewriterProps>(function Typewriter(
  {
    onSnapshot,
    onWord,
    isArriving = false,
    paperOpen = false,
    onGirlfriendSticky,
    onGirlfriendLine,
    onGirlfriendTyping,
    onKeyHit,
    onGirlfriendComplete,
    smokeAnimationPath,
    dustAnimationPath,
    smokeAnimationData,
    dustAnimationData,
    className,
  },
  ref
) {
  const {
    lines,
    currentLineIndex,
    currentPosition,
    inkColor,
    pressedKey,
    paperRef,
    handleKeyDown,
    carriageReturn,
    injectCharacterWithWrap,
    waitCarriageReturn,
    scrollToCurrentLine,
    takeSnapshot,
    changeInkColor,
    CHARS_PER_LINE,
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

  const [isAutoTyping, setIsAutoTyping] = useState(false)
  const [, setCurrentSentenceIndex] = useState(0)
  const autoTypeRef = useRef(false)
  const girlfriendStartedRef = useRef(false)

  const stickyCbRef = useRef(onGirlfriendSticky)
  const lineCbRef = useRef(onGirlfriendLine)
  const typingCbRef = useRef(onGirlfriendTyping)
  const keyHitCbRef = useRef(onKeyHit)
  const girlfriendCompleteCbRef = useRef(onGirlfriendComplete)
  stickyCbRef.current = onGirlfriendSticky
  lineCbRef.current = onGirlfriendLine
  typingCbRef.current = onGirlfriendTyping
  keyHitCbRef.current = onKeyHit
  girlfriendCompleteCbRef.current = onGirlfriendComplete

  useEffect(() => {
    if (paperOpen) return
    autoTypeRef.current = true
    girlfriendStartedRef.current = false
    setIsAutoTyping(false)
    typingCbRef.current?.(false)
  }, [paperOpen])

  useEffect(() => {
    return () => {
      autoTypeRef.current = true
    }
  }, [])

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

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        keyHitCbRef.current?.(e.key)
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

  const handleContainerClick = useCallback(() => {
    containerRef.current?.focus({ preventScroll: true })
    scrollToCurrentLine()
  }, [scrollToCurrentLine])

  const handleTakeSnapshot = useCallback(() => {
    const snapshot = takeSnapshot()
    onSnapshot?.(snapshot)
  }, [takeSnapshot, onSnapshot])

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

  const runAutoTyping = useCallback(async () => {
    const typeSentence = async (sentence: GirlfriendSentencePack, index: number) => {
      if (autoTypeRef.current) return

      const chunks = splitTypingLines(sentence.en, CHARS_PER_LINE)
      for (let ci = 0; ci < chunks.length; ci++) {
        const chunk = chunks[ci]
        for (let i = 0; i < chunk.length; i++) {
          if (autoTypeRef.current) return
          const char = chunk[i]
          if (soundEnabledRef.current) playKeyClick()
          keyHitCbRef.current?.(char)
          await injectCharacterWithWrap(char)
          const speed = 80 + Math.random() * 60
          await delay(speed)
        }
        if (ci < chunks.length - 1) {
          if (autoTypeRef.current) return
          if (soundEnabledRef.current) playCarriageReturn()
          await waitCarriageReturn()
          await delay(100)
        }
      }

      await delay(400)
      if (autoTypeRef.current) return
      if (soundEnabledRef.current) playCarriageReturn()
      await waitCarriageReturn()

      stickyCbRef.current?.(sentence)
      lineCbRef.current?.(sentence.en)

      await delay(3000)
      stickyCbRef.current?.(null)

      await delay(800)

      if (autoTypeRef.current) return
      if (index < GIRLFRIEND_SENTENCES.length - 1) {
        setCurrentSentenceIndex(index + 1)
        await typeSentence(GIRLFRIEND_SENTENCES[index + 1], index + 1)
      } else {
        setIsAutoTyping(false)
        typingCbRef.current?.(false)
        girlfriendCompleteCbRef.current?.()
      }
    }

    await typeSentence(GIRLFRIEND_SENTENCES[0], 0)
  }, [
    CHARS_PER_LINE,
    injectCharacterWithWrap,
    waitCarriageReturn,
  ])

  useImperativeHandle(ref, () => ({
    startGirlfriendFlow: () => {
      if (girlfriendStartedRef.current) return
      girlfriendStartedRef.current = true
      autoTypeRef.current = false
      setCurrentSentenceIndex(0)
      setIsAutoTyping(true)
      typingCbRef.current?.(true)
      setTimeout(() => {
        void runAutoTyping()
      }, 1000)
    },
  }), [runAutoTyping])

  const displayedKey = wakeKey ?? pressedKey

  const inner = (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={handleContainerClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        'relative mx-auto min-h-0 w-full max-w-3xl outline-none',
        'focus:ring-0',
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
        <AtmosphereLayer
          smokeAnimationPath={smokeAnimationPath}
          dustAnimationPath={dustAnimationPath}
          smokeAnimationData={smokeAnimationData}
          dustAnimationData={dustAnimationData}
        />

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

        <div
          className="relative"
          style={{
            transform: 'perspective(800px) rotateX(8deg)',
            transformOrigin: 'center bottom',
            zIndex: 1,
          }}
        >
          <div 
            className="relative mx-auto mb-[-20px] z-10"
            style={{
              width: '68%',
              maxWidth: '400px',
            }}
          >
            <div 
              className="relative overflow-hidden rough-paper"
              style={{
                background: '#f0e8d0',
                boxShadow:
                  '0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.4), 0 0 120px rgba(240,232,208,0.06)',
                minHeight: '200px',
                height: '260px',
              }}
            >
              <Paper
                ref={paperRef}
                lines={lines}
                currentLineIndex={currentLineIndex}
                currentPosition={currentPosition}
              />

              {amberFlash && (
                <div
                  className="absolute inset-0 pointer-events-none amber-flash rounded-sm"
                  style={{ background: 'rgba(200,144,42,0.06)', zIndex: 5 }}
                />
              )}
            </div>
          </div>
          
          <div className="relative">
            <TypewriterKeyboard pressedKey={displayedKey} />
          
            {!isFocused && !isAutoTyping && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl z-10" style={{ background: 'rgba(8,8,15,0.6)', backdropFilter: 'blur(2px)' }}>
                <p className="text-sm px-4 py-2 rounded-full" style={{ color: '#a09070', background: 'rgba(8,8,15,0.8)' }}>
                  Click to start typing
                </p>
              </div>
            )}
          </div>

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

      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">
          Press Enter for a new line. Watch the keys as you type.
        </p>
      </div>
    </div>
  )

  return (
    <motion.div
      className="min-h-0"
      initial={isArriving ? { opacity: 0, filter: 'brightness(0)' } : false}
      animate={{ opacity: 1, filter: 'brightness(1)' }}
      transition={{ duration: 1.8, ease: 'easeOut' }}
    >
      {inner}
    </motion.div>
  )
})
