import type { CollectionConfig } from 'payload'

export const ArtPieces: CollectionConfig = {
  slug: 'art-pieces',
  orderable: true,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'featured', 'tags', 'updatedAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Drawings', value: 'drawings' },
        { label: 'Paintings', value: 'paintings' },
        { label: 'Tattoo Designs', value: 'tattoo-designs' },
        { label: 'Digital Art', value: 'digital-art' },
        { label: 'Mixed Media', value: 'mixed-media' },
      ],
    },
    { name: 'medium', type: 'text', label: 'Medium / Technique' },
    { name: 'description', type: 'textarea' },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured (pinned first in gallery)',
    },
  ],
}
