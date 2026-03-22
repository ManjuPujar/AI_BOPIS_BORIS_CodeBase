const mongoose = require('mongoose');
const crypto = require('crypto');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const Product = require('../models/Product');
const Return = require('../models/Return');
const ReturnItem = require('../models/ReturnItem');
const inventoryService = require('./inventoryService');
const InventoryTransaction = require('../models/InventoryTransaction');
const Customer = require('../models/Customer');
const { ORDER_STATUSES, isValidTransition, DELIVERY_METHODS } = require('../utils/constants');
const logger = require('../utils/logger');

const OTP_EXPIRY_HOURS = 24;
const MAX_OTP_ATTEMPTS = 5;

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

const ACCEPTANCE_WINDOW_MS = 8 * 60 * 60 * 1000;

const createOrder = async ({ customerId, deliveryMethod, storeId, items, shippingAddress, guestInfo }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId.toString());
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      const unitPrice = product.salePrice || product.basePrice;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        productId: item.productId,
        sku: item.sku || product.sku,
        productName: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    if (deliveryMethod === DELIVERY_METHODS.SHIP_TO_STORE) {
      const inventoryItems = orderItems.map((oi) => ({
        productId: oi.productId,
        sku: oi.sku,
        size: oi.size,
        quantity: oi.quantity,
      }));

      await inventoryService.reserveStoreInventory(storeId, inventoryItems, session);
    } else if (deliveryMethod === DELIVERY_METHODS.SHIP_TO_ME) {
      const inventoryItems = orderItems.map((oi) => ({
        productId: oi.productId,
        sku: oi.sku,
        size: oi.size,
        quantity: oi.quantity,
      }));

      const availability = await inventoryService.checkDigitalAvailability(inventoryItems);
      if (!availability.available) {
        throw new Error('Some items are not available for shipping');
      }
    }

    let customerEmail = null;
    let customerName = null;
    let customerPhone = null;
    const isGuest = !customerId;

    if (customerId) {
      const customer = await Customer.findById(customerId).select('firstName lastName email phone').session(session);
      if (customer) {
        customerEmail = customer.email;
        customerName = `${customer.firstName} ${customer.lastName}`.trim();
        customerPhone = customer.phone || null;
      }
    } else if (guestInfo) {
      customerEmail = guestInfo.email || null;
      customerName = `${guestInfo.firstName || ''} ${guestInfo.lastName || ''}`.trim() || null;
      customerPhone = guestInfo.phone || null;
    }

    const initialStatus =
      deliveryMethod === DELIVERY_METHODS.SHIP_TO_STORE
        ? ORDER_STATUSES.AWAITING_STORE_ACCEPTANCE
        : ORDER_STATUSES.PLACED;

    const [order] = await Order.create(
      [
        {
          customerId: customerId || undefined,
          customerEmail: customerEmail || undefined,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          isGuest: !!isGuest,
          guestEmail: isGuest && guestInfo ? guestInfo.email : undefined,
          guestPhone: isGuest && guestInfo ? guestInfo.phone : undefined,
          guestFirstName: isGuest && guestInfo ? guestInfo.firstName : undefined,
          guestLastName: isGuest && guestInfo ? guestInfo.lastName : undefined,
          deliveryMethod,
          storeId: deliveryMethod === DELIVERY_METHODS.SHIP_TO_STORE ? storeId : undefined,
          status: initialStatus,
          shippingAddress:
            deliveryMethod === DELIVERY_METHODS.SHIP_TO_ME ? shippingAddress : undefined,
          subtotal,
          tax,
          total,
        },
      ],
      { session }
    );

    const itemDocs = orderItems.map((oi) => ({ ...oi, orderId: order._id }));
    const createdItems = await OrderItem.create(itemDocs, { session });

    await OrderStatusHistory.create(
      [
        {
          orderId: order._id,
          fromStatus: null,
          toStatus: initialStatus,
          changedBy: { userType: customerId ? 'customer' : 'guest', userId: customerId || undefined },
          notes: 'Order placed',
        },
      ],
      { session }
    );

    await session.commitTransaction();

    if (deliveryMethod === DELIVERY_METHODS.SHIP_TO_STORE) {
      await InventoryTransaction.updateMany(
        { storeId, referenceType: 'order', referenceId: null, transactionType: 'RESERVE' },
        { referenceId: order._id }
      );
    }

    logger.info(`Order created: ${order.orderNumber} by customer ${customerId}`);

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'firstName lastName email')
      .populate('storeId', 'name storeCode address');

    return {
      ...populatedOrder.toObject(),
      items: createdItems,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Order creation failed: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

const getCustomerOrders = async (customerId, page = 1, limit = 10, customerEmail) => {
  const skip = (page - 1) * limit;

  const query = customerEmail
    ? { $or: [{ customerId }, { guestEmail: customerEmail.toLowerCase() }] }
    : { customerId };

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('storeId', 'name storeCode address')
      .lean(),
    Order.countDocuments(query),
  ]);

  const orderIds = orders.map((o) => o._id);
  const items = await OrderItem.find({ orderId: { $in: orderIds } })
    .populate('productId', 'images')
    .lean();

  const itemsByOrder = new Map();
  for (const item of items) {
    const enriched = { ...item, image: item.productId?.images?.[0] || null };
    const key = item.orderId.toString();
    if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
    itemsByOrder.get(key).push(enriched);
  }

  const ordersWithItems = orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order._id.toString()) || [],
  }));

  return {
    orders: ordersWithItems,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getOrderById = async (orderId, customerId, guestEmail) => {
  const order = await Order.findById(orderId)
    .populate('customerId', 'firstName lastName email')
    .populate('storeId', 'name storeCode address phone');

  if (!order) {
    throw new Error('Order not found');
  }

  if (customerId && order.customerId && order.customerId._id.toString() === customerId.toString()) {
    // Authenticated owner access
  } else if (customerId && !order.customerId) {
    // Logged-in user viewing a guest order (may have been created while token was stale)
  } else if (!customerId && guestEmail && order.isGuest && order.guestEmail === guestEmail.toLowerCase()) {
    // Guest access via email match
  } else if (guestEmail && order.guestEmail === guestEmail.toLowerCase()) {
    // Email-based access (fallback for any user providing matching email)
  } else if (guestEmail && order.customerEmail === guestEmail.toLowerCase()) {
    // Email-based access via customerEmail
  } else if (customerId && order.customerId && order.customerId._id.toString() !== customerId.toString()) {
    throw new Error('Unauthorized access to order');
  } else if (!customerId && !guestEmail) {
    throw new Error('Authentication required');
  }

  const [rawItems, statusHistory, returns] = await Promise.all([
    OrderItem.find({ orderId }).populate('productId', 'images').lean(),
    OrderStatusHistory.find({ orderId }).sort({ createdAt: 1 }).lean(),
    Return.find({ orderId }).populate('storeId', 'name').lean(),
  ]);

  const items = rawItems.map((item) => ({
    ...item,
    image: item.productId?.images?.[0] || null,
  }));

  let returnItems = [];
  if (returns.length > 0) {
    const returnIds = returns.map((r) => r._id);
    returnItems = await ReturnItem.find({ returnId: { $in: returnIds } }).lean();
  }
  const returnsWithItems = returns.map((r) => ({
    ...r,
    items: returnItems.filter((ri) => ri.returnId.toString() === r._id.toString()),
  }));

  return {
    ...order.toObject(),
    items,
    statusHistory,
    returns: returnsWithItems,
  };
};

const getStoreOrders = async (storeId, status, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const query = {};
  if (storeId) query.storeId = storeId;
  if (status) query.status = status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'firstName lastName email phone')
      .lean(),
    Order.countDocuments(query),
  ]);

  const orderIds = orders.map((o) => o._id);
  const items = await OrderItem.find({ orderId: { $in: orderIds } })
    .populate('productId', 'images')
    .lean();

  const itemsByOrder = new Map();
  for (const item of items) {
    const enriched = { ...item, image: item.productId?.images?.[0] || null };
    const key = item.orderId.toString();
    if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
    itemsByOrder.get(key).push(enriched);
  }

  const ordersWithItems = orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order._id.toString()) || [],
  }));

  return {
    orders: ordersWithItems,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getStoreOrderById = async (orderId, storeId) => {
  const query = { _id: orderId };
  if (storeId) query.storeId = storeId;

  const order = await Order.findOne(query)
    .populate('customerId', 'firstName lastName email phone')
    .populate('storeId', 'name storeCode address phone');

  if (!order) {
    throw new Error('Order not found for this store');
  }

  const [rawItems, statusHistory] = await Promise.all([
    OrderItem.find({ orderId }).populate('productId', 'images').lean(),
    OrderStatusHistory.find({ orderId }).sort({ createdAt: 1 }).lean(),
  ]);

  const items = rawItems.map((item) => ({
    ...item,
    image: item.productId?.images?.[0] || null,
  }));

  return {
    ...order.toObject(),
    items,
    statusHistory,
  };
};

const acceptOrder = async (orderId, storeId, pickupReadyTime, storeUserId) => {
  const query = { _id: orderId };
  if (storeId) query.storeId = storeId;
  const order = await Order.findOne(query);
  if (!order) {
    throw new Error('Order not found for this store');
  }

  const elapsed = Date.now() - new Date(order.createdAt).getTime();
  if (elapsed > ACCEPTANCE_WINDOW_MS) {
    throw new Error('Cannot accept this order. The 8-hour acceptance window has expired. Please reject the order instead.');
  }

  if (!isValidTransition(order.status, ORDER_STATUSES.ACCEPTED)) {
    throw new Error(`Cannot accept order in status: ${order.status}`);
  }

  const previousStatus = order.status;
  order.status = ORDER_STATUSES.ACCEPTED;
  if (pickupReadyTime) {
    order.pickupReadyTime = pickupReadyTime;
  }
  await order.save();

  await OrderStatusHistory.create({
    orderId: order._id,
    fromStatus: previousStatus,
    toStatus: ORDER_STATUSES.ACCEPTED,
    changedBy: { userType: 'store_employee', userId: storeUserId },
    notes: 'Order accepted by store',
  });

  logger.info(`Order ${order.orderNumber} accepted by store ${storeId}`);

  return Order.findById(orderId)
    .populate('customerId', 'firstName lastName email phone')
    .populate('storeId', 'name storeCode address');
};

const updateOrderStatus = async (orderId, newStatus, changedBy) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (!isValidTransition(order.status, newStatus)) {
    throw new Error(`Invalid status transition: ${order.status} -> ${newStatus}`);
  }

  const previousStatus = order.status;
  order.status = newStatus;

  if (newStatus === ORDER_STATUSES.READY_FOR_PICKUP) {
    const plainOtp = generateOtp();
    order.pickupOtpHash = hashOtp(plainOtp);
    order.pickupOtpPlain = plainOtp;
    order.otpGeneratedAt = new Date();
    order.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_HOURS * 60 * 60 * 1000);
    order.otpVerificationStatus = 'PENDING';
    order.otpAttempts = 0;
    order._plainOtp = plainOtp;
  }

  if (newStatus === ORDER_STATUSES.PICKED_UP) {
    order.pickupCompletedTime = new Date();
  }

  if (newStatus === ORDER_STATUSES.CANCELLED && order.storeId) {
    const items = await OrderItem.find({ orderId }).lean();
    const inventoryItems = items.map((item) => ({
      productId: item.productId,
      sku: item.sku,
      size: item.size,
      quantity: item.quantity,
    }));
    await inventoryService.releaseStoreInventory(order.storeId, inventoryItems);
  }

  await order.save();

  await OrderStatusHistory.create({
    orderId: order._id,
    fromStatus: previousStatus,
    toStatus: newStatus,
    changedBy,
  });

  logger.info(`Order ${order.orderNumber} status updated: ${previousStatus} -> ${newStatus}`);

  const result = await Order.findById(orderId)
    .populate('customerId', 'firstName lastName email')
    .populate('storeId', 'name storeCode address');

  const resultObj = result.toObject();
  if (order._plainOtp) {
    resultObj.pickupOtp = order._plainOtp;
  }

  return resultObj;
};

