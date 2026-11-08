import React from 'react'
import { ConfirmModal } from '../components/ConfirmModal'

export interface DeleteMemberModalProps {
  isOpen: boolean
  loading?: boolean
  disabled?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteMemberModal({
  isOpen,
  loading = false,
  disabled = false,
  onClose,
  onConfirm,
}: DeleteMemberModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Delete this Member?"
      text="This permanently deletes the Member and all their Payments. Revenue totals will change."
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onClose}
      loading={loading}
      confirmDisabled={disabled}
    />
  )
}

