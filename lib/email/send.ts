import { Resend } from 'resend'

export const SITE_URL = 'https://locreport.com'

// Falls back to Resend's shared onboarding sender until the locreport.com
// domain is verified in Resend — set DIGEST_FROM_EMAIL once it is.
export function digestFrom(): string {
  return process.env.DIGEST_FROM_EMAIL || 'LocReport <onboarding@resend.dev>'
}

export function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY)
}
