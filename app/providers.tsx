"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { I18nProvider } from "../components/i18n-provider"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </SessionProvider>
  )
} 