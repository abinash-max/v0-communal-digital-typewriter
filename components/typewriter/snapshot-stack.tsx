"use client"

import { cn } from '@/lib/utils'
import { SnapshotPreview } from './snapshot-preview'
import type { Snapshot } from '@/hooks/use-typewriter'

interface SnapshotStackProps {
  snapshots: Snapshot[]
  onViewAll?: () => void
  className?: string
}

export function SnapshotStack({ snapshots, onViewAll, className }: SnapshotStackProps) {
  // Show only the most recent 3 snapshots in the preview stack
  const recentSnapshots = snapshots.slice(0, 3)

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      {snapshots.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            recent
          </span>
          {snapshots.length > 3 && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              view all ({snapshots.length})
            </button>
          )}
        </div>
      )}

      {/* Preview cards */}
      <div className="space-y-2">
        {recentSnapshots.map((snapshot, index) => (
          <div
            key={snapshot.id}
            className="transform transition-all duration-200"
            style={{
              opacity: 1 - index * 0.1,
            }}
          >
            <SnapshotPreview 
              snapshot={snapshot} 
              onClick={onViewAll}
            />
          </div>
        ))}
      </div>

      {/* View all button */}
      {snapshots.length > 0 && (
        <button
          type="button"
          onClick={onViewAll}
          className={cn(
            "w-full text-center py-2 text-xs",
            "text-muted-foreground hover:text-foreground",
            "border border-dashed border-muted-foreground/30 hover:border-foreground/30",
            "rounded-sm transition-colors"
          )}
        >
          snapshots
        </button>
      )}

      {/* Empty state */}
      {snapshots.length === 0 && (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground">
            No snapshots yet
          </p>
        </div>
      )}
    </div>
  )
}
