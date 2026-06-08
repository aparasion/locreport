import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json()

  if (!name || !subject || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
    from: 'LocReport Contact <onboarding@resend.dev>',
    to: process.env.CONTACT_EMAIL!,
    subject: `[LocReport Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email || 'not provided'}\n\n${message}`,
  })

  if (emailError) {
    console.error('Resend error:', emailError)
    // Submission is already saved — don't fail the request over email
  }

  return NextResponse.json({ success: true })
}
