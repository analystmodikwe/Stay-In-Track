/**
 * M4 Delete Account modal
 * Admin variant: deletes account, gym, Plans, Members, Payments
 * Member variant: deletes login only; Member record stays
 * PRD US4 — T-US4-1, T-US4-2, T-US4-3
 */
import { useState } from 'react'
import { ConfirmModal } from '../components/ConfirmModal'
import { OfflineBanner } from '../components/OfflineBanner'
import { deleteAccount } from '../lib/api/auth'
import { messages } from '../lib/messages'

interface Props {
  role: 'admin' | 'member'
  isOpen: boolean
  isOffline?: boolean
  onClose: () => void
  onDeleted: () => void
}

const ADMIN_BODY =
  'This will permanently delete your account, gym, all Plans, Members and Payments.'
const MEMBER_BODY =
  'This will delete your login. Your gym keeps your Member record and payment history.'

export function DeleteAccount({ role, isOpen, isOffline = false, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setErrorMsg(null)
    const result = await deleteAccount()
    setLoading(false)
    if (result.error) {
      setErrorMsg(messages.serverError)
      return
    }
    onDeleted()
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Delete account"
      body={
        <>
          {isOffline && <OfflineBanner forceOffline className="mb-3" />}
          <p className="text-[#4B5563] text-[16px]">
            {role === 'admin' ? ADMIN_BODY : MEMBER_BODY}
          </p>
          {errorMsg && (
            <p className="text-[#C62828] text-sm mt-2" role="alert">{errorMsg}</p>
          )}
        </>
      }
      confirmLabel="Delete"
      confirmDisabled={isOffline || loading}
      confirmLoading={loading}
      onConfirm={handleDelete}
      onCancel={onClose}
    />
  )
}

