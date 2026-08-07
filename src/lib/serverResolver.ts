import axios from "axios";
import * as cheerio from "cheerio";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface ResolverSource {
  id: string;
  source: "Supabase" | "YTS" | "Real-Debrid" | "Web Scraper" | "Internet Archive" | "Direct Cloud";
  quality: string;
  type: "torrent" | "magnet" | "direct";
  url: string;
  size: string;
  seeds?: number;
  peers?: number;
  format?: string;
  hash?: string;
}

export interface ResolverResponse {
  success: boolean;
  imdbId: string | null;
  title: string;
  activeSourceType: "Supabase" | "YTS" | "Real-Debrid" | "Web Scraper" | "Internet Archive" | "Direct Cloud" | null;
  sources: ResolverSource[];
  requested?: boolean;
  message?: string;
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Referer": "https://www.google.com/",
};

// Initialize Supabase client if environment credentials exist
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://huncho-tv.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.log("Supabase client init fallback:", err);
  }
}

// In-Memory Database Cache for zero-latency hits
const IN_MEMORY_DOWNLOADS: Record<string, ResolverSource[]> = {
  tt0111161: [
    {
      id: "sp-1080p-tt0111161",
      source: "Supabase",
      quality: "1080p Supabase High-Speed Direct CDN",
      type: "direct",
      url: "https://huncho-tv.supabase.co/storage/v1/object/public/downloads/tt0111161/1080p.mp4",
      size: "1.85 GB",
      format: "MP4",
    },
    {
      id: "sp-720p-tt0111161",
      source: "Supabase",
      quality: "720p Fast Mobile Stream",
      type: "direct",
      url: "https://huncho-tv.supabase.co/storage/v1/object/public/downloads/tt0111161/720p.mp4",
      size: "950 MB",
      format: "MP4",
    },
  ],
  tt1375666: [
    {
      id: "sp-1080p-tt1375666",
      source: "Supabase",
      quality: "1080p Supabase Direct Cloud",
      type: "direct",
      url: "https://huncho-tv.supabase.co/storage/v1/object/public/downloads/tt1375666/1080p.mp4",
      size: "2.10 GB",
      format: "MP4",
    },
  ],
};

// In-memory store for logged missing requests
const IN_MEMORY_MISSING_REQUESTS: Array<{
  imdbId: string | null;
  title: string;
  year?: string;
  requestedAt: string;
  userNotified: boolean;
  userEmail?: string;
}> = [];

/**
 * Clean special characters from movie title and extract optional year context.
 */
