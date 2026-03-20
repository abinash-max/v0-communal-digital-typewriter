"use client"

import { useState, useCallback } from 'react'
import { Typewriter, SnapshotStack, SnapshotGrid } from '@/components/typewriter'
import type { Snapshot } from '@/hooks/use-typewriter'

export default function Home() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [showSnapshotGrid, setShowSnapshotGrid] = useState(false)

  const handleSnapshot = useCallback((snapshot: Snapshot) => {
    setSnapshots(prev => [snapshot, ...prev])
  }, [])

  const handleViewAllSnapshots = useCallback(() => {
    setShowSnapshotGrid(true)
  }, [])

  const handleCloseSnapshotGrid = useCallback(() => {
    setShowSnapshotGrid(false)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Main layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 p-6 lg:p-8 lg:border-r border-border/50 flex-shrink-0">
          <div className="sticky top-8">
            {/* Title */}
            <h1 className="font-serif text-3xl lg:text-4xl mb-6 text-balance">
              After You
            </h1>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Type as if someone will come after you.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Write a line, leave a thought, or finish someone else&apos;s sentence.
                What you type stays, waiting for the next person.
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed border-l-2 border-muted-foreground/20 pl-3">
                Use your keyboard like a typewriter. Drag the carriage to return.
              </p>
            </div>

            {/* Presence indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-600/70" />
              <span className="text-xs text-muted-foreground">you</span>
            </div>

            {/* Snapshot stack */}
            <SnapshotStack 
              snapshots={snapshots} 
              onViewAll={handleViewAllSnapshots}
            />
          </div>
        </aside>

        {/* Main content - Typewriter */}
        <div className="flex-1 flex items-start justify-center p-6 lg:p-12 pt-8 lg:pt-16">
          {showSnapshotGrid ? (
            <div className="w-full max-w-4xl">
              <SnapshotGrid 
                snapshots={snapshots} 
                onClose={handleCloseSnapshotGrid}
              />
            </div>
          ) : (
            <Typewriter onSnapshot={handleSnapshot} />
          )}
        </div>
      </div>

      {/* Subtle footer */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2">
        <p className="text-[10px] text-muted-foreground/50">
          a communal typewriter
        </p>
      </footer>
    </main>
  )
}
