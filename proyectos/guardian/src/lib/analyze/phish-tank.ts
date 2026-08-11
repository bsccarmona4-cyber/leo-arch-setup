const PHISHTANK_API = 'https://checkurl.phishtank.com/checkurl/'

export async function checkPhishTank(url: string): Promise<{
  inDatabase: boolean
  valid: boolean
  verified: boolean
} | null> {
  const apiKey = process.env.PHISHTANK_API_KEY
  if (!apiKey) return null

  try {
    const formData = new URLSearchParams()
    formData.append('url', url)
    formData.append('format', 'json')
    formData.append('app_key', apiKey)

    const res = await fetch(PHISHTANK_API, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (data?.results) {
      return {
        inDatabase: data.results.in_database,
        valid: data.results.valid,
        verified: data.results.verified,
      }
    }
    return { inDatabase: false, valid: false, verified: false }
  } catch {
    return null
  }
}
