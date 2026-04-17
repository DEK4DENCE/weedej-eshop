export async function checkErpConnectivity(): Promise<void> {
  const erpUrl = process.env.ERP_API_URL
  if (!erpUrl) {
    console.warn('[ERP] ERP_API_URL not set — ERP integration disabled')
    return
  }
  try {
    const res = await fetch(`${erpUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      headers: { 'Authorization': `Bearer ${process.env.ERP_API_KEY ?? ''}` },
    })
    if (!res.ok) {
      console.error(`[ERP] Connectivity check failed: HTTP ${res.status}`)
    } else {
      console.log('[ERP] Connectivity check passed')
    }
  } catch (err) {
    console.error('[ERP] Connectivity check failed:', err instanceof Error ? err.message : err)
  }
}
