const InStoreSale = require('../models/InStoreSale');
const Product = require('../models/Product');
const inventoryService = require('./inventoryService');
const InventoryTransaction = require('../models/InventoryTransaction');
const logger = require('../utils/logger');

const createInStoreSale = async (storeId, items, storeUserId, customerInfo) => {
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  const saleItems = items.map((item) => {
    const product = productMap.get(item.productId.toString());
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    const unitPrice = product.salePrice || product.basePrice;
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;
    return {
      productId: item.productId,
      sku: product.sku,
      productName: product.name,
      size: item.size,
      color: item.color || product.colors[0]?.name,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    };
  });

  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  const StoreInventory = require('../models/StoreInventory');
  for (const item of saleItems) {
    const result = await StoreInventory.findOneAndUpdate(
      {
        storeId,
        productId: item.productId,
        sku: item.sku,
        size: item.size,
        quantityOnHand: { $gte: item.quantity },
      },
      {
        $inc: { quantityOnHand: -item.quantity },
        $set: { lastUpdated: new Date() },
      },
      { new: true }
    );
    if (!result) {
      throw new Error(`Insufficient stock for ${item.productName} size ${item.size}`);
    }
    await InventoryTransaction.create({
      storeId, productId: item.productId, sku: item.sku, size: item.size,
      transactionType: 'IN_STORE_SALE', quantity: item.quantity,
      referenceType: 'in_store_sale', performedBy: storeUserId,
    });
  }

  const sale = await InStoreSale.create({
    storeId, items: saleItems, subtotal, tax, total, recordedBy: storeUserId,
    customerName: customerInfo?.name || undefined,
    customerEmail: customerInfo?.email || undefined,
    customerPhone: customerInfo?.phone || undefined,
  });

  logger.info(`In-store sale ${sale.saleNumber} recorded at store ${storeId}`);
  return sale;
};

const getStoreSales = async (storeId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [sales, total] = await Promise.all([
    InStoreSale.find({ storeId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    InStoreSale.countDocuments({ storeId }),
  ]);
  return { sales, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

module.exports = { createInStoreSale, getStoreSales };
