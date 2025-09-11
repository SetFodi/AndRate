import { createContext, useContext, useMemo, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

type User = { id: number; username: string } | null

type AuthContextType = {
  user: User
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)

  async function login(username: string, password: string) {
    const res = await invoke<{ user_id: number; username: string }>('login_user', { payload: { username, password } })
    setUser({ id: res.user_id, username: res.username })
  }
  async function register(username: string, password: string) {
    const res = await invoke<{ user_id: number; username: string }>('register_user', { payload: { username, password } })
    setUser({ id: res.user_id, username: res.username })
  }
  function logout() { setUser(null) }

  const value = useMemo(() => ({ user, login, register, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


