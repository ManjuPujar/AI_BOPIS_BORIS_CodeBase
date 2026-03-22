const { body, query } = require('express-validator');

const storeSearchValidation = [
  query('zipcode')
    .notEmpty()
    .withMessage('Zipcode is required')
    .isLength({ min: 5, max: 5 })
    .withMessage('Zipcode must be exactly 5 digits')
    .isNumeric()
    .withMessage('Zipcode must contain only numbers'),
];

const acceptOrderValidation = [
  body('pickupReadyTime')
    .notEmpty()
    .withMessage('Pickup ready time is required')
    .isISO8601()
    .withMessage('Pickup ready time must be a valid date'),
];

module.exports = {
  storeSearchValidation,
  acceptOrderValidation,
};
