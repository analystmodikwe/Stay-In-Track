/**
 * Auth operations (PRD Section 5)
 * OP1: sign up  OP3: log in  OP4: log out  OP5: resend email
 * OP6: send password reset  OP7: update password  OP8: delete account
 */
import { supabase } from '../supabase'

export type AuthResult = { error: { message: string; code?: string } | null }

/** OP1 — Sign up as Admin or Member */
export async function signUp(params: {
  email: string
  password: string
  fullName: string
  role: 'admin' | 'member'
  gymName?: string
  is18OrOlder?: boolean
}): Promise<AuthResult> {
  if (params.role === 'member') {
    const { data: canSignUp, error: rpcError } = await supabase.rpc('can_sign_up_as_member', {
      email: params.email.trim().toLowerCase(),
    })
    if (rpcError || !canSignUp) {
      return {
        error: {
          message: "We can't find this email at any gym. Ask your gym Admin to add you first.",
          code: 'member_not_found',
        },
      }
    }
  }

  const { error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        role: params.role,
        gym_name: params.gymName ?? '',
        is_18_or_older: params.is18OrOlder ?? true,
      },
    },
  })
  return { error: error ? { message: error.message, code: error.code } : null }
}

/** OP3 — Log in */
export async function logIn(params: {
  email: string
  password: string
}): Promise<{ error: { message: string; code?: string } | null; data: { session: unknown; user: unknown } | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  })

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    }
  }

  // Member removed check (OP3 / Section 11)
  const user = data.user
  if (user?.user_metadata?.role === 'member') {
    const { data: memberRow } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!memberRow) {
      await supabase.auth.signOut()
      return {
        data: null,
        error: {
          message: 'Your membership record was removed. Please contact your gym.',
          code: 'member_removed',
        },
      }
    }
  }

  return {
    data: data as { session: unknown; user: unknown },
    error: null,
  }
}

/** OP4 — Log out */
export async function logOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut()
  return { error: error ? { message: error.message } : null }
}

/** OP5 — Resend verification email */
export async function resendEmail(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  return { error: error ? { message: error.message } : null }
}

/** OP6 — Send password reset link */
export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/forgot-password`,
  })
  return { error: error ? { message: error.message } : null }
}

/** OP7 — Update password (called after opening reset link) */
export async function updatePassword(password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password })
  return { error: error ? { message: error.message } : null }
}

/** OP8 — Delete own account via DB function */
export async function deleteAccount(): Promise<AuthResult> {
  const { error } = await supabase.rpc('delete_my_account')
  if (error) return { error: { message: error.message } }
  // Sign out locally after deletion
  await supabase.auth.signOut()
  return { error: null }
}

