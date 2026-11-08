import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Logging & Data Protection (T-NFR-7)', () => {
  it('ensures no code in src/ logs passwords, tokens, or emails', () => {
    const scanDir = (dir: string): { file: string; match: string }[] => {
      const violations: { file: string; match: string }[] = []
      if (!fs.existsSync(dir)) return violations
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          violations.push(...scanDir(fullPath))
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf-8')
          // Check for console calls that reference sensitive variables or words
          const consoleMatches = content.match(/console\.(log|info|warn|error|debug)\([^)]*\)/g)
          if (consoleMatches) {
            for (const match of consoleMatches) {
              if (/password|token|email|secret|credential/i.test(match)) {
                violations.push({ file: fullPath, match })
              }
            }
          }
        }
      }
      return violations
    }

    const violations = scanDir(path.resolve(process.cwd(), 'src'))
    expect(violations).toEqual([])
  })
})

