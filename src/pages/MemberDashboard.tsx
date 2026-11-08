/**
 * S9 Member Dashboard — Phase 8 (F6, F7)
 * Displays own membership status, paid-until date, plan details,
 * benefits, payment history, and contextual notice banners.
 * T-US13-1, T-US13-2, T-US13-3, T-US14-1, T-US14-4, T-EDGE-6, T-S9-1
 */
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, Clock, AlertCircle } from 'lucide-react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { OfflineBanner } from '../components/OfflineBanner'
import { StatusBadge } from '../components/StatusBadge'
import { NoticeBanner } from '../components/NoticeBanner'
import { LoadingPlaceholder } from '../components/LoadingPlaceholder'
import { PaymentRow } from '../components/PaymentRow'
import { getOwnMembership, OwnMembership } from '../lib/api/member'
import { logOut } from '../lib/api/auth'
import {
  shouldShowDueSoon,
  shouldShowGraceBanner,
  shouldShowOverdueBanner,
  calculateLastGraceDay,
} from '../lib/reminders'
import { formatMoney, formatDate, todaySAST } from '../lib/format'
import { messages } from '../lib/messages'

interface MemberDashboardProps {
  todayOverride?: string
}

export function MemberDashboard({ todayOverride }: MemberDashboardProps) {
  const navigate = useNavigate()
  const [membership, setMembership] = useState<OwnMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = todayOverride || todaySAST()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getOwnMembership()
    setLoading(false)

    if (res.error) {
      setError(res.error)
      if (res.error === messages.memberRemoved) {
        await logOut()
        setTimeout(() => navigate('/'), 2500)
      }
      return
    }

    setMembership(res.data)
  }, [navigate])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col pb-16 tablet:pb-0">
      <Header title="My membership" />
      <OfflineBanner />

      <main className="flex-1 px-4 py-6 max-w-[480px] w-full mx-auto space-y-6">
        {loading && (
          <div className="space-y-4">
            <LoadingPlaceholder shape="block" count={3} />
          </div>
        )}

        {error && !loading && (
          <NoticeBanner
            icon={AlertCircle}
            text={error}
            variant="error"
          />
        )}

        {membership && !loading && (
          <>
            {/* Gym Name & Status Card */}
            <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] text-[#4B5563]">Gym</p>
                  <p className="text-[18px] font-bold text-[#111827]">{membership.gym.name}</p>
                </div>
                <div className="scale-110 origin-right">
                  <StatusBadge status={membership.status} />
                </div>
              </div>

              <div className="pt-2 border-t border-[#CBD5E1]">
                <p className="text-[14px] text-[#4B5563]">Paid until</p>
                <p className="text-[16px] font-semibold text-[#111827]">
                  {membership.paid_until ? formatDate(membership.paid_until) : 'No Payment yet'}
                </p>
              </div>
            </section>

            {/* Contextual Notices */}
            {shouldShowOverdueBanner(membership.status, membership.reminders_on) && (
              <NoticeBanner
                icon={AlertCircle}
                variant="error"
                text="Your membership has expired. Please pay at the gym to get access again."
              />
            )}

            {shouldShowGraceBanner(membership.status, membership.reminders_on) && membership.paid_until && (
              <NoticeBanner
                icon={Clock}
                variant="warning"
                text={`Your payment is late. Please pay by ${formatDate(
                  calculateLastGraceDay(membership.paid_until, membership.gym.grace_days)
                )} to keep your access.`}
              />
            )}

            {membership.status === 'active' &&
              shouldShowDueSoon(membership.reminders_on, membership.paid_until, today) &&
              membership.paid_until && (
                <NoticeBanner
                  icon={Info}
                  variant="info"
                  text={`Payment due soon: your membership ends on ${formatDate(membership.paid_until)}.`}
                />
              )}

            {/* Plan Details Card */}
            <section className="bg-white rounded-xl shadow-sm p-5 space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[18px] font-bold text-[#111827]">{membership.plan.name}</h2>
                <p className="text-[16px] font-semibold text-[#0F766E]">
                  {formatMoney(membership.plan.price)} per month
                </p>
              </div>
              {membership.plan.benefits && (
                <div className="pt-2 border-t border-[#CBD5E1]">
                  <p className="text-[14px] text-[#4B5563] font-medium">Benefits</p>
                  <p className="text-[15px] text-[#111827] mt-0.5">{membership.plan.benefits}</p>
                </div>
              )}
            </section>

            {/* Payment History */}
            <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="text-[18px] font-bold text-[#111827]">Payment history</h2>
              {membership.payments.length === 0 ? (
                <p className="text-[15px] text-[#4B5563]">No Payments yet.</p>
              ) : (
                <div className="divide-y divide-[#CBD5E1]">
                  {membership.payments.map((p) => (
                    <PaymentRow key={p.id} payment={p} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <TabBar role="member" />
    </div>
  )
}
