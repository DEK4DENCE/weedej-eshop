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
    <Html lang="cs">
      <Head />
      <Preview>Jediným kliknutím potvrďte svůj e-mail a aktivujte účet.</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Text style={logo}>Weedej</Text>

          {/* Content */}
          <Text style={heading}>Ověřte svůj e-mail</Text>
          <Text style={paragraph}>Dobrý den, {name},</Text>
          <Text style={paragraph}>
            Děkujeme za registraci ve Weedej. Než začnete nakupovat, potřebujeme ověřit
            vaši e-mailovou adresu.
          </Text>
          <Text style={paragraph}>Klikněte na tlačítko níže pro ověření vaší e-mailové adresy:</Text>

          <Button style={button} href={verifyUrl}>
            Ověřit e-mail
          </Button>

          <Text style={paragraph}>
            Tento odkaz vyprší za <strong>24 hodin</strong>. Pokud jste si účet ve Weedej
            nevytvořili, tento e-mail ignorujte.
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            Pokud tlačítko výše nefunguje, zkopírujte a vložte tuto adresu URL do prohlížeče:
          </Text>
          <Link href={verifyUrl} style={link}>
            {verifyUrl}
          </Link>

          <Hr style={divider} />

          <Text style={footer}>
            Tým Weedej &bull; support@weedej.com
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

const paragraph = {
  color: '#A8C5A0',
  fontSize: '15px',
  lineHeight: '1.6',
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
  fontSize: '12px',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#4A6B4A',
  fontSize: '12px',
  lineHeight: '1.5',
}
