import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { StatusBadge } from '../components/StatusBadge'
import { OfflineBanner } from '../components/OfflineBanner'
import { LoadingPlaceholder } from '../components/LoadingPlaceholder'
import { Button } from '../components/Button'
import { Toast } from '../components/Toast'
import { MemberFormModal } from '../modals/MemberForm'
import { DeleteMemberModal } from '../modals/DeleteMember'
import {
  getMemberWithPayments,
  updateMember,
  deleteMember,
  MemberWithDetails,
} from '../lib/api/members'
import { getPlans, Plan } from '../lib/api/plans'
import { formatMoney, formatDate, formatPhone } from '../lib/format'
import { messages } from '../lib/messages'
import { useOnline } from '../hooks/useOnline'

export function MemberDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isOnline = useOnline()

  const [member, setMember] = useState<MemberWithDetails | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    const [memberRes, plansRes] = await Promise.all([
      getMemberWithPayments(id),
      getPlans(),
    ])
    setLoading(false)

    if (memberRes.error || !memberRes.data) {
      setError(memberRes.error || messages.serverError)
    } else {
      setMember(memberRes.data)
    }

    if (plansRes.data) {
      setPlans(plansRes.data)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdate = async (data: {
    full_name: string
    email: string
    phone?: string | null
    plan_id: string
  }) => {
    if (!id) return { error: messages.serverError }
    const res = await updateMember(id, data)
    if (!res.error) {
      setToastMessage(messages.memberUpdated)
      await loadData()
    }
    return res
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    const res = await deleteMember(id)
    setDeleting(false)

    if (res.error) {
      setToastMessage(res.error)
    } else {
      setShowDeleteModal(false)
      navigate('/members', { state: { toast: messages.memberDeleted } })
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-10">
      <Header
        title={member?.full_name || 'Member'}
        onBack={() => navigate('/members')}
      />
      <OfflineBanner />

      <main className="flex-1 px-screen py-4 max-w-content w-full mx-auto">
        {loading ? (
          <div data-testid="loading-placeholders" className="flex flex-col gap-4">
            <LoadingPlaceholder shape="block" count={3} />
          </div>
        ) : error || !member ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-body text-error">{error || messages.serverError}</p>
            <Button variant="secondary" onClick={loadData}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Status & Paid until block */}
            <section className="bg-white rounded-card shadow-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-text-secondary">Membership status</span>
                <StatusBadge status={member.status || 'overdue'} />
              </div>
              <p className="text-body text-text-main font-semibold">
                {member.paid_until
                  ? `Paid until ${formatDate(member.paid_until)}`
                  : 'No Payment yet'}
              </p>
            </section>

            {/* Details block */}
            <section className="bg-white rounded-card shadow-card p-4 flex flex-col gap-3">
              <div>
                <p className="text-heading font-semibold text-text-main">{member.plan.name}</p>
                <p className="text-body text-text-secondary">
                  {formatMoney(member.plan.price)} per month
                </p>
                {member.plan.benefits && (
                  <p className="text-small text-text-secondary mt-1 whitespace-pre-wrap">
                    {member.plan.benefits}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-3 flex flex-col gap-1 text-body">
                <p className="text-text-main">{member.email}</p>
                <p className="text-text-secondary">
                  {member.phone ? formatPhone(member.phone) : 'No phone number'}
                </p>
              </div>
            </section>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="primary"
                disabled={!isOnline}
                onClick={() => {}}
                className="w-full"
              >
                Record payment
              </Button>
              <Button
                variant="secondary"
                disabled={!isOnline}
                onClick={() => setShowEditModal(true)}
                className="w-full"
              >
                Edit
              </Button>
            </div>

            {/* Payment history block */}
            <section className="bg-white rounded-card shadow-card p-4 flex flex-col gap-3 mt-2">
              <h3 className="text-heading font-semibold text-text-main">Payment history</h3>
              {member.payments.length === 0 ? (
                <p className="text-body text-text-secondary">No Payments yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {member.payments.map((p) => (
                    <div key={p.id} className="py-2 text-body">
                      <span>{p.payment_date} - {formatMoney(p.amount)} ({p.method})</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Delete member danger button */}
            <div className="pt-4">
              <Button
                variant="danger"
                disabled={!isOnline}
                onClick={() => setShowDeleteModal(true)}
                className="w-full"
              >
                Delete member
              </Button>
            </div>
          </div>
        )}
      </main>

      {member && (
        <MemberFormModal
          isOpen={showEditModal}
          member={member}
          plans={plans}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdate}
        />
      )}

      <DeleteMemberModal
        isOpen={showDeleteModal}
        loading={deleting}
        disabled={!isOnline}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />

      {toastMessage && (
        <Toast text={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </div>
  )
}
