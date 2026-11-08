import { describe, it, expect } from 'vitest'
import { tokens } from '../../src/theme/tokens'

describe('T-SETUP-1 Design tokens', () => {
  it('matches Section 7.1 tokens exactly', () => {
    expect(tokens.color.primary).toBe('#1F3A5F')
    expect(tokens.color.accent).toBe('#0F766E')
    expect(tokens.color.background).toBe('#F5F7FA')
    expect(tokens.color.surface).toBe('#FFFFFF')
    expect(tokens.color.text).toBe('#111827')
    expect(tokens.color.textSecondary).toBe('#4B5563')
    expect(tokens.color.border).toBe('#CBD5E1')
    expect(tokens.color.error).toBe('#C62828')
    expect(tokens.color.success).toBe('#2E7D32')
    expect(tokens.color.warning).toBe('#7A4B00')
    expect(tokens.color.badge.active.bg).toBe('#E3F4E6')
    expect(tokens.color.badge.active.text).toBe('#1B5E20')
    expect(tokens.color.badge.grace.bg).toBe('#FFF3CD')
    expect(tokens.color.badge.grace.text).toBe('#7A4B00')
    expect(tokens.color.badge.overdue.bg).toBe('#FBE3E3')
    expect(tokens.color.badge.overdue.text).toBe('#9B1C1C')
    expect(tokens.color.toast.bg).toBe('#111827')
    expect(tokens.color.toast.text).toBe('#FFFFFF')

    expect(tokens.font.family).toBe('Inter')
    expect(tokens.font.title.size).toBe('22px')
    expect(tokens.font.heading.size).toBe('18px')
    expect(tokens.font.body.size).toBe('16px')
    expect(tokens.font.small.size).toBe('13px')
    expect(tokens.font.stat.size).toBe('28px')

    expect(tokens.space[1]).toBe('8px')
    expect(tokens.space[2]).toBe('16px')
    expect(tokens.space[3]).toBe('24px')
    expect(tokens.space[4]).toBe('32px')
    expect(tokens.space.screen).toBe('16px')

    expect(tokens.radius.card).toBe('12px')
    expect(tokens.radius.input).toBe('8px')
    expect(tokens.radius.button).toBe('8px')
    expect(tokens.radius.badge).toBe('9999px')

    expect(tokens.shadow.card).toBe('0 1px 3px rgba(0,0,0,0.12)')
    expect(tokens.size.button).toBe('48px')
    expect(tokens.size.touchMin).toBe('44px')
    expect(tokens.focus.ring).toBe('2px solid #0F766E')
    expect(tokens.breakpoint.tablet).toBe('640px')
    expect(tokens.breakpoint.desktop).toBe('1024px')
    expect(tokens.layout.sideMenuWidth).toBe('240px')
    expect(tokens.layout.maxContent).toBe('1200px')
    expect(tokens.layout.modalWidth).toBe('480px')
  })
})

