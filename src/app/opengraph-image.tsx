import { ImageResponse } from "next/og";

// Metadata — also drives og:image:alt / twitter:image:alt.
export const alt = "Nikola Kostadinović — independent software designer in AI.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAME = "Nikola Kostadinović";

/**
 * Fetch a Satori-compatible (TTF) font from Google Fonts. A server-side fetch
 * sends no browser User-Agent, so Google serves `truetype` rather than woff2
 * (which Satori can't parse). Subsetted to the glyphs we actually render.
 */
async function loadGoogleFont(
  family: string,
  weight: number,
  text: string,
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(
      text,
    )}`;
    const css = await fetch(url).then((res) => res.text());
    const src = css.match(
      /src:\s*url\((https:\/\/[^)]+)\)\s*format\(['"]?(?:truetype|opentype)['"]?\)/,
    );
    if (!src) return null;
    return await fetch(src[1]).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const geistBold = await loadGoogleFont("Geist", 700, NAME);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          background: "#ffffff",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#0a0a0a",
            letterSpacing: "-0.02em",
          }}
        >
          {NAME}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: geistBold
        ? [{ name: "Geist", data: geistBold, weight: 700, style: "normal" }]
        : undefined,
    },
  );
}
