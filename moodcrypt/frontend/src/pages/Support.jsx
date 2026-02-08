import { useState } from 'react'
import { encryptJSON } from '../utils/crypto'
import { api } from '../utils/api'

export default function Support() {
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const send = async () => {
    const payload = await encryptJSON({ request: msg })
    try {
      await api('/api/support', { method: 'POST', body: JSON.stringify(payload) })
      setOk(true)
      setMsg('')
    } catch {}
  }
  const resources = [
    { name: 'Crisis Text Line', url: 'https://www.crisistextline.org/' },
    { name: 'BetterHelp', url: 'https://www.betterhelp.com/' },
    { name: 'Talkspace', url: 'https://www.talkspace.com/' }
  ]
  return (
    <div className="space-y-6">
      <div className="glass-card">
        <div className="font-semibold mb-2">Reach a Professional Therapist</div>
        <div className="text-sm text-gray-300">Your request is encrypted before storage. If you're in immediate danger, contact your local emergency services.</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {resources.map(r => (
          <a key={r.name} className="glass-card p-4 hover:glow" href={r.url} target="_blank" rel="noreferrer">
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-gray-400">External resource</div>
          </a>
        ))}
      </div>
      <div className="glass-panel p-4">
        <div className="font-medium mb-2">Send an encrypted request</div>
        <div className="flex gap-2">
          <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" placeholder="Briefly describe what you need…" value={msg} onChange={(e)=>setMsg(e.target.value)} />
          <button className="btn" onClick={send}>Request</button>
        </div>
        {ok && <div className="text-xs text-green-400 mt-2">Request received securely</div>}
      </div>
    </div>
  )
}
