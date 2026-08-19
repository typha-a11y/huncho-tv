import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WatchHistoryItem, UserProfile, UserDownloadItem } from "../types";
import { 
  fetchUserWatchlist, 
  addToUserWatchlist, 
  removeFromUserWatchlist,
  fetchUserHistory,
  saveUserHistoryItem,
  deleteUserHistoryItem,
  fetchUserDownloads,
  saveUserDownloadItem,
  deleteUserDownloadItem,
  deleteAllUserDownloads,
  syncUserProfile
} from "./syncService";

interface AppState {
  // Auth & Sync state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncCloudData: (targetUserId?: string) => Promise<void>;

  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  checkAuthGuard: (actionName?: string) => boolean;

  // Watchlist & History
  watchlist: (number | string)[];
  addToWatchlist: (id: number | string, meta?: { title?: string; posterPath?: string; rating?: number }) => void;
  removeFromWatchlist: (id: number | string) => void;
  
  history: Record<string, WatchHistoryItem>;
  updateHistory: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: number | string) => void;
  
  // Downloads
  downloads: UserDownloadItem[];
  addDownload: (item: UserDownloadItem) => void;
  removeDownload: (id: string) => void;
  clearAllDownloads: () => void;

  // Movie details & player
  selectedMovieId: number | string | null;
  selectedMediaType: "movie" | "tv" | null;
  setSelectedMovieId: (id: number | string | null, mediaType?: "movie" | "tv" | string | null) => void;
  
  isVideoPlayerOpen: boolean;
  videoStreamUrl: string | null;
  videoStreamTitle: string | null;
  isLiveStream?: boolean;
  channelSlug?: string | null;
  liveCategory?: string | null;
  liveStreamType?: string | null;
  setVideoPlayerOpen: (
    isOpen: boolean,
    streamUrl?: string | null,
    streamTitle?: string | null,
    livePayload?: {
      isLiveStream?: boolean;
      title?: string;
      category?: string;
      streamType?: string;
      channelSlug?: string;
    }
  ) => void;

  autoPlayTrailer: boolean;
  setAutoPlayTrailer: (autoPlay: boolean) => void;
  toggleAutoPlayTrailer: () => void;

  // Download modal
  isDownloadModalOpen: boolean;
  downloadTarget: { title: string; imdbId: string | null; movieId?: number | string; year?: string | number } | null;
  openDownloadModal: (title: string, imdbId?: string | null, movieId?: number | string, year?: string | number) => void;
  closeDownloadModal: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth & Sync State Initializer
      user: null,
      isSyncing: false,
      lastSyncedAt: null,

      setUser: (user) => {
        set({ user });
        if (user?.id) {
          syncUserProfile(user);
          get().syncCloudData(user.id);
        }
      },

      syncCloudData: async (targetUserId) => {
        const userId = targetUserId || get().user?.id;
        if (!userId) return;

        set({ isSyncing: true });
        try {
          const [cloudWatchlist, cloudHistory, cloudDownloads] = await Promise.all([
            fetchUserWatchlist(userId),
            fetchUserHistory(userId),
            fetchUserDownloads(userId),
          ]);

          set((state) => {
            // Merge local watchlist with cloud watchlist
            const mergedWatchlist = Array.from(new Set([...state.watchlist, ...cloudWatchlist]));

            // Merge local history with cloud history
            const mergedHistory = { ...cloudHistory, ...state.history };

            // Merge local downloads with cloud downloads
            const seenDl = new Set<string>();
            const mergedDownloads: UserDownloadItem[] = [];
            [...cloudDownloads, ...state.downloads].forEach((item) => {
              const key = item.id || item.movie_id;
              if (!seenDl.has(key)) {
                seenDl.add(key);
                mergedDownloads.push(item);
              }
            });

            return {
              watchlist: mergedWatchlist,
              history: mergedHistory,
              downloads: mergedDownloads,
              isSyncing: false,
              lastSyncedAt: Date.now(),
            };
          });

          // Push any unsynced local items to cloud
          const currentState = get();
          currentState.watchlist.forEach((id) => {
            addToUserWatchlist(userId, id);
          });
          Object.values(currentState.history).forEach((item) => {
            saveUserHistoryItem(userId, item);
          });
          currentState.downloads.forEach((item) => {
            saveUserDownloadItem(userId, item);
          });
        } catch (err) {
          console.warn("syncCloudData failed:", err);
          set({ isSyncing: false });
        }
      },
      
      isAuthModalOpen: false,
      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      checkAuthGuard: (_actionName) => {
        const { user } = get();
        if (!user) {
          set({ isAuthModalOpen: true });
          return false;
        }
        return true;
      },

      // Watchlist
      watchlist: [],
      addToWatchlist: (id, meta) => {
        set((state) => ({
          watchlist: state.watchlist.includes(id)
            ? state.watchlist
            : [...state.watchlist, id],
        }));

        const { user } = get();
        if (user?.id) {
          addToUserWatchlist(user.id, id, meta);
        }
      },
      removeFromWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.filter((wId) => wId !== id),
        }));

        const { user } = get();
        if (user?.id) {
          removeFromUserWatchlist(user.id, id);
        }
      },

      // Watch History
      history: {},
      updateHistory: (item) => {
        set((state) => ({
          history: { ...state.history, [item.id]: item },
        }));

        const { user } = get();
        if (user?.id) {
          saveUserHistoryItem(user.id, item);
        }
      },
      removeFromHistory: (id) => {
        set((state) => {
          const newHistory = { ...state.history };
          delete newHistory[id];
          return { history: newHistory };
        });

        const { user } = get();
        if (user?.id) {
          deleteUserHistoryItem(user.id, id);
        }
      },

      // Downloads
      downloads: [],
      addDownload: (item) => {
        set((state) => ({
          downloads: [item, ...state.downloads.filter((d) => d.id !== item.id)],
        }));

        const { user } = get();
        if (user?.id) {
          saveUserDownloadItem(user.id, item);
        }
      },
      removeDownload: (id) => {
        set((state) => ({
          downloads: state.downloads.filter((item) => item.id !== id),
        }));

        const { user } = get();
        if (user?.id) {
          deleteUserDownloadItem(user.id, id);
        }
      },
      clearAllDownloads: () => {
        set({ downloads: [] });

        const { user } = get();
        if (user?.id) {
          deleteAllUserDownloads(user.id);
        }
      },

      // Selected movie
      selectedMovieId: null,
      selectedMediaType: null,
      setSelectedMovieId: (id, mediaType = null) => set({ 
        selectedMovieId: id, 
        selectedMediaType: (mediaType === "tv" || mediaType === "movie") ? mediaType : null 
      }),
      
      // Video player
      isVideoPlayerOpen: false,
      videoStreamUrl: null,
      videoStreamTitle: null,
      isLiveStream: false,
      channelSlug: null,
      liveCategory: null,
      liveStreamType: null,
      setVideoPlayerOpen: (isOpen, streamUrl = null, streamTitle = null, livePayload = {}) => 
        set({ 
          isVideoPlayerOpen: isOpen, 
          videoStreamUrl: streamUrl, 
          videoStreamTitle: livePayload?.title || streamTitle,
          isLiveStream: Boolean(livePayload?.isLiveStream),
          channelSlug: livePayload?.channelSlug || null,
          liveCategory: livePayload?.category || "Live TV",
          liveStreamType: livePayload?.streamType || "direct_hls"
        }),

      // Settings
      autoPlayTrailer: false,
      setAutoPlayTrailer: (autoPlay) => set({ autoPlayTrailer: autoPlay }),
      toggleAutoPlayTrailer: () => set((state) => ({ autoPlayTrailer: !state.autoPlayTrailer })),

      // Download modal
      isDownloadModalOpen: false,
      downloadTarget: null,
      openDownloadModal: (title, imdbId = null, movieId, year) =>
        set({
          isDownloadModalOpen: true,
          downloadTarget: { title, imdbId: imdbId || null, movieId, year },
        }),
      closeDownloadModal: () =>
        set({
          isDownloadModalOpen: false,
          downloadTarget: null,
        }),
    }),
    {
      name: "huncho-tv-storage",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          if (persistedState.downloads) {
            persistedState.downloads = persistedState.downloads.filter(
              (d: any) => !["dl-1", "dl-2", "dl-3"].includes(d.id)
            );
          }
        }
        return persistedState;
      },
      partialize: (state) => ({ 
        user: state.user,
        watchlist: state.watchlist, 
        history: state.history,
        downloads: state.downloads,
        autoPlayTrailer: state.autoPlayTrailer,
      }),
    }
  )
);
