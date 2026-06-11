'use client'
import { useState } from 'react'

interface Props {
  domain: string
  name: string
  logoUrl?: string
}

export function DirectoryLogo({ domain, name, logoUrl }: Props) {
  const initial = name.charAt(0).toUpperCase()
  const [src, setSrc] = useState<string | null>(logoUrl || `https://logo.clearbit.com/${domain}`)
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return <div className="dir-entry-logo-fallback">{initial}</div>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} logo`}
      className="dir-entry-logo"
      onError={() => {
        if (logoUrl && src === logoUrl) {
          // uploaded logo failed — try clearbit
          setSrc(`https://logo.clearbit.com/${domain}`)
        } else {
          setFailed(true)
        }
      }}
    />
  )
}
