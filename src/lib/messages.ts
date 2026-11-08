/**
 * Every user-facing message from the PRD, in one place.
 * Rule: raw error codes never show (PRD 12.2). All messages are taken verbatim
 * from the PRD (Section 6.1 acceptance criteria, 6.2 edge cases, 12.2).
 */

export const messages = {
  // Generic errors (PRD 12.2)
  offline:        "You're offline. Changes will not be saved.",
  serverError:    'Something went wrong. Try again.',
  sessionExpired: 'Please log in again.',
  notAllowed:     "You can't do that.",

  // Auth messages (PRD Section 5, US1–US3)
  verifyEmail:    'Check your email and tap the link to verify your account.',
  emailExists:    'This email already has an account. Log in instead?',
  wrongPassword:  'Email or password is incorrect.',
  unverified:     'Please verify your email first.',
  tooManyAttempts:'Too many attempts. Try again in 15 minutes.',
  memberNotFound: "We can't find this email at any gym. Ask your gym Admin to add you first.",
  passwordRules:  'At least 8 characters, including a number.',
  passwordUpdated:'Password updated. Please log in.',
  resetLinkSent:  "If an account exists for this email, we've sent a reset link.",
  linkExpired:    'This link has expired. Request a new one.',
  memberRemoved:  'Your membership record was removed. Please contact your gym.',

  // Account (US4)
  accountDeleted: 'Account deleted',

  // Members (US5, US6, US11)
  memberAdded:        'Member added',
  memberUpdated:      'Member updated',
  memberDeleted:      'Member deleted',
  duplicateMember:    'A Member with this email already exists.',
  memberLimit:        'You have reached the limit of 500 Members.',
  emailLocked:        "Email can't be changed after the Member signs up.",
  noMembersFound:     'No Members found. Check the spelling or tap Add member.',
  emailNotFound:      'No Members found. Check the spelling or tap Add member.',

  // Plans (US7)
  planSaved:         'Plan saved',
  duplicatePlan:     'A Plan with this name already exists.',
  planPriceError:    'Price must be between R1.00 and R5,000.00.',
  planNameError:     'Enter a Plan name of 2 to 30 characters.',
  planBenefitsError: 'Benefits can be up to 300 characters.',

  // Payments (US8, US9)
  paymentRecorded: 'Payment recorded',
  paymentUndone:   'Payment undone',
  futureDateError: "Payment date can't be in the future.",
  amountError:     'Amount must be between R1.00 and R50,000.00.',
  monthsError:     'Choose the number of months.',
  methodError:     'Choose a payment method.',

  // Grace period (US10)
  graceSaved:    'Grace period saved',
  graceError:    'Enter a number from 0 to 14.',

  // Reminders (US14)
  remindersOn:   'Reminders turned on',
  remindersOff:  'Reminders turned off',
} as const

export type MessageKey = keyof typeof messages

