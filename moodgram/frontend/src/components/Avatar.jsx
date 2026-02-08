export default function Avatar({ size = 40 }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-700 shrink-0"
      style={{ width: size, height: size }}
      aria-label="Anonymous avatar"
    />
  )
}
