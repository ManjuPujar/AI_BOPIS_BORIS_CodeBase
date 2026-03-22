const { body } = require('express-validator');

const createReturnValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required'),
  body('storeId')
    .notEmpty()
    .withMessage('Store ID is required'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Return reason is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item must be included in the return'),
];

module.exports = {
  createReturnValidation,
};
