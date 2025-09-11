import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useAuth } from '../state/Auth'
import Header from '../components/Header'

export default function Library() {
  const [items, setItems] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function load() {
    if (!user) return
    const res = await invoke<any[]>('get_library', { payload: { user_id: user.id, item_type: null, status: null } })
    setItems(res)
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-zinc-950 to-black text-zinc-100">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((it:any)=> (
            <div key={`${it.id}`} className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/60">
              {it.poster_url ? (
                <img src={it.poster_url} alt="" className="aspect-[2/3] w-full object-cover" />
              ) : (
                <div className="aspect-[2/3] w-full bg-zinc-800" />
              )}
              <div className="p-3">
                <div className="text-sm font-medium line-clamp-2 min-h-10">{it.title}</div>
                <div className="mt-1 text-xs text-zinc-400">{it.item_type} • {it.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


