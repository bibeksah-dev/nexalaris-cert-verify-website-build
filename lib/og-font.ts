// Space Grotesk for the server-rendered certificate images.
//
// The font is vendored (lib/fonts/) rather than fetched from fonts.gstatic.com
// at request time: those URLs carry a version segment that rotates, and once it
// does the old path answers 404 with an HTML body. @vercel/og then receives
// `<!DO...` where it expects font bytes and the whole route dies with
// "Unsupported OpenType signature", which is exactly how the OG image and PNG
// export routes started returning 500.
//
// Read like @vercel/og reads its own bundled fallback: the asset is resolved at
// build time and served from the edge bundle, so there is no network hop.

const FONT_FAMILY = "Space Grotesk"

// Module scope, so the bytes are read once per isolate. The `catch` is part of
// the chain to keep an early failure from surfacing as an unhandled rejection.
const fontBytes: Promise<ArrayBuffer | null> = fetch(
  new URL("./fonts/SpaceGrotesk-Regular.ttf", import.meta.url),
)
  .then((res) => {
    if (!res.ok) throw new Error(`font asset responded ${res.status}`)
    return res.arrayBuffer()
  })
  .catch((error) => {
    console.error("[og-font] Space Grotesk unavailable, falling back to the default typeface:", error)
    return null
  })

/**
 * Fonts to hand to `ImageResponse`.
 *
 * Returns `undefined` when the font cannot be read — @vercel/og resolves its
 * font list as `options.fonts || defaultFonts`, so `undefined` degrades to the
 * bundled Noto Sans instead of failing the request. Note that an empty array
 * would *not*: it is truthy, and satori throws without a usable font.
 */
export async function loadCertificateFonts() {
  const data = await fontBytes
  if (!data) return undefined

  return [
    {
      name: FONT_FAMILY,
      data,
      style: "normal" as const,
      weight: 400 as const,
    },
  ]
}
