import { Lock, Heart } from 'lucide-react'
import Avatar from './Avatar'

const moodEmoji = {
  happy: '😊',
  neutral: '😐',
  sad: '😔'
}

export default function MoodCard({ mood = 'neutral', text = '', timestamp = new Date(), onSupport, replies = [], pseudonym = 'Anon' }) {
  return (
    <div className="glass-card grain idle-drift liquid-compress space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar size={36} />
          <div className="absolute inset-0 rounded-full halo" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{pseudonym}</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{moodEmoji[mood]}</span>
            <Lock size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Mood shared securely</span>
          </div>
          <div className="text-xs text-gray-400">{new Date(timestamp).toLocaleString()}</div>
        </div>
      </div>
      {text && <p className="text-sm text-gray-200">{text}</p>}
      <button className="btn w-full" onClick={onSupport}><Heart size={16} className="mr-2" />Send Support</button>
      {replies?.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((r, i) => (
            <div key={i} className="glass-panel p-2 text-sm text-gray-300">
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
