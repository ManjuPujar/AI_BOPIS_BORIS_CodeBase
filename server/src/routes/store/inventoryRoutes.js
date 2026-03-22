const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItem,
  updateInventory,
} = require('../../controllers/store/inventoryController');
const storeAuth = require('../../middleware/storeAuth');

router.use(storeAuth);

router.get('/', getInventory);
router.get('/:inventoryId', getInventoryItem);
router.put('/:inventoryId', updateInventory);

module.exports = router;
