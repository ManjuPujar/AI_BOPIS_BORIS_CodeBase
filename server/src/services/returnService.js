const mongoose = require('mongoose');
const Return = require('../models/Return');
const ReturnItem = require('../models/ReturnItem');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const inventoryService = require('./inventoryService');
const { ORDER_STATUSES, RETURN_STATUSES } = require('../utils/constants');
const logger = require('../utils/logger');

const createReturn = async ({ orderId, customerId, customerEmail, storeId, reason, items }) => {
  const orderQuery = customerEmail
    ? { _id: orderId, $or: [{ customerId }, { guestEmail: customerEmail.toLowerCase() }] }
    : { _id: orderId, customerId };
  const order = await Order.findOne(orderQuery);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== ORDER_STATUSES.COMPLETED) {
    throw new Error(`Cannot create return for order in status: ${order.status}. Order must be COMPLETED.`);
  }

  const orderItems = await OrderItem.find({ orderId }).lean();
  const orderItemMap = new Map(orderItems.map((oi) => [oi._id.toString(), oi]));

  for (const item of items) {
    const oi = orderItemMap.get(item.orderItemId.toString());
    if (!oi) {
      throw new Error(`Order item not found: ${item.orderItemId}`);
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [returnDoc] = await Return.create(
      [
        {
          orderId,
          customerId,
          storeId: storeId || order.storeId,
          status: RETURN_STATUSES.RETURN_REQUESTED,
          reason,
        },
      ],
      { session }
    );

    const returnItems = items.map((item) => {
      const oi = orderItemMap.get(item.orderItemId.toString());
      return {
        returnId: returnDoc._id,
        orderItemId: item.orderItemId,
        productId: oi.productId,
        sku: oi.sku,
        productName: oi.productName,
        size: oi.size,
        color: oi.color,
        quantity: item.quantity || oi.quantity,
        unitPrice: oi.unitPrice,
        condition: item.condition || 'like_new',
      };
    });

    await ReturnItem.create(returnItems, { session });

    const previousStatus = order.status;
    order.status = ORDER_STATUSES.RETURN_REQUESTED;
    await order.save({ session });

    await OrderStatusHistory.create(
      [
        {
          orderId,
          fromStatus: previousStatus,
          toStatus: ORDER_STATUSES.RETURN_REQUESTED,
          changedBy: { userType: 'customer', userId: customerId },
          notes: `Return requested: ${reason}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    logger.info(`Return created: ${returnDoc.returnNumber} for order ${order.orderNumber}`);

    return Return.findById(returnDoc._id).populate('orderId', 'orderNumber total');
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Return creation failed: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

const getReturnById = async (returnId, storeId) => {
  const query = { _id: returnId };
  if (storeId) query.storeId = storeId;
  const returnDoc = await Return.findOne(query)
    .populate('orderId', 'orderNumber total status createdAt deliveryMethod')
    .populate('customerId', 'firstName lastName email phone')
    .populate('storeId', 'name storeCode address')
    .populate('processedBy', 'firstName lastName')
    .lean();

  if (!returnDoc) throw new Error('Return not found');

  const items = await ReturnItem.find({ returnId }).lean();
  returnDoc.items = items;
  return returnDoc;
};

const getCustomerReturns = async (customerId) => {
  return Return.find({ customerId })
    .sort({ createdAt: -1 })
    .populate('orderId', 'orderNumber total')
    .populate('storeId', 'name storeCode address')
    .lean();
};

const getStoreReturns = async (storeId, status) => {
  const query = {};
  if (storeId) query.storeId = storeId;
  if (status) query.status = status;

  const returns = await Return.find(query)
    .sort({ createdAt: -1 })
    .populate('orderId', 'orderNumber total')
    .populate('customerId', 'firstName lastName email phone')
    .lean();

  const returnIds = returns.map((r) => r._id);
  const returnItems = await ReturnItem.find({ returnId: { $in: returnIds } }).lean();

  const itemsByReturn = new Map();
  for (const item of returnItems) {
    const key = item.returnId.toString();
    if (!itemsByReturn.has(key)) itemsByReturn.set(key, []);
    itemsByReturn.get(key).push(item);
  }

  return returns.map((r) => ({
    ...r,
    items: itemsByReturn.get(r._id.toString()) || [],
  }));
};

const acceptReturn = async (returnId, storeId, storeUserId) => {
  const acceptQuery = { _id: returnId };
  if (storeId) acceptQuery.storeId = storeId;
  const returnDoc = await Return.findOne(acceptQuery);
  if (!returnDoc) {
    throw new Error('Return not found for this store');
  }

  if (returnDoc.status !== RETURN_STATUSES.RETURN_REQUESTED) {
    throw new Error(`Cannot accept return in status: ${returnDoc.status}`);
  }

  returnDoc.status = RETURN_STATUSES.RETURN_ACCEPTED;
  returnDoc.processedBy = storeUserId;
  await returnDoc.save();

  const order = await Order.findById(returnDoc.orderId);
  if (order) {
    const previousStatus = order.status;
    order.status = ORDER_STATUSES.RETURN_ACCEPTED;
    await order.save();

    await OrderStatusHistory.create({
      orderId: order._id,
      fromStatus: previousStatus,
      toStatus: ORDER_STATUSES.RETURN_ACCEPTED,
      changedBy: { userType: 'store_employee', userId: storeUserId },
      notes: 'Return accepted by store',
    });
  }

  logger.info(`Return ${returnDoc.returnNumber} accepted by store ${storeId}`);

  return Return.findById(returnId)
    .populate('orderId', 'orderNumber total')
    .populate('storeId', 'name storeCode');
};

const completeReturn = async (returnId, storeId, storeUserId) => {
  const completeQuery = { _id: returnId };
  if (storeId) completeQuery.storeId = storeId;
  const returnDoc = await Return.findOne(completeQuery);
  if (!returnDoc) {
    throw new Error('Return not found for this store');
  }

  const allowedForComplete = [
    RETURN_STATUSES.RETURN_VERIFIED_PASS,
    RETURN_STATUSES.RETURN_ACCEPTED,
  ];
  if (!allowedForComplete.includes(returnDoc.status)) {
    throw new Error('Return must be verified (pass) before it can be completed. Please verify the returned product first.');
  }

  const returnItems = await ReturnItem.find({ returnId }).lean();

  const inventoryItems = returnItems.map((item) => ({
    productId: item.productId,
    sku: item.sku,
    size: item.size,
    quantity: item.quantity,
  }));

  await inventoryService.restoreStoreInventory(returnDoc.storeId || storeId, inventoryItems);

  const refundAmount = returnItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  returnDoc.status = RETURN_STATUSES.RETURN_COMPLETED;
  returnDoc.processedBy = storeUserId;
  returnDoc.processedAt = new Date();
  returnDoc.refundAmount = parseFloat(refundAmount.toFixed(2));
  await returnDoc.save();

  const order = await Order.findById(returnDoc.orderId);
  if (order) {
    const previousStatus = order.status;
    order.status = ORDER_STATUSES.RETURN_COMPLETED;
    await order.save();

    await OrderStatusHistory.create({
      orderId: order._id,
      fromStatus: previousStatus,
      toStatus: ORDER_STATUSES.RETURN_COMPLETED,
      changedBy: { userType: 'store_employee', userId: storeUserId },
      notes: `Return completed. Refund: $${refundAmount.toFixed(2)}`,
    });
  }

  logger.info(
    `Return ${returnDoc.returnNumber} completed. Refund: $${refundAmount.toFixed(2)}`
  );

  return Return.findById(returnId)
    .populate('orderId', 'orderNumber total')
    .populate('storeId', 'name storeCode');
};

const rejectReturn = async (returnId, storeId, storeUserId, reason) => {
  const rejectQuery = { _id: returnId };
  if (storeId) rejectQuery.storeId = storeId;
  const ret = await Return.findOne(rejectQuery);
  if (!ret) throw new Error('Return not found');
  if (ret.status !== 'RETURN_REQUESTED') {
    throw new Error('Return can only be rejected when in RETURN_REQUESTED status');
  }

  ret.status = 'RETURN_REJECTED';
  ret.processedBy = storeUserId;
  ret.processedAt = new Date();
  ret.notes = reason || 'Rejected by store';
  await ret.save();

  await Order.findByIdAndUpdate(ret.orderId, { status: 'RETURN_REJECTED' });
  await OrderStatusHistory.create({
    orderId: ret.orderId,
    fromStatus: 'RETURN_REQUESTED',
    toStatus: 'RETURN_REJECTED',
    changedBy: { userType: 'store_employee', userId: storeUserId },
    notes: reason || 'Return rejected by store',
  });

  logger.info(`Return ${ret.returnNumber} rejected`);
  return ret;
};

const verifyReturnProduct = async (returnId, storeId, storeUserId, passed) => {
  const verifyQuery = { _id: returnId };
  if (storeId) verifyQuery.storeId = storeId;
  const ret = await Return.findOne(verifyQuery);
  if (!ret) throw new Error('Return not found');
  if (ret.status !== 'RETURN_ACCEPTED') {
    throw new Error('Return must be in RETURN_ACCEPTED status for verification');
  }

  const returnStatus = passed ? 'RETURN_VERIFIED_PASS' : 'RETURN_VERIFIED_FAIL';
  const orderStatus = passed ? 'RETURN_VERIFIED_PASS' : 'RETURN_VERIFIED_FAIL';

  ret.status = returnStatus;
  ret.processedBy = storeUserId;
  await ret.save();

  await Order.findByIdAndUpdate(ret.orderId, { status: orderStatus });
  await OrderStatusHistory.create({
    orderId: ret.orderId,
    fromStatus: 'RETURN_ACCEPTED',
    toStatus: orderStatus,
    changedBy: { userType: 'store_employee', userId: storeUserId },
    notes: passed ? 'Product verified — passed inspection' : 'Product verification failed',
  });

  logger.info(`Return ${ret.returnNumber} verification: ${passed ? 'PASS' : 'FAIL'}`);
  return Return.findById(returnId)
    .populate('orderId', 'orderNumber total')
    .populate('customerId', 'firstName lastName email phone')
    .populate('storeId', 'name storeCode address');
};

const cancelReturn = async (returnId, storeId, storeUserId, reason) => {
  const cancelQuery = { _id: returnId };
  if (storeId) cancelQuery.storeId = storeId;
  const ret = await Return.findOne(cancelQuery);
  if (!ret) throw new Error('Return not found');
  const cancellable = ['RETURN_REQUESTED', 'RETURN_ACCEPTED', 'RETURN_VERIFIED_FAIL'];
  if (!cancellable.includes(ret.status)) {
    throw new Error('Return cannot be cancelled in its current status');
  }

  const prevStatus = ret.status;
  ret.status = 'RETURN_CANCELLED';
  ret.processedBy = storeUserId;
  ret.processedAt = new Date();
  ret.notes = reason || 'Cancelled by store';
  await ret.save();

  await Order.findByIdAndUpdate(ret.orderId, { status: 'RETURN_CANCELLED' });
  await OrderStatusHistory.create({
    orderId: ret.orderId,
    fromStatus: prevStatus,
    toStatus: 'RETURN_CANCELLED',
    changedBy: { userType: 'store_employee', userId: storeUserId },
    notes: reason || 'Return cancelled',
  });

  logger.info(`Return ${ret.returnNumber} cancelled`);
  return ret;
};

module.exports = {
  createReturn,
  getReturnById,
  getCustomerReturns,
  getStoreReturns,
  acceptReturn,
  completeReturn,
  rejectReturn,
  verifyReturnProduct,
  cancelReturn,
};
