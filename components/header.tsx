import Link from 'next/link'
import { Anchor } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-sky-500/20 border border-sky-500/30">
            <Anchor className="h-4 w-4 text-sky-400" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-wide">NeoBulk</span>
            <span className="ml-1.5 text-xs text-slate-500">by Thanveer</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <NavLink href="/">Vessel List</NavLink>
          <NavLink href="/analytics">Analytics</NavLink>
        </nav>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800 transition-colors"
    >
      {children}
    </Link>
  )
}
