import { PoemWithId } from '../../services/poems'
import { CardCustomization, FrameWithId } from '../../types/frames'
import CardRenderer from './CardRenderer'

interface FrameTemplateProps {
  poem: PoemWithId
  customization: CardCustomization
  frame: FrameWithId
  className?: string
}

export default function FrameTemplate({ 
  poem, 
  customization, 
  frame,
  className = ''
}: FrameTemplateProps) {
  return (
    <CardRenderer 
      poem={poem} 
      customization={customization}
      className={className}
    >
      {/* Frame Overlay - Top Layer */}
      <img
        src={frame.imageUrl}
        alt={frame.name}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ mixBlendMode: 'normal' }}
      />
    </CardRenderer>
  )
}
