import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Image as ImageIcon } from 'lucide-react'
import { PoemWithId } from '../services/poems'

interface DownloadTemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  poem: PoemWithId
}

type TemplateType = 'dark' | 'polaroid'

const FONT_STACK = '"Cormorant Garamond", "EB Garamond", "Playfair Display", Georgia, serif'

/**
 * Wraps text to fit maxWidth. Force-breaks any single word that is wider
 * than maxWidth on its own so text can never escape the canvas.
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  const pushLongWord = (word: string) => {
    // Break a single overlong word into chunks that fit maxWidth.
    let chunk = ''
    for (const char of word) {
      const test = chunk + char
      if (ctx.measureText(test).width > maxWidth && chunk) {
        lines.push(chunk)
        chunk = char
      } else {
        chunk = test
      }
    }
    return chunk
  }

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = ctx.measureText(testLine).width

    if (testWidth <= maxWidth) {
      currentLine = testLine
      return
    }

    // Current line is full — flush it.
    if (currentLine) {
      lines.push(currentLine)
      currentLine = ''
    }

    // Does the word alone fit on an empty line?
    if (ctx.measureText(word).width <= maxWidth) {
      currentLine = word
    } else {
      // Word itself is wider than maxWidth — force-break it.
      currentLine = pushLongWord(word)
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Shared font-fitting routine used by both templates so Type 1 and Type 2
 * always wrap/scale identically. Shrinks font size until every wrapped line
 * fits within maxWidth and the whole block fits within maxHeight.
 */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  initialFontSize: number,
  minFontSize = 8,
  lineHeightRatio = 1.4
): { fontSize: number; lines: string[]; lineHeight: number } {
  let fontSize = initialFontSize
  let lines: string[] = []
  let lineHeight = fontSize * lineHeightRatio

  while (fontSize >= minFontSize) {
    ctx.font = `${fontSize}px ${FONT_STACK}`
    lines = wrapText(ctx, text, maxWidth)
    lineHeight = fontSize * lineHeightRatio
    const totalHeight = lines.length * lineHeight

    if (totalHeight <= maxHeight) break
    fontSize -= 1
  }

  return { fontSize, lines, lineHeight }
}

/** Draws the poem's image (or a fallback gradient) covering the canvas. */
async function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  imageSrc: string | undefined,
  fallbackColors: [string, string]
) {
  const drawFallback = () => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, fallbackColors[0])
    gradient.addColorStop(1, fallbackColors[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  if (!imageSrc) {
    drawFallback()
    return
  }

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageSrc
    })

    const imgRatio = img.width / img.height
    const canvasRatio = width / height
    let drawWidth: number, drawHeight: number, drawX: number, drawY: number

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
  } catch {
    drawFallback()
  }
}

