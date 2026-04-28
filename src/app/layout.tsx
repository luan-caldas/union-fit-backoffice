import type { Metadata } from "next"
import { Rethink_Sans } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/query-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Union Fit — Admin",
  description: "Painel administrativo do Union Fit",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${rethinkSans.variable} h-full`}>
      <body className="min-h-full">
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
