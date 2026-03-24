"use client"

import { cn } from '@/lib/utils'
import type { Snapshot } from '@/hooks/use-typewriter'

interface SnapshotPreviewProps {
  snapshot: Snapshot
  onClick?: () => void
  className?: string
}

export function SnapshotPreview({ snapshot, onClick, className }: SnapshotPreviewProps) {
  // Get preview text - first few lines
  const previewLines = snapshot.lines.slice(0, 6)
  
  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full text-left p-3",
        "rounded-sm",
        "hover:shadow-md transition-all",
        "group cursor-pointer",
        className
      )}
      style={{
        background: '#f0e8d0',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Mini paper preview */}
      <div className="overflow-hidden h-16 mb-2">
        {previewLines.map((line, index) => (
          <p
            key={line.id}
            className="typewriter-text text-[6px] leading-tight truncate"
            style={{ color: line.color === 'black' ? '#1a0f08' : '#a03020' }}
          >
            {line.content || '\u00A0'}
          </p>
        ))}
      </div>
      
      {/* Timestamp */}
      <p className="text-[10px] transition-colors" style={{ color: '#a09070' }}>
        {formatTime(snapshot.timestamp)}
      </p>
    </button>
  )
}
