import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { encryptJSON, decryptJSON } from '../utils/crypto'
import Avatar from '../components/Avatar'

export default function DMs() {
  const [threads, setThreads] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const list = await api('/api/dm/threads', { method: 'GET' })
        setThreads(list)
      } catch {}
    })()
  }, [])

  const openThread = async (t) => {
    setActive(t)
    try {
      const list = await api(`/api/dm/messages/${t.id}`, { method: 'GET' })
      setMessages(list)
    } catch {}
  }

  const send = async () => {
    if (!active || !input) return
    const to = active.participant_tags.find(x => x !== 'me') || active.participant_tags[0]
    const payload = await encryptJSON({ text: input })
    try {
      await api('/api/dm/message', { method: 'POST', body: JSON.stringify({ thread_id: active.id, to_tag: to, ...payload }) })
      setMessages(m => [...m, { id: Math.random().toString(36).slice(2), from_tag: 'me', to_tag: to, encrypted_message: payload, timestamp: Date.now() }])
      setInput('')
    } catch {}
  }

  return (
    <div className="grid grid-cols-[280px,1fr] gap-6">
      <aside className="glass-panel p-4 space-y-3">
        <div className="font-semibold">Direct Messages</div>
        <div className="space-y-2">
          {threads.map(t => (
            <button key={t.id} className={`glass-card w-full text-left ${active?.id===t.id?'glow':''}`} onClick={() => openThread(t)}>
              <div className="flex items-center gap-3">
                <Avatar size={28} />
                <div className="text-sm text-gray-300">Thread</div>
                <div className="ml-auto text-xs text-gray-500">{new Date(t.last_message_at).toLocaleDateString()}</div>
              </div>
            </button>
          ))}
          {threads.length===0 && <div className="text-sm text-gray-400">No threads yet</div>}
        </div>
      </aside>
      <section className="glass-panel p-4">
        {!active && <div className="text-sm text-gray-400">Select a thread to start chatting</div>}
        {active && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`max-w-[60%] ${m.from_tag==='me'?'ml-auto':''}`}>
                  <div className="glass-card p-3">
                    <MessageBubble item={m} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" placeholder="Type an encrypted message…" value={input} onChange={(e)=>setInput(e.target.value)} />
              <button className="btn" onClick={send}>Send</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function MessageBubble({ item }) {
  const [text, setText] = useState('')
  useEffect(() => {
    (async () => {
      try {
        const obj = await decryptJSON(item.encrypted_message)
        setText(obj.text || '')
      } catch {
        setText('(encrypted)')
      }
    })()
  }, [item])
  return <div className="text-sm text-gray-200">{text}</div>
}
