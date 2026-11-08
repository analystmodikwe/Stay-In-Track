/**
 * S1 Welcome — the first screen the user sees when logged out.
 * Design: docs/designs/S1.png
 * Layout: logo wordmark, pitch text, "Create account" → S2, "Log in" → S3.
 * No Header, no Tab bar (Section 7.3).
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'

export function Welcome() {
  const navigate = useNavigate()

  return (
    <div
      className={[
        'min-h-screen flex flex-col items-center justify-center',
        'bg-primary px-screen py-10',
        'gap-8',
      ].join(' ')}
    >
      {/* Logo / wordmark */}
      <div className="flex flex-col items-center gap-3">
        <span
          className="text-[32px] font-bold text-white tracking-wide text-center"
          aria-label="STAY IN TRACK"
        >
          STAY IN TRACK
        </span>
        {/* Pitch text */}
        <p className="text-body text-white/80 text-center">
          Know who has paid. Every time.
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Button
          variant="primary"
          className="bg-white text-primary border-white hover:bg-white/90"
          onClick={() => navigate('/sign-up')}
        >
          Create account
        </Button>
        <Button
          variant="secondary"
          className="bg-transparent text-white border-white hover:bg-white/10"
          onClick={() => navigate('/log-in')}
        >
          Log in
        </Button>
      </div>
    </div>
  )
}

