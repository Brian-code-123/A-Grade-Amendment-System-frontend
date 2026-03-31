const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`
}

function normalizeApiBaseUrl(raw) {
  const source = String(raw || '').trim()
  if (!source || source === '%') return ''

  // Guard malformed values like "https://hostVITE_API_BASE_URL=https://host".
  const cleaned = source.split(/VITE_API_BASE_URL=/i)[0].trim()
  if (!cleaned || !/^https?:\/\//i.test(cleaned)) return ''

  try {
    const parsed = new URL(cleaned)
    if (parsed.hostname.includes('vite_api_base_url')) return ''
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '')
  } catch {
    return ''
  }
}

function shouldForceSameOrigin() {
  if (typeof window === 'undefined') return false
  const host = window.location?.hostname || ''
  return host.endsWith('azurestaticapps.net')
}

const apiBaseUrl = shouldForceSameOrigin() ? '' : normalizeApiBaseUrl(rawApiBaseUrl)

export function buildApiUrl(path) {
  const normalizedPath = normalizePath(path)
  if (!apiBaseUrl) {
    return normalizedPath
  }
  return `${apiBaseUrl}${normalizedPath}`
}

export async function apiFetch(path, options) {
  const normalizedPath = normalizePath(path)
  const targetUrl = buildApiUrl(normalizedPath)

  try {
    return await fetch(targetUrl, options)
  } catch (primaryError) {
    if (!apiBaseUrl || targetUrl === normalizedPath) {
      throw primaryError
    }

    // Fallback to same-origin API when configured host is unreachable.
    return fetch(normalizedPath, options)
  }
}
