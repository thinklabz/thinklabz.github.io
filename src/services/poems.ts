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

/**
 * Poem interface matching Firestore document structure
 */
export interface Poem {
  title: string
  text: string
  image: string
  category: string
  month: string
  instagram: string
  createdAt: Timestamp
}

/**
 * Poem with document ID (for returned data from Firestore)
 */
export interface PoemWithId extends Poem {
  id: string
}

const POEMS_COLLECTION = 'poems'

/**
 * Get all poems from Firestore, sorted by createdAt (newest first)
 * @returns Array of poems with IDs
 */
export async function getAllPoems(): Promise<PoemWithId[]> {
  try {
    const poemsRef = collection(db, POEMS_COLLECTION)
    const q = query(poemsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const poems: PoemWithId[] = []
    querySnapshot.forEach((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
      poems.push({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Poem)
      })
    })
    
    return poems
  } catch (error) {
    console.error('Error fetching poems:', error)
    throw new Error('Failed to fetch poems. Please try again.')
  }
}

/**
 * Subscribe to real-time updates for all poems
 * @param onUpdate - Callback function called with updated poems array
 * @param onError - Optional callback function called on error
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToPoems(
  onUpdate: (poems: PoemWithId[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const poemsRef = collection(db, POEMS_COLLECTION)
  const q = query(poemsRef, orderBy('createdAt', 'desc'))
  
  return onSnapshot(
    q,
    (querySnapshot: QuerySnapshot<DocumentData>) => {
      const poems: PoemWithId[] = []
      querySnapshot.forEach((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
        poems.push({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Poem)
        })
      })
      onUpdate(poems)
    },
    (error: any) => {
      console.error('Error listening to poems:', error)
      const errorMessage = new Error('Failed to listen to poems. Please try again.')
      onError?.(errorMessage)
    }
  )
}

/**
 * Get a single poem by ID
 * @param id - Document ID
 * @returns Poem with ID or null if not found
 */
export async function getPoem(id: string): Promise<PoemWithId | null> {
  try {
    const docRef = doc(db, POEMS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...(docSnap.data() as Poem)
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching poem:', error)
    throw new Error('Failed to fetch poem. Please try again.')
  }
}

/**
 * Create a new poem in Firestore
 * @param poem - Poem data (without createdAt, will be auto-generated)
 * @returns Created poem with ID
 */
export async function createPoem(poem: Omit<Poem, 'createdAt'>): Promise<PoemWithId> {
  try {
    const poemsRef = collection(db, POEMS_COLLECTION)
    const newPoem: Poem = {
      ...poem,
      createdAt: Timestamp.now()
    }
    
    const docRef = await addDoc(poemsRef, newPoem)
    
    return {
      id: docRef.id,
      ...newPoem
    }
  } catch (error) {
    console.error('Error creating poem:', error)
    throw new Error('Failed to create poem. Please try again.')
  }
}

/**
 * Update an existing poem
 * @param id - Document ID
 * @param poem - Partial poem data to update
 * @returns Updated poem with ID
 */
export async function updatePoem(id: string, poem: Partial<Omit<Poem, 'createdAt'>>): Promise<PoemWithId> {
  try {
    const docRef = doc(db, POEMS_COLLECTION, id)
    
    // Get current poem data
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error('Poem not found')
    }
    
    const currentData = docSnap.data() as Poem
    
    // Update document
    await updateDoc(docRef, poem as DocumentData)
    
    // Return updated poem
    return {
      id,
      ...currentData,
      ...poem
    } as PoemWithId
  } catch (error) {
    console.error('Error updating poem:', error)
    throw new Error('Failed to update poem. Please try again.')
  }
}

/**
 * Delete a poem
 * @param id - Document ID
 */
export async function deletePoem(id: string): Promise<void> {
  try {
    const docRef = doc(db, POEMS_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting poem:', error)
    throw new Error('Failed to delete poem. Please try again.')
  }
}
