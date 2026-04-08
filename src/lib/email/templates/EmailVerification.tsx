import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Link,
  Hr,
  Preview,
} from '@react-email/components'

interface EmailVerificationProps {
  name: string
  verifyUrl: string
}

export function EmailVerification({ name, verifyUrl }: EmailVerificationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>One click to confirm your email and activate your account.</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Text style={logo}>Weedejna</Text>

          {/* Content */}
          <Text style={heading}>Verify Your Email Address</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            Thanks for registering at Weedejna. Before you start shopping, we need to confirm
            your email address.
          </Text>
          <Text style={paragraph}>Click the button below to verify your account:</Text>

          <Button style={button} href={verifyUrl}>
            Verify My Email
          </Button>

          <Text style={paragraph}>
            This link will expire in <strong>24 hours</strong>. If you did not create a
            Weedejna account, you can safely ignore this email.
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            If the button above doesn&apos;t work, copy and paste this URL into your browser:
          </Text>
          <Link href={verifyUrl} style={link}>
            {verifyUrl}
          </Link>

          <Hr style={divider} />

          <Text style={footer}>
            The Weedejna Team &bull; support@weedejna.com
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#0A0D0A',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#111714',
  border: '1px solid #1F3D1F',
  borderRadius: '16px',
  margin: '40px auto',
  padding: '40px',
  maxWidth: '560px',
}

const logo = {
  color: '#22A829',
  fontSize: '22px',
  fontWeight: '700',
  letterSpacing: '-0.5px',
  marginBottom: '32px',
}

const heading = {
  color: '#F0F5F0',
  fontSize: '22px',
  fontWeight: '700',
  marginBottom: '16px',
}

const paragraph = {
  color: '#A8C5A0',
  fontSize: '15px',
  lineHeight: '1.6',
  marginBottom: '16px',
}

const button = {
  backgroundColor: '#22A829',
  borderRadius: '10px',
  color: '#000000',
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '15px',
  padding: '14px 28px',
  textDecoration: 'none',
  marginBottom: '24px',
  marginTop: '8px',
}

const divider = {
  borderColor: '#1F3D1F',
  marginTop: '24px',
  marginBottom: '24px',
}

const link = {
  color: '#22A829',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#4A6B4A',
  fontSize: '12px',
  lineHeight: '1.5',
}
