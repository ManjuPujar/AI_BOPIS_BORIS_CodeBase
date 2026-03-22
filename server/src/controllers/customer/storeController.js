const storeSearchService = require('../../services/storeSearchService');
const inventoryService = require('../../services/inventoryService');
const Store = require('../../models/Store');

const searchStores = async (req, res, next) => {
  try {
    const { zipcode, productId } = req.query;
    const stores = await storeSearchService.findNearbyStores(zipcode, productId);
    res.status(200).json(stores);
  } catch (error) {
    next(error);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.storeId).lean();
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.status(200).json({ store });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Store not found' });
    }
    next(error);
  }
};

const getStoreInventory = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { productId } = req.query;
    const inventory = await inventoryService.getStoreInventoryForProduct(storeId, productId);
    res.status(200).json(inventory);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchStores,
  getStoreById,
  getStoreInventory,
};
