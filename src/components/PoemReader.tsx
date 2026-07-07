import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useEffect, useState, useRef, useCallback, memo } from 'react'
import { Instagram, Copy, Share2, X, FileText } from 'lucide-react'
import { PoemWithId } from '../services/poems'
import { triggerHaptic } from '../utils/haptic'
import Toast from './admin/Toast'
import { toggleFullscreen } from '../utils/fullscreen'
import ShareMenu from './ShareMenu'

interface PoemReaderProps {
  poems: PoemWithId[]
  currentPoem: PoemWithId | null
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

const PoemReader = memo(function PoemReader({ poems, currentPoem, onClose, onNext, onPrevious }: PoemReaderProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showIndicator, setShowIndicator] = useState(true)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [isLetterMode, setIsLetterMode] = useState(false)
  const currentIndex = currentPoem ? poems.findIndex(p => p.id === currentPoem.id) : null
  const indicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  
  // Touch detection for single-tap fullscreen
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const tapStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const hasMovedRef = useRef(false)
  
  const x = useMotionValue(0)
  const scale = useTransform(x, [-300, 0, 300], [0.96, 1, 0.96])
  const opacity = useTransform(x, [-300, 0, 300], [0.85, 1, 0.85])
  
  // Neighbor preview transforms
  const prevX = useTransform(x, [0, 300], [-100, 0])
  const prevOpacity = useTransform(x, [0, 300], [0, 0.6])
  const nextX = useTransform(x, [0, -300], [100, 0])
  const nextOpacity = useTransform(x, [0, -300], [0, 0.6])
  
  const SWIPE_THRESHOLD = typeof window !== 'undefined' ? window.innerWidth * 0.25 : 100
  const VELOCITY_THRESHOLD = 500
  const TAP_MOVEMENT_THRESHOLD = 10
  const TAP_DURATION_THRESHOLD = 300

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }, [onClose])

  // Prevent context menu on poem content
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  // Prevent copy/cut
  const handleCopyCut = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
  }, [])

  // Zoom handlers
  const handleDoubleClick = useCallback(() => {
    if (!isZoomed) {
      setIsZoomed(true)
      setZoomScale(2)
      setZoomPosition({ x: 0, y: 0 })
    } else {
      setIsZoomed(false)
      setZoomScale(1)
      setZoomPosition({ x: 0, y: 0 })
    }
  }, [isZoomed])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isZoomed) return
    e.preventDefault()
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.max(1, Math.min(4, zoomScale + delta))
    setZoomScale(newScale)
    
    if (newScale === 1) {
      setIsZoomed(false)
      setZoomPosition({ x: 0, y: 0 })
    }
  }, [isZoomed, zoomScale])

  const handleZoomClose = useCallback(() => {
    setIsZoomed(false)
    setZoomScale(1)
    setZoomPosition({ x: 0, y: 0 })
  }, [])

  // Handle swipe gestures
  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      // Swiped right - go to previous
      triggerHaptic(10)
      onPrevious()
    } else if (offset < -SWIPE_THRESHOLD || velocity < -VELOCITY_THRESHOLD) {
      // Swiped left - go to next
      triggerHaptic(10)
      onNext()
    }
  }, [SWIPE_THRESHOLD, VELOCITY_THRESHOLD, onPrevious, onNext])

  // Prevent browser navigation during horizontal swipe
  const handleDragStart = useCallback(() => {
    resetIndicatorTimeout()
    // Mark as moved to prevent tap detection
    hasMovedRef.current = true
  }, [])

  // Handle touch start for tap detection
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice) return
    const touch = e.touches[0]
    tapStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    hasMovedRef.current = false
  }, [isTouchDevice])

  // Handle touch move to detect movement
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice || !tapStartRef.current) return
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - tapStartRef.current.x)
    const deltaY = Math.abs(touch.clientY - tapStartRef.current.y)
    
    if (deltaX > TAP_MOVEMENT_THRESHOLD || deltaY > TAP_MOVEMENT_THRESHOLD) {
      hasMovedRef.current = true
    }
  }, [isTouchDevice, TAP_MOVEMENT_THRESHOLD])

  // Handle touch end to detect single tap
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice || !tapStartRef.current) return
    
    const touch = e.changedTouches[0]
    const deltaX = Math.abs(touch.clientX - tapStartRef.current.x)
    const deltaY = Math.abs(touch.clientY - tapStartRef.current.y)
    const deltaTime = Date.now() - tapStartRef.current.time
    
    // Check if it's a true single tap (minimal movement, short duration, no drag)
    if (
      !hasMovedRef.current &&
      deltaX < TAP_MOVEMENT_THRESHOLD &&
      deltaY < TAP_MOVEMENT_THRESHOLD &&
      deltaTime < TAP_DURATION_THRESHOLD
    ) {
      // Check if tap is on an action button (ignore those)
      const target = e.target as HTMLElement
      const isActionButton = target.closest('button') || target.closest('[role="button"]')
      
      if (!isActionButton) {
        // Toggle fullscreen
        toggleFullscreen()
        triggerHaptic(10)
      }
    }
    
    tapStartRef.current = null
  }, [isTouchDevice, TAP_MOVEMENT_THRESHOLD, TAP_DURATION_THRESHOLD])

  // Reset indicator timeout on any interaction
  const resetIndicatorTimeout = useCallback(() => {
    setShowIndicator(true)
    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current)
    }
    indicatorTimeoutRef.current = setTimeout(() => {
      setShowIndicator(false)
    }, 2000)
  }, [])

  // Preload adjacent images with decoding
  useEffect(() => {
    if (currentIndex === null || poems.length === 0) return

    const preloadImage = (url: string | null) => {
      if (url) {
        const img = new Image()
        img.src = url
        img.decode().catch(() => {}) // Decode before display
      }
    }

    // Preload previous
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : poems.length - 1
    preloadImage(poems[prevIndex]?.image || null)

    // Preload next
    const nextIndex = currentIndex < poems.length - 1 ? currentIndex + 1 : 0
    preloadImage(poems[nextIndex]?.image || null)
  }, [currentIndex, poems])

  // Keyboard navigation with passive listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null) return

      resetIndicatorTimeout()

      if (e.key === 'Escape') {
        if (isZoomed) {
          handleZoomClose()
        } else {
          handleClose()
        }
      } else if (e.key === 'ArrowRight') {
        onNext()
      } else if (e.key === 'ArrowLeft') {
        onPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown, { passive: true })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, onNext, onPrevious, handleClose, resetIndicatorTimeout, isZoomed, handleZoomClose])

  // Initial indicator fade
  useEffect(() => {
    resetIndicatorTimeout()
    return () => {
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current)
      }
    }
  }, [])

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
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            dragTransition={{
              bounceStiffness: 300,
              bounceDamping: 30,
 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              x, 
              touchAction: 'pan-y',
              backdropFilter: isTouchDevice ? 'blur(8px)' : 'blur(24px)'
            }}
          >
        
          {/* Background with image */}
          <motion.div
            ref={imageRef}
            className="absolute inset-0 w-full h-full"
            style={{ 
              scale,
              opacity,
              willChange: 'transform',
              transform: isZoomed ? `scale(${zoomScale}) translate(${zoomPosition.x}px, ${zoomPosition.y}px)` : undefined,
              transition: isZoomed ? 'transform 0.2s ease-out' : 'none',
              cursor: isZoomed ? 'zoom-out' : 'zoom-in'
            }}
            onDoubleClick={handleDoubleClick}
            onWheel={handleWheel}
          >
            {currentPoem.image ? (
              <img
                src={currentPoem.image}
                alt="Background"
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'translate3d(0, 0, 0)' }}
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
          </motion.div>

          {/* Previous image preview */}
          {currentIndex !== null && poems.length > 0 && (
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{
                x: prevX,
                opacity: prevOpacity,
                willChange: 'transform'
              }}
            >
              {poems[currentIndex > 0 ? currentIndex - 1 : poems.length - 1].image ? (
                <img
                  src={poems[currentIndex > 0 ? currentIndex - 1 : poems.length - 1].image}
                  alt="Previous"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'translate3d(0, 0, 0)' }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
              )}
            </motion.div>
          )}

          {/* Next image preview */}
          {currentIndex !== null && poems.length > 0 && (
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{
                x: nextX,
                opacity: nextOpacity,
                willChange: 'transform'
              }}
            >
              {poems[currentIndex < poems.length - 1 ? currentIndex + 1 : 0].image ? (
                <img
                  src={poems[currentIndex < poems.length - 1 ? currentIndex + 1 : 0].image}
                  alt="Next"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'translate3d(0, 0, 0)' }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
              )}
            </motion.div>
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Page indicator */}
          <AnimatePresence>
            {showIndicator && currentIndex !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium"
              >
                {currentIndex + 1} / {poems.length}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative z-10 w-full h-full flex items-center justify-center px-4 sm:px-8 md:px-16"
          >
            <div 
              className="max-w-4xl w-full px-4 py-12 flex flex-col items-center justify-center text-center transition-all duration-300"
            >
              {/* Poem text */}
              <motion.div
                key={currentPoem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full no-select"
                onContextMenu={handleContextMenu}
                onCopy={handleCopyCut}
                onCut={handleCopyCut}
              >
                <p 
                  className={`leading-relaxed mb-6 sm:mb-8 select-none transition-all duration-300 text-white ${isLetterMode ? 'text-2xl md:text-3xl lg:text-4xl font-normal italic' : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium'}`}
                  style={{
                    textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                    ...(isLetterMode ? {
                      fontFamily: "'Cormorant Garamond', 'EB Garamond', 'Playfair Display', Georgia, serif",
                      letterSpacing: '0.02em',
                      lineHeight: '1.6',
                    } : {})
                  }}
                >
                  {currentPoem.text}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Close button */}
          <motion.button
            onClick={() => {
              if (isZoomed) {
                handleZoomClose()
              } else {
                handleClose()
              }
            }}
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
              onClick={() => {
                triggerHaptic(15)
                setIsShareMenuOpen(true)
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5 text-white" />
            </motion.button>

            <motion.button
              onClick={() => {
                triggerHaptic(15)
                setIsLetterMode(!isLetterMode)
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-full backdrop-blur-sm transition-colors ${isLetterMode ? 'bg-amber-500/30 hover:bg-amber-500/50' : 'bg-white/10 hover:bg-white/20'}`}
              aria-label="Letter Mode"
            >
              <FileText className="w-5 h-5 text-white" />
            </motion.button>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
      
      {/* Share Menu */}
      {currentPoem && (
        <ShareMenu
          isOpen={isShareMenuOpen}
          onClose={() => setIsShareMenuOpen(false)}
          poem={currentPoem}
        />
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
})

export default PoemReader
