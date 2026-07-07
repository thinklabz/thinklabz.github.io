import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowToUse from './components/HowToUse'
import PoetryGrid from './components/PoetryGrid'
import ErrorBoundary from './components/ErrorBoundary'
import AdminLoginModal from './components/AdminLoginModal'
import SearchBar from './components/SearchBar'
import RandomPoemCard from './components/RandomPoemCard'
import AnimatedBackground from './components/AnimatedBackground'
import { subscribeToPoems, PoemWithId } from './services/poems'

const PoemReader = lazy(() => import('./components/PoemReader'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const Admin = lazy(() => import('./pages/Admin'))
const NavigationDrawer = lazy(() => import('./components/NavigationDrawer'))

function Home() {
  const [poems, setPoems] = useState<PoemWithId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPoem, setCurrentPoem] = useState<PoemWithId | null>(null)
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blurLevel, setBlurLevel] = useState(0)
  const navigate = useNavigate()

  // Restore scroll position and state from localStorage on mount
  useEffect(() => {
    const savedScroll = localStorage.getItem('zerodot_scroll_position')
    const savedTheme = localStorage.getItem('zerodot_theme')
    const savedSearchQuery = localStorage.getItem('zerodot_search_query')
    const savedFilters = localStorage.getItem('zerodot_filters')

    // Restore scroll position
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10))
    }

    // Restore theme
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme)
    }

    // Note: Search query and filters would need to be passed to SearchOverlay
    // This is a placeholder for future implementation
    if (savedSearchQuery) {
      console.log('Restored search query:', savedSearchQuery)
    }
    if (savedFilters) {
      console.log('Restored filters:', savedFilters)
    }
  }, [])

  // Save scroll position on scroll and update blur level
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      localStorage.setItem('zerodot_scroll_position', scrollY.toString())
      
      // Calculate blur level based on scroll position
      // Top: slightly blurred (0px)
      // Middle: more blur (up to 8px)
      // Reader mode (when poem is open): maximum blur (24px)
      const maxScroll = window.innerHeight * 2
      const newBlurLevel = currentPoem 
        ? 24 
        : Math.min(8, (scrollY / maxScroll) * 8)
      
      setBlurLevel(newBlurLevel)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPoem])

  // Save current poem to localStorage
  useEffect(() => {
    if (currentPoem) {
      localStorage.setItem('zerodot_current_poem', currentPoem.id)
    } else {
      localStorage.removeItem('zerodot_current_poem')
    }
  }, [currentPoem])

  useEffect(() => {
    const unsubscribe = subscribeToPoems(
      (updatedPoems) => {
        setPoems(updatedPoems)
        setIsLoading(false)
        setError(null)

        // Restore current poem if it exists
        const savedPoemId = localStorage.getItem('zerodot_current_poem')
        if (savedPoemId && updatedPoems.length > 0) {
          const savedPoem = updatedPoems.find(p => p.id === savedPoemId)
          if (savedPoem) {
            setCurrentPoem(savedPoem)
          }
        }
      },
      (err) => {
        console.error('Error listening to poems:', err)
        setError('Failed to load poems. Please check your connection.')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleNext = () => {
    if (!currentPoem || poems.length === 0) return
    const currentIndex = poems.findIndex(p => p.id === currentPoem.id)
    const nextIndex = currentIndex < poems.length - 1 ? currentIndex + 1 : 0
    setCurrentPoem(poems[nextIndex])
  }

  const handlePrevious = () => {
    if (!currentPoem || poems.length === 0) return
    const currentIndex = poems.findIndex(p => p.id === currentPoem.id)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : poems.length - 1
    setCurrentPoem(poems[prevIndex])
  }

  const handleClose = () => {
    setCurrentPoem(null)
  }

  const handlePoemClick = (poem: PoemWithId) => {
    setCurrentPoem(poem)
  }

  const handleAdminTrigger = () => {
    setIsAdminLoginOpen(true)
  }

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false)
    navigate('/admin')
  }


  return (
    <AnimatedBackground blurLevel={blurLevel}>
      <Navbar onSearchClick={() => {}} onMenuClick={() => setIsNavDrawerOpen(true)} onAdminTrigger={handleAdminTrigger} />
      <Hero poems={poems} />
      <SearchBar poems={poems} onPoemClick={handlePoemClick} onAdminTrigger={handleAdminTrigger} />
      <RandomPoemCard poems={poems} />
      <HowToUse />
      <PoetryGrid
        poems={poems}
        isLoading={isLoading}
        onCardClick={handlePoemClick}
      />
      <Suspense fallback={null}>
        <PoemReader
          poems={poems}
          currentPoem={currentPoem}
          onClose={handleClose}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </Suspense>
      <Suspense fallback={null}>
        <NavigationDrawer
          isOpen={isNavDrawerOpen}
          onClose={() => setIsNavDrawerOpen(false)}
        />
      </Suspense>
      {error && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg z-[300]">
          {error}
        </div>
      )}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </AnimatedBackground>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={null}>
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
