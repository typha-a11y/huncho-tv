import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WatchHistoryItem } from "../types";

interface AppState {
  watchlist: number[];
  addToWatchlist: (id: number) => void;
  removeFromWatchlist: (id: number) => void;
  
  history: Record<number, WatchHistoryItem>;
  updateHistory: (item: WatchHistoryItem) => void;
  
  selectedMovieId: number | null;
  setSelectedMovieId: (id: number | null) => void;
  
  isVideoPlayerOpen: boolean;
  setVideoPlayerOpen: (isOpen: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      watchlist: [],
      addToWatchlist: (id) =>
        set((state) => ({
          watchlist: state.watchlist.includes(id)
            ? state.watchlist
            : [...state.watchlist, id],
        })),
      removeFromWatchlist: (id) =>
        set((state) => ({
          watchlist: state.watchlist.filter((wId) => wId !== id),
        })),

      history: {},
      updateHistory: (item) =>
        set((state) => ({
          history: { ...state.history, [item.id]: item },
        })),
        
      selectedMovieId: null,
      setSelectedMovieId: (id) => set({ selectedMovieId: id }),
      
      isVideoPlayerOpen: false,
      setVideoPlayerOpen: (isOpen) => set({ isVideoPlayerOpen: isOpen }),
    }),
    {
      name: "huncho-tv-storage",
      partialize: (state) => ({ watchlist: state.watchlist, history: state.history }),
    }
  )
);
