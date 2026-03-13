export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      {children}
    </main>
  )
}
