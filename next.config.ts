import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Payload CMS requires this for the admin panel
  experimental: {
    reactCompiler: false,
  },
  // Include native libsql binary in Vercel serverless function output tracing.
  // Without this, the libsql native addon is excluded from the serverless bundle.
  outputFileTracingIncludes: {
    '**/*': [
      'node_modules/libsql/**/*',
      'node_modules/@libsql/**/*',
    ],
  },
}

export default withPayload(nextConfig)
