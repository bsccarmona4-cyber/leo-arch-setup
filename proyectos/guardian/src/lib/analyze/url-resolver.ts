import type { ResolvedUrl } from '@/types'

const MAX_REDIRECTS = 10
const TIMEOUT_MS = 5_000
const MAX_RESPONSE_SIZE = 500_000 // 500KB

export async function resolveUrl(url: string): Promise<ResolvedUrl> {
  const chain: string[] = [url]
  let current = url
  let redirectCount = 0

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    while (redirectCount < MAX_REDIRECTS) {
      const response = await fetch(current, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
        },
      })

      const location = response.headers.get('location')
      if (!location) break

      const resolved = new URL(location, current).href
      chain.push(resolved)
      current = resolved
      redirectCount++
    }
  } catch {
    // If HEAD fails, try GET
    try {
      const response = await fetch(current, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'manual',
      })
      const location = response.headers.get('location')
      if (location) {
        chain.push(new URL(location, current).href)
        redirectCount++
      }
    } catch {
      // Give up, use last known URL
    }
  } finally {
    clearTimeout(timeout)
  }

  return {
    original: url,
    final: chain[chain.length - 1],
    redirectCount,
    chain,
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function extractDomainName(hostname: string): string {
  const parts = hostname.split('.')
  if (parts.length < 2) return hostname

  // TLDs de segundo nivel comunes en México y globales
  const secondLevelTlds = new Set(['com', 'gob', 'org', 'net', 'edu', 'co', 'nom', 'org'])
  const len = parts.length

  // Si tiene al menos 3 partes, la penúltima es un TLD de segundo nivel y la última es un ccTLD de 2 letras (ej: .mx, .uk)
  if (len >= 3 && secondLevelTlds.has(parts[len - 2]) && parts[len - 1].length === 2) {
    return parts[len - 3] // Retorna "mgmotor" de "mgmotor.com.mx"
  }

  return parts[len - 2] // Retorna "walmart" de "walmart.com"
}

// Levenshtein distance for domain similarity detection
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }

  return dp[m][n]
}
