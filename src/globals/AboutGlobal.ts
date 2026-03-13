import type { GlobalConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const AboutGlobal: GlobalConfig = {
  slug: 'about',
  label: 'About',
  fields: [
    {
      name: 'bioText',
      type: 'richText',
      label: 'Bio Text',
      editor: lexicalEditor({}),
    },
    {
      name: 'photoId',
      type: 'upload',
      label: 'Artist Photo',
      relationTo: 'media',
    },
    {
      name: 'artistStatement',
      type: 'textarea',
      label: 'Artist Statement',
    },
  ],
}
