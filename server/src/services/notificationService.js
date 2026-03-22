const emailService = require('./emailService');
const Customer = require('../models/Customer');
const { ORDER_STATUSES } = require('../utils/constants');
const logger = require('../utils/logger');

const notifyStoreNewOrder = async (storeId, order) => {
  logger.info(
    `[NOTIFICATION] New order ${order.orderNumber} for store ${storeId}. ` +
    `Items: ${order.items ? order.items.length : 'N/A'}. Total: $${order.total}`
  );

  // In production: push via WebSocket to store portal
  // io.to(`store_${storeId}`).emit('new_order', order);
};

const notifyCustomerOrderUpdate = async (customerId, order, newStatus) => {
  logger.info(
    `[NOTIFICATION] Order ${order.orderNumber} status updated to ${newStatus} ` +
    `for customer ${customerId}`
  );

  try {
    const customer = await Customer.findById(customerId).select('email firstName');
    if (!customer) return;

    switch (newStatus) {
      case ORDER_STATUSES.READY_FOR_PICKUP:
        await emailService.sendPickupReadyEmail(customer.email, order);
        break;

      case ORDER_STATUSES.CANCELLED:
        await emailService.sendEmail({
          to: customer.email,
          subject: `Order ${order.orderNumber} Cancelled`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #000;">Order Cancelled</h1>
              <p>Hi ${customer.firstName},</p>
              <p>Your order <strong>${order.orderNumber}</strong> has been cancelled.</p>
              ${order.cancelReason ? `<p><strong>Reason:</strong> ${order.cancelReason}</p>` : ''}
              <p>If you have any questions, please contact our support team.</p>
              <hr />
              <p style="color: #666; font-size: 12px;">Converse - BOPIS Service</p>
            </div>
          `,
        });
        break;

      case ORDER_STATUSES.COMPLETED:
        await emailService.sendEmail({
          to: customer.email,
          subject: `Order ${order.orderNumber} Completed`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #000;">Order Complete</h1>
              <p>Hi ${customer.firstName},</p>
              <p>Your order <strong>${order.orderNumber}</strong> has been completed. Thank you for shopping with Converse!</p>
              <hr />
              <p style="color: #666; font-size: 12px;">Converse - BOPIS Service</p>
            </div>
          `,
        });
        break;

      default:
        break;
    }
  } catch (error) {
    logger.error(`Failed to send notification for order ${order.orderNumber}: ${error.message}`);
  }
};

const notifyCustomerReturnUpdate = async (customerId, returnData) => {
  logger.info(
    `[NOTIFICATION] Return ${returnData.returnNumber} updated to ${returnData.status} ` +
    `for customer ${customerId}`
  );

  try {
    const customer = await Customer.findById(customerId).select('email');
    if (!customer) return;

    await emailService.sendReturnConfirmationEmail(customer.email, returnData);
  } catch (error) {
    logger.error(
      `Failed to send return notification for ${returnData.returnNumber}: ${error.message}`
    );
  }
};

module.exports = {
  notifyStoreNewOrder,
  notifyCustomerOrderUpdate,
  notifyCustomerReturnUpdate,
};
