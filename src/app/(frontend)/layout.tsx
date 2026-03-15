import { NavBar } from '@/components/frontend/NavBar'
import { MotionProvider } from '@/components/frontend/MotionProvider'
import { AmbientParticles } from '@/components/frontend/AmbientParticles'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavBar />
      <AmbientParticles />
      <MotionProvider>
        <main className="pt-16 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </MotionProvider>
    </>
  )
}
