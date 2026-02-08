import { useEffect, useState } from 'react'
import MoodCard from '../components/MoodCard'
import ReplyBox from '../components/ReplyBox'
import { encryptJSON } from '../utils/crypto'
import { registerIfNeeded, api, follow, unfollow } from '../utils/api'
import { API_URL } from '../config'
import { getToken } from '../utils/api'
import SupportModal from '../components/SupportModal'

export default function HomeFeed({ onlyFollowing = false }) {
  const [posts, setPosts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState(null)

  useEffect(() => {
    (async () => {
      await registerIfNeeded()
      const pendRaw = localStorage.getItem('moodcrypt_pending_posts') || '[]'
      const pend = JSON.parse(pendRaw)
      let pendingPlaceholders = []
      if (Array.isArray(pend) && pend.length) {
        pendingPlaceholders = pend.map(x => ({ id: 'local-'+x.ts, timestamp: x.ts, replies: [], author_tag: 'me', local: true }))
        localStorage.setItem('moodcrypt_pending_posts', JSON.stringify([]))
      }
      try {
        const path = onlyFollowing ? '/api/posts?following=1' : '/api/posts'
        const items = await api(path, { method: 'GET' })
        const list = items.map(i => ({ id: i.id, timestamp: i.timestamp, replies: [], author_tag: i.author_tag }))
        setPosts([...pendingPlaceholders, ...list])
      } catch {
        setPosts([...pendingPlaceholders, { id: 'demo1', timestamp: Date.now(), replies: [] }])
      } finally {
        setLoaded(true)
      }
    })()
    const token = getToken()
    let es
    if (token) {
      es = new EventSource(`${API_URL}/api/stream/posts?token=${encodeURIComponent(token)}`)
      es.onmessage = async () => {
        try {
          const path = onlyFollowing ? '/api/posts?following=1' : '/api/posts'
          const items = await api(path, { method: 'GET' })
          setPosts(items.map(i => ({ id: i.id, timestamp: i.timestamp, replies: [], author_tag: i.author_tag })))
        } catch {}
      }
    }
    return () => {
      es?.close()
    }
  }, [onlyFollowing])

  const sendSupport = async (postId, msg) => {
    const payload = await encryptJSON({ message: msg })
    try {
      await api('/api/replies', { method: 'POST', body: JSON.stringify({ post_id: postId, ...payload }) })
      setPosts(p => p.map(x => x.id === postId ? { ...x, replies: [...(x.replies || []), '(encrypted reply)'] } : x))
    } catch {
      // ignore for demo
    }
  }

  return (
    <div className="space-y-4">
      {!loaded && <div className="text-center text-sm text-gray-400">Loading encrypted feed…</div>}
      {posts.length === 0 && loaded && (
        <div className="glass-card text-sm text-gray-400">No posts yet. Share your first mood!</div>
      )}
      {posts.map(p => (
        <div key={p.id} className="space-y-3">
          <MoodCard mood={'neutral'} text={''} timestamp={p.timestamp} pseudonym={'Anon-'+String(p.id).slice(-4)} onSupport={() => setActive(p)} replies={p.replies} />
          <div className="flex gap-2">
            <button className="btn" onClick={() => follow(p.author_tag)}>Follow</button>
            <button className="btn bg-gray-700 hover:bg-gray-600" onClick={() => unfollow(p.author_tag)}>Unfollow</button>
            <button className="btn bg-brand-700 hover:bg-brand-600" onClick={async () => {
              try {
                const t = await api('/api/dm/thread', { method: 'POST', body: JSON.stringify({ to_tag: p.author_tag }) })
                window.location.href = '/dms'
              } catch {}
            }}>Message</button>
          </div>
          <ReplyBox onSend={(msg) => sendSupport(p.id, msg)} />
        </div>
      ))}
      <SupportModal open={!!active} onClose={() => setActive(null)} post={active} />
    </div>
  )
}
