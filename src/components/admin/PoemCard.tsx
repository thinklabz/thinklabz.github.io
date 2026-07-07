import { Edit, Trash2 } from 'lucide-react'
import { PoemWithId } from '../../services/poems'

interface PoemCardProps {
  poem: PoemWithId
  onEdit: (poem: PoemWithId) => void
  onDelete: (id: string) => void
}

export default function PoemCard({ poem, onEdit, onDelete }: PoemCardProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-secondary/30 border border-border/20 rounded-xl overflow-hidden hover:border-border/40 transition-colors">
      {/* Background Image */}
      <div className="relative h-48 w-full">
        {poem.image ? (
          <img
            src={poem.image}
            alt={poem.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {poem.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 text-xs rounded-full bg-secondary text-foreground">
            {poem.category}
          </span>
          <span className="px-2 py-1 text-xs rounded-full bg-secondary text-foreground">
            {poem.month}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Created: {formatDate(poem.createdAt)}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(poem)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-foreground transition-colors"
            aria-label={`Edit poem: ${poem.title}`}
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>
          <button
            onClick={() => onDelete(poem.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
            aria-label={`Delete poem: ${poem.title}`}
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
