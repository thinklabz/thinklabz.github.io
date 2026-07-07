import { PoemWithId } from '../../services/poems'
import { CardCustomization } from '../../types/frames'
import CardRenderer from './CardRenderer'

interface ClassicTemplateProps {
  poem: PoemWithId
  customization: CardCustomization
  className?: string
}

export default function ClassicTemplate({ 
  poem, 
  customization, 
  className = ''
}: ClassicTemplateProps) {
  return (
    <CardRenderer 
      poem={poem} 
      customization={customization}
      className={className}
    />
  )
}
