import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useNavigate } from 'react-router-dom'
import PosterCard from '../components/PosterCard'
import Header from '../components/Header'

type Props = { kind: 'anime' | 'tv' | 'movie' }

export default function Browse({ kind }: Props) {
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, page])

  async function load() {
    if (kind === 'anime') {
      const res = await invoke<any[]>('discover_anime', { page })
      setItems(res)
    } else {
      const res = await invoke<any[]>('discover_tmdb', { kind, page })
      setItems(res)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-zinc-950 dark:via-black dark:to-zinc-900 dark:text-zinc-100">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold capitalize text-slate-900 dark:text-zinc-100">{kind === 'tv' ? 'TV' : kind} — Popular</h1>
          <div className="flex gap-2">
            <button onClick={()=> setPage(p => Math.max(1, p-1))} className="rounded-xl bg-white dark:bg-zinc-800 px-3 py-2 border border-slate-200 dark:border-white/10">Prev</button>
            <button onClick={()=> setPage(p => p+1)} className="rounded-xl bg-white dark:bg-zinc-800 px-3 py-2 border border-slate-200 dark:border-white/10">Next</button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((it:any)=> (
            <PosterCard key={`${it.item_id}-${it.item_type}`} item={it} onClick={()=> navigate(`/detail/${it.item_type}/${it.item_id}`)} />
          ))}
        </div>
      </div>
    </div>
  )
}


