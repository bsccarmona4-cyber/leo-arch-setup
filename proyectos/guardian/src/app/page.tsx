'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ───────────── Types ───────────── */
type Verdict = 'SEGURO' | 'SOSPECHOSO' | 'ESTAFA'

interface AnalyzeResponse {
  verdict: Verdict
  score: number
  response: string
  explanation?: string
  tips?: string[]
  threatType?: string
  brandTargeted?: string | null
}

interface StepCard {
  icon: string
  title: string
  desc: string
}

/* ───────────── Config ───────────── */
const VERDICT_STYLES: Record<Verdict, { emoji: string; color: string; bg: string; border: string; ring: string; label: string; gradient: string }> = {
  SEGURO: {
    emoji: '🟢',
    label: 'SEGURO',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    ring: 'ring-green-500/20',
    gradient: 'from-green-500/20 to-emerald-600/10',
  },
  SOSPECHOSO: {
    emoji: '🟡',
    label: 'SOSPECHOSO',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    ring: 'ring-yellow-500/20',
    gradient: 'from-yellow-500/20 to-amber-600/10',
  },
  ESTAFA: {
    emoji: '🔴',
    label: 'ESTAFA',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    ring: 'ring-red-500/20',
    gradient: 'from-red-500/20 to-rose-600/10',
  },
}

