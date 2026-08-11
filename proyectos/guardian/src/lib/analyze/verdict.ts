import type { AnalysisResult, SignalResult } from '@/types'
import { MEXICAN_BRANDS } from './brands-mx'

type Verdict = 'safe' | 'suspicious' | 'fraud'

export function determineVerdict(
  score: number,
  signals: SignalResult[],
  llmExplanation?: string | null
): AnalysisResult {
  let verdict: Verdict
  let threatType: string | null = null
  let brandSpoofed: string | null = null

  // High score → fraud almost certain
  if (score >= 80) {
    verdict = 'fraud'
    threatType = 'phishing'
  } else if (score >= 50) {
    verdict = 'fraud'
    threatType = 'sospechoso_alto'
  } else if (score >= 25) {
    verdict = 'suspicious'
    threatType = 'sospechoso'
  } else {
    verdict = 'safe'
  }

  // Extract brand from signals
  const brandSignal = signals.find(s => s.name === 'brand_spoof' || s.name === 'brand_similar')
  if (brandSignal) {
    const brand = MEXICAN_BRANDS.find(b => brandSignal.detail.includes(b.name))
    if (brand) brandSpoofed = brand.name
  }

  // Find official phone
  let officialPhone: string | null = null
  if (brandSpoofed) {
    const brand = MEXICAN_BRANDS.find(b => b.name === brandSpoofed)
    officialPhone = brand?.phone ?? null
  }

  return {
    verdict,
    score,
    signals,
    threatType,
    brandSpoofed,
    llmExplanation: llmExplanation ?? null,
    officialPhone,
    urlFinal: null,
  }
}
