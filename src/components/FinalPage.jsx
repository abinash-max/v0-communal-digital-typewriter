"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import gsap from "gsap"
import LottiePlayer from "@/src/components/LottiePlayer"

/**
 * @typedef {{ en: string, hi: string, es: string, ja: string }} SentencePack
 * @typedef {{
 *   wordHistory?: string[],
 *   sentencePacks?: SentencePack[],
 *   onBack: () => void,
 *   constellationAnimationData?: any,
 *   constellationAnimationPath?: any,
 * }} FinalPageProps
 */

const NOTE_PALETTES = [
  { bg: "#f5e6c8", color: "#2a1a08" },
  { bg: "#d4e8d4", color: "#082a14" },
  { bg: "#d4d4e8", color: "#08082a" },
  { bg: "#e8d4d4", color: "#2a0808" },
]

function DenseStarfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const STAR_COUNT = 400
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.4 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      speed: 3 + Math.random() * 3,
    }))

    // More shooting stars for a richer final sky
    const SHOOTER_COUNT = 26
    const shooters = Array.from({ length: SHOOTER_COUNT }, () =>
      spawnShooter(Math.random() * 15)
    )

    function spawnShooter(delay) {
      return {
        x: Math.random(),
        y: Math.random() * 0.5,
        angle: Math.PI * 0.15 + Math.random() * 0.3,
        speed: 0.45 + Math.random() * 0.55,
        length: 0.05 + Math.random() * 0.08,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.4,
        cooldown: delay,
        interval: 4.2 + Math.random() * 4.2,
      }
    }

    let frame
    const animate = (time) => {
      const dt = 1 / 60
      const t = time / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const star of stars) {
        const pulse = Math.sin(t * ((Math.PI * 2) / star.speed) + star.phase)
        const opacity = 0.15 + 0.65 * (pulse * 0.5 + 0.5)
        ctx.fillStyle = `rgba(255,255,255,${opacity})`
        ctx.beginPath()
        ctx.arc(
          star.x * canvas.width,
          star.y * canvas.height,
          star.size,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }

      for (const s of shooters) {
        if (s.cooldown > 0) {
          s.cooldown -= dt
          continue
        }
        s.life += dt
        if (s.life > s.maxLife) {
          const ns = spawnShooter(0)
          Object.assign(s, ns)
          s.cooldown = s.interval
          continue
        }

        const progress = s.life / s.maxLife
        const headX = s.x + Math.cos(s.angle) * s.speed * s.life
        const headY = s.y + Math.sin(s.angle) * s.speed * s.life
        const tailX = headX - Math.cos(s.angle) * s.length
        const tailY = headY - Math.sin(s.angle) * s.length

        const alpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8
        const grad = ctx.createLinearGradient(
          tailX * canvas.width,
          tailY * canvas.height,
          headX * canvas.width,
          headY * canvas.height
        )
        grad.addColorStop(0, `rgba(255,255,255,0)`)
        grad.addColorStop(1, `rgba(255,255,255,${alpha * 0.7})`)

        ctx.strokeStyle = grad
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(tailX * canvas.width, tailY * canvas.height)
        ctx.lineTo(headX * canvas.width, headY * canvas.height)
        ctx.stroke()
      }

      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    />
  )
}

function WordNotes({ words }) {
  const containerRef = useRef(null)

  const notes = useRef(
    words.map((word, i) => ({
      word,
      palette: NOTE_PALETTES[i % NOTE_PALETTES.length],
      x: 8 + Math.random() * 84,
      y: 58 + Math.random() * 36,
      rotation: -12 + Math.random() * 24,
    }))
  ).current

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const items = el.querySelectorAll("[data-word-note]")
    if (items.length === 0) return

    gsap.set(items, { opacity: 0, scale: 0.5, y: "+=20" })
    gsap.to(items, {
      opacity: 0.85,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.2)",
      stagger: { each: 2 / Math.max(items.length, 1), from: "random" },
    })
  }, [])

  if (notes.length === 0) return null

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}
    >
      {notes.map((n, i) => (
        <div
          key={`${n.word}-${i}`}
          data-word-note
          style={{
            position: "absolute",
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: 70,
            height: 60,
            background: n.palette.bg,
            color: n.palette.color,
            transform: `rotate(${n.rotation}deg)`,
            fontFamily: "'Courier Prime', 'Courier New', serif",
            fontSize: 11,
            padding: "6px 6px 4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            boxShadow: "2px 3px 10px rgba(0,0,0,0.4)",
            borderRadius: 2,
            pointerEvents: "auto",
            cursor: "default",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            wordBreak: "break-word",
            lineHeight: 1.2,
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = `rotate(${n.rotation}deg) scale(1.1)`
            e.currentTarget.style.boxShadow = "3px 5px 18px rgba(0,0,0,0.55)"
            e.currentTarget.style.zIndex = "10"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = `rotate(${n.rotation}deg) scale(1)`
            e.currentTarget.style.boxShadow = "2px 3px 10px rgba(0,0,0,0.4)"
            e.currentTarget.style.zIndex = ""
          }}
        >
          {n.word}
        </div>
      ))}
    </div>
  )
}

