import { z } from 'zod'

// --- Analysis Pipeline Types ---

export const Verdict = z.enum(['safe', 'suspicious', 'fraud'])
export type Verdict = z.infer<typeof Verdict>

export const Channel = z.enum(['whatsapp', 'email'])
export type Channel = z.infer<typeof Channel>

export interface AnalysisRequest {
  content: string // URL or email body
  channel: Channel
  userHash: string
}

export interface SignalResult {
  name: string
  score: number
  detail: string
}

export interface AnalysisResult {
  verdict: Verdict
  score: number
  signals: SignalResult[]
  threatType: string | null
  brandSpoofed: string | null
  llmExplanation: string | null
  officialPhone: string | null
  urlFinal: string | null
}

// --- URL Resolution ---

export interface ResolvedUrl {
  original: string
  final: string
  redirectCount: number
  chain: string[]
}

// --- WHOIS ---

export interface WhoisInfo {
  domain: string
  creationDate: string | null
  daysOld: number | null
  registrar: string | null
}

// --- LLM ---

export interface LLMAnalysis {
  isFraud: boolean
  confidence: number
  threatType: string | null
  brandSpoofed: string | null
  explanation: string
  officialPhone: string | null
}

// --- Email ---

export interface ParsedEmail {
  from: string
  fromDomain: string
  subject: string
  body: string
  links: string[]
  replyTo: string | null
  authentication: {
    spf: boolean
    dkim: boolean
    dmarc: boolean
  }
}

// --- Dashboard ---

export interface DashboardStats {
  totalAnalyses: number
  todayAnalyses: number
  fraudPercentage: number
  topSpoofedBrands: { brand: string; count: number }[]
  recentThreats: { domain: string; threatType: string; timestamp: string }[]
  byState: { state: string; count: number }[]
}

// --- Webhook ---

export interface GmailWebhookPayload {
  message: {
    data: string // base64 encoded
    messageId: string
    publishTime: string
  }
  subscription: string
}
