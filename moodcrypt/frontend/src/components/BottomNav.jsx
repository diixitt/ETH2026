import { NavLink } from 'react-router-dom'
import { Home, PlusCircle, LineChart, Shield, User, Palette } from 'lucide-react'

export default function BottomNav() {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center text-xs ${isActive ? 'text-brand-500' : 'text-gray-400'}`
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur border-t border-gray-800">
      <div className="max-w-md mx-auto px-6 py-2 grid grid-cols-6 gap-4">
        <NavLink to="/" className={linkClass}><Home size={22} /><span>Home</span></NavLink>
        <NavLink to="/post" className={linkClass}><PlusCircle size={22} /><span>Post</span></NavLink>
        <NavLink to="/trends" className={linkClass}><LineChart size={22} /><span>Trends</span></NavLink>
        <NavLink to="/privacy" className={linkClass}><Shield size={22} /><span>Privacy</span></NavLink>
        <NavLink to="/design" className={linkClass}><Palette size={22} /><span>Design</span></NavLink>
        <NavLink to="/profile" className={linkClass}><User size={22} /><span>Profile</span></NavLink>
      </div>
    </nav>
  )
}
