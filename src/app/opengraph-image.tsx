import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "RenewBrick — Property Transformation & Care in Hyderabad, Bangalore and Warangal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social sharing image, generated at build time. */
export default function OpengraphImage() {
  const bricks = [
    [0, 0], [200, 0], [400, 0], [600, 0], [800, 0], [1000, 0],
    [100, 60], [300, 60], [500, 60], [700, 60], [900, 60], [1100, 60],
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#092B4D", padding: 72, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, display: "flex", opacity: 0.18 }}>
          {bricks.map(([x, y]) => (
            <div key={`${x}-${y}`} style={{ position: "absolute", left: x, top: y, width: 196, height: 56, border: "2px solid #D9A23A" }} />
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#D9A23A", textTransform: "uppercase" }}>
          Restore &amp; Elevate
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 128, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
            <span style={{ color: "#FFFFFF" }}>renew</span>
            <span style={{ color: "#D9A23A" }}>brick</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 40, color: "#C3CEDB" }}>
            Property Transformation &amp; Care · Hyderabad · Bangalore · Warangal
          </div>
        </div>
        <div style={{ height: 120 }} />
      </div>
    ),
    size,
  );
}
