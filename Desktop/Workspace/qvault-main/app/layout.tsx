import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: "Q'Vault - Uganda's New Lower Secondary Curriculum Resource",
  description: "Access Activities of Integration, past papers, and educational resources for Ugandan students. Sciences, Humanities, Languages - all aligned with the new curriculum.",
  keywords: ["Uganda education", "NLSC", "Activities of Integration", "UCE past papers", "Ugandan curriculum"],
  authors: [{ name: "Q'Vault Team" }],
  openGraph: {
    title: "Q'Vault - Educational Excellence for Uganda",
    description: "Your comprehensive resource for Uganda's New Lower Secondary Curriculum",
    type: "website",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0369a1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
