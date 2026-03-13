'use client'
import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

export const FeaturedWarning = () => {
  const { value: isFeatured } = useField<boolean>({ path: 'featured' })
  const [featuredCount, setFeaturedCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/art-pieces?where[featured][equals]=true&limit=0')
        if (res.ok) {
          const data = await res.json()
          setFeaturedCount(data.totalDocs ?? 0)
        }
      } catch {
        // Silently fail — warning is non-critical
      }
    }
    fetchCount()
  }, [])

  if (featuredCount === null) return null

  const wouldExceed = isFeatured && featuredCount >= 5
  const alreadyExceeds = !isFeatured && featuredCount > 5

  if (!wouldExceed && !alreadyExceeds) return null

  return (
    <p
      style={{
        color: '#d97706',
        fontSize: '0.8rem',
        marginTop: '0.25rem',
        marginBottom: 0,
      }}
    >
      {wouldExceed
        ? `Warning: You already have ${featuredCount} featured piece${featuredCount !== 1 ? 's' : ''}. Too many featured pieces may dilute impact — consider keeping featured pieces to 5 or fewer.`
        : `Warning: ${featuredCount} pieces are currently featured. Too many featured pieces may dilute impact — consider keeping featured pieces to 5 or fewer.`}
    </p>
  )
}

export default FeaturedWarning
