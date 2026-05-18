import { useState, useEffect } from 'react'

const cache: Record<string, string> = {}

export function useMicrolinkImage(url?: string) {
  const cached = url ? cache[url] : undefined
  const [imageUrl, setImageUrl] = useState<string | null>(cached ?? null)
  const [loading, setLoading] = useState(!!url && !cached)

  useEffect(() => {
    if (!url) return
    if (cache[url]) {
      setImageUrl(cache[url])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => {
        const img = data?.data?.image?.url ?? data?.data?.screenshot?.url
        if (img) {
          cache[url] = img
          setImageUrl(img)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [url])

  return { imageUrl, loading }
}
