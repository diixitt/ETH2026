import Avatar from './Avatar'
import { Lock } from 'lucide-react'

export default function RightActivity() {
  const items = [
    { id: 1, text: 'Someone you follow shared a mood', time: '2m' },
    { id: 2, text: 'A mood you supported received replies', time: '1h' },
    { id: 3, text: 'You sent anonymous support 2h ago', time: '2h' }
  ]
  return (
    <aside className="glass-panel grain p-4 sticky top-4 h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Activity</div>
      </div>
      <div className="space-y-3">
        {items.map(i => (
          <div key={i.id} className="glass-card animate-pulse hover:animate-none">
            <div className="flex items-center gap-3">
              <Avatar size={32} />
              <div className="flex-1">
                <div className="text-sm text-gray-200">{i.text}</div>
                <div className="text-xs text-gray-400">{i.time}</div>
              </div>
              <Lock size={16} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