const getPickupOtp = async (orderId, customerId, guestEmail) => {
  const order = await Order.findById(orderId).select('+pickupOtpHash +pickupOtpPlain');
  if (!order) throw new Error('Order not found');

  const emailMatch = guestEmail && (
    (order.guestEmail && order.guestEmail === guestEmail.toLowerCase()) ||
    (order.customerEmail && order.customerEmail === guestEmail.toLowerCase())
  );
  if (customerId && order.customerId && order.customerId.toString() === customerId.toString()) {
    // Owner access
  } else if (emailMatch) {
    // Email-based access
  } else if (customerId && !order.customerId) {
    // Logged-in user, guest order
  } else if (customerId && order.customerId && order.customerId.toString() !== customerId.toString()) {
    throw new Error('Unauthorized');
  } else if (!customerId && !guestEmail) {
    throw new Error('Authentication required');
  }

  const readyStatuses = [ORDER_STATUSES.READY_FOR_PICKUP, ORDER_STATUSES.OTP_VERIFIED, ORDER_STATUSES.PICKED_UP, ORDER_STATUSES.COMPLETED];
  if (!readyStatuses.includes(order.status)) {
    return { hasOtp: false };
  }

  if (!order.pickupOtpHash || !order.otpExpiresAt) {
    return { hasOtp: false };
  }

  const expired = new Date() > new Date(order.otpExpiresAt);
  const verified = order.otpVerificationStatus === 'VERIFIED';

  return {
    hasOtp: true,
    pickupOtp: order.pickupOtpPlain || null,
    otpExpiresAt: order.otpExpiresAt,
    otpVerificationStatus: expired && !verified ? 'EXPIRED' : order.otpVerificationStatus,
    otpVerifiedAt: order.otpVerifiedAt,
  };
};

