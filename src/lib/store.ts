import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WatchHistoryItem, UserProfile, UserDownloadItem } from "../types";

// Sample initial downloads for instant interactive UI preview
const INITIAL_DEMO_DOWNLOADS: UserDownloadItem[] = [
  {
    id: "dl-1",
    movie_id: "550",
    title: "Fight Club (1999)",
    poster_path: "/pB8O23J31H2m335B331A.jpg",
    quality: "1080p",
    file_size: "1.8 GB",
    download_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    downloaded_at: "2026-08-05T14:32:00Z",
    duration: "2h 19m",
    source_type: "Local Files"
  },
  {
    id: "dl-2",
    movie_id: "27205",
    title: "Inception (2010)",
    poster_path: "/oYu2T1323J31H2m335B331A.jpg",
    quality: "4K HDR",
    file_size: "3.2 GB",
    download_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    downloaded_at: "2026-08-06T09:15:00Z",
    duration: "2h 28m",
    source_type: "Local Files"
  },
  {
    id: "dl-3",
    movie_id: "157336",
    title: "Interstellar (2014)",
    poster_path: "/gEU2gPk912H2m335B331A.jpg",
    quality: "720p",
    file_size: "850 MB",
    download_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    downloaded_at: "2026-08-06T18:40:00Z",
    duration: "2h 49m",
    source_type: "Received"
  }
];

interface AppState {
  // Auth state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  checkAuthGuard: (actionName?: string) => boolean;

  // Watchlist & History
  watchlist: number[];
  addToWatchlist: (id: number) => void;
  removeFromWatchlist: (id: number) => void;
  
  history: Record<number, WatchHistoryItem>;
  updateHistory: (item: WatchHistoryItem) => void;
  
  // Downloads
  downloads: UserDownloadItem[];
  addDownload: (item: UserDownloadItem) => void;
  removeDownload: (id: string) => void;

  // Movie details & player
  selectedMovieId: number | null;
  setSelectedMovieId: (id: number | null) => void;
  
  isVideoPlayerOpen: boolean;
  videoStreamUrl: string | null;
  videoStreamTitle: string | null;
  setVideoPlayerOpen: (isOpen: boolean, streamUrl?: string | null, streamTitle?: string | null) => void;

  autoPlayTrailer: boolean;
  setAutoPlayTrailer: (autoPlay: boolean) => void;
  toggleAutoPlayTrailer: () => void;

  // Download modal
  isDownloadModalOpen: boolean;
  downloadTarget: { title: string; imdbId: string | null; movieId?: number; year?: string | number } | null;
  openDownloadModal: (title: string, imdbId?: string | null, movieId?: number, year?: string | number) => void;
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

      // Downloads
      downloads: INITIAL_DEMO_DOWNLOADS,
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
      setVideoPlayerOpen: (isOpen, streamUrl = null, streamTitle = null) => 
        set({ isVideoPlayerOpen: isOpen, videoStreamUrl: streamUrl, videoStreamTitle: streamTitle }),

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

