import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { fromWithName } from '@/lib/email/send'

type RecaptchaVerifyResponse = {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

async function verifyRecaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY

  if (!secret) {
    console.error('Missing RECAPTCHA_SECRET_KEY environment variable')
    return false
  }

  const params = new URLSearchParams({
    secret,
    response: token,
  })

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  if (!res.ok) {
    console.error('reCAPTCHA verification request failed:', res.status)
    return false
  }

  const data = (await res.json()) as RecaptchaVerifyResponse
  return data.success
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { name, email, subject, message, recaptchaToken } = await req.json()

  if (!name || !subject || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!recaptchaToken || typeof recaptchaToken !== 'string') {
    return NextResponse.json({ error: 'Please complete the reCAPTCHA check' }, { status: 400 })
  }

  const recaptchaValid = await verifyRecaptcha(recaptchaToken)

  if (!recaptchaValid) {
    return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error: dbError } = await supabase
    .from('contact_submissions')
    .insert({ name, email: email || null, subject, message })

  if (dbError) {
    console.error('Supabase insert error:', dbError)
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }

  const { error: emailError } = await resend.emails.send({
    from: fromWithName('LocReport Contact'),
    to: process.env.CONTACT_EMAIL!,
    replyTo: email || undefined,
    subject: `[LocReport Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email || 'not provided'}\n\n${message}`,
  })

  if (emailError) {
    console.error('Resend error:', emailError)
    // Submission is already saved — don't fail the request over email
  }

  return NextResponse.json({ success: true })
}