const verifyPickupOtp = async (orderId, otp, storeId, storeUserId) => {
  const otpQuery = { _id: orderId };
  if (storeId) otpQuery.storeId = storeId;
  const order = await Order.findOne(otpQuery).select('+pickupOtpHash');
  if (!order) throw new Error('Order not found for this store');

  if (order.otpVerificationStatus === 'VERIFIED') {
    return { verified: true, message: 'OTP already verified' };
  }

  if (order.status !== ORDER_STATUSES.READY_FOR_PICKUP) {
    throw new Error('Order is not in READY_FOR_PICKUP status');
  }

  if (!order.pickupOtpHash) {
    throw new Error('No OTP generated for this order');
  }

  if (new Date() > new Date(order.otpExpiresAt)) {
    order.otpVerificationStatus = 'EXPIRED';
    await order.save();
    throw new Error('OTP has expired. Please generate a new one.');
  }

  if (order.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new Error('Too many failed attempts. OTP is locked.');
  }

  const otpHash = hashOtp(otp);
  if (otpHash !== order.pickupOtpHash) {
    order.otpAttempts += 1;
    await order.save();
    const remaining = MAX_OTP_ATTEMPTS - order.otpAttempts;
    throw new Error(
      remaining > 0
        ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many failed attempts. OTP is locked.'
    );
  }

  const previousStatus = order.status;
  order.otpVerificationStatus = 'VERIFIED';
  order.otpVerifiedAt = new Date();
  order.status = ORDER_STATUSES.OTP_VERIFIED;
  await order.save();

  await OrderStatusHistory.create({
    orderId: order._id,
    fromStatus: previousStatus,
    toStatus: ORDER_STATUSES.OTP_VERIFIED,
    changedBy: { userType: 'store_employee', userId: storeUserId },
    notes: 'Pickup OTP verified',
  });

  logger.info(`Order ${order.orderNumber} OTP verified by store ${storeId}`);

  return { verified: true, message: 'OTP verified successfully' };
};

