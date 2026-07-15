import { ImageResponse } from "next/og";
export const alt = "X2Post · 内容优先、公开可读、秩序透明";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "#f7f7f2", color: "#111", padding: 80, border: "24px solid #111" }}><div style={{ fontSize: 104, fontWeight: 900 }}>X2Post</div><div style={{ marginTop: 28, fontSize: 42 }}>内容优先 · 公开可读 · 秩序透明</div></div>, size);
}
