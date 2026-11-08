import { describe, it, expect } from 'vitest'
import { validatePlanName, validatePlanPrice, validatePlanBenefits, validatePlan } from '../../src/lib/rules/plan'
import { messages } from '../../src/lib/messages'

describe('Plan validation rules (T-BR1-3)', () => {
  it('T-BR1-3a validates plan name length 2-30 characters', () => {
    expect(validatePlanName('A')).toEqual(messages.planNameError)
    expect(validatePlanName('A'.repeat(31))).toEqual(messages.planNameError)
    expect(validatePlanName('')).toEqual(messages.planNameError)
    expect(validatePlanName('AB')).toBeNull()
    expect(validatePlanName('A'.repeat(30))).toBeNull()
    expect(validatePlanName('Standard')).toBeNull()
  })

  it('T-BR1-3b validates price between R1.00 and R5,000.00', () => {
    expect(validatePlanPrice(0.99)).toEqual(messages.planPriceError)
    expect(validatePlanPrice(0)).toEqual(messages.planPriceError)
    expect(validatePlanPrice(-10)).toEqual(messages.planPriceError)
    expect(validatePlanPrice(5000.01)).toEqual(messages.planPriceError)
    expect(validatePlanPrice(NaN)).toEqual(messages.planPriceError)

    expect(validatePlanPrice(1.00)).toBeNull()
    expect(validatePlanPrice(5000.00)).toBeNull()
    expect(validatePlanPrice(350)).toBeNull()
  })

  it('T-BR1-3c validates benefits length up to 300 characters', () => {
    expect(validatePlanBenefits('A'.repeat(301))).toEqual(messages.planBenefitsError)
    expect(validatePlanBenefits('A'.repeat(300))).toBeNull()
    expect(validatePlanBenefits('')).toBeNull()
    expect(validatePlanBenefits(null)).toBeNull()
    expect(validatePlanBenefits(undefined)).toBeNull()
  })

  it('T-BR1-3d validatePlan checks full object', () => {
    const invalid = validatePlan({
      name: 'A',
      price: 0,
      benefits: 'A'.repeat(301),
    })
    expect(invalid.isValid).toBe(false)
    expect(invalid.errors.name).toEqual(messages.planNameError)
    expect(invalid.errors.price).toEqual(messages.planPriceError)
    expect(invalid.errors.benefits).toEqual(messages.planBenefitsError)

    const valid = validatePlan({
      name: 'Standard',
      price: 350,
      benefits: 'Gym floor access',
    })
    expect(valid.isValid).toBe(true)
    expect(valid.errors).toEqual({})
  })
})

