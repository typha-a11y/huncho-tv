import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WatchHistoryItem, UserProfile, UserDownloadItem } from "../types";

interface AppState {
  // Auth state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  checkAuthGuard: (actionName?: string) => boolean;

  // Watchlist & History
  watchlist: (number | string)[];
  addToWatchlist: (id: number | string) => void;
  removeFromWatchlist: (id: number | string) => void;
  
  history: Record<string, WatchHistoryItem>;
  updateHistory: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: number | string) => void;
  
  // Downloads
  downloads: UserDownloadItem[];
  addDownload: (item: UserDownloadItem) => void;
  removeDownload: (id: string) => void;

  // Movie details & player
  selectedMovieId: number | string | null;
  setSelectedMovieId: (id: number | string | null) => void;
  
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
      // Auth State Initializer
      user: null,
      setUser: (user) => set({ user }),
      
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
      addToWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.includes(id)
            ? state.watchlist
            : [...state.watchlist, id],
        }));
      },
      removeFromWatchlist: (id) =>
        set((state) => ({
          watchlist: state.watchlist.filter((wId) => wId !== id),
        })),

      // Watch History
      history: {},
      updateHistory: (item) =>
        set((state) => ({
          history: { ...state.history, [item.id]: item },
        })),
      removeFromHistory: (id) =>
        set((state) => {
          const newHistory = { ...state.history };
          delete newHistory[id];
          return { history: newHistory };
        }),

      // Downloads
      downloads: [],
      addDownload: (item) =>
        set((state) => ({
          downloads: [item, ...state.downloads.filter((d) => d.id !== item.id)],
        })),
      removeDownload: (id) =>
        set((state) => ({
          downloads: state.downloads.filter((item) => item.id !== id),
        })),

      // Selected movie
      selectedMovieId: null,
      setSelectedMovieId: (id) => set({ selectedMovieId: id }),
      
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

