"use client"

import { useRef, useState } from "react"
import Lottie from "lottie-react"

export default function LottiePlayer({
  animationData,
  loop = true,
  autoplay = true,
  style,
  speed = 1,
  className,
  pauseOnHover = false,
}) {
  const lottieRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  const handleMouseEnter = () => {
    if (!pauseOnHover) return
    setHovered(true)
    lottieRef.current?.pause()
  }

  const handleMouseLeave = () => {
    if (!pauseOnHover) return
    setHovered(false)
    lottieRef.current?.play()
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={style}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
      />
    </div>
  )
}
