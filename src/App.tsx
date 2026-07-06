import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowToUse from './components/HowToUse'
import PoetryGrid from './components/PoetryGrid'
import ErrorBoundary from './components/ErrorBoundary'
import { subscribeToPoems, PoemWithId } from './services/poems'

const PoemReader = lazy(() => import('./components/PoemReader'))
const SearchOverlay = lazy(() => import('./components/SearchOverlay'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const Admin = lazy(() => import('./pages/Admin'))
const NavigationDrawer = lazy(() => import('./components/NavigationDrawer'))

function Home() {
  const [poems, setPoems] = useState<PoemWithId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPoem, setCurrentPoem] = useState<PoemWithId | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToPoems(
      (updatedPoems) => {
        setPoems(updatedPoems)
        setIsLoading(false)
        setError(null)
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

  return (
    <>
      <Navbar onSearchClick={() => setIsSearchOpen(true)} onMenuClick={() => setIsNavDrawerOpen(true)} />
      <Hero poems={poems} />
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
        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          poems={poems}
          isLoading={isLoading}
          onPoemClick={handlePoemClick}
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
    </>
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
