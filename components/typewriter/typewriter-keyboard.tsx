"use client"

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TypewriterKeyboardProps {
  pressedKey: string | null
  className?: string
}

// QWERTY layout matching the Royal typewriter
const keyboardRows = [
  // Number row
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  // Top letter row
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  // Middle letter row
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  // Bottom letter row
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
]

function TypewriterKey({ 
  letter, 
  isPressed,
  size = 'normal'
}: { 
  letter: string
  isPressed: boolean
  size?: 'normal' | 'space'
}) {
  return (
    <div
      className={cn(
        "relative transition-all duration-75",
        isPressed && "translate-y-1"
      )}
    >
      {/* Key stem/rod */}
      <div 
        className={cn(
          "absolute left-1/2 -translate-x-1/2 bg-gray-400 rounded-sm",
          size === 'space' ? "w-24 h-3 -top-2" : "w-1.5 h-4 -top-3",
          isPressed && "h-2 -top-1"
        )}
      />
      
      {/* Key cap */}
      <div
        className={cn(
          "relative flex items-center justify-center",
          "bg-white border-2 border-gray-300",
          "shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),_0_2px_4px_rgba(0,0,0,0.15)]",
          "transition-all duration-75",
          size === 'space' 
            ? "w-48 h-8 rounded-full" 
            : "w-9 h-9 rounded-full",
          isPressed && [
            "shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]",
            "bg-gray-100"
          ]
        )}
      >
        {size !== 'space' && (
          <span 
            className={cn(
              "text-xs font-medium text-gray-700",
              "font-mono select-none",
              isPressed && "text-gray-900"
            )}
          >
            {letter}
          </span>
        )}
      </div>
    </div>
  )
}

export function TypewriterKeyboard({ pressedKey, className }: TypewriterKeyboardProps) {
  const normalizedKey = pressedKey?.toUpperCase() || null
  
  return (
    <div className={cn("relative", className)}>
      {/* Typewriter body/frame */}
      <div className="relative">
        {/* Red side panels */}
        <div className="absolute -left-8 top-0 w-16 h-full bg-red-600 rounded-l-2xl" 
          style={{ 
            clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 30% 100%)',
          }}
        />
        <div className="absolute -right-8 top-0 w-16 h-full bg-red-600 rounded-r-2xl"
          style={{ 
            clipPath: 'polygon(0% 0%, 50% 0%, 70% 100%, 0% 100%)',
          }}
        />
        
        {/* Top mechanism/paper holder */}
        <div className="relative mx-auto w-48 h-16 mb-4">
          {/* Paper guide wings */}
          <div className="absolute left-0 top-4 w-12 h-8 bg-gray-200 border border-gray-300 rounded-l-lg transform -skew-x-12" />
          <div className="absolute right-0 top-4 w-12 h-8 bg-gray-200 border border-gray-300 rounded-r-lg transform skew-x-12" />
          
          {/* Central mechanism */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-20 h-12 bg-gray-100 border border-gray-300 rounded-t-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-200 border border-gray-300 rounded-sm" />
          </div>
          
          {/* Paper roller line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Brand name */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-600 px-4 py-1 rounded">
            <span className="text-white text-xs font-serif tracking-widest">ROYAL</span>
          </div>
        </div>
        
        {/* Keyboard area */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 pt-8 shadow-inner">
          {/* Key rows */}
          <div className="flex flex-col items-center gap-2">
            {keyboardRows.map((row, rowIndex) => (
              <div 
                key={rowIndex} 
                className="flex gap-1.5"
                style={{
                  // Offset each row slightly like a real typewriter
                  marginLeft: rowIndex === 1 ? '12px' : rowIndex === 2 ? '24px' : rowIndex === 3 ? '36px' : '0'
                }}
              >
                {row.map((key) => (
                  <TypewriterKey
                    key={key}
                    letter={key}
                    isPressed={normalizedKey === key}
                  />
                ))}
              </div>
            ))}
            
            {/* Spacebar */}
            <div className="mt-2">
              <TypewriterKey
                letter=" "
                isPressed={normalizedKey === ' ' || pressedKey === ' '}
                size="space"
              />
            </div>
          </div>
        </div>
        
        {/* Bottom edge */}
        <div className="h-6 bg-gray-200 border-t border-gray-300 rounded-b-2xl shadow-md" />
      </div>
    </div>
  )
}
