// The public address of the website, without a slash at the end.
// SITE_URL is already used for emails. The live address is the safe fallback.
export function getSiteUrl() {
  const fromEnvironment = (process.env.SITE_URL || '').trim().replace(/\/+$/, '')
  return fromEnvironment || 'https://daniel-temesgen.netlify.app'
}