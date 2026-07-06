import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, ChevronDown, Sun, Moon, Monitor, Maximize2, Minimize2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { toggleFullscreen, isFullscreen as checkIsFullscreen } from '../utils/fullscreen'

interface NavbarProps {
  onSearchClick: () => void
  onMenuClick: () => void
}

const Navbar = memo(function Navbar({ onSearchClick, onMenuClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, effectiveTheme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const themePressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMovedRef = useRef(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Detect touch device on mount
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(isTouch)
  }, [])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(checkIsFullscreen())
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  const getThemeIcon = useCallback(() => {
    if (theme === 'system') return <Monitor className="w-5 h-5 text-foreground" />
    return effectiveTheme === 'light' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />
  }, [theme, effectiveTheme])

  const handleThemePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only enable long-press on non-touch devices
    if (isTouchDevice) return
    
    hasMovedRef.current = false
    // Store touch start position to detect movement
    if ('touches' in e) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    themePressTimerRef.current = setTimeout(() => {
      if (!hasMovedRef.current) {
        // Admin login is now handled via secret code in search
        // This timer is kept for future use but currently does nothing
      }
    }, 5000)
  }, [isTouchDevice])

  const handleThemePressEnd = useCallback(() => {
    if (themePressTimerRef.current) {
      clearTimeout(themePressTimerRef.current)
      themePressTimerRef.current = null
    }
    touchStartRef.current = null
  }, [])

  const handleThemeClick = useCallback(() => {
    if (!hasMovedRef.current) {
      toggleTheme()
      // Light vibration for theme change
      if ('vibrate' in navigator) {
        navigator.vibrate(20)
      }
    }
  }, [toggleTheme])

  const handleThemeMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only enable movement detection on non-touch devices
    if (isTouchDevice) return
    
    // Check if touch moved significantly
    if ('touches' in e && touchStartRef.current) {
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
      // Allow small movement (10px threshold) to account for natural finger wobble
      if (deltaX > 10 || deltaY > 10) {
        hasMovedRef.current = true
        handleThemePressEnd()
      }
    } else if (!('touches' in e)) {
      hasMovedRef.current = true
      handleThemePressEnd()
    }
  }, [isTouchDevice, handleThemePressEnd])

  const handleTouchCancel = useCallback(() => {
    hasMovedRef.current = true
    handleThemePressEnd()
  }, [handleThemePressEnd])

  const handleFullscreenToggle = useCallback(async () => {
    await toggleFullscreen()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md' : 'bg-background'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-foreground font-semibold text-lg tracking-tight"
          >
            ThinkLabz
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Menu Button */}
            <motion.button
              onClick={onMenuClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </motion.button>

            {/* Search Icon */}
            <motion.button
              onClick={onSearchClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-foreground" />
            </motion.button>

            {/* Theme Switcher */}
            <motion.button
              onMouseDown={handleThemePressStart}
              onMouseUp={handleThemePressEnd}
              onMouseLeave={handleThemePressEnd}
              onMouseMove={handleThemeMove}
              onTouchStart={handleThemePressStart}
              onTouchEnd={handleThemePressEnd}
              onTouchCancel={handleTouchCancel}
              onTouchMove={handleThemeMove}
              onClick={handleThemeClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
              style={{ touchAction: 'none' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {getThemeIcon()}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Fullscreen Toggle */}
            <motion.button
              onClick={handleFullscreenToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <AnimatePresence mode="wait">
                {isFullscreen ? (
                  <motion.div
                    key="exit"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Minimize2 className="w-5 h-5 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="enter"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Maximize2 className="w-5 h-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Menu Button */}
            <motion.button
              onClick={onMenuClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </motion.button>

            {/* Search Icon */}
            <motion.button
              onClick={onSearchClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-foreground" />
            </motion.button>

            {/* Theme Switcher */}
            <motion.button
              onMouseDown={handleThemePressStart}
              onMouseUp={handleThemePressEnd}
              onMouseLeave={handleThemePressEnd}
              onMouseMove={handleThemeMove}
              onTouchStart={handleThemePressStart}
              onTouchEnd={handleThemePressEnd}
              onTouchCancel={handleTouchCancel}
              onTouchMove={handleThemeMove}
              onClick={handleThemeClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
              style={{ touchAction: 'none' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {getThemeIcon()}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Fullscreen Toggle */}
            <motion.button
              onClick={handleFullscreenToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <AnimatePresence mode="wait">
                {isFullscreen ? (
                  <motion.div
                    key="exit"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Minimize2 className="w-5 h-5 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="enter"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Maximize2 className="w-5 h-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Hamburger Menu - Hidden on mobile, shown on desktop */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden md:block p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-t border-border/20"
          >
            <div className="px-4 py-4 space-y-2">
              {[
                { id: 'about', title: 'About ThinkLabz', content: 'ThinkLabz is a premium poetry platform dedicated to sharing beautiful verses and creative expressions.' },
                { id: 'privacy', title: 'Privacy Policy', content: 'We value your privacy. Your data is never shared with third parties without your consent.' },
                { id: 'terms', title: 'Terms of Service', content: 'By using ThinkLabz, you agree to our terms of service and community guidelines.' },
                { id: 'faq', title: 'FAQ', content: 'Q: How do I search for poems?\nA: Click the search icon and use filters to find poems by title, text, category, or month.' },
                { id: 'contact', title: 'Contact', content: 'Reach us at hello@thinklabz.com for any inquiries or feedback.' }
              ].map((section) => (
                <div key={section.id} className="border border-border/20 rounded-xl overflow-hidden bg-secondary/30 backdrop-blur-sm">
                  <motion.button
                    onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left"
                    whileHover={{ backgroundColor: 'rgba(var(--secondary), 0.5)' }}
                  >
                    <span className="font-medium text-foreground">{section.title}</span>
                    <motion.div
                      animate={{ rotate: openSection === section.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </motion.button>
                  <AnimatePresence>
                    {openSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2">
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{section.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
})

export default Navbar
