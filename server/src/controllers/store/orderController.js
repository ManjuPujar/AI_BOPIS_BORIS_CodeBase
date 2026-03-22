const orderService = require('../../services/orderService');
const notificationService = require('../../services/notificationService');

const getStoreOrders = async (req, res, next) => {
  try {
    const storeId = req.query.allStores === 'true' ? null : req.storeUser.storeId;
    const status = req.query.status || null;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await orderService.getStoreOrders(storeId, status, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const storeId = req.query.allStores === 'true' ? null : req.storeUser.storeId;
    const order = await orderService.getStoreOrderById(
      req.params.orderId,
      storeId
    );
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

const acceptOrder = async (req, res, next) => {
  try {
    const { pickupReadyTime } = req.body;
    const order = await orderService.acceptOrder(
      req.params.orderId,
      null,
      pickupReadyTime,
      req.storeUser._id
    );
    res.status(200).json(order);
    notificationService.notifyCustomerOrderUpdate(order.customerId, order, 'ACCEPTED').catch(() => {});
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const changedBy = { userType: 'store_employee', userId: req.storeUser._id };
    const order = await orderService.updateOrderStatus(
      req.params.orderId,
      status,
      changedBy
    );
    res.status(200).json(order);
    notificationService.notifyCustomerOrderUpdate(order.customerId, order, status).catch(() => {});
  } catch (error) {
    next(error);
  }
};

const rejectOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await orderService.rejectOrder(
      req.params.orderId,
      null,
      req.storeUser._id,
      reason
    );
    res.status(200).json(order);
    notificationService.notifyCustomerOrderUpdate(order.customerId, order, 'REJECTED').catch(() => {});
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp || otp.length !== 4) {
      return res.status(400).json({ message: 'A valid 4-digit OTP is required' });
    }
    const result = await orderService.verifyPickupOtp(
      req.params.orderId,
      otp,
      null,
      req.storeUser._id
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const regenerateOtp = async (req, res, next) => {
  try {
    const result = await orderService.regeneratePickupOtp(
      req.params.orderId,
      null,
      req.storeUser._id
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStoreOrders,
  getOrderById,
  acceptOrder,
  updateStatus,
  rejectOrder,
  verifyOtp,
  regenerateOtp,
};
