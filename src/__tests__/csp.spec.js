import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(__dirname, '../..')
const config = JSON.parse(readFileSync(resolve(root, 'staticwebapp.config.json'), 'utf8'))
const html = readFileSync(resolve(root, 'index.html'), 'utf8')

function inlineScripts() {
  return [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
}

describe('static web app CSP', () => {
  const csp = config.globalHeaders['Content-Security-Policy']
    || config.globalHeaders['Content-Security-Policy-Report-Only']

  it('defines a policy', () => {
    expect(csp).toBeTruthy()
  })

  it('allows every inline script in index.html by hash', () => {
    const scripts = inlineScripts()
    expect(scripts.length).toBeGreaterThan(0)
    for (const body of scripts) {
      const hash = createHash('sha256').update(body).digest('base64')
      expect(csp).toContain(`'sha256-${hash}'`)
    }
  })

  it('does not allow unsafe inline or eval scripts', () => {
    const scriptSrc = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('script-src'))
    expect(scriptSrc).not.toContain("'unsafe-inline'")
    expect(scriptSrc).not.toContain("'unsafe-eval'")
  })
})
