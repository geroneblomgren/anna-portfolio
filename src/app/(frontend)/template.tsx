'use client'
import { InkTransition } from '@/components/frontend/InkTransition'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InkTransition />
      {children}
    </>
  )
}
