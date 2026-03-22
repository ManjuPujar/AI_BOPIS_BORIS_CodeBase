const StoreInventory = require('../models/StoreInventory');
const DigitalInventory = require('../models/DigitalInventory');
const logger = require('../utils/logger');

const checkStoreAvailability = async (storeId, items) => {
  const unavailableItems = [];

  for (const item of items) {
    const inventory = await StoreInventory.findOne({
      storeId,
      productId: item.productId,
      sku: item.sku,
      size: item.size,
    });

    const available = inventory
      ? inventory.quantityOnHand - inventory.quantityReserved >= item.quantity
      : false;

    if (!available) {
      unavailableItems.push({
        ...item,
        availableQuantity: inventory
          ? inventory.quantityOnHand - inventory.quantityReserved
          : 0,
      });
    }
  }

  return {
    available: unavailableItems.length === 0,
    unavailableItems,
  };
};

const reserveStoreInventory = async (storeId, items, session) => {
  const reserved = [];

  for (const item of items) {
    const result = await StoreInventory.findOneAndUpdate(
      {
        storeId,
        productId: item.productId,
        sku: item.sku,
        size: item.size,
        $expr: {
          $gte: [
            { $subtract: ['$quantityOnHand', '$quantityReserved'] },
            item.quantity,
          ],
        },
      },
      {
        $inc: { quantityReserved: item.quantity },
        $set: { lastUpdated: new Date() },
      },
      { new: true, session }
    );

    if (!result) {
      throw new Error(
        `Insufficient inventory for SKU ${item.sku} size ${item.size} at store ${storeId}`
      );
    }

    reserved.push(result);
  }

  logger.info(`Reserved inventory for ${items.length} item(s) at store ${storeId}`);
  return reserved;
};

const deductStoreInventory = async (storeId, items, session) => {
  for (const item of items) {
    const result = await StoreInventory.findOneAndUpdate(
      {
        storeId,
        productId: item.productId,
        sku: item.sku,
        size: item.size,
      },
      {
        $inc: {
          quantityOnHand: -item.quantity,
          quantityReserved: -item.quantity,
        },
        $set: { lastUpdated: new Date() },
      },
      { new: true, session }
    );

    if (!result) {
      throw new Error(
        `Inventory record not found for SKU ${item.sku} size ${item.size} at store ${storeId}`
      );
    }
  }

  logger.info(`Deducted inventory for ${items.length} item(s) at store ${storeId}`);
};

const releaseStoreInventory = async (storeId, items, session) => {
  for (const item of items) {
    await StoreInventory.findOneAndUpdate(
      {
        storeId,
        productId: item.productId,
        sku: item.sku,
        size: item.size,
      },
      {
        $inc: { quantityReserved: -item.quantity },
        $set: { lastUpdated: new Date() },
      },
      { session }
    );
  }

  logger.info(`Released reserved inventory for ${items.length} item(s) at store ${storeId}`);
};

const restoreStoreInventory = async (storeId, items, session) => {
  for (const item of items) {
    await StoreInventory.findOneAndUpdate(
      {
        storeId,
        productId: item.productId,
        sku: item.sku,
        size: item.size,
      },
      {
        $inc: { quantityOnHand: item.quantity },
        $set: { lastUpdated: new Date() },
      },
      { session }
    );
  }

  logger.info(`Restored inventory for ${items.length} item(s) at store ${storeId}`);
};

const getStoreInventoryForProduct = async (storeId, productId) => {
  const inventory = await StoreInventory.find({ storeId, productId })
    .populate('productId', 'name sku images')
    .lean();

  return inventory.map((item) => ({
    ...item,
    quantityAvailable: item.quantityOnHand - item.quantityReserved,
  }));
};

const checkDigitalAvailability = async (items) => {
  const unavailableItems = [];

  for (const item of items) {
    const inventory = await DigitalInventory.findOne({
      productId: item.productId,
      sku: item.sku,
      size: item.size,
    });

    const available = inventory
      ? inventory.quantityOnHand - inventory.quantityReserved >= item.quantity
      : false;

    if (!available) {
      unavailableItems.push({
        ...item,
        availableQuantity: inventory
          ? inventory.quantityOnHand - inventory.quantityReserved
          : 0,
      });
    }
  }

  return {
    available: unavailableItems.length === 0,
    unavailableItems,
  };
};

module.exports = {
  checkStoreAvailability,
  reserveStoreInventory,
  deductStoreInventory,
  releaseStoreInventory,
  restoreStoreInventory,
  getStoreInventoryForProduct,
  checkDigitalAvailability,
};