function BirthdayMessage() {
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const line3Ref = useRef(null)
  const dobRef = useRef(null)

  useEffect(() => {
    gsap.set([line1Ref.current, line2Ref.current, line3Ref.current, dobRef.current], {
      opacity: 0,
    })
    gsap.set(line1Ref.current, { scale: 0.95 })

    gsap.to(line1Ref.current, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "power2.out",
      delay: 0.6,
    })
    gsap.to(line2Ref.current, {
      opacity: 0.9,
      duration: 0.7,
      ease: "power2.out",
      delay: 1.2,
    })
    gsap.to(line3Ref.current, {
      opacity: 0.85,
      duration: 0.7,
      ease: "power2.out",
      delay: 1.8,
    })
    gsap.to(dobRef.current, {
      opacity: 0.75,
      duration: 0.6,
      ease: "power2.out",
      delay: 2.35,
    })
  }, [])

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        padding: "0 24px",
      }}
    >
      <h1
        ref={line1Ref}
        style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: 54,
          color: "#c8902a",
          letterSpacing: 4,
          textAlign: "center",
          marginBottom: 28,
          textShadow: "0 0 40px rgba(200,144,42,0.3)",
        }}
      >
        Happy Birthday, Aman
      </h1>
      <p
        ref={line2Ref}
        style={{
          fontFamily: "'Courier Prime', 'Courier New', monospace",
          fontSize: 22,
          color: "rgba(232, 213, 176, 0.98)",
          textAlign: "center",
          marginBottom: 16,
          textShadow: "0 0 18px rgba(200,144,42,0.22), 0 0 36px rgba(0,0,0,0.55)",
        }}
      >
        from a universe that speaks in many languages&hellip;
      </p>
      <p
        ref={line3Ref}
        style={{
          fontFamily: "'Courier Prime', 'Courier New', monospace",
          fontSize: 22,
          color: "rgba(232, 213, 176, 0.98)",
          textAlign: "center",
          textShadow: "0 0 18px rgba(200,144,42,0.22), 0 0 36px rgba(0,0,0,0.55)",
        }}
      >
        and still finds its way to you.
      </p>
      <p
        style={{
          fontFamily: "'Courier Prime', 'Courier New', monospace",
          fontSize: 18,
          color: "rgba(232, 213, 176, 0.9)",
          textAlign: "center",
          marginTop: 14,
          letterSpacing: 3,
          textShadow: "0 0 14px rgba(200,144,42,0.18), 0 0 28px rgba(0,0,0,0.55)",
        }}
        ref={dobRef}
      >
        27.03.1987
      </p>
    </div>
  )
}