function cleanMovieTitleAndYear(
  rawTitle: string,
  inputYear?: string | number
): { cleanTitle: string; year?: string; primaryFranchise: string } {
  const yearInTitleMatch = rawTitle.match(/\b(19\d\d|20\d\d)\b/);
  const extractedYear = yearInTitleMatch ? yearInTitleMatch[1] : undefined;

  const cleanTitle = rawTitle
    .replace(/\b(19\d\d|20\d\d)\b/g, "")
    .replace(/[:\-"',._!@#$%^&*()/\\?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const primaryFranchise = rawTitle
    .split(/[:\-]/)[0]
    .replace(/\b(19\d\d|20\d\d)\b/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const year = inputYear ? String(inputYear).trim() : extractedYear;

  return { cleanTitle, year, primaryFranchise };
}

/**
 * Real-Debrid API Unrestrict Integration
 * Unrestricts magnet / torrent links into direct high-speed HTTP downloads.
 */
export async function unrestrictWithRealDebrid(
  magnetUrl: string,
  debridApiKey?: string
): Promise<string | null> {
  const apiKey = debridApiKey || process.env.REAL_DEBRID_API_KEY || process.env.REAL_DEBRID_TOKEN;
  if (!apiKey) return null;

  try {
    // Step 1: Add magnet to Real-Debrid
    const addRes = await axios.post(
      "https://api.real-debrid.com/rest/1.0/torrents/addMagnet",
      new URLSearchParams({ magnet: magnetUrl }),
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 8000,
      }
    );

    const torrentId = addRes.data?.id;
    if (!torrentId) return null;

    // Step 2: Select all files
    await axios.post(
      `https://api.real-debrid.com/rest/1.0/torrents/selectFiles/${torrentId}`,
      new URLSearchParams({ files: "all" }),
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 6000,
      }
    );

    // Step 3: Get torrent info for generated links
    const infoRes = await axios.get(`https://api.real-debrid.com/rest/1.0/torrents/info/${torrentId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 6000,
    });

    const links = infoRes.data?.links;
    if (!links || links.length === 0) return null;

    // Step 4: Unrestrict the first generated link into direct HTTP stream
    const unrestrictRes = await axios.post(
      "https://api.real-debrid.com/rest/1.0/unrestrict/link",
      new URLSearchParams({ link: links[0] }),
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 8000,
      }
    );

    return unrestrictRes.data?.download || null;
  } catch (err) {
    console.log("Real-Debrid unrestricting error:", err);
    return null;
  }
}

/**
 * Multi-Source Web Scraper Pipeline for direct download links.
 */
export async function scrapeWebMirrors(
  movieTitle: string,
  inputYear?: string | number
): Promise<ResolverSource[]> {
  const { cleanTitle, year, primaryFranchise } = cleanMovieTitleAndYear(movieTitle, inputYear);

  const searchQueries: string[] = [];
  if (year) {
    searchQueries.push(`${cleanTitle} ${year}`);
  }
  searchQueries.push(cleanTitle);

  if (
    primaryFranchise &&
    primaryFranchise.toLowerCase() !== cleanTitle.toLowerCase() &&
    primaryFranchise.length > 2
  ) {
    searchQueries.push(primaryFranchise);
  }

  const scraperSites = [
    {
      name: "Nkiri",
      getSearchUrl: (q: string) => `https://nkiri.com/?s=${encodeURIComponent(q)}`,
      articleSelector: "article h2 a, article h3 a, .entry-title a, .post-title a, a[href*='nkiri.com/']",
    },
    {
      name: "NetNaija Mirror",
      getSearchUrl: (q: string) => `https://www.thenetnaija.co/search?sub=movies&t=${encodeURIComponent(q)}`,
      articleSelector: ".post-title a, .entry-title a, article h2 a, a[href*='netnaija']",
    },
    {
      name: "Awafim Mirror",
      getSearchUrl: (q: string) => `https://awafim.tv/search?q=${encodeURIComponent(q)}`,
      articleSelector: ".entry-title a, .post-title a, article a, a[href*='awafim']",
    },
  ];

  for (const query of searchQueries) {
    for (const site of scraperSites) {
      try {
        const searchUrl = site.getSearchUrl(query);
        const searchRes = await axios.get(searchUrl, {
          timeout: 6000,
          headers: BROWSER_HEADERS,
        });

        if (!searchRes.data) continue;

        const $ = cheerio.load(searchRes.data);
        const articleLinks: string[] = [];

        $(site.articleSelector).each((_, el) => {
          const href = $(el).attr("href");
          if (
            href &&
            href.startsWith("http") &&
            !articleLinks.includes(href) &&
            !href.endsWith(".com/") &&
            !href.endsWith(".tv/") &&
            !href.includes("/category/") &&
            !href.includes("/tag/")
          ) {
            articleLinks.push(href);
          }
        });

        if (articleLinks.length === 0) continue;

        for (const articleUrl of articleLinks.slice(0, 2)) {
          try {
            const pageRes = await axios.get(articleUrl, {
              timeout: 6000,
              headers: BROWSER_HEADERS,
            });

            if (!pageRes.data) continue;

            const $page = cheerio.load(pageRes.data);
            const scrapedLinks: ResolverSource[] = [];

            $page(
              'a[href*="download"], a.elementor-button, .entry-content a, .post-title a, a[href*=".mp4"], a[href*=".mkv"], a[href*="downloadw.me"], a[href*="filemoon"], a[href*="mega"], a[href*="drive.google"], a[href*="gofile"], a[href*="pixeldrain"]'
            ).each((idx, el) => {
              const href = $page(el).attr("href");
              const text = $page(el).text().trim();
              if (!href) return;

              const isDownloadLink =
                href.match(/\.(mp4|mkv|avi)$/i) ||
                href.includes("download") ||
                href.includes("downloadw.me") ||
                href.includes("filemoon") ||
                href.includes("mega") ||
                href.includes("drive.google") ||
                href.includes("gofile") ||
                href.includes("pixeldrain") ||
                href.includes("nkiri") ||
                text.toLowerCase().includes("download") ||
                text.toLowerCase().includes("server");

              const isValidHttp = href.startsWith("http://") || href.startsWith("https://");
              const isNotAd =
                !href.includes("javascript") &&
                !href.includes("facebook.com") &&
                !href.includes("twitter.com") &&
                !href.includes("instagram.com") &&
                !href.includes("whatsapp.com");

              if (isDownloadLink && isValidHttp && isNotAd) {
                const qualityMatch = text.match(/(1080p|720p|480p|4k|hd|webrip)/i);
                const quality = qualityMatch ? qualityMatch[0].toUpperCase() : "HD Web Mirror";

                scrapedLinks.push({
                  id: `web-${site.name.toLowerCase().replace(/\s+/g, "-")}-${idx}`,
                  source: "Web Scraper",
                  quality: `${quality} (${site.name})`,
                  type: "direct",
                  url: href,
                  size: "Direct Server Stream",
                  format: href.endsWith(".mkv") ? "MKV" : "MP4",
                });
              }
            });

            const validSources = scrapedLinks.filter(
              (s) => Boolean(s.url && s.url.trim().length > 0 && s.url.startsWith("http"))
            );

            if (validSources.length > 0) {
              return validSources.slice(0, 5);
            }
          } catch {
            console.log(`${site.name} article page fetch failed or blocked`);
          }
        }
      } catch {
        console.log(`${site.name} scraper hit 403 or empty`);
      }
    }
  }

  return [];
}

/**
 * Resolves movie download sources.
 * Architecture Flow:
 * Tier 1: Supabase `movie_downloads` Database-First Check
 * Tier 2: Torrent / YTS API (+ Real-Debrid Unrestrict Integration)
 * Tier 3: Multi-Source Web Scrapers
 * Tier 4: Internet Archive
 * Fallback: Gracefully log request to `missing_movie_requests` and return empty state.
 */
export async function resolveBackendDownloads(
  imdbId: string | null,
  title: string,
  inputYear?: string | number,
  debridApiKey?: string
): Promise<ResolverResponse> {
  const { cleanTitle, year } = cleanMovieTitleAndYear(title, inputYear);

  // TIER 1: Database-First Check (Supabase movie_downloads table)
  try {
    if (supabase) {
      let query = supabase.from("movie_downloads").select("*");
      if (imdbId && imdbId.startsWith("tt")) {
        query = query.eq("imdb_id", imdbId);
      } else {
        query = query.ilike("title", `%${cleanTitle}%`);
      }

      const { data: dbRows, error } = await query;
      if (!error && dbRows && dbRows.length > 0) {
        const verifiedSources: ResolverSource[] = dbRows.map((row: any, idx: number) => ({
          id: row.id || `supabase-${row.imdb_id || "m"}-${idx}`,
          source: "Supabase",
          quality: row.quality || "1080p Verified Supabase Direct Link",
          type: (row.type as any) || "direct",
          url: row.download_url || row.url,
          size: row.size || "Direct High-Speed CDN",
          format: row.format || "MP4",
        }));

        const validDbSources = verifiedSources.filter(
          (s) => Boolean(s.url && s.url.trim().length > 0 && s.url.startsWith("http"))
        );

        if (validDbSources.length > 0) {
          return {
            success: true,
            imdbId,
            title: cleanTitle,
            activeSourceType: "Supabase",
            sources: validDbSources,
          };
        }
      }
    }

    // In-memory Supabase fallback cache check
    if (imdbId && IN_MEMORY_DOWNLOADS[imdbId]) {
      return {
        success: true,
        imdbId,
        title: cleanTitle,
        activeSourceType: "Supabase",
        sources: IN_MEMORY_DOWNLOADS[imdbId],
      };
    }
  } catch (err) {
    console.log("Supabase Tier 1 query failed/falling back:", err);
  }

  // TIER 2: YTS Torrent API (+ Optional Real-Debrid Unrestricting)
  try {
    let ytsData: any = null;

    if (imdbId && imdbId.startsWith("tt")) {
      const res = await axios.get(
        `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(imdbId)}`,
        { timeout: 5000, headers: BROWSER_HEADERS }
      );
      ytsData = res.data;
    }

    if ((!ytsData || !ytsData.data?.movie_count) && year) {
      const res = await axios.get(
        `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(cleanTitle)}&year=${encodeURIComponent(year)}`,
        { timeout: 5000, headers: BROWSER_HEADERS }
      );
      ytsData = res.data;
    }

    if (!ytsData || !ytsData.data?.movie_count) {
      const res = await axios.get(
        `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(cleanTitle)}`,
        { timeout: 5000, headers: BROWSER_HEADERS }
      );
      ytsData = res.data;
    }

    const ytsSources = extractYtsSources(ytsData, title);
    if (ytsSources.length > 0) {
      // Check for Real-Debrid Unrestricting
      const firstMagnet = ytsSources.find((s) => s.type === "magnet");
      if (firstMagnet && (debridApiKey || process.env.REAL_DEBRID_API_KEY || process.env.REAL_DEBRID_TOKEN)) {
        const unrestrictedUrl = await unrestrictWithRealDebrid(firstMagnet.url, debridApiKey);
        if (unrestrictedUrl) {
          ytsSources.unshift({
            id: `rd-${Date.now()}`,
            source: "Real-Debrid",
            quality: "1080p High-Speed Direct HTTP Stream",
            type: "direct",
            url: unrestrictedUrl,
            size: firstMagnet.size || "Direct High-Speed Stream",
            format: "MP4",
          });
          return {
            success: true,
            imdbId,
            title: cleanTitle,
            activeSourceType: "Real-Debrid",
            sources: ytsSources,
          };
        }
      }

      return {
        success: true,
        imdbId,
        title: cleanTitle,
        activeSourceType: "YTS",
        sources: ytsSources,
      };
    }
  } catch {
    // YTS API fallback
  }

  // TIER 3: Multi-Source Web Scraper Fallback
  const scrapedSources = await scrapeWebMirrors(title, year);
  if (scrapedSources.length > 0) {
    return {
      success: true,
      imdbId,
      title: cleanTitle,
      activeSourceType: "Web Scraper",
      sources: scrapedSources,
    };
  }

  // TIER 4: Internet Archive API Fallback
  try {
    const iaSearchUrl = `https://archive.org/advancedsearch.php?q=title:("${encodeURIComponent(cleanTitle)}") AND mediatype:movies&fl[]=identifier,title&sort[]=&rows=5&page=1&output=json`;
    const iaSearchRes = await axios.get(iaSearchUrl, { timeout: 6000, headers: BROWSER_HEADERS });
    const docs = iaSearchRes.data?.response?.docs;

    if (docs && docs.length > 0) {
      for (const doc of docs.slice(0, 3)) {
        const identifier = doc.identifier;
        if (!identifier) continue;

        try {
          const metaUrl = `https://archive.org/metadata/${identifier}/files`;
          const metaRes = await axios.get(metaUrl, { timeout: 5000, headers: BROWSER_HEADERS });
          const files = metaRes.data?.files || [];

          const videoFiles = files.filter((f: any) => {
            if (!f.name) return false;
            const ext = f.name.split(".").pop()?.toLowerCase();
            const format = (f.format || "").toLowerCase();
            const isVideoExt = ["mp4", "mkv", "avi", "mov"].includes(ext || "");
            const isVideoFormat = format.includes("mp4") || format.includes("mpeg") || format.includes("512kb");
            const isExcluded =
              f.name.includes("_thumb") ||
              f.name.includes("_xml") ||
              f.name.endsWith(".png") ||
              f.name.endsWith(".jpg") ||
              f.name.endsWith(".sqlite");
            return (isVideoExt || isVideoFormat) && !isExcluded;
          });

          if (videoFiles.length > 0) {
            const rawSources: ResolverSource[] = videoFiles.slice(0, 5).map((vf: any, idx: number) => {
              const fileExt = vf.name.split(".").pop()?.toUpperCase() || "MP4";
              const heightLabel = vf.height ? `${vf.height}p` : "HD";
              return {
                id: `ia-${identifier}-${idx}`,
                source: "Internet Archive",
                quality: `${heightLabel} ${fileExt} Direct Stream`,
                type: "direct",
                url: `https://archive.org/download/${identifier}/${encodeURIComponent(vf.name)}`,
                size: vf.size ? `${(vf.size / (1024 * 1024)).toFixed(0)} MB` : "Direct Stream",
                format: fileExt,
              };
            });

            const validSources = rawSources.filter((s) => Boolean(s.url && s.url.trim().length > 0));
            if (validSources.length > 0) {
              return {
                success: true,
                imdbId,
                title: cleanTitle,
                activeSourceType: "Internet Archive",
                sources: validSources,
              };
            }
          }
        } catch {
          // Continue loop
        }
      }
    }
  } catch {
    // Internet Archive fallback
  }

  // TIER 5: Graceful Missing Movie Request Logging
  await logMissingMovieRequest(imdbId, cleanTitle, year);

  return {
    success: false,
    imdbId,
    title: cleanTitle,
    activeSourceType: null,
    sources: [],
    requested: true,
    message: "Movie Link Coming Soon - Request Recorded",
  };
}

/**
 * Log missing movie requests into Supabase missing_movie_requests table.
 */
export async function logMissingMovieRequest(
  imdbId: string | null,
  title: string,
  year?: string
): Promise<void> {
  const requestEntry = {
    imdb_id: imdbId || null,
    title: title.trim(),
    year: year || null,
    requested_at: new Date().toISOString(),
    user_notified: false,
    status: "pending",
  };

  try {
    if (supabase) {
      await supabase.from("missing_movie_requests").upsert([requestEntry], { onConflict: "title" });
    }
  } catch (err) {
    console.log("Supabase missing request log error:", err);
  }

  IN_MEMORY_MISSING_REQUESTS.push({
    imdbId,
    title,
    year,
    requestedAt: new Date().toISOString(),
    userNotified: false,
  });
}

/**
 * Record user notification request when user clicks "Notify Me When Available".
 */
export async function recordUserNotification(
  imdbId: string | null,
  title: string,
  email?: string
): Promise<boolean> {
  try {
    if (supabase) {
      let query = supabase.from("missing_movie_requests").update({
        user_notified: true,
        user_email: email || null,
        notified_at: new Date().toISOString(),
      });

      if (imdbId && imdbId.startsWith("tt")) {
        query = query.eq("imdb_id", imdbId);
      } else {
        query = query.ilike("title", `%${title}%`);
      }

      await query;
    }

    const item = IN_MEMORY_MISSING_REQUESTS.find(
      (r) => (imdbId && r.imdbId === imdbId) || r.title.toLowerCase() === title.toLowerCase()
    );

    if (item) {
      item.userNotified = true;
      if (email) item.userEmail = email;
    }

    return true;
  } catch (err) {
    console.log("Record user notification failed:", err);
    return false;
  }
}

function extractYtsSources(data: any, fallbackTitle: string): ResolverSource[] {
  const movieData = data?.data;
  if (!movieData || movieData.movie_count === 0 || !movieData.movies?.[0]?.torrents?.length) {
    return [];
  }
  const ytsMovie = movieData.movies[0];
  const rawSources: ResolverSource[] = ytsMovie.torrents.map((t: any, idx: number) => {
    const qualityStr = `${t.quality || "1080p"} ${t.type ? t.type.toUpperCase() : "WEBRip"}`;
    const magnetUrl = t.hash
      ? `magnet:?xt=urn:btih:${t.hash}&dn=${encodeURIComponent(ytsMovie.title || fallbackTitle)}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:8080&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce`
      : t.url;
    return {
      id: `yts-${t.hash || idx}`,
      source: "YTS",
      quality: qualityStr,
      type: t.hash ? "magnet" : "torrent",
      url: magnetUrl || "",
      size: t.size || "Unknown size",
      seeds: t.seeds,
      peers: t.peers,
      format: t.type || "MP4/MKV",
      hash: t.hash,
    };
  });

  return rawSources.filter(
    (s) => Boolean(s.url && s.url.trim().length > 0 && (s.url.startsWith("http") || s.url.startsWith("magnet:")))
  );
}
