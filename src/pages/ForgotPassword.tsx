/**
 * S4 Forgot Password
 * Mode "request": enter email → send reset link
 * Mode "reset": set new password (opened from reset email link)
 * PRD US2-3, US2-5
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import { Header } from '../components/Header'
import { TextField } from '../components/TextField'
import { Button } from '../components/Button'
import { NoticeBanner } from '../components/NoticeBanner'
import { OfflineBanner } from '../components/OfflineBanner'
import { useOnline } from '../hooks/useOnline'
import { sendPasswordReset, updatePassword, logOut } from '../lib/api/auth'
import { validatePassword } from '../lib/rules/password'
import { messages } from '../lib/messages'
import { useRecoveryMode, clearRecoveryMode } from '../hooks/useRecoveryMode'

interface Props {
  mode?: 'request' | 'reset'
}

export function ForgotPassword({ mode: propMode }: Props = {}) {
  const navigate = useNavigate()
  const isOnline = useOnline()

  // useRecoveryMode subscribes to Supabase PASSWORD_RECOVERY at module load time,
  // so the flag is captured even if the event fired before this component mounted.
  const recoveryDetected = useRecoveryMode()

  const mode = propMode || (recoveryDetected ? 'reset' : 'request')

  // --- Request mode ---
  const [email, setEmail] = useState('')
  const [sendLoading, setSendLoading] = useState(false)
  const [sentMsg, setSentMsg] = useState<string | null>(null)

  // --- Reset mode ---
  const [newPassword, setNewPassword] = useState('')
  const [saveLoading, setSaveLoading]  = useState(false)
  const [errorMsg, setErrorMsg]        = useState<string | null>(null)
  const [successMsg, setSuccessMsg]    = useState<string | null>(null)

  const passwordValid = validatePassword(newPassword)

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    setSendLoading(true)
    await sendPasswordReset(email)
    setSendLoading(false)
    // Always show the same message regardless of whether the account exists
    setSentMsg(messages.resetLinkSent)
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordValid || !isOnline) return
    setSaveLoading(true)
    setErrorMsg(null)
    const result = await updatePassword(newPassword)
    setSaveLoading(false)
    if (result.error) {
      setErrorMsg(messages.serverError)
      return
    }
    // Show success banner then navigate to log-in
    setSuccessMsg(messages.passwordUpdated)
    clearRecoveryMode()
    await logOut()
    setTimeout(() => navigate('/log-in', { state: { passwordReset: true } }), 1500)
  }

  if (mode === 'reset') {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <Header title="Set new password" showBack onBack={() => navigate('/log-in')} />
        <OfflineBanner />
        <main className="flex-1 px-4 py-6 max-w-[480px] w-full mx-auto">
          {successMsg && <NoticeBanner icon={Info} text={successMsg} className="mb-4" />}
          <form onSubmit={handleSavePassword} noValidate className="space-y-4">
            <TextField
              label="New password"
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errorMsg && <p className="text-[#C62828] text-sm" role="alert">{errorMsg}</p>}
            <Button
              type="submit"
              variant="primary"
              disabled={!passwordValid || !isOnline}
              loading={saveLoading}
              className="w-full"
            >
              Save password
            </Button>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Header title="Forgot password" showBack onBack={() => navigate('/log-in')} />
      <OfflineBanner />
      <main className="flex-1 px-4 py-6 max-w-[480px] w-full mx-auto">
        {sentMsg && <NoticeBanner icon={Info} text={sentMsg} className="mb-4" />}
        <form onSubmit={handleSendLink} noValidate className="space-y-4">
          <TextField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!isOnline || sendLoading}
            loading={sendLoading}
            className="w-full"
          >
            Send link
          </Button>
        </form>
      </main>
    </div>
  )
}

