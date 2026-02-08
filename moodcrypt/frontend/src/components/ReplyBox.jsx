import { useState } from 'react'

export default function ReplyBox({ onSend }) {
  const [msg, setMsg] = useState('')
  return (
    <div className="flex gap-2 items-center">
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Send supportive reply…"
        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm"
      />
      <button className="btn" onClick={() => { onSend?.(msg); setMsg('') }}>Send</button>
    </div>
  )
}
