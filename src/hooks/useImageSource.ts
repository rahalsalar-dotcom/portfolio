import { useEffect, useState } from 'react'
import { isLocalImageReference, loadLocalImageObjectUrl } from '../lib/localImages'

export function useImageSource(src: string) {
  const [localImage, setLocalImage] = useState({ src: '', resolvedSrc: '' })
  const isLocalImage = isLocalImageReference(src)

  useEffect(() => {
    let active = true
    let objectUrl = ''

    if (!isLocalImage) {
      return undefined
    }

    void loadLocalImageObjectUrl(src).then((url) => {
      if (!active) {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }

        return
      }

      objectUrl = url ?? ''
      setLocalImage({ src, resolvedSrc: objectUrl })
    })

    return () => {
      active = false

      if (objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [isLocalImage, src])

  if (!isLocalImage) {
    return src
  }

  return localImage.src === src ? localImage.resolvedSrc : ''
}
