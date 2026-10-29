import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#4f46e5" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 92, height: 116, background: "#ffffff", borderRadius: 10, padding: 14, gap: 8 }}>
          <div style={{ display: "flex", width: 40, height: 9, borderRadius: 5, background: "#4f46e5" }} />
          <div style={{ display: "flex", width: 62, height: 6, borderRadius: 3, background: "#cbd5e1" }} />
          <div style={{ display: "flex", width: 54, height: 6, borderRadius: 3, background: "#cbd5e1" }} />
          <div style={{ display: "flex", width: 62, height: 6, borderRadius: 3, background: "#cbd5e1" }} />
        </div>
      </div>
    ),
    size,
  );
}
