import { Routes, Route } from 'react-router-dom'
import HomeFeed from './pages/HomeFeed'
import PostMood from './pages/PostMood'
import Trends from './pages/Trends'
import Privacy from './pages/Privacy'
import Profile from './pages/Profile'
import Design from './pages/Design'
import LeftSidebar from './components/LeftSidebar'
import RightActivity from './components/RightActivity'
import DMs from './pages/DMs'
import Support from './pages/Support'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 py-6 grid grid-cols-[260px,1fr,320px] gap-6">
        <LeftSidebar />
        <div className="space-y-6">
          <Routes>
            <Route path="/" element={<HomeFeed />} />
            <Route path="/following" element={<HomeFeed onlyFollowing />} />
            <Route path="/post" element={<PostMood />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/dms" element={<DMs />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/design" element={<Design />} />
          </Routes>
        </div>
        <RightActivity />
      </div>
    </div>
  )
}
