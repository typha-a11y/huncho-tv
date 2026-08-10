/**
 * Image and Title Utility Functions for Huncho TV
 */

import { fetchTmdbPosterFallback } from "./api";

/**
 * Transforms or validates image URLs for Nkiri, TMDB, and local assets.
 */
export function getSafeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed === "/placeholder-poster.png") {
    return "";
  }

  // Handle local assets and data URLs
  if (
    trimmed.startsWith("/assets/") ||
    trimmed.startsWith("/logo") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("/placeholder")) {
    return "";
  }

  // Handle TMDB relative paths e.g. "/path.jpg"
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return `https://image.tmdb.org/t/p/w500${trimmed}`;
  }

  // Handle TMDB full URLs
  if (trimmed.includes("tmdb.org")) {
    return trimmed;
  }

  // Handle hotlink-blocked or scraped domains (nkiri, thenkiri, wp-content) via wsrv.nl proxy
  if (
    trimmed.includes("nkiri") ||
    trimmed.includes("thenkiri") ||
    trimmed.includes("wp-content")
  ) {
    return `https://wsrv.nl/?url=${encodeURIComponent(trimmed)}&output=webp`;
  }

  return trimmed;
}

/**
 * Strips season/episode indicators and quality tags from raw scraped movie titles
 * to optimize TMDB search queries.
 * E.g., "Lucky S01 (Episode 5 Added)" -> "Lucky"
 */
export function cleanTitleForTMDB(rawTitle: string | null | undefined): string {
  if (!rawTitle) return "";
  let clean = rawTitle;

  // Remove Season and Episode indicators and anything following them (e.g., S01, Season 1, Episode 5 Added)
  clean = clean.replace(/(\b(season|s)\s*\d+.*|\bepisode\s*\d+.*|\bep\s*\d+.*)/gi, "");

  // Remove common quality and release tags
  clean = clean
    .replace(/\b(complete|1080p|720p|4k|web-?dl|webrip|hdtv|x264|x265|hevc|aac)\b/gi, "")
    .replace(/[\(\)\[\]\{\}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return clean;
}

/**
 * Shared poster URL resolution function.
 * Given a raw poster URL/path and a title, resolves to:
 * 1) A TMDB high-res poster if available or matched via fallback
 * 2) A safe proxied image URL for Nkiri/WordPress hotlinked images
 * 3) Empty string as last resort (triggering UI component neutral gray fallback)
 */
export async function resolvePosterUrl(
  posterPathOrUrl?: string | null,
  title?: string | null
): Promise<string> {
  const cleanTitle = cleanTitleForTMDB(title);

  const isNkiri = Boolean(
    posterPathOrUrl &&
    typeof posterPathOrUrl === "string" &&
    (posterPathOrUrl.includes("thenkiri") || posterPathOrUrl.includes("nkiri") || posterPathOrUrl.includes("wp-content"))
  );

  // If TMDB path or URL, return directly
  if (posterPathOrUrl && (posterPathOrUrl.startsWith("/") || posterPathOrUrl.includes("tmdb.org"))) {
    const safe = getSafeImageUrl(posterPathOrUrl);
    if (safe) return safe;
  }

  // If missing or Nkiri, attempt TMDB live fallback search first using clean title
  if (!posterPathOrUrl || isNkiri) {
    if (cleanTitle) {
      const tmdbMatch = await fetchTmdbPosterFallback(cleanTitle);
      if (tmdbMatch) {
        return tmdbMatch;
      }
    }
  }

  // Fallback to proxy if Nkiri or other URL
  if (posterPathOrUrl) {
    return getSafeImageUrl(posterPathOrUrl);
  }

  return "";
}

