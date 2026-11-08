/**
 * S2 Sign Up — Admin form (Member form added in Phase 5)
 * PRD US1, US3 (Member: Phase 5)
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { TextField } from '../components/TextField'
import { SelectField } from '../components/SelectField'
import { Checkbox } from '../components/Checkbox'
import { Button } from '../components/Button'
import { OfflineBanner } from '../components/OfflineBanner'
import { useOnline } from '../hooks/useOnline'
import { validatePassword } from '../lib/rules/password'
import { signUp } from '../lib/api/auth'
import { messages } from '../lib/messages'

type AccountType = 'admin' | 'member'

export function SignUp() {
  const navigate = useNavigate()
  const isOnline = useOnline()

  const [accountType, setAccountType] = useState<AccountType>('admin')
  const [gymName, setGymName]       = useState('')
  const [fullName, setFullName]     = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [is18, setIs18]             = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)

  const passwordValid = validatePassword(password)
  const adminFieldsFilled = accountType === 'admin'
    ? gymName.trim().length > 0 && fullName.trim().length > 0 && email.trim().length > 0
    : fullName.trim().length > 0 && email.trim().length > 0

  const canSubmit = is18 && agreedPrivacy && passwordValid && adminFieldsFilled && isOnline

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setErrorMsg(null)

    const result = await signUp({
      email,
      password,
      fullName,
      role: accountType,
      gymName: accountType === 'admin' ? gymName : undefined,
      is18OrOlder: is18,
    })

    setLoading(false)

    if (result.error) {
      const code = result.error.code
      if (code === 'user_already_exists' || result.error.message.includes('already registered')) {
        setErrorMsg(messages.emailExists)
      } else if (
        result.error.message.includes('member_not_found') ||
        result.error.message.includes("We can't find this email")
      ) {
        setErrorMsg(messages.memberNotFound)
      } else {
        setErrorMsg(messages.serverError)
      }
      return
    }

    // Success → go to Log In with verify banner
    navigate('/log-in', { state: { verifyEmail: true } })
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Header title="Create account" showBack onBack={() => navigate('/')} />
      <OfflineBanner />

      <main className="flex-1 px-4 py-6 max-w-[480px] w-full mx-auto">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Account type */}
          <SelectField
            label="Account type"
            id="account-type"
            value={accountType}
            onChange={e => setAccountType(e.target.value as AccountType)}
          >
            <option value="admin">Gym admin</option>
            <option value="member">Member</option>
          </SelectField>

          {/* Gym name — Admin only */}
          {accountType === 'admin' && (
            <TextField
              label="Gym name"
              id="gym-name"
              type="text"
              value={gymName}
              onChange={e => setGymName(e.target.value)}
              autoComplete="organization"
            />
          )}

          <TextField
            label="Full name"
            id="full-name"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            autoComplete="name"
          />

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
            onBlur={() => setPasswordTouched(true)}
            error={passwordTouched && password.length > 0 && !passwordValid
              ? messages.passwordRules
              : undefined}
            autoComplete="new-password"
          />

          {/* Checkboxes */}
          <Checkbox
            id="is-18"
            label="I am 18 or older"
            checked={is18}
            onChange={e => setIs18(e.target.checked)}
          />
          <Checkbox
            id="privacy-agree"
            label={
              <span>
                I agree to the{' '}
                <Link to="/privacy" className="text-[#0F766E] underline">
                  Privacy Notice
                </Link>
              </span>
            }
            checked={agreedPrivacy}
            onChange={e => setAgreedPrivacy(e.target.checked)}
          />

          {/* Error */}
          {errorMsg && (
            <p className="text-[#C62828] text-sm" role="alert">
              {errorMsg === messages.emailExists ? (
                <>
                  {messages.emailExists}{' '}
                  <Link to="/log-in" className="underline text-[#0F766E]">
                    Log in
                  </Link>
                </>
              ) : errorMsg}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            loading={loading}
            className="w-full"
          >
            Sign up
          </Button>
        </form>
      </main>
    </div>
  )
}

