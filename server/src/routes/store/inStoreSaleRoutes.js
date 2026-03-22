const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../../controllers/store/inStoreSaleController');
const storeAuth = require('../../middleware/storeAuth');

router.use(storeAuth);
router.post('/', createSale);
router.get('/', getSales);

module.exports = router;
