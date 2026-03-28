import Link from 'next/link'
import { Anchor } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E5DF] bg-white/90 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-75 transition-opacity">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#0D0D0D] text-white">
            <Anchor className="h-4 w-4" />
          </div>
          <span
            className="text-[1.15rem] font-bold tracking-tight text-[#0D0D0D]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            NEOBULK
          </span>
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
      className="px-4 py-2 text-sm font-medium text-[#757575] hover:text-[#0D0D0D] rounded-lg hover:bg-[#F0EEE9] transition-colors"
    >
      {children}
    </Link>
  )
}
