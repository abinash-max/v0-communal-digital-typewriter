"use client"

import { cn } from '@/lib/utils'
import type { Snapshot } from '@/hooks/use-typewriter'

interface SnapshotGridProps {
  snapshots: Snapshot[]
  onClose: () => void
  className?: string
}

// Predefined positions for clustered, overlapping zero-gravity effect
// These positions create a pile of papers in the center
const floatConfigs = [
  { x: '25%', y: '15%', rotate: -8, zIndex: 1, animation: 'float-snapshot-1', delay: '0s' },
  { x: '40%', y: '10%', rotate: 5, zIndex: 3, animation: 'float-snapshot-2', delay: '0.3s' },
  { x: '35%', y: '25%', rotate: -3, zIndex: 2, animation: 'float-snapshot-3', delay: '0.6s' },
  { x: '20%', y: '30%', rotate: 7, zIndex: 4, animation: 'float-snapshot-2', delay: '0.2s' },
  { x: '45%', y: '35%', rotate: -5, zIndex: 5, animation: 'float-snapshot-1', delay: '0.8s' },
  { x: '30%', y: '40%', rotate: 4, zIndex: 6, animation: 'float-snapshot-3', delay: '0.4s' },
  { x: '50%', y: '20%', rotate: -6, zIndex: 2, animation: 'float-snapshot-2', delay: '1s' },
  { x: '15%', y: '45%', rotate: 8, zIndex: 3, animation: 'float-snapshot-1', delay: '0.5s' },
  { x: '55%', y: '40%', rotate: -4, zIndex: 1, animation: 'float-snapshot-3', delay: '0.7s' },
]

export function SnapshotGrid({ snapshots, onClose, className }: SnapshotGridProps) {
  if (snapshots.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full", className)}>
        <p className="text-muted-foreground text-sm">No snapshots yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          Take a snapshot to capture your writing
        </p>
      </div>
    )
  }

  return (
    <div className={cn("min-h-[70vh] w-full flex flex-col bg-background", className)}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="font-serif text-sm text-foreground hover:text-muted-foreground transition-colors italic underline underline-offset-2"
        >
          snapshots &gt;
        </button>
        <span className="text-xs text-muted-foreground">
          {snapshots.length} saved
        </span>
      </div>

      {/* Floating snapshots container */}
      <div className="relative flex-1 min-h-[55vh] overflow-visible">
        {snapshots.slice(0, 9).map((snapshot, index) => {
          const config = floatConfigs[index % floatConfigs.length]
          
          return (
            <div
              key={snapshot.id}
              className={cn(
                "absolute w-36 md:w-44 aspect-[3/4]",
                "bg-paper border border-paper-shadow/30 rounded-sm",
                "shadow-lg hover:shadow-xl transition-shadow cursor-pointer",
                config.animation
              )}
              style={{
                left: config.x,
                top: config.y,
                zIndex: config.zIndex,
                ['--rotation' as string]: `${config.rotate}deg`,
                animationDelay: config.delay,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {/* Paper content */}
              <div className="p-3 h-full overflow-hidden">
                {snapshot.lines.slice(0, 12).map((line) => (
                  <p
                    key={line.id}
                    className={cn(
                      "typewriter-text text-[7px] md:text-[8px] leading-[1.5] truncate",
                      line.color === 'black' ? 'text-ink-black' : 'text-ink-red'
                    )}
                  >
                    {line.content || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
