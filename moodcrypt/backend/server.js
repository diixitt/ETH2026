import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev', { skip: () => true })) // never log bodies/plaintext

const PORT = process.env.PORT || 8080
const JWT_SECRET = process.env.JWT_SECRET
const ENC_KEY_HEX = process.env.ENC_KEY_HEX // 32-byte hex
const HMAC_SECRET = process.env.HMAC_SECRET
const ENC_KEY = Buffer.from(ENC_KEY_HEX || '', 'hex')

if (!JWT_SECRET || !HMAC_SECRET) {
  console.error('Missing env JWT_SECRET or HMAC_SECRET')
}

// Mongo
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Mongo connected')
  }).catch(err => {
    console.error('Mongo connection error', err.message)
  })
}

// Models
const UserSchema = new mongoose.Schema({
  username_hash: { type: String, unique: true },
  password_hash: String,
  avatar_id: String,
  display_name: String,
  date_of_birth: Date,
  badges: [{ type: String }],
  following: [{ type: String }]
}, { timestamps: true })

const PostSchema = new mongoose.Schema({
  encrypted_mood: {
    iv: String,
    ct: String
  },
  author_commitment: String,
  author_tag: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true })

const ReplySchema = new mongoose.Schema({
  post_id: { type: mongoose.Types.ObjectId, ref: 'Post' },
  encrypted_message: {
    iv: String,
    ct: String
  },
  author_commitment: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)
const Post = mongoose.model('Post', PostSchema)
const Reply = mongoose.model('Reply', ReplySchema)

const DmThreadSchema = new mongoose.Schema({
  participant_tags: [{ type: String }],
  last_message_at: { type: Date, default: Date.now }
}, { timestamps: true })
const DmMessageSchema = new mongoose.Schema({
  thread_id: { type: mongoose.Types.ObjectId, ref: 'DmThread' },
  from_tag: String,
  to_tag: String,
  encrypted_message: { iv: String, ct: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true })
const SupportRequestSchema = new mongoose.Schema({
  requester_tag: String,
  encrypted_message: { iv: String, ct: String },
  created_at: { type: Date, default: Date.now },
  status: { type: String, default: 'received' }
}, { timestamps: true })
const DmThread = mongoose.model('DmThread', DmThreadSchema)
const DmMessage = mongoose.model('DmMessage', DmMessageSchema)
const SupportRequest = mongoose.model('SupportRequest', SupportRequestSchema)

// SSE clients
const sseClients = new Set()
function verifyTokenQuery(token) {
  try {
    return jwt.verify(token || '', JWT_SECRET)
  } catch {
    return null
  }
}
function broadcastPost(p) {
  const payload = JSON.stringify({ id: String(p._id), timestamp: p.timestamp, author_tag: p.author_tag })
  for (const res of sseClients) {
    try {
      res.write(`data: ${payload}\n\n`)
    } catch {}
  }
}

// Helpers
function hashUsername(u) {
  return crypto.createHash('sha256').update(u).digest('hex')
}
function hmacCommitment(usernameHash) {
  const nonce = crypto.randomBytes(16).toString('hex')
  const tag = crypto.createHmac('sha256', HMAC_SECRET).update(usernameHash + nonce).digest('hex')
  return `${tag}:${nonce}`
}
function authorTag(usernameHash) {
  return crypto.createHmac('sha256', HMAC_SECRET).update(usernameHash).digest('hex')
}
function verifyToken(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, avatar_id } = req.body
    const username_hash = hashUsername(username)
    const salt = bcrypt.genSaltSync(10)
    const password_hash = bcrypt.hashSync(password, salt)
    const user = await User.create({ username_hash, password_hash, avatar_id, badges: [] })
    const token = jwt.sign({ uid: user._id, uh: username_hash }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  } catch (e) {
    res.status(400).json({ error: 'Register failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  const username_hash = hashUsername(username)
  const user = await User.findOne({ username_hash })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = bcrypt.compareSync(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ uid: user._id, uh: username_hash }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, avatar_id: user.avatar_id, badges: user.badges })
})

// Profile
app.get('/api/me', verifyToken, async (req, res) => {
  const me = await User.findById(req.user.uid).select('avatar_id display_name badges date_of_birth')
  if (!me) return res.status(404).json({ error: 'Not found' })
  let age = null
  if (me.date_of_birth instanceof Date && !isNaN(me.date_of_birth.getTime())) {
    const today = new Date()
    age = today.getFullYear() - me.date_of_birth.getFullYear()
    const m = today.getMonth() - me.date_of_birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < me.date_of_birth.getDate())) age--
    if (age < 0) age = null
  }
  res.json({
    avatar_id: me.avatar_id || 'default',
    display_name: me.display_name || 'Anonymous',
    badges: me.badges || [],
    age
  })
})
app.put('/api/me', verifyToken, async (req, res) => {
  const { avatar_id, display_name, date_of_birth } = req.body
  const update = {}
  if (typeof avatar_id === 'string') update.avatar_id = avatar_id
  if (typeof display_name === 'string') update.display_name = display_name.slice(0, 32)
  if (typeof date_of_birth === 'string') {
    const d = new Date(date_of_birth)
    if (!isNaN(d.getTime())) update.date_of_birth = d
  }
  await User.updateOne({ _id: req.user.uid }, { $set: update })
  res.json({ ok: true })
})

