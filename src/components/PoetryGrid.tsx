import { motion } from 'framer-motion'
import { PoemWithId } from '../services/poems'
import { triggerHaptic } from '../utils/haptic'
import { memo, useEffect, useRef, useState } from 'react'

interface PoetryGridProps {
  poems: PoemWithId[]
  isLoading: boolean
  onCardClick: (poem: PoemWithId) => void
}

const PoetryGrid = memo(function PoetryGrid({ poems, isLoading, onCardClick }: PoetryGridProps) {
  const [visiblePoems, setVisiblePoems] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Set up IntersectionObserver for lazy loading
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback: show all poems if IntersectionObserver not supported
      setVisiblePoems(new Set(poems.map(p => p.id)))
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const poemId = entry.target.getAttribute('data-poem-id')
            if (poemId) {
              setVisiblePoems((prev) => new Set([...prev, poemId]))
              observerRef.current?.unobserve(entry.target)
            }
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )

    // Observe all poem cards
    cardRefs.current.forEach((element) => {
      observerRef.current?.observe(element)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [poems])

  // Update refs when poems change
  useEffect(() => {
    cardRefs.current.clear()
    setVisiblePoems(new Set())
  }, [poems])
  // Prevent context menu and copy/cut
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleCopyCut = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }
  if (isLoading) {
    return (
      <div className="w-full py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <h3 className="text-2xl font-semibold text-foreground">
              Poetry Collection
            </h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/30 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (poems.length === 0) {
    return (
      <div className="w-full py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <h3 className="text-2xl font-semibold text-foreground">
              Poetry Collection
            </h3>
          </motion.div>

          <div className="bg-secondary/30 border border-border/20 rounded-xl p-12 text-center">
            <p className="text-foreground text-lg font-medium">
              Your poetry collection is waiting for its first verse.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            Poetry Collection
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {poems.map((poem, index) => (
            <motion.div
              key={poem.id}
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(poem.id, el)
                }
              }}
              data-poem-id={poem.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: [0.22, 1, 0.36, 1] 
              }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
              onClick={() => {
                triggerHaptic(15)
                onCardClick(poem)
              }}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group no-select shadow-lg hover:shadow-xl transition-shadow duration-300"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  triggerHaptic(15)
                  onCardClick(poem)
                }
              }}
              onContextMenu={handleContextMenu}
              onCopy={handleCopyCut}
              onCut={handleCopyCut}
            >
              {/* Background Image */}
              {visiblePoems.has(poem.id) && poem.image ? (
                <img
                  src={poem.image}
                  alt={poem.title}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
              )}
              
              {/* Blur Effect */}
              <div className="absolute inset-0 backdrop-blur-sm" />

              {/* Dark Overlay */}
              <div 
                className="absolute inset-0 transition-colors duration-300"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              />

              {/* Poem Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm md:text-base leading-relaxed font-medium line-clamp-3 select-none">
                  {poem.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default PoetryGrid
