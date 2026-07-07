import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { PoemWithId } from '../services/poems'

interface SearchBarProps {
  poems: PoemWithId[]
  onPoemClick: (poem: PoemWithId) => void
  placeholder?: string
}

export default function SearchBar({ poems, onPoemClick, placeholder = "Search poems, poets, emotions..." }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const categories = Array.from(new Set(poems.map((p) => p.category).filter(Boolean)))
  const months = Array.from(new Set(poems.map((p) => p.month).filter(Boolean)))

  const filteredPoems = useMemo(() => {
    return poems.filter((poem) => {
      const title = poem.title ?? ""
      const text = poem.text ?? ""
      const category = poem.category ?? ""
      const month = poem.month ?? ""
      const searchQuery = debouncedQuery.toLowerCase()

      const matchesSearch =
        title.toLowerCase().includes(searchQuery) ||
        text.toLowerCase().includes(searchQuery) ||
        category.toLowerCase().includes(searchQuery) ||
        month.toLowerCase().includes(searchQuery)

      const matchesCategory = selectedCategory ? category === selectedCategory : true
      const matchesMonth = selectedMonth ? month === selectedMonth : true

      return matchesSearch && matchesCategory && matchesMonth
    })
  }, [poems, debouncedQuery, selectedCategory, selectedMonth])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false)
      setQuery('')
      setDebouncedQuery('')
      setSelectedCategory(null)
      setSelectedMonth(null)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: true })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent context menu and copy/cut
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleCopyCut = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-10 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Search Input */}
        <motion.div
          whileHover={{ 
            background: 'linear-gradient(to right, #1A1A1A 0%, #F5F5F5 50%, #1A1A1A 100%)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            background: 'linear-gradient(to right, #1A1A1A 0%, #F8F8F8 50%, #1A1A1A 100%)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            inset: '0 1px 0 rgba(255, 255, 255, 0.8)'
          }}
          className="relative rounded-[24px] z-10 dark:bg-white dark:shadow-lg light:border-[1.5px] light:border-black light:bg-white light:shadow-none"
        >
          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            className="w-full py-5 px-6 text-base text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-400 dark:text-black dark:placeholder:text-gray-500 light:text-black light:placeholder:text-gray-500"
            autoComplete="off"
          />
        </motion.div>

        {/* Expanded Search Results */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-2xl overflow-hidden z-20"
            >
              {/* Close Button */}
              <motion.button
                onClick={() => {
                  setIsExpanded(false)
                  setQuery('')
                  setDebouncedQuery('')
                  setSelectedCategory(null)
                  setSelectedMonth(null)
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-30"
                aria-label="Close search"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>

              {/* Filters */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 sm:px-4 py-2 rounded-full text-sm transition-all ${
                        selectedCategory === null
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                    Months
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedMonth(null)}
                      className={`px-3 sm:px-4 py-2 rounded-full text-sm transition-all ${
                        selectedMonth === null
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                {filteredPoems.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center">
                    <p className="text-gray-500">No poems found</p>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6 space-y-3">
                    {filteredPoems.map((poem, index) => (
                      <motion.button
                        key={poem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        onClick={() => {
                          onPoemClick(poem)
                          setIsExpanded(false)
                          setQuery('')
                          setDebouncedQuery('')
                          setSelectedCategory(null)
                          setSelectedMonth(null)
                        }}
                        className="w-full text-left group"
                        onContextMenu={handleContextMenu}
                        onCopy={handleCopyCut}
                        onCut={handleCopyCut}
                      >
                        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-lg">
                          {/* Thumbnail */}
                          {poem.image ? (
                            <div className="w-full sm:w-24 h-32 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                              <img
                                src={poem.image}
                                alt={poem.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-full sm:w-24 h-32 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300" />
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors text-sm sm:text-base select-none line-clamp-1">
                              {poem.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 select-none">
                              {poem.text}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 select-none flex-wrap">
                              {poem.category && (
                                <span className="px-2 py-1 rounded-full bg-black/10 text-black border border-black/20">
                                  {poem.category}
                                </span>
                              )}
                              {poem.month && (
                                <>
                                  {poem.category && <span>•</span>}
                                  <span className="px-2 py-1 rounded-full bg-gray-200">
                                    {poem.month}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
