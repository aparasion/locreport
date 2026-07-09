import { Resend } from 'resend'

export const SITE_URL = 'https://locreport.com'

// Falls back to Resend's shared onboarding sender until the locreport.com
// domain is verified in Resend — set DIGEST_FROM_EMAIL once it is.
export function digestFrom(): string {
  return process.env.DIGEST_FROM_EMAIL || 'LocReport <onboarding@resend.dev>'
}

// Reuse the verified digest sender for other transactional mail (e.g. the
// contact form), swapping only the display name.
export function fromWithName(displayName: string): string {
  const source = digestFrom()
  const email = source.match(/<([^>]+)>/)?.[1] ?? source
  return `${displayName} <${email}>`
}

export function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY)
}
