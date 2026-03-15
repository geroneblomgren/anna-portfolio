'use client'

type Tag = 'drawings' | 'paintings' | 'tattoo-designs' | 'digital-art' | 'mixed-media'

const TAG_LABELS: Record<Tag, string> = {
  drawings: 'Drawings',
  paintings: 'Paintings',
  'tattoo-designs': 'Tattoo Designs',
  'digital-art': 'Digital Art',
  'mixed-media': 'Mixed Media',
}

interface TagFilterProps {
  activeTag: Tag | null
  onTagChange: (tag: Tag | null) => void
  usedTags: Tag[]
}

export function TagFilter({ activeTag, onTagChange, usedTags }: TagFilterProps) {
  const options: { label: string; value: Tag | null }[] = [
    { label: 'All', value: null },
    ...usedTags.map((tag) => ({ label: TAG_LABELS[tag], value: tag as Tag | null })),
  ]

  return (
    <div className="tag-filter-scroll flex gap-2 overflow-x-auto pb-2">
      {options.map((option) => (
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
