import { Timestamp } from 'firebase/firestore'

export interface Frame {
  name: string
  imageUrl: string
  storagePath: string
  enabled: boolean
  sortOrder: number
  createdAt: Timestamp | Date
}

export interface FrameWithId extends Frame {
  id: string
}

export type CardType = 'classic' | 'frame'

export interface CardCustomization {
  font: string
  fontSize: number
  letterSpacing: number
  lineHeight: number
  backgroundImage?: string
  userName?: string
  backgroundBlur: number
  showUserName: boolean
  showBrand: boolean
}
