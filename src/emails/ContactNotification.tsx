import {
  Html,
  Body,
  Heading,
  Text,
  Section,
  Hr,
} from '@react-email/components'

interface ContactNotificationProps {
  name: string
  email: string
  message: string
}

export function ContactNotification({ name, email, message }: ContactNotificationProps) {
  return (
    <Html lang="en">
      <Body
        style={{
          fontFamily: 'sans-serif',
          backgroundColor: '#f9f9f9',
          padding: '24px',
          margin: 0,
        }}
      >
        <Section
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '4px',
          }}
        >
          <Heading
            style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#111111',
              marginBottom: '8px',
            }}
          >
            New portfolio message from {name}
          </Heading>
          <Text style={{ color: '#555555', fontSize: '14px', margin: '0 0 16px' }}>
            From: {email}
          </Text>
          <Hr style={{ borderColor: '#e5e5e5', margin: '0 0 20px' }} />
          <Text
            style={{
              color: '#333333',
              fontSize: '16px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {message}
          </Text>
        </Section>
      </Body>
    </Html>
  )
}
