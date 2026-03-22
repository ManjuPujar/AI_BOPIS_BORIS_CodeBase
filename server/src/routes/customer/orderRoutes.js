const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  lookupGuestOrders,
  getPickupOtp,
} = require('../../controllers/customer/orderController');
const customerAuth = require('../../middleware/customerAuth');
const optionalCustomerAuth = require('../../middleware/optionalCustomerAuth');
const validateRequest = require('../../middleware/validateRequest');
const { createOrderValidation } = require('../../validators/orderValidator');

router.post('/', optionalCustomerAuth, createOrderValidation, validateRequest, createOrder);
router.get('/', customerAuth, getMyOrders);
router.get('/guest/lookup', lookupGuestOrders);
router.get('/:orderId', optionalCustomerAuth, getOrderById);
router.post('/:orderId/cancel', customerAuth, cancelOrder);
router.get('/:orderId/pickup-otp', optionalCustomerAuth, getPickupOtp);

module.exports = router;
