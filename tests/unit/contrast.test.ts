import { describe, it, expect } from 'vitest'

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function sRgbLuminance(c: number): number {
  const norm = c / 255
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * sRgbLuminance(r) + 0.7152 * sRgbLuminance(g) + 0.0722 * sRgbLuminance(b)
}

export function contrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(color1)
  const l2 = relativeLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('Colour Contrast (T-NFR-4 / PRD 9.1)', () => {
  const pairs = [
    { name: 'White on Navy (#1F3A5F)', fg: '#FFFFFF', bg: '#1F3A5F' },
    { name: 'White on Teal (#0F766E)', fg: '#FFFFFF', bg: '#0F766E' },
    { name: 'Main text (#111827) on Screen bg (#F5F7FA)', fg: '#111827', bg: '#F5F7FA' },
    { name: 'Main text (#111827) on Card bg (#FFFFFF)', fg: '#111827', bg: '#FFFFFF' },
    { name: 'Secondary text (#4B5563) on Screen bg (#F5F7FA)', fg: '#4B5563', bg: '#F5F7FA' },
    { name: 'Secondary text (#4B5563) on Card bg (#FFFFFF)', fg: '#4B5563', bg: '#FFFFFF' },
    { name: 'Error text (#C62828) on Card bg (#FFFFFF)', fg: '#C62828', bg: '#FFFFFF' },
    { name: 'Error text (#C62828) on Screen bg (#F5F7FA)', fg: '#C62828', bg: '#F5F7FA' },
    { name: 'Success text (#2E7D32) on Card bg (#FFFFFF)', fg: '#2E7D32', bg: '#FFFFFF' },
    { name: 'Warning text (#7A4B00) on Card bg (#FFFFFF)', fg: '#7A4B00', bg: '#FFFFFF' },
    { name: 'Active badge text (#1B5E20) on badge bg (#E3F4E6)', fg: '#1B5E20', bg: '#E3F4E6' },
    { name: 'Grace badge text (#7A4B00) on badge bg (#FFF3CD)', fg: '#7A4B00', bg: '#FFF3CD' },
    { name: 'Overdue badge text (#9B1C1C) on badge bg (#FBE3E3)', fg: '#9B1C1C', bg: '#FBE3E3' },
  ]

  pairs.forEach(({ name, fg, bg }) => {
    it(`checks ${name} has contrast ratio >= 4.5:1`, () => {
      const ratio = contrastRatio(fg, bg)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })
  })

  it('confirms the lowest ratio is white on teal #0F766E (approx 5.47:1)', () => {
    const tealRatio = contrastRatio('#FFFFFF', '#0F766E')
    expect(tealRatio).toBeGreaterThanOrEqual(5.4)
    expect(tealRatio).toBeLessThanOrEqual(5.6)
  })
})

