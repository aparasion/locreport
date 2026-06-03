import { Nav } from '@/components/Nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-100 mt-16 py-8 text-center text-sm text-[#5A6278]">
        <p>© {new Date().getFullYear()} LocReport. The pulse of the language services industry.</p>
      </footer>
    </>
  )
}
