import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — LocReport',
  description: 'About LocReport — an independent publication tracking the pulse of the language services industry.',
  alternates: {
    canonical: 'https://locreport.com/about',
  },
}

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <article className="page-prose">
        <h1>About LocReport</h1>

        <p>LocReport is an independent publication portal tracking the pulse of the language services industry.</p>

        <p>We cover daily developments in translation, localization, global content strategy, language technology, and cross-border communication. From emerging AI tools to market shifts and operational innovation, our goal is simple:</p>

        <blockquote>Capture the trends, movements, and ideas shaping the future of global communication.</blockquote>

        <p>The language services industry evolves quickly. New platforms emerge. Workflows transform. Technology redefines what's possible. LocReport exists to observe, document, and analyze those changes with clarity and perspective.</p>

        <h2>Why This Exists</h2>

        <p>LocReport is an experimental publishing project.</p>

        <p>It was created to explore a focused, signal-over-noise approach to industry reporting — short, relevant, and structured coverage without hype or clutter.</p>

        <p>We are testing formats, tone, and frequency while building a resource that professionals in localization and translation can rely on.</p>

        <h2>Behind LocReport</h2>

        <p>LocReport was initiated and is maintained by a localization professional with over twenty years of active experience in the language services industry.</p>

        <p>Having worked across virtually every facet of the field — from translation project management and localization engineering to vendor relations, quality frameworks, and language technology evaluation — the person behind LocReport brings a deeply practitioner-grounded perspective to industry coverage. LocReport is not a newsroom. It is a personal initiative: a manifest of a lifelong learning path, intellectual curiosity, and genuine passion for an industry that connects the world through language.</p>

        <p>The project exists at the intersection of professional knowledge, editorial craft, and emerging technology. It is an experiment in what industry intelligence can look like when built by someone who has lived the work from the inside — not summarizing the industry from a distance, but tracking it as an informed participant who still thinks deeply about where it is headed.</p>

        <p>In that spirit, LocReport reflects both a professional journey and a personal commitment: to build something useful, honest, and persistently curious about the future of global communication.</p>

        <h2>Contribute</h2>

        <p>This project is open and evolving.</p>

        <p>If you:</p>
        <ul>
          <li>Work in translation, localization, or language technology</li>
          <li>Have insights on industry trends</li>
          <li>Want to share analysis, commentary, or curated news</li>
          <li>Or simply believe this industry deserves sharper reporting</li>
        </ul>

        <p>We welcome contributions. <Link href="/contact">Reach out through the Contact page</Link> and tell us what you'd like to share.</p>

        <p>LocReport is about tracking what drives global communication — and the people building it.</p>
      </article>
    </div>
  )
}
