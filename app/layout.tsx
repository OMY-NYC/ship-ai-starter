import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Nunito_Sans } from "next/font/google"
import "./globals.css"

const heading = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-heading" })
const body = Nunito_Sans({ subsets: ["latin"], variable: "--font-body" })

export const metadata: Metadata = {
  title: "Leftover Remix · Ship AI Starter",
  description:
    "A real AI app built the safe way: sign-in, a locked-down database, one AI feature, and a guardrail. From 3percentclub x Block Convey.",
}

export const viewport: Viewport = {
  themeColor: "#f8ecd4",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} bg-background`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  )
}
