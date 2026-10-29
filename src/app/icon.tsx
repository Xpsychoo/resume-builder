import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** App icon: a stylised document in the brand colour. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#4f46e5", borderRadius: 112 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 260, height: 330, background: "#ffffff", borderRadius: 28, padding: 40, gap: 22 }}>
          <div style={{ display: "flex", width: 110, height: 26, borderRadius: 13, background: "#4f46e5" }} />
          <div style={{ display: "flex", width: 180, height: 16, borderRadius: 8, background: "#cbd5e1" }} />
          <div style={{ display: "flex", width: 160, height: 16, borderRadius: 8, background: "#cbd5e1" }} />
          <div style={{ display: "flex", width: 180, height: 16, borderRadius: 8, background: "#cbd5e1" }} />
          <div style={{ display: "flex", width: 120, height: 16, borderRadius: 8, background: "#cbd5e1" }} />
        </div>
      </div>
    ),
    size,
  );
}
