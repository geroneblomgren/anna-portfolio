'use client'

type Tag = 'drawings' | 'paintings' | 'tattoo-designs' | 'digital-art' | 'mixed-media'

const TAG_OPTIONS: { label: string; value: Tag | null }[] = [
  { label: 'All', value: null },
  { label: 'Drawings', value: 'drawings' },
  { label: 'Paintings', value: 'paintings' },
  { label: 'Tattoo Designs', value: 'tattoo-designs' },
  { label: 'Digital Art', value: 'digital-art' },
  { label: 'Mixed Media', value: 'mixed-media' },
]

interface TagFilterProps {
  activeTag: Tag | null
  onTagChange: (tag: Tag | null) => void
}

export function TagFilter({ activeTag, onTagChange }: TagFilterProps) {
  return (
    <div className="tag-filter-scroll flex gap-2 overflow-x-auto pb-2">
      {TAG_OPTIONS.map((option) => (
        <button
          key={option.label}
          onClick={() => onTagChange(option.value)}
          className={`px-4 py-2 rounded-full font-body text-sm transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
            activeTag === option.value
              ? 'bg-accent text-bg'
              : 'bg-surface text-text-body border border-border hover:border-accent'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
