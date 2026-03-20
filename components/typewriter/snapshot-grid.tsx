"use client"

import { cn } from '@/lib/utils'
import type { Snapshot } from '@/hooks/use-typewriter'

interface SnapshotGridProps {
  snapshots: Snapshot[]
  onClose: () => void
  className?: string
}

export function SnapshotGrid({ snapshots, onClose, className }: SnapshotGridProps) {
  // Format timestamp
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (snapshots.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full py-16", className)}>
        <p className="text-muted-foreground text-sm">No snapshots yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          Take a snapshot to capture your writing
        </p>
      </div>
    )
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg">Snapshots</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          close
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto hide-scrollbar">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            className={cn(
              "bg-paper border border-paper-shadow/40 rounded-sm p-4",
              "hover:border-foreground/20 hover:shadow-md transition-all"
            )}
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            {/* Paper content */}
            <div className="overflow-hidden h-32 mb-3">
              {snapshot.lines.slice(0, 10).map((line) => (
                <p
                  key={line.id}
                  className={cn(
                    "typewriter-text text-[8px] leading-[1.4] truncate",
                    line.color === 'black' ? 'text-ink-black' : 'text-ink-red'
                  )}
                >
                  {line.content || '\u00A0'}
                </p>
              ))}
            </div>

            {/* Date */}
            <p className="text-[10px] text-muted-foreground">
              {formatDate(snapshot.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
