"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import gsap from "gsap"
import LottiePlayer from "@/src/components/LottiePlayer"

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

    const SHOOTER_COUNT = 10
    const shooters = Array.from({ length: SHOOTER_COUNT }, () =>
      spawnShooter(Math.random() * 15)
    )

    function spawnShooter(delay) {
      return {
        x: Math.random(),
        y: Math.random() * 0.5,
        angle: Math.PI * 0.15 + Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.4,
        length: 0.04 + Math.random() * 0.06,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.4,
        cooldown: delay,
        interval: 8 + Math.random() * 7,
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

  useEffect(() => {
    gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], {
      opacity: 0,
    })
    gsap.set(line1Ref.current, { scale: 0.95 })

    gsap.to(line1Ref.current, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "power2.out",
      delay: 1.5,
    })
    gsap.to(line2Ref.current, {
      opacity: 0.8,
      duration: 1,
      ease: "power2.out",
      delay: 3,
    })
    gsap.to(line3Ref.current, {
      opacity: 0.6,
      duration: 1,
      ease: "power2.out",
      delay: 4.5,
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
          fontSize: 42,
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
          fontSize: 16,
          color: "#e8d5b0",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        from a universe that speaks in many languages&hellip;
      </p>
      <p
        ref={line3Ref}
        style={{
          fontFamily: "'Courier Prime', 'Courier New', monospace",
          fontSize: 16,
          color: "#e8d5b0",
          textAlign: "center",
        }}
      >
        and still finds its way to you.
      </p>
    </div>
  )
}

export default function FinalPage({
  wordHistory = [],
  onBack,
  constellationAnimationData,
  constellationAnimationPath,
}) {
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

      {/* Layer 3 — Floating word notes */}
      <WordNotes words={wordHistory} />

      {/* Layer 4 — Birthday message */}
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
    </div>
  )
}
