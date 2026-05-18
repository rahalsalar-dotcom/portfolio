import { initializeApp, getApps } from 'firebase/app'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { firebaseConfig, firebaseEnabled } from './runtimeConfig'
import type { SiteContent } from '../types'

const app = firebaseEnabled ? (getApps()[0] ?? initializeApp(firebaseConfig)) : null
const db = app ? getFirestore(app) : null
const storage = app ? getStorage(app) : null

export async function loadRemoteContent(): Promise<SiteContent | null> {
  if (!db) {
    return null
  }

  try {
    const snapshot = await getDoc(doc(db, 'portfolio', 'site'))
    return snapshot.exists() ? (snapshot.data() as SiteContent) : null
  } catch (error) {
    console.warn('Firebase content load failed. Falling back to local content.', error)
    return null
  }
}

export async function saveRemoteContent(content: SiteContent): Promise<void> {
  if (!db) {
    return
  }

  try {
    await setDoc(doc(db, 'portfolio', 'site'), content)
  } catch (error) {
    console.warn('Firebase content save failed. Local content was still updated.', error)
  }
}

export async function uploadRemoteImage(file: File): Promise<string | null> {
  if (!storage) {
    return null
  }

  try {
    const safeName = file.name.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()
    const imageRef = ref(storage, `portfolio/${Date.now()}-${safeName}`)
    await uploadBytes(imageRef, file)
    return await getDownloadURL(imageRef)
  } catch (error) {
    console.warn('Firebase image upload failed. Falling back to local data URL.', error)
    return null
  }
}
