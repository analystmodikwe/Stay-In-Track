import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('T-SETUP-3 Supabase local health check', () => {
  it('connects to the local Supabase backend', async () => {
    const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
    const client = createClient(url, key, {
      auth: { persistSession: false },
    })
    expect(client).toBeDefined()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)
      const res = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: key },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      expect(res.status).toBeDefined()
    } catch (err: unknown) {
      const error = err as Error
      // When local Supabase container is not running, this test fails for the expected reason
      throw new Error(`Local Supabase is not running at ${url}: ${error.message}`)
    }
  }, 5000)
})
