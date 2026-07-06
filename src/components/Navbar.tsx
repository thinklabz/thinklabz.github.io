import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, ChevronDown, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import AdminLoginModal from './AdminLoginModal'
import { triggerHaptic } from '../utils/haptic'

interface NavbarProps {
  onSearchClick: () => void
  onMenuClick: () => void
}

export default function Navbar({ onSearchClick, onMenuClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, effectiveTheme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const navigate = useNavigate()
  const themePressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMovedRef = useRef(false)

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="w-5 h-5 text-foreground" />
    return effectiveTheme === 'light' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />
  }

  const handleThemePressStart = () => {
    hasMovedRef.current = false
    themePressTimerRef.current = setTimeout(() => {
      if (!hasMovedRef.current) {
        setIsAdminLoginOpen(true)
        triggerHaptic(20)
      }
    }, 5000)
  }

  const handleThemePressEnd = () => {
    if (themePressTimerRef.current) {
      clearTimeout(themePressTimerRef.current)
      themePressTimerRef.current = null
    }
  }

  const handleThemeClick = () => {
    if (!hasMovedRef.current) {
      toggleTheme()
    }
  }

  const handleThemeMove = () => {
    hasMovedRef.current = true
    handleThemePressEnd()
  }

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false)
    navigate('/admin')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
              onClick={handleThemeClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
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
              onClick={handleThemeClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
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

            {/* Hamburger Menu */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
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

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </motion.nav>
  )
}
