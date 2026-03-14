'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-bg/90 backdrop-blur-sm border-b border-border flex items-center px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <div className="flex-1">
          <Link
            href="/"
            className="font-heading text-text-heading text-lg tracking-tight hover:text-accent transition-colors"
          >
            Anna Blomgren
          </Link>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-body text-sm transition-colors ${
                isActive(link.href)
                  ? 'text-accent'
                  : 'text-text-body hover:text-accent'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="block w-5 h-px bg-text-heading" />
          <span className="block w-5 h-px bg-text-heading" />
          <span className="block w-5 h-px bg-text-heading" />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-bg z-50 flex flex-col items-center justify-center">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-text-heading hover:text-accent transition-colors"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Nav links */}
          <nav className="flex flex-col items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-heading text-4xl tracking-tight transition-colors ${
                  isActive(link.href)
                    ? 'text-accent'
                    : 'text-text-heading hover:text-accent'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
