const { body } = require('express-validator');
const { DELIVERY_METHODS } = require('../utils/constants');

const deliveryValues = Object.values(DELIVERY_METHODS);

const createOrderValidation = [
  body().custom((_, { req }) => {
    const hasDirect = req.body.deliveryMethod && deliveryValues.includes(req.body.deliveryMethod);
    const hasFulfillment = req.body.fulfillment && req.body.fulfillment.method;
    if (!hasDirect && !hasFulfillment) {
      throw new Error('Delivery method is required (deliveryMethod or fulfillment.method)');
    }
    return true;
  }),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.size')
    .notEmpty()
    .withMessage('Size is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1 for each item'),
];

const updateOrderStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required'),
];

module.exports = {
  createOrderValidation,
  updateOrderStatusValidation,
};
