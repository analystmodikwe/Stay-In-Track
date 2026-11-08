/**
 * S3 Log In
 * PRD US2 — T-US2-1, T-US2-2, T-US2-4
 */
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Info } from 'lucide-react'
import { Header } from '../components/Header'
import { TextField } from '../components/TextField'
import { Button } from '../components/Button'
import { NoticeBanner } from '../components/NoticeBanner'
import { OfflineBanner } from '../components/OfflineBanner'
import { useOnline } from '../hooks/useOnline'
import { logIn, resendEmail } from '../lib/api/auth'
import { messages } from '../lib/messages'
import { supabase } from '../lib/supabase'

export function LogIn() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isOnline  = useOnline()

  // Show verify-email banner when redirected from SignUp
  const fromSignUp = (location.state as { verifyEmail?: boolean } | null)?.verifyEmail ?? false

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [showVerifyBanner, setShowVerifyBanner] = useState(fromSignUp)
  const [bannerText, setBannerText] = useState<string>(messages.verifyEmail)
  const [resendLoading, setResendLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rateLimited || !isOnline) return
    setLoading(true)
    setErrorMsg(null)
    setShowVerifyBanner(false)

    const result = await logIn({ email, password })
    setLoading(false)

    if (result.error) {
      const code = result.error.code ?? ''
      const msg  = result.error.message ?? ''
      if (code === 'email_not_confirmed' || msg.includes('Email not confirmed')) {
        setBannerText(messages.unverified)
        setShowVerifyBanner(true)
      } else if (code === 'over_request_rate_limit' || msg.includes('rate_limit')) {
        setRateLimited(true)
        setErrorMsg(messages.tooManyAttempts)
      } else if (code === 'member_removed' || msg.includes('record was removed')) {
        setErrorMsg(messages.memberRemoved)
      } else {
        setErrorMsg(messages.wrongPassword)
      }
      return
    }

    // Determine role from profile
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role
    if (role === 'member') {
      navigate('/home')
    } else {
      navigate('/dashboard')
    }
  }

  async function handleResend() {
    setResendLoading(true)
    await resendEmail(email)
    setResendLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Header title="Log in" showBack onBack={() => navigate('/')} />
      <OfflineBanner />

      <main className="flex-1 px-4 py-6 max-w-[480px] w-full mx-auto">
        {showVerifyBanner && (
          <NoticeBanner
            icon={Info}
            text={bannerText}
            className="mb-4"
          />
        )}

        {showVerifyBanner && (
          <div className="mb-4 text-sm">
            <span className="text-[#4B5563]">Didn't get it? </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-[#0F766E] underline"
            >
              Resend email
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <TextField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
          <TextField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {errorMsg && (
            <p className="text-[#C62828] text-sm" role="alert">{errorMsg}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={rateLimited || !isOnline}
            loading={loading}
            className="w-full"
          >
            Log in
          </Button>
        </form>

        <p className="mt-4 text-sm text-center">
          <Link to="/forgot-password" className="text-[#0F766E] underline">
            Forgot password?
          </Link>
        </p>
      </main>
    </div>
  )
}

