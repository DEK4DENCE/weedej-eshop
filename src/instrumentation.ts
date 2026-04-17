export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { checkErpConnectivity } = await import('./lib/erp/connectivity')
    await checkErpConnectivity()
  }
}
