import { Lock } from 'lucide-react'
import Avatar from './Avatar'
import { useState } from 'react'
import { encryptJSON } from '../utils/crypto'
import { api } from '../utils/api'

export default function SupportModal({ open, onClose, post }) {
  const [msg, setMsg] = useState('')
  if (!open) return null
  const send = async () => {
    const payload = await encryptJSON({ message: msg })
    try { await api('/api/replies', { method: 'POST', body: JSON.stringify({ post_id: post?.id, ...payload }) }) } catch {}
    setMsg('')
    onClose?.()
  }
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glass-panel grain w-[640px] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar size={40} />
            <div className="flex-1">
              <div className="font-semibold">Anonymous</div>
              <div className="text-xs text-gray-400">End-to-end encrypted</div>
            </div>
            <Lock size={18} className="text-gray-400" />
          </div>
          <div className="glass-card mb-4">
            <div className="text-sm text-gray-300">Mood summary</div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="glass-panel p-2 text-sm text-gray-300">Anonymous reply</div>
            <div className="glass-panel p-2 text-sm text-gray-300">Anonymous reply</div>
          </div>
          <div className="flex gap-2">
            <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" placeholder="Send anonymous support…" value={msg} onChange={(e)=>setMsg(e.target.value)} />
            <button className="btn" onClick={send}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
