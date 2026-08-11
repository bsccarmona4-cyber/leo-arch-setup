import { NextRequest } from 'next/server'
import { verifyHmac, hashUser, jsonOk, jsonError, checkMethod, readBody } from '@/lib/security'
import { sendEmailReply } from '@/lib/email/send-reply'
import type { AnalysisResult } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const methodErr = checkMethod(request, ['POST'])
    if (methodErr) return methodErr

    const secret = process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN
    if (!secret) return jsonError('Not configured', 500)

    // Google Pub/Sub sends either x-goog-signature or a bearer token
    const sig = request.headers.get('x-goog-signature')
    const authHeader = request.headers.get('authorization')

    const raw = await readBody(request)
    if (!raw) return jsonError('Request too large', 413)

    // Verify HMAC if signature present
    if (sig) {
      if (!verifyHmac(raw, sig, secret)) {
        return jsonError('Unauthorized', 401)
      }
    } else if (authHeader) {
      // Bearer token verification for Pub/Sub push
      const token = authHeader.replace('Bearer ', '')
      if (token !== secret) {
        return jsonError('Unauthorized', 401)
      }
    } else {
      return jsonError('Unauthorized', 401)
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return jsonError('Invalid JSON', 400)
    }

    const body = parsed as any
    const { message, subscription } = body

    // Pub/Sub ack — empty message with subscription
    if (!message?.data && subscription) return jsonOk({})
    if (!message?.data) return jsonError('Invalid format', 400)

    // Decode base64 Pub/Sub message
    const decoded = Buffer.from(message.data, 'base64').toString('utf-8')
    let emailData: unknown
    try {
      emailData = JSON.parse(decoded)
    } catch {
      return jsonError('Invalid email data', 400)
    }

    const email = emailData as any
    const content = email.emailBody ?? email.text ?? email.body ?? ''
    if (!content) return jsonOk({})

    const sender = email.from ?? email.sender ?? 'unknown'
    const subject = email.subject ?? 'Sin asunto'
    const messageId = email.messageId ?? email.message_id ?? null
    const userHash = hashUser(sender, 'email')

    // Extract links from email body for analysis
    const urlRegex = /(https?:\/\/[^\s<>"]+)/g
    const links = content.match(urlRegex) || []
    const fullContent = links.length > 0
      ? `Remitente: ${sender}\nAsunto: ${subject}\nLinks encontrados: ${links.join(', ')}\n\nCuerpo:\n${content}`
      : `Remitente: ${sender}\nAsunto: ${subject}\n\nCuerpo:\n${content}`

    // Call analyze API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (baseUrl) {
      try {
        const res = await fetch(`${baseUrl}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: fullContent.slice(0, 10_000),
            channel: 'email',
            userHash,
          }),
        })

        if (res.ok) {
          const data = await res.json()

          // Build analysis result for email template
          const analysis: AnalysisResult = {
            verdict: mapVerdict(data.verdict),
            score: data.score ?? 0,
            signals: [],
            threatType: data.threatType ?? null,
            brandSpoofed: data.brandTargeted ?? null,
            llmExplanation: data.response ?? null,
            officialPhone: null,
            urlFinal: null,
          }

          // Send auto-reply email
          await sendEmailReply({
            to: sender,
            subject: `Re: ${subject}`,
            inReplyTo: messageId,
            analysis,
          })
        }
      } catch (err) {
        console.error('[webhook/email] Analyze/reply failed:', err)
      }
    }

    return jsonOk({ processed: true })
  } catch (error) {
    console.error('[webhook/email]', error)
    return jsonError()
  }
}

export async function GET() {
  return jsonOk({ status: 'ok', service: 'guardian-email-webhook' })
}

function mapVerdict(v: string): 'safe' | 'suspicious' | 'fraud' {
  if (v === 'fraud' || v === 'ESTAFA' || v === 'FRAUDE') return 'fraud'
  if (v === 'suspicious' || v === 'SOSPECHOSO') return 'suspicious'
  return 'safe'
}