const regeneratePickupOtp = async (orderId, storeId, storeUserId) => {
  const regenQuery = { _id: orderId };
  if (storeId) regenQuery.storeId = storeId;
  const order = await Order.findOne(regenQuery).select('+pickupOtpHash');
  if (!order) throw new Error('Order not found for this store');

  if (order.status !== ORDER_STATUSES.READY_FOR_PICKUP) {
    throw new Error('Can only regenerate OTP for READY_FOR_PICKUP orders');
  }

  const plainOtp = generateOtp();
  order.pickupOtpHash = hashOtp(plainOtp);
  order.pickupOtpPlain = plainOtp;
  order.otpGeneratedAt = new Date();
  order.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_HOURS * 60 * 60 * 1000);
  order.otpVerificationStatus = 'PENDING';
  order.otpAttempts = 0;
  await order.save();

  logger.info(`Order ${order.orderNumber} OTP regenerated by store ${storeId}`);

  return { pickupOtp: plainOtp, otpExpiresAt: order.otpExpiresAt };
};

const cancelOrder = async (orderId, customerId, reason, customerEmail) => {
  const cancelQuery = customerEmail
    ? { _id: orderId, $or: [{ customerId }, { guestEmail: customerEmail.toLowerCase() }] }
    : { _id: orderId, customerId };
  const order = await Order.findOne(cancelQuery);
  if (!order) {
    throw new Error('Order not found');
  }

  const cancellableStatuses = [ORDER_STATUSES.PLACED, ORDER_STATUSES.AWAITING_STORE_ACCEPTANCE];
  if (!cancellableStatuses.includes(order.status)) {
    throw new Error(`Cannot cancel order in status: ${order.status}`);
  }

  const previousStatus = order.status;
  order.status = ORDER_STATUSES.CANCELLED;
  order.cancelReason = reason;

  if (order.storeId) {
    const items = await OrderItem.find({ orderId }).lean();
    const inventoryItems = items.map((item) => ({
      productId: item.productId,
      sku: item.sku,
      size: item.size,
      quantity: item.quantity,
    }));
    await inventoryService.releaseStoreInventory(order.storeId, inventoryItems);
  }

  await order.save();

  await OrderStatusHistory.create({
    orderId: order._id,
    fromStatus: previousStatus,
    toStatus: ORDER_STATUSES.CANCELLED,
    changedBy: { userType: 'customer', userId: customerId },
    notes: reason || 'Cancelled by customer',
  });

  logger.info(`Order ${order.orderNumber} cancelled by customer ${customerId}`);

  return order;
};

