"use client"

import { useEffect, useRef } from "react"

const STARS_PER_BAND = 880

function pickColor() {
  const r = Math.random()
  if (r < 0.28) return { r: 255, g: 255, b: 255 }
  if (r < 0.52) return { r: 175, g: 140, b: 255 }
  if (r < 0.78) return { r: 150, g: 175, b: 255 }
  return { r: 220, g: 120, b: 255 }
}

function SideBand({ side }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const w = wrap.clientWidth
      const h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener("resize", resize)

    const stars = Array.from({ length: STARS_PER_BAND }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.3 + Math.random() * 2.45,
      baseOpacity: 0.26 + Math.random() * 0.72,
      phase: Math.random() * Math.PI * 2,
      speed: 2800 + Math.random() * 4200,
      color: pickColor(),
    }))

    let frame
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const star of stars) {
        const cycle = (Math.PI * 2) / (star.speed / 1000)
        const pulse = Math.sin(time / 1000 * cycle + star.phase)
        const opacity = 0.12 + (star.baseOpacity - 0.12) * (pulse * 0.5 + 0.5)
        const { r, g, b } = star.color
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`
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
    <div
      ref={wrapRef}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        [side]: 0,
        width: "min(42vw, 40%)",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}

export default function StarfieldSideBands() {
  return (
    <>
      <SideBand side="left" />
      <SideBand side="right" />
    </>
  )
}
