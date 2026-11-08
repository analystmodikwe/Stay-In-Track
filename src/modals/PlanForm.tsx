import React, { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { TextField } from '../components/TextField'
import { Toggle } from '../components/Toggle'
import { Button } from '../components/Button'
import { validatePlanName, validatePlanPrice, validatePlanBenefits } from '../lib/rules/plan'
import { Plan } from '../lib/api/plans'

export interface PlanFormModalProps {
  isOpen: boolean
  plan?: Plan | null
  onClose: () => void
  onSave: (data: {
    name: string
    price: number
    benefits?: string | null
    status: 'active' | 'inactive'
  }) => Promise<{ error: string | null }>
}

export function PlanFormModal({ isOpen, plan, onClose, onSave }: PlanFormModalProps) {
  const isEdit = !!plan

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [benefits, setBenefits] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<{
    name?: string
    price?: string
    benefits?: string
  }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (plan) {
      setName(plan.name)
      setPrice(plan.price.toString())
      setBenefits(plan.benefits || '')
      setIsActive(plan.status === 'active')
    } else {
      setName('')
      setPrice('')
      setBenefits('')
      setIsActive(true)
    }
    setErrors({})
  }, [plan, isOpen])

  if (!isOpen) return null

  const handleBlur = (field: 'name' | 'price' | 'benefits') => {
    if (field === 'name') {
      const err = validatePlanName(name)
      setErrors((prev) => ({ ...prev, name: err || undefined }))
    } else if (field === 'price') {
      const err = validatePlanPrice(parseFloat(price))
      setErrors((prev) => ({ ...prev, price: err || undefined }))
    } else if (field === 'benefits') {
      const err = validatePlanBenefits(benefits)
      setErrors((prev) => ({ ...prev, benefits: err || undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nameErr = validatePlanName(name)
    const priceErr = validatePlanPrice(parseFloat(price))
    const benefitsErr = validatePlanBenefits(benefits)

    const newErrors: typeof errors = {}
    if (nameErr) newErrors.name = nameErr
    if (priceErr) newErrors.price = priceErr
    if (benefitsErr) newErrors.benefits = benefitsErr

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    const res = await onSave({
      name: name.trim(),
      price: parseFloat(price),
      benefits: benefits.trim() || null,
      status: isActive ? 'active' : 'inactive',
    })
    setSaving(false)

    if (res.error) {
      setErrors({ name: res.error })
    } else {
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-white rounded-card shadow-card overflow-hidden flex flex-col max-h-[90vh]">
        <Header
          title={isEdit ? 'Edit plan' : 'Add plan'}
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
          <TextField
            id="plan-name"
            label="Plan name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur('name')}
            error={errors.name}
            placeholder="e.g. Standard"
          />

          <TextField
            id="plan-price"
            label="Price per month (R)"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => handleBlur('price')}
            error={errors.price}
            placeholder="e.g. 350.00"
          />

          <TextField
            id="plan-benefits"
            label="Benefits (optional)"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            onBlur={() => handleBlur('benefits')}
            error={errors.benefits}
            placeholder="e.g. Gym floor access"
          />

          <div className="pt-2">
            <Toggle
              id="plan-active"
              label="Active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="w-full"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

