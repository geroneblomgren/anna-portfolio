import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import QRCode from 'qrcode'
import sharp from 'sharp'

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

  // Generate QR code PNG buffer with cold graphite palette (#e0e0e0 on #0a0a0a)
  const qrBuffer = await QRCode.toBuffer(qrUrl, {
    width: 1024,
    margin: 2,
    color: { dark: '#e0e0e0', light: '#0a0a0a' },
    errorCorrectionLevel: 'H',
    type: 'png',
  })

  // Create branded "DARK ARTS BY ANNA" wordmark using Sharp text (Pango)
  // Sharp's text API uses Pango/fontconfig directly — more reliable than SVG text
  // which depends on librsvg font availability (often missing on serverless)
  const textOverlay = await sharp({
    text: {
      text: '<span foreground="#e0e0e0" letter_spacing="8000">DARK ARTS BY ANNA</span>',
      font: 'sans-serif',
      width: 1024,
      height: 80,
      align: 'centre',
      rgba: true,
    },
  })
    .png()
    .toBuffer()

  // Add branded footer below the QR code using Sharp
  const finalBuffer = await sharp(qrBuffer)
    .extend({ bottom: 100, background: '#0a0a0a' })
    .composite([{ input: textOverlay, gravity: 'south' }])
    .png()
    .toBuffer()

  // Convert to base64 data URL for inline display and download
  const dataURL = `data:image/png;base64,${finalBuffer.toString('base64')}`

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

      <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Encoding: <code style={{ fontFamily: 'monospace' }}>{qrUrl}</code>
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <img
          src={dataURL}
          alt="Dark Arts by Anna QR Code"
          style={{
            maxWidth: '512px',
            width: '100%',
            display: 'block',
            border: '1px solid var(--theme-border-color)',
          }}
        />
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
