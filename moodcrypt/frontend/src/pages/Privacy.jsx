import { ShieldCheck, Lock } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="space-y-4 mt-4">
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2"><Lock size={18} className="text-brand-500" /><span>Encryption: Active</span></div>
        <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-brand-500" /><span>Zero-Knowledge Proofs: Verified</span></div>
        <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-brand-500" /><span>Streak badge</span></div>
        <p className="text-sm text-gray-400">We never store plaintext moods or messages.</p>
      </div>
    </div>
  )
}
