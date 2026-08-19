import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { WatchHistoryItem, UserDownloadItem, UserProfile } from "../types";

/**
 * Sync user profile details to Supabase 'profiles' table
 */
export async function syncUserProfile(user: UserProfile): Promise<UserProfile> {
  if (!isSupabaseConfigured || !user.id) return user;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.full_name || null,
        avatar_url: user.avatar_url || null,
        is_pro: user.is_pro ?? true,
      }, { onConflict: "id" })
      .select()
      .single();

    if (!error && data) {
      return {
        ...user,
        full_name: data.full_name || user.full_name,
        avatar_url: data.avatar_url || user.avatar_url,
        is_pro: data.is_pro ?? user.is_pro,
      };
    }
  } catch (err) {
    console.warn("syncUserProfile error:", err);
  }
  return user;
}

/**
 * Fetch watchlist items for a given user from Supabase
 */
export async function fetchUserWatchlist(userId: string): Promise<(number | string)[]> {
  if (!isSupabaseConfigured || !userId) return [];

  try {
    const { data, error } = await supabase
      .from("watchlists")
      .select("movie_id")
      .eq("user_id", userId);

    if (!error && data) {
      return data.map((item) => {
        // Convert back to number if numeric ID string
        const num = Number(item.movie_id);
        return !isNaN(num) && String(num) === item.movie_id ? num : item.movie_id;
      });
    }
  } catch (err) {
    console.warn("fetchUserWatchlist error:", err);
  }
  return [];
}

/**
 * Add a movie or show to user's Supabase watchlist
 */
export async function addToUserWatchlist(
  userId: string,
  movieId: number | string,
  meta?: { title?: string; posterPath?: string; rating?: number }
) {
  if (!isSupabaseConfigured || !userId) return;

  try {
    await supabase.from("watchlists").upsert(
      {
        user_id: userId,
        movie_id: String(movieId),
        title: meta?.title || `Movie #${movieId}`,
        poster_path: meta?.posterPath || null,
        rating: meta?.rating || 0,
        added_at: new Date().toISOString(),
      },
      { onConflict: "user_id,movie_id" }
    );
  } catch (err) {
    console.warn("addToUserWatchlist error:", err);
  }
}

/**
 * Remove a movie or show from user's Supabase watchlist
 */
export async function removeFromUserWatchlist(userId: string, movieId: number | string) {
  if (!isSupabaseConfigured || !userId) return;

  try {
    await supabase
      .from("watchlists")
      .delete()
      .eq("user_id", userId)
      .eq("movie_id", String(movieId));
  } catch (err) {
    console.warn("removeFromUserWatchlist error:", err);
  }
}

/**
 * Fetch watch history (Continue Watching) for a user from Supabase
 */
export async function fetchUserHistory(
  userId: string
): Promise<Record<string, WatchHistoryItem>> {
  if (!isSupabaseConfigured || !userId) return {};

  try {
    const { data, error } = await supabase
      .from("watch_history")
      .select("*")
      .eq("user_id", userId)
      .order("last_watched_at", { ascending: false });

    if (!error && data) {
      const historyMap: Record<string, WatchHistoryItem> = {};
      data.forEach((row) => {
        const mId = row.movie_id;
        const num = Number(mId);
        const parsedId = !isNaN(num) && String(num) === mId ? num : mId;

        historyMap[mId] = {
          id: parsedId,
          title: row.title || "Untitled",
          poster_path: row.poster_path || null,
          progress: Number(row.progress_seconds || 0),
          duration: Number(row.duration_seconds || 0),
          updatedAt: row.last_watched_at ? new Date(row.last_watched_at).getTime() : Date.now(),
        };
      });
      return historyMap;
    }
  } catch (err) {
    console.warn("fetchUserHistory error:", err);
  }
  return {};
}

/**
 * Upsert watch progress into user's Supabase watch_history
 */
export async function saveUserHistoryItem(userId: string, item: WatchHistoryItem) {
  if (!isSupabaseConfigured || !userId) return;

  try {
    await supabase.from("watch_history").upsert(
      {
        user_id: userId,
        movie_id: String(item.id),
        title: item.title || "Untitled",
        poster_path: item.poster_path || null,
        progress_seconds: Math.round(item.progress || 0),
        duration_seconds: Math.round(item.duration || 0),
        last_watched_at: new Date(item.updatedAt || Date.now()).toISOString(),
      },
      { onConflict: "user_id,movie_id" }
    );
  } catch (err) {
    console.warn("saveUserHistoryItem error:", err);
  }
}

/**
 * Delete a watch history record from user's Supabase account
 */
export async function deleteUserHistoryItem(userId: string, movieId: number | string) {
  if (!isSupabaseConfigured || !userId) return;

  try {
    await supabase
      .from("watch_history")
      .delete()
      .eq("user_id", userId)
      .eq("movie_id", String(movieId));
  } catch (err) {
    console.warn("deleteUserHistoryItem error:", err);
  }
}

/**
 * Fetch saved offline downloads for user from Supabase
 */
export async function fetchUserDownloads(userId: string): Promise<UserDownloadItem[]> {
  if (!isSupabaseConfigured || !userId) return [];

  try {
    const { data, error } = await supabase
      .from("user_downloads")
      .select("*")
      .eq("user_id", userId)
      .order("downloaded_at", { ascending: false });

    if (!error && data) {
      return data.map((row) => ({
        id: row.id || `dl_${row.movie_id}`,
        movie_id: row.movie_id,
        title: row.title,
        poster_path: row.poster_path || null,
        quality: row.quality || "1080p",
        file_size: row.file_size || "1.2 GB",
        download_url: row.download_url,
        downloaded_at: row.downloaded_at,
        source_type: "Cloud",
      }));
    }
  } catch (err) {
    console.warn("fetchUserDownloads error:", err);
  }
  return [];
}

/**
 * Save download item to user's Supabase account
 */
export async function saveUserDownloadItem(userId: string, item: UserDownloadItem) {
  if (!isSupabaseConfigured || !userId) return;

  try {
    await supabase.from("user_downloads").upsert(
      {
        user_id: userId,
        movie_id: String(item.movie_id || item.id),
        title: item.title,
        poster_path: item.poster_path || null,
        quality: item.quality || "1080p",
        file_size: item.file_size || "1.2 GB",
        download_url: item.download_url,
        downloaded_at: item.downloaded_at || new Date().toISOString(),
      },
      { onConflict: "user_id,movie_id" }
    );
  } catch (err) {
    console.warn("saveUserDownloadItem error:", err);
  }
}

/**
 * Delete a download item from user's Supabase account
 */
export async function deleteUserDownloadItem(userId: string, downloadId: string) {
  if (!isSupabaseConfigured || !userId) return;

  try {
    await supabase
      .from("user_downloads")
      .delete()
      .eq("user_id", userId)
      .or(`id.eq.${downloadId},movie_id.eq.${downloadId}`);
  } catch (err) {
    console.warn("deleteUserDownloadItem error:", err);
  }
}

/**
 * Delete ALL download items from user's Supabase account
 */
export async function deleteAllUserDownloads(userId: string) {
  if (!isSupabaseConfigured || !userId) return;

  try {
    await supabase
      .from("user_downloads")
      .delete()
      .eq("user_id", userId);
  } catch (err) {
    console.warn("deleteAllUserDownloads error:", err);
  }
}