const lookupGuestOrders = async (email) => {
  const orders = await Order.find({ guestEmail: email.toLowerCase() })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('storeId', 'name storeCode address')
    .lean();

  const orderIds = orders.map((o) => o._id);
  const items = await OrderItem.find({ orderId: { $in: orderIds } })
    .populate('productId', 'images')
    .lean();
  const itemsByOrder = new Map();
  for (const item of items) {
    const enriched = { ...item, image: item.productId?.images?.[0] || null };
    const key = item.orderId.toString();
    if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
    itemsByOrder.get(key).push(enriched);
  }

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order._id.toString()) || [],
  }));
};

const rejectOrder = async (orderId, storeId, storeUserId, reason) => {
  const rejectQuery = { _id: orderId };
  if (storeId) rejectQuery.storeId = storeId;
  const order = await Order.findOne(rejectQuery);
  if (!order) throw new Error('Order not found in this store');
  if (order.status !== 'AWAITING_STORE_ACCEPTANCE') {
    throw new Error('Order can only be rejected from AWAITING_STORE_ACCEPTANCE status');
  }

  const prevStatus = order.status;
  order.status = 'REJECTED';
  order.notes = reason || 'Rejected by store';
  await order.save();

  await OrderStatusHistory.create({
    orderId: order._id,
    fromStatus: prevStatus,
    toStatus: 'REJECTED',
    changedBy: { userType: 'store_employee', userId: storeUserId },
    notes: reason || 'Order rejected by store',
  });

  const orderItems = await OrderItem.find({ orderId: order._id });
  const releaseItems = orderItems.map((oi) => ({
    productId: oi.productId,
    sku: oi.sku,
    size: oi.size,
    quantity: oi.quantity,
  }));
  await inventoryService.releaseStoreInventory(storeId, releaseItems);

  logger.info(`Order ${order.orderNumber} rejected by store ${storeId}`);

  const populatedOrder = await Order.findById(order._id)
    .populate('customerId', 'firstName lastName email')
    .populate('storeId', 'name storeCode address');

  return { ...populatedOrder.toObject(), items: orderItems };
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getStoreOrders,
  getStoreOrderById,
  acceptOrder,
  updateOrderStatus,
  cancelOrder,
  lookupGuestOrders,
  rejectOrder,
  getPickupOtp,
  verifyPickupOtp,
  regeneratePickupOtp,
};
