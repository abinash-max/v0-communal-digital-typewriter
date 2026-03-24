"use client"

import Lottie from "lottie-react"
import { motion } from "framer-motion"
import { astronautData } from "../assets/lottie/index.js"
import Starfield from "../components/Starfield"

export default function SceneEntry({ onEnter }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        background: "transparent",
      }}
    >
      {/* Layer 1 — Starfield (z-index 0) */}
      <Starfield />

      {/* Layer 2 — Space station Lottie */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 1,
          WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 84%)",
          maskImage: "linear-gradient(to bottom, black 70%, transparent 84%)",
        }}
      >
        <Lottie
          animationData={astronautData}
          loop
          autoplay
          rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>

      {/* Layer 5 — House icon button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="scene-entry-house-wrap"
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <button
          type="button"
          onClick={onEnter}
          className="scene-entry-house"
          style={{
            border: "none",
            background: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 80, height: 80 }}
          >
            <polygon
              points="50,8 5,45 95,45"
              fill="rgba(200,144,42,0.15)"
              stroke="#c8902a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect
              x="15"
              y="45"
              width="70"
              height="47"
              rx="2"
              fill="rgba(200,144,42,0.1)"
              stroke="#c8902a"
              strokeWidth="2.5"
            />
            <rect
              x="22"
              y="55"
              width="18"
              height="16"
              rx="1"
              fill="rgba(200,144,42,0.5)"
              stroke="#c8902a"
              strokeWidth="1.5"
            />
            <rect
              x="60"
              y="55"
              width="18"
              height="16"
              rx="1"
              fill="rgba(200,144,42,0.5)"
              stroke="#c8902a"
              strokeWidth="1.5"
            />
            <rect
              x="38"
              y="68"
              width="24"
              height="24"
              rx="2"
              fill="rgba(8,8,15,0.8)"
              stroke="#c8902a"
              strokeWidth="1.5"
            />
            <circle cx="57" cy="80" r="2" fill="#c8902a" />
          </svg>
        </button>
      </motion.div>

      {/* Layer 6 — Enter copy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 2.5 }}
        style={{
          position: "absolute",
          bottom: 52,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        <p
          className="scene-entry-soft-pulse"
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 13,
            color: "rgba(200,144,42,0.7)",
            letterSpacing: 5,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          enter the house of many worlds
        </p>
        <p
          style={{
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            fontSize: 10,
            color: "rgba(200,144,42,0.25)",
            letterSpacing: 3,
            margin: "4px 0 0",
            textTransform: "uppercase",
          }}
        >
          click the house to begin
        </p>
      </motion.div>

      <style jsx>{`
        .scene-entry-house {
          filter:
            drop-shadow(0 0 10px rgba(200,144,42,0.7))
            drop-shadow(0 0 25px rgba(200,144,42,0.3));
          transition: filter 0.3s ease;
        }
        .scene-entry-house:hover {
          filter:
            drop-shadow(0 0 18px rgba(200,144,42,0.95))
            drop-shadow(0 0 30px rgba(200,144,42,0.45));
        }
        .scene-entry-soft-pulse {
          animation: softPulse 3s ease-in-out infinite;
        }
        @keyframes floatHouse {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
        .scene-entry-house-wrap {
          animation: floatHouse 3.5s ease-in-out infinite;
        }
        @keyframes softPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
