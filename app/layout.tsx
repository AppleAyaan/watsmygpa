import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import TabTitleChanger from "@/components/tab";
import { ThemeToggle } from "@/components/theme-toggle"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WATs my GPA? 🫣",
  description: "Calculate your GPA privately and compare with peers, all data stays on your device",
  icons: {
    icon: [
      {
        url: "/watsmygpa_logo_small_light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/watsmygpa_logo_small_dark.png",
        media: "(prefers-color-scheme: dark)",
      }
    ],
    apple: "/watsmygpa_logo_small_dark.png",
  },
    generator: 'WATsMYGPA v0.8.9'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ThemeToggle />
        <TabTitleChanger />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
