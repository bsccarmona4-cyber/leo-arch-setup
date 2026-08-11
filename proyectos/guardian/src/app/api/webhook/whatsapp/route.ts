import { NextRequest } from 'next/server'
import { hashUser, jsonOk, jsonError, checkMethod, readBody, securityHeaders } from '@/lib/security'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

export async function GET(request: NextRequest) {
  const methodErr = checkMethod(request, ['GET'])
  if (methodErr) return methodErr

  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  if (!VERIFY_TOKEN) return jsonError('Not configured', 500)
  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    const headers = new Headers(securityHeaders())
    return new Response(challenge, { status: 200, headers })
  }
  return jsonError('Verification failed', 403)
}

export async function POST(request: NextRequest) {
  try {
    const methodErr = checkMethod(request, ['POST'])
    if (methodErr) return methodErr

    const raw = await readBody(request)
    if (!raw) return jsonError('Request too large', 413)

    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      return jsonError('Invalid JSON', 400)
    }

    const msg = (body as any)
    if (msg.event === 'messages.upsert' && msg.data) {
      const text = msg.data.message?.conversation || msg.data.message?.extendedTextMessage?.text || ''
      if (text) {
        const remoteJid = msg.data.key?.remoteJid
        if (remoteJid) {
          const userNumber = remoteJid.split('@')[0]
          const userHash = hashUser(userNumber, 'whatsapp')

          const urlRegex = /(https?:\/\/[^\s]+)/g
          const urls = text.match(urlRegex)
          if (urls) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
            const results: { url: string; response: string }[] = []
            for (const url of urls.slice(0, 3)) {
              if (baseUrl) {
                try {
                  const res = await fetch(`${baseUrl}/api/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: url, channel: 'whatsapp', userHash }),
                  })
                  const data = await res.json()
                  results.push({ url, response: data?.response || '⚠️ Error al analizar' })
                } catch {
                  results.push({ url, response: '⚠️ Error al analizar. Intenta más tarde.' })
                }
              }
            }
            if (results.length > 0) {
              const combined = results.map(r => r.response).join('\n\n---\n\n')
              await sendWhatsApp(remoteJid, combined)
            }
          }
        }
      }
    }
    return jsonOk({ ok: true })
  } catch (error) {
    console.error('[webhook/whatsapp]', error)
    return jsonOk({ ok: true })
  }
}

async function sendWhatsApp(to: string, text: string) {
  const openwaUrl = process.env.OPENWA_URL
  const apiKey = process.env.OPENWA_API_KEY
  if (!openwaUrl) return

  try {
    const chunks = text.match(/.{1,4000}/g) || [text]
    for (const chunk of chunks) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
      await fetch(`${openwaUrl}/api/messages/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ to, text: chunk }),
      })
    }
  } catch {
    console.error('[webhook/whatsapp] send failed')
  }
}
