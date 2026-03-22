const mongoose = require('mongoose');

const storeInventorySchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    quantityOnHand: { type: Number, default: 0, min: 0 },
    quantityReserved: { type: Number, default: 0, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

storeInventorySchema.virtual('quantityAvailable').get(function () {
  return this.quantityOnHand - this.quantityReserved;
});

storeInventorySchema.index(
  { storeId: 1, productId: 1, sku: 1, size: 1 },
  { unique: true }
);
storeInventorySchema.index({ storeId: 1, productId: 1 });

module.exports = mongoose.model('StoreInventory', storeInventorySchema);
