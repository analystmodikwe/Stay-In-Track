import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingPlaceholder } from '../../src/components/LoadingPlaceholder'

describe('T-C-7 LoadingPlaceholder component', () => {
  it('renders card shape', () => {
    render(<LoadingPlaceholder shape="card" count={3} />)
    const container = screen.getByLabelText('Loading…')
    expect(container).toBeInTheDocument()
    expect(container.children).toHaveLength(3)
  })

  it('renders row shape', () => {
    render(<LoadingPlaceholder shape="row" count={2} />)
    const container = screen.getByLabelText('Loading…')
    expect(container.children).toHaveLength(2)
  })

  it('renders block shape', () => {
    render(<LoadingPlaceholder shape="block" count={1} />)
    const container = screen.getByLabelText('Loading…')
    expect(container.children).toHaveLength(1)
  })
})

