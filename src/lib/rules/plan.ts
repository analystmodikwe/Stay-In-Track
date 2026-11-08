import { messages } from '../messages'

export function validatePlanName(name: string): string | null {
  if (!name || name.length < 2 || name.length > 30) {
    return messages.planNameError
  }
  return null
}

export function validatePlanPrice(price: number): string | null {
  if (isNaN(price) || price < 1.00 || price > 5000.00) {
    return messages.planPriceError
  }
  return null
}

export function validatePlanBenefits(benefits?: string | null): string | null {
  if (benefits && benefits.length > 300) {
    return messages.planBenefitsError
  }
  return null
}

export interface PlanValidationResult {
  isValid: boolean
  errors: {
    name?: string
    price?: string
    benefits?: string
  }
}

export function validatePlan(data: {
  name: string
  price: number
  benefits?: string | null
}): PlanValidationResult {
  const errors: PlanValidationResult['errors'] = {}

  const nameError = validatePlanName(data.name)
  if (nameError) errors.name = nameError

  const priceError = validatePlanPrice(data.price)
  if (priceError) errors.price = priceError

  const benefitsError = validatePlanBenefits(data.benefits)
  if (benefitsError) errors.benefits = benefitsError

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

