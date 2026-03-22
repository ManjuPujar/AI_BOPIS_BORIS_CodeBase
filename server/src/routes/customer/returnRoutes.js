const express = require('express');
const router = express.Router();
const {
  createReturn,
  getMyReturns,
} = require('../../controllers/customer/returnController');
const customerAuth = require('../../middleware/customerAuth');
const validateRequest = require('../../middleware/validateRequest');
const { createReturnValidation } = require('../../validators/returnValidator');

router.use(customerAuth);

router.post('/', createReturnValidation, validateRequest, createReturn);
router.get('/', getMyReturns);

module.exports = router;
