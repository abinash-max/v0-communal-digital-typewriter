"use client"

import { useEffect, useRef } from "react"

const STAR_COUNT = 250

export default function Starfield() {
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

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.4 + Math.random() * 1.6,
      baseOpacity: 0.1 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      speed: 3000 + Math.random() * 4000,
    }))

    let frame
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const star of stars) {
        const cycle = (Math.PI * 2) / (star.speed / 1000)
        const pulse = Math.sin(time / 1000 * cycle + star.phase)
        const opacity = 0.1 + (star.baseOpacity - 0.1) * (pulse * 0.5 + 0.5)
        ctx.fillStyle = `rgba(255,255,255,${opacity})`
        ctx.beginPath()
        ctx.arc(
          star.x * canvas.width,
          star.y * canvas.height,
          star.radius,
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
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  )
}
