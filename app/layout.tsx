import type { Metadata } from 'next'
import { Inter, Roboto, Poppins, Playfair_Display, Montserrat, Merriweather, Oswald, Dancing_Script } from 'next/font/google'
import './globals.css'
import { Providers } from "./providers"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-roboto' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' })
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-merriweather' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })
const dancingScript = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing' })

export const metadata: Metadata = {
  title: 'MenuChat',
  description: 'WhatsApp Menu Bot for Restaurants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} ${roboto.variable} ${poppins.variable} ${playfairDisplay.variable} ${montserrat.variable} ${merriweather.variable} ${oswald.variable} ${dancingScript.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
