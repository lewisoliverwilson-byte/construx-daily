import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Construx Daily — Bite-sized AI news',
  description: 'The fastest way to stay current on AI. A bite-sized daily briefing, every morning at 8am.',
  openGraph: {
    title: 'Construx Daily',
    description: 'Bite-sized AI news, every morning at 8am.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
