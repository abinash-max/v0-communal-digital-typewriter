"use client"

import { useEffect, useState } from 'react'
import LottiePlayer from '@/src/components/LottiePlayer'

interface AtmosphereLayerProps {
  smokeAnimationPath?: string
  dustAnimationPath?: string
  smokeAnimationData?: Record<string, unknown>
  dustAnimationData?: Record<string, unknown>
}

function useAnimationData(
  path: string | undefined,
  data: Record<string, unknown> | undefined
) {
  const [loaded, setLoaded] = useState<Record<string, unknown> | null>(
    data ?? null
  )

  useEffect(() => {
    if (data) {
      setLoaded(data)
      return
    }
    if (!path) return

    let cancelled = false
    fetch(path)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setLoaded(json)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [path, data])

  return loaded
}

export function AtmosphereLayer({
  smokeAnimationPath,
  dustAnimationPath,
  smokeAnimationData,
  dustAnimationData,
}: AtmosphereLayerProps) {
  const smoke = useAnimationData(smokeAnimationPath, smokeAnimationData)
  const dust = useAnimationData(dustAnimationPath, dustAnimationData)

  if (!smoke && !dust) return null

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 2, pointerEvents: 'none' }}
    >
      {/* Smoke wisps — top-left of the typewriter */}
      {smoke && (
        <LottiePlayer
          animationData={smoke}
          loop
          autoplay
          speed={0.4}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 150,
            height: 200,
            opacity: 0.6,
          }}
        />
      )}

      {/* Dust particles — scattered across the full scene */}
      {dust && (
        <LottiePlayer
          animationData={dust}
          loop
          autoplay
          speed={0.3}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.2,
          }}
        />
      )}
    </div>
  )
}
