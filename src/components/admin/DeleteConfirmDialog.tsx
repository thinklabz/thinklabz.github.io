import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Poem',
  message = 'Are you sure you want to delete this poem? This action cannot be undone.'
}: DeleteConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-foreground text-center mb-2">
              {title}
            </h2>

            {/* Message */}
            <p className="text-muted-foreground text-center mb-6">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-secondary border border-border text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
