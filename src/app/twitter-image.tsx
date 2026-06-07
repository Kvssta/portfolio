import { OG_ALT, OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og";

// Same image as the OpenGraph card so the X/Twitter preview matches exactly.
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage();
}
