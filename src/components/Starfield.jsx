"use client"

import { useEffect, useRef } from "react"

const STAR_COUNT_DEFAULT = 250
const STAR_COUNT_COSMIC = 780

function pickCosmicColor() {
  const r = Math.random()
  if (r < 0.42) return { r: 255, g: 255, b: 255 }
  if (r < 0.72) return { r: 170, g: 195, b: 255 }
  return { r: 210, g: 165, b: 255 }
}

function biasedEdgeX() {
  const u = Math.random()
  if (u < 0.32) return Math.random() * 0.28
  if (u < 0.64) return 0.72 + Math.random() * 0.28
  return Math.random()
}

const MASK_EXCLUDE_CENTER =
  "linear-gradient(to right, #000 0%, #000 26%, transparent 34%, transparent 66%, #000 74%, #000 100%)"

export default function Starfield({
  variant = "default",
  excludeCenter = false,
  opacity = 1,
  count,
}) {
  const canvasRef = useRef(null)
  const cosmic = variant === "cosmic"

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

    const resolvedCount =
      typeof count === "number"
        ? count
        : cosmic
          ? STAR_COUNT_COSMIC
          : STAR_COUNT_DEFAULT
    const stars = Array.from({ length: resolvedCount }, () => {
      const color = cosmic ? pickCosmicColor() : { r: 255, g: 255, b: 255 }
      return {
        x: cosmic ? biasedEdgeX() : Math.random(),
        y: Math.random(),
        radius:
          (cosmic ? 0.35 : 0.4) +
          Math.random() * (cosmic ? 2.1 : 1.6),
        baseOpacity: cosmic
          ? 0.18 + Math.random() * 0.72
          : 0.1 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        speed: 3000 + Math.random() * 4000,
        color,
      }
    })

    let frame
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const star of stars) {
        const cycle = (Math.PI * 2) / (star.speed / 1000)
        const pulse = Math.sin(time / 1000 * cycle + star.phase)
        const opacity = 0.1 + (star.baseOpacity - 0.1) * (pulse * 0.5 + 0.5)
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
  }, [cosmic, count])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity,
        ...(excludeCenter
          ? {
              WebkitMaskImage: MASK_EXCLUDE_CENTER,
              maskImage: MASK_EXCLUDE_CENTER,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }
          : {}),
      }}
    />
  )
}
