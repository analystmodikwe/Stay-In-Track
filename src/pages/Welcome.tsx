/**
 * S1 Welcome — the first screen the user sees when logged out.
 * Design: docs/designs/S1.png
 * Layout:
 *   - Logo lockup: Navy square with white check icon + "STAY IN TRACK" wordmark
 *   - Heading: "Know who has paid. Every time."
 *   - Subtitle: "Simple, reliable gym membership payment tracking for South African fitness clubs."
 *   - Primary button: "Create account" → S2
 *   - Secondary button: "Log in" → S3
 *   - Footer caption: "South African gym payment & fee tracking"
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '../components/Button'

export function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <main className="w-full max-w-[390px] min-h-[640px] bg-white rounded-card shadow-sm border border-border/50 flex flex-col justify-between p-6 sm:p-8">
        {/* Top spacer & Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-8">
          {/* Logo badge + wordmark */}
          <div className="flex items-center gap-2.5 mb-6">
            <div
              className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm"
              aria-hidden="true"
            >
              <Check size={20} strokeWidth={2.5} />
            </div>
            <span
              className="text-heading font-bold text-primary tracking-wide"
              aria-label="STAY IN TRACK"
            >
              STAY IN TRACK
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[26px] font-bold text-text-main leading-tight tracking-tight max-w-[260px]">
            Know who has paid. Every time.
          </h1>

          {/* Subtitle */}
          <p className="text-small text-text-secondary mt-3 max-w-[280px] leading-relaxed">
            Simple, reliable gym membership payment tracking for South African fitness clubs.
          </p>
        </div>

        {/* Buttons & footer */}
        <div className="w-full flex flex-col gap-3 mt-8 pb-2">
          <Button
            variant="primary"
            onClick={() => navigate('/sign-up')}
          >
            Create account
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/log-in')}
          >
            Log in
          </Button>

          <p className="text-[12px] text-text-secondary text-center mt-2">
            South African gym payment &amp; fee tracking
          </p>
        </div>
      </main>
    </div>
  )
}
