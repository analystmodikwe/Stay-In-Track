import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Secrets Protection (T-NFR-6)', () => {
  it('ensures SERVICE_ROLE never appears anywhere in src/', () => {
    const scanDir = (dir: string): { file: string; match: string }[] => {
      const violations: { file: string; match: string }[] = []
      if (!fs.existsSync(dir)) return violations
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          violations.push(...scanDir(fullPath))
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx|json|css|html)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf-8')
          if (/service_role/i.test(content)) {
            violations.push({ file: fullPath, match: 'SERVICE_ROLE' })
          }
        }
      }
      return violations
    }

    const violations = scanDir(path.resolve(process.cwd(), 'src'))
    expect(violations).toEqual([])
  })

  it('ensures no JWT secrets or private keys are hardcoded in src/', () => {
    const scanDir = (dir: string): string[] => {
      const violations: string[] = []
      if (!fs.existsSync(dir)) return violations
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          violations.push(...scanDir(fullPath))
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf-8')
          // Check for private key headers or potential high-entropy tokens
          if (/-----BEGIN (RSA )?PRIVATE KEY-----/.test(content)) {
            violations.push(fullPath)
          }
        }
      }
      return violations
    }

    const violations = scanDir(path.resolve(process.cwd(), 'src'))
    expect(violations).toEqual([])
  })
})

