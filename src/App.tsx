/**
 * App — routes and access guards (Section 11, PRD 2.4)
 *
 * Guards:
 * - Logged out: S1, S2, S3, S4, S11 only. All other routes → /
 * - Admin logged in: / → /dashboard; /home → /dashboard + toast "You can't do that."
 * - Member logged in: / → /home; /dashboard, /members, /plans → /home + toast
 *
 * NOTE: <BrowserRouter> lives in main.tsx so tests can inject <MemoryRouter>.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { Welcome }         from './pages/Welcome'
import { SignUp }          from './pages/SignUp'
import { LogIn }           from './pages/LogIn'
import { ForgotPassword }  from './pages/ForgotPassword'
import { PrivacyNotice }   from './pages/PrivacyNotice'
import { Settings }        from './pages/Settings'
import { AdminDashboard }  from './pages/AdminDashboard'
import { Members }         from './pages/Members'
import { Plans }           from './pages/Plans'
import { MemberDashboard } from './pages/MemberDashboard'
import { MemberDetails }   from './pages/MemberDetails'
import { Toast }           from './components/Toast'
import { useSession }      from './hooks/useSession'
import { useToast }        from './hooks/useToast'
import { messages }        from './lib/messages'

/** Admin dashboard + "You can't do that." toast */
function AdminWithNotice() {
  const { toasts, showToast, dismissToast } = useToast()
  if (toasts.length === 0) showToast(messages.notAllowed)
  return (
    <>
      <AdminDashboard />
      {toasts.map(t => (
        <Toast key={t.id} text={t.text} onDismiss={() => dismissToast(t.id)} />
      ))}
    </>
  )
}

/** Member dashboard + "You can't do that." toast */
function MemberWithNotice() {
  const { toasts, showToast, dismissToast } = useToast()
  if (toasts.length === 0) showToast(messages.notAllowed)
  return (
    <>
      <MemberDashboard />
      {toasts.map(t => (
        <Toast key={t.id} text={t.text} onDismiss={() => dismissToast(t.id)} />
      ))}
    </>
  )
}

export default function App() {
  const { session, loading } = useSession()

  if (loading) return null

  const role = (session?.user?.user_metadata as { role?: string } | undefined)?.role as
    | 'admin'
    | 'member'
    | undefined

  const isAdmin  = role === 'admin'
  const isMember = role === 'member'
  const loggedIn = !!session

  return (
    <Routes>
      {/* Welcome — redirect logged-in users to their dashboard */}
      <Route
        path="/"
        element={
          isAdmin  ? <Navigate to="/dashboard" replace /> :
          isMember ? <Navigate to="/home"      replace /> :
          <Welcome />
        }
      />

      {/* Auth screens — logged-in users go to their dashboard */}
      <Route
        path="/sign-up"
        element={
          isAdmin  ? <Navigate to="/dashboard" replace /> :
          isMember ? <Navigate to="/home"      replace /> :
          <SignUp />
        }
      />
      <Route
        path="/log-in"
        element={
          isAdmin  ? <Navigate to="/dashboard" replace /> :
          isMember ? <Navigate to="/home"      replace /> :
          <LogIn />
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAdmin  ? <Navigate to="/dashboard" replace /> :
          isMember ? <Navigate to="/home"      replace /> :
          <ForgotPassword />
        }
      />

      {/* Privacy: open to all */}
      <Route path="/privacy" element={<PrivacyNotice />} />

      {/* Admin-only routes */}
      <Route
        path="/dashboard"
        element={
          !loggedIn ? <Navigate to="/" replace /> :
          isMember  ? <MemberWithNotice />        :
          <AdminDashboard />
        }
      />
      <Route
        path="/members"
        element={
          !loggedIn ? <Navigate to="/" replace /> :
          isMember  ? <MemberWithNotice />        :
          <Members />
        }
      />
      <Route
        path="/members/:id"
        element={
          !loggedIn ? <Navigate to="/" replace /> :
          isMember  ? <MemberWithNotice />        :
          <MemberDetails />
        }
      />
      <Route
        path="/plans"
        element={
          !loggedIn ? <Navigate to="/" replace /> :
          isMember  ? <MemberWithNotice />        :
          <Plans />
        }
      />

      {/* Member-only route */}
      <Route
        path="/home"
        element={
          !loggedIn ? <Navigate to="/" replace /> :
          isAdmin   ? <AdminWithNotice />          :
          <MemberDashboard />
        }
      />

      {/* Both roles */}
      <Route
        path="/settings"
        element={!loggedIn ? <Navigate to="/" replace /> : <Settings />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
