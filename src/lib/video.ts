/**
 * Best-effort thumbnail lookup for a lesson's video URL. Only handles
 * providers that expose a predictable, no-auth thumbnail URL (YouTube) so
 * this never needs a network call at render time. Anything else (Vimeo,
 * direct .mp4 links, etc.) falls back to a generic player card in the UI.
 */
export function getVideoThumbnail(url: string): string | null {
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  return null;
}

function extractYouTubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\.|^m\./, "");
  if (!["youtube.com", "youtu.be"].includes(host)) return null;

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return id || null;
  }

  if (parsed.pathname === "/watch") {
    return parsed.searchParams.get("v");
  }

  const embedMatch = parsed.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
  if (embedMatch) return embedMatch[2];

  return null;
}
