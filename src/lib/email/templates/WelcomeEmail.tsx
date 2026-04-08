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

interface WelcomeEmailProps {
  name: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weedej.com'

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>You&apos;re in. Here&apos;s everything you need to know about your new account.</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Text style={logo}>Weedej</Text>

          {/* Content */}
          <Text style={heading}>Welcome to Weedej</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            Welcome to Weedej. Your account is now active and you&apos;re ready to start
            exploring our curated cannabis catalogue.
          </Text>

          <Text style={subheading}>Here&apos;s what you get as a Weedej member:</Text>

          <Text style={listItem}>
            <strong style={{ color: '#F0F5F0' }}>Full catalogue access</strong> — Browse hundreds
            of lab-tested flowers, extracts, edibles, vapes, CBD products, accessories, and seeds.
          </Text>
          <Text style={listItem}>
            <strong style={{ color: '#F0F5F0' }}>Loyalty Points</strong> — Earn 1 point per €1
            spent. Redeem points for discounts and exclusive products.
          </Text>
          <Text style={listItem}>
            <strong style={{ color: '#F0F5F0' }}>Order Tracking</strong> — Real-time updates from
            dispatch to delivery, all in your account dashboard.
          </Text>
          <Text style={listItem}>
            <strong style={{ color: '#F0F5F0' }}>Wishlists</strong> — Save products you love for
            later or share them with a friend.
          </Text>

          <Button style={button} href={`${APP_URL}/products`}>
            Shop Now
          </Button>

          <Text style={paragraph}>
            If you have any questions, our support team is here at{' '}
            <Link href="mailto:support@weedej.com" style={link}>
              support@weedej.com
            </Link>{' '}
            or via live chat on the website.
          </Text>

          <Text style={paragraph}>
            Thanks for joining us.
            <br />
            The Weedej Team
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            You are receiving this email because you created a Weedej account. If you did not
            create this account, please contact us immediately at{' '}
            <Link href="mailto:support@weedej.com" style={footerLink}>
              support@weedej.com
            </Link>
            .
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

const subheading = {
  color: '#F0F5F0',
  fontSize: '15px',
  fontWeight: '600',
  marginBottom: '12px',
  marginTop: '4px',
}

const paragraph = {
  color: '#A8C5A0',
  fontSize: '15px',
  lineHeight: '1.6',
  marginBottom: '16px',
}

const listItem = {
  color: '#A8C5A0',
  fontSize: '14px',
  lineHeight: '1.6',
  marginBottom: '10px',
  paddingLeft: '12px',
  borderLeft: '2px solid #1F3D1F',
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
  marginTop: '16px',
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
}

const footerLink = {
  color: '#2E7D32',
  fontSize: '12px',
}
