import { useMemo } from 'react'

export default function FigmaEmbed({ url }) {
  const src = useMemo(() => {
    const u = url || import.meta.env.VITE_FIGMA_EMBED_URL
    return u || ''
  }, [url])
  if (!src) {
    return (
      <div className="card p-4 text-sm text-gray-400">
        Set VITE_FIGMA_EMBED_URL in .env to display your Figma template.
      </div>
    )
  }
  return (
    <div className="card overflow-hidden">
      <div className="relative" style={{ paddingTop: '56.25%' }}>
        <iframe
          title="Figma Template"
          className="absolute inset-0 w-full h-full"
          src={src}
          allowFullScreen
        />
      </div>
    </div>
  )
}
