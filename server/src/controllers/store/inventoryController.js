const StoreInventory = require('../../models/StoreInventory');

const getInventory = async (req, res, next) => {
  try {
    const { storeId } = req.storeUser;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = { storeId };

    if (req.query.search) {
      const Product = require('../../models/Product');
      const matchingProducts = await Product.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { sku: { $regex: req.query.search, $options: 'i' } },
        ],
      }).select('_id');
      const productIds = matchingProducts.map((p) => p._id);
      filter.productId = { $in: productIds };
    } else if (req.query.sku) {
      filter.sku = { $regex: req.query.sku, $options: 'i' };
    }

    const [inventory, total] = await Promise.all([
      StoreInventory.find(filter)
        .populate('productId', 'name sku images basePrice salePrice colors sizes')
        .skip(skip)
        .limit(limit)
        .sort({ lastUpdated: -1 }),
      StoreInventory.countDocuments(filter),
    ]);

    res.status(200).json({
      inventory,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryItem = async (req, res, next) => {
  try {
    const item = await StoreInventory.findById(req.params.inventoryId)
      .populate('productId', 'name sku images basePrice');

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

const updateInventory = async (req, res, next) => {
  try {
    const { quantityOnHand } = req.body;

    const item = await StoreInventory.findByIdAndUpdate(
      req.params.inventoryId,
      { quantityOnHand, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    ).populate('productId', 'name sku images basePrice');

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getInventoryItem,
  updateInventory,
};
