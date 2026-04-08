import {
  Html, Head, Body, Container, Text, Hr, Preview, Row, Column, Section,
} from '@react-email/components'

interface OrderItem {
  productName: string
  variantLabel: string
  quantity: number
  unitPrice: number
}

interface NewOrderNotificationProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotalAmount: number
  shippingAmount: number
  totalAmount: number
  deliveryType: 'COURIER' | 'PICKUP_IN_STORE'
  shippingAddress?: {
    fullName: string
    line1: string
    city: string
    postalCode: string
    country: string
  }
}

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2)}`
}

export function NewOrderNotification({
  orderNumber,
  customerName,
  customerEmail,
  items,
  subtotalAmount,
  shippingAmount,
  totalAmount,
  deliveryType,
  shippingAddress,
}: NewOrderNotificationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New order #{orderNumber.slice(-8).toUpperCase()} from {customerName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>Weedej — New Order</Text>
          <Text style={heading}>New Order Received</Text>

          <Section style={infoBox}>
            <Text style={infoLabel}>Order #</Text>
            <Text style={infoValue}>{orderNumber.slice(-8).toUpperCase()}</Text>
            <Text style={infoLabel}>Customer</Text>
            <Text style={infoValue}>{customerName} ({customerEmail})</Text>
            <Text style={infoLabel}>Delivery</Text>
            <Text style={infoValue}>{deliveryType === 'PICKUP_IN_STORE' ? 'Pickup in Store' : 'Courier'}</Text>
          </Section>

          {shippingAddress && (
            <Section style={infoBox}>
              <Text style={infoLabel}>Ship to</Text>
              <Text style={infoValue}>
                {shippingAddress.fullName}{'\n'}
                {shippingAddress.line1}{'\n'}
                {shippingAddress.postalCode} {shippingAddress.city}{'\n'}
                {shippingAddress.country}
              </Text>
            </Section>
          )}

          <Text style={sectionTitle}>Items</Text>
          {items.map((item, i) => (
            <Row key={i} style={itemRow}>
              <Column>
                <Text style={itemName}>{item.productName}</Text>
                <Text style={itemVariant}>{item.variantLabel} × {item.quantity}</Text>
              </Column>
              <Column style={priceCol}>
                <Text style={itemPrice}>{formatPrice(item.unitPrice * item.quantity)}</Text>
              </Column>
            </Row>
          ))}

          <Hr style={divider} />

          <Row style={totalRow}>
            <Column><Text style={totalLabel}>Subtotal</Text></Column>
            <Column><Text style={totalVal}>{formatPrice(subtotalAmount)}</Text></Column>
          </Row>
          <Row style={totalRow}>
            <Column><Text style={totalLabel}>Shipping</Text></Column>
            <Column><Text style={totalVal}>{shippingAmount === 0 ? 'Free' : formatPrice(shippingAmount)}</Text></Column>
          </Row>
          <Row style={totalRow}>
            <Column><Text style={grandLabel}>Total</Text></Column>
            <Column><Text style={grandVal}>{formatPrice(totalAmount)}</Text></Column>
          </Row>

          <Hr style={divider} />
          <Text style={footer}>Weedej Admin Notification</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#F8F9FA', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { backgroundColor: '#ffffff', border: '1px solid #DEE2E6', borderRadius: '12px', margin: '40px auto', padding: '40px', maxWidth: '520px' }
const logo = { color: '#2E7D32', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }
const heading = { color: '#1d1d1f', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }
const infoBox = { backgroundColor: '#F8F9FA', borderRadius: '8px', padding: '16px', marginBottom: '16px' }
const infoLabel = { color: '#6e6e73', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 2px 0' }
const infoValue = { color: '#1d1d1f', fontSize: '14px', fontWeight: '500', margin: '0 0 10px 0', whiteSpace: 'pre-line' as const }
const sectionTitle = { color: '#1d1d1f', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }
const itemRow = { marginBottom: '8px' }
const itemName = { color: '#1d1d1f', fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0' }
const itemVariant = { color: '#6e6e73', fontSize: '13px', margin: '0' }
const priceCol = { textAlign: 'right' as const, verticalAlign: 'top' as const }
const itemPrice = { color: '#1d1d1f', fontSize: '14px', margin: '0' }
const divider = { borderColor: '#DEE2E6', marginTop: '16px', marginBottom: '16px' }
const totalRow = { marginBottom: '4px' }
const totalLabel = { color: '#6e6e73', fontSize: '13px', margin: '0' }
const totalVal = { color: '#1d1d1f', fontSize: '13px', textAlign: 'right' as const, margin: '0' }
const grandLabel = { color: '#1d1d1f', fontSize: '15px', fontWeight: '700', margin: '0' }
const grandVal = { color: '#2E7D32', fontSize: '15px', fontWeight: '700', textAlign: 'right' as const, margin: '0' }
const footer = { color: '#aeaeb2', fontSize: '11px' }
