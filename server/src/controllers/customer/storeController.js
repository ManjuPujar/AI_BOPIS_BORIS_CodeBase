const storeSearchService = require('../../services/storeSearchService');
const inventoryService = require('../../services/inventoryService');

const searchStores = async (req, res, next) => {
  try {
    const { zipcode, productId } = req.query;
    const stores = await storeSearchService.findNearbyStores(zipcode, productId);
    res.status(200).json(stores);
  } catch (error) {
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
  getStoreInventory,
};
