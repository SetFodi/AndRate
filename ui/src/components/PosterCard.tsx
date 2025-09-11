import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { invoke } from '@tauri-apps/api/core'
import { useAuth } from '../state/Auth'
import { showToast } from './Toast'
import StarRating from './StarRating'
import { createPortal } from 'react-dom'

type Props = {
  item: { item_id: string; item_type: string; title: string; poster_url?: string | null, community_rating?: number | null, community_rating_count?: number | null }
  onClick?: () => void
}

export default function PosterCard({ item, onClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [status, setStatus] = useState('planning')
  const [rating, setRating] = useState<number | null>(null)
  const { user } = useAuth()

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [menuOpen])

  async function saveQuick() {
    if (!user) {
      showToast.error('Please login first')
      return
    }
    
    try {
      await invoke('upsert_library', {
        payload: {
          user_id: user.id,
          item_id: item.item_id,
          item_type: item.item_type,
          title: item.title,
          poster_url: item.poster_url ?? null,
          status,
          rating,
        },
      })
      showToast.success(`Added "${item.title}" to your library!`)
      setMenuOpen(false)
    } catch (error) {
      showToast.error('Failed to save to library')
    }
  }

  return (
    <motion.div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/60 cursor-pointer" whileHover={{ scale: 1.02 }} onClick={onClick} onContextMenu={(e)=>{ e.preventDefault(); setMenuOpen(true) }}>
      {item.poster_url ? (
        <img src={item.poster_url} alt="" className="aspect-[2/3] w-full object-cover" />
      ) : (
        <div className="aspect-[2/3] w-full bg-zinc-800" />
      )}
      {item.community_rating != null && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded-full bg-amber-500/90 text-black text-xs font-bold">
          ⭐ {item.community_rating.toFixed(1)}
        </div>
      )}
      <div className="p-3">
        <div className="text-sm font-medium line-clamp-2 min-h-10">{item.title}</div>
      </div>
      {menuOpen && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 z-[9999]"
          onClick={(e)=>{ e.stopPropagation(); setMenuOpen(false); }}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl border border-white/20 shadow-2xl shadow-black/60 w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-purple-500/30" />
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative z-10 p-8">
                <div className="flex items-start gap-6">
                  <div className="w-32 h-48 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl flex-shrink-0">
                    {item.poster_url ? (
                      <img src={item.poster_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                        <span className="text-zinc-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-2">
                    <h2 className="text-3xl font-bold text-white mb-3 leading-tight">{item.title}</h2>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium capitalize">
                        {item.item_type}
                      </span>
                      {item.community_rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400">⭐</span>
                          <span className="text-white font-semibold">{item.community_rating.toFixed(1)}</span>
                          <span className="text-zinc-400 text-sm">community</span>
                        </div>
                      )}
                    </div>
                    <p className="text-zinc-300 text-lg">Add this to your personal library</p>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Status Selection */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full"></div>
                  Watch Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'planning', label: 'Plan to Watch', emoji: '📋', desc: 'Add to your watchlist for later', color: 'from-blue-500 to-cyan-500' },
                    { value: 'watching', label: 'Currently Watching', emoji: '👀', desc: 'You are actively watching this', color: 'from-green-500 to-emerald-500' },
                    { value: 'completed', label: 'Completed', emoji: '✅', desc: 'You have finished watching this', color: 'from-emerald-500 to-teal-500' },
                    { value: 'abandoned', label: 'Dropped', emoji: '❌', desc: 'You stopped watching this', color: 'from-red-500 to-rose-500' }
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(s.value)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                        status === s.value
                          ? 'border-white/40 bg-gradient-to-br ' + s.color + '/20 shadow-lg scale-105'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:scale-102'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <span className="text-3xl">{s.emoji}</span>
                        <div>
                          <div className={`font-semibold text-lg ${status === s.value ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                            {s.label}
                          </div>
                          <div className={`text-sm mt-1 ${status === s.value ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                            {s.desc}
                          </div>
                        </div>
                        {status === s.value && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full"></div>
                  Your Rating
                </h3>
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl p-8 border border-amber-500/30">
                  <div className="text-center space-y-4">
                    <p className="text-zinc-300 text-lg">Rate this on a scale of 1-10</p>
                    <div className="flex justify-center">
                      <StarRating rating={rating} onChange={setRating} size="lg" />
                    </div>
                    {rating && (
                      <p className="text-amber-400 font-semibold text-xl">{rating}/10</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-emerald-500/30 hover:scale-105 text-lg" 
                  onClick={saveQuick}
                >
                  Add to Library
                </button>
                <button 
                  className="px-8 py-5 rounded-2xl border-2 border-white/20 text-zinc-300 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300 font-semibold text-lg" 
                  onClick={()=> setMenuOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </motion.div>
  )
}


