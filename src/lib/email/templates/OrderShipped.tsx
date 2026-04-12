import {
  Html, Head, Body, Container, Text, Button, Link, Hr, Preview, Row, Column, Section,
} from '@react-email/components'

interface OrderShippedProps {
  name: string
  orderNumber: string
  items: { productName: string; variantLabel: string; quantity: number }[]
  totalAmount: number
  deliveryType: 'COURIER' | 'PICKUP_IN_STORE'
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weedej.cz'

function formatPrice(cents: number) {
  return `${Math.round(cents / 100).toLocaleString('cs-CZ')} Kč`
}

export function OrderShipped({ name, orderNumber, items, totalAmount, deliveryType }: OrderShippedProps) {
  return (
    <Html lang="cs">
      <Head />
      <Preview>Vaše objednávka #{orderNumber} byla odeslána — na cestě k vám!</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>Weedej</Text>

          <Text style={heading}>Vaše objednávka je na cestě 🚚</Text>
          <Text style={paragraph}>Dobrý den, {name},</Text>
          <Text style={paragraph}>
            Skvělá zpráva! Vaše objednávka byla právě odeslána a míří k vám.
            {deliveryType === 'COURIER'
              ? ' Doručení kurýrem proběhne zpravidla do 1–2 pracovních dnů.'
              : ' Objednávka je připravena k osobnímu vyzvednutí.'}
          </Text>

          <Section style={orderBox}>
            <Text style={orderLabel}>Číslo objednávky</Text>
            <Text style={orderNumberStyle}>#{orderNumber.slice(-8).toUpperCase()}</Text>
          </Section>

          <Text style={sectionTitle}>Odesílané položky</Text>
          {items.map((item, i) => (
            <Row key={i} style={itemRow}>
              <Column>
                <Text style={itemName}>{item.productName}</Text>
                <Text style={itemVariant}>{item.variantLabel} × {item.quantity}</Text>
              </Column>
            </Row>
          ))}

          <Hr style={divider} />

          <Row>
            <Column><Text style={grandTotalLabel}>Celkem</Text></Column>
            <Column><Text style={grandTotalValue}>{formatPrice(totalAmount)}</Text></Column>
          </Row>

          <Hr style={divider} />

          <Button style={button} href={`${APP_URL}/account/orders`}>
            Sledovat objednávku
          </Button>

          <Text style={paragraph}>
            Máte otázky? Kontaktujte nás na{' '}
            <Link href="mailto:support@weedej.cz" style={link}>support@weedej.cz</Link>
          </Text>

          <Text style={paragraph}>
            S pozdravem,<br />Tým Weedej
          </Text>

          <Hr style={divider} />
          <Text style={footer}>
            Tento e-mail byl odeslán, protože jste zadali objednávku ve Weedej.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#F8F9FA', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { backgroundColor: '#ffffff', border: '1px solid #DEE2E6', borderRadius: '12px', margin: '40px auto', padding: '40px', maxWidth: '560px' }
const logo = { color: '#2E7D32', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '24px' }
const heading = { color: '#1d1d1f', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }
const paragraph = { color: '#6e6e73', fontSize: '15px', lineHeight: '1.6', marginBottom: '16px' }
const orderBox = { backgroundColor: '#F8F9FA', border: '1px solid #DEE2E6', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }
const orderLabel = { color: '#6e6e73', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 4px 0' }
const orderNumberStyle = { color: '#1d1d1f', fontSize: '18px', fontWeight: '700', fontFamily: 'monospace', margin: '0' }
const sectionTitle = { color: '#1d1d1f', fontSize: '14px', fontWeight: '600', marginBottom: '10px', marginTop: '8px' }
const itemRow = { marginBottom: '8px' }
const itemName = { color: '#1d1d1f', fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0' }
const itemVariant = { color: '#6e6e73', fontSize: '13px', margin: '0' }
const grandTotalLabel = { color: '#1d1d1f', fontSize: '15px', fontWeight: '700', margin: '0' }
const grandTotalValue = { color: '#2E7D32', fontSize: '15px', fontWeight: '700', textAlign: 'right' as const, margin: '0' }
const button = { backgroundColor: '#2E7D32', borderRadius: '8px', color: '#ffffff', display: 'inline-block', fontWeight: '600', fontSize: '15px', padding: '14px 28px', textDecoration: 'none', marginBottom: '24px', marginTop: '8px' }
const divider = { borderColor: '#DEE2E6', marginTop: '16px', marginBottom: '16px' }
const link = { color: '#2E7D32' }
const footer = { color: '#aeaeb2', fontSize: '11px', lineHeight: '1.5' }
