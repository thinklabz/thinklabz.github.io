import { motion } from 'framer-motion'
import { PoemWithId } from '../services/poems'
import { getQuoteOfTheDay } from '../services/quoteOfTheDay'

interface HeroProps {
  poems: PoemWithId[]
}

export default function Hero({ poems }: HeroProps) {
  const quoteOfTheDay = getQuoteOfTheDay(poems)
  const quote = quoteOfTheDay?.text || "Your poetry collection is waiting for its first verse."
  const isLoading = poems.length === 0 && !quoteOfTheDay

  // Prevent context menu and copy/cut
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleCopyCut = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center pt-28 px-4 pb-8">
        <div className="relative w-[94%] h-[40vh] md:h-[55vh] rounded-3xl overflow-hidden bg-secondary/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center pt-28 px-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[94%] h-[40vh] md:h-[55vh] rounded-3xl overflow-hidden bg-muted no-select"
        onContextMenu={handleContextMenu}
        onCopy={handleCopyCut}
        onCut={handleCopyCut}
      >
        {/* Background Image/Video Container */}
        {quoteOfTheDay?.image ? (
          <img
            src={quoteOfTheDay.image}
            alt="Quote background"
            loading="eager"
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            <p className="text-sm uppercase tracking-widest text-white/70 mb-6 select-none" style={{ letterSpacing: '0.2em' }}>
              Today's Quote
            </p>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-relaxed select-none" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', letterSpacing: '0.02em', lineHeight: '1.4' }}>
              {quote}
            </h1>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
