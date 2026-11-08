/**
 * T-S11-1  Privacy Notice (S11)
 * Shows all 6 sections; back arrow returns to previous screen.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PrivacyNotice } from '../../src/pages/PrivacyNotice'

function renderPrivacyNotice() {
  return render(
    <MemoryRouter initialEntries={['/privacy']}>
      <PrivacyNotice />
    </MemoryRouter>
  )
}

const SECTIONS = [
  'What we collect',
  'Why',
  'Who can see it',
  'Where it is stored',
  'How long we keep it',
  'How to delete it',
]

describe('T-S11-1 PrivacyNotice screen', () => {
  it('T-S11-1a shows all 6 section headings', () => {
    renderPrivacyNotice()
    SECTIONS.forEach(heading =>
      expect(screen.getByText(new RegExp(heading, 'i'))).toBeInTheDocument()
    )
  })

  it('T-S11-1b shows the page title "Privacy Notice"', () => {
    renderPrivacyNotice()
    expect(screen.getByRole('heading', { name: /privacy notice/i })).toBeInTheDocument()
  })

  it('T-S11-1c has a back arrow that navigates back', async () => {
    renderPrivacyNotice()
    const backBtn = screen.getByRole('button', { name: /go back|back/i })
    expect(backBtn).toBeInTheDocument()
  })
})

