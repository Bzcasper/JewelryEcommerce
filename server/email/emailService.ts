import nodemailer from 'nodemailer';
import { renderAsync } from '@react-email/components';
import OrderConfirmationEmail from './templates/OrderConfirmation';
import type { Order, Product } from '@shared/schema';

// Create reusable transporter
const createTransporter = () => {
  const emailConfig = {
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
      user: process.env.EMAIL_SERVER_USER || '',
      pass: process.env.EMAIL_SERVER_PASSWORD || '',
    },
  };

  return nodemailer.createTransporter(emailConfig);
};

export interface OrderEmailData {
  order: Order;
  products: Product[];
  customerEmail: string;
  customerName: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const transporter = createTransporter();
    
    // Render the email HTML
    const emailHtml = await renderAsync(
      OrderConfirmationEmail({
        orderNumber: data.order.id.toString(),
        customerName: data.customerName,
        products: data.products.map(product => ({
          name: product.title,
          price: parseFloat(product.price),
          quantity: 1,
          image: product.mainImageUrl || '',
        })),
        total: parseFloat(data.order.total),
        shippingAddress: data.order.shippingAddress,
        orderDate: new Date(data.order.createdAt),
      })
    );

    // Send email
    const info = await transporter.sendMail({
      from: `"Luxury Jewelry" <${process.env.EMAIL_FROM || 'noreply@luxuryjewelry.com'}>`,
      to: data.customerEmail,
      subject: `Order Confirmation #${data.order.id}`,
      html: emailHtml,
    });

    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const transporter = createTransporter();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1C274C; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to Luxury Jewelry</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Hello ${name},</h2>
          <p>Welcome to our exclusive collection of authenticated luxury jewelry. We're thrilled to have you join our community of discerning collectors.</p>
          <p>As a member, you'll enjoy:</p>
          <ul>
            <li>Access to rare and authenticated vintage pieces</li>
            <li>AI-powered jewelry authentication service</li>
            <li>Exclusive member-only collections</li>
            <li>Priority customer support</li>
          </ul>
          <p style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products" 
               style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Browse Collection
            </a>
          </p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666;">
          <p>&copy; 2025 Luxury Jewelry. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Luxury Jewelry" <${process.env.EMAIL_FROM || 'noreply@luxuryjewelry.com'}>`,
      to: email,
      subject: 'Welcome to Luxury Jewelry',
      html: emailHtml,
    });

    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}