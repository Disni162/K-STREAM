export type MediaType = 'movie' | 'drama';

export interface Episode {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
}

export interface MediaItem {
  id: string;
  title: string;
  koreanTitle?: string;
  type: MediaType;
  genre: string[];
  rating: number;
  year: number;
  duration?: string;
  episodesCount?: number;
  episodes?: Episode[];
  description: string;
  bannerUrl: string;
  posterUrl: string;
  videoUrl: string;
  cast: string[];
  director: string;
  trending?: boolean;
}