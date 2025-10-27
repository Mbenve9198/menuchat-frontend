"use client"

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Estendi window per il pixel Facebook
declare global {
  interface Window {
    fbq: any
  }
}

const PIXEL_ID = '1105280034736187'

export function MetaPixel() {
  const pathname = usePathname()

  useEffect(() => {
    // Track pageview quando cambia la route
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [pathname])

  return (
    <>
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
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}

// Helper functions per eventi custom
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data)
    console.log(`📊 Meta Pixel: ${eventName}`, data)
  }
}

// Eventi predefiniti ottimizzati per il funnel
export const MetaEvents = {
  // Quando l'utente vede i risultati del rank checker
  viewResults: (restaurantName: string, rank: number | string) => {
    trackEvent('ViewContent', {
      content_name: 'Rank Checker Results',
      content_category: 'Rank Analysis',
      restaurant_name: restaurantName,
      rank: rank
    })
  },

  // Quando l'utente inserisce email/telefono (LEAD!)
  submitLead: (restaurantName: string, rank: number | string) => {
    trackEvent('Lead', {
      content_name: 'Rank Checker Lead',
      restaurant_name: restaurantName,
      rank: rank,
      value: 10, // Valore stimato del lead
      currency: 'EUR'
    })
  },

  // Quando completa la qualificazione
  completeQualification: (hasMenu: boolean, dailyCovers: number, monthlyReviews: number) => {
    trackEvent('CompleteRegistration', {
      content_name: 'Lead Qualification',
      has_digital_menu: hasMenu,
      daily_covers: dailyCovers,
      estimated_monthly_reviews: monthlyReviews,
      value: hasMenu ? 50 : 30, // Lead più qualificato se ha già il menu
      currency: 'EUR'
    })
  },

  // Quando inizia l'onboarding
  startOnboarding: () => {
    trackEvent('InitiateCheckout', {
      content_name: 'Start Onboarding',
      value: 100,
      currency: 'EUR'
    })
  }
}

