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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weedejna.com'

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2)}`
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
    <Html lang="en">
      <Head />
      <Preview>Your Weedejna order #{orderNumber} is confirmed — thank you!</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>Weedejna</Text>

          <Text style={heading}>Order Confirmed</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            Thank you for your order! We&apos;ve received your payment and are preparing your items.
            You&apos;ll receive another email when your order ships.
          </Text>

          <Section style={orderBox}>
            <Text style={orderLabel}>Order number</Text>
            <Text style={orderNumber2}>#{orderNumber.slice(-8).toUpperCase()}</Text>
          </Section>

          {/* Items */}
          <Text style={sectionTitle}>Order Summary</Text>
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
            <Column><Text style={totalLabel}>Subtotal</Text></Column>
            <Column><Text style={totalValue}>{formatPrice(subtotalAmount)}</Text></Column>
          </Row>
          <Row style={totalRow}>
            <Column><Text style={totalLabel}>Shipping</Text></Column>
            <Column><Text style={totalValue}>{shippingAmount === 0 ? 'Free' : formatPrice(shippingAmount)}</Text></Column>
          </Row>
          <Row style={totalRow}>
            <Column><Text style={grandTotalLabel}>Total</Text></Column>
            <Column><Text style={grandTotalValue}>{formatPrice(totalAmount)}</Text></Column>
          </Row>

          <Hr style={divider} />

          {/* Delivery */}
          <Text style={sectionTitle}>Delivery</Text>
          {deliveryType === 'PICKUP_IN_STORE' ? (
            <Text style={paragraph}>
              <strong style={{ color: '#F0F5F0' }}>Pickup in store</strong> — Your order will be
              ready for pickup at our store. We&apos;ll contact you when it&apos;s ready.
            </Text>
          ) : shippingAddress ? (
            <Text style={paragraph}>
              <strong style={{ color: '#F0F5F0' }}>Courier delivery</strong>
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
            <Text style={paragraph}>Courier delivery</Text>
          )}

          <Button style={button} href={`${APP_URL}/account/orders`}>
            View My Orders
          </Button>

          <Text style={paragraph}>
            Questions? Contact us at{' '}
            <Link href="mailto:support@weedejna.com" style={link}>
              support@weedejna.com
            </Link>
          </Text>

          <Text style={paragraph}>
            Thanks,
            <br />
            The Weedejna Team
          </Text>

          <Hr style={divider} />
          <Text style={footer}>
            This email was sent because you placed an order at Weedejna.
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
