import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { WatchHistoryItem, UserDownloadItem, UserProfile } from "../types";

/**
 * Fetch and build the complete, authoritative UserProfile from Supabase
 * combining public.profiles table and auth.users user_metadata
 */
export async function fetchUserProfile(userId: string, authUser?: any): Promise<UserProfile | null> {
  if (!userId) return null;

  let baseEmail = authUser?.email || "";
  let baseFullName = authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "User";
  let baseAvatar = authUser?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(userId)}`;
  let isPro = Boolean(authUser?.user_metadata?.is_pro);
  let planType = authUser?.user_metadata?.plan_type as "daily" | "weekly" | "monthly" | "yearly" | undefined;
  let planName = authUser?.user_metadata?.plan_name;
  let planPrice = authUser?.user_metadata?.plan_price;
  let planExpiresAt = authUser?.user_metadata?.plan_expires_at;
  let createdAt = authUser?.created_at || new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      // 1. Check public.profiles table
      const { data: profileRow, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && profileRow) {
        if (profileRow.email) baseEmail = profileRow.email;
        if (profileRow.full_name) baseFullName = profileRow.full_name;
        if (profileRow.avatar_url) baseAvatar = profileRow.avatar_url;
        if (profileRow.is_pro !== undefined && profileRow.is_pro !== null) {
          isPro = Boolean(profileRow.is_pro);
        }
        if (profileRow.plan_type) planType = profileRow.plan_type;
        if (profileRow.plan_name) planName = profileRow.plan_name;
        if (profileRow.plan_price) planPrice = profileRow.plan_price;
        if (profileRow.plan_expires_at) planExpiresAt = profileRow.plan_expires_at;
        if (profileRow.created_at) createdAt = profileRow.created_at;
      } else if (!profileRow) {
        // Create initial profile row if not existing
        await supabase.from("profiles").upsert(
          {
            id: userId,
            email: baseEmail,
            full_name: baseFullName,
            avatar_url: baseAvatar,
            is_pro: isPro,
          },
          { onConflict: "id" }
        );
      }
    } catch (err) {
      console.warn("fetchUserProfile Supabase query error:", err);
    }
  }

  // Check subscription expiry date if present
  if (planExpiresAt) {
    const expTime = new Date(planExpiresAt).getTime();
    if (!isNaN(expTime) && expTime < Date.now()) {
      isPro = false;
    }
  }

  // If user is pro but missing plan details, assign default monthly plan metadata
  if (isPro && !planName) {
    planName = "Huncho VIP (Monthly)";
    planPrice = "TZS 12,000";
    planType = "monthly";
    if (!planExpiresAt) {
      planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  return {
    id: userId,
    email: baseEmail,
    full_name: baseFullName,
    avatar_url: baseAvatar,
    is_pro: isPro,
    plan_type: planType,
    plan_name: planName,
    plan_price: planPrice,
    plan_expires_at: planExpiresAt,
    created_at: createdAt,
  };
}

/**
 * Sync user profile details to Supabase 'profiles' table and auth.users metadata
 */
export async function syncUserProfile(user: UserProfile): Promise<UserProfile> {
  if (!user?.id) return user;

  // 1. Update Supabase Auth user metadata for immediate cross-device sync
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          is_pro: user.is_pro,
          plan_type: user.plan_type,
          plan_name: user.plan_name,
          plan_price: user.plan_price,
          plan_expires_at: user.plan_expires_at,
        },
      });
    } catch (authErr) {
      console.warn("syncUserProfile auth metadata update notice:", authErr);
    }

    // 2. Upsert to public.profiles table (handling schema columns gracefully)
    try {
      const fullPayload: Record<string, any> = {
        id: user.id,
        email: user.email,
        full_name: user.full_name || null,
        avatar_url: user.avatar_url || null,
        is_pro: Boolean(user.is_pro),
        plan_type: user.plan_type || null,
        plan_name: user.plan_name || null,
        plan_price: user.plan_price || null,
        plan_expires_at: user.plan_expires_at || null,
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(fullPayload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        // Fallback for basic schema in case custom plan columns are not present
        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.full_name || null,
            avatar_url: user.avatar_url || null,
            is_pro: Boolean(user.is_pro),
          }, { onConflict: "id" });
      } else if (data) {
        return {
          ...user,
          full_name: data.full_name || user.full_name,
          avatar_url: data.avatar_url || user.avatar_url,
          is_pro: data.is_pro !== undefined ? Boolean(data.is_pro) : user.is_pro,
          plan_type: data.plan_type || user.plan_type,
          plan_name: data.plan_name || user.plan_name,
          plan_price: data.plan_price || user.plan_price,
          plan_expires_at: data.plan_expires_at || user.plan_expires_at,
        };
      }
    } catch (err) {
      console.warn("syncUserProfile database error:", err);
    }
  }

  return user;
}

/**
 * Sign out user from Supabase and invalidate remote session
 */
export async function signOutUser(): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("signOutUser error:", err);
  }
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

