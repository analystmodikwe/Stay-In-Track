import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmModal } from '../../src/components/ConfirmModal'

describe('T-C-8 ConfirmModal component', () => {
  it('calls onConfirm on danger button click, onCancel on Cancel or outside tap', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <ConfirmModal
        title="Delete account"
        text="Are you sure you want to delete your account?"
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete account')).toBeInTheDocument()

    // Confirm button
    const deleteBtn = screen.getByRole('button', { name: 'Delete' })
    await userEvent.click(deleteBtn)
    expect(onConfirm).toHaveBeenCalledTimes(1)

    // Cancel button
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelBtn)
    expect(onCancel).toHaveBeenCalledTimes(1)

    // Tap outside (on overlay)
    const overlay = screen.getByRole('dialog')
    await userEvent.click(overlay)
    expect(onCancel).toHaveBeenCalledTimes(2)
  })
})
