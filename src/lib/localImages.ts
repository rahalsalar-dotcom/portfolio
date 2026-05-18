const DB_NAME = 'nova-portfolio-images'
const STORE_NAME = 'images'
const DB_VERSION = 1
export const LOCAL_IMAGE_PREFIX = 'local-image:'

type StoredImage = {
  id: string
  blob: Blob
  name: string
  type: string
  createdAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.addEventListener('upgradeneeded', () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    })

    request.addEventListener('success', () => resolve(request.result))
    request.addEventListener('error', () => reject(request.error))
  })

  return dbPromise
}

function putImage(image: StoredImage): Promise<void> {
  return new Promise((resolve, reject) => {
    void openDatabase()
      .then((db) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        transaction.objectStore(STORE_NAME).put(image)
        transaction.addEventListener('complete', () => resolve())
        transaction.addEventListener('error', () => reject(transaction.error))
      })
      .catch(reject)
  })
}

function getImage(id: string): Promise<StoredImage | null> {
  return new Promise((resolve, reject) => {
    void openDatabase()
      .then((db) => {
        const transaction = db.transaction(STORE_NAME, 'readonly')
        const request = transaction.objectStore(STORE_NAME).get(id)
        request.addEventListener('success', () => resolve((request.result as StoredImage | undefined) ?? null))
        request.addEventListener('error', () => reject(request.error))
      })
      .catch(reject)
  })
}

function createImageId(file: File): string {
  const randomValue = window.crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
  const safeName = file.name.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()
  return `${Date.now()}-${randomValue}-${safeName}`
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(new Error('Image compression failed.'))
      },
      type,
      quality,
    )
  })
}

async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.addEventListener('load', () => resolve(element))
      element.addEventListener('error', () => reject(new Error('Could not load selected image.')))
      element.src = objectUrl
    })

    const maxSize = 1800
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      return file
    }

    canvas.width = width
    canvas.height = height
    context.drawImage(image, 0, 0, width, height)

    const compressed = await canvasToBlob(canvas, 'image/webp', 0.86)
    return compressed.size < file.size ? compressed : file
  } catch (error) {
    console.warn('Image compression failed. Saving original file.', error)
    return file
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function isLocalImageReference(src: string): boolean {
  return src.startsWith(LOCAL_IMAGE_PREFIX)
}

export async function saveLocalImageBlob(blob: Blob, name: string): Promise<string> {
  const fallbackFile = new File([blob], name, { type: blob.type })
  const id = createImageId(fallbackFile)

  await putImage({
    id,
    blob,
    name,
    type: blob.type,
    createdAt: Date.now(),
  })

  return `${LOCAL_IMAGE_PREFIX}${id}`
}

export async function saveLocalImage(file: File): Promise<string> {
  const blob = await compressImage(file)
  return await saveLocalImageBlob(blob, file.name)
}

export async function loadLocalImageObjectUrl(reference: string): Promise<string | null> {
  if (!isLocalImageReference(reference)) {
    return reference
  }

  const id = reference.slice(LOCAL_IMAGE_PREFIX.length)
  const image = await getImage(id)

  return image ? URL.createObjectURL(image.blob) : null
}