// Rate limit replies
const replyLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
})

// Posts
app.post('/api/posts', verifyToken, async (req, res) => {
  try {
    const { iv, ct } = req.body
    const commitment = hmacCommitment(req.user.uh)
    const tag = authorTag(req.user.uh)
    const post = await Post.create({ encrypted_mood: { iv, ct }, author_commitment: commitment, author_tag: tag })
    broadcastPost(post)
    res.json({ id: post._id })
  } catch {
    res.status(400).json({ error: 'Failed to create post' })
  }
})

app.get('/api/posts', verifyToken, async (req, res) => {
  const q = {}
  if (req.query.following === '1') {
    const me = await User.findById(req.user.uid).select('following')
    if (me && me.following && me.following.length) q.author_tag = { $in: me.following }
    else return res.json([])
  }
  const items = await Post.find(q).sort({ createdAt: -1 }).limit(50)
  res.json(items.map(p => ({
    id: p._id,
    encrypted_mood: p.encrypted_mood,
    timestamp: p.timestamp,
    author_tag: p.author_tag
  })))
})

// Replies
app.post('/api/replies', verifyToken, replyLimiter, async (req, res) => {
  try {
    const { post_id, iv, ct } = req.body
    const commitment = hmacCommitment(req.user.uh)
    const r = await Reply.create({ post_id, encrypted_message: { iv, ct }, author_commitment: commitment })
    res.json({ id: r._id })
  } catch {
    res.status(400).json({ error: 'Failed to reply' })
  }
})

app.post('/api/follow', verifyToken, async (req, res) => {
  const { tag } = req.body
  if (!tag) return res.status(400).json({ error: 'Missing tag' })
  await User.updateOne({ _id: req.user.uid }, { $addToSet: { following: tag } })
  res.json({ ok: true })
})
app.delete('/api/follow', verifyToken, async (req, res) => {
  const { tag } = req.body
  if (!tag) return res.status(400).json({ error: 'Missing tag' })
  await User.updateOne({ _id: req.user.uid }, { $pull: { following: tag } })
  res.json({ ok: true })
})

app.get('/api/replies/:postId', verifyToken, async (req, res) => {
  const list = await Reply.find({ post_id: req.params.postId }).sort({ createdAt: 1 })
  res.json(list.map(r => ({ id: r._id, encrypted_message: r.encrypted_message })))
})

// SSE: posts stream
app.get('/api/stream/posts', async (req, res) => {
  const token = req.query.token
  const payload = verifyTokenQuery(token)
  if (!payload) return res.status(401).end()
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()
  res.write('retry: 10000\n\n')
  sseClients.add(res)
  req.on('close', () => {
    sseClients.delete(res)
  })
})

