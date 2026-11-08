import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { SideMenu } from '../components/SideMenu'
import { OfflineBanner } from '../components/OfflineBanner'
import { MemberRow } from '../components/MemberRow'
import { LoadingPlaceholder } from '../components/LoadingPlaceholder'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { Toast } from '../components/Toast'
import { MemberFormModal } from '../modals/MemberForm'
import { listMembers, addMember, Member } from '../lib/api/members'
import { getPlans, Plan } from '../lib/api/plans'
import { messages } from '../lib/messages'
import { useOnline } from '../hooks/useOnline'

export function Members() {
  const navigate = useNavigate()
  const isOnline = useOnline()

  const [members, setMembers] = useState<Member[] | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [membersRes, plansRes] = await Promise.all([
      listMembers(),
      getPlans(),
    ])
    setLoading(false)

    if (membersRes.error) {
      setError(membersRes.error)
    } else {
      setMembers(membersRes.data)
    }

    if (plansRes.data) {
      setPlans(plansRes.data)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveMember = async (data: {
    full_name: string
    email: string
    phone?: string | null
    plan_id: string
    is_18_or_older: boolean
  }) => {
    const res = await addMember(data)
    if (!res.error) {
      setToastMessage(messages.memberAdded)
      await loadData()
    }
    return res
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 tablet:pl-[240px]">
      <SideMenu role="admin" />
      <Header title="Members" />
      <OfflineBanner />

      <main className="flex-1 px-screen py-4 max-w-content w-full mx-auto">
        {loading ? (
          <div data-testid="loading-placeholders" className="flex flex-col gap-2">
            <LoadingPlaceholder shape="row" count={3} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-body text-error">{error}</p>
            <Button variant="secondary" onClick={loadData}>
              Try again
            </Button>
          </div>
        ) : members && members.length === 0 ? (
          <EmptyState
            icon={Users}
            text="No Members yet. Add your first Member."
            actionLabel="Add member"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="text-small text-text-secondary">
                {members?.length} {members?.length === 1 ? 'member' : 'members'}
              </span>
              <Button
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
                disabled={!isOnline}
                className="flex items-center gap-1 text-sm py-2 px-3"
              >
                <Plus size={18} />
                <span>Add member</span>
              </Button>
            </div>

            <div className="bg-white rounded-card shadow-card overflow-hidden">
              {members?.map((member) => (
                <MemberRow
                  key={member.id}
                  fullName={member.full_name}
                  planName={member.plan_name || 'No plan'}
                  status={member.status || 'overdue'}
                  paidUntil={member.paid_until}
                  onClick={() => navigate(`/members/${member.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <TabBar role="admin" />

      <MemberFormModal
        isOpen={isAddModalOpen}
        plans={plans}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveMember}
      />

      {toastMessage && (
        <Toast text={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </div>
  )
}
