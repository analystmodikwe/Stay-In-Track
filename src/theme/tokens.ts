/**
 * Design tokens for STAY IN TRACK.
 * Section 7.1 of IMPLEMENTATION_PLAN.md.
 * PRD 9.1 wins where it differs from the Stitch style guide (Section 18, #3).
 * tailwind.config.ts reads this file — never hard-code colours, sizes or spacing.
 */
export const tokens = {
  color: {
    primary: '#1F3A5F',           // navy — PRD 9.1
    accent: '#0F766E',            // teal — links, toggles, filter chips, focus ring
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#111827',              // main text — PRD 9.1
    textSecondary: '#4B5563',     // PRD 9.1
    border: '#CBD5E1',            // style guide 2.2 (PRD 9.1 gives no border colour)
    error: '#C62828',
    success: '#2E7D32',
    warning: '#7A4B00',           // PRD 9.1
    badge: {
      active: { bg: '#E3F4E6', text: '#1B5E20' },
      grace:  { bg: '#FFF3CD', text: '#7A4B00' },
      overdue:{ bg: '#FBE3E3', text: '#9B1C1C' },
    },
    toast: { bg: '#111827', text: '#FFFFFF' },
  },
  font: {
    family: 'Inter',
    title:   { size: '22px', weight: '700' },
    heading: { size: '18px', weight: '600' },
    body:    { size: '16px', weight: '400' },
    small:   { size: '13px', weight: '400' }, // never below 12px — PRD 9.4
    stat:    { size: '28px', weight: '700' },
  },
  space: {
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    screen: '16px',  // side margin
  },
  radius: {
    card:   '12px',
    input:  '8px',
    button: '8px',
    badge:  '9999px',  // full — pill shape
  },
  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.12)', // on cards only
  },
  size: {
    button:   '48px',  // PRD 9.1
    touchMin: '44px',  // PRD 9.4
  },
  focus: {
    ring: '2px solid #0F766E',  // teal — PRD 9.3
  },
  breakpoint: {
    tablet:  '640px',
    desktop: '1024px',
  },
  layout: {
    sideMenuWidth: '240px',
    maxContent:    '1200px',
    modalWidth:    '480px',
  },
} as const

export type Tokens = typeof tokens

