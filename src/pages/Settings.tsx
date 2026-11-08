/**
 * S10 Settings — Phase 3 shell
 * Account block (name + email, read-only), Privacy Notice → S11,
 * Logout → S1 (no confirm), Delete account → M4.
 * Grace period and reminders added in later phases.
 * PRD T-S10-1
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { OfflineBanner } from '../components/OfflineBanner'
import { DeleteAccount } from '../modals/DeleteAccount'
import { logOut } from '../lib/api/auth'
import { useSession } from '../hooks/useSession'
import { useOnline } from '../hooks/useOnline'

export function Settings() {
  const navigate = useNavigate()
  const { session } = useSession()
  const isOnline   = useOnline()

  const user     = session?.user
  const fullName = (user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? ''
  const email    = user?.email ?? ''
  const role     = ((user?.user_metadata as { role?: string } | undefined)?.role ?? 'admin') as 'admin' | 'member'

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [logoutLoading, setLogoutLoading]     = useState(false)

  async function handleLogout() {
    setLogoutLoading(true)
    await logOut()
    setLogoutLoading(false)
    navigate('/')
  }

  function handleDeleted() {
    setShowDeleteModal(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Header title="Settings" />
      <OfflineBanner />

      <main className="flex-1 px-4 py-6 max-w-[480px] w-full mx-auto space-y-6">
        {/* Account block */}
        <section className="bg-white rounded-xl shadow-sm p-4 space-y-1">
          <p className="text-[16px] font-semibold text-[#111827]">{fullName}</p>
          <p className="text-[16px] text-[#4B5563]">{email}</p>
        </section>

        {/* Rows */}
        <section className="bg-white rounded-xl shadow-sm divide-y divide-[#CBD5E1]">
          {/* Privacy Notice */}
          <Link
            to="/privacy"
            className="flex items-center justify-between px-4 py-4 text-[16px] text-[#111827]"
          >
            Privacy Notice
            <ChevronRight size={20} className="text-[#4B5563]" />
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex w-full items-center justify-between px-4 py-4 text-[16px] text-[#111827]"
          >
            Logout
            <ChevronRight size={20} className="text-[#4B5563]" />
          </button>

          {/* Delete account */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex w-full items-center justify-between px-4 py-4 text-[16px] text-[#C62828]"
          >
            Delete account
            <ChevronRight size={20} className="text-[#C62828]" />
          </button>
        </section>
      </main>

      <TabBar role={role} />

      {/* M4 */}
      <DeleteAccount
        role={role}
        isOpen={showDeleteModal}
        isOffline={!isOnline}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
