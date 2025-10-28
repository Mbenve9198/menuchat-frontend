import type { Metadata } from 'next'
import Script from 'next/script'
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
      <head>
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1105280034736187');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1105280034736187&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className={`${inter.className} ${inter.variable} ${roboto.variable} ${poppins.variable} ${playfairDisplay.variable} ${montserrat.variable} ${merriweather.variable} ${oswald.variable} ${dancingScript.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
