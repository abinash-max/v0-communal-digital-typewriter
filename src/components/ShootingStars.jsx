"use client"

import { useEffect, useRef } from "react"

export default function ShootingStars({ opacity = 1, shooterCount = 10 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    if (reduce) return

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
        interval: 2.8 + Math.random() * 4.2,
        phase: Math.random() * Math.PI * 2,
      }
    }

    const shooters = Array.from({ length: shooterCount }, () =>
      spawnShooter(Math.random() * 6)
    )

    let frame
    const animate = (time) => {
      const dt = 1 / 60
      const t = time / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)

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

        const alpha =
          progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8
        const sparkle = 0.72 + 0.28 * (Math.sin(t * 15 + s.phase) * 0.5 + 0.5)
        const grad = ctx.createLinearGradient(
          tailX * canvas.width,
          tailY * canvas.height,
          headX * canvas.width,
          headY * canvas.height
        )
        grad.addColorStop(0, `rgba(255,255,255,0)`)
        grad.addColorStop(1, `rgba(255,255,255,${alpha * (0.75 + sparkle * 0.45)})`)

        ctx.strokeStyle = grad
        ctx.lineWidth = 1.15 + sparkle * 1.05
        ctx.shadowBlur = 5 + sparkle * 11
        ctx.shadowColor = `rgba(190,220,255,${alpha * 0.95})`
        ctx.beginPath()
        ctx.moveTo(tailX * canvas.width, tailY * canvas.height)
        ctx.lineTo(headX * canvas.width, headY * canvas.height)
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.fillStyle = `rgba(230,245,255,${alpha * (0.7 + sparkle * 0.45)})`
        ctx.beginPath()
        ctx.arc(
          headX * canvas.width,
          headY * canvas.height,
          0.85 + sparkle * 1.1,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }

      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [shooterCount])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        opacity,
      }}
    />
  )
}

