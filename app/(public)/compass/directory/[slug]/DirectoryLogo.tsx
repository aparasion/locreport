'use client'

interface Props {
  domain: string
  name: string
}

export function DirectoryLogo({ domain, name }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={`${name} logo`}
      className="dir-entry-logo"
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
    />
  )
}
