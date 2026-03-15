import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, unknown> = {
    turso_url: process.env.TURSO_DATABASE_URL ? 'set' : 'MISSING',
    auth_token: process.env.TURSO_AUTH_TOKEN ? 'set' : 'MISSING',
    blob_token: process.env.BLOB_READ_WRITE_TOKEN ? 'set' : 'MISSING',
    payload_secret: process.env.PAYLOAD_SECRET ? 'set' : 'MISSING',
  }

  // Test Turso connection
  try {
    const { createClient } = await import('@libsql/client')
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const result = await client.execute('SELECT 1 as test')
    checks.turso_connection = 'ok'
    checks.turso_result = result.rows[0]
  } catch (error) {
    checks.turso_connection = 'FAILED'
    checks.turso_error = error instanceof Error ? error.message : String(error)
  }

  // Test Payload initialization
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    const media = await payload.find({ collection: 'media', limit: 1, depth: 0 })
    checks.payload_init = 'ok'
    checks.media_count = media.totalDocs
  } catch (error) {
    checks.payload_init = 'FAILED'
    checks.payload_error = error instanceof Error ? error.message : String(error)
    checks.payload_stack = error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined
  }

  const status = checks.turso_connection === 'ok' && checks.payload_init === 'ok' ? 200 : 500
  return NextResponse.json(checks, { status })
}
