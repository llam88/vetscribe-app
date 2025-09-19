import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VetScribe - AI Veterinary Transcription',
  description: 'AI-powered SOAP note generation for veterinarians. Record appointments and get professional notes instantly.',
  generator: 'VetScribe',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0ea5e9',
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
        <Analytics />
      </body>
    </html>
  )
}
