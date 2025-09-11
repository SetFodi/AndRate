import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { invoke } from '@tauri-apps/api/core'
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline'
import Header from '../components/Header'
import PosterCard from '../components/PosterCard'
import { useNavigate } from 'react-router-dom'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{anime: any[], tv: any[], movies: any[]}>({anime: [], tv: [], movies: []})
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const navigate = useNavigate()

  const suggestions = [
    'Attack on Titan', 'Breaking Bad', 'The Matrix', 'Spirited Away', 
    'Game of Thrones', 'Inception', 'Death Note', 'Stranger Things'
  ]

  useEffect(() => {
    if (query.length > 2) {
      const timeout = setTimeout(() => {
        handleSearch()
      }, 500) // Debounce search
      return () => clearTimeout(timeout)
    } else {
      setResults({anime: [], tv: [], movies: []})
      setHasSearched(false)
    }
  }, [query])

  async function handleSearch() {
    if (!query.trim()) return
    
    setIsSearching(true)
    setHasSearched(true)
    
    try {
      const [anime, tv, movies] = await Promise.all([
        invoke<any[]>('search_anime', { query }),
        invoke<any[]>('search_tmdb', { kind: 'tv', query }),
        invoke<any[]>('search_tmdb', { kind: 'movie', query }),
      ])
      setResults({ anime, tv, movies })
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const totalResults = results.anime.length + results.tv.length + results.movies.length

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-black text-slate-900 dark:text-zinc-100">
      <Header />
      
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Search Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <SparklesIcon className="size-8 text-emerald-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                Discover Everything
              </h1>
            </div>
            
            <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Search across anime, TV shows, and movies. Find your next obsession.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 size-6 text-slate-400 dark:text-zinc-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime, TV shows, movies..."
                  className="w-full pl-16 pr-6 py-6 text-lg rounded-3xl bg-white dark:bg-zinc-900/70 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400"
                  autoFocus
                />
              </div>
              
              {isSearching && (
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
                </div>
              )}
            </div>

            {/* Search Suggestions */}
            {!hasSearched && query.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap justify-center gap-2 mt-6"
              >
                <span className="text-sm text-slate-500 dark:text-zinc-500 mr-2">Try:</span>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-3 py-1 rounded-full bg-slate-200 dark:bg-zinc-800/60 border border-slate-300 dark:border-white/10 text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/20 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Results Summary */}
              <div className="text-center">
                <p className="text-zinc-400">
                  {isSearching ? 'Searching...' : `Found ${totalResults} results for "${query}"`}
                </p>
              </div>

              {/* Results by Category */}
              {[
                { title: 'Anime', items: results.anime, emoji: '🎌' },
                { title: 'TV Shows', items: results.tv, emoji: '📺' },
                { title: 'Movies', items: results.movies, emoji: '🎬' }
              ].map(({ title, items, emoji }) => 
                items.length > 0 && (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{emoji}</span>
                      <h2 className="text-2xl font-bold">{title}</h2>
                      <span className="px-2 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-sm">
                        {items.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {items.map((item: any) => (
                        <PosterCard
                          key={`${item.item_id}-${item.item_type}`}
                          item={item}
                          onClick={() => navigate(`/detail/${item.item_type}/${item.item_id}`)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )
              )}

              {/* No Results */}
              {hasSearched && !isSearching && totalResults === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-zinc-400">Try a different search term or check your spelling.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
