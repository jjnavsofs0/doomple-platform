/**
 * DoompleLogo — uses the official brand logo files from Doomple's brand guidelines.
 *
 * Variants:
 *   "full" + theme="dark"  → horizontal lockup on dark navy background (header/footer)
 *   "full" + theme="light" → stacked lockup on light background (light sections)
 *   "mark"                 → symbol mark only (compact placements)
 *   "mono"                 → monochrome horizontal lockup (single-color contexts)
 *
 * Props:
 *   variant   — "mark" | "full" | "mono" (default: "full")
 *   size      — height in px (width scales proportionally) (default: 32)
 *   theme     — "light" | "dark" (default: "dark")
 *   className — additional classes for the wrapper
 */

import Image from "next/image";
import { cn } from "@/lib/utils";

// Tight-cropped transparent PNGs — padding removed for accurate sizing
const LOGO_ASSETS = {
  dark: { src: "/images/logo-dark-transparent-cropped.png", width: 553, height: 145 },   // horizontal, white text
  light: { src: "/images/logo-light-transparent-cropped.png", width: 314, height: 230 }, // stacked, dark text
  mark: { src: "/images/logo-mark-transparent-cropped.png", width: 142, height: 161 },   // mark only
  mono: { src: "/images/logo-mono-transparent-cropped.png", width: 346, height: 95 },    // mono horizontal
} as const;

interface DoompleLogoProps {
  variant?: "mark" | "full" | "mono";
  size?: number;
  theme?: "light" | "dark";
  className?: string;
}

export function DoompleLogo({
  variant = "full",
  size = 32,
  theme = "dark",
  className,
}: DoompleLogoProps) {
  let asset: (typeof LOGO_ASSETS)[keyof typeof LOGO_ASSETS];

  if (variant === "mark") {
    asset = LOGO_ASSETS.mark;
  } else if (variant === "mono") {
    asset = LOGO_ASSETS.mono;
  } else {
    // full variant — pick light or dark version
    asset = theme === "light" ? LOGO_ASSETS.light : LOGO_ASSETS.dark;
  }

  const displayHeight = size;
  const displayWidth = Math.round((asset.width / asset.height) * displayHeight);

  return (
    <div className={cn("flex items-center shrink-0", className)}>
      <Image
        src={asset.src}
        alt="Doomple"
        width={asset.width}
        height={asset.height}
        style={{ height: displayHeight, width: displayWidth }}
        priority
      />
    </div>
  );
}
