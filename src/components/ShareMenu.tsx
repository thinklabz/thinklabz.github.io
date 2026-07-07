import { useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, X } from 'lucide-react'
import { PoemWithId } from '../services/poems'

interface ShareMenuProps {
  isOpen: boolean
  onClose: () => void
  poem: PoemWithId
}

export default function ShareMenu({ isOpen, onClose, poem }: ShareMenuProps) {
  const websiteUrl = 'https://zerodot.in'

  // Lock body scroll while the menu is open so the page behind it can't scroll.
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }
  }, [isOpen])

  // Native share API
  const nativeShare = useCallback(async () => {
    const shareContent = `✨ ${poem.title || 'Poem'}\n\n${poem.text}\n\nDiscover more poems:\n${websiteUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: poem.title || 'Poem',
          text: shareContent,
        })
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed')
      }
    }
    onClose()
  }, [poem, onClose])

  const shareOptions = [
    {
      icon: <Share2 className="w-5 h-5" />,
      label: 'Share',
      action: nativeShare,
    },
  ]

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
            />

            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="
                fixed
                inset-x-0
                bottom-0
                z-[301]
                w-full
                px-2
                sm:inset-x-auto
                sm:left-1/2
                sm:-translate-x-1/2
                sm:top-1/2
                sm:bottom-auto
                sm:-translate-y-1/2
                sm:w-[420px]
                sm:max-w-[90vw]
                sm:px-0
                max-h-[90dvh]
                flex
                flex-col
              "
            >
              <div
                className="
                  bg-[rgba(15,15,15,0.45)] backdrop-blur-24 -webkit-backdrop-blur-24
                  rounded-t-3xl sm:rounded-2xl border border-white/12
                  shadow-[0_20px_60px_rgba(0,0,0,0.35)]
                  flex flex-col
                  max-h-[90dvh]
                  overflow-hidden
                  p-4
                "
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-lg font-semibold text-white">Share</h3>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>

                {/* Share Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto flex-1 min-h-0">
                  {shareOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={option.action}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2 p-4 rounded-xl bg-white/6 backdrop-blur-16 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="text-white shrink-0">{option.icon}</div>
                      <span className="text-sm text-white">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}