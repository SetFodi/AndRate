import { motion } from 'framer-motion'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { StarIcon } from '@heroicons/react/24/solid'
import { HeartIcon, CodeBracketIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import Header from './components/Header'
import { useAuth } from './state/Auth'
import { showToast } from './components/Toast'

function App() {
  const { user, login, register: registerUser } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // Recently added showcases (optional future use)
  const [anime] = useState<any[]>([])
  const [tv] = useState<any[]>([])
  const [movie] = useState<any[]>([])

  async function handleAuth(e: FormEvent) {
    e.preventDefault()
    
    // Client-side validation
    if (!username.trim()) {
      showToast.error('Username cannot be empty')
      return
    }
    
    if (username.trim().length < 3) {
      showToast.error('Username must be at least 3 characters long')
      return
    }
    
    if (!password) {
      showToast.error('Password cannot be empty')
      return
    }
    
    if (authMode === 'register' && password.length < 6) {
      showToast.error('Password must be at least 6 characters long')
      return
    }
    
    try {
      if (authMode === 'register') {
        await registerUser(username.trim(), password)
        showToast.success(`Welcome ${username.trim()}! Account created successfully.`)
      } else {
        await login(username.trim(), password)
        showToast.success(`Welcome back ${username.trim()}!`)
      }
      setUsername('')
      setPassword('')
    } catch (e) {
      showToast.error(String(e))
    }
  }

  // Home no longer contains a global search bar; use /search page instead

  async function saveItem(item: any) {
    if (!user) {
      showToast.error('Please login first')
      return
    }
    
    try {
      const payload = {
        userId: user.id,
        itemId: item.item_id,
        itemType: item.item_type,
        title: item.title,
        posterUrl: item.poster_url ?? null,
        status: 'planning',
        rating: null,
      }
      await invoke('upsert_library', {
        payload: {
          user_id: payload.userId,
          item_id: payload.itemId,
          item_type: payload.itemType,
          title: payload.title,
          poster_url: payload.posterUrl,
          status: payload.status,
          rating: payload.rating,
        },
      })
      showToast.success(`Added "${item.title}" to your library!`)
    } catch (error) {
      showToast.error('Failed to save to library')
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-zinc-100">
      <Header />

      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-purple-500/20 blur-3xl -z-10" />
          <div className="mx-auto max-w-7xl px-6 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                Your Universal
                <br />
                <span className="text-emerald-400">Watchlist</span>
              </h1>
              <p className="mt-6 text-xl text-zinc-300 max-w-3xl mx-auto">
                Track anime, TV shows, and movies with beautiful ratings, status management, and seamless discovery.
              </p>
            </motion.div>

            {!user && (
              <motion.form
                onSubmit={handleAuth}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-10 max-w-md mx-auto glass rounded-2xl p-6 space-y-4"
              >
                <input 
                  value={username} 
                  onChange={e=>setUsername(e.target.value)} 
                  placeholder="Username" 
                  className="w-full rounded-xl bg-zinc-800/70 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                />
                <input 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  type="password" 
                  placeholder="Password" 
                  className="w-full rounded-xl bg-zinc-800/70 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                />
                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="flex-1 rounded-xl px-4 py-3 bg-emerald-500 hover:bg-emerald-600 font-medium transition"
                  >
                    {authMode === 'register' ? 'Create Account' : 'Sign In'}
                  </button>
                  <button 
                    type="button" 
                    onClick={()=>setAuthMode(m=> m==='register' ? 'login':'register')} 
                    className="px-4 py-3 text-sm text-zinc-400 hover:text-white transition"
                  >
                    {authMode==='register'?'Sign In':'Sign Up'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-16 max-w-4xl mx-auto"
            >
              <div className="glass rounded-3xl p-8 md:p-12 space-y-8">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6"
                  >
                    <HeartIcon className="size-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">Made with passion</span>
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-4">
                    About AndRate
                  </h2>
                  
                  <p className="text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
                    Your personal entertainment companion for tracking anime, TV shows, and movies. 
                    Built with modern technologies and powered by free, open APIs.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-center p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                  >
                    <div className="inline-flex p-3 rounded-xl bg-cyan-500/20 mb-4">
                      <GlobeAltIcon className="size-6 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Free APIs</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Powered by <strong>AniList</strong> for anime data and <strong>TMDB</strong> for movies & TV shows. 
                      Ratings reflect community scores from these platforms, not IMDb.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
                  >
                    <div className="inline-flex p-3 rounded-xl bg-emerald-500/20 mb-4">
                      <CodeBracketIcon className="size-6 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Open Source</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Built with <strong>Tauri</strong>, <strong>React</strong>, and <strong>TypeScript</strong>. 
                      Completely free and open source software you can trust.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
                  >
                    <div className="inline-flex p-3 rounded-xl bg-purple-500/20 mb-4">
                      <HeartIcon className="size-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Created By</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Developed by <strong className="text-white">Luka Partenadze</strong> with love for the community. 
                      A passion project for entertainment enthusiasts.
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="text-center pt-6 border-t border-white/10"
                >
                  <p className="text-sm text-zinc-500">
                    Community ratings are sourced from AniList and The Movie Database (TMDB) • Not affiliated with IMDb
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Categories */}
        <div className="mx-auto max-w-7xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { name: "Anime", emoji: "🎌", desc: "Discover trending anime series and movies" },
              { name: "TV", emoji: "📺", desc: "Track your favorite TV shows and series" },
              { name: "Movies", emoji: "🎬", desc: "Rate and organize your movie collection" }
            ].map((category, idx) => (
              <motion.div
                key={category.name}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass rounded-3xl p-8 text-center group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + idx * 0.1, duration: 0.6 }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{category.emoji}</div>
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <p className="text-zinc-400">{category.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Search Results */}
        {(anime.length > 0 || tv.length > 0 || movie.length > 0) && (
          <div className="mx-auto max-w-7xl px-6 pb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {[{title:'Anime', items: anime},{title:'TV Shows', items: tv},{title:'Movies', items: movie}].map(block => 
                block.items.length > 0 && (
                  <div key={block.title}>
                    <h2 className="text-2xl font-bold mb-6">{block.title}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {block.items.map((it:any)=> (
                        <motion.div 
                          key={`${it.item_id}-${it.item_type}`} 
                          className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/60 group" 
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {it.poster_url ? (
                            <img src={it.poster_url} alt="" className="aspect-[2/3] w-full object-cover" />
                          ) : (
                            <div className="aspect-[2/3] w-full bg-zinc-800 flex items-center justify-center">
                              <span className="text-zinc-500">No Image</span>
                            </div>
                          )}
                          <div className="p-3">
                            <div className="text-sm font-medium line-clamp-2 min-h-10 group-hover:text-emerald-300 transition">{it.title}</div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex items-center text-amber-400">
                                <StarIcon className="size-4" />
      </div>
                              <button 
                                onClick={()=>saveItem(it)} 
                                className="ml-auto rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-medium transition"
                              >
                                Add
        </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-zinc-500">
          Built with Tauri, React, and Tailwind • Free and open source
        </div>
      </footer>
      </div>
  )
}

export default App
