"use client"

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  type RefObject,
} from "react"
import gsap from "gsap"

const hindiMap: Record<string, string> = {
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

const spanishMap: Record<string, string> = {
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

const japaneseMap: Record<string, string> = {
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
  { lang: "EN", bg: "#f5e6c8", color: "#2a1a08", getWord: (w: string) => w },
  {
    lang: "HI",
    bg: "#d4e8d4",
    color: "#082a14",
    getWord: (w: string) => hindiMap[w] || "शब्द",
  },
  {
    lang: "ES",
    bg: "#d4d4e8",
    color: "#08082a",
    getWord: (w: string) => spanishMap[w] || "palabra",
  },
  {
    lang: "JA",
    bg: "#e8d4d4",
    color: "#2a0808",
    getWord: (w: string) => japaneseMap[w] || "言葉",
  },
] as const

const SENTENCE_NOTE_META = [
  { lang: "EN", bg: "#f5e6c8", color: "#2a1a08", field: "en" as const },
  { lang: "HI", bg: "#d4e8d4", color: "#082a14", field: "hi" as const },
  { lang: "ES", bg: "#d4d4e8", color: "#08082a", field: "es" as const },
  { lang: "JA", bg: "#e8d4d4", color: "#2a0808", field: "ja" as const },
]

export type SentencePack = {
  en: string
  hi: string
  es: string
  ja: string
}

type NoteMode = "word" | "sentence"

interface CloudNote {
  key: string
  lang: string
  bg: string
  color: string
  text: string
  rotation: number
  index: number
  mode: NoteMode
  fontFamily?: string
}

interface CloudGroup {
  id: number
  notes: CloudNote[]
  cx: number
  cy: number
  mode: NoteMode
  avoidRect?: {
    left: number
    top: number
    right: number
    bottom: number
    width: number
    height: number
  }
}

interface GroupRuntime {
  floatTweens: gsap.core.Tween[]
  delayed: gsap.core.Callback | null
}

const FLY_OFFSETS = [
  { x: -180, y: -120 },
  { x: 160, y: -100 },
  { x: -140, y: 80 },
  { x: 170, y: 90 },
]

const SENTENCE_FLY_OFFSETS = [
  { x: -260, y: -140 },
  { x: 240, y: -120 },
  { x: -220, y: 100 },
  { x: 220, y: 110 },
]

const FLOAT_DURATIONS = [1.8, 2.1, 2.3, 2.0]

let nextGroupId = 0

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function outsideTargetsForRect(
  rect: { left: number; top: number; right: number; bottom: number; width: number; height: number },
  noteW: number,
  noteH: number,
  pad = 22
) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  const spaceLeft = rect.left
  const spaceRight = vw - rect.right
  const canUseSides = spaceLeft >= noteW + pad * 2 && spaceRight >= noteW + pad * 2

  const y1 = rect.top + rect.height * 0.35 - noteH / 2
  const y2 = rect.top + rect.height * 0.68 - noteH / 2

  if (canUseSides) {
    const leftX = rect.left - noteW - pad
    const rightX = rect.right + pad
    return [
      { x: clamp(leftX, pad, vw - noteW - pad), y: clamp(y1, pad, vh - noteH - pad) },
      { x: clamp(rightX, pad, vw - noteW - pad), y: clamp(y1, pad, vh - noteH - pad) },
      { x: clamp(leftX, pad, vw - noteW - pad), y: clamp(y2, pad, vh - noteH - pad) },
      { x: clamp(rightX, pad, vw - noteW - pad), y: clamp(y2, pad, vh - noteH - pad) },
    ]
  }

  // Fallback: place above/below when the viewport is narrow.
  const aboveY = rect.top - noteH - pad
  const belowY = rect.bottom + pad
  const x1 = rect.left + rect.width * 0.25 - noteW / 2
  const x2 = rect.left + rect.width * 0.75 - noteW / 2

  const useAbove = rect.top >= noteH + pad * 2
  const topY = useAbove ? aboveY : belowY
  const bottomY = useAbove ? belowY : aboveY

  return [
    { x: clamp(x1, pad, vw - noteW - pad), y: clamp(topY, pad, vh - noteH - pad) },
    { x: clamp(x2, pad, vw - noteW - pad), y: clamp(topY, pad, vh - noteH - pad) },
    { x: clamp(x1, pad, vw - noteW - pad), y: clamp(bottomY, pad, vh - noteH - pad) },
    { x: clamp(x2, pad, vw - noteW - pad), y: clamp(bottomY, pad, vh - noteH - pad) },
  ]
}

export type StickyNoteCloudHandle = {
  collapseToCenter: () => void
}

export interface StickyNoteCloudProps {
  word?: string
  trigger?: number
  sentencePack?: SentencePack | null
  sentenceTrigger?: number
  anchorRef?: RefObject<HTMLElement | null>
  onMergeComplete?: () => void
}

const StickyNoteCloud = forwardRef<StickyNoteCloudHandle, StickyNoteCloudProps>(
  function StickyNoteCloud(
    {
      word,
      trigger = 0,
      sentencePack,
      sentenceTrigger = 0,
      anchorRef,
      onMergeComplete,
    },
    ref
  ) {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const groupDataRef = useRef<Record<string, GroupRuntime>>({})
    const [groups, setGroups] = useState<CloudGroup[]>([])

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

    useImperativeHandle(
      ref,
      () => ({
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
      }),
      [cancelAll]
    )

    const spawnGroup = useCallback(
      (w: string) => {
        cancelAll()

        const id = ++nextGroupId

        let cx = window.innerWidth / 2
        let cy = window.innerHeight / 2
        let avoidRect: CloudGroup["avoidRect"] | undefined
        if (anchorRef?.current) {
          const rect = anchorRef.current.getBoundingClientRect()
          cx = rect.left + rect.width / 2
          cy = rect.top + rect.height / 2
          avoidRect = {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          }
        }

        const notes: CloudNote[] = NOTES_CONFIG.map((cfg, i) => ({
          key: `${id}-${cfg.lang}`,
          lang: cfg.lang,
          bg: cfg.bg,
          color: cfg.color,
          text: cfg.getWord(w),
          rotation: -10 + Math.random() * 20,
          index: i,
          mode: "word",
        }))

        setGroups([{ id, notes, cx, cy, mode: "word", avoidRect }])
      },
      [anchorRef, cancelAll]
    )

    const spawnSentenceGroup = useCallback(
      (pack: SentencePack) => {
        cancelAll()

        const id = ++nextGroupId

        let cx = window.innerWidth / 2
        let cy = window.innerHeight / 2
        let avoidRect: CloudGroup["avoidRect"] | undefined
        if (anchorRef?.current) {
          const rect = anchorRef.current.getBoundingClientRect()
          cx = rect.left + rect.width / 2
          cy = rect.top + rect.height / 2
          avoidRect = {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          }
        }

        const notes: CloudNote[] = SENTENCE_NOTE_META.map((cfg, i) => ({
          key: `${id}-${cfg.lang}`,
          lang: cfg.lang,
          bg: cfg.bg,
          color: cfg.color,
          text: pack[cfg.field],
          rotation: -3 + Math.random() * 6,
          index: i,
          mode: "sentence",
          fontFamily:
            cfg.lang === "HI" || cfg.lang === "JA"
              ? "system-ui, sans-serif"
              : "'Courier Prime', 'Courier New', serif",
        }))

        setGroups([{ id, notes, cx, cy, mode: "sentence", avoidRect }])
      },
      [anchorRef, cancelAll]
    )

    useEffect(() => {
      if (!word || trigger === 0) return
      spawnGroup(word.toLowerCase())
    }, [trigger, word, spawnGroup])

    useEffect(() => {
      if (!sentencePack || !sentenceTrigger) return
      spawnSentenceGroup(sentencePack)
    }, [sentenceTrigger, sentencePack, spawnSentenceGroup])

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

        const isSentence = group.mode === "sentence"
        const noteW = isSentence ? 220 : 90
        const noteH = isSentence ? 90 : 80
        const flyOffsets = isSentence ? SENTENCE_FLY_OFFSETS : FLY_OFFSETS

        const originX = group.cx - noteW / 2
        const originY = group.cy - noteH / 2

        const outsideTargets =
          group.avoidRect ? outsideTargetsForRect(group.avoidRect, noteW, noteH, 22) : null

        gsap.set(els, { x: originX, y: originY, opacity: 0, scale: 0.2, rotation: 0 })

        const spawnTl = gsap.timeline()

        els.forEach((el, i) => {
          const tx = outsideTargets ? outsideTargets[i].x : originX + flyOffsets[i].x
          const ty = outsideTargets ? outsideTargets[i].y : originY + flyOffsets[i].y
          spawnTl.to(
            el,
            {
              x: tx,
              y: ty,
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
          group.notes.map((note) => {
            const isSentence = note.mode === "sentence"
            return (
              <div
                key={note.key}
                data-group={group.id}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: isSentence ? 220 : 90,
                  minHeight: isSentence ? 90 : 80,
                  height: isSentence ? "auto" : 80,
                  background: note.bg,
                  color: note.color,
                  fontFamily: isSentence
                    ? note.fontFamily
                    : "'Courier Prime', 'Courier New', serif",
                  fontSize: isSentence ? 11 : 13,
                  padding: isSentence ? 12 : "8px 8px 4px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "2px 3px 12px rgba(0,0,0,0.35)",
                  borderRadius: isSentence ? 4 : 2,
                  willChange: "transform, opacity",
                }}
              >
                <span
                  style={{
                    overflow: isSentence ? "auto" : "hidden",
                    textOverflow: isSentence ? "clip" : "ellipsis",
                    wordBreak: "break-word",
                    lineHeight: isSentence ? 1.6 : 1.3,
                    maxHeight: isSentence ? 200 : 52,
                  }}
                >
                  {note.text}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    opacity: isSentence ? 0.4 : 0.5,
                    alignSelf: "flex-end",
                  }}
                >
                  {note.lang}
                </span>
              </div>
            )
          })
        )}
      </div>
    )
  }
)

export default StickyNoteCloud
