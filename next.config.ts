import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Payload CMS requires this for the admin panel
  experimental: {
    reactCompiler: false,
  },
}

export default withPayload(nextConfig)
