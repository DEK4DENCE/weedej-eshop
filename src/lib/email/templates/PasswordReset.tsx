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
    <Html lang="cs">
      <Head />
      <Preview>Pro váš účet bylo požádáno o obnovení hesla.</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Text style={logo}>Weedej</Text>

          {/* Content */}
          <Text style={heading}>Obnovení hesla</Text>
          <Text style={paragraph}>Dobrý den, {name},</Text>
          <Text style={paragraph}>
            Požádali jste o obnovení hesla k vašemu účtu Weedej. Pokud jste tuto žádost
            podali, klikněte na odkaz níže:
          </Text>

          <Button style={button} href={resetUrl}>
            Obnovit heslo
          </Button>

          <Text style={warningBox}>
            Tento odkaz vyprší za <strong>1 hodinu</strong> a lze jej použít pouze jednou.
          </Text>

          <Text style={paragraph}>
            Pokud jste o obnovení hesla nepožádali, váš účet je v bezpečí. Tento e-mail
            ignorujte — žádné změny nebyly provedeny.
          </Text>

          <Text style={paragraph}>
            V případě jakýchkoli obav nás kontaktujte na{' '}
            <Link href="mailto:support@weedej.com" style={link}>
              support@weedej.com
            </Link>
            .
          </Text>

          <Text style={paragraph}>Tým Weedej</Text>

          <Hr style={divider} />

          <Text style={footer}>
            Pokud tlačítko výše nefunguje, zkopírujte a vložte tuto adresu URL do prohlížeče:
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
