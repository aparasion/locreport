import { Nav } from '@/components/Nav'
import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1200px] px-6 py-10">
        {children}
      </main>
      <footer className="site-footer">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="site-footer__top">
            <div>
              <div className="site-footer__brand-name">LocReport</div>
              <p className="site-footer__tagline">The pulse of the language services industry.</p>
            </div>
            <div>
              <div className="site-footer__col-title">Navigate</div>
              <div className="site-footer__links">
                <Link href="/">Home</Link>
                <Link href="/articles">Articles</Link>
              </div>
            </div>
            <div>
              <div className="site-footer__col-title">Information</div>
              <div className="site-footer__links">
                <Link href="/articles?type=theory">Research</Link>
                <Link href="/articles?type=monthly-summary">Monthly Reports</Link>
              </div>
            </div>
          </div>
          <div className="site-footer__bottom">
            © {new Date().getFullYear()} LocReport. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
