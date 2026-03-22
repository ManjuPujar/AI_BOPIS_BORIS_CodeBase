const express = require('express');
const router = express.Router();
const {
  searchStores,
  getStoreById,
  getStoreInventory,
} = require('../../controllers/customer/storeController');
const validateRequest = require('../../middleware/validateRequest');
const { storeSearchValidation } = require('../../validators/storeValidator');

router.get('/search', storeSearchValidation, validateRequest, searchStores);
router.get('/:storeId', getStoreById);
router.get('/:storeId/inventory', getStoreInventory);

module.exports = router;
