import { API_URL } from '../config'

const TOKEN_KEY = 'moodcrypt_jwt'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export async function registerIfNeeded() {
  let token = getToken()
  if (token) return token
  const username = `anon_${Math.random().toString(36).slice(2, 8)}`
  const password = Math.random().toString(36).slice(2, 12)
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, avatar_id: 'default' })
    })
    const data = await res.json()
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token)
      return data.token
    }
  } catch {}
  return ''
}

export async function api(path, init = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(init.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

export async function follow(tag) {
  return api('/api/follow', { method: 'POST', body: JSON.stringify({ tag }) })
}
export async function unfollow(tag) {
  return api('/api/follow', { method: 'DELETE', body: JSON.stringify({ tag }) })
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await res.json()
  if (!res.ok || !data.token) throw new Error('Invalid credentials')
  setToken(data.token)
  return data
}

export async function registerAccount(username, password, avatar_id = 'default') {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, avatar_id })
  })
  const data = await res.json()
  if (!res.ok || !data.token) throw new Error('Register failed')
  setToken(data.token)
  return data
}

export async function getMe() {
  return api('/api/me', { method: 'GET' })
}
export async function updateMe(payload) {
  return api('/api/me', { method: 'PUT', body: JSON.stringify(payload) })
}