/** Draws the bottom-left dot + right-aligned caption + domain, all clamped to canvas width. */
function drawBranding(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isDownload: boolean,
  caption: string
) {
  const brandingY = height - 40
  const brandingText = caption.trim() || 'ZeroDot'

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = `${isDownload ? 20 : 10}px Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText('●', 40, brandingY)

  ctx.textAlign = 'right'
  // Reserve space for the left dot so the caption never overlaps or overflows.
  const maxBrandingWidth = width - 100
  let displayBrandingText = brandingText
  if (ctx.measureText(displayBrandingText).width > maxBrandingWidth) {
    while (
      displayBrandingText.length > 0 &&
      ctx.measureText(displayBrandingText + '...').width > maxBrandingWidth
    ) {
      displayBrandingText = displayBrandingText.slice(0, -1)
    }
    displayBrandingText += '...'
  }
  ctx.fillText(displayBrandingText, width - 40, brandingY)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.font = `${isDownload ? 16 : 8}px Arial, sans-serif`
  ctx.fillText('zerodot.in', width - 40, brandingY - 20)
}

export default function DownloadTemplateSelector({ isOpen, onClose, poem }: DownloadTemplateSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('dark')
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [customCaption, setCustomCaption] = useState('')
  const [debouncedCaption, setDebouncedCaption] = useState('')

  // Clear caption when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCustomCaption('')
      setDebouncedCaption('')
    }
  }, [isOpen])

  // Debounce caption so we don't regenerate the preview on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedCaption(customCaption), 250)
    return () => clearTimeout(handle)
  }, [customCaption])

  const generateDarkCard = useCallback(async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isDownload: boolean,
    caption: string
  ) => {
    await drawBackground(ctx, width, height, poem.image, ['#1a1a1a', '#000000'])

    // Subtle dark gradient overlay for readability
    const overlayGradient = ctx.createLinearGradient(0, 0, 0, height)
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)')
    overlayGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)')
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)')
    ctx.fillStyle = overlayGradient
    ctx.fillRect(0, 0, width, height)

    // Poem text (wrapped, auto-scaled) - vertically centered
    const maxWidth = width * 0.7
    const maxHeight = height * 0.7
    const initialFontSize = isDownload ? 32 : 16
    const minFontSize = isDownload ? 16 : 8
    const { fontSize, lines, lineHeight } = fitText(
      ctx, poem.text, maxWidth, maxHeight, initialFontSize, minFontSize
    )

    ctx.font = `${fontSize}px ${FONT_STACK}`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'

    const totalTextHeight = lines.length * lineHeight
    const startY = (height - totalTextHeight) / 2

    let y = startY
    lines.forEach((line) => {
      ctx.fillText(line, width / 2, y)
      y += lineHeight
    })

    drawBranding(ctx, width, height, isDownload, caption)
  }, [poem])

  const generatePolaroidCard = useCallback(async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isDownload: boolean,
    caption: string
  ) => {
    await drawBackground(ctx, width, height, poem.image, ['#666666', '#333333'])

    // Soft dark gradient from bottom upwards for text readability
    const overlayGradient = ctx.createLinearGradient(0, height * 0.4, 0, height)
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    overlayGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.3)')
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)')
    ctx.fillStyle = overlayGradient
    ctx.fillRect(0, height * 0.4, width, height * 0.6)

    // Title - editorial magazine style, also clamped to canvas width
    const titleMaxWidth = width * 0.8
    const titleText = poem.title || 'Poem'
    let titleFontSize = isDownload ? 42 : 21
    ctx.font = `bold ${titleFontSize}px ${FONT_STACK}`
    while (ctx.measureText(titleText).width > titleMaxWidth && titleFontSize > (isDownload ? 20 : 10)) {
      titleFontSize -= 1
      ctx.font = `bold ${titleFontSize}px ${FONT_STACK}`
    }
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText(titleText, width / 2, height * 0.62)

    // Poem text (wrapped, auto-scaled) - lower portion, same logic as Type 1
    const maxWidth = width * 0.7
    const maxHeight = height * 0.28
    const initialFontSize = isDownload ? 26 : 13
    const minFontSize = isDownload ? 14 : 7
    const { fontSize, lines, lineHeight } = fitText(
      ctx, poem.text, maxWidth, maxHeight, initialFontSize, minFontSize
    )

    ctx.font = `${fontSize}px ${FONT_STACK}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.textAlign = 'center'

    let y = height * 0.7
    lines.forEach((line) => {
      ctx.fillText(line, width / 2, y)
      y += lineHeight
    })

    drawBranding(ctx, width, height, isDownload, caption)
  }, [poem])

  const generatePreview = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 540
    canvas.height = 675

    if (selectedTemplate === 'dark') {
      await generateDarkCard(ctx, canvas.width, canvas.height, false, debouncedCaption)
    } else {
      await generatePolaroidCard(ctx, canvas.width, canvas.height, false, debouncedCaption)
    }

    setPreviewUrl(canvas.toDataURL('image/png'))
  }, [selectedTemplate, generateDarkCard, generatePolaroidCard, debouncedCaption])

  // Only regenerate when template, poem, or (debounced) caption actually changes.
  useEffect(() => {
    if (isOpen && poem) {
      generatePreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedTemplate, poem, debouncedCaption])

  const handleDownload = useCallback(async () => {
    setIsGenerating(true)

    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size for high-quality download (unchanged)
      canvas.width = 1080
      canvas.height = 1350

      if (selectedTemplate === 'dark') {
        await generateDarkCard(ctx, canvas.width, canvas.height, true, customCaption)
      } else {
        await generatePolaroidCard(ctx, canvas.width, canvas.height, true, customCaption)
      }

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
  }, [selectedTemplate, poem, customCaption, generateDarkCard, generatePolaroidCard, onClose])

  const captionCount = useMemo(() => customCaption.length, [customCaption])

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
              className="
                fixed
                inset-0
                z-[301]
                flex
                justify-center
                items-end
                sm:items-center
                pointer-events-none
              "
            >
              <div
                className="
                  pointer-events-auto
                  w-[94vw]
                  max-w-[720px]
                  max-h-[92dvh]
                  sm:max-h-[85vh]
                  bg-[rgba(15,15,15,0.45)] backdrop-blur-24 -webkit-backdrop-blur-24
                  rounded-t-3xl sm:rounded-2xl border border-white/12
                  shadow-[0_20px_60px_rgba(0,0,0,0.35)]
                  flex flex-col
                  overflow-hidden
                "
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
              >
                {/* Header (fixed, never scrolls) */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
                  <h3 className="text-lg font-semibold text-white">Choose Template</h3>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5">
                  {/* Template Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedTemplate('dark')}
                      className={`w-full p-3 rounded-xl border-2 transition-all ${
                        selectedTemplate === 'dark'
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 hover:border-white/20 bg-white/6 backdrop-blur-16'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                          selectedTemplate === 'dark' ? 'border-primary bg-primary' : 'border-white/30'
                        }`} />
                        <span className="text-sm font-medium text-white">Type 1 — Dark Premium</span>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedTemplate('polaroid')}
                      className={`w-full p-3 rounded-xl border-2 transition-all ${
                        selectedTemplate === 'polaroid'
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 hover:border-white/20 bg-white/6 backdrop-blur-16'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                          selectedTemplate === 'polaroid' ? 'border-primary bg-primary' : 'border-white/30'
                        }`} />
                        <span className="text-sm font-medium text-white">Type 2 — Polaroid Style</span>
                      </div>
                    </motion.button>
                  </div>

                  {/* Preview */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-white/70" />
                      <span className="text-xs text-white/70 uppercase tracking-wider">Preview</span>
                    </div>
                    <AnimatePresence mode="wait">
                      {previewUrl && (
                        <motion.div
                          key={selectedTemplate}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="
                            relative mx-auto
                            w-full max-w-[320px] sm:max-w-none
                            max-h-[38vh] sm:max-h-none
                            aspect-[4/5]
                            rounded-lg overflow-hidden
                            bg-white/6 backdrop-blur-16 border border-white/10
                          "
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
                      <span className="text-xs text-white/70 uppercase tracking-wider">Custom Caption</span>
                      <span className="text-xs text-white/70">{captionCount} / 120</span>
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
                      className="w-full px-4 py-3 bg-white/6 backdrop-blur-16 border border-white/10 rounded-xl text-white placeholder:text-white/50 outline-none focus:border-white/20 transition-all"
                      maxLength={120}
                    />
                  </div>
                </div>

                {/* Download Button (always visible, outside the scroll area) */}
                <div className="px-5 pt-2 pb-5 shrink-0">
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