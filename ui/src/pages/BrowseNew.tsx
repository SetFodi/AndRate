import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PosterCard from '../components/PosterCard'
import Header from '../components/Header'
import ScrollToTop from '../components/ScrollToTop'
import { PosterSkeleton } from '../components/LoadingSkeleton'
import { MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type Props = { kind: 'anime' | 'tv' | 'movie' }

export default function Browse({ kind }: Props) {
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'title'>('popularity')
  const [minRating, setMinRating] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [kind, page])

  useEffect(() => {
    filterAndSortItems()
  }, [items, searchQuery, sortBy, minRating])

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const timeout = setTimeout(() => {
        searchItems()
      }, 300) // Debounce search
      return () => clearTimeout(timeout)
    } else if (searchQuery.trim().length === 0) {
      load()
    }
  }, [searchQuery])

  async function load() {
    setIsLoading(true)
    try {
      if (kind === 'anime') {
        const res = await invoke<any[]>('discover_anime', { page })
        setItems(res)
      } else {
        const res = await invoke<any[]>('discover_tmdb', { kind, page })
        setItems(res)
      }
    } catch (error) {
      console.error('Failed to load items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function searchItems() {
    if (!searchQuery.trim()) {
      load()
      return
    }
    
    setIsLoading(true)
    try {
      if (kind === 'anime') {
        const res = await invoke<any[]>('search_anime', { query: searchQuery })
        setItems(res)
      } else {
        const res = await invoke<any[]>('search_tmdb', { kind, query: searchQuery })
        setItems(res)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterAndSortItems() {
    let filtered = [...items]

    // Filter by minimum rating
    if (minRating > 0) {
      filtered = filtered.filter(item => 
        (item.community_rating || 0) >= minRating
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.community_rating || 0) - (a.community_rating || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0 // Keep original order for popularity
      }
    })

    setFilteredItems(filtered)
  }

  const categoryInfo = {
    anime: { title: 'Anime', emoji: '🎌', desc: 'Discover trending anime series and movies' },
    tv: { title: 'TV Shows', emoji: '📺', desc: 'Explore popular television series' },
    movie: { title: 'Movies', emoji: '🎬', desc: 'Browse the latest and greatest films' }
  }

  const info = categoryInfo[kind]

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-black text-slate-900 dark:text-zinc-100">
      <Header />
      
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="text-4xl">{info.emoji}</div>
          <div>
            <h1 className="text-3xl font-bold">{info.title}</h1>
            <p className="text-zinc-400 mt-1">{info.desc}</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-72 space-y-6 flex-shrink-0 relative z-20"
          >
            {/* Search */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MagnifyingGlassIcon className="size-4 text-zinc-400" />
                <span className="text-sm font-medium">Search {info.title}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${info.title.toLowerCase()}...`}
                  className="w-full rounded-lg bg-white dark:bg-zinc-800/70 border border-slate-200 dark:border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-8"
                />
                {isLoading && searchQuery.length > 2 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
                  </div>
                )}
              </div>
              {searchQuery && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    {searchQuery.length <= 2 ? 'Type 3+ characters to search' : `Searching for "${searchQuery}"`}
                  </span>
                  <button
                    onClick={() => { setSearchQuery(''); }}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <FunnelIcon className="size-4 text-zinc-400" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              
              <div className="space-y-4">
                {/* Sort By */}
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-lg bg-white dark:bg-zinc-800/70 border border-slate-200 dark:border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="rating">Community Rating</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">
                    Minimum Rating: {minRating > 0 ? `${minRating.toFixed(1)}+` : 'Any'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Browse Stats */}
            <div className="glass rounded-2xl p-4">
              <div className="text-sm font-medium mb-2">Browse Stats</div>
              <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Total Results:</span>
                  <span>{filteredItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Page:</span>
                  <span>{page}</span>
                </div>
                {filteredItems.length > 0 && (
                  <div className="flex justify-between">
                    <span>Avg Rating:</span>
                    <span>
                      {(filteredItems.reduce((acc, item) => acc + (item.community_rating || 0), 0) / filteredItems.length).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Pagination Header */}
            {!searchQuery && (
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-zinc-400">
                  Showing page {page} • {filteredItems.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="size-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Next
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {Array.from({ length: 20 }, (_, i) => (
                  <PosterSkeleton key={i} />
                ))}
              </motion.div>
            )}

            {/* Results Grid */}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {filteredItems.map((item: any) => (
                  <div key={`${item.item_id}-${item.item_type}`} className="relative">
                    <PosterCard
                      item={item}
                      onClick={() => navigate(`/detail/${item.item_type}/${item.item_id}`)}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && filteredItems.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-zinc-400">
                  {searchQuery 
                    ? "Try adjusting your search query or filters."
                    : "Try adjusting your filters or check back later."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  )
}
