import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
  QuerySnapshot
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { Frame, FrameWithId } from '../types/frames'

const FRAMES_COLLECTION = 'frames'

export async function getAllFrames(): Promise<FrameWithId[]> {
  try {
    const framesRef = collection(db, FRAMES_COLLECTION)
    const q = query(framesRef, orderBy('sortOrder', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const frames: FrameWithId[] = []
    querySnapshot.forEach((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
      frames.push({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Frame)
      })
    })
    
    return frames
  } catch (error) {
    console.error('Error fetching frames:', error)
    throw new Error('Failed to fetch frames. Please try again.')
  }
}

export async function getEnabledFrames(): Promise<FrameWithId[]> {
  try {
    const allFrames = await getAllFrames()
    return allFrames.filter(frame => frame.enabled)
  } catch (error) {
    console.error('Error fetching enabled frames:', error)
    throw new Error('Failed to fetch enabled frames. Please try again.')
  }
}

export function subscribeToFrames(
  onUpdate: (frames: FrameWithId[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const framesRef = collection(db, FRAMES_COLLECTION)
  const q = query(framesRef, orderBy('sortOrder', 'asc'))
  
  return onSnapshot(
    q,
    (querySnapshot: QuerySnapshot<DocumentData>) => {
      const frames: FrameWithId[] = []
      querySnapshot.forEach((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
        frames.push({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Frame)
        })
      })
      onUpdate(frames)
    },
    (error: any) => {
      console.error('Error listening to frames:', error)
      const errorMessage = new Error('Failed to listen to frames. Please try again.')
      onError?.(errorMessage)
    }
  )
}

export async function getFrame(id: string): Promise<FrameWithId | null> {
  try {
    const docRef = doc(db, FRAMES_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...(docSnap.data() as Frame)
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching frame:', error)
    throw new Error('Failed to fetch frame. Please try again.')
  }
}

export async function createFrame(frame: Omit<Frame, 'createdAt' | 'id'>): Promise<FrameWithId> {
  try {
    const framesRef = collection(db, FRAMES_COLLECTION)
    const newFrame: Omit<Frame, 'id'> = {
      ...frame,
      createdAt: Timestamp.now()
    }
    
    const docRef = await addDoc(framesRef, newFrame)
    
    return {
      id: docRef.id,
      ...newFrame
    }
  } catch (error) {
    console.error('Error creating frame:', error)
    throw new Error('Failed to create frame. Please try again.')
  }
}

export async function updateFrame(id: string, frame: Partial<Omit<Frame, 'createdAt' | 'id'>>): Promise<FrameWithId> {
  try {
    const docRef = doc(db, FRAMES_COLLECTION, id)
    
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error('Frame not found')
    }
    
    const currentData = docSnap.data() as Frame
    
    await updateDoc(docRef, frame as DocumentData)
    
    return {
      id,
      ...currentData,
      ...frame
    } as FrameWithId
  } catch (error) {
    console.error('Error updating frame:', error)
    throw new Error('Failed to update frame. Please try again.')
  }
}

export async function deleteFrame(id: string): Promise<void> {
  try {
    const docRef = doc(db, FRAMES_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting frame:', error)
    throw new Error('Failed to delete frame. Please try again.')
  }
}

export async function reorderFrames(frameIds: string[]): Promise<void> {
  try {
    const updatePromises = frameIds.map((id, index) => 
      updateFrame(id, { sortOrder: index })
    )
    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error reordering frames:', error)
    throw new Error('Failed to reorder frames. Please try again.')
  }
}
