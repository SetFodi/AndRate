import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invoke } from '@tauri-apps/api/core'
import { useAuth } from '../state/Auth'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, StarIcon, CalendarIcon, TagIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import Header from '../components/Header'
import StarRating from '../components/StarRating'
import { showToast } from '../components/Toast'

export default function Detail() {
  const { kind, id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<any | null>(null)
  const [status, setStatus] = useState<string>('planning')
  const [rating, setRating] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!kind || !id) return
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, id])

  async function load() {
    setIsLoading(true)
    if (kind === 'anime') {
      const res = await invoke<any>('get_anime_detail', { id })
      setItem(res)
    } else {
      const res = await invoke<any>('get_tmdb_detail', { kind, id })
      setItem(res)
    }
    setIsLoading(false)
  }

  async function save() {
    if (!user) {
      showToast.error('Please login first')
      return
    }
    if (!item) return
    
    try {
      await invoke('upsert_library', {
        payload: {
          user_id: user.id,
          item_id: item.item_id,
          item_type: item.item_type,
          title: item.title,
          poster_url: item.poster_url,
          status,
          rating,
        },
      })
      showToast.success(`Added "${item.title}" to your library!`)
    } catch (error) {
      showToast.error('Failed to save to library')
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-black text-slate-900 dark:text-zinc-100">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
        </div>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-zinc-950 dark:via-black dark:to-zinc-900 dark:text-zinc-100">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeftIcon className="size-5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8"
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/60 shadow-2xl">
              {item.poster_url ? (
                <img src={item.poster_url} className="w-full object-cover" />
              ) : (
                <div className="aspect-[2/3] w-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
                  <span className="text-slate-500 dark:text-zinc-500">No Image</span>
                </div>
              )}
            </div>
            
            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TagIcon className="size-4 text-slate-600 dark:text-zinc-400" />
                <span className="text-sm text-slate-600 dark:text-zinc-400">Status</span>
              </div>
              <select 
                value={status} 
                onChange={e=>setStatus(e.target.value)} 
                className="w-full rounded-xl bg-white dark:bg-zinc-800/70 border border-slate-200 dark:border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="planning">📋 Planning</option>
                <option value="watching">👀 Watching</option>
                <option value="completed">✅ Completed</option>
                <option value="abandoned">❌ Abandoned</option>
              </select>
              
              <div className="flex items-center gap-2 mt-4">
                <StarIcon className="size-4 text-amber-400" />
                <span className="text-sm text-slate-600 dark:text-zinc-400">Your Rating</span>
              </div>
              <StarRating rating={rating} onChange={setRating} size="md" />
              
              <button 
                onClick={save} 
                disabled={!user}
                className="w-full mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed px-5 py-3 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <BookmarkIcon className="size-4" />
                {user ? 'Save to Library' : 'Login to Save'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                {item.title}
              </h1>
              <div className="mt-2 flex items-center gap-4 text-slate-600 dark:text-zinc-400">
                {item.year && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="size-4" />
                    <span>{item.year}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <TagIcon className="size-4" />
                  <span className="capitalize">{item.item_type}</span>
                </div>
              </div>
              
              {/* Community Rating */}
              {item.community_rating && (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30 w-fit">
                  <StarIcon className="size-5 text-amber-400" />
                  <div>
                    <div className="font-semibold text-amber-400">{item.community_rating.toFixed(1)}/10</div>
                    <div className="text-xs text-slate-600 dark:text-zinc-400">
                      Community Rating
                      {item.community_rating_count && ` • ${item.community_rating_count.toLocaleString()} votes`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {item.genres && item.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.genres.map((genre: string) => (
                  <span key={genre} className="px-3 py-1 rounded-full bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-zinc-300">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {item.overview && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Overview</h3>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {item.overview}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}


