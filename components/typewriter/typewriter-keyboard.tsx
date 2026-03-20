"use client"

import { cn } from '@/lib/utils'

interface TypewriterKeyboardProps {
  pressedKey: string | null
  className?: string
}

// QWERTY layout matching the Royal typewriter
const keyboardRows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
]

// SVG filter for hand-drawn effect
function SketchyFilter() {
  return (
    <svg className="absolute w-0 h-0">
      <defs>
        <filter id="sketchy">
          <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise" seed="1" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sketchy-line">
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="2" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}

// Hand-drawn circle for keys
function SketchyCircle({ 
  size = 36, 
  strokeWidth = 2,
  className 
}: { 
  size?: number
  strokeWidth?: number
  className?: string 
}) {
  // Create a slightly imperfect circle path
  const cx = size / 2
  const cy = size / 2
  const r = (size / 2) - strokeWidth
  
  // Generate wobbly circle path
  const points = 12
  const pathPoints = []
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2
    const wobble = Math.sin(i * 3) * 1.5 + Math.cos(i * 2) * 1
    const px = cx + Math.cos(angle) * (r + wobble)
    const py = cy + Math.sin(angle) * (r + wobble)
    pathPoints.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`)
  }
  
  return (
    <svg 
      width={size} 
      height={size} 
      className={className}
      style={{ filter: 'url(#sketchy)' }}
    >
      <path 
        d={pathPoints.join(' ') + ' Z'} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TypewriterKey({ 
  letter, 
  isPressed,
  size = 'normal'
}: { 
  letter: string
  isPressed: boolean
  size?: 'normal' | 'space'
}) {
  const keySize = size === 'space' ? 160 : 36
  const keyHeight = size === 'space' ? 28 : 36
  
  return (
    <div
      className={cn(
        "relative transition-all duration-75",
        isPressed && "translate-y-0.5"
      )}
    >
      {/* Key stem - hand-drawn line */}
      {size !== 'space' && (
        <div 
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-3 w-0.5",
            isPressed ? "h-1" : "h-3"
          )}
          style={{
            background: 'linear-gradient(to bottom, #666 0%, #888 50%, #666 100%)',
            filter: 'url(#sketchy-line)',
            transform: 'translateX(-50%) rotate(0.5deg)'
          }}
        />
      )}
      
      {/* Key cap */}
      <div
        className={cn(
          "relative flex items-center justify-center",
          "transition-all duration-75",
          size === 'space' 
            ? "px-2" 
            : "",
          isPressed && "opacity-90"
        )}
        style={{
          width: keySize,
          height: keyHeight,
        }}
      >
        {/* Hand-drawn key border */}
        {size === 'space' ? (
          // Spacebar - elongated oval
          <svg 
            width={keySize} 
            height={keyHeight} 
            className="absolute inset-0 text-gray-600"
            style={{ filter: 'url(#sketchy)' }}
          >
            <path 
              d={`M 14 ${keyHeight/2} 
                  Q 14 4, ${keySize/4} 4
                  L ${keySize * 3/4} 4
                  Q ${keySize - 14} 4, ${keySize - 14} ${keyHeight/2}
                  Q ${keySize - 14} ${keyHeight - 4}, ${keySize * 3/4} ${keyHeight - 4}
                  L ${keySize/4} ${keyHeight - 4}
                  Q 14 ${keyHeight - 4}, 14 ${keyHeight/2}
                  Z`}
              fill={isPressed ? "#f0f0f0" : "#fafafa"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <>
            <SketchyCircle 
              size={36} 
              strokeWidth={2} 
              className={cn(
                "absolute inset-0 text-gray-600",
                isPressed && "text-gray-700"
              )} 
            />
            {/* Fill circle */}
            <div 
              className={cn(
                "absolute inset-1 rounded-full",
                isPressed ? "bg-gray-100" : "bg-white"
              )}
              style={{ filter: 'url(#sketchy)' }}
            />
          </>
        )}
        
        {/* Letter */}
        {size !== 'space' && (
          <span 
            className={cn(
              "relative z-10 text-xs text-gray-700",
              "select-none",
              isPressed && "text-gray-900"
            )}
            style={{
              fontFamily: "var(--font-handwritten, 'Caveat'), cursive",
              fontSize: '14px',
              fontWeight: 500,
            }}
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
      <SketchyFilter />
      
      {/* Typewriter body - hand-drawn style */}
      <div className="relative">
        {/* Red side panels - sketchy trapezoids */}
        <svg 
          className="absolute -left-6 top-8 w-20 h-48 text-red-500"
          style={{ filter: 'url(#sketchy)' }}
        >
          <path 
            d="M 60 0 L 75 0 Q 80 0, 80 5 L 80 185 Q 80 190, 75 190 L 30 190 Q 25 190, 25 185 L 50 5 Q 52 0, 57 0 Z"
            fill="currentColor"
            stroke="#b91c1c"
            strokeWidth="2"
          />
        </svg>
        <svg 
          className="absolute -right-6 top-8 w-20 h-48 text-red-500"
          style={{ filter: 'url(#sketchy)', transform: 'scaleX(-1)' }}
        >
          <path 
            d="M 60 0 L 75 0 Q 80 0, 80 5 L 80 185 Q 80 190, 75 190 L 30 190 Q 25 190, 25 185 L 50 5 Q 52 0, 57 0 Z"
            fill="currentColor"
            stroke="#b91c1c"
            strokeWidth="2"
          />
        </svg>
        
        {/* Top mechanism / Paper roller area - sketchy */}
        <div className="relative mx-auto w-56 h-20 mb-2">
          {/* Paper guide wings - hand drawn */}
          <svg 
            className="absolute left-2 top-6 w-14 h-10 text-gray-400"
            style={{ filter: 'url(#sketchy)' }}
          >
            <path 
              d="M 2 8 L 48 2 L 52 6 L 52 32 L 48 36 L 2 30 Q 0 29, 0 26 L 0 12 Q 0 9, 2 8 Z"
              fill="#e5e5e5"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <svg 
            className="absolute right-2 top-6 w-14 h-10 text-gray-400"
            style={{ filter: 'url(#sketchy)', transform: 'scaleX(-1)' }}
          >
            <path 
              d="M 2 8 L 48 2 L 52 6 L 52 32 L 48 36 L 2 30 Q 0 29, 0 26 L 0 12 Q 0 9, 2 8 Z"
              fill="#e5e5e5"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          
          {/* Central carriage mechanism - sketchy */}
          <svg 
            className="absolute left-1/2 -translate-x-1/2 top-0 w-24 h-16 text-gray-400"
            style={{ filter: 'url(#sketchy)' }}
          >
            {/* Main housing */}
            <path 
              d="M 8 14 L 16 4 L 80 4 L 88 14 L 88 54 L 8 54 Z"
              fill="#f5f5f5"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Inner mechanism */}
            <path 
              d="M 32 18 L 64 18 L 64 42 L 32 42 Z"
              fill="#e5e5e5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {/* Small details */}
            <circle cx="48" cy="30" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          
          {/* Paper roller - sketchy line */}
          <svg 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-3 text-gray-500"
            style={{ filter: 'url(#sketchy-line)' }}
          >
            <path 
              d="M 4 6 Q 8 4, 140 4 Q 280 4, 284 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* ROYAL brand name - hand-drawn badge */}
        <div className="flex justify-center mb-3">
          <svg 
            className="w-20 h-7 text-red-500"
            style={{ filter: 'url(#sketchy)' }}
          >
            <rect 
              x="2" y="2" 
              width="76" height="22" 
              rx="3" 
              fill="currentColor"
              stroke="#b91c1c"
              strokeWidth="1.5"
            />
            <text 
              x="40" y="17" 
              textAnchor="middle" 
              fill="white"
              style={{ 
                fontFamily: "var(--font-handwritten, 'Caveat'), cursive",
                fontSize: '12px',
                letterSpacing: '2px'
              }}
            >
              ROYAL
            </text>
          </svg>
        </div>
        
        {/* Keyboard area - sketchy border */}
        <div className="relative mx-4">
          <svg 
            className="absolute inset-0 w-full h-full text-gray-400"
            preserveAspectRatio="none"
            style={{ filter: 'url(#sketchy)' }}
          >
            <rect 
              x="2" y="2" 
              width="calc(100% - 4px)" 
              height="calc(100% - 4px)" 
              rx="12"
              fill="#f5f5f5"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          
          <div className="relative p-6 pt-8">
            {/* Key rows */}
            <div className="flex flex-col items-center gap-2">
              {keyboardRows.map((row, rowIndex) => (
                <div 
                  key={rowIndex} 
                  className="flex gap-1"
                  style={{
                    marginLeft: rowIndex === 1 ? '10px' : rowIndex === 2 ? '20px' : rowIndex === 3 ? '30px' : '0'
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
        </div>
        
        {/* Bottom edge - sketchy */}
        <svg 
          className="w-full h-8 text-gray-400 mt-1"
          preserveAspectRatio="none"
          style={{ filter: 'url(#sketchy)' }}
        >
          <path 
            d="M 16 0 L 16 16 Q 16 24, 28 24 L calc(100% - 28px) 24 Q calc(100% - 16px) 24, calc(100% - 16px) 16 L calc(100% - 16px) 0"
            fill="#e5e5e5"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  )
}
