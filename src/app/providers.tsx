'use client'

import { HeroUIProvider, ToastProvider } from '@heroui/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider placement="bottom-left" />
      {children}
    </HeroUIProvider>
  )
}