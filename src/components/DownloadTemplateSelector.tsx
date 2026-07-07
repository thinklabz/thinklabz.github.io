import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Image as ImageIcon } from 'lucide-react'
import { PoemWithId } from '../services/poems'

interface DownloadTemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  poem: PoemWithId
}

type TemplateType = 'dark' | 'polaroid'

export default function DownloadTemplateSelector({ isOpen, onClose, poem }: DownloadTemplateSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('dark')
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [customCaption, setCustomCaption] = useState('')

  // Clear caption when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCustomCaption('')
    }
  }, [isOpen])

  // Generate preview when template changes or caption changes
  useEffect(() => {
    if (isOpen && poem) {
      generatePreview()
    }
  }, [selectedTemplate, isOpen, poem, customCaption])

  const generatePreview = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size for preview (smaller for performance)
    canvas.width = 540
    canvas.height = 675

    if (selectedTemplate === 'dark') {
      await generateDarkCard(ctx, canvas.width, canvas.height, false, customCaption)
    } else {
      await generatePolaroidCard(ctx, canvas.width, canvas.height, false, customCaption)
    }

    const dataUrl = canvas.toDataURL('image/png')
    setPreviewUrl(dataUrl)
  }, [selectedTemplate, poem, customCaption])

  const generateDarkCard = useCallback(async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isDownload: boolean,
    caption: string
  ) => {
    // Load and draw poem image as full background
    if (poem.image) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = poem.image!
        })
        
        // Draw image covering entire canvas (object-fit: cover)
        const imgRatio = img.width / img.height
        const canvasRatio = width / height
        let drawWidth, drawHeight, drawX, drawY
        
        if (imgRatio > canvasRatio) {
          drawHeight = height
          drawWidth = height * imgRatio
          drawX = (width - drawWidth) / 2
          drawY = 0
        } else {
          drawWidth = width
          drawHeight = width / imgRatio
          drawX = 0
          drawY = (height - drawHeight) / 2
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      } catch (error) {
        // Fallback gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, '#1a1a1a')
        gradient.addColorStop(1, '#000000')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }
    } else {
      // Fallback gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#1a1a1a')
      gradient.addColorStop(1, '#000000')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    // Subtle dark gradient overlay for readability
    const overlayGradient = ctx.createLinearGradient(0, 0, 0, height)
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)')
    overlayGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)')
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)')
    ctx.fillStyle = overlayGradient
    ctx.fillRect(0, 0, width, height)

    // Poem text (wrapped) - vertically centered (no title or divider)
    ctx.font = `${isDownload ? 32 : 16}px "Cormorant Garamond", "EB Garamond", "Playfair Display", Georgia, serif`
    ctx.fillStyle = '#ffffff'
    const maxWidth = width * 0.8
    const lineHeight = isDownload ? 45 : 22
    const lines = wrapText(ctx, poem.text, maxWidth)
    
    let y = height * 0.4
    lines.forEach((line) => {
      ctx.fillText(line, width / 2, y)
      y += lineHeight
    })

    // Branding - minimal at bottom
    let brandingY = height - 40
    
    // Use custom caption or default ZeroDot
    const brandingText = caption.trim() || 'ZeroDot'

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = `${isDownload ? 20 : 10}px Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText('●', 40, brandingY)
    
    ctx.textAlign = 'right'
    // Truncate branding text if too long to prevent overflow
    const maxBrandingWidth = width - 100
    let displayBrandingText = brandingText
    if (ctx.measureText(brandingText).width > maxBrandingWidth) {
      while (ctx.measureText(displayBrandingText + '...').width > maxBrandingWidth && displayBrandingText.length > 0) {
        displayBrandingText = displayBrandingText.slice(0, -1)
      }
      displayBrandingText += '...'
    }
    ctx.fillText(displayBrandingText, width - 40, brandingY)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = `${isDownload ? 16 : 8}px Arial, sans-serif`
    ctx.fillText('zerodot.in', width - 40, brandingY - 20)
  }, [poem])

  const generatePolaroidCard = useCallback(async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isDownload: boolean,
    caption: string
  ) => {
    // Load and draw poem image as full background
    if (poem.image) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = poem.image!
        })
        
        // Draw image covering entire canvas (object-fit: cover)
        const imgRatio = img.width / img.height
        const canvasRatio = width / height
        let drawWidth, drawHeight, drawX, drawY
        
        if (imgRatio > canvasRatio) {
          drawHeight = height
          drawWidth = height * imgRatio
          drawX = (width - drawWidth) / 2
          drawY = 0
        } else {
          drawWidth = width
          drawHeight = width / imgRatio
          drawX = 0
          drawY = (height - drawHeight) / 2
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      } catch (error) {
        // Fallback gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, '#666666')
        gradient.addColorStop(1, '#333333')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }
    } else {
      // Fallback gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#666666')
      gradient.addColorStop(1, '#333333')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    // Soft dark gradient from bottom upwards for text readability
    const overlayGradient = ctx.createLinearGradient(0, height * 0.4, 0, height)
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    overlayGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.3)')
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)')
    ctx.fillStyle = overlayGradient
    ctx.fillRect(0, height * 0.4, width, height * 0.6)

    // BY AVX - editorial style
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = `italic ${isDownload ? 18 : 9}px "Cormorant Garamond", Georgia, serif`
    ctx.textAlign = 'center'
    ctx.fillText('BY AVX', width / 2, height * 0.55)

    // Title - editorial magazine style
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${isDownload ? 42 : 21}px "Cormorant Garamond", "EB Garamond", "Playfair Display", Georgia, serif`
    ctx.fillText(poem.title || 'Poem', width / 2, height * 0.62)

    // Poem text (wrapped) - lower portion
    ctx.font = `${isDownload ? 26 : 13}px "Cormorant Garamond", "EB Garamond", "Playfair Display", Georgia, serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    const maxWidth = width * 0.85
    const lineHeight = isDownload ? 38 : 19
    const lines = wrapText(ctx, poem.text, maxWidth)
    
    let y = height * 0.7
    lines.forEach((line) => {
      ctx.fillText(line, width / 2, y)
      y += lineHeight
    })

    // Branding - minimal at bottom
    let brandingY = height - 40
    
    // Use custom caption or default ZeroDot
    const brandingText = caption.trim() || 'ZeroDot'

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = `${isDownload ? 20 : 10}px Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText('●', 40, brandingY)
    
    ctx.textAlign = 'right'
    // Truncate branding text if too long to prevent overflow
    const maxBrandingWidth = width - 100
    let displayBrandingText = brandingText
    if (ctx.measureText(brandingText).width > maxBrandingWidth) {
      while (ctx.measureText(displayBrandingText + '...').width > maxBrandingWidth && displayBrandingText.length > 0) {
        displayBrandingText = displayBrandingText.slice(0, -1)
      }
      displayBrandingText += '...'
    }
    ctx.fillText(displayBrandingText, width - 40, brandingY)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = `${isDownload ? 16 : 8}px Arial, sans-serif`
    ctx.fillText('zerodot.in', width - 40, brandingY - 20)
  }, [poem])

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  const handleDownload = useCallback(async () => {
    setIsGenerating(true)
    
    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size for high-quality download
      canvas.width = 1080
      canvas.height = 1350

      if (selectedTemplate === 'dark') {
        await generateDarkCard(ctx, canvas.width, canvas.height, true, customCaption)
      } else {
        await generatePolaroidCard(ctx, canvas.width, canvas.height, true, customCaption)
      }

      // Download
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${poem.title || 'poem'}-zerodot-${selectedTemplate}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error generating download:', error)
    } finally {
      setIsGenerating(false)
      onClose()
    }
  }, [selectedTemplate, poem, generateDarkCard, generatePolaroidCard, onClose])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[302]"
            />

            {/* Template Selector */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[303] w-[90%] max-w-md"
            >
              <div className="bg-secondary/95 backdrop-blur-xl rounded-2xl border border-border/20 p-5 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Choose Template</h3>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </motion.button>
                </div>

                {/* Template Options */}
                <div className="space-y-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedTemplate('dark')}
                    className={`w-full p-3 rounded-xl border-2 transition-all ${
                      selectedTemplate === 'dark'
                        ? 'border-primary bg-primary/10'
                        : 'border-border/20 hover:border-border/40 bg-background/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedTemplate === 'dark' ? 'border-primary bg-primary' : 'border-border'
                      }`} />
                      <span className="text-sm font-medium text-foreground">Type 1 — Dark Premium</span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedTemplate('polaroid')}
                    className={`w-full p-3 rounded-xl border-2 transition-all ${
                      selectedTemplate === 'polaroid'
                        ? 'border-primary bg-primary/10'
                        : 'border-border/20 hover:border-border/40 bg-background/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedTemplate === 'polaroid' ? 'border-primary bg-primary' : 'border-border'
                      }`} />
                      <span className="text-sm font-medium text-foreground">Type 2 — Polaroid Style</span>
                    </div>
                  </motion.button>
                </div>

                {/* Preview */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Preview</span>
                  </div>
                  <AnimatePresence mode="wait">
                    {previewUrl && (
                      <motion.div
                        key={selectedTemplate}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-background/50 border border-border/20"
                      >
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Custom Caption Input */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Custom Caption</span>
                    <span className="text-xs text-muted-foreground">{customCaption.length} / 120</span>
                  </div>
                  <input
                    type="text"
                    value={customCaption}
                    onChange={(e) => {
                      if (e.target.value.length <= 120) {
                        setCustomCaption(e.target.value)
                      }
                    }}
                    placeholder="Write your own caption... (optional)"
                    className="w-full px-4 py-3 bg-background/50 backdrop-blur-sm border border-border/30 rounded-xl text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-all"
                    maxLength={120}
                  />
                </div>

                {/* Download Button */}
                <motion.button
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isGenerating}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download PNG</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  )
}
