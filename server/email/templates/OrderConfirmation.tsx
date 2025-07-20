import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface OrderProduct {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  products: OrderProduct[];
  total: number;
  shippingAddress: string;
  orderDate: Date;
}

export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  products,
  total,
  shippingAddress,
  orderDate,
}: OrderConfirmationEmailProps) {
  const previewText = `Order confirmation #${orderNumber} - Thank you for your purchase!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Luxury Jewelry</Heading>
            <Text style={headerSubtitle}>Premium Collection</Text>
          </Section>

          {/* Order Confirmation */}
          <Section style={content}>
            <Heading as="h2" style={orderTitle}>
              Order Confirmed! ✨
            </Heading>
            <Text style={greeting}>
              Dear {customerName},
            </Text>
            <Text style={message}>
              Thank you for your order. We're excited to prepare your luxury jewelry selection for shipping.
            </Text>
            
            <Section style={orderInfo}>
              <Row>
                <Column>
                  <Text style={orderLabel}>Order Number</Text>
                  <Text style={orderValue}>#{orderNumber}</Text>
                </Column>
                <Column>
                  <Text style={orderLabel}>Order Date</Text>
                  <Text style={orderValue}>{orderDate.toLocaleDateString()}</Text>
                </Column>
              </Row>
            </Section>

            {/* Products */}
            <Section style={productsSection}>
              <Heading as="h3" style={sectionTitle}>Your Items</Heading>
              {products.map((product, index) => (
                <Row key={index} style={productRow}>
                  <Column style={productImageCol}>
                    <Img
                      src={product.image}
                      width="80"
                      height="80"
                      alt={product.name}
                      style={productImage}
                    />
                  </Column>
                  <Column style={productDetailsCol}>
                    <Text style={productName}>{product.name}</Text>
                    <Text style={productQuantity}>Quantity: {product.quantity}</Text>
                  </Column>
                  <Column style={productPriceCol}>
                    <Text style={productPrice}>${product.price.toFixed(2)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            {/* Total */}
            <Section style={totalSection}>
              <Row>
                <Column style={totalLabel}>
                  <Text style={totalText}>Total</Text>
                </Column>
                <Column style={totalValue}>
                  <Text style={totalAmount}>${total.toFixed(2)}</Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping */}
            <Section style={shippingSection}>
              <Heading as="h3" style={sectionTitle}>Shipping Address</Heading>
              <Text style={shippingText}>{shippingAddress}</Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button pX={20} pY={12} style={button} href="https://luxuryjewelry.com/account/orders">
                View Order Details
              </Button>
            </Section>

            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>
                Questions? Contact our support team at{' '}
                <Link href="mailto:support@luxuryjewelry.com" style={footerLink}>
                  support@luxuryjewelry.com
                </Link>
              </Text>
              <Text style={copyright}>
                © 2025 Luxury Jewelry. All rights reserved.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  backgroundColor: '#1C274C',
  padding: '24px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const headerSubtitle = {
  color: '#D9A689',
  fontSize: '14px',
  margin: '4px 0 0',
};

const content = {
  padding: '24px',
};

const orderTitle = {
  fontSize: '24px',
  color: '#1C274C',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const greeting = {
  fontSize: '16px',
  color: '#1C274C',
  marginBottom: '8px',
};

const message = {
  fontSize: '14px',
  color: '#616B7C',
  marginBottom: '24px',
  lineHeight: '24px',
};

const orderInfo = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const orderLabel = {
  fontSize: '12px',
  color: '#616B7C',
  margin: '0 0 4px',
};

const orderValue = {
  fontSize: '16px',
  color: '#1C274C',
  fontWeight: 'bold',
  margin: '0',
};

const productsSection = {
  marginBottom: '24px',
};

const sectionTitle = {
  fontSize: '18px',
  color: '#1C274C',
  marginBottom: '16px',
};

const productRow = {
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '16px',
  marginBottom: '16px',
};

const productImageCol = {
  width: '80px',
  paddingRight: '12px',
};

const productImage = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const productDetailsCol = {
  paddingRight: '12px',
};

const productName = {
  fontSize: '14px',
  color: '#1C274C',
  fontWeight: '500',
  margin: '0 0 4px',
};

const productQuantity = {
  fontSize: '12px',
  color: '#616B7C',
  margin: '0',
};

const productPriceCol = {
  textAlign: 'right' as const,
  verticalAlign: 'middle' as const,
};

const productPrice = {
  fontSize: '16px',
  color: '#1C274C',
  fontWeight: 'bold',
  margin: '0',
};

const totalSection = {
  borderTop: '2px solid #1C274C',
  paddingTop: '16px',
  marginBottom: '24px',
};

const totalLabel = {
  textAlign: 'left' as const,
};

const totalText = {
  fontSize: '16px',
  color: '#1C274C',
  margin: '0',
};

const totalValue = {
  textAlign: 'right' as const,
};

const totalAmount = {
  fontSize: '24px',
  color: '#DC2626',
  fontWeight: 'bold',
  margin: '0',
};

const shippingSection = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '32px',
};

const shippingText = {
  fontSize: '14px',
  color: '#616B7C',
  margin: '0',
  lineHeight: '24px',
};

const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#DC2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  fontSize: '12px',
  color: '#616B7C',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#DC2626',
  textDecoration: 'underline',
};

const copyright = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
};