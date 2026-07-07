import { motion, AnimatePresence } from 'framer-motion'
import { Dice1 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PoemWithId } from '../services/poems'

interface RandomPoemCardProps {
  poems: PoemWithId[]
}

export default function RandomPoemCard({ poems }: RandomPoemCardProps) {
  const [randomPoem, setRandomPoem] = useState<PoemWithId | null>(null)

  const getRandomPoem = () => {
    if (poems.length === 0) return null
    const randomIndex = Math.floor(Math.random() * poems.length)
    return poems[randomIndex]
  }

  useEffect(() => {
    if (poems.length > 0 && !randomPoem) {
      setRandomPoem(getRandomPoem())
    }
  }, [poems, randomPoem])

  const handleCardClick = () => {
    setRandomPoem(getRandomPoem())
  }

  // Prevent context menu and copy/cut
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleCopyCut = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }

  if (!randomPoem) {
    return (
      <div className="w-full flex justify-center px-4 pb-8 pt-28">
        <div className="relative w-full md:w-[80%] lg:w-[68%] h-[28vh] md:h-[38vh] rounded-3xl overflow-hidden bg-secondary/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center px-4 pb-8 pt-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.01, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
        whileTap={{ scale: 0.99 }}
        onClick={handleCardClick}
        className="relative w-full md:w-[80%] lg:w-[68%] h-[28vh] md:h-[38vh] rounded-3xl overflow-hidden bg-muted cursor-pointer no-select shadow-lg transition-shadow duration-280"
        onContextMenu={handleContextMenu}
        onCopy={handleCopyCut}
        onCut={handleCopyCut}
      >
        {/* Background Image/Video Container */}
        {randomPoem.image ? (
          <img
            src={randomPoem.image}
            alt="Random poem background"
            loading="lazy"
            decoding="async"
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0 animate-in fade-in duration-300"
            onLoad={(e) => {
              e.currentTarget.classList.remove('opacity-0')
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={randomPoem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl w-full flex flex-col items-center justify-center"
            >
              {/* Header */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Dice1 className="w-5 h-5 text-white/80" />
                <p className="text-sm uppercase tracking-widest text-white/80 select-none">
                  Random Poem
                </p>
              </div>

              {/* Poem Text */}
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-relaxed select-none mb-4 text-center" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', letterSpacing: '0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                {randomPoem.text}
              </h2>

              {/* Author (if available) */}
              {randomPoem.title && (
                <p className="text-sm text-white/90 select-none text-center" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
                  {randomPoem.title}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
