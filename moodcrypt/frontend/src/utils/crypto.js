// Privacy-first AES-GCM helpers (Web Crypto API)
// - Uses a shared AES key from env for server-aggregated data when available
// - Falls back to a per-device key stored locally for maximum privacy

const KEY_STORAGE = 'moodcrypt_device_key_v1'
const SHARED_KEY_HEX = import.meta.env.VITE_ENC_KEY_HEX

async function getOrCreateKey() {
  let raw = localStorage.getItem(KEY_STORAGE)
  if (!raw) {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
    const exported = await crypto.subtle.exportKey('raw', key)
    raw = btoa(String.fromCharCode(...new Uint8Array(exported)))
    localStorage.setItem(KEY_STORAGE, raw)
    return key
  }
  const buf = Uint8Array.from(atob(raw), c => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', buf, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
}

function hexToBytes(hex) {
  if (!hex || hex.length % 2 !== 0) return null
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return arr
}

async function getSharedKey() {
  if (!SHARED_KEY_HEX) return null
  const bytes = hexToBytes(SHARED_KEY_HEX)
  if (!bytes || bytes.length !== 32) return null
  return crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

export async function encryptJSON(obj) {
  const shared = await getSharedKey()
  const key = shared || await getOrCreateKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(obj))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  return {
    iv: btoa(String.fromCharCode(...iv)),
    ct: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
  }
}

export async function decryptJSON({ iv, ct }) {
  const shared = await getSharedKey()
  const key = shared || await getOrCreateKey()
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
  const ctBytes = Uint8Array.from(atob(ct), c => c.charCodeAt(0))
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, key, ctBytes)
  return JSON.parse(new TextDecoder().decode(plaintext))
}
