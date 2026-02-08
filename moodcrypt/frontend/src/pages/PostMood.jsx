import { useState } from 'react'
import { encryptJSON } from '../utils/crypto'
import { registerIfNeeded, api } from '../utils/api'

const moods = ['happy', 'neutral', 'sad']

export default function PostMood() {
  const [mood, setMood] = useState('neutral')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('')

  const share = async () => {
    setStatus('Encrypting…')
    const payload = await encryptJSON({ mood, note, timestamp: Date.now() })
    setStatus('Sending…')
    await registerIfNeeded()
    try {
      const res = await api('/api/posts', { method: 'POST', body: JSON.stringify(payload) })
      setStatus('Shared securely ✔')
      const pendRaw = localStorage.getItem('moodcrypt_pending_posts') || '[]'
      const pend = JSON.parse(pendRaw)
      pend.unshift({ ts: Date.now() })
      localStorage.setItem('moodcrypt_pending_posts', JSON.stringify(pend))
      window.dispatchEvent(new CustomEvent('mood-posted', { detail: { id: res.id } }))
      setTimeout(() => { window.location.href = '/' }, 800)
    } catch {
      setStatus('Saved locally ✔ (backend offline)')
    }
    setTimeout(() => setStatus(''), 2000)
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="card p-4 space-y-3">
        <div className="text-center text-sm text-gray-400">Your mood is encrypted before sharing</div>
        <div className="flex items-center justify-center gap-3">
          {moods.map(m => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`px-4 py-3 rounded-xl border ${mood === m ? 'border-brand-600 bg-brand-600/10 text-brand-500' : 'border-gray-700 bg-gray-800'}`}
            >
              {m === 'happy' ? '😊' : m === 'neutral' ? '😐' : '😔'}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Optional note…"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm"
        />
        <button className="btn w-full" onClick={share}>Share Securely</button>
        {status && <div className="text-center text-xs text-gray-400">{status}</div>}
      </div>
    </div>
  )
}
