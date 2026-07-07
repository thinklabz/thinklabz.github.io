import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { PoemWithId } from '../services/poems'

interface SearchOptions {
  threshold?: number
  includeScore?: boolean
  includeMatches?: boolean
  minMatchCharLength?: number
  keys?: string[]
}

export function useFuzzySearch(poems: PoemWithId[], query: string, category?: string, options: SearchOptions = {}) {
  const {
    threshold = 0.3,
    includeScore = true,
    includeMatches = true,
    minMatchCharLength = 2,
    keys = ['title', 'text', 'category', 'month']
  } = options

  const fuse = useMemo(() => {
    return new Fuse(poems, {
      threshold,
      includeScore,
      includeMatches,
      minMatchCharLength,
      keys
    })
  }, [poems, threshold, includeScore, includeMatches, minMatchCharLength, keys])

  const results = useMemo(() => {
    if (!query.trim()) {
      // Return all poems filtered by category if specified
      if (category && category !== 'all') {
        return poems.filter(poem => poem.category === category)
      }
      return poems
    }

    let searchResults = fuse.search(query)

    // Filter by category if specified
    if (category && category !== 'all') {
      searchResults = searchResults.filter(result => result.item.category === category)
    }

    return searchResults.map(result => ({
      poem: result.item,
      matches: result.matches,
      score: result.score
    }))
  }, [fuse, query, category, poems])

  return results
}
