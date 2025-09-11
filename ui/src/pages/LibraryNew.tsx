import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useAuth } from '../state/Auth'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import StarRating from '../components/StarRating'
import ScrollToTop from '../components/ScrollToTop'
import { LibraryItemSkeleton, PosterSkeleton } from '../components/LoadingSkeleton'
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

type LibraryItem = {
  id: number
  item_id: string
  item_type: string
  title: string
  poster_url?: string
  status: string
  rating?: number
}

export default function Library() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'date'>('title')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) load()
  }, [user])

  useEffect(() => {
    filterAndSortItems()
  }, [items, statusFilter, typeFilter, searchQuery, sortBy])

  async function load() {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await invoke<LibraryItem[]>('get_library', { 
        payload: { user_id: user.id, item_type: null, status: null } 
      })
      setItems(res)
    } catch (error) {
      console.error('Failed to load library:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterAndSortItems() {
    let filtered = [...items]

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.item_type === typeFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'date':
          return b.id - a.id // Use ID as proxy for date added
        default:
          return a.title.localeCompare(b.title)
      }
    })

    setFilteredItems(filtered)
  }

  const statusCounts = {
    all: items.length,
    planning: items.filter(i => i.status === 'planning').length,
    watching: items.filter(i => i.status === 'watching').length,
    completed: items.filter(i => i.status === 'completed').length,
    abandoned: items.filter(i => i.status === 'abandoned').length,
  }

  const statusEmojis = {
    planning: '📋',
    watching: '👀',
    completed: '✅',
    abandoned: '❌'
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-zinc-950 to-black text-zinc-100">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2">Your Library</h2>
            <p className="text-zinc-400">Please login to view your library</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-black text-slate-900 dark:text-zinc-100">
      <Header />
      
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Library</h1>
            <p className="text-zinc-400 mt-1">{items.length} items in your collection</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 rounded-lg bg-zinc-800 border border-white/10 hover:bg-zinc-700 transition-colors"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-64 space-y-6">
            {/* Search */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MagnifyingGlassIcon className="size-4 text-zinc-400" />
                <span className="text-sm font-medium">Search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full rounded-lg bg-zinc-800/70 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FunnelIcon className="size-4 text-zinc-400" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <div className="space-y-1">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      statusFilter === status 
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' 
                        : 'hover:bg-zinc-700/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {status !== 'all' && statusEmojis[status as keyof typeof statusEmojis]}
                      {status === 'all' ? 'All Items' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    <span className="text-zinc-500">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium">Type</span>
              </div>
              <div className="space-y-1">
                {['all', 'anime', 'tv', 'movie'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      typeFilter === type 
                        ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' 
                        : 'hover:bg-zinc-700/50'
                    }`}
                  >
                    {type === 'all' ? 'All Types' : type === 'tv' ? 'TV Shows' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium">Sort By</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-lg bg-zinc-800/70 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="title">Title</option>
                <option value="rating">Rating</option>
                <option value="date">Date Added</option>
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-4">
                {viewMode === 'list' ? (
                  Array.from({ length: 8 }, (_, i) => (
                    <LibraryItemSkeleton key={i} />
                  ))
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 15 }, (_, i) => (
                      <PosterSkeleton key={i} />
                    ))}
                  </div>
                )}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-zinc-400">
                  {items.length === 0 
                    ? "Your library is empty. Start adding some anime, TV shows, or movies!"
                    : "No items match your current filters. Try adjusting your search or filters."
                  }
                </p>
              </div>
            ) : viewMode === 'list' ? (
              /* List View */
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      {item.poster_url ? (
                        <img src={item.poster_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-zinc-500 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-zinc-400 capitalize">{item.item_type}</span>
                        <div className="flex items-center gap-1">
                          {statusEmojis[item.status as keyof typeof statusEmojis]}
                          <span className="text-sm text-zinc-400 capitalize">{item.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-zinc-400 mb-1">Your Rating</div>
                        {item.rating ? (
                          <div className="flex items-center gap-1">
                            <StarRating rating={item.rating} onChange={() => {}} readonly size="sm" />
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-sm">Not rated</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform"
                  >
                    <div className="aspect-[2/3] relative">
                      {item.poster_url ? (
                        <img src={item.poster_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-zinc-500">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 rounded-full bg-black/70 text-xs">
                          {statusEmojis[item.status as keyof typeof statusEmojis]}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{item.title}</h3>
                      <div className="mt-2">
                        {item.rating ? (
                          <StarRating rating={item.rating} onChange={() => {}} readonly size="sm" />
                        ) : (
                          <span className="text-zinc-500 text-xs">Not rated</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  )
}
