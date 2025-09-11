import { NavLink } from 'react-router-dom'
import { useAuth } from '../state/Auth'
import { UserIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const { user, logout } = useAuth()
  
  const link = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg transition ${isActive ? 'text-white bg-white/10' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`
      }
    >
      {label}
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-xl bg-black/40">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400" />
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
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <UserIcon className="size-4" />
              <span>{user.username}</span>
            </div>
            <button 
              onClick={logout}
              className="text-xs text-zinc-400 hover:text-white transition px-2 py-1 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}


