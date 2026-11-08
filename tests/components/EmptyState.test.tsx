import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from '../../src/components/EmptyState'
import { Users } from 'lucide-react'

describe('T-C-6 EmptyState component', () => {
  it('shows icon, text and optional action button that calls onAction', async () => {
    const onAction = vi.fn()
    const { rerender } = render(
      <EmptyState
        icon={Users}
        text="No Members yet. Add your first Member."
        actionLabel="Add member"
        onAction={onAction}
      />
    )

    expect(screen.getByText('No Members yet. Add your first Member.')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: 'Add member' })
    expect(btn).toBeInTheDocument()
    await userEvent.click(btn)
    expect(onAction).toHaveBeenCalledTimes(1)

    // Without action
    rerender(
      <EmptyState
        icon={Users}
        text="Nobody is overdue."
      />
    )
    expect(screen.getByText('Nobody is overdue.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

