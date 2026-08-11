import { MEXICAN_BRANDS, URGENCY_KEYWORDS, SENSITIVE_DATA_KEYWORDS } from './brands-mx'
import { getDomain, extractDomainName, levenshteinDistance } from './url-resolver'
import { getWhois } from './whois'
import { checkPhishTank } from './phish-tank'
import type { SignalResult, ResolvedUrl } from '@/types'

const BRAND_SIMILARITY_THRESHOLD = 3

export async function scoreUrlSignals(
  resolved: ResolvedUrl,
  pageContent?: string
): Promise<SignalResult[]> {
  const signals: SignalResult[] = []
  const domain = getDomain(resolved.final)
  const domainName = extractDomainName(domain)

  // 0. PhishTank check (immediate if found)
  try {
    const pt = await checkPhishTank(resolved.final)
    if (pt?.inDatabase && pt?.valid) {
      signals.push({
        name: 'phishtank',
        score: 50,
        detail: `Dominio listado en PhishTank como phishing verificado`,
      })
    }
  } catch {}

  // 1. Redirect count
  if (resolved.redirectCount > 3) {
    signals.push({ name: 'redirect_excess', score: 25, detail: `${resolved.redirectCount} redirecciones` })
  } else if (resolved.redirectCount > 1) {
    signals.push({ name: 'redirect_multiple', score: 10, detail: `${resolved.redirectCount} redirecciones` })
  }

  // 2. WHOIS domain age
  try {
    const whois = await getWhois(domain)
    if (whois?.daysOld !== null && whois?.daysOld !== undefined && whois.daysOld >= 0) {
      if (whois.daysOld < 7) {
        signals.push({ name: 'domain_new', score: 50, detail: `Dominio creado hace ${whois.daysOld} días` })
      } else if (whois.daysOld < 30) {
        signals.push({ name: 'domain_recent', score: 35, detail: `Dominio creado hace ${whois.daysOld} días` })
      } else if (whois.daysOld < 90) {
        signals.push({ name: 'domain_young', score: 15, detail: `Dominio creado hace ${whois.daysOld} días` })
      }
    }
  } catch {}

  // 3. Brand spoofing via Levenshtein
  for (const brand of MEXICAN_BRANDS) {
    const brandName = brand.name.toLowerCase()
    const dist = levenshteinDistance(domainName.toLowerCase(), brandName)
    const containsBrand = domain.toLowerCase().includes(brandName)

    if (containsBrand && !brand.domains.some(d => domain.endsWith(d))) {
      signals.push({
        name: 'brand_spoof', score: 40,
        detail: `Suplanta a ${brand.name}: ${domain} (no es ${brand.domains[0]})`,
      })
      break
    }

    const maxAllowedDist = brandName.length <= 3 ? 1 : brandName.length <= 5 ? 2 : 3
    if (dist <= maxAllowedDist && dist > 0) {
      const isReal = brand.domains.some(d => domain === getDomain(d))
      if (!isReal) {
        signals.push({
          name: 'brand_similar', score: 35,
          detail: `Similar a ${brand.name}: ${domain} (distancia: ${dist})`,
        })
        break
      }
    }
  }

  // 4. SSL check
  if (!resolved.final.startsWith('https://')) {
    signals.push({ name: 'no_ssl', score: 20, detail: 'Sin HTTPS' })
  }

  // 5. Page content analysis
  if (pageContent) {
    const text = pageContent.toLowerCase()

    const sensitiveFound = SENSITIVE_DATA_KEYWORDS.filter(k => matchesKeyword(text, k))
    if (sensitiveFound.length > 0) {
      signals.push({
        name: 'sensitive_data_request', score: 45,
        detail: `Pide datos sensibles: ${sensitiveFound.join(', ')}`,
      })
    }

    const urgencyFound = URGENCY_KEYWORDS.filter(k => matchesKeyword(text, k))
    if (urgencyFound.length > 0) {
      signals.push({
        name: 'urgency_language', score: Math.min(urgencyFound.length * 5, 20),
        detail: `Urgencia: ${urgencyFound.slice(0, 3).join(', ')}`,
      })
    }

    const brandNames = MEXICAN_BRANDS.map(b => b.name.toLowerCase())
    const mentionedBrands = brandNames.filter(b => matchesKeyword(text, b))
    if (mentionedBrands.length > 0) {
      const brand = MEXICAN_BRANDS.find(b => mentionedBrands.includes(b.name.toLowerCase()))
      if (brand && !brand.domains.some(d => domain.endsWith(getDomain(d)))) {
        signals.push({
          name: 'brand_mismatch', score: 15,
          detail: `Menciona "${mentionedBrands[0]}" pero dominio no es oficial`,
        })
      }
    }
  }

  return deduplicateSignals(signals)
}

function matchesKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  // Asegurar límites de palabra incluyendo caracteres con acentos de español
  const pattern = new RegExp(
    `(?<![a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])${escaped}(?![a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])`,
    'i'
  )
  return pattern.test(text)
}

function deduplicateSignals(signals: SignalResult[]): SignalResult[] {
  const map = new Map<string, SignalResult>()
  for (const s of signals) {
    const existing = map.get(s.name)
    if (!existing || s.score > existing.score) map.set(s.name, s)
  }
  return Array.from(map.values())
}

export function calculateTotalScore(signals: SignalResult[]): number {
  return signals.reduce((sum, s) => sum + s.score, 0)
}
