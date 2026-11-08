import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Dumbbell } from 'lucide-react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { SideMenu } from '../components/SideMenu'
import { OfflineBanner } from '../components/OfflineBanner'
import { PlanCard } from '../components/PlanCard'
import { LoadingPlaceholder } from '../components/LoadingPlaceholder'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { Toast } from '../components/Toast'
import { PlanFormModal } from '../modals/PlanForm'
import { getPlans, createPlan, updatePlan, Plan } from '../lib/api/plans'
import { messages } from '../lib/messages'
import { useOnline } from '../hooks/useOnline'

export function Plans() {
  const isOnline = useOnline()

  const [plans, setPlans] = useState<Plan[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getPlans()
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setPlans(res.data)
    }
  }, [])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const handleOpenAdd = () => {
    setSelectedPlan(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlan(null)
  }

  const handleSavePlan = async (data: {
    name: string
    price: number
    benefits?: string | null
    status: 'active' | 'inactive'
  }) => {
    let res: { error: string | null }
    if (selectedPlan) {
      res = await updatePlan(selectedPlan.id, data)
    } else {
      res = await createPlan(data)
    }

    if (!res.error) {
      setToastMessage(messages.planSaved)
      await loadPlans()
    }

    return res
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 tablet:pl-[240px]">
      <SideMenu role="admin" />
      <Header title="Plans" />
      <OfflineBanner />

      <main className="flex-1 px-screen py-4 max-w-content w-full mx-auto">
        {loading ? (
          <div data-testid="loading-placeholders" className="flex flex-col gap-3">
            <LoadingPlaceholder shape="card" count={3} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-body text-error">{error}</p>
            <Button variant="secondary" onClick={loadPlans}>
              Try again
            </Button>
          </div>
        ) : plans && plans.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            text="No Plans yet. Add your first Plan."
            actionLabel="Add plan"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-small text-text-secondary">
                {plans?.length} {plans?.length === 1 ? 'plan' : 'plans'}
              </span>
              <Button
                variant="primary"
                onClick={handleOpenAdd}
                disabled={!isOnline}
                className="flex items-center gap-1 text-sm py-2 px-3"
              >
                <Plus size={18} />
                <span>Add plan</span>
              </Button>
            </div>

            {plans?.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                price={plan.price}
                benefits={plan.benefits}
                status={plan.status}
                memberCount={plan.memberCount}
                onClick={() => handleOpenEdit(plan)}
              />
            ))}
          </div>
        )}
      </main>

      <TabBar role="admin" />

      <PlanFormModal
        isOpen={isModalOpen}
        plan={selectedPlan}
        onClose={handleCloseModal}
        onSave={handleSavePlan}
      />

      {toastMessage && (
        <Toast text={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </div>
  )
}
