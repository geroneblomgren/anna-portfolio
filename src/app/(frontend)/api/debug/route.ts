import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { createClient } = await import('@libsql/client')
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const result = await client.execute('SELECT 1 as test')
    return NextResponse.json({
      status: 'ok',
      turso_url: process.env.TURSO_DATABASE_URL ? 'set' : 'missing',
      auth_token: process.env.TURSO_AUTH_TOKEN ? 'set' : 'missing',
      query_result: result.rows[0],
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      turso_url: process.env.TURSO_DATABASE_URL ? 'set' : 'missing',
      auth_token: process.env.TURSO_AUTH_TOKEN ? 'set' : 'missing',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
    }, { status: 500 })
  }
}
