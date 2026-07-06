import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Instagram, Copy, Share2, X } from 'lucide-react'
import { PoemWithId } from '../services/poems'
import { triggerHaptic } from '../utils/haptic'
import Toast from './admin/Toast'

interface PoemReaderProps {
  poems: PoemWithId[]
  currentPoem: PoemWithId | null
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

export default function PoemReader({ poems, currentPoem, onClose, onNext, onPrevious }: PoemReaderProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const currentIndex = currentPoem ? poems.findIndex(p => p.id === currentPoem.id) : null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  const handleShare = async () => {
    triggerHaptic(15)
    
    if (!currentPoem) return

    const websiteUrl = 'https://thinklabz.vercel.app'
    let shareContent: string

    if (currentPoem.instagram) {
      // Share with Instagram post URL
      shareContent = `✨ ${currentPoem.title || 'Poem'}

Read this poem on Instagram:
${currentPoem.instagram}

Discover more poems:
${websiteUrl}`
    } else {
      // Fallback: share title and website link
      shareContent = `✨ ${currentPoem.title || 'Poem'}

Discover more poems:
${websiteUrl}`
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPoem.title || 'Poem',
          text: shareContent,
        })
      } catch (error) {
        // User cancelled or share failed, fall back to clipboard
        await navigator.clipboard.writeText(shareContent)
        setToast({ message: 'Share content copied.', type: 'success' })
        setTimeout(() => setToast(null), 3000)
      }
    } else {
      // Browser doesn't support Web Share API, copy to clipboard
      await navigator.clipboard.writeText(shareContent)
      setToast({ message: 'Share content copied.', type: 'success' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  // Prevent context menu on poem content
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  // Prevent copy/cut
  const handleCopyCut = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null) return

      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'ArrowRight') {
        onNext()
      } else if (e.key === 'ArrowLeft') {
        onPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, onNext, onPrevious])

  if (!currentPoem) return null

  return (
    <>
      <AnimatePresence>
        {!isClosing && (
          <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
>
        
          {/* Background with image */}
          {currentPoem.image ? (
            <img
              src={currentPoem.image}
              alt="Background"
              loading="eager"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 bg-gradient-to-br from-secondary to-muted"
            />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Grain texture */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />

          {/* Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative z-10 w-full h-full flex items-center justify-center px-4 sm:px-8 md:px-16"
          >
            <div className="max-w-4xl w-full px-4">
              {/* Poem text */}
              <motion.div
                key={currentPoem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center no-select"
                onContextMenu={handleContextMenu}
                onCopy={handleCopyCut}
                onCut={handleCopyCut}
              >
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-white leading-relaxed mb-6 sm:mb-8 select-none">
                  {currentPoem.text}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Close button */}
          <motion.button
            onClick={handleClose}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          {/* Action icons on the right */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4"
          >
            {currentPoem.instagram && (
              <motion.button
                onClick={() => window.open(currentPoem.instagram, '_blank')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </motion.button>
            )}

            <motion.button
              onClick={() => {
                triggerHaptic(15)
                navigator.clipboard.writeText(currentPoem.text)
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
              aria-label="Copy"
            >
              <Copy className="w-5 h-5 text-white" />
            </motion.button>

            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5 text-white" />
            </motion.button>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
