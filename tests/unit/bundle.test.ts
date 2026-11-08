import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { PAGE_SIZE as MEMBER_PAGE_SIZE } from '../../src/lib/api/members'

describe('Bundle & Asset Rules (T-NFR-5)', () => {
  it('ensures no images (jpg/png) or videos (mp4/webm) are in src/ or public/', () => {
    const scanDir = (dir: string): string[] => {
      const results: string[] = []
      if (!fs.existsSync(dir)) return results
      const list = fs.readdirSync(dir)
      for (const file of list) {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)
        if (stat && stat.isDirectory()) {
          results.push(...scanDir(fullPath))
        } else {
          const ext = path.extname(file).toLowerCase()
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.avi'].includes(ext)) {
            results.push(fullPath)
          }
        }
      }
      return results
    }

    const srcImages = scanDir(path.resolve(process.cwd(), 'src'))
    const publicImages = scanDir(path.resolve(process.cwd(), 'public'))
    expect(srcImages).toEqual([])
    expect(publicImages).toEqual([])
  })

  it('verifies lists load at most 20 items at a time', () => {
    expect(MEMBER_PAGE_SIZE).toBe(20)
  })

  it('verifies that if dist/ exists, the initial entry JS gzip size is < 300 KB', () => {
    const distAssetsDir = path.resolve(process.cwd(), 'dist', 'assets')
    if (fs.existsSync(distAssetsDir)) {
      const files = fs.readdirSync(distAssetsDir)
      const jsFiles = files.filter(f => f.endsWith('.js'))
      expect(jsFiles.length).toBeGreaterThan(0)
      for (const jsFile of jsFiles) {
        const content = fs.readFileSync(path.join(distAssetsDir, jsFile))
        const gzipped = zlib.gzipSync(content)
        const sizeKb = gzipped.length / 1024
        // Every JS bundle chunk should be well under 300 KB compressed
        expect(sizeKb).toBeLessThan(300)
      }
    }
  })
})

