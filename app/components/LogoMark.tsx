"use client";

interface LogoMarkProps {
  /** "default" = green on light bg · "inverted" = white/green on dark bg */
  variant?: "default" | "inverted";
  className?: string;
  /** Height in px */
  size?: number;
}

export function LogoMark({ variant = "default", className = "", size = 32 }: LogoMarkProps) {
  const inv = variant === "inverted";

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{ lineHeight: 1 }}
    >
      {/* ── Badge circle ── */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: inv ? "rgba(255,255,255,0.13)" : "#003c1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/*
          ♻ U+267B (BLACK UNIVERSAL RECYCLING SYMBOL) + U+FE0E (text variation selector)
          → Forces monochrome/text rendering on Windows & Android; on iOS it may stay emoji.
          The `color` CSS property then tints it. On emoji systems it stays green (OK for brand).
        */}
        <span
          style={{
            fontSize: Math.round(size * 0.58),
            lineHeight: 1,
            display: "block",
            color: inv ? "#4ade80" : "#22c55e",
            /* font-variant-emoji: text — future CSS, forces text presentation */
          }}
        >
          {/* U+267B + U+FE0E (text presentation selector) */}
          {"♻︎"}
        </span>
      </div>

      {/* ── کباڑی — Urdu brand name ── */}
      {/* HTML span picks up CSS-loaded Noto Nastaliq Urdu from globals.css */}
      <span
        style={{
          fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
          fontSize: Math.round(size * 0.78),
          fontWeight: 700,
          color: inv ? "#ffffff" : "#0f963c",
          whiteSpace: "nowrap",
          display: "block",
          lineHeight: 1,
        }}
      >
        کباڑی
      </span>
    </div>
  );
}
