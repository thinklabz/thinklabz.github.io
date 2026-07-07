import { useState, useEffect } from 'react'
import { CardType, FrameWithId } from '../../types/frames'
import { getEnabledFrames } from '../../services/frames'

interface TemplatesModalProps {
  cardType: CardType
  onCardTypeChange: (type: CardType) => void
  selectedFrame?: FrameWithId
  onFrameSelect?: (frame: FrameWithId) => void
}

export default function TemplatesModal({
  cardType,
  onCardTypeChange,
  selectedFrame,
  onFrameSelect
}: TemplatesModalProps) {
  const [frames, setFrames] = useState<FrameWithId[]>([])
  const [isLoadingFrames, setIsLoadingFrames] = useState(false)

  useEffect(() => {
    if (cardType === 'frame') {
      loadFrames()
    }
  }, [cardType])

  const loadFrames = async () => {
    try {
      setIsLoadingFrames(true)
      const enabledFrames = await getEnabledFrames()
      setFrames(enabledFrames)
      
      if (!selectedFrame && enabledFrames.length > 0) {
        onFrameSelect?.(enabledFrames[0])
      }
    } catch (error) {
      console.error('Error loading frames:', error)
    } finally {
      setIsLoadingFrames(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Template
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onCardTypeChange('classic')}
            className={`px-4 py-4 rounded-2xl border-2 font-medium text-sm transition-all ${
              cardType === 'classic'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/10 bg-secondary/20 text-foreground hover:border-border/30'
            }`}
          >
            Classic
          </button>
          <button
            onClick={() => onCardTypeChange('frame')}
            className={`px-4 py-4 rounded-2xl border-2 font-medium text-sm transition-all ${
              cardType === 'frame'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/10 bg-secondary/20 text-foreground hover:border-border/30'
            }`}
          >
            Frame
          </button>
        </div>
      </div>

      {/* Frame Selection (only when Frame template is selected) */}
      {cardType === 'frame' && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Frame Style
          </h3>
          
          {isLoadingFrames ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : frames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm bg-secondary/10 rounded-2xl border border-border/10">
              No frames available
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {frames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => onFrameSelect?.(frame)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedFrame?.id === frame.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border/10 hover:border-border/30'
                  }`}
                  title={frame.name}
                >
                  <img
                    src={frame.imageUrl}
                    alt={frame.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedFrame?.id === frame.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
