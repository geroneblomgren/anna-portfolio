import type { Metadata } from 'next'
import { Bodoni_Moda, DM_Sans } from 'next/font/google'
import './globals.css'

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-bodoni-moda',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Anna Blomgren — Artist Portfolio',
  description:
    'When someone scans Anna\'s QR code, the site makes an immediate, powerful visual impression that communicates versatility, personal voice, and professional seriousness.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-text-body font-body min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
