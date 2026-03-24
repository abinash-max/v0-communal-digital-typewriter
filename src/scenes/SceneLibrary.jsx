"use client"

import { useState } from "react"
import Lottie from "lottie-react"
import { motion } from "framer-motion"
import { smokeData } from "../assets/lottie/index.js"

const WORDS = [
  "memory", "language", "نور", "meaning",
  "言葉", "thought", "luz", "शब्द", "voice", "echo",
  "रोशनी", "tiempo",
]

const WORD_LATIN = /^[a-zA-Z]+$/
const BOOK_COLORS = [
  "rgba(200,144,42,0.08)",
  "rgba(200,144,42,0.14)",
  "rgba(180,120,30,0.12)",
  "rgba(160,100,20,0.18)",
]
const BOOK_ROWS = [
  { count: 8, minH: 90, maxH: 115 },
  { count: 7, minH: 80, maxH: 110 },
  { count: 8, minH: 85, maxH: 105 },
  { count: 7, minH: 90, maxH: 120 },
  { count: 8, minH: 80, maxH: 100 },
  { count: 7, minH: 85, maxH: 110 },
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildShelfRows() {
  return BOOK_ROWS.map((row) =>
    Array.from({ length: row.count }, (_, idx) => ({
      width: randomInt(10, 22),
      height: randomInt(row.minH, row.maxH),
      color: idx % 3 === 2
        ? "rgba(200,144,42,0.28)"
        : BOOK_COLORS[randomInt(0, BOOK_COLORS.length - 1)],
    }))
  )
}

function buildWordMeta() {
  return WORDS.map((w, i) => ({
    isTopWord: i >= WORDS.length - 2,
    text: w,
    x: 18 + Math.random() * 57,
    y: i >= WORDS.length - 2 ? 5 + Math.random() * 20 : 55 + Math.random() * 30,
    size: 14 + Math.random() * 8,
    opacity: 0.6 + Math.random() * 0.3,
    duration: i >= WORDS.length - 2 ? 12 + Math.random() * 4 : 7 + Math.random() * 8,
    delay: Math.random() * 10,
    italic: WORD_LATIN.test(w),
    id: i,
  }))
}

export default function SceneLibrary({ onEnter }) {
  const [words] = useState(buildWordMeta)
  const [shelfRows] = useState(buildShelfRows)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        background: "#0f0d0a",
        overflow: "hidden",
      }}
    >
      {/* 1. Left bookshelf strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "16%",
          height: "100%",
          background: "linear-gradient(90deg, #0c0905 0%, #110d08 70%, transparent 100%)",
          backgroundImage: [
            "linear-gradient(90deg, #0c0905 0%, #110d08 70%, transparent 100%)",
            "repeating-linear-gradient(transparent, transparent 11.5%, rgba(200,144,42,0.15) 11.5%, rgba(200,144,42,0.15) 12%)",
          ].join(", "),
          boxShadow: "inset -30px 0 50px rgba(200,144,42,0.06)",
        }}
      />

      {/* 2. Right bookshelf strip */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "16%",
          height: "100%",
          backgroundImage: [
            "linear-gradient(270deg, #0c0905 0%, #110d08 70%, transparent 100%)",
            "repeating-linear-gradient(transparent, transparent 11.5%, rgba(200,144,42,0.15) 11.5%, rgba(200,144,42,0.15) 12%)",
          ].join(", "),
        }}
      />

      {/* 3. Ceiling light glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 2,
            height: 60,
            background: "rgba(200,144,42,0.5)",
            margin: "0 auto",
          }}
        />
        <div
          style={{
            width: 50,
            height: 25,
            margin: "0 auto",
            background: "#1a1208",
            borderRadius: "0 0 25px 25px",
            border: "1px solid rgba(200,144,42,0.4)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 600,
          background:
            "radial-gradient(ellipse at top, rgba(200,144,42,0.07) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 85,
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 400,
          background:
            "radial-gradient(ellipse at top, rgba(200,144,42,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* 3.5 Warm visibility overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(200,144,42,0.15) 0%, transparent 65%)",
        }}
      />

      {/* 3.6 Top shelf edge hint line */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "16%",
          width: "68%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(200,144,42,0.12), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* 3.7 Left shelf books full height */}
      <div
        style={{
          position: "absolute",
          left: 8,
          top: 60,
          bottom: 20,
          width: 220,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          pointerEvents: "none",
        }}
      >
        {shelfRows.map((row, rowIdx) => (
          <div
            key={`left-row-${rowIdx}`}
            style={{ display: "flex", gap: 3, alignItems: "flex-end" }}
          >
            {row.map((book, bookIdx) => (
              <div
                key={`left-book-${rowIdx}-${bookIdx}`}
                style={{
                  flexShrink: 0,
                  width: book.width,
                  height: book.height,
                  borderRadius: "2px 2px 0 0",
                  border: "1px solid rgba(200,144,42,0.18)",
                  background: book.color,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 3.8 Right shelf books full height (mirrored structure) */}
      <div
        style={{
          position: "absolute",
          right: 8,
          top: 60,
          bottom: 20,
          width: 220,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          pointerEvents: "none",
        }}
      >
        {shelfRows.map((row, rowIdx) => (
          <div
            key={`right-row-${rowIdx}`}
            style={{ display: "flex", gap: 3, alignItems: "flex-end" }}
          >
            {row.map((book, bookIdx) => (
              <div
                key={`right-book-${rowIdx}-${bookIdx}`}
                style={{
                  flexShrink: 0,
                  width: book.width,
                  height: book.height,
                  borderRadius: "2px 2px 0 0",
                  border: "1px solid rgba(200,144,42,0.18)",
                  background: book.color,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 4. Smoke Lottie atmosphere */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "18%",
          width: 180,
          opacity: 0.25,
          pointerEvents: "none",
        }}
      >
        <Lottie animationData={smokeData} loop autoplay speed={0.5} />
      </div>

      {/* 5. Floating word fragments */}
      {words.map((w) => (
        <div
          key={w.id}
          className="scene-lib-word"
          style={{
            position: "absolute",
            left: `${w.x}%`,
            top: `${w.y}%`,
            fontSize: w.size,
            color: `rgba(200,144,42,${w.opacity})`,
            letterSpacing: 3,
            fontStyle: w.italic ? "italic" : "normal",
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            textShadow: "0 0 8px rgba(200,144,42,0.4)",
            animationDuration: `${w.duration}s`,
            animationDelay: `${w.delay}s`,
            animationName: w.isTopWord
              ? "scene-lib-floatWordDown"
              : "scene-lib-floatWord",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {w.text}
        </div>
      ))}

      {/* 6. The doorway */}
      <div
        onClick={onEnter}
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 580,
          border: "1px solid rgba(200,144,42,0.7)",
          borderBottom: "none",
          borderRadius: "250px 250px 0 0",
          background:
            "linear-gradient(180deg, rgba(200,144,42,0.08) 0%, rgba(200,144,42,0.15) 100%)",
          boxShadow:
            "0 0 40px rgba(200,144,42,0.2), inset 0 0 50px rgba(200,144,42,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            fontSize: 9,
            letterSpacing: 3,
            color: "rgba(200,144,42,0.4)",
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          the typewriter room awaits
        </span>
        <span className="scene-lib-proceed">proceed</span>

        {/* Threshold pulse line */}
        <div
          className="scene-lib-threshold"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 500,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(200,144,42,0.8), transparent)",
          }}
        />
      </div>

      <style jsx>{`
        .scene-lib-word {
          animation: scene-lib-floatWord linear infinite;
          opacity: 0;
        }
        @keyframes scene-lib-floatWord {
          0%   { transform: translateY(0);     opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 0.5; }
          100% { transform: translateY(-50vh); opacity: 0; }
        }
        @keyframes scene-lib-floatWordDown {
          0%   { transform: translateY(0);    opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 0.5; }
          100% { transform: translateY(30vh); opacity: 0; }
        }

        .scene-lib-proceed {
          font-family: 'Courier Prime', 'Courier New', monospace;
          font-size: 14px;
          letter-spacing: 7px;
          color: rgba(200,144,42,0.95);
          font-weight: 500;
          text-shadow: 0 0 10px rgba(200,144,42,0.8);
          cursor: pointer;
          transition: color 0.3s;
          text-transform: uppercase;
        }
        .scene-lib-proceed:hover {
          color: rgba(200,144,42,0.9);
        }

        .scene-lib-threshold {
          animation: scene-lib-threshold 2.5s ease-in-out infinite;
        }
        @keyframes scene-lib-threshold {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
      `}</style>
    </motion.div>
  )
}
