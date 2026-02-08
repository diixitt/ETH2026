import { NavLink } from 'react-router-dom'
import { Home, Users, PlusCircle, LineChart, User, MessagesSquare, HeartHandshake, LogIn, UserPlus } from 'lucide-react'

export default function LeftSidebar() {
  const link = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl ${isActive ? 'bg-white/10 text-white glow' : 'text-gray-300 hover:bg-white/5'}`
  return (
    <aside className="glass-panel grain p-4 sticky top-4 h-[calc(100vh-2rem)] flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-brand-600 glow" />
          <div className="font-semibold">MoodGram</div>
        </div>
        <NavLink to="/" className={link}><Home size={18} /><span>Home</span></NavLink>
        <NavLink to="/following" className={link}><Users size={18} /><span>Following</span></NavLink>
        <NavLink to="/post" className={link}><PlusCircle size={18} /><span>Share Mood</span></NavLink>
        <NavLink to="/trends" className={link}><LineChart size={18} /><span>Trends</span></NavLink>
        <NavLink to="/dms" className={link}><MessagesSquare size={18} /><span>DMs</span></NavLink>
        <NavLink to="/support" className={link}><HeartHandshake size={18} /><span>Support</span></NavLink>
        <NavLink to="/profile" className={link}><User size={18} /><span>Profile</span></NavLink>
        <NavLink to="/login" className={link}><LogIn size={18} /><span>Login</span></NavLink>
        <NavLink to="/create-account" className={link}><UserPlus size={18} /><span>Create Account</span></NavLink>
      </div>
      <div className="text-xs text-gray-400 px-2">Anonymous by design</div>
    </aside>
  )
}
