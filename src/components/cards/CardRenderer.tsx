import { ReactNode } from 'react'
import { PoemWithId } from '../../services/poems'
import { CardCustomization } from '../../types/frames'

interface CardRendererProps {
  poem: PoemWithId
  customization: CardCustomization
  children?: ReactNode
  className?: string
}

export default function CardRenderer({ 
  poem, 
  customization, 
  children,
  className = ''
}: CardRendererProps) {
  const {
    font = "'Playfair Display', serif",
    fontSize = 32,
    letterSpacing = 0.02,
    lineHeight = 1.4,
    backgroundImage,
    userName = 'ZeroDot',
    backgroundBlur = 0,
    showUserName = true,
    showBrand = true
  } = customization

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ aspectRatio: '1/1' }}
    >
      {/* Background Image */}
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt="Card background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: `blur(${backgroundBlur}px)` }}
        />
      ) : poem.image ? (
        <img
          src={poem.image}
          alt={`Background for ${poem.title || 'poem'}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: `blur(${backgroundBlur}px)` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />

      {/* Poem Content - Centered */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="max-w-4xl w-full text-center">
          <h3 
            className="text-white font-bold leading-relaxed"
            style={{
              fontFamily: font,
              fontSize: `${fontSize}px`,
              letterSpacing: `${letterSpacing}em`,
              lineHeight,
              textShadow: '0 2px 12px rgba(0,0,0,0.5)'
            }}
          >
            {poem.text}
          </h3>
        </div>
      </div>

      {/* Footer - Bottom Right */}
      {(showUserName || showBrand) && (
        <div className="absolute bottom-4 right-4 text-right">
          {showUserName && (
            <p 
              className="text-white font-medium text-base"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
            >
              {userName}
            </p>
          )}
          {showBrand && (
            <p 
              className="text-white/35 text-[9px] tracking-wide"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              zerodot.in
            </p>
          )}
        </div>
      )}

      {/* Additional Layers (e.g., Frame) */}
      {children}
    </div>
  )
}
