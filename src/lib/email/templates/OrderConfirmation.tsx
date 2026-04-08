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
  Row,
  Column,
  Section,
} from '@react-email/components'

interface OrderItem {
  productName: string
  variantLabel: string
  quantity: number
  unitPrice: number // in cents
}

interface OrderConfirmationProps {
  name: string
  orderNumber: string
  items: OrderItem[]
  subtotalAmount: number // cents
  shippingAmount: number // cents
  totalAmount: number // cents
  deliveryType: 'COURIER' | 'PICKUP_IN_STORE'
  shippingAddress?: {
    fullName: string
    line1: string
    city: string
    postalCode: string
    country: string
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weedej.com'

function formatPrice(cents: number) {
  return `${Math.round(cents / 100).toLocaleString('cs-CZ')} Kč`
}

export function OrderConfirmation({
  name,
  orderNumber,
  items,
  subtotalAmount,
  shippingAmount,
  totalAmount,
  deliveryType,
  shippingAddress,
}: OrderConfirmationProps) {
  return (
    <Html lang="cs">
      <Head />
      <Preview>Vaše objednávka Weedej #{orderNumber} je potvrzena — děkujeme!</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>Weedej</Text>

          <Text style={heading}>Potvrzení objednávky</Text>
          <Text style={paragraph}>Dobrý den, {name},</Text>
          <Text style={paragraph}>
            Děkujeme za vaši objednávku! Přijali jsme vaši platbu a připravujeme vaše položky.
            Jakmile bude objednávka odeslána, obdržíte další e-mail.
          </Text>

          <Section style={orderBox}>
            <Text style={orderLabel}>Číslo objednávky</Text>
            <Text style={orderNumber2}>#{orderNumber.slice(-8).toUpperCase()}</Text>
          </Section>

          {/* Items */}
          <Text style={sectionTitle}>Přehled objednávky</Text>
          {items.map((item, i) => (
            <Row key={i} style={itemRow}>
              <Column style={itemInfo}>
                <Text style={itemName}>{item.productName}</Text>
                <Text style={itemVariant}>{item.variantLabel} × {item.quantity}</Text>
              </Column>
              <Column style={itemPrice}>
                <Text style={itemPriceText}>{formatPrice(item.unitPrice * item.quantity)}</Text>
              </Column>
            </Row>
          ))}

          <Hr style={divider} />

          <Row style={totalRow}>
            <Column><Text style={totalLabel}>Mezisoučet</Text></Column>
            <Column><Text style={totalValue}>{formatPrice(subtotalAmount)}</Text></Column>
          </Row>
          <Row style={totalRow}>
            <Column><Text style={totalLabel}>Doprava</Text></Column>
            <Column><Text style={totalValue}>{shippingAmount === 0 ? 'Zdarma' : formatPrice(shippingAmount)}</Text></Column>
          </Row>
          <Row style={totalRow}>
            <Column><Text style={grandTotalLabel}>Celkem</Text></Column>
            <Column><Text style={grandTotalValue}>{formatPrice(totalAmount)}</Text></Column>
          </Row>

          <Hr style={divider} />

          {/* Delivery */}
          <Text style={sectionTitle}>Doručení</Text>
          {deliveryType === 'PICKUP_IN_STORE' ? (
            <Text style={paragraph}>
              <strong style={{ color: '#F0F5F0' }}>Osobní odběr</strong> — Vaše objednávka bude
              připravena k vyzvednutí na naší prodejně. Kontaktujeme vás, jakmile bude připravena.
            </Text>
          ) : shippingAddress ? (
            <Text style={paragraph}>
              <strong style={{ color: '#F0F5F0' }}>Doručení kurýrem</strong>
              <br />
              {shippingAddress.fullName}
              <br />
              {shippingAddress.line1}
              <br />
              {shippingAddress.postalCode} {shippingAddress.city}
              <br />
              {shippingAddress.country}
            </Text>
          ) : (
            <Text style={paragraph}>Doručení kurýrem</Text>
          )}

          <Button style={button} href={`${APP_URL}/account/orders`}>
            Zobrazit objednávky
          </Button>

          <Text style={paragraph}>
            Máte otázky? Kontaktujte nás na{' '}
            <Link href="mailto:support@weedej.com" style={link}>
              support@weedej.com
            </Link>
          </Text>

          <Text style={paragraph}>
            S pozdravem,
            <br />
            Tým Weedej
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
  marginBottom: '8px',
}

const paragraph = {
  color: '#A8C5A0',
  fontSize: '15px',
  lineHeight: '1.6',
  marginBottom: '16px',
}

const orderBox = {
  backgroundColor: '#1A2219',
  border: '1px solid #1F3D1F',
  borderRadius: '10px',
  padding: '16px 20px',
  marginBottom: '24px',
}

const orderLabel = {
  color: '#6B8A6B',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 4px 0',
}

const orderNumber2 = {
  color: '#F0F5F0',
  fontSize: '18px',
  fontWeight: '700',
  fontFamily: 'monospace',
  margin: '0',
}

const sectionTitle = {
  color: '#F0F5F0',
  fontSize: '15px',
  fontWeight: '600',
  marginBottom: '12px',
  marginTop: '8px',
}

const itemRow = {
  marginBottom: '10px',
}

const itemInfo = {
  verticalAlign: 'top' as const,
}

const itemName = {
  color: '#F0F5F0',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 2px 0',
}

const itemVariant = {
  color: '#6B8A6B',
  fontSize: '13px',
  margin: '0',
}

const itemPrice = {
  verticalAlign: 'top' as const,
  textAlign: 'right' as const,
}

const itemPriceText = {
  color: '#A8C5A0',
  fontSize: '14px',
  margin: '0',
}

const totalRow = {
  marginBottom: '6px',
}

const totalLabel = {
  color: '#6B8A6B',
  fontSize: '14px',
  margin: '0',
}

const totalValue = {
  color: '#A8C5A0',
  fontSize: '14px',
  textAlign: 'right' as const,
  margin: '0',
}

const grandTotalLabel = {
  color: '#F0F5F0',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
}

const grandTotalValue = {
  color: '#D4A017',
  fontSize: '16px',
  fontWeight: '700',
  textAlign: 'right' as const,
  fontFamily: 'monospace',
  margin: '0',
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
  marginTop: '20px',
  marginBottom: '20px',
}

const link = {
  color: '#2E7D32',
}

const footer = {
  color: '#4A6B4A',
  fontSize: '12px',
  lineHeight: '1.5',
}
