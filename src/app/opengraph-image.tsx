import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const line = (w: number, color = "#cbd5e1", h = 12) => <div style={{ display: "flex", width: w, height: h, borderRadius: h / 2, background: color }} />;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "linear-gradient(135deg, #ffffff 0%, #eef2ff 65%, #e0e7ff 100%)", padding: 72, gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#0f172a" }}>
            Resume<span style={{ color: "#4f46e5" }}>Craft</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>Build your resume with a live preview</div>
            <div style={{ fontSize: 28, color: "#475569" }}>Free · No sign-up · PDF download · Private share links</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["Oxford", "Harvard", "Executive", "Timeline"].map((t) => (
              <div key={t} style={{ display: "flex", fontSize: 22, color: "#3730a3", background: "#fff", border: "2px solid #c7d2fe", borderRadius: 999, padding: "6px 20px" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: 330, background: "#fff", borderRadius: 16, padding: 32, gap: 14, boxShadow: "0 20px 50px rgba(15,23,42,0.18)" }}>
          {line(190, "#0f172a", 22)}
          {line(130, "#4f46e5", 14)}
          <div style={{ display: "flex", height: 2, background: "#4f46e5", marginTop: 6 }} />
          {line(110, "#4f46e5")}
          {line(260)}
          {line(240)}
          {line(250)}
          {line(110, "#4f46e5")}
          {line(260)}
          {line(200)}
          {line(110, "#4f46e5")}
          {line(230)}
        </div>
      </div>
    ),
    size,
  );
}
