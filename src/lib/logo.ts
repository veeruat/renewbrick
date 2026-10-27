// Server-side only. Resolves the approved logo file and its intrinsic size so
// it is always rendered at its true aspect ratio (never stretched or cropped).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { business } from "@/content/site";

export type LogoAsset = { src: string; width: number; height: number };

function pngSize(file: string) {
  const buf = readFileSync(file);
  // PNG signature, then IHDR: width at byte 16, height at byte 20 (big-endian).
  if (buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG") {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  return null;
}

function svgSize(file: string) {
  const vb = readFileSync(file, "utf8").match(/viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/);
  return vb ? { width: Number(vb[1]), height: Number(vb[2]) } : null;
}

let cached: LogoAsset | null | undefined;

export function getLogo(): LogoAsset | null {
  if (cached !== undefined) return cached;
  cached = null;
  const src = business.logoFile;
  if (!src) return cached;
  const file = path.join(process.cwd(), "public", src);
  if (!existsSync(file)) return cached;
  const size = src.endsWith(".svg") ? svgSize(file) : pngSize(file);
  if (size) cached = { src, ...size };
  return cached;
}
