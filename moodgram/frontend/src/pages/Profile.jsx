import { useEffect, useState } from 'react'
import Avatar from '../components/Avatar'
import { registerIfNeeded, getMe, updateMe } from '../utils/api'

export default function Profile() {
  const [displayName, setDisplayName] = useState('Anonymous')
  const [avatarId, setAvatarId] = useState('default')
  const [age, setAge] = useState(null)
  const [dob, setDob] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    (async () => {
      await registerIfNeeded()
      try {
        const me = await getMe()
        setDisplayName(me.display_name || 'Anonymous')
        setAvatarId(me.avatar_id || 'default')
        setAge(typeof me.age === 'number' ? me.age : null)
      } catch {}
    })()
  }, [])

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const payload = { display_name: displayName, avatar_id: avatarId }
      if (dob) payload.date_of_birth = dob
      await updateMe(payload)
      const me = await getMe()
      setAge(typeof me.age === 'number' ? me.age : null)
      setSaved(true)
      setTimeout(()=>setSaved(false), 1500)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="glass-card space-y-3">
        <div className="flex items-center gap-3">
          <Avatar size={56} />
          <div>
            <input
              className="bg-transparent text-lg font-semibold outline-none"
              value={displayName}
              onChange={(e)=>setDisplayName(e.target.value)}
              placeholder="Display name"
            />
            <div className="text-xs text-gray-400">
              {age !== null ? `Age: ${age}` : 'Age: —'}
            </div>
          </div>
        </div>
        <div className="glass-panel p-3 space-y-2">
          <div className="text-sm font-medium">Edit Profile</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Avatar ID</div>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                value={avatarId}
                onChange={(e)=>setAvatarId(e.target.value)}
                placeholder="e.g. default"
              />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Preview</div>
              <div className="flex items-center gap-3">
                <Avatar size={40} />
                <div className="text-xs text-gray-400">Avatar preview</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Date of Birth</div>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                value={dob}
                onChange={(e)=>setDob(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">Stored privately; only age is shown</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            {saved && <div className="text-xs text-green-400 mt-2">Saved</div>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-3">
            <div className="text-xs text-gray-400">Days active</div>
            <div className="text-xl font-semibold">7</div>
          </div>
          <div className="glass-panel p-3">
            <div className="text-xs text-gray-400">Moods shared</div>
            <div className="text-xl font-semibold">12</div>
          </div>
          <div className="glass-panel p-3">
            <div className="text-xs text-gray-400">Support sent</div>
            <div className="text-xl font-semibold">20</div>
          </div>
          <div className="glass-panel p-3">
            <div className="text-xs text-gray-400">Badges</div>
            <div className="text-sm">3-Day Streak</div>
          </div>
        </div>
        <div className="text-sm text-gray-300">No followers count • No DMs</div>
      </div>
    </div>
  )
}
