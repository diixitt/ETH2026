import { useMemo } from 'react'

export default function Trends() {
  const data = useMemo(() => ([3, 2, 1, 0, 2, 4, 3]), [])
  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Weekly Mood Trend</h2>
          <span className="text-xs text-gray-400">Aggregate-only • Zero-knowledge verified</span>
        </div>
        <svg className="w-full h-32">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {data.map((v, i) => {
            const x1 = i * 100 / (data.length - 1)
            const y1 = 100 - v * 15
            const x2 = (i+1) * 100 / (data.length - 1)
            const y2 = 100 - (data[i+1] ?? v) * 15
            if (i === data.length - 1) return null
            return <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="url(#grad)" strokeWidth="3" filter="url(#glow)" />
          })}
          <defs>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#6474ff"/>
              <stop offset="50%" stopColor="#9b7bff"/>
              <stop offset="100%" stopColor="#2cc5b8"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="text-xs text-gray-500 mt-2">Aggregate-only • Zero-knowledge verified</div>
      </div>
    </div>
  )
}
