// Server-side only. Resolves the approved logo files and their intrinsic size so
// they are always rendered at their true aspect ratio (never stretched or cropped).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { business } from "@/content/site";

export type LogoAsset = { src: string; width: number; height: number };
export type LogoVariant = "light" | "dark" | "raster";

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

const sources: Record<LogoVariant, string | null> = {
  light: business.logoFile,
  dark: business.logoDarkFile,
  raster: business.logoRasterFile,
};

const cache = new Map<LogoVariant, LogoAsset | null>();

/** "light" for white backgrounds, "dark" for navy, "raster" for structured data. */
export function getLogo(variant: LogoVariant = "light"): LogoAsset | null {
  if (cache.has(variant)) return cache.get(variant)!;
  let asset: LogoAsset | null = null;
  const src = sources[variant];
  const file = src ? path.join(process.cwd(), "public", src) : null;
  if (src && file && existsSync(file)) {
    const size = src.endsWith(".svg") ? svgSize(file) : pngSize(file);
    if (size) asset = { src, ...size };
  }
  cache.set(variant, asset);
  return asset;
}
