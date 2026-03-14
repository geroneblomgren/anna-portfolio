import { NavBar } from '@/components/frontend/NavBar'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavBar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  )
}
