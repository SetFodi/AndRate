import { useState } from 'react'
import { motion } from 'framer-motion'
import { invoke } from '@tauri-apps/api/core'
import { useAuth } from '../state/Auth'
import { showToast } from './Toast'
import StarRating from './StarRating'

type Props = {
  item: { item_id: string; item_type: string; title: string; poster_url?: string | null }
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
      <div className="p-3">
        <div className="text-sm font-medium line-clamp-2 min-h-10">{item.title}</div>
      </div>
      {menuOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm p-3" onClick={(e)=>{ e.stopPropagation(); }}>
          <div className="rounded-xl border border-white/10 bg-zinc-900/90 p-3 space-y-2">
            <div className="text-xs text-zinc-400">Quick actions</div>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2">
              <option value="planning">Planning</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
            <StarRating rating={rating} onChange={setRating} size="sm" />
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-2" onClick={saveQuick}>Save</button>
              <button className="rounded-lg bg-zinc-800 border border-white/10 px-3 py-2" onClick={()=> setMenuOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}


