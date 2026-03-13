// Design system smoke test — replaced in Phase 3

export default function HomePage() {
  return (
    <div className="py-16 space-y-12">
      {/* Heading in Bodoni Moda */}
      <section>
        <h1 className="font-heading text-text-heading text-5xl md:text-7xl leading-tight">
          Anna Blomgren
        </h1>
        <p className="font-heading text-accent text-xl italic mt-2">Artist & Illustrator</p>
      </section>

      {/* Body text in DM Sans */}
      <section className="space-y-4">
        <p className="text-text-body text-base leading-relaxed max-w-prose">
          Welcome to the portfolio. This page is a design system smoke test confirming all
          typography, colors, and layout tokens are wired correctly.
        </p>
        <p className="text-text-muted text-sm">
          Muted text on background (bg: #1a1614 — contrast ~4.56:1 passes AA)
        </p>
      </section>

      {/* Surface card with muted-on-surface text */}
      <section className="bg-surface rounded-sm p-6 border border-border space-y-3">
        <h2 className="font-heading text-text-heading text-2xl">Surface Card</h2>
        <p className="text-text-body text-sm">
          Body text on surface background. Readable at all sizes.
        </p>
        <p className="text-text-muted-on-surface text-sm">
          Muted text on surface (bg: #252220 — contrast ~4.8:1 passes AA)
        </p>
      </section>

      {/* Accent color demonstration */}
      <section className="space-y-2">
        <button className="bg-accent text-bg font-body font-medium px-6 py-3 rounded-sm hover:bg-accent-hover transition-colors">
          Accent Button
        </button>
        <p className="text-accent-muted text-sm">Muted accent — accent-muted token</p>
      </section>

      {/* Color swatch grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg border border-border p-4 text-center">
          <p className="text-text-muted text-xs">bg</p>
          <p className="text-text-body text-xs font-mono">#1a1614</p>
        </div>
        <div className="bg-surface border border-border p-4 text-center">
          <p className="text-text-muted-on-surface text-xs">surface</p>
          <p className="text-text-body text-xs font-mono">#252220</p>
        </div>
        <div className="bg-accent p-4 text-center">
          <p className="text-bg text-xs">accent</p>
          <p className="text-bg text-xs font-mono">#c8956c</p>
        </div>
        <div className="bg-error p-4 text-center">
          <p className="text-bg text-xs">error</p>
          <p className="text-bg text-xs font-mono">#d45e4d</p>
        </div>
      </section>
    </div>
  )
}
