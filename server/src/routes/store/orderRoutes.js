const express = require('express');
const router = express.Router();
const {
  getStoreOrders,
  getOrderById,
  acceptOrder,
  updateStatus,
  rejectOrder,
  verifyOtp,
  regenerateOtp,
} = require('../../controllers/store/orderController');
const storeAuth = require('../../middleware/storeAuth');
const validateRequest = require('../../middleware/validateRequest');
const { acceptOrderValidation } = require('../../validators/storeValidator');
const { updateOrderStatusValidation } = require('../../validators/orderValidator');

router.use(storeAuth);

router.get('/', getStoreOrders);
router.get('/:orderId', getOrderById);
router.post('/:orderId/accept', acceptOrderValidation, validateRequest, acceptOrder);
router.patch('/:orderId/status', updateOrderStatusValidation, validateRequest, updateStatus);
router.post('/:orderId/reject', rejectOrder);
router.post('/:orderId/verify-otp', verifyOtp);
router.post('/:orderId/regenerate-otp', regenerateOtp);

module.exports = router;
