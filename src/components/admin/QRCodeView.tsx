import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import QRCode from 'qrcode'

export const QRCodeView = async () => {
  // Get Payload instance and read site-settings global
  const payload = await getPayload({ config })
  let qrUrl = 'https://annadesign.com'

  try {
    const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
    if (siteSettings?.qrUrl) {
      qrUrl = siteSettings.qrUrl as string
    }
  } catch {
    // Fall back to default URL if global not available
  }

  // Generate QR code as base64 data URL (no Sharp needed — avoids font issues)
  const dataURL = await QRCode.toDataURL(qrUrl, {
    width: 1024,
    margin: 2,
    color: { dark: '#e0e0e0', light: '#0a0a0a' },
    errorCorrectionLevel: 'H',
    type: 'image/png',
  })

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          color: 'var(--theme-text)',
        }}
      >
        QR Code
      </h1>

      <p
        style={{
          color: 'var(--theme-text-secondary)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}
      >
        Encoding: <code style={{ fontFamily: 'monospace' }}>{qrUrl}</code>
      </p>

      {/* QR code with branded wordmark rendered as HTML (font-independent) */}
      <div
        style={{
          maxWidth: '512px',
          width: '100%',
          marginBottom: '1.5rem',
          border: '1px solid var(--theme-border-color)',
          background: '#0a0a0a',
        }}
      >
        <img
          src={dataURL}
          alt="Dark Arts by Anna QR Code"
          style={{ width: '100%', display: 'block' }}
        />
        <div
          style={{
            padding: '0.75rem 0 1rem',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 300,
            letterSpacing: '0.5em',
            color: '#e0e0e0',
          }}
        >
          DARK ARTS BY ANNA
        </div>
      </div>

      <a
        href={dataURL}
        download="dark-arts-by-anna-qr.png"
        style={{
          display: 'inline-block',
          padding: '0.625rem 1.25rem',
          backgroundColor: 'var(--theme-elevation-0)',
          border: '1px solid var(--theme-border-color)',
          color: 'var(--theme-text)',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: '1.5rem',
        }}
      >
        Download QR Code PNG
      </a>

      <p style={{ color: 'var(--theme-text-secondary)', fontSize: '0.8rem' }}>
        To change the encoded URL, update the <strong>QR Code URL</strong> field in{' '}
        <a href="/admin/globals/site-settings" style={{ color: 'var(--theme-text)' }}>
          Site Settings
        </a>
        .
      </p>
    </div>
  )
}

export default QRCodeView
