const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT === 465,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"Converse BOPIS" <${config.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw new Error('Failed to send email');
  }
};

const sendOrderConfirmation = async (customerEmail, order) => {
  const itemsList = order.items
    ? order.items
        .map(
          (item) =>
            `<li>${item.productName} - Size ${item.size} (Qty: ${item.quantity}) - $${item.totalPrice.toFixed(2)}</li>`
        )
        .join('')
    : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000;">Order Confirmed</h1>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Delivery Method:</strong> ${order.deliveryMethod === 'SHIP_TO_STORE' ? 'Pick Up In Store' : 'Ship To Me'}</p>
      <h3>Items:</h3>
      <ul>${itemsList}</ul>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      ${order.deliveryMethod === 'SHIP_TO_STORE' ? '<p>We will notify you when your order is ready for pickup.</p>' : ''}
      <hr />
      <p style="color: #666; font-size: 12px;">Converse - BOPIS Service</p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html,
  });
};

const sendPickupReadyEmail = async (customerEmail, order) => {
  const otpSection = order.pickupOtp
    ? `
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="color: #666; margin: 0 0 8px; font-size: 14px;">Your Pickup Verification Code</p>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #000; font-family: monospace;">${order.pickupOtp}</div>
        <p style="color: #999; margin: 8px 0 0; font-size: 12px;">Show this code to the store associate. Valid for 24 hours. One-time use only.</p>
      </div>
    `
    : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000;">Your Order Is Ready for Pickup!</h1>
      <p>Great news! Your order <strong>${order.orderNumber}</strong> is ready to be picked up.</p>
      ${otpSection}
      ${order.pickupReadyTime ? `<p><strong>Estimated Pickup Time:</strong> ${new Date(order.pickupReadyTime).toLocaleString()}</p>` : ''}
      <p>Please bring your pickup verification code when you come to collect your order.</p>
      <hr />
      <p style="color: #666; font-size: 12px;">Converse - BOPIS Service</p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Your Order ${order.orderNumber} Is Ready for Pickup`,
    html,
  });
};

const sendReturnConfirmationEmail = async (customerEmail, returnData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000;">Return Confirmation</h1>
      <p>Your return <strong>${returnData.returnNumber}</strong> has been processed.</p>
      <p><strong>Status:</strong> ${returnData.status.replace(/_/g, ' ')}</p>
      ${returnData.refundAmount ? `<p><strong>Refund Amount:</strong> $${returnData.refundAmount.toFixed(2)}</p>` : ''}
      <p>If you have any questions, please contact our support team.</p>
      <hr />
      <p style="color: #666; font-size: 12px;">Converse - BOPIS Service</p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Return ${returnData.returnNumber} - ${returnData.status.replace(/_/g, ' ')}`,
    html,
  });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${config.NODE_ENV === 'production' ? 'https://converse.com' : 'http://localhost:3000'}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000;">Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr />
      <p style="color: #666; font-size: 12px;">Converse - BOPIS Service</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset - Converse',
    html,
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendPickupReadyEmail,
  sendReturnConfirmationEmail,
  sendPasswordResetEmail,
};
