import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Guardián — Anti-Fraude Digital para Adultos Mayores',
  description:
    'Protección contra fraudes digitales para adultos mayores en México. Analiza links sospechosos y correos en segundos vía WhatsApp y Email.',
  openGraph: {
    title: 'Guardián — Anti-Fraude Digital',
    description: 'Protege a tu familia contra fraudes digitales.',
    type: 'website',
    locale: 'es_MX',
  },
}

// When configured, set your real WhatsApp number here
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5211111111111'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20Guardi%C3%A1n%2C%20quiero%20verificar%20un%20link`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isConfigured = WHATSAPP_NUMBER !== '5211111111111'

  return (
    <html lang="es" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen">
        {/* Fixed Nav */}
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-800/50">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 text-white text-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
                🛡️
              </span>
              <span className="text-lg font-bold tracking-tight text-white">Guardián</span>
            </a>

            {/* Nav Links */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <a
                href="/planes"
                className="px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/60 transition-all duration-200"
              >
                Planes
              </a>
              <a
                href="/dashboard"
                className="px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/60 transition-all duration-200"
              >
                Dashboard
              </a>
              <a
                href={isConfigured ? WHATSAPP_LINK : '#'}
                {...(isConfigured
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isConfigured
                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30'
                    : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-800'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
                </svg>
                {isConfigured ? 'Reportar en WhatsApp' : 'WhatsApp no configurado'}
              </a>
            </nav>
          </div>
        </header>

        {/* Main content — with top padding for fixed nav */}
        <main className="flex flex-col min-h-screen pt-16">{children}</main>

        {/* Simple footer only on landing */}
      </body>
    </html>
  )
}
