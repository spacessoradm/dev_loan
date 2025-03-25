import type { Metadata } from 'next'
import './globals.css'
import { Raleway } from "next/font/google"

const raleway = Raleway({ 
  subsets: ['latin'],
  variable: '--font-raleway'
})

export const metadata: Metadata = {
  title: 'Loan App',
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
        {children}
      </body>
    </html>
  )
}
