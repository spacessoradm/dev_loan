import type { Metadata } from 'next'
import './globals.css'
import { Raleway } from "next/font/google"
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ThemeProvider } from 'next-themes'

const raleway = Raleway({ 
  subsets: ['latin'],
  variable: '--font-raleway'
})

export const metadata: Metadata = {
  title: 'SpeedX Loan',
  description: 'Created with CEY',
  generator: 'visual studio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} font-raleway`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <WhatsAppButton
            phoneNumber="60123456789"
            message="Hello! I'm interested in learning more about your loan services."
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
