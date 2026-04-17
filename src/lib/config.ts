// SEO-2: Set NEXT_PUBLIC_BASE_URL=https://weedej.cz in Vercel env vars to use canonical domain
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  'https://weedej.cz'
