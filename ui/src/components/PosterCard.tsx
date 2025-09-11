import { useState } from 'react'
import { motion } from 'framer-motion'
import { invoke } from '@tauri-apps/api/core'
import { useAuth } from '../state/Auth'
import { showToast } from './Toast'
import StarRating from './StarRating'

type Props = {
  item: { item_id: string; item_type: string; title: string; poster_url?: string | null, community_rating?: number | null, community_rating_count?: number | null }
  onClick?: () => void
}

export default function PosterCard({ item, onClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [status, setStatus] = useState('planning')
  const [rating, setRating] = useState<number | null>(null)
  const { user } = useAuth()

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
      {menuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-30" 
          onClick={(e)=>{ e.stopPropagation(); setMenuOpen(false); }}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="glass rounded-3xl p-6 w-80 max-w-full space-y-6 border-2 border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-1">Quick Add</h3>
              <p className="text-sm text-zinc-400 truncate">{item.title}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Watch Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'planning', label: 'Planning', emoji: '📋' },
                    { value: 'watching', label: 'Watching', emoji: '👀' },
                    { value: 'completed', label: 'Completed', emoji: '✅' },
                    { value: 'abandoned', label: 'Abandoned', emoji: '❌' }
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(s.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        status === s.value
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="text-lg mb-1">{s.emoji}</div>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-3 block">Your Rating</label>
                <div className="flex justify-center">
                  <StarRating rating={rating} onChange={setRating} size="md" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 font-semibold text-white transition-colors shadow-lg hover:shadow-emerald-500/25" 
                onClick={saveQuick}
              >
                Add to Library
              </button>
              <button 
                className="px-4 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors" 
                onClick={()=> setMenuOpen(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}


