import FigmaEmbed from '../components/FigmaEmbed'

export default function Design() {
  return (
    <div className="space-y-4 mt-4">
      <div className="card p-4">
        <div className="font-semibold mb-1">Figma Template</div>
        <div className="text-xs text-gray-400">Embedded directly in the app</div>
      </div>
      <FigmaEmbed />
    </div>
  )
}
