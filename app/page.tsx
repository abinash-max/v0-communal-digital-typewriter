"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { Typewriter, SnapshotStack, SnapshotGrid } from '@/components/typewriter'
import StickyNoteCloud from '@/src/components/StickyNoteCloud'
import FinalPage from '@/src/components/FinalPage'
import Starfield from '@/src/components/Starfield'
import SceneEntry from '@/src/scenes/SceneEntry'
import SceneLibrary from '@/src/scenes/SceneLibrary'
import femaleData from '@/src/assets/lottie/female.json'
import type { Snapshot } from '@/hooks/use-typewriter'

function spawnParticleBurst(container: HTMLDivElement) {
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const PARTICLE_COUNT = 30
  const colors = ['#c8902a', '#ffffff']

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const dot = document.createElement('div')
    Object.assign(dot.style, {
      position: 'fixed',
      width: '3px',
      height: '3px',
      borderRadius: '50%',
      background: colors[Math.floor(Math.random() * colors.length)],
      left: `${cx}px`,
      top: `${cy}px`,
      pointerEvents: 'none',
      zIndex: '55',
    })
    container.appendChild(dot)

    const angle = Math.random() * Math.PI * 2
    const dist = 80 + Math.random() * 200

    gsap.fromTo(
      dot,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
        duration: 0.5 + Math.random() * 0.3,
        ease: 'power2.out',
        onComplete: () => dot.remove(),
      }
    )
  }
}

const sceneTransition = { duration: 0.8 }

