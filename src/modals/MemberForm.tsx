import React, { useState, useEffect, useMemo } from 'react'
import { Header } from '../components/Header'
import { TextField } from '../components/TextField'
import { SelectField } from '../components/SelectField'
import { Checkbox } from '../components/Checkbox'
import { Button } from '../components/Button'
import { validateMember } from '../lib/rules/member'
import { formatPhone, normalizePhone } from '../lib/format'
import { Plan } from '../lib/api/plans'
import { Member } from '../lib/api/members'
import { messages } from '../lib/messages'
import { useOnline } from '../hooks/useOnline'

export interface MemberFormModalProps {
  isOpen: boolean
  member?: Member | null
  plans: Plan[]
  onClose: () => void
  onSave: (data: {
    full_name: string
    email: string
    phone?: string | null
    plan_id: string
    is_18_or_older: boolean
  }) => Promise<{ error: string | null }>
}

export function MemberFormModal({
  isOpen,
  member,
  plans,
  onClose,
  onSave,
}: MemberFormModalProps) {
  const isEdit = !!member
  const isEmailLocked = isEdit && !!member.user_id
  const isOnline = useOnline()

  const activePlans = useMemo(() => plans.filter((p) => p.status === 'active'), [plans])

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [planId, setPlanId] = useState('')
  const [is18, setIs18] = useState(false)
  const [errors, setErrors] = useState<{
    full_name?: string
    email?: string
    phone?: string
    plan_id?: string
    is_18_or_older?: string
  }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (member) {
      setFullName(member.full_name)
      setEmail(member.email)
      setPhone(member.phone ? formatPhone(member.phone) : '')
      setPlanId(member.plan_id)
      setIs18(member.is_18_or_older)
    } else {
      setFullName('')
      setEmail('')
      setPhone('')
      setPlanId(activePlans[0]?.id || '')
      setIs18(false)
    }
    setErrors({})
  }, [member, isOpen, activePlans])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateMember({
      full_name: fullName,
      email,
      phone,
      plan_id: planId,
      is_18_or_older: is18,
    })

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setSaving(true)
    const res = await onSave({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() ? normalizePhone(phone) : null,
      plan_id: planId,
      is_18_or_older: is18,
    })
    setSaving(false)

    if (res.error) {
      if (res.error === messages.duplicateMember) {
        setErrors({ email: messages.duplicateMember })
      } else if (res.error === messages.memberLimit) {
        setErrors({ full_name: messages.memberLimit })
      } else {
        setErrors({ full_name: res.error })
      }
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
          title={isEdit ? 'Edit member' : 'Add member'}
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto" noValidate>
          <TextField
            id="member-full-name"
            label="Full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: undefined }))
            }}
            error={errors.full_name}
            placeholder="e.g. Johan van der Merwe"
          />

          <div className="flex flex-col gap-1">
            <TextField
              id="member-email"
              label="Email"
              type="email"
              value={email}
              disabled={isEmailLocked}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              error={errors.email}
              placeholder="e.g. johan.vdm@example.com"
            />
            {isEmailLocked && (
              <p className="text-small text-text-secondary mt-1">
                {messages.emailLocked}
              </p>
            )}
          </div>

          <TextField
            id="member-phone"
            label="Phone (optional)"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
            }}
            error={errors.phone}
            placeholder="+27 82 555 0147"
          />

          <SelectField
            id="member-plan"
            label="Plan"
            value={planId}
            onChange={(e) => {
              setPlanId(e.target.value)
              if (errors.plan_id) setErrors((prev) => ({ ...prev, plan_id: undefined }))
            }}
            error={errors.plan_id}
          >
            {activePlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>

          <div className="pt-2">
            <Checkbox
              id="member-is-18"
              label="This Member is 18 or older"
              checked={is18}
              onChange={(e) => {
                setIs18(e.target.checked)
                if (errors.is_18_or_older) setErrors((prev) => ({ ...prev, is_18_or_older: undefined }))
              }}
              error={errors.is_18_or_older}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving || !isOnline}
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

