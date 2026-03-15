import { getPayload } from 'payload'
import config from '@payload-config'

export default async function DebugPage() {
  const checks: Record<string, string> = {
    turso_url: process.env.TURSO_DATABASE_URL ? 'set' : 'MISSING',
    auth_token: process.env.TURSO_AUTH_TOKEN ? 'set' : 'MISSING',
    blob_token: process.env.BLOB_READ_WRITE_TOKEN ? 'set' : 'MISSING',
    payload_secret: process.env.PAYLOAD_SECRET ? 'set' : 'MISSING',
  }

  try {
    const payload = await getPayload({ config })
    const media = await payload.find({ collection: 'media', limit: 1, depth: 0 })
    checks.payload = 'ok'
    checks.media_total = String(media.totalDocs)
    if (media.docs[0]) {
      checks.first_media_url = media.docs[0].url || 'no url'
      const sizes = (media.docs[0] as any).sizes
      checks.first_media_gallery_url = sizes?.gallery?.url || 'no gallery url'
    }
  } catch (error) {
    checks.payload = 'FAILED'
    checks.error = error instanceof Error ? error.message : String(error)
    checks.stack = error instanceof Error ? error.stack?.split('\n').slice(0, 8).join('\n') || '' : ''
  }

  return (
    <pre style={{ padding: '2rem', color: '#fff', background: '#000', fontSize: '14px' }}>
      {JSON.stringify(checks, null, 2)}
    </pre>
  )
}
