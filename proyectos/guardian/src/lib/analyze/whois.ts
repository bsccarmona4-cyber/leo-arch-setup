import type { WhoisInfo } from '@/types'

const WHOIS_API = 'https://whois.freewhoisxmlapi.com/api/v1'

export async function getWhois(domain: string): Promise<WhoisInfo | null> {
  const apiKey = process.env.WHOIS_API_KEY
  if (!apiKey) return fallbackWhois(domain)

  try {
    const res = await fetch(`${WHOIS_API}?domain=${domain}&apiKey=${apiKey}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return fallbackWhois(domain)

    const data = await res.json()
    const created = data?.createdDate || data?.creationDate || null
    return {
      domain,
      creationDate: created,
      daysOld: created ? daysSince(created) : null,
      registrar: data?.registrarName || null,
    }
  } catch {
    return fallbackWhois(domain)
  }
}

function daysSince(dateStr: string): number | null {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return days >= 0 ? days : null
}

// Fallback: estimate from domain name patterns + DNS
async function fallbackWhois(domain: string): Promise<WhoisInfo | null> {
  try {
    // Try DNS SOA record for creation date hint
    const dnsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=SOA`, {
      signal: AbortSignal.timeout(3000),
    })
    const dnsData = await dnsRes.json()
    if (dnsData?.Answer?.[0]?.data) {
      const soa = dnsData.Answer[0].data
      const serialMatch = soa.match(/(\d{10})/)
      if (serialMatch) {
        const ts = parseInt(serialMatch[1]) * 1000
        if (!isNaN(ts)) {
          const d = new Date(ts)
          const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
          return {
            domain,
            creationDate: d.toISOString(),
            daysOld: days >= 0 ? days : null,
            registrar: null,
          }
        }
      }
    }
  } catch {}

  // Ultra fallback: check if domain resolves at all
  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, {
      signal: AbortSignal.timeout(3000),
    })
    const data = await res.json()
    if (data?.Answer?.length > 0) {
      return { domain, creationDate: null, daysOld: 365, registrar: null } // asumir establecido
    }
  } catch {}

  return null
}
