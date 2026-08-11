'use client'

/* ── Donut Chart ─────────────────────────────────────────────────────────── */
export function DonutChart({
  segments,
  size = 140,
  strokeWidth = 18,
  label,
  sublabel,
}: {
  segments: { value: number; color: string; label: string }[]
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0
          const dashLen = pct * circumference
          const dashGap = circumference - dashLen
          const currentOffset = offset
          offset += dashLen

          return (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${dashGap}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          )
        })}
      </svg>
      {/* Center label */}
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{label}</span>
          {sublabel && <span className="text-[10px] text-gray-500 uppercase tracking-wider">{sublabel}</span>}
        </div>
      )}
    </div>
  )
}

/* ── Sparkline Bar Chart ─────────────────────────────────────────────────── */
export function SparklineBars({
  data,
  height = 60,
  barColor = 'from-purple-500 to-cyan-400',
  fraudColor = 'bg-red-400',
}: {
  data: { hour: number; total: number; fraud: number }[]
  height?: number
  barColor?: string
  fraudColor?: string
}) {
  const max = Math.max(...data.map(d => d.total), 1)

  return (
    <div className="flex items-end gap-[2px] w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = Math.max((d.total / max) * height, 2)
        const fraudH = d.fraud > 0 ? Math.max((d.fraud / max) * height, 2) : 0
        const isNow = new Date().getHours() === d.hour

        return (
          <div
            key={i}
            className="relative flex-1 flex flex-col justify-end group"
            style={{ height }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-[10px] text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {d.hour}:00 — {d.total} análisis
              {d.fraud > 0 && ` (${d.fraud} fraudes)`}
            </div>
            {/* Fraud portion */}
            {fraudH > 0 && (
              <div
                className={`w-full ${fraudColor} rounded-t-sm opacity-80`}
                style={{ height: fraudH }}
              />
            )}
            {/* Total bar */}
            <div
              className={`w-full bg-gradient-to-t ${barColor} rounded-t-sm transition-all duration-500 ${isNow ? 'opacity-100 ring-1 ring-cyan-400/30' : 'opacity-60 hover:opacity-90'}`}
              style={{ height: barH - fraudH }}
            />
          </div>
        )
      })}
    </div>
  )
}

/* ── Channel Pill ────────────────────────────────────────────────────────── */
const CHANNEL_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  whatsapp: { icon: '💬', label: 'WhatsApp', color: 'text-green-400', bg: 'bg-green-500/10' },
  email:    { icon: '📧', label: 'Email',    color: 'text-blue-400',  bg: 'bg-blue-500/10' },
  web:      { icon: '🌐', label: 'Web',      color: 'text-purple-400', bg: 'bg-purple-500/10' },
}

export function ChannelBar({
  distribution,
}: {
  distribution: Record<string, number>
}) {
  const total = Object.values(distribution).reduce((s, v) => s + v, 0)
  if (total === 0) {
    return (
      <div className="text-center text-sm text-gray-600 py-6">
        Sin datos de canales aún
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-800/60">
        {Object.entries(distribution).map(([ch, count]) => {
          const pct = (count / total) * 100
          if (pct === 0) return null
          const colors: Record<string, string> = {
            whatsapp: 'bg-green-500',
            email: 'bg-blue-500',
            web: 'bg-purple-500',
          }
          return (
            <div
              key={ch}
              className={`${colors[ch] ?? 'bg-gray-500'} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          )
        })}
      </div>
      {/* Labels */}
      <div className="flex items-center justify-between gap-2">
        {Object.entries(distribution).map(([ch, count]) => {
          const cfg = CHANNEL_CONFIG[ch]
          if (!cfg) return null
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={ch} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${cfg.bg}`}>
              <span className="text-sm">{cfg.icon}</span>
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
              <span className="text-xs text-gray-500 tabular-nums">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Service Status Indicator ────────────────────────────────────────────── */
export function ServiceStatus({
  services,
}: {
  services: { name: string; status: 'online' | 'offline' | 'degraded'; detail?: string }[]
}) {
  const statusConfig = {
    online:   { dot: 'bg-green-400', text: 'text-green-400', label: 'Activo', pulse: true },
    degraded: { dot: 'bg-yellow-400', text: 'text-yellow-400', label: 'Degradado', pulse: true },
    offline:  { dot: 'bg-red-400', text: 'text-red-400', label: 'Inactivo', pulse: false },
  }

  return (
    <div className="space-y-2">
      {services.map((svc) => {
        const cfg = statusConfig[svc.status]
        return (
          <div key={svc.name} className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-300">{svc.name}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
              <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Protection Counter (animated) ────────────────────────────────────────── */
export function ProtectionCounter({
  count,
  label = 'personas protegidas esta semana',
}: {
  count: number
  label?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/10 via-gray-900/80 to-cyan-600/10 backdrop-blur-xl p-6 sm:p-8 text-center group">
      {/* Animated glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-cyan-600/5 animate-pulse-glow pointer-events-none" />
      {/* Shine effect */}
      <div className="absolute inset-0 shimmer pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em]">Guardián protege</span>
        </div>
        <p className="text-4xl sm:text-5xl font-extrabold gradient-text tabular-nums mb-1">
          {count.toLocaleString('es-MX')}
        </p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  )
}