// DMs
app.post('/api/dm/thread', verifyToken, async (req, res) => {
  const meTag = authorTag(req.user.uh)
  const { to_tag } = req.body
  if (!to_tag) return res.status(400).json({ error: 'Missing to_tag' })
  let thread = await DmThread.findOne({ participant_tags: { $all: [meTag, to_tag] } })
  if (!thread) thread = await DmThread.create({ participant_tags: [meTag, to_tag] })
  res.json({ id: thread._id })
})
app.get('/api/dm/threads', verifyToken, async (req, res) => {
  const meTag = authorTag(req.user.uh)
  const threads = await DmThread.find({ participant_tags: meTag }).sort({ updatedAt: -1 }).limit(50)
  res.json(threads.map(t => ({ id: t._id, participant_tags: t.participant_tags, last_message_at: t.last_message_at })))
})
app.post('/api/dm/message', verifyToken, async (req, res) => {
  const meTag = authorTag(req.user.uh)
  const { thread_id, to_tag, iv, ct } = req.body
  if (!thread_id || !to_tag || !iv || !ct) return res.status(400).json({ error: 'Missing fields' })
  const msg = await DmMessage.create({ thread_id, from_tag: meTag, to_tag, encrypted_message: { iv, ct } })
  await DmThread.updateOne({ _id: thread_id }, { $set: { last_message_at: msg.timestamp } })
  res.json({ id: msg._id })
})
app.get('/api/dm/messages/:threadId', verifyToken, async (req, res) => {
  const list = await DmMessage.find({ thread_id: req.params.threadId }).sort({ createdAt: 1 })
  res.json(list.map(m => ({ id: m._id, from_tag: m.from_tag, to_tag: m.to_tag, encrypted_message: m.encrypted_message, timestamp: m.timestamp })))
})

// Support requests to therapists
app.post('/api/support', verifyToken, async (req, res) => {
  const meTag = authorTag(req.user.uh)
  const { iv, ct } = req.body
  if (!iv || !ct) return res.status(400).json({ error: 'Missing encrypted message' })
  const s = await SupportRequest.create({ requester_tag: meTag, encrypted_message: { iv, ct } })
  res.json({ id: s._id, status: s.status })
})

// Trends: decrypt ONLY for aggregation
app.get('/api/trends/weekly', verifyToken, async (_req, res) => {
  if (!ENC_KEY || ENC_KEY.length !== 32) return res.status(500).json({ error: 'Encryption key not set' })
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)
  const posts = await Post.find({ timestamp: { $gte: sevenDaysAgo } }).select('encrypted_mood')
  const counts = { happy: 0, neutral: 0, sad: 0 }
  for (const p of posts) {
    try {
      const iv = Buffer.from(p.encrypted_mood.iv, 'base64')
      const ct = Buffer.from(p.encrypted_mood.ct, 'base64')
      const decipher = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, iv)
      const plaintext = Buffer.concat([decipher.update(ct), decipher.final()])
      const obj = JSON.parse(plaintext.toString())
      // aggregate only
      if (obj.mood && counts[obj.mood] !== undefined) counts[obj.mood]++
    } catch {
      // skip invalid items
    }
  }
  res.json({ counts })
})

// ZKP mock verification
app.post('/api/zkp/verify-streak', verifyToken, async (req, res) => {
  try {
    const { proof, publicSignals } = req.body
    // Mock check: publicSignals[0] === 1 means valid streak >= 3
    const ok = publicSignals && Number(publicSignals[0]) === 1
    if (!ok) return res.status(400).json({ ok: false })
    await User.updateOne({ _id: req.user.uid }, { $addToSet: { badges: '3-Day Streak' } })
    res.json({ ok: true, badge: '3-Day Streak' })
  } catch {
    res.status(400).json({ ok: false })
  }
})

app.listen(PORT, () => {
  console.log(`MoodGram backend on http://localhost:${PORT}`)
})
