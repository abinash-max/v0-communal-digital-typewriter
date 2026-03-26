"use client"

import { motion } from "framer-motion"
import Lottie from "lottie-react"
import Starfield from "../components/Starfield"
import ShootingStars from "../components/ShootingStars"
import solarSystemData from "../assets/lottie/solar-system-kasanima.json"

export default function SceneHome({ onContinue }) {
  return (
    <div
      className="scene-home-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        color: "#e8d5b0",
        overflow: "hidden",
      }}
    >
      {/* Base backdrop */} 
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "#0d0d1a",
        }}
      />

      {/* Solar system Lottie background (behind stars) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.34,
          mixBlendMode: "screen",
          filter: "saturate(0.9) contrast(0.9) brightness(0.72) blur(0.8px)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.95) 22%, rgba(0,0,0,0.72) 58%, rgba(0,0,0,0.28) 82%, rgba(0,0,0,0) 100%)",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.95) 22%, rgba(0,0,0,0.72) 58%, rgba(0,0,0,0.28) 82%, rgba(0,0,0,0) 100%)",
        }}
      >
        <Lottie
          animationData={solarSystemData}
          loop
          autoplay
          style={{ width: "98%", height: "100%", margin: "0 auto", opacity: 0.92 }}
        />
      </div>

      {/* Stars (kept behind the paper) */}
      <Starfield opacity={0.9} count={560} />

      {/* Shooting stars (like the Final page) */}
      <ShootingStars opacity={0.98} shooterCount={72} />

      {/* Constellations — faint lines + brighter nodes */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          opacity: 0.85,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="constLine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgba(200,144,42,0.22)" />
              <stop offset="1" stopColor="rgba(200,144,42,0.06)" />
            </linearGradient>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0" stopColor="rgba(220,190,255,0.75)" />
              <stop offset="0.45" stopColor="rgba(180,140,255,0.22)" />
              <stop offset="1" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* constellation A (top-left) */}
          <g className="home-const">
            <path
              d="M120 120 L180 90 L250 130 L310 105 L360 160"
              fill="none"
              stroke="url(#constLine)"
              strokeWidth="1"
            />
            {[
              [120, 120, 2.2],
              [180, 90, 2.8],
              [250, 130, 2.4],
              [310, 105, 3.2],
              [360, 160, 2.6],
            ].map(([cx, cy, r], i) => (
              <g key={`a-${i}`} className="home-node">
                <circle cx={cx} cy={cy} r={r} fill="rgba(240,240,255,0.55)" />
                <circle cx={cx} cy={cy} r={18} fill="url(#nodeGlow)" />
              </g>
            ))}
          </g>

          {/* constellation B (upper-right) */}
          <g className="home-const">
            <path
              d="M720 120 L790 165 L860 130 L905 190"
              fill="none"
              stroke="url(#constLine)"
              strokeWidth="1"
            />
            {[
              [720, 120, 2.5],
              [790, 165, 2.1],
              [860, 130, 3.4],
              [905, 190, 2.4],
            ].map(([cx, cy, r], i) => (
              <g key={`b-${i}`} className="home-node">
                <circle cx={cx} cy={cy} r={r} fill="rgba(240,240,255,0.55)" />
                <circle cx={cx} cy={cy} r={18} fill="url(#nodeGlow)" />
              </g>
            ))}
          </g>

          {/* constellation C (lower-left) */}
          <g className="home-const">
            <path
              d="M140 520 L210 560 L290 530 L360 590 L430 540"
              fill="none"
              stroke="url(#constLine)"
              strokeWidth="1"
            />
            {[
              [140, 520, 2.3],
              [210, 560, 3.1],
              [290, 530, 2.2],
              [360, 590, 2.6],
              [430, 540, 3.0],
            ].map(([cx, cy, r], i) => (
              <g key={`c-${i}`} className="home-node">
                <circle cx={cx} cy={cy} r={r} fill="rgba(240,240,255,0.55)" />
                <circle cx={cx} cy={cy} r={18} fill="url(#nodeGlow)" />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Planets / nebula glows — behind content */} 
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.9,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            left: "-240px",
            top: "-180px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, rgba(215,170,255,0.22) 0%, rgba(125,70,180,0.14) 28%, rgba(30,18,60,0) 62%)",
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            right: "-210px",
            top: "18%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 45% 38%, rgba(170,200,255,0.18) 0%, rgba(120,80,200,0.12) 34%, rgba(20,12,40,0) 66%)",
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 620,
            right: "-320px",
            bottom: "-340px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 42%, rgba(255,160,220,0.16) 0%, rgba(160,110,255,0.12) 35%, rgba(16,10,32,0) 70%)",
            filter: "blur(3px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 120% 90% at 50% 40%, rgba(120,80,200,0.10) 0%, rgba(20,12,40,0) 55%)",
          }}
        />
      </div>

      {/* Narrow rail — echoes typewriter sidebar without repeating its content */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "min(5px, 1vw)",
          zIndex: 4,
          background:
            "linear-gradient(180deg, rgba(200,144,42,0.35) 0%, rgba(200,144,42,0.08) 50%, rgba(200,144,42,0.25) 100%)",
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "clamp(24px, 5vw, 56px)",
          paddingLeft: "clamp(28px, 6vw, 64px)",
          paddingTop: "clamp(300px, 45vh, 530px)",
          position: "relative",
          zIndex: 5,
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.65 }}
          className="font-serif text-balance text-center"
          style={{
            fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)",
            fontWeight: 400,
            color: "#e8d5b0",
            margin: "0 0 28px",
            maxWidth: "22ch",
            lineHeight: 1.25,
          }}
        >
          Welcome,
        </motion.h1>

        {/* Paper panel — lined, like stationery; not the interactive typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{
            width: "100%",
            maxWidth: 440,
            backgroundColor: "#f0e8d8",
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 27px, rgba(160,140,100,0.22) 27px, rgba(160,140,100,0.22) 28px)",
            borderRadius: 3,
            boxShadow:
              "0 4px 0 rgba(26,26,42,0.4), 0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
            border: "1px solid rgba(42,38,32,0.12)",
            padding: "28px 28px 32px 40px",
            position: "relative",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 22,
              top: 12,
              bottom: 12,
              width: 2,
              background: "rgba(200,100,90,0.2)",
            }}
          />
          <p
            style={{
              fontFamily: "'Courier Prime', 'Courier New', monospace",
              fontSize: 14,
              lineHeight: "28px",
              color: "#2a1a08",
              margin: 0,
            }}
          >
            The stars do not gather like this for everyone.
            <br />
            Every constellation here carries a story.
            <br />
            Every light here has always known your name.
            <br />
            You did not find this universe.
            <br />
            It found you. Long before you were looking.
            <br />
            Welcome to a universe that has always been yours..
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          style={{ marginTop: 36 }}
        >
          <button
            type="button"
            onClick={onContinue}
            className="scene-home-cta"
            style={{
              fontFamily: "'Courier Prime', 'Courier New', monospace",
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "14px 32px",
              cursor: "pointer",
              border: "1px solid rgba(200,144,42,0.45)",
              background:
                "linear-gradient(180deg, rgba(200,144,42,0.18) 0%, rgba(200,144,42,0.06) 100%)",
              color: "#e8d5b0",
              borderRadius: 2,
            }}
          >
            Welcome to Aman's starlit doorway
          </button>
        </motion.div>
      </div>

      <footer
        style={{
          textAlign: "center",
          paddingBottom: 20,
        }}
      >
        <p style={{ fontSize: 10, color: "rgba(160,144,112,0.35)", margin: 0 }}>
          home
        </p>
      </footer>

      <style jsx>{`
        .home-node {
          transform-origin: center;
          animation: homeTwinkle 3.8s ease-in-out infinite;
          opacity: 0.8;
        }
        .home-node:nth-child(2n) {
          animation-duration: 4.9s;
          opacity: 0.65;
        }
        .home-node:nth-child(3n) {
          animation-duration: 6.2s;
          opacity: 0.7;
        }
        @keyframes homeTwinkle {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }
        .scene-home-cta:hover {
          border-color: rgba(200, 144, 42, 0.75);
          background: linear-gradient(
            180deg,
            rgba(200, 144, 42, 0.28) 0%,
            rgba(200, 144, 42, 0.1) 100%
          );
        }
        .scene-home-cta:focus-visible {
          outline: 2px solid rgba(200, 144, 42, 0.6);
          outline-offset: 3px;
        }
      `}      </style>
    </div>
  )
}
