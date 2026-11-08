import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Welcome } from './pages/Welcome'
import { AdminDashboard } from './pages/AdminDashboard'
import { Members } from './pages/Members'
import { MemberDetails } from './pages/MemberDetails'
import { Plans } from './pages/Plans'
import { MemberDashboard } from './pages/MemberDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<MemberDetails />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/home" element={<MemberDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

