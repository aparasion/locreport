import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — LocReport',
  description: 'LocReport terms of service — usage rights, content permissions, and AI training policies for locreport.com.',
}

export default function TermsPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <article className="page-prose">
        <h1>Terms of Service</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}><strong>Effective Date:</strong> March 15, 2026</p>

        <p>By accessing or using locreport.com ("the Site"), you agree to these Terms of Service. If you do not agree, please do not use the Site.</p>

        <h2>About LocReport</h2>

        <p>LocReport is an independent publication providing news coverage, analysis, and commentary on the translation, localization, and language technology industry. The Site is operated by LocReport ("we," "us," or "our").</p>

        <h2>Use of Content</h2>

        <p>All original content on the Site, including text, graphics, logos, and design, is the property of LocReport and is protected by copyright law. You may:</p>
        <ul>
          <li>Read and share articles with proper attribution and a link to the original</li>
          <li>Quote brief excerpts for commentary, criticism, or educational purposes (fair use)</li>
        </ul>

        <p>You may not:</p>
        <ul>
          <li>Reproduce, republish, or redistribute full articles without written permission</li>
          <li>Use our content to train machine learning or AI models without express authorization</li>
          <li>Frame, scrape, or systematically download content from the Site</li>
          <li>Remove or alter any copyright or attribution notices</li>
        </ul>

        <h2>AI-Generated Content Disclaimer</h2>

        <p>Some content on LocReport is produced with the assistance of artificial intelligence tools to support editorial research, drafting, and analysis. All AI-assisted content is reviewed by our editorial team. While we strive for accuracy, AI-assisted content may contain errors, omissions, or outdated information. We make no warranty that AI-assisted content is free of inaccuracies.</p>

        <h2>Editorial Accuracy</h2>

        <p>LocReport provides industry news and analysis for informational purposes only. Content on the Site does not constitute professional, legal, financial, or business advice. While we aim for accuracy, we do not guarantee that all information is complete, current, or error-free. You should independently verify information before making decisions based on our content.</p>

        <h2>Third-Party Links</h2>

        <p>The Site contains links to external websites and sources. We are not responsible for the content, accuracy, or privacy practices of third-party sites. Inclusion of a link does not imply endorsement.</p>

        <h2>Limitation of Liability</h2>

        <p>To the fullest extent permitted by law, LocReport shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or reliance on any content published here.</p>

        <h2>Changes to These Terms</h2>

        <p>We may update these Terms from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms.</p>

        <h2>Contact</h2>

        <p>Questions about these Terms? Use the <a href="/contact">Contact page</a> to reach us.</p>
      </article>
    </div>
  )
}
