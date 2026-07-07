// Category accent colors - subtle accents that don't overpower the black & white theme
export const categoryAccents: Record<string, { primary: string; hover: string }> = {
  love: {
    primary: 'rgba(220, 38, 38, 0.6)', // soft crimson
    hover: 'rgba(220, 38, 38, 0.8)',
  },
  sad: {
    primary: 'rgba(71, 85, 105, 0.6)', // cool blue-grey
    hover: 'rgba(71, 85, 105, 0.8)',
  },
  hope: {
    primary: 'rgba(234, 179, 8, 0.6)', // warm gold
    hover: 'rgba(234, 179, 8, 0.8)',
  },
  night: {
    primary: 'rgba(31, 41, 55, 0.8)', // deep charcoal
    hover: 'rgba(31, 41, 55, 1)',
  },
  rain: {
    primary: 'rgba(59, 130, 246, 0.5)', // muted blue
    hover: 'rgba(59, 130, 246, 0.7)',
  },
  life: {
    primary: 'rgba(156, 163, 175, 0.6)', // elegant neutral
    hover: 'rgba(156, 163, 175, 0.8)',
  },
  default: {
    primary: 'rgba(255, 255, 255, 0.3)', // subtle white
    hover: 'rgba(255, 255, 255, 0.5)',
  },
}

export function getCategoryAccent(category?: string) {
  if (!category) return categoryAccents.default
  const normalizedCategory = category.toLowerCase()
  return categoryAccents[normalizedCategory] || categoryAccents.default
}
