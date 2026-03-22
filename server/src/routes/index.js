const express = require('express');
const router = express.Router();

const customerAuthRoutes = require('./customer/authRoutes');
const customerProductRoutes = require('./customer/productRoutes');
const customerStoreRoutes = require('./customer/storeRoutes');
const customerOrderRoutes = require('./customer/orderRoutes');
const customerReturnRoutes = require('./customer/returnRoutes');
const storeAuthRoutes = require('./store/authRoutes');
const storeOrderRoutes = require('./store/orderRoutes');
const storeReturnRoutes = require('./store/returnRoutes');
const storeInventoryRoutes = require('./store/inventoryRoutes');
const inStoreSaleRoutes = require('./store/inStoreSaleRoutes');

router.use('/customer/auth', customerAuthRoutes);
router.use('/customer/products', customerProductRoutes);
router.use('/customer/stores', customerStoreRoutes);
router.use('/customer/orders', customerOrderRoutes);
router.use('/customer/returns', customerReturnRoutes);
router.use('/store/auth', storeAuthRoutes);
router.use('/store/orders', storeOrderRoutes);
router.use('/store/returns', storeReturnRoutes);
router.use('/store/inventory', storeInventoryRoutes);
router.use('/store/in-store-sales', inStoreSaleRoutes);

module.exports = router;
