import { useState, useEffect } from 'react'
import { X, Layout } from 'lucide-react'
import { CardType, FrameWithId } from '../../types/frames'
import { getEnabledFrames } from '../../services/frames'

interface TemplatesDrawerProps {
  isOpen: boolean
  onClose: () => void
  cardType: CardType
  onCardTypeChange: (type: CardType) => void
  selectedFrame?: FrameWithId
  onFrameSelect?: (frame: FrameWithId) => void
}

export default function TemplatesDrawer({
  isOpen,
  onClose,
  cardType,
  onCardTypeChange,
  selectedFrame,
  onFrameSelect
}: TemplatesDrawerProps) {
  const [frames, setFrames] = useState<FrameWithId[]>([])
  const [isLoadingFrames, setIsLoadingFrames] = useState(false)

  useEffect(() => {
    if (isOpen && cardType === 'frame') {
      loadFrames()
    }
  }, [isOpen, cardType])

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-background/95 backdrop-blur-xl rounded-2xl border border-border/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/10">
          <div className="flex items-center gap-3">
            <Layout className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground tracking-tight">Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/30 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Template
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onCardTypeChange('classic')}
                className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  cardType === 'classic'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/10 bg-secondary/20 text-foreground hover:border-border/30'
                }`}
              >
                Classic
              </button>
              <button
                onClick={() => onCardTypeChange('frame')}
                className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
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
                <div className="text-center py-8 text-muted-foreground text-sm bg-secondary/10 rounded-xl border border-border/10">
                  No frames available
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => onFrameSelect?.(frame)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
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
      </div>
    </div>
  )
}