function EnglishStickyNotes({ lines }) {
  const containerRef = useRef(null)

  const notes = useMemo(() => {
    const items = (lines ?? [])
      .filter(Boolean)
      .slice(0, 4)
      .map((text, i) => ({
        key: `en-${i}`,
        text,
        palette: NOTE_PALETTES[i % NOTE_PALETTES.length],
        rotation: -5 + Math.random() * 10,
        floatDur: 2.6 + Math.random() * 1.8,
        floatDelay: Math.random() * 0.4,
      }))

    return items
  }, [lines])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const items = el.querySelectorAll("[data-en-note]")
    if (items.length === 0) return

    gsap.set(items, { opacity: 0, scale: 0.7, y: "+=18" })
    gsap.to(items, {
      opacity: 0.92,
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.15)",
      stagger: { each: 0.06, from: "start" },
    })

    const floats = Array.from(items).map((node, i) => {
      const dur = notes[i]?.floatDur ?? 3.2
      const delay = notes[i]?.floatDelay ?? 0
      return gsap.to(node, {
        y: `+=${10 + Math.random() * 10}`,
        x: `+=${-10 + Math.random() * 20}`,
        rotation: `+=${-2 + Math.random() * 4}`,
        duration: dur,
        delay,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      })
    })
    return () => floats.forEach((t) => t.kill())
  }, [notes])

  if (notes.length === 0) return null

  // Fixed positions around center, leaving the BirthdayMessage area clear.
  const positions = [
    { left: "10%", top: "18%" },
    { left: "66%", top: "18%" },
    { left: "10%", top: "62%" },
    { left: "66%", top: "62%" },
  ]

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      {notes.map((n, i) => (
        <div
          key={n.key}
          data-en-note
          style={{
            position: "absolute",
            left: positions[i]?.left ?? "10%",
            top: positions[i]?.top ?? "18%",
            width: "min(340px, 34vw)",
            minHeight: 150,
            background: n.palette.bg,
            color: n.palette.color,
            borderRadius: 8,
            boxShadow: "0 14px 46px rgba(0,0,0,0.55)",
            padding: "18px 18px 14px",
            transform: `rotate(${n.rotation}deg)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "'Courier Prime', 'Courier New', monospace",
              fontSize: 13,
              lineHeight: 1.65,
              opacity: 0.98,
              wordBreak: "break-word",
            }}
          >
            {n.text}
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: "'Courier Prime', 'Courier New', monospace",
              fontSize: 10,
              opacity: 0.55,
              alignSelf: "flex-end",
              letterSpacing: 2,
            }}
          >
            EN
          </div>
        </div>
      ))}
    </div>
  )
}

function useSavedEnglishNotes() {
  const KEY = "saved-english-sticky-notes-v1"

  const readAll = () => {
    try {
      const raw = localStorage.getItem(KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const writeAll = (arr) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(arr))
    } catch {}
  }

  return { KEY, readAll, writeAll }
}

/** @param {FinalPageProps} props */
export default function FinalPage(props) {
  const {
    wordHistory,
    sentencePacks,
    onBack,
    constellationAnimationData,
    constellationAnimationPath,
  } = props

  const resolvedWordHistory = wordHistory ?? []
  const resolvedSentencePacks = sentencePacks ?? []
  const hasSentenceNotes = resolvedSentencePacks.length > 0

  const englishLinesFromPacks = useMemo(
    () => resolvedSentencePacks.slice(0, 4).map((p) => p?.en).filter(Boolean),
    [resolvedSentencePacks]
  )

  const { readAll, writeAll } = useSavedEnglishNotes()
  const [savedOpen, setSavedOpen] = useState(false)
  const [saved, setSaved] = useState([])
  const [activeLines, setActiveLines] = useState([])

  useEffect(() => {
    setSaved(readAll())
  }, [])

  useEffect(() => {
    if (hasSentenceNotes) setActiveLines(englishLinesFromPacks)
  }, [hasSentenceNotes, englishLinesFromPacks])

  const handleSave = useCallback(() => {
    const lines = activeLines.length > 0 ? activeLines : englishLinesFromPacks
    if (!lines || lines.length === 0) return

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      lines: lines.slice(0, 4),
    }

    const next = [entry, ...readAll()]
    writeAll(next)
    setSaved(next)
    setSavedOpen(true)
  }, [activeLines, englishLinesFromPacks, readAll, writeAll])

  const handleDeleteSaved = useCallback(
    (id) => {
      const next = readAll().filter((e) => e?.id !== id)
      writeAll(next)
      setSaved(next)
      if (activeLines?.length && saved.find((e) => e?.id === id)) {
        setActiveLines(englishLinesFromPacks)
      }
    },
    [readAll, writeAll, activeLines, saved, englishLinesFromPacks]
  )

  const [constellationData, setConstellationData] = useState(
    constellationAnimationData ?? null
  )

  useEffect(() => {
    if (constellationData || !constellationAnimationPath) return
    let cancelled = false
    fetch(constellationAnimationPath)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setConstellationData(json)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [constellationAnimationPath, constellationData])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#030308",
        overflow: "hidden",
      }}
    >
      {/* Layer 1 — Dense starfield with shooting stars */}
      <DenseStarfield />

      {/* Layer 2 — Constellation Lottie (when data is available) */}
      {constellationData && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            opacity: 0.3,
            pointerEvents: "none",
            filter: "hue-rotate(220deg) saturate(1.4)",
          }}
        >
          <LottiePlayer
            animationData={constellationData}
            loop
            autoplay
            speed={0.2}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}

      {/* Layer 3 — Notes */}
      {hasSentenceNotes ? (
        <EnglishStickyNotes lines={activeLines.length ? activeLines : englishLinesFromPacks} />
      ) : (
        <WordNotes words={resolvedWordHistory} />
      )}

      {/* Layer 4 — Center message (original) */}
      <BirthdayMessage />

      {/* Layer 5 — Bottom controls */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          zIndex: 5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            fontSize: 12,
            color: "#e8d5b0",
            opacity: 0.4,
            cursor: "pointer",
            transition: "opacity 0.4s ease",
            padding: "4px 8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.4"
          }}
        >
          &#8617; back to the typewriter
        </button>

        <button
          type="button"
          onClick={handleSave}
          style={{
            background: "none",
            border: "1px solid rgba(200,144,42,0.25)",
            borderRadius: 999,
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            fontSize: 11,
            color: "rgba(232,213,176,0.85)",
            opacity: 0.85,
            cursor: "pointer",
            padding: "8px 12px",
          }}
        >
          save notes
        </button>

        <button
          type="button"
          onClick={() => setSavedOpen((v) => !v)}
          style={{
            background: "none",
            border: "1px solid rgba(200,144,42,0.25)",
            borderRadius: 999,
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            fontSize: 11,
            color: "rgba(232,213,176,0.85)",
            opacity: 0.85,
            cursor: "pointer",
            padding: "8px 12px",
          }}
        >
          saved ({saved.length})
        </button>

        <button
          type="button"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            opacity: 0.4,
            transition: "opacity 0.4s ease",
            padding: "4px",
          }}
          title="ambient sound"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.4"
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e8d5b0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </button>
      </div>

      {savedOpen && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 18,
            transform: "translateX(-50%)",
            width: "min(980px, 94vw)",
            zIndex: 6,
            background: "rgba(3,3,8,0.72)",
            border: "1px solid rgba(200,144,42,0.18)",
            borderRadius: 14,
            boxShadow: "0 18px 60px rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontFamily: "'Courier Prime', 'Courier New', monospace",
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(232,213,176,0.8)",
              }}
            >
              saved notes
            </div>
            <button
              type="button"
              onClick={() => setSavedOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(232,213,176,0.7)",
                cursor: "pointer",
                fontFamily: "'Courier Prime', 'Courier New', monospace",
                fontSize: 12,
                opacity: 0.8,
              }}
            >
              close
            </button>
          </div>

          {saved.length === 0 ? (
            <div
              style={{
                color: "rgba(232,213,176,0.55)",
                fontSize: 12,
                fontFamily: "'Courier Prime', 'Courier New', monospace",
              }}
            >
              nothing saved yet
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 10,
                maxHeight: "34vh",
                overflow: "auto",
                paddingRight: 4,
              }}
            >
              {saved.map((e) => (
                <div
                  key={e.id}
                  style={{
                    border: "1px solid rgba(200,144,42,0.14)",
                    borderRadius: 12,
                    padding: 10,
                    background: "rgba(10,10,18,0.55)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        color: "rgba(232,213,176,0.75)",
                        fontFamily: "'Courier Prime', 'Courier New', monospace",
                        fontSize: 11,
                      }}
                    >
                      {new Date(e.createdAt).toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveLines(e.lines ?? [])}
                      style={{
                        background: "none",
                        border: "1px solid rgba(200,144,42,0.22)",
                        color: "rgba(232,213,176,0.75)",
                        borderRadius: 999,
                        padding: "5px 10px",
                        cursor: "pointer",
                        fontFamily: "'Courier Prime', 'Courier New', monospace",
                        fontSize: 11,
                      }}
                    >
                      load
                    </button>
                  </div>

                  <div
                    style={{
                      color: "rgba(232,213,176,0.65)",
                      fontFamily: "'Courier Prime', 'Courier New', monospace",
                      fontSize: 11,
                      lineHeight: 1.45,
                      maxHeight: 86,
                      overflow: "hidden",
                    }}
                  >
                    {(e.lines?.[0] ?? "").slice(0, 140)}
                    {(e.lines?.[0] ?? "").length > 140 ? "…" : ""}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaved(e.id)}
                      style={{
                        background: "none",
                        border: "1px solid rgba(200,80,80,0.25)",
                        color: "rgba(255,210,210,0.75)",
                        borderRadius: 999,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontFamily: "'Courier Prime', 'Courier New', monospace",
                        fontSize: 11,
                      }}
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
