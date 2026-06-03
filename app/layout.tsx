import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LocReport — The pulse of the language services industry',
  description: 'Daily translation and localization news capturing the trends, innovations, and movements shaping the language services industry.',
  metadataBase: new URL('https://locreport.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
