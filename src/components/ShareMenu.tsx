import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Download, X } from 'lucide-react'
import { PoemWithId } from '../services/poems'
import DownloadTemplateSelector from './DownloadTemplateSelector'

interface ShareMenuProps {
  isOpen: boolean
  onClose: () => void
  poem: PoemWithId
}

export default function ShareMenu({ isOpen, onClose, poem }: ShareMenuProps) {
  const [isDownloadSelectorOpen, setIsDownloadSelectorOpen] = useState(false)

  const websiteUrl = 'https://zerodot.in'

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
    {
      icon: <Download className="w-5 h-5" />,
      label: 'Download Card',
      action: () => setIsDownloadSelectorOpen(true),
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
              className="fixed bottom-0 sm:bottom-8 left-1/2 -translate-x-1/2 z-[301] w-[92vw] sm:w-[90%] max-w-[420px] sm:max-w-sm"
            >
              <div className="bg-[rgba(15,15,15,0.45)] backdrop-blur-24 -webkit-backdrop-blur-24 rounded-t-3xl sm:rounded-2xl border border-white/12 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] pb-8 sm:pb-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
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
                <div className="grid grid-cols-2 gap-3">
                  {shareOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={option.action}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/6 backdrop-blur-16 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="text-white">{option.icon}</div>
                      <span className="text-sm text-white">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Download Template Selector */}
      <DownloadTemplateSelector
        isOpen={isDownloadSelectorOpen}
        onClose={() => setIsDownloadSelectorOpen(false)}
        poem={poem}
      />
    </>
  )
}
