const orderService = require('../../services/orderService');
const notificationService = require('../../services/notificationService');

const createOrder = async (req, res, next) => {
  try {
    const customerId = req.customer ? req.customer._id : null;
    let guestInfo = null;
    if (!customerId) {
      const { contactInfo } = req.body;
      if (!contactInfo || !contactInfo.email) {
        return res.status(400).json({ message: 'Email is required for guest checkout' });
      }
      guestInfo = contactInfo;
    }

    const { fulfillment, items, contactInfo } = req.body;
    let deliveryMethod = req.body.deliveryMethod;
    let storeId = req.body.storeId;
    let shippingAddress = req.body.shippingAddress;

    if (fulfillment) {
      if (fulfillment.method === 'pickup') {
        deliveryMethod = 'SHIP_TO_STORE';
        storeId = fulfillment.store?.storeId || fulfillment.store?._id || storeId;
      } else {
        deliveryMethod = 'SHIP_TO_ME';
        shippingAddress = fulfillment.shippingAddress || shippingAddress;
      }
    }

    if (!guestInfo && contactInfo) {
      guestInfo = contactInfo;
    }

    const orderData = { customerId, deliveryMethod, storeId, items, shippingAddress, guestInfo };
    const order = await orderService.createOrder(orderData);
    if (order.storeId) {
      await notificationService.notifyStoreNewOrder(order.storeId, order);
    }
    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await orderService.getCustomerOrders(req.customer._id, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const customerId = req.customer ? req.customer._id : null;
    const guestEmail = req.query.email || null;
    const order = await orderService.getOrderById(req.params.orderId, customerId, guestEmail);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await orderService.cancelOrder(req.params.orderId, req.customer._id, reason);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

const lookupGuestOrders = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const orders = await orderService.lookupGuestOrders(email);
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};

const getPickupOtp = async (req, res, next) => {
  try {
    const customerId = req.customer ? req.customer._id : null;
    const guestEmail = req.query.email || null;
    const result = await orderService.getPickupOtp(req.params.orderId, customerId, guestEmail);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  lookupGuestOrders,
  getPickupOtp,
};
