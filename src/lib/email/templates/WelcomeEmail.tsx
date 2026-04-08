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
    <Html lang="cs">
      <Head />
      <Preview>Vítáme vás. Zde je vše, co potřebujete vědět o svém novém účtu.</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Text style={logo}>Weedej</Text>

          {/* Content */}
          <Text style={heading}>Vítejte ve Weedej</Text>
          <Text style={paragraph}>Dobrý den, {name},</Text>
          <Text style={paragraph}>
            Děkujeme, že jste se k nám přidali. Váš účet je nyní aktivní a můžete začít
            prozkoumávat náš pečlivě sestavený katalog produktů.
          </Text>

          <Text style={subheading}>Co získáte jako člen Weedej:</Text>

          <Text style={listItem}>
            <strong style={{ color: '#F0F5F0' }}>Přístup k celému katalogu</strong> — Prohlížejte
            stovky laboratorně testovaných květů, extraktů, jedlých produktů, vaporizátorů, CBD
            produktů, příslušenství a semínek.
          </Text>
          <Text style={listItem}>
            <strong style={{ color: '#F0F5F0' }}>Věrnostní body</strong> — Získejte 1 bod za
            každé utracené 1 Kč. Body lze vyměnit za slevy a exkluzivní produkty.
          </Text>
          <Text style={listItem}>
            <strong style={{ color: '#F0F5F0' }}>Sledování objednávek</strong> — Aktualizace
            v reálném čase od odeslání až po doručení, vše ve vašem účtu.
          </Text>
          <Text style={listItem}>
            <strong style={{ color: '#F0F5F0' }}>Seznamy přání</strong> — Uložte si oblíbené
            produkty na později nebo je sdílejte s přítelem.
          </Text>

          <Button style={button} href={`${APP_URL}/products`}>
            Začít nakupovat
          </Button>

          <Text style={paragraph}>
            Máte-li jakékoli dotazy, náš tým podpory je k dispozici na{' '}
            <Link href="mailto:support@weedej.com" style={link}>
              support@weedej.com
            </Link>{' '}
            nebo prostřednictvím živého chatu na webu.
          </Text>

          <Text style={paragraph}>
            Děkujeme, že jste se k nám přidali.
            <br />
            Tým Weedej
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            Tento e-mail jste obdrželi, protože jste si vytvořili účet ve Weedej. Pokud jste si
            účet nevytvořili, kontaktujte nás neprodleně na{' '}
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
