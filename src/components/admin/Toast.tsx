import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

export type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const icon = type === 'success' ? CheckCircle : AlertCircle
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 50, x: '-50%' }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-6 py-4 bg-background border border-border rounded-xl shadow-2xl"
      >
        <div className={`p-2 rounded-full ${bgColor}`}>
          {icon === CheckCircle ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
        </div>
        <p className="text-foreground font-medium">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
