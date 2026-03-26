"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import spaceBg from "../assets/videos/space.mp4"
import Starfield from "../components/Starfield"
import StarfieldSideBands from "../components/StarfieldSideBands"
import ShootingStars from "../components/ShootingStars"

export default function SceneEntry({ onEnter }) {
  const [startVideo, setStartVideo] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setStartVideo(true), 1000)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        background: "transparent",
      }}
    >
      {/* Neutral base behind video (does not tint the clip) */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 90% 80% at 50% 45%, #0a0814 0%, #050508 100%)",
        }}
      />
      {startVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <source src={spaceBg} type="video/mp4" />
        </video>
      )}

      {/* Side pillars — strong purple toward edges + softer wash toward the video (center stays clear) */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: "min(42vw, 40%)",
          zIndex: 1,
          pointerEvents: "none",
          background: `
            linear-gradient(90deg, rgba(120, 55, 160, 0.5) 0%, rgba(90, 40, 130, 0.22) 18%, transparent 42%),
            linear-gradient(90deg, rgba(52, 28, 88, 0.99) 0%, rgba(44, 24, 78, 0.95) 22%, rgba(36, 20, 62, 0.82) 48%, rgba(26, 14, 48, 0.55) 72%, rgba(14, 8, 28, 0.2) 90%, transparent 100%)
          `,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: "min(42vw, 40%)",
          zIndex: 1,
          pointerEvents: "none",
          background: `
            linear-gradient(270deg, rgba(120, 55, 160, 0.5) 0%, rgba(90, 40, 130, 0.22) 18%, transparent 42%),
            linear-gradient(270deg, rgba(52, 28, 88, 0.99) 0%, rgba(44, 24, 78, 0.95) 22%, rgba(36, 20, 62, 0.82) 48%, rgba(26, 14, 48, 0.55) 72%, rgba(14, 8, 28, 0.2) 90%, transparent 100%)
          `,
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {/* Dense shooting stars over the second page */}
        <ShootingStars opacity={0.98} shooterCount={110} />
        {/* Masked so stars do not sit on top of the center video */}
        <Starfield variant="cosmic" excludeCenter />
        {/* Extra dense stars only in left/right bands */}
        <StarfieldSideBands />
      </div>

      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(6,6,14,0.28) 0%, rgba(10,8,22,0.32) 50%, rgba(6,6,12,0.3) 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Bottom-right — house + copy */}
      <div
        style={{
          position: "absolute",
          right: "clamp(16px, 4vw, 40px)",
          bottom: "clamp(16px, 4vh, 36px)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "flex-end",
          gap: 14,
        }}
      >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="scene-entry-house-wrap"
      >
        <button
          type="button"
          onClick={onEnter}
          className="scene-entry-house"
          aria-label="Enter the house of languages"
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
            style={{ width: 244, height: 244, display: "block" }}
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 2.5 }}
        style={{
          textAlign: "right",
          maxWidth: "min(85vw, 380px)",
        }}
      >
        <p
          className="scene-entry-soft-pulse"
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 15,
            fontWeight: 700,
            color: "rgba(224,175,78,0.95)",
            letterSpacing: 4.4,
            margin: 0,
            textTransform: "uppercase",
            textShadow: "0 0 14px rgba(200,144,42,0.45)",
          }}
        >
          knock to enter the house of magic and words
        </p>
      </motion.div>
      </div>

      <style jsx>{`
        .scene-entry-house {
          filter:
            drop-shadow(0 0 12px rgba(200,144,42,0.75))
            drop-shadow(0 0 28px rgba(200,144,42,0.35));
          transition: filter 0.3s ease;
        }
        .scene-entry-house:hover {
          filter:
            drop-shadow(0 0 20px rgba(200,144,42,0.95))
            drop-shadow(0 0 36px rgba(200,144,42,0.5));
        }
        .scene-entry-soft-pulse {
          animation: softPulse 3s ease-in-out infinite;
        }
        @keyframes houseVibrate {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          15% {
            transform: translate(1.5px, -1px) rotate(0.45deg);
          }
          30% {
            transform: translate(-1.5px, 1px) rotate(-0.45deg);
          }
          45% {
            transform: translate(1px, 1.5px) rotate(0.35deg);
          }
          60% {
            transform: translate(-1px, -1px) rotate(-0.35deg);
          }
          75% {
            transform: translate(1.5px, 0.5px) rotate(0.25deg);
          }
        }
        .scene-entry-house-wrap {
          animation: houseVibrate 0.42s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .scene-entry-house-wrap {
            animation: none;
          }
        }
        @keyframes softPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
