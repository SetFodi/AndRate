import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Browse from './pages/BrowseNew.tsx'
import Library from './pages/LibraryNew.tsx'
import Detail from './pages/Detail.tsx'
import Search from './pages/Search.tsx'
import { AuthProvider } from './state/Auth.tsx'
import ToastProvider from './components/Toast.tsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/anime', element: <Browse kind="anime" /> },
  { path: '/tv', element: <Browse kind="tv" /> },
  { path: '/movies', element: <Browse kind="movie" /> },
  { path: '/library', element: <Library /> },
  { path: '/search', element: <Search /> },
  { path: '/detail/:kind/:id', element: <Detail /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastProvider />
    </AuthProvider>
  </StrictMode>,
)
