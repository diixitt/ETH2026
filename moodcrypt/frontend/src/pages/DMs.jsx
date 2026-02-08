import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { encryptJSON, decryptJSON } from '../utils/crypto'
import Avatar from '../components/Avatar'

export default function DMs() {
  const [threads, setThreads] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const list = await api('/api/dm/threads', { method: 'GET' })
        if (Array.isArray(list) && list.length) {
          setThreads(list)
        } else {
          const demoList = [
            { id: 'demo_aurora', participant_tags: ['me', '@aurora'], last_message_at: Date.now() - 3600_000 },
            { id: 'demo_nebula', participant_tags: ['me', '@nebula'], last_message_at: Date.now() - 7200_000 },
            { id: 'demo_delta', participant_tags: ['me', '@delta'], last_message_at: Date.now() - 1800_000 }
          ]
          setThreads(demoList)
          setDemo(true)
        }
      } catch {
        const demoList = [
          { id: 'demo_aurora', participant_tags: ['me', '@aurora'], last_message_at: Date.now() - 3600_000 },
          { id: 'demo_nebula', participant_tags: ['me', '@nebula'], last_message_at: Date.now() - 7200_000 },
          { id: 'demo_delta', participant_tags: ['me', '@delta'], last_message_at: Date.now() - 1800_000 }
        ]
        setThreads(demoList)
        setDemo(true)
      }
    })()
  }, [])

  const openThread = async (t) => {
    setActive(t)
    if (demo || String(t.id).startsWith('demo_')) {
      const seed = [
        { from: '@aurora', text: 'hey! how are you feeling today?' },
        { from: 'me', text: 'better now, thanks for checking in 😊' },
        { from: '@aurora', text: 'glad to hear! want to share more?' }
      ]
      const arr = []
      for (const s of seed) {
        const payload = await encryptJSON({ text: s.text })
        arr.push({ id: Math.random().toString(36).slice(2), from_tag: s.from, to_tag: s.from === 'me' ? t.participant_tags.find(x=>x!=='me') : 'me', encrypted_message: payload, timestamp: Date.now() })
      }
      setMessages(arr)
      return
    }
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
    <div className="grid grid-cols-[300px,1fr] gap-6">
      <aside className="glass-panel p-0">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="font-semibold">Messages</div>
          <div className="text-xs text-gray-400">{demo ? 'Demo' : 'Secure'}</div>
        </div>
        <div className="p-3">
          <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" placeholder="Search" />
        </div>
        <div className="space-y-1 p-2">
          {threads.map(t => {
            const other = t.participant_tags.find(x=>x!=='me') || t.participant_tags[0]
            return (
              <button key={t.id} className={`w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 ${active?.id===t.id?'bg-white/10':''}`} onClick={() => openThread(t)}>
                <div className="flex items-center gap-3">
                  <Avatar size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{other}</div>
                    <div className="text-xs text-gray-500 truncate">{new Date(t.last_message_at).toLocaleString()}</div>
                  </div>
                </div>
              </button>
            )
          })}
          {threads.length===0 && <div className="text-sm text-gray-400 px-3 py-2">No threads yet</div>}
        </div>
      </aside>
      <section className="glass-panel p-0">
        {!active && <div className="p-6 text-sm text-gray-400">Select a thread to start chatting</div>}
        {active && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Avatar size={32} />
              <div className="flex-1">
                <div className="text-sm font-medium">{active.participant_tags.find(x=>x!=='me') || active.participant_tags[0]}</div>
                <div className="text-xs text-gray-500">Active now</div>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {messages.map(m => (
                <ChatBubble key={m.id} item={m} />
              ))}
            </div>
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm" placeholder="Message…" value={input} onChange={(e)=>setInput(e.target.value)} />
                <button className="btn rounded-full px-4" onClick={send}>Send</button>
              </div>
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

function ChatBubble({ item }) {
  const mine = item.from_tag === 'me'
  return (
    <div className={`max-w-[65%] ${mine ? 'ml-auto' : ''}`}>
      <div className={`${mine ? 'bg-brand-600 text-white' : 'bg-white/10 text-gray-200'} rounded-2xl px-4 py-2`}>
        <MessageBubble item={item} />
      </div>
      <div className={`text-[10px] mt-1 ${mine ? 'text-gray-400 text-right' : 'text-gray-500'}`}>{new Date(item.timestamp).toLocaleTimeString()}</div>
    </div>
  )
}
