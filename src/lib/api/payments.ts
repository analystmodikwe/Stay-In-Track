/**
 * Payments API operations:
 * - OP17 Record Payment
 * - OP18 Undo Payment
 */
import { supabase } from '../supabase'
import { messages } from '../messages'

export interface RecordPaymentParams {
  memberId: string
  months: number
  amount: number
  method: string
  paymentDate: string
}

export async function recordPayment(params: RecordPaymentParams): Promise<{
  data: { payment_id: string } | null
  error: string | null
}> {
  try {
    const { data, error } = await supabase.rpc('record_payment', {
      p_member_id: params.memberId,
      p_months: params.months,
      p_amount: params.amount,
      p_method: params.method,
      p_payment_date: params.paymentDate,
    })

    if (error) {
      if (error.message.includes('payment_date_future') || error.message.includes('future')) {
        return { data: null, error: messages.futureDateError }
      }
      if (error.message.includes('check constraint') || error.message.includes('amount')) {
        return { data: null, error: messages.amountError }
      }
      return { data: null, error: messages.serverError }
    }

    return { data: { payment_id: data as string }, error: null }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

export async function undoPayment(paymentId: string): Promise<{
  data: null
  error: string | null
}> {
  try {
    const { error } = await supabase.rpc('undo_payment', {
      p_payment_id: paymentId,
    })

    if (error) {
      return { data: null, error: messages.serverError }
    }

    return { data: null, error: null }
  } catch {
    return { data: null, error: messages.serverError }
  }
}
