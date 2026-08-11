import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/db/supabase'
import type { DashboardStats } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const db = getSupabaseAdmin()

  try {
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Parallel queries for performance
    const [
      totalRes,
      todayRes,
      fraudRes,
      weekRes,
      brandRes,
      recentRes,
      channelRes,
      hourlyRes,
    ] = await Promise.all([
      db.from('analyses').select('*', { count: 'exact', head: true }),
      db.from('analyses').select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
      db.from('analyses').select('*', { count: 'exact', head: true })
        .in('verdict', ['fraud', 'suspicious']),
      db.from('analyses').select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString()),
      db.from('analyses').select('brand_spoofed')
        .not('brand_spoofed', 'is', null),
      db.from('analyses').select('url_original, verdict, threat_type, brand_spoofed, created_at, channel, score')
        .in('verdict', ['fraud', 'suspicious'])
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false }).limit(20),
      // Channel distribution
      db.from('analyses').select('channel')
        .gte('created_at', weekAgo.toISOString()),
      // Hourly breakdown (last 24h)
      db.from('analyses').select('created_at, verdict')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: true }),
    ])

    const totalAnalyses = totalRes.count ?? 0
    const todayAnalyses = todayRes.count ?? 0
    const fraudCount = fraudRes.count ?? 0
    const weekAnalyses = weekRes.count ?? 0

    const fraudPercentage = totalAnalyses > 0
      ? Math.round((fraudCount / totalAnalyses) * 100) : 0

    // Top spoofed brands
    const brandCounts = new Map<string, number>()
    ;(brandRes.data as unknown as any[])?.forEach((a: any) => {
      if (a.brand_spoofed) brandCounts.set(a.brand_spoofed, (brandCounts.get(a.brand_spoofed) ?? 0) + 1)
    })
    const topSpoofedBrands = Array.from(brandCounts.entries())
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([brand, count]) => ({ brand, count }))

    // Recent threats
    const recentThreats = ((recentRes.data as unknown as any[]) ?? []).map((t: any) => {
      let domain = t.url_original
      try { domain = new URL(t.url_original).hostname } catch {}
      return {
        domain,
        threatType: t.threat_type ?? 'desconocido',
        timestamp: t.created_at,
        verdict: t.verdict,
        score: t.score,
        brand: t.brand_spoofed,
        channel: t.channel,
      }
    })

    // Channel distribution
    const channelCounts: Record<string, number> = { whatsapp: 0, email: 0, web: 0 }
    ;(channelRes.data as unknown as any[])?.forEach((a: any) => {
      if (a.channel && channelCounts[a.channel] !== undefined) {
        channelCounts[a.channel]++
      }
    })

    // Hourly breakdown (24 buckets)
    const hourlyData: { hour: number; total: number; fraud: number }[] = []
    for (let h = 0; h < 24; h++) {
      hourlyData.push({ hour: h, total: 0, fraud: 0 })
    }
    ;(hourlyRes.data as unknown as any[])?.forEach((a: any) => {
      const d = new Date(a.created_at)
      const h = d.getHours()
      if (hourlyData[h]) {
        hourlyData[h].total++
        if (a.verdict === 'fraud' || a.verdict === 'suspicious') {
          hourlyData[h].fraud++
        }
      }
    })

    const stats: DashboardStats & {
      weekAnalyses: number
      channelDistribution: Record<string, number>
      hourlyBreakdown: { hour: number; total: number; fraud: number }[]
    } = {
      totalAnalyses,
      todayAnalyses,
      fraudPercentage,
      topSpoofedBrands,
      recentThreats,
      byState: [],
      weekAnalyses,
      channelDistribution: channelCounts,
      hourlyBreakdown: hourlyData,
    }

    return NextResponse.json(stats, { status: 200 })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
