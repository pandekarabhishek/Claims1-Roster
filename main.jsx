import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className="animate-slide-up flex items-center gap-2.5
            bg-surface-3 border border-white/10 rounded-lg px-4 py-3
            text-sm text-white shadow-xl max-w-sm">
            {t.type === 'success' && <CheckCircle size={15} className="text-green-400 shrink-0" />}
            {t.type === 'error'   && <XCircle     size={15} className="text-red-400   shrink-0" />}
            {t.type === 'info'    && <Info        size={15} className="text-blue-400  shrink-0" />}
            <span className="text-white/80">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
