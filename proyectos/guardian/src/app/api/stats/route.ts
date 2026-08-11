import { jsonOk, jsonError, checkMethod } from '@/lib/security'
import { getSupabaseAdmin } from '@/lib/db/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const methodErr = checkMethod(request, ['GET'])
    if (methodErr) return methodErr

    const db = getSupabaseAdmin()
    const { count } = await db
      .from('analyses')
      .select('*', { count: 'exact', head: true })

    return jsonOk({ totalAnalyses: count ?? 0, status: 'ok' })
  } catch {
    return jsonOk({ totalAnalyses: 0, status: 'ok' })
  }
}
