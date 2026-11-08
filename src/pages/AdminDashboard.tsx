import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { SideMenu } from '../components/SideMenu'
import { OfflineBanner } from '../components/OfflineBanner'
import { LoadingPlaceholder } from '../components/LoadingPlaceholder'
import { StatCard } from '../components/StatCard'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { MemberRow } from '../components/MemberRow'
import { getAdminDashboard, DashboardData } from '../lib/api/dashboard'
import { formatMoney } from '../lib/format'
import { messages } from '../lib/messages'

export function AdminDashboard() {
  const navigate = useNavigate()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getAdminDashboard()
    setLoading(false)

    if (res.error || !res.data) {
      setError(res.error || messages.serverError)
    } else {
      setData(res.data)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 tablet:pl-[240px]">
      <SideMenu role="admin" />
      <Header title="Dashboard" />
      <OfflineBanner />

      <main className="flex-1 px-screen py-4 max-w-content w-full mx-auto flex flex-col gap-6">
        {loading ? (
          <div data-testid="loading-placeholders" className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 gap-3">
            <LoadingPlaceholder shape="card" count={5} />
          </div>
        ) : error || !data ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-body text-error">{error || messages.serverError}</p>
            <Button variant="secondary" onClick={loadData}>
              Try again
            </Button>
          </div>
        ) : data.total === 0 ? (
          <EmptyState
            icon={Users}
            text="No Members yet. Add your first Member."
            actionLabel="Add member"
            onAction={() => navigate('/members')}
          />
        ) : (
          <>
            {/* 5 StatCards */}
            <section className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 gap-3">
              <StatCard label="Total Members" value={data.total} />
              <StatCard label="Active" value={data.active} />
              <StatCard label="Grace period" value={data.grace} />
              <StatCard label="Overdue" value={data.overdue} />
              <StatCard
                label="Revenue this month"
                value={formatMoney(data.revenue)}
              />
            </section>

            {/* Members per Plan */}
            <section className="bg-white rounded-card shadow-card p-4 flex flex-col gap-3">
              <h3 className="text-heading font-semibold text-text-main">
                Members per Plan
              </h3>
              <div className="divide-y divide-border">
                {data.plans.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between py-2.5 text-body"
                  >
                    <span className="text-text-main font-medium">{p.name}</span>
                    <span className="text-text-secondary font-semibold">
                      {p.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Overdue Members list */}
            <section className="bg-white rounded-card shadow-card p-4 flex flex-col gap-3">
              <h3 className="text-heading font-semibold text-text-main">
                Overdue Members
              </h3>
              {data.overdue_list.length === 0 ? (
                <p className="text-body text-text-secondary py-2">
                  Nobody is overdue.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {data.overdue_list.map((m) => (
                    <MemberRow
                      key={m.id}
                      fullName={m.full_name}
                      planName={m.plan_name}
                      status="overdue"
                      paidUntil={m.paid_until}
                      onClick={() => navigate(`/members/${m.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <TabBar role="admin" />
    </div>
  )
}

export default AdminDashboard
