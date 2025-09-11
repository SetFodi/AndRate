import { NavLink } from 'react-router-dom'
import { useAuth } from '../state/Auth'
import { useTheme } from '../state/Theme'
import { UserIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  
  const link = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg transition ${isActive ? 'text-slate-900 dark:text-white bg-slate-900/10 dark:bg-white/10' : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5'}`
      }
    >
      {label}
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/10 backdrop-blur-xl bg-white/80 dark:bg-black/40">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/andrate.png" alt="AndRate" className="h-10 w-10 rounded-lg shadow" />
            <span className="text-lg font-semibold tracking-wide">AndRate</span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-2">
            {link('/search', 'Search')}
            {link('/anime', 'Anime')}
            {link('/tv', 'TV')}
            {link('/movies', 'Movies')}
            {link('/library', 'Library')}
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-slate-200 dark:border-white/10 px-2 py-1 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </button>
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
                <UserIcon className="size-4" />
                <span>{user.username}</span>
              </div>
              <button 
                onClick={logout}
                className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition px-2 py-1 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


