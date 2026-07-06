import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import { PoemWithId } from '../services/poems'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  poems: PoemWithId[]
  isLoading?: boolean
  onPoemClick: (poem: PoemWithId) => void
}

export default function SearchOverlay({ isOpen, onClose, poems, isLoading = false, onPoemClick }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  // Prevent context menu and copy/cut
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleCopyCut = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }

  const categories = Array.from(
  new Set(poems.map((p) => p.category).filter(Boolean))
)

const months = Array.from(
  new Set(poems.map((p) => p.month).filter(Boolean))
)

  const filteredPoems = poems.filter((poem) => {
  const title = poem.title ?? ""
  const text = poem.text ?? ""
  const category = poem.category ?? ""
  const month = poem.month ?? ""

  const query = searchQuery.toLowerCase()

  const matchesSearch =
    title.toLowerCase().includes(query) ||
    text.toLowerCase().includes(query) ||
    category.toLowerCase().includes(query) ||
    month.toLowerCase().includes(query)

  const matchesCategory = selectedCategory ? category === selectedCategory : true
  const matchesMonth = selectedMonth ? month === selectedMonth : true

  return matchesSearch && matchesCategory && matchesMonth
})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSelectedCategory(null)
      setSelectedMonth(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl bg-background/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border/20 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-4 p-4 sm:p-6 border-b border-border/20">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search poems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base sm:text-lg"
              autoFocus
            />
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          </div>

          <div className="p-4 sm:p-6 border-b border-border/20">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Categories
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Months
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedMonth(null)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-sm transition-all ${
                    selectedMonth === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  All
                </button>
                {months.map(month => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-sm transition-all ${
                      selectedMonth === month
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-h-80 sm:max-h-96 overflow-y-auto scrollbar-hide">
            {isLoading ? (
              <div className="p-4 sm:p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 sm:p-6 bg-secondary/30 rounded-lg animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredPoems.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <p className="text-muted-foreground">No poems found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {filteredPoems.map((poem, index) => (
                  <motion.button
                    key={poem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => {
                      onPoemClick(poem)
                      onClose()
                    }}
                    className="w-full p-4 sm:p-6 text-left hover:bg-secondary/50 transition-colors group no-select"
                    onContextMenu={handleContextMenu}
                    onCopy={handleCopyCut}
                    onCut={handleCopyCut}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors text-sm sm:text-base select-none">
                          {poem.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 select-none">
                          {poem.text}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                          <span className="px-2 py-1 rounded-full bg-secondary">
                            {poem.category}
                          </span>
                          <span>•</span>
                          <span>{poem.month}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
