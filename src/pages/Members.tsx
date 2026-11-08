import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Search } from 'lucide-react'
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

const STATUS_FILTERS = ['All', 'Active', 'Grace period', 'Overdue'] as const

export function Members() {
  const navigate = useNavigate()
  const isOnline = useOnline()

  const [members, setMembers] = useState<Member[] | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<typeof STATUS_FILTERS[number]>('All')
  const [hasMore, setHasMore] = useState(false)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const fetchMembers = useCallback(async (
    searchTerm: string,
    statusFilter: string,
    cursor?: string
  ) => {
    const effectiveSearch = searchTerm.trim().length >= 2 ? searchTerm.trim() : undefined
    let effectiveStatus: string | undefined = undefined
    if (statusFilter === 'Active') effectiveStatus = 'active'
    else if (statusFilter === 'Grace period') effectiveStatus = 'grace'
    else if (statusFilter === 'Overdue') effectiveStatus = 'overdue'

    return listMembers({
      search: effectiveSearch,
      status: effectiveStatus,
      cursor,
    })
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [membersRes, plansRes] = await Promise.all([
      fetchMembers(search, selectedStatus),
      getPlans(),
    ])

    setLoading(false)

    if (membersRes.error) {
      setError(membersRes.error)
    } else {
      const data = membersRes.data || []
      setMembers(data)
      setHasMore(data.length === 20)
    }

    if (plansRes.data) {
      setPlans(plansRes.data)
    }
  }, [fetchMembers, search, selectedStatus])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleLoadMore = async () => {
    if (!members || members.length === 0 || loadingMore) return
    setLoadingMore(true)

    const lastMember = members[members.length - 1]
    const res = await fetchMembers(search, selectedStatus, lastMember.full_name)
    setLoadingMore(false)

    if (res.data) {
      setMembers((prev) => [...(prev || []), ...res.data!])
      setHasMore(res.data.length === 20)
    }
  }

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

  const isFilteringOrSearching = search.trim().length >= 2 || selectedStatus !== 'All'

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 tablet:pl-[240px]">
      <SideMenu role="admin" />
      <Header title="Members" />
      <OfflineBanner />

      <main className="flex-1 px-screen py-4 max-w-content w-full mx-auto flex flex-col gap-4">
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
        ) : members && members.length === 0 && !isFilteringOrSearching ? (
          <EmptyState
            icon={Users}
            text="No Members yet. Add your first Member."
            actionLabel="Add member"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <>
            {/* Search input and action row */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email"
                    aria-label="Search by name or email"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-input text-body text-text-main focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={() => setIsAddModalOpen(true)}
                  disabled={!isOnline}
                  className="flex items-center gap-1 py-2.5 px-4 h-auto text-sm shrink-0"
                >
                  <Plus size={18} />
                  <span>Add member</span>
                </Button>
              </div>

              {/* Filter chips */}
              <div
                className="flex items-center gap-2 overflow-x-auto pb-1"
                role="toolbar"
                aria-label="Filter members by status"
              >
                {STATUS_FILTERS.map((status) => {
                  const active = selectedStatus === status
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={[
                        'px-3.5 py-1.5 rounded-full text-small font-medium transition-colors shrink-0',
                        active
                          ? 'bg-accent text-white'
                          : 'bg-white text-text-secondary border border-border hover:bg-background',
                      ].join(' ')}
                    >
                      {status}
                    </button>
                  )
                })}
              </div>
            </div>

            {members && members.length === 0 ? (
              <EmptyState
                icon={Users}
                text="No Members found. Check the spelling or tap Add member."
                actionLabel="Add member"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-card shadow-card overflow-hidden divide-y divide-border">
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

                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="secondary"
                      onClick={handleLoadMore}
                      loading={loadingMore}
                      disabled={loadingMore || !isOnline}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
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
