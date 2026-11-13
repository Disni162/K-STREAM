"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Plus, 
  Check, 
  Star, 
  Search, 
  Film, 
  Flame, 
  Heart, 
  Info, 
  X, 
  Database,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Review {
  id: number;
  user: string;
  rating: number;
  date: string;
  comment: string;
}

interface CastMember {
  name: string;
  role: string;
  img: string;
}

interface Episode {
  ep: number;
  title: string;
  duration: string;
  description: string;
}

interface MediaItem {
  id: string;
  title: string;
  koreanTitle: string;
  type: 'drama' | 'movie';
  typeLabel: string;
  year: number;
  episodes: string;
  rating: number;
  votes: string;
  matchScore: number;
  ageRating: string;
  quality: string;
  genres: string[];
  bannerImg: string;
  posterImg: string;
  synopsis: string;
  cast?: CastMember[];
  director?: string;
  trailerEmbedId: string;
  trending: boolean;
  heroFeatured: boolean;
  badge?: string;
  episodesList?: Episode[];
  reviews: Review[];
}

const FALLBACK_MEDIA: MediaItem[] = [
  {
    id: 'k-squid-game',
    title: 'Squid Game',
    koreanTitle: '오징어 게임',
    type: 'drama',
    typeLabel: 'K-Drama',
    year: 2021,
    episodes: '9 Episodes',
    rating: 9.2,
    votes: '420.5K',
    matchScore: 99,
    ageRating: '18+',
    quality: '4K UHD',
    genres: ['Thriller', 'Action', 'Mystery'],
    bannerImg: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1600&q=80',
    posterImg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    synopsis: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits with deadly high stakes.',
    cast: [
      { name: 'Lee Jung-jae', role: 'Seong Gi-hun', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' }
    ],
    director: 'Hwang Dong-hyuk',
    trailerEmbedId: 'gq3-kC8Vf1g',
    trending: true,
    heroFeatured: true,
    badge: 'TOP 1 GLOBAL',
    reviews: [
      { id: 1, user: 'KdramaObsessed', rating: 5, date: '2 days ago', comment: 'Absolute masterpiece of suspense and social commentary!' }
    ]
  },
  {
    id: 'k-goblin',
    title: 'Guardian: The Lonely and Great God (Goblin)',
    koreanTitle: '쓸쓸하고 찬란하神 - 도깨비',
    type: 'drama',
    typeLabel: 'K-Drama',
    year: 2016,
    episodes: '16 Episodes',
    rating: 9.7,
    votes: '380K',
    matchScore: 98,
    ageRating: '15+',
    quality: '4K UHD',
    genres: ['Sci-Fi/Fantasy', 'Romance', 'Drama'],
    bannerImg: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
    posterImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    synopsis: 'An immortal goblin needs a human bride to end his cursed life.',
    director: 'Lee Eung-bok',
    trailerEmbedId: '8AcNWv5L_j4',
    trending: true,
    heroFeatured: true,
    badge: 'CLASSIC',
    reviews: []
  },
  {
    id: 'k-parasite',
    title: 'Parasite',
    koreanTitle: '기생충',
    type: 'movie',
    typeLabel: 'K-Movie',
    year: 2019,
    episodes: '2h 12m',
    rating: 9.6,
    votes: '590K',
    matchScore: 99,
    ageRating: '18+',
    quality: '4K UHD',
    genres: ['Thriller', 'Drama', 'Comedy'],
    bannerImg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    posterImg: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship.',
    director: 'Bong Joon-ho',
    trailerEmbedId: '5xH0HfJHsaY',
    trending: false,
    heroFeatured: true,
    badge: 'AWARD WINNER',
    reviews: []
  }
];

const GENRES = ['All', 'Action', 'Romance', 'Thriller', 'Historical', 'Comedy', 'Sci-Fi/Fantasy'];

export default function App() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');
  
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [playingTrailer, setPlayingTrailer] = useState<MediaItem | null>(null);

  const [newReviewText, setNewReviewText] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);

  useEffect(() => {
    async function fetchSupabaseData() {
      try {
        setLoading(true);
        
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*');

        if (mediaError || !mediaData || mediaData.length === 0) {
          for (const item of FALLBACK_MEDIA) {
            await supabase.from('media').upsert({
              id: item.id,
              title: item.title,
              korean_title: item.koreanTitle,
              type: item.type,
              type_label: item.typeLabel,
              year: item.year,
              episodes: item.episodes,
              rating: item.rating,
              votes: item.votes,
              match_score: item.matchScore,
              age_rating: item.ageRating,
              quality: item.quality,
              genres: item.genres,
              banner_img: item.bannerImg,
              poster_img: item.posterImg,
              synopsis: item.synopsis,
              director: item.director,
              trailer_embed_id: item.trailerEmbedId,
              trending: item.trending,
              hero_featured: item.heroFeatured,
              badge: item.badge
            });
          }
          setMediaList(FALLBACK_MEDIA);
        } else {
          const formattedMedia: MediaItem[] = mediaData.map((m: any) => ({
            id: m.id,
            title: m.title,
            koreanTitle: m.korean_title,
            type: m.type,
            typeLabel: m.type_label,
            year: m.year,
            episodes: m.episodes,
            rating: m.rating,
            votes: m.votes,
            matchScore: m.match_score,
            ageRating: m.age_rating,
            quality: m.quality,
            genres: m.genres || [],
            bannerImg: m.banner_img,
            posterImg: m.poster_img,
            synopsis: m.synopsis,
            director: m.director,
            trailerEmbedId: m.trailer_embed_id,
            trending: m.trending,
            heroFeatured: m.hero_featured,
            badge: m.badge,
            reviews: []
          }));
          setMediaList(formattedMedia);
        }

        const { data: reviewsData } = await supabase.from('reviews').select('*');
        if (reviewsData && reviewsData.length > 0) {
          setMediaList(prev => prev.map(item => ({
            ...item,
            reviews: reviewsData
              .filter((r: any) => r.media_id === item.id)
              .map((r: any) => ({
                id: r.id,
                user: r.user_name,
                rating: r.rating,
                date: new Date(r.created_at).toLocaleDateString(),
                comment: r.comment
              }))
          })));
        }

        const { data: watchlistData } = await supabase
          .from('watchlist')
          .select('media_id')
          .eq('user_id', 'guest_user');

        if (watchlistData) {
          setWatchlist(watchlistData.map((w: any) => w.media_id));
        }

      } catch (err) {
        console.error('Error connecting to Supabase:', err);
        setMediaList(FALLBACK_MEDIA);
        setWatchlist(['k-squid-game', 'k-goblin']);
      } finally {
        setLoading(false);
      }
    }

    fetchSupabaseData();
  }, []);

  const heroList = useMemo(() => mediaList.filter(m => m.heroFeatured), [mediaList]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState<number>(0);

  useEffect(() => {
    if (heroList.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroList.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [heroList.length]);

  const toggleWatchlist = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isAlreadySaved = watchlist.includes(id);
    
    setWatchlist(prev => 
      isAlreadySaved ? prev.filter(item => item !== id) : [...prev, id]
    );

    try {
      if (isAlreadySaved) {
        await supabase.from('watchlist').delete().eq('media_id', id).eq('user_id', 'guest_user');
      } else {
        await supabase.from('watchlist').insert([{ media_id: id, user_id: 'guest_user' }]);
      }
    } catch (err) {
      console.error('Watchlist sync error:', err);
    }
  };

  const handleAddReview = async (mediaId: string) => {
    if (!newReviewText.trim()) return;
    const commentText = newReviewText.trim();
    const ratingVal = Number(newReviewRating);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{ media_id: mediaId, user_name: 'You (Fan)', rating: ratingVal, comment: commentText }])
        .select()
        .single();

      if (error) throw error;

      const newRev: Review = {
        id: data ? data.id : Date.now(),
        user: 'You (Fan)',
        rating: ratingVal,
        date: 'Just now',
        comment: commentText
      };

      setMediaList((prev: MediaItem[]) => prev.map(item => {
        if (item.id === mediaId) {
          return { ...item, reviews: [newRev, ...(item.reviews || [])] };
        }
        return item;
      }));

      if (selectedMedia && selectedMedia.id === mediaId) {
        setSelectedMedia((prev: MediaItem | null) => prev ? { ...prev, reviews: [newRev, ...(prev.reviews || [])] } : null);
      }
      setNewReviewText('');
    } catch (err) {
      console.error('Review add error:', err);
    }
  };

  const processedMedia = useMemo(() => {
    let result = mediaList.filter(item => {
      if (activeTab === 'movies' && item.type !== 'movie') return false;
      if (activeTab === 'dramas' && item.type !== 'drama') return false;
      if (activeTab === 'trending' && !item.trending) return false;
      if (activeTab === 'watchlist' && !watchlist.includes(item.id)) return false;

      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedGenre !== 'All' && !item.genres.includes(selectedGenre)) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(query) || item.koreanTitle.toLowerCase().includes(query);
      }
      return true;
    });

    return result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year') return b.year - a.year;
      return b.matchScore - a.matchScore;
    });
  }, [mediaList, activeTab, selectedType, selectedGenre, searchQuery, watchlist, sortBy]);

  const heroItem = heroList[currentHeroIndex] || heroList[0];
  const isHeroSaved = heroItem ? watchlist.includes(heroItem.id) : false;

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 font-sans pb-20 selection:bg-rose-500 selection:text-white">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#07070a]/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          
          <div 
            onClick={() => { setActiveTab('home'); setSelectedGenre('All'); setSearchQuery(''); }}
            className="flex items-center gap-2.5 cursor-pointer group w-full md:w-auto justify-between md:justify-start"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
                <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-wider text-white">K-STREAM</span>
                
              </div>
            </div>
          </div>

          {/* Search bar - Full width on mobile, auto on desktop */}
          <div className="w-full md:w-auto flex items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search titles, actors, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-2 rounded-full bg-[#11131a] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50 shadow-inner"
              />
            </div>
          </div>
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-3 sm:mt-4 flex items-center gap-2 overflow-x-auto border-b border-white/5 pb-3 scrollbar-none">
        {['home', 'movies', 'dramas', 'trending', 'watchlist'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab 
                ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white bg-slate-900/50 border border-white/5'
            }`}
          >
            {tab} {tab === 'watchlist' && `(${watchlist.length})`}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 sm:py-32 gap-3">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="text-xs text-slate-400 text-center">Loading K-Stream from Supabase database...</p>
          </div>
        ) : (
          <>
            {/* HERO FEATURED BANNER */}
            {activeTab === 'home' && !searchQuery && heroItem && (
              <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-8 sm:mb-10 border border-white/10 shadow-2xl bg-slate-950">
                <div className="relative h-[420px] sm:h-[480px] md:h-[520px] w-full">
                  <img src={heroItem.bannerImg} alt={heroItem.title} className="w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#07070a] via-[#07070a]/60 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-4 sm:p-8 md:p-12 max-w-2xl w-full">
                    
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
                      {heroItem.badge && (
                        <span className="px-2.5 sm:px-3 py-1 rounded-md bg-gradient-to-r from-purple-600 to-rose-600 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" /> {heroItem.badge}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-200">
                        {heroItem.typeLabel}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-400 flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-emerald-400 text-emerald-400" /> {heroItem.rating}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-300 font-medium">{heroItem.year} • {heroItem.quality}</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-1 leading-tight">
                      {heroItem.title}
                    </h1>
                    <p className="text-rose-400 text-xs sm:text-sm md:text-base font-serif italic mb-2 sm:mb-3">
                      {heroItem.koreanTitle}
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm md:text-base line-clamp-2 mb-4 sm:mb-6 leading-relaxed">
                      {heroItem.synopsis}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      <button 
                        onClick={() => setPlayingTrailer(heroItem)}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-600/40 transition active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" /> Watch Trailer
                      </button>

                      <button 
                        onClick={() => setSelectedMedia(heroItem)}
                        className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-white font-semibold text-xs sm:text-sm border border-white/10 flex items-center gap-2 transition active:scale-95"
                      >
                        <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Full Info & Reviews
                      </button>

                      <button 
                        onClick={(e) => toggleWatchlist(heroItem.id, e)}
                        className={`p-2.5 sm:p-3 rounded-xl backdrop-blur-md border transition ${
                          isHeroSaved 
                            ? 'bg-rose-600/20 border-rose-500/50 text-rose-400' 
                            : 'bg-slate-800/80 hover:bg-slate-700 border-white/10 text-white'
                        }`}
                      >
                        {isHeroSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-1.5 sm:gap-2">
                    {heroList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentHeroIndex(idx)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all ${currentHeroIndex === idx ? 'w-6 sm:w-8 bg-rose-500' : 'w-1.5 sm:w-2 bg-white/30'}`}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* GENRE FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-4 mb-6 sm:mb-8 scrollbar-none">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedGenre === genre
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-slate-900/90 text-slate-400 border border-white/5 hover:text-white hover:border-white/10'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* MEDIA GRID */}
            {processedMedia.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-white/5">
                <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-white font-bold text-base mb-1">No titles found</h3>
                <p className="text-xs text-slate-400">Try changing your search query, genre, or tab filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
                {processedMedia.map((media) => {
                  const isSaved = watchlist.includes(media.id);
                  return (
                    <div 
                      key={media.id} 
                      onClick={() => setSelectedMedia(media)}
                      className="group bg-slate-900/90 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-lg flex flex-col"
                    >
                      <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                        <img src={media.posterImg} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                        <button 
                          onClick={(e) => toggleWatchlist(media.id, e)}
                          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition ${
                            isSaved ? 'bg-rose-600 text-white shadow' : 'bg-black/60 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                        </button>

                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] sm:text-xs text-slate-300 font-medium">
                          <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-white/5 text-emerald-400 font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-emerald-400" /> {media.rating}
                          </span>
                          <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-white/5">{media.year}</span>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                        <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-rose-400 transition line-clamp-1">{media.title}</h3>
                        <p className="text-[10px] sm:text-[11px] text-rose-400 font-serif italic mt-0.5">{media.koreanTitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* TRAILER MODAL */}
      {playingTrailer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-4xl bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="aspect-video w-full bg-black">
              <iframe src={`https://www.youtube-nocookie.com/embed/${playingTrailer.trailerEmbedId}?autoplay=1`} className="w-full h-full border-0" allowFullScreen />
            </div>
            <div className="p-4 sm:p-6 flex items-center justify-between bg-slate-900 gap-3">
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base line-clamp-1">{playingTrailer.title}</h3>
                <p className="text-[11px] sm:text-xs text-rose-400">{playingTrailer.koreanTitle}</p>
              </div>
              <button onClick={() => setPlayingTrailer(null)} className="px-4 sm:px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs whitespace-nowrap transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED INFO & REVIEWS MODAL */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden my-6 p-5 sm:p-8 relative shadow-2xl">
            <button onClick={() => setSelectedMedia(null)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl sm:text-2xl font-black text-white mb-1 pr-8">{selectedMedia.title}</h2>
            <p className="text-rose-400 text-xs sm:text-sm font-serif italic mb-3 sm:mb-4">{selectedMedia.koreanTitle}</p>
            <p className="text-slate-300 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">{selectedMedia.synopsis}</p>

            <div className="border-t border-white/10 pt-4 mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Supabase Community Reviews ({selectedMedia.reviews.length})
              </h4>
              <div className="space-y-2.5 max-h-36 sm:max-h-40 overflow-y-auto mb-4 pr-1">
                {selectedMedia.reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No reviews yet. Be the first to review!</p>
                ) : (
                  selectedMedia.reviews.map(r => (
                    <div key={r.id} className="bg-slate-950 p-3 rounded-xl border border-white/5 text-xs">
                      <div className="flex justify-between font-bold text-rose-400 mb-1">
                        <span>{r.user}</span>
                        <span className="text-amber-400">★ {r.rating}</span>
                      </div>
                      <p className="text-slate-300 leading-normal">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Share your thoughts..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button onClick={() => handleAddReview(selectedMedia.id)} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition">
                  Post Review
                </button>
              </div>
            </div>

            <button onClick={() => { setSelectedMedia(null); setPlayingTrailer(selectedMedia); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30">
              <Play className="w-4 h-4 fill-white" /> Watch Trailer Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}