import { ImageResponse } from "next/og";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export const runtime = "edge";
export const alt     = "theKabari — Scrap Se XP Kamao, Paise Lo";
export const size    = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0d1a10",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute", top: -100, left: -100,
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: -80, right: -80,
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div style={{
            background: "#4ade80", borderRadius: 16,
            width: 52, height: 52,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ArrowPathIcon style={{ width: 28, height: 28, color: "#0d1a10" }} strokeWidth={2} />
          </div>
          <span style={{ color: "#4ade80", fontSize: 32, fontWeight: 900, letterSpacing: "-1px" }}>theKabari</span>
        </div>

        {/* Headline */}
        <div style={{ color: "white", fontSize: 72, fontWeight: 900, lineHeight: 1.0, letterSpacing: "-3px", marginBottom: 24 }}>
          Scrap se XP kamao.{"\n"}
          <span style={{ color: "#4ade80" }}>Paise lo.</span>
        </div>

        {/* Sub */}
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 28, fontWeight: 400, marginBottom: 48 }}>
          Pakistan ka #1 gamified scrap pickup service
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 40 }}>
          {[["8k+","Active Players"],["50k+","kg Recycled"],["7","Cities"]].map(([n, l]) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ color: "#4ade80", fontSize: 36, fontWeight: 900 }}>{n}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 18 }}>{l}</span>
            </div>
          ))}
        </div>

        {/* URL tag */}
        <div style={{
          position: "absolute", top: 64, right: 80,
          background: "rgba(74,222,128,0.1)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 100, padding: "10px 24px",
          color: "#4ade80", fontSize: 20, fontWeight: 700,
        }}>thekabari.pk</div>
      </div>
    ),
    { ...size }
  );
}
