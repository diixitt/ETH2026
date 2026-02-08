# MoodGram

Anonymous, privacy-first mood sharing app with client-side encryption and a streak Zero-Knowledge Proof.

## Project Structure
- frontend: Vite + React + Tailwind mobile UI
- backend: Node + Express + MongoDB + JWT auth
- zkp: Circom circuit for 3-day streak proof

## Prerequisites
- Node.js 18+ and npm
- MongoDB running locally (default: mongodb://127.0.0.1:27017)

## Environment Variables
Create these files:

frontend/.env
```
VITE_API_URL=http://localhost:8080
VITE_ENC_KEY_HEX=64_hex_bytes_shared_with_backend
VITE_FIGMA_EMBED_URL=https://www.figma.com/embed?embed_host=share&url=YOUR_FIGMA_FILE_URL
```

backend/.env
```
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/moodgram
JWT_SECRET=replace_with_strong_random
ENC_KEY_HEX=64_hex_bytes_shared_with_frontend
HMAC_SECRET=replace_with_strong_random
```

The ENC_KEY_HEX is a 32-byte hex (64 hex chars) AES-GCM key used to encrypt moods and replies. For demo purposes, the same key is shared between frontend and backend to allow the backend to decrypt ONLY for aggregated trends. No plaintext is stored.

## Install & Run
Frontend:
```
cd moodgram/frontend
npm install
npm run dev
```

Backend:
```
cd moodgram/backend
npm install
npm run dev
```

## Authentication
- Anonymous auth with username + password + avatar
- Stores username_hash (SHA-256) and password_hash (argon2id)
- Issues JWT-based sessions; never stores emails or phone numbers

## Encryption
- Web Crypto AES-GCM is used client-side to encrypt moods and replies
- Backend stores ciphertext only and never logs plaintext
- Trends endpoint decrypts posts in-memory strictly to compute aggregates

## Data Models
- User: { username_hash, password_hash, avatar_id, badges[] }
- Post: { encrypted_mood: { iv, ct }, author_commitment, timestamp }
- Reply: { post_id, encrypted_message: { iv, ct }, author_commitment, timestamp }

author_commitment is an HMAC-based commitment over the hashed username plus a nonce. It does not reveal identity or IDs.

## Zero-Knowledge Proofs
zkp/mood_streak.circom proves a user posted on at least 3 days in a 7-day window without revealing which days or moods.
- Backend exposes /api/zkp/verify-streak and accepts a mock proof: publicSignals[0] === 1 means valid
- On success, backend issues a "3-Day Streak" badge to the user

## Features
- Anonymous mood posting
- Anonymous replies (basic rate limiting)
- Aggregated mood trends only
- Privacy indicators: locks/shields throughout the UI
- Dark-mode, mobile-first aesthetic

## Notes
- The backend never stores plaintext. Aggregation requires decryption in-memory with ENC_KEY_HEX; plaintext is discarded immediately after counting.
- Replace all secrets in .env with strong random values before running.
