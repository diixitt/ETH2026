import { useState } from 'react'
import { registerAccount } from '../utils/api'

export default function CreateAccount() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerAccount(username, password)
      window.location.href = '/'
    } catch {
      setError('Could not create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12 glass-panel p-6 space-y-4">
      <div className="text-center font-semibold text-lg">Create Account</div>
      <form className="space-y-3" onSubmit={submit}>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        <button className="btn w-full" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create Account'}
        </button>
        {error && <div className="text-center text-xs text-red-400">{error}</div>}
      </form>
      <div className="text-center text-xs text-gray-400">
        You can also post anonymously; we’ll auto-create an account if needed.
      </div>
    </div>
  )
}
