'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return }
    const timer = setTimeout(() => setStatus('success'), 1500)
    return () => clearTimeout(timer)
  }, [sessionId])

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-100 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-sky-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
        </div>
        <p className="text-gray-600 font-semibold">Confirmando tu suscripción...</p>
      </div>
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Algo salió mal</h1>
        <p className="text-sm text-gray-500 mb-6">No recibimos confirmación del pago. Si el cargo apareció, escríbenos a soporte@guardian.mx</p>
        <a href="/planes" className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white bg-gray-800 hover:bg-gray-700">Volver a planes</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">¡Suscripción activada!</h1>
        <p className="text-gray-500 mb-8">Gracias por proteger a tu familia con Guardián.</p>

        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-8 text-left space-y-4">
          <h2 className="font-bold text-gray-700">Próximos pasos:</h2>

          <div className="flex gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-xs font-bold shrink-0 mt-0.5">1</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">Recibirás un correo de bienvenida</p>
              <p className="text-xs text-gray-500">Te enviamos tu link exclusivo de WhatsApp y dirección de correo.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-xs font-bold shrink-0 mt-0.5">2</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">Guarda el contacto en el celular de tu familiar</p>
              <p className="text-xs text-gray-500">Agrega el número de Guardián a sus contactos de WhatsApp. Guía incluida.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-xs font-bold shrink-0 mt-0.5">3</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">Ellos reenvían, nosotros protegemos</p>
              <p className="text-xs text-gray-500">Cuando tengan duda, reenvían el link a Guardián. Nosotros respondemos al instante.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/dashboard" className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-md">
            Ir al Dashboard
          </a>
          <a href="/planes" className="px-6 py-3 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:border-gray-300">
            Configurar otro familiar
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          ¿Problemas? Escríbenos a soporte@guardian.mx — Respondemos en WhatsApp.
        </p>
      </div>
    </div>
  )
}
