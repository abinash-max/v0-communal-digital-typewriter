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
        <linearGradient id="bronze-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a0522d" />
          <stop offset="50%" stopColor="#8b4513" />
          <stop offset="100%" stopColor="#6b3410" />
        </linearGradient>
        <linearGradient id="gunmetal-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#242440" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </linearGradient>
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
    <div className="relative">
      {/* Key stem */}
      {size !== 'space' && (
        <div 
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-3 w-0.5 transition-all duration-[60ms]",
            isPressed ? "h-1" : "h-3"
          )}
          style={{
            background: 'linear-gradient(to bottom, #8b7020 0%, #c8902a 50%, #8b7020 100%)',
            filter: 'url(#sketchy-line)',
            transform: 'translateX(-50%) rotate(0.5deg)'
          }}
        />
      )}
      
      {/* Key cap with 3D press */}
      <div
        className={cn(
          "relative flex items-center justify-center",
          size === 'space' 
            ? cn("typewriter-key-space", isPressed && "key-pressed")
            : cn("typewriter-key rounded-full", isPressed && "key-pressed"),
        )}
        style={{
          width: keySize,
          height: keyHeight,
        }}
      >
        {size === 'space' ? (
          <svg 
            width={keySize} 
            height={keyHeight} 
            className="absolute inset-0"
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
              fill={isPressed ? "#1a1a3a" : "#111122"}
              stroke="#c8902a"
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
                "absolute inset-0",
                isPressed ? "text-[#d4a030]" : "text-[#c8902a]"
              )} 
            />
            <div 
              className="absolute inset-1 rounded-full"
              style={{ filter: 'url(#sketchy)', background: isPressed ? '#1a1a3a' : '#111122' }}
            />
          </>
        )}
        
        {size !== 'space' && (
          <span 
            className="relative z-10 text-xs select-none"
            style={{
              fontFamily: "var(--font-handwritten, 'Caveat'), cursive",
              fontSize: '14px',
              fontWeight: 500,
              color: '#e8d5b0',
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
        {/* Side panels - deep bronze with metallic sheen */}
        <svg 
          className="absolute -left-6 top-8 w-20 h-48"
          style={{ filter: 'url(#sketchy)' }}
        >
          <path 
            d="M 60 0 L 75 0 Q 80 0, 80 5 L 80 185 Q 80 190, 75 190 L 30 190 Q 25 190, 25 185 L 50 5 Q 52 0, 57 0 Z"
            fill="url(#bronze-gradient)"
            stroke="#6b3410"
            strokeWidth="2"
          />
        </svg>
        <svg 
          className="absolute -right-6 top-8 w-20 h-48"
          style={{ filter: 'url(#sketchy)', transform: 'scaleX(-1)' }}
        >
          <path 
            d="M 60 0 L 75 0 Q 80 0, 80 5 L 80 185 Q 80 190, 75 190 L 30 190 Q 25 190, 25 185 L 50 5 Q 52 0, 57 0 Z"
            fill="url(#bronze-gradient)"
            stroke="#6b3410"
            strokeWidth="2"
          />
        </svg>
        
        {/* Top mechanism / Paper roller area - sketchy */}
        <div className="relative mx-auto w-56 h-20 mb-2">
          <svg 
            className="absolute left-2 top-6 w-14 h-10"
            style={{ filter: 'url(#sketchy)' }}
          >
            <path 
              d="M 2 8 L 48 2 L 52 6 L 52 32 L 48 36 L 2 30 Q 0 29, 0 26 L 0 12 Q 0 9, 2 8 Z"
              fill="#1a1a2e"
              stroke="#c8902a"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
          </svg>
          <svg 
            className="absolute right-2 top-6 w-14 h-10"
            style={{ filter: 'url(#sketchy)', transform: 'scaleX(-1)' }}
          >
            <path 
              d="M 2 8 L 48 2 L 52 6 L 52 32 L 48 36 L 2 30 Q 0 29, 0 26 L 0 12 Q 0 9, 2 8 Z"
              fill="#1a1a2e"
              stroke="#c8902a"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
          </svg>
          
          <svg 
            className="absolute left-1/2 -translate-x-1/2 top-0 w-24 h-16"
            style={{ filter: 'url(#sketchy)' }}
          >
            <path 
              d="M 8 14 L 16 4 L 80 4 L 88 14 L 88 54 L 8 54 Z"
              fill="url(#gunmetal-gradient)"
              stroke="#c8902a"
              strokeWidth="1.5"
              strokeOpacity="0.3"
            />
            <path 
              d="M 32 18 L 64 18 L 64 42 L 32 42 Z"
              fill="#1a1a2e"
              stroke="#c8902a"
              strokeWidth="1"
              strokeOpacity="0.25"
            />
            <circle cx="48" cy="30" r="6" fill="none" stroke="#c8902a" strokeWidth="1.5" strokeOpacity="0.5" />
          </svg>
          
          <svg 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-3"
            style={{ filter: 'url(#sketchy-line)' }}
          >
            <path 
              d="M 4 6 Q 8 4, 140 4 Q 280 4, 284 6"
              fill="none"
              stroke="#c8902a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />
          </svg>
        </div>
        
        {/* ROYAL brand name - gold badge */}
        <div className="flex justify-center mb-3">
          <svg 
            className="w-20 h-7"
            style={{ filter: 'url(#sketchy)' }}
          >
            <rect 
              x="2" y="2" 
              width="76" height="22" 
              rx="3" 
              fill="#c8902a"
              stroke="#a07020"
              strokeWidth="1.5"
            />
            <text 
              x="40" y="17" 
              textAnchor="middle" 
              fill="#0a0a0a"
              style={{ 
                fontFamily: "var(--font-handwritten, 'Caveat'), cursive",
                fontSize: '12px',
                letterSpacing: '2px',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              ROYAL
            </text>
          </svg>
        </div>
        
        <div className="relative mx-4">
          <svg 
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
            style={{ filter: 'url(#sketchy)' }}
          >
            <rect 
              x="2" y="2" 
              width="calc(100% - 4px)" 
              height="calc(100% - 4px)" 
              rx="12"
              fill="#1a1a2e"
              stroke="#c8902a"
              strokeWidth="1.5"
              strokeOpacity="0.2"
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
        
        <svg 
          className="w-full h-8 mt-1"
          preserveAspectRatio="none"
          style={{ filter: 'url(#sketchy)' }}
        >
          <path 
            d="M 16 0 L 16 16 Q 16 24, 28 24 L calc(100% - 28px) 24 Q calc(100% - 16px) 24, calc(100% - 16px) 16 L calc(100% - 16px) 0"
            fill="#1a1a2e"
            stroke="#c8902a"
            strokeWidth="1.5"
            strokeOpacity="0.2"
          />
        </svg>
      </div>
    </div>
  )
}
