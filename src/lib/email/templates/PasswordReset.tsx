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

interface PasswordResetProps {
  name: string
  resetUrl: string
}

export function PasswordReset({ name, resetUrl }: PasswordResetProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>A password reset was requested for your account.</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Text style={logo}>Weedejna</Text>

          {/* Content */}
          <Text style={heading}>Reset Your Password</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            We received a request to reset the password for your Weedejna account. If you made
            this request, click the link below:
          </Text>

          <Button style={button} href={resetUrl}>
            Reset My Password
          </Button>

          <Text style={warningBox}>
            This link expires in <strong>1 hour</strong> and can only be used once.
          </Text>

          <Text style={paragraph}>
            If you did not request a password reset, your account is safe. You can ignore this
            email — no changes have been made.
          </Text>

          <Text style={paragraph}>
            For any concerns, contact{' '}
            <Link href="mailto:support@weedejna.com" style={link}>
              support@weedejna.com
            </Link>
            .
          </Text>

          <Text style={paragraph}>The Weedejna Team</Text>

          <Hr style={divider} />

          <Text style={footer}>
            If the button above doesn&apos;t work, copy and paste this URL into your browser:
          </Text>
          <Link href={resetUrl} style={footerLink}>
            {resetUrl}
          </Link>
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
  color: '#2E7D32',
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

const warningBox = {
  backgroundColor: '#1A2219',
  border: '1px solid #1F3D1F',
  borderRadius: '8px',
  color: '#A8C5A0',
  fontSize: '14px',
  padding: '12px 16px',
  marginBottom: '16px',
}

const button = {
  backgroundColor: '#2E7D32',
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
  color: '#2E7D32',
}

const footer = {
  color: '#4A6B4A',
  fontSize: '12px',
  lineHeight: '1.5',
  marginBottom: '8px',
}

const footerLink = {
  color: '#2E7D32',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
}
