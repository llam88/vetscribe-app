import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'SwiftVet - AI Veterinary Transcription',
  description: 'AI-powered SOAP note generation for veterinarians. Record appointments and get professional notes instantly.',
  generator: 'SwiftVet',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0ea5e9',
  icons: {
    icon: '/swiftvet-icon.ico',
    shortcut: '/swiftvet-icon.ico',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