export default function Home() {
  const [scene, setScene] = useState<'entry' | 'library' | 'typewriter' | 'final'>('entry')

  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [showSnapshotGrid, setShowSnapshotGrid] = useState(false)
  const [wordEvent, setWordEvent] = useState({ word: '', id: 0 })
  const [wordHistory, setWordHistory] = useState<string[]>([])
  const [paperOpen, setPaperOpen] = useState(false)
  const transitioningRef = useRef(false)
  const [isArriving, setIsArriving] = useState(false)

  const typewriterAreaRef = useRef<HTMLDivElement>(null)
  const stickyCloudRef = useRef<{ collapseToCenter: () => void }>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  const handleSnapshot = useCallback((snapshot: Snapshot) => {
    setSnapshots(prev => [snapshot, ...prev])
  }, [])

  const handleWord = useCallback((word: string) => {
    setWordEvent(prev => ({ word, id: prev.id + 1 }))
    setWordHistory(prev => [...prev, word])
  }, [])

  const handleViewAllSnapshots = useCallback(() => {
    setShowSnapshotGrid(true)
  }, [])

  const handleCloseSnapshotGrid = useCallback(() => {
    setShowSnapshotGrid(false)
  }, [])

  useEffect(() => {
    if (scene !== 'typewriter') return
    setIsArriving(true)
    const timer = setTimeout(() => setIsArriving(false), 3000)
    return () => clearTimeout(timer)
  }, [scene])

  const triggerFinalTransition = useCallback(() => {
    if (transitioningRef.current) return
    transitioningRef.current = true

    stickyCloudRef.current?.collapseToCenter()

    const tl = gsap.timeline({
      onComplete: () => {
        transitioningRef.current = false
        setScene('final')
      },
    })

    if (mainContentRef.current) {
      tl.to(mainContentRef.current, {
        opacity: 0,
        scale: 0.97,
        duration: 0.7,
        ease: 'power2.in',
      }, 0.3)
    }

    tl.call(() => {
      if (particlesRef.current) spawnParticleBurst(particlesRef.current)
    }, undefined, 0.8)
  }, [])

  const handleBack = useCallback(() => {
    setScene('typewriter')
  }, [])

  useEffect(() => {
    if (scene !== 'typewriter') {
      setPaperOpen(false)
    }
  }, [scene])

  return (
    <main className="min-h-screen bg-background relative">
      <Starfield />

      {/* Particle burst container — persists across scenes */}
      <div ref={particlesRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }} />

      <AnimatePresence mode="wait">
        {/* ── Entry scene ── */}
        {scene === 'entry' && (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={sceneTransition}
          >
            <SceneEntry onEnter={() => setScene('library')} />
          </motion.div>
        )}

        {/* ── Library scene ── */}
        {scene === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={sceneTransition}
          >
            <SceneLibrary onEnter={() => setScene('typewriter')} />
          </motion.div>
        )}

        {/* ── Typewriter scene ── */}
        {scene === 'typewriter' && (
          <motion.div
            key="typewriter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={sceneTransition}
          >
            <StickyNoteCloud
              ref={stickyCloudRef}
              word={wordEvent.word}
              trigger={wordEvent.id}
              anchorRef={typewriterAreaRef}
            />

            {/* Female Lottie overlay */}
            <motion.div
              layoutId="female-lottie"
              initial={false}
              animate={
                paperOpen
                  ? {
                      top: 'calc(8% - 82px)',
                      right: 'calc(2% - 0px)',
                      left: 'auto',
                      bottom: 'auto',
                      width: 80,
                      height: 80,
                    }
                  : {
                      top: 'auto',
                      left: 'auto',
                      right: 24,
                      bottom: 24,
                      width: 120,
                      height: 'auto',
                    }
              }
              whileHover={
                !paperOpen
                  ? {
                      scale: 1.12,
                      rotate: [-2, 2, -2, 0],
                      transition: { duration: 0.4 },
                    }
                  : undefined
              }
              transition={{ type: 'spring', stiffness: 70, damping: 14 }}
              onClick={() => setPaperOpen(true)}
              className="female-lottie-wrap"
              style={{
                position: 'fixed',
                zIndex: paperOpen ? 25 : 20,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'visible',
                background: 'transparent',
                mixBlendMode: 'screen',
                filter: 'contrast(1.1)',
              }}
            >
              <Lottie
                animationData={femaleData}
                loop
                autoplay
                renderer="svg"
                style={{
                  width: '100%',
                  height: 'auto',
                  background: 'transparent',
                  mixBlendMode: 'screen',
                  filter: 'contrast(1.1)',
                }}
              />
              {!paperOpen && (
                <div className="female-speech-bubble">
                  psst... click me
                  <span className="female-speech-pointer" />
                </div>
              )}
              {!paperOpen && (
                <span className="female-hint-text">
                  click me
                </span>
              )}
            </motion.div>

            {/* Right-side lined paper box */}
            <AnimatePresence>
              {paperOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    position: 'fixed',
                    right: '2%',
                    top: '8%',
                    width: 300,
                    height: 460,
                    zIndex: 19,
                    borderRadius: 4,
                    boxShadow: '4px 4px 25px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                    backgroundColor: '#f5f0e8',
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 31px, rgba(160,140,100,0.3) 31px, rgba(160,140,100,0.3) 32px)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 44,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: 'rgba(200,80,80,0.25)',
                    }}
                  />
                  <textarea
                    placeholder="write something for Aman..."
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 52,
                      right: 12,
                      bottom: 12,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontFamily: "'Courier Prime', Courier, monospace",
                      fontSize: 14,
                      lineHeight: '32px',
                      color: '#2a1a08',
                      resize: 'none',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={mainContentRef}>
              {/* Easter egg — constellation trigger */}
              <button
                type="button"
                onClick={triggerFinalTransition}
                title="take me somewhere"
                className="fixed top-4 right-4 p-1 transition-opacity duration-500 hover:opacity-100 group"
                style={{ zIndex: 20, opacity: 0.4 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="4" y1="5" x2="14" y2="3" stroke="rgba(200,144,42,0.5)" strokeWidth="0.5" className="group-hover:stroke-[rgba(200,144,42,1)] transition-all duration-500" />
                  <line x1="14" y1="3" x2="10" y2="16" stroke="rgba(200,144,42,0.5)" strokeWidth="0.5" className="group-hover:stroke-[rgba(200,144,42,1)] transition-all duration-500" />
                  <line x1="10" y1="16" x2="4" y2="5" stroke="rgba(200,144,42,0.5)" strokeWidth="0.5" className="group-hover:stroke-[rgba(200,144,42,1)] transition-all duration-500" />
                  <circle cx="4" cy="5" r="1.5" fill="rgba(200,144,42,0.6)" className="group-hover:fill-[rgba(200,144,42,1)] transition-all duration-500" />
                  <circle cx="14" cy="3" r="1.2" fill="rgba(200,144,42,0.6)" className="group-hover:fill-[rgba(200,144,42,1)] transition-all duration-500" />
                  <circle cx="10" cy="16" r="1.8" fill="rgba(200,144,42,0.6)" className="group-hover:fill-[rgba(200,144,42,1)] transition-all duration-500" />
                </svg>
              </button>

              <div className="flex flex-col lg:flex-row min-h-screen relative" style={{ zIndex: 1 }}>
                {/* Left sidebar */}
                <aside
                  className="w-full lg:w-80 xl:w-96 p-6 lg:p-8 flex-shrink-0"
                  style={{
                    background: '#0d0d1a',
                    borderRight: '1px solid rgba(200,144,42,0.15)',
                  }}
                >
                  <div className="sticky top-8">
                    <h1 className="font-serif text-3xl lg:text-4xl mb-6 text-balance" style={{ color: '#e8d5b0' }}>
                      After You
                    </h1>

                    <div className="space-y-4 mb-8">
                      <p className="text-sm leading-relaxed" style={{ color: '#a09070' }}>
                        Type as if someone will come after you.
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: '#a09070' }}>
                        Write a line, leave a thought, or finish someone else&apos;s sentence.
                        What you type stays, waiting for the next person.
                      </p>
                      <p className="text-xs leading-relaxed pl-3" style={{ color: 'rgba(160,144,112,0.7)', borderLeft: '2px solid rgba(200,144,42,0.2)' }}>
                        Use your keyboard like a typewriter. Drag the carriage to return.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-2 h-2 rounded-full bg-green-500/70" />
                      <span className="text-xs" style={{ color: '#a09070' }}>you</span>
                    </div>

                    <SnapshotStack
                      snapshots={snapshots}
                      onViewAll={handleViewAllSnapshots}
                    />
                  </div>
                </aside>

                {/* Main content - Typewriter */}
                <div className="flex-1 flex items-start justify-center p-4 lg:p-8 pt-4 lg:pt-6">
                  {showSnapshotGrid ? (
                    <div className="w-full max-w-4xl">
                      <SnapshotGrid
                        snapshots={snapshots}
                        onClose={handleCloseSnapshotGrid}
                      />
                    </div>
                  ) : (
                    <div ref={typewriterAreaRef}>
                      <Typewriter onSnapshot={handleSnapshot} onWord={handleWord} isArriving={isArriving} />
                    </div>
                  )}
                </div>
              </div>

              <footer className="fixed bottom-4 left-1/2 -translate-x-1/2" style={{ zIndex: 1 }}>
                <p className="text-[10px]" style={{ color: 'rgba(160,144,112,0.4)' }}>
                  a communal typewriter
                </p>
              </footer>
            </div>
          </motion.div>
        )}

        {/* ── Final scene ── */}
        {scene === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={sceneTransition}
          >
            <FinalPage
              wordHistory={wordHistory}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        @keyframes femaleHintBlink {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.1; }
        }
        .female-hint-text {
          font-family: 'Courier Prime', 'Courier New', monospace;
          font-size: 10px;
          color: rgba(200,144,42,0.5);
          text-align: center;
          letter-spacing: 3px;
          animation: femaleHintBlink 2s infinite;
          margin-top: 4px;
          text-transform: lowercase;
        }
        .female-lottie-wrap .female-speech-bubble {
          position: absolute;
          bottom: 115%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(200,144,42,0.15);
          border: 1px solid rgba(200,144,42,0.4);
          border-radius: 12px;
          padding: 4px 10px;
          font-family: 'Courier Prime', 'Courier New', monospace;
          font-size: 10px;
          color: rgba(200,144,42,0.9);
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        .female-lottie-wrap:hover .female-speech-bubble {
          opacity: 1;
        }
        .female-speech-pointer {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(200,144,42,0.4);
        }
      `}</style>
    </main>
  )
}
