'use client'
import { useState } from 'react'

interface Props {
  domain: string
  name: string
}

export function DirectoryLogo({ domain, name }: Props) {
  const [failed, setFailed] = useState(false)
  const initial = name.charAt(0).toUpperCase()

  if (failed) {
    return <div className="dir-entry-logo-fallback">{initial}</div>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={`${name} logo`}
      className="dir-entry-logo"
      onError={() => setFailed(true)}
    />
  )
}
