import toast, { Toaster } from 'react-hot-toast'
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export const showToast = {
  success: (message: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} glass rounded-2xl p-4 flex items-center gap-3 shadow-lg border border-white/10`}>
        <CheckCircleIcon className="size-5 text-emerald-400 flex-shrink-0" />
        <span className="text-white font-medium">{message}</span>
        <button onClick={() => toast.dismiss(t.id)} className="text-zinc-400 hover:text-white transition-colors ml-2">
          <XMarkIcon className="size-4" />
        </button>
      </div>
    ), { duration: 4000 })
  },
  
  error: (message: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} glass rounded-2xl p-4 flex items-center gap-3 shadow-lg border border-red-500/20`}>
        <ExclamationTriangleIcon className="size-5 text-red-400 flex-shrink-0" />
        <span className="text-white font-medium">{message}</span>
        <button onClick={() => toast.dismiss(t.id)} className="text-zinc-400 hover:text-white transition-colors ml-2">
          <XMarkIcon className="size-4" />
        </button>
      </div>
    ), { duration: 4000 })
  },
  
  info: (message: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} glass rounded-2xl p-4 flex items-center gap-3 shadow-lg border border-cyan-500/20`}>
        <InformationCircleIcon className="size-5 text-cyan-400 flex-shrink-0" />
        <span className="text-white font-medium">{message}</span>
        <button onClick={() => toast.dismiss(t.id)} className="text-zinc-400 hover:text-white transition-colors ml-2">
          <XMarkIcon className="size-4" />
        </button>
      </div>
    ), { duration: 3000 })
  }
}

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    />
  )
}
