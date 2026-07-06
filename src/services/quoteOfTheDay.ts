import { PoemWithId } from './poems'

const CACHE_KEY = 'quote_of_the_day'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface CachedQuote {
  poemId: string
  timestamp: number
}

/**
 * Get the Quote of the Day from Firestore
 * Caches the selected poem ID for 24 hours
 * @param poems - Array of poems to select from
 * @returns The selected poem or null if no poems available
 */
export function getQuoteOfTheDay(poems: PoemWithId[]): PoemWithId | null {
  if (poems.length === 0) {
    return null
  }

  const now = Date.now()
  const cachedData = localStorage.getItem(CACHE_KEY)

  if (cachedData) {
    try {
      const cached: CachedQuote = JSON.parse(cachedData)
      
      // Check if cache is still valid (less than 24 hours old)
      if (now - cached.timestamp < CACHE_DURATION) {
        // Find the cached poem in the current poems array
        const cachedPoem = poems.find(p => p.id === cached.poemId)
        if (cachedPoem) {
          return cachedPoem
        }
      }
    } catch (error) {
      console.error('Error parsing cached quote:', error)
    }
  }

  // Select a random poem
  const randomIndex = Math.floor(Math.random() * poems.length)
  const selectedPoem = poems[randomIndex]

  // Cache the selection
  const newCache: CachedQuote = {
    poemId: selectedPoem.id,
    timestamp: now
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(newCache))

  return selectedPoem
}