/* ───────────── Page ───────────── */
export default function LandingPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [stats, setStats] = useState<number | null>(null)

  // Intersection observers
  const heroRef = useRef<HTMLDivElement>(null)
  const howRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [heroVisible, setHeroVisible] = useState(false)
  const [howVisible, setHowVisible] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [statsCount, setStatsCount] = useState(0)
  const [statsAnimated, setStatsAnimated] = useState(false)

  useEffect(() => {
    const opts = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    const obs1 = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHeroVisible(true); obs1.disconnect() } }, opts)
    const obs2 = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHowVisible(true); obs2.disconnect() } }, opts)
    const obs3 = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs3.disconnect() } }, opts)
    if (heroRef.current) obs1.observe(heroRef.current)
    if (howRef.current) obs2.observe(howRef.current)
    if (statsRef.current) obs3.observe(statsRef.current)
    return () => { obs1.disconnect(); obs2.disconnect(); obs3.disconnect() }
  }, [])

  // Fetch stats from Supabase
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/stats', { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          setStats(data.totalAnalyses ?? null)
        }
      } catch {}
    })()
  }, [])

  // Animate counter
  useEffect(() => {
    if (!statsVisible || statsAnimated || stats === null) return
    setStatsAnimated(true)
    const target = stats
    const duration = 2000
    const steps = 40
    const increment = Math.floor(target / steps)
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setStatsCount(target); clearInterval(timer) }
      else setStatsCount(current)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [statsVisible, statsAnimated, stats])

  const handleAnalyze = useCallback(async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    setResult(null)
    setShowResult(false)

    try {
      const userHash = `web-${Math.random().toString(36).slice(2, 10)}`
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed, channel: 'web', userHash }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Error ${res.status}`)
      }

      const data = await res.json()
      setResult(data)
      setShowResult(true)

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al analizar')
    } finally {
      setLoading(false)
    }
  }, [url])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze()
  }

  const resetAnalyzer = () => {
    setUrl('')
    setResult(null)
    setShowResult(false)
    setError('')
  }

  /* ───────────── Render ───────────── */
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ═══════ HERO ═══════ */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center min-h-[92vh] px-4 sm:px-6 pt-20 pb-12 overflow-hidden"
      >
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse-glow" />
          <div className="absolute bottom-1/3 left-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-cyan-600/8 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/3 right-1/4 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-purple-500/6 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
        </div>

        <div
          className={`relative z-10 flex flex-col items-center text-center max-w-3xl w-full transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Shield icon animated */}
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-5 sm:mb-6 rounded-2xl bg-gradient-to-br from-purple-600/30 to-cyan-600/30 border border-purple-500/20 shadow-lg shadow-purple-500/10 animate-float">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" strokeWidth="2.5" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
            <span className="text-white">🛡️ Guardián</span>
            <br />
            <span className="gradient-text">Anti-Fraude Digital</span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed px-2">
            Protegé a tu familia de fraudes digitales en <strong className="text-gray-300">México</strong>.
            Analizá links sospechosos al instante con IA.
          </p>

          {/* ═══ Input + Button ═══ */}
          <div className="mt-8 sm:mt-10 w-full max-w-xl px-1">
            <div className="relative group">
              {/* Glow border on focus */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/40 via-cyan-600/40 to-purple-600/40 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-80 transition-opacity duration-500" />
              <div className="relative flex items-center gap-2 glass rounded-2xl p-1.5 sm:p-2 border border-purple-500/20 group-focus-within:border-purple-500/40 transition-all duration-300">
                {/* Link icon */}
                <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 ml-0.5 sm:ml-1 rounded-xl bg-purple-500/10 shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>

                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pegá el link sospechoso aquí..."
                  className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder-gray-500 py-2.5 px-1 min-w-0"
                  disabled={loading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !url.trim()}
                  className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 shrink-0 shadow-lg shadow-purple-600/20"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <span className="hidden sm:inline">Analizando</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="hidden sm:inline">Analizar</span>
                      <span className="sm:hidden">Ir</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-gray-500 max-w-xl">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Análisis en segundos
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-cyan-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacidad total
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              DeepSeek AI
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 animate-float">
          <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-medium">Deslizá</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </section>

      {/* ═══════ STATS COUNTER ═══════ */}
      {stats !== null && (
        <section ref={statsRef} className="relative py-10 sm:py-14 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div
              className={`transition-all duration-800 ${
                statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <div className="inline-flex items-center gap-3 px-5 sm:px-7 py-3 sm:py-4 rounded-2xl glass border border-purple-500/15 glow-purple">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-sm sm:text-base text-gray-400">Más de</span>
                <span className="text-2xl sm:text-4xl font-extrabold gradient-text tabular-nums">
                  {statsCount.toLocaleString('es-MX')}
                </span>
                <span className="text-sm sm:text-base text-gray-400">análisis realizados</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ RESULT CARD ═══════ */}
      {showResult && result && (
        <section
          ref={resultRef}
          className="relative py-12 sm:py-16 px-4 sm:px-6 scroll-mt-24"
        >
          {/* Bg glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-purple-600/8 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/3 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-cyan-600/8 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Verdict badge */}
            <div className="text-center mb-6 sm:mb-8 animate-count-up">
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base font-bold tracking-widest rounded-full ${VERDICT_STYLES[result.verdict].bg} ${VERDICT_STYLES[result.verdict].color} ${VERDICT_STYLES[result.verdict].border} ring-1 ${VERDICT_STYLES[result.verdict].ring}`}
              >
                {VERDICT_STYLES[result.verdict].emoji}
                {VERDICT_STYLES[result.verdict].label}
              </span>
            </div>

            {/* Main card */}
            <div
              className={`glass rounded-2xl p-5 sm:p-8 border ${VERDICT_STYLES[result.verdict].border} bg-gradient-to-br ${VERDICT_STYLES[result.verdict].gradient} transition-all duration-700 animate-count-up`}
            >
              {/* Score ring */}
              <div className="flex flex-col items-center mb-5 sm:mb-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2 sm:mb-3">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke={result.score > 70 ? '#ef4444' : result.score > 40 ? '#eab308' : '#22c55e'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - (result.score ?? 0) / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold ${VERDICT_STYLES[result.verdict].color}`}>
                    {result.score ?? '?'}%
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-[0.15em] font-medium">Riesgo estimado</p>
              </div>

              {/* URL analyzed */}
              {url && (
                <div className="mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl bg-gray-800/40 border border-gray-700/40">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Link analizado</p>
                  <p className="text-xs sm:text-sm text-gray-300 font-mono break-all leading-relaxed">{url}</p>
                </div>
              )}

              {/* Threat type & brand */}
              <div className="grid grid-cols-2 gap-3 mb-4 sm:mb-5">
                {result.threatType && (
                  <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Tipo de amenaza</p>
                    <p className="text-sm font-semibold text-red-300 capitalize">{result.threatType}</p>
                  </div>
                )}
                {result.brandTargeted && (
                  <div className="p-3 rounded-xl bg-purple-500/8 border border-purple-500/15">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Marca suplantada</p>
                    <p className="text-sm font-semibold text-purple-300">{result.brandTargeted}</p>
                  </div>
                )}
              </div>

              {/* LLM Explanation */}
              {result.response && (
                <div className="mb-4 sm:mb-5">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                    Análisis DeepSeek
                  </h4>
                  <div className="p-3 sm:p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                      {result.response}
                    </p>
                  </div>
                </div>
              )}

              {/* Tips */}
              {result.tips && result.tips.length > 0 && (
                <div>
                  <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    Consejos de seguridad
                  </h4>
                  <ul className="space-y-1.5">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-400">
                        <span className="text-yellow-500 mt-0.5 shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Analyze another */}
            <div className="mt-5 sm:mt-6 text-center">
              <button
                onClick={resetAnalyzer}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-gray-300 glass glass-hover border-gray-700/50 transition-all duration-300 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Analizar otro link
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ ERROR ═══════ */}
      {error && (
        <section className="py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-xl mx-auto animate-count-up">
            <div className="flex items-start gap-3 p-4 sm:p-5 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-lg sm:text-xl shrink-0 mt-0.5">⚠️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-300">Error al analizar</p>
                <p className="text-xs sm:text-sm text-red-200/70 mt-1">{error}</p>
                <button
                  onClick={resetAnalyzer}
                  className="mt-2 text-xs text-red-400 underline hover:text-red-300 transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
              <button
                onClick={resetAnalyzer}
                className="p-1 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                aria-label="Cerrar error"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ CÓMO FUNCIONA ═══════ */}
      <section
        id="como-funciona"
        ref={howRef}
        className="relative py-16 sm:py-20 px-4 sm:px-6"
      >
        {/* Bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-purple-600/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-cyan-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Section header */}
          <div
            className={`text-center mb-10 sm:mb-14 transition-all duration-700 ${
              howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] sm:text-xs font-medium tracking-wide text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full uppercase">
              • 3 pasos simples
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-bold text-white tracking-tight">
              ¿Cómo funciona?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-lg mx-auto leading-relaxed">
              Pegá el link, analizalo al instante con nuestra IA, y recibí un veredicto claro
              con recomendaciones accionables.
            </p>
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <StepCard
              icon="🔗"
              title="Pegá el link"
              desc="Copiá cualquier URL sospechosa de WhatsApp, correo, SMS o redes sociales. Pegala en el campo de búsqueda arriba."
              index={0}
              visible={howVisible}
            />
            <StepCard
              icon="🤖"
              title="Analizamos al instante"
              desc="DeepSeek analiza el dominio, certificados, reputación y patrones de phishing en milisegundos. Resultados en tiempo real."
              index={1}
              visible={howVisible}
            />
            <StepCard
              icon="🛡️"
              title="Recibí el veredicto"
              desc="Vas a ver si es SEGURO 🟢, SOSPECHOSO 🟡 o ESTAFA 🔴 con score de riesgo, explicación detallada y consejos de seguridad."
              index={2}
              visible={howVisible}
            />
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative border-t border-gray-800/50 py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 text-sm">
              🛡️
            </div>
            <span className="text-sm font-bold text-gray-300 tracking-tight">Guardián</span>
          </div>

          {/* Tagline */}
          <p className="text-[11px] sm:text-xs text-gray-600 text-center leading-relaxed max-w-xs">
            Anti-Fraude Digital — Protegiendo a familias mexicanas contra estafas y phishing.
          </p>

          {/* Links */}
          <div className="flex items-center gap-3 sm:gap-5">
            <a href="/dashboard" className="text-[11px] sm:text-xs text-gray-500 hover:text-gray-300 transition-colors font-medium">
              Dashboard
            </a>
            <span className="text-gray-700 select-none">|</span>
            <a href="/privacidad" className="text-[11px] sm:text-xs text-gray-500 hover:text-gray-300 transition-colors font-medium">
              Privacidad
            </a>
            <span className="text-gray-700 select-none">|</span>
            <a href="/terminos" className="text-[11px] sm:text-xs text-gray-500 hover:text-gray-300 transition-colors font-medium">
              Términos
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-gray-800/30 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] sm:text-[11px] text-gray-700">
            © {new Date().getFullYear()} Guardián. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-gray-700">
            <span>Hecho en 🇲🇽 México</span>
            <span className="hidden sm:inline">•</span>
            <span>Contacto: hola@guardian.mx</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ───────────── Sub-components ───────────── */
function StepCard({ icon, title, desc, index, visible }: { icon: string; title: string; desc: string; index: number; visible: boolean }) {
  return (
    <div
      className={`glass rounded-2xl p-5 sm:p-8 border-purple-500/10 transition-all duration-700 hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/5 group ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-5 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-purple-500/20 group-hover:border-purple-500/40 transition-all duration-300 text-xl sm:text-2xl">
        {icon}
      </div>

      {/* Number + Title */}
      <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
        <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500/15 text-[10px] sm:text-xs font-bold text-purple-300 shrink-0">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
      </div>

      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  )
}
