'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { DonutChart, SparklineBars, ChannelBar, ServiceStatus, ProtectionCounter } from '@/components/DashboardCharts'
import type { DashboardStats } from '@/types'

// ── Types ────────────────────────────────────────────────────────────────────
interface LiveEntry {
  id: string
  url_original: string
  verdict: 'safe' | 'suspicious' | 'fraud'
  threat_type: string | null
  brand_spoofed: string | null
  channel: string | null
  score: number | null
  created_at: string
}

interface ExtendedStats extends DashboardStats {
  weekAnalyses: number
  channelDistribution: Record<string, number>
  hourlyBreakdown: { hour: number; total: number; fraud: number }[]
}

// ── Colour config ────────────────────────────────────────────────────────────
const VERDICT_META: Record<string, { label: string; bg: string; border: string; text: string; dot: string; emoji: string }> = {
  safe:        { label: 'Seguro',     bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400',  dot: 'bg-green-400',  emoji: '🟢' },
  suspicious:  { label: 'Sospechoso', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400', emoji: '🟡' },
  fraud:       { label: 'Fraude',     bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    dot: 'bg-red-400',    emoji: '🔴' },
}

const CHANNEL_META: Record<string, { emoji: string; label: string }> = {
  whatsapp: { emoji: '💬', label: 'WhatsApp' },
  email:    { emoji: '📧', label: 'Email' },
  web:      { emoji: '🌐', label: 'Web' },
}

// ── Supabase Realtime client (browser) ───────────────────────────────────────
let _sbClient: ReturnType<typeof createClient> | null = null

function getBrowserClient() {
  if (_sbClient) return _sbClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  _sbClient = createClient(url, key)
  return _sbClient
}

// ── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<ExtendedStats | null>(null)
  const [feed, setFeed] = useState<LiveEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [protectionCount, setProtectionCount] = useState(0)
  const [protectionAnimated, setProtectionAnimated] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const feedRef = useRef<LiveEntry[]>([])

  // Section visibility for staggered animations
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({})
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const setSectionRef = useCallback((key: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[key] = el
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const key = e.target.getAttribute('data-section')
            if (key) setSectionsVisible((prev) => ({ ...prev, [key]: true }))
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    )

    Object.values(sectionRefs.current).forEach((el) => { if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [stats]) // re-observe when stats load

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (res.ok) {
        const data: ExtendedStats = await res.json()
        setStats(data)
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30_000)
    return () => clearInterval(interval)
  }, [fetchStats])

  // Animate protection counter
  useEffect(() => {
    if (!stats || protectionAnimated) return
    setProtectionAnimated(true)
    const target = stats.weekAnalyses || stats.totalAnalyses
    const duration = 1800
    const steps = 50
    const increment = Math.max(Math.floor(target / steps), 1)
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setProtectionCount(target); clearInterval(timer) }
      else setProtectionCount(current)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [stats, protectionAnimated])

  // ── Realtime feed ────────────────────────────────────────────────────────
  useEffect(() => {
    let supabase: ReturnType<typeof createClient> | null = null
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null

    const addToFeed = (entry: LiveEntry) => {
      feedRef.current = [entry, ...feedRef.current].slice(0, 30)
      setFeed([...feedRef.current])
    }

    const fetchRecent = async () => {
      try {
        const sb = getBrowserClient()
        const { data } = await sb
          .from('analyses')
          .select('id, url_original, verdict, threat_type, brand_spoofed, created_at, channel, score')
          .order('created_at', { ascending: false })
          .limit(30)

        if (data) {
          const mapped = (data as unknown as LiveEntry[]).reverse()
          feedRef.current = mapped
          setFeed([...mapped])
        }
      } catch { /* silent */ }
    }

    try {
      supabase = getBrowserClient()
      channel = supabase
        .channel('dashboard-live')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'analyses' },
          (payload) => {
            const row = payload.new as unknown as LiveEntry
            if (row.id) addToFeed(row)
            setIsConnected(true)
            // Refresh stats on new analysis
            fetchStats()
          },
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            if (pollingRef.current) {
              clearInterval(pollingRef.current)
              pollingRef.current = null
            }
          } else {
            setIsConnected(false)
          }
        })

      setTimeout(() => {
        if (!feedRef.current.length) fetchRecent()
        if (!pollingRef.current) {
          pollingRef.current = setInterval(fetchRecent, 5_000)
        }
      }, 4_000)
    } catch {
      fetchRecent()
      pollingRef.current = setInterval(fetchRecent, 5_000)
    }

    return () => {
      if (channel) supabase?.removeChannel(channel)
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const secs = Math.floor(diff / 1000)
    if (secs < 60) return 'ahora'
    const mins = Math.floor(secs / 60)
    if (mins === 1) return 'hace 1 min'
    if (mins < 60) return `hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs === 1) return 'hace 1h'
    return `hace ${hrs}h`
  }

  const extractDomain = (url: string) => {
    try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname }
    catch { return url.slice(0, 40) }
  }

  // ── Computed ─────────────────────────────────────────────────────────────
  const fraudToday = stats?.todayAnalyses
    ? Math.round((stats.fraudPercentage / 100) * stats.todayAnalyses)
    : 0

  const donutSegments = [
    { value: feed.filter(f => f.verdict === 'fraud').length || fraudToday || 1, color: '#ef4444', label: 'Fraude' },
    { value: feed.filter(f => f.verdict === 'suspicious').length || 1, color: '#eab308', label: 'Sospechoso' },
    { value: feed.filter(f => f.verdict === 'safe').length || 2, color: '#22c55e', label: 'Seguro' },
  ]

  const services = [
    { name: 'API Análisis', status: 'online' as const, detail: '/api/analyze' },
    { name: 'WhatsApp Bot', status: (feed.some(f => f.channel === 'whatsapp') ? 'online' : 'offline') as 'online' | 'offline', detail: 'Baileys' },
    { name: 'Email Webhook', status: (feed.some(f => f.channel === 'email') ? 'online' : 'offline') as 'online' | 'offline', detail: 'Gmail Pub/Sub' },
    { name: 'Supabase Realtime', status: isConnected ? 'online' as const : 'degraded' as const },
  ]

  // ── KPI Cards ───────────────────────────────────────────────────────────
  const kpis = [
    {
      label: 'Total Análisis',
      value: stats?.totalAnalyses ?? 0,
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      accent: 'text-purple-400',
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/20',
      glow: 'purple',
    },
    {
      label: 'Hoy',
      value: stats?.todayAnalyses ?? 0,
      icon: (
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: 'text-cyan-400',
      bg: 'bg-cyan-500/5',
      border: 'border-cyan-500/20',
      glow: 'cyan',
    },
    {
      label: 'Fraudes',
      value: `${stats?.fraudPercentage ?? 0}%`,
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      accent: 'text-red-400',
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      glow: 'red',
    },
    {
      label: 'Esta semana',
      value: stats?.weekAnalyses ?? stats?.totalAnalyses ?? 0,
      icon: (
        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      accent: 'text-green-400',
      bg: 'bg-green-500/5',
      border: 'border-green-500/20',
      glow: 'green',
    },
  ]

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        ref={setSectionRef('header')}
        data-section="header"
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-700 ${
          sectionsVisible['header'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard{' '}
            <span className="gradient-text">
              Guardián
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoreo en tiempo real de amenazas digitales en México
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection badge */}
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full glass border-gray-800/50">
            <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-gray-500">{isConnected ? 'Tiempo real' : 'Conectando…'}</span>
          </div>
          {/* Last updated */}
          <span className="text-[10px] text-gray-600 tabular-nums">
            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ── Protection Counter (Pitch Number) ────────────────────────────── */}
      <div
        ref={setSectionRef('protection')}
        data-section="protection"
        className={`transition-all duration-700 delay-100 ${
          sectionsVisible['protection'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <ProtectionCounter
          count={protectionCount}
          label="personas protegidas esta semana"
        />
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div
        ref={setSectionRef('kpis')}
        data-section="kpis"
        className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 transition-all duration-700 delay-200 ${
          sectionsVisible['kpis'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`relative overflow-hidden rounded-2xl border ${kpi.border} ${kpi.bg} backdrop-blur-xl p-4 sm:p-5 group hover:scale-[1.02] transition-all duration-300`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 tracking-wide uppercase">{kpi.label}</p>
                <p className={`text-2xl sm:text-3xl font-bold mt-1.5 sm:mt-2 ${kpi.accent} tabular-nums`}>{kpi.value}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">{kpi.icon}</div>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${kpi.glow}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        ))}
      </div>

      {/* ── Row: Activity Chart + Donut + Services ────────────────────────── */}
      <div
        ref={setSectionRef('charts')}
        data-section="charts"
        className={`grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 transition-all duration-700 delay-300 ${
          sectionsVisible['charts'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Hourly activity — 5 cols */}
        <div className="lg:col-span-5 rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Actividad 24h
            </h2>
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">por hora</span>
          </div>

          <SparklineBars
            data={stats?.hourlyBreakdown ?? Array.from({ length: 24 }, (_, i) => ({ hour: i, total: 0, fraud: 0 }))}
            height={80}
          />

          {/* Hour labels */}
          <div className="flex justify-between mt-2 text-[9px] text-gray-600 tabular-nums">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Verdict donut — 3 cols */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-xl p-5 flex flex-col items-center justify-center">
          <h2 className="text-sm font-semibold text-white mb-4">Veredictos</h2>
          <DonutChart
            segments={donutSegments}
            size={130}
            strokeWidth={16}
            label={`${stats?.fraudPercentage ?? 0}%`}
            sublabel="fraude"
          />
          {/* Legend */}
          <div className="flex items-center gap-3 mt-4">
            {donutSegments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: seg.color }} />
                <span className="text-[10px] text-gray-500">{seg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services + Channel — 4 cols */}
        <div className="lg:col-span-4 space-y-4">
          {/* Channel distribution */}
          <div className="rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-sm">📡</span> Canales
            </h2>
            <ChannelBar distribution={stats?.channelDistribution ?? { whatsapp: 0, email: 0, web: 0 }} />
          </div>

          {/* Service status */}
          <div className="rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Servicios
            </h2>
            <ServiceStatus services={services} />
          </div>
        </div>
      </div>

      {/* ── Row: Threats + Brands ────────────────────────────────────────── */}
      <div
        ref={setSectionRef('threats')}
        data-section="threats"
        className={`grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 transition-all duration-700 delay-[400ms] ${
          sectionsVisible['threats'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Recent threats — 3 cols */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-white">Amenazas recientes (24h)</h2>
          </div>

          {stats?.recentThreats && stats.recentThreats.length > 0 ? (
            <div className="space-y-1.5">
              <div className="grid grid-cols-[1fr_80px_70px_70px] gap-2 text-[10px] text-gray-600 uppercase tracking-wider px-3 pb-2 border-b border-gray-800">
                <span>Dominio</span>
                <span>Tipo</span>
                <span>Canal</span>
                <span className="text-right">Hace</span>
              </div>
              {stats.recentThreats.slice(0, 12).map((threat: any, i: number) => {
                const meta = VERDICT_META[threat.verdict === 'fraud' ? 'fraud' : 'suspicious']
                const chMeta = CHANNEL_META[threat.channel] ?? CHANNEL_META.web
                return (
                  <div
                    key={i}
                    className={`grid grid-cols-[1fr_80px_70px_70px] gap-2 items-center text-sm rounded-lg px-3 py-2.5 ${meta.bg} ${meta.border} border hover:brightness-110 transition-all`}
                  >
                    <span className="text-gray-200 truncate font-mono text-xs">{extractDomain(threat.domain)}</span>
                    <span className={`text-xs font-medium ${meta.text}`}>
                      {threat.threatType?.replace(/_/g, ' ') || 'phishing'}
                    </span>
                    <span className="text-xs text-gray-400">{chMeta.emoji} {chMeta.label}</span>
                    <span className="text-right text-gray-500 text-xs">{timeAgo(threat.timestamp)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <svg className="w-10 h-10 mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <p className="text-sm">Sin amenazas en las últimas 24h</p>
              <p className="text-xs text-gray-700 mt-1">Los análisis maliciosos aparecerán aquí</p>
            </div>
          )}
        </div>

        {/* Top spoofed brands — 2 cols */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-sm">🏢</span>
            <h2 className="text-sm font-semibold text-white">Marcas más suplantadas</h2>
          </div>

          {stats?.topSpoofedBrands && stats.topSpoofedBrands.length > 0 ? (
            <div className="space-y-3">
              {(() => {
                const max = Math.max(...stats.topSpoofedBrands.map((b) => b.count), 1)
                return stats.topSpoofedBrands.slice(0, 8).map((brand, i) => {
                  const pct = (brand.count / max) * 100
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300 truncate">{brand.brand}</span>
                        <span className="text-purple-400 font-semibold tabular-nums">{brand.count}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <svg className="w-10 h-10 mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <p className="text-sm">Sin datos aún</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Live Feed ────────────────────────────────────────────────────── */}
      <div
        ref={setSectionRef('feed')}
        data-section="feed"
        className={`rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-xl p-5 transition-all duration-700 delay-500 ${
          sectionsVisible['feed'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${feed.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            <h2 className="text-sm font-semibold text-white">Feed en vivo</h2>
          </div>
          <span className="text-xs text-gray-600 tabular-nums">{feed.length} eventos</span>
        </div>

        {/* Empty state */}
        {feed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <svg className="w-10 h-10 mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <p className="text-sm mb-1">Esperando análisis entrantes…</p>
            <p className="text-xs text-gray-700">Los resultados aparecerán aquí automáticamente</p>
          </div>
        )}

        {/* Feed items */}
        {feed.length > 0 && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1fr_80px_80px_70px_60px] gap-2 text-[10px] text-gray-600 uppercase tracking-wider px-3 pb-2 border-b border-gray-800">
              <span>URL / Dominio</span>
              <span>Veredicto</span>
              <span>Marca</span>
              <span>Canal</span>
              <span className="text-right">Tiempo</span>
            </div>

            <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent space-y-1">
              {feed.map((entry) => {
                const meta = VERDICT_META[entry.verdict] ?? VERDICT_META.safe
                const chMeta = CHANNEL_META[entry.channel ?? 'web'] ?? CHANNEL_META.web
                return (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-[1fr_80px_80px_70px_60px] gap-2 items-center text-sm rounded-lg px-3 py-2.5 ${meta.bg} border ${meta.border} hover:brightness-110 transition-all`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`} />
                      <span className="text-gray-200 truncate font-mono text-xs">
                        {extractDomain(entry.url_original)}
                      </span>
                    </div>

                    <span className={`text-xs font-semibold ${meta.text}`}>
                      {meta.emoji} {meta.label}
                    </span>

                    <span className="text-xs text-gray-400 truncate">
                      {entry.brand_spoofed || '—'}
                    </span>

                    <span className="text-xs text-gray-400">
                      {chMeta.emoji}
                    </span>

                    <span className="text-right text-gray-500 text-xs">{timeAgo(entry.created_at)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="text-center py-4 text-[10px] text-gray-700">
        Guardián Anti-Fraude Digital — Protegiendo familias mexicanas 🇲🇽
      </div>
    </div>
  )
}
