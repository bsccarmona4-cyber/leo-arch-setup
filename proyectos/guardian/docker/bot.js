import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import qrcode from 'qrcode-terminal'

const ANALYZE_URL = process.env.ANALYZE_URL || 'http://localhost:3000/api/analyze'
const SESSION_DIR = './session'

const OFFICIAL_PHONES = {
  'BBVA': '800-226-2663',
  'Banamex': '800-226-2638',
  'Walmart': '800-710-4545',
  'Liverpool': '800-718-8888',
  'SAT': 'sat.gob.mx',
  'IMSS': '800-623-2323',
}

const WELCOME_MSG = `🛡️ *Guardián Anti-Fraude*

¡Hola! Soy Guardián, tu asistente para detectar fraudes digitales.

*¿Cómo me usas?*
1️⃣ Compárteme cualquier *link sospechoso*
2️⃣ Yo lo analizo en segundos
3️⃣ Te digo si es seguro ✅, sospechoso ⚠️ o estafa 🚫

📌 *Solo compárteme el link y yo me encargo.*`

const HELP_MSG = `🛡️ *Guardián — Ayuda*

Para usar Guardián, envíame un link (URL) y lo analizaré al instante.

📞 Si ya diste tus datos, llama a tu banco inmediatamente.`

const NO_URL_MSG = `🤔 No detecté ningún link en tu mensaje.

Para que te pueda ayudar, *compárteme el link sospechoso* copiándolo y pegándolo aquí.`

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000),
      })
      return res
    } catch (err) {
      console.error(`[retry ${i + 1}/${retries}]`, err.message)
      if (i < retries - 1) await new Promise(r => setTimeout(r, 2000 * (i + 1)))
    }
  }
  return null
}

const seenUsers = new Set()

function printQR(qrData) {
  console.log('\n📱 ═══════════════════════════════════════')
  console.log('   ESCANEA ESTE QR CON WHATSAPP')
  console.log('═══════════════════════════════════════════\n')
  
  // Imprimir en terminal
  qrcode.generate(qrData, { small: true })

  const QR_OUTPUT = path.join(SESSION_DIR, 'qr.html')
  const QR_TXT = path.join(SESSION_DIR, 'qrcode.txt')
  const QR_PNG = path.join(SESSION_DIR, 'qr.png')

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}`

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Guardián WhatsApp QR</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    body { background: #111; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; }
    #qrcode { background: white; padding: 24px; border-radius: 12px; margin-top: 20px; }
    p { color: #888; margin-top: 20px; }
  </style>
</head>
<body>
  <h2>🛡️ Guardián — Escanea para conectar</h2>
  <div id="qrcode"></div>
  <p>Abre WhatsApp > Dispositivos vinculados > Vincular un dispositivo</p>
  <script>
    new QRCode(document.getElementById("qrcode"), {
      text: ${JSON.stringify(qrData)},
      width: 300,
      height: 300,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.M
    });
  </script>
</body>
</html>`

  try {
    fs.writeFileSync(QR_OUTPUT, html)
    fs.writeFileSync(QR_TXT, qrUrl)
    console.log(`\n💾 ¿No puedes escanear la terminal? Abre este archivo en tu navegador:`)
    console.log(`➡️  docker/session/qr.html\n`)
  } catch (e) {
    console.error('Error writing QR text/html files:', e.message)
  }

  // Descargar y guardar la imagen PNG
  fetch(qrUrl)
    .then(res => res.arrayBuffer())
    .then(buffer => {
      try {
        fs.writeFileSync(QR_PNG, Buffer.from(buffer))
        console.log(`💾 Imagen QR guardada en: ${QR_PNG}\n`)
      } catch (e) {
        console.error('Error writing QR PNG file:', e.message)
      }
    })
    .catch(err => {
      console.error('Error fetching QR image:', err.message)
    })
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()

  console.log(`🔧 Baileys v${version.join('.')}`)

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['Guardián', 'Chrome', '1.0'],
    syncFullHistory: false,
    markOnlineOnConnect: false,
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr) {
      printQR(qr)
    }

    if (connection === 'open') {
      console.log('✅ Guardián conectado a WhatsApp')
      console.log(`🔗 API: ${ANALYZE_URL}`)
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('❌ Conexión cerrada, reconectando:', shouldReconnect)
      if (shouldReconnect) setTimeout(() => startBot(), 5000)
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.key?.remoteJid || msg.key?.fromMe) continue
      if (msg.key.remoteJid.endsWith('@g.us')) continue

      const text = msg.message?.conversation
        || msg.message?.extendedTextMessage?.text
        || ''
      if (!text) continue

      const userJid = msg.key.remoteJid
      const userNumber = userJid.split('@')[0]

      console.log(`📩 [${userNumber}] ${text.slice(0, 80)}`)

      const lowerText = text.toLowerCase().trim()
      if (['hola', 'hi', 'hello', 'help', 'ayuda', 'inicio', 'menu', 'menú', '?'].includes(lowerText)) {
        await sock.sendMessage(userJid, {
          text: seenUsers.has(userNumber) ? HELP_MSG : (seenUsers.add(userNumber), WELCOME_MSG)
        })
        continue
      }

      const urlRegex = /(https?:\/\/[^\s]+)/g
      const urls = text.match(urlRegex)

      if (!urls) {
        seenUsers.add(userNumber)
        await sock.sendMessage(userJid, { text: seenUsers.has(userNumber) ? NO_URL_MSG : (seenUsers.add(userNumber), WELCOME_MSG) })
        continue
      }

      seenUsers.add(userNumber)
      await sock.sendMessage(userJid, { text: '🔍 Analizando...' })

      const userHash = `wa:${userNumber}`

      for (const url of urls.slice(0, 3)) {
        try {
          const res = await fetchWithRetry(ANALYZE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: url, channel: 'whatsapp', userHash }),
          })

          if (!res) {
            await sock.sendMessage(userJid, {
              text: '⚠️ No pude conectarme al servicio. Intenta más tarde.\n\n📞 Si sospechas, llama a tu banco.',
            })
            continue
          }

          const data = await res.json()
          const response = data?.response || '⚠️ Error al analizar. Intenta de nuevo.'

          const formatted = response
            .replace(/^(🔴 ESTAFA DETECTADA)/m, '*$1*')
            .replace(/^(🟡 SITIO SOSPECHOSO)/m, '*$1*')
            .replace(/^(🟢 SITIO SEGURO)/m, '*$1*')

          if (formatted.length > 4000) {
            for (const part of formatted.match(/.{1,4000}/gs) || []) {
              await sock.sendMessage(userJid, { text: part })
            }
          } else {
            await sock.sendMessage(userJid, { text: formatted })
          }

          console.log(`✅ [${userNumber}] Análisis enviado: ${data?.verdict || 'unknown'}`)

        } catch (err) {
          console.error(`❌ [${userNumber}] Error:`, err.message)
          await sock.sendMessage(userJid, {
            text: '⚠️ Error al analizar. Servicio no disponible.\n\n📞 Llama a tu banco:\n' +
              Object.entries(OFFICIAL_PHONES).map(([b, p]) => `• ${b}: ${p}`).join('\n'),
          })
        }
      }
    }
  })
}

console.log('🛡️ Guardián WhatsApp Bot iniciando...')
console.log(`📡 API URL: ${ANALYZE_URL}`)
startBot().catch(err => {
  console.error('💥 Error fatal:', err)
  process.exit(1)
})
