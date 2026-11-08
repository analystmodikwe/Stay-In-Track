/**
 * S10 Settings — Phase 3 & 4
 * Account block (name + email, read-only), Grace period (Admin only),
 * Privacy Notice → S11, Logout → S1 (no confirm), Delete account → M4.
 * Reminders added in Phase 8.
 * PRD T-S10-1, T-S10-2, T-US10-1, T-US10-2
 */
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { OfflineBanner } from '../components/OfflineBanner'
import { TextField } from '../components/TextField'
import { Button } from '../components/Button'
import { Toggle } from '../components/Toggle'
import { Toast } from '../components/Toast'
import { DeleteAccount } from '../modals/DeleteAccount'
import { logOut } from '../lib/api/auth'
import { getGym, updateGracePeriod } from '../lib/api/gym'
import { getOwnMembership, setReminders } from '../lib/api/member'
import { validateGraceDays } from '../lib/rules/grace'
import { messages } from '../lib/messages'
import { useSession } from '../hooks/useSession'
import { useOnline } from '../hooks/useOnline'

export function Settings() {
  const navigate = useNavigate()
  const { session } = useSession()
  const isOnline = useOnline()

  const user = session?.user
  const fullName = (user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? ''
  const email = user?.email ?? ''
  const role = ((user?.user_metadata as { role?: string } | undefined)?.role ?? 'admin') as
    | 'admin'
    | 'member'

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  // Grace period state
  const [graceDays, setGraceDays] = useState<string>('')
  const [graceError, setGraceError] = useState<string | null>(null)
  const [savingGrace, setSavingGrace] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Reminders state (Member only)
  const [remindersOn, setRemindersOn] = useState(true)

  useEffect(() => {
    if (role === 'admin') {
      getGym()
        ?.then((res) => {
          if (res?.data) {
            setGraceDays(res.data.grace_days.toString())
          }
        })
        .catch(() => {})
    } else if (role === 'member') {
      getOwnMembership()
        ?.then((res) => {
          if (res?.data) {
            setRemindersOn(res.data.reminders_on)
          }
        })
        .catch(() => {})
    }
  }, [role])

  async function handleToggleReminders(e: React.ChangeEvent<HTMLInputElement>) {
    const on = e.target.checked
    setRemindersOn(on)
    const res = await setReminders(on)
    if (res.error) {
      setRemindersOn(!on)
      setToastMessage(res.error)
    } else {
      setToastMessage(on ? messages.remindersOn : messages.remindersOff)
    }
  }

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

  async function handleSaveGrace(e: React.FormEvent) {
    e.preventDefault()
    const err = validateGraceDays(graceDays)
    if (err) {
      setGraceError(err)
      return
    }

    setGraceError(null)
    setSavingGrace(true)
    const res = await updateGracePeriod(parseInt(graceDays, 10))
    setSavingGrace(false)

    if (res.error) {
      setGraceError(res.error)
    } else {
      setToastMessage(messages.graceSaved)
    }
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

        {/* Grace period block (Admin only) */}
        {role === 'admin' && (
          <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <h2 className="text-[18px] font-semibold text-[#111827]">Gym settings</h2>
            <form onSubmit={handleSaveGrace} className="space-y-4" noValidate>
              <TextField
                id="grace-period"
                label="Grace period (days)"
                type="number"
                value={graceDays}
                onChange={(e) => {
                  setGraceDays(e.target.value)
                  if (graceError) setGraceError(null)
                }}
                error={graceError || undefined}
              />
              <Button
                type="submit"
                variant="primary"
                loading={savingGrace}
                disabled={!isOnline}
                className="w-full"
              >
                Save
              </Button>
            </form>
          </section>
        )}

        {/* Payment reminders toggle (Member only) */}
        {role === 'member' && (
          <section className="bg-white rounded-xl shadow-sm p-4">
            <Toggle
              id="reminders-toggle"
              label="Payment reminders"
              checked={remindersOn}
              disabled={!isOnline}
              onChange={handleToggleReminders}
            />
          </section>
        )}

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

      {toastMessage && (
        <Toast text={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </div>
  )
}
