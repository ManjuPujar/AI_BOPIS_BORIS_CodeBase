const inStoreSaleService = require('../../services/inStoreSaleService');

const createSale = async (req, res, next) => {
  try {
    const { items, customerInfo } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }
    if (!customerInfo?.email) {
      return res.status(400).json({ message: 'Customer email is required for in-store sales' });
    }
    const sale = await inStoreSaleService.createInStoreSale(
      req.storeUser.storeId, items, req.storeUser._id, customerInfo
    );
    res.status(201).json({ sale });
  } catch (error) {
    next(error);
  }
};

const getSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await inStoreSaleService.getStoreSales(req.storeUser.storeId, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { createSale, getSales };
