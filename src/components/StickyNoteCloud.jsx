"use client"

import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react"
import gsap from "gsap"

const hindiMap = {
  love: "प्रेम",
  light: "उजाला",
  hello: "नमस्ते",
  dream: "सपना",
  world: "दुनिया",
  hope: "आशा",
  time: "समय",
  heart: "हृदय",
  peace: "शांति",
  sky: "आकाश",
}

const spanishMap = {
  love: "amor",
  light: "luz",
  hello: "hola",
  dream: "sueño",
  world: "mundo",
  hope: "esperanza",
  time: "tiempo",
  heart: "corazón",
  peace: "paz",
  sky: "cielo",
}

const japaneseMap = {
  love: "愛",
  light: "光",
  hello: "こんにちは",
  dream: "夢",
  world: "世界",
  hope: "希望",
  time: "時",
  heart: "心",
  peace: "平和",
  sky: "空",
}

const NOTES_CONFIG = [
  { lang: "EN", bg: "#f5e6c8", color: "#2a1a08", getWord: (w) => w },
  { lang: "HI", bg: "#d4e8d4", color: "#082a14", getWord: (w) => hindiMap[w] || "शब्द" },
  { lang: "ES", bg: "#d4d4e8", color: "#08082a", getWord: (w) => spanishMap[w] || "palabra" },
  { lang: "JA", bg: "#e8d4d4", color: "#2a0808", getWord: (w) => japaneseMap[w] || "言葉" },
]

const FLY_OFFSETS = [
  { x: -180, y: -120 },
  { x: 160, y: -100 },
  { x: -140, y: 80 },
  { x: 170, y: 90 },
]

const FLOAT_DURATIONS = [1.8, 2.1, 2.3, 2.0]

let nextGroupId = 0

const StickyNoteCloud = forwardRef(function StickyNoteCloud(
  { word, trigger = 0, anchorRef, onMergeComplete },
  ref
) {
  const wrapperRef = useRef(null)
  const groupDataRef = useRef({})
  const [groups, setGroups] = useState([])

  const cancelAll = useCallback(() => {
    const container = wrapperRef.current
    Object.entries(groupDataRef.current).forEach(([id, data]) => {
      data.floatTweens?.forEach((t) => t.kill())
      data.delayed?.kill()
      if (container) {
        const els = container.querySelectorAll(`[data-group="${id}"]`)
        els.forEach((el) => gsap.killTweensOf(el))
      }
    })
    groupDataRef.current = {}
  }, [])

  useImperativeHandle(ref, () => ({
    collapseToCenter: () => {
      cancelAll()
      const container = wrapperRef.current
      if (!container) return
      const els = container.querySelectorAll("[data-group]")
      if (els.length === 0) return

      const cx = window.innerWidth / 2 - 45
      const cy = window.innerHeight / 2 - 40

      gsap.to(els, {
        x: cx,
        y: cy,
        scale: 0,
        opacity: 0,
        rotation: 0,
        duration: 0.3,
        ease: "power3.in",
        stagger: 0.02,
        onComplete: () => setGroups([]),
      })
    },
  }), [cancelAll])

  const spawnGroup = useCallback(
    (w) => {
      cancelAll()

      const id = ++nextGroupId

      let cx = window.innerWidth / 2
      let cy = window.innerHeight / 2
      if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect()
        cx = rect.left + rect.width / 2
        cy = rect.top + rect.height / 2
      }

      const notes = NOTES_CONFIG.map((cfg, i) => ({
        key: `${id}-${cfg.lang}`,
        lang: cfg.lang,
        bg: cfg.bg,
        color: cfg.color,
        text: cfg.getWord(w),
        rotation: -10 + Math.random() * 20,
        index: i,
      }))

      setGroups([{ id, notes, cx, cy }])
    },
    [anchorRef, cancelAll]
  )

  useEffect(() => {
    if (!word || trigger === 0) return
    spawnGroup(word.toLowerCase())
  }, [trigger, word, spawnGroup])

  useEffect(() => {
    const container = wrapperRef.current
    if (!container) return

    groups.forEach((group) => {
      if (groupDataRef.current[group.id]) return

      const els = Array.from(
        container.querySelectorAll(`[data-group="${group.id}"]`)
      )
      if (els.length !== 4) return

      groupDataRef.current[group.id] = { floatTweens: [], delayed: null }

      const noteW = 90
      const noteH = 80
      const originX = group.cx - noteW / 2
      const originY = group.cy - noteH / 2

      gsap.set(els, { x: originX, y: originY, opacity: 0, scale: 0.2, rotation: 0 })

      const spawnTl = gsap.timeline()

      els.forEach((el, i) => {
        spawnTl.to(
          el,
          {
            x: originX + FLY_OFFSETS[i].x,
            y: originY + FLY_OFFSETS[i].y,
            opacity: 1,
            scale: 1,
            rotation: group.notes[i].rotation,
            duration: 0.5,
            ease: "back.out(1.4)",
          },
          i * 0.1
        )
      })

      spawnTl.call(() => {
        const floatTweens = els.map((el, i) =>
          gsap.to(el, {
            y: "+=8",
            duration: FLOAT_DURATIONS[i],
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          })
        )
        if (groupDataRef.current[group.id]) {
          groupDataRef.current[group.id].floatTweens = floatTweens
        }
      })

      const delayed = gsap.delayedCall(2.5, () => {
        const data = groupDataRef.current[group.id]
        if (data) data.floatTweens.forEach((t) => t.kill())

        gsap.to(els, {
          x: originX,
          y: originY - 60,
          scale: 0.1,
          opacity: 0,
          rotation: 0,
          duration: 0.8,
          ease: "power2.in",
          stagger: 0.06,
          onComplete: () => {
            delete groupDataRef.current[group.id]
            setGroups((prev) => prev.filter((g) => g.id !== group.id))
            onMergeComplete?.()
          },
        })
      })

      groupDataRef.current[group.id].delayed = delayed
    })
  }, [groups, onMergeComplete])

  useEffect(() => {
    const dataRef = groupDataRef
    return () => {
      Object.values(dataRef.current).forEach((data) => {
        data.floatTweens?.forEach((t) => t.kill())
        data.delayed?.kill()
      })
      dataRef.current = {}
    }
  }, [])

  if (groups.length === 0) return null

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {groups.map((group) =>
        group.notes.map((note) => (
          <div
            key={note.key}
            data-group={group.id}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 90,
              height: 80,
              background: note.bg,
              color: note.color,
              fontFamily: "'Courier Prime', 'Courier New', serif",
              fontSize: 13,
              padding: "8px 8px 4px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "2px 3px 12px rgba(0,0,0,0.35)",
              borderRadius: 2,
              willChange: "transform, opacity",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
                lineHeight: 1.3,
                maxHeight: 52,
              }}
            >
              {note.text}
            </span>
            <span style={{ fontSize: 9, opacity: 0.5, alignSelf: "flex-end" }}>
              {note.lang}
            </span>
          </div>
        ))
      )}
    </div>
  )
})

export default StickyNoteCloud
