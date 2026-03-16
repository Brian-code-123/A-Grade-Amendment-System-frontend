const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '')

export function buildApiUrl(path) {
  if (!apiBaseUrl) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiBaseUrl}${normalizedPath}`
}

export function apiFetch(path, options) {
  return fetch(buildApiUrl(path), options)
}
