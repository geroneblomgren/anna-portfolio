'use client'
import React from 'react'
import Link from 'next/link'

export const QRNavLink = () => {
  return (
    <Link
      href="/admin/qr-code"
      style={{
        display: 'block',
        padding: '0.5rem 1rem',
        color: '#e0e0e0',
        textDecoration: 'none',
      }}
    >
      QR Code
    </Link>
  )
}

export default QRNavLink
