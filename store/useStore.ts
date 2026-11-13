import { create } from 'zustand';
import { MediaItem } from '@/types/media';

interface AppState {
  watchlist: MediaItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  selectedMedia: MediaItem | null;
  setSelectedMedia: (item: MediaItem | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  watchlist: [],
  addToWatchlist: (item) =>
    set((state) => ({ watchlist: [...state.watchlist, item] })),
  removeFromWatchlist: (id) =>
    set((state) => ({
      watchlist: state.watchlist.filter((i) => i.id !== id),
    })),
  isBookmarked: (id) => get().watchlist.some((i) => i.id === id),
  selectedMedia: null,
  setSelectedMedia: (item) => set({ selectedMedia: item }),
}));