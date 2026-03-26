"use client"

import { useState, useCallback, useEffect, useRef, type ComponentType } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import Lottie from 'lottie-react'
import {
  Typewriter,
  SnapshotStack,
  SnapshotGrid,
  type TypewriterRef,
  type GirlfriendSentencePack,
} from '@/components/typewriter'
import StickyNoteCloud, {
  type StickyNoteCloudHandle,
} from '@/src/components/StickyNoteCloud'
import FinalPage from '@/src/components/FinalPage'
import Starfield from '@/src/components/Starfield'
import SceneEntry from '@/src/scenes/SceneEntry'
import SceneHome from '@/src/scenes/SceneHome'
import SceneLibrary from '@/src/scenes/SceneLibrary'
import femaleData from '@/src/assets/lottie/female.json'
import type { Snapshot } from '@/hooks/use-typewriter'

const FinalPageAny = FinalPage as unknown as ComponentType<any>

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
  const [scene, setScene] = useState<'entry' | 'home' | 'library' | 'typewriter' | 'final'>('home')

  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [showSnapshotGrid, setShowSnapshotGrid] = useState(false)
  const [showSnapshotsPanel, setShowSnapshotsPanel] = useState(false)
  const [wordEvent, setWordEvent] = useState({ word: '', id: 0 })
  const [wordHistory, setWordHistory] = useState<string[]>([])
  const [paperOpen, setPaperOpen] = useState(false)
  const [sentencePack, setSentencePack] = useState<GirlfriendSentencePack | null>(null)
  const [sentenceTrigger, setSentenceTrigger] = useState(0)
  const transitioningRef = useRef(false)
  const [isArriving, setIsArriving] = useState(false)
  const [girlFollowPos, setGirlFollowPos] = useState<{ top: number; left: number } | null>(null)
  const [lastKeyHit, setLastKeyHit] = useState<string | null>(null)
  const [completedSentencePacks, setCompletedSentencePacks] = useState<GirlfriendSentencePack[]>([])

  const typewriterAreaRef = useRef<HTMLDivElement>(null)
  const typewriterRef = useRef<TypewriterRef>(null)
  const stickyCloudRef = useRef<StickyNoteCloudHandle>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  const handleSnapshot = useCallback((snapshot: Snapshot) => {
    setSnapshots(prev => [snapshot, ...prev])
    setShowSnapshotsPanel(true)
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

  const handleCloseSnapshotsPanel = useCallback(() => {
    setShowSnapshotsPanel(false)
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
    // Keep collected sentence packs for the final page.
    if (scene !== 'typewriter' && scene !== 'final') {
      setPaperOpen(false)
      setSentencePack(null)
      setSentenceTrigger(0)
      setGirlFollowPos(null)
      setLastKeyHit(null)
      setCompletedSentencePacks([])
    }
  }, [scene])

  useEffect(() => {
    if (scene !== 'typewriter') return
    if (!paperOpen) {
      setGirlFollowPos(null)
      return
    }

    const keyboardEl = document.querySelector('[data-typewriter-keyboard="true"]') as HTMLElement | null
    if (!keyboardEl) return

    const hit = lastKeyHit
    const key = hit === null ? null : hit === ' ' ? ' ' : hit.toLowerCase()

    const keyEl =
      key !== null
        ? (keyboardEl.querySelector(`[data-key="${key}"]`) as HTMLElement | null)
        : null

    const anchorEl = keyEl ?? keyboardEl
    const r = anchorEl.getBoundingClientRect()
    const x = keyEl ? r.left + r.width / 2 : r.left + r.width * 0.78
    const y = keyEl ? r.top + r.height / 2 : r.top + r.height * 0.35

    setGirlFollowPos({
      top: Math.max(20, y - 70),
      left: Math.min(window.innerWidth - 40, x + 18),
    })
  }, [scene, paperOpen, lastKeyHit])

  return (
    <main className="min-h-screen bg-background relative">
      <Starfield opacity={scene === 'home' ? 0 : 1} count={560} />

      {/* Particle burst container — persists across scenes */}
      <div ref={particlesRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }} />

      <AnimatePresence mode="wait">
        {/* ── Home first (typewriter-themed) — then space entry, library, typewriter ── */}
        {scene === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={sceneTransition}
          >
            <SceneHome onContinue={() => setScene('entry')} />
          </motion.div>
        )}

        {/* ── Space entry (video + house) ── */}
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
              sentencePack={sentencePack}
              sentenceTrigger={sentenceTrigger}
              anchorRef={typewriterAreaRef}
            />

            {/* Female Lottie overlay */}
            <motion.div
              layoutId="female-lottie"
              initial={false}
              animate={
                paperOpen
                  ? {
                      top: girlFollowPos ? `${girlFollowPos.top}px` : 'calc(12% - 82px)',
                      left: girlFollowPos ? `${girlFollowPos.left}px` : 'auto',
                      right: girlFollowPos ? 'auto' : '24px',
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
              onClick={() => {
                setPaperOpen(true)
                setSentencePack(null)
                queueMicrotask(() => typewriterRef.current?.startGirlfriendFlow())
              }}
              className="female-lottie-wrap"
              data-follow={paperOpen ? 'true' : 'false'}
              style={{
                position: 'fixed',
                zIndex: paperOpen ? 25 : 20,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'visible',
                background: 'transparent',
                mixBlendMode: 'normal',
                filter: 'none',
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
                  mixBlendMode: 'normal',
                  filter: 'none',
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

            {/* Removed: right-side notepad panel (was shown after clicking the girl) */}

            <div ref={mainContentRef} className="min-h-0">
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

              <div className="relative min-h-screen" style={{ zIndex: 1 }}>
                {/* Main content - Typewriter */}
                <div className="flex min-h-screen items-start justify-center p-4 lg:p-10 pt-4 lg:pt-6">
                  {showSnapshotGrid ? (
                    <div className="w-full max-w-4xl">
                      <SnapshotGrid
                        snapshots={snapshots}
                        onClose={handleCloseSnapshotGrid}
                      />
                    </div>
                  ) : (
                    <div ref={typewriterAreaRef} className="min-h-0 w-full max-w-3xl">
                      <Typewriter
                        ref={typewriterRef}
                        paperOpen={paperOpen}
                        onSnapshot={handleSnapshot}
                        onWord={handleWord}
                        isArriving={isArriving}
                        onKeyHit={(key) => setLastKeyHit(key)}
                        onGirlfriendSticky={(pack) => {
                          setSentencePack(pack)
                          if (pack) setSentenceTrigger((t) => t + 1)
                          if (pack) setCompletedSentencePacks((prev) => [...prev, pack])
                        }}
                        onGirlfriendComplete={() => {
                          // Directly go to the final page when she finishes all 4.
                          triggerFinalTransition()
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Snapshots sidebar (auto-opens after snapshot) */}
                <AnimatePresence>
                  {!showSnapshotGrid && showSnapshotsPanel && (
                    <motion.aside
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      style={{
                        position: 'fixed',
                        left: 14,
                        top: 14,
                        bottom: 14,
                        width: 'min(320px, calc(100vw - 28px))',
                        maxWidth: 320,
                        zIndex: 30,
                        background: 'rgba(3,3,8,0.62)',
                        border: '1px solid rgba(200,144,42,0.18)',
                        borderRadius: 14,
                        boxShadow: '0 18px 60px rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(10px)',
                        padding: 12,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 10,
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Courier Prime', 'Courier New', monospace",
                            fontSize: 11,
                            letterSpacing: 3,
                            textTransform: 'uppercase',
                            color: 'rgba(232,213,176,0.75)',
                          }}
                        >
                          saved snapshots
                        </div>
                        <button
                          type="button"
                          onClick={handleCloseSnapshotsPanel}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(232,213,176,0.7)',
                            cursor: 'pointer',
                            fontFamily: "'Courier Prime', 'Courier New', monospace",
                            fontSize: 12,
                            opacity: 0.85,
                          }}
                        >
                          close
                        </button>
                      </div>

                      <div style={{ overflowY: 'auto', height: '100%', paddingRight: 6 }}>
                        <SnapshotStack
                          snapshots={snapshots}
                          onViewAll={() => {
                            setShowSnapshotGrid(true)
                            setShowSnapshotsPanel(false)
                          }}
                        />
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>
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
            <FinalPageAny
              wordHistory={wordHistory}
              sentencePacks={completedSentencePacks}
              onBack={handleBack}
              constellationAnimationData={undefined}
              constellationAnimationPath={undefined}
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
        @keyframes girlFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-1deg); }
          50% { transform: translate3d(0, -10px, 0) rotate(1deg); }
        }
        .female-lottie-wrap[data-follow="true"] {
          animation: girlFloat 1.9s ease-in-out infinite;
        }
      `}</style>
    </main>
  )
}
