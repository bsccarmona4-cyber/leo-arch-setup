import type { AnalysisResult } from '@/types'
import { generateEmailResponse, generatePlainTextResponse } from './templates'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'

/**
 * Send auto-reply email with analysis results.
 * Uses Gmail API with OAuth2 access token.
 * Falls back gracefully if credentials are not configured.
 */
export async function sendEmailReply({
  to,
  subject,
  inReplyTo,
  analysis,
}: {
  to: string
  subject: string
  inReplyTo?: string
  analysis: AnalysisResult
}): Promise<boolean> {
  const accessToken = process.env.GMAIL_ACCESS_TOKEN
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const fromEmail = process.env.GUARDIAN_EMAIL || 'guardian@guardian.mx'

  // If no Gmail credentials, log and return gracefully
  if (!accessToken && !refreshToken) {
    console.log('[email] No Gmail credentials configured, skipping auto-reply')
    return false
  }

  try {
    // Refresh token if needed
    let token: string | undefined = accessToken
    if (!token && refreshToken && clientId && clientSecret) {
      token = (await refreshAccessToken(refreshToken, clientId, clientSecret)) ?? undefined
    }
    if (!token) {
      console.error('[email] Could not obtain access token')
      return false
    }

    // Generate email content
    const htmlBody = generateEmailResponse(analysis, subject)
    const textBody = generatePlainTextResponse(analysis)

    // Build MIME message
    const replySubject = subject.startsWith('Re:')
      ? subject
      : `Re: ${subject}`

    const boundary = `guardian_${Date.now()}`
    const mimeMessage = [
      `From: Guardián Anti-Fraude <${fromEmail}>`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(replySubject).toString('base64')}?=`,
      `MIME-Version: 1.0`,
      inReplyTo ? `In-Reply-To: ${inReplyTo}` : '',
      inReplyTo ? `References: ${inReplyTo}` : '',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(textBody).toString('base64'),
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(htmlBody).toString('base64'),
      '',
      `--${boundary}--`,
    ].filter(Boolean).join('\r\n')

    // Base64url encode for Gmail API
    const encodedMessage = Buffer.from(mimeMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // Send via Gmail API
    const res = await fetch(GMAIL_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[email] Gmail API error:', res.status, err)
      return false
    }

    console.log(`[email] Auto-reply sent to ${to}`)
    return true
  } catch (error) {
    console.error('[email] Send failed:', error)
    return false
  }
}

/**
 * Refresh Gmail OAuth2 access token
 */
async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(5_000),
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.access_token ?? null
  } catch {
    return null
  }
}
