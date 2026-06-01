import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Mario Alina — Interactive Resume for Purple LAB";

// Default Node runtime — compatible with standalone output on Fly
// (edge runtime unnecessary here; Node runtime is simpler and avoids edge constraints)

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #f5ecff 0%, #e9d5ff 60%, #a855f7 100%)",
          padding: "64px 72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Badge */}
        <div
          style={{
            background: "#a855f7",
            color: "white",
            borderRadius: "24px",
            padding: "6px 18px",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          Work sample for Purple LAB
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#3b0764",
            lineHeight: 1.05,
            marginBottom: "16px",
          }}
        >
          Mario Alina
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "#6b21a8",
            fontWeight: 500,
          }}
        >
          Interactive Resume — AI Agent Orchestration
        </div>

        {/* Wink */}
        <div
          style={{
            marginTop: "32px",
            fontSize: "16px",
            color: "#9333ea",
            fontStyle: "italic",
          }}
        >
          AWS shop. Runs on Fly. Ask me why.
        </div>
      </div>
    ),
    size
  );
}
